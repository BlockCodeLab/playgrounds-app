import { delAlert } from '@blockcode/core';

export class Arduino {
  constructor() {
    this.board = null;
  }

  get key() {
    return 'firmata';
  }

  connect() {
    this.board.reportVersion(() => {});
    this.board.queryFirmware(() => {});

    this.board.on('ready', () => {
      delAlert('firmata-checking');
      this.board.queryCapabilities(() => {
        this.board.queryAnalogMapping(() => {});
      });
    });

    this.board.on('reportVersionTimeout', async () => {
      delAlert('firmata-checking');
      await this.board.transport.flash();
      this.board.reportVersion(() => {});
      this.board.queryFirmware(() => {});
    });
  }

  getAnalogValue(pinV) {
    const pin = parseInt(pinV);
    const pinObj = this.board.pins[this.board.analogPins[pin]];
    if (pinObj) {
      if (pinObj.report && pinObj.report === 1) {
        return pinObj.value;
      } else {
        this.board.reportAnalogPin(pin, 1);
        return pinObj.value;
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
        this.board.pinMode(pin, this.board.MODES.PULLUP);
        this.board.reportDigitalPin(pin, 1);
        return Boolean(pinObj.value);
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
        this.board.reportDHTData(pin);
        return false;
      }
    }
  }

  playTone(pwmPin, frequency, duration) {
    const pin = parseInt(pwmPin);
    const _frequency = parseInt(frequency);
    const _duration = parseInt(duration);
    const pinv = this.board.pins[pin];
    if (pinv && pinv.mode && pinv.mode != this.board.MODES.TONE) {
      this.board.pinMode(pin, this.board.MODES.TONE);
    }
    this.board.play_tone(pin, _frequency, _duration);
  }

  writeServo(pwmPin, degree) {
    const pin = parseInt(pwmPin);
    const _degree = parseInt(degree);

    const pinv = this.board.pins[pin];
    if (pinv && pinv.mode && pinv.mode != this.board.MODES.SERVO) {
      this.board.servoConfig(pin, 544, 2400);
    }
    this.board.servoWrite(pin, _degree);
  }

  reset() {
    this.board.reset();
    this.board.pins.forEach((p) => {
      if (p && p.report && p.report === 1) {
        p.report = 0;
      }
    });
  }
}
