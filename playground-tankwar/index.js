import{addLocalesMessages as le}from"@blockcode/core";var ls={"tankwar.player.greenFlag":"Fight","tankwar.player.stopAll":"Stop","tankwar.stage.small":"Switch to small stage","tankwar.stage.large":"Switch to large stage","tankwar.stageInfo.player":"Player","tankwar.stageInfo.nickname":"Nickname","tankwar.stageInfo.enemies":"Enemies","tankwar.stageInfo.health":"Health","tankwar.stageInfo.enemy.red":"Red","tankwar.stageInfo.enemy.yellow":"Yellow","tankwar.stageInfo.enemy.green":"Green","tankwar.stageInfo.mode.local":"Local AI","tankwar.stageInfo.mode.remote":"Remote Players","tankwar.stageInfo.ai":"AI","tankwar.stageInfo.ai.simple":"Simple","tankwar.stageInfo.ai.medium":"Medium","tankwar.stageInfo.ai.senior":"Senior","tankwar.blocks.motion_attack":"fire in direction %1 at %2 steps","tankwar.blocks.motion_move":"forward in direction %1 at %2 % speed","tankwar.blocks.motion_setspeed":"set speed to %1 %","tankwar.blocks.motion_stop":"stop","tankwar.blocks.motion_speed":"speed","tankwar.blocks.sensing_scanwidth":"set scan width to %1","tankwar.blocks.sensing_scan":"scan for enemy in direction %1?","tankwar.blocks.sensing_distance":"measure distance of enemy in direction %1","tankwar.blocks.sensing_health":"health","tankwar.blocks.event_damage":"damage"};var ns={"tankwar.player.greenFlag":"开战","tankwar.player.stopAll":"停战","tankwar.stage.small":"缩小舞台","tankwar.stage.large":"放大舞台","tankwar.stageInfo.player":"玩家","tankwar.stageInfo.nickname":"昵称","tankwar.stageInfo.enemies":"敌方数量","tankwar.stageInfo.health":"血量","tankwar.stageInfo.enemy.red":"红","tankwar.stageInfo.enemy.yellow":"黄","tankwar.stageInfo.enemy.green":"绿","tankwar.stageInfo.mode.local":"本机 AI","tankwar.stageInfo.mode.remote":"联网玩家","tankwar.stageInfo.ai":"AI 策略","tankwar.stageInfo.ai.simple":"简单","tankwar.stageInfo.ai.medium":"中等","tankwar.stageInfo.ai.senior":"高级","tankwar.blocks.motion_attack":"面向 %1 方向距离 %2 步发射炮弹","tankwar.blocks.motion_move":"以 %2 % 速度面向 %1 方向前进","tankwar.blocks.motion_setspeed":"将速度设为 %1 %","tankwar.blocks.motion_stop":"停止前进","tankwar.blocks.motion_speed":"速度","tankwar.blocks.sensing_scanwidth":"将雷达扫描宽度设为 %1","tankwar.blocks.sensing_scan":"雷达扫描 %1 方向有敌人？","tankwar.blocks.sensing_distance":"雷达测量 %1 方向敌人的距离","tankwar.blocks.sensing_health":"血量","tankwar.blocks.event_damage":"伤害"};var ms={"tankwar.player.greenFlag":"開戰","tankwar.player.stopAll":"停戰","tankwar.stage.small":"縮小舞台","tankwar.stage.large":"放大舞台","tankwar.stageInfo.player":"玩家","tankwar.stageInfo.nickname":"暱稱","tankwar.stageInfo.enemies":"敵方數量","tankwar.stageInfo.health":"血量","tankwar.stageInfo.enemy.red":"紅","tankwar.stageInfo.enemy.yellow":"黃","tankwar.stageInfo.enemy.green":"綠","tankwar.stageInfo.mode.local":"本機 AI","tankwar.stageInfo.mode.remote":"聯網玩家","tankwar.stageInfo.ai":"AI 策略","tankwar.stageInfo.ai.simple":"簡單","tankwar.stageInfo.ai.medium":"中等","tankwar.stageInfo.ai.senior":"高級","tankwar.blocks.motion_attack":"面向 %1 方向距離 %2 步發射炮彈","tankwar.blocks.motion_move":"以 %2 % 速度面向 %1 方向前進","tankwar.blocks.motion_setspeed":"將速度設為 %1 %","tankwar.blocks.motion_stop":"停止前進","tankwar.blocks.motion_speed":"速度","tankwar.blocks.sensing_scanwidth":"將雷達掃描寬度設為 %1","tankwar.blocks.sensing_scan":"雷達掃描 %1 方向有敵人？","tankwar.blocks.sensing_distance":"雷達測量 %1 方向敵人的距離","tankwar.blocks.sensing_health":"血量","tankwar.blocks.event_damage":"傷害"};le({en:ls,"zh-Hans":ns,"zh-Hant":ms});import{html2canvas as pt}from"@blockcode/utils";import{ScratchBlocks as K,blocksTab as Rt,codeReviewTab as Ji}from"@blockcode/blocks";import{CodeReview as Qi}from"@blockcode/blocks";import{BlocksEditor as fe}from"@blockcode/blocks";import{translate as x,themeColors as G}from"@blockcode/core";import{ScratchBlocks as q}from"@blockcode/blocks";var fs=()=>({id:"motion",name:"%{BKY_CATEGORY_MOTION}",themeColor:G.blocks.motion.primary,inputColor:G.blocks.motion.secondary,otherColor:G.blocks.motion.tertiary,order:0,blocks:[{id:"attack",text:x("tankwar.blocks.motion_attack","fire in direction %1 at %2 steps"),inputs:{DIRECTION:{type:"angle",defaultValue:90},DISTANCE:{type:"number",defaultValue:50}},emu(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let t=this.valueToCode(s,"DIRECTION",this.ORDER_NONE)||"0",r=this.valueToCode(s,"DISTANCE",this.ORDER_NONE)||"100";return e+=`await tankUtils.attack(target, signal, ${t}, ${r});
`,e}},{id:"move",text:x("tankwar.blocks.motion_move","forward in direction %1 at %2 % speed"),inputs:{DIRECTION:{type:"angle",defaultValue:90},SPEED:{type:"number",defaultValue:100}},emu(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let t=this.valueToCode(s,"DIRECTION",this.ORDER_NONE)||"0",r=this.valueToCode(s,"SPEED",this.ORDER_NONE)||"100";return e+=`await tankUtils.move(target, signal, ${t}, ${r});
`,e}},"---",{id:"turnright",text:q.Msg.MOTION_TRUNRIGHT,inputs:{IMAGE:{type:"image",src:"./assets/blocks-media/rotate-right.svg"},DEGREES:{type:"number",defaultValue:15}},emu(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let t=this.valueToCode(s,"DEGREES",this.ORDER_NONE)||0;return e+=`await tankUtils.turnRight(target, signal, ${t});
`,e}},{id:"turnleft",text:q.Msg.MOTION_TRUNLEFT,inputs:{IMAGE:{type:"image",src:"./assets/blocks-media/rotate-left.svg"},DEGREES:{type:"number",defaultValue:15}},emu(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let t=this.valueToCode(s,"DEGREES",this.ORDER_NONE)||0;return e+=`await tankUtils.turnLeft(target, signal, ${t});
`,e}},{id:"pointindirection",text:q.Msg.MOTION_POINTINDIRECTION,inputs:{DIRECTION:{type:"angle",defaultValue:90}},emu(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let t=this.valueToCode(s,"DIRECTION",this.ORDER_NONE)||"0";return e+=`await tankUtils.setDirection(target, signal, ${t});
`,e}},"---",{id:"setspeed",text:x("tankwar.blocks.motion_setspeed","set speed to %1 %"),inputs:{SPEED:{type:"number",defaultValue:50}},emu(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let t=this.valueToCode(s,"SPEED",this.ORDER_NONE)||"0";return e+=`tankUtils.setSpeed(target, ${t});
`,e}},{id:"stop",text:x("tankwar.blocks.motion_stop","stop"),emu(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);return e+=`tankUtils.stop(target);
`,e}},"---",{id:"speed",text:x("tankwar.blocks.motion_speed","speed"),output:"number",emu(s){return["tankUtils.getSpeed(target)",this.ORDER_FUNCTION_CALL]}},{id:"xposition",text:q.Msg.MOTION_XPOSITION,output:"number",emu(s){return["target.x()",this.ORDER_FUNCTION_CALL]}},{id:"yposition",text:q.Msg.MOTION_XPOSITION,output:"number",emu(s){return["target.y()",this.ORDER_FUNCTION_CALL]}},{id:"direction",text:q.Msg.MOTION_DIRECTION,output:"number",emu(s){return["tankUtils.getDirection(target)",this.ORDER_FUNCTION_CALL]}}]});import{translate as ne,themeColors as j}from"@blockcode/core";import{ScratchBlocks as P}from"@blockcode/blocks";var ps=()=>({id:"event",name:"%{BKY_CATEGORY_EVENTS}",themeColor:j.blocks.events.primary,inputColor:j.blocks.events.secondary,otherColor:j.blocks.events.tertiary,blocks:[{id:"whenflagclicked",text:P.Msg.EVENT_WHENFLAGCLICKED,hat:!0,inputs:{FLAG:{type:"image",src:"./assets/blocks-media/green-flag.svg"}},emu(){return`runtime.when('start', ${this.HAT_CALLBACK});
`}},"---",{id:"whengreaterthan",text:P.Msg.EVENT_WHENGREATERTHAN,hat:!0,inputs:{WHENGREATERTHANMENU:{type:"string",menu:[[P.Msg.EVENT_WHENGREATERTHAN_TIMER,"TIMER"],[ne("tankwar.blocks.event_damage","damage"),"DAMAGE"]]},VALUE:{type:"number",defaultValue:10}},emu(s){let e=s.getFieldValue("WHENGREATERTHANMENU"),t=this.valueToCode(s,"VALUE",this.ORDER_NONE)||"10";return`runtime.whenGreaterThen('${e}', ${t}, ${this.HAT_CALLBACK});
`}}]});import{translate as J,themeColors as U}from"@blockcode/core";import{ScratchBlocks as Rs}from"@blockcode/blocks";var us=()=>({id:"sensing",name:"%{BKY_CATEGORY_SENSING}",themeColor:U.blocks.sensing.primary,inputColor:U.blocks.sensing.secondary,otherColor:U.blocks.sensing.tertiary,blocks:[{id:"scandistance",text:J("tankwar.blocks.sensing_distance","measure distance of enemy in direction %1"),output:"number",inputs:{DIRECTION:{type:"angle",defaultValue:90}},emu(s){return[`(await tankUtils.scan(target, ${this.valueToCode(s,"DIRECTION",this.ORDER_NONE)||90}))`,this.ORDER_FUNCTION_CALL]}},{id:"scan",text:J("tankwar.blocks.sensing_scan","scan for enemy in direction %1?"),output:"boolean",inputs:{DIRECTION:{type:"angle",defaultValue:90}},emu(s){return[`(await tankUtils.scan(target, ${this.valueToCode(s,"DIRECTION",this.ORDER_NONE)||90}) !== Infinity)`,this.ORDER_EQUALITY]}},"---",{id:"scanwidth",text:J("tankwar.blocks.sensing_scanwidth","set scan width to %1"),inputs:{WIDTH:{type:"number",defaultValue:5}},emu(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let t=this.valueToCode(s,"WIDTH",this.ORDER_NONE)||5;return e+=`target.setAttr('scanWidth', ${t});
`,e}},"---",{id:"health",text:J("tankwar.blocks.sensing_health","health"),output:"number",emu(s){return["target.getAttr('health')",this.ORDER_FUNCTION_CALL]}},"---",{id:"timer",text:Rs.Msg.SENSING_TIMER,output:"number",emu(s){return["runtime.times",this.ORDER_MEMBER]}},{id:"resettimer",text:Rs.Msg.SENSING_RESETTIMER,emu(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);return e+=`runtime.resetTimes()
`,e}}]});import{EmulatorGenerator as me}from"@blockcode/blocks";class A extends me{}function Zs(){let s=fs(),e=ps(),t=us();return[s,e,t]}import{jsx as Re}from"preact/jsx-runtime";var pe=new A;function _s(){return Re(fe,{enableMonitor:!0,disableExtensionButton:!0,emulator:pe,onBuildinExtensions:Zs})}import{useEffect as ct}from"preact/hooks";import{translate as V,setAppState as lt}from"@blockcode/core";import{classNames as Pe}from"@blockcode/utils";import{useAppContext as Ue}from"@blockcode/core";import{useCallback as Bs,useEffect as Ss}from"preact/hooks";import{useSignal as Qe}from"@preact/signals";import{Konva as We}from"@blockcode/utils";import{useAppContext as Me,useProjectContext as $e,setAppState as Oe}from"@blockcode/core";import{Emulator as Be}from"@blockcode/blocks";import{sleepMs as Pt,MathUtils as Ut}from"@blockcode/utils";import{Runtime as he}from"@blockcode/blocks";var y=typeof Reflect=="object"?Reflect:null,Is=y&&typeof y.apply=="function"?y.apply:function(s,e,t){return Function.prototype.apply.call(s,e,t)},Q;y&&typeof y.ownKeys=="function"?Q=y.ownKeys:Object.getOwnPropertySymbols?Q=function(s){return Object.getOwnPropertyNames(s).concat(Object.getOwnPropertySymbols(s))}:Q=function(s){return Object.getOwnPropertyNames(s)};function ue(s){console&&console.warn&&console.warn(s)}var vs=Number.isNaN||function(s){return s!==s};function p(){p.init.call(this)}p.EventEmitter=p;p.prototype._events=void 0;p.prototype._eventsCount=0;p.prototype._maxListeners=void 0;var ks=10;function W(s){if(typeof s!="function")throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof s)}Object.defineProperty(p,"defaultMaxListeners",{enumerable:!0,get:function(){return ks},set:function(s){if(typeof s!="number"||s<0||vs(s))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+s+".");ks=s}});p.init=function(){(this._events===void 0||this._events===Object.getPrototypeOf(this)._events)&&(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0};p.prototype.setMaxListeners=function(s){if(typeof s!="number"||s<0||vs(s))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+s+".");return this._maxListeners=s,this};function Ds(s){return s._maxListeners===void 0?p.defaultMaxListeners:s._maxListeners}p.prototype.getMaxListeners=function(){return Ds(this)};p.prototype.emit=function(s){for(var e=[],t=1;t<arguments.length;t++)e.push(arguments[t]);var r=s==="error",i=this._events;if(i!==void 0)r=r&&i.error===void 0;else if(!r)return!1;if(r){var o;if(e.length>0&&(o=e[0]),o instanceof Error)throw o;var a=new Error("Unhandled error."+(o?" ("+o.message+")":""));throw a.context=o,a}var c=i[s];if(c===void 0)return!1;if(typeof c=="function")Is(c,this,e);else for(var n=c.length,m=Ns(c,n),t=0;t<n;++t)Is(m[t],this,e);return!0};function ws(s,e,t,r){var i,o,a;if(W(t),o=s._events,o===void 0?(o=s._events=Object.create(null),s._eventsCount=0):(o.newListener!==void 0&&(s.emit("newListener",e,t.listener?t.listener:t),o=s._events),a=o[e]),a===void 0)a=o[e]=t,++s._eventsCount;else if(typeof a=="function"?a=o[e]=r?[t,a]:[a,t]:r?a.unshift(t):a.push(t),i=Ds(s),i>0&&a.length>i&&!a.warned){a.warned=!0;var c=new Error("Possible EventEmitter memory leak detected. "+a.length+" "+String(e)+" listeners added. Use emitter.setMaxListeners() to increase limit");c.name="MaxListenersExceededWarning",c.emitter=s,c.type=e,c.count=a.length,ue(c)}return s}p.prototype.addListener=function(s,e){return ws(this,s,e,!1)};p.prototype.on=p.prototype.addListener;p.prototype.prependListener=function(s,e){return ws(this,s,e,!0)};function Ze(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,arguments.length===0?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function bs(s,e,t){var r={fired:!1,wrapFn:void 0,target:s,type:e,listener:t},i=Ze.bind(r);return i.listener=t,r.wrapFn=i,i}p.prototype.once=function(s,e){return W(e),this.on(s,bs(this,s,e)),this};p.prototype.prependOnceListener=function(s,e){return W(e),this.prependListener(s,bs(this,s,e)),this};p.prototype.removeListener=function(s,e){var t,r,i,o,a;if(W(e),r=this._events,r===void 0)return this;if(t=r[s],t===void 0)return this;if(t===e||t.listener===e)--this._eventsCount===0?this._events=Object.create(null):(delete r[s],r.removeListener&&this.emit("removeListener",s,t.listener||e));else if(typeof t!="function"){for(i=-1,o=t.length-1;o>=0;o--)if(t[o]===e||t[o].listener===e){a=t[o].listener,i=o;break}if(i<0)return this;i===0?t.shift():_e(t,i),t.length===1&&(r[s]=t[0]),r.removeListener!==void 0&&this.emit("removeListener",s,a||e)}return this};p.prototype.off=p.prototype.removeListener;p.prototype.removeAllListeners=function(s){var e,t,r;if(t=this._events,t===void 0)return this;if(t.removeListener===void 0)return arguments.length===0?(this._events=Object.create(null),this._eventsCount=0):t[s]!==void 0&&(--this._eventsCount===0?this._events=Object.create(null):delete t[s]),this;if(arguments.length===0){var i=Object.keys(t),o;for(r=0;r<i.length;++r)o=i[r],o!=="removeListener"&&this.removeAllListeners(o);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if(e=t[s],typeof e=="function")this.removeListener(s,e);else if(e!==void 0)for(r=e.length-1;r>=0;r--)this.removeListener(s,e[r]);return this};function Es(s,e,t){var r=s._events;if(r===void 0)return[];var i=r[e];return i===void 0?[]:typeof i=="function"?t?[i.listener||i]:[i]:t?Ie(i):Ns(i,i.length)}p.prototype.listeners=function(s){return Es(this,s,!0)};p.prototype.rawListeners=function(s){return Es(this,s,!1)};p.listenerCount=function(s,e){return typeof s.listenerCount=="function"?s.listenerCount(e):gs.call(s,e)};p.prototype.listenerCount=gs;function gs(s){var e=this._events;if(e!==void 0){var t=e[s];if(typeof t=="function")return 1;if(t!==void 0)return t.length}return 0}p.prototype.eventNames=function(){return this._eventsCount>0?Q(this._events):[]};function Ns(s,e){for(var t=new Array(e),r=0;r<e;++r)t[r]=s[r];return t}function _e(s,e){for(;e+1<s.length;e++)s[e]=s[e+1];s.pop()}function Ie(s){for(var e=new Array(s.length),t=0;t<e.length;++t)e[t]=s[t].listener||s[t];return e}var $t=p.prototype;import{sleep as qs,MathUtils as u,Konva as F}from"@blockcode/utils";var ds="./assets/bullet-82yt94q7.png";var hs="./assets/boom-0p27yacb.png";var De=2,ys=0.013888888888888888,we=1000,be=70,Ee=300,Fs=20,ge=200,Ne=2,de=30,xs=400;class H extends p{constructor(s){super();this._runtime=s,this._speedRatio=De*s.fps,this._bulletSpeed=ge/s.fps,this._bulletImage=new Image,this._bulletImage.src=ds,this._boomImage=new Image,this._boomImage.src=hs,this._maxX=s.backdropLayer.canvas.width/2,this._maxY=s.backdropLayer.canvas.height/2}get runtime(){return this._runtime}get running(){return this.runtime.running}get stage(){return this.runtime.stage}get backdropLayer(){return this.runtime.backdropLayer}get paintLayer(){return this.runtime.paintLayer}get spritesLayer(){return this.runtime.spritesLayer}get boardLayer(){return this.runtime.boardLayer}get tanks(){return this.runtime.tanks}drive(s,e){if(!this.running)return;if(!s.visible())return;let t=s.getAttr("tank"),r=s.getAttr("turret");if(s.getAttr("health")<=0){s.getAttr("broken").visible(!0),t.visible(!1),r.visible(!1);return}if(!s.getAttr("cooldown")&&!r.getAttr("tween")&&t.rotation()!==r.rotation())this._turn(r,e,t.rotation());let i=s.getAttr("speed");if(!i)return;let o=s.getAttr("tank").rotation(),a=u.degToRad(o-90),c=-i*Math.cos(a),n=-i*Math.sin(a),m=s.x()+c,l=s.y()+n;if(m>this._maxX||m<-this._maxX)m=-1*Math.sign(m)*this._maxX;if(l>this._maxY||l<-this._maxY)l=-1*Math.sign(l)*this._maxY;this.spritesLayer.children.forEach((f)=>{if(!f.visible()||f===s)return;let R={centerX:f.x(),centerY:f.y(),width:f.getAttr("tank").getAttr("offsetX"),height:f.getAttr("tank").getAttr("offsetY"),angle:f.getAttr("tank").getAttr("rotation")},k={centerX:s.x(),centerY:s.y(),width:s.getAttr("tank").getAttr("offsetX"),height:s.getAttr("tank").getAttr("offsetY"),angle:s.getAttr("tank").getAttr("rotation")};if(this._detectCollision(R,k))s.setAttr("speed",0)}),s.position({x:m,y:l})}_haveIntersection(s,e){return!(e.centerX>s.centerX+s.width||e.centerX+e.width<s.centerX||e.centerY>s.centerY+s.height||e.centerY+e.height<s.centerY)}_detectCollision(s,e){function t(l,f,R,k,g){let N=R/2,d=k/2;return[{x:-N,y:-d},{x:N,y:-d},{x:N,y:d},{x:-N,y:d}].map((h)=>{let L=h.x*Math.cos(g)-h.y*Math.sin(g),Y=h.x*Math.sin(g)+h.y*Math.cos(g);return{x:L+l,y:Y+f}})}function r(l,f){return{x:f.x-l.x,y:f.y-l.y}}function i(l){return{x:-l.y,y:l.x}}function o(l,f){let R=l.map((k)=>k.x*f.x+k.y*f.y);return{min:Math.min(...R),max:Math.max(...R)}}function a(l,f){return!(l.max<f.min||f.max<l.min)}let c=t(s.centerX,s.centerY,s.width,s.height,s.angle),n=t(e.centerX,e.centerY,e.width,e.height,e.angle),m=[...c.map((l,f)=>r(l,c[(f+1)%c.length])),...n.map((l,f)=>r(l,n[(f+1)%n.length]))];for(let l of m){let f=i(l),R=o(c,f),k=o(n,f);if(!a(R,k))return!1}return!0}move(s,e,t,r){if(!this.running)return;if(!s.visible())return;if(s.getAttr("health")<=0)return;return this.setSpeed(s,r),this.setDirection(s,e,t)}_turn(s,e,t){if(!this.running)return;if(!s.visible())return;if(s.getAttr("tween"))return;let r=Math.abs(t-s.rotation());if(r>180)r=360-r,t=s.rotation()+r;return new Promise((i,o)=>{let a=()=>{let n=s.getAttr("tween");if(n)s.setAttr("tween",null),n.reset(),n.destroy();e.off("abort",a),o()};e.once("abort",a);let c=new F.Tween({node:s,rotation:t,duration:ys*Math.abs(t-s.rotation()),easing:F.Easings.Linear,onFinish:()=>{let n=s.getAttr("tween");if(n)s.setAttr("tween",null),n.destroy();e.off("abort",a),i()}});s.setAttr("tween",c),c.play()})}setDirection(s,e,t){if(!this.running)return;if(!s.visible())return;if(s.getAttr("health")<=0)return;let r=-u.toNumber(t);return this._turn(s.getAttr("tank"),e,r)}getDirection(s){return u.wrapClamp(-s.getAttr("tank").rotation(),-179,180)}turnRight(s,e,t){if(!this.running)return;if(!s.visible())return;if(s.getAttr("health")<=0)return;let r=u.toNumber(t),i=this.getDirection(s)+r;return this.setDirection(s,e,i)}turnLeft(s,e,t){let r=u.toNumber(t);return this.turnRight(s,e,-r)}setSpeed(s,e){if(!this.running)return;if(!s.visible())return;if(s.getAttr("health")<=0)return;let t=u.toNumber(e)/this._speedRatio;s.setAttr("speed",t)}getSpeed(s){let e=s.getAttr("speed");return Math.round(e*this._speedRatio)}stop(s){this.setSpeed(s,0)}_hit(s,e){if(!this.running)return;if(!s.visible())return;if(s===e.getAttr("tankUnit"))return;let t=s.getAttr("tank"),r=s.position(),i=e.position(),o=u.distanceTo(r,i),a=Math.min(t.width(),t.height())*t.scaleX();if(o<a/2){let c=s.getAttr("health")-10;s.setAttr("health",c);return}if(o<a/1.414215){let c=s.getAttr("health")-5;s.setAttr("health",c);return}}_boom(s){if(!this.running)return;let e=new F.Sprite({x:s.x(),y:s.y(),image:this._boomImage,scale:s.scale(),rotation:s.rotation(),offsetX:this._boomImage.width/4/2,offsetY:this._boomImage.height/2,animation:"ready",animations:{boom:[80,0,80,80,160,0,80,80,240,0,80,80],ready:[0,0,80,80]},frameRate:6,frameIndex:0});this.boardLayer.add(e),e.start(),e.animation("boom"),e.on("frameIndexChange.button",()=>{if(e.frameIndex()===2)setTimeout(()=>{e.off(".button"),e.destroy()},1000/e.frameRate())}),s.visible(!1),this._hit(this.tanks.player,s),this._hit(this.tanks.red,s),this._hit(this.tanks.yellow,s),this._hit(this.tanks.green,s),s.destroy(),this.runtime.watchHealth([this.tanks.player.getAttr("health"),this.tanks.red.getAttr("health"),this.tanks.yellow.getAttr("health"),this.tanks.green.getAttr("health")])}attack(s,e,t,r){if(!this.running)return;if(!s.visible())return;if(s.getAttr("health")<=0)return;let i=s.getAttr("tank"),o=s.getAttr("turret");return new Promise(async(a,c)=>{let n=()=>{n.stopped=!0;let I=o.getAttr("bullet"),C=I.getAttr("tween");if(C)C.pause(),C.destroy(),I.destroy();e.off("abort",n),c()};e.once("abort",n);let m=new F.Image({tankUnit:s,image:this._bulletImage,offsetX:this._bulletImage.width/2,offsetY:this._bulletImage.height/2,scale:i.scale(),visible:!1});if(this.boardLayer.add(m),o.setAttr("bullet",m),o.getAttr("tween")){let I=o.getAttr("tween");o.setAttr("tween",null),I.pause(),I.destroy()}let l=-u.toNumber(t);if(await this._turn(o,e,l),n.stopped)return;if(s.getAttr("cooldown"))clearTimeout(s.getAttr("cooldown"));s.setAttr("cooldown",setTimeout(()=>s.setAttr("cooldown",null),we));let f=u.degToRad(l-90);m.setAttrs({x:s.x()+-Fs*Math.cos(f),y:s.y()+-Fs*Math.sin(f),visible:!0});let R=u.clamp(u.toNumber(r),be,Ee),k=-R*Math.cos(f),g=-R*Math.sin(f),N=m.x()+k,d=m.y()+g,z=R/this._bulletSpeed/this.runtime.fps,h=Date.now(),L=this._bulletSpeed/R/2,Y=new F.Tween({x:N,y:d,duration:z,node:m,easing:F.Easings.EaseInOut,onUpdate:()=>{let I=m.scaleX()+L;if(Date.now()-h>z/2*1000)I=m.scaleX()-L;m.setAttrs({scaleX:I,scaleY:I})},onFinish:()=>{this._boom(m);let I=m.getAttr("tween");m.setAttr("tween",null),I.destroy()}});m.setAttr("tween",Y),Y.play(),await qs(1),e.off("abort",n),a()})}_catch(s,e){if(!this.running)return;if(!s.visible())return;let t=e.getAttr("tankUnit");if(s===t)return;let r=e.rotation(),i=r+e.angle(),o=Math.min(r,i),a=Math.max(r,i),c=t.position(),n=s.position(),m=u.distanceTo(c,n),l=u.directionTo(c,n);if(l>o&&l<a&&m<xs)return m}async scan(s,e){if(!this.running)return;if(!s.visible())return;if(s.getAttr("health")<=0)return;let t=-u.toNumber(e)+90,r=u.clamp(s.getAttr("scanWidth"),Ne,de),i=xs,o=s.getAttr("radar");o.setAttrs({tankUnit:s,angle:r,radius:i,rotation:t-r/2,fillRadialGradientEndRadius:i*0.7,visible:!0}),await qs(ys*r*1.5),o.visible(!1);let a=this._catch(this.tanks.player,o)??1/0,c=this._catch(this.tanks.red,o)??1/0,n=this._catch(this.tanks.yellow,o)??1/0,m=this._catch(this.tanks.green,o)??1/0;return Math.min(a,c,n,m)}}class ss extends he{constructor(s,e){super(s,!1);this._onWatchHealth=e,this._tankUtils=new H(this),this._tanks=new Proxy(s,{get(t,r){return s.findOne(`#${r}`)}})}get tanks(){return this._tanks}get tankUtils(){return this._tankUtils}get watchHealth(){return this._onWatchHealth}_updateThresholds(){let s=this._thresholds.keys();for(let e of s){let[t,r]=e.split(">"),i;if(t==="TIMER")i=this.times>parseFloat(r);if(t==="DAMAGE")i=100-this.tanks.player.getAttr("health")>parseFloat(r);if(typeof i==="boolean"){if(i&&!this._thresholds.get(e))this.run(`threshold:${e}`);this._thresholds.set(e,i)}}}stop(){this.boardLayer.destroyChildren(),super.stop()}drives(s){this.tankUtils.drive(this.tanks.player,s),this.tankUtils.drive(this.tanks.red,s),this.tankUtils.drive(this.tanks.yellow,s),this.tankUtils.drive(this.tanks.green,s)}}import{Konva as T}from"@blockcode/utils";var Ts="./assets/tank-blue-b8ae4cvd.png";var Xs="./assets/turret-blue-dyrb04zn.png";var Ls="./assets/tank-red-ns7w7tad.png";var Ys="./assets/turret-red-ndwfv9ra.png";var Js="./assets/tank-yellow-0ggp5pb0.png";var As="./assets/turret-yellow-hzayg6vn.png";var Qs="./assets/tank-green-raz947mc.png";var Ws="./assets/turret-green-mg7ymk6e.png";var Ms="./assets/broken-0zqvhcjc.png";var D=(s)=>{return new Promise((e)=>{let t=new Image;t.src=s,t.onload=()=>e(t)})},$s={player:{tank:D(Ts),turret:D(Xs)},red:{tank:D(Ls),turret:D(Ys)},yellow:{tank:D(Js),turret:D(As)},green:{tank:D(Qs),turret:D(Ws)},broken:D(Ms)};function X(s,e,t,r=!1){let i=new T.Group({id:t,visible:r}),o=$s[t],a=new T.Image({tankUnit:i,scaleX:s,scaleY:e});o.tank.then((l)=>{a.setAttrs({image:l,offsetX:l.width/2,offsetY:l.height/2})}),i.add(a),i.setAttr("tank",a);let c=new T.Wedge({strokeWidth:0,fillRadialGradientStartRadius:0,fillRadialGradientColorStops:[0,"rgba(255 0 0 / 0.5)",1,"rgba(255 0 0 / 0)"],visible:!1});i.add(c),i.setAttr("radar",c);let n=new T.Image({tankUnit:i,scaleX:s,scaleY:e});o.turret.then((l)=>{n.setAttrs({image:l,offsetX:l.width/2,offsetY:l.height/2})}),i.add(n),i.setAttr("turret",n);let m=new T.Image({tankUnit:i,scaleX:s,scaleY:e,visible:!1});return $s.broken.then((l)=>{m.setAttrs({image:l,offsetX:l.width/2,offsetY:l.height/2})}),i.add(m),i.setAttr("broken",m),i}var Os="./assets/background-5h37gty1.png";import{jsx as Se}from"preact/jsx-runtime";var M=(s,e,t,r)=>{if(!s)return;s.setAttrs({x:e,y:t,health:100,speed:0,scanWidth:4,cooldown:null}),s.getAttr("broken")?.setAttr?.("visible",!1),s.getAttr("radar")?.setAttr?.("visible",!1);let i=s.getAttr("tank"),o=s.getAttr("turret"),a=i?.getAttr?.("tween");if(a)a.reset(),a.destroy();let c=o?.getAttr?.("tween");if(c)c.reset(),c.destroy();return setTimeout(()=>{i?.setAttrs?.({rotation:r,visible:!0,tween:null}),o?.setAttrs?.({rotation:r,visible:!0,tween:null})}),s};function Vs(){let{appState:s}=Me(),{file:e}=$e(),t=Qe(null),r=Bs(()=>{if(!s.value)return;if(!t.value?.tanks)return;M(t.value.tanks.player,-180,180,-135)?.setAttrs?.({name:e.value.name,zIndex:3}),M(t.value.tanks.red,180,-180,45)?.setAttr?.("visible",s.value.enemies>0),M(t.value.tanks.yellow,180,180,135)?.setAttr?.("visible",s.value.enemies>1),M(t.value.tanks.green,-180,-180,-45)?.setAttr?.("visible",s.value.enemies>2)},[]);Ss(async()=>{if(!t.value)return;if(s.value?.running===!0){let o="";o+=`const tankUtils = runtime.tankUtils;
`,o+=`((target /*${e.value.name}*/) => {
${e.value.script}})(runtime.tanks.player);

`,t.value.launch(`${o}runtime.start();`)}else if(s.value?.running===!1){if(t.value.running)t.value.stop(),r()}},[s.value?.running]),Ss(r,[t.value,s.value?.enemies]);let i=Bs((o)=>{let a=(l)=>{Oe({tanks:l.map((f,R)=>({...s.value.tanks[R],health:f}))})};t.value=new ss(o,a);let c=0.5,n=c*o.scaleY();We.Image.fromURL(Os,(l)=>{l.setAttrs({x:0,y:0,offsetX:l.width()/2,offsetY:l.height()/2,scaleX:c,scaleY:n}),t.value.backdropLayer.add(l)}),t.value.spritesLayer.add(X(c,n,"player",!0)),t.value.spritesLayer.add(X(c,n,"red")),t.value.spritesLayer.add(X(c,n,"yellow")),t.value.spritesLayer.add(X(c,n,"green"));let m=t.value.createAbortController();return t.value.on("frame",()=>t.value.drives(m.signal)),()=>{t.value=null}},[]);return Se(Be,{zoom:s.value?.stageSize!=="large"?0.8:1,width:480,height:480,onRuntime:i})}import{useCallback as es}from"preact/hooks";import{classNames as js}from"@blockcode/utils";import{useAppContext as Ge,translate as $,setAppState as ts,ToggleButtons as je}from"@blockcode/core";function w(s){let e=globalThis.document,t=e.createElement("style");t.appendChild(e.createTextNode(s)),e.head.append(t)}w(".bEtDYa_toolbar-wrapper{height:var(--tool-bar-height);padding:var(--space)0;flex-shrink:0;justify-content:space-between;align-items:center;display:flex}.bEtDYa_green-flag,.bEtDYa_stop-all{user-select:none;cursor:pointer;border:0;border-radius:.25rem;width:2rem;height:2rem;padding:.375rem}.bEtDYa_green-flag:hover,.bEtDYa_stop-all:hover{background:var(--theme-light-transparent)}.bEtDYa_green-flag.bEtDYa_actived{background:var(--theme-transparent)}.bEtDYa_stop-all{opacity:.5}.bEtDYa_stop-all.bEtDYa_actived{opacity:1}.bEtDYa_green-flag.bEtDYa_disabled,.bEtDYa_stop-all.bEtDYa_disabled{opacity:.5}.bEtDYa_toolbar-button{width:calc(2rem + 2px);height:calc(2rem + 2px);padding:.375rem!important}.bEtDYa_space{margin-left:.2rem}.bEtDYa_toolbar-buttons-group{display:flex}.bEtDYa_group-button-first{border-top-right-radius:0;border-bottom-right-radius:0}.bEtDYa_group-button{border-left:none;border-radius:0}.bEtDYa_group-button-last{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0}");var b={actived:"bEtDYa_actived",space:"bEtDYa_space",stopAll:"bEtDYa_stop-all",disabled:"bEtDYa_disabled",toolbarButton:"bEtDYa_toolbar-button",groupButtonLast:"bEtDYa_group-button-last",greenFlag:"bEtDYa_green-flag",groupButtonFirst:"bEtDYa_group-button-first",groupButton:"bEtDYa_group-button",toolbarButtonsGroup:"bEtDYa_toolbar-buttons-group",toolbarWrapper:"bEtDYa_toolbar-wrapper"};var Ks="./assets/icon-green-flag-tz1g77je.svg";var zs="./assets/icon-stop-all-zrx3gxr1.svg";var Cs="./assets/icon-small-stage-anyzs7w9.svg";var Gs="./assets/icon-large-stage-f6hyxzdr.svg";import{jsx as O,jsxs as Ps}from"preact/jsx-runtime";function Us(){let{appState:s}=Ge(),e=es(()=>{let i=s.value?.tanks?.map?.((o)=>({...o,health:100}));ts({tanks:i,running:!!i})},[]),t=es(()=>{ts("running",!1)},[]),r=es((i)=>{ts("stageSize",i)},[]);return Ps("div",{className:b.toolbarWrapper,children:[Ps("div",{className:b.toolbarButtonsGroup,children:[O("img",{className:js(b.greenFlag,{[b.actived]:s.value?.running}),src:Ks,title:$("tankwar.player.greenFlag","Fight"),onClick:e}),O("img",{className:js(b.stopAll,{[b.actived]:s.value?.running}),src:zs,title:$("tankwar.player.stopAll","Stop"),onClick:t})]}),O("div",{className:b.toolbarButtonsGroup,children:O(je,{items:[{icon:Cs,title:$("tankwar.stage.small","Switch to small stage"),value:"small"},{icon:Gs,title:$("tankwar.stage.large","Switch to large stage"),value:"large"}],value:s.value?.stageSize??"small",onChange:r})})]})}w(".ReTkdW_stage-wrapper{position:relative}.ReTkdW_stage{border:1px solid var(--ui-black-transparent);border-radius:var(--space);background:var(--ui-white);width:482px;height:482px;position:relative;overflow:hidden}.ReTkdW_small{width:386px;height:386px}");var B={stage:"ReTkdW_stage",small:"ReTkdW_small",stageWrapper:"ReTkdW_stage-wrapper"};import{jsx as rs,jsxs as He}from"preact/jsx-runtime";function Hs(){let{appState:s}=Ue();return He("div",{className:B.stageWrapper,children:[rs(Us,{}),rs("div",{className:Pe(B.stage,{[B.small]:s.value?.stageSize!=="large"}),children:rs(Vs,{})})]})}import{useAppContext as rt,useProjectContext as it,translate as v,setAppState as re}from"@blockcode/core";import{classNames as is}from"@blockcode/utils";import{Label as E,BufferedInput as ot,ToggleButtons as os}from"@blockcode/core";w("._OnGaW_stage-info-wrapper{margin-top:var(--space);background:var(--ui-white);color:var(--text-primary);border-radius:var(--space);border:1px solid var(--ui-black-transparent);padding:1rem}._OnGaW_row{justify-content:space-between;margin-top:.5rem;display:flex}._OnGaW_row-primary{margin-top:0}._OnGaW_group{flex-direction:row;align-items:center;display:inline-flex}._OnGaW_full-input{flex:1}._OnGaW_name-input{width:8rem}._OnGaW_button{min-width:calc(2rem + 2px);height:calc(2rem + 2px);padding:.375rem!important}._OnGaW_button-icon{margin:auto}._OnGaW_space{margin-left:.2rem}._OnGaW_toolbar-button-group{display:flex}._OnGaW_group-button-first{border-top-right-radius:0;border-bottom-right-radius:0}._OnGaW_group-button{border-left:none;border-radius:0}._OnGaW_group-button-last{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0}._OnGaW_button-text{flex:auto}._OnGaW_group-button-toggled-on ._OnGaW_button-text{color:#4c97ff}._OnGaW_tank-image{width:1.65rem}._OnGaW_health-progress{background:#f5f5f5;border-radius:10px;width:12rem;height:20px}._OnGaW_health-progress:before{counter-reset:progress var(--percent,0);content:counter(progress)\"% \";height:20px;width:calc(12rem*var(--percent,0)/100);color:var(--ui-white);text-align:right;white-space:nowrap;background:#ff6680;border-radius:10px;font-size:12px;line-height:20px;display:block;overflow:hidden}._OnGaW_health-progress._OnGaW_small{width:8rem}._OnGaW_health-progress._OnGaW_small:before{width:calc(8rem*var(--percent,0)/100)}");var _={groupButtonFirst:"_OnGaW_group-button-first",fullInput:"_OnGaW_full-input",group:"_OnGaW_group",toolbarButtonGroup:"_OnGaW_toolbar-button-group",groupButton:"_OnGaW_group-button",groupButtonToggledOn:"_OnGaW_group-button-toggled-on",stageInfoWrapper:"_OnGaW_stage-info-wrapper",nameInput:"_OnGaW_name-input",row:"_OnGaW_row",groupButtonLast:"_OnGaW_group-button-last",rowPrimary:"_OnGaW_row-primary",buttonIcon:"_OnGaW_button-icon",space:"_OnGaW_space",tankImage:"_OnGaW_tank-image",healthProgress:"_OnGaW_health-progress",buttonText:"_OnGaW_button-text",small:"_OnGaW_small",button:"_OnGaW_button"};var se="./assets/icon-tank-red-tq1cemhn.png";var ee="./assets/icon-tank-yellow-5vq6mndw.png";var te="./assets/icon-tank-green-4r293h2s.png";import{useCallback as as,useMemo as ki}from"preact/hooks";import{jsx as Z,jsxs as S}from"preact/jsx-runtime";var at=[se,ee,te];function ie(){let{appState:s}=rt(),{file:e,setFile:t}=it(),r=as((a)=>{t({name:a})},[]),i=as((a)=>{re("enemies",a)},[]),o=as((a)=>(c)=>{re("tanks",s.value.tanks.map((n)=>a===n.id?{...n,ai:c}:n))},[]);return S("div",{className:_.stageInfoWrapper,children:[S("div",{className:is(_.row,_.rowPrimary),children:[Z(E,{text:v("tankwar.stageInfo.player","Player"),children:Z(ot,{disabled:s.value?.running,className:_.nameInput,placeholder:v("tankwar.stageInfo.nickname","Nickname"),onSubmit:r,value:e.value.name})}),Z(E,{secondary:!0,className:_.health,text:v("tankwar.stageInfo.health","Health"),children:Z("div",{className:is(_.healthProgress,{[_.small]:s.value?.stageSize!=="large"}),style:`--percent:${s.value?.running?s.value?.tanks?.[0]?.health:100}`})})]}),S("div",{className:_.row,children:[Z(E,{secondary:!0,text:v("tankwar.stageInfo.enemies","Enemies"),children:Z(os,{disabled:s.value?.running,items:[{value:0,title:"0"},{value:1,title:"1"},{value:3,title:"3"}],value:s.value?.enemies??1,onChange:i})}),s.value?.enemies>0&&Z(E,{secondary:!0,children:Z(os,{disabled:s.value?.running,items:[{value:"local",title:v("tankwar.stageInfo.mode.local","Local AI")},{value:"remote",title:v("tankwar.stageInfo.mode.remote","Remote Players"),disabled:!0}],value:"local"})})]}),s.value?.tanks?.slice?.(1,s.value?.enemies+1)?.map?.((a,c)=>S("div",{className:_.row,children:[Z(E,{secondary:!0,children:Z("img",{className:_.tankImage,src:at[c],alt:a.name,title:a.name})}),Z(E,{secondary:!0,children:Z("div",{className:is(_.healthProgress,{[_.small]:s.value?.stageSize!=="large"}),style:`--percent:${s.value?.running?a.health:100}`})}),Z(E,{secondary:!0,text:v("tankwar.stageInfo.ai","AI"),children:Z(os,{disabled:s.value?.running,items:[{value:"simple",title:v("tankwar.stageInfo.ai.simple","Simple")},{value:"medium",title:v("tankwar.stageInfo.ai.medium","Medium")},{value:"senior",title:v("tankwar.stageInfo.ai.senior","Senior")}],value:a.ai??"simple",onChange:o(a.id)})})]},c))]})}w(".yg_RPq_sidebar-wrapper{flex-direction:column;height:100%;display:flex}.yg_RPq_stage-wrapper{display:flex}.yg_RPq_selector-wrapper{height:100%;margin-top:var(--space);flex-direction:row;display:flex}");var cs={selectorWrapper:"yg_RPq_selector-wrapper",sidebarWrapper:"yg_RPq_sidebar-wrapper",stageWrapper:"yg_RPq_stage-wrapper"};import{jsx as oe,jsxs as nt}from"preact/jsx-runtime";function ae(){return ct(()=>{lt({enemies:1,tanks:[{id:"player",name:V("tankwar.stageInfo.player","Player"),health:100},{id:"red",name:V("tankwar.stageInfo.enemy.red","Red"),health:100,ai:"simple"},{id:"yellow",name:V("tankwar.stageInfo.enemy.yellow","Yellow"),health:100,ai:"simple"},{id:"green",name:V("tankwar.stageInfo.enemy.green","Green"),health:100,ai:"simple"}]})},[]),nt("div",{className:cs.sidebarWrapper,children:[oe(Hs,{className:cs.stageWrapper}),oe(ie,{})]})}import{Text as mt}from"@blockcode/core";import{jsx as ft}from"preact/jsx-runtime";var ce={files:[{id:"player",name:ft(mt,{id:"tankwar.stageInfo.player",defaultMessage:"Player"})}]};var Oi={onNew(){return ce},onSave(s){return{files:s.map((e)=>({id:e.id,name:e.name,xml:e.xml}))}},async onThumb(){let s=document.querySelector(".konvajs-content");return(await pt(s))?.toDataURL()},onUndo(s){if(s instanceof MouseEvent)K.getMainWorkspace()?.undo?.(!1)},onRedo(s){if(s instanceof MouseEvent)K.getMainWorkspace()?.undo?.(!0)},onEnableUndo(){let s=K.getMainWorkspace();return s?.undoStack_&&s.undoStack_.length!==0},onEnableRedo(){let s=K.getMainWorkspace();return s?.redoStack_&&s.redoStack_.length!==0},tabs:[{...Rt,Content:_s}].concat([]),docks:[{expand:"right",Content:ae}]};export{Oi as default};
