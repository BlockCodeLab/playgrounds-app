#pragma once

#ifndef _EM_ESP_AT_WIFI_H_
#define _EM_ESP_AT_WIFI_H_

#include <Stream.h>

#include "result_code.h"

namespace em {
class EspAtWifi {
 public:
  EspAtWifi(Stream& stream) : stream_(stream) {
  }

  esp_at::ResultCode ConnectWifi(const String& ssid, const String& password);
  esp_at::ResultCode Ip(String* const ip, String* const gateway = nullptr, String* const netmask = nullptr);
  esp_at::ResultCode Mac(String* const mac);
  esp_at::ResultCode ApInfo(String* const ssid, String* const bssid = nullptr, uint16_t* const channel = nullptr, int16_t* const rssi = nullptr);

 private:
  Stream& stream_;
};
}  // namespace em
#endif