#include <iostream>

#include <easyipc.h>
#include <ipc-message/ipc.pb.h>

#include <boost/gil.hpp>
#include <boost/gil/extension/io/jpeg.hpp>
#include <boost/gil/extension/numeric/sampler.hpp>
#include <boost/gil/extension/numeric/resample.hpp>

using namespace boost::gil;
using EasyIpc::IpcServer;

static std::string server_handler(EasyIpc::Context& ctx, const EasyIpc::Message& msg);
static std::string gen_thumbnails(const GenerateThumbnailsRequest& req);

int main() {
    auto server = std::make_shared<IpcServer>("thumbnail-service");
    server->message_handler = server_handler;
    server->Run();
    return 0;
}

std::string server_handler(EasyIpc::Context& ctx, const EasyIpc::Message& msg) {
    std::cout << "receive message: " << MessageType_Name(msg.message_type) << std::endl;
    switch (msg.message_type) {
        case MessageType::GenerateThumbnails: {
            GenerateThumbnailsRequest request;
            if (!request.ParseFromString(msg.content)) {
                return "";
            }

            return gen_thumbnails(request);
        }

        default:
            return "";
    }
}

static std::string gen_thumbnails(const GenerateThumbnailsRequest& req) {
    GenerateThumbnailsResponse resp;

    for (auto type : req.types()) {
        try {
            auto thumbnail = resp.add_data();

            thumbnail->set_type(static_cast<ThumbnailType>(type));
            thumbnail->set_width(100);
            thumbnail->set_height(100);

            rgb8_image_t img;
            read_image(req.path(), img, boost::gil::jpeg_tag{});
            rgb8_image_t square100x100(100, 100);
            resize_view(const_view(img), view(square100x100), bilinear_sampler{});
            write_view("/tmp/out-resize.jpg", const_view(square100x100), jpeg_tag{});
        } catch (std::exception& ex) {
            std::cerr << ex.what() << std::endl;
        }
    }

    auto result = resp.SerializeAsString();
    auto c_str = result.data();
    return result;
}
