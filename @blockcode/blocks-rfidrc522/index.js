import{addLocalesMessages as A,Text as h}from"@blockcode/core";import{Text as f}from"@blockcode/core";import{jsx as n}from"preact/jsx-runtime";var d=(r,a)=>{if(r.definitions_.include_rfidrc522="#include <MFRC522v2.h>",r.definitions_.include_rfidrc522_i2c="#include <MFRC522DriverI2C.h>",!r.definitions_.variable_rfidrc522_driver)r.definitions_.variable_rfidrc522_driver="MFRC522DriverI2C mfrc522Driver{};";r.definitions_.variable_rfidrc522="MFRC522 mfrc522{mfrc522Driver};",r.definitions_.setup_mfrc522="mfrc522.PCD_Init();";let e="";if(e+=`bool rfidrc522_check() {
`,e+=`  return mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial();
`,e+=`}
`,r.definitions_.declare_rfidrc522_check="bool rfidrc522_check();",r.definitions_.rfidrc522_check=e,a){let i=a?r.statementToCode(a):"",t="";t+=`void rfidrc522_whennewcard() {
`,t+=`  if (!rfidrc522_check()) return;
`,t+=i||"",t+=`  mfrc522.PICC_HaltA();
`,t+=`}
`,r.definitions_.declare_rfidrc522_whennewcard="void rfidrc522_whennewcard();",r.definitions_.rfidrc522_whennewcard=t}},I=(r)=>["@blockcode/gui-arduino","@nulllab/gui-lgtuino"].includes(r.editor),o=(r)=>r.editor==="@emakefun/gui-iotbit",c=(r)=>r.boardType==="ESP32_IOT_BOARD",R=(r)=>[I(r)?{id:"eventPolling",text:n(f,{id:"blocks.rfidrc522.eventPolling",defaultMessage:"RFID events polling"}),ino(a){d(this);let e="rfidrc522_whennewcard";if(!this.definitions_[e])this.definitions_[`declare_${e}`]=`void ${e}();`,this.definitions_[e]=`void ${e}() {
}`;return`${e}();
`}}:{id:"init",text:n(f,{id:"blocks.rfidrc522.initI2C",defaultMessage:"set RFID pins SCL:[SCL] SDA:[SDA]"}),inputs:{SCL:r.boardPins?{menu:r.boardPins.out,defaultValue:o(r)?"P19":c(r)?"22":"2"}:{type:"positive_integer",defaultValue:2},SDA:r.boardPins?{menu:r.boardPins.all,defaultValue:o(r)?"P20":c(r)?"21":"3"}:{type:"positive_integer",defaultValue:3}},mpy(a,e,s){let i=r.boardPins,t=i?.i2c&&i.i2c.scl===e.SCL&&i.i2c.sda===e.SDA?i.i2c.channel:1,l=`i2c${t}_${e.SCL}_${e.SDA}`;return s.import_pin="from machine import Pin",s.import_i2c="from machine import I2C",s[l]=`${l} = I2C(${t}, scl=Pin(${e.SCL}), sda=Pin(${e.SDA}))`,s.rfid=`rfid = mfrc522.MFRC522(${l})`,""}},"---",{id:"whennewcard",text:n(f,{id:"blocks.rfidrc522.whennewcard",defaultMessage:"when a new card"}),hat:!0,ino(a){return d(this,a),""},mpy(a){if(this.definitions_.rfid_uid='rfid_uid = ""',!this.definitions_.rfidrc522_whennewcard){let t="";t+=`@_tasks__.append
`,t+=`async def rfidrc522_whennewcard():
`,t+=`  global rfid_uid
`,t+=`  while True:
`,t+=`    await asyncio.sleep_ms(5)
`,t+=`    status, data, bits = rfid.scan()
`,t+=`    if status != rfid.MIFARE_OK: continue
`,t+=`    status, uid, bits = rfid.identify()
`,t+=`    if status != rfid.MIFARE_OK: continue
`,t+=`    rfid_uid = "".join(f"{b:02x}" for b in uid[0:4])
`,this.definitions_.rfidrc522_whennewcard=t}let e=this.createName("rfidrc522_flag");this.definitions_[e]=`${e} = asyncio.ThreadSafeFlag()`;let s=this.statementToCode(a)||"",i="";i+=`while True:
`,i+=`  await ${e}.wait()
`,i+=s,s=this.prefixLines(i,this.INDENT),s=this.addEventTrap(s,"rfidrc522_callback"),i=`@_tasks__.append
`,i+=s,this.definitions_[`${e}_callback`]=i,i=`    ${e}.set()
`,this.definitions_.rfidrc522_whennewcard+=i}},{id:"cardid",text:n(f,{id:"blocks.rfidrc522.cardid",defaultMessage:"card id"}),output:"string",ino(a){let e="";return e+=`String getRFIDCardId(bool checked) {
`,e+=`  String rfid_str = "";
`,e+=`  if (checked && mfrc522.uid.size > 0) {
`,e+=`    for (byte i = 0; i < mfrc522.uid.size; i++)
`,e+=`      rfid_str += String(mfrc522.uid.uidByte[i], HEX);
`,e+=`  }
`,e+=`  return rfid_str;
`,e+=`}
`,this.definitions_.declare_getRFIDCardId="String getRFIDCardId(bool checked);",this.definitions_.getRFIDCardId=e,[`getRFIDCardId(${a.getRootBlock().type.endsWith("_whennewcard")?!0:"rfidrc522_check()"})`]},mpy(a){return this.definitions_.rfid_uid='rfid_uid = ""',["rfid_uid"]}}];var _="./assets/mfrc522-f4kjxrnd.py";var M=(r)=>!["@blockcode/gui-arduino","@nulllab/gui-lgtuino"].includes(r.editor),u=(r)=>{if(M(r))return[{header:!0,name:"mfrc522.py",type:"text/x-python",uri:_}];return[]};var C={en:{"blocks.rfidrc522.name":"RFID","blocks.rfidrc522.initI2C":"set RFID pins SCL:[SCL] SDA:[SDA]","blocks.rfidrc522.eventPolling":"RFID events polling","blocks.rfidrc522.whennewcard":"when a new card","blocks.rfidrc522.write":"write data [HEX] to card block [BLOCK]","blocks.rfidrc522.cardid":"card id","blocks.rfidrc522.data":"card data"},"zh-Hans":{"blocks.rfidrc522.name":"RFID 模组","blocks.rfidrc522.initI2C":"初始化 RFID 引脚 SCL:[SCL] SDA:[SDA]","blocks.rfidrc522.eventPolling":"RFID 事件轮询","blocks.rfidrc522.whennewcard":"当感应到卡片时","blocks.rfidrc522.write":"将数据 [HEX] 写入卡片 [BLOCK] 数据块","blocks.rfidrc522.cardid":"卡片 ID","blocks.rfidrc522.data":"卡片数据"},"zh-Hant":{"blocks.rfidrc522.name":"RFID 模組","blocks.rfidrc522.initI2C":"初始化 RFID 引腳 SCL:[SCL] SDA:[SDA]","blocks.rfidrc522.eventPolling":"RFID 事件輪詢","blocks.rfidrc522.whennewcard":"當感應到卡片時","blocks.rfidrc522.write":"將數據 [HEX] 寫入卡片 [BLOCK] 數據塊","blocks.rfidrc522.cardid":"卡片 ID","blocks.rfidrc522.data":"卡片數據"}};var E="./assets/icon-m7baj56j.png";import{jsx as x}from"preact/jsx-runtime";A(C);var y={icon:E,name:x(h,{id:"blocks.rfidrc522.name",defaultMessage:"RFID"}),files:u,blocks:R};export{y as default};
