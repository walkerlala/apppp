#include "easyipc.h"

#include <thread>
#include <cstdlib>
#include <algorithm>

#include "utils.h"

#ifdef WIN32
#include <Windows.h>
#else
#include <sys/socket.h>
#include <sys/un.h>
#include <sys/types.h>
#include <unistd.h>
#endif

static constexpr std::size_t BufferSize = 8192;
static constexpr std::size_t MaxTokenSize = 64;
static constexpr char EasyIpcPrefix[] = "ani-";
static constexpr int SocketBackLog = 16;

namespace EasyIpc {

    inline bool ReadBytesFromTunnel(MessageTunnel tunnel, char* buffer, std::size_t size) {
        if (size == 0) return true;

        std::size_t index = 0;
        memset(buffer, 0, size);
        bool ok = false;

#ifdef WIN32
        while (true) {
            std::size_t remains_bytes = size - index;
			DWORD read_bytes = 0;
			if (!::ReadFile(
				tunnel,
				buffer + index,
				min(remains_bytes, BufferSize),
				&read_bytes,
				NULL
			)) {
				ok = false;
				break;
			}

            index += read_bytes;

            if (index >= size) {
                ok = true;
                break;
            }
        }

#else
        while (true) {
            std::size_t remains_bytes = size - index;
            int read_bytes = ::recv(tunnel, reinterpret_cast<void*>(buffer + index), std::min(remains_bytes, BufferSize), 0);
            if (read_bytes <= 0) {
                break;
            }

            index += read_bytes;

            if (index >= size) {
                ok = true;
                break;
            }
        }

#endif

        return ok;
    }

    inline bool ReadStringFromTunnel(MessageTunnel tunnel, std::size_t size, std::string& result) {
        if (size == 0) return true;

        std::unique_ptr<char, std::function<void(char*)>> buffer(new char[size], [](char* buf) {
            delete[] buf;
        });

        if (!ReadBytesFromTunnel(tunnel, buffer.get(), size)) {
            return false;
        }

        result = std::string(buffer.get(), size);

        return true;
    }

    inline bool WriteBytesToTunnel(MessageTunnel tunnel, const char* buffer, std::size_t size) {
        if (size == 0) return true;

		std::size_t written_count = 0;
#ifdef WIN32
		while (written_count < size) {
			std::size_t remains_count = size - written_count;
			DWORD tmp_written_count = 0;
			bool ok = ::WriteFile(
				tunnel,
				buffer + written_count,
				min(BufferSize, remains_count),
				&tmp_written_count,
				NULL
			);
			if (!ok) {
				return false;
			}
			written_count += tmp_written_count;
		}
		return true;
#else
        while (written_count < size) {
            std::size_t remains_count = size - written_count;
            int written = ::send(tunnel, buffer + written_count, std::min(BufferSize, remains_count), 0);
            if (written < 0) {
                return false;
            }
            written_count += written;
        }
#endif

        return true;
    }

    inline bool WriteStringToTunnel(MessageTunnel tunnel, const std::string& content) {
        if (content.empty()) return true;

        return WriteBytesToTunnel(tunnel, content.c_str(), content.size());
    }

    inline void CloseTunnel(MessageTunnel tunnel) {
#ifdef WIN32
		::CloseHandle(tunnel);
#else
        ::close(tunnel);
#endif
    }

    Session::Session(std::weak_ptr<IpcServer> server, MessageTunnel tunnel): server_(server), tunnel_(tunnel) {

    }

    class MessageHeader {
    public:
        std::int32_t message_type = -1;
        std::int64_t request_id = 0;
        std::uint32_t body_size = 0;
    };


    void Session::HandleMessage() {
        while (true) {
            MessageHeader header;
            if (!ReadBytesFromTunnel(tunnel_, reinterpret_cast<char*>(&header), sizeof(MessageHeader))) {
                CloseTunnel(tunnel_);
                return;
            }

            Message req_message;
            req_message.request_id = header.request_id;
            req_message.message_type = header.message_type;

            if (!ReadStringFromTunnel(tunnel_, header.body_size, req_message.content)) {
                CloseTunnel(tunnel_);
                return;
            }

            auto server = server_.lock();
            if (!server) {
                CloseTunnel(tunnel_);
                return;
            }
            Context ctx(server);

            std::string response_content;
            if (server->handler) {
                try {
                    response_content = server->handler(ctx, req_message);
                } catch (...) {
                    response_content.clear();
                }
            }

            MessageHeader resp_header;
            resp_header.request_id = req_message.request_id;
            resp_header.message_type = req_message.message_type;
            resp_header.body_size = response_content.size();

            if (!WriteBytesToTunnel(tunnel_, reinterpret_cast<const char*>(&resp_header), sizeof(MessageHeader))) {
                CloseTunnel(tunnel_);
                return;
            }

            if (!WriteStringToTunnel(tunnel_, response_content)) {
                CloseTunnel(tunnel_);
                return;
            }
        }
    }

#ifdef WIN32
	inline std::string GetNamedPipedFromIpcToken(const std::string& token) {
		return "\\\\.\\pipe\\" + std::string(EasyIpcPrefix) + token;
	}
#else
    inline std::string GetSocketPathFromIpcToken(const std::string& token) {
        return "/tmp/" + std::string(EasyIpcPrefix) + token;
    }
#endif

    void Context::Shutdown() {
	    auto server = server_.lock();
	    if (!server) return;
	    server->Shutdown();
	}

    IpcServer::IpcServer(const std::string &token, int threads_num):
    ipc_token(token), workers_(threads_num) {

    }

    bool IpcServer::Run() {
        is_running_ = true;

#ifdef WIN32
		auto named_pipd_path = GetNamedPipedFromIpcToken(ipc_token);
		std::wstring wide_path = Utils::ConvertToWstring(named_pipd_path);

		while (is_running_) {
			handle_ = ::CreateNamedPipeW(
				wide_path.c_str(),
				PIPE_ACCESS_DUPLEX,       // read/write access 
				PIPE_TYPE_MESSAGE |       // message type pipe 
				PIPE_READMODE_MESSAGE |   // message-read mode 
				PIPE_WAIT,                // blocking mode 
				PIPE_UNLIMITED_INSTANCES, // max. instances  
				BufferSize,                  // output buffer size 
				BufferSize,                  // input buffer size 
				0,                        // client time-out 
				NULL
			);

			if (handle_ == INVALID_HANDLE_VALUE) {
				DWORD error = GetLastError();
				return false;
			}

			bool ok = ::ConnectNamedPipe(handle_, NULL);
			if (!ok) {
				DWORD err = GetLastError();
				::CloseHandle(handle_);
				break;
			}
			workers_.enqueue([self = shared_from_this(), handle = this->handle_] {
				Session session(self, handle);
				session.HandleMessage();
			});
		}

#else
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
#endif

        return true;
    }

#ifndef WIN32
    bool IpcServer::AcceptRequest() {
        int socket = ::accept(fd, nullptr, nullptr);
        if (socket < 0) {
            return false;
        }
        workers_.enqueue([self = shared_from_this(), socket] {
            Session session(self, socket);
            session.HandleMessage();
        });
        return true;
    }

    void IpcServer::HandleRequestStandalone(int socket) {
	    auto self = shared_from_this();
	    Session session(self, socket);
	    session.HandleMessage();
    }

#endif

    void IpcServer::Shutdown() {
        is_running_ = false;
#ifdef WIN32
		::CloseHandle(handle_);
#else
        ::close(fd);
#endif
    }

    bool IpcClient::Connect(const std::string &token) {
        ipc_token = token;
#ifdef WIN32
		auto named_pipd_path = GetNamedPipedFromIpcToken(ipc_token);
		std::wstring wide_path = Utils::ConvertToWstring(named_pipd_path);

		tunnel_ = ::CreateFileW(
			wide_path.c_str(),
			GENERIC_READ | GENERIC_WRITE,
			0,
			NULL,
			OPEN_EXISTING,
			FILE_ATTRIBUTE_NORMAL,
			NULL
		);

		if (tunnel_ == INVALID_HANDLE_VALUE) {
			return false;
		}
#else
        std::string named_socket_path = GetSocketPathFromIpcToken(ipc_token);

        tunnel_ = socket(AF_UNIX, SOCK_STREAM, 0);
        if (tunnel_ < 0) {
            return false;
        }

        if (ipc_token.size() > MaxTokenSize) {
            return false;
        }

        struct sockaddr_un addr;
        addr.sun_family = AF_UNIX;
        strncpy(addr.sun_path, named_socket_path.c_str(), named_socket_path.size());

        int stat = ::connect(tunnel_, reinterpret_cast<const sockaddr *>(&addr), sizeof(addr));
        if (stat < 0) {
            return false;
        }
#endif

        return true;
    }

    bool IpcClient::Send(std::int32_t message_type, const std::string &content, std::string& resp) {
        MessageHeader header;
        header.request_id = req_id_counter++;
        header.message_type = message_type;
        header.body_size = content.size();

        if (!WriteBytesToTunnel(tunnel_, reinterpret_cast<const char*>(&header), sizeof(MessageHeader))) {
            return false;
        }

        if (!WriteStringToTunnel(tunnel_, content)) {
            return false;
        }

        MessageHeader resp_header;
        if (!ReadBytesFromTunnel(tunnel_, reinterpret_cast<char*>(&resp_header), sizeof(MessageHeader))) {
            return false;
        }

        if (resp_header.request_id != header.request_id) {
            return false;
        }

        return ReadStringFromTunnel(tunnel_, resp_header.body_size, resp);
    }

}
