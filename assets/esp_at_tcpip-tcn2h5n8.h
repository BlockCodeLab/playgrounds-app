#pragma once

#ifndef _ESP_AT_TCPIP_H_
#define _ESP_AT_TCPIP_H_

#include <Arduino.h>
#include <Stream.h>

#include "result_code.h"

namespace em {
class EspAtTcpip {
 public:
  struct ReceivedData {
    String remote_host;
    uint16_t remote_port;
    uint16_t length = 0;
  };

  EspAtTcpip(Stream& stream);
  Stream& GetStream() {
    return stream_;
  }

  esp_at::ResultCode ConnectUdp(const String& remote_host, const uint16_t remote_port, const uint16_t local_port);
  esp_at::ResultCode ConnectTcp(const String& remote_host, const uint16_t remote_port);
  esp_at::ResultCode State(
      String* const type, String* const remote_host, uint16_t* const remote_port, uint16_t* const local_port, bool* const client);
  ReceivedData Receive();
  esp_at::ResultCode Send(uint8_t* data, uint16_t length);

 private:
  EspAtTcpip(const EspAtTcpip&) = delete;
  EspAtTcpip& operator=(const EspAtTcpip&) = delete;

  Stream& stream_;
};
}  // namespace em

#endif