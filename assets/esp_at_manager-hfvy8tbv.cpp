#include "esp_at_manager.h"

#include "clogger.h"
#include "format_string.h"
#include "stream_util.h"

namespace em {
esp_at::ResultCode EspAtManager::Init() {
  const auto ret = Restart();
  if (ret != esp_at::ResultCode::kOK) {
    CLOGD("restart failed");
    return ret;
  }
  const String targets[] = {F("\r\nOK\r\n"), F("\r\nERROR\r\n"),
                            F("busy p...\r\n")};
  stream_.println(F("ATE0"));
  auto index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
  CLOGD("ATE0: %" PRId16, index);
  if (index != 0) {
    return esp_at::ResultCode::kError;
  }

  stream_.println(F("AT+CWINIT=1"));
  index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
  CLOGD("AT+CWINIT=1: %" PRId16, index);
  if (index != 0) {
    return esp_at::ResultCode::kError;
  }
  -stream_.println(F("AT+CWMODE=1"));
  index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
  CLOGD("AT+CWMODE=1: %" PRId16, index);
  if (index != 0) {
    return esp_at::ResultCode::kError;
  }

  // stream_.println(F("AT+CIPMUX=1"));
  // index = FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]),
  // 1000); CLOGD("AT+CIPMUX=1: %" PRId16, index); if (index != 0) {
  //   return esp_at::ResultCode::kError;
  // }

  stream_.println(F("AT+CIPDINFO=1"));
  index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
  CLOGD("AT+CIPDINFO=1: %" PRId16, index);
  if (index != 0) {
    return esp_at::ResultCode::kError;
  }

  stream_.println(F("AT+CWAUTOCONN=0"));
  index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
  CLOGD("AT+CWAUTOCONN=0: %" PRId16, index);
  if (index != 0) {
    return esp_at::ResultCode::kError;
  }

  stream_.println(F("AT+CWDHCP=1,1"));
  index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
  CLOGD("AT+CWDHCP=1,1: %" PRId16, index);
  if (index != 0) {
    return esp_at::ResultCode::kError;
  }

  // stream_.println(F("AT+CIPRECVTYPE=5,1"));
  // index = FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]),
  // 1000); CLOGD("AT+CIPRECVTYPE=5,1: %" PRId16, index); if (index != 0) {
  //   return esp_at::ResultCode::kError;
  // }

  return esp_at::ResultCode::kOK;
}

esp_at::ResultCode EspAtManager::Restart() {
  const auto start_time = millis();
  do {
    stream_.println(F("AT+RST"));
    CLOGD("AT+RST");
    const String targets[] = {F("\r\nOK\r\n"), F("\r\nERROR\r\n"),
                              F("busy p...\r\n")};
    const int16_t index =
        FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 100);
    if (index == 0 && FindUtil(stream_, "\r\nready\r\n", 2000)) {
      stream_.println(F("AT"));
      if (0 == FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]),
                        100)) {
        return esp_at::ResultCode::kOK;
      }
    } else {
      CancelSend();
    }
  } while (millis() - start_time < 5000);

  return esp_at::ResultCode::kError;
}

bool EspAtManager::CancelSend() {
  delay(30);
  stream_.print(F("+++"));
  if (!FindUtil(stream_, F("\r\nSEND Canceled\r\n"), 100)) {
    stream_.println();
    EmptyRx(stream_, 100);
    return false;
  } else {
    return true;
  }
}
} // namespace em
