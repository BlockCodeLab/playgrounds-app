#include "esp_at_tcpip.h"

#include "clogger.h"
#include "format_string.h"
#include "stream_util.h"

namespace em {
EspAtTcpip::EspAtTcpip(Stream &stream) : stream_(stream) {}

esp_at::ResultCode EspAtTcpip::ConnectUdp(const String &remote_host,
                                          const uint16_t remote_port,
                                          const uint16_t local_port) {
  const auto cmd =
      FormatString("AT+CIPSTART=\"UDP\",\"%s\",%" PRIu16 ",%" PRIu16,
                   remote_host.c_str(), remote_port, local_port);
  stream_.println(cmd);
  // TODO:
}

esp_at::ResultCode EspAtTcpip::ConnectTcp(const String &remote_host,
                                          const uint16_t remote_port) {
  const auto cmd = FormatString("AT+CIPSTART=\"TCP\",\"%s\",%" PRIu16,
                                remote_host.c_str(), remote_port);
  CLOGD("cmd: %s", cmd.c_str());

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

  return esp_at::ResultCode::kError;
}

esp_at::ResultCode EspAtTcpip::State(String *const type,
                                     String *const remote_host,
                                     uint16_t *const remote_port,
                                     uint16_t *const local_port,
                                     bool *const client) {
  stream_.println(F("AT+CIPSTATE?"));
  // +CIPSTATE:0,"TCP","192.168.8.116",1234,64805,0
  const String targets[] = {F("\r\nOK\r\n"), F("\r\nERROR\r\n"),
                            F("busy p...\r\n"), F("+CIPSTATE:0,\"")};
  const auto index =
      FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
  CLOGD("ret: %" PRId16, index);
  if (index != 3) {
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
  }
  if (type != nullptr) {
    *type = stream_.readStringUntil('\"');
  } else {
    stream_.readStringUntil('\"');
  }

  if (!SkipNext(stream_, ',') || !SkipNext(stream_, '\"')) {
    return esp_at::ResultCode::kError;
  }

  if (remote_host != nullptr) {
    *remote_host = stream_.readStringUntil('\"');
  } else {
    stream_.readStringUntil('\"');
  }

  if (!SkipNext(stream_, ',')) {
    return esp_at::ResultCode::kError;
  }

  if (remote_port != nullptr) {
    *remote_port = stream_.parseInt(SKIP_NONE);
  } else {
    stream_.parseInt(SKIP_NONE);
  }

  if (!SkipNext(stream_, ',')) {
    return esp_at::ResultCode::kError;
  }

  if (local_port != nullptr) {
    *local_port = stream_.parseInt(SKIP_NONE);
  } else {
    stream_.parseInt(SKIP_NONE);
  }

  if (!SkipNext(stream_, ',')) {
    return esp_at::ResultCode::kError;
  }

  if (client != nullptr) {
    *client = stream_.parseInt(SKIP_NONE) == 0;
  } else {
    stream_.parseInt(SKIP_NONE);
  }

  return esp_at::ResultCode::kOK;
}

EspAtTcpip::ReceivedData EspAtTcpip::Receive() {
  // +IPD,5,"192.168.8.116",5000:12345
  String header(F("+IPD,"));
  if (!stream_.find((char *)header.c_str())) {
    return {};
  }

  EspAtTcpip::ReceivedData received_data;
  received_data.length = stream_.parseInt(SKIP_NONE);
  CLOGD("length: %" PRIu16, received_data.length);

  if (!SkipNext(stream_, ',') || !SkipNext(stream_, '\"')) {
    return {};
  }

  received_data.remote_host = stream_.readStringUntil('\"');
  CLOGD("remote_host: %s", received_data.remote_host.c_str());
  if (!SkipNext(stream_, ',')) {
    return {};
  }

  received_data.remote_port = stream_.parseInt(SKIP_NONE);
  CLOGD("remote_port: %" PRIu16, received_data.remote_port);
  if (!SkipNext(stream_, ':')) {
    return {};
  }

  return received_data;
}

esp_at::ResultCode EspAtTcpip::Send(uint8_t *data, uint16_t length) {
  // AT+CIPSEND=<length>
  stream_.print(F("AT+CIPSEND="));
  stream_.println(length);

  {
    const String targets[] = {F("\r\nOK\r\n\r\n>"), F("\r\nERROR\r\n"),
                              F("busy p...\r\n")};
    const auto index =
        FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
    CLOGD("ret: %" PRId16, index);
    if (index != 0) {
      switch (index) {
      case 1:
        return esp_at::ResultCode::kError;
      case 2:
        return esp_at::ResultCode::kBusy;
      default:
        return esp_at::ResultCode::kTimedout;
      }
    }
  }

  stream_.write(data, length);

  {
    const String targets[] = {F("\r\nSEND OK\r\n"), F("\r\nERROR\r\n")};
    const auto index =
        FindUtil(stream_, targets, sizeof(targets) / sizeof(targets[0]), 1000);
    CLOGD("ret: %" PRId16, index);
    switch (index) {
    case 0:
      return esp_at::ResultCode::kOK;
    case 1:
      return esp_at::ResultCode::kError;
    default:
      return esp_at::ResultCode::kTimedout;
    }
  }

  return esp_at::ResultCode::kOK;
}

} // namespace em
