#include <boost/algorithm/string.hpp>
#include <chrono>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include "classify.h"
#include "infer.h"

using std::ifstream;
using std::string;
using std::vector;

int main(int argc, char **argv) {
    std::string image_path;
    std::string model_path;
    std::string labels_path;
    bool usegpu;

    if (argc != 5) {
        std::cerr << "usage: predict <path-to-image> <path-to-exported-script-module> "
                     "<path-to-labels-file> <gpu-flag{true/false}> \n";
        std::cerr << "Using default setting\n";

        image_path = "image.jpeg";
        model_path = "model_pretrained.pth";
        labels_path = "labels.txt";
        usegpu = false;
    } else {
        image_path = argv[1];
        model_path = argv[2];
        labels_path = argv[3];
        std::string usegpu_str = argv[4];

        if (usegpu_str == "true") {
            usegpu = true;
        } else {
            usegpu = false;
        }
    }

    vector<string> labels;
    torch::jit::script::Module model;

    // read labels
    string label;
    ifstream labelsfile(labels_path);
    if (labelsfile.is_open()) {
        while (getline(labelsfile, label)) {
            boost::trim(label);
            if (label.size() > 0)
                labels.push_back(label);
        }
        labelsfile.close();
    }
    if (labels.size() == 0) {
        std::cerr << "error loading labels\n";
        return -1;
    }

    // read models
    try {
        model = read_model(model_path, /*use_gpu*/ false);
    } catch (const std::exception &e) {
        std::cerr << "Error reading torch model:" << e.what();
        return -1;
    }

    cv::Mat image = cv::imread(image_path);

    int loop_count = 100;

    std::tuple<std::string, float> res;
    try {
        auto start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < loop_count; i++) {
            res = classify(image, model, labels, /*use_gpu*/ false);
        }
        auto end = std::chrono::high_resolution_clock::now();

        auto diff = std::chrono::duration_cast<std::chrono::duration<float>>(end - start).count();
        std::cout << "loop_count: " << loop_count << ", elapsed time: " << diff
                  << ", time per image: " << diff / loop_count << std::endl;

    } catch (const std::exception &e) {
        std::cout << "Exception when classifying image " << e.what() << std::endl;
    }

    return 0;
}