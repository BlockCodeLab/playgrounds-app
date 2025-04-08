import{addLocalesMessages as B}from"@blockcode/core";var I={"esp32.menubar.device":"ESP32","esp32.menubar.device.esp32":"ESP32","esp32.menubar.device.esp32s3":"ESP32-S3","esp32.menubar.device.esp32c3":"ESP32-C3","esp32.menubar.device.esp32c6":"ESP32-C6","esp32.menubar.device.sync":"Sync blocks"};var w={"esp32.menubar.device":"ESP32","esp32.menubar.device.esp32":"ESP32","esp32.menubar.device.esp32s3":"ESP32-S3","esp32.menubar.device.esp32c3":"ESP32-C3","esp32.menubar.device.esp32c6":"ESP32-C6","esp32.menubar.device.sync":"同步程序"};var T={"esp32.menubar.device":"ESP32","esp32.menubar.device.esp32":"ESP32","esp32.menubar.device.esp32s3":"ESP32-S3","esp32.menubar.device.esp32c3":"ESP32-C3","esp32.menubar.device.esp32c6":"ESP32-C6","esp32.menubar.device.sync":"同步程式"};B({en:I,"zh-Hans":w,"zh-Hant":T});import{svgAsDataUri as pe}from"@blockcode/utils";import{ScratchBlocks as s,MicroPythonGenerator as le,blocksTab as se,codeReviewTab as me}from"@blockcode/blocks";import{BlocksEditor as ue,CodeReview as he}from"@blockcode/blocks";import{useAppContext as x}from"@blockcode/core";function b(e){let t=globalThis.document,c=t.createElement("style");c.appendChild(t.createTextNode(e)),t.head.append(c)}b("._1Ep-la_device-icon{width:20px;height:20px}._1Ep-la_check-icon{margin-right:calc(var(--space)/2);visibility:hidden;width:14px}._1Ep-la_check-icon._1Ep-la_checked{visibility:visible}._1Ep-la_blank-check-item>div{padding-left:14px}");var n={checkIcon:"_1Ep-la_check-icon",checked:"_1Ep-la_checked",deviceIcon:"_1Ep-la_device-icon",blankCheckItem:"_1Ep-la_blank-check-item"};var P="./assets/icon-device-40zreghe.png";import{jsx as K}from"preact/jsx-runtime";function _(){let{appState:e}=x();return K("img",{className:n.deviceIcon,src:P})}import{useAppContext as O,Text as u}from"@blockcode/core";import{keyMirror as U}from"@blockcode/utils";var o=U({ESP32:null,ESP32S2:null,ESP32S3:null,ESP32C3:null,ESP32C6:null});import{jsx as h}from"preact/jsx-runtime";function N(){let{appState:e}=O();if(e.value?.boardType===o.ESP32S3)return h(u,{id:"esp32.menubar.device.esp32s3",defaultMessage:"ESP32-S3"});if(e.value?.boardType===o.ESP32C3)return h(u,{id:"esp32.menubar.device.esp32c3",defaultMessage:"ESP32-C3"});if(e.value?.boardType===o.ESP32C6)return h(u,{id:"esp32.menubar.device.esp32c6",defaultMessage:"ESP32-C6"});return h(u,{id:"esp32.menubar.device.esp32",defaultMessage:"ESP32"})}import{useCallback as Z}from"preact/hooks";import{nanoid as V,classNames as j}from"@blockcode/utils";import{useProjectContext as ee,setAlert as k,delAlert as te,openPromptModal as Ve}from"@blockcode/core";import{MPYUtils as C}from"@blockcode/board";import{Spinner as oe,Text as $,MenuSection as ne,MenuItem as ce}from"@blockcode/core";import{useEffect as W,useCallback as X}from"preact/hooks";import{classNames as S}from"@blockcode/utils";import{useAppContext as J,setAppState as A,Text as E,MenuSection as Y,MenuItem as f}from"@blockcode/core";var p="./assets/icon-check-5hn8sb1h.svg";import{jsx as a,jsxs as l}from"preact/jsx-runtime";function F({itemClassName:e}){let{appState:t}=J();W(()=>{if(!t.value?.boardType)A("boardType",o.ESP32)},[]);let c=X((m)=>()=>{A({boardType:m})},[]);return l(Y,{children:[l(f,{className:e,onClick:c(o.ESP32),children:[a("img",{className:S(n.checkIcon,{[n.checked]:t.value?.boardType===o.ESP32}),src:p}),a(E,{id:"esp32.menubar.device.esp32",defaultMessage:"ESP32"})]}),l(f,{className:e,onClick:c(o.ESP32S3),children:[a("img",{className:S(n.checkIcon,{[n.checked]:t.value?.boardType===o.ESP32S3}),src:p}),a(E,{id:"esp32.menubar.device.esp32s3",defaultMessage:"ESP32-S3"})]}),l(f,{className:e,onClick:c(o.ESP32C3),children:[a("img",{className:S(n.checkIcon,{[n.checked]:t.value?.boardType===o.ESP32C3}),src:p}),a(E,{id:"esp32.menubar.device.esp32c3",defaultMessage:"ESP32-C3"})]}),l(f,{className:e,onClick:c(o.ESP32C6),children:[a("img",{className:S(n.checkIcon,{[n.checked]:t.value?.boardType===o.ESP32C6}),src:p}),a(E,{id:"esp32.menubar.device.esp32c6",defaultMessage:"ESP32-C6"})]})]})}import{jsx as d,jsxs as ae,Fragment as re}from"preact/jsx-runtime";var i=null,y=()=>{te(i),i=null},D=(e)=>{if(!i)i=V();if(e<100)k({id:i,icon:d(oe,{level:"success"}),message:d($,{id:"gui.alert.downloadingProgress",defaultMessage:"Downloading...{progress}%",progress:e})});else k("downloadCompleted",{id:i}),setTimeout(y,2000)},g=(e)=>{if(e==="NotFoundError")return;k("connectionError",1000)};function H({itemClassName:e}){let{files:t,assets:c}=ee(),m=Z(async()=>{if(i)return;let r;try{r=await C.connect([])}catch(v){g(v.name)}if(!r)return;let G=C.check(r).catch(()=>{g(),y()}),Q=[].concat(t.value,c.value);D("0.0");try{await C.write(r,Q,D),r.hardReset()}catch(v){g(v.name)}y(),G.cancel()},[]);return ae(re,{children:[d(ne,{children:d(ce,{disabled:i,className:j(e,n.blankCheckItem),label:d($,{id:"gui.menubar.device.download",defaultMessage:"Download program"}),onClick:m})}),d(F,{itemClassName:e})]})}import{nanoid as ie}from"@blockcode/utils";var L=ie(),de=`
from blocks import *
import ${L}
start()
`,z={assets:[{id:"main",type:"text/x-python",content:de}],files:[{id:L,type:"text/x-python"}]};import{jsx as M}from"preact/jsx-runtime";var Se=new le,Ee=()=>["mpy"],St={onNew(){return z},onSave(e,t){let c=[];return e=e.map((r)=>{return c.push(r.extensions),{id:r.id,type:r.type,xml:r.xml}}),{meta:{extensions:Array.from(new Set(c.flat()))},files:e,assets:t}},async onThumb(){let e=s.getMainWorkspace();if(e){let t=e.getCanvas();if(t)return await pe(t,{})}},onUndo(e){if(e instanceof MouseEvent)s.getMainWorkspace()?.undo?.(!1)},onRedo(e){if(e instanceof MouseEvent)s.getMainWorkspace()?.undo?.(!0)},onEnableUndo(){let e=s.getMainWorkspace();return e?.undoStack_&&e.undoStack_.length!==0},onEnableRedo(){let e=s.getMainWorkspace();return e?.redoStack_&&e.redoStack_.length!==0},menuItems:[{icon:M(_,{}),label:M(N,{}),Menu:H}],tabs:[{...se,Content:()=>M(ue,{generator:Se,onExtensionsFilter:Ee})},{...me,Content:he}]};export{St as default};
