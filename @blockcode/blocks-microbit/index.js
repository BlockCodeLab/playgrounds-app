import{addLocalesMessages as R,Text as Q}from"@blockcode/core";import{BLE as w}from"@blockcode/core";var N={MICROBIT_V1:1,MICROBIT_V2:2},e={CMD_CONFIG:0,CMD_PIN:1,CMD_DISPLAY:2,CMD_AUDIO:3,CMD_DATA:4},r={SET_OUTPUT:1,SET_PWM:2,SET_SERVO:3,SET_PULL:4,SET_EVENT:5},s={CLEAR:0,TEXT:1,PIXELS_0:2,PIXELS_1:3},L={CONFIG:16,PIN_EVENT:17,ACTION_EVENT:18,DATA_NUMBER:19,DATA_TEXT:20},p={BUTTON:1,GESTURE:2},n={INPUT:"INPUT",OUTPUT:"OUTPUT",PWM:"PWM",SERVO:"SERVO",TOUCH:"TOUCH"},P={1:"A",2:"B",100:"P0",101:"P1",102:"P2",121:"LOGO"},b={P0:0,P1:1,P2:2,A:3,B:4,LOGO:5},O={1:"DOWN",2:"UP",3:"CLICK",4:"LONG_CLICK",5:"HOLD",6:"DOUBLE_CLICK"},H={1:"TILT_UP",2:"TILT_DOWN",3:"TILT_LEFT",4:"TILT_RIGHT",5:"FACE_UP",6:"FACE_DOWN",7:"FREEFALL",8:"G3",9:"G6",10:"G8",11:"SHAKE"},a={NUMBER:1,TEXT:2},h={MIC:1,TOUCH:2},M={STOP_TONE:0,PLAY_TONE:1},G=4500,X="micro:bit extension stopped receiving data",o={ID:"0b50f3e4-607f-4151-9091-7d008d6ffc5c",COMMAND_CH:"0b500100-607f-4151-9091-7d008d6ffc5c",STATE_CH:"0b500101-607f-4151-9091-7d008d6ffc5c",MOTION_CH:"0b500102-607f-4151-9091-7d008d6ffc5c",PIN_EVENT_CH:"0b500110-607f-4151-9091-7d008d6ffc5c",ACTION_EVENT_CH:"0b500111-607f-4151-9091-7d008d6ffc5c",ANALOG_IN_CH:["0b500120-607f-4151-9091-7d008d6ffc5c","0b500121-607f-4151-9091-7d008d6ffc5c","0b500122-607f-4151-9091-7d008d6ffc5c"],MESSAGE_CH:"0b500130-607f-4151-9091-7d008d6ffc5c"},m={X:"x",Y:"y",Z:"z",Absolute:"absolute"},f=1024;class k{constructor(F){if(this.runtime=F,this._ble=null,this.digitalLevel={},this.lightLevel=0,this.temperature=0,this.soundLevel=0,this.pitch=0,this.roll=0,this.acceleration={x:0,y:0,z:0},this.compassHeading=0,this.magneticForce={x:0,y:0,z:0},this.buttonState={},this.buttonEvents={},Object.keys(b).forEach((D)=>{this.buttonEvents[D]={}}),this.gestureEvents={},this._pinEvents={},this.receivedData={},this.analogIn=[0,1,2],this.analogValue=[],this.analogIn.forEach((D)=>{this.analogValue[D]=0}),this.gpio=[0,1,2,8,12,13,14,15,16],this.gpio.forEach((D)=>{this.digitalLevel[D]=0}),this._timeoutID=null,this.bleBusy=!0,this.bleBusyTimeoutID=null,this.onDisconnect=this.onDisconnect.bind(this),this._onConnect=this._onConnect.bind(this),this.onNotify=this.onNotify.bind(this),this.stopTone=this.stopTone.bind(this),this.runtime)this.runtime.on("stop",()=>this.stopTone());this.analogInUpdateInterval=100,this.analogInLastUpdated=[Date.now(),Date.now(),Date.now()],this.sendCommandInterval=30,this.initConfig()}initConfig(){this.config={},this.config.mic=!1,this.config.pinMode={}}startUpdater(){if(this.updater)clearTimeout(this.updater);if(this.bleAccessWaiting){this.updater=setTimeout(()=>this.startUpdater(),0);return}this.updateState().then(()=>this.updateMotion()).finally(()=>{this.updater=setTimeout(()=>this.startUpdater(),this.microbitUpdateInterval)})}stopUpdater(){clearTimeout(this.updater)}displayText(F,D,B){let E=Math.min(18,F.length),C=new Uint8Array(E+1);for(let A=0;A<E;A++)C[A]=F.charCodeAt(A);return this.sendCommandSet([{id:e.CMD_DISPLAY<<5|s.TEXT,message:new Uint8Array([Math.min(255,Math.max(0,D)/10),...C])}],B)}displayPixels(F,D){let B=[{id:e.CMD_DISPLAY<<5|s.PIXELS_0,message:new Uint8Array([...F[0],...F[1],...F[2]])},{id:e.CMD_DISPLAY<<5|s.PIXELS_1,message:new Uint8Array([...F[3],...F[4]])}];return this.sendCommandSet(B,D)}setPullMode(F,D,B){return this.config.pinMode[F]=n.INPUT,this.sendCommandSet([{id:e.CMD_PIN<<5|r.SET_PULL,message:new Uint8Array([F,D])}],B)}setPinOutput(F,D,B){return this.config.pinMode[F]=n.OUTPUT,this.sendCommandSet([{id:e.CMD_PIN<<5|r.SET_OUTPUT,message:new Uint8Array([F,D?1:0])}],B)}setPinPWM(F,D,B){this.config.pinMode[F]=n.PWM;let E=new DataView(new ArrayBuffer(2));return E.setUint16(0,D,!0),this.sendCommandSet([{id:e.CMD_PIN<<5|r.SET_PWM,message:new Uint8Array([F,E.getUint8(0),E.getUint8(1)])}],B)}setPinServo(F,D,B,E,C){if(this.config.pinMode[F]=n.SERVO,!B||B<0)B=0;if(!E||E<0)E=0;let A=new DataView(new ArrayBuffer(6));return A.setUint16(0,D,!0),A.setUint16(2,B,!0),A.setUint16(4,E,!0),this.sendCommandSet([{id:e.CMD_PIN<<5|r.SET_SERVO,message:new Uint8Array([F,A.getUint8(0),A.getUint8(1),A.getUint8(2),A.getUint8(3),A.getUint8(4),A.getUint8(5)])}],C)}readLightLevel(){if(!this.isConnected())return 0;return this.lightLevel}readAnalogIn(F,D){if(!this.isConnected())return Promise.resolve(0);if(Date.now()-this.analogInLastUpdated[F]<this.analogInUpdateInterval)return Promise.resolve(this.analogValue[F]);if(this.bleBusy){if(this.bleAccessWaiting=!0,D)D.yield();return}return this.bleBusy=!0,this.bleBusyTimeoutID=window.setTimeout(()=>{this.bleBusy=!1,this.bleAccessWaiting=!1},1000),new Promise((B)=>this._ble.read(o.ID,o.ANALOG_IN_CH[F],!1).then((E)=>{if(window.clearTimeout(this.bleBusyTimeoutID),this.bleBusy=!1,this.bleAccessWaiting=!1,!E)return B(this.analogValue[F]);let C=E.message,A=new DataView(C.buffer,0);this.analogValue[F]=A.getUint16(0,!0),this.analogInLastUpdated=Date.now(),B(this.analogValue[F])}))}updateState(){if(!this.isConnected())return Promise.resolve(this);if(this.bleBusy)return Promise.resolve(this);return this.bleBusy=!0,this.bleBusyTimeoutID=window.setTimeout(()=>{this.bleBusy=!1},1000),new Promise((F)=>{this._ble.read(o.ID,o.STATE_CH,!1).then((D)=>{if(window.clearTimeout(this.bleBusyTimeoutID),this.bleBusy=!1,!D)return F(this);let B=D.message,E=new DataView(B.buffer,0),C=E.getUint32(0,!0);for(let A=0;A<this.gpio.length;A++)this.digitalLevel[this.gpio[A]]=C>>this.gpio[A]&1;Object.keys(b).forEach((A)=>{this.buttonState[A]=C>>24+b[A]&1}),this.lightLevel=E.getUint8(4),this.temperature=E.getUint8(5)-128,this.soundLevel=E.getUint8(6),this.resetConnectionTimeout(),F(this)})})}readTemperature(){if(!this.isConnected())return 0;return this.temperature}configMic(F,D){if(F=F===!0,!this.isConnected())return Promise.resolve(!1);if(this.config.mic===F)return Promise.resolve(this.config.mic);let B=this.sendCommandSet([{id:e.CMD_CONFIG<<5|h.MIC,message:new Uint8Array([F?1:0])}],D);if(B)return B.then(()=>{return this.config.mic=F,this.config.mic});return}playTone(F,D,B){if(!this.isConnected())return Promise.resolve();let E=new DataView(new ArrayBuffer(4));return E.setUint32(0,Math.round(1e6/F),!0),D=Math.round(D*255/100),this.sendCommandSet([{id:e.CMD_AUDIO<<5|M.PLAY_TONE,message:new Uint8Array([E.getUint8(0),E.getUint8(1),E.getUint8(2),E.getUint8(3),D])}],B)}stopTone(F){if(!this.isConnected())return Promise.resolve();return this.sendCommandSet([{id:e.CMD_AUDIO<<5|M.STOP_TONE,message:new Uint8Array([])}],F)}readSoundLevel(){if(!this.isConnected())return 0;return this.soundLevel}updateMotion(){if(!this.isConnected())return Promise.resolve(this);if(this.bleBusy)return Promise.resolve(this);return this.bleBusy=!0,this.bleBusyTimeoutID=window.setTimeout(()=>{this.bleBusy=!1},1000),new Promise((F)=>{this._ble.read(o.ID,o.MOTION_CH,!1).then((D)=>{if(window.clearTimeout(this.bleBusyTimeoutID),this.bleBusy=!1,!D)return F(this);let B=D.message,E=new DataView(B.buffer,0);this.pitch=Math.round(E.getInt16(0,!0)*180/Math.PI/1000),this.roll=Math.round(E.getInt16(2,!0)*180/Math.PI/1000),this.acceleration.x=1000*E.getInt16(4,!0)/f,this.acceleration.y=1000*E.getInt16(6,!0)/f,this.acceleration.z=1000*E.getInt16(8,!0)/f,this.compassHeading=E.getUint16(10,!0),this.magneticForce.x=E.getInt16(12,!0),this.magneticForce.y=E.getInt16(14,!0),this.magneticForce.z=E.getInt16(16,!0),this.resetConnectionTimeout(),F(this)})})}readPitch(){if(!this.isConnected())return 0;return this.pitch}readRoll(){if(!this.isConnected())return 0;return this.roll}readAcceleration(F){if(!this.isConnected())return 0;if(F===m.Absolute)return Math.round(Math.sqrt(this.acceleration.x**2+this.acceleration.y**2+this.acceleration.z**2));return this.acceleration[F]}readCompassHeading(){if(!this.isConnected())return 0;return this.compassHeading}readMagneticForce(F){if(!this.isConnected())return 0;if(F===m.Absolute)return Math.round(Math.sqrt(this.magneticForce.x**2+this.magneticForce.y**2+this.magneticForce.z**2));return this.magneticForce[F]}connect(F){this._ble=new w(F),this._onConnect()}disconnect(){if(this._ble)this._ble.disconnect(),this._ble=null;this.onDisconnect()}onDisconnect(){if(this.stopUpdater(),this._timeoutID)window.clearTimeout(this._timeoutID),this._timeoutID=null}isConnected(){let F=!1;if(this._ble)F=this._ble.isConnected();return F}sendCommand(F){let D=new Uint8Array([F.id,...F.message]);return new Promise((B)=>{this._ble.write(o.ID,o.COMMAND_CH,D,null,!1),setTimeout(()=>B(),this.sendCommandInterval)})}sendCommandSet(F,D){if(!this.isConnected())return Promise.resolve();if(this.bleBusy){if(this.bleAccessWaiting=!0,D)D.yield();else setTimeout(()=>this.sendCommandSet(F,D),1);return}return this.bleBusy=!0,this.bleBusyTimeoutID=window.setTimeout(()=>{this.bleBusy=!1,this.bleAccessWaiting=!1},1000),new Promise((B)=>{F.reduce((E,C)=>E.then(()=>this.sendCommand(C)),Promise.resolve()).then(()=>{window.clearTimeout(this.bleBusyTimeoutID)}).catch((E)=>{this._ble.handleDisconnectError(E)}).finally(()=>{this.bleBusy=!1,this.bleAccessWaiting=!1,B()})})}_onConnect(){this._ble.read(o.ID,o.COMMAND_CH,!1).then((F)=>{if(!F)throw new Error("Config is not readable");let D=F.message,B=new DataView(D.buffer,0);if(this.hardware=B.getUint8(0),this.protocol=B.getUint8(1),this.route=B.getUint8(2),this._ble.startNotifications(o.ID,o.ACTION_EVENT_CH,this.onNotify),this._ble.startNotifications(o.ID,o.PIN_EVENT_CH,this.onNotify),this.hardware===N.MICROBIT_V1)this.microbitUpdateInterval=100;else this._ble.startNotifications(o.ID,o.MESSAGE_CH,this.onNotify),this.microbitUpdateInterval=50;this.sendCommandInterval=30,this.initConfig(),this.bleBusy=!1,this.startUpdater(),this.resetConnectionTimeout()}).catch((F)=>this._ble.handleDisconnectError(F))}onNotify(F){let D=F,B=new DataView(D.buffer,0),E=B.getUint8(19);if(E===L.ACTION_EVENT){let C=B.getUint8(0);if(C===p.BUTTON){let A=P[B.getUint16(1,!0)],c=O[B.getUint8(3)];this.buttonEvents[A][c]=B.getUint32(4,!0)}else if(C===p.GESTURE){let A=H[B.getUint8(1)];this.gestureEvents[A]=B.getUint32(2,!0)}}else if(E===L.PIN_EVENT){let C=B.getUint8(0);if(!this._pinEvents[C])this._pinEvents[C]={};let A=B.getUint8(1);this._pinEvents[C][A]={value:B.getUint32(2,!0),timestamp:Date.now()}}else if(E===L.DATA_NUMBER){let C=new TextDecoder().decode(D.slice(0,8).filter((A)=>A!==0));this.receivedData[C]={content:B.getFloat32(8,!0),timestamp:Date.now()}}else if(E===L.DATA_TEXT){let C=new TextDecoder().decode(D.slice(0,8).filter((A)=>A!==0));this.receivedData[C]={content:new TextDecoder().decode(D.slice(8,20).filter((A)=>A!==0)),timestamp:Date.now()}}this.resetConnectionTimeout()}resetConnectionTimeout(){if(this._timeoutID)window.clearTimeout(this._timeoutID);this._timeoutID=window.setTimeout(()=>this._ble.handleDisconnectError(X),G)}isPinHigh(F){return this.readDigitalLevel(F)===1}readDigitalLevel(F){if(!this.isConnected())return 0;return this.digitalLevel[F]}isButtonPressed(F){if(!this.isConnected())return!1;return this.buttonState[F]===1}isPinTouchMode(F){return this.config.pinMode[F]===n.TOUCH}configTouchPin(F,D){if(!this.isConnected())return Promise.resolve();if(this.isPinTouchMode(F))return Promise.resolve();let B=this.sendCommandSet([{id:e.CMD_CONFIG<<5|h.TOUCH,message:new Uint8Array([F,1])}],D);if(B)return B.then(()=>{this.config.pinMode[F]=n.TOUCH});return}isTouched(F){if(!this.isConnected())return!1;return this.buttonState[F]===1}getButtonEventTimestamp(F,D){if(this.buttonEvents[F]&&this.buttonEvents[F][D])return this.buttonEvents[F][D];return null}getGestureEventTimestamp(F){if(this.gestureEvents[F])return this.gestureEvents[F];return null}getPinEventValue(F,D){if(this._pinEvents[F]&&this._pinEvents[F][D])return this._pinEvents[F][D].value;return null}getPinEventTimestamp(F,D){if(this._pinEvents[F]&&this._pinEvents[F][D])return this._pinEvents[F][D].timestamp;return null}listenPinEventType(F,D,B){return this.sendCommandSet([{id:e.CMD_PIN<<5|r.SET_EVENT,message:new Uint8Array([F,D])}],B)}sendData(F,D,B){let E=new Array(8).fill().map((t,v)=>F.charCodeAt(v)),C=Number(D),A,c;if(Number.isNaN(C))c=a.TEXT,A=D.split("").map((t)=>t.charCodeAt(0)).slice(0,11);else{c=a.NUMBER;let t=new DataView(new ArrayBuffer(4));t.setFloat32(0,C,!0),A=[t.getUint8(0),t.getUint8(1),t.getUint8(2),t.getUint8(3)]}return this.sendCommandSet([{id:e.CMD_DATA<<5|c,message:new Uint8Array([...E,...A])}],B)}getDataLabeled(F){if(this.receivedData[F])return this.receivedData[F].content;return null}getDataTimestamp(F){if(this.receivedData[F])return this.receivedData[F].timestamp;return null}}class u{constructor(F){this._microbit=F}get key(){return"microbit"}get microbit(){return this._microbit}displayText(F,D){return this.microbit.displayText(`${F}`,D)}}function d(F){let D=new k(F),B=new u(D);return F.on("connecting",(E)=>{D.connect(E)}),F.on("disconnect",()=>{D.disconnect()}),B}import{Text as l}from"@blockcode/core";var y="./assets/mbit-more-0.2.5-1qdb0eej.hex";import{jsx as i}from"preact/jsx-runtime";var Z=[{button:"DOWNLOAD_HEX",text:i(l,{id:"blocks.microbit.download",defaultMessage:"Download mbit-more program"}),onClick(){let F=document.createElement("a");F.setAttribute("href",y),F.setAttribute("download","mbit-more-0.2.5.hex"),F.click()}},"---",{id:"whenButtonPressed",hat:!0,text:i(l,{id:"blocks.microbit.whenButtonEvent",defaultMessage:"when button [NAME] is [EVENT]"}),inputs:{NAME:{menu:"buttons",defaultValue:"a"},EVENT:{menu:"buttonEvents",defaultValue:"down"}},emu(F){}},"---",{id:"displayText",text:i(l,{id:"blocks.microbit.displayText",defaultMessage:"display text [TEXT] delay [DELAY] ms"}),inputs:{TEXT:{type:"string",defaultValue:"Hello!"},DELAY:{type:"number",defaultValue:120}},emu(F){let D="";if(this.STATEMENT_PREFIX)D+=this.injectId(this.STATEMENT_PREFIX,F);let B=this.valueToCode(F,"TEXT",this.ORDER_NONE)||'""',E=this.valueToCode(F,"DELAY",this.ORDER_NONE)||"0";return D+=`runtime.extensions.microbit.displayText(${B}, ${E});
`,D}},{id:"displayClear",text:i(l,{id:"blocks.microbit.clearDisplay",defaultMessage:"clear display"}),emu(F){let D="";if(this.STATEMENT_PREFIX)D+=this.injectId(this.STATEMENT_PREFIX,F);return D}}],z={buttons:{inputMode:!0,type:"string",items:[[i(l,{id:"blocks.microbit.buttonIDMenu.a",defaultMessage:"A"}),"a"],[i(l,{id:"blocks.microbit.buttonIDMenu.b",defaultMessage:"B"}),"b"],[i(l,{id:"blocks.microbit.buttonIDMenu.any",defaultMessage:"any"}),"any"]]},buttonEvents:{type:"string",items:[[i(l,{id:"blocks.microbit.buttonEventMenu.down",defaultMessage:"down"}),,"down"],[i(l,{id:"blocks.microbit.buttonEventMenu.up",defaultMessage:"up"}),,"up"],[i(l,{id:"blocks.microbit.buttonEventMenu.click",defaultMessage:"click"}),"click"]]}};var g={en:{"blocks.microbit.name":"micro:bit","blocks.microbit.download":"Download mbit-more program","blocks.microbit.gesturesMenu.tiltUp":"tilt up","blocks.microbit.gesturesMenu.tiltDown":"tilt down","blocks.microbit.gesturesMenu.tiltLeft":"tilt left","blocks.microbit.gesturesMenu.tiltRight":"tilt right","blocks.microbit.gesturesMenu.faceUp":"face up","blocks.microbit.gesturesMenu.faceDown":"face down","blocks.microbit.gesturesMenu.freefall":"freefall","blocks.microbit.gesturesMenu.g3":"3G","blocks.microbit.gesturesMenu.g6":"6G","blocks.microbit.gesturesMenu.g8":"8G","blocks.microbit.gesturesMenu.shake":"shake","blocks.microbit.buttonIDMenu.a":"A","blocks.microbit.buttonIDMenu.b":"B","blocks.microbit.buttonIDMenu.any":"any","blocks.microbit.buttonEventMenu.down":"down","blocks.microbit.buttonEventMenu.up":"up","blocks.microbit.buttonEventMenu.click":"click","blocks.microbit.touchIDMenu.logo":"LOGO","blocks.microbit.touchEventMenu.touched":"touched","blocks.microbit.touchEventMenu.released":"released","blocks.microbit.touchEventMenu.tapped":"tapped","blocks.microbit.digitalValueMenu.Low":"low","blocks.microbit.digitalValueMenu.High":"high","blocks.microbit.axisMenu.x":"x","blocks.microbit.axisMenu.y":"y","blocks.microbit.axisMenu.z":"z","blocks.microbit.axisMenu.absolute":"absolute","blocks.microbit.pinModeMenu.pullNone":"pull none","blocks.microbit.pinModeMenu.pullUp":"pull up","blocks.microbit.pinModeMenu.pullDown":"pull down","blocks.microbit.pinEventMenu.pulseLow":"low pulse","blocks.microbit.pinEventMenu.pulseHigh":"high pulse","blocks.microbit.pinEventMenu.fall":"fall","blocks.microbit.pinEventMenu.rise":"rise","blocks.microbit.pinEventTimestampMenu.pulseLow":"low pulse","blocks.microbit.pinEventTimestampMenu.pulseHigh":"high pulse","blocks.microbit.pinEventTimestampMenu.fall":"fall","blocks.microbit.pinEventTimestampMenu.rise":"rise","blocks.microbit.pinEventTypeMenu.none":"none","blocks.microbit.pinEventTypeMenu.pulse":"pulse","blocks.microbit.pinEventTypeMenu.edge":"edge","blocks.microbit.connectionStateMenu.connected":"connected","blocks.microbit.connectionStateMenu.disconnected":"disconnected","blocks.microbit.whenConnectionChanged":"when micro:bit [STATE]","blocks.microbit.whenButtonEvent":"when button [NAME] is [EVENT]","blocks.microbit.isButtonPressed":"button [NAME] pressed?","blocks.microbit.whenTouchEvent":"when pin [NAME] is [EVENT]","blocks.microbit.isPinTouched":"pin [NAME] is touched?","blocks.microbit.whenGesture":"when [GESTURE]","blocks.microbit.displayMatrix":"display pattern [MATRIX]","blocks.microbit.displayText":"display text [TEXT] delay [DELAY] ms","blocks.microbit.clearDisplay":"clear display","blocks.microbit.lightLevel":"light intensity","blocks.microbit.temperature":"temperature","blocks.microbit.compassHeading":"angle with the north","blocks.microbit.pitch":"pitch","blocks.microbit.roll":"roll","blocks.microbit.soundLevel":"sound level","blocks.microbit.magneticForce":"magnetic force","blocks.microbit.acceleration":"acceleration [AXIS]","blocks.microbit.analogValue":"analog value of pin [PIN]","blocks.microbit.setPullMode":"set pin [PIN] to input [MODE]","blocks.microbit.isPinHigh":"[PIN] pin is high?","blocks.microbit.setDigitalOut":"set [PIN] digital [LEVEL]","blocks.microbit.setAnalogOut":"set [PIN] analog [LEVEL] %","blocks.microbit.setServo":"set [PIN] servo angle [ANGLE]","blocks.microbit.playTone":"play tone [FREQ] Hz volume [VOL] %","blocks.microbit.stopTone":"stop tone","blocks.microbit.listenPinEventType":"listen [EVENT_TYPE] event on [PIN]","blocks.microbit.whenPinEvent":"when catch [EVENT] at pin [PIN]","blocks.microbit.getPinEventValue":"value of [EVENT] at [PIN]","blocks.microbit.whenDataReceived":"when data with label [LABEL] received from micro:bit","blocks.microbit.getDataLabeled":"data of label [LABEL]","blocks.microbit.sendData":"send data [DATA] with label [LABEL] to micro:bit","blocks.microbit.sendData.label":"label","blocks.microbit.sendData.data":"data"},"zh-Hans":{"blocks.microbit.name":"micro:bit","blocks.microbit.download":"下载 mbit-more 控制程序","blocks.microbit.gesturesMenu.tiltUp":"向前倾斜","blocks.microbit.gesturesMenu.tiltDown":"向后倾斜","blocks.microbit.gesturesMenu.tiltLeft":"向左倾斜","blocks.microbit.gesturesMenu.tiltRight":"向右倾斜","blocks.microbit.gesturesMenu.faceUp":"面朝上","blocks.microbit.gesturesMenu.faceDown":"面朝下","blocks.microbit.gesturesMenu.freefall":"自由坠落","blocks.microbit.gesturesMenu.g3":"3G 加速度","blocks.microbit.gesturesMenu.g6":"6G 加速度","blocks.microbit.gesturesMenu.g8":"8G 加速度","blocks.microbit.gesturesMenu.shake":"摇晃","blocks.microbit.buttonIDMenu.a":"A","blocks.microbit.buttonIDMenu.b":"B","blocks.microbit.buttonIDMenu.any":"任意","blocks.microbit.buttonEventMenu.down":"按下","blocks.microbit.buttonEventMenu.up":"松开","blocks.microbit.buttonEventMenu.click":"点击","blocks.microbit.touchIDMenu.logo":"徽标","blocks.microbit.touchEventMenu.touched":"触摸","blocks.microbit.touchEventMenu.released":"松开","blocks.microbit.touchEventMenu.tapped":"点击","blocks.microbit.digitalValueMenu.Low":"低电平","blocks.microbit.digitalValueMenu.High":"高电平","blocks.microbit.axisMenu.x":"x","blocks.microbit.axisMenu.y":"y","blocks.microbit.axisMenu.z":"z","blocks.microbit.axisMenu.absolute":"绝对","blocks.microbit.pinModeMenu.pullNone":"无","blocks.microbit.pinModeMenu.pullUp":"拉高","blocks.microbit.pinModeMenu.pullDown":"拉低","blocks.microbit.pinEventMenu.pulseLow":"低频脉冲","blocks.microbit.pinEventMenu.pulseHigh":"高频脉冲","blocks.microbit.pinEventMenu.fall":"电平下降","blocks.microbit.pinEventMenu.rise":"电平上升","blocks.microbit.pinEventTimestampMenu.pulseLow":"低频脉冲","blocks.microbit.pinEventTimestampMenu.pulseHigh":"高频脉冲","blocks.microbit.pinEventTimestampMenu.fall":"电平下降","blocks.microbit.pinEventTimestampMenu.rise":"电平上升","blocks.microbit.pinEventTypeMenu.none":"无","blocks.microbit.pinEventTypeMenu.pulse":"脉冲","blocks.microbit.pinEventTypeMenu.edge":"电平","blocks.microbit.connectionStateMenu.connected":"连接","blocks.microbit.connectionStateMenu.disconnected":"断开","blocks.microbit.whenConnectionChanged":"当 micro:bit [STATE]","blocks.microbit.whenButtonEvent":"当按钮 [NAME] 被 [EVENT]","blocks.microbit.isButtonPressed":"按钮 [NAME] 按下?","blocks.microbit.whenTouchEvent":"当引脚 [NAME] 被 [EVENT]","blocks.microbit.isPinTouched":"引脚 [NAME] 被触摸?","blocks.microbit.whenGesture":"当 [GESTURE] 时","blocks.microbit.displayMatrix":"显示图案 [MATRIX]","blocks.microbit.displayText":"显示文本 [TEXT] 延时 [DELAY] ms","blocks.microbit.clearDisplay":"清空屏幕","blocks.microbit.lightLevel":"亮度级别","blocks.microbit.temperature":"温度","blocks.microbit.compassHeading":"指南针面向","blocks.microbit.pitch":"旋转","blocks.microbit.roll":"横滚","blocks.microbit.soundLevel":"声音响度","blocks.microbit.magneticForce":"磁力","blocks.microbit.acceleration":"加速度 [AXIS]","blocks.microbit.analogValue":"引脚 [PIN] 模拟值","blocks.microbit.setPullMode":"将引脚 [PIN] 输入模式设为 [MODE]","blocks.microbit.isPinHigh":"引脚 [PIN] 是高电平?","blocks.microbit.setDigitalOut":"将引脚 [PIN] 数字值设为 [LEVEL]","blocks.microbit.setAnalogOut":"将引脚 [PIN] 模拟值设为 [LEVEL] %","blocks.microbit.setServo":"将引脚 [PIN] 舵机角度设为 [ANGLE]","blocks.microbit.playTone":"播放 [FREQ] Hz 音频并将音量设为 [VOL] %","blocks.microbit.stopTone":"停止音频","blocks.microbit.listenPinEventType":"监听引脚 [PIN] 事件 [EVENT_TYPE]","blocks.microbit.whenPinEvent":"当引脚 [PIN] 发生 [EVENT] 事件","blocks.microbit.getPinEventValue":"引脚 [PIN] 的 [EVENT] 值","blocks.microbit.whenDataReceived":"当从 micro:bit 接收到主题为 [LABEL] 的消息","blocks.microbit.getDataLabeled":"主题为 [LABEL] 的消息内容","blocks.microbit.sendData":"广播主题为 [LABEL] 的消息 [DATA] 给 micro:bit","blocks.microbit.sendData.label":"主题","blocks.microbit.sendData.data":"数据"},"zh-Hant":{"blocks.microbit.name":"micro:bit","blocks.microbit.download":"下載 mbit-more 控制程序","blocks.microbit.gesturesMenu.tiltUp":"向前傾斜","blocks.microbit.gesturesMenu.tiltDown":"向後傾斜","blocks.microbit.gesturesMenu.tiltLeft":"向左傾斜","blocks.microbit.gesturesMenu.tiltRight":"向右傾斜","blocks.microbit.gesturesMenu.faceUp":"面朝上","blocks.microbit.gesturesMenu.faceDown":"面朝下","blocks.microbit.gesturesMenu.freefall":"自由墜落","blocks.microbit.gesturesMenu.g3":"3G 加速度","blocks.microbit.gesturesMenu.g6":"6G 加速度","blocks.microbit.gesturesMenu.g8":"8G 加速度","blocks.microbit.gesturesMenu.shake":"搖晃","blocks.microbit.buttonIDMenu.a":"A","blocks.microbit.buttonIDMenu.b":"B","blocks.microbit.buttonIDMenu.any":"任意","blocks.microbit.buttonEventMenu.down":"按下","blocks.microbit.buttonEventMenu.up":"鬆開","blocks.microbit.buttonEventMenu.click":"點擊","blocks.microbit.touchIDMenu.logo":"徽標","blocks.microbit.touchEventMenu.touched":"觸摸","blocks.microbit.touchEventMenu.released":"鬆開","blocks.microbit.touchEventMenu.tapped":"點擊","blocks.microbit.digitalValueMenu.Low":"低電平","blocks.microbit.digitalValueMenu.High":"高電平","blocks.microbit.axisMenu.x":"x","blocks.microbit.axisMenu.y":"y","blocks.microbit.axisMenu.z":"z","blocks.microbit.axisMenu.absolute":"絕對","blocks.microbit.pinModeMenu.pullNone":"無","blocks.microbit.pinModeMenu.pullUp":"拉高","blocks.microbit.pinModeMenu.pullDown":"拉低","blocks.microbit.pinEventMenu.pulseLow":"低頻脈衝","blocks.microbit.pinEventMenu.pulseHigh":"高頻脈衝","blocks.microbit.pinEventMenu.fall":"電平下降","blocks.microbit.pinEventMenu.rise":"電平上升","blocks.microbit.pinEventTimestampMenu.pulseLow":"低頻脈衝","blocks.microbit.pinEventTimestampMenu.pulseHigh":"高頻脈衝","blocks.microbit.pinEventTimestampMenu.fall":"電平下降","blocks.microbit.pinEventTimestampMenu.rise":"電平上升","blocks.microbit.pinEventTypeMenu.none":"無","blocks.microbit.pinEventTypeMenu.pulse":"脈衝","blocks.microbit.pinEventTypeMenu.edge":"邊緣","blocks.microbit.connectionStateMenu.connected":"連接","blocks.microbit.connectionStateMenu.disconnected":"斷開","blocks.microbit.whenConnectionChanged":"當 micro:bit [STATE]","blocks.microbit.whenButtonEvent":"當按鈕 [NAME] 被 [EVENT]","blocks.microbit.isButtonPressed":"按鈕 [NAME] 按下?","blocks.microbit.whenTouchEvent":"當引腳 [NAME] 被 [EVENT]","blocks.microbit.isPinTouched":"引腳 [NAME] 被觸摸?","blocks.microbit.whenGesture":"當 [GESTURE] 時","blocks.microbit.displayMatrix":"顯示圖案 [MATRIX]","blocks.microbit.displayText":"顯示文本 [TEXT] 延時 [DELAY] ms","blocks.microbit.clearDisplay":"清空屏幕","blocks.microbit.lightLevel":"亮度級別","blocks.microbit.temperature":"溫度","blocks.microbit.compassHeading":"指南針面向","blocks.microbit.pitch":"旋轉","blocks.microbit.roll":"橫滾","blocks.microbit.soundLevel":"聲音響度","blocks.microbit.magneticForce":"磁力","blocks.microbit.acceleration":"加速度 [AXIS]","blocks.microbit.analogValue":"引腳 [PIN] 模擬值","blocks.microbit.setPullMode":"將引腳 [PIN] 輸入模式設為 [MODE]","blocks.microbit.isPinHigh":"引腳 [PIN] 是高電平?","blocks.microbit.setDigitalOut":"將引腳 [PIN] 數字值設為 [LEVEL]","blocks.microbit.setAnalogOut":"將引腳 [PIN] 模擬值設為 [LEVEL] %","blocks.microbit.setServo":"將引腳 [PIN] 舵機角度設為 [ANGLE]","blocks.microbit.playTone":"播放 [FREQ] Hz 音頻並將音量設為 [VOL] %","blocks.microbit.stopTone":"停止音頻","blocks.microbit.listenPinEventType":"監聽引腳 [PIN] 事件 [EVENT_TYPE]","blocks.microbit.whenPinEvent":"當引腳 [PIN] 發生 [EVENT] 事件","blocks.microbit.getPinEventValue":"引腳 [PIN] 的 [EVENT] 值","blocks.microbit.whenDataReceived":"當從 micro:bit 接收到主題為 [LABEL] 的消息","blocks.microbit.getDataLabeled":"主題為 [LABEL] 的消息內容","blocks.microbit.sendData":"廣播主題為 [LABEL] 的消息 [DATA] 給 micro:bit","blocks.microbit.sendData.label":"主題","blocks.microbit.sendData.data":"數據"}};var T="./assets/icon-rw1tpqy1.svg";import{jsx as $}from"preact/jsx-runtime";R(g);var i0={icon:T,name:$(Q,{id:"blocks.microbit.name",defaultMessage:"micro:bit"}),statusButton:{connectionOptions:{bluetooth:{filters:[{namePrefix:"BBC micro:bit"},{services:[o.ID]}]}}},emulator:d,blocks:Z,menus:z};export{i0 as default};
