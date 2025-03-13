import{addLocalesMessages as J}from"@blockcode/core";var d={"microbit.menubar.device":"Device","microbit.menubar.device.connect":"Connect","microbit.menubar.device.disconnect":"Disconnect","microbit.menubar.device.sync":"Sync blocks"};var o={"microbit.menubar.device":"设备","microbit.menubar.device.connect":"连接","microbit.menubar.device.disconnect":"断开连接","microbit.menubar.device.sync":"同步脚本"};var u={"microbit.menubar.device":"設備","microbit.menubar.device.connect":"連接","microbit.menubar.device.disconnect":"斷開連接","microbit.menubar.device.sync":"同步腳本"};J({en:d,"zh-Hans":o,"zh-Hant":u});import{svgAsDataUri as Y}from"@blockcode/utils";import{ScratchBlocks as h,MicroPythonGenerator as w,blocksTab as x,codeReviewTab as G1}from"@blockcode/blocks";import{Text as a}from"@blockcode/core";import{BlocksEditor as D,CodeReview as O1}from"@blockcode/blocks";import{useAppContext as R}from"@blockcode/core";var _="./assets/icon-device-9de6fxnz.svg";var G="./assets/icon-device-connected-3gcajtt2.svg";import{jsx as M}from"preact/jsx-runtime";function N(){let{appState:C}=R();return C.value?.device?M("img",{src:G}):M("img",{src:_})}import{nanoid as V}from"@blockcode/utils";import{useProjectContext as W,setAlert as g,delAlert as X,openPromptModal as F}from"@blockcode/core";import{MPYUtils as f}from"@blockcode/board";import{Spinner as T,Text as t,MenuSection as U,MenuItem as B}from"@blockcode/core";import{jsx as b,Fragment as P}from"preact/jsx-runtime";var n=null,Z=()=>{X(n),n=null},O=(C)=>{if(!n)n=V();if(C<100)g({id:n,icon:b(T,{level:"success"}),message:b(t,{id:"blocks.alert.downloading",defaultMessage:"Downloading...{progress}%",progress:C})});else g("downloadCompleted",{id:n}),setTimeout(Z,2000)},v=(C)=>{if(C==="NotFoundError")return;g("connectionError",1000)};function $({itemClassName:C}){let{key:m,files:p,assets:z}=W();return b(P,{children:b(U,{children:b(B,{disabled:n,className:C,label:b(t,{id:"blocks.menu.device.download",defaultMessage:"Download program"}),onClick:async()=>{if(n)return;let L;try{L=await f.connect([])}catch(i){v(i.name)}if(!L)return;let E=f.check(L).catch(()=>{v(),Z()}),H=[].concat(p.value,z.value).map((i)=>({...i,id:i.id.startsWith("lib/")?i.id:`proj${m.value}/${i.id}`}));O(0);try{if(!await f.flashFree(L,H))F({title:b(t,{id:"blocks.menu.device.name",defaultMessage:"Device"}),label:b(t,{id:"blocks.downloadPrompt.flashOutSpace",defaultMessage:"The flash is running out of space."})});else await f.write(L,H,O),await f.config(L,{"latest-project":m}),L.hardReset()}catch(i){v(i.name)}Z(),E.cancel()}})})})}import{nanoid as I}from"@blockcode/utils";var c=I(),S=`
from blocks import *
import ${c}
start()
`,q={assets:[{id:"main",type:"text/x-python",content:S}],files:[{id:c,type:"text/x-python"}]};import{jsx as y}from"preact/jsx-runtime";var k=new w,A=()=>["device"],E1={onNew(){return q},onSave(C,m){let p=[];return C=C.map((L)=>{return p.push(L.extensions),{id:L.id,type:L.type,xml:L.xml}}),{meta:{extensions:Array.from(new Set(p.flat()))},files:C,assets:m}},async onThumb(){let C=h.getMainWorkspace();if(C){let m=C.getCanvas();if(m)return await Y(m,{})}},onUndo(C){if(C instanceof MouseEvent)h.getMainWorkspace()?.undo?.(!1)},onRedo(C){if(C instanceof MouseEvent)h.getMainWorkspace()?.undo?.(!0)},onEnableUndo(){let C=h.getMainWorkspace();return C?.undoStack_&&C.undoStack_.length!==0},onEnableRedo(){let C=h.getMainWorkspace();return C?.redoStack_&&C.redoStack_.length!==0},menuItems:[{icon:y(N,{}),label:y(a,{id:"microbit.menubar.device",defaultMessage:"Device"}),Menu:$}],tabs:[{...x,Content:()=>y(D,{generator:k,onExtensionsFilter:A})}].concat([])};export{E1 as default};
