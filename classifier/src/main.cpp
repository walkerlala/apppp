#include <boost/algorithm/string.hpp>
#include <boost/filesystem.hpp>
#include <cstdio>
#include <fstream>
#include <iostream>
#include <memory>
#include <sstream>
#include <string>
#include <utility>
#include <vector>

#include "classify.h"
#include "easyipc.h"
#include "infer.h"
#include "ipc-message/ipc.pb.h"
#include "json/json.hpp"

using std::ifstream;
using std::shared_ptr;
using std::string;
using std::stringstream;
using std::tuple;
using std::vector;

namespace fs = boost::filesystem;

using EasyIpc::IpcServer;

static string server_handler(EasyIpc::Context &ctx, const EasyIpc::Message &msg);
static tuple<string, float> classify_image(const fs::path &p);
static ClassifierConf ParseClassifierConf(const string &conf);

static vector<string> labels;
static torch::jit::script::Module model;

int main(int argc, char **argv) {
    std::string conf_path = "classifier_asset/classifier.conf";
    if (argc == 2) {
        conf_path = argv[1];
    }

    if (!boost::filesystem::exists(conf_path)) {
        printf("Configuration file %s not exists", conf_path.c_str());
        return -1;
    }

    // parse configuration from classifier.conf
    ifstream fstrm(conf_path);
    stringstream buffer;
    buffer << fstrm.rdbuf();
    string json = buffer.str();
    ClassifierConf conf = ParseClassifierConf(json);
    if (!conf.valid) {
        printf("Configuration not valid in file %s", conf_path.c_str());
        return -1;
    }

    // read labels
    string label;
    ifstream labelsfile(conf.labels_path);
    if (labelsfile.is_open()) {
        while (getline(labelsfile, label)) {
            boost::trim(label);
            if (label.size() > 0)
                labels.push_back(label);
        }
        labelsfile.close();
    }
    if (labels.size() == 0) {
        printf("Cannot find any labels in file: %s", conf.labels_path.c_str());
        return -1;
    }

    // read models
    try {
        model = read_model(conf.model_path, /*use_gpu*/ false);
    } catch (const std::exception &e) {
        printf("Error reading torch model: %s", e.what());
        return -1;
    }

    auto server = std::make_shared<IpcServer>("classify-service");
    server->message_handler = server_handler;
    server->Run();
    return 0;
}

string server_handler(EasyIpc::Context &ctx, const EasyIpc::Message &msg) {
    std::cout << "receive message: " << MessageType_Name(msg.message_type) << std::endl;
    if (msg.message_type != MessageType::ClassifyImage) {
        std::cerr << "Invalid message";
        return "";
    }

    ClassifyRequest request;
    if (!request.ParseFromString(msg.content)) {
        std::cerr << "Invalid  message to parse from";
        return "";
    }

    ClassifyResponse response;
    for (int i = 0; i < request.infos_size(); i++) {
        const ImageInfo &info = request.infos(i);
        const fs::path &fspath = info.source_path();
        tuple<string, float> classify_result = classify_image(fspath);

        printf("%s classify resule: %s, confidence: %f", fspath.c_str(),
               std::get<0>(classify_result).c_str(), std::get<1>(classify_result));
        ImageClass *img_class = response.add_result();
        img_class->set_path(fspath.string());
        img_class->set_class_name(std::get<0>(classify_result).c_str());
        img_class->set_class_confidence(std::get<1>(classify_result));
    }
    return response.SerializeAsString();
}

tuple<string, float> classify_image(const fs::path &p) {
    cv::Mat image = cv::imread(p.string());
    auto res = classify(image, model, labels, /*use_gpu*/ false);
    return res;
}

ClassifierConf ParseClassifierConf(const string &conf) {
    ClassifierConf classifier_conf;
    auto json_obj = json::parse(conf);
    classifier_conf.model_path = json_obj["model_path"];
    classifier_conf.labels_path = json_obj["labels_path"];
    classifier_conf.use_gpu = false;
    classifier_conf.valid = true;
    return classifier_conf;
}