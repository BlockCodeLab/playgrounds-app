#pragma once

#ifndef __CLOGGER_COMMON_H__
#define __CLOGGER_COMMON_H__

#include <Arduino.h>
#include <WString.h>
#include <stdarg.h>
#include <stdio.h>

class Clogger final {
 public:
  template <typename T, size_t size>
  static constexpr size_t FileNameOffset(const T (&file_path)[size], size_t i = size - 1) {
    static_assert(size > 1, "");
    return file_path[i] == '/' || file_path[i] == '\\' ? i + 1 : (i == 0 ? 0 : FileNameOffset(file_path, i - 1));
  }

  static void Log(int severity,
                  const __FlashStringHelper *file_name,
                  const size_t file_name_begin,
                  const size_t line_num,
                  const char *function,
                  const __FlashStringHelper *fmt,
                  ...) {
    const auto now = millis();
    const uint_fast16_t millis = now % 1000;
    const uint_fast8_t seconds = now / 1000 % 60;
    const uint_fast8_t minutes = now / 60000 % 60;
    const uint_fast8_t hours = now / 3600000 % 100;

    char time_str[14];
    snprintf_P(time_str,
               sizeof(time_str),
               reinterpret_cast<const char *>(F("%02" PRIuFAST8 ":%02" PRIuFAST8 ":%02" PRIuFAST8 ".%03" PRIuFAST16 " ")),
               hours,
               minutes,
               seconds,
               millis);
    Serial.write(time_str, sizeof(time_str) - 1);
    Serial.print(SeverityToChar(severity));
    Serial.print(' ');
    Serial.print(reinterpret_cast<const __FlashStringHelper *>(reinterpret_cast<PGM_P>(file_name) + file_name_begin));
    Serial.print(':');
    Serial.print(line_num);
    Serial.print(' ');
    Serial.print(function);
    Serial.print(F("] "));

    if (nullptr == fmt) {
      return;
    }

    va_list args;
    va_start(args, fmt);
    const auto length = vsnprintf_P(nullptr, 0, reinterpret_cast<const char *>(fmt), args);
    va_end(args);

    char *buffer = new char[length + 1];
    if (buffer == nullptr) {
      abort();
    }

    va_start(args, fmt);
    vsnprintf_P(buffer, length + 1, reinterpret_cast<const char *>(fmt), args);
    va_end(args);
    Serial.write(buffer, length);
    delete[] buffer;
  }

 private:
  static char SeverityToChar(const int severity) {
    switch (severity) {
      case CLOGGER_SEVERITY_VERBOSE:
        return 'V';
      case CLOGGER_SEVERITY_DEBUG:
        return 'D';
      case CLOGGER_SEVERITY_INFO:
        return 'I';
      case CLOGGER_SEVERITY_WARN:
        return 'W';
      case CLOGGER_SEVERITY_ERROR:
        return 'E';
      case CLOGGER_SEVERITY_FATAL:
        return 'F';
    }
    return 'X';
  }
};  // namespace clog

#if CLOGGER_SEVERITY <= CLOGGER_SEVERITY_VERBOSE
#define CLOGV(fmt, ...) \
  Clogger::Log(CLOGGER_SEVERITY_VERBOSE, F(__FILE__), Clogger::FileNameOffset(__FILE__), __LINE__, __FUNCTION__, F("" fmt "\n"), ##__VA_ARGS__)
#else
#define CLOGV(fmt, ...)
#endif

#if CLOGGER_SEVERITY <= CLOGGER_SEVERITY_DEBUG
#define CLOGD(fmt, ...) \
  Clogger::Log(CLOGGER_SEVERITY_DEBUG, F(__FILE__), Clogger::FileNameOffset(__FILE__), __LINE__, __FUNCTION__, F("" fmt "\n"), ##__VA_ARGS__)
#else
#define CLOGD(fmt, ...)
#endif

#if CLOGGER_SEVERITY <= CLOGGER_SEVERITY_INFO
#define CLOGI(fmt, ...) \
  Clogger::Log(CLOGGER_SEVERITY_INFO, F(__FILE__), Clogger::FileNameOffset(__FILE__), __LINE__, __FUNCTION__, F("" fmt "\n"), ##__VA_ARGS__)
#else
#define CLOGI(fmt, ...)
#endif

#if CLOGGER_SEVERITY <= CLOGGER_SEVERITY_WARN
#define CLOGW(fmt, ...) \
  Clogger::Log(CLOGGER_SEVERITY_WARN, F(__FILE__), Clogger::FileNameOffset(__FILE__), __LINE__, __FUNCTION__, F("" fmt "\n"), ##__VA_ARGS__)
#else
#define CLOGW(fmt, ...)
#endif

#if CLOGGER_SEVERITY <= CLOGGER_SEVERITY_ERROR
#define CLOGE(fmt, ...) \
  Clogger::Log(CLOGGER_SEVERITY_ERROR, F(__FILE__), Clogger::FileNameOffset(__FILE__), __LINE__, __FUNCTION__, F("" fmt "\n"), ##__VA_ARGS__)
#else
#define CLOGE(fmt, ...)
#endif

#if CLOGGER_SEVERITY <= CLOGGER_SEVERITY_FATAL
#define CLOGF(fmt, ...) \
  Clogger::Log(CLOGGER_SEVERITY_FATAL, F(__FILE__), Clogger::FileNameOffset(__FILE__), __LINE__, __FUNCTION__, F("" fmt "\n"), ##__VA_ARGS__)
#else
#define CLOGF(fmt, ...)
#endif

#endif