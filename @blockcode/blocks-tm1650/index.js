import{addLocalesMessages as y,Text as S}from"@blockcode/core";import{Text as r}from"@blockcode/core";import{jsx as n}from"preact/jsx-runtime";var m=(e)=>e.editor!=="@blockcode/gui-arduino",a=(e)=>e.editor==="@blockcode/gui-iotbit",l=(e)=>{e.definitions_.include_tm1650="#include <TM1650.h>",e.definitions_.variable_digit1650="TM1650 _digit1650;",e.definitions_.setup_wire="Wire.begin();",e.definitions_.setup_digit1650="_digit1650.init();",e.definitions_.setup_digit1650_bright="_digit1650.setBrightness(4);"},o=(e)=>[].concat(m(e)&&{id:"init",text:n(r,{id:"blocks.tm1650.init",defaultMessage:"set pins SCL[SCL] SDA[SDA]"}),inputs:{SCL:a(e)?{menu:"iotOutPins",defaultValue:"22"}:{type:"positive_integer",defaultValue:2},SDA:a(e)?{menu:"iotOutPins",defaultValue:"23"}:{type:"positive_integer",defaultValue:3}},mpy(t){let s=a(e)?t.getFieldValue("SCL"):this.valueToCode(t,"SCL",this.ORDER_NONE),i=a(e)?t.getFieldValue("SDA"):this.valueToCode(t,"SDA",this.ORDER_NONE);return this.definitions_.digit1650=`_digit1650 = decimal1650.Decimal(${s}, ${i})`,""}},"---",{id:"display",text:n(r,{id:"blocks.tm1650.display",defaultMessage:"display number [NUM]"}),inputs:{NUM:{type:"number",defaultValue:100}},ino(t){l(this);let s=this.valueToCode(t,"NUM",this.ORDER_NONE),i="";return i+=`void tm1650DisplayNumber(float num) {
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
`},mpy(t){return`_digit1650.show_number(${this.valueToCode(t,"NUM",this.ORDER_NONE)})
`}},{id:"clear",text:n(r,{id:"blocks.tm1650.clear",defaultMessage:"clear display"}),ino(t){return l(this),`_digit1650.clear();
`},mpy(t){return`_digit1650.clear()
`}},"---",{id:"brightness",text:n(r,{id:"blocks.tm1650.brightness",defaultMessage:"set brightness [LEVEL]"}),inputs:{LEVEL:{shadow:"brightnessLevel",defaultValue:"7"}},ino(t){return l(this),`_digit1650.setBrightness(${this.valueToCode(t,"LEVEL",this.ORDER_NONE)});
`},mpy(t){return`_digit1650.brightness(${this.valueToCode(t,"LEVEL",this.ORDER_NONE)})
`}},{id:"brightnessLevel",shadow:!0,output:"number",inputs:{LEVEL:{type:"slider",defaultValue:0,min:0,max:7}},mpy(t){return[t.getFieldValue("LEVEL")||0,this.ORDER_NONE]},ino(t){return[t.getFieldValue("LEVEL")||0,this.ORDER_NONE]}}).filter(Boolean),_={iotOutPins:{items:[["P0","33"],["P1","32"],["P5","0"],["P6","16"],["P7","17"],["P8","26"],["P9","25"],["P11","2"],["P13","18"],["P14","19"],["P15","21"],["P16","5"],["P19","22"],["P20","23"],["P23","27"],["P24","14"],["P25","12"],["P26","13"],["P27","15"],["P28","4"]]}};var f="./assets/tm1650-24gbmkn4.py";var p="./assets/decimal1650-hmk55hpe.py";var d=(e)=>{if(e.editor!=="@blockcode/gui-arduino")return[{name:"decimal1650",type:"text/x-python",uri:p},{common:!0,name:"tm1650",type:"text/x-python",uri:f}];return[]};var b={en:{"blocks.tm1650.name":"TM1650 4-Digit","blocks.tm1650.init":"set pins SCL[SCL] SDA[SDA]","blocks.tm1650.addr":"set I2C address [ADDR]","blocks.tm1650.display":"display number [NUM]","blocks.tm1650.digit":"set digit [DIGIT] at [POS]","blocks.tm1650.brightness":"set brightness [LEVEL]","blocks.tm1650.clear":"clear display"},"zh-Hans":{"blocks.tm1650.name":"TM1650 四位数码管","blocks.tm1650.init":"初始引脚 SCL[SCL] SDA[SDA]","blocks.tm1650.addr":"初始 I2C 地址[ADDR]","blocks.tm1650.display":"显示数字[NUM]","blocks.tm1650.digit":"将第[POS]位数字设为[DIGIT]","blocks.tm1650.brightness":"将亮度设为[LEVEL]","blocks.tm1650.clear":"清除显示"},"zh-Hant":{"blocks.tm1650.name":"TM1650 四位數碼管","blocks.tm1650.init":"初始引腳 SCL[SCL] SDA[SDA]","blocks.tm1650.addr":"初始 I2C 地址[ADDR]","blocks.tm1650.display":"顯示數字[NUM]","blocks.tm1650.digit":"將第[POS]位數字設為[DIGIT]","blocks.tm1650.brightness":"將亮度設為[LEVEL]","blocks.tm1650.clear":"清除顯示"}};var c="./assets/icon-aw6e2381.png";import{jsx as h}from"preact/jsx-runtime";y(b);var C={icon:c,name:h(S,{id:"blocks.tm1650.name",defaultMessage:"TM1650 4-Digit"}),files:d,blocks:o,menus:_};export{C as default};
