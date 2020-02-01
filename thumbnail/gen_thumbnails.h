//
// Created by Duzhong Chen on 2020/1/26.
//

#pragma once

#include <optional>
#include <string>
#include <ipc-message/ipc.pb.h>

std::optional<Thumbnail> gen_thumbnails(
    int type, const std::string& src_path,
    const std::string& out_path);
