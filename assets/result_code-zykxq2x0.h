#pragma once

#include <WString.h>
#include <stdint.h>

namespace em {
namespace esp_at {
enum class ResultCode : uint16_t {
  kOK = 0,
  kError,
  kBusy,
  kTimedout,
  kInvalidParameters,
};

String ToString(ResultCode result_core);
}  // namespace esp_at
}  // namespace em