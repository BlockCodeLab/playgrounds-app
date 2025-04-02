import{addLocalesMessages as P,Text as e}from"@blockcode/core";var v={en:{"blocks.servo.name":"Servo","blocks.servo.90servo":"set PIN [PIN] 90° servo angle to [ANGLE]°","blocks.servo.180servo":"set PIN [PIN] 180° servo angle to [ANGLE]°","blocks.servo.motor":"set PIN [PIN] 360° servo rotate [ROTATE]","blocks.servo.motorClockwise":"clockwise","blocks.servo.motorAnticlockwise":"anticlockwise","blocks.servo.motorStop":"stop"},"zh-Hans":{"blocks.servo.name":"舵机","blocks.servo.90servo":"将引脚 [PIN] 90° 舵机角度设为 [ANGLE]°","blocks.servo.180servo":"将引脚 [PIN] 180° 舵机角度设为 [ANGLE]°","blocks.servo.motor":"将引脚 [PIN] 360° 舵机转向设为 [ROTATE]","blocks.servo.motorClockwise":"顺时针","blocks.servo.motorAnticlockwise":"逆时针","blocks.servo.motorStop":"停止"},"zh-Hant":{"blocks.servo.name":"舵機","blocks.servo.90servo":"將引腳 [PIN] 90° 舵機角度設為 [ANGLE]°","blocks.servo.180servo":"將引腳 [PIN] 180° 舵機角度設為 [ANGLE]°","blocks.servo.motor":"將引腳 [PIN] 360° 舵機轉向設為 [ROTATE]","blocks.servo.motorClockwise":"順時針","blocks.servo.motorAnticlockwise":"逆時針","blocks.servo.motorStop":"停止"}};var m="./assets/icon-ta0m7ch5.png";var N="./assets/servo-a06j1s8e.py";import{jsx as r}from"preact/jsx-runtime";P(v);var M={icon:m,name:r(e,{id:"blocks.servo.name",defaultMessage:"Servo"}),files:[{name:"servo",type:"text/x-python",uri:N}],blocks:[{id:"setServo180",text:r(e,{id:"blocks.servo.180servo",defaultMessage:"set PIN [PIN] 180° servo angle to [ANGLE]°"}),inputs:{PIN:{type:"number",defaultValue:1},ANGLE:{shadow:"angle180",defaultValue:90}},mpy(s){let o=this.valueToCode(s,"PIN",this.ORDER_NONE)||"0",t=this.valueToCode(s,"ANGLE",this.ORDER_NONE)||"0";return`servo.set_angle(num(${o}), num(${t}))
`}},{id:"setServo90",text:r(e,{id:"blocks.servo.90servo",defaultMessage:"set PIN [PIN] 90° servo angle to [ANGLE]°"}),inputs:{PIN:{type:"number",defaultValue:1},ANGLE:{shadow:"angle90",defaultValue:0}},mpy(s){let o=this.valueToCode(s,"PIN",this.ORDER_NONE)||"0",t=this.valueToCode(s,"ANGLE",this.ORDER_NONE)||"0";return`servo.set_angle(num(${o}), num(${t}), angle=90)
`}},{id:"setMotor",text:r(e,{id:"blocks.servo.motor",defaultMessage:"set PIN [PIN] 360° servo rotate [ROTATE]"}),inputs:{PIN:{type:"number",defaultValue:1},ROTATE:{type:"number",defaultValue:"1",menu:[[r(e,{id:"blocks.servo.motorClockwise",defaultMessage:"clockwise"}),"1"],[r(e,{id:"blocks.servo.motorAnticlockwise",defaultMessage:"anticlockwise"}),"-1"],[r(e,{id:"blocks.servo.motorStop",defaultMessage:"stop"}),"0"]]}},mpy(s){let o=this.valueToCode(s,"PIN",this.ORDER_NONE)||"0",t=s.getFieldValue("ROTATE")||"0";return`servo.set_motor(num(${o}), num(${t}))
`}},{id:"angle180",inline:!0,output:"number",inputs:{ANGLE:{type:"slider",defaultValue:0,min:0,max:180}},mpy(s){return[s.getFieldValue("ANGLE")||0,this.ORDER_NONE]}},{id:"angle90",inline:!0,output:"number",inputs:{ANGLE:{type:"slider",defaultValue:0,min:0,max:90}},mpy(s){return[s.getFieldValue("ANGLE")||0,this.ORDER_NONE]}}]};export{M as default};
