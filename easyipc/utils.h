//
// Created by Duzhong Chen on 2020/1/19.
//

#pragma once

#include <string>
#include <codecvt>
#include <locale>

namespace Utils {

	inline std::wstring ConvertToWstring(const std::string &old)
	{
		if (old.empty()) return std::wstring();
		std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>> converter;
		std::wstring wide = converter.from_bytes(old);
		return wide;
	}

}
