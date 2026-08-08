import{addLocalesMessages as T,Text as x}from"@blockcode/core";import{Text as l}from"@blockcode/core";import{jsx as a}from"preact/jsx-runtime";var u=(t)=>!["@blockcode/gui-arduino","@nulllab/gui-lgtuino"].includes(t.editor),f=(t)=>t.editor==="@emakefun/gui-iotbit",n=(t)=>{t.definitions_.include_wire="#include <Wire.h>",t.definitions_.include_tm1650="#include <TM1650.h>",t.definitions_.variable_digit1650="TM1650 _digit1650;",t.definitions_.setup_wire="Wire.begin(); delay(50);",t.definitions_.setup_digit1650="_digit1650.init();",t.definitions_.setup_digit1650_bright="_digit1650.setBrightness(4);"},b=(t)=>[u(t)&&{id:"init",text:a(l,{id:"blocks.tm1650.init",defaultMessage:"set TM1650 pins SCL:[SCL] SDA:[SDA] I2C address [ADDR]"}),inputs:{SCL:t.boardPins?{menu:t.boardPins.out,defaultValue:f(t)?"P19":"2"}:{type:"positive_integer",defaultValue:2},SDA:t.boardPins?{menu:t.boardPins.all,defaultValue:f(t)?"P20":"3"}:{type:"positive_integer",defaultValue:3}},mpy(e,s,i){let r=t.boardPins,_=r?.i2c&&r.i2c.scl===s.SCL&&r.i2c.sda===s.SDA?r.i2c.channel:1,o=`i2c${_}_${s.SCL}_${s.SDA}`;return i.import_pin="from machine import Pin",i.import_i2c="from machine import I2C",i[o]=`${o} = I2C(${_}, scl=Pin(${s.SCL}), sda=Pin(${s.SDA}))`,i.digit1650=`_digit1650 = decimal1650.Decimal(${o})`,""}},"---",{id:"display",text:a(l,{id:"blocks.tm1650.display",defaultMessage:"display number [NUM]"}),inputs:{NUM:{type:"number",defaultValue:100}},ino(e){n(this);let s=this.valueToCode(e,"NUM",this.ORDER_NONE),i="";return i+=`void tm1650DisplayNumber(float num) {
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
`,this.definitions_.declare_tm1650DisplayNumber="void tm1650DisplayNumber(float number);",this.definitions_.tm1650DisplayNumber=i,`tm1650DisplayNumber(${s});
`},mpy(e){return`_digit1650.show_number(${this.valueToCode(e,"NUM",this.ORDER_NONE)})
`}},{id:"clear",text:a(l,{id:"blocks.tm1650.clear",defaultMessage:"clear display"}),ino(e){return n(this),`_digit1650.clear();
`},mpy(e){return`_digit1650.clear()
`}},"---",{id:"brightness",text:a(l,{id:"blocks.tm1650.brightness",defaultMessage:"set brightness [LEVEL]"}),inputs:{LEVEL:{shadow:"brightnessLevel",defaultValue:"7"}},ino(e){return n(this),`_digit1650.setBrightness(${this.valueToCode(e,"LEVEL",this.ORDER_NONE)});
`},mpy(e){return`_digit1650.brightness(${this.valueToCode(e,"LEVEL",this.ORDER_NONE)})
`}},{id:"brightnessLevel",shadow:!0,output:"number",inputs:{LEVEL:{type:"slider",defaultValue:0,min:0,max:7}},mpy(e){return[e.getFieldValue("LEVEL")||0,this.ORDER_NONE]},ino(e){return[e.getFieldValue("LEVEL")||0,this.ORDER_NONE]}}];var p="./assets/tm1650-24gbmkn4.py";var d="./assets/decimal1650-hxbtgnbb.py";var S=(t)=>!["@blockcode/gui-arduino","@nulllab/gui-lgtuino"].includes(t.editor),c=(t)=>{if(S(t))return[{header:!0,name:"decimal1650",type:"text/x-python",uri:d},{common:!0,name:"tm1650",type:"text/x-python",uri:p}];return[]};var m={en:{"blocks.tm1650.name":"TM1650 4-Digit","blocks.tm1650.init":"set TM1650 pins SCL:[SCL] SDA:[SDA]","blocks.tm1650.addr":"set TM1650 I2C address [ADDR]","blocks.tm1650.display":"display number [NUM]","blocks.tm1650.digit":"set digit [DIGIT] at [POS]","blocks.tm1650.brightness":"set brightness [LEVEL]","blocks.tm1650.clear":"clear display"},"zh-Hans":{"blocks.tm1650.name":"TM1650 四位数码管","blocks.tm1650.init":"初始化 TM1650 引脚 SCL:[SCL] SDA:[SDA]","blocks.tm1650.addr":"初始化 TM1650 I2C 地址[ADDR]","blocks.tm1650.display":"显示数字[NUM]","blocks.tm1650.digit":"将第[POS]位数字设为[DIGIT]","blocks.tm1650.brightness":"将亮度设为[LEVEL]","blocks.tm1650.clear":"清除显示"},"zh-Hant":{"blocks.tm1650.name":"TM1650 四位數碼管","blocks.tm1650.init":"初始化 TM1650 引腳 SCL:[SCL] SDA:[SDA]","blocks.tm1650.addr":"初始化 TM1650 I2C 地址[ADDR]","blocks.tm1650.display":"顯示數字[NUM]","blocks.tm1650.digit":"將第[POS]位數字設為[DIGIT]","blocks.tm1650.brightness":"將亮度設為[LEVEL]","blocks.tm1650.clear":"清除顯示"}};var D="./assets/icon-aw6e2381.png";import{jsx as E}from"preact/jsx-runtime";T(m);var O={icon:D,name:E(x,{id:"blocks.tm1650.name",defaultMessage:"TM1650 4-Digit"}),files:c,blocks:b};export{O as default};
