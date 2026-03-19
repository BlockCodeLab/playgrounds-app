#pragma once

#include <WString.h>

String FormatString(const __FlashStringHelper* fmt, ...);
String FormatString(const String& fmt, ...);
String FormatString(char* const fmt, ...);