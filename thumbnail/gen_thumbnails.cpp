//
// Created by Duzhong Chen on 2020/1/26.
//
#include "gen_thumbnails.h"

#include <boost/algorithm/string.hpp>
#include <boost/filesystem.hpp>
#include <boost/gil.hpp>
#include <boost/gil/extension/io/jpeg.hpp>
#include <boost/gil/extension/io/png.hpp>
#include <boost/gil/extension/numeric/resample.hpp>
#include <boost/gil/extension/numeric/sampler.hpp>
#include <sstream>

#include "./utils.h"

using namespace boost::gil;
using boost::filesystem::path;

using proto::Thumbnail;
using proto::ThumbnailType;
using proto::ThumbnailType_Name;

static constexpr int SmallThumbnailWidth = 128;
static constexpr int MediumThumbnailWidth = 512;
static constexpr int LargeThumbnailWidth = 1024;

template <int Standard>
inline std::pair<int, int> get_proper_ize_by_standard(int width, int height) {
    int greater = std::max(width, height);
    if (greater <= Standard) {
        return {-1, -1};
    }

    if (width > height) {
        int ret_width = Standard;
        float ratio = static_cast<float>(height) / width;
        int ret_height = ret_width * ratio;

        return {ret_width, ret_height};
    }

    int ret_height = Standard;
    float ratio = static_cast<float>(width) / height;
    int ret_width = ret_height * ratio;
    return {ret_width, ret_height};
}

inline std::pair<int, int> get_proper_thumbnail_size(ThumbnailType type, int width, int height) {
    switch (type) {
        case ThumbnailType::Small:
            return get_proper_ize_by_standard<SmallThumbnailWidth>(width, height);

        case ThumbnailType::Medium:
            return get_proper_ize_by_standard<MediumThumbnailWidth>(width, height);

        case ThumbnailType::Large:
            return get_proper_ize_by_standard<LargeThumbnailWidth>(width, height);

        default:
            return {-1, -1};
    }
}

std::optional<Thumbnail> gen_thumbnails(int type, const std::string& in_path_str,
                                        const std::string& out_dir) {
    try {
        rgba8_image_t img;
        std::string ext = boost::algorithm::to_lower_copy(path(in_path_str).extension().string());

        if (ext == ".jpg" || ext == ".jpeg") {
            boost::gil::read_and_convert_image(in_path_str, img, boost::gil::jpeg_tag{});
        } else if (ext == ".png") {
            boost::gil::read_and_convert_image(in_path_str, img, boost::gil::png_tag{});
        } else {
            return std::nullopt;
        }

        auto proper_size =
            get_proper_thumbnail_size(static_cast<ThumbnailType>(type), img.width(), img.height());
        if (proper_size.first < 0) {
            return std::nullopt;
        }

        rgb8_image_t thumbnail_img(proper_size.first, proper_size.second);
        resize_view(const_view(img), view(thumbnail_img), bilinear_sampler{});

        path src_path(in_path_str);
        std::string filename = src_path.filename().string();
        std::string no_ext = src_path.stem().string();

        std::cout << filename << " " << no_ext << " " << ext << std::endl;

        std::stringstream gen_filename_ss;

        gen_filename_ss << src_path.stem().string() << "-" << GenRandomString(6) << "-"
                        << ThumbnailType_Name(type) << src_path.extension().string();

        path output_path = path(out_dir) / path(gen_filename_ss.str());
        std::string output_path_str = output_path.string();
        std::cout << "prepare to gen image: " << output_path.string() << std::endl;
        if (ext == ".jpg" || ext == ".jpeg") {
            write_view(output_path_str, const_view(thumbnail_img), jpeg_tag{});
        } else {
            write_view(output_path_str, const_view(thumbnail_img), png_tag{});
        }
        std::cout << "finished" << std::endl;

        Thumbnail tb;
        tb.set_width(proper_size.first);
        tb.set_height(proper_size.second);
        tb.set_path(output_path_str);
        tb.set_type(static_cast<ThumbnailType>(type));
        return {tb};
    } catch (std::exception& ex) {
        std::cerr << ex.what() << std::endl;
        return std::nullopt;
    }
}
