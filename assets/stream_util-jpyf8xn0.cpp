#include "stream_util.h"

#include <Arduino.h>

#include "clogger.h"

int16_t FindUtil(Stream &stream, const String *targets,
                 const uint16_t targets_size, const uint32_t timeout_ms,
                 bool debug) {
  if (targets_size == 0) {
    return -1;
  }

  uint16_t *offsets = new uint16_t[targets_size];
  memset(offsets, 0, sizeof(uint16_t) * targets_size);

  const auto end_time = millis() + timeout_ms;
  while (millis() < end_time) {
    if (stream.available() <= 0) {
      continue;
    }

    const char c = static_cast<char>(stream.read());
    if (debug) {
      CLOGD("0x%02X, %c", c, c);
    }

    for (uint16_t i = 0; i < targets_size; i++) {
      auto &offset = offsets[i];
      const auto &target = targets[i];
      if (debug) {
        // CLOGD("i: %u, offset: %u", i, offset);
      }

      if (c == target[offset]) {
        if (++offset == target.length()) {
          delete[] offsets;
          return i;
        } else {
          continue;
        }
      }

      if (0 == offset) {
        continue;
      }

      const uint16_t orig_index = offset;

      do {
        --offset;

        if (c != target[offset]) {
          continue;
        }

        if (offset == 0) {
          offset++;
          break;
        }

        auto diff = orig_index - offset;
        uint16_t j = 0;
        for (j = 0; j < offset; ++j) {
          if (target[j] != target[j + diff]) {
            break;
          }
        }

        if (j == offset) {
          offset++;
          break;
        }
      } while (offset > 0);
    }
  }

  delete[] offsets;
  return -1;
}

bool FindUtil(Stream &stream, const String target, const uint32_t timeout_ms,
              String *ret) {
  const auto end_time = millis() + timeout_ms;
  size_t offset = 0;

  do {
    if (stream.available() <= 0) {
      continue;
    }

    const char c = static_cast<char>(stream.read());
    if (ret != nullptr) {
      *ret += c;
    }

    if (c == target[offset]) {
      if (++offset == target.length()) {
        return true;
      } else {
        continue;
      }
    }

    if (0 == offset) {
      continue;
    }

    const auto orig_index = offset;
    do {
      --offset;

      if (c != target[offset]) {
        continue;
      }

      if (offset == 0) {
        offset++;
        break;
      }

      auto diff = orig_index - offset;
      size_t i = 0;
      for (i = 0; i < offset; ++i) {
        if (target[i] != target[i + diff]) {
          break;
        }
      }

      if (i == offset) {
        offset++;
        break;
      }
    } while (offset > 0);
  } while (millis() < end_time);

  return false;
}

bool SkipNext(Stream &stream, const char target) {
  char c = '\0';
  if (1 != stream.readBytes(&c, 1)) {
    return false;
  }

  return c == target;
}

void EmptyRx(Stream &stream, const uint32_t duration_ms) {
  const auto start_time = millis();
  do {
    while (stream.available() > 0) {
      stream.read();
    }
  } while (millis() - start_time < duration_ms);
}
