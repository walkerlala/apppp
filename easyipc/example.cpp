//
// Created by Duzhong Chen on 2020/1/20.
//

#include <iostream>
#include <memory>
#include "easyipc.h"

using EasyIpc::IpcServer;
using EasyIpc::IpcClient;

int client_main(int argc, char* argv[]);

int main(int argc, char* argv[]) {
    if (argc > 1 && strcmp(argv[1], "--client") == 0) {
        return client_main(argc, argv);
    }

    auto server = std::make_unique<IpcServer>("test-ipc");
    server->handler = [](const EasyIpc::Message& msg){
        std::cout << "server receive: " << msg.content << std::endl;
        return "haha";
    };
    server->Run();
    return 0;
}

int client_main(int argc, char* argv[]) {
    auto client = std::make_unique<IpcClient>();

    if (!client->Connect("test-ipc")) {
        return 1;
    }

    std::string resp;
    if (!client->Send(0, "haha 222", resp)) {
        return 1;
    }

    std::cout << "client receive：" << resp << std::endl;

    return 0;
}
