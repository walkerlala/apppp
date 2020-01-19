#include "easyipc.h"

#include <thread>
#include <cstdlib>
#include <algorithm>
#include <sys/socket.h>
#include <sys/un.h>
#include <sys/types.h>
#include <unistd.h>

static constexpr std::size_t BufferSize = 8192;
static constexpr std::size_t MaxTokenSize = 64;
static constexpr char EasyIpcPrefix[] = "ani-";
static constexpr int SocketBackLog = 16;

namespace EasyIpc {

    inline std::string GetSocketPathFromIpcToken(const std::string& token) {
        return "/tmp/" + std::string(EasyIpcPrefix) + token;
    }

    class MessageHeader {
    public:
        std::int32_t message_type = -1;
        std::int64_t request_id = 0;
        std::uint32_t body_size = 0;
    };

    inline bool ReadHeaderFromSocket(int socket, MessageHeader& header) {
        int readNums = recv(socket, &header, sizeof(MessageHeader), 0);
        return readNums == sizeof(MessageHeader);
    }

    inline bool WriteHeaderToSocket(int socket, const MessageHeader& header) {
        int header_count = write(socket, &header, sizeof(MessageHeader));
        return header_count == sizeof(MessageHeader);
    }

    inline bool WriteStringToSocket(int socket, const std::string& content) {
        std::size_t written_count = 0;
        while (written_count < content.size()) {
            std::size_t remains_count = content.size() - written_count;
            int written = ::send(socket, content.data() + written_count, std::min(BufferSize, remains_count), 0);
            if (written < 0) {
                return false;
            }
            written_count += written;
        }
        return true;
    }

    inline bool ReadStringFormSocket(int socket, std::size_t size, std::string& data) {
        std::unique_ptr<char, std::function<void(char*)>> buffer(new char[size], [](char* buf) {
            delete[] buf;
        });
        std::size_t index = 0;
        memset(buffer.get(), 0, size);

        bool ok = false;
        while (true) {
            int read_bytes = ::recv(socket, buffer.get() + index, BufferSize, 0);
            if (read_bytes < 0) {
                break;
            }

            index += read_bytes;

            if (index >= size) {
                ok = true;
                break;
            }
        }

        if (!ok) {
            return false;
        }

        data = std::string(buffer.get(), size);
        return true;
    }

    IpcServer::IpcServer(const std::string &token, int threads_num):
    ipc_token(token), workers_(threads_num) {

    }

    bool IpcServer::Run() {
        is_running_ = true;

        struct sockaddr_un un;
        memset(&un, 0, sizeof(un));

        if (ipc_token.size() > MaxTokenSize) {
            return false;
        }

        std::string named_socket_path = GetSocketPathFromIpcToken(ipc_token);
        ::unlink(named_socket_path.c_str());

        strncpy(un.sun_path, named_socket_path.c_str(), named_socket_path.size());

        un.sun_family = AF_UNIX;

        fd = socket(AF_UNIX, SOCK_STREAM, 0);
        if (fd < 0) {
            return false;
        }

        std::size_t bind_size = offsetof(struct sockaddr_un, sun_path) + strlen(un.sun_path);
        int err = ::bind(fd, reinterpret_cast<const sockaddr *>(&un), bind_size);
        if (err < 0) {
            return false;
        }

        err = ::listen(fd, SocketBackLog);
        if (err < 0) {
            return false;
        }

        while (is_running_) {
            bool ok = AcceptRequest();
            if (!ok) {
                break;
            }
        }

        ::close(fd);

        return true;
    }

    bool IpcServer::AcceptRequest() {
        int socket = ::accept(fd, nullptr, nullptr);
        if (socket < 0) {
            return false;
        }
        workers_.enqueue(std::bind(&IpcServer::HandleRequestStandalone, this, socket));
        return true;
    }

    void IpcServer::HandleRequestStandalone(int socket) {
        MessageHeader header;
        if (!ReadHeaderFromSocket(socket, header)) {
            return;
        }

        Message req_message;
        req_message.request_id = header.request_id;
        req_message.message_type = header.message_type;

        ReadBody(socket, header.body_size, req_message);
    }

    void IpcServer::ReadBody(int socket, std::size_t size, EasyIpc::Message &message) {
        std::unique_ptr<char, std::function<void(char*)>> buffer(new char[size], [](char* buf) {
            delete[] buf;
        });
        std::size_t index = 0;
        memset(buffer.get(), 0, size);

        if (!ReadStringFormSocket(socket, size, message.content)) {
            return;
        }

        std::string response_content;
        if (handler) {
            response_content = handler(message);
        }

        WriteData(socket, message, response_content);
    }

    void IpcServer::WriteData(int socket, const EasyIpc::Message &msg, const std::string &resp_content) {
        MessageHeader header;
        header.request_id = msg.request_id;
        header.message_type = msg.message_type;
        header.body_size = resp_content.size();

        if (!WriteHeaderToSocket(socket, header)) {
            return;
        }

        WriteStringToSocket(socket, resp_content);
    }

    void IpcServer::Shutdown() {
        is_running_ = false;
    }

    bool IpcClient::Connect(const std::string &token) {
        ipc_token = token;
        std::string named_socket_path = GetSocketPathFromIpcToken(ipc_token);

        fd = socket(AF_UNIX, SOCK_STREAM, 0);
        if (fd < 0) {
            return false;
        }

        if (ipc_token.size() > MaxTokenSize) {
            return false;
        }

        struct sockaddr_un addr;
        addr.sun_family = AF_UNIX;
        strncpy(addr.sun_path, named_socket_path.c_str(), named_socket_path.size());

        int stat = ::connect(fd, reinterpret_cast<const sockaddr *>(&addr), sizeof(addr));
        if (stat < 0) {
            return false;
        }

        return true;
    }

    bool IpcClient::Send(std::int32_t message_type, const std::string &content, std::string& resp) {
        MessageHeader header;
        header.request_id = req_id_counter++;
        header.message_type = message_type;
        header.body_size = content.size();

        if (!WriteHeaderToSocket(fd, header)) {
            return false;
        }

        if (!WriteStringToSocket(fd, content)) {
            return false;
        }

        MessageHeader resp_header;
        if (!ReadHeaderFromSocket(fd, resp_header)) {
            return false;
        }

        if (resp_header.request_id != header.request_id) {
            return false;
        }

        return ReadStringFormSocket(fd, resp_header.body_size, resp);
    }

}
