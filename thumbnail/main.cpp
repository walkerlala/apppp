#include <ThreadPool/ThreadPool.h>

#include <algorithm>
#include <iostream>

#include "easyipc.h"
#include "gen_thumbnails.h"
#include "ipc-message/ipc.pb.h"
#include "read_exif.h"

using EasyIpc::IpcServer;
using proto::GenerateThumbnailsRequest;
using proto::GenerateThumbnailsResponse;
using proto::MessageType;
using proto::MessageType_Name;
using proto::ReadExifRequest;

static std::string server_handler(EasyIpc::Context& ctx, const EasyIpc::Message& msg);
static std::string gen_thumbnails(const GenerateThumbnailsRequest& req);
static ThreadPool* thread_pool;

int main() {
    thread_pool = &ThreadPool::GlobalPool();

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

        case MessageType::ReadExif: {
            ReadExifRequest request;
            if (!request.ParseFromString(msg.content)) {
                return "";
            }

            if (auto opt = read_exif(request.path()); opt != std::nullopt) {
                return opt->SerializeAsString();
            }

            return "";
        }

        default:
            return "";
    }
}

template <typename T>
class plus_when_dtor {
   public:
    plus_when_dtor(T& ref, std::condition_variable& cv) : ref_(ref), cv_(cv) {}

    ~plus_when_dtor() {
        ref_++;
        cv_.notify_one();
    }

   private:
    std::condition_variable& cv_;
    T& ref_;
};

static std::string gen_thumbnails(const GenerateThumbnailsRequest& req) {
    GenerateThumbnailsResponse resp;
    std::mutex resp_mutex;
    std::condition_variable resp_cv;
    int finished_count = 0;

    for (auto type : req.types()) {
        thread_pool->add_task([type, req, &finished_count, &resp, &resp_mutex, &resp_cv] {
            plus_when_dtor<int> id(finished_count, resp_cv);

            if (auto ret = gen_thumbnails(type, req.path(), req.out_dir()); ret.has_value()) {
                std::lock_guard<std::mutex> guard(resp_mutex);

                auto thumbnail = resp.add_data();
                thumbnail->CopyFrom(*ret);
            }
        });
    }

    std::unique_lock<std::mutex> lk(resp_mutex);
    resp_cv.wait(lk, [&finished_count, &req] { return finished_count >= req.types().size(); });

    return resp.SerializeAsString();
}
