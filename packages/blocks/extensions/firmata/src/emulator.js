import { ArduinoBle } from './arduinoBle';
import { BleSerialPort } from './ble_serialport';

import { Firmata } from '@blockcode/utils';

class ArudinoBleEmulator {
  constructor() {
    this.arduinoBle = new ArduinoBle;
    this.bleSerialPort = new BleSerialPort(this.arduinoBle);
    this.board = null;
  }
  get key() {
    return "firmata";
  }
  async connect(server) {
    this.arduinoBle.init(server);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await this.arduinoBle.sendATMessage("AT+BAUD=3");
    await this.arduinoBle.sendATMessage("AT+BLEUSB=3");
    await this.arduinoBle.sendATMessage("AT+ALL");
    this.board = new Firmata(this.bleSerialPort, { skipCapabilities: true});
    this.board.on("ready", () => {
      console.log("  ✔ ready");
      this.board.queryCapabilities(() => {
        this.board.queryAnalogMapping(() => {
          console.log("queryAnalogMapping");
        });
        console.log("queryCapabilities");
      });
    });
    this.board.on("reportVersionTimeout", () => {
      console.log("timeOut----")
      this.flashAndReInit();
    });
  }

  async flashAndReInit(){

      await this.flash();
      await this.arduinoBle.sendATMessage("AT+BAUD=3");
      await this.arduinoBle.sendATMessage("AT+BLEUSB=3");
      this.board.queryCapabilities(() => {
        this.board.queryAnalogMapping(() => {
          console.log("queryAnalogMapping");
        });
        console.log("queryCapabilities");
      });

  }
  async disconnect() {
    await this.arduinoBle.disconnect();
  }
  async flash() {
    await this.arduinoBle.sendATMessage("AT+BAUD=4");
    await this.bleSerialPort.flashHex();
    
  }
  getAnalogValue(pinV) {
    const pin = parseInt(pinV);
    const pinObj = this.board.pins[this.board.analogPins[pin]];
    console.log(pinObj);
    if (pinObj) {
      if (pinObj.report && pinObj.report === 1) {
        return pinObj.value;
      } else {
        console.log("-------new report analog --------");
        this.board.reportAnalogPin(pin, 1);
        return "0";
      }
    }
  }
  getDigitalValue(pinV) {
    const pin = parseInt(pinV);
    const pinObj = this.board.pins[pin];
    if (pinObj) {
      if (pinObj.report && pinObj.report === 1) {
        return pinObj.value;
      } else {
        console.log("-------new report digital --------");
        this.board.pinMode(pin, this.board.MODES.PULLUP);
        this.board.reportDigitalPin(pin, 1);
        return 0;
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
  getRUS04Distance(digitalPin) {
    const pin = parseInt(digitalPin);
    return new Promise((resolve, reject) => {
      this.board.getRUS04(pin, (e) => {
        console.log("-----aaa---", e);
        this.lastRus04 = e;
        resolve(e);
      });
      setTimeout(() => {
        resolve(this.lastRus04);
      }, 1000);
    });
  }
  getDHTTemp(analogPin) {
    const pin = parseInt(analogPin);
    return new Promise((resolve, reject) => {
      this.board.getDHTTemp(this.board.analogPins[pin], (e) => {
        console.log("-----aaa---", e);
        this.lastDHTTemp = e;
        resolve(e);
      });
      setTimeout(() => {
        resolve(this.lastDHTTemp);
      }, 2000);
    });
  }
  getDHTHum(analogPin) {
    const pin = parseInt(analogPin);
    return new Promise((resolve, reject) => {
      this.board.getDHTHum(this.board.analogPins[pin], (e) => {
        console.log("-----aaa---", e);
        this.lastDHTTemp = e;
        resolve(e);
      });
      setTimeout(() => {
        resolve(this.lastDHTTemp);
      }, 2000);
    });
  }
}

export function emulator(runtime, Konva) {
  const arudinoBleEmulator = new ArudinoBleEmulator();
  runtime.on('connecting', (server) => {
    console.log("onnconetec")
    arudinoBleEmulator.connect(server);
  });

  runtime.on('disconnect', () => {
    arudinoBleEmulator.disconnect();
  });

  return arudinoBleEmulator;
}
