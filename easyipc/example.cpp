//
// Created by Duzhong Chen on 2020/1/20.
//

#include <iostream>
#include <cstring>
#include <memory>
#include "easyipc.h"

using EasyIpc::IpcServer;
using EasyIpc::IpcClient;

int client_main(int argc, char* argv[]);

int main(int argc, char* argv[]) {
    if (argc > 1 && std::strcmp(argv[1], "--client") == 0) {
        return client_main(argc, argv);
    }

    auto server = std::make_shared<IpcServer>("test-ipc");
    server->message_handler = [](EasyIpc::Context& ctx, const EasyIpc::Message& msg){
        std::cout << "server receive: " << msg.content << std::endl;
        return "haha";
    };
	server->client_disconnect_handler = [](EasyIpc::Context& ctx, const EasyIpc::Session& session) {
		std::cout << "client disconnect" << std::endl;
		ctx.Shutdown();
	};
    server->Run();
    std::cout << "server finish" << std::endl;
    return 0;
}

int client_main(int argc, char* argv[]) {
    auto client = std::make_unique<IpcClient>();
    std::cout << "i am client" << std::endl;

    if (!client->Connect("test-ipc")) {
		std::cout << "connect error" << std::endl;
        return 1;
    }

    std::cout << "client connected" << std::endl;

    for (int i = 0; i < 10; i++) {
        std::string resp;
        if (!client->Send(0, "22", resp)) {
            std::cout << "send error" << std::endl;
            return 1;
        }
        std::cout << "client receive: " << resp << std::endl;
    }

    return 0;
}
