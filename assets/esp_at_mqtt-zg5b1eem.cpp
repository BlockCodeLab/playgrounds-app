#include "esp_at_mqtt.h"

#include <Stream.h>

#include "clogger.h"
#include "format_string.h"
#include "stream_util.h"

namespace em {

EspAtMqtt::EspAtMqtt(Stream &stream) : stream_(stream) {}

esp_at::ResultCode EspAtMqtt::UserConfig(const ConnectionScheme scheme,
                                         const String &client_id,
                                         const String &username,
                                         const String &password,
                                         const String &path) {
  /**
   * AT+MQTTUSERCFG=<LinkID>,<scheme>,<"client_id">,<"username">,<"password">,<cert_key_ID>,<CA_ID>,<"path">
   * <LinkID>：当前仅支持 link ID 0。
   * <scheme>：
        1: MQTT over TCP；
        2: MQTT over TLS（不校验证书）；
        3: MQTT over TLS（校验 server 证书）；
        4: MQTT over TLS（提供 client 证书）；
        5: MQTT over TLS（校验 server 证书并且提供 client 证书）；
        6: MQTT over WebSocket（基于 TCP）；
        7: MQTT over WebSocket Secure（基于 TLS，不校验证书）；
        8: MQTT over WebSocket Secure（基于 TLS，校验 server 证书）；
        9: MQTT over WebSocket Secure（基于 TLS，提供 client 证书）；
        10: MQTT over WebSocket Secure（基于 TLS，校验 server 证书并且提供
   client 证书）。
    * <client_id>：MQTT 客户端 ID，最大长度：256 字节。
    * <username>：用户名，用于登陆 MQTT broker，最大长度：64 字节。
    * <password>：密码，用于登陆 MQTT broker，最大长度：64 字节。
    * <cert_key_ID>：证书 ID，目前 ESP-AT 仅支持一套 cert 证书，参数为 0。
    * <CA_ID>：CA ID，目前 ESP-AT 仅支持一套 CA 证书，参数为 0。
    * <path>：资源路径，最大长度：32 字节。
   */

  const auto cmd = FormatString(F("AT+MQTTUSERCFG=0,"
                                  "%" PRIu16 "," // scheme
                                  "\"%s\","      // client_id
                                  "\"%s\","      // username
                                  "\"%s\","      // password
                                  "0,"           // cert_key_ID
                                  "0,"           // CA_ID
                                  "\"%s\""       // path
                                  ),
                                scheme, client_id.c_str(), username.c_str(),
                                password.c_str(), path.c_str());
  CLOGD("cmd:%s", cmd.c_str());
  stream_.println(cmd);

  const String targets[] = {F("\r\nOK\r\n"), F("\r\nERROR\r\n"),
                            F("busy p...\r\n")};
  const auto index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
  CLOGD("ret: %" PRId16, index);
  switch (index) {
  case 0:
    return esp_at::ResultCode::kOK;
  case 1:
    return esp_at::ResultCode::kError;
  case 2:
    return esp_at::ResultCode::kBusy;
  default:
    return esp_at::ResultCode::kTimedout;
  }

  return esp_at::ResultCode::kOK;
}

esp_at::ResultCode EspAtMqtt::Connect(const String &host, const uint16_t port,
                                      const bool reconnect) {
  const auto cmd = FormatString(F("AT+MQTTCONN=0,"
                                  "\"%s\","      // host
                                  "%" PRIu16 "," // port
                                  "%d"           // reconnect
                                  ),
                                host.c_str(), port, reconnect ? 1 : 0);
  CLOGD("cmd:%s", cmd.c_str());
  stream_.println(cmd);

  const String targets[] = {F("\r\nOK\r\n"), F("\r\nERROR\r\n"),
                            F("busy p...\r\n")};
  const auto index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 10000);
  CLOGD("ret: %" PRId16, index);
  switch (index) {
  case 0:
    return esp_at::ResultCode::kOK;
  case 1:
    return esp_at::ResultCode::kError;
  case 2:
    return esp_at::ResultCode::kBusy;
  default:
    return esp_at::ResultCode::kTimedout;
  }

  return esp_at::ResultCode::kOK;
}

esp_at::ResultCode EspAtMqtt::Public(const String &topic, const String &data,
                                     const uint16_t qos, bool retain) {
  return Public(topic, data.begin(), data.length(), qos, retain);
}

esp_at::ResultCode EspAtMqtt::Public(const String &topic, const uint8_t *data,
                                     const uint16_t length, const uint16_t qos,
                                     bool retain) {
  const auto cmd = FormatString(F("AT+MQTTPUBRAW=0,"
                                  "\"%s\","      // topic
                                  "%" PRIu16 "," // length
                                  "%" PRIu16 "," // qos
                                  "%d"),
                                topic.c_str(), length, qos, retain ? 1 : 0);
  stream_.println(cmd);

  const String targets[] = {F("\r\nOK\r\n\r\n>"), F("\r\nERROR\r\n"),
                            F("busy p...\r\n")};
  auto index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
  switch (index) {
  case 0:
    break;
  case 1:
    return esp_at::ResultCode::kError;
  case 2:
    return esp_at::ResultCode::kBusy;
  default:
    return esp_at::ResultCode::kTimedout;
  }

  const String targets_1[] = {F("+MQTTPUB:OK"), F("+MQTTPUB:FAIL")};
  stream_.write(data, length);
  index = FindUtil(stream_, targets_1, sizeof(targets_1) / sizeof(targets_1[0]),
                   10000);
  switch (index) {
  case 0:
    return esp_at::ResultCode::kOK;
  case 1:
    return esp_at::ResultCode::kError;
  default:
    return esp_at::ResultCode::kTimedout;
  }

  return esp_at::ResultCode::kOK;
}

esp_at::ResultCode EspAtMqtt::Subscribe(const String &topic,
                                        const uint16_t qos) {
  const auto cmd = FormatString(F("AT+MQTTSUB=0,"
                                  "\"%s\","  // topic
                                  "%" PRIu16 // qos
                                  ),
                                topic.c_str(), qos);
  CLOGD("cmd:%s", cmd.c_str());
  stream_.println(cmd);

  const String targets[] = {F("\r\nOK\r\n"), F("\r\nERROR\r\n"),
                            F("busy p...\r\n")};
  const auto index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 10000);
  CLOGD("ret: %" PRId16, index);
  switch (index) {
  case 0:
    return esp_at::ResultCode::kOK;
  case 1:
    return esp_at::ResultCode::kError;
  case 2:
    return esp_at::ResultCode::kBusy;
  default:
    return esp_at::ResultCode::kTimedout;
  }

  return esp_at::ResultCode::kOK;
}

EspAtMqtt::ReceivedData EspAtMqtt::Receive() {
  String header(F("+MQTTSUBRECV:0,\""));
  if (!stream_.find((char *)header.c_str())) {
    return {};
  }

  EspAtMqtt::ReceivedData received_data;
  received_data.topic = stream_.readStringUntil('\"');
  if (!SkipNext(stream_, ',')) {
    return {};
  }

  auto length = stream_.parseInt(SKIP_NONE);
  if (length <= 0) {
    return {};
  }

  received_data.length = length;

  if (!SkipNext(stream_, ',')) {
    return {};
  }

  return received_data;
}

} // namespace  em
