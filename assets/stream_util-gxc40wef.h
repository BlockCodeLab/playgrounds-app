#pragma once

#include <Stream.h>
#include <WString.h>

int16_t FindUtil(
    Stream& stream, const String* targets, const uint16_t targets_size, const uint32_t timeout_ms = 1000, bool debug = false);

bool FindUtil(Stream& stream, const String target, const uint32_t timeout_ms = 1000, String* ret = nullptr);

bool SkipNext(Stream& stream, const char target);

void EmptyRx(Stream& stream, const uint32_t duration_ms = 0);