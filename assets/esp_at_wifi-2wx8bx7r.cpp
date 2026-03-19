#include "esp_at_wifi.h"

#include "clogger.h"
#include "format_string.h"
#include "stream_util.h"

namespace em {
esp_at::ResultCode EspAtWifi::ConnectWifi(const String &ssid,
                                          const String &password) {
  CLOGD("ssid: %s, password: %s", ssid.c_str(), password.c_str());
  const String targets[] = {F("\r\nOK\r\n"), F("\r\nERROR\r\n"),
                            F("busy p...\r\n")};
  auto cmd =
      FormatString(F("AT+CWJAP=\"%s\",\"%s\""), ssid.c_str(), password.c_str());
  stream_.println(cmd);
  const int16_t index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 20000);
  CLOGD("%s: %" PRId16, cmd.c_str(), index);
  if (index == 1) {
    return esp_at::ResultCode::kError;
  } else if (index == 2) {
    return esp_at::ResultCode::kBusy;
  } else if (index < 0) {
    return esp_at::ResultCode::kTimedout;
  }

  return esp_at::ResultCode::kOK;
}

esp_at::ResultCode EspAtWifi::Ip(String *const ip, String *const gateway,
                                 String *const netmask) {
  stream_.println(F("AT+CIPSTA?"));
  const String targets[] = {F("+CIPSTA:ip:\""), F("\r\nERROR\r\n"),
                            F("busy p...\r\n")};
  const auto index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
  switch (index) {
  case 0: {
    break;
  }
  case 1: {
    return esp_at::ResultCode::kError;
  }
  case 2: {
    return esp_at::ResultCode::kBusy;
  }
  default: {
    return esp_at::ResultCode::kTimedout;
  }
  }

  if (ip != nullptr) {
    *ip = stream_.readStringUntil('\"');
  }

  if (gateway != nullptr) {
    if (FindUtil(stream_, F("+CIPSTA:gateway:\""), 100)) {
      *gateway = stream_.readStringUntil('\"');
    }
  }

  if (netmask != nullptr) {
    if (FindUtil(stream_, F("+CIPSTA:netmask:\""), 100)) {
      *netmask = stream_.readStringUntil('\"');
    }
  }

  if (FindUtil(stream_, F("\r\nOK\r\n"), 100)) {
    return esp_at::ResultCode::kOK;
  }

  return esp_at::ResultCode::kError;
}

esp_at::ResultCode EspAtWifi::Mac(String *const mac) {
  if (mac == nullptr) {
    return esp_at::ResultCode::kInvalidParameters;
  }

  stream_.println(F("AT+CIPSTAMAC?"));
  const String targets[] = {F("+CIPSTAMAC:\""), F("\r\nERROR\r\n"),
                            F("busy p...\r\n")};
  const auto index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
  switch (index) {
  case 0: {
    break;
  }
  case 1: {
    return esp_at::ResultCode::kError;
  }
  case 2: {
    return esp_at::ResultCode::kBusy;
  }
  default: {
    return esp_at::ResultCode::kTimedout;
  }
  }

  *mac = stream_.readStringUntil('\"');
  if (FindUtil(stream_, F("\r\nOK\r\n"), 100)) {
    return esp_at::ResultCode::kOK;
  }

  return esp_at::ResultCode::kError;
}

esp_at::ResultCode EspAtWifi::ApInfo(String *const ssid, String *const bssid,
                                     uint16_t *const channel,
                                     int16_t *const rssi) {
  stream_.println(F("AT+CWJAP?"));
  const String targets[] = {F("+CWJAP:\""), F("\r\nERROR\r\n"),
                            F("busy p...\r\n")};
  const auto index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
  switch (index) {
  case 0: {
    break;
  }
  case 1: {
    return esp_at::ResultCode::kError;
  }
  case 2: {
    return esp_at::ResultCode::kBusy;
  }
  default: {
    return esp_at::ResultCode::kTimedout;
  }
  }

  if (ssid != nullptr) {
    *ssid = stream_.readStringUntil('\"');
  } else {
    stream_.readStringUntil('\"');
  }

  if (!SkipNext(stream_, ',') || !SkipNext(stream_, '\"')) {
    return esp_at::ResultCode::kError;
  }

  if (bssid != nullptr) {
    *bssid = stream_.readStringUntil('\"');
  } else {
    stream_.readStringUntil('\"');
  }

  if (!SkipNext(stream_, ',')) {
    return esp_at::ResultCode::kError;
  }

  if (channel != nullptr) {
    *channel = stream_.parseInt(SKIP_NONE);
  } else {
    stream_.parseInt(SKIP_NONE);
  }

  if (!SkipNext(stream_, ',')) {
    return esp_at::ResultCode::kError;
  }

  if (rssi != nullptr) {
    *rssi = stream_.parseInt(SKIP_NONE);
  } else {
    stream_.parseInt(SKIP_NONE);
  }

  if (FindUtil(stream_, F("\r\nOK\r\n"), 100)) {
    return esp_at::ResultCode::kOK;
  }

  return esp_at::ResultCode::kError;
}
} // namespace em
