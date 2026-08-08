import{addLocalesMessages as x,Text as b}from"@blockcode/core";import{Text as i}from"@blockcode/core";import{jsx as R}from"preact/jsx-runtime";var _=(r,f)=>{if(r.definitions_.include_rfidrc522="#include <MFRC522v2.h>",r.definitions_.include_rfidrc522_i2c="#include <MFRC522DriverI2C.h>",!r.definitions_.variable_rfidrc522_driver)r.definitions_.variable_rfidrc522_driver="MFRC522DriverI2C mfrc522Driver{};";r.definitions_.variable_rfidrc522="MFRC522 mfrc522{mfrc522Driver};",r.definitions_.setup_mfrc522="mfrc522.PCD_Init();";let e="";if(e+=`bool rfidrc522_check() {
`,e+=`  return mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial();
`,e+=`}
`,r.definitions_.declare_rfidrc522_check="bool rfidrc522_check();",r.definitions_.rfidrc522_check=e,f){let s=f?r.statementToCode(f):"",t="";t+=`void rfidrc522_whennewcard() {
`,t+=`  if (!rfidrc522_check()) return;
`,t+=s||"",t+=`  mfrc522.PICC_HaltA();
`,t+=`}
`,r.definitions_.declare_rfidrc522_whennewcard="void rfidrc522_whennewcard();",r.definitions_.rfidrc522_whennewcard=t}},c=(r)=>["@blockcode/gui-arduino","@nulllab/gui-lgtuino"].includes(r.editor),E=(r)=>r.editor==="@emakefun/gui-iotbit",o=(r)=>[c(r)?{id:"eventPolling",text:R(i,{id:"blocks.rfidrc522.eventPolling",defaultMessage:"RFID events polling"}),ino(f){_(this);let e="rfidrc522_whennewcard";if(!this.definitions_[e])this.definitions_[`declare_${e}`]=`void ${e}();`,this.definitions_[e]=`void ${e}() {
}`;return`${e}();
`}}:{id:"init",text:R(i,{id:"blocks.rfidrc522.initI2C",defaultMessage:"set RFID pins SCL:[SCL] SDA:[SDA]"}),inputs:{SCL:r.boardPins?{menu:r.boardPins.out,defaultValue:E(r)?"P19":"2"}:{type:"positive_integer",defaultValue:2},SDA:r.boardPins?{menu:r.boardPins.all,defaultValue:E(r)?"P20":"3"}:{type:"positive_integer",defaultValue:3}},mpy(f,e,a){let s=r.boardPins,t=s?.i2c&&s.i2c.scl===e.SCL&&s.i2c.sda===e.SDA?s.i2c.channel:1,l=`i2c${t}_${e.SCL}_${e.SDA}`;return a.import_pin="from machine import Pin",a.import_i2c="from machine import I2C",a[l]=`${l} = I2C(${t}, scl=Pin(${e.SCL}), sda=Pin(${e.SDA}))`,a.rfid=`rfid = mfrc522.MFRC522(${l})`,""}},"---",{id:"whennewcard",text:R(i,{id:"blocks.rfidrc522.whennewcard",defaultMessage:"when a new card"}),hat:!0,ino(f){return _(this,f),""},mpy(f){if(this.definitions_.rfid_uid='rfid_uid = ""',!this.definitions_.rfidrc522_whennewcard){let t="";t+=`@_tasks__.append
`,t+=`async def rfidrc522_whennewcard():
`,t+=`  global rfid_uid
`,t+=`  while True:
`,t+=`    await asyncio.sleep_ms(5)
`,t+=`    status, data, bits = rfid.scan()
`,t+=`    if status != rfid.MIFARE_OK: continue
`,t+=`    status, uid, bits = rfid.identify()
`,t+=`    if status != rfid.MIFARE_OK: continue
`,t+=`    rfid_uid = "".join(f"{b:02x}" for b in uid[0:4])
`,this.definitions_.rfidrc522_whennewcard=t}let e=this.createName("rfidrc522_flag");this.definitions_[e]=`${e} = asyncio.ThreadSafeFlag()`;let a=this.statementToCode(f)||"",s="";s+=`while True:
`,s+=`  await ${e}.wait()
`,s+=a,a=this.prefixLines(s,this.INDENT),a=this.addEventTrap(a,"rfidrc522_callback"),s=`@_tasks__.append
`,s+=a,this.definitions_[`${e}_callback`]=s,s=`    ${e}.set()
`,this.definitions_.rfidrc522_whennewcard+=s}},{id:"cardid",text:R(i,{id:"blocks.rfidrc522.cardid",defaultMessage:"card id"}),output:"string",ino(f){let e="";return e+=`String getRFIDCardId(bool checked) {
`,e+=`  String rfid_str = "";
`,e+=`  if (checked && mfrc522.uid.size > 0) {
`,e+=`    for (byte i = 0; i < mfrc522.uid.size; i++)
`,e+=`      rfid_str += String(mfrc522.uid.uidByte[i], HEX);
`,e+=`  }
`,e+=`  return rfid_str;
`,e+=`}
`,this.definitions_.declare_getRFIDCardId="String getRFIDCardId(bool checked);",this.definitions_.getRFIDCardId=e,[`getRFIDCardId(${f.getRootBlock().type.endsWith("_whennewcard")?!0:"rfidrc522_check()"})`]},mpy(f){return this.definitions_.rfid_uid='rfid_uid = ""',["rfid_uid"]}}];var n="./assets/mfrc522-f4kjxrnd.py";var I=(r)=>!["@blockcode/gui-arduino","@nulllab/gui-lgtuino"].includes(r.editor),F=(r)=>{if(I(r))return[{header:!0,name:"mfrc522.py",type:"text/x-python",uri:n}];return[]};var d={en:{"blocks.rfidrc522.name":"RFID","blocks.rfidrc522.initI2C":"set RFID pins SCL:[SCL] SDA:[SDA]","blocks.rfidrc522.eventPolling":"RFID events polling","blocks.rfidrc522.whennewcard":"when a new card","blocks.rfidrc522.write":"write data [HEX] to card block [BLOCK]","blocks.rfidrc522.cardid":"card id","blocks.rfidrc522.data":"card data"},"zh-Hans":{"blocks.rfidrc522.name":"RFID 模组","blocks.rfidrc522.initI2C":"初始化 RFID 引脚 SCL:[SCL] SDA:[SDA]","blocks.rfidrc522.eventPolling":"RFID 事件轮询","blocks.rfidrc522.whennewcard":"当感应到卡片时","blocks.rfidrc522.write":"将数据 [HEX] 写入卡片 [BLOCK] 数据块","blocks.rfidrc522.cardid":"卡片 ID","blocks.rfidrc522.data":"卡片数据"},"zh-Hant":{"blocks.rfidrc522.name":"RFID 模組","blocks.rfidrc522.initI2C":"初始化 RFID 引腳 SCL:[SCL] SDA:[SDA]","blocks.rfidrc522.eventPolling":"RFID 事件輪詢","blocks.rfidrc522.whennewcard":"當感應到卡片時","blocks.rfidrc522.write":"將數據 [HEX] 寫入卡片 [BLOCK] 數據塊","blocks.rfidrc522.cardid":"卡片 ID","blocks.rfidrc522.data":"卡片數據"}};var C="./assets/icon-m7baj56j.png";import{jsx as T}from"preact/jsx-runtime";x(d);var y={icon:C,name:T(b,{id:"blocks.rfidrc522.name",defaultMessage:"RFID"}),files:F,blocks:o};export{y as default};
