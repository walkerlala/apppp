//
// Created by Duzhong Chen on 2020/1/26.
//

#pragma once

#include <ipc-message/ipc.pb.h>

#include <optional>
#include <string>

std::optional<proto::Thumbnail> gen_thumbnails(int type, const std::string& src_path,
                                               const std::string& out_path);
