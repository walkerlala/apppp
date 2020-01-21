#pragma once

#include <memory>
#include <atomic>
#include <string>
#include <functional>

#include <ThreadPool.h>

#ifdef WIN32
#include <Windows.h>
typedef HANDLE MessageTunnel;
#else
typedef int MessageTunnel;
#endif

namespace EasyIpc {


    class Message {
    public:
        std::int64_t request_id = -1;
        std::int32_t message_type = -1;
        std::string content;
    };

    class IpcServer;

    class Context {
    public:
        Context(std::weak_ptr<IpcServer> server): server_(server) {
        }

        void Shutdown();

    private:
        std::weak_ptr<IpcServer> server_;

    };

    class Session {
    public:
        Session(std::weak_ptr<IpcServer> server, MessageTunnel tunnel);

        void HandleMessage();

        bool Write(const char* data, std::size_t size);
        bool Write(const std::string& data);

        bool Read(char* data, std::size_t size);
        bool Read(std::string& data, std::size_t size);

    private:
        std::weak_ptr<IpcServer> server_;
        MessageTunnel tunnel_;

    };

    using MessageHandler = std::function<std::string(Context& context, const Message& req)>;

    class IpcServer: public std::enable_shared_from_this<IpcServer> {
    public:
        explicit IpcServer(const std::string& token, int threads_num = 2);
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
		HANDLE handle_;

#else
        void HandleRequestStandalone(int socket);
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

        std::string ipc_token;
        std::int64_t req_id_counter = 0;

        MessageTunnel tunnel_;

    };

}

