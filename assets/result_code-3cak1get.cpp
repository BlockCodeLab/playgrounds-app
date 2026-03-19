#include "result_code.h"

namespace em {
namespace esp_at {
String ToString(ResultCode result_core) {
  switch (result_core) {
    case ResultCode::kOK:
      return F("OK");
    case ResultCode::kError:
      return F("Error");
    case ResultCode::kBusy:
      return F("Busy");
    case ResultCode::kTimedout:
      return F("Timedout");
    case ResultCode::kInvalidParameters:
      return F("InvalidParameters");
    default:
      return F("Unknown ResultCode Code");
  }
}
}  // namespace esp_at
}  // namespace em