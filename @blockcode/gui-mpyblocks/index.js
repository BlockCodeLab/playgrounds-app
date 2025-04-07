import{addLocalesMessages as A}from"@blockcode/core";var L={"mpyblocks.menubar.device":"Device","mpyblocks.menubar.device.connect":"Connect","mpyblocks.menubar.device.disconnect":"Disconnect","mpyblocks.menubar.device.sync":"Sync blocks"};var s={"mpyblocks.menubar.device":"设备","mpyblocks.menubar.device.connect":"连接","mpyblocks.menubar.device.disconnect":"断开连接","mpyblocks.menubar.device.sync":"同步脚本"};var g={"mpyblocks.menubar.device":"設備","mpyblocks.menubar.device.connect":"連接","mpyblocks.menubar.device.disconnect":"斷開連接","mpyblocks.menubar.device.sync":"同步腳本"};A({en:L,"zh-Hans":s,"zh-Hant":g});import{svgAsDataUri as q}from"@blockcode/utils";import{ScratchBlocks as i,MicroPythonGenerator as E,blocksTab as J,codeReviewTab as b1}from"@blockcode/blocks";import{Text as K}from"@blockcode/core";import{BlocksEditor as O,CodeReview as w1}from"@blockcode/blocks";import{useAppContext as I}from"@blockcode/core";var v="./assets/icon-device-9de6fxnz.svg";var b="./assets/icon-device-connected-3gcajtt2.svg";import{jsx as y}from"preact/jsx-runtime";function h(){let{appState:e}=I();return e.value?.device?y("img",{src:b}):y("img",{src:v})}import{useCallback as F}from"preact/hooks";import{nanoid as N}from"@blockcode/utils";import{useProjectContext as T,setAlert as C,delAlert as U,openPromptModal as a1}from"@blockcode/core";import{MPYUtils as l}from"@blockcode/board";import{Spinner as x,Text as M,MenuSection as G,MenuItem as R}from"@blockcode/core";import{jsx as r,Fragment as Y}from"preact/jsx-runtime";var o=null,p=()=>{U(o),o=null},w=(e)=>{if(!o)o=N();if(e<100)C({id:o,icon:r(x,{level:"success"}),message:r(M,{id:"gui.alert.downloadingProgress",defaultMessage:"Downloading...{progress}%",progress:e})});else C("downloadCompleted",{id:o}),setTimeout(p,2000)},a=(e)=>{if(e==="NotFoundError")return;C("connectionError",1000)};function k({itemClassName:e}){let{key:n,files:c,assets:u}=T(),t=F(async()=>{if(o)return;let d;try{d=await l.connect([])}catch(m){a(m.name)}if(!d)return;let P=l.check(d).catch(()=>{a(),p()}),D=[].concat(c.value,u.value);w("0.0");try{await l.write(d,D,w),d.hardReset()}catch(m){a(m.name)}p(),P.cancel()});return r(Y,{children:r(G,{children:r(R,{disabled:o,className:e,label:r(M,{id:"gui.menubar.device.download",defaultMessage:"Download program"}),onClick:t})})})}var Z={files:[{id:"main",type:"text/x-python"}]};import{jsx as f}from"preact/jsx-runtime";var Q=new E,S=()=>["device"],P1={onNew(){return Z},onSave(e,n){let c=[];return e=e.map((t)=>{return c.push(t.extensions),{id:t.id,type:t.type,xml:t.xml}}),{meta:{extensions:Array.from(new Set(c.flat()))},files:e,assets:n}},async onThumb(){let e=i.getMainWorkspace();if(e){let n=e.getCanvas();if(n)return await q(n,{})}},onUndo(e){if(e instanceof MouseEvent)i.getMainWorkspace()?.undo?.(!1)},onRedo(e){if(e instanceof MouseEvent)i.getMainWorkspace()?.undo?.(!0)},onEnableUndo(){let e=i.getMainWorkspace();return e?.undoStack_&&e.undoStack_.length!==0},onEnableRedo(){let e=i.getMainWorkspace();return e?.redoStack_&&e.redoStack_.length!==0},menuItems:[{icon:f(h,{}),label:f(K,{id:"mpyblocks.menubar.device",defaultMessage:"Device"}),Menu:k}],tabs:[{...J,Content:()=>f(O,{generator:Q,onExtensionsFilter:S})}].concat([])};export{P1 as default};
