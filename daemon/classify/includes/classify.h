#pragma once

#include <torch/script.h>
#include <torch/serialize.h>
#include <torch/serialize/tensor.h>

#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>
#include <string>
#include <tuple>

std::tuple<std::string, float> classify(const cv::Mat &image,
                                        const torch::jit::script::Module &model,
                                        const std::vector<std::string> &labels,
                                        bool usegpu = false);
std::tuple<std::string, float> classify(const std::string &image_path,
                                        const std::string &model_path,
                                        const std::string &labels_path, bool usegpu = false);
