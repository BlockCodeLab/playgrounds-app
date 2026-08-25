import{addLocalesMessages as w,Text as x}from"@blockcode/core";import{Text as o}from"@blockcode/core";import{jsx as l}from"preact/jsx-runtime";var y=(t)=>!["@blockcode/gui-arduino","@nulllab/gui-lgtuino"].includes(t.editor),c=(t)=>t.editor==="@emakefun/gui-iotbit",u=(t)=>t.boardType==="ESP32_IOT_BOARD",a=(t)=>{t.definitions_.include_wire="#include <Wire.h>",t.definitions_.include_tm1650="#include <TM1650.h>",t.definitions_.variable_digit1650="TM1650 _digit1650;",t.definitions_.setup_wire="Wire.begin(); delay(50);",t.definitions_.setup_digit1650="_digit1650.init();",t.definitions_.setup_digit1650_bright="_digit1650.setBrightness(4);"},_=(t)=>[y(t)&&{id:"init",text:l(o,{id:"blocks.tm1650.init",defaultMessage:"set TM1650 pins SCL:[SCL] SDA:[SDA]"}),inputs:{SCL:t.boardPins?{menu:t.boardPins.out,defaultValue:c(t)?"P19":u(t)?"22":"2"}:{type:"positive_integer",defaultValue:2},SDA:t.boardPins?{menu:t.boardPins.all,defaultValue:c(t)?"P20":u(t)?"21":"3"}:{type:"positive_integer",defaultValue:3}},mpy(n,e,i){let s=t.boardPins,d=s?.i2c&&s.i2c.scl===e.SCL&&s.i2c.sda===e.SDA?s.i2c.channel:1,r=`i2c${d}_${e.SCL}_${e.SDA}`;return i.import_pin="from machine import Pin",i.import_i2c="from machine import I2C",i[r]=`${r} = I2C(${d}, scl=Pin(${e.SCL}), sda=Pin(${e.SDA}))`,i.digit1650=`_digit1650 = decimal1650.Decimal(${r})`,""}},"---",{id:"display",text:l(o,{id:"blocks.tm1650.display",defaultMessage:"display number [NUM]"}),inputs:{NUM:{type:"number",defaultValue:100}},ino(n){a(this);let e=this.valueToCode(n,"NUM",this.ORDER_NONE),i="";return i+=`void tm1650DisplayNumber(float num) {
`,i+=`  if (num < -999.5) num = -999.0;
`,i+=`  if (num > 9999.5) num = 9999.0;
`,i+=`  char buffer[15];
`,i+=`  dtostrf(num, 0, 3, buffer);
`,i+=`  int len = 0;
`,i+=`  int total = strlen(buffer);
`,i+=`  char *dot = strchr(buffer, '.');
`,i+=`  if (dot != NULL) {
`,i+=`    char *frac = dot + 1;
`,i+=`    len = strlen(frac);
`,i+=`    total--;
`,i+=`    while (len > 0 && frac[len - 1] == '0') {
`,i+=`      len--; total--;
`,i+=`    }
`,i+=`    if (total > 4) len = 4 - (total - len);
`,i+=`  }
`,i+=`  sprintf(buffer, "%4d", round(num * pow(10, len)));
`,i+=`  _digit1650.displayString(&buffer[0]);
`,i+=`  _digit1650.setDot(3 - len, len > 0);
`,i+=`}
`,this.definitions_.declare_tm1650DisplayNumber="void tm1650DisplayNumber(float number);",this.definitions_.tm1650DisplayNumber=i,`tm1650DisplayNumber(${e});
`},mpy(n){return`_digit1650.show_number(${this.valueToCode(n,"NUM",this.ORDER_NONE)})
`}},{id:"displayRaw",text:l(o,{id:"blocks.tm1650.displayRaw",defaultMessage:"display raw value [RAW] and dot at [POS]"}),inputs:{RAW:{type:"hex16",defaultValue:"0"},POS:{menu:["-","0","1","2","3"]}},ino(n,e){a(this);let i=isNaN(e.RAW)?e.RAW:`"${e.RAW.replace(/^0x/,"")}"`,s="";if(s+=`_digit1650.displayString(String(${i}).c_str());
`,e.POS!=="-")s+=`_digit1650.setDot(${e.POS}, true);
`;return s},mpy(n,e){let i="";if(i+=`_digit1650.show_number(int(${e.RAW}, 16), 16)
`,e.POS!=="-")i+=`_digit1650.show_dot(${e.POS})
`;return i}},{id:"clear",text:l(o,{id:"blocks.tm1650.clear",defaultMessage:"clear display"}),ino(n){return a(this),`_digit1650.clear();
`},mpy(n){return`_digit1650.clear()
`}},"---",{id:"brightness",text:l(o,{id:"blocks.tm1650.brightness",defaultMessage:"set brightness [LEVEL]"}),inputs:{LEVEL:{shadow:"brightnessLevel",defaultValue:"7"}},ino(n){return a(this),`_digit1650.setBrightness(${this.valueToCode(n,"LEVEL",this.ORDER_NONE)});
`},mpy(n){return`_digit1650.brightness(${this.valueToCode(n,"LEVEL",this.ORDER_NONE)})
`}},{id:"brightnessLevel",shadow:!0,output:"number",inputs:{LEVEL:{type:"slider",defaultValue:0,min:0,max:7}},mpy(n){return[n.getFieldValue("LEVEL")||0,this.ORDER_NONE]},ino(n){return[n.getFieldValue("LEVEL")||0,this.ORDER_NONE]}}];var f="./assets/tm1650-24gbmkn4.py";var m="./assets/decimal1650-n3qt7p5a.py";var S=(t)=>!["@blockcode/gui-arduino","@nulllab/gui-lgtuino"].includes(t.editor),b=(t)=>{if(S(t))return[{header:!0,name:"decimal1650",type:"text/x-python",uri:m},{common:!0,name:"tm1650",type:"text/x-python",uri:f}];return[]};var p={en:{"blocks.tm1650.name":"TM1650 4-Digit","blocks.tm1650.init":"set TM1650 pins SCL:[SCL] SDA:[SDA]","blocks.tm1650.addr":"set TM1650 I2C address [ADDR]","blocks.tm1650.display":"display number [NUM]","blocks.tm1650.displayRaw":"display raw value [RAW] and dot at [POS]","blocks.tm1650.digit":"set digit [DIGIT] at [POS]","blocks.tm1650.brightness":"set brightness [LEVEL]","blocks.tm1650.clear":"clear display"},"zh-Hans":{"blocks.tm1650.name":"TM1650 四位数码管","blocks.tm1650.init":"初始化 TM1650 引脚 SCL:[SCL] SDA:[SDA]","blocks.tm1650.addr":"初始化 TM1650 I2C 地址[ADDR]","blocks.tm1650.display":"显示数字[NUM]","blocks.tm1650.displayRaw":"显示原始值[RAW]小数点位置[POS]","blocks.tm1650.digit":"将第[POS]位数字设为[DIGIT]","blocks.tm1650.brightness":"将亮度设为[LEVEL]","blocks.tm1650.clear":"清除显示"},"zh-Hant":{"blocks.tm1650.name":"TM1650 四位數碼管","blocks.tm1650.init":"初始化 TM1650 引腳 SCL:[SCL] SDA:[SDA]","blocks.tm1650.addr":"初始化 TM1650 I2C 地址[ADDR]","blocks.tm1650.display":"顯示數字[NUM]","blocks.tm1650.displayRaw":"顯示原始值[RAW]小數點位置[POS]","blocks.tm1650.digit":"將第[POS]位數字設為[DIGIT]","blocks.tm1650.brightness":"將亮度設為[LEVEL]","blocks.tm1650.clear":"清除顯示"}};var g="./assets/icon-aw6e2381.png";import{jsx as L}from"preact/jsx-runtime";w(p);var Y={icon:g,name:L(x,{id:"blocks.tm1650.name",defaultMessage:"TM1650 4-Digit"}),files:b,blocks:_};export{Y as default};
