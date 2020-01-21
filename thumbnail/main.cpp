#include <iostream>
#include <sstream>

#include <easyipc.h>
#include <ipc-message/ipc.pb.h>

#include <boost/filesystem.hpp>

#include <boost/gil.hpp>
#include <boost/gil/extension/io/jpeg.hpp>
#include <boost/gil/extension/numeric/sampler.hpp>
#include <boost/gil/extension/numeric/resample.hpp>

#include <boost/uuid/uuid.hpp>
#include <boost/uuid/uuid_io.hpp>
#include <boost/uuid/uuid_generators.hpp>

#include <boost/random/random_device.hpp>
#include <boost/random/uniform_int_distribution.hpp>

using boost::filesystem::path;
using namespace boost::gil;
using EasyIpc::IpcServer;

inline std::string GenUuid() {
    boost::uuids::uuid a_uuid = boost::uuids::random_generator()(); // 这里是两个() ，因为这里是调用的 () 的运算符重载
    return boost::uuids::to_string(a_uuid);
}

inline std::string GenRandomString(int length) {
    std::string chars(
            "abcdefghijklmnopqrstuvwxyz"
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            "1234567890"
            );
    /*<< We use __random_device as a source of entropy, since we want
         passwords that are not predictable.
    >>*/
    boost::random::random_device rng;
    /*<< Finally we select 8 random characters from the
         string and print them to cout.
    >>*/
    boost::random::uniform_int_distribution<> index_dist(0, chars.size() - 1);

    std::string result;

    for (int i = 0; i < length; i++) {
        result.push_back(chars[index_dist(rng)]);
    }

    return result;
}

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
            rgb8_image_t img;
            read_image(req.path(), img, boost::gil::jpeg_tag{});
            rgb8_image_t square100x100(100, 100);
            resize_view(const_view(img), view(square100x100), bilinear_sampler{});

            path src_path(req.path());
            std::string filename = src_path.filename().string();
            std::string no_ext = src_path.stem().string();
            std::string ext = src_path.extension().string();

            std::cout << filename << " " << no_ext << " " << ext << std::endl;

            std::stringstream gen_filename_ss;

            gen_filename_ss << src_path.stem().string()
                << "-" << GenRandomString(6)
                <<"-" << ThumbnailType_Name(type)
                << src_path.extension().string();

            path output_path = path(req.out_dir()) / path(gen_filename_ss.str());
            std::string output_path_str = output_path.string();
            std::cout << "prepare to gen image: " << output_path.string() << std::endl;
            write_view(output_path_str, const_view(square100x100), jpeg_tag{});
            std::cout << "finished" << std::endl;

            auto thumbnail = resp.add_data();
            thumbnail->set_path(output_path_str);
            thumbnail->set_type(static_cast<ThumbnailType>(type));
        } catch (std::exception& ex) {
            std::cerr << ex.what() << std::endl;
        }
    }

    return resp.SerializeAsString();
}
