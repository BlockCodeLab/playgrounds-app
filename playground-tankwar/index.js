import{addLocalesMessages as re}from"@blockcode/core";var ls={"tankwar.player.greenFlag":"Fight","tankwar.player.stopAll":"Stop","tankwar.stage.small":"Switch to small stage","tankwar.stage.large":"Switch to large stage","tankwar.stageInfo.player":"Player","tankwar.stageInfo.nickname":"Nickname","tankwar.stageInfo.enemies":"Enemies","tankwar.stageInfo.health":"Health","tankwar.stageInfo.enemy.red":"Red","tankwar.stageInfo.enemy.yellow":"Yellow","tankwar.stageInfo.enemy.green":"Green","tankwar.stageInfo.mode.local":"Local AI","tankwar.stageInfo.mode.remote":"Remote Players","tankwar.stageInfo.ai":"AI","tankwar.stageInfo.ai.simple":"Simple","tankwar.stageInfo.ai.medium":"Medium","tankwar.stageInfo.ai.senior":"Senior","tankwar.blocks.motion_attack":"fire in direction %1 at %2 steps","tankwar.blocks.motion_move":"forward in direction %1 at %2 % speed","tankwar.blocks.motion_setspeed":"set speed to %1 %","tankwar.blocks.motion_stop":"stop","tankwar.blocks.motion_speed":"speed","tankwar.blocks.sensing_scanwidth":"set scan width to %1","tankwar.blocks.sensing_scan":"scan for enemy in direction %1?","tankwar.blocks.sensing_distance":"measure distance of enemy in direction %1","tankwar.blocks.sensing_health":"health"};var ms={"tankwar.player.greenFlag":"开战","tankwar.player.stopAll":"停战","tankwar.stage.small":"缩小舞台","tankwar.stage.large":"放大舞台","tankwar.stageInfo.player":"玩家","tankwar.stageInfo.nickname":"昵称","tankwar.stageInfo.enemies":"敌方数量","tankwar.stageInfo.health":"生命值","tankwar.stageInfo.enemy.red":"红","tankwar.stageInfo.enemy.yellow":"黄","tankwar.stageInfo.enemy.green":"绿","tankwar.stageInfo.mode.local":"本机 AI","tankwar.stageInfo.mode.remote":"联网玩家","tankwar.stageInfo.ai":"AI 策略","tankwar.stageInfo.ai.simple":"简单","tankwar.stageInfo.ai.medium":"中等","tankwar.stageInfo.ai.senior":"高级","tankwar.blocks.motion_attack":"面向 %1 方向距离 %2 步发射炮弹","tankwar.blocks.motion_move":"以 %2 % 速度面向 %1 方向前进","tankwar.blocks.motion_setspeed":"将速度设为 %1 %","tankwar.blocks.motion_stop":"停止前进","tankwar.blocks.motion_speed":"速度","tankwar.blocks.sensing_scanwidth":"将雷达扫描宽度设为 %1","tankwar.blocks.sensing_scan":"雷达扫描 %1 方向有敌人？","tankwar.blocks.sensing_distance":"雷达测量 %1 方向敌人的距离","tankwar.blocks.sensing_health":"生命值"};var fs={"tankwar.player.greenFlag":"開戰","tankwar.player.stopAll":"停戰","tankwar.stage.small":"縮小舞台","tankwar.stage.large":"放大舞台","tankwar.stageInfo.player":"玩家","tankwar.stageInfo.nickname":"暱稱","tankwar.stageInfo.enemies":"敵方數量","tankwar.stageInfo.health":"生命值","tankwar.stageInfo.enemy.red":"紅","tankwar.stageInfo.enemy.yellow":"黃","tankwar.stageInfo.enemy.green":"綠","tankwar.stageInfo.mode.local":"本機 AI","tankwar.stageInfo.mode.remote":"聯網玩家","tankwar.stageInfo.ai":"AI 策略","tankwar.stageInfo.ai.simple":"簡單","tankwar.stageInfo.ai.medium":"中等","tankwar.stageInfo.ai.senior":"高級","tankwar.blocks.motion_attack":"面向 %1 方向距離 %2 步發射炮彈","tankwar.blocks.motion_move":"以 %2 % 速度面向 %1 方向前進","tankwar.blocks.motion_setspeed":"將速度設為 %1 %","tankwar.blocks.motion_stop":"停止前進","tankwar.blocks.motion_speed":"速度","tankwar.blocks.sensing_scanwidth":"將雷達掃描寬度設為 %1","tankwar.blocks.sensing_scan":"雷達掃描 %1 方向有敵人？","tankwar.blocks.sensing_distance":"雷達測量 %1 方向敵人的距離","tankwar.blocks.sensing_health":"生命值"};re({en:ls,"zh-Hans":ms,"zh-Hant":fs});import{html2canvas as Ii}from"@blockcode/utils";import{ScratchBlocks as G,blocksTab as vi,codeReviewTab as St}from"@blockcode/blocks";import{CodeReview as Kt}from"@blockcode/blocks";import{translate as N}from"@blockcode/core";import{ScratchBlocks as O,BlocksEditor as _e}from"@blockcode/blocks";import{EMUGenerator as ne}from"@blockcode/blocks";class d extends ne{}var D=d.prototype;D.motion_attack=function(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let i=this.valueToCode(s,"DIRECTION",this.ORDER_NONE)||"0",o=this.valueToCode(s,"DISTANCE",this.ORDER_NONE)||"100";return e+=`await tankUtils.attack(target, signal, ${i}, ${o});
`,e};D.motion_move=function(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let i=this.valueToCode(s,"DIRECTION",this.ORDER_NONE)||"0",o=this.valueToCode(s,"SPEED",this.ORDER_NONE)||"100";return e+=`await tankUtils.move(target, signal, ${i}, ${o});
`,e};D.motion_turnright=function(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let i=this.valueToCode(s,"DEGREES",this.ORDER_NONE)||0;return e+=`await tankUtils.turnRight(target, signal, ${i});
`,e};D.motion_turnleft=function(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let i=this.valueToCode(s,"DEGREES",this.ORDER_NONE)||0;return e+=`await tankUtils.turnLeft(target, signal, ${i});
`,e};D.motion_pointindirection=function(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let i=this.valueToCode(s,"DIRECTION",this.ORDER_NONE)||"0";return e+=`await tankUtils.setDirection(target, signal, ${i});
`,e};D.motion_setspeed=function(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let i=this.valueToCode(s,"SPEED",this.ORDER_NONE)||"0";return e+=`tankUtils.setSpeed(target, ${i});
`,e};D.motion_stop=function(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);return e+=`tankUtils.stop(target);
`,e};D.motion_xposition=function(s){return["target.x()",this.ORDER_FUNCTION_CALL]};D.motion_yposition=function(s){return["target.y()",this.ORDER_FUNCTION_CALL]};D.motion_speed=function(s){return["target.getAttr('currentSpeed')",this.ORDER_ATOMIC]};D.motion_direction=function(s){return["tankUtils.getDirection(target)",this.ORDER_ATOMIC]};var M=d.prototype;M.sensing_scanwidth=function(s){let e="";if(this.STATEMENT_PREFIX)e+=this.injectId(this.STATEMENT_PREFIX,s);let i=this.valueToCode(s,"WIDTH",this.ORDER_NONE)||5;return e+=`target.setAttr('scanWidth', ${i});
`,e};M.sensing_scan=function(s){return[`(await tankUtils.scan(target, ${this.valueToCode(s,"DIRECTION",this.ORDER_NONE)||0}) !== Infinity)`,this.ORDER_EQUALITY]};M.sensing_scandistance=function(s){return[`(await tankUtils.scan(target, ${this.valueToCode(s,"DIRECTION",this.ORDER_NONE)||0}))`,this.ORDER_FUNCTION_CALL]};M.sensing_health=function(){return["target.getAttr('health')",this.ORDER_FUNCTION_CALL]};import{ScratchBlocks as Ji,blockSeparator as k,categorySeparator as H,motionTheme as ae,sensingTheme as ce,operatorsTheme as le}from"@blockcode/blocks";import{ScratchBlocks as R}from"@blockcode/blocks";R.Blocks.motion_attack={init(){this.jsonInit({message0:R.Msg.MOTION_ATTACK,args0:[{type:"input_value",name:"DIRECTION"},{type:"input_value",name:"DISTANCE"}],category:R.Categories.motion,extensions:["colours_motion","shape_statement"]})}};R.Blocks.motion_move={init(){this.jsonInit({message0:R.Msg.MOTION_MOVE,args0:[{type:"input_value",name:"DIRECTION"},{type:"input_value",name:"SPEED"}],category:R.Categories.motion,extensions:["colours_motion","shape_statement"]})}};R.Blocks.motion_setspeed={init(){this.jsonInit({message0:R.Msg.MOTION_SETSPEED,args0:[{type:"input_value",name:"SPEED"}],category:R.Categories.motion,extensions:["colours_motion","shape_statement"]})}};R.Blocks.motion_stop={init(){this.jsonInit({message0:R.Msg.MOTION_STOP,category:R.Categories.motion,extensions:["colours_motion","shape_statement"]})}};R.Blocks.motion_speed={init(){this.jsonInit({message0:R.Msg.MOTION_SPEED,category:R.Categories.motion,checkboxInFlyout:!0,extensions:["colours_motion","output_number"]})}};import{ScratchBlocks as g}from"@blockcode/blocks";g.Blocks.sensing_scanwidth={init(){this.jsonInit({message0:g.Msg.SENSING_SCANWIDTH,args0:[{type:"input_value",name:"WIDTH"}],category:g.Categories.sensing,extensions:["colours_sensing","shape_statement"]})}};g.Blocks.sensing_scan={init(){this.jsonInit({message0:g.Msg.SENSING_SCAN,args0:[{type:"input_value",name:"DIRECTION"}],category:g.Categories.sensing,extensions:["colours_sensing","output_boolean"]})}};g.Blocks.sensing_scandistance={init(){this.jsonInit({message0:g.Msg.SENSING_DISTANCE,args0:[{type:"input_value",name:"DIRECTION"}],category:g.Categories.sensing,extensions:["colours_sensing","output_number"]})}};g.Blocks.sensing_health={init(){this.jsonInit({message0:g.Msg.SENSING_HEALTH,category:g.Categories.sensing,extensions:["colours_sensing","output_number"]})}};var me=()=>`
  <category name="%{BKY_CATEGORY_MOTION}" id="motion" ${ae}>
    <block type="motion_attack">
      <value name="DIRECTION">
        <shadow type="math_angle">
          <field name="NUM">90</field>
        </shadow>
      </value>
      <value name="DISTANCE">
        <shadow type="math_number">
          <field name="NUM">200</field>
        </shadow>
      </value>
    </block>
    <block type="motion_move">
      <value name="DIRECTION">
        <shadow type="math_angle">
          <field name="NUM">90</field>
        </shadow>
      </value>
      <value name="SPEED">
        <shadow type="math_number">
          <field name="NUM">100</field>
        </shadow>
      </value>
    </block>
    ${k}
    <block type="motion_turnright">
      <value name="DEGREES">
        <shadow type="math_number">
          <field name="NUM">15</field>
        </shadow>
      </value>
    </block>
    <block type="motion_turnleft">
      <value name="DEGREES">
        <shadow type="math_number">
          <field name="NUM">15</field>
        </shadow>
      </value>
    </block>
    <block type="motion_pointindirection">
      <value name="DIRECTION">
        <shadow type="math_angle">
          <field name="NUM">90</field>
        </shadow>
      </value>
    </block>
    ${k}
    <block type="motion_setspeed">
      <value name="SPEED">
        <shadow type="math_number">
          <field name="NUM">50</field>
        </shadow>
      </value>
    </block>
    <block type="motion_stop"/>
    ${k}
    <block type="motion_speed"/>
    <block type="motion_xposition"/>
    <block type="motion_yposition"/>
    <block type="motion_direction"/>
    ${H}
  </category>
`,fe=()=>`
  <category name="%{BKY_CATEGORY_SENSING}" id="sensing" ${ce}>
    <block type="sensing_scandistance">
      <value name="DIRECTION">
        <shadow type="math_angle">
          <field name="NUM">90</field>
        </shadow>
      </value>
    </block>
    <block type="sensing_scan">
      <value name="DIRECTION">
        <shadow type="math_angle">
          <field name="NUM">90</field>
        </shadow>
      </value>
    </block>
    ${k}
    <block type="sensing_scanwidth">
      <value name="WIDTH">
        <shadow type="math_number">
          <field name="NUM">5</field>
        </shadow>
      </value>
    </block>
    ${k}
    <block type="sensing_health"/>
    ${k}
    <block id="timer" type="sensing_timer"/>
    <block type="sensing_resettimer"/>
    ${H}
  </category>
`,pe=()=>`
  <category name="%{BKY_CATEGORY_OPERATORS}" id="operators" ${le}>
    <block type="operator_add">
      <value name="NUM1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="NUM2">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="operator_subtract">
      <value name="NUM1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="NUM2">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="operator_multiply">
      <value name="NUM1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="NUM2">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="operator_divide">
      <value name="NUM1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="NUM2">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    ${k}
    <block type="operator_random">
      <value name="FROM">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
      <value name="TO">
        <shadow type="math_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
    </block>
    ${k}
    <block type="operator_gt">
      <value name="OPERAND1">
        <shadow type="text">
          <field name="TEXT"/>
        </shadow>
      </value>
      <value name="OPERAND2">
        <shadow type="text">
          <field name="TEXT">50</field>
        </shadow>
      </value>
    </block>
    <block type="operator_lt">
      <value name="OPERAND1">
        <shadow type="text">
          <field name="TEXT"/>
        </shadow>
      </value>
      <value name="OPERAND2">
        <shadow type="text">
          <field name="TEXT">50</field>
        </shadow>
      </value>
    </block>
    <block type="operator_equals">
      <value name="OPERAND1">
        <shadow type="text">
          <field name="TEXT"/>
        </shadow>
      </value>
      <value name="OPERAND2">
        <shadow type="text">
          <field name="TEXT">50</field>
        </shadow>
      </value>
    </block>
    ${k}
    <block type="operator_and"/>
    <block type="operator_or"/>
    <block type="operator_not"/>
    ${k}
    <block type="operator_mod">
      <value name="NUM1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="NUM2">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="operator_round">
      <value name="NUM">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    ${k}
    <block type="operator_mathop">
      <value name="NUM">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    ${H}
  </category>
`;function ps(){return[{id:"motion",xml:me()},{id:"sensing",xml:fe()},{id:"operators",xml:pe()}]}import{jsx as Ze}from"preact/jsx-runtime";var Re=new d;function _s(){let s={MOTION_ATTACK:N("tankwar.blocks.motion_attack","fire in direction %1 at %2 steps"),MOTION_MOVE:N("tankwar.blocks.motion_move","forward in direction %1 at %2 % speed"),MOTION_SETSPEED:N("tankwar.blocks.motion_setspeed","set speed to %1 %"),MOTION_STOP:N("tankwar.blocks.motion_stop","stop"),MOTION_SPEED:N("tankwar.blocks.motion_speed","speed"),SENSING_SCANWIDTH:N("tankwar.blocks.sensing_scanwidth","set scan width to %1"),SENSING_SCAN:N("tankwar.blocks.sensing_scan","scan for enemy in direction %1?"),SENSING_DISTANCE:N("tankwar.blocks.sensing_distance","measure distance of enemy in direction %1"),SENSING_HEALTH:N("tankwar.blocks.sensing_health","health")};return O.Blocks.event_whenflagclicked={init(){this.jsonInit({message0:O.Msg.EVENT_WHENFLAGCLICKED,args0:[{type:"field_image",src:O.mainWorkspace.options.pathToMedia+"green-flag.svg",width:24,height:24,alt:"flag"}],category:O.Categories.event,extensions:["colours_event","shape_hat"]})}},Ze(_e,{disableExtension:!0,messages:s,emulator:Re,onMakeToolboxXML:ps})}import{useEffect as mi}from"preact/hooks";import{useLocalesContext as fi,translate as j,setAppState as pi}from"@blockcode/core";import{classNames as He}from"@blockcode/utils";import{useAppContext as si}from"@blockcode/core";import{useCallback as Ms,useEffect as Os}from"preact/hooks";import{useSignal as Me}from"@preact/signals";import{Konva as Oe}from"@blockcode/utils";import{useAppContext as $e,useProjectContext as Be,setAppState as Se}from"@blockcode/core";import{Emulator as Ve}from"@blockcode/blocks";import{sleepMs as io,MathUtils as oo}from"@blockcode/utils";import{Runtime as ye}from"@blockcode/blocks";var L=typeof Reflect=="object"?Reflect:null,Rs=L&&typeof L.apply=="function"?L.apply:function(s,e,i){return Function.prototype.apply.call(s,e,i)},$;L&&typeof L.ownKeys=="function"?$=L.ownKeys:Object.getOwnPropertySymbols?$=function(s){return Object.getOwnPropertyNames(s).concat(Object.getOwnPropertySymbols(s))}:$=function(s){return Object.getOwnPropertyNames(s)};function Ie(s){console&&console.warn&&console.warn(s)}var Is=Number.isNaN||function(s){return s!==s};function p(){p.init.call(this)}p.EventEmitter=p;p.prototype._events=void 0;p.prototype._eventsCount=0;p.prototype._maxListeners=void 0;var Zs=10;function B(s){if(typeof s!="function")throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof s)}Object.defineProperty(p,"defaultMaxListeners",{enumerable:!0,get:function(){return Zs},set:function(s){if(typeof s!="number"||s<0||Is(s))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+s+".");Zs=s}});p.init=function(){(this._events===void 0||this._events===Object.getPrototypeOf(this)._events)&&(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0};p.prototype.setMaxListeners=function(s){if(typeof s!="number"||s<0||Is(s))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+s+".");return this._maxListeners=s,this};function vs(s){return s._maxListeners===void 0?p.defaultMaxListeners:s._maxListeners}p.prototype.getMaxListeners=function(){return vs(this)};p.prototype.emit=function(s){for(var e=[],i=1;i<arguments.length;i++)e.push(arguments[i]);var o=s==="error",t=this._events;if(t!==void 0)o=o&&t.error===void 0;else if(!o)return!1;if(o){var r;if(e.length>0&&(r=e[0]),r instanceof Error)throw r;var a=new Error("Unhandled error."+(r?" ("+r.message+")":""));throw a.context=r,a}var n=t[s];if(n===void 0)return!1;if(typeof n=="function")Rs(n,this,e);else for(var l=n.length,m=ws(n,l),i=0;i<l;++i)Rs(m[i],this,e);return!0};function gs(s,e,i,o){var t,r,a;if(B(i),r=s._events,r===void 0?(r=s._events=Object.create(null),s._eventsCount=0):(r.newListener!==void 0&&(s.emit("newListener",e,i.listener?i.listener:i),r=s._events),a=r[e]),a===void 0)a=r[e]=i,++s._eventsCount;else if(typeof a=="function"?a=r[e]=o?[i,a]:[a,i]:o?a.unshift(i):a.push(i),t=vs(s),t>0&&a.length>t&&!a.warned){a.warned=!0;var n=new Error("Possible EventEmitter memory leak detected. "+a.length+" "+String(e)+" listeners added. Use emitter.setMaxListeners() to increase limit");n.name="MaxListenersExceededWarning",n.emitter=s,n.type=e,n.count=a.length,Ie(n)}return s}p.prototype.addListener=function(s,e){return gs(this,s,e,!1)};p.prototype.on=p.prototype.addListener;p.prototype.prependListener=function(s,e){return gs(this,s,e,!0)};function ve(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,arguments.length===0?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function us(s,e,i){var o={fired:!1,wrapFn:void 0,target:s,type:e,listener:i},t=ve.bind(o);return t.listener=i,o.wrapFn=t,t}p.prototype.once=function(s,e){return B(e),this.on(s,us(this,s,e)),this};p.prototype.prependOnceListener=function(s,e){return B(e),this.prependListener(s,us(this,s,e)),this};p.prototype.removeListener=function(s,e){var i,o,t,r,a;if(B(e),o=this._events,o===void 0)return this;if(i=o[s],i===void 0)return this;if(i===e||i.listener===e)--this._eventsCount===0?this._events=Object.create(null):(delete o[s],o.removeListener&&this.emit("removeListener",s,i.listener||e));else if(typeof i!="function"){for(t=-1,r=i.length-1;r>=0;r--)if(i[r]===e||i[r].listener===e){a=i[r].listener,t=r;break}if(t<0)return this;t===0?i.shift():ge(i,t),i.length===1&&(o[s]=i[0]),o.removeListener!==void 0&&this.emit("removeListener",s,a||e)}return this};p.prototype.off=p.prototype.removeListener;p.prototype.removeAllListeners=function(s){var e,i,o;if(i=this._events,i===void 0)return this;if(i.removeListener===void 0)return arguments.length===0?(this._events=Object.create(null),this._eventsCount=0):i[s]!==void 0&&(--this._eventsCount===0?this._events=Object.create(null):delete i[s]),this;if(arguments.length===0){var t=Object.keys(i),r;for(o=0;o<t.length;++o)r=t[o],r!=="removeListener"&&this.removeAllListeners(r);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if(e=i[s],typeof e=="function")this.removeListener(s,e);else if(e!==void 0)for(o=e.length-1;o>=0;o--)this.removeListener(s,e[o]);return this};function Ds(s,e,i){var o=s._events;if(o===void 0)return[];var t=o[e];return t===void 0?[]:typeof t=="function"?i?[t.listener||t]:[t]:i?ue(t):ws(t,t.length)}p.prototype.listeners=function(s){return Ds(this,s,!0)};p.prototype.rawListeners=function(s){return Ds(this,s,!1)};p.listenerCount=function(s,e){return typeof s.listenerCount=="function"?s.listenerCount(e):ks.call(s,e)};p.prototype.listenerCount=ks;function ks(s){var e=this._events;if(e!==void 0){var i=e[s];if(typeof i=="function")return 1;if(i!==void 0)return i.length}return 0}p.prototype.eventNames=function(){return this._eventsCount>0?$(this._events):[]};function ws(s,e){for(var i=new Array(e),o=0;o<e;++o)i[o]=s[o];return i}function ge(s,e){for(;e+1<s.length;e++)s[e]=s[e+1];s.pop()}function ue(s){for(var e=new Array(s.length),i=0;i<e.length;++i)e[i]=s[i].listener||s[i];return e}var Ki=p.prototype;import{sleep as bs,MathUtils as Z,Konva as A}from"@blockcode/utils";var Es="./assets/bullet-82yt94q7.png";var Ns="./assets/boom-0p27yacb.png";var we=2,hs=0.013888888888888888,Ee=1000,Ne=70,be=300,ds=20,he=200,de=2,qe=30,qs=400;class ss extends p{constructor(s){super();this._runtime=s,this._speedRatio=we*s.fps,this._bulletSpeed=he/s.fps,this._bulletImage=new Image,this._bulletImage.src=Es,this._boomImage=new Image,this._boomImage.src=Ns,this._maxX=s.backdropLayer.canvas.width/2,this._maxY=s.backdropLayer.canvas.height/2}get runtime(){return this._runtime}get running(){return this.runtime.running}get stage(){return this.runtime.stage}get backdropLayer(){return this.runtime.backdropLayer}get paintLayer(){return this.runtime.paintLayer}get spritesLayer(){return this.runtime.spritesLayer}get boardLayer(){return this.runtime.boardLayer}get tanks(){return this.runtime.tanks}drive(s,e){if(!this.running)return;if(!s.visible())return;let i=s.getAttr("tank"),o=s.getAttr("turret");if(s.getAttr("health")<=0){s.getAttr("broken").visible(!0),i.visible(!1),o.visible(!1);return}if(!s.getAttr("cooldown")&&!o.getAttr("tween")&&i.rotation()!==o.rotation())this._turn(o,e,i.rotation());let t=s.getAttr("speed");if(!t)return;let r=s.getAttr("tank").rotation(),a=Z.degToRad(r-90),n=-t*Math.cos(a),l=-t*Math.sin(a),m=s.x()+n,c=s.y()+l;if(m>this._maxX||m<-this._maxX)m=-1*Math.sign(m)*this._maxX;if(c>this._maxY||c<-this._maxY)c=-1*Math.sign(c)*this._maxY;this.spritesLayer.children.forEach((f)=>{if(!f.visible()||f===s)return;let _={centerX:f.x(),centerY:f.y(),width:f.getAttr("tank").getAttr("offsetX"),height:f.getAttr("tank").getAttr("offsetY"),angle:f.getAttr("tank").getAttr("rotation")},w={centerX:s.x(),centerY:s.y(),width:s.getAttr("tank").getAttr("offsetX"),height:s.getAttr("tank").getAttr("offsetY"),angle:s.getAttr("tank").getAttr("rotation")};if(this._detectCollision(_,w))s.setAttr("speed",0)}),s.position({x:m,y:c})}_haveIntersection(s,e){return!(e.centerX>s.centerX+s.width||e.centerX+e.width<s.centerX||e.centerY>s.centerY+s.height||e.centerY+e.height<s.centerY)}_detectCollision(s,e){function i(c,f,_,w,F){let x=_/2,T=w/2;return[{x:-x,y:-T},{x,y:-T},{x,y:T},{x:-x,y:T}].map((X)=>{let Q=X.x*Math.cos(F)-X.y*Math.sin(F),W=X.x*Math.sin(F)+X.y*Math.cos(F);return{x:Q+c,y:W+f}})}function o(c,f){return{x:f.x-c.x,y:f.y-c.y}}function t(c){return{x:-c.y,y:c.x}}function r(c,f){let _=c.map((w)=>w.x*f.x+w.y*f.y);return{min:Math.min(..._),max:Math.max(..._)}}function a(c,f){return!(c.max<f.min||f.max<c.min)}let n=i(s.centerX,s.centerY,s.width,s.height,s.angle),l=i(e.centerX,e.centerY,e.width,e.height,e.angle),m=[...n.map((c,f)=>o(c,n[(f+1)%n.length])),...l.map((c,f)=>o(c,l[(f+1)%l.length]))];for(let c of m){let f=t(c),_=r(n,f),w=r(l,f);if(!a(_,w))return!1}return!0}move(s,e,i,o){if(!this.running)return;if(!s.visible())return;if(s.getAttr("health")<=0)return;return this.setSpeed(s,o),this.setDirection(s,e,i)}_turn(s,e,i){if(!this.running)return;if(!s.visible())return;if(s.getAttr("tween"))return;let o=Math.abs(i-s.rotation());if(o>180)o=360-o,i=s.rotation()+o;return new Promise((t,r)=>{let a=()=>{let l=s.getAttr("tween");if(l)s.setAttr("tween",null),l.reset(),l.destroy();e.off("abort",a),r()};e.once("abort",a);let n=new A.Tween({node:s,rotation:i,duration:hs*Math.abs(i-s.rotation()),easing:A.Easings.Linear,onFinish:()=>{let l=s.getAttr("tween");if(l)s.setAttr("tween",null),l.destroy();e.off("abort",a),t()}});s.setAttr("tween",n),n.play()})}setDirection(s,e,i){if(!this.running)return;if(!s.visible())return;if(s.getAttr("health")<=0)return;let o=-Z.toNumber(i);return this._turn(s.getAttr("tank"),e,o)}getDirection(s){return Z.wrapClamp(-s.getAttr("tank").rotation(),-179,180)}turnRight(s,e,i){if(!this.running)return;if(!s.visible())return;if(s.getAttr("health")<=0)return;let o=Z.toNumber(i),t=this.getDirection(s)+o;return this.setDirection(s,e,t)}turnLeft(s,e,i){let o=Z.toNumber(i);return this.turnRight(s,e,-o)}setSpeed(s,e){if(!this.running)return;if(!s.visible())return;if(s.getAttr("health")<=0)return;let i=Z.toNumber(e)/this._speedRatio;s.setAttr("speed",i)}stop(s){this.setSpeed(s,0)}_hit(s,e){if(!this.running)return;if(!s.visible())return;if(s===e.getAttr("tankUnit"))return;let i=s.getAttr("tank"),o=s.position(),t=e.position(),r=Z.distanceTo(o,t),a=Math.min(i.width(),i.height())*i.scaleX();if(r<a/2){let n=s.getAttr("health")-10;s.setAttr("health",n);return}if(r<a/1.414215){let n=s.getAttr("health")-5;s.setAttr("health",n);return}}_boom(s){if(!this.running)return;let e=new A.Sprite({x:s.x(),y:s.y(),image:this._boomImage,scale:s.scale(),rotation:s.rotation(),offsetX:this._boomImage.width/4/2,offsetY:this._boomImage.height/2,animation:"ready",animations:{boom:[80,0,80,80,160,0,80,80,240,0,80,80],ready:[0,0,80,80]},frameRate:6,frameIndex:0});this.boardLayer.add(e),e.start(),e.animation("boom"),e.on("frameIndexChange.button",()=>{if(e.frameIndex()===2)setTimeout(()=>{e.off(".button"),e.destroy()},1000/e.frameRate())}),s.visible(!1),this._hit(this.tanks.player,s),this._hit(this.tanks.red,s),this._hit(this.tanks.yellow,s),this._hit(this.tanks.green,s),s.destroy(),this.runtime.watchHealth([this.tanks.player.getAttr("health"),this.tanks.red.getAttr("health"),this.tanks.yellow.getAttr("health"),this.tanks.green.getAttr("health")])}attack(s,e,i,o){if(!this.running)return;if(!s.visible())return;if(s.getAttr("health")<=0)return;let t=s.getAttr("tank"),r=s.getAttr("turret");return new Promise(async(a,n)=>{let l=()=>{l.stopped=!0;let u=r.getAttr("bullet"),U=u.getAttr("tween");if(U)U.pause(),U.destroy(),u.destroy();e.off("abort",l),n()};e.once("abort",l);let m=new A.Image({tankUnit:s,image:this._bulletImage,offsetX:this._bulletImage.width/2,offsetY:this._bulletImage.height/2,scale:t.scale(),visible:!1});if(this.boardLayer.add(m),r.setAttr("bullet",m),r.getAttr("tween")){let u=r.getAttr("tween");r.setAttr("tween",null),u.pause(),u.destroy()}let c=-Z.toNumber(i);if(await this._turn(r,e,c),l.stopped)return;if(s.getAttr("cooldown"))clearTimeout(s.getAttr("cooldown"));s.setAttr("cooldown",setTimeout(()=>s.setAttr("cooldown",null),Ee));let f=Z.degToRad(c-90);m.setAttrs({x:s.x()+-ds*Math.cos(f),y:s.y()+-ds*Math.sin(f),visible:!0});let _=Z.clamp(Z.toNumber(o),Ne,be),w=-_*Math.cos(f),F=-_*Math.sin(f),x=m.x()+w,T=m.y()+F,P=_/this._bulletSpeed/this.runtime.fps,X=Date.now(),Q=this._bulletSpeed/_/2,W=new A.Tween({x,y:T,duration:P,node:m,easing:A.Easings.EaseInOut,onUpdate:()=>{let u=m.scaleX()+Q;if(Date.now()-X>P/2*1000)u=m.scaleX()-Q;m.setAttrs({scaleX:u,scaleY:u})},onFinish:()=>{this._boom(m);let u=m.getAttr("tween");m.setAttr("tween",null),u.destroy()}});m.setAttr("tween",W),W.play(),await bs(1),e.off("abort",l),a()})}_catch(s,e){if(!this.running)return;if(!s.visible())return;let i=e.getAttr("tankUnit");if(s===i)return;let o=e.rotation(),t=o+e.angle(),r=Math.min(o,t),a=Math.max(o,t),n=i.position(),l=s.position(),m=Z.distanceTo(n,l),c=Z.directionTo(n,l);if(c>r&&c<a&&m<qs)return m}async scan(s,e){if(!this.running)return;if(!s.visible())return;if(s.getAttr("health")<=0)return;let i=-Z.toNumber(e)+90,o=Z.clamp(s.getAttr("scanWidth"),de,qe),t=qs,r=s.getAttr("radar");r.setAttrs({tankUnit:s,angle:o,radius:t,rotation:i-o/2,fillRadialGradientEndRadius:t*0.7,visible:!0}),await bs(hs*o*1.5),r.visible(!1);let a=this._catch(this.tanks.player,r)??1/0,n=this._catch(this.tanks.red,r)??1/0,l=this._catch(this.tanks.yellow,r)??1/0,m=this._catch(this.tanks.green,r)??1/0;return Math.min(a,n,l,m)}}class es extends ye{constructor(s,e){super(s,!1);this._onWatchHealth=e,this._tankUtils=new ss(this),this._tanks=new Proxy(s,{get(i,o){return s.findOne(`#${o}`)}})}get tanks(){return this._tanks}get tankUtils(){return this._tankUtils}get watchHealth(){return this._onWatchHealth}stop(){this.boardLayer.destroyChildren(),super.stop()}drives(s){this.tankUtils.drive(this.tanks.player,s),this.tankUtils.drive(this.tanks.red,s),this.tankUtils.drive(this.tanks.yellow,s),this.tankUtils.drive(this.tanks.green,s)}}import{Konva as J}from"@blockcode/utils";var ys="./assets/tank-blue-b8ae4cvd.png";var Fs="./assets/turret-blue-dyrb04zn.png";var xs="./assets/tank-red-ns7w7tad.png";var Ts="./assets/turret-red-ndwfv9ra.png";var Xs="./assets/tank-yellow-0ggp5pb0.png";var Ls="./assets/turret-yellow-hzayg6vn.png";var As="./assets/tank-green-raz947mc.png";var Js="./assets/turret-green-mg7ymk6e.png";var Ys="./assets/broken-0zqvhcjc.png";var b=(s)=>{return new Promise((e)=>{let i=new Image;i.src=s,i.onload=()=>e(i)})},Qs={player:{tank:b(ys),turret:b(Fs)},red:{tank:b(xs),turret:b(Ts)},yellow:{tank:b(Xs),turret:b(Ls)},green:{tank:b(As),turret:b(Js)},broken:b(Ys)};function Y(s,e,i,o=!1){let t=new J.Group({id:i,visible:o}),r=Qs[i],a=new J.Image({tankUnit:t,scaleX:s,scaleY:e});r.tank.then((c)=>{a.setAttrs({image:c,offsetX:c.width/2,offsetY:c.height/2})}),t.add(a),t.setAttr("tank",a);let n=new J.Wedge({strokeWidth:0,fillRadialGradientStartRadius:0,fillRadialGradientColorStops:[0,"rgba(255 0 0 / 0.5)",1,"rgba(255 0 0 / 0)"],visible:!1});t.add(n),t.setAttr("radar",n);let l=new J.Image({tankUnit:t,scaleX:s,scaleY:e});r.turret.then((c)=>{l.setAttrs({image:c,offsetX:c.width/2,offsetY:c.height/2})}),t.add(l),t.setAttr("turret",l);let m=new J.Image({tankUnit:t,scaleX:s,scaleY:e,visible:!1});return Qs.broken.then((c)=>{m.setAttrs({image:c,offsetX:c.width/2,offsetY:c.height/2})}),t.add(m),t.setAttr("broken",m),t}var Ws="./assets/background-5h37gty1.png";import{jsx as Ke}from"preact/jsx-runtime";var S=(s,e,i,o)=>{if(!s)return;s.setAttrs({x:e,y:i,health:100,speed:0,scanWidth:4,cooldown:null}),s.getAttr("broken")?.setAttr?.("visible",!1),s.getAttr("radar")?.setAttr?.("visible",!1);let t=s.getAttr("tank"),r=s.getAttr("turret"),a=t?.getAttr?.("tween");if(a)a.reset(),a.destroy();let n=r?.getAttr?.("tween");if(n)n.reset(),n.destroy();return setTimeout(()=>{t?.setAttrs?.({rotation:o,visible:!0,tween:null}),r?.setAttrs?.({rotation:o,visible:!0,tween:null})}),s};function $s(){let{appState:s}=$e(),{file:e}=Be(),i=Me(null),o=Ms(()=>{if(!s.value)return;if(!i.value?.tanks)return;S(i.value.tanks.player,-180,180,-135)?.setAttrs?.({name:e.value.name,zIndex:3}),S(i.value.tanks.red,180,-180,45)?.setAttr?.("visible",s.value.enemies>0),S(i.value.tanks.yellow,180,180,135)?.setAttr?.("visible",s.value.enemies>1),S(i.value.tanks.green,-180,-180,-45)?.setAttr?.("visible",s.value.enemies>2)},[]);Os(async()=>{if(!i.value)return;if(s.value?.running===!0){let r="";r+=`const tankUtils = runtime.tankUtils;
`,r+=`((target /*${e.value.name}*/) => {
${e.value.script}})(runtime.tanks.player);

`,i.value.launch(`${r}runtime.start();`)}else if(s.value?.running===!1){if(i.value.running)i.value.stop(),o()}},[s.value?.running]),Os(o,[i.value,s.value?.enemies]);let t=Ms((r)=>{let a=(c)=>{Se({tanks:c.map((f,_)=>({...s.value.tanks[_],health:f}))})};i.value=new es(r,a);let n=0.5,l=n*r.scaleY();Oe.Image.fromURL(Ws,(c)=>{c.setAttrs({x:0,y:0,offsetX:c.width()/2,offsetY:c.height()/2,scaleX:n,scaleY:l}),i.value.backdropLayer.add(c)}),i.value.spritesLayer.add(Y(n,l,"player",!0)),i.value.spritesLayer.add(Y(n,l,"red")),i.value.spritesLayer.add(Y(n,l,"yellow")),i.value.spritesLayer.add(Y(n,l,"green"));let m=i.value.createAbortController();return i.value.on("frame",()=>i.value.drives(m.signal)),()=>{i.value=null}},[]);return Ke(Ve,{zoom:s.value?.stageSize!=="large"?0.8:1,width:480,height:480,onRuntime:t})}import{useCallback as is}from"preact/hooks";import{classNames as zs}from"@blockcode/utils";import{useAppContext as Pe,translate as V,setAppState as os,ToggleButtons as Ue}from"@blockcode/core";function h(s){let e=globalThis.document,i=e.createElement("style");i.appendChild(e.createTextNode(s)),e.head.append(i)}h(".bEtDYa_toolbar-wrapper{height:var(--tool-bar-height);padding:var(--space)0;flex-shrink:0;justify-content:space-between;align-items:center;display:flex}.bEtDYa_green-flag,.bEtDYa_stop-all{user-select:none;cursor:pointer;border:0;border-radius:.25rem;width:2rem;height:2rem;padding:.375rem}.bEtDYa_green-flag:hover,.bEtDYa_stop-all:hover{background:var(--theme-light-transparent)}.bEtDYa_green-flag.bEtDYa_actived{background:var(--theme-transparent)}.bEtDYa_stop-all{opacity:.5}.bEtDYa_stop-all.bEtDYa_actived{opacity:1}.bEtDYa_green-flag.bEtDYa_disabled,.bEtDYa_stop-all.bEtDYa_disabled{opacity:.5}.bEtDYa_toolbar-button{width:calc(2rem + 2px);height:calc(2rem + 2px);padding:.375rem!important}.bEtDYa_space{margin-left:.2rem}.bEtDYa_toolbar-buttons-group{display:flex}.bEtDYa_group-button-first{border-top-right-radius:0;border-bottom-right-radius:0}.bEtDYa_group-button{border-left:none;border-radius:0}.bEtDYa_group-button-last{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0}");var q={toolbarButtonsGroup:"bEtDYa_toolbar-buttons-group",actived:"bEtDYa_actived",groupButtonFirst:"bEtDYa_group-button-first",toolbarWrapper:"bEtDYa_toolbar-wrapper",groupButton:"bEtDYa_group-button",space:"bEtDYa_space",disabled:"bEtDYa_disabled",greenFlag:"bEtDYa_green-flag",stopAll:"bEtDYa_stop-all",toolbarButton:"bEtDYa_toolbar-button",groupButtonLast:"bEtDYa_group-button-last"};var Bs="./assets/icon-green-flag-tz1g77je.svg";var Ss="./assets/icon-stop-all-zrx3gxr1.svg";var Vs="./assets/icon-small-stage-anyzs7w9.svg";var Ks="./assets/icon-large-stage-f6hyxzdr.svg";import{jsx as K,jsxs as Cs}from"preact/jsx-runtime";function js(){let{appState:s}=Pe(),e=is(()=>{let t=s.value?.tanks?.map?.((r)=>({...r,health:100}));os({tanks:t,running:!!t})},[]),i=is(()=>{os("running",!1)},[]),o=is((t)=>{os("stageSize",t)},[]);return Cs("div",{className:q.toolbarWrapper,children:[Cs("div",{className:q.toolbarButtonsGroup,children:[K("img",{className:zs(q.greenFlag,{[q.actived]:s.value?.running}),src:Bs,title:V("tankwar.player.greenFlag","Fight"),onClick:e}),K("img",{className:zs(q.stopAll,{[q.actived]:s.value?.running}),src:Ss,title:V("tankwar.player.stopAll","Stop"),onClick:i})]}),K("div",{className:q.toolbarButtonsGroup,children:K(Ue,{items:[{icon:Vs,title:V("tankwar.stage.small","Switch to small stage"),value:"small"},{icon:Ks,title:V("tankwar.stage.large","Switch to large stage"),value:"large"}],value:s.value?.stageSize??"small",onChange:o})})]})}h(".ReTkdW_stage-wrapper{position:relative}.ReTkdW_stage{border:1px solid var(--ui-black-transparent);border-radius:var(--space);background:var(--ui-white);width:482px;height:482px;position:relative;overflow:hidden}.ReTkdW_small{width:386px;height:386px}");var z={stage:"ReTkdW_stage",small:"ReTkdW_small",stageWrapper:"ReTkdW_stage-wrapper"};import{jsx as ts,jsxs as ei}from"preact/jsx-runtime";function Gs(){let{appState:s}=si();return ei("div",{className:z.stageWrapper,children:[ts(js,{}),ts("div",{className:He(z.stage,{[z.small]:s.value?.stageSize!=="large"}),children:ts($s,{})})]})}import{useLocalesContext as ri,useAppContext as ni,useProjectContext as ai,translate as E,setAppState as se}from"@blockcode/core";import{classNames as rs}from"@blockcode/utils";import{Text as ut,Button as Dt,Label as y,BufferedInput as ci,ToggleButtons as ns}from"@blockcode/core";h("._OnGaW_stage-info-wrapper{margin-top:var(--space);background:var(--ui-white);color:var(--text-primary);border-radius:var(--space);border:1px solid var(--ui-black-transparent);padding:1rem}._OnGaW_row{justify-content:space-between;margin-top:.5rem;display:flex}._OnGaW_row-primary{margin-top:0}._OnGaW_group{flex-direction:row;align-items:center;display:inline-flex}._OnGaW_full-input{flex:1}._OnGaW_name-input{width:8rem}._OnGaW_button{min-width:calc(2rem + 2px);height:calc(2rem + 2px);padding:.375rem!important}._OnGaW_button-icon{margin:auto}._OnGaW_space{margin-left:.2rem}._OnGaW_toolbar-button-group{display:flex}._OnGaW_group-button-first{border-top-right-radius:0;border-bottom-right-radius:0}._OnGaW_group-button{border-left:none;border-radius:0}._OnGaW_group-button-last{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0}._OnGaW_button-text{flex:auto}._OnGaW_group-button-toggled-on ._OnGaW_button-text{color:#4c97ff}._OnGaW_tank-image{width:1.65rem}._OnGaW_health-progress{background:#f5f5f5;border-radius:10px;width:12rem;height:20px}._OnGaW_health-progress:before{counter-reset:progress var(--percent,0);content:counter(progress)\"% \";height:20px;width:calc(12rem*var(--percent,0)/100);color:var(--ui-white);text-align:right;white-space:nowrap;background:#ff6680;border-radius:10px;font-size:12px;line-height:20px;display:block;overflow:hidden}._OnGaW_health-progress._OnGaW_small{width:8rem}._OnGaW_health-progress._OnGaW_small:before{width:calc(8rem*var(--percent,0)/100)}");var v={group:"_OnGaW_group",rowPrimary:"_OnGaW_row-primary",row:"_OnGaW_row",buttonText:"_OnGaW_button-text",small:"_OnGaW_small",nameInput:"_OnGaW_name-input",stageInfoWrapper:"_OnGaW_stage-info-wrapper",healthProgress:"_OnGaW_health-progress",space:"_OnGaW_space",button:"_OnGaW_button",fullInput:"_OnGaW_full-input",buttonIcon:"_OnGaW_button-icon",groupButton:"_OnGaW_group-button",groupButtonToggledOn:"_OnGaW_group-button-toggled-on",groupButtonLast:"_OnGaW_group-button-last",tankImage:"_OnGaW_tank-image",toolbarButtonGroup:"_OnGaW_toolbar-button-group",groupButtonFirst:"_OnGaW_group-button-first"};var Ps="./assets/icon-tank-red-tq1cemhn.png";var Us="./assets/icon-tank-yellow-5vq6mndw.png";var Hs="./assets/icon-tank-green-4r293h2s.png";import{useCallback as as,useMemo as ht}from"preact/hooks";import{jsx as I,jsxs as C}from"preact/jsx-runtime";var li=[Ps,Us,Hs];function ee(){let{translator:s}=ri(),{appState:e}=ni(),{file:i,setFile:o}=ai(),t=as((n)=>{o({name:n})},[]),r=as((n)=>{se("enemies",n)},[]),a=as((n)=>(l)=>{se("tanks",e.value.tanks.map((m)=>n===m.id?{...m,ai:l}:m))},[]);return C("div",{className:v.stageInfoWrapper,children:[C("div",{className:rs(v.row,v.rowPrimary),children:[I(y,{text:E("tankwar.stageInfo.player","Player"),children:I(ci,{disabled:e.value?.running,className:v.nameInput,placeholder:E("tankwar.stageInfo.nickname","Nickname"),onSubmit:t,value:i.value.name})}),I(y,{secondary:!0,className:v.health,text:E("tankwar.stageInfo.health","Health"),children:I("div",{className:rs(v.healthProgress,{[v.small]:e.value?.stageSize!=="large"}),style:`--percent:${e.value?.running?e.value?.tanks?.[0]?.health:100}`})})]}),C("div",{className:v.row,children:[I(y,{secondary:!0,text:E("tankwar.stageInfo.enemies","Enemies"),children:I(ns,{disabled:e.value?.running,items:[{value:0,title:"0"},{value:1,title:"1"},{value:3,title:"3"}],value:e.value?.enemies??1,onChange:r})}),e.value?.enemies>0&&I(y,{secondary:!0,children:I(ns,{disabled:e.value?.running,items:[{value:"local",title:E("tankwar.stageInfo.mode.local","Local AI",s)},{value:"remote",title:E("tankwar.stageInfo.mode.remote","Remote Players",s),disabled:!0}],value:"local"})})]}),e.value?.tanks?.slice?.(1,e.value?.enemies+1)?.map?.((n,l)=>C("div",{className:v.row,children:[I(y,{secondary:!0,children:I("img",{className:v.tankImage,src:li[l],alt:n.name,title:n.name})}),I(y,{secondary:!0,children:I("div",{className:rs(v.healthProgress,{[v.small]:e.value?.stageSize!=="large"}),style:`--percent:${e.value?.running?n.health:100}`})}),I(y,{secondary:!0,text:E("tankwar.stageInfo.ai","AI"),children:I(ns,{disabled:e.value?.running,items:[{value:"simple",title:E("tankwar.stageInfo.ai.simple","Simple",s)},{value:"medium",title:E("tankwar.stageInfo.ai.medium","Medium",s)},{value:"senior",title:E("tankwar.stageInfo.ai.senior","Senior",s)}],value:n.ai??"simple",onChange:a(n.id)})})]},l))]})}h(".yg_RPq_sidebar-wrapper{flex-direction:column;height:100%;display:flex}.yg_RPq_stage-wrapper{display:flex}.yg_RPq_selector-wrapper{height:100%;margin-top:var(--space);flex-direction:row;display:flex}");var cs={selectorWrapper:"yg_RPq_selector-wrapper",stageWrapper:"yg_RPq_stage-wrapper",sidebarWrapper:"yg_RPq_sidebar-wrapper"};import{jsx as ie,jsxs as _i}from"preact/jsx-runtime";function oe(){let{translator:s}=fi();return mi(()=>{pi({enemies:1,tanks:[{id:"player",name:j("tankwar.stageInfo.player","Player",s),health:100},{id:"red",name:j("tankwar.stageInfo.enemy.red","Red",s),health:100,ai:"simple"},{id:"yellow",name:j("tankwar.stageInfo.enemy.yellow","Yellow",s),health:100,ai:"simple"},{id:"green",name:j("tankwar.stageInfo.enemy.green","Green",s),health:100,ai:"simple"}]})},[]),_i("div",{className:cs.sidebarWrapper,children:[ie(Gs,{className:cs.stageWrapper}),ie(ee,{})]})}import{Text as Ri}from"@blockcode/core";import{jsx as Zi}from"preact/jsx-runtime";var te={files:[{id:"player",name:Zi(Ri,{id:"tankwar.stageInfo.player",defaultMessage:"Player"})}]};var Gt={onNew(){return te},onSave(s){return{files:s.map((e)=>({id:e.id,name:e.name,xml:e.xml}))}},async onThumb(){let s=document.querySelector(".konvajs-content");return(await Ii(s))?.toDataURL()},onUndo(s){if(s instanceof MouseEvent)G.getMainWorkspace()?.undo?.(!1)},onRedo(s){if(s instanceof MouseEvent)G.getMainWorkspace()?.undo?.(!0)},onEnableUndo(){let s=G.getMainWorkspace();return s?.undoStack_&&s.undoStack_.length!==0},onEnableRedo(){let s=G.getMainWorkspace();return s?.redoStack_&&s.redoStack_.length!==0},tabs:[{...vi,Content:_s}].concat([]),docks:[{expand:"right",Content:oe}]};export{Gt as default};
