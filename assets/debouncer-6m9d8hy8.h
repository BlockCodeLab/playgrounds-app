#pragma once

#include <Arduino.h>
#include <stdint.h>

template <typename T> class Debouncer {
public:
  static constexpr uint64_t kDefaultDebounceDurationMs = 20;

  Debouncer(const T &value,
            uint64_t debounce_duration_ms = kDefaultDebounceDurationMs)
      : debouncing_value_(value), last_value_(value),
        debounce_duration_ms_(debounce_duration_ms) {}

  const T &Debounce(const T &value) {
    if (start_debounce_time_ == UINT64_MAX || value != debouncing_value_) {
      debouncing_value_ = value;
      start_debounce_time_ = millis();
    } else if (last_value_ != debouncing_value_ &&
               millis() - start_debounce_time_ >= debounce_duration_ms_) {
      last_value_ = debouncing_value_;
    }

    return last_value_;
  }

  inline const T &operator()(const T &value) { return Debounce(value); }

  inline const T &operator=(const T &value) { return Debounce(value); }

  inline const T &operator()() const { return last_value_; }

private:
  T debouncing_value_;
  T last_value_;
  const uint64_t debounce_duration_ms_ = kDefaultDebounceDurationMs;
  uint64_t start_debounce_time_ = UINT64_MAX;
};
