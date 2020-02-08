// Example client class to test classifier server

#include <fmt/format.h>
#include <gflags/gflags.h>
#define GLOG_NO_ABBREVIATED_SEVERITIES
#include <glog/logging.h>

#include <boost/filesystem.hpp>
#include <chrono>
#include <memory>

#include "easyipc.h"
#include "ipc-message/ipc.pb.h"

using std::make_shared;
using std::shared_ptr;

using EasyIpc::IpcClient;
using EasyIpc::IpcServer;

using proto::ClassifyRequest;
using proto::ClassifyResponse;
using proto::ImageInfo;
using proto::MessageType;

namespace fs = boost::filesystem;

DEFINE_string(logdir, "log", "dir to put log");
DEFINE_string(service_name, "classify-service", "classifier RPC service name");

int main(int argc, char **argv) {
    google::InitGoogleLogging(argv[0]);
    // init gflags and glog
    gflags::ParseCommandLineFlags(&argc, &argv, /*remove_flags*/ false);
    FLAGS_log_dir = FLAGS_logdir;  // set logdir for glog
    fs::create_directory(FLAGS_log_dir);
    FLAGS_logtostderr = 1;

    auto client = make_shared<IpcClient>();

    if (!client->Connect(FLAGS_service_name)) {
        LOG(ERROR) << "Failed to connect to rpc service";
        return -1;
    }
    LOG(INFO) << "client connected to rpc service: " << FLAGS_service_name;

    ClassifyRequest request;
    ImageInfo *info = request.add_infos();
    info->set_source_path("img.jpeg");
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 100; i++) {
        std::string resp;
        if (!client->Send(MessageType::ClassifyImage, request.SerializeAsString(), resp)) {
            LOG(ERROR) << fmt::format("send error: {}", resp);
            return 1;
        }
        ClassifyResponse response;
        response.ParseFromString(resp);
        LOG(INFO) << fmt::format("client receive: {} => {}", response.results(0).class_name(),
                                 response.results(0).class_confidence());
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto diff = std::chrono::duration_cast<std::chrono::duration<float>>(end - start).count();
    LOG(INFO) << fmt::format("Elapsed duration: {}", diff);

    return 0;
}