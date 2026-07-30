#include <Arduino.h>
#include <gamepad_codec_decoder.h>

class CodexPad : public gamepad::codec::Decoder {
public:
  CodexPad(Stream &bluetooth_stream)
      : gamepad::codec::Decoder(bluetooth_stream),
        bluetooth_stream_(bluetooth_stream) {}

  void Connect(const String &device_address) {
    bluetooth_stream_.println("AT+DISCON");
    delay(100);
    bluetooth_stream_.println("AT+ECHO=0");
    delay(100);
    bluetooth_stream_.println("AT+ROLE=0");
    delay(100);
    bluetooth_stream_.println("AT+AUTOCON=0");
    delay(100);
    bluetooth_stream_.print("AT+CON=");
    bluetooth_stream_.println(device_address);
    delay(100);
  }

  bool Pressed(gamepad::input::Button button) {
    const gamepad::input::Tracker &tracker = input_tracker();
    return tracker.pressed(button);
  }

  bool Holding(gamepad::input::Button button) {
    const gamepad::input::Tracker &tracker = input_tracker();
    return tracker.holding(button);
  }

  bool Released(gamepad::input::Button button) {
    const gamepad::input::Tracker &tracker = input_tracker();
    return tracker.released(button);
  }

  uint8_t Axis(gamepad::input::Axis axis) {
    const gamepad::input::Tracker &tracker = input_tracker();
    return tracker[axis];
  }

private:
  Stream &bluetooth_stream_;
};
