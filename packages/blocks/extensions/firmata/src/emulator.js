import { setAlert, Text } from '@blockcode/core';
import { Firmata } from '@blockcode/utils';
import { ArduinoBle } from './arduinoBle';
import { BleSerialPort } from './ble_serialport';

class ArudinoBleEmulator {
  constructor() {
    this.arduinoBle = new ArduinoBle();
    this.bleSerialPort = new BleSerialPort(this.arduinoBle);
    this.board = null;
  }

  get key() {
    return 'firmata';
  }

  async connect(server) {
    this.arduinoBle.init(server);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await this.arduinoBle.sendATMessage('AT+BAUD=3');
    await this.arduinoBle.sendATMessage('AT+BLEUSB=3');
    await this.arduinoBle.sendATMessage('AT+ALL');
    this.board = new Firmata(this.bleSerialPort, { skipCapabilities: true });
    this.board.on('ready', () => {
      console.log('✔ ready');
      this.board.queryCapabilities(() => {
        this.board.queryAnalogMapping(() => {
          console.log('queryAnalogMapping');
        });
        console.log('queryCapabilities');
      });
    });
    this.board.on('reportVersionTimeout', () => {
      console.log('timeOut----');
      this.flashAndReInit();
    });
  }

  async flashAndReInit() {
    await this.flash();
    await this.arduinoBle.sendATMessage('AT+BAUD=3');
    await this.arduinoBle.sendATMessage('AT+BLEUSB=3');
    this.board.queryCapabilities(() => {
      this.board.queryAnalogMapping(() => {
        console.log('queryAnalogMapping');
      });
      console.log('queryCapabilities');
    });
  }

  async disconnect() {
    await this.arduinoBle.disconnect();
  }

  async flash() {
    const alertId = setAlert({
      message: (
        <Text
          id="blocks.firmata.firmware"
          defaultMessage="Updating firmware..."
        />
      ),
    });
    await this.arduinoBle.sendATMessage('AT+BAUD=4');
    await this.bleSerialPort.flashHex();
    setAlert(
      {
        id: alertId,
        message: (
          <Text
            id="blocks.firmata.completed"
            defaultMessage="Updating firmware completed."
          />
        ),
      },
      2000,
    );
  }

  getAnalogValue(pinV) {
    const pin = parseInt(pinV);
    const pinObj = this.board.pins[this.board.analogPins[pin]];
    if (pinObj) {
      if (pinObj.report && pinObj.report === 1) {
        return pinObj.value;
      } else {
        console.log('-------new report analog --------');
        this.board.reportAnalogPin(pin, 1);
        return '0';
      }
    }
  }

  getDigitalValue(pinV) {
    const pin = parseInt(pinV);
    const pinObj = this.board.pins[pin];
    if (pinObj) {
      if (pinObj.report && pinObj.report === 1) {
        return Boolean(pinObj.value);
      } else {
        console.log('-------new report digital --------');
        this.board.pinMode(pin, this.board.MODES.PULLUP);
        this.board.reportDigitalPin(pin, 1);
        return false;
      }
    }
  }

  writePWM(pwmPin, pinValue) {
    const pin = parseInt(pwmPin);
    const value = parseInt(pinValue);
    this.board.pinMode(pin, this.board.MODES.PWM);
    this.board.pwmWrite(pin, value);
  }

  writeDigital(digitalPin, pinValue) {
    const pin = parseInt(digitalPin);
    const value = parseInt(pinValue);
    const pinv = this.board.pins[pin];
    if (pinv && pinv.mode && pinv.mode != this.board.MODES.OUTPUT) {
      this.board.pinMode(pin, this.board.MODES.OUTPUT);
    }
    this.board.digitalWrite(pin, value);
  }

  getSonarDistance(trigger_pin, echo_pin) {
    const triggerPin = parseInt(trigger_pin);
    const echoPin = parseInt(echo_pin);
    const pinObj = this.board.pins[triggerPin];
    if (pinObj) {
      if (pinObj.report && pinObj.report === 1) {
        return pinObj.value;
      } else {
        console.log('-------new report digital --------');
        this.board.reportSonarData(triggerPin, echoPin);
        return false;
      }
    }
  }

  

  getDHTTemp(digitalPin) {
    const pin = parseInt(digitalPin);
    const pinObj = this.board.pins[pin];
    if (pinObj) {
      if (pinObj.report && pinObj.report === 1) {
        return pinObj.value[1];
      } else {
        console.log('-------new report digital --------');
        this.board.reportDHTData(pin);
        return false;
      }
    }
  }

  getDHTHum(digitalPin) {
    const pin = parseInt(digitalPin);
    const pinObj = this.board.pins[pin];
    if (pinObj) {
      if (pinObj.report && pinObj.report === 1) {
        return pinObj.value[0];
      } else {
        console.log('-------new report digital --------');
        this.board.reportDHTData(pin);
        return false;
      }
    }
  }

  playTone(pwmPin, frequency, duration){
    const pin = parseInt(pwmPin);
    const _frequency = parseInt(frequency);
    const _duration = parseInt(duration);
    const pinv = this.board.pins[pin];
    if (pinv && pinv.mode && pinv.mode != this.board.MODES.TONE) {
      this.board.pinMode(pin, this.board.MODES.TONE);
    }
    this.board.play_tone(pin, _frequency, _duration);
  }

  writeServo(pwmPin, degree){
    const pin = parseInt(pwmPin);
    const _degree = parseInt(degree);
    
    const pinv = this.board.pins[pin];
    if (pinv && pinv.mode && pinv.mode != this.board.MODES.SERVO) {
      this.board.servoConfig(pin, 544, 2400);
    }
    this.board.servoWrite(pin, _degree);
  }

  reset(){
    this.board.reset();
    this.board.pins.forEach(p => {
      if(p && p.report && p.report === 1){
        p.report = 0;
      }
    });
  }

}

export function emulator(runtime, Konva) {
  const arudinoBleEmulator = new ArudinoBleEmulator();
  runtime.on('connecting', (server) => {
    arudinoBleEmulator.connect(server);
  });

  runtime.on('disconnect', () => {
    arudinoBleEmulator.disconnect();
  });
  runtime.on('stop', () => {
    console.log("stop");
    arudinoBleEmulator.reset();
  });

  return arudinoBleEmulator;
}
