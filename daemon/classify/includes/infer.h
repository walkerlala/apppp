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

#include "opencvutils.h"
#include "torchutils.h"

std::tuple<std::string, float> infer(cv::Mat, int, int, std::vector<double>, std::vector<double>,
                                     std::vector<std::string>, torch::jit::script::Module, bool);
