import{addLocalesMessages as g,Text as E}from"@blockcode/core";import{Text as o}from"@blockcode/core";import{jsx as r}from"preact/jsx-runtime";var y=(t)=>!["@blockcode/gui-arduino","@nulllab/gui-lgtuino"].includes(t.editor),f=(t)=>t.editor==="@emakefun/gui-iotbit",p=(t)=>t.boardType==="ESP32_IOT_BOARD",n=(t)=>{t.definitions_.include_wire="#include <Wire.h>",t.definitions_.include_tm1650="#include <TM1650.h>",t.definitions_.variable_digit1650="TM1650 _digit1650;",t.definitions_.setup_wire="Wire.begin(); delay(50);",t.definitions_.setup_digit1650="_digit1650.init();",t.definitions_.setup_digit1650_bright="_digit1650.setBrightness(4);"},b=(t)=>[y(t)&&{id:"init",text:r(o,{id:"blocks.tm1650.init",defaultMessage:"set TM1650 pins SCL:[SCL] SDA:[SDA]"}),inputs:{SCL:t.boardPins?{menu:t.boardPins.out,defaultValue:f(t)?"P19":p(t)?"22":"2"}:{type:"positive_integer",defaultValue:2},SDA:t.boardPins?{menu:t.boardPins.all,defaultValue:f(t)?"P20":p(t)?"21":"3"}:{type:"positive_integer",defaultValue:3}},mpy(s,e,i){let l=t.boardPins,_=l?.i2c&&l.i2c.scl===e.SCL&&l.i2c.sda===e.SDA?l.i2c.channel:1,a=`i2c${_}_${e.SCL}_${e.SDA}`;return i.import_pin="from machine import Pin",i.import_i2c="from machine import I2C",i[a]=`${a} = I2C(${_}, scl=Pin(${e.SCL}), sda=Pin(${e.SDA}))`,i.digit1650=`_digit1650 = decimal1650.Decimal(${a})`,""}},"---",{id:"display",text:r(o,{id:"blocks.tm1650.display",defaultMessage:"display number [NUM]"}),inputs:{NUM:{type:"number",defaultValue:100}},ino(s){n(this);let e=this.valueToCode(s,"NUM",this.ORDER_NONE),i="";return i+=`void tm1650DisplayNumber(float num) {
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
`},mpy(s){return`_digit1650.show_number(${this.valueToCode(s,"NUM",this.ORDER_NONE)})
`}},{id:"displayRaw",text:r(o,{id:"blocks.tm1650.displayRaw",defaultMessage:"display raw value [RAW] and dot at [POS]"}),inputs:{RAW:{type:"hex16",defaultValue:"0"},POS:{menu:["-","0","1","2","3"]}},ino(s,e){n(this);let i=e.RAW.replace(/^0x/,""),l="";if(l+=`_digit1650.displayString(String(${i}).c_str());
`,e.POS!=="-")l+=`_digit1650.setDot(${e.POS}, true);
`;return l},mpy(s,e){let i="";if(i+=`_digit1650.show_number(int(${e.RAW}, 16), 16)
`,e.POS!=="-")i+=`_digit1650.show_dot(${e.POS})
`;return i}},{id:"clear",text:r(o,{id:"blocks.tm1650.clear",defaultMessage:"clear display"}),ino(s){return n(this),`_digit1650.clear();
`},mpy(s){return`_digit1650.clear()
`}},"---",{id:"brightness",text:r(o,{id:"blocks.tm1650.brightness",defaultMessage:"set brightness [LEVEL]"}),inputs:{LEVEL:{shadow:"brightnessLevel",defaultValue:"7"}},ino(s){return n(this),`_digit1650.setBrightness(${this.valueToCode(s,"LEVEL",this.ORDER_NONE)});
`},mpy(s){return`_digit1650.brightness(${this.valueToCode(s,"LEVEL",this.ORDER_NONE)})
`}},{id:"brightnessLevel",shadow:!0,output:"number",inputs:{LEVEL:{type:"slider",defaultValue:0,min:0,max:7}},mpy(s){return[s.getFieldValue("LEVEL")||0,this.ORDER_NONE]},ino(s){return[s.getFieldValue("LEVEL")||0,this.ORDER_NONE]}}];var d="./assets/tm1650-24gbmkn4.py";var c="./assets/decimal1650-n3qt7p5a.py";var M=(t)=>!["@blockcode/gui-arduino","@nulllab/gui-lgtuino"].includes(t.editor),m=(t)=>{if(M(t))return[{header:!0,name:"decimal1650",type:"text/x-python",uri:c},{common:!0,name:"tm1650",type:"text/x-python",uri:d}];return[]};var D={en:{"blocks.tm1650.name":"TM1650 4-Digit","blocks.tm1650.init":"set TM1650 pins SCL:[SCL] SDA:[SDA]","blocks.tm1650.addr":"set TM1650 I2C address [ADDR]","blocks.tm1650.display":"display number [NUM]","blocks.tm1650.displayRaw":"display raw value [RAW] and dot at [POS]","blocks.tm1650.digit":"set digit [DIGIT] at [POS]","blocks.tm1650.brightness":"set brightness [LEVEL]","blocks.tm1650.clear":"clear display"},"zh-Hans":{"blocks.tm1650.name":"TM1650 四位数码管","blocks.tm1650.init":"初始化 TM1650 引脚 SCL:[SCL] SDA:[SDA]","blocks.tm1650.addr":"初始化 TM1650 I2C 地址[ADDR]","blocks.tm1650.display":"显示数字[NUM]","blocks.tm1650.displayRaw":"显示原始值[RAW]小数点位置[POS]","blocks.tm1650.digit":"将第[POS]位数字设为[DIGIT]","blocks.tm1650.brightness":"将亮度设为[LEVEL]","blocks.tm1650.clear":"清除显示"},"zh-Hant":{"blocks.tm1650.name":"TM1650 四位數碼管","blocks.tm1650.init":"初始化 TM1650 引腳 SCL:[SCL] SDA:[SDA]","blocks.tm1650.addr":"初始化 TM1650 I2C 地址[ADDR]","blocks.tm1650.display":"顯示數字[NUM]","blocks.tm1650.displayRaw":"顯示原始值[RAW]小數點位置[POS]","blocks.tm1650.digit":"將第[POS]位數字設為[DIGIT]","blocks.tm1650.brightness":"將亮度設為[LEVEL]","blocks.tm1650.clear":"清除顯示"}};var u="./assets/icon-aw6e2381.png";import{jsx as N}from"preact/jsx-runtime";g(D);var G={icon:u,name:N(E,{id:"blocks.tm1650.name",defaultMessage:"TM1650 4-Digit"}),files:m,blocks:b};export{G as default};
