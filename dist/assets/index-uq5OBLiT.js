var qp=Object.defineProperty;var uh=n=>{throw TypeError(n)};var $p=(n,t,e)=>t in n?qp(n,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[t]=e;var mn=(n,t,e)=>$p(n,typeof t!="symbol"?t+"":t,e),Dl=(n,t,e)=>t.has(n)||uh("Cannot "+e);var Z=(n,t,e)=>(Dl(n,t,"read from private field"),e?e.call(n):t.get(n)),le=(n,t,e)=>t.has(n)?uh("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(n):t.set(n,e),ce=(n,t,e,i)=>(Dl(n,t,"write to private field"),i?i.call(n,e):t.set(n,e),e),Nt=(n,t,e)=>(Dl(n,t,"access private method"),e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function e(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=e(r);fetch(r.href,s)}})();const qd=!1;var vl=Array.isArray,jp=Array.prototype.indexOf,Ga=Array.prototype.includes,gl=Array.from,$d=Object.defineProperty,ns=Object.getOwnPropertyDescriptor,Zp=Object.getOwnPropertyDescriptors,Kp=Object.prototype,Qp=Array.prototype,jd=Object.getPrototypeOf,hh=Object.isExtensible;function va(n){return typeof n=="function"}const Jp=()=>{};function tm(n){return n()}function Tc(n){for(var t=0;t<n.length;t++)n[t]()}function Zd(){var n,t,e=new Promise((i,r)=>{n=i,t=r});return{promise:e,resolve:n,reject:t}}const yn=2,Ks=4,to=8,Kd=1<<24,ci=16,mi=32,wr=64,Ac=128,Hu=256,di=512,nn=1024,Be=2048,Gn=4096,Tn=8192,Mn=16384,ua=32768,Wa=1<<25,Qs=65536,nl=1<<17,em=1<<18,ha=1<<19,Qd=1<<20,Ri=1<<25,il=1<<21,zs=1<<22,Mr=1<<23,Ji=Symbol("$state"),Jd=Symbol("component"),nm=Symbol("legacy props"),im=Symbol("attributes"),Rc=Symbol("class"),Cc=Symbol("style"),Pa=Symbol("text"),Wo=Symbol("form reset"),eo=new class extends Error{constructor(){super(...arguments);mn(this,"name","StaleReactionError");mn(this,"message","The reaction that called `getAbortSignal()` was re-run or destroyed")}},rm=1,sm=2,tf=4,am=8,om=16,lm=1,cm=2,ef={},en=Symbol("uninitialized"),um="http://www.w3.org/1999/xhtml",hm="http://www.w3.org/2000/svg",dm="http://www.w3.org/1998/Math/MathML";function fm(){console.warn("https://svelte.dev/e/derived_inert")}function pm(){console.warn("https://svelte.dev/e/select_multiple_invalid_value")}function mm(){console.warn("https://svelte.dev/e/svelte_boundary_reset_noop")}function nf(n){return n===this.v}function _m(n,t){return n!=n?t==t:n!==t||n!==null&&typeof n=="object"||typeof n=="function"}function rf(n){return!_m(n,this.v)}function sf(n){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function vm(){throw new Error("https://svelte.dev/e/async_derived_orphan")}function gm(n,t,e){throw new Error("https://svelte.dev/e/each_key_duplicate")}function xm(n){throw new Error("https://svelte.dev/e/effect_in_teardown")}function Mm(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function ym(n){throw new Error("https://svelte.dev/e/effect_orphan")}function Sm(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function Em(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function bm(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function wm(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}function Tm(){throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror")}let no=!1,Am=!1;function Rm(){no=!0}let ze=null;function Js(n){ze=n}function Ui(n,t=!1,e){ze={p:ze,i:!1,c:null,e:null,s:n,x:null,r:ge,l:no&&!t?{s:null,u:null,$:[]}:null}}function Ni(n){var t=ze,e=t.e;if(e!==null){t.e=null;for(var i of e)Pf(i)}return t.i=!0,ze=t.p,Vu(n)}function Vu(n={}){return $d(n,Jd,{value:!0}),n}function da(){return!no||ze!==null&&ze.l===null}let qr=[];function af(){var n=qr;qr=[],Tc(n)}function gr(n){if(qr.length===0&&!za){var t=qr;queueMicrotask(()=>{t===qr&&af()})}qr.push(n)}function Cm(){for(;qr.length>0;)af()}const Pm=-7169;function je(n,t){n.f=n.f&Pm|t}function Gu(n){(n.f&di)!==0||n.deps===null?je(n,nn):je(n,Gn)}function of(n,t){(n.f&Be)!==0?t.set(n,Be):(n.f&Gn)!==0&&t.get(n)!==Be&&t.set(n,Gn),je(n,nn)}let dh=!1;function Dm(){dh||(dh=!0,document.addEventListener("reset",n=>{Promise.resolve().then(()=>{var t;if(!n.defaultPrevented)for(const e of n.target.elements)(t=e[Wo])==null||t.call(e)})},{capture:!0}))}function io(n){var t=ue,e=ge;ti(null),Li(null);try{return n()}finally{ti(t),Li(e)}}function lf(n,t,e,i=e){n.addEventListener(t,()=>io(e));const r=n[Wo];r?n[Wo]=()=>{r(),i(!0)}:n[Wo]=()=>i(!0),Dm()}function Lm(n,t,e,i){const r=da()?xl:uf;var s=n.filter(m=>!m.settled),a=t.map(r);if(e.length===0&&s.length===0){i(a);return}var o=ge,l=Im(),c=s.length===1?s[0].promise:s.length>1?Promise.all(s.map(m=>m.promise)):null;function u(m){if((o.f&Mn)===0){l();try{i([...a,...m])}catch(_){wi(_,o)}rl()}}var h=cf();if(e.length===0){c.then(()=>u([])).finally(h);return}function f(){Promise.all(e.map(m=>Um(m))).then(u).catch(m=>wi(m,o)).finally(h)}c?c.then(()=>{if((o.f&Mn)!==0){h();return}l(),f(),rl()}):f()}function Im(){var n=ge,t=ue,e=ze,i=Gt;return function(s=!0){Li(n),ti(t),Js(e),s&&(n.f&Mn)===0&&(i==null||i.activate(),i==null||i.apply())}}function rl(n=!0){Li(null),ti(null),Js(null),n&&(Gt==null||Gt.deactivate())}function cf(){var n=ge,t=n.b,e=Gt,i=!!(t!=null&&t.is_rendered());return t==null||t.update_pending_count(1,e),e.increment(i,n),()=>{t==null||t.update_pending_count(-1,e),e.decrement(i,n)}}function xl(n){var t=yn|Be;return ge!==null&&(ge.f|=ha),{ctx:ze,deps:null,effects:null,equals:nf,f:t,fn:n,reactions:null,rv:0,v:en,wv:0,parent:ge,ac:null}}const Da=Symbol("obsolete");function Um(n,t,e){let i=ge;i===null&&vm();var r=void 0,s=as(en),a=!ue,o=new Set;return jm(()=>{var m,_;var l=ge,c=Zd();r=c.promise;try{Promise.resolve(n()).then(c.resolve,v=>{v!==eo&&c.reject(v)}).finally(rl)}catch(v){c.reject(v),rl()}var u=Gt;if(a){if((l.f&ua)!==0)var h=cf();if((m=i.b)!=null&&m.is_rendered())(_=u.async_deriveds.get(l))==null||_.reject(Da);else for(const v of o.values())v.reject(Da);o.add(c),u.async_deriveds.set(l,c)}const f=(v,p=void 0)=>{h==null||h(),o.delete(c),p!==Da&&(u.activate(),p?(s.f|=Mr,ta(s,p)):((s.f&Mr)!==0&&(s.f^=Mr),ta(s,v)),u.deactivate())};c.promise.then(f,v=>f(null,v||"unknown"))}),Cf(()=>{for(const l of o)l.reject(Da)}),new Promise(l=>{function c(u){function h(){u===r?l(s):c(r)}u.then(h,h)}c(r)})}function Te(n){const t=xl(n);return Of(t),t}function uf(n){const t=xl(n);return t.equals=rf,t}function Nm(n){var t=n.effects;if(t!==null){n.effects=null;for(var e=0;e<t.length;e+=1)In(t[e])}}function Wu(n){var t,e=ge,i=n.parent;if(!Tr&&i!==null&&n.v!==en&&(i.f&(Mn|Tn))!==0)return fm(),n.v;Li(i);try{Nm(n),t=Hf(n)}finally{Li(e)}return t}function hf(n){var t=Wu(n);if(!n.equals(t)&&(n.wv=zf(),(!(Gt!=null&&Gt.is_fork)||n.deps===null)&&(Gt!==null?(Gt.capture(n,t,!0),yr==null||yr.capture(n,t,!0)):n.v=t,n.deps===null))){je(n,nn);return}Tr||(dn!==null?(qu()||Gt!=null&&Gt.is_fork)&&dn.set(n,t):Gu(n))}function Fm(n){var t;if(n.effects!==null)for(const e of n.effects)(e.teardown||e.ac)&&((t=e.teardown)==null||t.call(e),e.ac!==null&&io(()=>{e.ac.abort(eo),e.ac=null}),e.fn!==null&&(e.teardown=Jp),Xa(e,0),ju(e))}function df(n){if(n.effects!==null)for(const t of n.effects)t.teardown&&t.fn!==null&&ea(t)}let Ll=null,ps=null,Gt=null,yr=null,dn=null,Pc=null,za=!1,Il=!1,ka=null,Xo=null;var fh=0;let Om=1;var Xs,Ys,qs,Yi,$s,qi,$a,Mi,yi,js,Qr,pe,Dc,ff,Lc,La,Ic,pf,mf,_f,Is,Bm,Ia;const pl=class pl{constructor(){le(this,pe);mn(this,"id",Om++);mn(this,"started",!1);mn(this,"linked",!0);mn(this,"prev",null);mn(this,"next",null);mn(this,"async_deriveds",new Map);mn(this,"current",new Map);mn(this,"previous",new Map);le(this,Xs,new Set);le(this,Ys,new Set);le(this,qs,0);le(this,Yi,new Map);le(this,$s,null);le(this,qi,[]);le(this,$a,[]);le(this,Mi,new Map);le(this,yi,new Map);le(this,js,new Set);mn(this,"is_fork",!1);le(this,Qr,!1);ps===null?Ll=ps=this:(ps.next=this,this.prev=ps),ps=this}skip_effect(t){Z(this,yi).has(t)||Z(this,yi).set(t,{d:[],m:[]}),Z(this,js).delete(t)}unskip_effect(t,e=i=>this.schedule(i)){var i=Z(this,yi).get(t);if(i){Z(this,yi).delete(t);for(var r of i.d)je(r,Be),e(r);for(r of i.m)je(r,Gn),e(r)}Z(this,js).add(t)}capture(t,e,i=!1){t.v!==en&&!this.previous.has(t)&&this.previous.set(t,t.v),(t.f&Mr)===0&&(this.current.set(t,[e,i]),dn==null||dn.set(t,e)),this.is_fork||(t.v=e)}activate(){Gt=this}deactivate(){Gt=null,dn=null}flush(){try{Il=!0,Gt=this,Nt(this,pe,La).call(this)}finally{fh=0,Pc=null,ka=null,Xo=null,Il=!1,Gt=null,dn=null,Pi.clear()}}discard(){var t;for(const e of Z(this,Ys))e(this);Z(this,Ys).clear();for(const e of this.async_deriveds.values())e.reject(Da);Nt(this,pe,Ia).call(this),(t=Z(this,$s))==null||t.resolve()}register_created_effect(t){Z(this,$a).push(t)}increment(t,e){if(ce(this,qs,Z(this,qs)+1),t){let i=Z(this,Yi).get(e)??0;Z(this,Yi).set(e,i+1)}}decrement(t,e){if(ce(this,qs,Z(this,qs)-1),t){let i=Z(this,Yi).get(e)??0;i===1?Z(this,Yi).delete(e):Z(this,Yi).set(e,i-1)}Z(this,Qr)||(ce(this,Qr,!0),gr(()=>{ce(this,Qr,!1),this.linked&&this.flush()}))}transfer_reactions(t){for(const[e,i]of t)this.add_dirty_reaction(e,i);t.clear()}add_dirty_reaction(t,e){(e===Be||Z(this,Mi).get(t)!==Be)&&Z(this,Mi).set(t,e)}oncommit(t){Z(this,Xs).add(t)}ondiscard(t){Z(this,Ys).add(t)}settled(){return(Z(this,$s)??ce(this,$s,Zd())).promise}static ensure(){if(Gt===null){const t=Gt=new pl;!Il&&!za&&gr(()=>{t.started||t.flush()})}return Gt}apply(){{dn=null;return}}schedule(t){var e;if(Pc=t,(e=t.b)!=null&&e.is_pending&&(t.f&(Ks|to|Kd))!==0&&(t.f&ua)===0){t.b.defer_effect(t);return}Z(this,qi).push(t)}};Xs=new WeakMap,Ys=new WeakMap,qs=new WeakMap,Yi=new WeakMap,$s=new WeakMap,qi=new WeakMap,$a=new WeakMap,Mi=new WeakMap,yi=new WeakMap,js=new WeakMap,Qr=new WeakMap,pe=new WeakSet,Dc=function(){if(this.is_fork)return!0;for(const t of Z(this,Yi).keys())if(!Nt(this,pe,ff).call(this,t))return!0;return!1},ff=function(t){for(var e=t;e!==null;e=e.parent)if(Z(this,yi).has(e))return!0;return!1},Lc=function(){var t=[];for(const s of Z(this,qi))if(!((s.f&Mn)!==0||(s.f&(Be|Gn))===0)){for(var e=s,i=!1;e.parent!==null;){e=e.parent;var r=e.f;if((r&(wr|mi))!==0){if((r&nn)===0){i=!0;break}e.f^=nn}}i||t.push(e)}return ce(this,qi,[]),t},La=function(){var o,l,c,u;this.started=!0;for(const[h,f]of Z(this,Mi))je(h,f),this.schedule(h);this.apply();for(var t=ka=[],e=[],i=Xo=[];Z(this,qi).length>0;){fh++>1e3&&(Nt(this,pe,Ia).call(this),km());for(const h of Nt(this,pe,Lc).call(this))try{Nt(this,pe,Ic).call(this,h,t,e)}catch(f){throw xf(h),Nt(this,pe,Dc).call(this)||this.discard(),f}}if(Gt=null,i.length>0){var r=pl.ensure();for(const h of i)r.schedule(h)}if(ka=null,Xo=null,Nt(this,pe,Dc).call(this)){Nt(this,pe,Is).call(this,e),Nt(this,pe,Is).call(this,t);for(const[h,f]of Z(this,yi))gf(h,f);i.length>0&&Nt(o=Gt,pe,La).call(o);return}const s=Nt(this,pe,pf).call(this);if(s){Nt(this,pe,Is).call(this,e),Nt(this,pe,Is).call(this,t),Nt(l=s,pe,_f).call(l,this);return}Z(this,Mi).clear();for(const h of Z(this,Xs))h(this);Z(this,Xs).clear(),yr=this,ph(e),ph(t),yr=null,(c=Z(this,$s))==null||c.resolve();var a=Gt;Z(this,qs)===0&&(Z(this,qi).length===0||a!==null)&&Nt(this,pe,Ia).call(this),a!==null&&(Pi.clear(),Nt(u=a,pe,La).call(u))},Ic=function(t,e,i){t.f^=nn;for(var r=t.first;r!==null;){var s=r.f,a=(s&(mi|wr))!==0,o=a&&(s&nn)!==0,l=o||(s&Tn)!==0||Z(this,yi).has(r);if(!l&&r.fn!==null){a?r.f^=nn:(s&Ks)!==0?e.push(r):so(r)&&((s&ci)!==0&&this.add_dirty_reaction(r,Gn),ea(r));var c=r.first;if(c!==null){r=c;continue}}for(;r!==null;){var u=r.next;if(u!==null){r=u;break}r=r.parent}}},pf=function(){for(var t=this.prev;t!==null;t=t.prev)if(!t.is_fork&&Nt(this,pe,mf).call(this,t))return t;return null},mf=function(t){for(const[e,[,i]]of this.current)if(!i&&t.current.has(e))return!0;return!1},_f=function(t){var i;for(const[r,s]of t.current)!this.previous.has(r)&&t.previous.has(r)&&this.previous.set(r,t.previous.get(r)),this.current.set(r,s);for(const[r,s]of t.async_deriveds){const a=this.async_deriveds.get(r);a&&s.promise.then(a.resolve).catch(a.reject)}t.async_deriveds.clear(),this.transfer_reactions(Z(t,Mi));const e=r=>{var s=r.reactions;if(s!==null&&!((r.f&yn)!==0&&(r.f&(Be|Gn))===0))for(const l of s){var a=l.f;if((a&yn)!==0)e(l);else{var o=l;a&(zs|ci)&&!this.async_deriveds.has(o)&&(Z(this,Mi).delete(o),je(o,Be),this.schedule(o))}}};for(const r of this.current.keys())e(r);this.oncommit(()=>t.discard()),Nt(i=t,pe,Ia).call(i),Gt=this,Nt(this,pe,La).call(this)},Is=function(t){for(var e=0;e<t.length;e+=1)of(t[e],Z(this,Mi))},Bm=function(){var h,f;for(let m=Ll;m!==null;m=m.next){var t=m.id<this.id,e=[];for(const[_,[v,p]]of this.current){if(m.current.has(_)){var i=m.current.get(_)[0];if(t&&v!==i)m.current.set(_,[v,p]);else continue}e.push(_)}if(t)for(const[_,v]of this.async_deriveds){const p=m.async_deriveds.get(_);p&&v.promise.then(p.resolve).catch(p.reject)}var r=[...m.current.keys()].filter(_=>!m.current.get(_)[1]);if(!(!m.started||r.length===0)){var s=r.filter(_=>!this.current.has(_));if(s.length===0)t&&m.discard();else if(e.length>0){if(t)for(const _ of Z(this,js))m.unskip_effect(_,v=>{var p;(v.f&(ci|zs))!==0?m.schedule(v):Nt(p=m,pe,Is).call(p,[v])});m.activate();var a=new Set,o=new Map;for(var l of e)vf(l,s,a,o);o=new Map;var c=[...m.current].filter(([_,v])=>{const p=this.current.get(_);return p?p[0]!==v[0]||p[1]!==v[1]:!0}).map(([_])=>_);if(c.length>0)for(const _ of Z(this,$a))(_.f&(Mn|Tn|nl))===0&&Xu(_,c,o)&&((_.f&(zs|ci))!==0?(je(_,Be),m.schedule(_)):m.add_dirty_reaction(_,Be));if(Z(m,qi).length>0&&!Z(m,Qr)){m.apply();for(var u of Nt(h=m,pe,Lc).call(h))Nt(f=m,pe,Ic).call(f,u,[],[])}m.deactivate()}}}},Ia=function(){if(this.linked){var t=this.prev,e=this.next;t===null?Ll=e:t.next=e,e===null?ps=t:e.prev=t,this.linked=!1}};let ss=pl;function zm(n){var t=za,e=yr;yr=null,za=!0;try{for(var i;;){if(Cm(),Gt===null)return i;Gt.flush()}}finally{za=t,yr=e}}function km(){try{Sm()}catch(n){wi(n,Pc)}}let oi=null;function ph(n){var t=n.length;if(t!==0){for(var e=0;e<t;){var i=n[e++];if((i.f&(Mn|Tn))===0&&so(i)&&(oi=new Set,ea(i),i.deps===null&&i.first===null&&i.nodes===null&&i.teardown===null&&i.ac===null&&Uf(i),(oi==null?void 0:oi.size)>0)){Pi.clear();for(const r of oi){if((r.f&(Mn|Tn))!==0)continue;const s=[r];let a=r.parent;for(;a!==null;)oi.has(a)&&(oi.delete(a),s.push(a)),a=a.parent;for(let o=s.length-1;o>=0;o--){const l=s[o];(l.f&(Mn|Tn))===0&&ea(l)}}oi.clear()}}oi=null}}function vf(n,t,e,i){if(!e.has(n)&&(e.add(n),n.reactions!==null))for(const r of n.reactions){const s=r.f;(s&yn)!==0?vf(r,t,e,i):(s&(zs|ci))!==0&&(s&Be)===0&&Xu(r,t,i)&&(je(r,Be),Yu(r))}}function Xu(n,t,e){const i=e.get(n);if(i!==void 0)return i;if(n.deps!==null)for(const r of n.deps){if(Ga.call(t,r))return!0;if((r.f&yn)!==0&&Xu(r,t,e))return e.set(r,!0),!0}return e.set(n,!1),!1}function Yu(n){Gt.schedule(n)}function gf(n,t){if(!((n.f&mi)!==0&&(n.f&nn)!==0)){(n.f&Be)!==0?t.d.push(n):(n.f&Gn)!==0&&t.m.push(n),je(n,nn);for(var e=n.first;e!==null;)gf(e,t),e=e.next}}function xf(n){je(n,nn);for(var t=n.first;t!==null;)xf(t),t=t.next}let sl=new Set;const Pi=new Map;let Mf=!1;function as(n,t){var e={f:0,v:n,reactions:null,equals:nf,rv:0,wv:0};return e}function Ge(n,t){const e=as(n);return Of(e),e}function Hm(n,t=!1,e=!0){var r;const i=as(n);return t||(i.equals=rf),no&&e&&ze!==null&&ze.l!==null&&((r=ze.l).s??(r.s=[])).push(i),i}function _e(n,t,e=!1){ue!==null&&(!ui||(ue.f&nl)!==0)&&da()&&(ue.f&(yn|ci|zs|nl))!==0&&(Di===null||!Di.has(n))&&wm();let i=e?ji(t):t;return ta(n,i,Xo)}var Gr=null,Uc=0;function ta(n,t,e=null){if(!n.equals(t)){Tr?Pi.set(n,t):Pi.has(n)||Pi.set(n,n.v);var i=ss.ensure();if(i.capture(n,t),(n.f&yn)!==0){const r=n;(n.f&Be)!==0&&Wu(r),dn===null&&Gu(r)}n.wv=zf(),Gr=null,Uc=0,yf(n,Be,e),Gr=null,da()&&ge!==null&&(ge.f&nn)!==0&&(ge.f&(mi|wr))===0&&($n===null?Km([n]):$n.push(n)),!i.is_fork&&sl.size>0&&!Mf&&Vm()}return t}function Vm(){Mf=!1;for(const n of sl){(n.f&nn)!==0&&je(n,Gn);let t;try{t=so(n)}catch{t=!0}t&&ea(n)}sl.clear()}function Ha(n){_e(n,n.v+1)}function yf(n,t,e){var i=n.reactions;if(i!==null){var r=da(),s=i.length;if(Uc+=s,Uc>1e5&&Gr===null&&(Gr=new Set),Gr!==null){if(Gr.has(n))return;Gr.add(n)}for(var a=0;a<s;a++){var o=i[a],l=o.f;if(!(!r&&o===ge)){var c=(l&Be)===0;if(c&&je(o,t),(l&nl)!==0)sl.add(o);else if((l&yn)!==0){var u=o;dn==null||dn.delete(u),yf(u,Gn,e)}else if(c){var h=o;(l&ci)!==0&&oi!==null&&oi.add(h),e!==null?e.push(h):Yu(h)}}}}}function ji(n){if(typeof n!="object"||n===null||Ji in n||Jd in n)return n;const t=jd(n);if(t!==Kp&&t!==Qp)return n;var e=new Map,i=vl(n),r=Ge(0),s=rs,a=o=>{if(rs===s)return o();var l=ue,c=rs;ti(null),gh(s);var u=o();return ti(l),gh(c),u};return i&&e.set("length",Ge(n.length)),new Proxy(n,{defineProperty(o,l,c){(!("value"in c)||c.configurable===!1||c.enumerable===!1||c.writable===!1)&&Em();var u=e.get(l);return u===void 0?a(()=>{var h=Ge(c.value);return e.set(l,h),h}):_e(u,c.value,!0),!0},deleteProperty(o,l){var c=e.get(l);if(c===void 0){if(l in o){const u=a(()=>Ge(en));e.set(l,u),Ha(r)}}else _e(c,en),Ha(r);return!0},get(o,l,c){var m;if(l===Ji)return n;var u=e.get(l),h=l in o;if(u===void 0&&(!h||(m=ns(o,l))!=null&&m.writable)&&(u=a(()=>{var _=ji(h?o[l]:en),v=Ge(_);return v}),e.set(l,u)),u!==void 0){var f=g(u);return f===en?void 0:f}return Reflect.get(o,l,c)},getOwnPropertyDescriptor(o,l){var f;(f=this.has)==null||f.call(this,o,l);var c=Reflect.getOwnPropertyDescriptor(o,l),u=e.get(l);if(u!==void 0){var h=g(u);if(h===en)return;if(c&&"value"in c)c.value=h;else return{enumerable:!0,configurable:!0,value:h,writable:!0}}return c},has(o,l){var f;if(l===Ji)return!0;var c=e.get(l),u=c!==void 0&&c.v!==en||Reflect.has(o,l);if(c!==void 0||(ge!==null||ue!==null)&&(!u||(f=ns(o,l))!=null&&f.writable)){c===void 0&&(c=a(()=>{var m=u?ji(o[l]):en,_=Ge(m);return _}),e.set(l,c));var h=g(c);if(h===en)return!1}return u},set(o,l,c,u){var b;var h=e.get(l),f=l in o;if(i&&l==="length")for(var m=c;m<h.v;m+=1){var _=e.get(m+"");_!==void 0?_e(_,en):m in o&&(_=a(()=>Ge(en)),e.set(m+"",_))}if(h===void 0)(!f||(b=ns(o,l))!=null&&b.writable)&&(h=a(()=>Ge(void 0)),_e(h,ji(c)),e.set(l,h));else{f=h.v!==en;var v=a(()=>ji(c));_e(h,v)}var p=Reflect.getOwnPropertyDescriptor(o,l);if(p!=null&&p.set&&p.set.call(u,c),!f){if(i&&typeof l=="string"){var d=e.get("length"),w=Number(l);Number.isInteger(w)&&w>=d.v&&_e(d,w+1)}Ha(r)}return!0},ownKeys(o){g(r);var l=Reflect.ownKeys(o).filter(h=>{var f=e.get(h);return f===void 0||f.v!==en});for(var[c,u]of e)u.v!==en&&!(c in o)&&l.push(c);return l},setPrototypeOf(){bm()}})}function mh(n){try{if(n!==null&&typeof n=="object"&&Ji in n)return n[Ji]}catch{}return n}function Sf(n,t){return Object.is(mh(n),mh(t))}var _h,Ef,bf,wf;function Gm(){if(_h===void 0){_h=window,Ef=/Firefox/.test(navigator.userAgent);var n=Element.prototype,t=Node.prototype,e=Text.prototype;bf=ns(t,"firstChild").get,wf=ns(t,"nextSibling").get,hh(n)&&(n[Rc]=void 0,n[im]=null,n[Cc]=void 0,n.__e=void 0),hh(e)&&(e[Pa]=void 0)}}function tr(n=""){return document.createTextNode(n)}function Zi(n){return bf.call(n)}function ro(n){return wf.call(n)}function $(n,t){return Zi(n)}function ln(n,t=!1){{var e=Zi(n);return e instanceof Comment&&e.data===""?ro(e):e}}function st(n,t=!1){return Zi(n)}function L(n,t=1,e=!1){let i=n;for(;t--;)i=ro(i);return i}function Wm(n){n.textContent=""}function Tf(){return!1}function Af(n,t,e){return t==null||t===um?e?document.createElement(n,{is:e}):document.createElement(n):e?document.createElementNS(t,n,{is:e}):document.createElementNS(t,n)}function Xm(n){var t=ge;if(t===null)return ue.f|=Mr,n;if((t.f&ua)===0&&(t.f&Ks)===0)throw n;wi(n,t)}function wi(n,t){if(n===ef)throw n;if(!(t!==null&&(t.f&Mn)!==0)){for(;t!==null;){if((t.f&Ac)!==0&&(t.f&(Mn|Wa))===0){if((t.f&ua)===0)throw n;try{t.b.error(n);return}catch(e){n=e}}t=t.parent}throw n}}function Rf(n){ge===null&&(ue===null&&ym(),Mm()),Tr&&xm()}function Ym(n,t){var e=t.last;e===null?t.last=t.first=n:(e.next=n,n.prev=e,t.last=n)}function Fi(n,t){var e=ge;e!==null&&(e.f&Tn)!==0&&(n|=Tn);var i={ctx:ze,deps:null,nodes:null,f:n|Be|di,first:null,fn:t,last:null,next:null,parent:e,b:e&&e.b,prev:null,teardown:null,wv:0,ac:null};Gt==null||Gt.register_created_effect(i);var r=i;if((n&Ks)!==0)ka!==null?ka.push(i):ss.ensure().schedule(i);else if(t!==null){try{ea(i)}catch(a){throw In(i),a}r.deps===null&&r.teardown===null&&r.nodes===null&&r.first===r.last&&(r.f&ha)===0&&(r=r.first,(n&ci)!==0&&(n&Qs)!==0&&r!==null&&(r.f|=Qs))}if(r!==null&&(r.parent=e,e!==null&&Ym(r,e),ue!==null&&(ue.f&yn)!==0&&(n&wr)===0)){var s=ue;(s.effects??(s.effects=[])).push(r)}return i}function qu(){return ue!==null&&!ui}function Cf(n){const t=Fi(to,null);return je(t,nn),t.teardown=n,t}function al(n){Rf();var t=ge.f,e=!ue&&(t&mi)!==0&&ze!==null&&!ze.i;if(e){var i=ze;(i.e??(i.e=[])).push(n)}else return Pf(n)}function Pf(n){return Fi(Ks|Qd,n)}function qm(n){return Rf(),Fi(to|Qd,n)}function $m(n){ss.ensure();const t=Fi(wr|ha,n);return(e={})=>new Promise(i=>{e.outro?is(t,()=>{In(t),i(void 0)}):(In(t),i(void 0))})}function Df(n){return Fi(Ks,n)}function jm(n){return Fi(zs|ha,n)}function $u(n,t=0){return Fi(to|t,n)}function zt(n,t=[],e=[],i=[]){Lm(i,t,e,r=>{Fi(to,()=>{n(...r.map(g))})})}function Ml(n,t=0){var e=Fi(ci|t,n);return e}function Kn(n){return Fi(mi|ha,n)}function Lf(n){var t=n.teardown;if(t!==null){const e=Tr,i=ue;vh(!0),ti(null);try{t.call(null)}catch(r){wi(r,n.parent)}finally{vh(e),ti(i)}}}function ju(n,t=!1){var e=n.first;for(n.first=n.last=null;e!==null;){const r=e.ac;r!==null&&io(()=>{r.abort(eo)});var i=e.next;(e.f&wr)!==0?e.parent=null:In(e,t),e=i}}function Zm(n){for(var t=n.first;t!==null;){var e=t.next;(t.f&mi)===0&&In(t),t=e}}function In(n,t=!0){var e=!1;(t||(n.f&em)!==0)&&n.nodes!==null&&n.nodes.end!==null&&(If(n.nodes.start,n.nodes.end),e=!0),n.f|=Wa,ju(n,t&&!e),Xa(n,0);var i=n.nodes&&n.nodes.t;if(i!==null)for(const s of i)s.stop();Lf(n),n.f^=Wa,n.f|=Mn;var r=n.parent;r!==null&&r.first!==null&&Uf(n),n.next=n.prev=n.teardown=n.ctx=n.deps=n.fn=n.nodes=n.ac=n.b=null}function If(n,t){for(;n!==null;){var e=n===t?null:ro(n);n.remove(),n=e}}function Uf(n){var t=n.parent,e=n.prev,i=n.next;e!==null&&(e.next=i),i!==null&&(i.prev=e),t!==null&&(t.first===n&&(t.first=i),t.last===n&&(t.last=e))}function is(n,t,e=!0){var i=[];n.f|=Hu,Nf(n,i,!0);var r=()=>{e&&In(n),t&&t()},s=i.length;if(s>0){var a=()=>--s||r();for(var o of i)o.out(a)}else r()}function Nf(n,t,e){if((n.f&Tn)===0){n.f^=Tn;var i=n.nodes&&n.nodes.t;if(i!==null)for(const o of i)(o.is_global||e)&&t.push(o);for(var r=n.first;r!==null;){var s=r.next;if((r.f&wr)===0){var a=(r.f&Qs)!==0||(r.f&mi)!==0&&(n.f&ci)!==0;Nf(r,t,a?e:!1)}r=s}}}function ol(n){n.f&=~Hu,Ff(n,!0)}function Ff(n,t){if((n.f&Hu)===0&&(n.f&Tn)!==0){n.f^=Tn,(n.f&nn)===0&&(je(n,Be),ss.ensure().schedule(n));for(var e=n.first;e!==null;){var i=e.next,r=(e.f&Qs)!==0||(e.f&mi)!==0;Ff(e,r?t:!1),e=i}var s=n.nodes&&n.nodes.t;if(s!==null)for(const a of s)(a.is_global||t)&&a.in()}}function Zu(n,t){if(n.nodes)for(var e=n.nodes.start,i=n.nodes.end;e!==null;){var r=e===i?null:ro(e);t.append(e),e=r}}let Tr=!1;function vh(n){Tr=n}let ue=null,ui=!1;function ti(n){ue=n}let ge=null;function Li(n){ge=n}let Di=null;function Of(n){ue!==null&&((ue.f&il)!==0||(ue.f&yn)!==0)&&(Di??(Di=new Set)).add(n)}let Dn=null,Hn=0,$n=null;function Km(n){$n=n}let Bf=1,$r=0,rs=$r;function gh(n){rs=n}function zf(){return++Bf}function so(n){var t=n.f;if((t&Be)!==0)return!0;if((t&Gn)!==0){for(var e=n.deps,i=e.length,r=0;r<i;r++){var s=e[r];if(so(s)&&hf(s),s.wv>n.wv)return!0}(t&di)!==0&&dn===null&&je(n,nn)}return!1}function kf(n,t,e=!0){var i=n.reactions;if(i!==null&&!(Di!==null&&Di.has(n)))for(var r=0;r<i.length;r++){var s=i[r];(s.f&yn)!==0?kf(s,t,!1):t===s&&(e?je(s,Be):(s.f&nn)!==0&&je(s,Gn),Yu(s))}}function Hf(n){var t=Dn,e=Hn,i=$n,r=ue,s=Di,a=ze,o=ui,l=rs,c=n.f;Dn=null,Hn=0,$n=null,ue=(c&(mi|wr))===0?n:null,Di=null,Js(n.ctx),ui=!1,rs=++$r,n.ac!==null&&(io(()=>{n.ac.abort(eo)}),n.ac=null);try{n.f|=il;var u=n.fn,h=u();n.f|=ua;var f=xh(n);if(da()&&$n!==null&&!ui&&f!==null&&(n.f&(yn|Gn|Be))===0)for(var m=0;m<$n.length;m++)kf($n[m],n);if(r!==null&&r!==n){if($r++,r.deps!==null)for(let _=0;_<e;_+=1)r.deps[_].rv=$r;if(t!==null)for(const _ of t)_.rv=$r;$n!==null&&(i===null?i=$n:i.push(...$n))}return(n.f&Mr)!==0&&(n.f^=Mr),h}catch(_){return xh(n),Xm(_)}finally{n.f^=il,Dn=t,Hn=e,$n=i,ue=r,Di=s,Js(a),ui=o,rs=l}}function xh(n){var r;var t=n.deps,e=Gt==null?void 0:Gt.is_fork;if(Dn!==null){var i;if(e||Xa(n,Hn),t!==null&&Hn>0)for(t.length=Hn+Dn.length,i=0;i<Dn.length;i++)t[Hn+i]=Dn[i];else n.deps=t=Dn;if(qu()&&(n.f&di)!==0)for(i=Hn;i<t.length;i++)((r=t[i]).reactions??(r.reactions=[])).push(n)}else!e&&t!==null&&Hn<t.length&&(Xa(n,Hn),t.length=Hn);return t}function Qm(n,t){let e=t.reactions;if(e!==null){var i=jp.call(e,n);if(i!==-1){var r=e.length-1;r===0?e=t.reactions=null:(e[i]=e[r],e.pop())}}if(e===null&&(t.f&yn)!==0&&(Dn===null||!Ga.call(Dn,t))){var s=t;(s.f&di)!==0&&(s.f^=di),s.v!==en&&Gu(s),s.ac!==null&&io(()=>{s.ac.abort(eo),s.ac=null,je(s,Be)}),Fm(s),Xa(s,0)}}function Xa(n,t){var e=n.deps;if(e!==null)for(var i=t;i<e.length;i++)Qm(n,e[i])}function ea(n){var t=n.f;if((t&Mn)===0){je(n,nn);var e=ge;ge=n;try{(t&(ci|Kd))!==0?Zm(n):ju(n),Lf(n);var i=Hf(n);n.teardown=typeof i=="function"?i:null,n.wv=Bf;var r;qd&&Am&&(n.f&Be)!==0&&n.deps}finally{ge=e}}}async function Jm(){await Promise.resolve(),zm()}function g(n){var t=n.f,e=(t&yn)!==0;if(ue!==null&&!ui){var i=ge!==null&&(ge.f&Mn)!==0;if(!i&&(Di===null||!Di.has(n))){var r=ue.deps;if((ue.f&il)!==0)n.rv<$r&&(n.rv=$r,Dn===null&&r!==null&&r[Hn]===n?Hn++:Dn===null?Dn=[n]:Dn.push(n));else{ue.deps??(ue.deps=[]),Ga.call(ue.deps,n)||ue.deps.push(n);var s=n.reactions;s===null?n.reactions=[ue]:Ga.call(s,ue)||s.push(ue)}}}if(Tr&&Pi.has(n))return Pi.get(n);if(e){var a=n;if(Tr){var o=a.v;return((a.f&nn)===0&&a.reactions!==null||Gf(a))&&(o=Wu(a)),Pi.set(a,o),o}var l=(a.f&di)===0&&!ui&&ue!==null&&(ue.f&di)!==0,c=(a.f&ua)===0;so(a)&&(l&&(a.f|=di),hf(a)),l&&!c&&(df(a),Vf(a))}if(dn!=null&&dn.has(n))return dn.get(n);if((n.f&Mr)!==0)throw n.v;return n.v}function Vf(n){if(n.f|=di,n.deps!==null)for(const e of n.deps){var t=e.reactions;t===null?e.reactions=[n]:Ga.call(t,n)||t.push(n),(e.f&yn)!==0&&(e.f&di)===0&&(df(e),Vf(e))}}function Gf(n){if(n.v===en)return!0;if(n.deps===null)return!1;for(const t of n.deps)if(Pi.has(t)||(t.f&yn)!==0&&Gf(t))return!0;return!1}function fa(n){var t=ui;try{return ui=!0,n()}finally{ui=t}}function t_(n){if(!(typeof n!="object"||!n||n instanceof EventTarget)){if(Ji in n)Nc(n);else if(!Array.isArray(n))for(let t in n){const e=n[t];typeof e=="object"&&e&&Ji in e&&Nc(e)}}}function Nc(n,t=new Set){if(typeof n=="object"&&n!==null&&!(n instanceof EventTarget)&&!t.has(n)){t.add(n),n instanceof Date&&n.getTime();for(let i in n)try{Nc(n[i],t)}catch{}const e=jd(n);if(e!==Object.prototype&&e!==Array.prototype&&e!==Map.prototype&&e!==Set.prototype&&e!==Date.prototype){const i=Zp(e);for(let r in i){const s=i[r].get;if(s)try{s.call(n)}catch{}}}}}const e_=["touchstart","touchmove"];function n_(n){return e_.includes(n)}const jr=Symbol("events"),Wf=new Set,Fc=new Set;function ie(n,t,e){(t[jr]??(t[jr]={}))[n]=e}function rr(n){for(var t=0;t<n.length;t++)Wf.add(n[t]);for(var e of Fc)e(n)}let Ul=null,Nl=!1;function Mh(n){var v,p;var t=this,e=t.ownerDocument,i=n.type,r=((v=n.composedPath)==null?void 0:v.call(n))||[],s=r[0]||n.target;Ul=n,Nl||(Nl=!0,setTimeout(()=>{Nl=!1,Ul=null}));var a=0,o=Ul===n&&n[jr];if(o){var l=r.indexOf(o);if(l!==-1&&(t===document||t===window)){n[jr]=t;return}var c=r.indexOf(t);if(c===-1)return;l<=c&&(a=l)}if(s=r[a]||n.target,s!==t){$d(n,"currentTarget",{configurable:!0,get(){return s||e}});var u=ue,h=ge;ti(null),Li(null);try{for(var f,m=[];s!==null&&s!==t;){try{var _=(p=s[jr])==null?void 0:p[i];_!=null&&(!s.disabled||n.target===s)&&_.call(s,n)}catch(d){f?m.push(d):f=d}if(n.cancelBubble)break;a++,s=a<r.length?r[a]:null}if(f){for(let d of m)queueMicrotask(()=>{throw d});throw f}}finally{n[jr]=t,delete n.currentTarget,ti(u),Li(h)}}}var Xd;const Fl=((Xd=globalThis==null?void 0:globalThis.window)==null?void 0:Xd.trustedTypes)&&globalThis.window.trustedTypes.createPolicy("svelte-trusted-html",{createHTML:n=>n});function i_(n){return(Fl==null?void 0:Fl.createHTML(n))??n}function r_(n){var t=Af("template");return t.innerHTML=i_(n.replaceAll("<!>","<!---->")),t.content}function na(n,t){var e=ge;e.nodes===null&&(e.nodes={start:n,end:t,a:null,t:null})}function Mt(n,t){var e=(t&lm)!==0,i=(t&cm)!==0,r,s=!n.startsWith("<!>");return()=>{r===void 0&&(r=r_(s?n:"<!>"+n),e||(r=Zi(r)));var a=i||Ef?document.importNode(r,!0):r.cloneNode(!0);if(e){var o=Zi(a),l=a.lastChild;na(o,l)}else na(a,a);return a}}function Oc(n=""){{var t=tr(n+"");return na(t,t),t}}function Ar(){var n=document.createDocumentFragment(),t=document.createComment(""),e=tr();return n.append(t,e),na(t,e),n}function dt(n,t){n!==null&&n.before(t)}function s_(n){let t=0,e=as(0),i;return()=>{qu()&&(g(e),$u(()=>(t===0&&(i=fa(()=>n(()=>Ha(e)))),t+=1,()=>{gr(()=>{t-=1,t===0&&(i==null||i(),i=void 0,Ha(e))})})))}}var a_=Qs|ha;function o_(n,t,e,i){new l_(n,t,e,i)}var jn,ku,Zn,Jr,gn,Bn,wn,zn,Si,ts,vr,Zs,ja,$i,ml,ve,c_,u_,Bc,pr,h_,zc,Ua,Yo,kc,Hc;class l_{constructor(t,e,i,r){le(this,ve);mn(this,"parent");mn(this,"is_pending",!1);mn(this,"transform_error");le(this,jn);le(this,ku,null);le(this,Zn);le(this,Jr);le(this,gn);le(this,Bn,null);le(this,wn,null);le(this,zn,null);le(this,Si,null);le(this,ts,0);le(this,vr,0);le(this,Zs,!1);le(this,ja,new Map);le(this,$i,null);le(this,ml,s_(()=>(ce(this,$i,as(Z(this,ts))),()=>{ce(this,$i,null)})));var s;ce(this,jn,t),ce(this,Zn,e),ce(this,Jr,a=>{var o=ge;o.b=this,o.f|=Ac,i(a)}),this.parent=ge.b,this.transform_error=r??((s=this.parent)==null?void 0:s.transform_error)??(a=>a),ce(this,gn,Ml(()=>{Nt(this,ve,zc).call(this)},a_))}defer_effect(t){of(t,Z(this,ja))}is_rendered(){return!this.is_pending&&(!this.parent||this.parent.is_rendered())}has_pending_snippet(){return!!Z(this,Zn).pending}update_pending_count(t,e){Nt(this,ve,kc).call(this,t,e),ce(this,ts,Z(this,ts)+t),!(!Z(this,$i)||Z(this,Zs))&&(ce(this,Zs,!0),gr(()=>{ce(this,Zs,!1),Z(this,$i)&&ta(Z(this,$i),Z(this,ts))}))}get_effect_pending(){return Z(this,ml).call(this),g(Z(this,$i))}error(t){if(t===ef||!Z(this,Zn).onerror&&!Z(this,Zn).failed)throw t;Gt!=null&&Gt.is_fork?(Z(this,Bn)&&Gt.skip_effect(Z(this,Bn)),Z(this,wn)&&Gt.skip_effect(Z(this,wn)),Z(this,zn)&&Gt.skip_effect(Z(this,zn)),Gt.oncommit(()=>{Nt(this,ve,pr).call(this)||Nt(this,ve,Hc).call(this,t)})):Nt(this,ve,Hc).call(this,t)}}jn=new WeakMap,ku=new WeakMap,Zn=new WeakMap,Jr=new WeakMap,gn=new WeakMap,Bn=new WeakMap,wn=new WeakMap,zn=new WeakMap,Si=new WeakMap,ts=new WeakMap,vr=new WeakMap,Zs=new WeakMap,ja=new WeakMap,$i=new WeakMap,ml=new WeakMap,ve=new WeakSet,c_=function(){try{ce(this,Bn,Kn(()=>Z(this,Jr).call(this,Z(this,jn))))}catch(t){this.error(t)}},u_=function(t){const e=Z(this,Zn).failed,{reset:i,invoke_onerror:r}=Nt(this,ve,Bc).call(this,t);gr(r),e&&ce(this,zn,Kn(()=>{e(Z(this,jn),()=>t,()=>i)}))},Bc=function(t){var e=!1,i=!1;const r=()=>{if(!Nt(this,ve,pr).call(this)){if(e){mm();return}e=!0,i&&Tm(),Z(this,zn)!==null&&is(Z(this,zn),()=>{ce(this,zn,null)}),Nt(this,ve,Yo).call(this,()=>{Nt(this,ve,zc).call(this)})}};return{reset:r,invoke_onerror:()=>{var a,o;if(!Nt(this,ve,pr).call(this))try{i=!0,(o=(a=Z(this,Zn)).onerror)==null||o.call(a,t,r),i=!1}catch(l){wi(l,Z(this,gn)&&Z(this,gn).parent)}}}},pr=function(){return(Z(this,gn).f&(Mn|Wa))!==0},h_=function(){const t=Z(this,Zn).pending;t&&(this.is_pending=!0,ce(this,wn,Kn(()=>t(Z(this,jn)))),gr(()=>{if(!Nt(this,ve,pr).call(this)){var e=ce(this,Si,document.createDocumentFragment()),i=tr(),r=!1;if(e.append(i),ce(this,Bn,Nt(this,ve,Yo).call(this,()=>{try{return Kn(()=>Z(this,Jr).call(this,i))}catch(s){try{this.error(s),r=!0}catch(a){wi(a,Z(this,gn).parent)}return null}})),Z(this,Bn)===null){ce(this,Si,null),r&&Nt(this,ve,Ua).call(this,Gt);return}Z(this,vr)===0&&(Z(this,jn).before(e),ce(this,Si,null),is(Z(this,wn),()=>{ce(this,wn,null)}),Nt(this,ve,Ua).call(this,Gt))}}))},zc=function(){try{if(this.is_pending=this.has_pending_snippet(),ce(this,vr,0),ce(this,ts,0),ce(this,Bn,Kn(()=>{Z(this,Jr).call(this,Z(this,jn))})),Z(this,vr)>0){var t=ce(this,Si,document.createDocumentFragment());Zu(Z(this,Bn),t);const e=Z(this,Zn).pending;ce(this,wn,Kn(()=>e(Z(this,jn))))}else Nt(this,ve,Ua).call(this,Gt)}catch(e){this.error(e)}},Ua=function(t){this.is_pending=!1,t.transfer_reactions(Z(this,ja))},Yo=function(t){var e=ge,i=ue,r=ze;Li(Z(this,gn)),ti(Z(this,gn)),Js(Z(this,gn).ctx);try{return ss.ensure(),t()}finally{Li(e),ti(i),Js(r)}},kc=function(t,e){var i;if(!this.has_pending_snippet()){this.parent&&Nt(i=this.parent,ve,kc).call(i,t,e);return}ce(this,vr,Z(this,vr)+t),Z(this,vr)===0&&(Nt(this,ve,Ua).call(this,e),Z(this,wn)&&is(Z(this,wn),()=>{ce(this,wn,null)}),Z(this,Si)&&(Z(this,jn).before(Z(this,Si)),ce(this,Si,null)))},Hc=function(t){Z(this,Bn)&&(In(Z(this,Bn)),ce(this,Bn,null)),Z(this,wn)&&(In(Z(this,wn)),ce(this,wn,null)),Z(this,zn)&&(In(Z(this,zn)),ce(this,zn,null));let e=Z(this,Zn).failed;const i=r=>{if(Nt(this,ve,pr).call(this))return;const{reset:s,invoke_onerror:a}=Nt(this,ve,Bc).call(this,r);a(),e&&!Nt(this,ve,pr).call(this)&&ce(this,zn,Nt(this,ve,Yo).call(this,()=>{try{return Kn(()=>{var o=ge;o.b=this,o.f|=Ac,e(Z(this,jn),()=>r,()=>s)})}catch(o){return wi(o,Z(this,gn).parent),null}}))};gr(()=>{if(!Nt(this,ve,pr).call(this)){var r;try{r=this.transform_error(t)}catch(s){wi(s,Z(this,gn)&&Z(this,gn).parent);return}r!==null&&typeof r=="object"&&typeof r.then=="function"?r.then(i,s=>wi(s,Z(this,gn)&&Z(this,gn).parent)):i(r)}})};function tt(n,t){var e=t==null?"":typeof t=="object"?`${t}`:t;e!==(n[Pa]??(n[Pa]=n.nodeValue))&&(n[Pa]=e,n.nodeValue=`${e}`)}function d_(n,t){return f_(n,t)}const lo=new Map;function f_(n,{target:t,anchor:e,props:i={},events:r,context:s,intro:a=!0,transformError:o}){Gm();var l=void 0,c=$m(()=>{var u=e??t.appendChild(tr());o_(u,{pending:()=>{}},m=>{Ui({});var _=ze;s&&(_.c=s),r&&(i.$$events=r),l=n(m,i)||Vu(),Ni()},o);var h=new Set,f=m=>{for(var _=0;_<m.length;_++){var v=m[_];if(!h.has(v)){h.add(v);var p=n_(v);for(const b of[t,document]){var d=lo.get(b);d===void 0&&(d=new Map,lo.set(b,d));var w=d.get(v);w===void 0?(b.addEventListener(v,Mh,{passive:p}),d.set(v,1)):d.set(v,w+1)}}}};return f(gl(Wf)),Fc.add(f),()=>{var p;for(var m of h)for(const d of[t,document]){var _=lo.get(d),v=_.get(m);--v==0?(d.removeEventListener(m,Mh),_.delete(m),_.size===0&&lo.delete(d)):_.set(m,v)}Fc.delete(f),u!==e&&((p=u.parentNode)==null||p.removeChild(u))}});return p_.set(l,c),l}let p_=new WeakMap;var li,Ei,kn,es,Za,Ka,_l;class Xf{constructor(t,e=!0){mn(this,"anchor");le(this,li,new Map);le(this,Ei,new Map);le(this,kn,new Map);le(this,es,new Set);le(this,Za,!0);le(this,Ka,t=>{if(Z(this,li).has(t)){var e=Z(this,li).get(t),i=Z(this,Ei).get(e);if(i)ol(i),Z(this,es).delete(e);else{var r=Z(this,kn).get(e);r&&(ol(r.effect),Z(this,Ei).set(e,r.effect),Z(this,kn).delete(e),r.fragment.lastChild.remove(),this.anchor.before(r.fragment),i=r.effect)}for(const[s,a]of Z(this,li)){if(Z(this,li).delete(s),s===t)break;const o=Z(this,kn).get(a);o&&(In(o.effect),Z(this,kn).delete(a))}for(const[s,a]of Z(this,Ei)){if(s===e||Z(this,es).has(s))continue;const o=()=>{if(Array.from(Z(this,li).values()).includes(s)){var c=document.createDocumentFragment();Zu(a,c),c.append(tr()),Z(this,kn).set(s,{effect:a,fragment:c})}else In(a);Z(this,es).delete(s),Z(this,Ei).delete(s)};Z(this,Za)||!i?(Z(this,es).add(s),is(a,o,!1)):o()}}});le(this,_l,t=>{Z(this,li).delete(t);const e=Array.from(Z(this,li).values());for(const[i,r]of Z(this,kn))e.includes(i)||(In(r.effect),Z(this,kn).delete(i))});this.anchor=t,ce(this,Za,e)}ensure(t,e){var i=Gt,r=Tf();if(e&&!Z(this,Ei).has(t)&&!Z(this,kn).has(t))if(r){var s=document.createDocumentFragment(),a=tr();s.append(a),Z(this,kn).set(t,{effect:Kn(()=>e(a)),fragment:s})}else Z(this,Ei).set(t,Kn(()=>e(this.anchor)));if(Z(this,li).set(i,t),r){for(const[o,l]of Z(this,Ei))o===t?i.unskip_effect(l):i.skip_effect(l);for(const[o,l]of Z(this,kn))o===t?i.unskip_effect(l.effect):i.skip_effect(l.effect);i.oncommit(Z(this,Ka)),i.ondiscard(Z(this,_l))}else Z(this,Ka).call(this,i)}}li=new WeakMap,Ei=new WeakMap,kn=new WeakMap,es=new WeakMap,Za=new WeakMap,Ka=new WeakMap,_l=new WeakMap;function Qt(n,t,e=!1){var i=new Xf(n),r=e?Qs:0;function s(a,o){i.ensure(a,o)}Ml(()=>{var a=!1;t((o,l=0)=>{a=!0,s(l,o)}),a||s(-1,null)},r)}const m_=Symbol("NaN");function Yf(n,t,e){var i=new Xf(n),r=!da();Ml(()=>{var s=t();s!==s&&(s=m_),r&&s!==null&&typeof s=="object"&&(s={}),i.ensure(s,e)})}function Wn(n,t){return t}function __(n,t,e){for(var i=[],r=t.length,s,a=t.length,o=0;o<r;o++){let h=t[o];is(h,()=>{if(s){if(s.pending.delete(h),s.done.add(h),s.pending.size===0){var f=n.outrogroups;Vc(n,gl(s.done)),f.delete(s),f.size===0&&(n.outrogroups=null)}}else a-=1},!1)}if(a===0){var l=i.length===0&&e!==null&&n.pending.size===0;if(l){var c=e,u=c.parentNode;Wm(u),u.append(c),n.items.clear()}Vc(n,t,!l)}else s={pending:new Set(t),done:new Set},(n.outrogroups??(n.outrogroups=new Set)).add(s)}function Vc(n,t,e=!0){var i;if(n.pending.size>0){i=new Set;for(const a of n.pending.values())for(const o of a)i.add(n.items.get(o).e)}for(var r=0;r<t.length;r++){var s=t[r];if(i!=null&&i.has(s)){s.f|=Ri;const a=document.createDocumentFragment();Zu(s,a)}else In(t[r],e)}}var yh;function Ie(n,t,e,i,r,s=null){var a=n,o=new Map,l=(t&tf)!==0;if(l){var c=n;a=c.appendChild(tr())}var u=null,h=uf(()=>{var w=e();return vl(w)?w:w==null?[]:gl(w)}),f=new Map,m=!0;function _(w){if((d.effect.f&Mn)===0){d.pending.delete(w);var b=g(h);d.fallback=u,v_(d,b,a,t,i),u!==null&&(b.length===0?(u.f&Ri)===0?ol(u):(u.f^=Ri,Na(u,null,a)):is(u,()=>{u=null}))}}function v(w){d.pending.delete(w)}var p=Ml(()=>{for(var w=g(h),b=w.length,S=new Set,D=Gt,C=Tf(),R=0;R<b;R+=1){var P=w[R],y=i(P,R),M=m?null:o.get(y);M?(M.v&&ta(M.v,P),M.i&&ta(M.i,R),C&&D.unskip_effect(M.e)):(M=g_(o,m?a:yh??(yh=tr()),P,y,R,r,t,e),m||(M.e.f|=Ri),o.set(y,M)),S.add(y)}if(b===0&&s&&!u&&(m?u=Kn(()=>s(a)):(u=Kn(()=>s(yh??(yh=tr()))),u.f|=Ri)),b>S.size&&gm(),!m)if(f.set(D,S),C){for(const[A,O]of o)S.has(A)||D.skip_effect(O.e);D.oncommit(_),D.ondiscard(v)}else _(D);g(h)}),d={effect:p,items:o,pending:f,outrogroups:null,fallback:u};m=!1}function ga(n){for(;n!==null&&(n.f&mi)===0;)n=n.next;return n}function v_(n,t,e,i,r){var M,A,O,U,k,W,X,j,G;var s=(i&am)!==0,a=t.length,o=n.items,l=ga(n.effect.first),c,u=null,h,f=[],m=[],_,v,p,d;if(s)for(d=0;d<a;d+=1)_=t[d],v=r(_,d),p=o.get(v).e,(p.f&Ri)===0&&((A=(M=p.nodes)==null?void 0:M.a)==null||A.measure(),(h??(h=new Set)).add(p));for(d=0;d<a;d+=1){if(_=t[d],v=r(_,d),p=o.get(v).e,n.outrogroups!==null)for(const V of n.outrogroups)V.pending.delete(p),V.done.delete(p);if((p.f&Tn)!==0&&(ol(p),s&&((U=(O=p.nodes)==null?void 0:O.a)==null||U.unfix(),(h??(h=new Set)).delete(p))),(p.f&Ri)!==0)if(p.f^=Ri,p===l)Na(p,null,e);else{var w=u?u.next:l;p===n.effect.last&&(n.effect.last=p.prev),p.prev&&(p.prev.next=p.next),p.next&&(p.next.prev=p.prev),ar(n,u,p),ar(n,p,w),Na(p,w,e),u=p,f=[],m=[],l=ga(u.next);continue}if(p!==l){if(c!==void 0&&c.has(p)){if(f.length<m.length){var b=m[0],S;u=b.prev;var D=f[0],C=f[f.length-1];for(S=0;S<f.length;S+=1)Na(f[S],b,e);for(S=0;S<m.length;S+=1)c.delete(m[S]);ar(n,D.prev,C.next),ar(n,u,D),ar(n,C,b),l=b,u=C,d-=1,f=[],m=[]}else c.delete(p),Na(p,l,e),ar(n,p.prev,p.next),ar(n,p,u===null?n.effect.first:u.next),ar(n,u,p),u=p;continue}for(f=[],m=[];l!==null&&l!==p;)(c??(c=new Set)).add(l),m.push(l),l=ga(l.next);if(l===null)continue}(p.f&Ri)===0&&f.push(p),u=p,l=ga(p.next)}if(n.outrogroups!==null){for(const V of n.outrogroups)V.pending.size===0&&(Vc(n,gl(V.done)),(k=n.outrogroups)==null||k.delete(V));n.outrogroups.size===0&&(n.outrogroups=null)}if(l!==null||c!==void 0){var R=[];if(c!==void 0)for(p of c)(p.f&Tn)===0&&R.push(p);for(;l!==null;)(l.f&Tn)===0&&l!==n.fallback&&R.push(l),l=ga(l.next);var P=R.length;if(P>0){var y=(i&tf)!==0&&a===0?e:null;if(s){for(d=0;d<P;d+=1)(X=(W=R[d].nodes)==null?void 0:W.a)==null||X.measure();for(d=0;d<P;d+=1)(G=(j=R[d].nodes)==null?void 0:j.a)==null||G.fix()}__(n,R,y)}}s&&gr(()=>{var V,lt;if(h!==void 0)for(p of h)(lt=(V=p.nodes)==null?void 0:V.a)==null||lt.apply()})}function g_(n,t,e,i,r,s,a,o){var l=(a&rm)!==0?(a&om)===0?Hm(e,!1,!1):as(e):null,c=(a&sm)!==0?as(r):null;return{v:l,i:c,e:Kn(()=>(s(t,l??e,c??r,o),()=>{n.delete(i)}))}}function Na(n,t,e){if(n.nodes)for(var i=n.nodes.start,r=n.nodes.end,s=t&&(t.f&Ri)===0?t.nodes.start:e;i!==null;){var a=ro(i);if(s.before(i),i===r)return;i=a}}function ar(n,t,e){t===null?n.effect.first=e:t.next=e,e===null?n.effect.last=t:e.prev=t}function x_(n,t,e=!1,i=!1,r=!1,s=!1){var a=n,o="";if(e)var l=n;zt(()=>{var c=ge;if(o!==(o=t()??"")){if(e){c.nodes=null,l.innerHTML=o,o!==""&&na(Zi(l),l.lastChild);return}if(c.nodes!==null&&(If(c.nodes.start,c.nodes.end),c.nodes=null),o!==""){var u=i?hm:r?dm:void 0,h=Af(i?"svg":r?"math":"template",u);h.innerHTML=o;var f=i||r?h:h.content;if(na(Zi(f),f.lastChild),i||r)for(;Zi(f);)a.before(Zi(f));else a.before(f)}}})}function qf(n){var t,e,i="";if(typeof n=="string"||typeof n=="number")i+=n;else if(typeof n=="object")if(Array.isArray(n)){var r=n.length;for(t=0;t<r;t++)n[t]&&(e=qf(n[t]))&&(i&&(i+=" "),i+=e)}else for(e in n)n[e]&&(i&&(i+=" "),i+=e);return i}function M_(){for(var n,t,e=0,i="",r=arguments.length;e<r;e++)(n=arguments[e])&&(t=qf(n))&&(i&&(i+=" "),i+=t);return i}function Ya(n){return typeof n=="object"?M_(n):n??""}const Sh=[...` 	
\r\f \v\uFEFF`];function y_(n,t,e){var i=n==null?"":""+n;if(t&&(i=i?i+" "+t:t),e){for(var r of Object.keys(e))if(e[r])i=i?i+" "+r:r;else if(i.length)for(var s=r.length,a=0;(a=i.indexOf(r,a))>=0;){var o=a+s;(a===0||Sh.includes(i[a-1]))&&(o===i.length||Sh.includes(i[o]))?i=(a===0?"":i.substring(0,a))+i.substring(o+1):a=o}}return i===""?null:i}function S_(n,t){return n==null?null:String(n)}function Ln(n,t,e,i,r,s){var a=n[Rc];if(a!==e||a===void 0){var o=y_(e,i,s);o==null?n.removeAttribute("class"):n.className=o,n[Rc]=e}else if(s&&r!==s)for(var l in s){var c=!!s[l];(r==null||c!==!!r[l])&&n.classList.toggle(l,c)}return s}function nr(n,t,e,i){var r=n[Cc];if(r!==t){var s=S_(t);s==null?n.removeAttribute("style"):n.style.cssText=s,n[Cc]=t}return i}function E_(n,t){t?n.hasAttribute("selected")||n.setAttribute("selected",""):n.removeAttribute("selected")}function b_(n,t){var e=n.__defaultValue,i=n.multiple,r=i?e??[]:null;if(!(i&&!vl(r))){n.selectedIndex;for(var s of n.options){var a=ks(s);E_(s,i?r.includes(a):Sf(a,e))}}}function $f(n,t,e=!1){if(n.multiple){if(t==null)return;if(!vl(t))return pm();for(var i of n.options)i.selected=t.includes(ks(i));return}for(i of n.options){var r=ks(i);if(Sf(r,t)){i.selected=!0;return}}(!e||t!==void 0)&&(n.selectedIndex=-1)}function Gc(n){var t=new MutationObserver(e=>{e.every(w_)||("__defaultValue"in n&&b_(n),"__value"in n&&$f(n,n.__value))});t.observe(n,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),Cf(()=>{t.disconnect()})}function Wc(n,t,e=t){var i=new WeakSet,r=!0;lf(n,"change",s=>{var a=s?"[selected]":":checked",o;if(n.multiple)o=[].map.call(n.querySelectorAll(a),ks);else{var l=n.querySelector(a)??n.querySelector("option:not([disabled])");o=l&&ks(l)}e(o),n.__value=o,Gt!==null&&i.add(Gt)}),Df(()=>{var s=t();if(n===document.activeElement){var a=Gt;if(i.has(a))return}if($f(n,s,r),r&&s===void 0){var o=n.querySelector(":checked");o!==null&&(s=ks(o),e(s))}n.__value=s,r=!1})}function ks(n){return"__value"in n?n.__value:n.value}function w_(n){if(n.target.closest("selectedcontent")!==null)return!0;if(n.type==="childList"){var t=[...n.addedNodes,...n.removedNodes];return t.length>0&&t.every(e=>e.nodeName==="SELECTEDCONTENT")}return!1}function kr(n,t,e=t){var i=new WeakSet;lf(n,"input",async r=>{var s=r?n.defaultValue:n.value;if(s=Ol(n)?Bl(s):s,e(s),Gt!==null&&i.add(Gt),await Jm(),s!==(s=t())){var a=n.selectionStart,o=n.selectionEnd,l=n.value.length;if(n.value=s??"",o!==null){var c=n.value.length;a===o&&o===l&&c>l?(n.selectionStart=c,n.selectionEnd=c):(n.selectionStart=a,n.selectionEnd=Math.min(o,c))}}}),fa(t)==null&&n.value&&(e(Ol(n)?Bl(n.value):n.value),Gt!==null&&i.add(Gt)),$u(()=>{var r=t();if(n===document.activeElement){var s=Gt;if(i.has(s))return}Ol(n)&&r===Bl(n.value)||n.type==="date"&&!r&&!n.value||r!==n.value&&(n.value=r??"")})}function Ol(n){var t=n.type;return t==="number"||t==="range"}function Bl(n){return n===""?null:+n}function zl(n,t){return n===t||(n==null?void 0:n[Ji])===t}function jf(n=Vu(),t,e,i){var r=ze.r,s=ge;return Df(()=>{var a,o;return $u(()=>{a=o,o=[],fa(()=>{zl(e(...o),n)||(t(n,...o),a&&zl(e(...a),n)&&t(null,...a))})}),()=>{let l=s;for(;l!==r&&l.parent!==null&&l.parent.f&Wa;)l=l.parent;const c=()=>{o&&zl(e(...o),n)&&t(null,...o)},u=l.teardown;l.teardown=()=>{c(),u==null||u()}}}),n}function T_(n=!1){const t=ze,e=t.l.u;if(!e)return;let i=()=>t_(t.s);if(n){let r=0,s={};const a=xl(()=>{let o=!1;const l=t.s;for(const c in l)l[c]!==s[c]&&(s[c]=l[c],o=!0);return o&&r++,r});i=()=>g(a)}e.b.length&&qm(()=>{Eh(t,i),Tc(e.b)}),al(()=>{const r=fa(()=>e.m.map(tm));return()=>{for(const s of r)typeof s=="function"&&s()}}),e.a.length&&al(()=>{Eh(t,i),Tc(e.a)})}function Eh(n,t){if(n.l.s)for(const e of n.l.s)g(e);t()}const A_={get(n,t){let e=n.props.length;for(;e--;){let i=n.props[e];if(va(i)&&(i=i()),typeof i=="object"&&i!==null&&t in i)return i[t]}},set(n,t,e){let i=n.props.length;for(;i--;){let r=n.props[i];va(r)&&(r=r());const s=ns(r,t);if(s&&s.set)return s.set(e),!0}return!1},getOwnPropertyDescriptor(n,t){let e=n.props.length;for(;e--;){let i=n.props[e];if(va(i)&&(i=i()),typeof i=="object"&&i!==null&&t in i){const r=ns(i,t);return r&&!r.configurable&&(r.configurable=!0),r}}},has(n,t){if(t===Ji||t===nm)return!1;for(let e of n.props)if(va(e)&&(e=e()),e!=null&&t in e)return!0;return!1},ownKeys(n){const t=[];for(let e of n.props)if(va(e)&&(e=e()),!!e){for(const i in e)t.includes(i)||t.push(i);for(const i of Object.getOwnPropertySymbols(e))t.includes(i)||t.push(i)}return t}};function co(...n){return new Proxy({props:n},A_)}function Zf(n){ze===null&&sf(),no&&ze.l!==null?R_(ze).m.push(n):al(()=>{const t=fa(n);if(typeof t=="function")return t})}function Kf(n){ze===null&&sf(),Zf(()=>()=>fa(n))}function R_(n){var t=n.l;return t.u??(t.u={a:[],b:[],m:[]})}const C_="5";var Yd;typeof window<"u"&&((Yd=window.__svelte??(window.__svelte={})).v??(Yd.v=new Set)).add(C_);const xr=.5,Xc=4,P_=1,Qf="mushroom-delivery-v1",xa={w:12,d:30,h:4.5},Le={rack:{name:"层架",w:1.5,d:5,h:2.6,color:9268835,unit:"套"},tray:{name:"托盘",w:1.3,d:1.1,h:.15,color:12623978,unit:"个"},pipe:{name:"加湿管道",w:.12,d:4,h:.12,color:5227511,unit:"米"},fan:{name:"环流风机",w:.7,d:.7,h:.7,color:9479342,unit:"台"},light:{name:"采光灯",w:.6,d:.15,h:.1,color:16769154,unit:"盏"},column:{name:"立柱",w:.4,d:.4,h:4.5,color:5533306,unit:"根"}},Jf={maker:"制作员",supervisor:"主管",customer:"客户"};function D_(n){var u,h,f;const t=Le[n.type],e=((u=n.size)==null?void 0:u.w)??t.w,i=((h=n.size)==null?void 0:h.d)??t.d,r=((f=n.size)==null?void 0:f.h)??t.h,s=(n.rotY||0)%Math.PI,a=Math.abs(Math.cos(s)),o=Math.abs(Math.sin(s)),l=e*a+i*o,c=e*o+i*a;return{minX:n.x-l/2,maxX:n.x+l/2,minZ:n.z-c/2,maxZ:n.z+c/2,minY:n.y,maxY:n.y+r,aw:l,ad:c,h:r}}function L_(n){return{...n,x:Math.round(n.x/xr)*xr,z:Math.round(n.z/xr)*xr,rotY:Math.round((n.rotY||0)/(Math.PI/2))*(Math.PI/2)}}const bh=(n,t)=>n.minX<t.maxX-1e-6&&n.maxX>t.minX+1e-6&&n.minZ<t.maxZ-1e-6&&n.maxZ>t.minZ+1e-6&&n.minY<t.maxY-1e-6&&n.maxY>t.minY+1e-6;function I_(n){const t=n.objects||[],e=t.map(l=>({o:l,b:D_(l)})),i=[],r=new Set,s=(l,c)=>{i.push({objId:l,level:"error",reason:c}),r.add(l)};for(const{o:l,b:c}of e){if((c.minX<-1e-6||c.minZ<-1e-6||c.maxX>n.w+1e-6||c.maxZ>n.d+1e-6)&&s(l.id,`越出棚区边界(棚区 ${n.w}m × ${n.d}m)`),l.type==="rack"){const u=e.filter(f=>f.o.type==="rack"&&Math.abs(f.o.x-l.x)<.05&&Math.abs(f.o.z-l.z)<.05);(l.y||0)<=Math.min(...u.map(f=>f.o.y||0))+.02&&Math.abs(l.y||0)>.02&&s(l.id,`层架未贴地(当前离地 ${l.y.toFixed(2)}m)`)}if(l.type!=="column")for(const u of e.filter(h=>h.o.type==="column"))bh(c,u.b)&&(s(l.id,"压到棚体立柱,需移开至少 0.2m"),r.add(u.o.id))}const a=(l,c)=>{if(l.o.type!=="rack"||c.o.type!=="rack")return!1;const u=Math.abs(l.o.x-c.o.x)<.05&&Math.abs(l.o.z-c.o.z)<.05,h=Math.abs(l.o.y-c.o.y)>.05;return u&&h};for(let l=0;l<e.length;l++)for(let c=l+1;c<e.length;c++){const u=e[l],h=e[c];if(!(u.o.type==="column"&&h.o.type==="column")&&!a(u,h)&&bh(u.b,h.b)){const f=Le[u.o.type].name,m=Le[h.o.type].name;s(u.o.id,`与${m}(${h.o.code})包围盒碰撞`),s(h.o.id,`与${f}(${u.o.code})包围盒碰撞`)}}const o=new Map;for(const l of t.filter(c=>c.type==="rack")){const c=`${l.x.toFixed(2)},${l.z.toFixed(2)}`;o.has(c)||o.set(c,[]),o.get(c).push(l)}for(const l of o.values())if(l.length>Xc)for(const c of l)s(c.id,`叠放 ${l.length} 层,超过 ${Xc} 层上限`);return{violations:i,collided:r,aisleMap:U_(n,e)}}function U_(n,t){const e=t.filter(({o:a})=>a.type==="rack").map(({b:a})=>a).sort((a,o)=>(a.minX+a.maxX)/2-(o.minX+o.maxX)/2);if(e.length<2)return{min:null,rows:[]};const i=[];for(const a of e){const o=(a.minX+a.maxX)/2,l=i.find(c=>Math.abs(c.cx-o)<2);l?(l.boxes.push(a),l.cx=(l.cx*(l.boxes.length-1)+o)/l.boxes.length):i.push({cx:o,boxes:[a]})}i.sort((a,o)=>a.cx-o.cx);const r=[];for(let a=0;a<i.length-1;a++){const o=Math.max(...i[a].boxes.map(u=>u.maxX)),l=Math.min(...i[a+1].boxes.map(u=>u.minX)),c=[...i[a].boxes,...i[a+1].boxes].map(u=>(u.minZ+u.maxZ)/2);r.push({index:a+1,gap:+(l-o).toFixed(2),x:+((o+l)/2).toFixed(2),z:+(c.reduce((u,h)=>u+h,0)/c.length).toFixed(2)})}return{min:r.length?Math.min(...r.map(a=>a.gap)):null,rows:r,minAisle:P_}}function N_(n){var e,i;const t={rack:{qty:0,unit:Le.rack.unit,name:Le.rack.name},tray:{qty:0,unit:Le.tray.unit,name:Le.tray.name},pipe:{qty:0,unit:"米",name:Le.pipe.name},fan:{qty:0,unit:Le.fan.unit,name:Le.fan.name},light:{qty:0,unit:Le.light.unit,name:Le.light.name},column:{qty:0,unit:Le.column.unit,name:Le.column.unit}};for(const r of n)for(const s of r.objects||[])if(s.type==="pipe"){const a=Le.pipe,o=((e=s.size)==null?void 0:e.w)??a.w,l=((i=s.size)==null?void 0:i.d)??a.d,c=(s.rotY||0)%Math.PI,u=Math.abs(Math.cos(c))>.5?l:o;t.pipe.qty=+(t.pipe.qty+u).toFixed(2)}else t[s.type]&&(t[s.type].qty+=1);return Object.entries(t).map(([r,s])=>({type:r,...s}))}let F_=1;const yl=(n="id")=>`${n}_${Date.now().toString(36)}_${(F_++).toString(36)}`;function Sl(){return new Date().toLocaleString("zh-CN",{hour12:!1})}function O_(){try{const n=localStorage.getItem(Qf);if(n)return JSON.parse(n)}catch(n){console.warn("本地数据读取失败",n)}return null}const Bi=O_(),Zt=ji({user:(Bi==null?void 0:Bi.user)??null,projects:(Bi==null?void 0:Bi.projects)??[],route:{name:Bi!=null&&Bi.user?"dashboard":"login",params:{}}});function vi(){localStorage.setItem(Qf,JSON.stringify({user:Zt.user,projects:Zt.projects}))}function Pr(n,t,e=""){var i,r;n.timeline.push({id:yl("tl"),time:Sl(),user:((i=Zt.user)==null?void 0:i.name)??"系统",role:((r=Zt.user)==null?void 0:r.role)??"",action:t,detail:e})}function B_(n,t){Zt.user={name:n,role:t},Zt.route={name:"dashboard",params:{}},vi()}function kl(){Zt.user=null,Zt.route={name:"login",params:{}},vi()}function rn(n,t={}){Zt.route={name:n,params:t}}function z_(n){const t={id:yl("prj"),code:`JD-${new Date().getFullYear()}-${String(Zt.projects.length+1).padStart(3,"0")}`,name:n.name,customer:n.customer,maker:n.maker,supervisor:n.supervisor,shedCount:Number(n.shedCount),layers:Number(n.layers),loadPerLayer:Number(n.loadPerLayer),deadline:n.deadline,status:"制作中",reworkCount:0,shedRework:{},version:"v1.0",deliveredAt:null,packageId:null,createdAt:Sl(),timeline:[],sheds:[],returnReason:""};for(let e=0;e<t.shedCount;e++)t.sheds.push(k_(e+1));return Pr(t,"客户下单",`${t.shedCount} 个菇棚,需求 ${t.layers} 层,单层承重 ${t.loadPerLayer}kg,交期 ${t.deadline}`),Zt.projects.unshift(t),vi(),t}function k_(n){return{id:yl("shed"),index:n,name:`${n}号棚`,w:xa.w,d:xa.d,h:xa.h,objects:H_(xa.w,xa.d)}}function H_(n,t){const e=[],i=[n*.25,n*.75],r=[3,t/2,t-3];for(const s of i)for(const a of r)e.push(tp("column",s,a,0));return e}let Hl={};function tp(n,t,e,i=0){const r=Le[n];Hl[n]=(Hl[n]||0)+1;const s={rack:"SJ",tray:"TP",pipe:"JS",fan:"FJ",light:"CG",column:"LZ"}[n];return{id:yl("obj"),type:n,code:`${s}-${String(Hl[n]).padStart(3,"0")}`,x:t,z:e,y:i,rotY:0,size:{w:r.w,d:r.d,h:r.h}}}function El(n){return Zt.projects.find(t=>t.id===n)}function V_(n,t,e=""){Pr(n,t,e),vi()}const Vl=[{x:4.5,z:8},{x:6,z:8},{x:7.5,z:8},{x:4.5,z:22},{x:6,z:22},{x:7.5,z:22}];function G_(n){const t=new Set(n.objects.filter(e=>e.type!=="column").map(e=>`${e.x},${e.z}`));return Vl.find(e=>!t.has(`${e.x},${e.z}`))??Vl[Vl.length-1]}function W_(n,t,e){const i=n.sheds.find(o=>o.id===t),r=G_(i),s=tp(e,r.x,r.z,e==="pipe"?2.6:e==="light"?3.6:0),a=L_(s);return i.objects.push(a),Pr(n,"摆放设备",`${i.name}:${Le[e].name} ${a.code}`),vi(),a}function X_(n,t,e){const i=n.sheds.find(s=>s.id===t),r=i.objects.findIndex(s=>s.id===e.id);r>=0&&(i.objects[r]=e),vi()}function Y_(n,t,e){const i=n.sheds.find(s=>s.id===t),r=i.objects.find(s=>s.id===e);if(r){if(r.type==="column"){alert("立柱为棚体结构,不可删除");return}i.objects=i.objects.filter(s=>s.id!==e),Pr(n,"删除设备",`${i.name}:${Le[r.type].name} ${r.code}`),vi()}}function Ii(n){const t=n.sheds.map(i=>({shed:i,...I_(i)})),e=t.reduce((i,r)=>i+r.violations.length,0);return{perShed:t,total:e,bom:N_(n.sheds)}}function q_(n){const{total:t}=Ii(n);return t>0?{ok:!1,msg:`仍有 ${t} 项碰撞/违规未处理,无法提交`}:(n.status="待审核",Pr(n,"提交审核","制作员提交三维布置方案"),vi(),{ok:!0})}function $_(n,t){n.status="已退回",n.returnReason=t,n.reworkCount+=1;for(const i of n.sheds)n.shedRework[i.id]=(n.shedRework[i.id]||0)+1;const e=n.version.replace(/v(\d+)\.(\d+)/,(i,r,s)=>`v${r}.${Number(s)+1}`);n.version=e,Pr(n,"整单退回",`原因:${t}(第 ${n.reworkCount} 次返工)`),vi()}function j_(n){const{total:t,bom:e}=Ii(n);return t>0?{ok:!1,msg:`存在 ${t} 项违规,不能通过`}:(n.status="已交付",n.deliveredAt=Sl(),n.packageId=`PKG-${n.code.replace("JD-","")}-${n.version.replace(".","")}`,Pr(n,"审核通过并打包",`交付包 ${n.packageId},版本 ${n.version}`),vi(),{ok:!0,bom:e})}function Z_(n){const{total:t}=Ii(n);return t>0?{ok:!1,msg:`仍有 ${t} 项违规未处理`}:(n.status="待审核",n.returnReason="",Pr(n,"返工后重新提交",`累计返工 ${n.reworkCount} 次`),vi(),{ok:!0})}function K_(n){const{bom:t,perShed:e,total:i}=Ii(n),r={交付包编号:n.packageId,项目编号:n.code,项目名称:n.name,版本:n.version,交付时间:n.deliveredAt,交期:n.deadline,需求:{菇棚数量:n.shedCount,层数:n.layers,单层承重kg:n.loadPerLayer},物料清单:t.map(s=>({物料:s.name,数量:s.qty,单位:s.unit})),碰撞告警数:i,各棚告警:e.map(s=>({棚:s.shed.name,告警:s.violations.map(a=>a.reason)})),三维数据:n.sheds.map(s=>({棚:s.name,尺寸:{宽:s.w,深:s.d,高:s.h},物体:s.objects.map(a=>({编号:a.code,类型:Le[a.type].name,位置:{x:a.x,y:a.y,z:a.z},旋转:a.rotY,尺寸:a.size}))})),时间线:n.timeline};ep(`${n.packageId||n.code}-交付包.json`,JSON.stringify(r,null,2),"application/json")}function Yc(n){const{bom:t}=Ii(n),i="\uFEFF"+[["项目编号",n.code,"项目名称",n.name],["版本",n.version,"导出时间",Sl()],[],["物料","数量","单位"],...t.map(r=>[r.name,r.qty,r.unit]),[],["棚号","层架(套)","托盘(个)","管道(米)","风机(台)","灯具(盏)"],...n.sheds.map(r=>{var a;const s={rack:0,tray:0,pipe:0,fan:0,light:0};for(const o of r.objects)o.type==="pipe"?s.pipe=+(s.pipe+(((a=o.size)==null?void 0:a.d)??Le.pipe.d)).toFixed(2):s[o.type]!==void 0&&s[o.type]++;return[r.name,s.rack,s.tray,s.pipe,s.fan,s.light]})].map(r=>r.join(",")).join(`
`);ep(`${n.code}-物料清单.csv`,i,"text/csv")}function ep(n,t,e){const i=new Blob([t],{type:`${e};charset=utf-8`}),r=URL.createObjectURL(i),s=document.createElement("a");s.href=r,s.download=n,s.click(),URL.revokeObjectURL(r)}function np(){const n=Zt.user,t=Zt.projects.filter(l=>n.role==="supervisor"?!0:n.role==="maker"?l.maker===n.name:l.customer===n.name),e=new Date,i=new Date(e);i.setDate(e.getDate()+7);const r=t.filter(l=>l.status!=="已交付"&&new Date(l.deadline)<e),s=t.filter(l=>{const c=new Date(l.deadline);return l.status!=="已交付"&&c>=e&&c<=i}),a=t.filter(l=>l.status==="待审核"),o=t.filter(l=>n.role==="supervisor"?l.status==="待审核":n.role==="maker"?["制作中","已退回"].includes(l.status):["草稿","制作中","待审核"].includes(l.status));return{mine:t,overdue:r,weekDue:s,reviewing:a,todo:o}}Rm();var Q_=Mt('<button class="role-btn"><span class="ico"> </span> <span><b> </b> <small> </small></span></button>'),J_=Mt('<div class="login-wrap"><div class="card login-card"><h1 style="text-align:center">菇棚层架三维布置交付系统</h1> <p class="muted small" style="text-align:center;margin-top:0">请选择身份进入(演示环境,无需密码)</p> <!> <p class="muted small" style="text-align:center;margin-bottom:0">制作员与主管看到的页面与待办不同 · 所有操作记录时间线与操作人</p></div></div>');function tv(n,t){Ui(t,!1);const e=[{role:"customer",name:"客户·张社长",icon:"👤",desc:"下需求单、跟踪项目进度、导出物料清单"},{role:"maker",name:"制作员·李工",icon:"🛠",desc:"逐棚摆放层架与设备、碰撞自检、提交审核"},{role:"supervisor",name:"主管·王主任",icon:"✔",desc:"逐棚审核碰撞告警与清单、退回/通过打包"}];function i(o){B_(o.name,o.role)}T_();var r=J_(),s=$(r),a=L($(s),4);Ie(a,1,()=>e,Wn,(o,l)=>{var c=Q_(),u=$(c),h=st(u,!0),f=L(u,2),m=$(f),_=st(m,!0),v=L(m,2),p=st(v,!0);zt(()=>{tt(h,g(l).icon),tt(_,g(l).name),tt(p,g(l).desc)}),ie("click",c,()=>i(g(l))),dt(o,c)}),dt(n,r),Ni()}rr(["click"]);var ev=Mt('<div class="empty">暂无待办,可以喝杯茶 🍄</div>'),nv=Mt('<button class="sm primary">去审核</button>'),iv=Mt('<button class="sm primary">去制作</button>'),rv=Mt('<button class="sm">查看详情</button>'),sv=Mt("<tr><td> </td><td> </td><td><span> </span></td><td> </td><td><!></td></tr>"),av=Mt("<table><thead><tr><th>项目编号</th><th>项目名称</th><th>状态</th><th>交期</th><th>操作</th></tr></thead><tbody></tbody></table>"),ov=Mt('<div class="empty small">没有超期项目</div>'),lv=Mt('<button class="alert error alert-btn"><b> </b> <br/> </button>'),cv=Mt('<div class="empty small">本周无到期项目</div>'),uv=Mt('<button class="alert warn alert-btn"><b> </b><br/> </button>'),hv=Mt('<h1> </h1> <p class="muted" style="margin-top:-4px"> </p> <div class="grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:18px"><div class="card stat"><div class="num"> </div> <div class="lbl"> </div></div> <div class="card stat blue"><div class="num"> </div> <div class="lbl">在审数量</div></div> <div class="card stat amber"><div class="num"> </div> <div class="lbl">本周交期</div></div> <div class="card stat red"><div class="num"> </div> <div class="lbl">超期项目</div></div></div> <div class="grid" style="grid-template-columns:2fr 1fr;align-items:start"><div class="card"><h2> </h2> <!></div> <div class="card" style="border-color:#f0c9c9"><h2 style="color:var(--red)">⚠ 超期项目(单独一栏)</h2> <!> <h2 style="margin-top:18px">本周交期</h2> <!></div></div>',1);function wh(n,t){Ui(t,!0);const e=Te(np),i=Te(()=>Zt.user.role==="supervisor"),r=Te(()=>{const q=yt=>`${yt.getMonth()+1}/${yt.getDate()}`,nt=new Date;return nt.setDate(nt.getDate()+7),`${q(new Date)} - ${q(nt)}`});function s(q){return q.status==="已退回"&&q.reworkCount>2?"badge red":`badge ${q.status}`}var a=hv(),o=ln(a),l=st(o),c=L(o,2),u=st(c),h=L(c,2),f=$(h),m=$(f),_=st(m,!0),v=L(m,2),p=st(v,!0),d=L(f,2),w=$(d),b=st(w,!0),S=L(d,2),D=$(S),C=st(D,!0),R=L(S,2),P=$(R),y=st(P,!0),M=L(h,2),A=$(M),O=$(A),U=st(O,!0),k=L(O,2);{var W=q=>{var nt=ev();dt(q,nt)},X=q=>{var nt=av(),yt=L($(nt));Ie(yt,21,()=>g(e).todo,ht=>ht.id,(ht,St)=>{var It=sv(),Bt=$(It),se=st(Bt,!0),Xt=L(Bt),he=st(Xt,!0),N=L(Xt),Pe=$(N),Kt=st(Pe),Ft=L(N),ft=st(Ft,!0),qt=L(Ft),wt=$(qt);{var T=et=>{var it=nv();ie("click",it,()=>rn("review",{id:g(St).id})),dt(et,it)},x=et=>{var it=iv();ie("click",it,()=>rn("project-detail",{id:g(St).id})),dt(et,it)},H=et=>{var it=rv();ie("click",it,()=>rn("project-detail",{id:g(St).id})),dt(et,it)};Qt(wt,et=>{Zt.user.role==="supervisor"?et(T):Zt.user.role==="maker"?et(x,1):et(H,-1)})}zt(et=>{tt(se,g(St).code),tt(he,g(St).name),Ln(Pe,1,et),tt(Kt,`${g(St).status??""}${g(St).status==="已退回"?` · 返工${g(St).reworkCount}次`:""}`),tt(ft,g(St).deadline)},[()=>Ya(s(g(St)))]),dt(ht,It)}),dt(q,nt)};Qt(k,q=>{g(e).todo.length===0?q(W):q(X,-1)})}var j=L(A,2),G=L($(j),2);{var V=q=>{var nt=ov();dt(q,nt)},lt=q=>{var nt=Ar(),yt=ln(nt);Ie(yt,17,()=>g(e).overdue,ht=>ht.id,(ht,St)=>{var It=lv(),Bt=$(It),se=st(Bt,!0),Xt=L(Bt),he=L(Xt,2);zt(()=>{tt(se,g(St).code),tt(Xt,` · ${g(St).name??""}`),tt(he,` 交期 ${g(St).deadline??""} · 当前 ${g(St).status??""}`)}),ie("click",It,()=>rn("project-detail",{id:g(St).id})),dt(ht,It)}),dt(q,nt)};Qt(G,q=>{g(e).overdue.length===0?q(V):q(lt,-1)})}var vt=L(G,4);{var Lt=q=>{var nt=cv();dt(q,nt)},Vt=q=>{var nt=Ar(),yt=ln(nt);Ie(yt,17,()=>g(e).weekDue,ht=>ht.id,(ht,St)=>{var It=uv(),Bt=$(It),se=st(Bt,!0),Xt=L(Bt,2);zt(()=>{tt(se,g(St).name),tt(Xt,`交期 ${g(St).deadline??""} · ${g(St).status??""}`)}),ie("click",It,()=>rn("project-detail",{id:g(St).id})),dt(ht,It)}),dt(q,nt)};Qt(vt,q=>{g(e).weekDue.length===0?q(Lt):q(Vt,-1)})}zt(()=>{tt(l,`${Zt.user.name??""}的工作台`),tt(u,`${Jf[Zt.user.role]??""}视图 · 本周范围 ${g(r)??""}`),tt(_,g(e).todo.length),tt(p,g(i)?"待我审核":"我的待办"),tt(b,g(e).reviewing.length),tt(C,g(e).weekDue.length),tt(y,g(e).overdue.length),tt(U,g(i)?"待审核项目":"我的待办")}),dt(n,a),Ni()}rr(["click"]);var Th=Mt("<option> </option>"),dv=Mt('<div class="alert error"> </div>'),fv=Mt('<h1>下需求单</h1> <p class="muted" style="margin-top:-4px">客户在棚区图纸上下单,制作员收到后逐棚进行三维布置</p> <div class="card" style="max-width:680px"><div class="field"><span class="flabel">项目名称</span> <input placeholder="例:东区双孢菇基地一期菇棚"/></div> <div class="grid" style="grid-template-columns:1fr 1fr"><div class="field"><span class="flabel">客户单位/联系人</span> <input/></div> <div class="field"><span class="flabel">期望交期</span> <input type="date"/></div></div> <div class="grid" style="grid-template-columns:1fr 1fr 1fr"><div class="field"><span class="flabel">菇棚数量(个)</span> <input type="number" min="1" max="20"/></div> <div class="field"><span class="flabel">层数(层/架)</span> <input type="number" min="1" max="6"/></div> <div class="field"><span class="flabel">单层承重(kg)</span> <input type="number" min="1"/></div></div> <div class="grid" style="grid-template-columns:1fr 1fr"><div class="field"><span class="flabel">指派制作员</span> <select></select></div> <div class="field"><span class="flabel">审核主管</span> <select></select></div></div> <!> <div class="row" style="margin-top:8px"><button class="primary">提交需求单并生成棚区</button> <button>取消</button> <span class="spacer"></span> <span class="muted small">提交后自动按棚数量生成空白棚区(含默认立柱),进入制作环节</span></div></div>',1);function pv(n,t){var G;Ui(t,!0);const e=["制作员·李工","制作员·赵工"],i=["主管·王主任"];let r=ji({name:"",customer:((G=Zt.user)==null?void 0:G.role)==="customer"?Zt.user.name:"客户·张社长",maker:e[0],supervisor:i[0],shedCount:3,layers:4,loadPerLayer:120,deadline:a()}),s=Ge("");function a(){const V=new Date;return V.setDate(V.getDate()+14),V.toISOString().slice(0,10)}function o(){if(!r.name.trim()){_e(s,"请填写项目名称");return}if(r.shedCount<1||r.shedCount>20){_e(s,"菇棚数量需在 1-20 之间");return}if(r.layers<1||r.layers>6){_e(s,"层数需在 1-6 之间(摆放时超过 4 层会告警)");return}if(r.loadPerLayer<=0){_e(s,"单层承重需大于 0");return}const V=z_(r);rn("project-detail",{id:V.id})}var l=fv(),c=L(ln(l),4),u=$(c),h=L($(u),2),f=L(u,2),m=$(f),_=L($(m),2),v=L(m,2),p=L($(v),2),d=L(f,2),w=$(d),b=L($(w),2),S=L(w,2),D=L($(S),2),C=L(S,2),R=L($(C),2),P=L(d,2),y=$(P),M=L($(y),2);Ie(M,21,()=>e,Wn,(V,lt)=>{var vt=Th(),Lt=st(vt,!0),Vt={};zt(()=>{tt(Lt,g(lt)),Vt!==(Vt=g(lt))&&(vt.__value=Vt)}),dt(V,vt)}),Gc(M);var A=L(y,2),O=L($(A),2);Ie(O,21,()=>i,Wn,(V,lt)=>{var vt=Th(),Lt=st(vt,!0),Vt={};zt(()=>{tt(Lt,g(lt)),Vt!==(Vt=g(lt))&&(vt.__value=Vt)}),dt(V,vt)}),Gc(O);var U=L(P,2);{var k=V=>{var lt=dv(),vt=st(lt,!0);zt(()=>tt(vt,g(s))),dt(V,lt)};Qt(U,V=>{g(s)&&V(k)})}var W=L(U,2),X=$(W),j=L(X,2);kr(h,()=>r.name,V=>r.name=V),kr(_,()=>r.customer,V=>r.customer=V),kr(p,()=>r.deadline,V=>r.deadline=V),kr(b,()=>r.shedCount,V=>r.shedCount=V),kr(D,()=>r.layers,V=>r.layers=V),kr(R,()=>r.loadPerLayer,V=>r.loadPerLayer=V),Wc(M,()=>r.maker,V=>r.maker=V),Wc(O,()=>r.supervisor,V=>r.supervisor=V),ie("click",X,o),ie("click",j,()=>rn("dashboard")),dt(n,l),Ni()}rr(["click"]);var mv=Mt('<span class="muted small">暂无超期项目</span>'),_v=Mt('<button class="sm danger"> </button>'),vv=Mt('<div class="row"></div>'),gv=Mt("<button> </button>"),xv=Mt('<button class="primary sm">+ 下需求单</button>'),Mv=Mt('<div class="empty">没有符合筛选条件的项目</div>'),yv=Mt('<span class="badge red" style="margin-left:6px">超期</span>'),Sv=Mt('<button class="sm">交付包</button>'),Ev=Mt('<tr><td> </td><td> <!></td><td> </td><td><span> </span></td><td> </td><td> </td><td> </td><td><button class="sm"> </button> <!></td></tr>'),bv=Mt("<table><thead><tr><th>项目编号</th><th>项目名称</th><th>菇棚</th><th>状态</th><th>返工</th><th>交期</th><th>版本</th><th>操作</th></tr></thead><tbody></tbody></table>"),wv=Mt('<h1> </h1> <div class="card" style="border-color:#f0c9c9;margin-bottom:16px"><h2 style="color:var(--red)"> </h2> <!></div> <div class="card"><div class="row" style="margin-bottom:14px"><div class="pill-tab"></div> <span class="spacer"></span> <span class="flabel" style="margin:0">交期筛选</span> <select style="width:150px"><option>全部</option><option>本周</option><option>本月</option><option>已超期</option></select> <!></div> <!></div>',1);function Tv(n,t){Ui(t,!0);const e=Te(np);let i=Ge("全部"),r=Ge("全部");const s=["全部","制作中","待审核","已退回","已交付"],a=new Date,o=U=>{const k=new Date(U.deadline),W=new Date;W.setDate(a.getDate()+7);const X=new Date;return X.setMonth(a.getMonth()+1),g(r)==="本周"?k>=a&&k<=W:g(r)==="本月"?k>=a&&k<=X:g(r)==="已超期"?k<a&&U.status!=="已交付":!0},l=Te(()=>g(e).mine.filter(U=>g(i)==="全部"||U.status===g(i)).filter(o).sort((U,k)=>new Date(U.deadline)-new Date(k.deadline)));function c(U){return U.status!=="已交付"&&new Date(U.deadline)<a}function u(U){return U.status==="已退回"&&U.reworkCount>2?"badge red":`badge ${U.status}`}var h=wv(),f=ln(h),m=st(f,!0),_=L(f,2),v=$(_),p=st(v),d=L(v,2);{var w=U=>{var k=mv();dt(U,k)},b=U=>{var k=vv();Ie(k,21,()=>g(e).overdue,W=>W.id,(W,X)=>{var j=_v(),G=st(j);zt(()=>tt(G,`${g(X).code??""} · ${g(X).name??""}(交期 ${g(X).deadline??""})`)),ie("click",j,()=>rn("project-detail",{id:g(X).id})),dt(W,j)}),dt(U,k)};Qt(d,U=>{g(e).overdue.length===0?U(w):U(b,-1)})}var S=L(_,2),D=$(S),C=$(D);Ie(C,21,()=>s,Wn,(U,k)=>{var W=gv(),X=st(W,!0);zt(()=>{Ln(W,1,Ya(g(i)===g(k)?"active":"")),tt(X,g(k))}),ie("click",W,()=>_e(i,g(k),!0)),dt(U,W)});var R=L(C,6);Gc(R);var P=L(R,2);{var y=U=>{var k=xv();ie("click",k,()=>rn("order-new")),dt(U,k)};Qt(P,U=>{Zt.user.role==="customer"&&U(y)})}var M=L(D,2);{var A=U=>{var k=Mv();dt(U,k)},O=U=>{var k=bv(),W=L($(k));Ie(W,21,()=>g(l),X=>X.id,(X,j)=>{var G=Ev(),V=$(G),lt=st(V,!0),vt=L(V),Lt=$(vt),Vt=L(Lt);{var q=x=>{var H=yv();dt(x,H)},nt=Te(()=>c(g(j)));Qt(Vt,x=>{g(nt)&&x(q)})}var yt=L(vt),ht=st(yt),St=L(yt),It=$(St),Bt=st(It,!0),se=L(St),Xt=st(se),he=L(se),N=st(he,!0),Pe=L(he),Kt=st(Pe,!0),Ft=L(Pe),ft=$(Ft),qt=st(ft,!0),wt=L(ft,2);{var T=x=>{var H=Sv();ie("click",H,()=>rn("deliverables",{id:g(j).id})),dt(x,H)};Qt(wt,x=>{g(j).status==="已交付"&&x(T)})}zt((x,H)=>{nr(G,x),tt(lt,g(j).code),tt(Lt,`${g(j).name??""} `),tt(ht,`${g(j).shedCount??""} 个`),Ln(It,1,H),tt(Bt,g(j).status),nr(se,g(j).reworkCount>2?"color:var(--red);font-weight:700":""),tt(Xt,`${g(j).reworkCount??""} 次`),tt(N,g(j).deadline),tt(Kt,g(j).version),tt(qt,Zt.user.role==="supervisor"?"查看":"进入")},[()=>c(g(j))?"background:#fff7f7":"",()=>Ya(u(g(j)))]),ie("click",ft,()=>rn("project-detail",{id:g(j).id})),dt(X,G)}),dt(U,k)};Qt(M,U=>{g(l).length===0?U(A):U(O,-1)})}zt(()=>{tt(m,Zt.user.role==="supervisor"?"全部项目":"我的项目"),tt(p,`⚠ 超期项目栏(${g(e).overdue.length??""})`)}),Wc(R,()=>g(r),U=>_e(r,U)),dt(n,h),Ni()}rr(["click"]);var Ah=Mt('<span class="badge red"> </span>'),Av=Mt('<span class="badge gray"> </span>'),Rv=Mt('<button class="sm primary">查看交付包</button>'),Cv=Mt('<div class="alert error"><b> </b> </div>'),Pv=Mt("<div> </div>"),Dv=Mt('<button class="primary sm"> </button>'),Rh=Mt(" <br/>",1),Lv=Mt('<span class="muted"> </span>'),Iv=Mt('<div class="small" style="color:var(--red);max-height:56px;overflow:auto"><!> <!></div>'),Uv=Mt('<div class="card"><div class="row"><b> </b> <span class="spacer"></span> <!></div> <div class="small muted" style="margin:6px 0"> </div> <div style="margin-bottom:8px"></div> <!> <button class="sm primary" style="width:100%;margin-top:8px"> </button></div>'),Nv=Mt('<div class="small muted"> </div>'),Fv=Mt('<li><div><span class="t-user"> </span> </div> <!> <div class="t-time"> </div></li>'),Ov=Mt("<tr><td> </td><td><b> </b></td><td> </td></tr>"),Bv=Mt('<div class="alert ok">全部棚区无碰撞告警</div>'),zv=Mt('<div class="alert error"><b> </b> <div class="small"></div></div>'),kv=Mt('<div class="page-head"><button class="sm">← 返回列表</button> <h1 style="margin:0"> </h1> <span> </span> <!> <span class="spacer"></span> <button class="sm">导出物料清单 CSV</button> <!></div> <!> <!> <div class="grid" style="grid-template-columns:2fr 1fr;align-items:start"><div><div class="card" style="margin-bottom:16px"><h2>需求信息</h2> <div class="grid" style="grid-template-columns:repeat(4,1fr)"><div><span class="muted small">项目编号</span><br/><b> </b></div> <div><span class="muted small">菇棚数量</span><br/><b> </b></div> <div><span class="muted small">需求层数</span><br/><b> </b></div> <div><span class="muted small">单层承重</span><br/><b> </b></div> <div><span class="muted small">客户</span><br/> </div> <div><span class="muted small">制作员</span><br/> </div> <div><span class="muted small">主管</span><br/> </div> <div><span class="muted small">交期</span><br/><b> </b></div></div></div> <div class="card" style="margin-bottom:16px"><div class="row"><h2 style="margin:0"> </h2> <span class="spacer"></span> <!></div> <div class="grid" style="grid-template-columns:repeat(3,1fr);margin-top:14px"></div></div> <div class="card"><h2>操作时间线</h2> <ul class="timeline"></ul></div></div> <div><div class="card" style="margin-bottom:16px"><h2>物料清单(自动汇总)</h2> <table><thead><tr><th>物料</th><th>数量</th><th>单位</th></tr></thead><tbody></tbody></table> <button class="sm" style="width:100%;margin-top:10px">导出 CSV</button></div> <div class="card"><h2>碰撞告警汇总</h2> <!></div></div></div>',1);function Hv(n,t){Ui(t,!0);const e=Te(()=>El(t.id)),i=Te(()=>Ii(g(e)));let r=Ge("");const s=Te(()=>Zt.user.role==="maker"),a=Te(()=>g(s)&&["制作中","已退回"].includes(g(e).status));function o(f){return f.violations.length>0?`<span class="badge red">${f.violations.length} 项告警</span>`:f.shed.objects.filter(m=>m.type!=="column").length===0?'<span class="badge gray">未布置</span>':'<span class="badge 已交付">合格</span>'}function l(){const f=g(e).status==="已退回"?Z_(g(e)):q_(g(e));_e(r,f.ok?"已提交主管审核":f.msg,!0),f.ok&&setTimeout(()=>_e(r,""),2500)}function c(f){return f}var u=Ar(),h=ln(u);Yf(h,()=>g(e).id,f=>{var m=kv(),_=ln(m),v=$(_),p=L(v,2),d=st(p,!0),w=L(p,2),b=st(w,!0),S=L(w,2);{var D=pt=>{var xt=Ah(),F=st(xt);zt(()=>tt(F,`返工 ${g(e).reworkCount??""} 次(超限标红)`)),dt(pt,xt)},C=pt=>{var xt=Av(),F=st(xt);zt(()=>tt(F,`返工 ${g(e).reworkCount??""} 次`)),dt(pt,xt)};Qt(S,pt=>{g(e).reworkCount>2?pt(D):g(e).reworkCount>0&&pt(C,1)})}var R=L(S,4),P=L(R,2);{var y=pt=>{var xt=Rv();ie("click",xt,()=>rn("deliverables",{id:g(e).id})),dt(pt,xt)};Qt(P,pt=>{g(e).status==="已交付"&&pt(y)})}var M=L(_,2);{var A=pt=>{var xt=Cv(),F=$(xt),mt=st(F),J=L(F,1,!0);zt(()=>{tt(mt,`整单退回原因(第 ${g(e).reworkCount??""} 次返工):`),tt(J,g(e).returnReason)}),dt(pt,xt)};Qt(M,pt=>{g(e).status==="已退回"&&pt(A)})}var O=L(M,2);{var U=pt=>{var xt=Pv(),F=st(xt,!0);zt(mt=>{Ln(xt,1,`alert ${mt??""}`),tt(F,g(r))},[()=>g(r).includes("无法")||g(r).includes("违规")?"error":"ok"]),dt(pt,xt)};Qt(O,pt=>{g(r)&&pt(U)})}var k=L(O,2),W=$(k),X=$(W),j=L($(X),2),G=$(j),V=L($(G),2),lt=st(V,!0),vt=L(G,2),Lt=L($(vt),2),Vt=st(Lt),q=L(vt,2),nt=L($(q),2),yt=st(nt),ht=L(q,2),St=L($(ht),2),It=st(St),Bt=L(ht,2),se=L($(Bt),2,!0),Xt=L(Bt,2),he=L($(Xt),2,!0),N=L(Xt,2),Pe=L($(N),2,!0),Kt=L(N,2),Ft=L($(Kt),2),ft=st(Ft,!0),qt=L(X,2),wt=$(qt),T=$(wt),x=st(T),H=L(T,4);{var et=pt=>{var xt=Dv(),F=st(xt,!0);zt(()=>tt(F,g(e).status==="已退回"?"返工后重新提交":"提交主管审核")),ie("click",xt,l),dt(pt,xt)};Qt(H,pt=>{g(a)&&pt(et)})}var it=L(wt,2);Ie(it,21,()=>g(i).perShed,pt=>pt.shed.id,(pt,xt)=>{const F=Te(()=>g(e).shedRework[g(xt).shed.id]||0);var mt=Uv(),J=$(mt),rt=$(J),Et=st(rt,!0),bt=L(rt,4);{var $t=$e=>{var ei=Ah(),Ct=st(ei);zt(()=>tt(Ct,`返工${g(F)??""}次`)),dt($e,ei)};Qt(bt,$e=>{g(F)>2&&$e($t)})}var me=L(J,2),ke=st(me),re=L(me,2);x_(re,()=>o(g(xt)),!0);var qe=L(re,2);{var pn=$e=>{var ei=Iv(),Ct=$(ei);Ie(Ct,17,()=>g(xt).violations.slice(0,3),Wn,(Ne,Oe)=>{var cn=Rh(),Rn=ln(cn);zt(()=>tt(Rn,`· ${g(Oe).reason??""}`)),dt(Ne,cn)});var ee=L(Ct,2);{var Se=Ne=>{var Oe=Lv(),cn=st(Oe);zt(()=>tt(cn,`等 ${g(xt).violations.length??""} 项`)),dt(Ne,Oe)};Qt(ee,Ne=>{g(xt).violations.length>3&&Ne(Se)})}dt($e,ei)};Qt(qe,$e=>{g(xt).violations.length>0&&$e(pn)})}var Dr=L(qe,2),hs=st(Dr,!0);zt($e=>{nr(mt,`padding:14px;${g(F)>2?"border-color:var(--red);box-shadow:0 0 0 1px var(--red)":""}`),tt(Et,g(xt).shed.name),tt(ke,`${g(xt).shed.w??""}m × ${g(xt).shed.d??""}m ·
              设备 ${$e??""} 件`),tt(hs,g(a)?"进入三维布置":"查看三维场景")},[()=>g(xt).shed.objects.filter($e=>$e.type!=="column").length]),ie("click",Dr,()=>rn("shed-editor",{id:g(e).id,shedId:g(xt).shed.id})),dt(pt,mt)});var Y=L(qt,2),ct=L($(Y),2);Ie(ct,21,()=>[...g(e).timeline].reverse(),pt=>pt.id,(pt,xt)=>{var F=Fv(),mt=$(F),J=$(mt),rt=st(J,!0),Et=L(J),bt=L(mt,2);{var $t=re=>{var qe=Nv(),pn=st(qe,!0);zt(()=>tt(pn,g(xt).detail)),dt(re,qe)};Qt(bt,re=>{g(xt).detail&&re($t)})}var me=L(bt,2),ke=st(me,!0);zt(()=>{tt(rt,g(xt).user),tt(Et,` · ${g(xt).action??""}`),tt(ke,g(xt).time)}),dt(pt,F)});var ot=L(W,2),_t=$(ot),Ht=L($(_t),2),at=L($(Ht));Ie(at,21,()=>g(i).bom,Wn,(pt,xt)=>{var F=Ov(),mt=$(F),J=st(mt,!0),rt=L(mt),Et=$(rt),bt=st(Et,!0),$t=L(rt),me=st($t,!0);zt(()=>{tt(J,g(xt).name),tt(bt,g(xt).qty),tt(me,g(xt).unit)}),dt(pt,F)});var gt=L(Ht,2),Ut=L(_t,2),kt=L($(Ut),2);{var Rt=pt=>{var xt=Bv();dt(pt,xt)},Jt=pt=>{var xt=Ar(),F=ln(xt);Ie(F,17,()=>g(i).perShed.filter(mt=>mt.violations.length),Wn,(mt,J)=>{var rt=zv(),Et=$(rt),bt=st(Et),$t=L(Et,2);Ie($t,21,()=>[...new Set(g(J).violations.map(me=>me.reason))].slice(0,4),Wn,(me,ke)=>{var re=Rh(),qe=ln(re);zt(()=>tt(qe,`· ${g(ke)??""}`)),dt(me,re)}),zt(()=>tt(bt,`${g(J).shed.name??""}(${g(J).violations.length??""} 项)`)),dt(mt,rt)}),dt(pt,xt)};Qt(kt,pt=>{g(i).total===0?pt(Rt):pt(Jt,-1)})}zt(pt=>{tt(d,g(e).name),Ln(w,1,`badge ${g(e).status??""}`),tt(b,g(e).status),tt(lt,g(e).code),tt(Vt,`${g(e).shedCount??""} 个`),tt(yt,`${g(e).layers??""} 层`),tt(It,`${g(e).loadPerLayer??""} kg`),tt(se,g(e).customer),tt(he,g(e).maker),tt(Pe,g(e).supervisor),nr(Ft,new Date(g(e).deadline)<new Date&&g(e).status!=="已交付"?"color:var(--red)":""),tt(ft,pt),tt(x,`逐棚布置(${g(e).sheds.length??""})`)},[()=>g(e).deadline]),ie("click",v,()=>rn("project-list")),ie("click",R,()=>Yc(g(e))),ie("click",gt,()=>Yc(g(e))),dt(f,m)}),dt(n,u),Ni()}rr(["click"]);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Ku="171",Hs={ROTATE:0,DOLLY:1,PAN:2},Ns={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Vv=0,Ch=1,Gv=2,ip=1,rp=2,Wi=3,Rr=0,Un=1,Ti=2,Sr=0,Vs=1,Ph=2,Dh=3,Lh=4,Wv=5,Wr=100,Xv=101,Yv=102,qv=103,$v=104,jv=200,Zv=201,Kv=202,Qv=203,qc=204,$c=205,Jv=206,tg=207,eg=208,ng=209,ig=210,rg=211,sg=212,ag=213,og=214,jc=0,Zc=1,Kc=2,ia=3,Qc=4,Jc=5,tu=6,eu=7,sp=0,lg=1,cg=2,Er=0,ug=1,hg=2,dg=3,fg=4,pg=5,mg=6,_g=7,ap=300,ra=301,sa=302,nu=303,iu=304,bl=306,ru=1e3,Zr=1001,su=1002,fi=1003,vg=1004,uo=1005,Ci=1006,Gl=1007,Kr=1008,ir=1009,op=1010,lp=1011,qa=1012,Qu=1013,os=1014,Ki=1015,ao=1016,Ju=1017,th=1018,aa=1020,cp=35902,up=1021,hp=1022,hi=1023,dp=1024,fp=1025,Gs=1026,oa=1027,pp=1028,eh=1029,mp=1030,nh=1031,ih=1033,qo=33776,$o=33777,jo=33778,Zo=33779,au=35840,ou=35841,lu=35842,cu=35843,uu=36196,hu=37492,du=37496,fu=37808,pu=37809,mu=37810,_u=37811,vu=37812,gu=37813,xu=37814,Mu=37815,yu=37816,Su=37817,Eu=37818,bu=37819,wu=37820,Tu=37821,Ko=36492,Au=36494,Ru=36495,_p=36283,Cu=36284,Pu=36285,Du=36286,gg=3200,xg=3201,vp=0,Mg=1,_r="",Qn="srgb",la="srgb-linear",ll="linear",Ae="srgb",ms=7680,Ih=519,yg=512,Sg=513,Eg=514,gp=515,bg=516,wg=517,Tg=518,Ag=519,Lu=35044,Uh="300 es",Qi=2e3,cl=2001;class cs{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const i=this._listeners;return i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const r=this._listeners[t];if(r!==void 0){const s=r.indexOf(e);s!==-1&&r.splice(s,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const i=this._listeners[t.type];if(i!==void 0){t.target=this;const r=i.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,t);t.target=null}}}const _n=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Va=Math.PI/180,Iu=180/Math.PI;function br(){const n=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(_n[n&255]+_n[n>>8&255]+_n[n>>16&255]+_n[n>>24&255]+"-"+_n[t&255]+_n[t>>8&255]+"-"+_n[t>>16&15|64]+_n[t>>24&255]+"-"+_n[e&63|128]+_n[e>>8&255]+"-"+_n[e>>16&255]+_n[e>>24&255]+_n[i&255]+_n[i>>8&255]+_n[i>>16&255]+_n[i>>24&255]).toLowerCase()}function de(n,t,e){return Math.max(t,Math.min(e,n))}function Rg(n,t){return(n%t+t)%t}function Wl(n,t,e){return(1-e)*n+e*t}function Ai(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Re(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const Cg={DEG2RAD:Va};class Wt{constructor(t=0,e=0){Wt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,i=this.y,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6],this.y=r[1]*e+r[4]*i+r[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(de(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const i=this.dot(t)/e;return Math.acos(de(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const i=Math.cos(e),r=Math.sin(e),s=this.x-t.x,a=this.y-t.y;return this.x=s*i-a*r+t.x,this.y=s*r+a*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ae{constructor(t,e,i,r,s,a,o,l,c){ae.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,r,s,a,o,l,c)}set(t,e,i,r,s,a,o,l,c){const u=this.elements;return u[0]=t,u[1]=r,u[2]=o,u[3]=e,u[4]=s,u[5]=l,u[6]=i,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const i=t.elements,r=e.elements,s=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],u=i[4],h=i[7],f=i[2],m=i[5],_=i[8],v=r[0],p=r[3],d=r[6],w=r[1],b=r[4],S=r[7],D=r[2],C=r[5],R=r[8];return s[0]=a*v+o*w+l*D,s[3]=a*p+o*b+l*C,s[6]=a*d+o*S+l*R,s[1]=c*v+u*w+h*D,s[4]=c*p+u*b+h*C,s[7]=c*d+u*S+h*R,s[2]=f*v+m*w+_*D,s[5]=f*p+m*b+_*C,s[8]=f*d+m*S+_*R,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],i=t[1],r=t[2],s=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8];return e*a*u-e*o*c-i*s*u+i*o*l+r*s*c-r*a*l}invert(){const t=this.elements,e=t[0],i=t[1],r=t[2],s=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],h=u*a-o*c,f=o*l-u*s,m=c*s-a*l,_=e*h+i*f+r*m;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/_;return t[0]=h*v,t[1]=(r*c-u*i)*v,t[2]=(o*i-r*a)*v,t[3]=f*v,t[4]=(u*e-r*l)*v,t[5]=(r*s-o*e)*v,t[6]=m*v,t[7]=(i*l-c*e)*v,t[8]=(a*e-i*s)*v,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,r,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*a+c*o)+a+t,-r*c,r*l,-r*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(Xl.makeScale(t,e)),this}rotate(t){return this.premultiply(Xl.makeRotation(-t)),this}translate(t,e){return this.premultiply(Xl.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,i=t.elements;for(let r=0;r<9;r++)if(e[r]!==i[r])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){const i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Xl=new ae;function xp(n){for(let t=n.length-1;t>=0;--t)if(n[t]>=65535)return!0;return!1}function ul(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Pg(){const n=ul("canvas");return n.style.display="block",n}const Nh={};function Us(n){n in Nh||(Nh[n]=!0,console.warn(n))}function Dg(n,t,e){return new Promise(function(i,r){function s(){switch(n.clientWaitSync(t,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(s,e);break;default:i()}}setTimeout(s,e)})}function Lg(n){const t=n.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Ig(n){const t=n.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const Fh=new ae().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Oh=new ae().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ug(){const n={enabled:!0,workingColorSpace:la,spaces:{},convert:function(r,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer===Ae&&(r.r=er(r.r),r.g=er(r.g),r.b=er(r.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Ae&&(r.r=Ws(r.r),r.g=Ws(r.g),r.b=Ws(r.b))),r},fromWorkingColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},toWorkingColorSpace:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===_r?ll:this.spaces[r].transfer},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,a){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[la]:{primaries:t,whitePoint:i,transfer:ll,toXYZ:Fh,fromXYZ:Oh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Qn},outputColorSpaceConfig:{drawingBufferColorSpace:Qn}},[Qn]:{primaries:t,whitePoint:i,transfer:Ae,toXYZ:Fh,fromXYZ:Oh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Qn}}}),n}const ye=Ug();function er(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Ws(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let _s;class Ng{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{_s===void 0&&(_s=ul("canvas")),_s.width=t.width,_s.height=t.height;const i=_s.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),e=_s}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=ul("canvas");e.width=t.width,e.height=t.height;const i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);const r=i.getImageData(0,0,t.width,t.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=er(s[a]/255)*255;return i.putImageData(r,0,0),e}else if(t.data){const e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(er(e[i]/255)*255):e[i]=er(e[i]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Fg=0;class Mp{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Fg++}),this.uuid=br(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(Yl(r[a].image)):s.push(Yl(r[a]))}else s=Yl(r);i.url=s}return e||(t.images[this.uuid]=i),i}}function Yl(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Ng.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Og=0;class An extends cs{constructor(t=An.DEFAULT_IMAGE,e=An.DEFAULT_MAPPING,i=Zr,r=Zr,s=Ci,a=Kr,o=hi,l=ir,c=An.DEFAULT_ANISOTROPY,u=_r){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Og++}),this.uuid=br(),this.name="",this.source=new Mp(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Wt(0,0),this.repeat=new Wt(1,1),this.center=new Wt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ae,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==ap)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ru:t.x=t.x-Math.floor(t.x);break;case Zr:t.x=t.x<0?0:1;break;case su:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ru:t.y=t.y-Math.floor(t.y);break;case Zr:t.y=t.y<0?0:1;break;case su:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}An.DEFAULT_IMAGE=null;An.DEFAULT_MAPPING=ap;An.DEFAULT_ANISOTROPY=1;class Ye{constructor(t=0,e=0,i=0,r=1){Ye.prototype.isVector4=!0,this.x=t,this.y=e,this.z=i,this.w=r}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,r){return this.x=t,this.y=e,this.z=i,this.w=r,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,i=this.y,r=this.z,s=this.w,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*e+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*e+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*e+a[7]*i+a[11]*r+a[15]*s,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,r,s;const l=t.elements,c=l[0],u=l[4],h=l[8],f=l[1],m=l[5],_=l[9],v=l[2],p=l[6],d=l[10];if(Math.abs(u-f)<.01&&Math.abs(h-v)<.01&&Math.abs(_-p)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+v)<.1&&Math.abs(_+p)<.1&&Math.abs(c+m+d-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const b=(c+1)/2,S=(m+1)/2,D=(d+1)/2,C=(u+f)/4,R=(h+v)/4,P=(_+p)/4;return b>S&&b>D?b<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(b),r=C/i,s=R/i):S>D?S<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(S),i=C/r,s=P/r):D<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(D),i=R/s,r=P/s),this.set(i,r,s,e),this}let w=Math.sqrt((p-_)*(p-_)+(h-v)*(h-v)+(f-u)*(f-u));return Math.abs(w)<.001&&(w=1),this.x=(p-_)/w,this.y=(h-v)/w,this.z=(f-u)/w,this.w=Math.acos((c+m+d-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this.z=de(this.z,t.z,e.z),this.w=de(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this.z=de(this.z,t,e),this.w=de(this.w,t,e),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(de(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Bg extends cs{constructor(t=1,e=1,i={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new Ye(0,0,t,e),this.scissorTest=!1,this.viewport=new Ye(0,0,t,e);const r={width:t,height:e,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ci,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const s=new An(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];const a=i.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=t,this.textures[r].image.height=e,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let i=0,r=t.textures.length;i<r;i++)this.textures[i]=t.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new Mp(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ls extends Bg{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}}class yp extends An{constructor(t=null,e=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:r},this.magFilter=fi,this.minFilter=fi,this.wrapR=Zr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class zg extends An{constructor(t=null,e=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:r},this.magFilter=fi,this.minFilter=fi,this.wrapR=Zr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class hn{constructor(t=0,e=0,i=0,r=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=r}static slerpFlat(t,e,i,r,s,a,o){let l=i[r+0],c=i[r+1],u=i[r+2],h=i[r+3];const f=s[a+0],m=s[a+1],_=s[a+2],v=s[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h;return}if(o===1){t[e+0]=f,t[e+1]=m,t[e+2]=_,t[e+3]=v;return}if(h!==v||l!==f||c!==m||u!==_){let p=1-o;const d=l*f+c*m+u*_+h*v,w=d>=0?1:-1,b=1-d*d;if(b>Number.EPSILON){const D=Math.sqrt(b),C=Math.atan2(D,d*w);p=Math.sin(p*C)/D,o=Math.sin(o*C)/D}const S=o*w;if(l=l*p+f*S,c=c*p+m*S,u=u*p+_*S,h=h*p+v*S,p===1-o){const D=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=D,c*=D,u*=D,h*=D}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h}static multiplyQuaternionsFlat(t,e,i,r,s,a){const o=i[r],l=i[r+1],c=i[r+2],u=i[r+3],h=s[a],f=s[a+1],m=s[a+2],_=s[a+3];return t[e]=o*_+u*h+l*m-c*f,t[e+1]=l*_+u*f+c*h-o*m,t[e+2]=c*_+u*m+o*f-l*h,t[e+3]=u*_-o*h-l*f-c*m,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,r){return this._x=t,this._y=e,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const i=t._x,r=t._y,s=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(i/2),u=o(r/2),h=o(s/2),f=l(i/2),m=l(r/2),_=l(s/2);switch(a){case"XYZ":this._x=f*u*h+c*m*_,this._y=c*m*h-f*u*_,this._z=c*u*_+f*m*h,this._w=c*u*h-f*m*_;break;case"YXZ":this._x=f*u*h+c*m*_,this._y=c*m*h-f*u*_,this._z=c*u*_-f*m*h,this._w=c*u*h+f*m*_;break;case"ZXY":this._x=f*u*h-c*m*_,this._y=c*m*h+f*u*_,this._z=c*u*_+f*m*h,this._w=c*u*h-f*m*_;break;case"ZYX":this._x=f*u*h-c*m*_,this._y=c*m*h+f*u*_,this._z=c*u*_-f*m*h,this._w=c*u*h+f*m*_;break;case"YZX":this._x=f*u*h+c*m*_,this._y=c*m*h+f*u*_,this._z=c*u*_-f*m*h,this._w=c*u*h-f*m*_;break;case"XZY":this._x=f*u*h-c*m*_,this._y=c*m*h-f*u*_,this._z=c*u*_+f*m*h,this._w=c*u*h+f*m*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const i=e/2,r=Math.sin(i);return this._x=t.x*r,this._y=t.y*r,this._z=t.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,i=e[0],r=e[4],s=e[8],a=e[1],o=e[5],l=e[9],c=e[2],u=e[6],h=e[10],f=i+o+h;if(f>0){const m=.5/Math.sqrt(f+1);this._w=.25/m,this._x=(u-l)*m,this._y=(s-c)*m,this._z=(a-r)*m}else if(i>o&&i>h){const m=2*Math.sqrt(1+i-o-h);this._w=(u-l)/m,this._x=.25*m,this._y=(r+a)/m,this._z=(s+c)/m}else if(o>h){const m=2*Math.sqrt(1+o-i-h);this._w=(s-c)/m,this._x=(r+a)/m,this._y=.25*m,this._z=(l+u)/m}else{const m=2*Math.sqrt(1+h-i-o);this._w=(a-r)/m,this._x=(s+c)/m,this._y=(l+u)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<Number.EPSILON?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(de(this.dot(t),-1,1)))}rotateTowards(t,e){const i=this.angleTo(t);if(i===0)return this;const r=Math.min(1,e/i);return this.slerp(t,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const i=t._x,r=t._y,s=t._z,a=t._w,o=e._x,l=e._y,c=e._z,u=e._w;return this._x=i*u+a*o+r*c-s*l,this._y=r*u+a*l+s*o-i*c,this._z=s*u+a*c+i*l-r*o,this._w=a*u-i*o-r*l-s*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const i=this._x,r=this._y,s=this._z,a=this._w;let o=a*t._w+i*t._x+r*t._y+s*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=i,this._y=r,this._z=s,this;const l=1-o*o;if(l<=Number.EPSILON){const m=1-e;return this._w=m*a+e*this._w,this._x=m*i+e*this._x,this._y=m*r+e*this._y,this._z=m*s+e*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,o),h=Math.sin((1-e)*u)/c,f=Math.sin(e*u)/c;return this._w=a*h+this._w*f,this._x=i*h+this._x*f,this._y=r*h+this._y*f,this._z=s*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(t),r*Math.cos(t),s*Math.sin(e),s*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class I{constructor(t=0,e=0,i=0){I.prototype.isVector3=!0,this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Bh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Bh.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,i=this.y,r=this.z,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6]*r,this.y=s[1]*e+s[4]*i+s[7]*r,this.z=s[2]*e+s[5]*i+s[8]*r,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,i=this.y,r=this.z,s=t.elements,a=1/(s[3]*e+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*e+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*e+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*e+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(t){const e=this.x,i=this.y,r=this.z,s=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*r-o*i),u=2*(o*e-s*r),h=2*(s*i-a*e);return this.x=e+l*c+a*h-o*u,this.y=i+l*u+o*c-s*h,this.z=r+l*h+s*u-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,i=this.y,r=this.z,s=t.elements;return this.x=s[0]*e+s[4]*i+s[8]*r,this.y=s[1]*e+s[5]*i+s[9]*r,this.z=s[2]*e+s[6]*i+s[10]*r,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this.z=de(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this.z=de(this.z,t,e),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(de(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const i=t.x,r=t.y,s=t.z,a=e.x,o=e.y,l=e.z;return this.x=r*l-s*o,this.y=s*a-i*l,this.z=i*o-r*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return ql.copy(this).projectOnVector(t),this.sub(ql)}reflect(t){return this.sub(ql.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const i=this.dot(t)/e;return Math.acos(de(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,i=this.y-t.y,r=this.z-t.z;return e*e+i*i+r*r}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){const r=Math.sin(e)*t;return this.x=r*Math.sin(i),this.y=Math.cos(e)*t,this.z=r*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),r=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=r,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ql=new I,Bh=new hn;class oo{constructor(t=new I(1/0,1/0,1/0),e=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(ri.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(ri.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const i=ri.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const i=t.geometry;if(i!==void 0){const s=i.getAttribute("position");if(e===!0&&s!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,ri):ri.fromBufferAttribute(s,a),ri.applyMatrix4(t.matrixWorld),this.expandByPoint(ri);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),ho.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ho.copy(i.boundingBox)),ho.applyMatrix4(t.matrixWorld),this.union(ho)}const r=t.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,ri),ri.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ma),fo.subVectors(this.max,Ma),vs.subVectors(t.a,Ma),gs.subVectors(t.b,Ma),xs.subVectors(t.c,Ma),or.subVectors(gs,vs),lr.subVectors(xs,gs),Ir.subVectors(vs,xs);let e=[0,-or.z,or.y,0,-lr.z,lr.y,0,-Ir.z,Ir.y,or.z,0,-or.x,lr.z,0,-lr.x,Ir.z,0,-Ir.x,-or.y,or.x,0,-lr.y,lr.x,0,-Ir.y,Ir.x,0];return!$l(e,vs,gs,xs,fo)||(e=[1,0,0,0,1,0,0,0,1],!$l(e,vs,gs,xs,fo))?!1:(po.crossVectors(or,lr),e=[po.x,po.y,po.z],$l(e,vs,gs,xs,fo))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,ri).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(ri).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(zi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),zi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),zi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),zi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),zi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),zi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),zi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),zi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(zi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const zi=[new I,new I,new I,new I,new I,new I,new I,new I],ri=new I,ho=new oo,vs=new I,gs=new I,xs=new I,or=new I,lr=new I,Ir=new I,Ma=new I,fo=new I,po=new I,Ur=new I;function $l(n,t,e,i,r){for(let s=0,a=n.length-3;s<=a;s+=3){Ur.fromArray(n,s);const o=r.x*Math.abs(Ur.x)+r.y*Math.abs(Ur.y)+r.z*Math.abs(Ur.z),l=t.dot(Ur),c=e.dot(Ur),u=i.dot(Ur);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const kg=new oo,ya=new I,jl=new I;class wl{constructor(t=new I,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const i=this.center;e!==void 0?i.copy(e):kg.setFromPoints(t).getCenter(i);let r=0;for(let s=0,a=t.length;s<a;s++)r=Math.max(r,i.distanceToSquared(t[s]));return this.radius=Math.sqrt(r),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ya.subVectors(t,this.center);const e=ya.lengthSq();if(e>this.radius*this.radius){const i=Math.sqrt(e),r=(i-this.radius)*.5;this.center.addScaledVector(ya,r/i),this.radius+=r}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(jl.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ya.copy(t.center).add(jl)),this.expandByPoint(ya.copy(t.center).sub(jl))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ki=new I,Zl=new I,mo=new I,cr=new I,Kl=new I,_o=new I,Ql=new I;class Tl{constructor(t=new I,e=new I(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ki)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=ki.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ki.copy(this.origin).addScaledVector(this.direction,e),ki.distanceToSquared(t))}distanceSqToSegment(t,e,i,r){Zl.copy(t).add(e).multiplyScalar(.5),mo.copy(e).sub(t).normalize(),cr.copy(this.origin).sub(Zl);const s=t.distanceTo(e)*.5,a=-this.direction.dot(mo),o=cr.dot(this.direction),l=-cr.dot(mo),c=cr.lengthSq(),u=Math.abs(1-a*a);let h,f,m,_;if(u>0)if(h=a*l-o,f=a*o-l,_=s*u,h>=0)if(f>=-_)if(f<=_){const v=1/u;h*=v,f*=v,m=h*(h+a*f+2*o)+f*(a*h+f+2*l)+c}else f=s,h=Math.max(0,-(a*f+o)),m=-h*h+f*(f+2*l)+c;else f=-s,h=Math.max(0,-(a*f+o)),m=-h*h+f*(f+2*l)+c;else f<=-_?(h=Math.max(0,-(-a*s+o)),f=h>0?-s:Math.min(Math.max(-s,-l),s),m=-h*h+f*(f+2*l)+c):f<=_?(h=0,f=Math.min(Math.max(-s,-l),s),m=f*(f+2*l)+c):(h=Math.max(0,-(a*s+o)),f=h>0?s:Math.min(Math.max(-s,-l),s),m=-h*h+f*(f+2*l)+c);else f=a>0?-s:s,h=Math.max(0,-(a*f+o)),m=-h*h+f*(f+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Zl).addScaledVector(mo,f),m}intersectSphere(t,e){ki.subVectors(t.center,this.origin);const i=ki.dot(this.direction),r=ki.dot(ki)-i*i,s=t.radius*t.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){const i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,r,s,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return c>=0?(i=(t.min.x-f.x)*c,r=(t.max.x-f.x)*c):(i=(t.max.x-f.x)*c,r=(t.min.x-f.x)*c),u>=0?(s=(t.min.y-f.y)*u,a=(t.max.y-f.y)*u):(s=(t.max.y-f.y)*u,a=(t.min.y-f.y)*u),i>a||s>r||((s>i||isNaN(i))&&(i=s),(a<r||isNaN(r))&&(r=a),h>=0?(o=(t.min.z-f.z)*h,l=(t.max.z-f.z)*h):(o=(t.max.z-f.z)*h,l=(t.min.z-f.z)*h),i>l||o>r)||((o>i||i!==i)&&(i=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,e)}intersectsBox(t){return this.intersectBox(t,ki)!==null}intersectTriangle(t,e,i,r,s){Kl.subVectors(e,t),_o.subVectors(i,t),Ql.crossVectors(Kl,_o);let a=this.direction.dot(Ql),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;cr.subVectors(this.origin,t);const l=o*this.direction.dot(_o.crossVectors(cr,_o));if(l<0)return null;const c=o*this.direction.dot(Kl.cross(cr));if(c<0||l+c>a)return null;const u=-o*cr.dot(Ql);return u<0?null:this.at(u/a,s)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ue{constructor(t,e,i,r,s,a,o,l,c,u,h,f,m,_,v,p){Ue.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,r,s,a,o,l,c,u,h,f,m,_,v,p)}set(t,e,i,r,s,a,o,l,c,u,h,f,m,_,v,p){const d=this.elements;return d[0]=t,d[4]=e,d[8]=i,d[12]=r,d[1]=s,d[5]=a,d[9]=o,d[13]=l,d[2]=c,d[6]=u,d[10]=h,d[14]=f,d[3]=m,d[7]=_,d[11]=v,d[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ue().fromArray(this.elements)}copy(t){const e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){const e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,i=t.elements,r=1/Ms.setFromMatrixColumn(t,0).length(),s=1/Ms.setFromMatrixColumn(t,1).length(),a=1/Ms.setFromMatrixColumn(t,2).length();return e[0]=i[0]*r,e[1]=i[1]*r,e[2]=i[2]*r,e[3]=0,e[4]=i[4]*s,e[5]=i[5]*s,e[6]=i[6]*s,e[7]=0,e[8]=i[8]*a,e[9]=i[9]*a,e[10]=i[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,i=t.x,r=t.y,s=t.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(t.order==="XYZ"){const f=a*u,m=a*h,_=o*u,v=o*h;e[0]=l*u,e[4]=-l*h,e[8]=c,e[1]=m+_*c,e[5]=f-v*c,e[9]=-o*l,e[2]=v-f*c,e[6]=_+m*c,e[10]=a*l}else if(t.order==="YXZ"){const f=l*u,m=l*h,_=c*u,v=c*h;e[0]=f+v*o,e[4]=_*o-m,e[8]=a*c,e[1]=a*h,e[5]=a*u,e[9]=-o,e[2]=m*o-_,e[6]=v+f*o,e[10]=a*l}else if(t.order==="ZXY"){const f=l*u,m=l*h,_=c*u,v=c*h;e[0]=f-v*o,e[4]=-a*h,e[8]=_+m*o,e[1]=m+_*o,e[5]=a*u,e[9]=v-f*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const f=a*u,m=a*h,_=o*u,v=o*h;e[0]=l*u,e[4]=_*c-m,e[8]=f*c+v,e[1]=l*h,e[5]=v*c+f,e[9]=m*c-_,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const f=a*l,m=a*c,_=o*l,v=o*c;e[0]=l*u,e[4]=v-f*h,e[8]=_*h+m,e[1]=h,e[5]=a*u,e[9]=-o*u,e[2]=-c*u,e[6]=m*h+_,e[10]=f-v*h}else if(t.order==="XZY"){const f=a*l,m=a*c,_=o*l,v=o*c;e[0]=l*u,e[4]=-h,e[8]=c*u,e[1]=f*h+v,e[5]=a*u,e[9]=m*h-_,e[2]=_*h-m,e[6]=o*u,e[10]=v*h+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Hg,t,Vg)}lookAt(t,e,i){const r=this.elements;return Fn.subVectors(t,e),Fn.lengthSq()===0&&(Fn.z=1),Fn.normalize(),ur.crossVectors(i,Fn),ur.lengthSq()===0&&(Math.abs(i.z)===1?Fn.x+=1e-4:Fn.z+=1e-4,Fn.normalize(),ur.crossVectors(i,Fn)),ur.normalize(),vo.crossVectors(Fn,ur),r[0]=ur.x,r[4]=vo.x,r[8]=Fn.x,r[1]=ur.y,r[5]=vo.y,r[9]=Fn.y,r[2]=ur.z,r[6]=vo.z,r[10]=Fn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const i=t.elements,r=e.elements,s=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],u=i[1],h=i[5],f=i[9],m=i[13],_=i[2],v=i[6],p=i[10],d=i[14],w=i[3],b=i[7],S=i[11],D=i[15],C=r[0],R=r[4],P=r[8],y=r[12],M=r[1],A=r[5],O=r[9],U=r[13],k=r[2],W=r[6],X=r[10],j=r[14],G=r[3],V=r[7],lt=r[11],vt=r[15];return s[0]=a*C+o*M+l*k+c*G,s[4]=a*R+o*A+l*W+c*V,s[8]=a*P+o*O+l*X+c*lt,s[12]=a*y+o*U+l*j+c*vt,s[1]=u*C+h*M+f*k+m*G,s[5]=u*R+h*A+f*W+m*V,s[9]=u*P+h*O+f*X+m*lt,s[13]=u*y+h*U+f*j+m*vt,s[2]=_*C+v*M+p*k+d*G,s[6]=_*R+v*A+p*W+d*V,s[10]=_*P+v*O+p*X+d*lt,s[14]=_*y+v*U+p*j+d*vt,s[3]=w*C+b*M+S*k+D*G,s[7]=w*R+b*A+S*W+D*V,s[11]=w*P+b*O+S*X+D*lt,s[15]=w*y+b*U+S*j+D*vt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],i=t[4],r=t[8],s=t[12],a=t[1],o=t[5],l=t[9],c=t[13],u=t[2],h=t[6],f=t[10],m=t[14],_=t[3],v=t[7],p=t[11],d=t[15];return _*(+s*l*h-r*c*h-s*o*f+i*c*f+r*o*m-i*l*m)+v*(+e*l*m-e*c*f+s*a*f-r*a*m+r*c*u-s*l*u)+p*(+e*c*h-e*o*m-s*a*h+i*a*m+s*o*u-i*c*u)+d*(-r*o*u-e*l*h+e*o*f+r*a*h-i*a*f+i*l*u)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){const r=this.elements;return t.isVector3?(r[12]=t.x,r[13]=t.y,r[14]=t.z):(r[12]=t,r[13]=e,r[14]=i),this}invert(){const t=this.elements,e=t[0],i=t[1],r=t[2],s=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],h=t[9],f=t[10],m=t[11],_=t[12],v=t[13],p=t[14],d=t[15],w=h*p*c-v*f*c+v*l*m-o*p*m-h*l*d+o*f*d,b=_*f*c-u*p*c-_*l*m+a*p*m+u*l*d-a*f*d,S=u*v*c-_*h*c+_*o*m-a*v*m-u*o*d+a*h*d,D=_*h*l-u*v*l-_*o*f+a*v*f+u*o*p-a*h*p,C=e*w+i*b+r*S+s*D;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/C;return t[0]=w*R,t[1]=(v*f*s-h*p*s-v*r*m+i*p*m+h*r*d-i*f*d)*R,t[2]=(o*p*s-v*l*s+v*r*c-i*p*c-o*r*d+i*l*d)*R,t[3]=(h*l*s-o*f*s-h*r*c+i*f*c+o*r*m-i*l*m)*R,t[4]=b*R,t[5]=(u*p*s-_*f*s+_*r*m-e*p*m-u*r*d+e*f*d)*R,t[6]=(_*l*s-a*p*s-_*r*c+e*p*c+a*r*d-e*l*d)*R,t[7]=(a*f*s-u*l*s+u*r*c-e*f*c-a*r*m+e*l*m)*R,t[8]=S*R,t[9]=(_*h*s-u*v*s-_*i*m+e*v*m+u*i*d-e*h*d)*R,t[10]=(a*v*s-_*o*s+_*i*c-e*v*c-a*i*d+e*o*d)*R,t[11]=(u*o*s-a*h*s-u*i*c+e*h*c+a*i*m-e*o*m)*R,t[12]=D*R,t[13]=(u*v*r-_*h*r+_*i*f-e*v*f-u*i*p+e*h*p)*R,t[14]=(_*o*r-a*v*r-_*i*l+e*v*l+a*i*p-e*o*p)*R,t[15]=(a*h*r-u*o*r+u*i*l-e*h*l-a*i*f+e*o*f)*R,this}scale(t){const e=this.elements,i=t.x,r=t.y,s=t.z;return e[0]*=i,e[4]*=r,e[8]*=s,e[1]*=i,e[5]*=r,e[9]*=s,e[2]*=i,e[6]*=r,e[10]*=s,e[3]*=i,e[7]*=r,e[11]*=s,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],r=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,r))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const i=Math.cos(e),r=Math.sin(e),s=1-i,a=t.x,o=t.y,l=t.z,c=s*a,u=s*o;return this.set(c*a+i,c*o-r*l,c*l+r*o,0,c*o+r*l,u*o+i,u*l-r*a,0,c*l-r*o,u*l+r*a,s*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,r,s,a){return this.set(1,i,s,0,t,1,a,0,e,r,1,0,0,0,0,1),this}compose(t,e,i){const r=this.elements,s=e._x,a=e._y,o=e._z,l=e._w,c=s+s,u=a+a,h=o+o,f=s*c,m=s*u,_=s*h,v=a*u,p=a*h,d=o*h,w=l*c,b=l*u,S=l*h,D=i.x,C=i.y,R=i.z;return r[0]=(1-(v+d))*D,r[1]=(m+S)*D,r[2]=(_-b)*D,r[3]=0,r[4]=(m-S)*C,r[5]=(1-(f+d))*C,r[6]=(p+w)*C,r[7]=0,r[8]=(_+b)*R,r[9]=(p-w)*R,r[10]=(1-(f+v))*R,r[11]=0,r[12]=t.x,r[13]=t.y,r[14]=t.z,r[15]=1,this}decompose(t,e,i){const r=this.elements;let s=Ms.set(r[0],r[1],r[2]).length();const a=Ms.set(r[4],r[5],r[6]).length(),o=Ms.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),t.x=r[12],t.y=r[13],t.z=r[14],si.copy(this);const c=1/s,u=1/a,h=1/o;return si.elements[0]*=c,si.elements[1]*=c,si.elements[2]*=c,si.elements[4]*=u,si.elements[5]*=u,si.elements[6]*=u,si.elements[8]*=h,si.elements[9]*=h,si.elements[10]*=h,e.setFromRotationMatrix(si),i.x=s,i.y=a,i.z=o,this}makePerspective(t,e,i,r,s,a,o=Qi){const l=this.elements,c=2*s/(e-t),u=2*s/(i-r),h=(e+t)/(e-t),f=(i+r)/(i-r);let m,_;if(o===Qi)m=-(a+s)/(a-s),_=-2*a*s/(a-s);else if(o===cl)m=-a/(a-s),_=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,i,r,s,a,o=Qi){const l=this.elements,c=1/(e-t),u=1/(i-r),h=1/(a-s),f=(e+t)*c,m=(i+r)*u;let _,v;if(o===Qi)_=(a+s)*h,v=-2*h;else if(o===cl)_=s*h,v=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-m,l[2]=0,l[6]=0,l[10]=v,l[14]=-_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,i=t.elements;for(let r=0;r<16;r++)if(e[r]!==i[r])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){const i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}}const Ms=new I,si=new Ue,Hg=new I(0,0,0),Vg=new I(1,1,1),ur=new I,vo=new I,Fn=new I,zh=new Ue,kh=new hn;class _i{constructor(t=0,e=0,i=0,r=_i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=r}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,r=this._order){return this._x=t,this._y=e,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){const r=t.elements,s=r[0],a=r[4],o=r[8],l=r[1],c=r[5],u=r[9],h=r[2],f=r[6],m=r[10];switch(e){case"XYZ":this._y=Math.asin(de(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,m),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-de(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(de(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,m),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-de(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,m),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(de(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-de(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return zh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(zh,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return kh.setFromEuler(this),this.setFromQuaternion(kh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}_i.DEFAULT_ORDER="XYZ";class rh{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Gg=0;const Hh=new I,ys=new hn,Hi=new Ue,go=new I,Sa=new I,Wg=new I,Xg=new hn,Vh=new I(1,0,0),Gh=new I(0,1,0),Wh=new I(0,0,1),Xh={type:"added"},Yg={type:"removed"},Ss={type:"childadded",child:null},Jl={type:"childremoved",child:null};class Ze extends cs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Gg++}),this.uuid=br(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ze.DEFAULT_UP.clone();const t=new I,e=new _i,i=new hn,r=new I(1,1,1);function s(){i.setFromEuler(e,!1)}function a(){e.setFromQuaternion(i,void 0,!1)}e._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Ue},normalMatrix:{value:new ae}}),this.matrix=new Ue,this.matrixWorld=new Ue,this.matrixAutoUpdate=Ze.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ze.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new rh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return ys.setFromAxisAngle(t,e),this.quaternion.multiply(ys),this}rotateOnWorldAxis(t,e){return ys.setFromAxisAngle(t,e),this.quaternion.premultiply(ys),this}rotateX(t){return this.rotateOnAxis(Vh,t)}rotateY(t){return this.rotateOnAxis(Gh,t)}rotateZ(t){return this.rotateOnAxis(Wh,t)}translateOnAxis(t,e){return Hh.copy(t).applyQuaternion(this.quaternion),this.position.add(Hh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Vh,t)}translateY(t){return this.translateOnAxis(Gh,t)}translateZ(t){return this.translateOnAxis(Wh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Hi.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?go.copy(t):go.set(t,e,i);const r=this.parent;this.updateWorldMatrix(!0,!1),Sa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Hi.lookAt(Sa,go,this.up):Hi.lookAt(go,Sa,this.up),this.quaternion.setFromRotationMatrix(Hi),r&&(Hi.extractRotation(r.matrixWorld),ys.setFromRotationMatrix(Hi),this.quaternion.premultiply(ys.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Xh),Ss.child=t,this.dispatchEvent(Ss),Ss.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Yg),Jl.child=t,this.dispatchEvent(Jl),Jl.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Hi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Hi.multiply(t.parent.matrixWorld)),t.applyMatrix4(Hi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Xh),Ss.child=t,this.dispatchEvent(Ss),Ss.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,r=this.children.length;i<r;i++){const a=this.children[i].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sa,t,Wg),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sa,Xg,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let i=0,r=e.length;i<r;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let i=0,r=e.length;i<r;i++)e[i].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let i=0,r=e.length;i<r;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e){const i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];s(t.shapes,h)}else s(t.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(t.materials,this.material[l]));r.material=o}else r.material=s(t.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(s(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),u=a(t.images),h=a(t.shapes),f=a(t.skeletons),m=a(t.animations),_=a(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),f.length>0&&(i.skeletons=f),m.length>0&&(i.animations=m),_.length>0&&(i.nodes=_)}return i.object=r,i;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){const r=t.children[i];this.add(r.clone())}return this}}Ze.DEFAULT_UP=new I(0,1,0);Ze.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ze.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const ai=new I,Vi=new I,tc=new I,Gi=new I,Es=new I,bs=new I,Yh=new I,ec=new I,nc=new I,ic=new I,rc=new Ye,sc=new Ye,ac=new Ye;class Vn{constructor(t=new I,e=new I,i=new I){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,r){r.subVectors(i,e),ai.subVectors(t,e),r.cross(ai);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(t,e,i,r,s){ai.subVectors(r,e),Vi.subVectors(i,e),tc.subVectors(t,e);const a=ai.dot(ai),o=ai.dot(Vi),l=ai.dot(tc),c=Vi.dot(Vi),u=Vi.dot(tc),h=a*c-o*o;if(h===0)return s.set(0,0,0),null;const f=1/h,m=(c*l-o*u)*f,_=(a*u-o*l)*f;return s.set(1-m-_,_,m)}static containsPoint(t,e,i,r){return this.getBarycoord(t,e,i,r,Gi)===null?!1:Gi.x>=0&&Gi.y>=0&&Gi.x+Gi.y<=1}static getInterpolation(t,e,i,r,s,a,o,l){return this.getBarycoord(t,e,i,r,Gi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Gi.x),l.addScaledVector(a,Gi.y),l.addScaledVector(o,Gi.z),l)}static getInterpolatedAttribute(t,e,i,r,s,a){return rc.setScalar(0),sc.setScalar(0),ac.setScalar(0),rc.fromBufferAttribute(t,e),sc.fromBufferAttribute(t,i),ac.fromBufferAttribute(t,r),a.setScalar(0),a.addScaledVector(rc,s.x),a.addScaledVector(sc,s.y),a.addScaledVector(ac,s.z),a}static isFrontFacing(t,e,i,r){return ai.subVectors(i,e),Vi.subVectors(t,e),ai.cross(Vi).dot(r)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,r){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[r]),this}setFromAttributeAndIndices(t,e,i,r){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,r),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return ai.subVectors(this.c,this.b),Vi.subVectors(this.a,this.b),ai.cross(Vi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Vn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return Vn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,r,s){return Vn.getInterpolation(t,this.a,this.b,this.c,e,i,r,s)}containsPoint(t){return Vn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Vn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const i=this.a,r=this.b,s=this.c;let a,o;Es.subVectors(r,i),bs.subVectors(s,i),ec.subVectors(t,i);const l=Es.dot(ec),c=bs.dot(ec);if(l<=0&&c<=0)return e.copy(i);nc.subVectors(t,r);const u=Es.dot(nc),h=bs.dot(nc);if(u>=0&&h<=u)return e.copy(r);const f=l*h-u*c;if(f<=0&&l>=0&&u<=0)return a=l/(l-u),e.copy(i).addScaledVector(Es,a);ic.subVectors(t,s);const m=Es.dot(ic),_=bs.dot(ic);if(_>=0&&m<=_)return e.copy(s);const v=m*c-l*_;if(v<=0&&c>=0&&_<=0)return o=c/(c-_),e.copy(i).addScaledVector(bs,o);const p=u*_-m*h;if(p<=0&&h-u>=0&&m-_>=0)return Yh.subVectors(s,r),o=(h-u)/(h-u+(m-_)),e.copy(r).addScaledVector(Yh,o);const d=1/(p+v+f);return a=v*d,o=f*d,e.copy(i).addScaledVector(Es,a).addScaledVector(bs,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Sp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},hr={h:0,s:0,l:0},xo={h:0,s:0,l:0};function oc(n,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?n+(t-n)*6*e:e<1/2?t:e<2/3?n+(t-n)*6*(2/3-e):n}class fe{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){const r=t;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Qn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ye.toWorkingColorSpace(this,e),this}setRGB(t,e,i,r=ye.workingColorSpace){return this.r=t,this.g=e,this.b=i,ye.toWorkingColorSpace(this,r),this}setHSL(t,e,i,r=ye.workingColorSpace){if(t=Rg(t,1),e=de(e,0,1),i=de(i,0,1),e===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+e):i+e-i*e,a=2*i-s;this.r=oc(a,s,t+1/3),this.g=oc(a,s,t),this.b=oc(a,s,t-1/3)}return ye.toWorkingColorSpace(this,r),this}setStyle(t,e=Qn){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(t)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,e);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,e);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(t)){const s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(s,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Qn){const i=Sp[t.toLowerCase()];return i!==void 0?this.setHex(i,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=er(t.r),this.g=er(t.g),this.b=er(t.b),this}copyLinearToSRGB(t){return this.r=Ws(t.r),this.g=Ws(t.g),this.b=Ws(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Qn){return ye.fromWorkingColorSpace(vn.copy(this),t),Math.round(de(vn.r*255,0,255))*65536+Math.round(de(vn.g*255,0,255))*256+Math.round(de(vn.b*255,0,255))}getHexString(t=Qn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ye.workingColorSpace){ye.fromWorkingColorSpace(vn.copy(this),e);const i=vn.r,r=vn.g,s=vn.b,a=Math.max(i,r,s),o=Math.min(i,r,s);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const h=a-o;switch(c=u<=.5?h/(a+o):h/(2-a-o),a){case i:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-i)/h+2;break;case s:l=(i-r)/h+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=ye.workingColorSpace){return ye.fromWorkingColorSpace(vn.copy(this),e),t.r=vn.r,t.g=vn.g,t.b=vn.b,t}getStyle(t=Qn){ye.fromWorkingColorSpace(vn.copy(this),t);const e=vn.r,i=vn.g,r=vn.b;return t!==Qn?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(t,e,i){return this.getHSL(hr),this.setHSL(hr.h+t,hr.s+e,hr.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(hr),t.getHSL(xo);const i=Wl(hr.h,xo.h,e),r=Wl(hr.s,xo.s,e),s=Wl(hr.l,xo.l,e);return this.setHSL(i,r,s),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,i=this.g,r=this.b,s=t.elements;return this.r=s[0]*e+s[3]*i+s[6]*r,this.g=s[1]*e+s[4]*i+s[7]*r,this.b=s[2]*e+s[5]*i+s[8]*r,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const vn=new fe;fe.NAMES=Sp;let qg=0;class us extends cs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:qg++}),this.uuid=br(),this.name="",this.type="Material",this.blending=Vs,this.side=Rr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=qc,this.blendDst=$c,this.blendEquation=Wr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new fe(0,0,0),this.blendAlpha=0,this.depthFunc=ia,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ih,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ms,this.stencilZFail=ms,this.stencilZPass=ms,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const i=t[e];if(i===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const r=this[e];if(r===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[e]=i}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Vs&&(i.blending=this.blending),this.side!==Rr&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==qc&&(i.blendSrc=this.blendSrc),this.blendDst!==$c&&(i.blendDst=this.blendDst),this.blendEquation!==Wr&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ia&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Ih&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ms&&(i.stencilFail=this.stencilFail),this.stencilZFail!==ms&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==ms&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(e){const s=r(t.textures),a=r(t.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let i=null;if(e!==null){const r=e.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=e[s].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Al extends us{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new fe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _i,this.combine=sp,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Qe=new I,Mo=new Wt;class pi{constructor(t,e,i=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=Lu,this.updateRanges=[],this.gpuType=Ki,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[t+r]=e.array[i+r];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Mo.fromBufferAttribute(this,e),Mo.applyMatrix3(t),this.setXY(e,Mo.x,Mo.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Qe.fromBufferAttribute(this,e),Qe.applyMatrix3(t),this.setXYZ(e,Qe.x,Qe.y,Qe.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Qe.fromBufferAttribute(this,e),Qe.applyMatrix4(t),this.setXYZ(e,Qe.x,Qe.y,Qe.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Qe.fromBufferAttribute(this,e),Qe.applyNormalMatrix(t),this.setXYZ(e,Qe.x,Qe.y,Qe.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Qe.fromBufferAttribute(this,e),Qe.transformDirection(t),this.setXYZ(e,Qe.x,Qe.y,Qe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=Ai(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=Re(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Ai(e,this.array)),e}setX(t,e){return this.normalized&&(e=Re(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Ai(e,this.array)),e}setY(t,e){return this.normalized&&(e=Re(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Ai(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Re(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Ai(e,this.array)),e}setW(t,e){return this.normalized&&(e=Re(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=Re(e,this.array),i=Re(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,r){return t*=this.itemSize,this.normalized&&(e=Re(e,this.array),i=Re(i,this.array),r=Re(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=r,this}setXYZW(t,e,i,r,s){return t*=this.itemSize,this.normalized&&(e=Re(e,this.array),i=Re(i,this.array),r=Re(r,this.array),s=Re(s,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=r,this.array[t+3]=s,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Lu&&(t.usage=this.usage),t}}class Ep extends pi{constructor(t,e,i){super(new Uint16Array(t),e,i)}}class bp extends pi{constructor(t,e,i){super(new Uint32Array(t),e,i)}}class Fe extends pi{constructor(t,e,i){super(new Float32Array(t),e,i)}}let $g=0;const qn=new Ue,lc=new Ze,ws=new I,On=new oo,Ea=new oo,on=new I;class fn extends cs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:$g++}),this.uuid=br(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(xp(t)?bp:Ep)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new ae().getNormalMatrix(t);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(t),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return qn.makeRotationFromQuaternion(t),this.applyMatrix4(qn),this}rotateX(t){return qn.makeRotationX(t),this.applyMatrix4(qn),this}rotateY(t){return qn.makeRotationY(t),this.applyMatrix4(qn),this}rotateZ(t){return qn.makeRotationZ(t),this.applyMatrix4(qn),this}translate(t,e,i){return qn.makeTranslation(t,e,i),this.applyMatrix4(qn),this}scale(t,e,i){return qn.makeScale(t,e,i),this.applyMatrix4(qn),this}lookAt(t){return lc.lookAt(t),lc.updateMatrix(),this.applyMatrix4(lc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ws).negate(),this.translate(ws.x,ws.y,ws.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const i=[];for(let r=0,s=t.length;r<s;r++){const a=t[r];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Fe(i,3))}else{const i=Math.min(t.length,e.count);for(let r=0;r<i;r++){const s=t[r];e.setXYZ(r,s.x,s.y,s.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new oo);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,r=e.length;i<r;i++){const s=e[i];On.setFromBufferAttribute(s),this.morphTargetsRelative?(on.addVectors(this.boundingBox.min,On.min),this.boundingBox.expandByPoint(on),on.addVectors(this.boundingBox.max,On.max),this.boundingBox.expandByPoint(on)):(this.boundingBox.expandByPoint(On.min),this.boundingBox.expandByPoint(On.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new wl);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(t){const i=this.boundingSphere.center;if(On.setFromBufferAttribute(t),e)for(let s=0,a=e.length;s<a;s++){const o=e[s];Ea.setFromBufferAttribute(o),this.morphTargetsRelative?(on.addVectors(On.min,Ea.min),On.expandByPoint(on),on.addVectors(On.max,Ea.max),On.expandByPoint(on)):(On.expandByPoint(Ea.min),On.expandByPoint(Ea.max))}On.getCenter(i);let r=0;for(let s=0,a=t.count;s<a;s++)on.fromBufferAttribute(t,s),r=Math.max(r,i.distanceToSquared(on));if(e)for(let s=0,a=e.length;s<a;s++){const o=e[s],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)on.fromBufferAttribute(o,c),l&&(ws.fromBufferAttribute(t,c),on.add(ws)),r=Math.max(r,i.distanceToSquared(on))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=e.position,r=e.normal,s=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new pi(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let P=0;P<i.count;P++)o[P]=new I,l[P]=new I;const c=new I,u=new I,h=new I,f=new Wt,m=new Wt,_=new Wt,v=new I,p=new I;function d(P,y,M){c.fromBufferAttribute(i,P),u.fromBufferAttribute(i,y),h.fromBufferAttribute(i,M),f.fromBufferAttribute(s,P),m.fromBufferAttribute(s,y),_.fromBufferAttribute(s,M),u.sub(c),h.sub(c),m.sub(f),_.sub(f);const A=1/(m.x*_.y-_.x*m.y);isFinite(A)&&(v.copy(u).multiplyScalar(_.y).addScaledVector(h,-m.y).multiplyScalar(A),p.copy(h).multiplyScalar(m.x).addScaledVector(u,-_.x).multiplyScalar(A),o[P].add(v),o[y].add(v),o[M].add(v),l[P].add(p),l[y].add(p),l[M].add(p))}let w=this.groups;w.length===0&&(w=[{start:0,count:t.count}]);for(let P=0,y=w.length;P<y;++P){const M=w[P],A=M.start,O=M.count;for(let U=A,k=A+O;U<k;U+=3)d(t.getX(U+0),t.getX(U+1),t.getX(U+2))}const b=new I,S=new I,D=new I,C=new I;function R(P){D.fromBufferAttribute(r,P),C.copy(D);const y=o[P];b.copy(y),b.sub(D.multiplyScalar(D.dot(y))).normalize(),S.crossVectors(C,y);const A=S.dot(l[P])<0?-1:1;a.setXYZW(P,b.x,b.y,b.z,A)}for(let P=0,y=w.length;P<y;++P){const M=w[P],A=M.start,O=M.count;for(let U=A,k=A+O;U<k;U+=3)R(t.getX(U+0)),R(t.getX(U+1)),R(t.getX(U+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new pi(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let f=0,m=i.count;f<m;f++)i.setXYZ(f,0,0,0);const r=new I,s=new I,a=new I,o=new I,l=new I,c=new I,u=new I,h=new I;if(t)for(let f=0,m=t.count;f<m;f+=3){const _=t.getX(f+0),v=t.getX(f+1),p=t.getX(f+2);r.fromBufferAttribute(e,_),s.fromBufferAttribute(e,v),a.fromBufferAttribute(e,p),u.subVectors(a,s),h.subVectors(r,s),u.cross(h),o.fromBufferAttribute(i,_),l.fromBufferAttribute(i,v),c.fromBufferAttribute(i,p),o.add(u),l.add(u),c.add(u),i.setXYZ(_,o.x,o.y,o.z),i.setXYZ(v,l.x,l.y,l.z),i.setXYZ(p,c.x,c.y,c.z)}else for(let f=0,m=e.count;f<m;f+=3)r.fromBufferAttribute(e,f+0),s.fromBufferAttribute(e,f+1),a.fromBufferAttribute(e,f+2),u.subVectors(a,s),h.subVectors(r,s),u.cross(h),i.setXYZ(f+0,u.x,u.y,u.z),i.setXYZ(f+1,u.x,u.y,u.z),i.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)on.fromBufferAttribute(t,e),on.normalize(),t.setXYZ(e,on.x,on.y,on.z)}toNonIndexed(){function t(o,l){const c=o.array,u=o.itemSize,h=o.normalized,f=new c.constructor(l.length*u);let m=0,_=0;for(let v=0,p=l.length;v<p;v++){o.isInterleavedBufferAttribute?m=l[v]*o.data.stride+o.offset:m=l[v]*u;for(let d=0;d<u;d++)f[_++]=c[m++]}return new pi(f,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new fn,i=this.index.array,r=this.attributes;for(const o in r){const l=r[o],c=t(l,i);e.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let u=0,h=c.length;u<h;u++){const f=c[u],m=t(f,i);l.push(m)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const i=this.attributes;for(const l in i){const c=i[l];t.data.attributes[l]=c.toJSON(t.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,f=c.length;h<f;h++){const m=c[h];u.push(m.toJSON(t.data))}u.length>0&&(r[l]=u,s=!0)}s&&(t.data.morphAttributes=r,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const i=t.index;i!==null&&this.setIndex(i.clone(e));const r=t.attributes;for(const c in r){const u=r[c];this.setAttribute(c,u.clone(e))}const s=t.morphAttributes;for(const c in s){const u=[],h=s[c];for(let f=0,m=h.length;f<m;f++)u.push(h[f].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,u=a.length;c<u;c++){const h=a[c];this.addGroup(h.start,h.count,h.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const qh=new Ue,Nr=new Tl,yo=new wl,$h=new I,So=new I,Eo=new I,bo=new I,cc=new I,wo=new I,jh=new I,To=new I;class Pt extends Ze{constructor(t=new fn,e=new Al){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){const r=e[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(t,e){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;e.fromBufferAttribute(r,t);const o=this.morphTargetInfluences;if(s&&o){wo.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const u=o[l],h=s[l];u!==0&&(cc.fromBufferAttribute(h,t),a?wo.addScaledVector(cc,u):wo.addScaledVector(cc.sub(e),u))}e.add(wo)}return e}raycast(t,e){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),yo.copy(i.boundingSphere),yo.applyMatrix4(s),Nr.copy(t.ray).recast(t.near),!(yo.containsPoint(Nr.origin)===!1&&(Nr.intersectSphere(yo,$h)===null||Nr.origin.distanceToSquared($h)>(t.far-t.near)**2))&&(qh.copy(s).invert(),Nr.copy(t.ray).applyMatrix4(qh),!(i.boundingBox!==null&&Nr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,Nr)))}_computeIntersections(t,e,i){let r;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,f=s.groups,m=s.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,v=f.length;_<v;_++){const p=f[_],d=a[p.materialIndex],w=Math.max(p.start,m.start),b=Math.min(o.count,Math.min(p.start+p.count,m.start+m.count));for(let S=w,D=b;S<D;S+=3){const C=o.getX(S),R=o.getX(S+1),P=o.getX(S+2);r=Ao(this,d,t,i,c,u,h,C,R,P),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=p.materialIndex,e.push(r))}}else{const _=Math.max(0,m.start),v=Math.min(o.count,m.start+m.count);for(let p=_,d=v;p<d;p+=3){const w=o.getX(p),b=o.getX(p+1),S=o.getX(p+2);r=Ao(this,a,t,i,c,u,h,w,b,S),r&&(r.faceIndex=Math.floor(p/3),e.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let _=0,v=f.length;_<v;_++){const p=f[_],d=a[p.materialIndex],w=Math.max(p.start,m.start),b=Math.min(l.count,Math.min(p.start+p.count,m.start+m.count));for(let S=w,D=b;S<D;S+=3){const C=S,R=S+1,P=S+2;r=Ao(this,d,t,i,c,u,h,C,R,P),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=p.materialIndex,e.push(r))}}else{const _=Math.max(0,m.start),v=Math.min(l.count,m.start+m.count);for(let p=_,d=v;p<d;p+=3){const w=p,b=p+1,S=p+2;r=Ao(this,a,t,i,c,u,h,w,b,S),r&&(r.faceIndex=Math.floor(p/3),e.push(r))}}}}function jg(n,t,e,i,r,s,a,o){let l;if(t.side===Un?l=i.intersectTriangle(a,s,r,!0,o):l=i.intersectTriangle(r,s,a,t.side===Rr,o),l===null)return null;To.copy(o),To.applyMatrix4(n.matrixWorld);const c=e.ray.origin.distanceTo(To);return c<e.near||c>e.far?null:{distance:c,point:To.clone(),object:n}}function Ao(n,t,e,i,r,s,a,o,l,c){n.getVertexPosition(o,So),n.getVertexPosition(l,Eo),n.getVertexPosition(c,bo);const u=jg(n,t,e,i,So,Eo,bo,jh);if(u){const h=new I;Vn.getBarycoord(jh,So,Eo,bo,h),r&&(u.uv=Vn.getInterpolatedAttribute(r,o,l,c,h,new Wt)),s&&(u.uv1=Vn.getInterpolatedAttribute(s,o,l,c,h,new Wt)),a&&(u.normal=Vn.getInterpolatedAttribute(a,o,l,c,h,new I),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new I,materialIndex:0};Vn.getNormal(So,Eo,bo,f.normal),u.face=f,u.barycoord=h}return u}class Xe extends fn{constructor(t=1,e=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],u=[],h=[];let f=0,m=0;_("z","y","x",-1,-1,i,e,t,a,s,0),_("z","y","x",1,-1,i,e,-t,a,s,1),_("x","z","y",1,1,t,i,e,r,a,2),_("x","z","y",1,-1,t,i,-e,r,a,3),_("x","y","z",1,-1,t,e,i,r,s,4),_("x","y","z",-1,-1,t,e,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new Fe(c,3)),this.setAttribute("normal",new Fe(u,3)),this.setAttribute("uv",new Fe(h,2));function _(v,p,d,w,b,S,D,C,R,P,y){const M=S/R,A=D/P,O=S/2,U=D/2,k=C/2,W=R+1,X=P+1;let j=0,G=0;const V=new I;for(let lt=0;lt<X;lt++){const vt=lt*A-U;for(let Lt=0;Lt<W;Lt++){const Vt=Lt*M-O;V[v]=Vt*w,V[p]=vt*b,V[d]=k,c.push(V.x,V.y,V.z),V[v]=0,V[p]=0,V[d]=C>0?1:-1,u.push(V.x,V.y,V.z),h.push(Lt/R),h.push(1-lt/P),j+=1}}for(let lt=0;lt<P;lt++)for(let vt=0;vt<R;vt++){const Lt=f+vt+W*lt,Vt=f+vt+W*(lt+1),q=f+(vt+1)+W*(lt+1),nt=f+(vt+1)+W*lt;l.push(Lt,Vt,nt),l.push(Vt,q,nt),G+=6}o.addGroup(m,G,y),m+=G,f+=j}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Xe(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function ca(n){const t={};for(const e in n){t[e]={};for(const i in n[e]){const r=n[e][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=r.clone():Array.isArray(r)?t[e][i]=r.slice():t[e][i]=r}}return t}function bn(n){const t={};for(let e=0;e<n.length;e++){const i=ca(n[e]);for(const r in i)t[r]=i[r]}return t}function Zg(n){const t=[];for(let e=0;e<n.length;e++)t.push(n[e].clone());return t}function wp(n){const t=n.getRenderTarget();return t===null?n.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ye.workingColorSpace}const Kg={clone:ca,merge:bn};var Qg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Jg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Cr extends us{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Qg,this.fragmentShader=Jg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=ca(t.uniforms),this.uniformsGroups=Zg(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?e.uniforms[r]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[r]={type:"m4",value:a.toArray()}:e.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}}class Tp extends Ze{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ue,this.projectionMatrix=new Ue,this.projectionMatrixInverse=new Ue,this.coordinateSystem=Qi}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const dr=new I,Zh=new Wt,Kh=new Wt;class Jn extends Tp{constructor(t=50,e=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Iu*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Va*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Iu*2*Math.atan(Math.tan(Va*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){dr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(dr.x,dr.y).multiplyScalar(-t/dr.z),dr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(dr.x,dr.y).multiplyScalar(-t/dr.z)}getViewSize(t,e){return this.getViewBounds(t,Zh,Kh),e.subVectors(Kh,Zh)}setViewOffset(t,e,i,r,s,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Va*.5*this.fov)/this.zoom,i=2*e,r=this.aspect*i,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*r/l,e-=a.offsetY*i/c,r*=a.width/l,i*=a.height/c}const o=this.filmOffset;o!==0&&(s+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,e,e-i,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ts=-90,As=1;class t0 extends Ze{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Jn(Ts,As,t,e);r.layers=this.layers,this.add(r);const s=new Jn(Ts,As,t,e);s.layers=this.layers,this.add(s);const a=new Jn(Ts,As,t,e);a.layers=this.layers,this.add(a);const o=new Jn(Ts,As,t,e);o.layers=this.layers,this.add(o);const l=new Jn(Ts,As,t,e);l.layers=this.layers,this.add(l);const c=new Jn(Ts,As,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[i,r,s,a,o,l]=e;for(const c of e)this.remove(c);if(t===Qi)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===cl)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,c,u]=this.children,h=t.getRenderTarget(),f=t.getActiveCubeFace(),m=t.getActiveMipmapLevel(),_=t.xr.enabled;t.xr.enabled=!1;const v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,t.setRenderTarget(i,0,r),t.render(e,s),t.setRenderTarget(i,1,r),t.render(e,a),t.setRenderTarget(i,2,r),t.render(e,o),t.setRenderTarget(i,3,r),t.render(e,l),t.setRenderTarget(i,4,r),t.render(e,c),i.texture.generateMipmaps=v,t.setRenderTarget(i,5,r),t.render(e,u),t.setRenderTarget(h,f,m),t.xr.enabled=_,i.texture.needsPMREMUpdate=!0}}class Ap extends An{constructor(t,e,i,r,s,a,o,l,c,u){t=t!==void 0?t:[],e=e!==void 0?e:ra,super(t,e,i,r,s,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class e0 extends ls{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const i={width:t,height:t,depth:1},r=[i,i,i,i,i,i];this.texture=new Ap(r,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:Ci}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Xe(5,5,5),s=new Cr({name:"CubemapFromEquirect",uniforms:ca(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Un,blending:Sr});s.uniforms.tEquirect.value=e;const a=new Pt(r,s),o=e.minFilter;return e.minFilter===Kr&&(e.minFilter=Ci),new t0(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,i,r){const s=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,i,r);t.setRenderTarget(s)}}class n0 extends Ze{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new _i,this.environmentIntensity=1,this.environmentRotation=new _i,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class i0{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Lu,this.updateRanges=[],this.version=0,this.uuid=br()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,i){t*=this.stride,i*=e.stride;for(let r=0,s=this.stride;r<s;r++)this.array[t+r]=e.array[i+r];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=br()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(e,this.stride);return i.setUsage(this.usage),i}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=br()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const En=new I;class hl{constructor(t,e,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,i=this.data.count;e<i;e++)En.fromBufferAttribute(this,e),En.applyMatrix4(t),this.setXYZ(e,En.x,En.y,En.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)En.fromBufferAttribute(this,e),En.applyNormalMatrix(t),this.setXYZ(e,En.x,En.y,En.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)En.fromBufferAttribute(this,e),En.transformDirection(t),this.setXYZ(e,En.x,En.y,En.z);return this}getComponent(t,e){let i=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(i=Ai(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=Re(i,this.array)),this.data.array[t*this.data.stride+this.offset+e]=i,this}setX(t,e){return this.normalized&&(e=Re(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=Re(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=Re(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=Re(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Ai(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Ai(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Ai(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Ai(e,this.array)),e}setXY(t,e,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=Re(e,this.array),i=Re(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this}setXYZ(t,e,i,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=Re(e,this.array),i=Re(i,this.array),r=Re(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=r,this}setXYZW(t,e,i,r,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=Re(e,this.array),i=Re(i,this.array),r=Re(r,this.array),s=Re(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=r,this.data.array[t+3]=s,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)e.push(this.data.array[r+s])}return new pi(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new hl(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)e.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Rp extends us{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new fe(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let Rs;const ba=new I,Cs=new I,Ps=new I,Ds=new Wt,wa=new Wt,Cp=new Ue,Ro=new I,Ta=new I,Co=new I,Qh=new Wt,uc=new Wt,Jh=new Wt;class r0 extends Ze{constructor(t=new Rp){if(super(),this.isSprite=!0,this.type="Sprite",Rs===void 0){Rs=new fn;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new i0(e,5);Rs.setIndex([0,1,2,0,2,3]),Rs.setAttribute("position",new hl(i,3,0,!1)),Rs.setAttribute("uv",new hl(i,2,3,!1))}this.geometry=Rs,this.material=t,this.center=new Wt(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Cs.setFromMatrixScale(this.matrixWorld),Cp.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Ps.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Cs.multiplyScalar(-Ps.z);const i=this.material.rotation;let r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));const a=this.center;Po(Ro.set(-.5,-.5,0),Ps,a,Cs,r,s),Po(Ta.set(.5,-.5,0),Ps,a,Cs,r,s),Po(Co.set(.5,.5,0),Ps,a,Cs,r,s),Qh.set(0,0),uc.set(1,0),Jh.set(1,1);let o=t.ray.intersectTriangle(Ro,Ta,Co,!1,ba);if(o===null&&(Po(Ta.set(-.5,.5,0),Ps,a,Cs,r,s),uc.set(0,1),o=t.ray.intersectTriangle(Ro,Co,Ta,!1,ba),o===null))return;const l=t.ray.origin.distanceTo(ba);l<t.near||l>t.far||e.push({distance:l,point:ba.clone(),uv:Vn.getInterpolation(ba,Ro,Ta,Co,Qh,uc,Jh,new Wt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function Po(n,t,e,i,r,s){Ds.subVectors(n,e).addScalar(.5).multiply(i),r!==void 0?(wa.x=s*Ds.x-r*Ds.y,wa.y=r*Ds.x+s*Ds.y):wa.copy(Ds),n.copy(t),n.x+=wa.x,n.y+=wa.y,n.applyMatrix4(Cp)}const hc=new I,s0=new I,a0=new ae;class mr{constructor(t=new I(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,r){return this.normal.set(t,e,i),this.constant=r,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){const r=hc.subVectors(i,e).cross(s0.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(r,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const i=t.delta(hc),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const s=-(t.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:e.copy(t.start).addScaledVector(i,s)}intersectsLine(t){const e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const i=e||a0.getNormalMatrix(t),r=this.coplanarPoint(hc).applyMatrix4(t),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Fr=new wl,Do=new I;class sh{constructor(t=new mr,e=new mr,i=new mr,r=new mr,s=new mr,a=new mr){this.planes=[t,e,i,r,s,a]}set(t,e,i,r,s,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(i),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(t){const e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Qi){const i=this.planes,r=t.elements,s=r[0],a=r[1],o=r[2],l=r[3],c=r[4],u=r[5],h=r[6],f=r[7],m=r[8],_=r[9],v=r[10],p=r[11],d=r[12],w=r[13],b=r[14],S=r[15];if(i[0].setComponents(l-s,f-c,p-m,S-d).normalize(),i[1].setComponents(l+s,f+c,p+m,S+d).normalize(),i[2].setComponents(l+a,f+u,p+_,S+w).normalize(),i[3].setComponents(l-a,f-u,p-_,S-w).normalize(),i[4].setComponents(l-o,f-h,p-v,S-b).normalize(),e===Qi)i[5].setComponents(l+o,f+h,p+v,S+b).normalize();else if(e===cl)i[5].setComponents(o,h,v,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Fr.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Fr.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Fr)}intersectsSprite(t){return Fr.center.set(0,0,0),Fr.radius=.7071067811865476,Fr.applyMatrix4(t.matrixWorld),this.intersectsSphere(Fr)}intersectsSphere(t){const e=this.planes,i=t.center,r=-t.radius;for(let s=0;s<6;s++)if(e[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(t){const e=this.planes;for(let i=0;i<6;i++){const r=e[i];if(Do.x=r.normal.x>0?t.max.x:t.min.x,Do.y=r.normal.y>0?t.max.y:t.min.y,Do.z=r.normal.z>0?t.max.z:t.min.z,r.distanceToPoint(Do)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Rl extends us{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new fe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const dl=new I,fl=new I,td=new Ue,Aa=new Tl,Lo=new wl,dc=new I,ed=new I;class Xi extends Ze{constructor(t=new fn,e=new Rl){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,i=[0];for(let r=1,s=e.count;r<s;r++)dl.fromBufferAttribute(e,r-1),fl.fromBufferAttribute(e,r),i[r]=i[r-1],i[r]+=dl.distanceTo(fl);t.setAttribute("lineDistance",new Fe(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const i=this.geometry,r=this.matrixWorld,s=t.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Lo.copy(i.boundingSphere),Lo.applyMatrix4(r),Lo.radius+=s,t.ray.intersectsSphere(Lo)===!1)return;td.copy(r).invert(),Aa.copy(t.ray).applyMatrix4(td);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=i.index,f=i.attributes.position;if(u!==null){const m=Math.max(0,a.start),_=Math.min(u.count,a.start+a.count);for(let v=m,p=_-1;v<p;v+=c){const d=u.getX(v),w=u.getX(v+1),b=Io(this,t,Aa,l,d,w);b&&e.push(b)}if(this.isLineLoop){const v=u.getX(_-1),p=u.getX(m),d=Io(this,t,Aa,l,v,p);d&&e.push(d)}}else{const m=Math.max(0,a.start),_=Math.min(f.count,a.start+a.count);for(let v=m,p=_-1;v<p;v+=c){const d=Io(this,t,Aa,l,v,v+1);d&&e.push(d)}if(this.isLineLoop){const v=Io(this,t,Aa,l,_-1,m);v&&e.push(v)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){const r=e[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function Io(n,t,e,i,r,s){const a=n.geometry.attributes.position;if(dl.fromBufferAttribute(a,r),fl.fromBufferAttribute(a,s),e.distanceSqToSegment(dl,fl,dc,ed)>i)return;dc.applyMatrix4(n.matrixWorld);const l=t.ray.origin.distanceTo(dc);if(!(l<t.near||l>t.far))return{distance:l,point:ed.clone().applyMatrix4(n.matrixWorld),index:r,face:null,faceIndex:null,barycoord:null,object:n}}const nd=new I,id=new I;class Pp extends Xi{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,i=[];for(let r=0,s=e.count;r<s;r+=2)nd.fromBufferAttribute(e,r),id.fromBufferAttribute(e,r+1),i[r]=r===0?0:i[r-1],i[r+1]=i[r]+nd.distanceTo(id);t.setAttribute("lineDistance",new Fe(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Fs extends Ze{constructor(){super(),this.isGroup=!0,this.type="Group"}}class o0 extends An{constructor(t,e,i,r,s,a,o,l,c){super(t,e,i,r,s,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Dp extends An{constructor(t,e,i,r,s,a,o,l,c,u=Gs){if(u!==Gs&&u!==oa)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&u===Gs&&(i=os),i===void 0&&u===oa&&(i=aa),super(null,r,s,a,o,l,u,i,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:fi,this.minFilter=l!==void 0?l:fi,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}class tn extends fn{constructor(t=1,e=1,i=1,r=32,s=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:r,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const u=[],h=[],f=[],m=[];let _=0;const v=[],p=i/2;let d=0;w(),a===!1&&(t>0&&b(!0),e>0&&b(!1)),this.setIndex(u),this.setAttribute("position",new Fe(h,3)),this.setAttribute("normal",new Fe(f,3)),this.setAttribute("uv",new Fe(m,2));function w(){const S=new I,D=new I;let C=0;const R=(e-t)/i;for(let P=0;P<=s;P++){const y=[],M=P/s,A=M*(e-t)+t;for(let O=0;O<=r;O++){const U=O/r,k=U*l+o,W=Math.sin(k),X=Math.cos(k);D.x=A*W,D.y=-M*i+p,D.z=A*X,h.push(D.x,D.y,D.z),S.set(W,R,X).normalize(),f.push(S.x,S.y,S.z),m.push(U,1-M),y.push(_++)}v.push(y)}for(let P=0;P<r;P++)for(let y=0;y<s;y++){const M=v[y][P],A=v[y+1][P],O=v[y+1][P+1],U=v[y][P+1];(t>0||y!==0)&&(u.push(M,A,U),C+=3),(e>0||y!==s-1)&&(u.push(A,O,U),C+=3)}c.addGroup(d,C,0),d+=C}function b(S){const D=_,C=new Wt,R=new I;let P=0;const y=S===!0?t:e,M=S===!0?1:-1;for(let O=1;O<=r;O++)h.push(0,p*M,0),f.push(0,M,0),m.push(.5,.5),_++;const A=_;for(let O=0;O<=r;O++){const k=O/r*l+o,W=Math.cos(k),X=Math.sin(k);R.x=y*X,R.y=p*M,R.z=y*W,h.push(R.x,R.y,R.z),f.push(0,M,0),C.x=W*.5+.5,C.y=X*.5*M+.5,m.push(C.x,C.y),_++}for(let O=0;O<r;O++){const U=D+O,k=A+O;S===!0?u.push(k,k+1,U):u.push(k+1,k,U),P+=3}c.addGroup(d,P,S===!0?1:2),d+=P}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new tn(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class ah extends fn{constructor(t=[],e=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:r};const s=[],a=[];o(r),c(i),u(),this.setAttribute("position",new Fe(s,3)),this.setAttribute("normal",new Fe(s.slice(),3)),this.setAttribute("uv",new Fe(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(w){const b=new I,S=new I,D=new I;for(let C=0;C<e.length;C+=3)m(e[C+0],b),m(e[C+1],S),m(e[C+2],D),l(b,S,D,w)}function l(w,b,S,D){const C=D+1,R=[];for(let P=0;P<=C;P++){R[P]=[];const y=w.clone().lerp(S,P/C),M=b.clone().lerp(S,P/C),A=C-P;for(let O=0;O<=A;O++)O===0&&P===C?R[P][O]=y:R[P][O]=y.clone().lerp(M,O/A)}for(let P=0;P<C;P++)for(let y=0;y<2*(C-P)-1;y++){const M=Math.floor(y/2);y%2===0?(f(R[P][M+1]),f(R[P+1][M]),f(R[P][M])):(f(R[P][M+1]),f(R[P+1][M+1]),f(R[P+1][M]))}}function c(w){const b=new I;for(let S=0;S<s.length;S+=3)b.x=s[S+0],b.y=s[S+1],b.z=s[S+2],b.normalize().multiplyScalar(w),s[S+0]=b.x,s[S+1]=b.y,s[S+2]=b.z}function u(){const w=new I;for(let b=0;b<s.length;b+=3){w.x=s[b+0],w.y=s[b+1],w.z=s[b+2];const S=p(w)/2/Math.PI+.5,D=d(w)/Math.PI+.5;a.push(S,1-D)}_(),h()}function h(){for(let w=0;w<a.length;w+=6){const b=a[w+0],S=a[w+2],D=a[w+4],C=Math.max(b,S,D),R=Math.min(b,S,D);C>.9&&R<.1&&(b<.2&&(a[w+0]+=1),S<.2&&(a[w+2]+=1),D<.2&&(a[w+4]+=1))}}function f(w){s.push(w.x,w.y,w.z)}function m(w,b){const S=w*3;b.x=t[S+0],b.y=t[S+1],b.z=t[S+2]}function _(){const w=new I,b=new I,S=new I,D=new I,C=new Wt,R=new Wt,P=new Wt;for(let y=0,M=0;y<s.length;y+=9,M+=6){w.set(s[y+0],s[y+1],s[y+2]),b.set(s[y+3],s[y+4],s[y+5]),S.set(s[y+6],s[y+7],s[y+8]),C.set(a[M+0],a[M+1]),R.set(a[M+2],a[M+3]),P.set(a[M+4],a[M+5]),D.copy(w).add(b).add(S).divideScalar(3);const A=p(D);v(C,M+0,w,A),v(R,M+2,b,A),v(P,M+4,S,A)}}function v(w,b,S,D){D<0&&w.x===1&&(a[b]=w.x-1),S.x===0&&S.z===0&&(a[b]=D/2/Math.PI+.5)}function p(w){return Math.atan2(w.z,-w.x)}function d(w){return Math.atan2(-w.y,Math.sqrt(w.x*w.x+w.z*w.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ah(t.vertices,t.indices,t.radius,t.details)}}const Uo=new I,No=new I,fc=new I,Fo=new Vn;class l0 extends fn{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){const r=Math.pow(10,4),s=Math.cos(Va*e),a=t.getIndex(),o=t.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],u=["a","b","c"],h=new Array(3),f={},m=[];for(let _=0;_<l;_+=3){a?(c[0]=a.getX(_),c[1]=a.getX(_+1),c[2]=a.getX(_+2)):(c[0]=_,c[1]=_+1,c[2]=_+2);const{a:v,b:p,c:d}=Fo;if(v.fromBufferAttribute(o,c[0]),p.fromBufferAttribute(o,c[1]),d.fromBufferAttribute(o,c[2]),Fo.getNormal(fc),h[0]=`${Math.round(v.x*r)},${Math.round(v.y*r)},${Math.round(v.z*r)}`,h[1]=`${Math.round(p.x*r)},${Math.round(p.y*r)},${Math.round(p.z*r)}`,h[2]=`${Math.round(d.x*r)},${Math.round(d.y*r)},${Math.round(d.z*r)}`,!(h[0]===h[1]||h[1]===h[2]||h[2]===h[0]))for(let w=0;w<3;w++){const b=(w+1)%3,S=h[w],D=h[b],C=Fo[u[w]],R=Fo[u[b]],P=`${S}_${D}`,y=`${D}_${S}`;y in f&&f[y]?(fc.dot(f[y].normal)<=s&&(m.push(C.x,C.y,C.z),m.push(R.x,R.y,R.z)),f[y]=null):P in f||(f[P]={index0:c[w],index1:c[b],normal:fc.clone()})}}for(const _ in f)if(f[_]){const{index0:v,index1:p}=f[_];Uo.fromBufferAttribute(o,v),No.fromBufferAttribute(o,p),m.push(Uo.x,Uo.y,Uo.z),m.push(No.x,No.y,No.z)}this.setAttribute("position",new Fe(m,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}}class Os extends ah{constructor(t=1,e=0){const i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],r=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,r,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Os(t.radius,t.detail)}}class pa extends fn{constructor(t=1,e=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:r};const s=t/2,a=e/2,o=Math.floor(i),l=Math.floor(r),c=o+1,u=l+1,h=t/o,f=e/l,m=[],_=[],v=[],p=[];for(let d=0;d<u;d++){const w=d*f-a;for(let b=0;b<c;b++){const S=b*h-s;_.push(S,-w,0),v.push(0,0,1),p.push(b/o),p.push(1-d/l)}}for(let d=0;d<l;d++)for(let w=0;w<o;w++){const b=w+c*d,S=w+c*(d+1),D=w+1+c*(d+1),C=w+1+c*d;m.push(b,S,C),m.push(S,D,C)}this.setIndex(m),this.setAttribute("position",new Fe(_,3)),this.setAttribute("normal",new Fe(v,3)),this.setAttribute("uv",new Fe(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new pa(t.width,t.height,t.widthSegments,t.heightSegments)}}class oh extends fn{constructor(t=1,e=32,i=16,r=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:r,phiLength:s,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));const l=Math.min(a+o,Math.PI);let c=0;const u=[],h=new I,f=new I,m=[],_=[],v=[],p=[];for(let d=0;d<=i;d++){const w=[],b=d/i;let S=0;d===0&&a===0?S=.5/e:d===i&&l===Math.PI&&(S=-.5/e);for(let D=0;D<=e;D++){const C=D/e;h.x=-t*Math.cos(r+C*s)*Math.sin(a+b*o),h.y=t*Math.cos(a+b*o),h.z=t*Math.sin(r+C*s)*Math.sin(a+b*o),_.push(h.x,h.y,h.z),f.copy(h).normalize(),v.push(f.x,f.y,f.z),p.push(C+S,1-b),w.push(c++)}u.push(w)}for(let d=0;d<i;d++)for(let w=0;w<e;w++){const b=u[d][w+1],S=u[d][w],D=u[d+1][w],C=u[d+1][w+1];(d!==0||a>0)&&m.push(b,S,C),(d!==i-1||l<Math.PI)&&m.push(S,D,C)}this.setIndex(m),this.setAttribute("position",new Fe(_,3)),this.setAttribute("normal",new Fe(v,3)),this.setAttribute("uv",new Fe(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new oh(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class Xr extends fn{constructor(t=1,e=.4,i=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);const a=[],o=[],l=[],c=[],u=new I,h=new I,f=new I;for(let m=0;m<=i;m++)for(let _=0;_<=r;_++){const v=_/r*s,p=m/i*Math.PI*2;h.x=(t+e*Math.cos(p))*Math.cos(v),h.y=(t+e*Math.cos(p))*Math.sin(v),h.z=e*Math.sin(p),o.push(h.x,h.y,h.z),u.x=t*Math.cos(v),u.y=t*Math.sin(v),f.subVectors(h,u).normalize(),l.push(f.x,f.y,f.z),c.push(_/r),c.push(m/i)}for(let m=1;m<=i;m++)for(let _=1;_<=r;_++){const v=(r+1)*m+_-1,p=(r+1)*(m-1)+_-1,d=(r+1)*(m-1)+_,w=(r+1)*m+_;a.push(v,p,w),a.push(p,d,w)}this.setIndex(a),this.setAttribute("position",new Fe(o,3)),this.setAttribute("normal",new Fe(l,3)),this.setAttribute("uv",new Fe(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Xr(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}}class rd extends us{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new fe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new fe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vp,this.normalScale=new Wt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _i,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class c0 extends us{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=gg,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class u0 extends us{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class Lp extends Ze{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new fe(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}const pc=new Ue,sd=new I,ad=new I;class h0{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Wt(512,512),this.map=null,this.mapPass=null,this.matrix=new Ue,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new sh,this._frameExtents=new Wt(1,1),this._viewportCount=1,this._viewports=[new Ye(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,i=this.matrix;sd.setFromMatrixPosition(t.matrixWorld),e.position.copy(sd),ad.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(ad),e.updateMatrixWorld(),pc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(pc),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(pc)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class Ip extends Tp{constructor(t=-1,e=1,i=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-t,a=i+t,o=r+e,l=r-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}class d0 extends h0{constructor(){super(new Ip(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class od extends Lp{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ze.DEFAULT_UP),this.updateMatrix(),this.target=new Ze,this.shadow=new d0}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class f0 extends Lp{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}}class p0 extends Jn{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}const ld=new Ue;class Up{constructor(t,e,i=0,r=1/0){this.ray=new Tl(t,e),this.near=i,this.far=r,this.camera=null,this.layers=new rh,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return ld.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ld),this}intersectObject(t,e=!0,i=[]){return Uu(t,this,i,e),i.sort(cd),i}intersectObjects(t,e=!0,i=[]){for(let r=0,s=t.length;r<s;r++)Uu(t[r],this,i,e);return i.sort(cd),i}}function cd(n,t){return n.distance-t.distance}function Uu(n,t,e,i){let r=!0;if(n.layers.test(t.layers)&&n.raycast(t,e)===!1&&(r=!1),r===!0&&i===!0){const s=n.children;for(let a=0,o=s.length;a<o;a++)Uu(s[a],t,e,!0)}}class ud{constructor(t=1,e=0,i=0){return this.radius=t,this.phi=e,this.theta=i,this}set(t,e,i){return this.radius=t,this.phi=e,this.theta=i,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=de(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,i){return this.radius=Math.sqrt(t*t+e*e+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,i),this.phi=Math.acos(de(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class m0 extends Pp{constructor(t=10,e=10,i=4473924,r=8947848){i=new fe(i),r=new fe(r);const s=e/2,a=t/e,o=t/2,l=[],c=[];for(let f=0,m=0,_=-o;f<=e;f++,_+=a){l.push(-o,0,_,o,0,_),l.push(_,0,-o,_,0,o);const v=f===s?i:r;v.toArray(c,m),m+=3,v.toArray(c,m),m+=3,v.toArray(c,m),m+=3,v.toArray(c,m),m+=3}const u=new fn;u.setAttribute("position",new Fe(l,3)),u.setAttribute("color",new Fe(c,3));const h=new Rl({vertexColors:!0,toneMapped:!1});super(u,h),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class Np extends cs{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}}function hd(n,t,e,i){const r=_0(i);switch(e){case up:return n*t;case dp:return n*t;case fp:return n*t*2;case pp:return n*t/r.components*r.byteLength;case eh:return n*t/r.components*r.byteLength;case mp:return n*t*2/r.components*r.byteLength;case nh:return n*t*2/r.components*r.byteLength;case hp:return n*t*3/r.components*r.byteLength;case hi:return n*t*4/r.components*r.byteLength;case ih:return n*t*4/r.components*r.byteLength;case qo:case $o:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case jo:case Zo:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case ou:case cu:return Math.max(n,16)*Math.max(t,8)/4;case au:case lu:return Math.max(n,8)*Math.max(t,8)/2;case uu:case hu:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case du:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case fu:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case pu:return Math.floor((n+4)/5)*Math.floor((t+3)/4)*16;case mu:return Math.floor((n+4)/5)*Math.floor((t+4)/5)*16;case _u:return Math.floor((n+5)/6)*Math.floor((t+4)/5)*16;case vu:return Math.floor((n+5)/6)*Math.floor((t+5)/6)*16;case gu:return Math.floor((n+7)/8)*Math.floor((t+4)/5)*16;case xu:return Math.floor((n+7)/8)*Math.floor((t+5)/6)*16;case Mu:return Math.floor((n+7)/8)*Math.floor((t+7)/8)*16;case yu:return Math.floor((n+9)/10)*Math.floor((t+4)/5)*16;case Su:return Math.floor((n+9)/10)*Math.floor((t+5)/6)*16;case Eu:return Math.floor((n+9)/10)*Math.floor((t+7)/8)*16;case bu:return Math.floor((n+9)/10)*Math.floor((t+9)/10)*16;case wu:return Math.floor((n+11)/12)*Math.floor((t+9)/10)*16;case Tu:return Math.floor((n+11)/12)*Math.floor((t+11)/12)*16;case Ko:case Au:case Ru:return Math.ceil(n/4)*Math.ceil(t/4)*16;case _p:case Cu:return Math.ceil(n/4)*Math.ceil(t/4)*8;case Pu:case Du:return Math.ceil(n/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function _0(n){switch(n){case ir:case op:return{byteLength:1,components:1};case qa:case lp:case ao:return{byteLength:2,components:1};case Ju:case th:return{byteLength:2,components:4};case os:case Qu:case Ki:return{byteLength:4,components:1};case cp:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ku}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ku);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Fp(){let n=null,t=!1,e=null,i=null;function r(s,a){e(s,a),i=n.requestAnimationFrame(r)}return{start:function(){t!==!0&&e!==null&&(i=n.requestAnimationFrame(r),t=!0)},stop:function(){n.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(s){e=s},setContext:function(s){n=s}}}function v0(n){const t=new WeakMap;function e(o,l){const c=o.array,u=o.usage,h=c.byteLength,f=n.createBuffer();n.bindBuffer(l,f),n.bufferData(l,c,u),o.onUploadCallback();let m;if(c instanceof Float32Array)m=n.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?m=n.HALF_FLOAT:m=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=n.SHORT;else if(c instanceof Uint32Array)m=n.UNSIGNED_INT;else if(c instanceof Int32Array)m=n.INT;else if(c instanceof Int8Array)m=n.BYTE;else if(c instanceof Uint8Array)m=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:h}}function i(o,l,c){const u=l.array,h=l.updateRanges;if(n.bindBuffer(c,o),h.length===0)n.bufferSubData(c,0,u);else{h.sort((m,_)=>m.start-_.start);let f=0;for(let m=1;m<h.length;m++){const _=h[f],v=h[m];v.start<=_.start+_.count+1?_.count=Math.max(_.count,v.start+v.count-_.start):(++f,h[f]=v)}h.length=f+1;for(let m=0,_=h.length;m<_;m++){const v=h[m];n.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(n.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:r,remove:s,update:a}}var g0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,x0=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,M0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,y0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,S0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,E0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,b0=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,w0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,T0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,A0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,R0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,C0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,P0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,D0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,L0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,I0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,U0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,N0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,F0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,O0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,B0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,z0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,k0=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,H0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,V0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,G0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,W0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,X0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Y0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,q0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,$0="gl_FragColor = linearToOutputTexel( gl_FragColor );",j0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Z0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,K0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Q0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,J0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,tx=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ex=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,nx=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ix=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,rx=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,sx=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,ax=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ox=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lx=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,cx=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,ux=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,hx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,dx=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,fx=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,px=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,mx=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,_x=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,vx=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,gx=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,xx=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Mx=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,yx=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Sx=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ex=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,bx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,wx=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Tx=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Ax=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Rx=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Cx=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Px=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Dx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Lx=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ix=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ux=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Nx=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Fx=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Ox=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Bx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,zx=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,kx=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Hx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Vx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Gx=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Wx=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Xx=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Yx=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,qx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,$x=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,jx=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Zx=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Kx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Qx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Jx=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,tM=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,eM=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,nM=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,iM=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,rM=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,sM=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,aM=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,oM=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,lM=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,cM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,uM=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,hM=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,dM=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,fM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,pM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,mM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,_M=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const vM=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,gM=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,xM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,MM=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,SM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,EM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,bM=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,wM=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,TM=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,AM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,RM=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,CM=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,PM=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,DM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,LM=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,IM=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,UM=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,NM=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,FM=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,OM=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,BM=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,zM=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,kM=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,HM=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,VM=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,GM=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,WM=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,XM=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,YM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,qM=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,$M=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,jM=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ZM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,oe={alphahash_fragment:g0,alphahash_pars_fragment:x0,alphamap_fragment:M0,alphamap_pars_fragment:y0,alphatest_fragment:S0,alphatest_pars_fragment:E0,aomap_fragment:b0,aomap_pars_fragment:w0,batching_pars_vertex:T0,batching_vertex:A0,begin_vertex:R0,beginnormal_vertex:C0,bsdfs:P0,iridescence_fragment:D0,bumpmap_pars_fragment:L0,clipping_planes_fragment:I0,clipping_planes_pars_fragment:U0,clipping_planes_pars_vertex:N0,clipping_planes_vertex:F0,color_fragment:O0,color_pars_fragment:B0,color_pars_vertex:z0,color_vertex:k0,common:H0,cube_uv_reflection_fragment:V0,defaultnormal_vertex:G0,displacementmap_pars_vertex:W0,displacementmap_vertex:X0,emissivemap_fragment:Y0,emissivemap_pars_fragment:q0,colorspace_fragment:$0,colorspace_pars_fragment:j0,envmap_fragment:Z0,envmap_common_pars_fragment:K0,envmap_pars_fragment:Q0,envmap_pars_vertex:J0,envmap_physical_pars_fragment:ux,envmap_vertex:tx,fog_vertex:ex,fog_pars_vertex:nx,fog_fragment:ix,fog_pars_fragment:rx,gradientmap_pars_fragment:sx,lightmap_pars_fragment:ax,lights_lambert_fragment:ox,lights_lambert_pars_fragment:lx,lights_pars_begin:cx,lights_toon_fragment:hx,lights_toon_pars_fragment:dx,lights_phong_fragment:fx,lights_phong_pars_fragment:px,lights_physical_fragment:mx,lights_physical_pars_fragment:_x,lights_fragment_begin:vx,lights_fragment_maps:gx,lights_fragment_end:xx,logdepthbuf_fragment:Mx,logdepthbuf_pars_fragment:yx,logdepthbuf_pars_vertex:Sx,logdepthbuf_vertex:Ex,map_fragment:bx,map_pars_fragment:wx,map_particle_fragment:Tx,map_particle_pars_fragment:Ax,metalnessmap_fragment:Rx,metalnessmap_pars_fragment:Cx,morphinstance_vertex:Px,morphcolor_vertex:Dx,morphnormal_vertex:Lx,morphtarget_pars_vertex:Ix,morphtarget_vertex:Ux,normal_fragment_begin:Nx,normal_fragment_maps:Fx,normal_pars_fragment:Ox,normal_pars_vertex:Bx,normal_vertex:zx,normalmap_pars_fragment:kx,clearcoat_normal_fragment_begin:Hx,clearcoat_normal_fragment_maps:Vx,clearcoat_pars_fragment:Gx,iridescence_pars_fragment:Wx,opaque_fragment:Xx,packing:Yx,premultiplied_alpha_fragment:qx,project_vertex:$x,dithering_fragment:jx,dithering_pars_fragment:Zx,roughnessmap_fragment:Kx,roughnessmap_pars_fragment:Qx,shadowmap_pars_fragment:Jx,shadowmap_pars_vertex:tM,shadowmap_vertex:eM,shadowmask_pars_fragment:nM,skinbase_vertex:iM,skinning_pars_vertex:rM,skinning_vertex:sM,skinnormal_vertex:aM,specularmap_fragment:oM,specularmap_pars_fragment:lM,tonemapping_fragment:cM,tonemapping_pars_fragment:uM,transmission_fragment:hM,transmission_pars_fragment:dM,uv_pars_fragment:fM,uv_pars_vertex:pM,uv_vertex:mM,worldpos_vertex:_M,background_vert:vM,background_frag:gM,backgroundCube_vert:xM,backgroundCube_frag:MM,cube_vert:yM,cube_frag:SM,depth_vert:EM,depth_frag:bM,distanceRGBA_vert:wM,distanceRGBA_frag:TM,equirect_vert:AM,equirect_frag:RM,linedashed_vert:CM,linedashed_frag:PM,meshbasic_vert:DM,meshbasic_frag:LM,meshlambert_vert:IM,meshlambert_frag:UM,meshmatcap_vert:NM,meshmatcap_frag:FM,meshnormal_vert:OM,meshnormal_frag:BM,meshphong_vert:zM,meshphong_frag:kM,meshphysical_vert:HM,meshphysical_frag:VM,meshtoon_vert:GM,meshtoon_frag:WM,points_vert:XM,points_frag:YM,shadow_vert:qM,shadow_frag:$M,sprite_vert:jM,sprite_frag:ZM},At={common:{diffuse:{value:new fe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ae},alphaMap:{value:null},alphaMapTransform:{value:new ae},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ae}},envmap:{envMap:{value:null},envMapRotation:{value:new ae},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ae}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ae}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ae},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ae},normalScale:{value:new Wt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ae},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ae}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ae}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ae}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new fe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new fe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ae},alphaTest:{value:0},uvTransform:{value:new ae}},sprite:{diffuse:{value:new fe(16777215)},opacity:{value:1},center:{value:new Wt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ae},alphaMap:{value:null},alphaMapTransform:{value:new ae},alphaTest:{value:0}}},bi={basic:{uniforms:bn([At.common,At.specularmap,At.envmap,At.aomap,At.lightmap,At.fog]),vertexShader:oe.meshbasic_vert,fragmentShader:oe.meshbasic_frag},lambert:{uniforms:bn([At.common,At.specularmap,At.envmap,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.fog,At.lights,{emissive:{value:new fe(0)}}]),vertexShader:oe.meshlambert_vert,fragmentShader:oe.meshlambert_frag},phong:{uniforms:bn([At.common,At.specularmap,At.envmap,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.fog,At.lights,{emissive:{value:new fe(0)},specular:{value:new fe(1118481)},shininess:{value:30}}]),vertexShader:oe.meshphong_vert,fragmentShader:oe.meshphong_frag},standard:{uniforms:bn([At.common,At.envmap,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.roughnessmap,At.metalnessmap,At.fog,At.lights,{emissive:{value:new fe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:oe.meshphysical_vert,fragmentShader:oe.meshphysical_frag},toon:{uniforms:bn([At.common,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.gradientmap,At.fog,At.lights,{emissive:{value:new fe(0)}}]),vertexShader:oe.meshtoon_vert,fragmentShader:oe.meshtoon_frag},matcap:{uniforms:bn([At.common,At.bumpmap,At.normalmap,At.displacementmap,At.fog,{matcap:{value:null}}]),vertexShader:oe.meshmatcap_vert,fragmentShader:oe.meshmatcap_frag},points:{uniforms:bn([At.points,At.fog]),vertexShader:oe.points_vert,fragmentShader:oe.points_frag},dashed:{uniforms:bn([At.common,At.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:oe.linedashed_vert,fragmentShader:oe.linedashed_frag},depth:{uniforms:bn([At.common,At.displacementmap]),vertexShader:oe.depth_vert,fragmentShader:oe.depth_frag},normal:{uniforms:bn([At.common,At.bumpmap,At.normalmap,At.displacementmap,{opacity:{value:1}}]),vertexShader:oe.meshnormal_vert,fragmentShader:oe.meshnormal_frag},sprite:{uniforms:bn([At.sprite,At.fog]),vertexShader:oe.sprite_vert,fragmentShader:oe.sprite_frag},background:{uniforms:{uvTransform:{value:new ae},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:oe.background_vert,fragmentShader:oe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ae}},vertexShader:oe.backgroundCube_vert,fragmentShader:oe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:oe.cube_vert,fragmentShader:oe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:oe.equirect_vert,fragmentShader:oe.equirect_frag},distanceRGBA:{uniforms:bn([At.common,At.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:oe.distanceRGBA_vert,fragmentShader:oe.distanceRGBA_frag},shadow:{uniforms:bn([At.lights,At.fog,{color:{value:new fe(0)},opacity:{value:1}}]),vertexShader:oe.shadow_vert,fragmentShader:oe.shadow_frag}};bi.physical={uniforms:bn([bi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ae},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ae},clearcoatNormalScale:{value:new Wt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ae},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ae},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ae},sheen:{value:0},sheenColor:{value:new fe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ae},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ae},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ae},transmissionSamplerSize:{value:new Wt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ae},attenuationDistance:{value:0},attenuationColor:{value:new fe(0)},specularColor:{value:new fe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ae},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ae},anisotropyVector:{value:new Wt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ae}}]),vertexShader:oe.meshphysical_vert,fragmentShader:oe.meshphysical_frag};const Oo={r:0,b:0,g:0},Or=new _i,KM=new Ue;function QM(n,t,e,i,r,s,a){const o=new fe(0);let l=s===!0?0:1,c,u,h=null,f=0,m=null;function _(b){let S=b.isScene===!0?b.background:null;return S&&S.isTexture&&(S=(b.backgroundBlurriness>0?e:t).get(S)),S}function v(b){let S=!1;const D=_(b);D===null?d(o,l):D&&D.isColor&&(d(D,1),S=!0);const C=n.xr.getEnvironmentBlendMode();C==="additive"?i.buffers.color.setClear(0,0,0,1,a):C==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(n.autoClear||S)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function p(b,S){const D=_(S);D&&(D.isCubeTexture||D.mapping===bl)?(u===void 0&&(u=new Pt(new Xe(1,1,1),new Cr({name:"BackgroundCubeMaterial",uniforms:ca(bi.backgroundCube.uniforms),vertexShader:bi.backgroundCube.vertexShader,fragmentShader:bi.backgroundCube.fragmentShader,side:Un,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(C,R,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),Or.copy(S.backgroundRotation),Or.x*=-1,Or.y*=-1,Or.z*=-1,D.isCubeTexture&&D.isRenderTargetTexture===!1&&(Or.y*=-1,Or.z*=-1),u.material.uniforms.envMap.value=D,u.material.uniforms.flipEnvMap.value=D.isCubeTexture&&D.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(KM.makeRotationFromEuler(Or)),u.material.toneMapped=ye.getTransfer(D.colorSpace)!==Ae,(h!==D||f!==D.version||m!==n.toneMapping)&&(u.material.needsUpdate=!0,h=D,f=D.version,m=n.toneMapping),u.layers.enableAll(),b.unshift(u,u.geometry,u.material,0,0,null)):D&&D.isTexture&&(c===void 0&&(c=new Pt(new pa(2,2),new Cr({name:"BackgroundMaterial",uniforms:ca(bi.background.uniforms),vertexShader:bi.background.vertexShader,fragmentShader:bi.background.fragmentShader,side:Rr,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=D,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.toneMapped=ye.getTransfer(D.colorSpace)!==Ae,D.matrixAutoUpdate===!0&&D.updateMatrix(),c.material.uniforms.uvTransform.value.copy(D.matrix),(h!==D||f!==D.version||m!==n.toneMapping)&&(c.material.needsUpdate=!0,h=D,f=D.version,m=n.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null))}function d(b,S){b.getRGB(Oo,wp(n)),i.buffers.color.setClear(Oo.r,Oo.g,Oo.b,S,a)}function w(){u!==void 0&&(u.geometry.dispose(),u.material.dispose()),c!==void 0&&(c.geometry.dispose(),c.material.dispose())}return{getClearColor:function(){return o},setClearColor:function(b,S=1){o.set(b),l=S,d(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(b){l=b,d(o,l)},render:v,addToRenderList:p,dispose:w}}function JM(n,t){const e=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=f(null);let s=r,a=!1;function o(M,A,O,U,k){let W=!1;const X=h(U,O,A);s!==X&&(s=X,c(s.object)),W=m(M,U,O,k),W&&_(M,U,O,k),k!==null&&t.update(k,n.ELEMENT_ARRAY_BUFFER),(W||a)&&(a=!1,S(M,A,O,U),k!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(k).buffer))}function l(){return n.createVertexArray()}function c(M){return n.bindVertexArray(M)}function u(M){return n.deleteVertexArray(M)}function h(M,A,O){const U=O.wireframe===!0;let k=i[M.id];k===void 0&&(k={},i[M.id]=k);let W=k[A.id];W===void 0&&(W={},k[A.id]=W);let X=W[U];return X===void 0&&(X=f(l()),W[U]=X),X}function f(M){const A=[],O=[],U=[];for(let k=0;k<e;k++)A[k]=0,O[k]=0,U[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:A,enabledAttributes:O,attributeDivisors:U,object:M,attributes:{},index:null}}function m(M,A,O,U){const k=s.attributes,W=A.attributes;let X=0;const j=O.getAttributes();for(const G in j)if(j[G].location>=0){const lt=k[G];let vt=W[G];if(vt===void 0&&(G==="instanceMatrix"&&M.instanceMatrix&&(vt=M.instanceMatrix),G==="instanceColor"&&M.instanceColor&&(vt=M.instanceColor)),lt===void 0||lt.attribute!==vt||vt&&lt.data!==vt.data)return!0;X++}return s.attributesNum!==X||s.index!==U}function _(M,A,O,U){const k={},W=A.attributes;let X=0;const j=O.getAttributes();for(const G in j)if(j[G].location>=0){let lt=W[G];lt===void 0&&(G==="instanceMatrix"&&M.instanceMatrix&&(lt=M.instanceMatrix),G==="instanceColor"&&M.instanceColor&&(lt=M.instanceColor));const vt={};vt.attribute=lt,lt&&lt.data&&(vt.data=lt.data),k[G]=vt,X++}s.attributes=k,s.attributesNum=X,s.index=U}function v(){const M=s.newAttributes;for(let A=0,O=M.length;A<O;A++)M[A]=0}function p(M){d(M,0)}function d(M,A){const O=s.newAttributes,U=s.enabledAttributes,k=s.attributeDivisors;O[M]=1,U[M]===0&&(n.enableVertexAttribArray(M),U[M]=1),k[M]!==A&&(n.vertexAttribDivisor(M,A),k[M]=A)}function w(){const M=s.newAttributes,A=s.enabledAttributes;for(let O=0,U=A.length;O<U;O++)A[O]!==M[O]&&(n.disableVertexAttribArray(O),A[O]=0)}function b(M,A,O,U,k,W,X){X===!0?n.vertexAttribIPointer(M,A,O,k,W):n.vertexAttribPointer(M,A,O,U,k,W)}function S(M,A,O,U){v();const k=U.attributes,W=O.getAttributes(),X=A.defaultAttributeValues;for(const j in W){const G=W[j];if(G.location>=0){let V=k[j];if(V===void 0&&(j==="instanceMatrix"&&M.instanceMatrix&&(V=M.instanceMatrix),j==="instanceColor"&&M.instanceColor&&(V=M.instanceColor)),V!==void 0){const lt=V.normalized,vt=V.itemSize,Lt=t.get(V);if(Lt===void 0)continue;const Vt=Lt.buffer,q=Lt.type,nt=Lt.bytesPerElement,yt=q===n.INT||q===n.UNSIGNED_INT||V.gpuType===Qu;if(V.isInterleavedBufferAttribute){const ht=V.data,St=ht.stride,It=V.offset;if(ht.isInstancedInterleavedBuffer){for(let Bt=0;Bt<G.locationSize;Bt++)d(G.location+Bt,ht.meshPerAttribute);M.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=ht.meshPerAttribute*ht.count)}else for(let Bt=0;Bt<G.locationSize;Bt++)p(G.location+Bt);n.bindBuffer(n.ARRAY_BUFFER,Vt);for(let Bt=0;Bt<G.locationSize;Bt++)b(G.location+Bt,vt/G.locationSize,q,lt,St*nt,(It+vt/G.locationSize*Bt)*nt,yt)}else{if(V.isInstancedBufferAttribute){for(let ht=0;ht<G.locationSize;ht++)d(G.location+ht,V.meshPerAttribute);M.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=V.meshPerAttribute*V.count)}else for(let ht=0;ht<G.locationSize;ht++)p(G.location+ht);n.bindBuffer(n.ARRAY_BUFFER,Vt);for(let ht=0;ht<G.locationSize;ht++)b(G.location+ht,vt/G.locationSize,q,lt,vt*nt,vt/G.locationSize*ht*nt,yt)}}else if(X!==void 0){const lt=X[j];if(lt!==void 0)switch(lt.length){case 2:n.vertexAttrib2fv(G.location,lt);break;case 3:n.vertexAttrib3fv(G.location,lt);break;case 4:n.vertexAttrib4fv(G.location,lt);break;default:n.vertexAttrib1fv(G.location,lt)}}}}w()}function D(){P();for(const M in i){const A=i[M];for(const O in A){const U=A[O];for(const k in U)u(U[k].object),delete U[k];delete A[O]}delete i[M]}}function C(M){if(i[M.id]===void 0)return;const A=i[M.id];for(const O in A){const U=A[O];for(const k in U)u(U[k].object),delete U[k];delete A[O]}delete i[M.id]}function R(M){for(const A in i){const O=i[A];if(O[M.id]===void 0)continue;const U=O[M.id];for(const k in U)u(U[k].object),delete U[k];delete O[M.id]}}function P(){y(),a=!0,s!==r&&(s=r,c(s.object))}function y(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:P,resetDefaultState:y,dispose:D,releaseStatesOfGeometry:C,releaseStatesOfProgram:R,initAttributes:v,enableAttribute:p,disableUnusedAttributes:w}}function ty(n,t,e){let i;function r(c){i=c}function s(c,u){n.drawArrays(i,c,u),e.update(u,i,1)}function a(c,u,h){h!==0&&(n.drawArraysInstanced(i,c,u,h),e.update(u,i,h))}function o(c,u,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,h);let m=0;for(let _=0;_<h;_++)m+=u[_];e.update(m,i,1)}function l(c,u,h,f){if(h===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let _=0;_<c.length;_++)a(c[_],u[_],f[_]);else{m.multiDrawArraysInstancedWEBGL(i,c,0,u,0,f,0,h);let _=0;for(let v=0;v<h;v++)_+=u[v]*f[v];e.update(_,i,1)}}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function ey(n,t,e,i){let r;function s(){if(r!==void 0)return r;if(t.has("EXT_texture_filter_anisotropic")===!0){const R=t.get("EXT_texture_filter_anisotropic");r=n.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(R){return!(R!==hi&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){const P=R===ao&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==ir&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==Ki&&!P)}function l(R){if(R==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const h=e.logarithmicDepthBuffer===!0,f=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),m=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=n.getParameter(n.MAX_TEXTURE_SIZE),p=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),d=n.getParameter(n.MAX_VERTEX_ATTRIBS),w=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),b=n.getParameter(n.MAX_VARYING_VECTORS),S=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),D=_>0,C=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:f,maxTextures:m,maxVertexTextures:_,maxTextureSize:v,maxCubemapSize:p,maxAttributes:d,maxVertexUniforms:w,maxVaryings:b,maxFragmentUniforms:S,vertexTextures:D,maxSamples:C}}function ny(n){const t=this;let e=null,i=0,r=!1,s=!1;const a=new mr,o=new ae,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){const m=h.length!==0||f||i!==0||r;return r=f,i=h.length,m},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,f){e=u(h,f,0)},this.setState=function(h,f,m){const _=h.clippingPlanes,v=h.clipIntersection,p=h.clipShadows,d=n.get(h);if(!r||_===null||_.length===0||s&&!p)s?u(null):c();else{const w=s?0:i,b=w*4;let S=d.clippingState||null;l.value=S,S=u(_,f,b,m);for(let D=0;D!==b;++D)S[D]=e[D];d.clippingState=S,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=w}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function u(h,f,m,_){const v=h!==null?h.length:0;let p=null;if(v!==0){if(p=l.value,_!==!0||p===null){const d=m+v*4,w=f.matrixWorldInverse;o.getNormalMatrix(w),(p===null||p.length<d)&&(p=new Float32Array(d));for(let b=0,S=m;b!==v;++b,S+=4)a.copy(h[b]).applyMatrix4(w,o),a.normal.toArray(p,S),p[S+3]=a.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,p}}function iy(n){let t=new WeakMap;function e(a,o){return o===nu?a.mapping=ra:o===iu&&(a.mapping=sa),a}function i(a){if(a&&a.isTexture){const o=a.mapping;if(o===nu||o===iu)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new e0(l.height);return c.fromEquirectangularTexture(n,a),t.set(a,c),a.addEventListener("dispose",r),e(c.texture,a.mapping)}else return null}}return a}function r(a){const o=a.target;o.removeEventListener("dispose",r);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function s(){t=new WeakMap}return{get:i,dispose:s}}const Bs=4,dd=[.125,.215,.35,.446,.526,.582],Yr=20,mc=new Ip,fd=new fe;let _c=null,vc=0,gc=0,xc=!1;const Hr=(1+Math.sqrt(5))/2,Ls=1/Hr,pd=[new I(-Hr,Ls,0),new I(Hr,Ls,0),new I(-Ls,0,Hr),new I(Ls,0,Hr),new I(0,Hr,-Ls),new I(0,Hr,Ls),new I(-1,1,-1),new I(1,1,-1),new I(-1,1,1),new I(1,1,1)];class md{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,i=.1,r=100){_c=this._renderer.getRenderTarget(),vc=this._renderer.getActiveCubeFace(),gc=this._renderer.getActiveMipmapLevel(),xc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(t,i,r,s),e>0&&this._blur(s,0,0,e),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=gd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=vd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(_c,vc,gc),this._renderer.xr.enabled=xc,t.scissorTest=!1,Bo(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===ra||t.mapping===sa?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),_c=this._renderer.getRenderTarget(),vc=this._renderer.getActiveCubeFace(),gc=this._renderer.getActiveMipmapLevel(),xc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:Ci,minFilter:Ci,generateMipmaps:!1,type:ao,format:hi,colorSpace:la,depthBuffer:!1},r=_d(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=_d(t,e,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=ry(s)),this._blurMaterial=sy(s,t,e)}return r}_compileMaterial(t){const e=new Pt(this._lodPlanes[0],t);this._renderer.compile(e,mc)}_sceneToCubeUV(t,e,i,r){const o=new Jn(90,1,e,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,f=u.toneMapping;u.getClearColor(fd),u.toneMapping=Er,u.autoClear=!1;const m=new Al({name:"PMREM.Background",side:Un,depthWrite:!1,depthTest:!1}),_=new Pt(new Xe,m);let v=!1;const p=t.background;p?p.isColor&&(m.color.copy(p),t.background=null,v=!0):(m.color.copy(fd),v=!0);for(let d=0;d<6;d++){const w=d%3;w===0?(o.up.set(0,l[d],0),o.lookAt(c[d],0,0)):w===1?(o.up.set(0,0,l[d]),o.lookAt(0,c[d],0)):(o.up.set(0,l[d],0),o.lookAt(0,0,c[d]));const b=this._cubeSize;Bo(r,w*b,d>2?b:0,b,b),u.setRenderTarget(r),v&&u.render(_,o),u.render(t,o)}_.geometry.dispose(),_.material.dispose(),u.toneMapping=f,u.autoClear=h,t.background=p}_textureToCubeUV(t,e){const i=this._renderer,r=t.mapping===ra||t.mapping===sa;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=gd()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=vd());const s=r?this._cubemapMaterial:this._equirectMaterial,a=new Pt(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=t;const l=this._cubeSize;Bo(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(a,mc)}_applyPMREM(t){const e=this._renderer,i=e.autoClear;e.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=pd[(r-s-1)%pd.length];this._blur(t,s-1,s,a,o)}e.autoClear=i}_blur(t,e,i,r,s){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,i,r,"latitudinal",s),this._halfBlur(a,t,i,i,r,"longitudinal",s)}_halfBlur(t,e,i,r,s,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new Pt(this._lodPlanes[r],c),f=c.uniforms,m=this._sizeLods[i]-1,_=isFinite(s)?Math.PI/(2*m):2*Math.PI/(2*Yr-1),v=s/_,p=isFinite(s)?1+Math.floor(u*v):Yr;p>Yr&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Yr}`);const d=[];let w=0;for(let R=0;R<Yr;++R){const P=R/v,y=Math.exp(-P*P/2);d.push(y),R===0?w+=y:R<p&&(w+=2*y)}for(let R=0;R<d.length;R++)d[R]=d[R]/w;f.envMap.value=t.texture,f.samples.value=p,f.weights.value=d,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:b}=this;f.dTheta.value=_,f.mipInt.value=b-i;const S=this._sizeLods[r],D=3*S*(r>b-Bs?r-b+Bs:0),C=4*(this._cubeSize-S);Bo(e,D,C,3*S,2*S),l.setRenderTarget(e),l.render(h,mc)}}function ry(n){const t=[],e=[],i=[];let r=n;const s=n-Bs+1+dd.length;for(let a=0;a<s;a++){const o=Math.pow(2,r);e.push(o);let l=1/o;a>n-Bs?l=dd[a-n+Bs-1]:a===0&&(l=0),i.push(l);const c=1/(o-2),u=-c,h=1+c,f=[u,u,h,u,h,h,u,u,h,h,u,h],m=6,_=6,v=3,p=2,d=1,w=new Float32Array(v*_*m),b=new Float32Array(p*_*m),S=new Float32Array(d*_*m);for(let C=0;C<m;C++){const R=C%3*2/3-1,P=C>2?0:-1,y=[R,P,0,R+2/3,P,0,R+2/3,P+1,0,R,P,0,R+2/3,P+1,0,R,P+1,0];w.set(y,v*_*C),b.set(f,p*_*C);const M=[C,C,C,C,C,C];S.set(M,d*_*C)}const D=new fn;D.setAttribute("position",new pi(w,v)),D.setAttribute("uv",new pi(b,p)),D.setAttribute("faceIndex",new pi(S,d)),t.push(D),r>Bs&&r--}return{lodPlanes:t,sizeLods:e,sigmas:i}}function _d(n,t,e){const i=new ls(n,t,e);return i.texture.mapping=bl,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Bo(n,t,e,i,r){n.viewport.set(t,e,i,r),n.scissor.set(t,e,i,r)}function sy(n,t,e){const i=new Float32Array(Yr),r=new I(0,1,0);return new Cr({name:"SphericalGaussianBlur",defines:{n:Yr,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:lh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Sr,depthTest:!1,depthWrite:!1})}function vd(){return new Cr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:lh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Sr,depthTest:!1,depthWrite:!1})}function gd(){return new Cr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:lh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Sr,depthTest:!1,depthWrite:!1})}function lh(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function ay(n){let t=new WeakMap,e=null;function i(o){if(o&&o.isTexture){const l=o.mapping,c=l===nu||l===iu,u=l===ra||l===sa;if(c||u){let h=t.get(o);const f=h!==void 0?h.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return e===null&&(e=new md(n)),h=c?e.fromEquirectangular(o,h):e.fromCubemap(o,h),h.texture.pmremVersion=o.pmremVersion,t.set(o,h),h.texture;if(h!==void 0)return h.texture;{const m=o.image;return c&&m&&m.height>0||u&&m&&r(m)?(e===null&&(e=new md(n)),h=c?e.fromEquirectangular(o):e.fromCubemap(o),h.texture.pmremVersion=o.pmremVersion,t.set(o,h),o.addEventListener("dispose",s),h.texture):null}}}return o}function r(o){let l=0;const c=6;for(let u=0;u<c;u++)o[u]!==void 0&&l++;return l===c}function s(o){const l=o.target;l.removeEventListener("dispose",s);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:i,dispose:a}}function oy(n){const t={};function e(i){if(t[i]!==void 0)return t[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return t[i]=r,r}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){const r=e(i);return r===null&&Us("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function ly(n,t,e,i){const r={},s=new WeakMap;function a(h){const f=h.target;f.index!==null&&t.remove(f.index);for(const _ in f.attributes)t.remove(f.attributes[_]);f.removeEventListener("dispose",a),delete r[f.id];const m=s.get(f);m&&(t.remove(m),s.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function o(h,f){return r[f.id]===!0||(f.addEventListener("dispose",a),r[f.id]=!0,e.memory.geometries++),f}function l(h){const f=h.attributes;for(const m in f)t.update(f[m],n.ARRAY_BUFFER)}function c(h){const f=[],m=h.index,_=h.attributes.position;let v=0;if(m!==null){const w=m.array;v=m.version;for(let b=0,S=w.length;b<S;b+=3){const D=w[b+0],C=w[b+1],R=w[b+2];f.push(D,C,C,R,R,D)}}else if(_!==void 0){const w=_.array;v=_.version;for(let b=0,S=w.length/3-1;b<S;b+=3){const D=b+0,C=b+1,R=b+2;f.push(D,C,C,R,R,D)}}else return;const p=new(xp(f)?bp:Ep)(f,1);p.version=v;const d=s.get(h);d&&t.remove(d),s.set(h,p)}function u(h){const f=s.get(h);if(f){const m=h.index;m!==null&&f.version<m.version&&c(h)}else c(h);return s.get(h)}return{get:o,update:l,getWireframeAttribute:u}}function cy(n,t,e){let i;function r(f){i=f}let s,a;function o(f){s=f.type,a=f.bytesPerElement}function l(f,m){n.drawElements(i,m,s,f*a),e.update(m,i,1)}function c(f,m,_){_!==0&&(n.drawElementsInstanced(i,m,s,f*a,_),e.update(m,i,_))}function u(f,m,_){if(_===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,m,0,s,f,0,_);let p=0;for(let d=0;d<_;d++)p+=m[d];e.update(p,i,1)}function h(f,m,_,v){if(_===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let d=0;d<f.length;d++)c(f[d]/a,m[d],v[d]);else{p.multiDrawElementsInstancedWEBGL(i,m,0,s,f,0,v,0,_);let d=0;for(let w=0;w<_;w++)d+=m[w]*v[w];e.update(d,i,1)}}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function uy(n){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(e.calls++,a){case n.TRIANGLES:e.triangles+=o*(s/3);break;case n.LINES:e.lines+=o*(s/2);break;case n.LINE_STRIP:e.lines+=o*(s-1);break;case n.LINE_LOOP:e.lines+=o*s;break;case n.POINTS:e.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:r,update:i}}function hy(n,t,e){const i=new WeakMap,r=new Ye;function s(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0;let f=i.get(o);if(f===void 0||f.count!==h){let M=function(){P.dispose(),i.delete(o),o.removeEventListener("dispose",M)};var m=M;f!==void 0&&f.texture.dispose();const _=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,p=o.morphAttributes.color!==void 0,d=o.morphAttributes.position||[],w=o.morphAttributes.normal||[],b=o.morphAttributes.color||[];let S=0;_===!0&&(S=1),v===!0&&(S=2),p===!0&&(S=3);let D=o.attributes.position.count*S,C=1;D>t.maxTextureSize&&(C=Math.ceil(D/t.maxTextureSize),D=t.maxTextureSize);const R=new Float32Array(D*C*4*h),P=new yp(R,D,C,h);P.type=Ki,P.needsUpdate=!0;const y=S*4;for(let A=0;A<h;A++){const O=d[A],U=w[A],k=b[A],W=D*C*4*A;for(let X=0;X<O.count;X++){const j=X*y;_===!0&&(r.fromBufferAttribute(O,X),R[W+j+0]=r.x,R[W+j+1]=r.y,R[W+j+2]=r.z,R[W+j+3]=0),v===!0&&(r.fromBufferAttribute(U,X),R[W+j+4]=r.x,R[W+j+5]=r.y,R[W+j+6]=r.z,R[W+j+7]=0),p===!0&&(r.fromBufferAttribute(k,X),R[W+j+8]=r.x,R[W+j+9]=r.y,R[W+j+10]=r.z,R[W+j+11]=k.itemSize===4?r.w:1)}}f={count:h,texture:P,size:new Wt(D,C)},i.set(o,f),o.addEventListener("dispose",M)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,e);else{let _=0;for(let p=0;p<c.length;p++)_+=c[p];const v=o.morphTargetsRelative?1:1-_;l.getUniforms().setValue(n,"morphTargetBaseInfluence",v),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",f.texture,e),l.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:s}}function dy(n,t,e,i){let r=new WeakMap;function s(l){const c=i.render.frame,u=l.geometry,h=t.get(l,u);if(r.get(h)!==c&&(t.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),r.get(l)!==c&&(e.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;r.get(f)!==c&&(f.update(),r.set(f,c))}return h}function a(){r=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:s,dispose:a}}const Op=new An,xd=new Dp(1,1),Bp=new yp,zp=new zg,kp=new Ap,Md=[],yd=[],Sd=new Float32Array(16),Ed=new Float32Array(9),bd=new Float32Array(4);function ma(n,t,e){const i=n[0];if(i<=0||i>0)return n;const r=t*e;let s=Md[r];if(s===void 0&&(s=new Float32Array(r),Md[r]=s),t!==0){i.toArray(s,0);for(let a=1,o=0;a!==t;++a)o+=e,n[a].toArray(s,o)}return s}function sn(n,t){if(n.length!==t.length)return!1;for(let e=0,i=n.length;e<i;e++)if(n[e]!==t[e])return!1;return!0}function an(n,t){for(let e=0,i=t.length;e<i;e++)n[e]=t[e]}function Cl(n,t){let e=yd[t];e===void 0&&(e=new Int32Array(t),yd[t]=e);for(let i=0;i!==t;++i)e[i]=n.allocateTextureUnit();return e}function fy(n,t){const e=this.cache;e[0]!==t&&(n.uniform1f(this.addr,t),e[0]=t)}function py(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(sn(e,t))return;n.uniform2fv(this.addr,t),an(e,t)}}function my(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(n.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(sn(e,t))return;n.uniform3fv(this.addr,t),an(e,t)}}function _y(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(sn(e,t))return;n.uniform4fv(this.addr,t),an(e,t)}}function vy(n,t){const e=this.cache,i=t.elements;if(i===void 0){if(sn(e,t))return;n.uniformMatrix2fv(this.addr,!1,t),an(e,t)}else{if(sn(e,i))return;bd.set(i),n.uniformMatrix2fv(this.addr,!1,bd),an(e,i)}}function gy(n,t){const e=this.cache,i=t.elements;if(i===void 0){if(sn(e,t))return;n.uniformMatrix3fv(this.addr,!1,t),an(e,t)}else{if(sn(e,i))return;Ed.set(i),n.uniformMatrix3fv(this.addr,!1,Ed),an(e,i)}}function xy(n,t){const e=this.cache,i=t.elements;if(i===void 0){if(sn(e,t))return;n.uniformMatrix4fv(this.addr,!1,t),an(e,t)}else{if(sn(e,i))return;Sd.set(i),n.uniformMatrix4fv(this.addr,!1,Sd),an(e,i)}}function My(n,t){const e=this.cache;e[0]!==t&&(n.uniform1i(this.addr,t),e[0]=t)}function yy(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(sn(e,t))return;n.uniform2iv(this.addr,t),an(e,t)}}function Sy(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(sn(e,t))return;n.uniform3iv(this.addr,t),an(e,t)}}function Ey(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(sn(e,t))return;n.uniform4iv(this.addr,t),an(e,t)}}function by(n,t){const e=this.cache;e[0]!==t&&(n.uniform1ui(this.addr,t),e[0]=t)}function wy(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(sn(e,t))return;n.uniform2uiv(this.addr,t),an(e,t)}}function Ty(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(sn(e,t))return;n.uniform3uiv(this.addr,t),an(e,t)}}function Ay(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(sn(e,t))return;n.uniform4uiv(this.addr,t),an(e,t)}}function Ry(n,t,e){const i=this.cache,r=e.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s;this.type===n.SAMPLER_2D_SHADOW?(xd.compareFunction=gp,s=xd):s=Op,e.setTexture2D(t||s,r)}function Cy(n,t,e){const i=this.cache,r=e.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),e.setTexture3D(t||zp,r)}function Py(n,t,e){const i=this.cache,r=e.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),e.setTextureCube(t||kp,r)}function Dy(n,t,e){const i=this.cache,r=e.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),e.setTexture2DArray(t||Bp,r)}function Ly(n){switch(n){case 5126:return fy;case 35664:return py;case 35665:return my;case 35666:return _y;case 35674:return vy;case 35675:return gy;case 35676:return xy;case 5124:case 35670:return My;case 35667:case 35671:return yy;case 35668:case 35672:return Sy;case 35669:case 35673:return Ey;case 5125:return by;case 36294:return wy;case 36295:return Ty;case 36296:return Ay;case 35678:case 36198:case 36298:case 36306:case 35682:return Ry;case 35679:case 36299:case 36307:return Cy;case 35680:case 36300:case 36308:case 36293:return Py;case 36289:case 36303:case 36311:case 36292:return Dy}}function Iy(n,t){n.uniform1fv(this.addr,t)}function Uy(n,t){const e=ma(t,this.size,2);n.uniform2fv(this.addr,e)}function Ny(n,t){const e=ma(t,this.size,3);n.uniform3fv(this.addr,e)}function Fy(n,t){const e=ma(t,this.size,4);n.uniform4fv(this.addr,e)}function Oy(n,t){const e=ma(t,this.size,4);n.uniformMatrix2fv(this.addr,!1,e)}function By(n,t){const e=ma(t,this.size,9);n.uniformMatrix3fv(this.addr,!1,e)}function zy(n,t){const e=ma(t,this.size,16);n.uniformMatrix4fv(this.addr,!1,e)}function ky(n,t){n.uniform1iv(this.addr,t)}function Hy(n,t){n.uniform2iv(this.addr,t)}function Vy(n,t){n.uniform3iv(this.addr,t)}function Gy(n,t){n.uniform4iv(this.addr,t)}function Wy(n,t){n.uniform1uiv(this.addr,t)}function Xy(n,t){n.uniform2uiv(this.addr,t)}function Yy(n,t){n.uniform3uiv(this.addr,t)}function qy(n,t){n.uniform4uiv(this.addr,t)}function $y(n,t,e){const i=this.cache,r=t.length,s=Cl(e,r);sn(i,s)||(n.uniform1iv(this.addr,s),an(i,s));for(let a=0;a!==r;++a)e.setTexture2D(t[a]||Op,s[a])}function jy(n,t,e){const i=this.cache,r=t.length,s=Cl(e,r);sn(i,s)||(n.uniform1iv(this.addr,s),an(i,s));for(let a=0;a!==r;++a)e.setTexture3D(t[a]||zp,s[a])}function Zy(n,t,e){const i=this.cache,r=t.length,s=Cl(e,r);sn(i,s)||(n.uniform1iv(this.addr,s),an(i,s));for(let a=0;a!==r;++a)e.setTextureCube(t[a]||kp,s[a])}function Ky(n,t,e){const i=this.cache,r=t.length,s=Cl(e,r);sn(i,s)||(n.uniform1iv(this.addr,s),an(i,s));for(let a=0;a!==r;++a)e.setTexture2DArray(t[a]||Bp,s[a])}function Qy(n){switch(n){case 5126:return Iy;case 35664:return Uy;case 35665:return Ny;case 35666:return Fy;case 35674:return Oy;case 35675:return By;case 35676:return zy;case 5124:case 35670:return ky;case 35667:case 35671:return Hy;case 35668:case 35672:return Vy;case 35669:case 35673:return Gy;case 5125:return Wy;case 36294:return Xy;case 36295:return Yy;case 36296:return qy;case 35678:case 36198:case 36298:case 36306:case 35682:return $y;case 35679:case 36299:case 36307:return jy;case 35680:case 36300:case 36308:case 36293:return Zy;case 36289:case 36303:case 36311:case 36292:return Ky}}class Jy{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=Ly(e.type)}}class tS{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Qy(e.type)}}class eS{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(t,e[o.id],i)}}}const Mc=/(\w+)(\])?(\[|\.)?/g;function wd(n,t){n.seq.push(t),n.map[t.id]=t}function nS(n,t,e){const i=n.name,r=i.length;for(Mc.lastIndex=0;;){const s=Mc.exec(i),a=Mc.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===r){wd(e,c===void 0?new Jy(o,n,t):new tS(o,n,t));break}else{let h=e.map[o];h===void 0&&(h=new eS(o),wd(e,h)),e=h}}}class Qo{constructor(t,e){this.seq=[],this.map={};const i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=t.getActiveUniform(e,r),a=t.getUniformLocation(e,s.name);nS(s,a,this)}}setValue(t,e,i,r){const s=this.map[e];s!==void 0&&s.setValue(t,i,r)}setOptional(t,e,i){const r=e[i];r!==void 0&&this.setValue(t,i,r)}static upload(t,e,i,r){for(let s=0,a=e.length;s!==a;++s){const o=e[s],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,r)}}static seqWithValue(t,e){const i=[];for(let r=0,s=t.length;r!==s;++r){const a=t[r];a.id in e&&i.push(a)}return i}}function Td(n,t,e){const i=n.createShader(t);return n.shaderSource(i,e),n.compileShader(i),i}const iS=37297;let rS=0;function sS(n,t){const e=n.split(`
`),i=[],r=Math.max(t-6,0),s=Math.min(t+6,e.length);for(let a=r;a<s;a++){const o=a+1;i.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return i.join(`
`)}const Ad=new ae;function aS(n){ye._getMatrix(Ad,ye.workingColorSpace,n);const t=`mat3( ${Ad.elements.map(e=>e.toFixed(4))} )`;switch(ye.getTransfer(n)){case ll:return[t,"LinearTransferOETF"];case Ae:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[t,"LinearTransferOETF"]}}function Rd(n,t,e){const i=n.getShaderParameter(t,n.COMPILE_STATUS),r=n.getShaderInfoLog(t).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const a=parseInt(s[1]);return e.toUpperCase()+`

`+r+`

`+sS(n.getShaderSource(t),a)}else return r}function oS(n,t){const e=aS(t);return[`vec4 ${n}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function lS(n,t){let e;switch(t){case ug:e="Linear";break;case hg:e="Reinhard";break;case dg:e="Cineon";break;case fg:e="ACESFilmic";break;case mg:e="AgX";break;case _g:e="Neutral";break;case pg:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+n+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const zo=new I;function cS(){ye.getLuminanceCoefficients(zo);const n=zo.x.toFixed(4),t=zo.y.toFixed(4),e=zo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function uS(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Fa).join(`
`)}function hS(n){const t=[];for(const e in n){const i=n[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function dS(n,t){const e={},i=n.getProgramParameter(t,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=n.getActiveAttrib(t,r),a=s.name;let o=1;s.type===n.FLOAT_MAT2&&(o=2),s.type===n.FLOAT_MAT3&&(o=3),s.type===n.FLOAT_MAT4&&(o=4),e[a]={type:s.type,location:n.getAttribLocation(t,a),locationSize:o}}return e}function Fa(n){return n!==""}function Cd(n,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Pd(n,t){return n.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const fS=/^[ \t]*#include +<([\w\d./]+)>/gm;function Nu(n){return n.replace(fS,mS)}const pS=new Map;function mS(n,t){let e=oe[t];if(e===void 0){const i=pS.get(t);if(i!==void 0)e=oe[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("Can not resolve #include <"+t+">")}return Nu(e)}const _S=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Dd(n){return n.replace(_S,vS)}function vS(n,t,e,i){let r="";for(let s=parseInt(t);s<parseInt(e);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Ld(n){let t=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?t+=`
#define HIGH_PRECISION`:n.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function gS(n){let t="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===ip?t="SHADOWMAP_TYPE_PCF":n.shadowMapType===rp?t="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Wi&&(t="SHADOWMAP_TYPE_VSM"),t}function xS(n){let t="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case ra:case sa:t="ENVMAP_TYPE_CUBE";break;case bl:t="ENVMAP_TYPE_CUBE_UV";break}return t}function MS(n){let t="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case sa:t="ENVMAP_MODE_REFRACTION";break}return t}function yS(n){let t="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case sp:t="ENVMAP_BLENDING_MULTIPLY";break;case lg:t="ENVMAP_BLENDING_MIX";break;case cg:t="ENVMAP_BLENDING_ADD";break}return t}function SS(n){const t=n.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function ES(n,t,e,i){const r=n.getContext(),s=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=gS(e),c=xS(e),u=MS(e),h=yS(e),f=SS(e),m=uS(e),_=hS(s),v=r.createProgram();let p,d,w=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(Fa).join(`
`),p.length>0&&(p+=`
`),d=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(Fa).join(`
`),d.length>0&&(d+=`
`)):(p=[Ld(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Fa).join(`
`),d=[Ld(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Er?"#define TONE_MAPPING":"",e.toneMapping!==Er?oe.tonemapping_pars_fragment:"",e.toneMapping!==Er?lS("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",oe.colorspace_pars_fragment,oS("linearToOutputTexel",e.outputColorSpace),cS(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Fa).join(`
`)),a=Nu(a),a=Cd(a,e),a=Pd(a,e),o=Nu(o),o=Cd(o,e),o=Pd(o,e),a=Dd(a),o=Dd(o),e.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,p=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,d=["#define varying in",e.glslVersion===Uh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Uh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const b=w+p+a,S=w+d+o,D=Td(r,r.VERTEX_SHADER,b),C=Td(r,r.FRAGMENT_SHADER,S);r.attachShader(v,D),r.attachShader(v,C),e.index0AttributeName!==void 0?r.bindAttribLocation(v,0,e.index0AttributeName):e.morphTargets===!0&&r.bindAttribLocation(v,0,"position"),r.linkProgram(v);function R(A){if(n.debug.checkShaderErrors){const O=r.getProgramInfoLog(v).trim(),U=r.getShaderInfoLog(D).trim(),k=r.getShaderInfoLog(C).trim();let W=!0,X=!0;if(r.getProgramParameter(v,r.LINK_STATUS)===!1)if(W=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,v,D,C);else{const j=Rd(r,D,"vertex"),G=Rd(r,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(v,r.VALIDATE_STATUS)+`

Material Name: `+A.name+`
Material Type: `+A.type+`

Program Info Log: `+O+`
`+j+`
`+G)}else O!==""?console.warn("THREE.WebGLProgram: Program Info Log:",O):(U===""||k==="")&&(X=!1);X&&(A.diagnostics={runnable:W,programLog:O,vertexShader:{log:U,prefix:p},fragmentShader:{log:k,prefix:d}})}r.deleteShader(D),r.deleteShader(C),P=new Qo(r,v),y=dS(r,v)}let P;this.getUniforms=function(){return P===void 0&&R(this),P};let y;this.getAttributes=function(){return y===void 0&&R(this),y};let M=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=r.getProgramParameter(v,iS)),M},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=rS++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=D,this.fragmentShader=C,this}let bS=0;class wS{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,i=t.fragmentShader,r=this._getShaderStage(e),s=this._getShaderStage(i),a=this._getShaderCacheForMaterial(t);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){const e=this.shaderCache;let i=e.get(t);return i===void 0&&(i=new TS(t),e.set(t,i)),i}}class TS{constructor(t){this.id=bS++,this.code=t,this.usedTimes=0}}function AS(n,t,e,i,r,s,a){const o=new rh,l=new wS,c=new Set,u=[],h=r.logarithmicDepthBuffer,f=r.vertexTextures;let m=r.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(y){return c.add(y),y===0?"uv":`uv${y}`}function p(y,M,A,O,U){const k=O.fog,W=U.geometry,X=y.isMeshStandardMaterial?O.environment:null,j=(y.isMeshStandardMaterial?e:t).get(y.envMap||X),G=j&&j.mapping===bl?j.image.height:null,V=_[y.type];y.precision!==null&&(m=r.getMaxPrecision(y.precision),m!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",m,"instead."));const lt=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,vt=lt!==void 0?lt.length:0;let Lt=0;W.morphAttributes.position!==void 0&&(Lt=1),W.morphAttributes.normal!==void 0&&(Lt=2),W.morphAttributes.color!==void 0&&(Lt=3);let Vt,q,nt,yt;if(V){const re=bi[V];Vt=re.vertexShader,q=re.fragmentShader}else Vt=y.vertexShader,q=y.fragmentShader,l.update(y),nt=l.getVertexShaderID(y),yt=l.getFragmentShaderID(y);const ht=n.getRenderTarget(),St=n.state.buffers.depth.getReversed(),It=U.isInstancedMesh===!0,Bt=U.isBatchedMesh===!0,se=!!y.map,Xt=!!y.matcap,he=!!j,N=!!y.aoMap,Pe=!!y.lightMap,Kt=!!y.bumpMap,Ft=!!y.normalMap,ft=!!y.displacementMap,qt=!!y.emissiveMap,wt=!!y.metalnessMap,T=!!y.roughnessMap,x=y.anisotropy>0,H=y.clearcoat>0,et=y.dispersion>0,it=y.iridescence>0,Y=y.sheen>0,ct=y.transmission>0,ot=x&&!!y.anisotropyMap,_t=H&&!!y.clearcoatMap,Ht=H&&!!y.clearcoatNormalMap,at=H&&!!y.clearcoatRoughnessMap,gt=it&&!!y.iridescenceMap,Ut=it&&!!y.iridescenceThicknessMap,kt=Y&&!!y.sheenColorMap,Rt=Y&&!!y.sheenRoughnessMap,Jt=!!y.specularMap,pt=!!y.specularColorMap,xt=!!y.specularIntensityMap,F=ct&&!!y.transmissionMap,mt=ct&&!!y.thicknessMap,J=!!y.gradientMap,rt=!!y.alphaMap,Et=y.alphaTest>0,bt=!!y.alphaHash,$t=!!y.extensions;let me=Er;y.toneMapped&&(ht===null||ht.isXRRenderTarget===!0)&&(me=n.toneMapping);const ke={shaderID:V,shaderType:y.type,shaderName:y.name,vertexShader:Vt,fragmentShader:q,defines:y.defines,customVertexShaderID:nt,customFragmentShaderID:yt,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:m,batching:Bt,batchingColor:Bt&&U._colorsTexture!==null,instancing:It,instancingColor:It&&U.instanceColor!==null,instancingMorph:It&&U.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:ht===null?n.outputColorSpace:ht.isXRRenderTarget===!0?ht.texture.colorSpace:la,alphaToCoverage:!!y.alphaToCoverage,map:se,matcap:Xt,envMap:he,envMapMode:he&&j.mapping,envMapCubeUVHeight:G,aoMap:N,lightMap:Pe,bumpMap:Kt,normalMap:Ft,displacementMap:f&&ft,emissiveMap:qt,normalMapObjectSpace:Ft&&y.normalMapType===Mg,normalMapTangentSpace:Ft&&y.normalMapType===vp,metalnessMap:wt,roughnessMap:T,anisotropy:x,anisotropyMap:ot,clearcoat:H,clearcoatMap:_t,clearcoatNormalMap:Ht,clearcoatRoughnessMap:at,dispersion:et,iridescence:it,iridescenceMap:gt,iridescenceThicknessMap:Ut,sheen:Y,sheenColorMap:kt,sheenRoughnessMap:Rt,specularMap:Jt,specularColorMap:pt,specularIntensityMap:xt,transmission:ct,transmissionMap:F,thicknessMap:mt,gradientMap:J,opaque:y.transparent===!1&&y.blending===Vs&&y.alphaToCoverage===!1,alphaMap:rt,alphaTest:Et,alphaHash:bt,combine:y.combine,mapUv:se&&v(y.map.channel),aoMapUv:N&&v(y.aoMap.channel),lightMapUv:Pe&&v(y.lightMap.channel),bumpMapUv:Kt&&v(y.bumpMap.channel),normalMapUv:Ft&&v(y.normalMap.channel),displacementMapUv:ft&&v(y.displacementMap.channel),emissiveMapUv:qt&&v(y.emissiveMap.channel),metalnessMapUv:wt&&v(y.metalnessMap.channel),roughnessMapUv:T&&v(y.roughnessMap.channel),anisotropyMapUv:ot&&v(y.anisotropyMap.channel),clearcoatMapUv:_t&&v(y.clearcoatMap.channel),clearcoatNormalMapUv:Ht&&v(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:at&&v(y.clearcoatRoughnessMap.channel),iridescenceMapUv:gt&&v(y.iridescenceMap.channel),iridescenceThicknessMapUv:Ut&&v(y.iridescenceThicknessMap.channel),sheenColorMapUv:kt&&v(y.sheenColorMap.channel),sheenRoughnessMapUv:Rt&&v(y.sheenRoughnessMap.channel),specularMapUv:Jt&&v(y.specularMap.channel),specularColorMapUv:pt&&v(y.specularColorMap.channel),specularIntensityMapUv:xt&&v(y.specularIntensityMap.channel),transmissionMapUv:F&&v(y.transmissionMap.channel),thicknessMapUv:mt&&v(y.thicknessMap.channel),alphaMapUv:rt&&v(y.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(Ft||x),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!W.attributes.uv&&(se||rt),fog:!!k,useFog:y.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:St,skinning:U.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:vt,morphTextureStride:Lt,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:y.dithering,shadowMapEnabled:n.shadowMap.enabled&&A.length>0,shadowMapType:n.shadowMap.type,toneMapping:me,decodeVideoTexture:se&&y.map.isVideoTexture===!0&&ye.getTransfer(y.map.colorSpace)===Ae,decodeVideoTextureEmissive:qt&&y.emissiveMap.isVideoTexture===!0&&ye.getTransfer(y.emissiveMap.colorSpace)===Ae,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Ti,flipSided:y.side===Un,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:$t&&y.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:($t&&y.extensions.multiDraw===!0||Bt)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return ke.vertexUv1s=c.has(1),ke.vertexUv2s=c.has(2),ke.vertexUv3s=c.has(3),c.clear(),ke}function d(y){const M=[];if(y.shaderID?M.push(y.shaderID):(M.push(y.customVertexShaderID),M.push(y.customFragmentShaderID)),y.defines!==void 0)for(const A in y.defines)M.push(A),M.push(y.defines[A]);return y.isRawShaderMaterial===!1&&(w(M,y),b(M,y),M.push(n.outputColorSpace)),M.push(y.customProgramCacheKey),M.join()}function w(y,M){y.push(M.precision),y.push(M.outputColorSpace),y.push(M.envMapMode),y.push(M.envMapCubeUVHeight),y.push(M.mapUv),y.push(M.alphaMapUv),y.push(M.lightMapUv),y.push(M.aoMapUv),y.push(M.bumpMapUv),y.push(M.normalMapUv),y.push(M.displacementMapUv),y.push(M.emissiveMapUv),y.push(M.metalnessMapUv),y.push(M.roughnessMapUv),y.push(M.anisotropyMapUv),y.push(M.clearcoatMapUv),y.push(M.clearcoatNormalMapUv),y.push(M.clearcoatRoughnessMapUv),y.push(M.iridescenceMapUv),y.push(M.iridescenceThicknessMapUv),y.push(M.sheenColorMapUv),y.push(M.sheenRoughnessMapUv),y.push(M.specularMapUv),y.push(M.specularColorMapUv),y.push(M.specularIntensityMapUv),y.push(M.transmissionMapUv),y.push(M.thicknessMapUv),y.push(M.combine),y.push(M.fogExp2),y.push(M.sizeAttenuation),y.push(M.morphTargetsCount),y.push(M.morphAttributeCount),y.push(M.numDirLights),y.push(M.numPointLights),y.push(M.numSpotLights),y.push(M.numSpotLightMaps),y.push(M.numHemiLights),y.push(M.numRectAreaLights),y.push(M.numDirLightShadows),y.push(M.numPointLightShadows),y.push(M.numSpotLightShadows),y.push(M.numSpotLightShadowsWithMaps),y.push(M.numLightProbes),y.push(M.shadowMapType),y.push(M.toneMapping),y.push(M.numClippingPlanes),y.push(M.numClipIntersection),y.push(M.depthPacking)}function b(y,M){o.disableAll(),M.supportsVertexTextures&&o.enable(0),M.instancing&&o.enable(1),M.instancingColor&&o.enable(2),M.instancingMorph&&o.enable(3),M.matcap&&o.enable(4),M.envMap&&o.enable(5),M.normalMapObjectSpace&&o.enable(6),M.normalMapTangentSpace&&o.enable(7),M.clearcoat&&o.enable(8),M.iridescence&&o.enable(9),M.alphaTest&&o.enable(10),M.vertexColors&&o.enable(11),M.vertexAlphas&&o.enable(12),M.vertexUv1s&&o.enable(13),M.vertexUv2s&&o.enable(14),M.vertexUv3s&&o.enable(15),M.vertexTangents&&o.enable(16),M.anisotropy&&o.enable(17),M.alphaHash&&o.enable(18),M.batching&&o.enable(19),M.dispersion&&o.enable(20),M.batchingColor&&o.enable(21),y.push(o.mask),o.disableAll(),M.fog&&o.enable(0),M.useFog&&o.enable(1),M.flatShading&&o.enable(2),M.logarithmicDepthBuffer&&o.enable(3),M.reverseDepthBuffer&&o.enable(4),M.skinning&&o.enable(5),M.morphTargets&&o.enable(6),M.morphNormals&&o.enable(7),M.morphColors&&o.enable(8),M.premultipliedAlpha&&o.enable(9),M.shadowMapEnabled&&o.enable(10),M.doubleSided&&o.enable(11),M.flipSided&&o.enable(12),M.useDepthPacking&&o.enable(13),M.dithering&&o.enable(14),M.transmission&&o.enable(15),M.sheen&&o.enable(16),M.opaque&&o.enable(17),M.pointsUvs&&o.enable(18),M.decodeVideoTexture&&o.enable(19),M.decodeVideoTextureEmissive&&o.enable(20),M.alphaToCoverage&&o.enable(21),y.push(o.mask)}function S(y){const M=_[y.type];let A;if(M){const O=bi[M];A=Kg.clone(O.uniforms)}else A=y.uniforms;return A}function D(y,M){let A;for(let O=0,U=u.length;O<U;O++){const k=u[O];if(k.cacheKey===M){A=k,++A.usedTimes;break}}return A===void 0&&(A=new ES(n,M,y,s),u.push(A)),A}function C(y){if(--y.usedTimes===0){const M=u.indexOf(y);u[M]=u[u.length-1],u.pop(),y.destroy()}}function R(y){l.remove(y)}function P(){l.dispose()}return{getParameters:p,getProgramCacheKey:d,getUniforms:S,acquireProgram:D,releaseProgram:C,releaseShaderCache:R,programs:u,dispose:P}}function RS(){let n=new WeakMap;function t(a){return n.has(a)}function e(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function r(a,o,l){n.get(a)[o]=l}function s(){n=new WeakMap}return{has:t,get:e,remove:i,update:r,dispose:s}}function CS(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.material.id!==t.material.id?n.material.id-t.material.id:n.z!==t.z?n.z-t.z:n.id-t.id}function Id(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.z!==t.z?t.z-n.z:n.id-t.id}function Ud(){const n=[];let t=0;const e=[],i=[],r=[];function s(){t=0,e.length=0,i.length=0,r.length=0}function a(h,f,m,_,v,p){let d=n[t];return d===void 0?(d={id:h.id,object:h,geometry:f,material:m,groupOrder:_,renderOrder:h.renderOrder,z:v,group:p},n[t]=d):(d.id=h.id,d.object=h,d.geometry=f,d.material=m,d.groupOrder=_,d.renderOrder=h.renderOrder,d.z=v,d.group=p),t++,d}function o(h,f,m,_,v,p){const d=a(h,f,m,_,v,p);m.transmission>0?i.push(d):m.transparent===!0?r.push(d):e.push(d)}function l(h,f,m,_,v,p){const d=a(h,f,m,_,v,p);m.transmission>0?i.unshift(d):m.transparent===!0?r.unshift(d):e.unshift(d)}function c(h,f){e.length>1&&e.sort(h||CS),i.length>1&&i.sort(f||Id),r.length>1&&r.sort(f||Id)}function u(){for(let h=t,f=n.length;h<f;h++){const m=n[h];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:e,transmissive:i,transparent:r,init:s,push:o,unshift:l,finish:u,sort:c}}function PS(){let n=new WeakMap;function t(i,r){const s=n.get(i);let a;return s===void 0?(a=new Ud,n.set(i,[a])):r>=s.length?(a=new Ud,s.push(a)):a=s[r],a}function e(){n=new WeakMap}return{get:t,dispose:e}}function DS(){const n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new I,color:new fe};break;case"SpotLight":e={position:new I,direction:new I,color:new fe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new I,color:new fe,distance:0,decay:0};break;case"HemisphereLight":e={direction:new I,skyColor:new fe,groundColor:new fe};break;case"RectAreaLight":e={color:new fe,position:new I,halfWidth:new I,halfHeight:new I};break}return n[t.id]=e,e}}}function LS(){const n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Wt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Wt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Wt,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[t.id]=e,e}}}let IS=0;function US(n,t){return(t.castShadow?2:0)-(n.castShadow?2:0)+(t.map?1:0)-(n.map?1:0)}function NS(n){const t=new DS,e=LS(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new I);const r=new I,s=new Ue,a=new Ue;function o(c){let u=0,h=0,f=0;for(let y=0;y<9;y++)i.probe[y].set(0,0,0);let m=0,_=0,v=0,p=0,d=0,w=0,b=0,S=0,D=0,C=0,R=0;c.sort(US);for(let y=0,M=c.length;y<M;y++){const A=c[y],O=A.color,U=A.intensity,k=A.distance,W=A.shadow&&A.shadow.map?A.shadow.map.texture:null;if(A.isAmbientLight)u+=O.r*U,h+=O.g*U,f+=O.b*U;else if(A.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(A.sh.coefficients[X],U);R++}else if(A.isDirectionalLight){const X=t.get(A);if(X.color.copy(A.color).multiplyScalar(A.intensity),A.castShadow){const j=A.shadow,G=e.get(A);G.shadowIntensity=j.intensity,G.shadowBias=j.bias,G.shadowNormalBias=j.normalBias,G.shadowRadius=j.radius,G.shadowMapSize=j.mapSize,i.directionalShadow[m]=G,i.directionalShadowMap[m]=W,i.directionalShadowMatrix[m]=A.shadow.matrix,w++}i.directional[m]=X,m++}else if(A.isSpotLight){const X=t.get(A);X.position.setFromMatrixPosition(A.matrixWorld),X.color.copy(O).multiplyScalar(U),X.distance=k,X.coneCos=Math.cos(A.angle),X.penumbraCos=Math.cos(A.angle*(1-A.penumbra)),X.decay=A.decay,i.spot[v]=X;const j=A.shadow;if(A.map&&(i.spotLightMap[D]=A.map,D++,j.updateMatrices(A),A.castShadow&&C++),i.spotLightMatrix[v]=j.matrix,A.castShadow){const G=e.get(A);G.shadowIntensity=j.intensity,G.shadowBias=j.bias,G.shadowNormalBias=j.normalBias,G.shadowRadius=j.radius,G.shadowMapSize=j.mapSize,i.spotShadow[v]=G,i.spotShadowMap[v]=W,S++}v++}else if(A.isRectAreaLight){const X=t.get(A);X.color.copy(O).multiplyScalar(U),X.halfWidth.set(A.width*.5,0,0),X.halfHeight.set(0,A.height*.5,0),i.rectArea[p]=X,p++}else if(A.isPointLight){const X=t.get(A);if(X.color.copy(A.color).multiplyScalar(A.intensity),X.distance=A.distance,X.decay=A.decay,A.castShadow){const j=A.shadow,G=e.get(A);G.shadowIntensity=j.intensity,G.shadowBias=j.bias,G.shadowNormalBias=j.normalBias,G.shadowRadius=j.radius,G.shadowMapSize=j.mapSize,G.shadowCameraNear=j.camera.near,G.shadowCameraFar=j.camera.far,i.pointShadow[_]=G,i.pointShadowMap[_]=W,i.pointShadowMatrix[_]=A.shadow.matrix,b++}i.point[_]=X,_++}else if(A.isHemisphereLight){const X=t.get(A);X.skyColor.copy(A.color).multiplyScalar(U),X.groundColor.copy(A.groundColor).multiplyScalar(U),i.hemi[d]=X,d++}}p>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=At.LTC_FLOAT_1,i.rectAreaLTC2=At.LTC_FLOAT_2):(i.rectAreaLTC1=At.LTC_HALF_1,i.rectAreaLTC2=At.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=f;const P=i.hash;(P.directionalLength!==m||P.pointLength!==_||P.spotLength!==v||P.rectAreaLength!==p||P.hemiLength!==d||P.numDirectionalShadows!==w||P.numPointShadows!==b||P.numSpotShadows!==S||P.numSpotMaps!==D||P.numLightProbes!==R)&&(i.directional.length=m,i.spot.length=v,i.rectArea.length=p,i.point.length=_,i.hemi.length=d,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=b,i.pointShadowMap.length=b,i.spotShadow.length=S,i.spotShadowMap.length=S,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=b,i.spotLightMatrix.length=S+D-C,i.spotLightMap.length=D,i.numSpotLightShadowsWithMaps=C,i.numLightProbes=R,P.directionalLength=m,P.pointLength=_,P.spotLength=v,P.rectAreaLength=p,P.hemiLength=d,P.numDirectionalShadows=w,P.numPointShadows=b,P.numSpotShadows=S,P.numSpotMaps=D,P.numLightProbes=R,i.version=IS++)}function l(c,u){let h=0,f=0,m=0,_=0,v=0;const p=u.matrixWorldInverse;for(let d=0,w=c.length;d<w;d++){const b=c[d];if(b.isDirectionalLight){const S=i.directional[h];S.direction.setFromMatrixPosition(b.matrixWorld),r.setFromMatrixPosition(b.target.matrixWorld),S.direction.sub(r),S.direction.transformDirection(p),h++}else if(b.isSpotLight){const S=i.spot[m];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(p),S.direction.setFromMatrixPosition(b.matrixWorld),r.setFromMatrixPosition(b.target.matrixWorld),S.direction.sub(r),S.direction.transformDirection(p),m++}else if(b.isRectAreaLight){const S=i.rectArea[_];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(p),a.identity(),s.copy(b.matrixWorld),s.premultiply(p),a.extractRotation(s),S.halfWidth.set(b.width*.5,0,0),S.halfHeight.set(0,b.height*.5,0),S.halfWidth.applyMatrix4(a),S.halfHeight.applyMatrix4(a),_++}else if(b.isPointLight){const S=i.point[f];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(p),f++}else if(b.isHemisphereLight){const S=i.hemi[v];S.direction.setFromMatrixPosition(b.matrixWorld),S.direction.transformDirection(p),v++}}}return{setup:o,setupView:l,state:i}}function Nd(n){const t=new NS(n),e=[],i=[];function r(u){c.camera=u,e.length=0,i.length=0}function s(u){e.push(u)}function a(u){i.push(u)}function o(){t.setup(e)}function l(u){t.setupView(e,u)}const c={lightsArray:e,shadowsArray:i,camera:null,lights:t,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function FS(n){let t=new WeakMap;function e(r,s=0){const a=t.get(r);let o;return a===void 0?(o=new Nd(n),t.set(r,[o])):s>=a.length?(o=new Nd(n),a.push(o)):o=a[s],o}function i(){t=new WeakMap}return{get:e,dispose:i}}const OS=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,BS=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function zS(n,t,e){let i=new sh;const r=new Wt,s=new Wt,a=new Ye,o=new c0({depthPacking:xg}),l=new u0,c={},u=e.maxTextureSize,h={[Rr]:Un,[Un]:Rr,[Ti]:Ti},f=new Cr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Wt},radius:{value:4}},vertexShader:OS,fragmentShader:BS}),m=f.clone();m.defines.HORIZONTAL_PASS=1;const _=new fn;_.setAttribute("position",new pi(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Pt(_,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ip;let d=this.type;this.render=function(C,R,P){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||C.length===0)return;const y=n.getRenderTarget(),M=n.getActiveCubeFace(),A=n.getActiveMipmapLevel(),O=n.state;O.setBlending(Sr),O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const U=d!==Wi&&this.type===Wi,k=d===Wi&&this.type!==Wi;for(let W=0,X=C.length;W<X;W++){const j=C[W],G=j.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",j,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;r.copy(G.mapSize);const V=G.getFrameExtents();if(r.multiply(V),s.copy(G.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/V.x),r.x=s.x*V.x,G.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/V.y),r.y=s.y*V.y,G.mapSize.y=s.y)),G.map===null||U===!0||k===!0){const vt=this.type!==Wi?{minFilter:fi,magFilter:fi}:{};G.map!==null&&G.map.dispose(),G.map=new ls(r.x,r.y,vt),G.map.texture.name=j.name+".shadowMap",G.camera.updateProjectionMatrix()}n.setRenderTarget(G.map),n.clear();const lt=G.getViewportCount();for(let vt=0;vt<lt;vt++){const Lt=G.getViewport(vt);a.set(s.x*Lt.x,s.y*Lt.y,s.x*Lt.z,s.y*Lt.w),O.viewport(a),G.updateMatrices(j,vt),i=G.getFrustum(),S(R,P,G.camera,j,this.type)}G.isPointLightShadow!==!0&&this.type===Wi&&w(G,P),G.needsUpdate=!1}d=this.type,p.needsUpdate=!1,n.setRenderTarget(y,M,A)};function w(C,R){const P=t.update(v);f.defines.VSM_SAMPLES!==C.blurSamples&&(f.defines.VSM_SAMPLES=C.blurSamples,m.defines.VSM_SAMPLES=C.blurSamples,f.needsUpdate=!0,m.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new ls(r.x,r.y)),f.uniforms.shadow_pass.value=C.map.texture,f.uniforms.resolution.value=C.mapSize,f.uniforms.radius.value=C.radius,n.setRenderTarget(C.mapPass),n.clear(),n.renderBufferDirect(R,null,P,f,v,null),m.uniforms.shadow_pass.value=C.mapPass.texture,m.uniforms.resolution.value=C.mapSize,m.uniforms.radius.value=C.radius,n.setRenderTarget(C.map),n.clear(),n.renderBufferDirect(R,null,P,m,v,null)}function b(C,R,P,y){let M=null;const A=P.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(A!==void 0)M=A;else if(M=P.isPointLight===!0?l:o,n.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0){const O=M.uuid,U=R.uuid;let k=c[O];k===void 0&&(k={},c[O]=k);let W=k[U];W===void 0&&(W=M.clone(),k[U]=W,R.addEventListener("dispose",D)),M=W}if(M.visible=R.visible,M.wireframe=R.wireframe,y===Wi?M.side=R.shadowSide!==null?R.shadowSide:R.side:M.side=R.shadowSide!==null?R.shadowSide:h[R.side],M.alphaMap=R.alphaMap,M.alphaTest=R.alphaTest,M.map=R.map,M.clipShadows=R.clipShadows,M.clippingPlanes=R.clippingPlanes,M.clipIntersection=R.clipIntersection,M.displacementMap=R.displacementMap,M.displacementScale=R.displacementScale,M.displacementBias=R.displacementBias,M.wireframeLinewidth=R.wireframeLinewidth,M.linewidth=R.linewidth,P.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const O=n.properties.get(M);O.light=P}return M}function S(C,R,P,y,M){if(C.visible===!1)return;if(C.layers.test(R.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&M===Wi)&&(!C.frustumCulled||i.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,C.matrixWorld);const U=t.update(C),k=C.material;if(Array.isArray(k)){const W=U.groups;for(let X=0,j=W.length;X<j;X++){const G=W[X],V=k[G.materialIndex];if(V&&V.visible){const lt=b(C,V,y,M);C.onBeforeShadow(n,C,R,P,U,lt,G),n.renderBufferDirect(P,null,U,lt,C,G),C.onAfterShadow(n,C,R,P,U,lt,G)}}}else if(k.visible){const W=b(C,k,y,M);C.onBeforeShadow(n,C,R,P,U,W,null),n.renderBufferDirect(P,null,U,W,C,null),C.onAfterShadow(n,C,R,P,U,W,null)}}const O=C.children;for(let U=0,k=O.length;U<k;U++)S(O[U],R,P,y,M)}function D(C){C.target.removeEventListener("dispose",D);for(const P in c){const y=c[P],M=C.target.uuid;M in y&&(y[M].dispose(),delete y[M])}}}const kS={[jc]:Zc,[Kc]:tu,[Qc]:eu,[ia]:Jc,[Zc]:jc,[tu]:Kc,[eu]:Qc,[Jc]:ia};function HS(n,t){function e(){let F=!1;const mt=new Ye;let J=null;const rt=new Ye(0,0,0,0);return{setMask:function(Et){J!==Et&&!F&&(n.colorMask(Et,Et,Et,Et),J=Et)},setLocked:function(Et){F=Et},setClear:function(Et,bt,$t,me,ke){ke===!0&&(Et*=me,bt*=me,$t*=me),mt.set(Et,bt,$t,me),rt.equals(mt)===!1&&(n.clearColor(Et,bt,$t,me),rt.copy(mt))},reset:function(){F=!1,J=null,rt.set(-1,0,0,0)}}}function i(){let F=!1,mt=!1,J=null,rt=null,Et=null;return{setReversed:function(bt){if(mt!==bt){const $t=t.get("EXT_clip_control");mt?$t.clipControlEXT($t.LOWER_LEFT_EXT,$t.ZERO_TO_ONE_EXT):$t.clipControlEXT($t.LOWER_LEFT_EXT,$t.NEGATIVE_ONE_TO_ONE_EXT);const me=Et;Et=null,this.setClear(me)}mt=bt},getReversed:function(){return mt},setTest:function(bt){bt?ht(n.DEPTH_TEST):St(n.DEPTH_TEST)},setMask:function(bt){J!==bt&&!F&&(n.depthMask(bt),J=bt)},setFunc:function(bt){if(mt&&(bt=kS[bt]),rt!==bt){switch(bt){case jc:n.depthFunc(n.NEVER);break;case Zc:n.depthFunc(n.ALWAYS);break;case Kc:n.depthFunc(n.LESS);break;case ia:n.depthFunc(n.LEQUAL);break;case Qc:n.depthFunc(n.EQUAL);break;case Jc:n.depthFunc(n.GEQUAL);break;case tu:n.depthFunc(n.GREATER);break;case eu:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}rt=bt}},setLocked:function(bt){F=bt},setClear:function(bt){Et!==bt&&(mt&&(bt=1-bt),n.clearDepth(bt),Et=bt)},reset:function(){F=!1,J=null,rt=null,Et=null,mt=!1}}}function r(){let F=!1,mt=null,J=null,rt=null,Et=null,bt=null,$t=null,me=null,ke=null;return{setTest:function(re){F||(re?ht(n.STENCIL_TEST):St(n.STENCIL_TEST))},setMask:function(re){mt!==re&&!F&&(n.stencilMask(re),mt=re)},setFunc:function(re,qe,pn){(J!==re||rt!==qe||Et!==pn)&&(n.stencilFunc(re,qe,pn),J=re,rt=qe,Et=pn)},setOp:function(re,qe,pn){(bt!==re||$t!==qe||me!==pn)&&(n.stencilOp(re,qe,pn),bt=re,$t=qe,me=pn)},setLocked:function(re){F=re},setClear:function(re){ke!==re&&(n.clearStencil(re),ke=re)},reset:function(){F=!1,mt=null,J=null,rt=null,Et=null,bt=null,$t=null,me=null,ke=null}}}const s=new e,a=new i,o=new r,l=new WeakMap,c=new WeakMap;let u={},h={},f=new WeakMap,m=[],_=null,v=!1,p=null,d=null,w=null,b=null,S=null,D=null,C=null,R=new fe(0,0,0),P=0,y=!1,M=null,A=null,O=null,U=null,k=null;const W=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,j=0;const G=n.getParameter(n.VERSION);G.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec(G)[1]),X=j>=1):G.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),X=j>=2);let V=null,lt={};const vt=n.getParameter(n.SCISSOR_BOX),Lt=n.getParameter(n.VIEWPORT),Vt=new Ye().fromArray(vt),q=new Ye().fromArray(Lt);function nt(F,mt,J,rt){const Et=new Uint8Array(4),bt=n.createTexture();n.bindTexture(F,bt),n.texParameteri(F,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(F,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let $t=0;$t<J;$t++)F===n.TEXTURE_3D||F===n.TEXTURE_2D_ARRAY?n.texImage3D(mt,0,n.RGBA,1,1,rt,0,n.RGBA,n.UNSIGNED_BYTE,Et):n.texImage2D(mt+$t,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Et);return bt}const yt={};yt[n.TEXTURE_2D]=nt(n.TEXTURE_2D,n.TEXTURE_2D,1),yt[n.TEXTURE_CUBE_MAP]=nt(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),yt[n.TEXTURE_2D_ARRAY]=nt(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),yt[n.TEXTURE_3D]=nt(n.TEXTURE_3D,n.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ht(n.DEPTH_TEST),a.setFunc(ia),Kt(!1),Ft(Ch),ht(n.CULL_FACE),N(Sr);function ht(F){u[F]!==!0&&(n.enable(F),u[F]=!0)}function St(F){u[F]!==!1&&(n.disable(F),u[F]=!1)}function It(F,mt){return h[F]!==mt?(n.bindFramebuffer(F,mt),h[F]=mt,F===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=mt),F===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=mt),!0):!1}function Bt(F,mt){let J=m,rt=!1;if(F){J=f.get(mt),J===void 0&&(J=[],f.set(mt,J));const Et=F.textures;if(J.length!==Et.length||J[0]!==n.COLOR_ATTACHMENT0){for(let bt=0,$t=Et.length;bt<$t;bt++)J[bt]=n.COLOR_ATTACHMENT0+bt;J.length=Et.length,rt=!0}}else J[0]!==n.BACK&&(J[0]=n.BACK,rt=!0);rt&&n.drawBuffers(J)}function se(F){return _!==F?(n.useProgram(F),_=F,!0):!1}const Xt={[Wr]:n.FUNC_ADD,[Xv]:n.FUNC_SUBTRACT,[Yv]:n.FUNC_REVERSE_SUBTRACT};Xt[qv]=n.MIN,Xt[$v]=n.MAX;const he={[jv]:n.ZERO,[Zv]:n.ONE,[Kv]:n.SRC_COLOR,[qc]:n.SRC_ALPHA,[ig]:n.SRC_ALPHA_SATURATE,[eg]:n.DST_COLOR,[Jv]:n.DST_ALPHA,[Qv]:n.ONE_MINUS_SRC_COLOR,[$c]:n.ONE_MINUS_SRC_ALPHA,[ng]:n.ONE_MINUS_DST_COLOR,[tg]:n.ONE_MINUS_DST_ALPHA,[rg]:n.CONSTANT_COLOR,[sg]:n.ONE_MINUS_CONSTANT_COLOR,[ag]:n.CONSTANT_ALPHA,[og]:n.ONE_MINUS_CONSTANT_ALPHA};function N(F,mt,J,rt,Et,bt,$t,me,ke,re){if(F===Sr){v===!0&&(St(n.BLEND),v=!1);return}if(v===!1&&(ht(n.BLEND),v=!0),F!==Wv){if(F!==p||re!==y){if((d!==Wr||S!==Wr)&&(n.blendEquation(n.FUNC_ADD),d=Wr,S=Wr),re)switch(F){case Vs:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ph:n.blendFunc(n.ONE,n.ONE);break;case Dh:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Lh:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}else switch(F){case Vs:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ph:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Dh:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Lh:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}w=null,b=null,D=null,C=null,R.set(0,0,0),P=0,p=F,y=re}return}Et=Et||mt,bt=bt||J,$t=$t||rt,(mt!==d||Et!==S)&&(n.blendEquationSeparate(Xt[mt],Xt[Et]),d=mt,S=Et),(J!==w||rt!==b||bt!==D||$t!==C)&&(n.blendFuncSeparate(he[J],he[rt],he[bt],he[$t]),w=J,b=rt,D=bt,C=$t),(me.equals(R)===!1||ke!==P)&&(n.blendColor(me.r,me.g,me.b,ke),R.copy(me),P=ke),p=F,y=!1}function Pe(F,mt){F.side===Ti?St(n.CULL_FACE):ht(n.CULL_FACE);let J=F.side===Un;mt&&(J=!J),Kt(J),F.blending===Vs&&F.transparent===!1?N(Sr):N(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),a.setFunc(F.depthFunc),a.setTest(F.depthTest),a.setMask(F.depthWrite),s.setMask(F.colorWrite);const rt=F.stencilWrite;o.setTest(rt),rt&&(o.setMask(F.stencilWriteMask),o.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),o.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),qt(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?ht(n.SAMPLE_ALPHA_TO_COVERAGE):St(n.SAMPLE_ALPHA_TO_COVERAGE)}function Kt(F){M!==F&&(F?n.frontFace(n.CW):n.frontFace(n.CCW),M=F)}function Ft(F){F!==Vv?(ht(n.CULL_FACE),F!==A&&(F===Ch?n.cullFace(n.BACK):F===Gv?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):St(n.CULL_FACE),A=F}function ft(F){F!==O&&(X&&n.lineWidth(F),O=F)}function qt(F,mt,J){F?(ht(n.POLYGON_OFFSET_FILL),(U!==mt||k!==J)&&(n.polygonOffset(mt,J),U=mt,k=J)):St(n.POLYGON_OFFSET_FILL)}function wt(F){F?ht(n.SCISSOR_TEST):St(n.SCISSOR_TEST)}function T(F){F===void 0&&(F=n.TEXTURE0+W-1),V!==F&&(n.activeTexture(F),V=F)}function x(F,mt,J){J===void 0&&(V===null?J=n.TEXTURE0+W-1:J=V);let rt=lt[J];rt===void 0&&(rt={type:void 0,texture:void 0},lt[J]=rt),(rt.type!==F||rt.texture!==mt)&&(V!==J&&(n.activeTexture(J),V=J),n.bindTexture(F,mt||yt[F]),rt.type=F,rt.texture=mt)}function H(){const F=lt[V];F!==void 0&&F.type!==void 0&&(n.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function et(){try{n.compressedTexImage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function it(){try{n.compressedTexImage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Y(){try{n.texSubImage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function ct(){try{n.texSubImage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function ot(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function _t(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Ht(){try{n.texStorage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function at(){try{n.texStorage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function gt(){try{n.texImage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Ut(){try{n.texImage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function kt(F){Vt.equals(F)===!1&&(n.scissor(F.x,F.y,F.z,F.w),Vt.copy(F))}function Rt(F){q.equals(F)===!1&&(n.viewport(F.x,F.y,F.z,F.w),q.copy(F))}function Jt(F,mt){let J=c.get(mt);J===void 0&&(J=new WeakMap,c.set(mt,J));let rt=J.get(F);rt===void 0&&(rt=n.getUniformBlockIndex(mt,F.name),J.set(F,rt))}function pt(F,mt){const rt=c.get(mt).get(F);l.get(mt)!==rt&&(n.uniformBlockBinding(mt,rt,F.__bindingPointIndex),l.set(mt,rt))}function xt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),u={},V=null,lt={},h={},f=new WeakMap,m=[],_=null,v=!1,p=null,d=null,w=null,b=null,S=null,D=null,C=null,R=new fe(0,0,0),P=0,y=!1,M=null,A=null,O=null,U=null,k=null,Vt.set(0,0,n.canvas.width,n.canvas.height),q.set(0,0,n.canvas.width,n.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:ht,disable:St,bindFramebuffer:It,drawBuffers:Bt,useProgram:se,setBlending:N,setMaterial:Pe,setFlipSided:Kt,setCullFace:Ft,setLineWidth:ft,setPolygonOffset:qt,setScissorTest:wt,activeTexture:T,bindTexture:x,unbindTexture:H,compressedTexImage2D:et,compressedTexImage3D:it,texImage2D:gt,texImage3D:Ut,updateUBOMapping:Jt,uniformBlockBinding:pt,texStorage2D:Ht,texStorage3D:at,texSubImage2D:Y,texSubImage3D:ct,compressedTexSubImage2D:ot,compressedTexSubImage3D:_t,scissor:kt,viewport:Rt,reset:xt}}function VS(n,t,e,i,r,s,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Wt,u=new WeakMap;let h;const f=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(T,x){return m?new OffscreenCanvas(T,x):ul("canvas")}function v(T,x,H){let et=1;const it=wt(T);if((it.width>H||it.height>H)&&(et=H/Math.max(it.width,it.height)),et<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const Y=Math.floor(et*it.width),ct=Math.floor(et*it.height);h===void 0&&(h=_(Y,ct));const ot=x?_(Y,ct):h;return ot.width=Y,ot.height=ct,ot.getContext("2d").drawImage(T,0,0,Y,ct),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+it.width+"x"+it.height+") to ("+Y+"x"+ct+")."),ot}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+it.width+"x"+it.height+")."),T;return T}function p(T){return T.generateMipmaps}function d(T){n.generateMipmap(T)}function w(T){return T.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?n.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function b(T,x,H,et,it=!1){if(T!==null){if(n[T]!==void 0)return n[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let Y=x;if(x===n.RED&&(H===n.FLOAT&&(Y=n.R32F),H===n.HALF_FLOAT&&(Y=n.R16F),H===n.UNSIGNED_BYTE&&(Y=n.R8)),x===n.RED_INTEGER&&(H===n.UNSIGNED_BYTE&&(Y=n.R8UI),H===n.UNSIGNED_SHORT&&(Y=n.R16UI),H===n.UNSIGNED_INT&&(Y=n.R32UI),H===n.BYTE&&(Y=n.R8I),H===n.SHORT&&(Y=n.R16I),H===n.INT&&(Y=n.R32I)),x===n.RG&&(H===n.FLOAT&&(Y=n.RG32F),H===n.HALF_FLOAT&&(Y=n.RG16F),H===n.UNSIGNED_BYTE&&(Y=n.RG8)),x===n.RG_INTEGER&&(H===n.UNSIGNED_BYTE&&(Y=n.RG8UI),H===n.UNSIGNED_SHORT&&(Y=n.RG16UI),H===n.UNSIGNED_INT&&(Y=n.RG32UI),H===n.BYTE&&(Y=n.RG8I),H===n.SHORT&&(Y=n.RG16I),H===n.INT&&(Y=n.RG32I)),x===n.RGB_INTEGER&&(H===n.UNSIGNED_BYTE&&(Y=n.RGB8UI),H===n.UNSIGNED_SHORT&&(Y=n.RGB16UI),H===n.UNSIGNED_INT&&(Y=n.RGB32UI),H===n.BYTE&&(Y=n.RGB8I),H===n.SHORT&&(Y=n.RGB16I),H===n.INT&&(Y=n.RGB32I)),x===n.RGBA_INTEGER&&(H===n.UNSIGNED_BYTE&&(Y=n.RGBA8UI),H===n.UNSIGNED_SHORT&&(Y=n.RGBA16UI),H===n.UNSIGNED_INT&&(Y=n.RGBA32UI),H===n.BYTE&&(Y=n.RGBA8I),H===n.SHORT&&(Y=n.RGBA16I),H===n.INT&&(Y=n.RGBA32I)),x===n.RGB&&H===n.UNSIGNED_INT_5_9_9_9_REV&&(Y=n.RGB9_E5),x===n.RGBA){const ct=it?ll:ye.getTransfer(et);H===n.FLOAT&&(Y=n.RGBA32F),H===n.HALF_FLOAT&&(Y=n.RGBA16F),H===n.UNSIGNED_BYTE&&(Y=ct===Ae?n.SRGB8_ALPHA8:n.RGBA8),H===n.UNSIGNED_SHORT_4_4_4_4&&(Y=n.RGBA4),H===n.UNSIGNED_SHORT_5_5_5_1&&(Y=n.RGB5_A1)}return(Y===n.R16F||Y===n.R32F||Y===n.RG16F||Y===n.RG32F||Y===n.RGBA16F||Y===n.RGBA32F)&&t.get("EXT_color_buffer_float"),Y}function S(T,x){let H;return T?x===null||x===os||x===aa?H=n.DEPTH24_STENCIL8:x===Ki?H=n.DEPTH32F_STENCIL8:x===qa&&(H=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===os||x===aa?H=n.DEPTH_COMPONENT24:x===Ki?H=n.DEPTH_COMPONENT32F:x===qa&&(H=n.DEPTH_COMPONENT16),H}function D(T,x){return p(T)===!0||T.isFramebufferTexture&&T.minFilter!==fi&&T.minFilter!==Ci?Math.log2(Math.max(x.width,x.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?x.mipmaps.length:1}function C(T){const x=T.target;x.removeEventListener("dispose",C),P(x),x.isVideoTexture&&u.delete(x)}function R(T){const x=T.target;x.removeEventListener("dispose",R),M(x)}function P(T){const x=i.get(T);if(x.__webglInit===void 0)return;const H=T.source,et=f.get(H);if(et){const it=et[x.__cacheKey];it.usedTimes--,it.usedTimes===0&&y(T),Object.keys(et).length===0&&f.delete(H)}i.remove(T)}function y(T){const x=i.get(T);n.deleteTexture(x.__webglTexture);const H=T.source,et=f.get(H);delete et[x.__cacheKey],a.memory.textures--}function M(T){const x=i.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),i.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let et=0;et<6;et++){if(Array.isArray(x.__webglFramebuffer[et]))for(let it=0;it<x.__webglFramebuffer[et].length;it++)n.deleteFramebuffer(x.__webglFramebuffer[et][it]);else n.deleteFramebuffer(x.__webglFramebuffer[et]);x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer[et])}else{if(Array.isArray(x.__webglFramebuffer))for(let et=0;et<x.__webglFramebuffer.length;et++)n.deleteFramebuffer(x.__webglFramebuffer[et]);else n.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&n.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let et=0;et<x.__webglColorRenderbuffer.length;et++)x.__webglColorRenderbuffer[et]&&n.deleteRenderbuffer(x.__webglColorRenderbuffer[et]);x.__webglDepthRenderbuffer&&n.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const H=T.textures;for(let et=0,it=H.length;et<it;et++){const Y=i.get(H[et]);Y.__webglTexture&&(n.deleteTexture(Y.__webglTexture),a.memory.textures--),i.remove(H[et])}i.remove(T)}let A=0;function O(){A=0}function U(){const T=A;return T>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+r.maxTextures),A+=1,T}function k(T){const x=[];return x.push(T.wrapS),x.push(T.wrapT),x.push(T.wrapR||0),x.push(T.magFilter),x.push(T.minFilter),x.push(T.anisotropy),x.push(T.internalFormat),x.push(T.format),x.push(T.type),x.push(T.generateMipmaps),x.push(T.premultiplyAlpha),x.push(T.flipY),x.push(T.unpackAlignment),x.push(T.colorSpace),x.join()}function W(T,x){const H=i.get(T);if(T.isVideoTexture&&ft(T),T.isRenderTargetTexture===!1&&T.version>0&&H.__version!==T.version){const et=T.image;if(et===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(et.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{q(H,T,x);return}}e.bindTexture(n.TEXTURE_2D,H.__webglTexture,n.TEXTURE0+x)}function X(T,x){const H=i.get(T);if(T.version>0&&H.__version!==T.version){q(H,T,x);return}e.bindTexture(n.TEXTURE_2D_ARRAY,H.__webglTexture,n.TEXTURE0+x)}function j(T,x){const H=i.get(T);if(T.version>0&&H.__version!==T.version){q(H,T,x);return}e.bindTexture(n.TEXTURE_3D,H.__webglTexture,n.TEXTURE0+x)}function G(T,x){const H=i.get(T);if(T.version>0&&H.__version!==T.version){nt(H,T,x);return}e.bindTexture(n.TEXTURE_CUBE_MAP,H.__webglTexture,n.TEXTURE0+x)}const V={[ru]:n.REPEAT,[Zr]:n.CLAMP_TO_EDGE,[su]:n.MIRRORED_REPEAT},lt={[fi]:n.NEAREST,[vg]:n.NEAREST_MIPMAP_NEAREST,[uo]:n.NEAREST_MIPMAP_LINEAR,[Ci]:n.LINEAR,[Gl]:n.LINEAR_MIPMAP_NEAREST,[Kr]:n.LINEAR_MIPMAP_LINEAR},vt={[yg]:n.NEVER,[Ag]:n.ALWAYS,[Sg]:n.LESS,[gp]:n.LEQUAL,[Eg]:n.EQUAL,[Tg]:n.GEQUAL,[bg]:n.GREATER,[wg]:n.NOTEQUAL};function Lt(T,x){if(x.type===Ki&&t.has("OES_texture_float_linear")===!1&&(x.magFilter===Ci||x.magFilter===Gl||x.magFilter===uo||x.magFilter===Kr||x.minFilter===Ci||x.minFilter===Gl||x.minFilter===uo||x.minFilter===Kr)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(T,n.TEXTURE_WRAP_S,V[x.wrapS]),n.texParameteri(T,n.TEXTURE_WRAP_T,V[x.wrapT]),(T===n.TEXTURE_3D||T===n.TEXTURE_2D_ARRAY)&&n.texParameteri(T,n.TEXTURE_WRAP_R,V[x.wrapR]),n.texParameteri(T,n.TEXTURE_MAG_FILTER,lt[x.magFilter]),n.texParameteri(T,n.TEXTURE_MIN_FILTER,lt[x.minFilter]),x.compareFunction&&(n.texParameteri(T,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(T,n.TEXTURE_COMPARE_FUNC,vt[x.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===fi||x.minFilter!==uo&&x.minFilter!==Kr||x.type===Ki&&t.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||i.get(x).__currentAnisotropy){const H=t.get("EXT_texture_filter_anisotropic");n.texParameterf(T,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,r.getMaxAnisotropy())),i.get(x).__currentAnisotropy=x.anisotropy}}}function Vt(T,x){let H=!1;T.__webglInit===void 0&&(T.__webglInit=!0,x.addEventListener("dispose",C));const et=x.source;let it=f.get(et);it===void 0&&(it={},f.set(et,it));const Y=k(x);if(Y!==T.__cacheKey){it[Y]===void 0&&(it[Y]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,H=!0),it[Y].usedTimes++;const ct=it[T.__cacheKey];ct!==void 0&&(it[T.__cacheKey].usedTimes--,ct.usedTimes===0&&y(x)),T.__cacheKey=Y,T.__webglTexture=it[Y].texture}return H}function q(T,x,H){let et=n.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(et=n.TEXTURE_2D_ARRAY),x.isData3DTexture&&(et=n.TEXTURE_3D);const it=Vt(T,x),Y=x.source;e.bindTexture(et,T.__webglTexture,n.TEXTURE0+H);const ct=i.get(Y);if(Y.version!==ct.__version||it===!0){e.activeTexture(n.TEXTURE0+H);const ot=ye.getPrimaries(ye.workingColorSpace),_t=x.colorSpace===_r?null:ye.getPrimaries(x.colorSpace),Ht=x.colorSpace===_r||ot===_t?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ht);let at=v(x.image,!1,r.maxTextureSize);at=qt(x,at);const gt=s.convert(x.format,x.colorSpace),Ut=s.convert(x.type);let kt=b(x.internalFormat,gt,Ut,x.colorSpace,x.isVideoTexture);Lt(et,x);let Rt;const Jt=x.mipmaps,pt=x.isVideoTexture!==!0,xt=ct.__version===void 0||it===!0,F=Y.dataReady,mt=D(x,at);if(x.isDepthTexture)kt=S(x.format===oa,x.type),xt&&(pt?e.texStorage2D(n.TEXTURE_2D,1,kt,at.width,at.height):e.texImage2D(n.TEXTURE_2D,0,kt,at.width,at.height,0,gt,Ut,null));else if(x.isDataTexture)if(Jt.length>0){pt&&xt&&e.texStorage2D(n.TEXTURE_2D,mt,kt,Jt[0].width,Jt[0].height);for(let J=0,rt=Jt.length;J<rt;J++)Rt=Jt[J],pt?F&&e.texSubImage2D(n.TEXTURE_2D,J,0,0,Rt.width,Rt.height,gt,Ut,Rt.data):e.texImage2D(n.TEXTURE_2D,J,kt,Rt.width,Rt.height,0,gt,Ut,Rt.data);x.generateMipmaps=!1}else pt?(xt&&e.texStorage2D(n.TEXTURE_2D,mt,kt,at.width,at.height),F&&e.texSubImage2D(n.TEXTURE_2D,0,0,0,at.width,at.height,gt,Ut,at.data)):e.texImage2D(n.TEXTURE_2D,0,kt,at.width,at.height,0,gt,Ut,at.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){pt&&xt&&e.texStorage3D(n.TEXTURE_2D_ARRAY,mt,kt,Jt[0].width,Jt[0].height,at.depth);for(let J=0,rt=Jt.length;J<rt;J++)if(Rt=Jt[J],x.format!==hi)if(gt!==null)if(pt){if(F)if(x.layerUpdates.size>0){const Et=hd(Rt.width,Rt.height,x.format,x.type);for(const bt of x.layerUpdates){const $t=Rt.data.subarray(bt*Et/Rt.data.BYTES_PER_ELEMENT,(bt+1)*Et/Rt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,bt,Rt.width,Rt.height,1,gt,$t)}x.clearLayerUpdates()}else e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,0,Rt.width,Rt.height,at.depth,gt,Rt.data)}else e.compressedTexImage3D(n.TEXTURE_2D_ARRAY,J,kt,Rt.width,Rt.height,at.depth,0,Rt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else pt?F&&e.texSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,0,Rt.width,Rt.height,at.depth,gt,Ut,Rt.data):e.texImage3D(n.TEXTURE_2D_ARRAY,J,kt,Rt.width,Rt.height,at.depth,0,gt,Ut,Rt.data)}else{pt&&xt&&e.texStorage2D(n.TEXTURE_2D,mt,kt,Jt[0].width,Jt[0].height);for(let J=0,rt=Jt.length;J<rt;J++)Rt=Jt[J],x.format!==hi?gt!==null?pt?F&&e.compressedTexSubImage2D(n.TEXTURE_2D,J,0,0,Rt.width,Rt.height,gt,Rt.data):e.compressedTexImage2D(n.TEXTURE_2D,J,kt,Rt.width,Rt.height,0,Rt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):pt?F&&e.texSubImage2D(n.TEXTURE_2D,J,0,0,Rt.width,Rt.height,gt,Ut,Rt.data):e.texImage2D(n.TEXTURE_2D,J,kt,Rt.width,Rt.height,0,gt,Ut,Rt.data)}else if(x.isDataArrayTexture)if(pt){if(xt&&e.texStorage3D(n.TEXTURE_2D_ARRAY,mt,kt,at.width,at.height,at.depth),F)if(x.layerUpdates.size>0){const J=hd(at.width,at.height,x.format,x.type);for(const rt of x.layerUpdates){const Et=at.data.subarray(rt*J/at.data.BYTES_PER_ELEMENT,(rt+1)*J/at.data.BYTES_PER_ELEMENT);e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,rt,at.width,at.height,1,gt,Ut,Et)}x.clearLayerUpdates()}else e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,at.width,at.height,at.depth,gt,Ut,at.data)}else e.texImage3D(n.TEXTURE_2D_ARRAY,0,kt,at.width,at.height,at.depth,0,gt,Ut,at.data);else if(x.isData3DTexture)pt?(xt&&e.texStorage3D(n.TEXTURE_3D,mt,kt,at.width,at.height,at.depth),F&&e.texSubImage3D(n.TEXTURE_3D,0,0,0,0,at.width,at.height,at.depth,gt,Ut,at.data)):e.texImage3D(n.TEXTURE_3D,0,kt,at.width,at.height,at.depth,0,gt,Ut,at.data);else if(x.isFramebufferTexture){if(xt)if(pt)e.texStorage2D(n.TEXTURE_2D,mt,kt,at.width,at.height);else{let J=at.width,rt=at.height;for(let Et=0;Et<mt;Et++)e.texImage2D(n.TEXTURE_2D,Et,kt,J,rt,0,gt,Ut,null),J>>=1,rt>>=1}}else if(Jt.length>0){if(pt&&xt){const J=wt(Jt[0]);e.texStorage2D(n.TEXTURE_2D,mt,kt,J.width,J.height)}for(let J=0,rt=Jt.length;J<rt;J++)Rt=Jt[J],pt?F&&e.texSubImage2D(n.TEXTURE_2D,J,0,0,gt,Ut,Rt):e.texImage2D(n.TEXTURE_2D,J,kt,gt,Ut,Rt);x.generateMipmaps=!1}else if(pt){if(xt){const J=wt(at);e.texStorage2D(n.TEXTURE_2D,mt,kt,J.width,J.height)}F&&e.texSubImage2D(n.TEXTURE_2D,0,0,0,gt,Ut,at)}else e.texImage2D(n.TEXTURE_2D,0,kt,gt,Ut,at);p(x)&&d(et),ct.__version=Y.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function nt(T,x,H){if(x.image.length!==6)return;const et=Vt(T,x),it=x.source;e.bindTexture(n.TEXTURE_CUBE_MAP,T.__webglTexture,n.TEXTURE0+H);const Y=i.get(it);if(it.version!==Y.__version||et===!0){e.activeTexture(n.TEXTURE0+H);const ct=ye.getPrimaries(ye.workingColorSpace),ot=x.colorSpace===_r?null:ye.getPrimaries(x.colorSpace),_t=x.colorSpace===_r||ct===ot?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t);const Ht=x.isCompressedTexture||x.image[0].isCompressedTexture,at=x.image[0]&&x.image[0].isDataTexture,gt=[];for(let rt=0;rt<6;rt++)!Ht&&!at?gt[rt]=v(x.image[rt],!0,r.maxCubemapSize):gt[rt]=at?x.image[rt].image:x.image[rt],gt[rt]=qt(x,gt[rt]);const Ut=gt[0],kt=s.convert(x.format,x.colorSpace),Rt=s.convert(x.type),Jt=b(x.internalFormat,kt,Rt,x.colorSpace),pt=x.isVideoTexture!==!0,xt=Y.__version===void 0||et===!0,F=it.dataReady;let mt=D(x,Ut);Lt(n.TEXTURE_CUBE_MAP,x);let J;if(Ht){pt&&xt&&e.texStorage2D(n.TEXTURE_CUBE_MAP,mt,Jt,Ut.width,Ut.height);for(let rt=0;rt<6;rt++){J=gt[rt].mipmaps;for(let Et=0;Et<J.length;Et++){const bt=J[Et];x.format!==hi?kt!==null?pt?F&&e.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+rt,Et,0,0,bt.width,bt.height,kt,bt.data):e.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+rt,Et,Jt,bt.width,bt.height,0,bt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):pt?F&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+rt,Et,0,0,bt.width,bt.height,kt,Rt,bt.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+rt,Et,Jt,bt.width,bt.height,0,kt,Rt,bt.data)}}}else{if(J=x.mipmaps,pt&&xt){J.length>0&&mt++;const rt=wt(gt[0]);e.texStorage2D(n.TEXTURE_CUBE_MAP,mt,Jt,rt.width,rt.height)}for(let rt=0;rt<6;rt++)if(at){pt?F&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+rt,0,0,0,gt[rt].width,gt[rt].height,kt,Rt,gt[rt].data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+rt,0,Jt,gt[rt].width,gt[rt].height,0,kt,Rt,gt[rt].data);for(let Et=0;Et<J.length;Et++){const $t=J[Et].image[rt].image;pt?F&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+rt,Et+1,0,0,$t.width,$t.height,kt,Rt,$t.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+rt,Et+1,Jt,$t.width,$t.height,0,kt,Rt,$t.data)}}else{pt?F&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+rt,0,0,0,kt,Rt,gt[rt]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+rt,0,Jt,kt,Rt,gt[rt]);for(let Et=0;Et<J.length;Et++){const bt=J[Et];pt?F&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+rt,Et+1,0,0,kt,Rt,bt.image[rt]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+rt,Et+1,Jt,kt,Rt,bt.image[rt])}}}p(x)&&d(n.TEXTURE_CUBE_MAP),Y.__version=it.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function yt(T,x,H,et,it,Y){const ct=s.convert(H.format,H.colorSpace),ot=s.convert(H.type),_t=b(H.internalFormat,ct,ot,H.colorSpace),Ht=i.get(x),at=i.get(H);if(at.__renderTarget=x,!Ht.__hasExternalTextures){const gt=Math.max(1,x.width>>Y),Ut=Math.max(1,x.height>>Y);it===n.TEXTURE_3D||it===n.TEXTURE_2D_ARRAY?e.texImage3D(it,Y,_t,gt,Ut,x.depth,0,ct,ot,null):e.texImage2D(it,Y,_t,gt,Ut,0,ct,ot,null)}e.bindFramebuffer(n.FRAMEBUFFER,T),Ft(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,et,it,at.__webglTexture,0,Kt(x)):(it===n.TEXTURE_2D||it>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&it<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,et,it,at.__webglTexture,Y),e.bindFramebuffer(n.FRAMEBUFFER,null)}function ht(T,x,H){if(n.bindRenderbuffer(n.RENDERBUFFER,T),x.depthBuffer){const et=x.depthTexture,it=et&&et.isDepthTexture?et.type:null,Y=S(x.stencilBuffer,it),ct=x.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ot=Kt(x);Ft(x)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ot,Y,x.width,x.height):H?n.renderbufferStorageMultisample(n.RENDERBUFFER,ot,Y,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,Y,x.width,x.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,ct,n.RENDERBUFFER,T)}else{const et=x.textures;for(let it=0;it<et.length;it++){const Y=et[it],ct=s.convert(Y.format,Y.colorSpace),ot=s.convert(Y.type),_t=b(Y.internalFormat,ct,ot,Y.colorSpace),Ht=Kt(x);H&&Ft(x)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ht,_t,x.width,x.height):Ft(x)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ht,_t,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,_t,x.width,x.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function St(T,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(n.FRAMEBUFFER,T),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const et=i.get(x.depthTexture);et.__renderTarget=x,(!et.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),W(x.depthTexture,0);const it=et.__webglTexture,Y=Kt(x);if(x.depthTexture.format===Gs)Ft(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,it,0,Y):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,it,0);else if(x.depthTexture.format===oa)Ft(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,it,0,Y):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,it,0);else throw new Error("Unknown depthTexture format")}function It(T){const x=i.get(T),H=T.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==T.depthTexture){const et=T.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),et){const it=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,et.removeEventListener("dispose",it)};et.addEventListener("dispose",it),x.__depthDisposeCallback=it}x.__boundDepthTexture=et}if(T.depthTexture&&!x.__autoAllocateDepthBuffer){if(H)throw new Error("target.depthTexture not supported in Cube render targets");St(x.__webglFramebuffer,T)}else if(H){x.__webglDepthbuffer=[];for(let et=0;et<6;et++)if(e.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[et]),x.__webglDepthbuffer[et]===void 0)x.__webglDepthbuffer[et]=n.createRenderbuffer(),ht(x.__webglDepthbuffer[et],T,!1);else{const it=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Y=x.__webglDepthbuffer[et];n.bindRenderbuffer(n.RENDERBUFFER,Y),n.framebufferRenderbuffer(n.FRAMEBUFFER,it,n.RENDERBUFFER,Y)}}else if(e.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=n.createRenderbuffer(),ht(x.__webglDepthbuffer,T,!1);else{const et=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,it=x.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,it),n.framebufferRenderbuffer(n.FRAMEBUFFER,et,n.RENDERBUFFER,it)}e.bindFramebuffer(n.FRAMEBUFFER,null)}function Bt(T,x,H){const et=i.get(T);x!==void 0&&yt(et.__webglFramebuffer,T,T.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),H!==void 0&&It(T)}function se(T){const x=T.texture,H=i.get(T),et=i.get(x);T.addEventListener("dispose",R);const it=T.textures,Y=T.isWebGLCubeRenderTarget===!0,ct=it.length>1;if(ct||(et.__webglTexture===void 0&&(et.__webglTexture=n.createTexture()),et.__version=x.version,a.memory.textures++),Y){H.__webglFramebuffer=[];for(let ot=0;ot<6;ot++)if(x.mipmaps&&x.mipmaps.length>0){H.__webglFramebuffer[ot]=[];for(let _t=0;_t<x.mipmaps.length;_t++)H.__webglFramebuffer[ot][_t]=n.createFramebuffer()}else H.__webglFramebuffer[ot]=n.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){H.__webglFramebuffer=[];for(let ot=0;ot<x.mipmaps.length;ot++)H.__webglFramebuffer[ot]=n.createFramebuffer()}else H.__webglFramebuffer=n.createFramebuffer();if(ct)for(let ot=0,_t=it.length;ot<_t;ot++){const Ht=i.get(it[ot]);Ht.__webglTexture===void 0&&(Ht.__webglTexture=n.createTexture(),a.memory.textures++)}if(T.samples>0&&Ft(T)===!1){H.__webglMultisampledFramebuffer=n.createFramebuffer(),H.__webglColorRenderbuffer=[],e.bindFramebuffer(n.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let ot=0;ot<it.length;ot++){const _t=it[ot];H.__webglColorRenderbuffer[ot]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,H.__webglColorRenderbuffer[ot]);const Ht=s.convert(_t.format,_t.colorSpace),at=s.convert(_t.type),gt=b(_t.internalFormat,Ht,at,_t.colorSpace,T.isXRRenderTarget===!0),Ut=Kt(T);n.renderbufferStorageMultisample(n.RENDERBUFFER,Ut,gt,T.width,T.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ot,n.RENDERBUFFER,H.__webglColorRenderbuffer[ot])}n.bindRenderbuffer(n.RENDERBUFFER,null),T.depthBuffer&&(H.__webglDepthRenderbuffer=n.createRenderbuffer(),ht(H.__webglDepthRenderbuffer,T,!0)),e.bindFramebuffer(n.FRAMEBUFFER,null)}}if(Y){e.bindTexture(n.TEXTURE_CUBE_MAP,et.__webglTexture),Lt(n.TEXTURE_CUBE_MAP,x);for(let ot=0;ot<6;ot++)if(x.mipmaps&&x.mipmaps.length>0)for(let _t=0;_t<x.mipmaps.length;_t++)yt(H.__webglFramebuffer[ot][_t],T,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ot,_t);else yt(H.__webglFramebuffer[ot],T,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0);p(x)&&d(n.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ct){for(let ot=0,_t=it.length;ot<_t;ot++){const Ht=it[ot],at=i.get(Ht);e.bindTexture(n.TEXTURE_2D,at.__webglTexture),Lt(n.TEXTURE_2D,Ht),yt(H.__webglFramebuffer,T,Ht,n.COLOR_ATTACHMENT0+ot,n.TEXTURE_2D,0),p(Ht)&&d(n.TEXTURE_2D)}e.unbindTexture()}else{let ot=n.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ot=T.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(ot,et.__webglTexture),Lt(ot,x),x.mipmaps&&x.mipmaps.length>0)for(let _t=0;_t<x.mipmaps.length;_t++)yt(H.__webglFramebuffer[_t],T,x,n.COLOR_ATTACHMENT0,ot,_t);else yt(H.__webglFramebuffer,T,x,n.COLOR_ATTACHMENT0,ot,0);p(x)&&d(ot),e.unbindTexture()}T.depthBuffer&&It(T)}function Xt(T){const x=T.textures;for(let H=0,et=x.length;H<et;H++){const it=x[H];if(p(it)){const Y=w(T),ct=i.get(it).__webglTexture;e.bindTexture(Y,ct),d(Y),e.unbindTexture()}}}const he=[],N=[];function Pe(T){if(T.samples>0){if(Ft(T)===!1){const x=T.textures,H=T.width,et=T.height;let it=n.COLOR_BUFFER_BIT;const Y=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ct=i.get(T),ot=x.length>1;if(ot)for(let _t=0;_t<x.length;_t++)e.bindFramebuffer(n.FRAMEBUFFER,ct.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+_t,n.RENDERBUFFER,null),e.bindFramebuffer(n.FRAMEBUFFER,ct.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+_t,n.TEXTURE_2D,null,0);e.bindFramebuffer(n.READ_FRAMEBUFFER,ct.__webglMultisampledFramebuffer),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,ct.__webglFramebuffer);for(let _t=0;_t<x.length;_t++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(it|=n.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(it|=n.STENCIL_BUFFER_BIT)),ot){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ct.__webglColorRenderbuffer[_t]);const Ht=i.get(x[_t]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Ht,0)}n.blitFramebuffer(0,0,H,et,0,0,H,et,it,n.NEAREST),l===!0&&(he.length=0,N.length=0,he.push(n.COLOR_ATTACHMENT0+_t),T.depthBuffer&&T.resolveDepthBuffer===!1&&(he.push(Y),N.push(Y),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,N)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,he))}if(e.bindFramebuffer(n.READ_FRAMEBUFFER,null),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),ot)for(let _t=0;_t<x.length;_t++){e.bindFramebuffer(n.FRAMEBUFFER,ct.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+_t,n.RENDERBUFFER,ct.__webglColorRenderbuffer[_t]);const Ht=i.get(x[_t]).__webglTexture;e.bindFramebuffer(n.FRAMEBUFFER,ct.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+_t,n.TEXTURE_2D,Ht,0)}e.bindFramebuffer(n.DRAW_FRAMEBUFFER,ct.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&l){const x=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[x])}}}function Kt(T){return Math.min(r.maxSamples,T.samples)}function Ft(T){const x=i.get(T);return T.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function ft(T){const x=a.render.frame;u.get(T)!==x&&(u.set(T,x),T.update())}function qt(T,x){const H=T.colorSpace,et=T.format,it=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||H!==la&&H!==_r&&(ye.getTransfer(H)===Ae?(et!==hi||it!==ir)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",H)),x}function wt(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=U,this.resetTextureUnits=O,this.setTexture2D=W,this.setTexture2DArray=X,this.setTexture3D=j,this.setTextureCube=G,this.rebindTextures=Bt,this.setupRenderTarget=se,this.updateRenderTargetMipmap=Xt,this.updateMultisampleRenderTarget=Pe,this.setupDepthRenderbuffer=It,this.setupFrameBufferTexture=yt,this.useMultisampledRTT=Ft}function GS(n,t){function e(i,r=_r){let s;const a=ye.getTransfer(r);if(i===ir)return n.UNSIGNED_BYTE;if(i===Ju)return n.UNSIGNED_SHORT_4_4_4_4;if(i===th)return n.UNSIGNED_SHORT_5_5_5_1;if(i===cp)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===op)return n.BYTE;if(i===lp)return n.SHORT;if(i===qa)return n.UNSIGNED_SHORT;if(i===Qu)return n.INT;if(i===os)return n.UNSIGNED_INT;if(i===Ki)return n.FLOAT;if(i===ao)return n.HALF_FLOAT;if(i===up)return n.ALPHA;if(i===hp)return n.RGB;if(i===hi)return n.RGBA;if(i===dp)return n.LUMINANCE;if(i===fp)return n.LUMINANCE_ALPHA;if(i===Gs)return n.DEPTH_COMPONENT;if(i===oa)return n.DEPTH_STENCIL;if(i===pp)return n.RED;if(i===eh)return n.RED_INTEGER;if(i===mp)return n.RG;if(i===nh)return n.RG_INTEGER;if(i===ih)return n.RGBA_INTEGER;if(i===qo||i===$o||i===jo||i===Zo)if(a===Ae)if(s=t.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===qo)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===$o)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===jo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Zo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=t.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===qo)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===$o)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===jo)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Zo)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===au||i===ou||i===lu||i===cu)if(s=t.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===au)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===ou)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===lu)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===cu)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===uu||i===hu||i===du)if(s=t.get("WEBGL_compressed_texture_etc"),s!==null){if(i===uu||i===hu)return a===Ae?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===du)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===fu||i===pu||i===mu||i===_u||i===vu||i===gu||i===xu||i===Mu||i===yu||i===Su||i===Eu||i===bu||i===wu||i===Tu)if(s=t.get("WEBGL_compressed_texture_astc"),s!==null){if(i===fu)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===pu)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===mu)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===_u)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===vu)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===gu)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===xu)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Mu)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===yu)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Su)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Eu)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===bu)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===wu)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Tu)return a===Ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Ko||i===Au||i===Ru)if(s=t.get("EXT_texture_compression_bptc"),s!==null){if(i===Ko)return a===Ae?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Au)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Ru)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===_p||i===Cu||i===Pu||i===Du)if(s=t.get("EXT_texture_compression_rgtc"),s!==null){if(i===Ko)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Cu)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Pu)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Du)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===aa?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:e}}const WS={type:"move"};class yc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Fs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Fs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Fs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let r=null,s=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const v of t.hand.values()){const p=e.getJointPose(v,i),d=this._getHandJoint(c,v);p!==null&&(d.matrix.fromArray(p.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=p.radius),d.visible=p!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],f=u.position.distanceTo(h.position),m=.02,_=.005;c.inputState.pinching&&f>m+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&f<=m-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(s=e.getPose(t.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(r=e.getPose(t.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(WS)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const i=new Fs;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}}const XS=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,YS=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class qS{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,i){if(this.texture===null){const r=new An,s=t.properties.get(r);s.__webglTexture=e.texture,(e.depthNear!=i.depthNear||e.depthFar!=i.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=r}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,i=new Cr({vertexShader:XS,fragmentShader:YS,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Pt(new pa(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class $S extends cs{constructor(t,e){super();const i=this;let r=null,s=1,a=null,o="local-floor",l=1,c=null,u=null,h=null,f=null,m=null,_=null;const v=new qS,p=e.getContextAttributes();let d=null,w=null;const b=[],S=[],D=new Wt;let C=null;const R=new Jn;R.viewport=new Ye;const P=new Jn;P.viewport=new Ye;const y=[R,P],M=new p0;let A=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let nt=b[q];return nt===void 0&&(nt=new yc,b[q]=nt),nt.getTargetRaySpace()},this.getControllerGrip=function(q){let nt=b[q];return nt===void 0&&(nt=new yc,b[q]=nt),nt.getGripSpace()},this.getHand=function(q){let nt=b[q];return nt===void 0&&(nt=new yc,b[q]=nt),nt.getHandSpace()};function U(q){const nt=S.indexOf(q.inputSource);if(nt===-1)return;const yt=b[nt];yt!==void 0&&(yt.update(q.inputSource,q.frame,c||a),yt.dispatchEvent({type:q.type,data:q.inputSource}))}function k(){r.removeEventListener("select",U),r.removeEventListener("selectstart",U),r.removeEventListener("selectend",U),r.removeEventListener("squeeze",U),r.removeEventListener("squeezestart",U),r.removeEventListener("squeezeend",U),r.removeEventListener("end",k),r.removeEventListener("inputsourceschange",W);for(let q=0;q<b.length;q++){const nt=S[q];nt!==null&&(S[q]=null,b[q].disconnect(nt))}A=null,O=null,v.reset(),t.setRenderTarget(d),m=null,f=null,h=null,r=null,w=null,Vt.stop(),i.isPresenting=!1,t.setPixelRatio(C),t.setSize(D.width,D.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){s=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return f!==null?f:m},this.getBinding=function(){return h},this.getFrame=function(){return _},this.getSession=function(){return r},this.setSession=async function(q){if(r=q,r!==null){if(d=t.getRenderTarget(),r.addEventListener("select",U),r.addEventListener("selectstart",U),r.addEventListener("selectend",U),r.addEventListener("squeeze",U),r.addEventListener("squeezestart",U),r.addEventListener("squeezeend",U),r.addEventListener("end",k),r.addEventListener("inputsourceschange",W),p.xrCompatible!==!0&&await e.makeXRCompatible(),C=t.getPixelRatio(),t.getSize(D),r.renderState.layers===void 0){const nt={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:s};m=new XRWebGLLayer(r,e,nt),r.updateRenderState({baseLayer:m}),t.setPixelRatio(1),t.setSize(m.framebufferWidth,m.framebufferHeight,!1),w=new ls(m.framebufferWidth,m.framebufferHeight,{format:hi,type:ir,colorSpace:t.outputColorSpace,stencilBuffer:p.stencil})}else{let nt=null,yt=null,ht=null;p.depth&&(ht=p.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,nt=p.stencil?oa:Gs,yt=p.stencil?aa:os);const St={colorFormat:e.RGBA8,depthFormat:ht,scaleFactor:s};h=new XRWebGLBinding(r,e),f=h.createProjectionLayer(St),r.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),w=new ls(f.textureWidth,f.textureHeight,{format:hi,type:ir,depthTexture:new Dp(f.textureWidth,f.textureHeight,yt,void 0,void 0,void 0,void 0,void 0,void 0,nt),stencilBuffer:p.stencil,colorSpace:t.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}w.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await r.requestReferenceSpace(o),Vt.setContext(r),Vt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function W(q){for(let nt=0;nt<q.removed.length;nt++){const yt=q.removed[nt],ht=S.indexOf(yt);ht>=0&&(S[ht]=null,b[ht].disconnect(yt))}for(let nt=0;nt<q.added.length;nt++){const yt=q.added[nt];let ht=S.indexOf(yt);if(ht===-1){for(let It=0;It<b.length;It++)if(It>=S.length){S.push(yt),ht=It;break}else if(S[It]===null){S[It]=yt,ht=It;break}if(ht===-1)break}const St=b[ht];St&&St.connect(yt)}}const X=new I,j=new I;function G(q,nt,yt){X.setFromMatrixPosition(nt.matrixWorld),j.setFromMatrixPosition(yt.matrixWorld);const ht=X.distanceTo(j),St=nt.projectionMatrix.elements,It=yt.projectionMatrix.elements,Bt=St[14]/(St[10]-1),se=St[14]/(St[10]+1),Xt=(St[9]+1)/St[5],he=(St[9]-1)/St[5],N=(St[8]-1)/St[0],Pe=(It[8]+1)/It[0],Kt=Bt*N,Ft=Bt*Pe,ft=ht/(-N+Pe),qt=ft*-N;if(nt.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(qt),q.translateZ(ft),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),St[10]===-1)q.projectionMatrix.copy(nt.projectionMatrix),q.projectionMatrixInverse.copy(nt.projectionMatrixInverse);else{const wt=Bt+ft,T=se+ft,x=Kt-qt,H=Ft+(ht-qt),et=Xt*se/T*wt,it=he*se/T*wt;q.projectionMatrix.makePerspective(x,H,et,it,wt,T),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function V(q,nt){nt===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(nt.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(r===null)return;let nt=q.near,yt=q.far;v.texture!==null&&(v.depthNear>0&&(nt=v.depthNear),v.depthFar>0&&(yt=v.depthFar)),M.near=P.near=R.near=nt,M.far=P.far=R.far=yt,(A!==M.near||O!==M.far)&&(r.updateRenderState({depthNear:M.near,depthFar:M.far}),A=M.near,O=M.far),R.layers.mask=q.layers.mask|2,P.layers.mask=q.layers.mask|4,M.layers.mask=R.layers.mask|P.layers.mask;const ht=q.parent,St=M.cameras;V(M,ht);for(let It=0;It<St.length;It++)V(St[It],ht);St.length===2?G(M,R,P):M.projectionMatrix.copy(R.projectionMatrix),lt(q,M,ht)};function lt(q,nt,yt){yt===null?q.matrix.copy(nt.matrixWorld):(q.matrix.copy(yt.matrixWorld),q.matrix.invert(),q.matrix.multiply(nt.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(nt.projectionMatrix),q.projectionMatrixInverse.copy(nt.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Iu*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(f===null&&m===null))return l},this.setFoveation=function(q){l=q,f!==null&&(f.fixedFoveation=q),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=q)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(M)};let vt=null;function Lt(q,nt){if(u=nt.getViewerPose(c||a),_=nt,u!==null){const yt=u.views;m!==null&&(t.setRenderTargetFramebuffer(w,m.framebuffer),t.setRenderTarget(w));let ht=!1;yt.length!==M.cameras.length&&(M.cameras.length=0,ht=!0);for(let It=0;It<yt.length;It++){const Bt=yt[It];let se=null;if(m!==null)se=m.getViewport(Bt);else{const he=h.getViewSubImage(f,Bt);se=he.viewport,It===0&&(t.setRenderTargetTextures(w,he.colorTexture,f.ignoreDepthValues?void 0:he.depthStencilTexture),t.setRenderTarget(w))}let Xt=y[It];Xt===void 0&&(Xt=new Jn,Xt.layers.enable(It),Xt.viewport=new Ye,y[It]=Xt),Xt.matrix.fromArray(Bt.transform.matrix),Xt.matrix.decompose(Xt.position,Xt.quaternion,Xt.scale),Xt.projectionMatrix.fromArray(Bt.projectionMatrix),Xt.projectionMatrixInverse.copy(Xt.projectionMatrix).invert(),Xt.viewport.set(se.x,se.y,se.width,se.height),It===0&&(M.matrix.copy(Xt.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),ht===!0&&M.cameras.push(Xt)}const St=r.enabledFeatures;if(St&&St.includes("depth-sensing")){const It=h.getDepthInformation(yt[0]);It&&It.isValid&&It.texture&&v.init(t,It,r.renderState)}}for(let yt=0;yt<b.length;yt++){const ht=S[yt],St=b[yt];ht!==null&&St!==void 0&&St.update(ht,nt,c||a)}vt&&vt(q,nt),nt.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:nt}),_=null}const Vt=new Fp;Vt.setAnimationLoop(Lt),this.setAnimationLoop=function(q){vt=q},this.dispose=function(){}}}const Br=new _i,jS=new Ue;function ZS(n,t){function e(p,d){p.matrixAutoUpdate===!0&&p.updateMatrix(),d.value.copy(p.matrix)}function i(p,d){d.color.getRGB(p.fogColor.value,wp(n)),d.isFog?(p.fogNear.value=d.near,p.fogFar.value=d.far):d.isFogExp2&&(p.fogDensity.value=d.density)}function r(p,d,w,b,S){d.isMeshBasicMaterial||d.isMeshLambertMaterial?s(p,d):d.isMeshToonMaterial?(s(p,d),h(p,d)):d.isMeshPhongMaterial?(s(p,d),u(p,d)):d.isMeshStandardMaterial?(s(p,d),f(p,d),d.isMeshPhysicalMaterial&&m(p,d,S)):d.isMeshMatcapMaterial?(s(p,d),_(p,d)):d.isMeshDepthMaterial?s(p,d):d.isMeshDistanceMaterial?(s(p,d),v(p,d)):d.isMeshNormalMaterial?s(p,d):d.isLineBasicMaterial?(a(p,d),d.isLineDashedMaterial&&o(p,d)):d.isPointsMaterial?l(p,d,w,b):d.isSpriteMaterial?c(p,d):d.isShadowMaterial?(p.color.value.copy(d.color),p.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(p,d){p.opacity.value=d.opacity,d.color&&p.diffuse.value.copy(d.color),d.emissive&&p.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(p.map.value=d.map,e(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,e(d.alphaMap,p.alphaMapTransform)),d.bumpMap&&(p.bumpMap.value=d.bumpMap,e(d.bumpMap,p.bumpMapTransform),p.bumpScale.value=d.bumpScale,d.side===Un&&(p.bumpScale.value*=-1)),d.normalMap&&(p.normalMap.value=d.normalMap,e(d.normalMap,p.normalMapTransform),p.normalScale.value.copy(d.normalScale),d.side===Un&&p.normalScale.value.negate()),d.displacementMap&&(p.displacementMap.value=d.displacementMap,e(d.displacementMap,p.displacementMapTransform),p.displacementScale.value=d.displacementScale,p.displacementBias.value=d.displacementBias),d.emissiveMap&&(p.emissiveMap.value=d.emissiveMap,e(d.emissiveMap,p.emissiveMapTransform)),d.specularMap&&(p.specularMap.value=d.specularMap,e(d.specularMap,p.specularMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest);const w=t.get(d),b=w.envMap,S=w.envMapRotation;b&&(p.envMap.value=b,Br.copy(S),Br.x*=-1,Br.y*=-1,Br.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(Br.y*=-1,Br.z*=-1),p.envMapRotation.value.setFromMatrix4(jS.makeRotationFromEuler(Br)),p.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=d.reflectivity,p.ior.value=d.ior,p.refractionRatio.value=d.refractionRatio),d.lightMap&&(p.lightMap.value=d.lightMap,p.lightMapIntensity.value=d.lightMapIntensity,e(d.lightMap,p.lightMapTransform)),d.aoMap&&(p.aoMap.value=d.aoMap,p.aoMapIntensity.value=d.aoMapIntensity,e(d.aoMap,p.aoMapTransform))}function a(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,d.map&&(p.map.value=d.map,e(d.map,p.mapTransform))}function o(p,d){p.dashSize.value=d.dashSize,p.totalSize.value=d.dashSize+d.gapSize,p.scale.value=d.scale}function l(p,d,w,b){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.size.value=d.size*w,p.scale.value=b*.5,d.map&&(p.map.value=d.map,e(d.map,p.uvTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,e(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function c(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.rotation.value=d.rotation,d.map&&(p.map.value=d.map,e(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,e(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function u(p,d){p.specular.value.copy(d.specular),p.shininess.value=Math.max(d.shininess,1e-4)}function h(p,d){d.gradientMap&&(p.gradientMap.value=d.gradientMap)}function f(p,d){p.metalness.value=d.metalness,d.metalnessMap&&(p.metalnessMap.value=d.metalnessMap,e(d.metalnessMap,p.metalnessMapTransform)),p.roughness.value=d.roughness,d.roughnessMap&&(p.roughnessMap.value=d.roughnessMap,e(d.roughnessMap,p.roughnessMapTransform)),d.envMap&&(p.envMapIntensity.value=d.envMapIntensity)}function m(p,d,w){p.ior.value=d.ior,d.sheen>0&&(p.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),p.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(p.sheenColorMap.value=d.sheenColorMap,e(d.sheenColorMap,p.sheenColorMapTransform)),d.sheenRoughnessMap&&(p.sheenRoughnessMap.value=d.sheenRoughnessMap,e(d.sheenRoughnessMap,p.sheenRoughnessMapTransform))),d.clearcoat>0&&(p.clearcoat.value=d.clearcoat,p.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(p.clearcoatMap.value=d.clearcoatMap,e(d.clearcoatMap,p.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,e(d.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(p.clearcoatNormalMap.value=d.clearcoatNormalMap,e(d.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Un&&p.clearcoatNormalScale.value.negate())),d.dispersion>0&&(p.dispersion.value=d.dispersion),d.iridescence>0&&(p.iridescence.value=d.iridescence,p.iridescenceIOR.value=d.iridescenceIOR,p.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(p.iridescenceMap.value=d.iridescenceMap,e(d.iridescenceMap,p.iridescenceMapTransform)),d.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=d.iridescenceThicknessMap,e(d.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),d.transmission>0&&(p.transmission.value=d.transmission,p.transmissionSamplerMap.value=w.texture,p.transmissionSamplerSize.value.set(w.width,w.height),d.transmissionMap&&(p.transmissionMap.value=d.transmissionMap,e(d.transmissionMap,p.transmissionMapTransform)),p.thickness.value=d.thickness,d.thicknessMap&&(p.thicknessMap.value=d.thicknessMap,e(d.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=d.attenuationDistance,p.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(p.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(p.anisotropyMap.value=d.anisotropyMap,e(d.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=d.specularIntensity,p.specularColor.value.copy(d.specularColor),d.specularColorMap&&(p.specularColorMap.value=d.specularColorMap,e(d.specularColorMap,p.specularColorMapTransform)),d.specularIntensityMap&&(p.specularIntensityMap.value=d.specularIntensityMap,e(d.specularIntensityMap,p.specularIntensityMapTransform))}function _(p,d){d.matcap&&(p.matcap.value=d.matcap)}function v(p,d){const w=t.get(d).light;p.referencePosition.value.setFromMatrixPosition(w.matrixWorld),p.nearDistance.value=w.shadow.camera.near,p.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function KS(n,t,e,i){let r={},s={},a=[];const o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(w,b){const S=b.program;i.uniformBlockBinding(w,S)}function c(w,b){let S=r[w.id];S===void 0&&(_(w),S=u(w),r[w.id]=S,w.addEventListener("dispose",p));const D=b.program;i.updateUBOMapping(w,D);const C=t.render.frame;s[w.id]!==C&&(f(w),s[w.id]=C)}function u(w){const b=h();w.__bindingPointIndex=b;const S=n.createBuffer(),D=w.__size,C=w.usage;return n.bindBuffer(n.UNIFORM_BUFFER,S),n.bufferData(n.UNIFORM_BUFFER,D,C),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,b,S),S}function h(){for(let w=0;w<o;w++)if(a.indexOf(w)===-1)return a.push(w),w;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(w){const b=r[w.id],S=w.uniforms,D=w.__cache;n.bindBuffer(n.UNIFORM_BUFFER,b);for(let C=0,R=S.length;C<R;C++){const P=Array.isArray(S[C])?S[C]:[S[C]];for(let y=0,M=P.length;y<M;y++){const A=P[y];if(m(A,C,y,D)===!0){const O=A.__offset,U=Array.isArray(A.value)?A.value:[A.value];let k=0;for(let W=0;W<U.length;W++){const X=U[W],j=v(X);typeof X=="number"||typeof X=="boolean"?(A.__data[0]=X,n.bufferSubData(n.UNIFORM_BUFFER,O+k,A.__data)):X.isMatrix3?(A.__data[0]=X.elements[0],A.__data[1]=X.elements[1],A.__data[2]=X.elements[2],A.__data[3]=0,A.__data[4]=X.elements[3],A.__data[5]=X.elements[4],A.__data[6]=X.elements[5],A.__data[7]=0,A.__data[8]=X.elements[6],A.__data[9]=X.elements[7],A.__data[10]=X.elements[8],A.__data[11]=0):(X.toArray(A.__data,k),k+=j.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,O,A.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function m(w,b,S,D){const C=w.value,R=b+"_"+S;if(D[R]===void 0)return typeof C=="number"||typeof C=="boolean"?D[R]=C:D[R]=C.clone(),!0;{const P=D[R];if(typeof C=="number"||typeof C=="boolean"){if(P!==C)return D[R]=C,!0}else if(P.equals(C)===!1)return P.copy(C),!0}return!1}function _(w){const b=w.uniforms;let S=0;const D=16;for(let R=0,P=b.length;R<P;R++){const y=Array.isArray(b[R])?b[R]:[b[R]];for(let M=0,A=y.length;M<A;M++){const O=y[M],U=Array.isArray(O.value)?O.value:[O.value];for(let k=0,W=U.length;k<W;k++){const X=U[k],j=v(X),G=S%D,V=G%j.boundary,lt=G+V;S+=V,lt!==0&&D-lt<j.storage&&(S+=D-lt),O.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=S,S+=j.storage}}}const C=S%D;return C>0&&(S+=D-C),w.__size=S,w.__cache={},this}function v(w){const b={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(b.boundary=4,b.storage=4):w.isVector2?(b.boundary=8,b.storage=8):w.isVector3||w.isColor?(b.boundary=16,b.storage=12):w.isVector4?(b.boundary=16,b.storage=16):w.isMatrix3?(b.boundary=48,b.storage=48):w.isMatrix4?(b.boundary=64,b.storage=64):w.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",w),b}function p(w){const b=w.target;b.removeEventListener("dispose",p);const S=a.indexOf(b.__bindingPointIndex);a.splice(S,1),n.deleteBuffer(r[b.id]),delete r[b.id],delete s[b.id]}function d(){for(const w in r)n.deleteBuffer(r[w]);a=[],r={},s={}}return{bind:l,update:c,dispose:d}}class QS{constructor(t={}){const{canvas:e=Pg(),context:i=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reverseDepthBuffer:f=!1}=t;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=a;const _=new Uint32Array(4),v=new Int32Array(4);let p=null,d=null;const w=[],b=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Qn,this.toneMapping=Er,this.toneMappingExposure=1;const S=this;let D=!1,C=0,R=0,P=null,y=-1,M=null;const A=new Ye,O=new Ye;let U=null;const k=new fe(0);let W=0,X=e.width,j=e.height,G=1,V=null,lt=null;const vt=new Ye(0,0,X,j),Lt=new Ye(0,0,X,j);let Vt=!1;const q=new sh;let nt=!1,yt=!1;const ht=new Ue,St=new Ue,It=new I,Bt=new Ye,se={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Xt=!1;function he(){return P===null?G:1}let N=i;function Pe(E,z){return e.getContext(E,z)}try{const E={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Ku}`),e.addEventListener("webglcontextlost",rt,!1),e.addEventListener("webglcontextrestored",Et,!1),e.addEventListener("webglcontextcreationerror",bt,!1),N===null){const z="webgl2";if(N=Pe(z,E),N===null)throw Pe(z)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let Kt,Ft,ft,qt,wt,T,x,H,et,it,Y,ct,ot,_t,Ht,at,gt,Ut,kt,Rt,Jt,pt,xt,F;function mt(){Kt=new oy(N),Kt.init(),pt=new GS(N,Kt),Ft=new ey(N,Kt,t,pt),ft=new HS(N,Kt),Ft.reverseDepthBuffer&&f&&ft.buffers.depth.setReversed(!0),qt=new uy(N),wt=new RS,T=new VS(N,Kt,ft,wt,Ft,pt,qt),x=new iy(S),H=new ay(S),et=new v0(N),xt=new JM(N,et),it=new ly(N,et,qt,xt),Y=new dy(N,it,et,qt),kt=new hy(N,Ft,T),at=new ny(wt),ct=new AS(S,x,H,Kt,Ft,xt,at),ot=new ZS(S,wt),_t=new PS,Ht=new FS(Kt),Ut=new QM(S,x,H,ft,Y,m,l),gt=new zS(S,Y,Ft),F=new KS(N,qt,Ft,ft),Rt=new ty(N,Kt,qt),Jt=new cy(N,Kt,qt),qt.programs=ct.programs,S.capabilities=Ft,S.extensions=Kt,S.properties=wt,S.renderLists=_t,S.shadowMap=gt,S.state=ft,S.info=qt}mt();const J=new $S(S,N);this.xr=J,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const E=Kt.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=Kt.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(E){E!==void 0&&(G=E,this.setSize(X,j,!1))},this.getSize=function(E){return E.set(X,j)},this.setSize=function(E,z,K=!0){if(J.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=E,j=z,e.width=Math.floor(E*G),e.height=Math.floor(z*G),K===!0&&(e.style.width=E+"px",e.style.height=z+"px"),this.setViewport(0,0,E,z)},this.getDrawingBufferSize=function(E){return E.set(X*G,j*G).floor()},this.setDrawingBufferSize=function(E,z,K){X=E,j=z,G=K,e.width=Math.floor(E*K),e.height=Math.floor(z*K),this.setViewport(0,0,E,z)},this.getCurrentViewport=function(E){return E.copy(A)},this.getViewport=function(E){return E.copy(vt)},this.setViewport=function(E,z,K,Q){E.isVector4?vt.set(E.x,E.y,E.z,E.w):vt.set(E,z,K,Q),ft.viewport(A.copy(vt).multiplyScalar(G).round())},this.getScissor=function(E){return E.copy(Lt)},this.setScissor=function(E,z,K,Q){E.isVector4?Lt.set(E.x,E.y,E.z,E.w):Lt.set(E,z,K,Q),ft.scissor(O.copy(Lt).multiplyScalar(G).round())},this.getScissorTest=function(){return Vt},this.setScissorTest=function(E){ft.setScissorTest(Vt=E)},this.setOpaqueSort=function(E){V=E},this.setTransparentSort=function(E){lt=E},this.getClearColor=function(E){return E.copy(Ut.getClearColor())},this.setClearColor=function(){Ut.setClearColor.apply(Ut,arguments)},this.getClearAlpha=function(){return Ut.getClearAlpha()},this.setClearAlpha=function(){Ut.setClearAlpha.apply(Ut,arguments)},this.clear=function(E=!0,z=!0,K=!0){let Q=0;if(E){let B=!1;if(P!==null){const ut=P.texture.format;B=ut===ih||ut===nh||ut===eh}if(B){const ut=P.texture.type,Tt=ut===ir||ut===os||ut===qa||ut===aa||ut===Ju||ut===th,Dt=Ut.getClearColor(),Ot=Ut.getClearAlpha(),te=Dt.r,ne=Dt.g,Yt=Dt.b;Tt?(_[0]=te,_[1]=ne,_[2]=Yt,_[3]=Ot,N.clearBufferuiv(N.COLOR,0,_)):(v[0]=te,v[1]=ne,v[2]=Yt,v[3]=Ot,N.clearBufferiv(N.COLOR,0,v))}else Q|=N.COLOR_BUFFER_BIT}z&&(Q|=N.DEPTH_BUFFER_BIT),K&&(Q|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(Q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",rt,!1),e.removeEventListener("webglcontextrestored",Et,!1),e.removeEventListener("webglcontextcreationerror",bt,!1),Ut.dispose(),_t.dispose(),Ht.dispose(),wt.dispose(),x.dispose(),H.dispose(),Y.dispose(),xt.dispose(),F.dispose(),ct.dispose(),J.dispose(),J.removeEventListener("sessionstart",Dr),J.removeEventListener("sessionend",hs),$e.stop()};function rt(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),D=!0}function Et(){console.log("THREE.WebGLRenderer: Context Restored."),D=!1;const E=qt.autoReset,z=gt.enabled,K=gt.autoUpdate,Q=gt.needsUpdate,B=gt.type;mt(),qt.autoReset=E,gt.enabled=z,gt.autoUpdate=K,gt.needsUpdate=Q,gt.type=B}function bt(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function $t(E){const z=E.target;z.removeEventListener("dispose",$t),me(z)}function me(E){ke(E),wt.remove(E)}function ke(E){const z=wt.get(E).programs;z!==void 0&&(z.forEach(function(K){ct.releaseProgram(K)}),E.isShaderMaterial&&ct.releaseShaderCache(E))}this.renderBufferDirect=function(E,z,K,Q,B,ut){z===null&&(z=se);const Tt=B.isMesh&&B.matrixWorld.determinant()<0,Dt=Oi(E,z,K,Q,B);ft.setMaterial(Q,Tt);let Ot=K.index,te=1;if(Q.wireframe===!0){if(Ot=it.getWireframeAttribute(K),Ot===void 0)return;te=2}const ne=K.drawRange,Yt=K.attributes.position;let xe=ne.start*te,Ee=(ne.start+ne.count)*te;ut!==null&&(xe=Math.max(xe,ut.start*te),Ee=Math.min(Ee,(ut.start+ut.count)*te)),Ot!==null?(xe=Math.max(xe,0),Ee=Math.min(Ee,Ot.count)):Yt!=null&&(xe=Math.max(xe,0),Ee=Math.min(Ee,Yt.count));const Ke=Ee-xe;if(Ke<0||Ke===1/0)return;xt.setup(B,Q,Dt,K,Ot);let We,Me=Rt;if(Ot!==null&&(We=et.get(Ot),Me=Jt,Me.setIndex(We)),B.isMesh)Q.wireframe===!0?(ft.setLineWidth(Q.wireframeLinewidth*he()),Me.setMode(N.LINES)):Me.setMode(N.TRIANGLES);else if(B.isLine){let jt=Q.linewidth;jt===void 0&&(jt=1),ft.setLineWidth(jt*he()),B.isLineSegments?Me.setMode(N.LINES):B.isLineLoop?Me.setMode(N.LINE_LOOP):Me.setMode(N.LINE_STRIP)}else B.isPoints?Me.setMode(N.POINTS):B.isSprite&&Me.setMode(N.TRIANGLES);if(B.isBatchedMesh)if(B._multiDrawInstances!==null)Me.renderMultiDrawInstances(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount,B._multiDrawInstances);else if(Kt.get("WEBGL_multi_draw"))Me.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else{const jt=B._multiDrawStarts,un=B._multiDrawCounts,be=B._multiDrawCount,ii=Ot?et.get(Ot).bytesPerElement:1,fs=wt.get(Q).currentProgram.getUniforms();for(let Nn=0;Nn<be;Nn++)fs.setValue(N,"_gl_DrawID",Nn),Me.render(jt[Nn]/ii,un[Nn])}else if(B.isInstancedMesh)Me.renderInstances(xe,Ke,B.count);else if(K.isInstancedBufferGeometry){const jt=K._maxInstanceCount!==void 0?K._maxInstanceCount:1/0,un=Math.min(K.instanceCount,jt);Me.renderInstances(xe,Ke,un)}else Me.render(xe,Ke)};function re(E,z,K){E.transparent===!0&&E.side===Ti&&E.forceSinglePass===!1?(E.side=Un,E.needsUpdate=!0,Oe(E,z,K),E.side=Rr,E.needsUpdate=!0,Oe(E,z,K),E.side=Ti):Oe(E,z,K)}this.compile=function(E,z,K=null){K===null&&(K=E),d=Ht.get(K),d.init(z),b.push(d),K.traverseVisible(function(B){B.isLight&&B.layers.test(z.layers)&&(d.pushLight(B),B.castShadow&&d.pushShadow(B))}),E!==K&&E.traverseVisible(function(B){B.isLight&&B.layers.test(z.layers)&&(d.pushLight(B),B.castShadow&&d.pushShadow(B))}),d.setupLights();const Q=new Set;return E.traverse(function(B){if(!(B.isMesh||B.isPoints||B.isLine||B.isSprite))return;const ut=B.material;if(ut)if(Array.isArray(ut))for(let Tt=0;Tt<ut.length;Tt++){const Dt=ut[Tt];re(Dt,K,B),Q.add(Dt)}else re(ut,K,B),Q.add(ut)}),b.pop(),d=null,Q},this.compileAsync=function(E,z,K=null){const Q=this.compile(E,z,K);return new Promise(B=>{function ut(){if(Q.forEach(function(Tt){wt.get(Tt).currentProgram.isReady()&&Q.delete(Tt)}),Q.size===0){B(E);return}setTimeout(ut,10)}Kt.get("KHR_parallel_shader_compile")!==null?ut():setTimeout(ut,10)})};let qe=null;function pn(E){qe&&qe(E)}function Dr(){$e.stop()}function hs(){$e.start()}const $e=new Fp;$e.setAnimationLoop(pn),typeof self<"u"&&$e.setContext(self),this.setAnimationLoop=function(E){qe=E,J.setAnimationLoop(E),E===null?$e.stop():$e.start()},J.addEventListener("sessionstart",Dr),J.addEventListener("sessionend",hs),this.render=function(E,z){if(z!==void 0&&z.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),z.parent===null&&z.matrixWorldAutoUpdate===!0&&z.updateMatrixWorld(),J.enabled===!0&&J.isPresenting===!0&&(J.cameraAutoUpdate===!0&&J.updateCamera(z),z=J.getCamera()),E.isScene===!0&&E.onBeforeRender(S,E,z,P),d=Ht.get(E,b.length),d.init(z),b.push(d),St.multiplyMatrices(z.projectionMatrix,z.matrixWorldInverse),q.setFromProjectionMatrix(St),yt=this.localClippingEnabled,nt=at.init(this.clippingPlanes,yt),p=_t.get(E,w.length),p.init(),w.push(p),J.enabled===!0&&J.isPresenting===!0){const ut=S.xr.getDepthSensingMesh();ut!==null&&ei(ut,z,-1/0,S.sortObjects)}ei(E,z,0,S.sortObjects),p.finish(),S.sortObjects===!0&&p.sort(V,lt),Xt=J.enabled===!1||J.isPresenting===!1||J.hasDepthSensing()===!1,Xt&&Ut.addToRenderList(p,E),this.info.render.frame++,nt===!0&&at.beginShadows();const K=d.state.shadowsArray;gt.render(K,E,z),nt===!0&&at.endShadows(),this.info.autoReset===!0&&this.info.reset();const Q=p.opaque,B=p.transmissive;if(d.setupLights(),z.isArrayCamera){const ut=z.cameras;if(B.length>0)for(let Tt=0,Dt=ut.length;Tt<Dt;Tt++){const Ot=ut[Tt];ee(Q,B,E,Ot)}Xt&&Ut.render(E);for(let Tt=0,Dt=ut.length;Tt<Dt;Tt++){const Ot=ut[Tt];Ct(p,E,Ot,Ot.viewport)}}else B.length>0&&ee(Q,B,E,z),Xt&&Ut.render(E),Ct(p,E,z);P!==null&&(T.updateMultisampleRenderTarget(P),T.updateRenderTargetMipmap(P)),E.isScene===!0&&E.onAfterRender(S,E,z),xt.resetDefaultState(),y=-1,M=null,b.pop(),b.length>0?(d=b[b.length-1],nt===!0&&at.setGlobalState(S.clippingPlanes,d.state.camera)):d=null,w.pop(),w.length>0?p=w[w.length-1]:p=null};function ei(E,z,K,Q){if(E.visible===!1)return;if(E.layers.test(z.layers)){if(E.isGroup)K=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(z);else if(E.isLight)d.pushLight(E),E.castShadow&&d.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||q.intersectsSprite(E)){Q&&Bt.setFromMatrixPosition(E.matrixWorld).applyMatrix4(St);const Tt=Y.update(E),Dt=E.material;Dt.visible&&p.push(E,Tt,Dt,K,Bt.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||q.intersectsObject(E))){const Tt=Y.update(E),Dt=E.material;if(Q&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Bt.copy(E.boundingSphere.center)):(Tt.boundingSphere===null&&Tt.computeBoundingSphere(),Bt.copy(Tt.boundingSphere.center)),Bt.applyMatrix4(E.matrixWorld).applyMatrix4(St)),Array.isArray(Dt)){const Ot=Tt.groups;for(let te=0,ne=Ot.length;te<ne;te++){const Yt=Ot[te],xe=Dt[Yt.materialIndex];xe&&xe.visible&&p.push(E,Tt,xe,K,Bt.z,Yt)}}else Dt.visible&&p.push(E,Tt,Dt,K,Bt.z,null)}}const ut=E.children;for(let Tt=0,Dt=ut.length;Tt<Dt;Tt++)ei(ut[Tt],z,K,Q)}function Ct(E,z,K,Q){const B=E.opaque,ut=E.transmissive,Tt=E.transparent;d.setupLightsView(K),nt===!0&&at.setGlobalState(S.clippingPlanes,K),Q&&ft.viewport(A.copy(Q)),B.length>0&&Se(B,z,K),ut.length>0&&Se(ut,z,K),Tt.length>0&&Se(Tt,z,K),ft.buffers.depth.setTest(!0),ft.buffers.depth.setMask(!0),ft.buffers.color.setMask(!0),ft.setPolygonOffset(!1)}function ee(E,z,K,Q){if((K.isScene===!0?K.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[Q.id]===void 0&&(d.state.transmissionRenderTarget[Q.id]=new ls(1,1,{generateMipmaps:!0,type:Kt.has("EXT_color_buffer_half_float")||Kt.has("EXT_color_buffer_float")?ao:ir,minFilter:Kr,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ye.workingColorSpace}));const ut=d.state.transmissionRenderTarget[Q.id],Tt=Q.viewport||A;ut.setSize(Tt.z,Tt.w);const Dt=S.getRenderTarget();S.setRenderTarget(ut),S.getClearColor(k),W=S.getClearAlpha(),W<1&&S.setClearColor(16777215,.5),S.clear(),Xt&&Ut.render(K);const Ot=S.toneMapping;S.toneMapping=Er;const te=Q.viewport;if(Q.viewport!==void 0&&(Q.viewport=void 0),d.setupLightsView(Q),nt===!0&&at.setGlobalState(S.clippingPlanes,Q),Se(E,K,Q),T.updateMultisampleRenderTarget(ut),T.updateRenderTargetMipmap(ut),Kt.has("WEBGL_multisampled_render_to_texture")===!1){let ne=!1;for(let Yt=0,xe=z.length;Yt<xe;Yt++){const Ee=z[Yt],Ke=Ee.object,We=Ee.geometry,Me=Ee.material,jt=Ee.group;if(Me.side===Ti&&Ke.layers.test(Q.layers)){const un=Me.side;Me.side=Un,Me.needsUpdate=!0,Ne(Ke,K,Q,We,Me,jt),Me.side=un,Me.needsUpdate=!0,ne=!0}}ne===!0&&(T.updateMultisampleRenderTarget(ut),T.updateRenderTargetMipmap(ut))}S.setRenderTarget(Dt),S.setClearColor(k,W),te!==void 0&&(Q.viewport=te),S.toneMapping=Ot}function Se(E,z,K){const Q=z.isScene===!0?z.overrideMaterial:null;for(let B=0,ut=E.length;B<ut;B++){const Tt=E[B],Dt=Tt.object,Ot=Tt.geometry,te=Q===null?Tt.material:Q,ne=Tt.group;Dt.layers.test(K.layers)&&Ne(Dt,z,K,Ot,te,ne)}}function Ne(E,z,K,Q,B,ut){E.onBeforeRender(S,z,K,Q,B,ut),E.modelViewMatrix.multiplyMatrices(K.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),B.onBeforeRender(S,z,K,Q,E,ut),B.transparent===!0&&B.side===Ti&&B.forceSinglePass===!1?(B.side=Un,B.needsUpdate=!0,S.renderBufferDirect(K,z,Q,B,E,ut),B.side=Rr,B.needsUpdate=!0,S.renderBufferDirect(K,z,Q,B,E,ut),B.side=Ti):S.renderBufferDirect(K,z,Q,B,E,ut),E.onAfterRender(S,z,K,Q,B,ut)}function Oe(E,z,K){z.isScene!==!0&&(z=se);const Q=wt.get(E),B=d.state.lights,ut=d.state.shadowsArray,Tt=B.state.version,Dt=ct.getParameters(E,B.state,ut,z,K),Ot=ct.getProgramCacheKey(Dt);let te=Q.programs;Q.environment=E.isMeshStandardMaterial?z.environment:null,Q.fog=z.fog,Q.envMap=(E.isMeshStandardMaterial?H:x).get(E.envMap||Q.environment),Q.envMapRotation=Q.environment!==null&&E.envMap===null?z.environmentRotation:E.envMapRotation,te===void 0&&(E.addEventListener("dispose",$t),te=new Map,Q.programs=te);let ne=te.get(Ot);if(ne!==void 0){if(Q.currentProgram===ne&&Q.lightsStateVersion===Tt)return Rn(E,Dt),ne}else Dt.uniforms=ct.getUniforms(E),E.onBeforeCompile(Dt,S),ne=ct.acquireProgram(Dt,Ot),te.set(Ot,ne),Q.uniforms=Dt.uniforms;const Yt=Q.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Yt.clippingPlanes=at.uniform),Rn(E,Dt),Q.needsLights=gi(E),Q.lightsStateVersion=Tt,Q.needsLights&&(Yt.ambientLightColor.value=B.state.ambient,Yt.lightProbe.value=B.state.probe,Yt.directionalLights.value=B.state.directional,Yt.directionalLightShadows.value=B.state.directionalShadow,Yt.spotLights.value=B.state.spot,Yt.spotLightShadows.value=B.state.spotShadow,Yt.rectAreaLights.value=B.state.rectArea,Yt.ltc_1.value=B.state.rectAreaLTC1,Yt.ltc_2.value=B.state.rectAreaLTC2,Yt.pointLights.value=B.state.point,Yt.pointLightShadows.value=B.state.pointShadow,Yt.hemisphereLights.value=B.state.hemi,Yt.directionalShadowMap.value=B.state.directionalShadowMap,Yt.directionalShadowMatrix.value=B.state.directionalShadowMatrix,Yt.spotShadowMap.value=B.state.spotShadowMap,Yt.spotLightMatrix.value=B.state.spotLightMatrix,Yt.spotLightMap.value=B.state.spotLightMap,Yt.pointShadowMap.value=B.state.pointShadowMap,Yt.pointShadowMatrix.value=B.state.pointShadowMatrix),Q.currentProgram=ne,Q.uniformsList=null,ne}function cn(E){if(E.uniformsList===null){const z=E.currentProgram.getUniforms();E.uniformsList=Qo.seqWithValue(z.seq,E.uniforms)}return E.uniformsList}function Rn(E,z){const K=wt.get(E);K.outputColorSpace=z.outputColorSpace,K.batching=z.batching,K.batchingColor=z.batchingColor,K.instancing=z.instancing,K.instancingColor=z.instancingColor,K.instancingMorph=z.instancingMorph,K.skinning=z.skinning,K.morphTargets=z.morphTargets,K.morphNormals=z.morphNormals,K.morphColors=z.morphColors,K.morphTargetsCount=z.morphTargetsCount,K.numClippingPlanes=z.numClippingPlanes,K.numIntersection=z.numClipIntersection,K.vertexAlphas=z.vertexAlphas,K.vertexTangents=z.vertexTangents,K.toneMapping=z.toneMapping}function Oi(E,z,K,Q,B){z.isScene!==!0&&(z=se),T.resetTextureUnits();const ut=z.fog,Tt=Q.isMeshStandardMaterial?z.environment:null,Dt=P===null?S.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:la,Ot=(Q.isMeshStandardMaterial?H:x).get(Q.envMap||Tt),te=Q.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,ne=!!K.attributes.tangent&&(!!Q.normalMap||Q.anisotropy>0),Yt=!!K.morphAttributes.position,xe=!!K.morphAttributes.normal,Ee=!!K.morphAttributes.color;let Ke=Er;Q.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(Ke=S.toneMapping);const We=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Me=We!==void 0?We.length:0,jt=wt.get(Q),un=d.state.lights;if(nt===!0&&(yt===!0||E!==M)){const Sn=E===M&&Q.id===y;at.setState(Q,E,Sn)}let be=!1;Q.version===jt.__version?(jt.needsLights&&jt.lightsStateVersion!==un.state.version||jt.outputColorSpace!==Dt||B.isBatchedMesh&&jt.batching===!1||!B.isBatchedMesh&&jt.batching===!0||B.isBatchedMesh&&jt.batchingColor===!0&&B.colorTexture===null||B.isBatchedMesh&&jt.batchingColor===!1&&B.colorTexture!==null||B.isInstancedMesh&&jt.instancing===!1||!B.isInstancedMesh&&jt.instancing===!0||B.isSkinnedMesh&&jt.skinning===!1||!B.isSkinnedMesh&&jt.skinning===!0||B.isInstancedMesh&&jt.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&jt.instancingColor===!1&&B.instanceColor!==null||B.isInstancedMesh&&jt.instancingMorph===!0&&B.morphTexture===null||B.isInstancedMesh&&jt.instancingMorph===!1&&B.morphTexture!==null||jt.envMap!==Ot||Q.fog===!0&&jt.fog!==ut||jt.numClippingPlanes!==void 0&&(jt.numClippingPlanes!==at.numPlanes||jt.numIntersection!==at.numIntersection)||jt.vertexAlphas!==te||jt.vertexTangents!==ne||jt.morphTargets!==Yt||jt.morphNormals!==xe||jt.morphColors!==Ee||jt.toneMapping!==Ke||jt.morphTargetsCount!==Me)&&(be=!0):(be=!0,jt.__version=Q.version);let ii=jt.currentProgram;be===!0&&(ii=Oe(Q,z,B));let fs=!1,Nn=!1,_a=!1;const He=ii.getUniforms(),Xn=jt.uniforms;if(ft.useProgram(ii.program)&&(fs=!0,Nn=!0,_a=!0),Q.id!==y&&(y=Q.id,Nn=!0),fs||M!==E){ft.buffers.depth.getReversed()?(ht.copy(E.projectionMatrix),Lg(ht),Ig(ht),He.setValue(N,"projectionMatrix",ht)):He.setValue(N,"projectionMatrix",E.projectionMatrix),He.setValue(N,"viewMatrix",E.matrixWorldInverse);const Cn=He.map.cameraPosition;Cn!==void 0&&Cn.setValue(N,It.setFromMatrixPosition(E.matrixWorld)),Ft.logarithmicDepthBuffer&&He.setValue(N,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(Q.isMeshPhongMaterial||Q.isMeshToonMaterial||Q.isMeshLambertMaterial||Q.isMeshBasicMaterial||Q.isMeshStandardMaterial||Q.isShaderMaterial)&&He.setValue(N,"isOrthographic",E.isOrthographicCamera===!0),M!==E&&(M=E,Nn=!0,_a=!0)}if(B.isSkinnedMesh){He.setOptional(N,B,"bindMatrix"),He.setOptional(N,B,"bindMatrixInverse");const Sn=B.skeleton;Sn&&(Sn.boneTexture===null&&Sn.computeBoneTexture(),He.setValue(N,"boneTexture",Sn.boneTexture,T))}B.isBatchedMesh&&(He.setOptional(N,B,"batchingTexture"),He.setValue(N,"batchingTexture",B._matricesTexture,T),He.setOptional(N,B,"batchingIdTexture"),He.setValue(N,"batchingIdTexture",B._indirectTexture,T),He.setOptional(N,B,"batchingColorTexture"),B._colorsTexture!==null&&He.setValue(N,"batchingColorTexture",B._colorsTexture,T));const Yn=K.morphAttributes;if((Yn.position!==void 0||Yn.normal!==void 0||Yn.color!==void 0)&&kt.update(B,K,ii),(Nn||jt.receiveShadow!==B.receiveShadow)&&(jt.receiveShadow=B.receiveShadow,He.setValue(N,"receiveShadow",B.receiveShadow)),Q.isMeshGouraudMaterial&&Q.envMap!==null&&(Xn.envMap.value=Ot,Xn.flipEnvMap.value=Ot.isCubeTexture&&Ot.isRenderTargetTexture===!1?-1:1),Q.isMeshStandardMaterial&&Q.envMap===null&&z.environment!==null&&(Xn.envMapIntensity.value=z.environmentIntensity),Nn&&(He.setValue(N,"toneMappingExposure",S.toneMappingExposure),jt.needsLights&&sr(Xn,_a),ut&&Q.fog===!0&&ot.refreshFogUniforms(Xn,ut),ot.refreshMaterialUniforms(Xn,Q,G,j,d.state.transmissionRenderTarget[E.id]),Qo.upload(N,cn(jt),Xn,T)),Q.isShaderMaterial&&Q.uniformsNeedUpdate===!0&&(Qo.upload(N,cn(jt),Xn,T),Q.uniformsNeedUpdate=!1),Q.isSpriteMaterial&&He.setValue(N,"center",B.center),He.setValue(N,"modelViewMatrix",B.modelViewMatrix),He.setValue(N,"normalMatrix",B.normalMatrix),He.setValue(N,"modelMatrix",B.matrixWorld),Q.isShaderMaterial||Q.isRawShaderMaterial){const Sn=Q.uniformsGroups;for(let Cn=0,Pl=Sn.length;Cn<Pl;Cn++){const Lr=Sn[Cn];F.update(Lr,ii),F.bind(Lr,ii)}}return ii}function sr(E,z){E.ambientLightColor.needsUpdate=z,E.lightProbe.needsUpdate=z,E.directionalLights.needsUpdate=z,E.directionalLightShadows.needsUpdate=z,E.pointLights.needsUpdate=z,E.pointLightShadows.needsUpdate=z,E.spotLights.needsUpdate=z,E.spotLightShadows.needsUpdate=z,E.rectAreaLights.needsUpdate=z,E.hemisphereLights.needsUpdate=z}function gi(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(E,z,K){wt.get(E.texture).__webglTexture=z,wt.get(E.depthTexture).__webglTexture=K;const Q=wt.get(E);Q.__hasExternalTextures=!0,Q.__autoAllocateDepthBuffer=K===void 0,Q.__autoAllocateDepthBuffer||Kt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),Q.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,z){const K=wt.get(E);K.__webglFramebuffer=z,K.__useDefaultFramebuffer=z===void 0},this.setRenderTarget=function(E,z=0,K=0){P=E,C=z,R=K;let Q=!0,B=null,ut=!1,Tt=!1;if(E){const Ot=wt.get(E);if(Ot.__useDefaultFramebuffer!==void 0)ft.bindFramebuffer(N.FRAMEBUFFER,null),Q=!1;else if(Ot.__webglFramebuffer===void 0)T.setupRenderTarget(E);else if(Ot.__hasExternalTextures)T.rebindTextures(E,wt.get(E.texture).__webglTexture,wt.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Yt=E.depthTexture;if(Ot.__boundDepthTexture!==Yt){if(Yt!==null&&wt.has(Yt)&&(E.width!==Yt.image.width||E.height!==Yt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");T.setupDepthRenderbuffer(E)}}const te=E.texture;(te.isData3DTexture||te.isDataArrayTexture||te.isCompressedArrayTexture)&&(Tt=!0);const ne=wt.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(ne[z])?B=ne[z][K]:B=ne[z],ut=!0):E.samples>0&&T.useMultisampledRTT(E)===!1?B=wt.get(E).__webglMultisampledFramebuffer:Array.isArray(ne)?B=ne[K]:B=ne,A.copy(E.viewport),O.copy(E.scissor),U=E.scissorTest}else A.copy(vt).multiplyScalar(G).floor(),O.copy(Lt).multiplyScalar(G).floor(),U=Vt;if(ft.bindFramebuffer(N.FRAMEBUFFER,B)&&Q&&ft.drawBuffers(E,B),ft.viewport(A),ft.scissor(O),ft.setScissorTest(U),ut){const Ot=wt.get(E.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+z,Ot.__webglTexture,K)}else if(Tt){const Ot=wt.get(E.texture),te=z||0;N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,Ot.__webglTexture,K||0,te)}y=-1},this.readRenderTargetPixels=function(E,z,K,Q,B,ut,Tt){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Dt=wt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Tt!==void 0&&(Dt=Dt[Tt]),Dt){ft.bindFramebuffer(N.FRAMEBUFFER,Dt);try{const Ot=E.texture,te=Ot.format,ne=Ot.type;if(!Ft.textureFormatReadable(te)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ft.textureTypeReadable(ne)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}z>=0&&z<=E.width-Q&&K>=0&&K<=E.height-B&&N.readPixels(z,K,Q,B,pt.convert(te),pt.convert(ne),ut)}finally{const Ot=P!==null?wt.get(P).__webglFramebuffer:null;ft.bindFramebuffer(N.FRAMEBUFFER,Ot)}}},this.readRenderTargetPixelsAsync=async function(E,z,K,Q,B,ut,Tt){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Dt=wt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Tt!==void 0&&(Dt=Dt[Tt]),Dt){const Ot=E.texture,te=Ot.format,ne=Ot.type;if(!Ft.textureFormatReadable(te))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ft.textureTypeReadable(ne))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(z>=0&&z<=E.width-Q&&K>=0&&K<=E.height-B){ft.bindFramebuffer(N.FRAMEBUFFER,Dt);const Yt=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,Yt),N.bufferData(N.PIXEL_PACK_BUFFER,ut.byteLength,N.STREAM_READ),N.readPixels(z,K,Q,B,pt.convert(te),pt.convert(ne),0);const xe=P!==null?wt.get(P).__webglFramebuffer:null;ft.bindFramebuffer(N.FRAMEBUFFER,xe);const Ee=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await Dg(N,Ee,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,Yt),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,ut),N.deleteBuffer(Yt),N.deleteSync(Ee),ut}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,z=null,K=0){E.isTexture!==!0&&(Us("WebGLRenderer: copyFramebufferToTexture function signature has changed."),z=arguments[0]||null,E=arguments[1]);const Q=Math.pow(2,-K),B=Math.floor(E.image.width*Q),ut=Math.floor(E.image.height*Q),Tt=z!==null?z.x:0,Dt=z!==null?z.y:0;T.setTexture2D(E,0),N.copyTexSubImage2D(N.TEXTURE_2D,K,0,0,Tt,Dt,B,ut),ft.unbindTexture()};const ni=N.createFramebuffer(),ds=N.createFramebuffer();this.copyTextureToTexture=function(E,z,K=null,Q=null,B=0,ut=null){E.isTexture!==!0&&(Us("WebGLRenderer: copyTextureToTexture function signature has changed."),Q=arguments[0]||null,E=arguments[1],z=arguments[2],ut=arguments[3]||0,K=null),ut===null&&(B!==0?(Us("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ut=B,B=0):ut=0);let Tt,Dt,Ot,te,ne,Yt,xe,Ee,Ke;const We=E.isCompressedTexture?E.mipmaps[ut]:E.image;if(K!==null)Tt=K.max.x-K.min.x,Dt=K.max.y-K.min.y,Ot=K.isBox3?K.max.z-K.min.z:1,te=K.min.x,ne=K.min.y,Yt=K.isBox3?K.min.z:0;else{const Yn=Math.pow(2,-B);Tt=Math.floor(We.width*Yn),Dt=Math.floor(We.height*Yn),E.isDataArrayTexture?Ot=We.depth:E.isData3DTexture?Ot=Math.floor(We.depth*Yn):Ot=1,te=0,ne=0,Yt=0}Q!==null?(xe=Q.x,Ee=Q.y,Ke=Q.z):(xe=0,Ee=0,Ke=0);const Me=pt.convert(z.format),jt=pt.convert(z.type);let un;z.isData3DTexture?(T.setTexture3D(z,0),un=N.TEXTURE_3D):z.isDataArrayTexture||z.isCompressedArrayTexture?(T.setTexture2DArray(z,0),un=N.TEXTURE_2D_ARRAY):(T.setTexture2D(z,0),un=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,z.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,z.unpackAlignment);const be=N.getParameter(N.UNPACK_ROW_LENGTH),ii=N.getParameter(N.UNPACK_IMAGE_HEIGHT),fs=N.getParameter(N.UNPACK_SKIP_PIXELS),Nn=N.getParameter(N.UNPACK_SKIP_ROWS),_a=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,We.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,We.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,te),N.pixelStorei(N.UNPACK_SKIP_ROWS,ne),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Yt);const He=E.isDataArrayTexture||E.isData3DTexture,Xn=z.isDataArrayTexture||z.isData3DTexture;if(E.isDepthTexture){const Yn=wt.get(E),Sn=wt.get(z),Cn=wt.get(Yn.__renderTarget),Pl=wt.get(Sn.__renderTarget);ft.bindFramebuffer(N.READ_FRAMEBUFFER,Cn.__webglFramebuffer),ft.bindFramebuffer(N.DRAW_FRAMEBUFFER,Pl.__webglFramebuffer);for(let Lr=0;Lr<Ot;Lr++)He&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,wt.get(E).__webglTexture,B,Yt+Lr),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,wt.get(z).__webglTexture,ut,Ke+Lr)),N.blitFramebuffer(te,ne,Tt,Dt,xe,Ee,Tt,Dt,N.DEPTH_BUFFER_BIT,N.NEAREST);ft.bindFramebuffer(N.READ_FRAMEBUFFER,null),ft.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(B!==0||E.isRenderTargetTexture||wt.has(E)){const Yn=wt.get(E),Sn=wt.get(z);ft.bindFramebuffer(N.READ_FRAMEBUFFER,ni),ft.bindFramebuffer(N.DRAW_FRAMEBUFFER,ds);for(let Cn=0;Cn<Ot;Cn++)He?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Yn.__webglTexture,B,Yt+Cn):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Yn.__webglTexture,B),Xn?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Sn.__webglTexture,ut,Ke+Cn):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Sn.__webglTexture,ut),B!==0?N.blitFramebuffer(te,ne,Tt,Dt,xe,Ee,Tt,Dt,N.COLOR_BUFFER_BIT,N.NEAREST):Xn?N.copyTexSubImage3D(un,ut,xe,Ee,Ke+Cn,te,ne,Tt,Dt):N.copyTexSubImage2D(un,ut,xe,Ee,te,ne,Tt,Dt);ft.bindFramebuffer(N.READ_FRAMEBUFFER,null),ft.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else Xn?E.isDataTexture||E.isData3DTexture?N.texSubImage3D(un,ut,xe,Ee,Ke,Tt,Dt,Ot,Me,jt,We.data):z.isCompressedArrayTexture?N.compressedTexSubImage3D(un,ut,xe,Ee,Ke,Tt,Dt,Ot,Me,We.data):N.texSubImage3D(un,ut,xe,Ee,Ke,Tt,Dt,Ot,Me,jt,We):E.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,ut,xe,Ee,Tt,Dt,Me,jt,We.data):E.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,ut,xe,Ee,We.width,We.height,Me,We.data):N.texSubImage2D(N.TEXTURE_2D,ut,xe,Ee,Tt,Dt,Me,jt,We);N.pixelStorei(N.UNPACK_ROW_LENGTH,be),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ii),N.pixelStorei(N.UNPACK_SKIP_PIXELS,fs),N.pixelStorei(N.UNPACK_SKIP_ROWS,Nn),N.pixelStorei(N.UNPACK_SKIP_IMAGES,_a),ut===0&&z.generateMipmaps&&N.generateMipmap(un),ft.unbindTexture()},this.copyTextureToTexture3D=function(E,z,K=null,Q=null,B=0){return E.isTexture!==!0&&(Us("WebGLRenderer: copyTextureToTexture3D function signature has changed."),K=arguments[0]||null,Q=arguments[1]||null,E=arguments[2],z=arguments[3],B=arguments[4]||0),Us('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(E,z,K,Q,B)},this.initRenderTarget=function(E){wt.get(E).__webglFramebuffer===void 0&&T.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?T.setTextureCube(E,0):E.isData3DTexture?T.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?T.setTexture2DArray(E,0):T.setTexture2D(E,0),ft.unbindTexture()},this.resetState=function(){C=0,R=0,P=null,ft.reset(),xt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Qi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=ye._getDrawingBufferColorSpace(t),e.unpackColorSpace=ye._getUnpackColorSpace()}}const Fd={type:"change"},ch={type:"start"},Hp={type:"end"},ko=new Tl,Od=new mr,JS=Math.cos(70*Cg.DEG2RAD),Je=new I,Pn=2*Math.PI,Ce={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Sc=1e-6;class tE extends Np{constructor(t,e=null){super(t,e),this.state=Ce.NONE,this.enabled=!0,this.target=new I,this.cursor=new I,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Hs.ROTATE,MIDDLE:Hs.DOLLY,RIGHT:Hs.PAN},this.touches={ONE:Ns.ROTATE,TWO:Ns.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new I,this._lastQuaternion=new hn,this._lastTargetPosition=new I,this._quat=new hn().setFromUnitVectors(t.up,new I(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new ud,this._sphericalDelta=new ud,this._scale=1,this._panOffset=new I,this._rotateStart=new Wt,this._rotateEnd=new Wt,this._rotateDelta=new Wt,this._panStart=new Wt,this._panEnd=new Wt,this._panDelta=new Wt,this._dollyStart=new Wt,this._dollyEnd=new Wt,this._dollyDelta=new Wt,this._dollyDirection=new I,this._mouse=new Wt,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=nE.bind(this),this._onPointerDown=eE.bind(this),this._onPointerUp=iE.bind(this),this._onContextMenu=uE.bind(this),this._onMouseWheel=aE.bind(this),this._onKeyDown=oE.bind(this),this._onTouchStart=lE.bind(this),this._onTouchMove=cE.bind(this),this._onMouseDown=rE.bind(this),this._onMouseMove=sE.bind(this),this._interceptControlDown=hE.bind(this),this._interceptControlUp=dE.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Fd),this.update(),this.state=Ce.NONE}update(t=null){const e=this.object.position;Je.copy(e).sub(this.target),Je.applyQuaternion(this._quat),this._spherical.setFromVector3(Je),this.autoRotate&&this.state===Ce.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(i)&&isFinite(r)&&(i<-Math.PI?i+=Pn:i>Math.PI&&(i-=Pn),r<-Math.PI?r+=Pn:r>Math.PI&&(r-=Pn),i<=r?this._spherical.theta=Math.max(i,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+r)/2?Math.max(i,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let s=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),s=a!=this._spherical.radius}if(Je.setFromSpherical(this._spherical),Je.applyQuaternion(this._quatInverse),e.copy(this.target).add(Je),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){const o=Je.length();a=this._clampDistance(o*this._scale);const l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),s=!!l}else if(this.object.isOrthographicCamera){const o=new I(this._mouse.x,this._mouse.y,0);o.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),s=l!==this.object.zoom;const c=new I(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=Je.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(ko.origin.copy(this.object.position),ko.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(ko.direction))<JS?this.object.lookAt(this.target):(Od.setFromNormalAndCoplanarPoint(this.object.up,this.target),ko.intersectPlane(Od,this.target))))}else if(this.object.isOrthographicCamera){const a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),s=!0)}return this._scale=1,this._performCursorZoom=!1,s||this._lastPosition.distanceToSquared(this.object.position)>Sc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Sc||this._lastTargetPosition.distanceToSquared(this.target)>Sc?(this.dispatchEvent(Fd),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?Pn/60*this.autoRotateSpeed*t:Pn/60/60*this.autoRotateSpeed}_getZoomScale(t){const e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){Je.setFromMatrixColumn(e,0),Je.multiplyScalar(-t),this._panOffset.add(Je)}_panUp(t,e){this.screenSpacePanning===!0?Je.setFromMatrixColumn(e,1):(Je.setFromMatrixColumn(e,0),Je.crossVectors(this.object.up,Je)),Je.multiplyScalar(t),this._panOffset.add(Je)}_pan(t,e){const i=this.domElement;if(this.object.isPerspectiveCamera){const r=this.object.position;Je.copy(r).sub(this.target);let s=Je.length();s*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*s/i.clientHeight,this.object.matrix),this._panUp(2*e*s/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),r=t-i.left,s=e-i.top,a=i.width,o=i.height;this._mouse.x=r/a*2-1,this._mouse.y=-(s/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(Pn*this._rotateDelta.x/e.clientHeight),this._rotateUp(Pn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(Pn*this.rotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-Pn*this.rotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(Pn*this.rotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-Pn*this.rotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),r=.5*(t.pageY+e.y);this._rotateStart.set(i,r)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),r=.5*(t.pageY+e.y);this._panStart.set(i,r)}}_handleTouchStartDolly(t){const e=this._getSecondPointerPosition(t),i=t.pageX-e.x,r=t.pageY-e.y,s=Math.sqrt(i*i+r*r);this._dollyStart.set(0,s)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{const i=this._getSecondPointerPosition(t),r=.5*(t.pageX+i.x),s=.5*(t.pageY+i.y);this._rotateEnd.set(r,s)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(Pn*this._rotateDelta.x/e.clientHeight),this._rotateUp(Pn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),r=.5*(t.pageY+e.y);this._panEnd.set(i,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){const e=this._getSecondPointerPosition(t),i=t.pageX-e.x,r=t.pageY-e.y,s=Math.sqrt(i*i+r*r);this._dollyEnd.set(0,s),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const a=(t.pageX+e.x)*.5,o=(t.pageY+e.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new Wt,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){const e=t.deltaMode,i={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function eE(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n)))}function nE(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function iE(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Hp),this.state=Ce.NONE;break;case 1:const t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function rE(n){let t;switch(n.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Hs.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=Ce.DOLLY;break;case Hs.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=Ce.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=Ce.ROTATE}break;case Hs.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=Ce.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=Ce.PAN}break;default:this.state=Ce.NONE}this.state!==Ce.NONE&&this.dispatchEvent(ch)}function sE(n){switch(this.state){case Ce.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case Ce.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case Ce.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function aE(n){this.enabled===!1||this.enableZoom===!1||this.state!==Ce.NONE||(n.preventDefault(),this.dispatchEvent(ch),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(Hp))}function oE(n){this.enabled!==!1&&this._handleKeyDown(n)}function lE(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case Ns.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=Ce.TOUCH_ROTATE;break;case Ns.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=Ce.TOUCH_PAN;break;default:this.state=Ce.NONE}break;case 2:switch(this.touches.TWO){case Ns.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=Ce.TOUCH_DOLLY_PAN;break;case Ns.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=Ce.TOUCH_DOLLY_ROTATE;break;default:this.state=Ce.NONE}break;default:this.state=Ce.NONE}this.state!==Ce.NONE&&this.dispatchEvent(ch)}function cE(n){switch(this._trackPointer(n),this.state){case Ce.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case Ce.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case Ce.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case Ce.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=Ce.NONE}}function uE(n){this.enabled!==!1&&n.preventDefault()}function hE(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function dE(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const zr=new Up,xn=new I,fr=new I,Ve=new hn,Bd={X:new I(1,0,0),Y:new I(0,1,0),Z:new I(0,0,1)},Ec={type:"change"},zd={type:"mouseDown",mode:null},kd={type:"mouseUp",mode:null},Hd={type:"objectChange"};class fE extends Np{constructor(t,e=null){super(void 0,e);const i=new xE(this);this._root=i;const r=new ME;this._gizmo=r,i.add(r);const s=new yE;this._plane=s,i.add(s);const a=this;function o(b,S){let D=S;Object.defineProperty(a,b,{get:function(){return D!==void 0?D:S},set:function(C){D!==C&&(D=C,s[b]=C,r[b]=C,a.dispatchEvent({type:b+"-changed",value:C}),a.dispatchEvent(Ec))}}),a[b]=S,s[b]=S,r[b]=S}o("camera",t),o("object",void 0),o("enabled",!0),o("axis",null),o("mode","translate"),o("translationSnap",null),o("rotationSnap",null),o("scaleSnap",null),o("space","world"),o("size",1),o("dragging",!1),o("showX",!0),o("showY",!0),o("showZ",!0),o("minX",-1/0),o("maxX",1/0),o("minY",-1/0),o("maxY",1/0),o("minZ",-1/0),o("maxZ",1/0);const l=new I,c=new I,u=new hn,h=new hn,f=new I,m=new hn,_=new I,v=new I,p=new I,d=0,w=new I;o("worldPosition",l),o("worldPositionStart",c),o("worldQuaternion",u),o("worldQuaternionStart",h),o("cameraPosition",f),o("cameraQuaternion",m),o("pointStart",_),o("pointEnd",v),o("rotationAxis",p),o("rotationAngle",d),o("eye",w),this._offset=new I,this._startNorm=new I,this._endNorm=new I,this._cameraScale=new I,this._parentPosition=new I,this._parentQuaternion=new hn,this._parentQuaternionInv=new hn,this._parentScale=new I,this._worldScaleStart=new I,this._worldQuaternionInv=new hn,this._worldScale=new I,this._positionStart=new I,this._quaternionStart=new hn,this._scaleStart=new I,this._getPointer=pE.bind(this),this._onPointerDown=_E.bind(this),this._onPointerHover=mE.bind(this),this._onPointerMove=vE.bind(this),this._onPointerUp=gE.bind(this),e!==null&&this.connect()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointermove",this._onPointerHover),this.domElement.addEventListener("pointerup",this._onPointerUp),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerHover),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.style.touchAction="auto"}getHelper(){return this._root}pointerHover(t){if(this.object===void 0||this.dragging===!0)return;t!==null&&zr.setFromCamera(t,this.camera);const e=bc(this._gizmo.picker[this.mode],zr);e?this.axis=e.object.name:this.axis=null}pointerDown(t){if(!(this.object===void 0||this.dragging===!0||t!=null&&t.button!==0)&&this.axis!==null){t!==null&&zr.setFromCamera(t,this.camera);const e=bc(this._plane,zr,!0);e&&(this.object.updateMatrixWorld(),this.object.parent.updateMatrixWorld(),this._positionStart.copy(this.object.position),this._quaternionStart.copy(this.object.quaternion),this._scaleStart.copy(this.object.scale),this.object.matrixWorld.decompose(this.worldPositionStart,this.worldQuaternionStart,this._worldScaleStart),this.pointStart.copy(e.point).sub(this.worldPositionStart)),this.dragging=!0,zd.mode=this.mode,this.dispatchEvent(zd)}}pointerMove(t){const e=this.axis,i=this.mode,r=this.object;let s=this.space;if(i==="scale"?s="local":(e==="E"||e==="XYZE"||e==="XYZ")&&(s="world"),r===void 0||e===null||this.dragging===!1||t!==null&&t.button!==-1)return;t!==null&&zr.setFromCamera(t,this.camera);const a=bc(this._plane,zr,!0);if(a){if(this.pointEnd.copy(a.point).sub(this.worldPositionStart),i==="translate")this._offset.copy(this.pointEnd).sub(this.pointStart),s==="local"&&e!=="XYZ"&&this._offset.applyQuaternion(this._worldQuaternionInv),e.indexOf("X")===-1&&(this._offset.x=0),e.indexOf("Y")===-1&&(this._offset.y=0),e.indexOf("Z")===-1&&(this._offset.z=0),s==="local"&&e!=="XYZ"?this._offset.applyQuaternion(this._quaternionStart).divide(this._parentScale):this._offset.applyQuaternion(this._parentQuaternionInv).divide(this._parentScale),r.position.copy(this._offset).add(this._positionStart),this.translationSnap&&(s==="local"&&(r.position.applyQuaternion(Ve.copy(this._quaternionStart).invert()),e.search("X")!==-1&&(r.position.x=Math.round(r.position.x/this.translationSnap)*this.translationSnap),e.search("Y")!==-1&&(r.position.y=Math.round(r.position.y/this.translationSnap)*this.translationSnap),e.search("Z")!==-1&&(r.position.z=Math.round(r.position.z/this.translationSnap)*this.translationSnap),r.position.applyQuaternion(this._quaternionStart)),s==="world"&&(r.parent&&r.position.add(xn.setFromMatrixPosition(r.parent.matrixWorld)),e.search("X")!==-1&&(r.position.x=Math.round(r.position.x/this.translationSnap)*this.translationSnap),e.search("Y")!==-1&&(r.position.y=Math.round(r.position.y/this.translationSnap)*this.translationSnap),e.search("Z")!==-1&&(r.position.z=Math.round(r.position.z/this.translationSnap)*this.translationSnap),r.parent&&r.position.sub(xn.setFromMatrixPosition(r.parent.matrixWorld)))),r.position.x=Math.max(this.minX,Math.min(this.maxX,r.position.x)),r.position.y=Math.max(this.minY,Math.min(this.maxY,r.position.y)),r.position.z=Math.max(this.minZ,Math.min(this.maxZ,r.position.z));else if(i==="scale"){if(e.search("XYZ")!==-1){let o=this.pointEnd.length()/this.pointStart.length();this.pointEnd.dot(this.pointStart)<0&&(o*=-1),fr.set(o,o,o)}else xn.copy(this.pointStart),fr.copy(this.pointEnd),xn.applyQuaternion(this._worldQuaternionInv),fr.applyQuaternion(this._worldQuaternionInv),fr.divide(xn),e.search("X")===-1&&(fr.x=1),e.search("Y")===-1&&(fr.y=1),e.search("Z")===-1&&(fr.z=1);r.scale.copy(this._scaleStart).multiply(fr),this.scaleSnap&&(e.search("X")!==-1&&(r.scale.x=Math.round(r.scale.x/this.scaleSnap)*this.scaleSnap||this.scaleSnap),e.search("Y")!==-1&&(r.scale.y=Math.round(r.scale.y/this.scaleSnap)*this.scaleSnap||this.scaleSnap),e.search("Z")!==-1&&(r.scale.z=Math.round(r.scale.z/this.scaleSnap)*this.scaleSnap||this.scaleSnap))}else if(i==="rotate"){this._offset.copy(this.pointEnd).sub(this.pointStart);const o=20/this.worldPosition.distanceTo(xn.setFromMatrixPosition(this.camera.matrixWorld));let l=!1;e==="XYZE"?(this.rotationAxis.copy(this._offset).cross(this.eye).normalize(),this.rotationAngle=this._offset.dot(xn.copy(this.rotationAxis).cross(this.eye))*o):(e==="X"||e==="Y"||e==="Z")&&(this.rotationAxis.copy(Bd[e]),xn.copy(Bd[e]),s==="local"&&xn.applyQuaternion(this.worldQuaternion),xn.cross(this.eye),xn.length()===0?l=!0:this.rotationAngle=this._offset.dot(xn.normalize())*o),(e==="E"||l)&&(this.rotationAxis.copy(this.eye),this.rotationAngle=this.pointEnd.angleTo(this.pointStart),this._startNorm.copy(this.pointStart).normalize(),this._endNorm.copy(this.pointEnd).normalize(),this.rotationAngle*=this._endNorm.cross(this._startNorm).dot(this.eye)<0?1:-1),this.rotationSnap&&(this.rotationAngle=Math.round(this.rotationAngle/this.rotationSnap)*this.rotationSnap),s==="local"&&e!=="E"&&e!=="XYZE"?(r.quaternion.copy(this._quaternionStart),r.quaternion.multiply(Ve.setFromAxisAngle(this.rotationAxis,this.rotationAngle)).normalize()):(this.rotationAxis.applyQuaternion(this._parentQuaternionInv),r.quaternion.copy(Ve.setFromAxisAngle(this.rotationAxis,this.rotationAngle)),r.quaternion.multiply(this._quaternionStart).normalize())}this.dispatchEvent(Ec),this.dispatchEvent(Hd)}}pointerUp(t){t!==null&&t.button!==0||(this.dragging&&this.axis!==null&&(kd.mode=this.mode,this.dispatchEvent(kd)),this.dragging=!1,this.axis=null)}dispose(){this.disconnect(),this._root.dispose()}attach(t){return this.object=t,this._root.visible=!0,this}detach(){return this.object=void 0,this.axis=null,this._root.visible=!1,this}reset(){this.enabled&&this.dragging&&(this.object.position.copy(this._positionStart),this.object.quaternion.copy(this._quaternionStart),this.object.scale.copy(this._scaleStart),this.dispatchEvent(Ec),this.dispatchEvent(Hd),this.pointStart.copy(this.pointEnd))}getRaycaster(){return zr}getMode(){return this.mode}setMode(t){this.mode=t}setTranslationSnap(t){this.translationSnap=t}setRotationSnap(t){this.rotationSnap=t}setScaleSnap(t){this.scaleSnap=t}setSize(t){this.size=t}setSpace(t){this.space=t}}function pE(n){if(this.domElement.ownerDocument.pointerLockElement)return{x:0,y:0,button:n.button};{const t=this.domElement.getBoundingClientRect();return{x:(n.clientX-t.left)/t.width*2-1,y:-(n.clientY-t.top)/t.height*2+1,button:n.button}}}function mE(n){if(this.enabled)switch(n.pointerType){case"mouse":case"pen":this.pointerHover(this._getPointer(n));break}}function _E(n){this.enabled&&(document.pointerLockElement||this.domElement.setPointerCapture(n.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.pointerHover(this._getPointer(n)),this.pointerDown(this._getPointer(n)))}function vE(n){this.enabled&&this.pointerMove(this._getPointer(n))}function gE(n){this.enabled&&(this.domElement.releasePointerCapture(n.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.pointerUp(this._getPointer(n)))}function bc(n,t,e){const i=t.intersectObject(n,!0);for(let r=0;r<i.length;r++)if(i[r].object.visible||e)return i[r];return!1}const Ho=new _i,De=new I(0,1,0),Vd=new I(0,0,0),Gd=new Ue,Vo=new hn,Jo=new hn,xi=new I,Wd=new Ue,Oa=new I(1,0,0),Vr=new I(0,1,0),Ba=new I(0,0,1),Go=new I,Ra=new I,Ca=new I;class xE extends Ze{constructor(t){super(),this.isTransformControlsRoot=!0,this.controls=t,this.visible=!1}updateMatrixWorld(t){const e=this.controls;e.object!==void 0&&(e.object.updateMatrixWorld(),e.object.parent===null?console.error("TransformControls: The attached 3D object must be a part of the scene graph."):e.object.parent.matrixWorld.decompose(e._parentPosition,e._parentQuaternion,e._parentScale),e.object.matrixWorld.decompose(e.worldPosition,e.worldQuaternion,e._worldScale),e._parentQuaternionInv.copy(e._parentQuaternion).invert(),e._worldQuaternionInv.copy(e.worldQuaternion).invert()),e.camera.updateMatrixWorld(),e.camera.matrixWorld.decompose(e.cameraPosition,e.cameraQuaternion,e._cameraScale),e.camera.isOrthographicCamera?e.camera.getWorldDirection(e.eye).negate():e.eye.copy(e.cameraPosition).sub(e.worldPosition).normalize(),super.updateMatrixWorld(t)}dispose(){this.traverse(function(t){t.geometry&&t.geometry.dispose(),t.material&&t.material.dispose()})}}class ME extends Ze{constructor(){super(),this.isTransformControlsGizmo=!0,this.type="TransformControlsGizmo";const t=new Al({depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1,transparent:!0}),e=new Rl({depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1,transparent:!0}),i=t.clone();i.opacity=.15;const r=e.clone();r.opacity=.5;const s=t.clone();s.color.setHex(16711680);const a=t.clone();a.color.setHex(65280);const o=t.clone();o.color.setHex(255);const l=t.clone();l.color.setHex(16711680),l.opacity=.5;const c=t.clone();c.color.setHex(65280),c.opacity=.5;const u=t.clone();u.color.setHex(255),u.opacity=.5;const h=t.clone();h.opacity=.25;const f=t.clone();f.color.setHex(16776960),f.opacity=.25,t.clone().color.setHex(16776960);const _=t.clone();_.color.setHex(7895160);const v=new tn(0,.04,.1,12);v.translate(0,.05,0);const p=new Xe(.08,.08,.08);p.translate(0,.04,0);const d=new fn;d.setAttribute("position",new Fe([0,0,0,1,0,0],3));const w=new tn(.0075,.0075,.5,3);w.translate(0,.25,0);function b(W,X){const j=new Xr(W,.0075,3,64,X*Math.PI*2);return j.rotateY(Math.PI/2),j.rotateX(Math.PI/2),j}function S(){const W=new fn;return W.setAttribute("position",new Fe([0,0,0,1,1,1],3)),W}const D={X:[[new Pt(v,s),[.5,0,0],[0,0,-Math.PI/2]],[new Pt(v,s),[-.5,0,0],[0,0,Math.PI/2]],[new Pt(w,s),[0,0,0],[0,0,-Math.PI/2]]],Y:[[new Pt(v,a),[0,.5,0]],[new Pt(v,a),[0,-.5,0],[Math.PI,0,0]],[new Pt(w,a)]],Z:[[new Pt(v,o),[0,0,.5],[Math.PI/2,0,0]],[new Pt(v,o),[0,0,-.5],[-Math.PI/2,0,0]],[new Pt(w,o),null,[Math.PI/2,0,0]]],XYZ:[[new Pt(new Os(.1,0),h.clone()),[0,0,0]]],XY:[[new Pt(new Xe(.15,.15,.01),u.clone()),[.15,.15,0]]],YZ:[[new Pt(new Xe(.15,.15,.01),l.clone()),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new Pt(new Xe(.15,.15,.01),c.clone()),[.15,0,.15],[-Math.PI/2,0,0]]]},C={X:[[new Pt(new tn(.2,0,.6,4),i),[.3,0,0],[0,0,-Math.PI/2]],[new Pt(new tn(.2,0,.6,4),i),[-.3,0,0],[0,0,Math.PI/2]]],Y:[[new Pt(new tn(.2,0,.6,4),i),[0,.3,0]],[new Pt(new tn(.2,0,.6,4),i),[0,-.3,0],[0,0,Math.PI]]],Z:[[new Pt(new tn(.2,0,.6,4),i),[0,0,.3],[Math.PI/2,0,0]],[new Pt(new tn(.2,0,.6,4),i),[0,0,-.3],[-Math.PI/2,0,0]]],XYZ:[[new Pt(new Os(.2,0),i)]],XY:[[new Pt(new Xe(.2,.2,.01),i),[.15,.15,0]]],YZ:[[new Pt(new Xe(.2,.2,.01),i),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new Pt(new Xe(.2,.2,.01),i),[.15,0,.15],[-Math.PI/2,0,0]]]},R={START:[[new Pt(new Os(.01,2),r),null,null,null,"helper"]],END:[[new Pt(new Os(.01,2),r),null,null,null,"helper"]],DELTA:[[new Xi(S(),r),null,null,null,"helper"]],X:[[new Xi(d,r.clone()),[-1e3,0,0],null,[1e6,1,1],"helper"]],Y:[[new Xi(d,r.clone()),[0,-1e3,0],[0,0,Math.PI/2],[1e6,1,1],"helper"]],Z:[[new Xi(d,r.clone()),[0,0,-1e3],[0,-Math.PI/2,0],[1e6,1,1],"helper"]]},P={XYZE:[[new Pt(b(.5,1),_),null,[0,Math.PI/2,0]]],X:[[new Pt(b(.5,.5),s)]],Y:[[new Pt(b(.5,.5),a),null,[0,0,-Math.PI/2]]],Z:[[new Pt(b(.5,.5),o),null,[0,Math.PI/2,0]]],E:[[new Pt(b(.75,1),f),null,[0,Math.PI/2,0]]]},y={AXIS:[[new Xi(d,r.clone()),[-1e3,0,0],null,[1e6,1,1],"helper"]]},M={XYZE:[[new Pt(new oh(.25,10,8),i)]],X:[[new Pt(new Xr(.5,.1,4,24),i),[0,0,0],[0,-Math.PI/2,-Math.PI/2]]],Y:[[new Pt(new Xr(.5,.1,4,24),i),[0,0,0],[Math.PI/2,0,0]]],Z:[[new Pt(new Xr(.5,.1,4,24),i),[0,0,0],[0,0,-Math.PI/2]]],E:[[new Pt(new Xr(.75,.1,2,24),i)]]},A={X:[[new Pt(p,s),[.5,0,0],[0,0,-Math.PI/2]],[new Pt(w,s),[0,0,0],[0,0,-Math.PI/2]],[new Pt(p,s),[-.5,0,0],[0,0,Math.PI/2]]],Y:[[new Pt(p,a),[0,.5,0]],[new Pt(w,a)],[new Pt(p,a),[0,-.5,0],[0,0,Math.PI]]],Z:[[new Pt(p,o),[0,0,.5],[Math.PI/2,0,0]],[new Pt(w,o),[0,0,0],[Math.PI/2,0,0]],[new Pt(p,o),[0,0,-.5],[-Math.PI/2,0,0]]],XY:[[new Pt(new Xe(.15,.15,.01),u),[.15,.15,0]]],YZ:[[new Pt(new Xe(.15,.15,.01),l),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new Pt(new Xe(.15,.15,.01),c),[.15,0,.15],[-Math.PI/2,0,0]]],XYZ:[[new Pt(new Xe(.1,.1,.1),h.clone())]]},O={X:[[new Pt(new tn(.2,0,.6,4),i),[.3,0,0],[0,0,-Math.PI/2]],[new Pt(new tn(.2,0,.6,4),i),[-.3,0,0],[0,0,Math.PI/2]]],Y:[[new Pt(new tn(.2,0,.6,4),i),[0,.3,0]],[new Pt(new tn(.2,0,.6,4),i),[0,-.3,0],[0,0,Math.PI]]],Z:[[new Pt(new tn(.2,0,.6,4),i),[0,0,.3],[Math.PI/2,0,0]],[new Pt(new tn(.2,0,.6,4),i),[0,0,-.3],[-Math.PI/2,0,0]]],XY:[[new Pt(new Xe(.2,.2,.01),i),[.15,.15,0]]],YZ:[[new Pt(new Xe(.2,.2,.01),i),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new Pt(new Xe(.2,.2,.01),i),[.15,0,.15],[-Math.PI/2,0,0]]],XYZ:[[new Pt(new Xe(.2,.2,.2),i),[0,0,0]]]},U={X:[[new Xi(d,r.clone()),[-1e3,0,0],null,[1e6,1,1],"helper"]],Y:[[new Xi(d,r.clone()),[0,-1e3,0],[0,0,Math.PI/2],[1e6,1,1],"helper"]],Z:[[new Xi(d,r.clone()),[0,0,-1e3],[0,-Math.PI/2,0],[1e6,1,1],"helper"]]};function k(W){const X=new Ze;for(const j in W)for(let G=W[j].length;G--;){const V=W[j][G][0].clone(),lt=W[j][G][1],vt=W[j][G][2],Lt=W[j][G][3],Vt=W[j][G][4];V.name=j,V.tag=Vt,lt&&V.position.set(lt[0],lt[1],lt[2]),vt&&V.rotation.set(vt[0],vt[1],vt[2]),Lt&&V.scale.set(Lt[0],Lt[1],Lt[2]),V.updateMatrix();const q=V.geometry.clone();q.applyMatrix4(V.matrix),V.geometry=q,V.renderOrder=1/0,V.position.set(0,0,0),V.rotation.set(0,0,0),V.scale.set(1,1,1),X.add(V)}return X}this.gizmo={},this.picker={},this.helper={},this.add(this.gizmo.translate=k(D)),this.add(this.gizmo.rotate=k(P)),this.add(this.gizmo.scale=k(A)),this.add(this.picker.translate=k(C)),this.add(this.picker.rotate=k(M)),this.add(this.picker.scale=k(O)),this.add(this.helper.translate=k(R)),this.add(this.helper.rotate=k(y)),this.add(this.helper.scale=k(U)),this.picker.translate.visible=!1,this.picker.rotate.visible=!1,this.picker.scale.visible=!1}updateMatrixWorld(t){const i=(this.mode==="scale"?"local":this.space)==="local"?this.worldQuaternion:Jo;this.gizmo.translate.visible=this.mode==="translate",this.gizmo.rotate.visible=this.mode==="rotate",this.gizmo.scale.visible=this.mode==="scale",this.helper.translate.visible=this.mode==="translate",this.helper.rotate.visible=this.mode==="rotate",this.helper.scale.visible=this.mode==="scale";let r=[];r=r.concat(this.picker[this.mode].children),r=r.concat(this.gizmo[this.mode].children),r=r.concat(this.helper[this.mode].children);for(let s=0;s<r.length;s++){const a=r[s];a.visible=!0,a.rotation.set(0,0,0),a.position.copy(this.worldPosition);let o;if(this.camera.isOrthographicCamera?o=(this.camera.top-this.camera.bottom)/this.camera.zoom:o=this.worldPosition.distanceTo(this.cameraPosition)*Math.min(1.9*Math.tan(Math.PI*this.camera.fov/360)/this.camera.zoom,7),a.scale.set(1,1,1).multiplyScalar(o*this.size/4),a.tag==="helper"){a.visible=!1,a.name==="AXIS"?(a.visible=!!this.axis,this.axis==="X"&&(Ve.setFromEuler(Ho.set(0,0,0)),a.quaternion.copy(i).multiply(Ve),Math.abs(De.copy(Oa).applyQuaternion(i).dot(this.eye))>.9&&(a.visible=!1)),this.axis==="Y"&&(Ve.setFromEuler(Ho.set(0,0,Math.PI/2)),a.quaternion.copy(i).multiply(Ve),Math.abs(De.copy(Vr).applyQuaternion(i).dot(this.eye))>.9&&(a.visible=!1)),this.axis==="Z"&&(Ve.setFromEuler(Ho.set(0,Math.PI/2,0)),a.quaternion.copy(i).multiply(Ve),Math.abs(De.copy(Ba).applyQuaternion(i).dot(this.eye))>.9&&(a.visible=!1)),this.axis==="XYZE"&&(Ve.setFromEuler(Ho.set(0,Math.PI/2,0)),De.copy(this.rotationAxis),a.quaternion.setFromRotationMatrix(Gd.lookAt(Vd,De,Vr)),a.quaternion.multiply(Ve),a.visible=this.dragging),this.axis==="E"&&(a.visible=!1)):a.name==="START"?(a.position.copy(this.worldPositionStart),a.visible=this.dragging):a.name==="END"?(a.position.copy(this.worldPosition),a.visible=this.dragging):a.name==="DELTA"?(a.position.copy(this.worldPositionStart),a.quaternion.copy(this.worldQuaternionStart),xn.set(1e-10,1e-10,1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1),xn.applyQuaternion(this.worldQuaternionStart.clone().invert()),a.scale.copy(xn),a.visible=this.dragging):(a.quaternion.copy(i),this.dragging?a.position.copy(this.worldPositionStart):a.position.copy(this.worldPosition),this.axis&&(a.visible=this.axis.search(a.name)!==-1));continue}a.quaternion.copy(i),this.mode==="translate"||this.mode==="scale"?(a.name==="X"&&Math.abs(De.copy(Oa).applyQuaternion(i).dot(this.eye))>.99&&(a.scale.set(1e-10,1e-10,1e-10),a.visible=!1),a.name==="Y"&&Math.abs(De.copy(Vr).applyQuaternion(i).dot(this.eye))>.99&&(a.scale.set(1e-10,1e-10,1e-10),a.visible=!1),a.name==="Z"&&Math.abs(De.copy(Ba).applyQuaternion(i).dot(this.eye))>.99&&(a.scale.set(1e-10,1e-10,1e-10),a.visible=!1),a.name==="XY"&&Math.abs(De.copy(Ba).applyQuaternion(i).dot(this.eye))<.2&&(a.scale.set(1e-10,1e-10,1e-10),a.visible=!1),a.name==="YZ"&&Math.abs(De.copy(Oa).applyQuaternion(i).dot(this.eye))<.2&&(a.scale.set(1e-10,1e-10,1e-10),a.visible=!1),a.name==="XZ"&&Math.abs(De.copy(Vr).applyQuaternion(i).dot(this.eye))<.2&&(a.scale.set(1e-10,1e-10,1e-10),a.visible=!1)):this.mode==="rotate"&&(Vo.copy(i),De.copy(this.eye).applyQuaternion(Ve.copy(i).invert()),a.name.search("E")!==-1&&a.quaternion.setFromRotationMatrix(Gd.lookAt(this.eye,Vd,Vr)),a.name==="X"&&(Ve.setFromAxisAngle(Oa,Math.atan2(-De.y,De.z)),Ve.multiplyQuaternions(Vo,Ve),a.quaternion.copy(Ve)),a.name==="Y"&&(Ve.setFromAxisAngle(Vr,Math.atan2(De.x,De.z)),Ve.multiplyQuaternions(Vo,Ve),a.quaternion.copy(Ve)),a.name==="Z"&&(Ve.setFromAxisAngle(Ba,Math.atan2(De.y,De.x)),Ve.multiplyQuaternions(Vo,Ve),a.quaternion.copy(Ve))),a.visible=a.visible&&(a.name.indexOf("X")===-1||this.showX),a.visible=a.visible&&(a.name.indexOf("Y")===-1||this.showY),a.visible=a.visible&&(a.name.indexOf("Z")===-1||this.showZ),a.visible=a.visible&&(a.name.indexOf("E")===-1||this.showX&&this.showY&&this.showZ),a.material._color=a.material._color||a.material.color.clone(),a.material._opacity=a.material._opacity||a.material.opacity,a.material.color.copy(a.material._color),a.material.opacity=a.material._opacity,this.enabled&&this.axis&&(a.name===this.axis||this.axis.split("").some(function(l){return a.name===l}))&&(a.material.color.setHex(16776960),a.material.opacity=1)}super.updateMatrixWorld(t)}}class yE extends Pt{constructor(){super(new pa(1e5,1e5,2,2),new Al({visible:!1,wireframe:!0,side:Ti,transparent:!0,opacity:.1,toneMapped:!1})),this.isTransformControlsPlane=!0,this.type="TransformControlsPlane"}updateMatrixWorld(t){let e=this.space;switch(this.position.copy(this.worldPosition),this.mode==="scale"&&(e="local"),Go.copy(Oa).applyQuaternion(e==="local"?this.worldQuaternion:Jo),Ra.copy(Vr).applyQuaternion(e==="local"?this.worldQuaternion:Jo),Ca.copy(Ba).applyQuaternion(e==="local"?this.worldQuaternion:Jo),De.copy(Ra),this.mode){case"translate":case"scale":switch(this.axis){case"X":De.copy(this.eye).cross(Go),xi.copy(Go).cross(De);break;case"Y":De.copy(this.eye).cross(Ra),xi.copy(Ra).cross(De);break;case"Z":De.copy(this.eye).cross(Ca),xi.copy(Ca).cross(De);break;case"XY":xi.copy(Ca);break;case"YZ":xi.copy(Go);break;case"XZ":De.copy(Ca),xi.copy(Ra);break;case"XYZ":case"E":xi.set(0,0,0);break}break;case"rotate":default:xi.set(0,0,0)}xi.length()===0?this.quaternion.copy(this.cameraQuaternion):(Wd.lookAt(xn.set(0,0,0),xi,De),this.quaternion.setFromRotationMatrix(Wd)),super.updateMatrixWorld(t)}}const wc=16726832,SE=16766287;var we,Gp,Wp,Xp,Yp,tl,Fu,Ou,Qa,Ja,Bu,el,zu;class Vp{constructor(t,e,i={}){le(this,we);le(this,Qa,t=>{this._downPos={x:t.clientX,y:t.clientY}});le(this,Ja,t=>{if(!this._downPos)return;const e=Math.hypot(t.clientX-this._downPos.x,t.clientY-this._downPos.y);if(this._downPos=null,e>5||this.transform.dragging)return;const i=this.renderer.domElement.getBoundingClientRect();this._pointer.x=(t.clientX-i.left)/i.width*2-1,this._pointer.y=-((t.clientY-i.top)/i.height)*2+1,this._raycaster.setFromCamera(this._pointer,this.camera);const r=this._raycaster.intersectObjects([...this.meshes.values()].map(a=>a.group),!0);if(!r.length){this.select(null);return}let s=r[0].object;for(;s&&!s.userData.objId;)s=s.parent;this.select((s==null?void 0:s.userData.objId)??null)});this.container=t,this.shed=e,this.layers=i.layers??4,this.onChange=i.onChange??(()=>{}),this.onSelect=i.onSelect??(()=>{}),this.meshes=new Map,this.aisleLabels=[],this.violations=new Map,this.selectedId=null,this.topMode=!1,this._savedCam=null,this._dirty=!1,Nt(this,we,Gp).call(this),Nt(this,we,Wp).call(this),Nt(this,we,Xp).call(this),Nt(this,we,Yp).call(this);for(const r of e.objects)this.addMesh(r);this._ro=new ResizeObserver(()=>this.resize()),this._ro.observe(t),this._raycaster=new Up,this._pointer=new Wt,this._downPos=null,t.addEventListener("pointerdown",Z(this,Qa)),t.addEventListener("pointerup",Z(this,Ja)),Nt(this,we,zu).call(this),queueMicrotask(()=>{var r;return(r=i.onReady)==null?void 0:r.call(i,this)})}addMesh(t){const e=Le[t.type],i=new Fs,r=[],s=(l,c={})=>{const u=new rd({color:l,roughness:.7,metalness:.15,...c});return r.push(u),u},a=(l,c,u,h,f=0,m=0,_=0,v)=>{const p=new Pt(new Xe(l,c,u),s(h,v));return p.position.set(f,m,_),p.castShadow=p.receiveShadow=!0,i.add(p),p};if(t.type==="rack"){const{w:l,d:c,h:u}=t.size,h=.06;for(const m of[-1,1])for(const _ of[-1,1])a(h,u,h,7162945,m*(l/2-h/2),u/2,_*(c/2-h/2));const f=Math.max(2,this.layers);for(let m=0;m<f;m++){const _=u/f*(m+.5);a(l,.05,c,e.color,0,_,0)}}else if(t.type==="tray"){const{w:l,d:c,h:u}=t.size;a(l,u,c,e.color),a(l+.04,.06,c+.04,9268835,0,u+.03,0);for(const h of[-1,1])for(const f of[-1,1])a(.08,.12,.08,7162945,h*(l/2-.06),-u/2-.06,f*(c/2-.06))}else if(t.type==="pipe"){const{d:l}=t.size,c=new Pt(new tn(.06,.06,l,16),s(e.color));c.rotation.x=Math.PI/2,c.castShadow=!0,i.add(c);for(let u=-1;u<=1;u++)a(.18,.04,.05,7901340,0,0,u*l*.35)}else if(t.type==="fan"){const l=new Pt(new tn(.34,.34,.22,24),s(e.color));l.rotation.z=Math.PI/2,l.castShadow=!0,i.add(l);const c=new Pt(new tn(.09,.09,.26,16),s(4545124));c.rotation.z=Math.PI/2,i.add(c);for(let u=0;u<3;u++){const h=a(.02,.26,.09,13621468,0,0,0);h.rotation.x=u*Math.PI*2/3}a(.08,.5,.08,5533306,0,-.55,0)}else if(t.type==="light"){const{w:l,d:c}=t.size;a(l,.08,c,16498733,0,0,0,{emissive:16757504,emissiveIntensity:.55}),a(.04,.25,.04,7901340,0,.16,0)}else if(t.type==="column"){const{h:l}=t.size;a(t.size.w,l,t.size.d,e.color,0,l/2,0),a(t.size.w+.12,.05,t.size.d+.12,4545124,0,.025,0)}i.position.set(t.x,t.y+Nt(this,we,tl).call(this,t),t.z),i.rotation.y=t.rotY||0,i.userData.objId=t.id,this.scene.add(i);const o=Nt(this,we,Fu).call(this,t.code,3046735);o.position.set(0,t.size.h/2+.45,0),o.visible=!1,i.add(o),this.meshes.set(t.id,{group:i,mats:r,base:r.map(l=>l.color.getHex()),label:o,code:t.code})}removeMesh(t){const e=this.meshes.get(t);e&&(this.scene.remove(e.group),e.group.traverse(i=>{i.geometry&&i.geometry.dispose()}),e.mats.forEach(i=>i.dispose()),this.meshes.delete(t),this.selectedId===t&&(this.transform.detach(),this.selectedId=null))}syncObject(t){const e=this.meshes.get(t),i=this.shed.objects.find(r=>r.id===t);!e||!i||(e.group.position.set(i.x,i.y+Nt(this,we,tl).call(this,i),i.z),e.group.rotation.y=i.rotY||0)}select(t){if(this.selectedId=t,!t){this.transform.detach(),this.onSelect(null),Nt(this,we,el).call(this);return}const e=this.meshes.get(t),i=this.shed.objects.find(s=>s.id===t);if(!e||!i)return;this.transform.attach(e.group);const r=i.type!=="pipe"&&i.type!=="light";this.transform.showY=!r,this.onSelect(i),Nt(this,we,el).call(this)}setViolations(t){this.violations=t,Nt(this,we,el).call(this)}setAisles(t){var e;for(const i of this.aisleLabels)this.labelGroup.remove(i),(e=i.material.map)==null||e.dispose(),i.material.dispose();if(this.aisleLabels=[],!!this.topMode)for(const i of t.rows||[]){const r=i.gap<t.minAisle,s=Nt(this,we,Fu).call(this,`走道 ${i.gap}m`,r?wc:1402304);s.position.set(i.x,.35,i.z),this.labelGroup.add(s),this.aisleLabels.push(s)}}toggleTopView(){this.topMode=!this.topMode;const{w:t,d:e}=this.shed;if(this.topMode){this._savedCam={pos:this.camera.position.clone(),target:this.orbit.target.clone(),polar:this.orbit.maxPolarAngle};const i=Math.max(t,e)*1.05;this.camera.position.set(t/2,i,e/2+.01),this.orbit.target.set(t/2,0,e/2),this.orbit.maxPolarAngle=.05,this.orbit.update()}else this.camera.position.copy(this._savedCam.pos),this.orbit.target.copy(this._savedCam.target),this.orbit.maxPolarAngle=this._savedCam.polar,this.orbit.update();for(const i of this.meshes.values())i.label.visible=this.topMode;return this.setAisles(this._lastAisles??{rows:[]}),this.topMode}resetView(){this.camera.position.set(this.shed.w*1.15,this.shed.w*.9,this.shed.d*.75),this.orbit.target.set(this.shed.w/2,0,this.shed.d/2),this.orbit.update()}screenshot(){return this.renderer.render(this.scene,this.camera),this.renderer.domElement.toDataURL("image/png")}setMode(t){this.selectedId&&this.transform.setMode(t)}resize(){const t=this.container.clientWidth,e=this.container.clientHeight;!t||!e||(this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.renderer.setSize(t,e))}refreshAisles(t){this._lastAisles=t,this.setAisles(t)}dispose(){cancelAnimationFrame(this._raf),this._ro.disconnect(),this.container.removeEventListener("pointerdown",Z(this,Qa)),this.container.removeEventListener("pointerup",Z(this,Ja)),this.transform.detach(),this.transform.dispose(),this.orbit.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}}we=new WeakSet,Gp=function(){this.renderer=new QS({antialias:!0,preserveDrawingBuffer:!0}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,2)),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=rp,this.renderer.domElement.style.display="block",this.container.appendChild(this.renderer.domElement),this.camera=new Jn(55,this.container.clientWidth/this.container.clientHeight,.1,300),this.camera.position.set(this.shed.w*1.15,this.shed.w*.9,this.shed.d*.75)},Wp=function(){this.scene=new n0,this.scene.background=new fe(15659765),this.scene.add(new f0(16777215,.65));const t=new od(16777215,1.1);t.position.set(this.shed.w*.8,18,this.shed.d*.6),t.castShadow=!0,t.shadow.mapSize.set(2048,2048);const e=30;t.shadow.camera.left=-e,t.shadow.camera.right=e,t.shadow.camera.top=e,t.shadow.camera.bottom=-e,this.scene.add(t);const i=new od(14675967,.35);i.position.set(-10,8,-10),this.scene.add(i)},Xp=function(){this.orbit=new tE(this.camera,this.renderer.domElement),this.orbit.enableDamping=!0,this.orbit.maxPolarAngle=Math.PI/2-.04,this.orbit.target.set(this.shed.w/2,0,this.shed.d/2),this.orbit.update(),this.transform=new fE(this.camera,this.renderer.domElement),this.transform.setTranslationSnap(xr),this.transform.setRotationSnap(Math.PI/2),this.transform.setSize(.9),this.transform.addEventListener("dragging-changed",t=>{this.orbit.enabled=!t.value,t.value||Nt(this,we,Bu).call(this,!0)}),this.transform.addEventListener("objectChange",()=>{Nt(this,we,Bu).call(this,!1)}),this.scene.add(this.transform.getHelper?this.transform.getHelper():this.transform)},Yp=function(){const{w:t,d:e,h:i}=this.shed,r=new Pt(new pa(t,e),new rd({color:15134696,roughness:.95}));r.rotation.x=-Math.PI/2,r.position.set(t/2,0,e/2),r.receiveShadow=!0,this.scene.add(r);const s=Math.ceil(Math.max(t,e)/xr)*xr,a=new m0(s,s/xr,10204581,13228239);a.position.set(t/2,.005,e/2),a.material.transparent=!0,a.material.opacity=.55,this.scene.add(a);const o=new Pp(new l0(new Xe(t,i,e)),new Rl({color:3622735}));o.position.set(t/2,i/2,e/2),this.scene.add(o),this.labelGroup=new Fs,this.scene.add(this.labelGroup)},tl=function(t){return t.type==="fan"?.9:t.size.h/2},Fu=function(t,e){const i=document.createElement("canvas");i.width=256,i.height=72;const r=new r0(new Rp({depthTest:!1})),s=Math.max(1.4,t.length*.22);return r.scale.set(s,.42,1),r.renderOrder=10,Nt(this,we,Ou).call(this,i,r.material,t,e),r.userData.canvas=i,r},Ou=function(t,e,i,r){const s=t.getContext("2d");s.clearRect(0,0,256,72),s.fillStyle=`#${r.toString(16).padStart(6,"0")}`,s.beginPath(),s.roundRect(4,8,248,56,14),s.fill(),s.font='bold 30px "PingFang SC", "Microsoft YaHei", sans-serif',s.fillStyle="#fff",s.textAlign="center",s.textBaseline="middle",s.fillText(i,128,38),e.map&&e.map.dispose(),e.map=new o0(t),e.needsUpdate=!0},Qa=new WeakMap,Ja=new WeakMap,Bu=function(t){if(!this.selectedId)return;const e=this.meshes.get(this.selectedId),i=this.shed.objects.find(r=>r.id===this.selectedId);!e||!i||(i.x=e.group.position.x,i.z=e.group.position.z,i.y=+(e.group.position.y-Nt(this,we,tl).call(this,i)).toFixed(3),i.rotY=e.group.rotation.y,i.type!=="pipe"&&i.type!=="light"&&(i.y=0),this.onChange(i,t))},el=function(){for(const[t,e]of this.meshes){const i=this.violations.get(t),r=t===this.selectedId;e.mats.forEach((s,a)=>{var o,l,c;i?(s.color.setHex(wc),(o=s.emissive)==null||o.setHex(5570560)):r?(s.color.setHex(SE),(l=s.emissive)==null||l.setHex(3351040)):(s.color.setHex(e.base[a]),(c=s.emissive)==null||c.setHex(0))}),Nt(this,we,Ou).call(this,e.label.userData.canvas,e.label.material,i?`${e.code} !`:e.code,i?wc:3046735)}},zu=function(){this._raf=requestAnimationFrame(()=>Nt(this,we,zu).call(this)),this.orbit.update(),this.renderer.render(this.scene,this.camera)};var EE=Mt('<span class="badge gray">只读查看模式</span>'),bE=Mt('<div class="alert warn small">当前用户无编辑权限</div>'),wE=Mt('<button class="sm" style="width:100%;margin-bottom:8px;text-align:left"> <div class="muted" style="font-size:11px"> </div></button>'),TE=Mt("<span> </span>"),AE=Mt('<div class="alert error" style="margin-top:10px"><b>违规原因:</b><br/> </div>'),RE=Mt('<button class="danger sm" style="width:100%;margin-top:10px">删除该设备</button>'),CE=Mt('<div class="small"><div><b> </b> </div> <div class="muted" style="margin-top:6px"> <br/> <br/> </div> <!> <!></div>'),PE=Mt('<div class="empty small">在场景中点击物体进行选择</div>'),DE=Mt('<div class="alert ok small">本棚无碰撞与违规</div>'),LE=Mt('<div class="alert error small"><b> </b><br/> </div>'),IE=Mt("<b> </b>"),UE=Mt('<div class="small"> <!></div>'),NE=Mt('<h2 style="margin-top:14px">俯视标注</h2> <!> <div class="muted small" style="margin-top:6px">俯视图中显示层架编号与走道宽度</div>',1),FE=Mt('<div class="page-head"><button class="sm">← 返回项目</button> <h1 style="margin:0"> </h1> <span class="muted small"> </span> <span class="spacer"></span> <!></div> <div class="grid" style="grid-template-columns:200px 1fr 300px;align-items:stretch"><div class="card" style="padding:14px"><h2>设备库</h2> <!> <!> <h2 style="margin-top:16px">本棚物料</h2> <table style="font-size:12px"><tbody><tr><td>层架(套)</td><td style="text-align:right"><b> </b></td></tr><tr><td>托盘(个)</td><td style="text-align:right"><b> </b></td></tr><tr><td>管道(米)</td><td style="text-align:right"><b> </b></td></tr><tr><td>风机(台)</td><td style="text-align:right"><b> </b></td></tr><tr><td>灯具(盏)</td><td style="text-align:right"><b> </b></td></tr><tr><td>立柱(根)</td><td style="text-align:right"><b> </b></td></tr></tbody></table> <h2 style="margin-top:16px">操作说明</h2> <ul class="small muted" style="padding-left:16px;margin:0"><li>点击物体选中,出现变换手柄</li> <li>拖动平移自动吸附 0.5m 网格</li> <li>层架强制贴地,禁止 Y 向移动</li> <li> </li> <li>Delete 删除选中,Esc 取消选择</li></ul></div> <div class="card" style="padding:10px;display:flex;flex-direction:column"><div class="row" style="margin-bottom:8px"><div class="pill-tab"><button>移动</button> <button>旋转</button></div> <button> </button> <button class="sm">复位视角</button> <button class="sm">导出俯视 PNG</button> <span class="spacer"></span> <!></div> <div style="flex:1;min-height:560px;border-radius:8px;overflow:hidden;background:#eef2f5"></div></div> <div style="display:flex;flex-direction:column;gap:16px"><div class="card"><h2>选中物体</h2> <!></div> <div class="card" style="flex:1"><h2> </h2> <!> <!></div></div></div>',1);function OE(n,t){Ui(t,!0);const e=Te(()=>El(t.id)),i=Te(()=>g(e).sheds.find(Ct=>Ct.id===t.shedId)),r=Te(()=>Zt.user.role==="maker"&&["制作中","已退回"].includes(g(e).status)),s=["rack","tray","pipe","fan","light"];let a=Ge(null),o=null,l=Ge(null),c=Ge(!1),u=Ge("translate"),h=Ge(ji({violations:[],collided:new Set,aisleMap:{rows:[],min:null}})),f=Ge(ji(new Map));Zf(()=>{o=new Vp(g(a),g(i),{layers:g(e).layers,onReady:()=>_(),onSelect:Ct=>_e(l,Ct,!0),onChange:(Ct,ee)=>{X_(g(e),t.shedId,Ct),ee&&V_(g(e),"调整设备",`${g(i).name}:${Le[Ct.type].name} ${Ct.code} 移动/旋转`),_e(l,{...Ct},!0),_()}}),_(),o.refreshAisles(g(h).aisleMap),window.addEventListener("keydown",m)}),Kf(()=>{window.removeEventListener("keydown",m),o==null||o.dispose()});function m(Ct){!g(r)||!g(l)||(Ct.key==="Escape"&&o.select(null),(Ct.key==="Delete"||Ct.key==="Backspace")&&p())}function _(){const Ct=Ii(g(e)).perShed.find(Se=>Se.shed.id===t.shedId);_e(h,Ct,!0);const ee=new Map;for(const Se of Ct.violations)ee.has(Se.objId)||ee.set(Se.objId,Se.reason);_e(f,ee,!0),o==null||o.setViolations(ee),o==null||o.refreshAisles(Ct.aisleMap)}function v(Ct){const ee=W_(g(e),t.shedId,Ct);o.addMesh(ee),o.select(ee.id),_()}function p(){if(!g(l))return;const Ct=g(l).id;Y_(g(e),t.shedId,Ct),o.removeMesh(Ct),_e(l,null),_()}function d(Ct){_e(u,Ct,!0),o==null||o.setMode(Ct)}function w(){_e(c,o.toggleTopView(),!0),o.refreshAisles(g(h).aisleMap)}function b(){o==null||o.resetView()}function S(){const Ct=o.screenshot(),ee=document.createElement("a");ee.href=Ct,ee.download=`${g(e).code}-${g(i).name}-俯视图.png`,ee.click()}const D=Te(()=>{var ee,Se;const Ct={rack:0,tray:0,pipe:0,fan:0,light:0,column:0};for(const Ne of((ee=g(i))==null?void 0:ee.objects)??[])Ne.type==="pipe"?Ct.pipe=+(Ct.pipe+(((Se=Ne.size)==null?void 0:Se.d)??Le.pipe.d)).toFixed(1):Ct[Ne.type]++;return Ct});var C=FE(),R=ln(C),P=$(R),y=L(P,2),M=st(y),A=L(y,2),O=st(A),U=L(A,4);{var k=Ct=>{var ee=EE();dt(Ct,ee)};Qt(U,Ct=>{g(r)||Ct(k)})}var W=L(R,2),X=$(W),j=L($(X),2);{var G=Ct=>{var ee=bE();dt(Ct,ee)};Qt(j,Ct=>{g(r)||Ct(G)})}var V=L(j,2);Ie(V,17,()=>s,Wn,(Ct,ee)=>{const Se=Te(()=>Le[g(ee)]);var Ne=wE(),Oe=$(Ne),cn=L(Oe),Rn=st(cn);zt(()=>{Ne.disabled=!g(r),tt(Oe,`+ ${g(Se).name??""} `),tt(Rn,`${g(Se).w??""}×${g(Se).d??""}×${g(Se).h??""}m · 单位${g(Se).unit??""}`)}),ie("click",Ne,()=>v(g(ee))),dt(Ct,Ne)});var lt=L(V,4),vt=$(lt),Lt=$(vt),Vt=L($(Lt)),q=$(Vt),nt=st(q,!0),yt=L(Lt),ht=L($(yt)),St=$(ht),It=st(St,!0),Bt=L(yt),se=L($(Bt)),Xt=$(se),he=st(Xt,!0),N=L(Bt),Pe=L($(N)),Kt=$(Pe),Ft=st(Kt,!0),ft=L(N),qt=L($(ft)),wt=$(qt),T=st(wt,!0),x=L(ft),H=L($(x)),et=$(H),it=st(et,!0),Y=L(lt,4),ct=L($(Y),6),ot=st(ct),_t=L(X,2),Ht=$(_t),at=$(Ht),gt=$(at),Ut=L(gt,2),kt=L(at,2);let Rt;var Jt=st(kt,!0),pt=L(kt,2),xt=L(pt,2),F=L(xt,4);{var mt=Ct=>{var ee=TE(),Se=st(ee);zt(()=>{Ln(ee,1,`badge ${g(h).aisleMap.min<g(h).aisleMap.minAisle?"red":"gray"}`),tt(Se,`最窄走道 ${g(h).aisleMap.min??""}m(≥${g(h).aisleMap.minAisle??""}m)`)}),dt(Ct,ee)};Qt(F,Ct=>{g(h).aisleMap.min!==null&&Ct(mt)})}var J=L(Ht,2);jf(J,Ct=>_e(a,Ct),()=>g(a));var rt=L(_t,2),Et=$(rt),bt=L($(Et),2);{var $t=Ct=>{const ee=Te(()=>Le[g(l).type]);var Se=CE(),Ne=$(Se),Oe=$(Ne),cn=st(Oe,!0),Rn=L(Oe),Oi=L(Ne,2),sr=$(Oi),gi=L(sr,2),ni=L(gi,2),ds=L(Oi,2);{var E=B=>{var ut=AE(),Tt=L($(ut),2,!0);zt(Dt=>tt(Tt,Dt),[()=>g(f).get(g(l).id)]),dt(B,ut)},z=Te(()=>g(f).has(g(l).id));Qt(ds,B=>{g(z)&&B(E)})}var K=L(ds,2);{var Q=B=>{var ut=RE();ie("click",ut,p),dt(B,ut)};Qt(K,B=>{g(r)&&g(l).type!=="column"&&B(Q)})}zt((B,ut,Tt,Dt)=>{tt(cn,g(ee).name),tt(Rn,` · 编号 ${g(l).code??""}`),tt(sr,`位置 X ${B??""} / Y ${ut??""} / Z ${Tt??""} m`),tt(gi,` 旋转 ${Dt??""}°`),tt(ni,` 尺寸 ${g(l).size.w??""} × ${g(l).size.d??""} × ${g(l).size.h??""} m`)},[()=>g(l).x.toFixed(2),()=>g(l).y.toFixed(2),()=>g(l).z.toFixed(2),()=>Math.round((g(l).rotY||0)*180/Math.PI)]),dt(Ct,Se)},me=Ct=>{var ee=PE();dt(Ct,ee)};Qt(bt,Ct=>{g(l)?Ct($t):Ct(me,-1)})}var ke=L(Et,2),re=$(ke),qe=st(re),pn=L(re,2);{var Dr=Ct=>{var ee=DE();dt(Ct,ee)},hs=Ct=>{var ee=Ar(),Se=ln(ee);Ie(Se,19,()=>g(h).violations,(Ne,Oe)=>Ne.objId+Oe,(Ne,Oe)=>{const cn=Te(()=>g(i).objects.find(ni=>ni.id===g(Oe).objId));var Rn=LE(),Oi=$(Rn),sr=st(Oi,!0),gi=L(Oi,2,!0);zt(()=>{var ni;tt(sr,((ni=g(cn))==null?void 0:ni.code)??"物体"),tt(gi,g(Oe).reason)}),dt(Ne,Rn)}),dt(Ct,ee)};Qt(pn,Ct=>{g(h).violations.length===0?Ct(Dr):Ct(hs,-1)})}var $e=L(pn,2);{var ei=Ct=>{var ee=NE(),Se=L(ln(ee),2);Ie(Se,17,()=>g(h).aisleMap.rows,Wn,(Ne,Oe)=>{var cn=UE(),Rn=$(cn),Oi=L(Rn);{var sr=gi=>{var ni=IE(),ds=st(ni);zt(()=>tt(ds,`(不足 ${g(h).aisleMap.minAisle??""}m)`)),dt(gi,ni)};Qt(Oi,gi=>{g(Oe).gap<g(h).aisleMap.minAisle&&gi(sr)})}zt(()=>{nr(cn,`color:${g(Oe).gap<g(h).aisleMap.minAisle?"var(--red)":"var(--ink-2)"}`),tt(Rn,`第 ${g(Oe).index??""} 条走道:净宽 ${g(Oe).gap??""}m `)}),dt(Ne,cn)}),dt(Ct,ee)};Qt($e,Ct=>{g(c)&&g(h).aisleMap.rows.length>0&&Ct(ei)})}zt(()=>{tt(M,`${g(e).name??""} · ${g(i).name??""}`),tt(O,`${g(i).w??""}m × ${g(i).d??""}m × ${g(i).h??""}m · 0.5m 网格吸附 · 90° 旋转吸附`),tt(nt,g(D).rack),tt(It,g(D).tray),tt(he,g(D).pipe),tt(Ft,g(D).fan),tt(T,g(D).light),tt(it,g(D).column),tt(ot,`叠层 > ${Xc} 或压立柱立即变红`),Ln(gt,1,Ya(g(u)==="translate"?"active":"")),gt.disabled=!g(l),Ln(Ut,1,Ya(g(u)==="rotate"?"active":"")),Ut.disabled=!g(l),Rt=Ln(kt,1,"sm",null,Rt,{primary:g(c)}),tt(Jt,g(c)?"退出俯视图":"一键俯视图"),tt(qe,`实时碰撞告警(${g(h).violations.length??""})`)}),ie("click",P,()=>rn("project-detail",{id:g(e).id})),ie("click",gt,()=>d("translate")),ie("click",Ut,()=>d("rotate")),ie("click",kt,w),ie("click",pt,b),ie("click",xt,S),dt(n,C),Ni()}rr(["click"]);var BE=Mt('<div class="empty small">暂无待审核项目</div>'),zE=Mt('<span style="color:var(--red);font-weight:700">(超限)</span>'),kE=Mt('<button class="sm"><b> </b> <br/> <span class="muted" style="font-size:11px"> <!></span></button>'),HE=Mt('<span class="badge red"> </span>'),VE=Mt('<div class="alert error" style="margin-top:10px;margin-bottom:0"> </div>'),GE=Mt('<div style="margin-top:10px;margin-bottom:0"> </div>'),WE=Mt("<button> <!> <!></button>"),XE=Mt('<div class="alert ok">本棚无告警,布置合格</div>'),YE=Mt('<div class="alert error small"><b> </b> </div>'),qE=Mt("<div> </div>"),$E=Mt("<tr><td> </td><td><b> </b></td><td> </td></tr>"),jE=Mt('<li><span class="t-user"> </span> <div class="t-time"> </div></li>'),ZE=Mt('<div><div class="card" style="margin-bottom:14px"><div class="row"><h2 style="margin:0"> </h2> <span> </span> <!> <span class="spacer"></span> <button class="danger">整单退回</button> <button class="primary">通过并打包交付</button></div> <!> <!></div> <div class="card" style="margin-bottom:14px"><div class="row" style="margin-bottom:10px"><!> <span class="spacer"></span> <button class="sm">俯视图/透视</button> <button class="sm">复位视角</button></div> <div style="height:440px;border-radius:8px;overflow:hidden;background:#eef2f5"></div> <div class="muted small" style="margin-top:6px">只读审核视图:违规物体已标红,可旋转/缩放查看,不可移动</div></div> <div class="grid" style="grid-template-columns:1fr 1fr"><div class="card"><h2> </h2> <!> <!></div> <div class="card"><h2>物料清单(全项目汇总)</h2> <table><thead><tr><th>物料</th><th>数量</th><th>单位</th></tr></thead><tbody></tbody></table> <h2 style="margin-top:14px">最近操作</h2> <ul class="timeline" style="max-height:200px;overflow:auto"></ul></div></div></div>'),KE=Mt('<div class="card empty">请从左侧选择一个待审核项目</div>'),QE=Mt('<div class="alert error"> </div>'),JE=Mt('<div class="modal-mask" role="button" tabindex="0" aria-label="点击空白处关闭"><div class="modal" role="dialog" aria-modal="true" aria-label="整单退回"><h2> </h2> <p class="muted small"> </p> <span class="flabel">退回原因(制作员可见)</span> <textarea rows="5" placeholder="例:3号棚层架压住立柱,且主走道净宽不足 1 米,请调整后重新提交"></textarea> <!> <div class="row" style="margin-top:14px"><span class="spacer"></span> <button>取消</button> <button class="danger">确认退回</button></div></div></div>'),tb=Mt('<h1>主管审核台</h1> <div class="grid" style="grid-template-columns:260px 1fr;align-items:start"><div class="card"><h2> </h2> <!> <!></div> <!></div> <!>',1);function eb(n,t){Ui(t,!0);const e=Te(()=>Zt.projects.filter(A=>A.status==="待审核").sort((A,O)=>new Date(A.deadline)-new Date(O.deadline))),i=Te(()=>t.id?El(t.id):null),r=Te(()=>g(i)?Ii(g(i)):null);let s=Ge(0),a=Ge(!1),o=Ge(""),l=Ge(""),c=Ge(null),u=null;al(()=>{var k;const A=(k=g(i))==null?void 0:k.sheds[g(s)];if(!g(c)||!A||!g(i))return;u==null||u.dispose(),u=new Vp(g(c),A,{layers:g(i).layers,onSelect:()=>{},onChange:()=>{}});const O=Ii(g(i)).perShed[g(s)],U=new Map;for(const W of O.violations)U.has(W.objId)||U.set(W.objId,W.reason);return u.setViolations(U),u.refreshAisles(O.aisleMap),()=>u==null?void 0:u.dispose()}),Kf(()=>u==null?void 0:u.dispose());function h(){if(!g(o).trim()){_e(l,"请填写退回原因");return}$_(g(i),g(o).trim()),_e(a,!1),_e(o,""),_e(l,"已整单退回,计入一次返工")}function f(){const A=j_(g(i));_e(l,A.ok?`已通过并打包,版本 ${g(i).version},交付时间已记录`:A.msg,!0),A.ok&&setTimeout(()=>rn("deliverables",{id:g(i).id}),1200)}function m(A){_e(s,A,!0)}var _=tb(),v=L(ln(_),2),p=$(v),d=$(p),w=st(d),b=L(d,2);{var S=A=>{var O=BE();dt(A,O)};Qt(b,A=>{g(e).length===0&&A(S)})}var D=L(b,2);Ie(D,17,()=>g(e),A=>A.id,(A,O)=>{var U=kE(),k=$(U),W=st(k,!0),X=L(k),j=L(X,3),G=$(j),V=L(G);{var lt=vt=>{var Lt=zE();dt(vt,Lt)};Qt(V,vt=>{g(O).reworkCount>2&&vt(lt)})}zt(()=>{nr(U,`width:100%;text-align:left;margin-bottom:8px;
        ${g(O).id===t.id?"border-color:var(--brand);background:var(--brand-soft)":""}`),tt(W,g(O).code),tt(X,` · ${g(O).name??""}`),tt(G,`${g(O).sheds.length??""}棚 · 交期 ${g(O).deadline??""} · 返工 ${g(O).reworkCount??""} 次 `)}),ie("click",U,()=>rn("review",{id:g(O).id})),dt(A,U)});var C=L(p,2);{var R=A=>{var O=ZE(),U=$(O),k=$(U),W=$(k),X=st(W),j=L(W,2),G=st(j,!0),V=L(j,2);{var lt=Y=>{var ct=HE(),ot=st(ct);zt(()=>tt(ot,`同一单已返工 ${g(i).reworkCount??""} 次`)),dt(Y,ct)};Qt(V,Y=>{g(i).reworkCount>2&&Y(lt)})}var vt=L(V,4),Lt=L(vt,2),Vt=L(k,2);{var q=Y=>{var ct=VE(),ot=st(ct);zt(()=>tt(ot,`存在 ${g(r).total??""} 项碰撞告警,无法通过审核,请整单退回`)),dt(Y,ct)};Qt(Vt,Y=>{g(r).total>0&&Y(q)})}var nt=L(Vt,2);{var yt=Y=>{var ct=GE(),ot=st(ct,!0);zt(_t=>{Ln(ct,1,`alert ${_t??""}`),tt(ot,g(l))},[()=>g(l).includes("退回")?"warn":"ok"]),dt(Y,ct)};Qt(nt,Y=>{g(l)&&Y(yt)})}var ht=L(U,2),St=$(ht),It=$(St);Ie(It,19,()=>g(r).perShed,Y=>Y.shed.id,(Y,ct,ot)=>{const _t=Te(()=>g(i).shedRework[g(ct).shed.id]||0);var Ht=WE();let at;var gt=$(Ht),Ut=L(gt);{var kt=pt=>{var xt=Oc();zt(()=>tt(xt,`(${g(ct).violations.length??""}警)`)),dt(pt,xt)};Qt(Ut,pt=>{g(ct).violations.length>0&&pt(kt)})}var Rt=L(Ut,2);{var Jt=pt=>{var xt=Oc();zt(()=>tt(xt,`· 返${g(_t)??""}`)),dt(pt,xt)};Qt(Rt,pt=>{g(_t)>2&&pt(Jt)})}zt(()=>{at=Ln(Ht,1,"sm",null,at,{primary:g(ot)===g(s)}),nr(Ht,g(_t)>2?"border-color:var(--red);color:var(--red);font-weight:700":""),tt(gt,`${g(ct).shed.name??""} `)}),ie("click",Ht,()=>m(g(ot))),dt(Y,Ht)});var Bt=L(It,4),se=L(Bt,2),Xt=L(St,2);jf(Xt,Y=>_e(c,Y),()=>g(c));var he=L(ht,2),N=$(he),Pe=$(N),Kt=st(Pe),Ft=L(Pe,2);{var ft=Y=>{var ct=XE();dt(Y,ct)},qt=Y=>{var ct=Ar(),ot=ln(ct);Ie(ot,19,()=>g(r).perShed[g(s)].violations,(_t,Ht)=>_t.objId+Ht,(_t,Ht)=>{const at=Te(()=>g(i).sheds[g(s)].objects.find(Jt=>Jt.id===g(Ht).objId));var gt=YE(),Ut=$(gt),kt=st(Ut,!0),Rt=L(Ut);zt(()=>{var Jt;tt(kt,(Jt=g(at))==null?void 0:Jt.code),tt(Rt,`(${(g(at)?Le[g(at).type].name:"")??""}):${g(Ht).reason??""}`)}),dt(_t,gt)}),dt(Y,ct)};Qt(Ft,Y=>{g(r).perShed[g(s)].violations.length===0?Y(ft):Y(qt,-1)})}var wt=L(Ft,2);{var T=Y=>{var ct=qE(),ot=st(ct);zt(()=>{Ln(ct,1,`alert ${g(r).perShed[g(s)].aisleMap.min<1?"error":"ok"}`),tt(ot,`最窄走道净宽 ${g(r).perShed[g(s)].aisleMap.min??""}m`)}),dt(Y,ct)};Qt(wt,Y=>{g(r).perShed[g(s)].aisleMap.min!==null&&Y(T)})}var x=L(N,2),H=L($(x),2),et=L($(H));Ie(et,21,()=>g(r).bom,Wn,(Y,ct)=>{var ot=$E(),_t=$(ot),Ht=st(_t,!0),at=L(_t),gt=$(at),Ut=st(gt,!0),kt=L(at),Rt=st(kt,!0);zt(()=>{tt(Ht,g(ct).name),tt(Ut,g(ct).qty),tt(Rt,g(ct).unit)}),dt(Y,ot)});var it=L(H,4);Ie(it,21,()=>[...g(i).timeline].reverse().slice(0,6),Y=>Y.id,(Y,ct)=>{var ot=jE(),_t=$(ot),Ht=st(_t,!0),at=L(_t),gt=L(at),Ut=st(gt,!0);zt(()=>{tt(Ht,g(ct).user),tt(at,` · ${g(ct).action??""} `),tt(Ut,g(ct).time)}),dt(Y,ot)}),zt(()=>{tt(X,`${g(i).name??""}(${g(i).code??""})`),Ln(j,1,`badge ${g(i).status??""}`),tt(G,g(i).status),Lt.disabled=g(r).total>0,tt(Kt,`${g(i).sheds[g(s)].name??""} · 碰撞告警`)}),ie("click",vt,()=>_e(a,!0)),ie("click",Lt,f),ie("click",Bt,()=>u==null?void 0:u.toggleTopView()),ie("click",se,()=>u==null?void 0:u.resetView()),dt(A,O)},P=A=>{var O=KE();dt(A,O)};Qt(C,A=>{g(i)?A(R):A(P,-1)})}var y=L(v,2);{var M=A=>{var O=JE(),U=$(O),k=$(U),W=st(k),X=L(k,2),j=st(X),G=L(X,4),V=L(G,2);{var lt=nt=>{var yt=QE(),ht=st(yt,!0);zt(()=>tt(ht,g(l))),dt(nt,yt)},vt=Te(()=>g(l)&&g(l).includes("原因"));Qt(V,nt=>{g(vt)&&nt(lt)})}var Lt=L(V,2),Vt=L($(Lt),2),q=L(Vt,2);zt(()=>{tt(W,`整单退回 · ${g(i).code??""}`),tt(j,`退回后所有棚各计一次返工;同一棚返工超过 2 次将在项目中标红。当前累计返工 ${g(i).reworkCount??""} 次。`)}),ie("click",O,()=>_e(a,!1)),ie("keydown",O,nt=>nt.key==="Escape"&&_e(a,!1)),ie("click",U,nt=>nt.stopPropagation()),ie("keydown",U,nt=>nt.stopPropagation()),kr(G,()=>g(o),nt=>_e(o,nt)),ie("click",Vt,()=>_e(a,!1)),ie("click",q,h),dt(A,O)};Qt(y,A=>{g(a)&&A(M)})}zt(()=>tt(w,`待审核(${g(e).length??""})`)),dt(n,_),Ni()}rr(["click","keydown"]);var nb=Mt('<div class="alert warn">项目尚未通过审核打包,当前导出的是过程数据(无交付包编号)</div>'),ib=Mt("<tr><td> </td><td><b> </b></td><td> </td></tr>"),rb=Mt('<div style="padding:8px 0;border-bottom:1px solid var(--line)"><b> </b> <span class="muted small"> </span> <div class="small" style="margin-top:4px"> </div> <div class="small"> <!></div></div>'),sb=Mt('<div class="small muted"> </div>'),ab=Mt('<li><span class="t-user"> </span> <!> <div class="t-time"> </div></li>'),ob=Mt('<div class="page-head"><button class="sm">← 返回项目</button> <h1 style="margin:0"> </h1> <span class="spacer"></span> <button class="sm">导出物料清单 CSV</button> <button class="primary sm">下载交付包 JSON</button></div> <!> <div class="grid" style="grid-template-columns:1fr 1fr;align-items:start"><div class="card"><h2>交付信息</h2> <table><tbody><tr><td>交付包编号</td><td><b> </b></td></tr><tr><td>项目编号</td><td> </td></tr><tr><td>版本号</td><td><b> </b></td></tr><tr><td>交付时间</td><td><b> </b></td></tr><tr><td>需求交期</td><td> </td></tr><tr><td>客户 / 制作员 / 主管</td><td> </td></tr><tr><td>累计返工</td><td> </td></tr><tr><td>最终碰撞告警</td><td> </td></tr></tbody></table> <h2 style="margin-top:18px">交付包内容(JSON 结构)</h2> <ul class="small muted"><li>项目信息、版本号与交付时间</li> <li>需求参数:菇棚数量 / 层数 / 单层承重</li> <li>物料清单汇总与各棚明细</li> <li>每个物体的编号、类型、坐标、旋转与尺寸</li> <li>各棚碰撞告警与完整操作时间线(含操作人)</li></ul></div> <div><div class="card" style="margin-bottom:16px"><h2>物料清单</h2> <table><thead><tr><th>物料</th><th>数量</th><th>单位</th></tr></thead><tbody></tbody></table></div> <div class="card" style="margin-bottom:16px"><h2>各棚交付明细</h2> <!></div> <div class="card"><h2>完整时间线</h2> <ul class="timeline" style="max-height:300px;overflow:auto"></ul></div></div></div>',1);function lb(n,t){Ui(t,!0);const e=Te(()=>El(t.id)),i=Te(()=>Ii(g(e)));function r(Ft){var qt;const ft={rack:0,tray:0,pipe:0,fan:0,light:0};for(const wt of Ft.objects??[])wt.type==="pipe"?ft.pipe=+(ft.pipe+(((qt=wt.size)==null?void 0:qt.d)??Le.pipe.d)).toFixed(1):ft[wt.type]!==void 0&&(ft[wt.type]+=1);return ft}var s=ob(),a=ln(s),o=$(a),l=L(o,2),c=st(l),u=L(l,4),h=L(u,2),f=L(a,2);{var m=Ft=>{var ft=nb();dt(Ft,ft)};Qt(f,Ft=>{g(e).status!=="已交付"&&Ft(m)})}var _=L(f,2),v=$(_),p=L($(v),2),d=$(p),w=$(d),b=L($(w)),S=$(b),D=st(S,!0),C=L(w),R=L($(C)),P=st(R,!0),y=L(C),M=L($(y)),A=$(M),O=st(A,!0),U=L(y),k=L($(U)),W=$(k),X=st(W,!0),j=L(U),G=L($(j)),V=st(G,!0),lt=L(j),vt=L($(lt)),Lt=st(vt),Vt=L(lt),q=L($(Vt)),nt=st(q),yt=L(Vt),ht=L($(yt)),St=st(ht),It=L(v,2),Bt=$(It),se=L($(Bt),2),Xt=L($(se));Ie(Xt,21,()=>g(i).bom,Wn,(Ft,ft)=>{var qt=ib(),wt=$(qt),T=st(wt,!0),x=L(wt),H=$(x),et=st(H,!0),it=L(x),Y=st(it,!0);zt(()=>{tt(T,g(ft).name),tt(et,g(ft).qty),tt(Y,g(ft).unit)}),dt(Ft,qt)});var he=L(Bt,2),N=L($(he),2);Ie(N,17,()=>g(i).perShed,Ft=>Ft.shed.id,(Ft,ft)=>{const qt=Te(()=>r(g(ft).shed));var wt=rb(),T=$(wt),x=st(T,!0),H=L(T,2),et=st(H),it=L(H,2),Y=st(it),ct=L(it,2),ot=$(ct),_t=L(ot);{var Ht=at=>{var gt=Oc();zt(()=>tt(gt,`· 最窄走道 ${g(ft).aisleMap.min??""}m`)),dt(at,gt)};Qt(_t,at=>{g(ft).aisleMap.min!==null&&at(Ht)})}zt(()=>{tt(x,g(ft).shed.name),tt(et,`(${g(ft).shed.w??""}×${g(ft).shed.d??""}m)`),tt(Y,`层架 ${g(qt).rack??""} 套 · 托盘 ${g(qt).tray??""} 个 · 管道 ${g(qt).pipe??""} 米 · 风机 ${g(qt).fan??""} 台 · 灯具 ${g(qt).light??""} 盏`),nr(ct,`color:${g(ft).violations.length?"var(--red)":"var(--brand-dark)"}`),tt(ot,`${g(ft).violations.length?`告警 ${g(ft).violations.length} 项`:"✔ 无告警"} `)}),dt(Ft,wt)});var Pe=L(he,2),Kt=L($(Pe),2);Ie(Kt,21,()=>[...g(e).timeline].reverse(),Ft=>Ft.id,(Ft,ft)=>{var qt=ab(),wt=$(qt),T=st(wt,!0),x=L(wt),H=L(x);{var et=ct=>{var ot=sb(),_t=st(ot,!0);zt(()=>tt(_t,g(ft).detail)),dt(ct,ot)};Qt(H,ct=>{g(ft).detail&&ct(et)})}var it=L(H,2),Y=st(it,!0);zt(()=>{tt(T,g(ft).user),tt(x,`(${g(ft).role??""}) · ${g(ft).action??""} `),tt(Y,g(ft).time)}),dt(Ft,qt)}),zt(()=>{tt(c,`交付包 · ${g(e).name??""}`),tt(D,g(e).packageId??"打包后生成"),tt(P,g(e).code),tt(O,g(e).version),tt(X,g(e).deliveredAt??"—"),tt(V,g(e).deadline),tt(Lt,`${g(e).customer??""} / ${g(e).maker??""} / ${g(e).supervisor??""}`),nr(q,g(e).reworkCount>2?"color:var(--red);font-weight:700":""),tt(nt,`${g(e).reworkCount??""} 次`),tt(St,`${g(i).total??""} 项`)}),ie("click",o,()=>rn("project-detail",{id:g(e).id})),ie("click",u,()=>Yc(g(e))),ie("click",h,()=>K_(g(e))),dt(n,s),Ni()}rr(["click"]);var cb=Mt('<button><span style="margin-right:8px"> </span> </button>'),ub=Mt('<div class="layout"><aside class="sidebar"><div class="logo">菇棚层架三维布置 <small>菌菇合作社交付系统</small></div> <nav></nav> <div class="me"><b> </b><br/> <div style="margin-top:8px"><button class="sm">切换账号</button></div></div></aside> <div class="main"><div class="topbar"><strong> </strong> <span class="spacer"></span> <span class="muted small">数据存储于浏览器本地 · localStorage</span></div> <div class="content"><!></div></div></div>');function hb(n,t){Ui(t,!0);const e={customer:[{name:"dashboard",label:"首页看板",icon:"▦"},{name:"project-list",label:"我的项目",icon:"☰"},{name:"order-new",label:"下需求单",icon:"✚"}],maker:[{name:"dashboard",label:"首页看板",icon:"▦"},{name:"project-list",label:"项目列表",icon:"☰"}],supervisor:[{name:"dashboard",label:"首页看板",icon:"▦"},{name:"project-list",label:"项目列表",icon:"☰"},{name:"review",label:"审核台",icon:"⚑"}]},i=Te(()=>Zt.route.name+JSON.stringify(Zt.route.params??{}));var r=Ar(),s=ln(r);{var a=l=>{tv(l,{})},o=l=>{var c=ub(),u=$(c),h=L($(u),2);Ie(h,21,()=>e[Zt.user.role]??[],Wn,(P,y)=>{var M=cb();let A;var O=$(M),U=st(O,!0),k=L(O,1,!0);zt(W=>{A=Ln(M,1,"navlink",null,A,{active:W}),tt(U,g(y).icon),tt(k,g(y).label)},[()=>Zt.route.name===g(y).name||g(y).name==="project-list"&&["project-detail","shed-editor","deliverables"].includes(Zt.route.name)||g(y).name==="review"&&Zt.route.name==="review"]),ie("click",M,()=>rn(g(y).name)),dt(P,M)});var f=L(h,2),m=$(f),_=st(m,!0),v=L(m,2),p=L(v),d=st(p),w=L(u,2),b=$(w),S=$(b),D=st(S,!0),C=L(b,2),R=$(C);Yf(R,()=>g(i),P=>{var y=Ar(),M=ln(y);{var A=V=>{wh(V,{})},O=V=>{pv(V,{})},U=V=>{Tv(V,{})},k=V=>{Hv(V,co(()=>Zt.route.params))},W=V=>{OE(V,co(()=>Zt.route.params))},X=V=>{eb(V,co(()=>Zt.route.params))},j=V=>{lb(V,co(()=>Zt.route.params))},G=V=>{wh(V,{})};Qt(M,V=>{Zt.route.name==="dashboard"?V(A):Zt.route.name==="order-new"?V(O,1):Zt.route.name==="project-list"?V(U,2):Zt.route.name==="project-detail"?V(k,3):Zt.route.name==="shed-editor"?V(W,4):Zt.route.name==="review"?V(X,5):Zt.route.name==="deliverables"?V(j,6):V(G,-1)})}dt(P,y)}),zt(P=>{tt(_,Zt.user.name),tt(v,` ${Jf[Zt.user.role]??""} `),tt(D,P)},[()=>{var P,y;return((y=(P=e[Zt.user.role])==null?void 0:P.find(M=>M.name===Zt.route.name))==null?void 0:y.label)??"项目工作台"}]),ie("click",d,function(...P){kl==null||kl.apply(this,P)}),dt(l,c)};Qt(s,l=>{!Zt.user||Zt.route.name==="login"?l(a):l(o,-1)})}dt(n,r),Ni()}rr(["click"]);d_(hb,{target:document.getElementById("app")});
