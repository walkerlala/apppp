#include "classify.h"

#include <fstream>
#include <string>
#include <tuple>
#include <vector>

#include "infer.h"

using std::ifstream;
using std::string;
using std::tuple;
using std::vector;

// Classify image given image, pretrained model and labels corresponding to this model
// Parameters:
//   @image: image
//   @model: pretrained pytorch model
//   @label: class labels
//   @usegpu: whether or not to use gpu for training
// Return: a tuple, first of which is class name after classification, second is infer probability
tuple<string, float> classify(const cv::Mat &image, const torch::jit::script::Module &model,
                              const vector<string> &labels, bool usegpu) {
    int image_height = 224;
    int image_width = 224;

    std::vector<double> mean = {0.485, 0.456, 0.406};
    std::vector<double> std = {0.229, 0.224, 0.225};

    auto res = infer(image, image_height, image_width, mean, std, labels, model, usegpu);
    return res;
}

// Classify image given image, pretrained model and labels corresponding to this model
// Parameters:
//   @image_path: file path of image
//   @model_path: pretrained pytorch model
//   @labels_path: class labels file path
//   @usegpu: whether or not to use gpu for training
// Return: a tuple, first of which is class name after classification, second is infer probability
tuple<string, float> classify(const string &image_path, const string &model_path,
                              const string &labels_path, bool usegpu) {
    // Read labels
    vector<string> labels;
    string label;
    ifstream labelsfile(labels_path);
    if (labelsfile.is_open()) {
        while (getline(labelsfile, label)) {
            labels.push_back(label);
        }
        labelsfile.close();
    }

    cv::Mat image = cv::imread(image_path);

    torch::jit::script::Module model;
    model = read_model(model_path, usegpu);

    auto res = classify(image, model, labels, usegpu);
    return res;
}
