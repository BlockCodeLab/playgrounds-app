#include "format_string.h"

#include <stdarg.h>
#include <stdio.h>

String FormatString(const __FlashStringHelper* fmt, ...) {
  va_list args;
  va_start(args, fmt);
  const auto size = vsnprintf_P(nullptr, 0, reinterpret_cast<const char*>(fmt), args);
  va_end(args);

  char* const data = new char[size + 1];
  if (data == nullptr) {
    abort();
  }

  va_start(args, fmt);
  vsnprintf_P(data, size + 1, reinterpret_cast<const char*>(fmt), args);
  va_end(args);

  String string(data);
  delete[] data;
  return string;
}

String FormatString(const String& fmt, ...) {
  va_list args;
  va_start(args, fmt);
  const auto size = vsnprintf(nullptr, 0, fmt.c_str(), args);
  va_end(args);

  char* const data = new char[size + 1];
  if (data == nullptr) {
    abort();
  }

  va_start(args, fmt);
  vsnprintf(data, size + 1, fmt.c_str(), args);
  va_end(args);

  String string(data);
  delete[] data;
  return string;
}

String FormatString(char* const fmt, ...) {
  va_list args;
  va_start(args, fmt);
  const auto size = vsnprintf(nullptr, 0, fmt, args);
  va_end(args);

  char* const data = new char[size + 1];
  if (data == nullptr) {
    abort();
  }

  va_start(args, fmt);
  vsnprintf(data, size + 1, fmt, args);
  va_end(args);

  String string(data);
  delete[] data;
  return string;
}