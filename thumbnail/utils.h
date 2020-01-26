//
// Created by Duzhong Chen on 2020/1/26.
//

#pragma once

#include <boost/uuid/uuid.hpp>
#include <boost/uuid/uuid_io.hpp>
#include <boost/uuid/uuid_generators.hpp>

#include <boost/random/random_device.hpp>
#include <boost/random/uniform_int_distribution.hpp>

inline std::string GenUuid() {
    boost::uuids::uuid a_uuid = boost::uuids::random_generator()(); // 这里是两个() ，因为这里是调用的 () 的运算符重载
    return boost::uuids::to_string(a_uuid);
}

inline std::string GenRandomString(int length) {
    std::string chars(
        "abcdefghijklmnopqrstuvwxyz"
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        "1234567890"
    );
    /*<< We use __random_device as a source of entropy, since we want
         passwords that are not predictable.
    >>*/
    boost::random::random_device rng;
    /*<< Finally we select 8 random characters from the
         string and print them to cout.
    >>*/
    boost::random::uniform_int_distribution<> index_dist(0, chars.size() - 1);

    std::string result;

    for (int i = 0; i < length; i++) {
        result.push_back(chars[index_dist(rng)]);
    }

    return result;
}

