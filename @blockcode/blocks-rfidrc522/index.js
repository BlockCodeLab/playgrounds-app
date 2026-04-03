import{addLocalesMessages as M,Text as I}from"@blockcode/core";import{Text as i}from"@blockcode/core";import{jsx as R}from"preact/jsx-runtime";var l=(r,t)=>{if(r.definitions_.include_rfidrc522="#include <MFRC522v2.h>",r.definitions_.include_rfidrc522_i2c="#include <MFRC522DriverI2C.h>",!r.definitions_.variable_rfidrc522_driver)r.definitions_.variable_rfidrc522_driver="MFRC522DriverI2C mfrc522Driver{};";r.definitions_.variable_rfidrc522="MFRC522 mfrc522{mfrc522Driver};",r.definitions_.setup_mfrc522="mfrc522.PCD_Init();";let e="";if(e+=`bool rfidrc522_check() {
`,e+=`  return mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial();
`,e+=`}
`,r.definitions_.declare_rfidrc522_check="bool rfidrc522_check();",r.definitions_.rfidrc522_check=e,t){let f=t?r.statementToCode(t):"",s="";s+=`void rfidrc522_whennewcard() {
`,s+=`  if (!rfidrc522_check()) return;
`,s+=f||"",s+=`  mfrc522.PICC_HaltA();
`,s+=`}
`,r.definitions_.declare_rfidrc522_whennewcard="void rfidrc522_whennewcard();",r.definitions_.rfidrc522_whennewcard=s}},_=(r)=>[r.editor==="@blockcode/gui-arduino"?{id:"eventPolling",text:R(i,{id:"blocks.rfidrc522.eventPolling",defaultMessage:"RFID events polling"}),ino(t){return l(this),`rfidrc522_whennewcard();
`}}:{id:"init",text:R(i,{id:"blocks.rfidrc522.initI2C",defaultMessage:"set pins SCL:[SCL] SDA:[SDA]"}),inputs:{SCL:r.boardPins?{menu:r.boardPins.out}:{type:"positive_integer",defaultValue:2},SDA:r.boardPins?{menu:r.boardPins.out}:{type:"positive_integer",defaultValue:3}},mpy(t){let e=r.boardPins?t.getFieldValue("SCL"):this.valueToCode(t,"SCL",this.ORDER_NONE),f=r.boardPins?t.getFieldValue("SDA"):this.valueToCode(t,"SDA",this.ORDER_NONE);return this.definitions_.rfid=`rfid = mfrc522.MFRC522(${e}, ${f})`,""}},"---",{id:"whennewcard",text:R(i,{id:"blocks.rfidrc522.whennewcard",defaultMessage:"when a new card"}),hat:!0,ino(t){return l(this,t),""},mpy(t){if(this.definitions_.rfid_uid='rfid_uid = ""',!this.definitions_.rfidrc522_whennewcard){let a="";a+=`@_tasks__.append
`,a+=`async def rfidrc522_whennewcard():
`,a+=`  global rfid_uid
`,a+=`  while True:
`,a+=`    await asyncio.sleep_ms(5)
`,a+=`    status, data, bits = rfid.scan()
`,a+=`    if status != rfid.MIFARE_OK: continue
`,a+=`    status, uid, bits = rfid.identify()
`,a+=`    if status != rfid.MIFARE_OK: continue
`,a+=`    rfid_uid = "".join(f"{b:02x}" for b in uid[0:4])
`,this.definitions_.rfidrc522_whennewcard=a}let e=this.createName("rfidrc522_flag");this.definitions_[e]=`${e} = asyncio.ThreadSafeFlag()`;let f=this.statementToCode(t)||"",s="";s+=`while True:
`,s+=`  await ${e}.wait()
`,s+=f,f=this.prefixLines(s,this.INDENT),f=this.addEventTrap(f,"rfidrc522_callback"),s=`@_tasks__.append
`,s+=f,this.definitions_[`${e}_callback`]=s,s=`    ${e}.set()
`,this.definitions_.rfidrc522_whennewcard+=s}},{id:"cardid",text:R(i,{id:"blocks.rfidrc522.cardid",defaultMessage:"card id"}),output:"string",ino(t){let e="";return e+=`String getRFIDCardId(bool checked) {
`,e+=`  String rfid_str = "";
`,e+=`  if (checked && mfrc522.uid.size > 0) {
`,e+=`    for (byte i = 0; i < mfrc522.uid.size; i++)
`,e+=`      rfid_str += String(mfrc522.uid.uidByte[i], HEX);
`,e+=`  }
`,e+=`  return rfid_str;
`,e+=`}
`,this.definitions_.declare_getRFIDCardId="String getRFIDCardId(bool checked);",this.definitions_.getRFIDCardId=e,[`getRFIDCardId(${t.getRootBlock().type.endsWith("_whennewcard")?!0:"rfidrc522_check()"})`]},mpy(t){return this.definitions_.rfid_uid='rfid_uid = ""',["rfid_uid"]}}];var E="./assets/mfrc522-pfsfkr5q.py";var n=(r)=>{if(r.editor!=="@blockcode/gui-arduino")return[{name:"mfrc522.py",type:"text/x-python",uri:E}];return[]};var o={en:{"blocks.rfidrc522.name":"RFID","blocks.rfidrc522.initI2C":"set pins SCL:[SCL] SDA:[SDA]","blocks.rfidrc522.eventPolling":"RFID events polling","blocks.rfidrc522.whennewcard":"when a new card","blocks.rfidrc522.write":"write data [HEX] to card block [BLOCK]","blocks.rfidrc522.cardid":"card id","blocks.rfidrc522.data":"card data"},"zh-Hans":{"blocks.rfidrc522.name":"RFID 模组","blocks.rfidrc522.initI2C":"初始引脚 SCL:[SCL] SDA:[SDA]","blocks.rfidrc522.eventPolling":"RFID 事件轮询","blocks.rfidrc522.whennewcard":"当感应到卡片时","blocks.rfidrc522.write":"将数据 [HEX] 写入卡片 [BLOCK] 数据块","blocks.rfidrc522.cardid":"卡片 ID","blocks.rfidrc522.data":"卡片数据"},"zh-Hant":{"blocks.rfidrc522.name":"RFID 模組","blocks.rfidrc522.initI2C":"初始引腳 SCL:[SCL] SDA:[SDA]","blocks.rfidrc522.eventPolling":"RFID 事件輪詢","blocks.rfidrc522.whennewcard":"當感應到卡片時","blocks.rfidrc522.write":"將數據 [HEX] 寫入卡片 [BLOCK] 數據塊","blocks.rfidrc522.cardid":"卡片 ID","blocks.rfidrc522.data":"卡片數據"}};var d="./assets/icon-m7baj56j.png";import{jsx as u}from"preact/jsx-runtime";M(o);var B={icon:d,name:u(I,{id:"blocks.rfidrc522.name",defaultMessage:"RFID"}),files:n,blocks:_};export{B as default};
