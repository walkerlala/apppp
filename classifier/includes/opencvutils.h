#pragma once

#include <math.h>

#include <iostream>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>
#include <vector>

cv::Mat preprocess(cv::Mat, int, int, std::vector<double>, std::vector<double>);
