#include <iostream>

#include "classify.h"

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

    std::tuple<std::string, float> res;
    try {
        res = classify(image_path, model_path, labels_path, usegpu);
    } catch (const std::exception &e) {
        std::cout << "Exception when classifying image£º " << e.what() << std::endl;
    }

    std::cout << "PREDICTION  : " << std::get<0>(res) << std::endl;
    std::cout << "CONFIDENCE  : " << std::get<1>(res) << std::endl;

    return 0;
}
