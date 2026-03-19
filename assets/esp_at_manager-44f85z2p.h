/**
 * @file esp_at_manager.h
 */
#pragma once

#ifndef _EM_ESP_AT_MANAGER_H_
#define _EM_ESP_AT_MANAGER_H_

#include <Stream.h>
#include <WString.h>

#include "esp_at_mqtt.h"
#include "esp_at_tcpip.h"
#include "esp_at_wifi.h"
#include "result_code.h"

namespace em {

class EspAtManager {
public:
  explicit EspAtManager(Stream &stream) : stream_(stream) {}

  esp_at::ResultCode Init();

  EspAtWifi &Wifi() {
    if (wifi_ == nullptr) {
      wifi_ = new EspAtWifi(stream_);
    }
    return *wifi_;
  }

  EspAtMqtt &Mqtt() {
    if (mqtt_ == nullptr) {
      mqtt_ = new EspAtMqtt(stream_);
    }
    return *mqtt_;
  }

  EspAtTcpip &Tcpip() {
    if (tcpip_ == nullptr) {
      tcpip_ = new EspAtTcpip(stream_);
    }
    return *tcpip_;
  }

private:
  EspAtManager(const EspAtManager &) = delete;
  EspAtManager &operator=(const EspAtManager &) = delete;

  esp_at::ResultCode Restart();
  bool CancelSend();

  Stream &stream_;
  EspAtMqtt *mqtt_ = nullptr;
  EspAtWifi *wifi_ = nullptr;
  EspAtTcpip *tcpip_ = nullptr;
};
} // namespace em
#endif
