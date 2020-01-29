#pragma once

#include <torch/script.h>
#include <torch/serialize.h>
#include <torch/serialize/tensor.h>

#include <chrono>
#include <fstream>
#include <iostream>
#include <memory>
#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>
#include <random>
#include <string>
#include <tuple>
#include <vector>

torch::jit::script::Module read_model(std::string, bool);
std::vector<float> forward(std::vector<cv::Mat>, torch::jit::script::Module, bool);
std::tuple<std::string, float> postprocess(std::vector<float>, std::vector<std::string>);
