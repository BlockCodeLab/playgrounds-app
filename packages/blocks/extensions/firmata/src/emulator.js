import { ArduinoBle } from "./arduinoBle";
import { BleSerialPort } from "./ble_serialport";

import { Firmata } from '@blockcode/utils';

class ArudinoBleEmulator{

  constructor(){
    this.arduinoBle = new ArduinoBle();
    this.bleSerialPort = new BleSerialPort(this.arduinoBle);
    this.board = null;
  }
  get key() {
    return 'firmata';
  }
  
  connect(server){
    this.arduinoBle.init(server)
    this.board = new Firmata(this.bleSerialPort);
  }
  disConnect(){
    this.arduinoBle.disConnect();
  }

  flash(){
    this.bleSerialPort.flashHex();
  }
  testConnect(){
    this.arduinoBle.requestPort().then(async () =>{
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.bleSerialPort.flashHex();
    });
    //
  }
  
}


export function emulator(runtime, Konva) {
  const arudinoBleEmulator = new ArudinoBleEmulator();
  runtime.on('connect', (server) =>{
    arudinoBleEmulator.connect(server);
  });

  runtime.on('disConnect', () => {
    arudinoBleEmulator.disConnect();
  })

  return arudinoBleEmulator;
}
