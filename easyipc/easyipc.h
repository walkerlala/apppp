#pragma once

#include <memory>
#include <atomic>
#include <string>
#include <functional>

#include "./ThreadPool.h"

#ifdef WIN32
#include <Windows.h>
#endif

namespace EasyIpc {

    class Message {
    public:
        std::int64_t request_id = -1;
        std::int32_t message_type = -1;
        std::string content;
    };

    using MessageHandler = std::function<std::string(const Message& req)>;

    class IpcServer {
    public:
        IpcServer(const std::string& token, int threads_num = 2);
        IpcServer(const IpcServer&) = delete;
        explicit IpcServer(IpcServer&&) = delete;

        IpcServer& operator=(const IpcServer&) = delete;
        IpcServer& operator=(IpcServer&&) = delete;

        ~IpcServer() = default;

        bool Run();
        void Shutdown();

        MessageHandler handler;

    private:
        bool AcceptRequest();

        ThreadPool workers_;

        std::atomic<bool> is_running_;
        std::string ipc_token;
#ifdef WIN32
        void HandleRequestStandalone(HANDLE hPipe);
		bool ReadBody(HANDLE hPipe, std::size_t size, Message& message);
		static bool WriteData(HANDLE hPipe, const Message& msg, const std::string& resp_content);

#else
        void HandleRequestStandalone(int socket);
        void ReadBody(int socket, std::size_t size, Message& message);
        static void WriteData(int socket, const Message& msg, const std::string& resp_content);

        int fd = -1;
#endif

    };

    class IpcClient {
    public:
        IpcClient() = default;
        IpcClient(const IpcClient&) = delete;
        explicit IpcClient(IpcClient&&) = delete;

        IpcClient& operator=(const IpcClient&) = delete;
        IpcClient& operator=(IpcClient&&) = delete;

        ~IpcClient() = default;

        bool Connect(const std::string& token);

        bool Send(std::int32_t message_type, const std::string& content, std::string& resp);


    private:
        bool ReadResp(std::size_t req_id, std::string& resp);

        std::string ipc_token;
        std::int64_t req_id_counter = 0;

#ifdef WIN32
		HANDLE handle_;
#else
        int fd = -1;
#endif

    };

}

