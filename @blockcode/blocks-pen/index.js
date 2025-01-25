import{addLocalesMessages as f,Text as I}from"@blockcode/core";import{Color as c,MathUtils as E}from"@blockcode/utils";function d(t,e){return t.on("start",()=>{let s=new e.Group({id:"pen_renderer"});t.paintLayer.add(s)}),t.targetUtils.on("update",(s)=>{let o=t.querySelector("#pen_renderer"),a=t.getData(s,"pen.position");if(!o||!a)return;let n=s.position();if(Math.floor(a.x)===Math.floor(n.x)&&Math.floor(a.x)===Math.floor(n.y))return;let p=new e.Line({points:[a.x,a.y,n.x,n.y],stroke:t.getData(s,"pen.color")??"#000000",strokeWidth:t.getData(s,"pen.size")??1,lineJoin:"round",lineCap:"round"});o.add(p),t.setData(s,"pen.position",n)}),{get key(){return"pen"},get renderer(){return t.querySelector("#pen_renderer")},erase(){if(!this.renderer)return;this.renderer.destroyChildren()},stamp(s){if(!this.renderer)return;let o=s.clone({id:null,name:null,visible:!0});this.renderer.add(o)},down(s){t.setData(s,"pen.position",s.position())},up(s){t.setData(s,"pen.position",null)},setColor(s,o){t.setData(s,"pen.color",o)},addColor(s,o){t.setData(s,"pen.color",o)},addColorParam(s,o,a){let n=E.toNumber(a),p=t.getData(s,"pen.color")??"#FF0000",l=new c(p).toHSVColor();switch(o){case"saturation":l.hsv.s+=n;break;case"brightness":l.hsv.v+=n;break;case"hub":default:l.hsv.h+=n}t.setData(s,"pen.color",l.hex)},setColorParam(s,o,a){let n=E.toNumber(a),p=t.getData(s,"pen.color")??"#FF0000",l=new c(p).toHSVColor();switch(o){case"saturation":l.hsv.s=n;break;case"brightness":l.hsv.v=n;break;case"hub":default:l.hsv.h=n}t.setData(s,"pen.color",l.hex)},setSize(s,o){let a=E.toNumber(o);t.setData(s,"pen.size",a)},addSize(s,o){let a=E.toNumber(o),n=t.getData(s,"pen.size");t.setData(s,"pen.size",n+a)}}}import{Text as r}from"@blockcode/core";import{jsx as i}from"preact/jsx-runtime";var h=[{id:"erase",text:i(r,{id:"blocks.pen.erase",defaultMessage:"erase all"}),emu(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);return e+=`runtime.extensions.pen.erase();
`,e},mpy(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);return e+=`pen.clear()
`,e}},{id:"stamp",text:i(r,{id:"blocks.pen.stamp",defaultMessage:"stamp"}),forStage:!1,emu(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);return e+=`runtime.extensions.pen.stamp(target);
`,e},mpy(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);return e+=`pen.stamp(target)
`,e}},{id:"down",text:i(r,{id:"blocks.pen.down",defaultMessage:"pen down"}),forStage:!1,emu(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);return e+=`runtime.extensions.pen.down(target);
`,e},mpy(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);return e+=`pen.down(target)
`,e}},{id:"up",text:i(r,{id:"blocks.pen.up",defaultMessage:"pen up"}),forStage:!1,emu(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);return e+=`runtime.extensions.pen.up(target);
`,e},mpy(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);return e+=`pen.up(target)
`,e}},{id:"penColor",text:i(r,{id:"blocks.pen.penColor",defaultMessage:"set pen color to [COLOR]"}),forStage:!1,inputs:{COLOR:{type:"color"}},emu(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);let s=this.valueToCode(t,"COLOR",this.ORDER_NONE)||'"#000000"';return e+=`runtime.extensions.pen.setColor(target, ${s});
`,e},mpy(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);let s=this.valueToCode(t,"COLOR",this.ORDER_NONE)||"(0, 0, 0)";return e+=`pen.set_color(target, ${s})
`,e}},{id:"changePen",text:i(r,{id:"blocks.pen.changePen",defaultMessage:"change pen [OPTION] by [VALUE]"}),forStage:!1,inputs:{OPTION:{menu:"colorParam"},VALUE:{type:"number",defaultValue:10}},emu(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);let s=this.quote_(this.valueToCode(t,"OPTION",this.ORDER_NONE))||'"hue"',o=this.valueToCode(t,"VALUE",this.ORDER_NONE)||"0";return e+=`runtime.extensions.pen.addColorParam(target, ${s}, ${o});
`,e},mpy(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);let s=this.valueToCode(t,"OPTION",this.ORDER_NONE)||"hue",o=this.valueToCode(t,"VALUE",this.ORDER_NONE)||"0";return e+=`pen.change_color(target, ${s} = num(${o}))
`,e}},{id:"setPen",text:i(r,{id:"blocks.pen.setPen",defaultMessage:"set pen [OPTION] to [VALUE]"}),forStage:!1,inputs:{OPTION:{menu:"colorParam"},VALUE:{type:"number",defaultValue:50}},emu(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);let s=this.quote_(this.valueToCode(t,"OPTION",this.ORDER_NONE))||'"hue"',o=this.valueToCode(t,"VALUE",this.ORDER_NONE)||"0";return e+=`runtime.extensions.pen.setColorParam(target, ${s}, ${o});
`,e},mpy(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);let s=this.valueToCode(t,"OPTION",this.ORDER_NONE)||"hue",o=this.valueToCode(t,"VALUE",this.ORDER_NONE)||"0";return e+=`pen.set_color(${s} = num(${o}))
`,e}},{id:"changeSize",text:i(r,{id:"blocks.pen.changeSize",defaultMessage:"change pen size by [SIZE]"}),forStage:!1,inputs:{SIZE:{type:"number",defaultValue:1}},emu(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);let s=this.valueToCode(t,"SIZE",this.ORDER_NONE)||"1";return e+=`runtime.extensions.pen.addSize(target, ${s});
`,e},mpy(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);let s=this.valueToCode(t,"SIZE",this.ORDER_NONE)||"1";return e+=`pen.change_size(target, num(${s}))
`,e}},{id:"setSize",text:i(r,{id:"blocks.pen.setSize",defaultMessage:"set pen size to [SIZE]"}),forStage:!1,inputs:{SIZE:{type:"number",defaultValue:1}},emu(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);let s=this.valueToCode(t,"SIZE",this.ORDER_NONE)||"1";return e+=`runtime.extensions.pen.setSize(target, ${s});
`,e},mpy(t){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,t);let s=this.valueToCode(t,"SIZE",this.ORDER_NONE)||"1";return e+=`pen.set_size(target, num(${s}))
`,e}}],g={colorParam:{inputMode:!0,type:"string",defaultValue:"hue",items:[[i(r,{id:"blocks.pen.color",defaultMessage:"color"}),"hue"],[i(r,{id:"blocks.pen.saturation",defaultMessage:"saturation"}),"saturation"],[i(r,{id:"blocks.pen.brightness",defaultMessage:"brightness"}),"brightness"]]}};var u={en:{"blocks.pen.name":"Pen","blocks.pen.erase":"erase all","blocks.pen.stamp":"stamp","blocks.pen.down":"pen down","blocks.pen.up":"pen up","blocks.pen.penColor":"set pen color to [COLOR]","blocks.pen.color":"color","blocks.pen.saturation":"saturation","blocks.pen.brightness":"brightness","blocks.pen.changePen":"change pen [OPTION] by [VALUE]","blocks.pen.setPen":"set pen [OPTION] to [VALUE]","blocks.pen.changeSize":"change pen size by [SIZE]","blocks.pen.setSize":"set pen size to [SIZE]"},"zh-Hans":{"blocks.pen.name":"画笔","blocks.pen.erase":"全部擦除","blocks.pen.stamp":"图章","blocks.pen.down":"落笔","blocks.pen.up":"抬笔","blocks.pen.penColor":"将笔的颜色设为 [COLOR]","blocks.pen.color":"颜色","blocks.pen.saturation":"饱和度","blocks.pen.brightness":"亮度","blocks.pen.changePen":"将笔的 [OPTION] 增加 [VALUE]","blocks.pen.setPen":"将笔的 [OPTION] 设为 [VALUE]","blocks.pen.changeSize":"将笔的粗细增加 [SIZE]","blocks.pen.setSize":"将笔的粗细设为 [SIZE]"},"zh-Hant":{"blocks.pen.name":"畫筆","blocks.pen.erase":"全部擦除","blocks.pen.stamp":"圖章","blocks.pen.down":"落筆","blocks.pen.up":"抬筆","blocks.pen.penColor":"將筆的顏色設為 [COLOR]","blocks.pen.color":"顏色","blocks.pen.saturation":"飽和度","blocks.pen.brightness":"亮度","blocks.pen.changePen":"將筆的 [OPTION] 增加 [VALUE]","blocks.pen.setPen":"將筆的 [OPTION] 設為 [VALUE]","blocks.pen.changeSize":"將筆的粗細增加 [SIZE]","blocks.pen.setSize":"將筆的粗細設為 [SIZE]"}};var T="./assets/icon-wkgstzvn.svg";var _="./assets/pen-gkcsfn3s.py";import{jsx as S}from"preact/jsx-runtime";f(u);var x={icon:T,name:S(I,{id:"blocks.pen.name",defaultMessage:"Pen"}),files:[{name:"pen",type:"text/x-python",uri:_}],emulator:d,blocks:h,menus:g};export{x as default};
