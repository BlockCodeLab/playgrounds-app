import{addLocalesMessages as X,Text as o}from"@blockcode/core";import{Text as w}from"@blockcode/core";import{jsx as c}from"preact/jsx-runtime";var l=(i,s)=>{if(i.definitions_.include_rfidrc522="#include <MFRC522v2.h>",i.definitions_.include_rfidrc522_i2c="#include <MFRC522DriverI2C.h>",!i.definitions_.variable_rfidrc522_driver)i.definitions_.variable_rfidrc522_driver="MFRC522DriverI2C mfrc522Driver{};";i.definitions_.variable_rfidrc522="MFRC522 mfrc522{mfrc522Driver};",i.definitions_.setup_mfrc522="mfrc522.PCD_Init();";let r="";if(r+=`bool rfidrc522_check() {
`,r+=`  return mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial();
`,r+=`}
`,i.definitions_.declare_rfidrc522_check="bool rfidrc522_check();",i.definitions_.rfidrc522_check=r,s){let f=s?i.statementToCode(s):"",a="";a+=`void rfidrc522_whennewcard() {
`,a+=`  if (!rfidrc522_check()) return;
`,a+=f||"",a+=`  mfrc522.PICC_HaltA();
`,a+=`}
`,i.definitions_.declare_rfidrc522_whennewcard="void rfidrc522_whennewcard();",i.definitions_.rfidrc522_whennewcard=a}},d=(i)=>[i.editor==="@blockcode/gui-arduino"&&{id:"eventPolling",text:c(w,{id:"blocks.rfidrc522.eventPolling",defaultMessage:"RFID events polling"}),ino(s){return l(this),`rfidrc522_whennewcard();
`}},"---",{id:"whennewcard",text:c(w,{id:"blocks.rfidrc522.whennewcard",defaultMessage:"when a new card"}),hat:!0,ino(s){return l(this,s),""}},{id:"cardid",text:c(w,{id:"blocks.rfidrc522.cardid",defaultMessage:"card id"}),output:"string",ino(s){let r="";return r+=`String getRFIDCardId(bool checked) {
`,r+=`  String rfid_str = "";
`,r+=`  if (checked && mfrc522.uid.size > 0) {
`,r+=`    for (byte i = 0; i < mfrc522.uid.size; i++)
`,r+=`      rfid_str += String(mfrc522.uid.uidByte[i], HEX);
`,r+=`  }
`,r+=`  return rfid_str;
`,r+=`}
`,this.definitions_.declare_getRFIDCardId="String getRFIDCardId(bool checked);",this.definitions_.getRFIDCardId=r,[`getRFIDCardId(${s.getRootBlock().type.endsWith("_whennewcard")?!0:"rfidrc522_check()"})`]}}];var b={en:{"blocks.rfidrc522.name":"RFID","blocks.rfidrc522.eventPolling":"RFID events polling","blocks.rfidrc522.whennewcard":"when a new card","blocks.rfidrc522.write":"write data [HEX] to card block [BLOCK]","blocks.rfidrc522.cardid":"card id","blocks.rfidrc522.data":"card data"},"zh-Hans":{"blocks.rfidrc522.name":"RFID 模组","blocks.rfidrc522.eventPolling":"RFID 事件轮询","blocks.rfidrc522.whennewcard":"当感应到卡片时","blocks.rfidrc522.write":"将数据 [HEX] 写入卡片 [BLOCK] 数据块","blocks.rfidrc522.cardid":"卡片 ID","blocks.rfidrc522.data":"卡片数据"},"zh-Hant":{"blocks.rfidrc522.name":"RFID 模組","blocks.rfidrc522.eventPolling":"RFID 事件輪詢","blocks.rfidrc522.whennewcard":"當感應到卡片時","blocks.rfidrc522.write":"將數據 [HEX] 寫入卡片 [BLOCK] 數據塊","blocks.rfidrc522.cardid":"卡片 ID","blocks.rfidrc522.data":"卡片數據"}};var m="./assets/icon-m7baj56j.png";import{jsx as D}from"preact/jsx-runtime";X(b);var k={icon:m,name:D(o,{id:"blocks.rfidrc522.name",defaultMessage:"RFID"}),blocks:d};export{k as default};
