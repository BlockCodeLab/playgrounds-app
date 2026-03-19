#pragma once

#ifndef _EM_ESP_AT_MQTT_H_
#define _EM_ESP_AT_MQTT_H_

#include <Arduino.h>
#include <Stream.h>

#include "result_code.h"

namespace em {
class EspAtMqtt {
 public:
  enum class ConnectionScheme : uint16_t {
    kMqttOverTcp = 1,                               // MQTT over TCP
    kMqttOverTlsNoVerify = 2,                       // MQTT over TLS（不校验证书）
    kMqttOverTlsVerifyServerCert = 3,               // MQTT over TLS（校验 server 证书）
    kMqttOverTlsProvideClientCert = 4,              // MQTT over TLS（提供 client 证书）
    kMqttOverTlsMutualVerify = 5,                   // MQTT over TLS（校验 server 证书并且提供 client 证书）
    kMqttOverWebSocket = 6,                         // MQTT over WebSocket（基于 TCP）
    kMqttOverWebSocketSecureNoVerify = 7,           // MQTT over WebSocket Secure（基于 TLS，不校验证书）
    kMqttOverWebSocketSecureVerifyServerCert = 8,   // MQTT over WebSocket Secure（基于 TLS，校验 server 证书）
    kMqttOverWebSocketSecureProvideClientCert = 9,  // MQTT over WebSocket Secure（基于 TLS，提供 client 证书）
    kMqttOverWebSocketSecureMutualVerify = 10  // MQTT over WebSocket Secure（基于 TLS，校验 server 证书并且提供 client 证书）
  };

  struct ReceivedData {
    String topic;
    uint16_t length = 0;
  };

  EspAtMqtt(Stream& stream);
  ~EspAtMqtt() = default;

  esp_at::ResultCode UserConfig(const ConnectionScheme scheme,
                                const String& client_id,
                                const String& username,
                                const String& password,
                                const String& path = "");
  esp_at::ResultCode Connect(const String& host, const uint16_t port, const bool reconnect = true);
  esp_at::ResultCode Public(const String& topic, const String& data, const uint16_t qos = 0, bool retain = true);
  esp_at::ResultCode Public(
      const String& topic, const uint8_t* data, const uint16_t length, const uint16_t qos = 0, bool retain = true);
  esp_at::ResultCode Subscribe(const String& topic, const uint16_t qos = 0);
  ReceivedData Receive();
  Stream& GetStream() { return stream_; }

 private:
  Stream& stream_;
};
}  // namespace em

#endif