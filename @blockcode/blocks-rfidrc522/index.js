import{addLocalesMessages as w,Text as h}from"@blockcode/core";import{Text as n}from"@blockcode/core";import{jsx as t}from"preact/jsx-runtime";var o=(i,c)=>{if(i.definitions_.include_rfidrc522="#include <MFRC522v2.h>",i.definitions_.include_rfidrc522_i2c="#include <MFRC522DriverI2C.h>",!i.definitions_.variable_rfidrc522_driver)i.definitions_.variable_rfidrc522_driver="MFRC522DriverI2C mfrc522Driver{};";i.definitions_.variable_rfidrc522="MFRC522 mfrc522{mfrc522Driver};",i.definitions_.setup_mfrc522="mfrc522.PCD_Init();";let r="";if(r+=`bool rfidrc522_check() {
`,r+=`  return mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial();
`,r+=`}
`,i.definitions_.declare_rfidrc522_check="bool rfidrc522_check();",i.definitions_.rfidrc522_check=r,c){let e=c?i.statementToCode(c):"",d="";d+=`void rfidrc522_whennewcard() {
`,d+=`  if (!rfidrc522_check()) return;
`,d+=e||"",d+=`  mfrc522.PICC_HaltA();
`,d+=`}
`,i.definitions_.declare_rfidrc522_whennewcard="void rfidrc522_whennewcard();",i.definitions_.loop_rfidrc522_whennewcard="rfidrc522_whennewcard();",i.definitions_.rfidrc522_whennewcard=d}},f=(i)=>[{id:"whennewcard",text:t(n,{id:"blocks.rfidrc522.whennewcard",defaultMessage:"when a new card"}),hat:!0,ino(c){return o(this,c),""}},{id:"cardid",text:t(n,{id:"blocks.rfidrc522.cardid",defaultMessage:"card id"}),output:"string",ino(c){o(this);let r="";return r+=`String getRFIDCardId(bool checked) {
`,r+=`  String rfid_str = "";
`,r+=`  if (checked && mfrc522.uid.size > 0) {
`,r+=`    rfid_str += "0x";
`,r+=`    for (byte i = 0; i < mfrc522.uid.size; i++)
`,r+=`      rfid_str += String(mfrc522.uid.uidByte[i], HEX);
`,r+=`  }
`,r+=`  return rfid_str;
`,r+=`}
`,this.definitions_.declare_getRFIDCardId="String getRFIDCardId(bool checked);",this.definitions_.getRFIDCardId=r,[`getRFIDCardId(${c.getRootBlock().type.endsWith("_whennewcard")?!0:"rfidrc522_check()"})`]}}];var a={en:{"blocks.rfidrc522.name":"RFID","blocks.rfidrc522.whennewcard":"when a new card","blocks.rfidrc522.write":"write data [HEX] to card block [BLOCK]","blocks.rfidrc522.cardid":"card id","blocks.rfidrc522.data":"card data"},"zh-Hans":{"blocks.rfidrc522.name":"RFID 模组","blocks.rfidrc522.whennewcard":"当感应到卡片时","blocks.rfidrc522.write":"将数据 [HEX] 写入卡片 [BLOCK] 数据块","blocks.rfidrc522.cardid":"卡片 ID","blocks.rfidrc522.data":"卡片数据"},"zh-Hant":{"blocks.rfidrc522.name":"RFID 模組","blocks.rfidrc522.whennewcard":"當感應到卡片時","blocks.rfidrc522.write":"將數據 [HEX] 寫入卡片 [BLOCK] 數據塊","blocks.rfidrc522.cardid":"卡片 ID","blocks.rfidrc522.data":"卡片數據"}};var s="./assets/icon-m7baj56j.png";import{jsx as b}from"preact/jsx-runtime";w(a);var O={icon:s,name:b(h,{id:"blocks.rfidrc522.name",defaultMessage:"RFID"}),blocks:f};export{O as default};
