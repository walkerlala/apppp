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

#ifdef WIN32
	inline std::string GetNamedPipedFromIpcToken(const std::string& token) {
		return "\\\\.\\pipe\\" + std::string(EasyIpcPrefix) + token;
	}
#else
    inline std::string GetSocketPathFromIpcToken(const std::string& token) {
        return "/tmp/" + std::string(EasyIpcPrefix) + token;
    }
#endif

    class MessageHeader {
    public:
        std::int32_t message_type = -1;
        std::int64_t request_id = 0;
        std::uint32_t body_size = 0;
    };

#ifdef WIN32
	inline bool ReadHeaderFromNamedPipe(HANDLE hPipe, MessageHeader& header) {
		DWORD read_sizes = 0;
		bool ok = ::ReadFile(
			hPipe,
			&header,
			sizeof(MessageHeader),
			&read_sizes,
			NULL
		);

		if (!ok) return false;

		return read_sizes == sizeof(MessageHeader);
	}

	inline bool WriteHeaderToNamedPipe(HANDLE hPipe, const MessageHeader& header) {
		DWORD written_size = 0;
		bool ok = ::WriteFile(hPipe, &header, sizeof(MessageHeader), &written_size, NULL);
		if (!ok) return false;
		return written_size == sizeof(MessageHeader);
	}

	inline bool WriteStringToNamedPipe(HANDLE hPipe, const std::string& content) {
		std::size_t written_count = 0;
		while (written_count < content.size()) {
			std::size_t remains_count = content.size() - written_count;
			DWORD tmp_written_count = 0;
			bool ok = ::WriteFile(
				hPipe,
				content.data() + written_count,
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
	}

	inline bool ReadStringFromNamedPipe(HANDLE hPipe, std::size_t size, std::string& data) {
        std::unique_ptr<char, std::function<void(char*)>> buffer(new char[size], [](char* buf) {
            delete[] buf;
        });
        std::size_t index = 0;
        memset(buffer.get(), 0, size);

        bool ok = false;
        while (true) {
			DWORD read_bytes = 0;
			if (!::ReadFile(
				hPipe,
				buffer.get() + index,
				BufferSize,
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

        if (!ok) {
            return false;
        }

        data = std::string(buffer.get(), size);
        return true;
	}

#else
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
#endif

    IpcServer::IpcServer(const std::string &token, int threads_num):
    ipc_token(token), workers_(threads_num) {

    }

    bool IpcServer::Run() {
        is_running_ = true;

#ifdef WIN32
		auto named_pipd_path = GetNamedPipedFromIpcToken(ipc_token);
		std::wstring wide_path = Utils::ConvertToWstring(named_pipd_path);

		while (is_running_) {
			HANDLE handle_ = ::CreateNamedPipeW(
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
			workers_.enqueue(std::bind(&IpcServer::HandleRequestStandalone, this, handle_));
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

#ifdef WIN32
	void IpcServer::HandleRequestStandalone(HANDLE hPipe) {
		while (true) {
			MessageHeader header;
			if (!ReadHeaderFromNamedPipe(hPipe, header)) {
				::CloseHandle(hPipe);
				return;
			}

			Message req_message;
			req_message.request_id = header.request_id;
			req_message.message_type = header.message_type;

			if (!ReadBody(hPipe, header.body_size, req_message)) {
				::CloseHandle(hPipe);
				return;
			}
		}
	}

	bool IpcServer::ReadBody(HANDLE hPipe, std::size_t size, EasyIpc::Message& message) {
        std::unique_ptr<char, std::function<void(char*)>> buffer(new char[size], [](char* buf) {
            delete[] buf;
        });
        std::size_t index = 0;
        memset(buffer.get(), 0, size);

		if (!ReadStringFromNamedPipe(hPipe, size, message.content)) {
			return false;
		}

        std::string response_content;
        if (handler) {
            response_content = handler(message);
        }

        return WriteData(hPipe, message, response_content);
	}

	bool IpcServer::WriteData(HANDLE hPipe, const Message& msg, const std::string& resp_content) {
        MessageHeader header;
        header.request_id = msg.request_id;
        header.message_type = msg.message_type;
        header.body_size = resp_content.size();

        if (!WriteHeaderToNamedPipe(hPipe, header)) {
            return false;
        }

        WriteStringToNamedPipe(hPipe, resp_content);
		return true;
	}

#else
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
#endif

    void IpcServer::Shutdown() {
        is_running_ = false;
    }

    bool IpcClient::Connect(const std::string &token) {
        ipc_token = token;
#ifdef WIN32
		auto named_pipd_path = GetNamedPipedFromIpcToken(ipc_token);
		std::wstring wide_path = Utils::ConvertToWstring(named_pipd_path);

		handle_ = ::CreateFileW(
			wide_path.c_str(),
			GENERIC_READ | GENERIC_WRITE,
			0,
			NULL,
			OPEN_EXISTING,
			FILE_ATTRIBUTE_NORMAL,
			NULL
		);

		if (handle_ == INVALID_HANDLE_VALUE) {
			return false;
		}
#else
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
#endif

        return true;
    }

    bool IpcClient::Send(std::int32_t message_type, const std::string &content, std::string& resp) {
        MessageHeader header;
        header.request_id = req_id_counter++;
        header.message_type = message_type;
        header.body_size = content.size();

#ifdef WIN32
		if (!WriteHeaderToNamedPipe(handle_, header)) {
			return false;
		}

		if (!WriteStringToNamedPipe(handle_, content)) {
			false;
		}

		MessageHeader resp_header;
		if (!ReadHeaderFromNamedPipe(handle_, resp_header)) {
			return false;
		}

		if (resp_header.request_id != header.request_id) {
			return false;
		}

		return ReadStringFromNamedPipe(handle_, resp_header.body_size, resp);

#else
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
#endif
    }

}
