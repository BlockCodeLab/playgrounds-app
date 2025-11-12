import{addLocalesMessages as D,Text as g}from"@blockcode/core";import{Text as a}from"@blockcode/core";import{jsx as r}from"preact/jsx-runtime";var k=(t)=>t.editor!=="@blockcode/gui-arduino",o=(t)=>{t.definitions_.include_ht16k33="#include <HT16K33.h>",t.definitions_.variable_digit16k33="HT16K33 _digit16k33(0x70);",t.definitions_.setup_wire="Wire.begin();",t.definitions_.setup_digit16k33="_digit16k33.begin();"},n=(t)=>[k(t)&&{id:"init",text:r(a,{id:"blocks.vk16k33.init",defaultMessage:"set pins SCL[SCL] SDA[SDA]"}),inputs:{SCL:{type:"integer",defaultValue:"2"},SDA:{type:"integer",defaultValue:"3"}},mpy(e){let s=this.valueToCode(e,"SCL",this.ORDER_NONE),i=this.valueToCode(e,"SDA",this.ORDER_NONE);return this.definitions_.digit16k33=`_digit16k33 = decimal16k33.Decimal(${s}, ${i})`,""}},"---",{id:"display",text:r(a,{id:"blocks.vk16k33.display",defaultMessage:"display number [NUM]"}),inputs:{NUM:{type:"number",defaultValue:100}},ino(e){o(this);let s=this.valueToCode(e,"NUM",this.ORDER_NONE),i="";return i+=`void ht16k33DisplayNumber(float number) {
`,i+=`  _digit16k33.setDigits(1);
`,i+=`  _digit16k33.displayColon(0);
`,i+=`  char buffer[15];
`,i+=`  dtostrf(number, 0, 3, buffer);
`,i+=`  char *dot = strchr(buffer, '.');
`,i+=`  if (dot == NULL) {
`,i+=`    _digit16k33.displayInt((int)number);
`,i+=`    return;
`,i+=`  }
`,i+=`  char *frac = dot + 1;
`,i+=`  int len = strlen(frac);
`,i+=`  while (len > 0 && frac[len - 1] == '0') {
`,i+=`    len--;
`,i+=`  }
`,i+=`  len > 0 ? _digit16k33.displayFloat(number, len) : _digit16k33.displayInt((int)number);
`,i+=`}
`,this.definitions_.declare_ht16k33DisplayNumber="void ht16k33DisplayNumber(float number);",this.definitions_.ht16k33DisplayNumber=i,`ht16k33DisplayNumber(${s});
`},mpy(e){return`_digit16k33.show_number(${this.valueToCode(e,"NUM",this.ORDER_NONE)})
`}},{id:"time",text:r(a,{id:"blocks.vk16k33.time",defaultMessage:"set time [HH]:[MM]"}),inputs:{HH:{type:"integer",defaultValue:"0"},MM:{type:"integer",defaultValue:"0"}},ino(e){o(this);let s=this.valueToCode(e,"HH",this.ORDER_NONE),i=this.valueToCode(e,"MM",this.ORDER_NONE),_="";return _+=`_digit16k33.suppressLeadingZeroPlaces(0);
`,_+=`_digit16k33.displayTime(${s}, ${i});
`,_},mpy(e){let s=this.valueToCode(e,"HH",this.ORDER_NONE),i=this.valueToCode(e,"MM",this.ORDER_NONE);return`_digit16k33.show_time(${s}, ${i})
`}},{id:"clear",text:r(a,{id:"blocks.vk16k33.clear",defaultMessage:"clear display"}),ino(e){return o(this),`_digit16k33.displayClear();
`},mpy(e){return`_digit16k33.clear()
`}},"---",{id:"colon",text:r(a,{id:"blocks.vk16k33.colon",defaultMessage:"set colon [STATE]"}),inputs:{STATE:{type:"integer",inputMode:!0,defaultValue:"1",menu:[[r(a,{id:"blocks.vk16k33.state.on",defaultMessage:"on"}),"1"],[r(a,{id:"blocks.vk16k33.state.off",defaultMessage:"off"}),"0"]]}},ino(e){return o(this),`_digit16k33.displayColon(${this.valueToCode(e,"STATE",this.ORDER_NONE)});
`},mpy(e){return`_digit16k33.show_colon(${this.valueToCode(e,"STATE",this.ORDER_NONE)})
`}},{id:"brightness",text:r(a,{id:"blocks.vk16k33.brightness",defaultMessage:"set brightness [LEVEL]"}),inputs:{LEVEL:{shadow:"brightnessLevel",defaultValue:"9"}},ino(e){return o(this),`_digit16k33.setBrightness(${this.valueToCode(e,"LEVEL",this.ORDER_NONE)});
`},mpy(e){return`_digit16k33.brightness(${this.valueToCode(e,"LEVEL",this.ORDER_NONE)})
`}},{id:"brightnessLevel",shadow:!0,output:"number",inputs:{LEVEL:{type:"slider",defaultValue:0,min:0,max:15}},mpy(e){return[e.getFieldValue("LEVEL")||0,this.ORDER_NONE]},ino(e){return[e.getFieldValue("LEVEL")||0,this.ORDER_NONE]}},{id:"frequency",text:r(a,{id:"blocks.vk16k33.frequency",defaultMessage:"set blink frequency [FREQ]"}),inputs:{FREQ:{type:"integer",defaultValue:"0",menu:[["2Hz","1"],["1Hz","2"],["0.5Hz","3"],[r(a,{id:"blocks.vk16k33.state.off",defaultMessage:"off"}),"0"]]}},ino(e){return o(this),`_digit16k33.setBlink(${e.getFieldValue("FREQ")||0});
`},mpy(e){return`_digit16k33.blink_rate(${e.getFieldValue("FREQ")||0})
`}}].filter(Boolean);var l="./assets/x16k33-rwhenb05.py";var f="./assets/decimal16k33-y6r632c3.py";var c=(t)=>{if(t.editor!=="@blockcode/gui-arduino")return[{name:"decimal16k33",type:"text/x-python",uri:f},{common:!0,name:"x16k33",type:"text/x-python",uri:l}];return[]};var d={en:{"blocks.vk16k33.name":"VK16K33 4-Digit","blocks.vk16k33.init":"set pins SCL[SCL] SDA[SDA]","blocks.vk16k33.addr":"set I2C address [ADDR]","blocks.vk16k33.display":"display number [NUM]","blocks.vk16k33.time":"display time [HH]:[MM]","blocks.vk16k33.digit":"set digit [DIGIT] at [POS]","blocks.vk16k33.brightness":"set brightness [LEVEL]","blocks.vk16k33.colon":"set colon [STATE]","blocks.vk16k33.state.on":"on","blocks.vk16k33.state.off":"off","blocks.vk16k33.frequency":"set blink frequency [FREQ]","blocks.vk16k33.clear":"clear display"},"zh-Hans":{"blocks.vk16k33.name":"VK16K33 四位数码管","blocks.vk16k33.init":"初始引脚 SCL[SCL] SDA[SDA]","blocks.vk16k33.addr":"初始 I2C 地址[ADDR]","blocks.vk16k33.display":"显示数字[NUM]","blocks.vk16k33.time":"显示时间[HH]:[MM]","blocks.vk16k33.digit":"将第[POS]位数字设为[DIGIT]","blocks.vk16k33.brightness":"将亮度设为[LEVEL]","blocks.vk16k33.colon":"[STATE]冒号","blocks.vk16k33.state.on":"开启","blocks.vk16k33.state.off":"关闭","blocks.vk16k33.frequency":"将闪烁频率设为[FREQ]","blocks.vk16k33.clear":"清除显示"},"zh-Hant":{"blocks.vk16k33.name":"VK16K33 四位數碼管","blocks.vk16k33.init":"初始引腳 SCL[SCL] SDA[SDA]","blocks.vk16k33.addr":"初始 I2C 地址[ADDR]","blocks.vk16k33.display":"顯示數字[NUM]","blocks.vk16k33.time":"顯示時間[HH]:[MM]","blocks.vk16k33.digit":"將第[POS]位數字設為[DIGIT]","blocks.vk16k33.brightness":"將亮度設為[LEVEL]","blocks.vk16k33.colon":"[STATE]冒號","blocks.vk16k33.state.on":"開啟","blocks.vk16k33.state.off":"關閉","blocks.vk16k33.frequency":"將閃爍頻率設為[FREQ]","blocks.vk16k33.clear":"清除顯示"}};var b="./assets/icon-8x86xw9p.png";import{jsx as y}from"preact/jsx-runtime";D(d);var M={icon:b,name:y(g,{id:"blocks.vk16k33.name",defaultMessage:"VK16K33 4-Digit"}),files:c,blocks:n};export{M as default};
