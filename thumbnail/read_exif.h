//
// Created by Duzhong Chen on 2020/1/28.
//

#pragma once
#include <ipc-message/ipc.pb.h>

#include <optional>

std::optional<proto::ExifInfo> read_exif(const std::string& path);
