//
// Created by Duzhong Chen on 2020/1/28.
//

#include "read_exif.h"
#include "./exif.h"

#include <iostream>
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/mman.h>
#include <unistd.h>

std::optional<ExifInfo> read_exif(const std::string& path) {
    int fd = open(path.c_str(), O_RDONLY);
    if (fd < 0) {
        perror("read exif");
        return std::nullopt;
    }

    struct stat file_stat_;
    int error = fstat(fd, &file_stat_);
    if (error < 0) {
        perror("stat failed");
        ::close(fd);
        return std::nullopt;
    }

    void* file = ::mmap(nullptr, file_stat_.st_size, PROT_READ, MAP_SHARED, fd, 0);
    if (file == MAP_FAILED) {
        perror("map failed");
        ::close(fd);
        return std::nullopt;
    }

    easyexif::EXIFInfo parser;
    int ret = parser.parseFrom(
        reinterpret_cast<const unsigned char *>(file), static_cast<unsigned int>(file_stat_.st_size));

    if (ret != PARSE_EXIF_SUCCESS) {
        std::cerr << "parse error" << std::endl;
        ::close(fd);
        return std::nullopt;
    }

    ::close(fd);
    ExifInfo resp;
    resp.set_camera_make(parser.Make);
    resp.set_camera_model(parser.Model);
    resp.set_software(parser.Software);
    resp.set_bits_per_sample(parser.BitsPerSample);
    resp.set_image_width(parser.ImageWidth);
    resp.set_image_height(parser.ImageHeight);
    resp.set_image_description(parser.ImageDescription);
    resp.set_image_orientation(parser.Orientation);
    resp.set_image_copyright(parser.Copyright);
    resp.set_image_datetime(parser.DateTime);
    resp.set_original_datetime(parser.DateTimeOriginal);
    resp.set_digitize_datetime(parser.DateTimeDigitized);
    resp.set_subsecond_time(parser.SubSecTimeOriginal);
    resp.set_exposure_time(parser.ExposureTime);
    resp.set_f_stop(parser.FNumber);
    resp.set_iso_speed(parser.ISOSpeedRatings);
    resp.set_subject_distance(parser.SubjectDistance);
    resp.set_exposure_bias(parser.ExposureBiasValue);
    resp.set_flash_used(parser.Flash);
    resp.set_metering_mode(parser.MeteringMode);
    resp.set_lens_focal_length(parser.FocalLength);
    resp.set_focal_length_35mm(parser.FocalLengthIn35mm);
    resp.set_gps_latitude(parser.GeoLocation.Latitude);
    resp.set_gps_longitude(parser.GeoLocation.Longitude);
    resp.set_gps_altitude(parser.GeoLocation.Altitude);
    return resp;
}
