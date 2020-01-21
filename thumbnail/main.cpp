#include <iostream>

#include <easyipc.h>
#include <ipc-message/ipc.pb.h>

using EasyIpc::IpcServer;

static std::string server_handler(const EasyIpc::Message& msg);

int main() {
    auto server = std::make_unique<IpcServer>("thumbnail-service");
    server->handler = server_handler;
    server->Run();
    return 0;
}

std::string server_handler(const EasyIpc::Message& msg) {
    std::cout << "receive message: " << MessageType_Name(msg.message_type) << std::endl;
    switch (msg.message_type) {
        case MessageType::GenerateThumbnails: {
            GenerateThumbnailsRequest request;
            if (!request.ParseFromString(msg.content)) {
                return "";
            }

            std::cout << "gen thumbnails: " << request.path() << std::endl;
            return "";
        }

        default:
            return "";
    }
}
