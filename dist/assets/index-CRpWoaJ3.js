var sf=Object.defineProperty;var of=(i,e,t)=>e in i?sf(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var Es=(i,e,t)=>of(i,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();function at(){}function lu(i){return i()}function Da(){return Object.create(null)}function Tt(i){i.forEach(lu)}function aa(i){return typeof i=="function"}function wn(i,e){return i!=i?e==e:i!==e||i&&typeof i=="object"||typeof i=="function"}function af(i){return Object.keys(i).length===0}function cu(i,...e){if(i==null){for(const n of e)n(void 0);return at}const t=i.subscribe(...e);return t.unsubscribe?()=>t.unsubscribe():t}function lf(i,e,t){i.$$.on_destroy.push(cu(e,t))}function _(i,e){i.appendChild(e)}function Ce(i,e,t){i.insertBefore(e,t||null)}function Ae(i){i.parentNode&&i.parentNode.removeChild(i)}function dt(i,e){for(let t=0;t<i.length;t+=1)i[t]&&i[t].d(e)}function D(i){return document.createElement(i)}function B(i){return document.createTextNode(i)}function J(){return B(" ")}function uu(){return B("")}function Xe(i,e,t,n){return i.addEventListener(e,t,n),()=>i.removeEventListener(e,t,n)}function cf(i){return function(e){return e.stopPropagation(),i.call(this,e)}}function $(i,e,t){t==null?i.removeAttribute(e):i.getAttribute(e)!==t&&i.setAttribute(e,t)}function Oi(i){return i===""?null:+i}function uf(i){return Array.from(i.childNodes)}function me(i,e){e=""+e,i.data!==e&&(i.data=e)}function tt(i,e){i.value=e??""}function Ht(i,e,t,n){t==null?i.style.removeProperty(e):i.style.setProperty(e,t,"")}function Wt(i,e,t){for(let n=0;n<i.options.length;n+=1){const r=i.options[n];if(r.__value===e){r.selected=!0;return}}(!t||e!==void 0)&&(i.selectedIndex=-1)}function Ii(i){const e=i.querySelector(":checked");return e&&e.__value}function ln(i,e,t){i.classList.toggle(e,!!t)}let lr;function ar(i){lr=i}function fu(){if(!lr)throw new Error("Function called outside component initialization");return lr}function Xn(i){fu().$$.on_mount.push(i)}function oo(i){fu().$$.on_destroy.push(i)}const Di=[],cr=[];let Bi=[];const Ia=[],ff=Promise.resolve();let ao=!1;function hf(){ao||(ao=!0,ff.then(hu))}function Mn(i){Bi.push(i)}const ys=new Set;let mi=0;function hu(){if(mi!==0)return;const i=lr;do{try{for(;mi<Di.length;){const e=Di[mi];mi++,ar(e),df(e.$$)}}catch(e){throw Di.length=0,mi=0,e}for(ar(null),Di.length=0,mi=0;cr.length;)cr.pop()();for(let e=0;e<Bi.length;e+=1){const t=Bi[e];ys.has(t)||(ys.add(t),t())}Bi.length=0}while(Di.length);for(;Ia.length;)Ia.pop()();ao=!1,ys.clear(),ar(i)}function df(i){if(i.fragment!==null){i.update(),Tt(i.before_update);const e=i.dirty;i.dirty=[-1],i.fragment&&i.fragment.p(i.ctx,e),i.after_update.forEach(Mn)}}function pf(i){const e=[],t=[];Bi.forEach(n=>i.indexOf(n)===-1?e.push(n):t.push(n)),t.forEach(n=>n()),Bi=e}const qr=new Set;let li;function mf(){li={r:0,c:[],p:li}}function _f(){li.r||Tt(li.c),li=li.p}function cn(i,e){i&&i.i&&(qr.delete(i),i.i(e))}function Tn(i,e,t,n){if(i&&i.o){if(qr.has(i))return;qr.add(i),li.c.push(()=>{qr.delete(i),n&&(t&&i.d(1),n())}),i.o(e)}else n&&n()}function je(i){return(i==null?void 0:i.length)!==void 0?i:Array.from(i)}function di(i){i&&i.c()}function qn(i,e,t){const{fragment:n,after_update:r}=i.$$;n&&n.m(e,t),Mn(()=>{const s=i.$$.on_mount.map(lu).filter(aa);i.$$.on_destroy?i.$$.on_destroy.push(...s):Tt(s),i.$$.on_mount=[]}),r.forEach(Mn)}function Yn(i,e){const t=i.$$;t.fragment!==null&&(pf(t.after_update),Tt(t.on_destroy),t.fragment&&t.fragment.d(e),t.on_destroy=t.fragment=null,t.ctx=[])}function gf(i,e){i.$$.dirty[0]===-1&&(Di.push(i),hf(),i.$$.dirty.fill(0)),i.$$.dirty[e/31|0]|=1<<e%31}function $n(i,e,t,n,r,s,a=null,o=[-1]){const l=lr;ar(i);const c=i.$$={fragment:null,ctx:[],props:s,update:at,not_equal:r,bound:Da(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(l?l.$$.context:[])),callbacks:Da(),dirty:o,skip_bound:!1,root:e.target||l.$$.root};a&&a(c.root);let h=!1;if(c.ctx=t?t(i,e.props||{},(u,f,...m)=>{const g=m.length?m[0]:f;return c.ctx&&r(c.ctx[u],c.ctx[u]=g)&&(!c.skip_bound&&c.bound[u]&&c.bound[u](g),h&&gf(i,u)),f}):[],c.update(),h=!0,Tt(c.before_update),c.fragment=n?n(c.ctx):!1,e.target){if(e.hydrate){const u=uf(e.target);c.fragment&&c.fragment.l(u),u.forEach(Ae)}else c.fragment&&c.fragment.c();e.intro&&cn(i.$$.fragment),qn(i,e.target,e.anchor),hu()}ar(l)}class jn{constructor(){Es(this,"$$");Es(this,"$$set")}$destroy(){Yn(this,1),this.$destroy=at}$on(e,t){if(!aa(t))return at;const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const r=n.indexOf(t);r!==-1&&n.splice(r,1)}}$set(e){this.$$set&&!af(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const vf="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(vf);const _i=[];function xf(i,e){return{subscribe:du(i,e).subscribe}}function du(i,e=at){let t;const n=new Set;function r(o){if(wn(i,o)&&(i=o,t)){const l=!_i.length;for(const c of n)c[1](),_i.push(c,i);if(l){for(let c=0;c<_i.length;c+=2)_i[c][0](_i[c+1]);_i.length=0}}}function s(o){r(o(i))}function a(o,l=at){const c=[o,l];return n.add(c),n.size===1&&(t=e(r,s)||at),o(i),()=>{n.delete(c),n.size===0&&t&&(t(),t=null)}}return{set:r,update:s,subscribe:a}}function Sf(i,e,t){const n=!Array.isArray(i),r=n?[i]:i;if(!r.every(Boolean))throw new Error("derived() expects stores as input, got a falsy value");const s=e.length<2;return xf(t,(a,o)=>{let l=!1;const c=[];let h=0,u=at;const f=()=>{if(h)return;u();const g=e(n?c[0]:c,a,o);s?a(g):u=aa(g)?g:at},m=r.map((g,v)=>cu(g,p=>{c[v]=p,h&=~(1<<v),l&&f()},()=>{h|=1<<v}));return l=!0,f(),function(){Tt(m),u(),l=!1}})}const la=du(location.hash||"#/informants");window.addEventListener("hashchange",()=>la.set(location.hash||"#/informants"));Sf(la,i=>(i||"#/informants").replace(/^#\//,""));const Mf="dialect-survey",Ef=1;let Er=null;function hs(){return Er||(Er=new Promise((i,e)=>{const t=indexedDB.open(Mf,Ef);t.onupgradeneeded=n=>{const r=n.target.result;r.objectStoreNames.contains("informants")||r.createObjectStore("informants",{keyPath:"id",autoIncrement:!0}),r.objectStoreNames.contains("batches")||r.createObjectStore("batches",{keyPath:"id",autoIncrement:!0}),r.objectStoreNames.contains("versions")||r.createObjectStore("versions",{keyPath:"id",autoIncrement:!0}),r.objectStoreNames.contains("reports")||r.createObjectStore("reports",{keyPath:"id",autoIncrement:!0}),r.objectStoreNames.contains("kv")||r.createObjectStore("kv",{keyPath:"key"})},t.onsuccess=()=>i(t.result),t.onerror=()=>e(t.error)}),Er)}function ds(i){return new Promise((e,t)=>{i.onsuccess=()=>e(i.result),i.onerror=()=>t(i.error)})}async function Yt(i){const t=(await hs()).transaction(i,"readonly");return ds(t.objectStore(i).getAll())}async function ts(i,e){const r=(await hs()).transaction(i,"readwrite").objectStore(i).put(e);return await ds(r),r.result??e.id}async function dr(i,e){const r=(await hs()).transaction(i,"readwrite").objectStore(i).add(e);return ds(r)}async function ca(i,e){const n=(await hs()).transaction(i,"readwrite");return ds(n.objectStore(i).delete(e))}async function Gi(i){const e=(await Yt("kv")).find(t=>t.key===i);return e?e.value:null}async function Ui(i,e){return ts("kv",{key:i,value:e})}const Mt=100,lo=5,ur=[{name:"城关镇",ring:[[30,55],[55,55],[55,75],[45,80],[30,75],[30,55]]},{name:"东河镇",ring:[[55,55],[80,55],[80,75],[55,75],[55,55]]},{name:"西岭乡",ring:[[10,55],[30,55],[30,75],[10,70],[10,55]]},{name:"南坪镇",ring:[[30,30],[55,30],[55,55],[30,55],[30,30]]},{name:"北原乡",ring:[[30,75],[45,80],[55,75],[80,75],[80,95],[30,95],[30,75]]},{name:"临江县",ring:[[55,30],[80,30],[80,55],[55,55],[55,30]]},{name:"石门乡",ring:[[10,30],[30,30],[30,55],[10,55],[10,30]]},{name:"云溪乡",ring:[[10,70],[30,75],[30,95],[10,95],[10,70]]}],ns=ur.map(i=>i.name),co=["古全浊声母清化","入声保留","鼻音韵尾合并","尖团合流","儿化韵丰富","平翘舌不分","疑母读零声母","阳上调独立"],yf=[{x:20,y:82,h:260,s:16},{x:68,y:70,h:320,s:14},{x:45,y:40,h:140,s:20},{x:85,y:30,h:220,s:12},{x:15,y:20,h:180,s:13},{x:60,y:88,h:200,s:15}];function bs(i,e){let t=12;for(const n of yf){const r=i-n.x,s=e-n.y;t+=n.h*Math.exp(-(r*r+s*s)/(2*n.s*n.s))}return t-=30*Math.exp(-Math.pow(e-55,2)/50),Math.max(2,t)}const bf=[{code:"F2023-001",name:"王守田",age:68,township:"城关镇",phonemeCount:312,year:2023,features:["入声保留","尖团合流"],recordings:[{name:"字表录音01",note:"声母字表"},{name:"词汇录音01",note:"日常词汇"}]},{code:"F2023-002",name:"李秀兰",age:72,township:"东河镇",phonemeCount:298,year:2023,features:["古全浊声母清化"],recordings:[{name:"字表录音01",note:""}]},{code:"F2024-003",name:"张建军",age:61,township:"南坪镇",phonemeCount:335,year:2024,features:["鼻音韵尾合并","平翘舌不分"],recordings:[{name:"句法录音01",note:"自然语流"},{name:"字表录音01",note:""}]},{code:"F2024-004",name:"陈桂香",age:75,township:"西岭乡",phonemeCount:287,year:2024,features:["入声保留","疑母读零声母"],recordings:[{name:"字表录音01",note:""}]}];function Ua(i,e,t){const n=i.slice();return n[27]=e[t],n}function Na(i,e,t){const n=i.slice();return n[30]=e[t],n[31]=e,n[32]=t,n}function Fa(i,e,t){const n=i.slice();return n[33]=e[t],n}function Tf(i,e,t){const n=i.slice();return n[36]=e[t],n}function Af(i){let e;return{c(){e=D("option"),e.textContent=`${i[36]}`,e.__value=i[36],tt(e,e.__value)},m(t,n){Ce(t,e,n)},p:at,d(t){t&&Ae(e)}}}function Oa(i){let e,t,n,r,s,a,o;function l(){return i[18](i[33])}return{c(){e=D("label"),t=D("input"),r=B(i[33]),s=J(),$(t,"type","checkbox"),t.hidden=!0,t.checked=n=i[1].features.includes(i[33]),$(e,"class","chip svelte-1czc5eo"),ln(e,"on",i[1].features.includes(i[33]))},m(c,h){Ce(c,e,h),_(e,t),_(e,r),_(e,s),a||(o=Xe(t,"change",l),a=!0)},p(c,h){i=c,h[0]&2&&n!==(n=i[1].features.includes(i[33]))&&(t.checked=n),h[0]&2&&ln(e,"on",i[1].features.includes(i[33]))},d(c){c&&Ae(e),a=!1,o()}}}function Ba(i){let e,t,n,r,s,a,o,l;function c(){i[19].call(t,i[31],i[32])}function h(){i[20].call(r,i[31],i[32])}function u(){return i[21](i[32])}return{c(){e=D("div"),t=D("input"),n=J(),r=D("input"),s=J(),a=D("button"),a.textContent="删",$(t,"placeholder","录音名称"),$(t,"class","svelte-1czc5eo"),$(r,"placeholder","备注"),$(r,"class","svelte-1czc5eo"),$(a,"class","danger"),$(e,"class","rec-row svelte-1czc5eo")},m(f,m){Ce(f,e,m),_(e,t),tt(t,i[30].name),_(e,n),_(e,r),tt(r,i[30].note),_(e,s),_(e,a),o||(l=[Xe(t,"input",c),Xe(r,"input",h),Xe(a,"click",u)],o=!0)},p(f,m){i=f,m[0]&8&&t.value!==i[30].name&&tt(t,i[30].name),m[0]&8&&r.value!==i[30].note&&tt(r,i[30].note)},d(f){f&&Ae(e),o=!1,Tt(l)}}}function za(i){let e,t,n;return{c(){e=D("button"),e.textContent="取消编辑",$(e,"class","ghost")},m(r,s){Ce(r,e,s),t||(n=Xe(e,"click",i[11]),t=!0)},p:at,d(r){r&&Ae(e),t=!1,n()}}}function ka(i){let e,t,n=i[27].code+"",r,s,a=i[27].name+"",o,l,c=i[27].age+"",h,u,f=i[27].township+"",m,g,v,p=i[27].phonemeCount+"",d,M,S=(i[27].recordings||[]).length+"",y,R,A=i[27].year+"",T,I,H,x=(i[27].features||[]).join("、")+"",E,N,L,P,X,z,re,q,fe;function Me(){return i[24](i[27])}function _e(){return i[25](i[27])}return{c(){e=D("tr"),t=D("td"),r=B(n),s=D("td"),o=B(a),l=D("td"),h=B(c),u=D("td"),m=B(f),g=J(),v=D("td"),d=B(p),M=D("td"),y=B(S),R=D("td"),T=B(A),I=J(),H=D("td"),E=B(x),N=J(),L=D("td"),P=D("button"),P.textContent="编辑",X=J(),z=D("button"),z.textContent="删除",re=J(),$(H,"class","muted"),$(P,"class","ghost"),$(z,"class","danger")},m(Ne,Pe){Ce(Ne,e,Pe),_(e,t),_(t,r),_(e,s),_(s,o),_(e,l),_(l,h),_(e,u),_(u,m),_(e,g),_(e,v),_(v,d),_(e,M),_(M,y),_(e,R),_(R,T),_(e,I),_(e,H),_(H,E),_(e,N),_(e,L),_(L,P),_(L,X),_(L,z),_(e,re),q||(fe=[Xe(P,"click",Me),Xe(z,"click",_e)],q=!0)},p(Ne,Pe){i=Ne,Pe[0]&1&&n!==(n=i[27].code+"")&&me(r,n),Pe[0]&1&&a!==(a=i[27].name+"")&&me(o,a),Pe[0]&1&&c!==(c=i[27].age+"")&&me(h,c),Pe[0]&1&&f!==(f=i[27].township+"")&&me(m,f),Pe[0]&1&&p!==(p=i[27].phonemeCount+"")&&me(d,p),Pe[0]&1&&S!==(S=(i[27].recordings||[]).length+"")&&me(y,S),Pe[0]&1&&A!==(A=i[27].year+"")&&me(T,A),Pe[0]&1&&x!==(x=(i[27].features||[]).join("、")+"")&&me(E,x)},d(Ne){Ne&&Ae(e),q=!1,Tt(fe)}}}function wf(i){var Q;let e,t,n=i[4]?"编辑档案":"新建发音人档案",r,s,a,o,l=(i[4]?(Q=i[0].find(i[12]))==null?void 0:Q.code:i[5]())+"",c,h,u,f,m,g,v,p,d,M,S,y,R,A,T,I,H,x,E,N,L,P,X,z,re,q,fe,Me,_e,Ne=i[3].length+"",Pe,Z,oe,de,ce,le,ge,he,ve,Te,F,Ke=i[4]?"保存修改":"建档",De,ze,be,Je,se,C,b=i[0].length+"",k,j,ae,ne,Ue,xe,K,He,V,Ee=je(ns),Oe=[];for(let U=0;U<Ee.length;U+=1)Oe[U]=Af(Tf(i,Ee,U));let Be=je(co),Se=[];for(let U=0;U<Be.length;U+=1)Se[U]=Oa(Fa(i,Be,U));let qe=je(i[3]),Ie=[];for(let U=0;U<qe.length;U+=1)Ie[U]=Ba(Na(i,qe,U));let Ye=i[4]&&za(i),O=je(i[0]),ye=[];for(let U=0;U<O.length;U+=1)ye[U]=ka(Ua(i,O,U));return{c(){e=D("div"),t=D("h3"),r=B(n),s=J(),a=D("span"),o=B("编号:"),c=B(l),h=J(),u=D("div"),f=D("label"),m=B("姓名 "),g=D("input"),v=J(),p=D("label"),d=B("年龄 "),M=D("input"),S=J(),y=D("label"),R=B(`乡镇
      `),A=D("select");for(let U=0;U<Oe.length;U+=1)Oe[U].c();T=J(),I=D("label"),H=B("音系条目数 "),x=D("input"),E=J(),N=D("label"),L=B("调查年份 "),P=D("input"),X=J(),z=D("div"),re=B(`音系特征:
    `);for(let U=0;U<Se.length;U+=1)Se[U].c();q=J(),fe=D("div"),Me=D("b"),_e=B("录音条目("),Pe=B(Ne),Z=B(")"),oe=J();for(let U=0;U<Ie.length;U+=1)Ie[U].c();de=J(),ce=D("div"),le=D("input"),ge=J(),he=D("button"),he.textContent="添加录音",ve=J(),Te=D("div"),F=D("button"),De=B(Ke),ze=J(),Ye&&Ye.c(),be=J(),Je=D("div"),se=D("h3"),C=B("发音人档案库("),k=B(b),j=B(")"),ae=J(),ne=D("table"),Ue=D("thead"),Ue.innerHTML="<tr><th>编号</th><th>姓名</th><th>年龄</th><th>乡镇</th><th>音系条目</th><th>录音条目</th><th>年份</th><th>特征</th><th></th></tr>",xe=J(),K=D("tbody");for(let U=0;U<ye.length;U+=1)ye[U].c();$(a,"class","muted"),$(t,"class","svelte-1czc5eo"),$(g,"class","svelte-1czc5eo"),$(f,"class","svelte-1czc5eo"),$(M,"type","number"),$(M,"min","0"),$(M,"max","120"),$(M,"class","svelte-1czc5eo"),$(p,"class","svelte-1czc5eo"),i[1].township===void 0&&Mn(()=>i[15].call(A)),$(y,"class","svelte-1czc5eo"),$(x,"type","number"),$(x,"min","0"),$(x,"class","svelte-1czc5eo"),$(I,"class","svelte-1czc5eo"),$(P,"type","number"),$(P,"min","1950"),$(P,"max","2100"),$(P,"class","svelte-1czc5eo"),$(N,"class","svelte-1czc5eo"),$(u,"class","grid svelte-1czc5eo"),$(z,"class","features svelte-1czc5eo"),$(le,"placeholder","新录音条目名称,回车添加"),$(le,"class","svelte-1czc5eo"),$(he,"class","ghost"),$(ce,"class","rec-row svelte-1czc5eo"),$(fe,"class","recordings"),Ht(Te,"margin-top","10px"),$(e,"class","card"),$(se,"class","svelte-1czc5eo"),$(Je,"class","card")},m(U,ue){Ce(U,e,ue),_(e,t),_(t,r),_(t,s),_(t,a),_(a,o),_(a,c),_(e,h),_(e,u),_(u,f),_(f,m),_(f,g),tt(g,i[1].name),_(u,v),_(u,p),_(p,d),_(p,M),tt(M,i[1].age),_(u,S),_(u,y),_(y,R),_(y,A);for(let Y=0;Y<Oe.length;Y+=1)Oe[Y]&&Oe[Y].m(A,null);Wt(A,i[1].township,!0),_(u,T),_(u,I),_(I,H),_(I,x),tt(x,i[1].phonemeCount),_(u,E),_(u,N),_(N,L),_(N,P),tt(P,i[1].year),_(e,X),_(e,z),_(z,re);for(let Y=0;Y<Se.length;Y+=1)Se[Y]&&Se[Y].m(z,null);_(e,q),_(e,fe),_(fe,Me),_(Me,_e),_(Me,Pe),_(Me,Z),_(fe,oe);for(let Y=0;Y<Ie.length;Y+=1)Ie[Y]&&Ie[Y].m(fe,null);_(fe,de),_(fe,ce),_(ce,le),tt(le,i[2]),_(ce,ge),_(ce,he),_(e,ve),_(e,Te),_(Te,F),_(F,De),_(Te,ze),Ye&&Ye.m(Te,null),Ce(U,be,ue),Ce(U,Je,ue),_(Je,se),_(se,C),_(se,k),_(se,j),_(Je,ae),_(Je,ne),_(ne,Ue),_(ne,xe),_(ne,K);for(let Y=0;Y<ye.length;Y+=1)ye[Y]&&ye[Y].m(K,null);He||(V=[Xe(g,"input",i[13]),Xe(M,"input",i[14]),Xe(A,"change",i[15]),Xe(x,"input",i[16]),Xe(P,"input",i[17]),Xe(le,"input",i[22]),Xe(le,"keydown",i[23]),Xe(he,"click",i[6]),Xe(F,"click",i[8])],He=!0)},p(U,ue){var Y;if(ue[0]&16&&n!==(n=U[4]?"编辑档案":"新建发音人档案")&&me(r,n),ue[0]&17&&l!==(l=(U[4]?(Y=U[0].find(U[12]))==null?void 0:Y.code:U[5]())+"")&&me(c,l),ue[0]&2&&g.value!==U[1].name&&tt(g,U[1].name),ue[0]&2&&Oi(M.value)!==U[1].age&&tt(M,U[1].age),ue[0]&2&&Wt(A,U[1].township),ue[0]&2&&Oi(x.value)!==U[1].phonemeCount&&tt(x,U[1].phonemeCount),ue[0]&2&&Oi(P.value)!==U[1].year&&tt(P,U[1].year),ue[0]&130){Be=je(co);let we;for(we=0;we<Be.length;we+=1){const ct=Fa(U,Be,we);Se[we]?Se[we].p(ct,ue):(Se[we]=Oa(ct),Se[we].c(),Se[we].m(z,null))}for(;we<Se.length;we+=1)Se[we].d(1);Se.length=Be.length}if(ue[0]&8&&Ne!==(Ne=U[3].length+"")&&me(Pe,Ne),ue[0]&8){qe=je(U[3]);let we;for(we=0;we<qe.length;we+=1){const ct=Na(U,qe,we);Ie[we]?Ie[we].p(ct,ue):(Ie[we]=Ba(ct),Ie[we].c(),Ie[we].m(fe,de))}for(;we<Ie.length;we+=1)Ie[we].d(1);Ie.length=qe.length}if(ue[0]&4&&le.value!==U[2]&&tt(le,U[2]),ue[0]&16&&Ke!==(Ke=U[4]?"保存修改":"建档")&&me(De,Ke),U[4]?Ye?Ye.p(U,ue):(Ye=za(U),Ye.c(),Ye.m(Te,null)):Ye&&(Ye.d(1),Ye=null),ue[0]&1&&b!==(b=U[0].length+"")&&me(k,b),ue[0]&1537){O=je(U[0]);let we;for(we=0;we<O.length;we+=1){const ct=Ua(U,O,we);ye[we]?ye[we].p(ct,ue):(ye[we]=ka(ct),ye[we].c(),ye[we].m(K,null))}for(;we<ye.length;we+=1)ye[we].d(1);ye.length=O.length}},i:at,o:at,d(U){U&&(Ae(e),Ae(be),Ae(Je)),dt(Oe,U),dt(Se,U),dt(Ie,U),Ye&&Ye.d(),dt(ye,U),He=!1,Tt(V)}}}function Rf(i,e,t){let n=[],r={name:"",age:"",township:ns[0],phonemeCount:0,year:new Date().getFullYear(),features:[]},s="",a=[],o=null;async function l(){t(0,n=await Yt("informants"))}Xn(l);function c(){const P=r.year,X=n.filter(z=>z.code&&z.code.startsWith(`F${P}`)).length+1;return`F${P}-${String(X).padStart(3,"0")}`}function h(){s.trim()&&(t(3,a=[...a,{name:s.trim(),note:""}]),t(2,s=""))}function u(P){t(1,r.features=r.features.includes(P)?r.features.filter(X=>X!==P):[...r.features,P],r)}async function f(){if(!r.name.trim()){alert("请填写姓名");return}const P={code:o?n.find(X=>X.id===o).code:c(),name:r.name.trim(),age:+r.age||0,township:r.township,phonemeCount:+r.phonemeCount||0,year:+r.year,features:[...r.features],recordings:a,createdAt:Date.now()};o?(P.id=o,await ts("informants",P)):await dr("informants",P),v(),await l()}function m(P){t(4,o=P.id),t(1,r={name:P.name,age:P.age,township:P.township,phonemeCount:P.phonemeCount,year:P.year,features:[...P.features||[]]}),t(3,a=(P.recordings||[]).map(X=>({...X})))}async function g(P){confirm("确认删除该发音人档案?")&&(await ca("informants",P),await l())}function v(){t(4,o=null),t(1,r={name:"",age:"",township:ns[0],phonemeCount:0,year:new Date().getFullYear(),features:[]}),t(3,a=[])}const p=P=>P.id===o;function d(){r.name=this.value,t(1,r)}function M(){r.age=Oi(this.value),t(1,r)}function S(){r.township=Ii(this),t(1,r)}function y(){r.phonemeCount=Oi(this.value),t(1,r)}function R(){r.year=Oi(this.value),t(1,r)}const A=P=>u(P);function T(P,X){P[X].name=this.value,t(3,a)}function I(P,X){P[X].note=this.value,t(3,a)}const H=P=>t(3,a=a.filter((X,z)=>z!==P));function x(){s=this.value,t(2,s)}return[n,r,s,a,o,c,h,u,f,m,g,v,p,d,M,S,y,R,A,T,I,H,x,P=>P.key==="Enter"&&h(),P=>m(P),P=>g(P.id)]}class Cf extends jn{constructor(e){super(),$n(this,e,Rf,wf,wn,{},null,[-1,-1])}}function Ha(i,e,t){const n=i.slice();return n[18]=e[t],n}function Ga(i,e,t){const n=i.slice();return n[21]=e[t],n}function Va(i,e,t){const n=i.slice();return n[24]=e[t],n}function Wa(i){let e,t,n=i[24].code+"",r,s,a=i[24].name+"",o,l,c,h;function u(){return i[12](i[24])}return{c(){e=D("label"),t=D("input"),r=B(n),s=J(),o=B(a),l=J(),$(t,"type","checkbox"),t.hidden=!0,$(e,"class","chip svelte-1fj5nxz"),ln(e,"on",i[2].informantIds.includes(i[24].id))},m(f,m){Ce(f,e,m),_(e,t),_(e,r),_(e,s),_(e,o),_(e,l),c||(h=Xe(t,"change",u),c=!0)},p(f,m){i=f,m&2&&n!==(n=i[24].code+"")&&me(r,n),m&2&&a!==(a=i[24].name+"")&&me(o,a),m&6&&ln(e,"on",i[2].informantIds.includes(i[24].id))},d(f){f&&Ae(e),c=!1,h()}}}function Xa(i){let e,t,n=i[3].map(Ka).join("、")+"",r;return{c(){e=D("div"),t=B("待上传:"),r=B(n),$(e,"class","muted")},m(s,a){Ce(s,e,a),_(e,t),_(e,r)},p(s,a){a&8&&n!==(n=s[3].map(Ka).join("、")+"")&&me(r,n)},d(s){s&&Ae(e)}}}function qa(i){let e,t,n,r=(i[18].informantIds.map(i[9]).join("、")||"无")+"",s,a,o,l,c=(i[18].note||"无")+"",h,u,f,m,g=je(i[18].files),v=[];for(let d=0;d<g.length;d+=1)v[d]=$a(Ga(i,g,d));let p=null;return g.length||(p=Ya()),{c(){e=D("div"),t=D("div"),n=B("发音人:"),s=B(r),a=J(),o=D("div"),l=B("备注:"),h=B(c),u=J(),f=D("div"),m=B(`原始记音表:
            `);for(let d=0;d<v.length;d+=1)v[d].c();p&&p.c(),$(e,"class","batch-body svelte-1fj5nxz")},m(d,M){Ce(d,e,M),_(e,t),_(t,n),_(t,s),_(e,a),_(e,o),_(o,l),_(o,h),_(e,u),_(e,f),_(f,m);for(let S=0;S<v.length;S+=1)v[S]&&v[S].m(f,null);p&&p.m(f,null)},p(d,M){if(M&1&&r!==(r=(d[18].informantIds.map(d[9]).join("、")||"无")+"")&&me(s,r),M&1&&c!==(c=(d[18].note||"无")+"")&&me(h,c),M&1){g=je(d[18].files);let S;for(S=0;S<g.length;S+=1){const y=Ga(d,g,S);v[S]?v[S].p(y,M):(v[S]=$a(y),v[S].c(),v[S].m(f,null))}for(;S<v.length;S+=1)v[S].d(1);v.length=g.length,!g.length&&p?p.p(d,M):g.length?p&&(p.d(1),p=null):(p=Ya(),p.c(),p.m(f,null))}},d(d){d&&Ae(e),dt(v,d),p&&p.d()}}}function Ya(i){let e;return{c(){e=D("span"),e.textContent="无",$(e,"class","muted")},m(t,n){Ce(t,e,n)},p:at,d(t){t&&Ae(e)}}}function $a(i){let e,t,n=i[21].name+"",r,s,a,o,l=(i[21].size/1024).toFixed(1)+"",c,h,u,f,m,g,v;function p(){return i[16](i[21])}return{c(){e=D("div"),t=B("📄 "),r=B(n),s=J(),a=D("span"),o=B("("),c=B(l),h=B(" KB)"),u=J(),f=D("button"),f.textContent="下载",m=J(),$(a,"class","muted"),$(f,"class","ghost"),$(e,"class","file-row svelte-1fj5nxz")},m(d,M){Ce(d,e,M),_(e,t),_(e,r),_(e,s),_(e,a),_(a,o),_(a,c),_(a,h),_(e,u),_(e,f),_(e,m),g||(v=Xe(f,"click",p),g=!0)},p(d,M){i=d,M&1&&n!==(n=i[21].name+"")&&me(r,n),M&1&&l!==(l=(i[21].size/1024).toFixed(1)+"")&&me(c,l)},d(d){d&&Ae(e),g=!1,v()}}}function ja(i){let e,t,n,r=i[18].name+"",s,a,o,l=i[18].date+"",c,h,u=i[18].informantIds.length+"",f,m,g=i[18].files.length+"",v,p,d,M,S,y,R,A;function T(){return i[14](i[18])}function I(){return i[15](i[18])}let H=i[4]===i[18].id&&qa(i);return{c(){e=D("div"),t=D("div"),n=D("b"),s=B(r),a=J(),o=D("span"),c=B(l),h=B(" · 发音人 "),f=B(u),m=B(" 人 · 记音表 "),v=B(g),p=B(" 份"),d=J(),M=D("button"),M.textContent="删除",S=J(),H&&H.c(),y=J(),$(o,"class","muted"),$(M,"class","danger"),Ht(M,"float","right"),$(t,"class","batch-head svelte-1fj5nxz"),$(e,"class","batch svelte-1fj5nxz")},m(x,E){Ce(x,e,E),_(e,t),_(t,n),_(n,s),_(t,a),_(t,o),_(o,c),_(o,h),_(o,f),_(o,m),_(o,v),_(o,p),_(t,d),_(t,M),_(e,S),H&&H.m(e,null),_(e,y),R||(A=[Xe(M,"click",cf(T)),Xe(t,"click",I)],R=!0)},p(x,E){i=x,E&1&&r!==(r=i[18].name+"")&&me(s,r),E&1&&l!==(l=i[18].date+"")&&me(c,l),E&1&&u!==(u=i[18].informantIds.length+"")&&me(f,u),E&1&&g!==(g=i[18].files.length+"")&&me(v,g),i[4]===i[18].id?H?H.p(i,E):(H=qa(i),H.c(),H.m(e,y)):H&&(H.d(1),H=null)},d(x){x&&Ae(e),H&&H.d(),R=!1,Tt(A)}}}function Pf(i){let e,t,n,r,s,a,o,l,c,h,u,f,m,g,v,p,d,M,S,y,R,A,T,I,H,x,E,N,L,P,X,z,re=i[0].length+"",q,fe,Me,_e,Ne,Pe=je(i[1]),Z=[];for(let le=0;le<Pe.length;le+=1)Z[le]=Wa(Va(i,Pe,le));let oe=i[3].length&&Xa(i),de=je(i[0]),ce=[];for(let le=0;le<de.length;le+=1)ce[le]=ja(Ha(i,de,le));return{c(){e=D("div"),t=D("h3"),t.textContent="新建调查批次",n=J(),r=D("div"),s=D("label"),a=B("批次名称 "),o=D("input"),l=J(),c=D("label"),h=B("调查日期 "),u=D("input"),f=J(),m=D("div"),g=D("span"),g.textContent="关联发音人:",v=J();for(let le=0;le<Z.length;le+=1)Z[le].c();p=J(),d=D("div"),M=D("label"),S=B("挂接原始记音表 "),y=D("input"),R=J(),oe&&oe.c(),A=J(),T=D("div"),I=D("label"),H=B("备注 "),x=D("input"),E=J(),N=D("button"),N.textContent="创建批次",L=J(),P=D("div"),X=D("h3"),z=B("批次列表("),q=B(re),fe=B(")"),Me=J();for(let le=0;le<ce.length;le+=1)ce[le].c();$(t,"class","svelte-1fj5nxz"),$(o,"placeholder","如:2024 城关片第一批"),$(u,"type","date"),$(r,"class","row svelte-1fj5nxz"),$(m,"class","row svelte-1fj5nxz"),$(y,"type","file"),y.multiple=!0,$(d,"class","row svelte-1fj5nxz"),Ht(x,"width","100%"),Ht(I,"flex","1"),$(T,"class","row svelte-1fj5nxz"),$(e,"class","card"),$(X,"class","svelte-1fj5nxz"),$(P,"class","card")},m(le,ge){Ce(le,e,ge),_(e,t),_(e,n),_(e,r),_(r,s),_(s,a),_(s,o),tt(o,i[2].name),_(r,l),_(r,c),_(c,h),_(c,u),tt(u,i[2].date),_(e,f),_(e,m),_(m,g),_(m,v);for(let he=0;he<Z.length;he+=1)Z[he]&&Z[he].m(m,null);_(e,p),_(e,d),_(d,M),_(M,S),_(M,y),_(e,R),oe&&oe.m(e,null),_(e,A),_(e,T),_(T,I),_(I,H),_(I,x),tt(x,i[2].note),_(e,E),_(e,N),Ce(le,L,ge),Ce(le,P,ge),_(P,X),_(X,z),_(X,q),_(X,fe),_(P,Me);for(let he=0;he<ce.length;he+=1)ce[he]&&ce[he].m(P,null);_e||(Ne=[Xe(o,"input",i[10]),Xe(u,"input",i[11]),Xe(y,"change",i[5]),Xe(x,"input",i[13]),Xe(N,"click",i[7])],_e=!0)},p(le,[ge]){if(ge&4&&o.value!==le[2].name&&tt(o,le[2].name),ge&4&&tt(u,le[2].date),ge&70){Pe=je(le[1]);let he;for(he=0;he<Pe.length;he+=1){const ve=Va(le,Pe,he);Z[he]?Z[he].p(ve,ge):(Z[he]=Wa(ve),Z[he].c(),Z[he].m(m,null))}for(;he<Z.length;he+=1)Z[he].d(1);Z.length=Pe.length}if(le[3].length?oe?oe.p(le,ge):(oe=Xa(le),oe.c(),oe.m(e,A)):oe&&(oe.d(1),oe=null),ge&4&&x.value!==le[2].note&&tt(x,le[2].note),ge&1&&re!==(re=le[0].length+"")&&me(q,re),ge&785){de=je(le[0]);let he;for(he=0;he<de.length;he+=1){const ve=Ha(le,de,he);ce[he]?ce[he].p(ve,ge):(ce[he]=ja(ve),ce[he].c(),ce[he].m(P,null))}for(;he<ce.length;he+=1)ce[he].d(1);ce.length=de.length}},i:at,o:at,d(le){le&&(Ae(e),Ae(L),Ae(P)),dt(Z,le),oe&&oe.d(),dt(ce,le),_e=!1,Tt(Ne)}}}function Lf(i){const e=URL.createObjectURL(i.blob),t=document.createElement("a");t.href=e,t.download=i.name,t.click(),URL.revokeObjectURL(e)}const Ka=i=>i.name;function Df(i,e,t){let n=[],r=[],s={name:"",date:new Date().toISOString().slice(0,10),informantIds:[],note:""},a=[],o=null;async function l(){t(0,n=(await Yt("batches")).sort((R,A)=>A.id-R.id)),t(1,r=await Yt("informants"))}Xn(l);function c(R){for(const A of R.target.files)t(3,a=[...a,{name:A.name,type:A.type,size:A.size,blob:A}]);R.target.value=""}function h(R){t(2,s.informantIds=s.informantIds.includes(R)?s.informantIds.filter(A=>A!==R):[...s.informantIds,R],s)}async function u(){if(!s.name.trim()){alert("请填写批次名称");return}await dr("batches",{name:s.name.trim(),date:s.date,informantIds:[...s.informantIds],note:s.note,files:a.map(R=>({name:R.name,type:R.type,size:R.size,blob:R.blob})),createdAt:Date.now()}),t(2,s={name:"",date:new Date().toISOString().slice(0,10),informantIds:[],note:""}),t(3,a=[]),await l()}async function f(R){confirm("确认删除该批次及其记音表文件?")&&(await ca("batches",R),await l())}function m(R){const A=r.find(T=>T.id===R);return A?`${A.code} ${A.name}`:`#${R}`}function g(){s.name=this.value,t(2,s)}function v(){s.date=this.value,t(2,s)}const p=R=>h(R.id);function d(){s.note=this.value,t(2,s)}return[n,r,s,a,o,c,h,u,f,m,g,v,p,d,R=>f(R.id),R=>t(4,o=o===R.id?null:R.id),R=>Lf(R)]}class If extends jn{constructor(e){super(),$n(this,e,Df,Pf,wn,{})}}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ua="169",Uf=0,Za=1,Nf=2,pu=1,Ff=2,vn=3,Gn=0,Nt=1,xn=2,Bn=0,zi=1,Ja=2,Qa=3,el=4,Of=5,oi=100,Bf=101,zf=102,kf=103,Hf=104,Gf=200,Vf=201,Wf=202,Xf=203,uo=204,fo=205,qf=206,Yf=207,$f=208,jf=209,Kf=210,Zf=211,Jf=212,Qf=213,eh=214,ho=0,po=1,mo=2,Vi=3,_o=4,go=5,vo=6,xo=7,fa=0,th=1,nh=2,zn=0,ih=1,rh=2,sh=3,oh=4,ah=5,lh=6,ch=7,mu=300,Wi=301,Xi=302,So=303,Mo=304,ps=306,Eo=1e3,ci=1001,yo=1002,qt=1003,uh=1004,yr=1005,Qt=1006,Ts=1007,ui=1008,An=1009,_u=1010,gu=1011,fr=1012,ha=1013,fi=1014,En=1015,pr=1016,da=1017,pa=1018,qi=1020,vu=35902,xu=1021,Su=1022,tn=1023,Mu=1024,Eu=1025,ki=1026,Yi=1027,yu=1028,ma=1029,bu=1030,_a=1031,ga=1033,Yr=33776,$r=33777,jr=33778,Kr=33779,bo=35840,To=35841,Ao=35842,wo=35843,Ro=36196,Co=37492,Po=37496,Lo=37808,Do=37809,Io=37810,Uo=37811,No=37812,Fo=37813,Oo=37814,Bo=37815,zo=37816,ko=37817,Ho=37818,Go=37819,Vo=37820,Wo=37821,Zr=36492,Xo=36494,qo=36495,Tu=36283,Yo=36284,$o=36285,jo=36286,fh=3200,hh=3201,Au=0,dh=1,Nn="",sn="srgb",Kn="srgb-linear",va="display-p3",ms="display-p3-linear",is="linear",ht="srgb",rs="rec709",ss="p3",gi=7680,tl=519,ph=512,mh=513,_h=514,wu=515,gh=516,vh=517,xh=518,Sh=519,nl=35044,il="300 es",yn=2e3,os=2001;class ji{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const r=n.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const At=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],As=Math.PI/180,Ko=180/Math.PI;function mr(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(At[i&255]+At[i>>8&255]+At[i>>16&255]+At[i>>24&255]+"-"+At[e&255]+At[e>>8&255]+"-"+At[e>>16&15|64]+At[e>>24&255]+"-"+At[t&63|128]+At[t>>8&255]+"-"+At[t>>16&255]+At[t>>24&255]+At[n&255]+At[n>>8&255]+At[n>>16&255]+At[n>>24&255]).toLowerCase()}function Ut(i,e,t){return Math.max(e,Math.min(t,i))}function Mh(i,e){return(i%e+e)%e}function ws(i,e,t){return(1-t)*i+t*e}function Ji(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function It(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class lt{constructor(e=0,t=0){lt.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*r+e.x,this.y=s*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class et{constructor(e,t,n,r,s,a,o,l,c){et.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,a,o,l,c)}set(e,t,n,r,s,a,o,l,c){const h=this.elements;return h[0]=e,h[1]=r,h[2]=o,h[3]=t,h[4]=s,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],m=n[5],g=n[8],v=r[0],p=r[3],d=r[6],M=r[1],S=r[4],y=r[7],R=r[2],A=r[5],T=r[8];return s[0]=a*v+o*M+l*R,s[3]=a*p+o*S+l*A,s[6]=a*d+o*y+l*T,s[1]=c*v+h*M+u*R,s[4]=c*p+h*S+u*A,s[7]=c*d+h*y+u*T,s[2]=f*v+m*M+g*R,s[5]=f*p+m*S+g*A,s[8]=f*d+m*y+g*T,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*s*h+n*o*l+r*s*c-r*a*l}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,f=o*l-h*s,m=c*s-a*l,g=t*u+n*f+r*m;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=u*v,e[1]=(r*c-h*n)*v,e[2]=(o*n-r*a)*v,e[3]=f*v,e[4]=(h*t-r*l)*v,e[5]=(r*s-o*t)*v,e[6]=m*v,e[7]=(n*l-c*t)*v,e[8]=(a*t-n*s)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-r*c,r*l,-r*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Rs.makeScale(e,t)),this}rotate(e){return this.premultiply(Rs.makeRotation(-e)),this}translate(e,t){return this.premultiply(Rs.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Rs=new et;function Ru(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function as(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Eh(){const i=as("canvas");return i.style.display="block",i}const rl={};function Jr(i){i in rl||(rl[i]=!0,console.warn(i))}function yh(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function bh(i){const e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Th(i){const e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const sl=new et().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),ol=new et().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Qi={[Kn]:{transfer:is,primaries:rs,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i,fromReference:i=>i},[sn]:{transfer:ht,primaries:rs,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[ms]:{transfer:is,primaries:ss,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.applyMatrix3(ol),fromReference:i=>i.applyMatrix3(sl)},[va]:{transfer:ht,primaries:ss,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.convertSRGBToLinear().applyMatrix3(ol),fromReference:i=>i.applyMatrix3(sl).convertLinearToSRGB()}},Ah=new Set([Kn,ms]),ot={enabled:!0,_workingColorSpace:Kn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!Ah.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;const n=Qi[e].toReference,r=Qi[t].fromReference;return r(n(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return Qi[i].primaries},getTransfer:function(i){return i===Nn?is:Qi[i].transfer},getLuminanceCoefficients:function(i,e=this._workingColorSpace){return i.fromArray(Qi[e].luminanceCoefficients)}};function Hi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Cs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let vi;class wh{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{vi===void 0&&(vi=as("canvas")),vi.width=e.width,vi.height=e.height;const n=vi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=vi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=as("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=Hi(s[a]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Hi(t[n]/255)*255):t[n]=Hi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Rh=0;class Cu{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Rh++}),this.uuid=mr(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(Ps(r[a].image)):s.push(Ps(r[a]))}else s=Ps(r);n.url=s}return t||(e.images[this.uuid]=n),n}}function Ps(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?wh.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Ch=0;class Ft extends ji{constructor(e=Ft.DEFAULT_IMAGE,t=Ft.DEFAULT_MAPPING,n=ci,r=ci,s=Qt,a=ui,o=tn,l=An,c=Ft.DEFAULT_ANISOTROPY,h=Nn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ch++}),this.uuid=mr(),this.name="",this.source=new Cu(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new lt(0,0),this.repeat=new lt(1,1),this.center=new lt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new et,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==mu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Eo:e.x=e.x-Math.floor(e.x);break;case ci:e.x=e.x<0?0:1;break;case yo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Eo:e.y=e.y-Math.floor(e.y);break;case ci:e.y=e.y<0?0:1;break;case yo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Ft.DEFAULT_IMAGE=null;Ft.DEFAULT_MAPPING=mu;Ft.DEFAULT_ANISOTROPY=1;class _t{constructor(e=0,t=0,n=0,r=1){_t.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s;const l=e.elements,c=l[0],h=l[4],u=l[8],f=l[1],m=l[5],g=l[9],v=l[2],p=l[6],d=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-v)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+v)<.1&&Math.abs(g+p)<.1&&Math.abs(c+m+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const S=(c+1)/2,y=(m+1)/2,R=(d+1)/2,A=(h+f)/4,T=(u+v)/4,I=(g+p)/4;return S>y&&S>R?S<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(S),r=A/n,s=T/n):y>R?y<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(y),n=A/r,s=I/r):R<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(R),n=T/s,r=I/s),this.set(n,r,s,t),this}let M=Math.sqrt((p-g)*(p-g)+(u-v)*(u-v)+(f-h)*(f-h));return Math.abs(M)<.001&&(M=1),this.x=(p-g)/M,this.y=(u-v)/M,this.z=(f-h)/M,this.w=Math.acos((c+m+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Ph extends ji{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new _t(0,0,e,t),this.scissorTest=!1,this.viewport=new _t(0,0,e,t);const r={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Qt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new Ft(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,r=e.textures.length;n<r;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Cu(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class hi extends Ph{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Pu extends Ft{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=qt,this.minFilter=qt,this.wrapR=ci,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Lh extends Ft{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=qt,this.minFilter=qt,this.wrapR=ci,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class _r{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,a,o){let l=n[r+0],c=n[r+1],h=n[r+2],u=n[r+3];const f=s[a+0],m=s[a+1],g=s[a+2],v=s[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(o===1){e[t+0]=f,e[t+1]=m,e[t+2]=g,e[t+3]=v;return}if(u!==v||l!==f||c!==m||h!==g){let p=1-o;const d=l*f+c*m+h*g+u*v,M=d>=0?1:-1,S=1-d*d;if(S>Number.EPSILON){const R=Math.sqrt(S),A=Math.atan2(R,d*M);p=Math.sin(p*A)/R,o=Math.sin(o*A)/R}const y=o*M;if(l=l*p+f*y,c=c*p+m*y,h=h*p+g*y,u=u*p+v*y,p===1-o){const R=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=R,c*=R,h*=R,u*=R}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,s,a){const o=n[r],l=n[r+1],c=n[r+2],h=n[r+3],u=s[a],f=s[a+1],m=s[a+2],g=s[a+3];return e[t]=o*g+h*u+l*m-c*f,e[t+1]=l*g+h*f+c*u-o*m,e[t+2]=c*g+h*m+o*f-l*u,e[t+3]=h*g-o*u-l*f-c*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(r/2),u=o(s/2),f=l(n/2),m=l(r/2),g=l(s/2);switch(a){case"XYZ":this._x=f*h*u+c*m*g,this._y=c*m*u-f*h*g,this._z=c*h*g+f*m*u,this._w=c*h*u-f*m*g;break;case"YXZ":this._x=f*h*u+c*m*g,this._y=c*m*u-f*h*g,this._z=c*h*g-f*m*u,this._w=c*h*u+f*m*g;break;case"ZXY":this._x=f*h*u-c*m*g,this._y=c*m*u+f*h*g,this._z=c*h*g+f*m*u,this._w=c*h*u-f*m*g;break;case"ZYX":this._x=f*h*u-c*m*g,this._y=c*m*u+f*h*g,this._z=c*h*g-f*m*u,this._w=c*h*u+f*m*g;break;case"YZX":this._x=f*h*u+c*m*g,this._y=c*m*u+f*h*g,this._z=c*h*g-f*m*u,this._w=c*h*u-f*m*g;break;case"XZY":this._x=f*h*u-c*m*g,this._y=c*m*u-f*h*g,this._z=c*h*g+f*m*u,this._w=c*h*u+f*m*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],r=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],f=n+o+u;if(f>0){const m=.5/Math.sqrt(f+1);this._w=.25/m,this._x=(h-l)*m,this._y=(s-c)*m,this._z=(a-r)*m}else if(n>o&&n>u){const m=2*Math.sqrt(1+n-o-u);this._w=(h-l)/m,this._x=.25*m,this._y=(r+a)/m,this._z=(s+c)/m}else if(o>u){const m=2*Math.sqrt(1+o-n-u);this._w=(s-c)/m,this._x=(r+a)/m,this._y=.25*m,this._z=(l+h)/m}else{const m=2*Math.sqrt(1+u-n-o);this._w=(a-r)/m,this._x=(s+c)/m,this._y=(l+h)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ut(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,r=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+r*c-s*l,this._y=r*h+a*l+s*o-n*c,this._z=s*h+a*c+n*l-r*o,this._w=a*h-n*o-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,r=this._y,s=this._z,a=this._w;let o=a*e._w+n*e._x+r*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=r,this._z=s,this;const l=1-o*o;if(l<=Number.EPSILON){const m=1-t;return this._w=m*a+t*this._w,this._x=m*n+t*this._x,this._y=m*r+t*this._y,this._z=m*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-t)*h)/c,f=Math.sin(t*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=r*u+this._y*f,this._z=s*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class te{constructor(e=0,t=0,n=0){te.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(al.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(al.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*r-o*n),h=2*(o*t-s*r),u=2*(s*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-s*u,this.z=r+l*u+s*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,r=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=r*l-s*o,this.y=s*a-n*l,this.z=n*o-r*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ls.copy(this).projectOnVector(e),this.sub(Ls)}reflect(e){return this.sub(Ls.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Ls=new te,al=new _r;class gr{constructor(e=new te(1/0,1/0,1/0),t=new te(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(jt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(jt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=jt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,jt):jt.fromBufferAttribute(s,a),jt.applyMatrix4(e.matrixWorld),this.expandByPoint(jt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),br.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),br.copy(n.boundingBox)),br.applyMatrix4(e.matrixWorld),this.union(br)}const r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,jt),jt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(er),Tr.subVectors(this.max,er),xi.subVectors(e.a,er),Si.subVectors(e.b,er),Mi.subVectors(e.c,er),Cn.subVectors(Si,xi),Pn.subVectors(Mi,Si),Jn.subVectors(xi,Mi);let t=[0,-Cn.z,Cn.y,0,-Pn.z,Pn.y,0,-Jn.z,Jn.y,Cn.z,0,-Cn.x,Pn.z,0,-Pn.x,Jn.z,0,-Jn.x,-Cn.y,Cn.x,0,-Pn.y,Pn.x,0,-Jn.y,Jn.x,0];return!Ds(t,xi,Si,Mi,Tr)||(t=[1,0,0,0,1,0,0,0,1],!Ds(t,xi,Si,Mi,Tr))?!1:(Ar.crossVectors(Cn,Pn),t=[Ar.x,Ar.y,Ar.z],Ds(t,xi,Si,Mi,Tr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,jt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(jt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(dn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),dn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),dn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),dn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),dn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),dn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),dn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),dn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(dn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const dn=[new te,new te,new te,new te,new te,new te,new te,new te],jt=new te,br=new gr,xi=new te,Si=new te,Mi=new te,Cn=new te,Pn=new te,Jn=new te,er=new te,Tr=new te,Ar=new te,Qn=new te;function Ds(i,e,t,n,r){for(let s=0,a=i.length-3;s<=a;s+=3){Qn.fromArray(i,s);const o=r.x*Math.abs(Qn.x)+r.y*Math.abs(Qn.y)+r.z*Math.abs(Qn.z),l=e.dot(Qn),c=t.dot(Qn),h=n.dot(Qn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const Dh=new gr,tr=new te,Is=new te;class _s{constructor(e=new te,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Dh.setFromPoints(e).getCenter(n);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;tr.subVectors(e,this.center);const t=tr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(tr,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Is.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(tr.copy(e.center).add(Is)),this.expandByPoint(tr.copy(e.center).sub(Is))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const pn=new te,Us=new te,wr=new te,Ln=new te,Ns=new te,Rr=new te,Fs=new te;class Lu{constructor(e=new te,t=new te(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,pn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=pn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(pn.copy(this.origin).addScaledVector(this.direction,t),pn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Us.copy(e).add(t).multiplyScalar(.5),wr.copy(t).sub(e).normalize(),Ln.copy(this.origin).sub(Us);const s=e.distanceTo(t)*.5,a=-this.direction.dot(wr),o=Ln.dot(this.direction),l=-Ln.dot(wr),c=Ln.lengthSq(),h=Math.abs(1-a*a);let u,f,m,g;if(h>0)if(u=a*l-o,f=a*o-l,g=s*h,u>=0)if(f>=-g)if(f<=g){const v=1/h;u*=v,f*=v,m=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=s,u=Math.max(0,-(a*f+o)),m=-u*u+f*(f+2*l)+c;else f=-s,u=Math.max(0,-(a*f+o)),m=-u*u+f*(f+2*l)+c;else f<=-g?(u=Math.max(0,-(-a*s+o)),f=u>0?-s:Math.min(Math.max(-s,-l),s),m=-u*u+f*(f+2*l)+c):f<=g?(u=0,f=Math.min(Math.max(-s,-l),s),m=f*(f+2*l)+c):(u=Math.max(0,-(a*s+o)),f=u>0?s:Math.min(Math.max(-s,-l),s),m=-u*u+f*(f+2*l)+c);else f=a>0?-s:s,u=Math.max(0,-(a*f+o)),m=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Us).addScaledVector(wr,f),m}intersectSphere(e,t){pn.subVectors(e.center,this.origin);const n=pn.dot(this.direction),r=pn.dot(pn)-n*n,s=e.radius*e.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,r=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,r=(e.min.x-f.x)*c),h>=0?(s=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(s=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),n>a||s>r||((s>n||isNaN(n))&&(n=s),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-f.z)*u,l=(e.max.z-f.z)*u):(o=(e.max.z-f.z)*u,l=(e.min.z-f.z)*u),n>l||o>r)||((o>n||n!==n)&&(n=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,pn)!==null}intersectTriangle(e,t,n,r,s){Ns.subVectors(t,e),Rr.subVectors(n,e),Fs.crossVectors(Ns,Rr);let a=this.direction.dot(Fs),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ln.subVectors(this.origin,e);const l=o*this.direction.dot(Rr.crossVectors(Ln,Rr));if(l<0)return null;const c=o*this.direction.dot(Ns.cross(Ln));if(c<0||l+c>a)return null;const h=-o*Ln.dot(Fs);return h<0?null:this.at(h/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class pt{constructor(e,t,n,r,s,a,o,l,c,h,u,f,m,g,v,p){pt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,a,o,l,c,h,u,f,m,g,v,p)}set(e,t,n,r,s,a,o,l,c,h,u,f,m,g,v,p){const d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=r,d[1]=s,d[5]=a,d[9]=o,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=f,d[3]=m,d[7]=g,d[11]=v,d[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new pt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,r=1/Ei.setFromMatrixColumn(e,0).length(),s=1/Ei.setFromMatrixColumn(e,1).length(),a=1/Ei.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,r=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(r),c=Math.sin(r),h=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){const f=a*h,m=a*u,g=o*h,v=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=m+g*c,t[5]=f-v*c,t[9]=-o*l,t[2]=v-f*c,t[6]=g+m*c,t[10]=a*l}else if(e.order==="YXZ"){const f=l*h,m=l*u,g=c*h,v=c*u;t[0]=f+v*o,t[4]=g*o-m,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=m*o-g,t[6]=v+f*o,t[10]=a*l}else if(e.order==="ZXY"){const f=l*h,m=l*u,g=c*h,v=c*u;t[0]=f-v*o,t[4]=-a*u,t[8]=g+m*o,t[1]=m+g*o,t[5]=a*h,t[9]=v-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const f=a*h,m=a*u,g=o*h,v=o*u;t[0]=l*h,t[4]=g*c-m,t[8]=f*c+v,t[1]=l*u,t[5]=v*c+f,t[9]=m*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const f=a*l,m=a*c,g=o*l,v=o*c;t[0]=l*h,t[4]=v-f*u,t[8]=g*u+m,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=m*u+g,t[10]=f-v*u}else if(e.order==="XZY"){const f=a*l,m=a*c,g=o*l,v=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=f*u+v,t[5]=a*h,t[9]=m*u-g,t[2]=g*u-m,t[6]=o*h,t[10]=v*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Ih,e,Uh)}lookAt(e,t,n){const r=this.elements;return zt.subVectors(e,t),zt.lengthSq()===0&&(zt.z=1),zt.normalize(),Dn.crossVectors(n,zt),Dn.lengthSq()===0&&(Math.abs(n.z)===1?zt.x+=1e-4:zt.z+=1e-4,zt.normalize(),Dn.crossVectors(n,zt)),Dn.normalize(),Cr.crossVectors(zt,Dn),r[0]=Dn.x,r[4]=Cr.x,r[8]=zt.x,r[1]=Dn.y,r[5]=Cr.y,r[9]=zt.y,r[2]=Dn.z,r[6]=Cr.z,r[10]=zt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],m=n[13],g=n[2],v=n[6],p=n[10],d=n[14],M=n[3],S=n[7],y=n[11],R=n[15],A=r[0],T=r[4],I=r[8],H=r[12],x=r[1],E=r[5],N=r[9],L=r[13],P=r[2],X=r[6],z=r[10],re=r[14],q=r[3],fe=r[7],Me=r[11],_e=r[15];return s[0]=a*A+o*x+l*P+c*q,s[4]=a*T+o*E+l*X+c*fe,s[8]=a*I+o*N+l*z+c*Me,s[12]=a*H+o*L+l*re+c*_e,s[1]=h*A+u*x+f*P+m*q,s[5]=h*T+u*E+f*X+m*fe,s[9]=h*I+u*N+f*z+m*Me,s[13]=h*H+u*L+f*re+m*_e,s[2]=g*A+v*x+p*P+d*q,s[6]=g*T+v*E+p*X+d*fe,s[10]=g*I+v*N+p*z+d*Me,s[14]=g*H+v*L+p*re+d*_e,s[3]=M*A+S*x+y*P+R*q,s[7]=M*T+S*E+y*X+R*fe,s[11]=M*I+S*N+y*z+R*Me,s[15]=M*H+S*L+y*re+R*_e,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],f=e[10],m=e[14],g=e[3],v=e[7],p=e[11],d=e[15];return g*(+s*l*u-r*c*u-s*o*f+n*c*f+r*o*m-n*l*m)+v*(+t*l*m-t*c*f+s*a*f-r*a*m+r*c*h-s*l*h)+p*(+t*c*u-t*o*m-s*a*u+n*a*m+s*o*h-n*c*h)+d*(-r*o*h-t*l*u+t*o*f+r*a*u-n*a*f+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],f=e[10],m=e[11],g=e[12],v=e[13],p=e[14],d=e[15],M=u*p*c-v*f*c+v*l*m-o*p*m-u*l*d+o*f*d,S=g*f*c-h*p*c-g*l*m+a*p*m+h*l*d-a*f*d,y=h*v*c-g*u*c+g*o*m-a*v*m-h*o*d+a*u*d,R=g*u*l-h*v*l-g*o*f+a*v*f+h*o*p-a*u*p,A=t*M+n*S+r*y+s*R;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const T=1/A;return e[0]=M*T,e[1]=(v*f*s-u*p*s-v*r*m+n*p*m+u*r*d-n*f*d)*T,e[2]=(o*p*s-v*l*s+v*r*c-n*p*c-o*r*d+n*l*d)*T,e[3]=(u*l*s-o*f*s-u*r*c+n*f*c+o*r*m-n*l*m)*T,e[4]=S*T,e[5]=(h*p*s-g*f*s+g*r*m-t*p*m-h*r*d+t*f*d)*T,e[6]=(g*l*s-a*p*s-g*r*c+t*p*c+a*r*d-t*l*d)*T,e[7]=(a*f*s-h*l*s+h*r*c-t*f*c-a*r*m+t*l*m)*T,e[8]=y*T,e[9]=(g*u*s-h*v*s-g*n*m+t*v*m+h*n*d-t*u*d)*T,e[10]=(a*v*s-g*o*s+g*n*c-t*v*c-a*n*d+t*o*d)*T,e[11]=(h*o*s-a*u*s-h*n*c+t*u*c+a*n*m-t*o*m)*T,e[12]=R*T,e[13]=(h*v*r-g*u*r+g*n*f-t*v*f-h*n*p+t*u*p)*T,e[14]=(g*o*r-a*v*r-g*n*l+t*v*l+a*n*p-t*o*p)*T,e[15]=(a*u*r-h*o*r+h*n*l-t*u*l-a*n*f+t*o*f)*T,this}scale(e){const t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),r=Math.sin(t),s=1-n,a=e.x,o=e.y,l=e.z,c=s*a,h=s*o;return this.set(c*a+n,c*o-r*l,c*l+r*o,0,c*o+r*l,h*o+n,h*l-r*a,0,c*l-r*o,h*l+r*a,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,a){return this.set(1,n,s,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){const r=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,h=a+a,u=o+o,f=s*c,m=s*h,g=s*u,v=a*h,p=a*u,d=o*u,M=l*c,S=l*h,y=l*u,R=n.x,A=n.y,T=n.z;return r[0]=(1-(v+d))*R,r[1]=(m+y)*R,r[2]=(g-S)*R,r[3]=0,r[4]=(m-y)*A,r[5]=(1-(f+d))*A,r[6]=(p+M)*A,r[7]=0,r[8]=(g+S)*T,r[9]=(p-M)*T,r[10]=(1-(f+v))*T,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){const r=this.elements;let s=Ei.set(r[0],r[1],r[2]).length();const a=Ei.set(r[4],r[5],r[6]).length(),o=Ei.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Kt.copy(this);const c=1/s,h=1/a,u=1/o;return Kt.elements[0]*=c,Kt.elements[1]*=c,Kt.elements[2]*=c,Kt.elements[4]*=h,Kt.elements[5]*=h,Kt.elements[6]*=h,Kt.elements[8]*=u,Kt.elements[9]*=u,Kt.elements[10]*=u,t.setFromRotationMatrix(Kt),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,r,s,a,o=yn){const l=this.elements,c=2*s/(t-e),h=2*s/(n-r),u=(t+e)/(t-e),f=(n+r)/(n-r);let m,g;if(o===yn)m=-(a+s)/(a-s),g=-2*a*s/(a-s);else if(o===os)m=-a/(a-s),g=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,s,a,o=yn){const l=this.elements,c=1/(t-e),h=1/(n-r),u=1/(a-s),f=(t+e)*c,m=(n+r)*h;let g,v;if(o===yn)g=(a+s)*u,v=-2*u;else if(o===os)g=s*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-m,l[2]=0,l[6]=0,l[10]=v,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Ei=new te,Kt=new pt,Ih=new te(0,0,0),Uh=new te(1,1,1),Dn=new te,Cr=new te,zt=new te,ll=new pt,cl=new _r;class un{constructor(e=0,t=0,n=0,r=un.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],c=r[5],h=r[9],u=r[2],f=r[6],m=r[10];switch(t){case"XYZ":this._y=Math.asin(Ut(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,m),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ut(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(Ut(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,m),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Ut(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,m),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ut(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-Ut(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ll.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ll,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return cl.setFromEuler(this),this.setFromQuaternion(cl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}un.DEFAULT_ORDER="XYZ";class Du{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Nh=0;const ul=new te,yi=new _r,mn=new pt,Pr=new te,nr=new te,Fh=new te,Oh=new _r,fl=new te(1,0,0),hl=new te(0,1,0),dl=new te(0,0,1),pl={type:"added"},Bh={type:"removed"},bi={type:"childadded",child:null},Os={type:"childremoved",child:null};class bt extends ji{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Nh++}),this.uuid=mr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=bt.DEFAULT_UP.clone();const e=new te,t=new un,n=new _r,r=new te(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new pt},normalMatrix:{value:new et}}),this.matrix=new pt,this.matrixWorld=new pt,this.matrixAutoUpdate=bt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Du,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return yi.setFromAxisAngle(e,t),this.quaternion.multiply(yi),this}rotateOnWorldAxis(e,t){return yi.setFromAxisAngle(e,t),this.quaternion.premultiply(yi),this}rotateX(e){return this.rotateOnAxis(fl,e)}rotateY(e){return this.rotateOnAxis(hl,e)}rotateZ(e){return this.rotateOnAxis(dl,e)}translateOnAxis(e,t){return ul.copy(e).applyQuaternion(this.quaternion),this.position.add(ul.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(fl,e)}translateY(e){return this.translateOnAxis(hl,e)}translateZ(e){return this.translateOnAxis(dl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(mn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Pr.copy(e):Pr.set(e,t,n);const r=this.parent;this.updateWorldMatrix(!0,!1),nr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?mn.lookAt(nr,Pr,this.up):mn.lookAt(Pr,nr,this.up),this.quaternion.setFromRotationMatrix(mn),r&&(mn.extractRotation(r.matrixWorld),yi.setFromRotationMatrix(mn),this.quaternion.premultiply(yi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(pl),bi.child=e,this.dispatchEvent(bi),bi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Bh),Os.child=e,this.dispatchEvent(Os),Os.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),mn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),mn.multiply(e.parent.matrixWorld)),e.applyMatrix4(mn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(pl),bi.child=e,this.dispatchEvent(bi),bi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(nr,e,Fh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(nr,Oh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];s(e.shapes,u)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(s(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),f=a(e.skeletons),m=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),m.length>0&&(n.animations=m),g.length>0&&(n.nodes=g)}return n.object=r,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const r=e.children[n];this.add(r.clone())}return this}}bt.DEFAULT_UP=new te(0,1,0);bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Zt=new te,_n=new te,Bs=new te,gn=new te,Ti=new te,Ai=new te,ml=new te,zs=new te,ks=new te,Hs=new te,Gs=new _t,Vs=new _t,Ws=new _t;class en{constructor(e=new te,t=new te,n=new te){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Zt.subVectors(e,t),r.cross(Zt);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){Zt.subVectors(r,t),_n.subVectors(n,t),Bs.subVectors(e,t);const a=Zt.dot(Zt),o=Zt.dot(_n),l=Zt.dot(Bs),c=_n.dot(_n),h=_n.dot(Bs),u=a*c-o*o;if(u===0)return s.set(0,0,0),null;const f=1/u,m=(c*l-o*h)*f,g=(a*h-o*l)*f;return s.set(1-m-g,g,m)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,gn)===null?!1:gn.x>=0&&gn.y>=0&&gn.x+gn.y<=1}static getInterpolation(e,t,n,r,s,a,o,l){return this.getBarycoord(e,t,n,r,gn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,gn.x),l.addScaledVector(a,gn.y),l.addScaledVector(o,gn.z),l)}static getInterpolatedAttribute(e,t,n,r,s,a){return Gs.setScalar(0),Vs.setScalar(0),Ws.setScalar(0),Gs.fromBufferAttribute(e,t),Vs.fromBufferAttribute(e,n),Ws.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Gs,s.x),a.addScaledVector(Vs,s.y),a.addScaledVector(Ws,s.z),a}static isFrontFacing(e,t,n,r){return Zt.subVectors(n,t),_n.subVectors(e,t),Zt.cross(_n).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Zt.subVectors(this.c,this.b),_n.subVectors(this.a,this.b),Zt.cross(_n).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return en.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return en.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return en.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return en.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return en.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,r=this.b,s=this.c;let a,o;Ti.subVectors(r,n),Ai.subVectors(s,n),zs.subVectors(e,n);const l=Ti.dot(zs),c=Ai.dot(zs);if(l<=0&&c<=0)return t.copy(n);ks.subVectors(e,r);const h=Ti.dot(ks),u=Ai.dot(ks);if(h>=0&&u<=h)return t.copy(r);const f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(Ti,a);Hs.subVectors(e,s);const m=Ti.dot(Hs),g=Ai.dot(Hs);if(g>=0&&m<=g)return t.copy(s);const v=m*c-l*g;if(v<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(Ai,o);const p=h*g-m*u;if(p<=0&&u-h>=0&&m-g>=0)return ml.subVectors(s,r),o=(u-h)/(u-h+(m-g)),t.copy(r).addScaledVector(ml,o);const d=1/(p+v+f);return a=v*d,o=f*d,t.copy(n).addScaledVector(Ti,a).addScaledVector(Ai,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Iu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},In={h:0,s:0,l:0},Lr={h:0,s:0,l:0};function Xs(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class nt{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=sn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ot.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=ot.workingColorSpace){return this.r=e,this.g=t,this.b=n,ot.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=ot.workingColorSpace){if(e=Mh(e,1),t=Ut(t,0,1),n=Ut(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=Xs(a,s,e+1/3),this.g=Xs(a,s,e),this.b=Xs(a,s,e-1/3)}return ot.toWorkingColorSpace(this,r),this}setStyle(e,t=sn){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=sn){const n=Iu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Hi(e.r),this.g=Hi(e.g),this.b=Hi(e.b),this}copyLinearToSRGB(e){return this.r=Cs(e.r),this.g=Cs(e.g),this.b=Cs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=sn){return ot.fromWorkingColorSpace(wt.copy(this),e),Math.round(Ut(wt.r*255,0,255))*65536+Math.round(Ut(wt.g*255,0,255))*256+Math.round(Ut(wt.b*255,0,255))}getHexString(e=sn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ot.workingColorSpace){ot.fromWorkingColorSpace(wt.copy(this),t);const n=wt.r,r=wt.g,s=wt.b,a=Math.max(n,r,s),o=Math.min(n,r,s);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(r-s)/u+(r<s?6:0);break;case r:l=(s-n)/u+2;break;case s:l=(n-r)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=ot.workingColorSpace){return ot.fromWorkingColorSpace(wt.copy(this),t),e.r=wt.r,e.g=wt.g,e.b=wt.b,e}getStyle(e=sn){ot.fromWorkingColorSpace(wt.copy(this),e);const t=wt.r,n=wt.g,r=wt.b;return e!==sn?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(In),this.setHSL(In.h+e,In.s+t,In.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(In),e.getHSL(Lr);const n=ws(In.h,Lr.h,t),r=ws(In.s,Lr.s,t),s=ws(In.l,Lr.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const wt=new nt;nt.NAMES=Iu;let zh=0;class Ki extends ji{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:zh++}),this.uuid=mr(),this.name="",this.type="Material",this.blending=zi,this.side=Gn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=uo,this.blendDst=fo,this.blendEquation=oi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new nt(0,0,0),this.blendAlpha=0,this.depthFunc=Vi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=tl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=gi,this.stencilZFail=gi,this.stencilZPass=gi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==zi&&(n.blending=this.blending),this.side!==Gn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==uo&&(n.blendSrc=this.blendSrc),this.blendDst!==fo&&(n.blendDst=this.blendDst),this.blendEquation!==oi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Vi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==tl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==gi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==gi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==gi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(t){const s=r(e.textures),a=r(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Uu extends Ki{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new nt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new un,this.combine=fa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const vt=new te,Dr=new lt;class rn{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=nl,this.updateRanges=[],this.gpuType=En,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Dr.fromBufferAttribute(this,t),Dr.applyMatrix3(e),this.setXY(t,Dr.x,Dr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix3(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix4(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyNormalMatrix(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.transformDirection(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ji(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=It(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ji(t,this.array)),t}setX(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ji(t,this.array)),t}setY(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ji(t,this.array)),t}setZ(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ji(t,this.array)),t}setW(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array),r=It(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array),r=It(r,this.array),s=It(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==nl&&(e.usage=this.usage),e}}class Nu extends rn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Fu extends rn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class kn extends rn{constructor(e,t,n){super(new Float32Array(e),t,n)}}let kh=0;const Vt=new pt,qs=new bt,wi=new te,kt=new gr,ir=new gr,Et=new te;class fn extends ji{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:kh++}),this.uuid=mr(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ru(e)?Fu:Nu)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new et().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Vt.makeRotationFromQuaternion(e),this.applyMatrix4(Vt),this}rotateX(e){return Vt.makeRotationX(e),this.applyMatrix4(Vt),this}rotateY(e){return Vt.makeRotationY(e),this.applyMatrix4(Vt),this}rotateZ(e){return Vt.makeRotationZ(e),this.applyMatrix4(Vt),this}translate(e,t,n){return Vt.makeTranslation(e,t,n),this.applyMatrix4(Vt),this}scale(e,t,n){return Vt.makeScale(e,t,n),this.applyMatrix4(Vt),this}lookAt(e){return qs.lookAt(e),qs.updateMatrix(),this.applyMatrix4(qs.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(wi).negate(),this.translate(wi.x,wi.y,wi.z),this}setFromPoints(e){const t=[];for(let n=0,r=e.length;n<r;n++){const s=e[n];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new kn(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new gr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new te(-1/0,-1/0,-1/0),new te(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){const s=t[n];kt.setFromBufferAttribute(s),this.morphTargetsRelative?(Et.addVectors(this.boundingBox.min,kt.min),this.boundingBox.expandByPoint(Et),Et.addVectors(this.boundingBox.max,kt.max),this.boundingBox.expandByPoint(Et)):(this.boundingBox.expandByPoint(kt.min),this.boundingBox.expandByPoint(kt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new _s);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new te,1/0);return}if(e){const n=this.boundingSphere.center;if(kt.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];ir.setFromBufferAttribute(o),this.morphTargetsRelative?(Et.addVectors(kt.min,ir.min),kt.expandByPoint(Et),Et.addVectors(kt.max,ir.max),kt.expandByPoint(Et)):(kt.expandByPoint(ir.min),kt.expandByPoint(ir.max))}kt.getCenter(n);let r=0;for(let s=0,a=e.count;s<a;s++)Et.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(Et));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Et.fromBufferAttribute(o,c),l&&(wi.fromBufferAttribute(e,c),Et.add(wi)),r=Math.max(r,n.distanceToSquared(Et))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new rn(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let I=0;I<n.count;I++)o[I]=new te,l[I]=new te;const c=new te,h=new te,u=new te,f=new lt,m=new lt,g=new lt,v=new te,p=new te;function d(I,H,x){c.fromBufferAttribute(n,I),h.fromBufferAttribute(n,H),u.fromBufferAttribute(n,x),f.fromBufferAttribute(s,I),m.fromBufferAttribute(s,H),g.fromBufferAttribute(s,x),h.sub(c),u.sub(c),m.sub(f),g.sub(f);const E=1/(m.x*g.y-g.x*m.y);isFinite(E)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(u,-m.y).multiplyScalar(E),p.copy(u).multiplyScalar(m.x).addScaledVector(h,-g.x).multiplyScalar(E),o[I].add(v),o[H].add(v),o[x].add(v),l[I].add(p),l[H].add(p),l[x].add(p))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let I=0,H=M.length;I<H;++I){const x=M[I],E=x.start,N=x.count;for(let L=E,P=E+N;L<P;L+=3)d(e.getX(L+0),e.getX(L+1),e.getX(L+2))}const S=new te,y=new te,R=new te,A=new te;function T(I){R.fromBufferAttribute(r,I),A.copy(R);const H=o[I];S.copy(H),S.sub(R.multiplyScalar(R.dot(H))).normalize(),y.crossVectors(A,H);const E=y.dot(l[I])<0?-1:1;a.setXYZW(I,S.x,S.y,S.z,E)}for(let I=0,H=M.length;I<H;++I){const x=M[I],E=x.start,N=x.count;for(let L=E,P=E+N;L<P;L+=3)T(e.getX(L+0)),T(e.getX(L+1)),T(e.getX(L+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new rn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,m=n.count;f<m;f++)n.setXYZ(f,0,0,0);const r=new te,s=new te,a=new te,o=new te,l=new te,c=new te,h=new te,u=new te;if(e)for(let f=0,m=e.count;f<m;f+=3){const g=e.getX(f+0),v=e.getX(f+1),p=e.getX(f+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,v),a.fromBufferAttribute(t,p),h.subVectors(a,s),u.subVectors(r,s),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,p),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let f=0,m=t.count;f<m;f+=3)r.fromBufferAttribute(t,f+0),s.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),h.subVectors(a,s),u.subVectors(r,s),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Et.fromBufferAttribute(e,t),Et.normalize(),e.setXYZ(t,Et.x,Et.y,Et.z)}toNonIndexed(){function e(o,l){const c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h);let m=0,g=0;for(let v=0,p=l.length;v<p;v++){o.isInterleavedBufferAttribute?m=l[v]*o.data.stride+o.offset:m=l[v]*h;for(let d=0;d<h;d++)f[g++]=c[m++]}return new rn(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new fn,n=this.index.array,r=this.attributes;for(const o in r){const l=r[o],c=e(l,n);t.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let h=0,u=c.length;h<u;h++){const f=c[h],m=e(f,n);l.push(m)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){const m=c[u];h.push(m.toJSON(e.data))}h.length>0&&(r[l]=h,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const r=e.attributes;for(const c in r){const h=r[c];this.setAttribute(c,h.clone(t))}const s=e.morphAttributes;for(const c in s){const h=[],u=s[c];for(let f=0,m=u.length;f<m;f++)h.push(u[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const _l=new pt,ei=new Lu,Ir=new _s,gl=new te,Ur=new te,Nr=new te,Fr=new te,Ys=new te,Or=new te,vl=new te,Br=new te;class an extends bt{constructor(e=new fn,t=new Uu){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(s&&o){Or.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const h=o[l],u=s[l];h!==0&&(Ys.fromBufferAttribute(u,e),a?Or.addScaledVector(Ys,h):Or.addScaledVector(Ys.sub(t),h))}t.add(Or)}return t}raycast(e,t){const n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ir.copy(n.boundingSphere),Ir.applyMatrix4(s),ei.copy(e.ray).recast(e.near),!(Ir.containsPoint(ei.origin)===!1&&(ei.intersectSphere(Ir,gl)===null||ei.origin.distanceToSquared(gl)>(e.far-e.near)**2))&&(_l.copy(s).invert(),ei.copy(e.ray).applyMatrix4(_l),!(n.boundingBox!==null&&ei.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ei)))}_computeIntersections(e,t,n){let r;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,f=s.groups,m=s.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=f.length;g<v;g++){const p=f[g],d=a[p.materialIndex],M=Math.max(p.start,m.start),S=Math.min(o.count,Math.min(p.start+p.count,m.start+m.count));for(let y=M,R=S;y<R;y+=3){const A=o.getX(y),T=o.getX(y+1),I=o.getX(y+2);r=zr(this,d,e,n,c,h,u,A,T,I),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{const g=Math.max(0,m.start),v=Math.min(o.count,m.start+m.count);for(let p=g,d=v;p<d;p+=3){const M=o.getX(p),S=o.getX(p+1),y=o.getX(p+2);r=zr(this,a,e,n,c,h,u,M,S,y),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,v=f.length;g<v;g++){const p=f[g],d=a[p.materialIndex],M=Math.max(p.start,m.start),S=Math.min(l.count,Math.min(p.start+p.count,m.start+m.count));for(let y=M,R=S;y<R;y+=3){const A=y,T=y+1,I=y+2;r=zr(this,d,e,n,c,h,u,A,T,I),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{const g=Math.max(0,m.start),v=Math.min(l.count,m.start+m.count);for(let p=g,d=v;p<d;p+=3){const M=p,S=p+1,y=p+2;r=zr(this,a,e,n,c,h,u,M,S,y),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}}}function Hh(i,e,t,n,r,s,a,o){let l;if(e.side===Nt?l=n.intersectTriangle(a,s,r,!0,o):l=n.intersectTriangle(r,s,a,e.side===Gn,o),l===null)return null;Br.copy(o),Br.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Br);return c<t.near||c>t.far?null:{distance:c,point:Br.clone(),object:i}}function zr(i,e,t,n,r,s,a,o,l,c){i.getVertexPosition(o,Ur),i.getVertexPosition(l,Nr),i.getVertexPosition(c,Fr);const h=Hh(i,e,t,n,Ur,Nr,Fr,vl);if(h){const u=new te;en.getBarycoord(vl,Ur,Nr,Fr,u),r&&(h.uv=en.getInterpolatedAttribute(r,o,l,c,u,new lt)),s&&(h.uv1=en.getInterpolatedAttribute(s,o,l,c,u,new lt)),a&&(h.normal=en.getInterpolatedAttribute(a,o,l,c,u,new te),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new te,materialIndex:0};en.getNormal(Ur,Nr,Fr,f.normal),h.face=f,h.barycoord=u}return h}class vr extends fn{constructor(e=1,t=1,n=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],h=[],u=[];let f=0,m=0;g("z","y","x",-1,-1,n,t,e,a,s,0),g("z","y","x",1,-1,n,t,-e,a,s,1),g("x","z","y",1,1,e,n,t,r,a,2),g("x","z","y",1,-1,e,n,-t,r,a,3),g("x","y","z",1,-1,e,t,n,r,s,4),g("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new kn(c,3)),this.setAttribute("normal",new kn(h,3)),this.setAttribute("uv",new kn(u,2));function g(v,p,d,M,S,y,R,A,T,I,H){const x=y/T,E=R/I,N=y/2,L=R/2,P=A/2,X=T+1,z=I+1;let re=0,q=0;const fe=new te;for(let Me=0;Me<z;Me++){const _e=Me*E-L;for(let Ne=0;Ne<X;Ne++){const Pe=Ne*x-N;fe[v]=Pe*M,fe[p]=_e*S,fe[d]=P,c.push(fe.x,fe.y,fe.z),fe[v]=0,fe[p]=0,fe[d]=A>0?1:-1,h.push(fe.x,fe.y,fe.z),u.push(Ne/T),u.push(1-Me/I),re+=1}}for(let Me=0;Me<I;Me++)for(let _e=0;_e<T;_e++){const Ne=f+_e+X*Me,Pe=f+_e+X*(Me+1),Z=f+(_e+1)+X*(Me+1),oe=f+(_e+1)+X*Me;l.push(Ne,Pe,oe),l.push(Pe,Z,oe),q+=6}o.addGroup(m,q,H),m+=q,f+=re}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new vr(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function $i(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function Pt(i){const e={};for(let t=0;t<i.length;t++){const n=$i(i[t]);for(const r in n)e[r]=n[r]}return e}function Gh(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Ou(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ot.workingColorSpace}const Vh={clone:$i,merge:Pt};var Wh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Xh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Vn extends Ki{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Wh,this.fragmentShader=Xh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=$i(e.uniforms),this.uniformsGroups=Gh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?t.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[r]={type:"m4",value:a.toArray()}:t.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Bu extends bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new pt,this.projectionMatrix=new pt,this.projectionMatrixInverse=new pt,this.coordinateSystem=yn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Un=new te,xl=new lt,Sl=new lt;class Jt extends Bu{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ko*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(As*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ko*2*Math.atan(Math.tan(As*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Un.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Un.x,Un.y).multiplyScalar(-e/Un.z),Un.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Un.x,Un.y).multiplyScalar(-e/Un.z)}getViewSize(e,t){return this.getViewBounds(e,xl,Sl),t.subVectors(Sl,xl)}setViewOffset(e,t,n,r,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(As*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*r/l,t-=a.offsetY*n/c,r*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Ri=-90,Ci=1;class qh extends bt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Jt(Ri,Ci,e,t);r.layers=this.layers,this.add(r);const s=new Jt(Ri,Ci,e,t);s.layers=this.layers,this.add(s);const a=new Jt(Ri,Ci,e,t);a.layers=this.layers,this.add(a);const o=new Jt(Ri,Ci,e,t);o.layers=this.layers,this.add(o);const l=new Jt(Ri,Ci,e,t);l.layers=this.layers,this.add(l);const c=new Jt(Ri,Ci,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,r,s,a,o,l]=t;for(const c of t)this.remove(c);if(e===yn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===os)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,c,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,r),e.render(t,h),e.setRenderTarget(u,f,m),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class zu extends Ft{constructor(e,t,n,r,s,a,o,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:Wi,super(e,t,n,r,s,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Yh extends hi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new zu(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Qt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new vr(5,5,5),s=new Vn({name:"CubemapFromEquirect",uniforms:$i(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Nt,blending:Bn});s.uniforms.tEquirect.value=t;const a=new an(r,s),o=t.minFilter;return t.minFilter===ui&&(t.minFilter=Qt),new qh(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,r){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,r);e.setRenderTarget(s)}}const $s=new te,$h=new te,jh=new et;class ri{constructor(e=new te(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const r=$s.subVectors(n,t).cross($h.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta($s),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||jh.getNormalMatrix(e),r=this.coplanarPoint($s).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ti=new _s,kr=new te;class xa{constructor(e=new ri,t=new ri,n=new ri,r=new ri,s=new ri,a=new ri){this.planes=[e,t,n,r,s,a]}set(e,t,n,r,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=yn){const n=this.planes,r=e.elements,s=r[0],a=r[1],o=r[2],l=r[3],c=r[4],h=r[5],u=r[6],f=r[7],m=r[8],g=r[9],v=r[10],p=r[11],d=r[12],M=r[13],S=r[14],y=r[15];if(n[0].setComponents(l-s,f-c,p-m,y-d).normalize(),n[1].setComponents(l+s,f+c,p+m,y+d).normalize(),n[2].setComponents(l+a,f+h,p+g,y+M).normalize(),n[3].setComponents(l-a,f-h,p-g,y-M).normalize(),n[4].setComponents(l-o,f-u,p-v,y-S).normalize(),t===yn)n[5].setComponents(l+o,f+u,p+v,y+S).normalize();else if(t===os)n[5].setComponents(o,u,v,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ti.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ti.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ti)}intersectsSprite(e){return ti.center.set(0,0,0),ti.radius=.7071067811865476,ti.applyMatrix4(e.matrixWorld),this.intersectsSphere(ti)}intersectsSphere(e){const t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const r=t[n];if(kr.x=r.normal.x>0?e.max.x:e.min.x,kr.y=r.normal.y>0?e.max.y:e.min.y,kr.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(kr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function ku(){let i=null,e=!1,t=null,n=null;function r(s,a){t(s,a),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function Kh(i){const e=new WeakMap;function t(o,l){const c=o.array,h=o.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),o.onUploadCallback();let m;if(c instanceof Float32Array)m=i.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?m=i.HALF_FLOAT:m=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=i.SHORT;else if(c instanceof Uint32Array)m=i.UNSIGNED_INT;else if(c instanceof Int32Array)m=i.INT;else if(c instanceof Int8Array)m=i.BYTE;else if(c instanceof Uint8Array)m=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((m,g)=>m.start-g.start);let f=0;for(let m=1;m<u.length;m++){const g=u[f],v=u[m];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++f,u[f]=v)}u.length=f+1;for(let m=0,g=u.length;m<g;m++){const v=u[m];i.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:r,remove:s,update:a}}class xr extends fn{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};const s=e/2,a=t/2,o=Math.floor(n),l=Math.floor(r),c=o+1,h=l+1,u=e/o,f=t/l,m=[],g=[],v=[],p=[];for(let d=0;d<h;d++){const M=d*f-a;for(let S=0;S<c;S++){const y=S*u-s;g.push(y,-M,0),v.push(0,0,1),p.push(S/o),p.push(1-d/l)}}for(let d=0;d<l;d++)for(let M=0;M<o;M++){const S=M+c*d,y=M+c*(d+1),R=M+1+c*(d+1),A=M+1+c*d;m.push(S,y,A),m.push(y,R,A)}this.setIndex(m),this.setAttribute("position",new kn(g,3)),this.setAttribute("normal",new kn(v,3)),this.setAttribute("uv",new kn(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xr(e.width,e.height,e.widthSegments,e.heightSegments)}}var Zh=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Jh=`#ifdef USE_ALPHAHASH
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
#endif`,Qh=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,ed=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,td=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,nd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,id=`#ifdef USE_AOMAP
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
#endif`,rd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,sd=`#ifdef USE_BATCHING
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
#endif`,od=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,ad=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,ld=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,cd=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,ud=`#ifdef USE_IRIDESCENCE
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
#endif`,fd=`#ifdef USE_BUMPMAP
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
#endif`,hd=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,dd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,pd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,md=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,_d=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,gd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,vd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,xd=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Sd=`#define PI 3.141592653589793
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
} // validated`,Md=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Ed=`vec3 transformedNormal = objectNormal;
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
#endif`,yd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,bd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Td=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Ad=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,wd="gl_FragColor = linearToOutputTexel( gl_FragColor );",Rd=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Cd=`#ifdef USE_ENVMAP
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
#endif`,Pd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Ld=`#ifdef USE_ENVMAP
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
#endif`,Dd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Id=`#ifdef USE_ENVMAP
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
#endif`,Ud=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Nd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Fd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Od=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Bd=`#ifdef USE_GRADIENTMAP
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
}`,zd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,kd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Hd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Gd=`uniform bool receiveShadow;
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
#endif`,Vd=`#ifdef USE_ENVMAP
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
#endif`,Wd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Xd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,qd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Yd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,$d=`PhysicalMaterial material;
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
#endif`,jd=`struct PhysicalMaterial {
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
}`,Kd=`
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
#endif`,Zd=`#if defined( RE_IndirectDiffuse )
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
#endif`,Jd=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Qd=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ep=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,tp=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,np=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,ip=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,rp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,sp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,op=`#if defined( USE_POINTS_UV )
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
#endif`,ap=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,lp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,cp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,up=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,fp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hp=`#ifdef USE_MORPHTARGETS
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
#endif`,dp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,pp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,mp=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,_p=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,gp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,vp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,xp=`#ifdef USE_NORMALMAP
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
#endif`,Sp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Mp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Ep=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,yp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,bp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Tp=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Ap=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,wp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Rp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Cp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Pp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Lp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Dp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Ip=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Up=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Np=`float getShadowMask() {
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
}`,Fp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Op=`#ifdef USE_SKINNING
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
#endif`,Bp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,zp=`#ifdef USE_SKINNING
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
#endif`,kp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Hp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Gp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Vp=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Wp=`#ifdef USE_TRANSMISSION
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
#endif`,Xp=`#ifdef USE_TRANSMISSION
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
#endif`,qp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Yp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,$p=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,jp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Kp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Zp=`uniform sampler2D t2D;
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
}`,Jp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Qp=`#ifdef ENVMAP_TYPE_CUBE
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
}`,em=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,tm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,nm=`#include <common>
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
}`,im=`#if DEPTH_PACKING == 3200
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
}`,rm=`#define DISTANCE
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
}`,sm=`#define DISTANCE
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
}`,om=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,am=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,lm=`uniform float scale;
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
}`,cm=`uniform vec3 diffuse;
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
}`,um=`#include <common>
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
}`,fm=`uniform vec3 diffuse;
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
}`,hm=`#define LAMBERT
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
}`,dm=`#define LAMBERT
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
}`,pm=`#define MATCAP
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
}`,mm=`#define MATCAP
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
}`,_m=`#define NORMAL
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
}`,gm=`#define NORMAL
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
}`,vm=`#define PHONG
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
}`,xm=`#define PHONG
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
}`,Sm=`#define STANDARD
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
}`,Mm=`#define STANDARD
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
}`,Em=`#define TOON
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
}`,ym=`#define TOON
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
}`,bm=`uniform float size;
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
}`,Tm=`uniform vec3 diffuse;
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
}`,Am=`#include <common>
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
}`,wm=`uniform vec3 color;
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
}`,Rm=`uniform float rotation;
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
}`,Cm=`uniform vec3 diffuse;
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
}`,Qe={alphahash_fragment:Zh,alphahash_pars_fragment:Jh,alphamap_fragment:Qh,alphamap_pars_fragment:ed,alphatest_fragment:td,alphatest_pars_fragment:nd,aomap_fragment:id,aomap_pars_fragment:rd,batching_pars_vertex:sd,batching_vertex:od,begin_vertex:ad,beginnormal_vertex:ld,bsdfs:cd,iridescence_fragment:ud,bumpmap_pars_fragment:fd,clipping_planes_fragment:hd,clipping_planes_pars_fragment:dd,clipping_planes_pars_vertex:pd,clipping_planes_vertex:md,color_fragment:_d,color_pars_fragment:gd,color_pars_vertex:vd,color_vertex:xd,common:Sd,cube_uv_reflection_fragment:Md,defaultnormal_vertex:Ed,displacementmap_pars_vertex:yd,displacementmap_vertex:bd,emissivemap_fragment:Td,emissivemap_pars_fragment:Ad,colorspace_fragment:wd,colorspace_pars_fragment:Rd,envmap_fragment:Cd,envmap_common_pars_fragment:Pd,envmap_pars_fragment:Ld,envmap_pars_vertex:Dd,envmap_physical_pars_fragment:Vd,envmap_vertex:Id,fog_vertex:Ud,fog_pars_vertex:Nd,fog_fragment:Fd,fog_pars_fragment:Od,gradientmap_pars_fragment:Bd,lightmap_pars_fragment:zd,lights_lambert_fragment:kd,lights_lambert_pars_fragment:Hd,lights_pars_begin:Gd,lights_toon_fragment:Wd,lights_toon_pars_fragment:Xd,lights_phong_fragment:qd,lights_phong_pars_fragment:Yd,lights_physical_fragment:$d,lights_physical_pars_fragment:jd,lights_fragment_begin:Kd,lights_fragment_maps:Zd,lights_fragment_end:Jd,logdepthbuf_fragment:Qd,logdepthbuf_pars_fragment:ep,logdepthbuf_pars_vertex:tp,logdepthbuf_vertex:np,map_fragment:ip,map_pars_fragment:rp,map_particle_fragment:sp,map_particle_pars_fragment:op,metalnessmap_fragment:ap,metalnessmap_pars_fragment:lp,morphinstance_vertex:cp,morphcolor_vertex:up,morphnormal_vertex:fp,morphtarget_pars_vertex:hp,morphtarget_vertex:dp,normal_fragment_begin:pp,normal_fragment_maps:mp,normal_pars_fragment:_p,normal_pars_vertex:gp,normal_vertex:vp,normalmap_pars_fragment:xp,clearcoat_normal_fragment_begin:Sp,clearcoat_normal_fragment_maps:Mp,clearcoat_pars_fragment:Ep,iridescence_pars_fragment:yp,opaque_fragment:bp,packing:Tp,premultiplied_alpha_fragment:Ap,project_vertex:wp,dithering_fragment:Rp,dithering_pars_fragment:Cp,roughnessmap_fragment:Pp,roughnessmap_pars_fragment:Lp,shadowmap_pars_fragment:Dp,shadowmap_pars_vertex:Ip,shadowmap_vertex:Up,shadowmask_pars_fragment:Np,skinbase_vertex:Fp,skinning_pars_vertex:Op,skinning_vertex:Bp,skinnormal_vertex:zp,specularmap_fragment:kp,specularmap_pars_fragment:Hp,tonemapping_fragment:Gp,tonemapping_pars_fragment:Vp,transmission_fragment:Wp,transmission_pars_fragment:Xp,uv_pars_fragment:qp,uv_pars_vertex:Yp,uv_vertex:$p,worldpos_vertex:jp,background_vert:Kp,background_frag:Zp,backgroundCube_vert:Jp,backgroundCube_frag:Qp,cube_vert:em,cube_frag:tm,depth_vert:nm,depth_frag:im,distanceRGBA_vert:rm,distanceRGBA_frag:sm,equirect_vert:om,equirect_frag:am,linedashed_vert:lm,linedashed_frag:cm,meshbasic_vert:um,meshbasic_frag:fm,meshlambert_vert:hm,meshlambert_frag:dm,meshmatcap_vert:pm,meshmatcap_frag:mm,meshnormal_vert:_m,meshnormal_frag:gm,meshphong_vert:vm,meshphong_frag:xm,meshphysical_vert:Sm,meshphysical_frag:Mm,meshtoon_vert:Em,meshtoon_frag:ym,points_vert:bm,points_frag:Tm,shadow_vert:Am,shadow_frag:wm,sprite_vert:Rm,sprite_frag:Cm},Le={common:{diffuse:{value:new nt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new et},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new et}},envmap:{envMap:{value:null},envMapRotation:{value:new et},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new et}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new et}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new et},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new et},normalScale:{value:new lt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new et},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new et}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new et}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new et}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new nt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new nt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0},uvTransform:{value:new et}},sprite:{diffuse:{value:new nt(16777215)},opacity:{value:1},center:{value:new lt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new et},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0}}},on={basic:{uniforms:Pt([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.fog]),vertexShader:Qe.meshbasic_vert,fragmentShader:Qe.meshbasic_frag},lambert:{uniforms:Pt([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,Le.lights,{emissive:{value:new nt(0)}}]),vertexShader:Qe.meshlambert_vert,fragmentShader:Qe.meshlambert_frag},phong:{uniforms:Pt([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,Le.lights,{emissive:{value:new nt(0)},specular:{value:new nt(1118481)},shininess:{value:30}}]),vertexShader:Qe.meshphong_vert,fragmentShader:Qe.meshphong_frag},standard:{uniforms:Pt([Le.common,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.roughnessmap,Le.metalnessmap,Le.fog,Le.lights,{emissive:{value:new nt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag},toon:{uniforms:Pt([Le.common,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.gradientmap,Le.fog,Le.lights,{emissive:{value:new nt(0)}}]),vertexShader:Qe.meshtoon_vert,fragmentShader:Qe.meshtoon_frag},matcap:{uniforms:Pt([Le.common,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,{matcap:{value:null}}]),vertexShader:Qe.meshmatcap_vert,fragmentShader:Qe.meshmatcap_frag},points:{uniforms:Pt([Le.points,Le.fog]),vertexShader:Qe.points_vert,fragmentShader:Qe.points_frag},dashed:{uniforms:Pt([Le.common,Le.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qe.linedashed_vert,fragmentShader:Qe.linedashed_frag},depth:{uniforms:Pt([Le.common,Le.displacementmap]),vertexShader:Qe.depth_vert,fragmentShader:Qe.depth_frag},normal:{uniforms:Pt([Le.common,Le.bumpmap,Le.normalmap,Le.displacementmap,{opacity:{value:1}}]),vertexShader:Qe.meshnormal_vert,fragmentShader:Qe.meshnormal_frag},sprite:{uniforms:Pt([Le.sprite,Le.fog]),vertexShader:Qe.sprite_vert,fragmentShader:Qe.sprite_frag},background:{uniforms:{uvTransform:{value:new et},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qe.background_vert,fragmentShader:Qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new et}},vertexShader:Qe.backgroundCube_vert,fragmentShader:Qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qe.cube_vert,fragmentShader:Qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qe.equirect_vert,fragmentShader:Qe.equirect_frag},distanceRGBA:{uniforms:Pt([Le.common,Le.displacementmap,{referencePosition:{value:new te},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qe.distanceRGBA_vert,fragmentShader:Qe.distanceRGBA_frag},shadow:{uniforms:Pt([Le.lights,Le.fog,{color:{value:new nt(0)},opacity:{value:1}}]),vertexShader:Qe.shadow_vert,fragmentShader:Qe.shadow_frag}};on.physical={uniforms:Pt([on.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new et},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new et},clearcoatNormalScale:{value:new lt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new et},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new et},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new et},sheen:{value:0},sheenColor:{value:new nt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new et},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new et},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new et},transmissionSamplerSize:{value:new lt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new et},attenuationDistance:{value:0},attenuationColor:{value:new nt(0)},specularColor:{value:new nt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new et},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new et},anisotropyVector:{value:new lt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new et}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag};const Hr={r:0,b:0,g:0},ni=new un,Pm=new pt;function Lm(i,e,t,n,r,s,a){const o=new nt(0);let l=s===!0?0:1,c,h,u=null,f=0,m=null;function g(M){let S=M.isScene===!0?M.background:null;return S&&S.isTexture&&(S=(M.backgroundBlurriness>0?t:e).get(S)),S}function v(M){let S=!1;const y=g(M);y===null?d(o,l):y&&y.isColor&&(d(y,1),S=!0);const R=i.xr.getEnvironmentBlendMode();R==="additive"?n.buffers.color.setClear(0,0,0,1,a):R==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||S)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function p(M,S){const y=g(S);y&&(y.isCubeTexture||y.mapping===ps)?(h===void 0&&(h=new an(new vr(1,1,1),new Vn({name:"BackgroundCubeMaterial",uniforms:$i(on.backgroundCube.uniforms),vertexShader:on.backgroundCube.vertexShader,fragmentShader:on.backgroundCube.fragmentShader,side:Nt,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(R,A,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),ni.copy(S.backgroundRotation),ni.x*=-1,ni.y*=-1,ni.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(ni.y*=-1,ni.z*=-1),h.material.uniforms.envMap.value=y,h.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Pm.makeRotationFromEuler(ni)),h.material.toneMapped=ot.getTransfer(y.colorSpace)!==ht,(u!==y||f!==y.version||m!==i.toneMapping)&&(h.material.needsUpdate=!0,u=y,f=y.version,m=i.toneMapping),h.layers.enableAll(),M.unshift(h,h.geometry,h.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new an(new xr(2,2),new Vn({name:"BackgroundMaterial",uniforms:$i(on.background.uniforms),vertexShader:on.background.vertexShader,fragmentShader:on.background.fragmentShader,side:Gn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.toneMapped=ot.getTransfer(y.colorSpace)!==ht,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||f!==y.version||m!==i.toneMapping)&&(c.material.needsUpdate=!0,u=y,f=y.version,m=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function d(M,S){M.getRGB(Hr,Ou(i)),n.buffers.color.setClear(Hr.r,Hr.g,Hr.b,S,a)}return{getClearColor:function(){return o},setClearColor:function(M,S=1){o.set(M),l=S,d(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(M){l=M,d(o,l)},render:v,addToRenderList:p}}function Dm(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=f(null);let s=r,a=!1;function o(x,E,N,L,P){let X=!1;const z=u(L,N,E);s!==z&&(s=z,c(s.object)),X=m(x,L,N,P),X&&g(x,L,N,P),P!==null&&e.update(P,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,y(x,E,N,L),P!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(P).buffer))}function l(){return i.createVertexArray()}function c(x){return i.bindVertexArray(x)}function h(x){return i.deleteVertexArray(x)}function u(x,E,N){const L=N.wireframe===!0;let P=n[x.id];P===void 0&&(P={},n[x.id]=P);let X=P[E.id];X===void 0&&(X={},P[E.id]=X);let z=X[L];return z===void 0&&(z=f(l()),X[L]=z),z}function f(x){const E=[],N=[],L=[];for(let P=0;P<t;P++)E[P]=0,N[P]=0,L[P]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:E,enabledAttributes:N,attributeDivisors:L,object:x,attributes:{},index:null}}function m(x,E,N,L){const P=s.attributes,X=E.attributes;let z=0;const re=N.getAttributes();for(const q in re)if(re[q].location>=0){const Me=P[q];let _e=X[q];if(_e===void 0&&(q==="instanceMatrix"&&x.instanceMatrix&&(_e=x.instanceMatrix),q==="instanceColor"&&x.instanceColor&&(_e=x.instanceColor)),Me===void 0||Me.attribute!==_e||_e&&Me.data!==_e.data)return!0;z++}return s.attributesNum!==z||s.index!==L}function g(x,E,N,L){const P={},X=E.attributes;let z=0;const re=N.getAttributes();for(const q in re)if(re[q].location>=0){let Me=X[q];Me===void 0&&(q==="instanceMatrix"&&x.instanceMatrix&&(Me=x.instanceMatrix),q==="instanceColor"&&x.instanceColor&&(Me=x.instanceColor));const _e={};_e.attribute=Me,Me&&Me.data&&(_e.data=Me.data),P[q]=_e,z++}s.attributes=P,s.attributesNum=z,s.index=L}function v(){const x=s.newAttributes;for(let E=0,N=x.length;E<N;E++)x[E]=0}function p(x){d(x,0)}function d(x,E){const N=s.newAttributes,L=s.enabledAttributes,P=s.attributeDivisors;N[x]=1,L[x]===0&&(i.enableVertexAttribArray(x),L[x]=1),P[x]!==E&&(i.vertexAttribDivisor(x,E),P[x]=E)}function M(){const x=s.newAttributes,E=s.enabledAttributes;for(let N=0,L=E.length;N<L;N++)E[N]!==x[N]&&(i.disableVertexAttribArray(N),E[N]=0)}function S(x,E,N,L,P,X,z){z===!0?i.vertexAttribIPointer(x,E,N,P,X):i.vertexAttribPointer(x,E,N,L,P,X)}function y(x,E,N,L){v();const P=L.attributes,X=N.getAttributes(),z=E.defaultAttributeValues;for(const re in X){const q=X[re];if(q.location>=0){let fe=P[re];if(fe===void 0&&(re==="instanceMatrix"&&x.instanceMatrix&&(fe=x.instanceMatrix),re==="instanceColor"&&x.instanceColor&&(fe=x.instanceColor)),fe!==void 0){const Me=fe.normalized,_e=fe.itemSize,Ne=e.get(fe);if(Ne===void 0)continue;const Pe=Ne.buffer,Z=Ne.type,oe=Ne.bytesPerElement,de=Z===i.INT||Z===i.UNSIGNED_INT||fe.gpuType===ha;if(fe.isInterleavedBufferAttribute){const ce=fe.data,le=ce.stride,ge=fe.offset;if(ce.isInstancedInterleavedBuffer){for(let he=0;he<q.locationSize;he++)d(q.location+he,ce.meshPerAttribute);x.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=ce.meshPerAttribute*ce.count)}else for(let he=0;he<q.locationSize;he++)p(q.location+he);i.bindBuffer(i.ARRAY_BUFFER,Pe);for(let he=0;he<q.locationSize;he++)S(q.location+he,_e/q.locationSize,Z,Me,le*oe,(ge+_e/q.locationSize*he)*oe,de)}else{if(fe.isInstancedBufferAttribute){for(let ce=0;ce<q.locationSize;ce++)d(q.location+ce,fe.meshPerAttribute);x.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=fe.meshPerAttribute*fe.count)}else for(let ce=0;ce<q.locationSize;ce++)p(q.location+ce);i.bindBuffer(i.ARRAY_BUFFER,Pe);for(let ce=0;ce<q.locationSize;ce++)S(q.location+ce,_e/q.locationSize,Z,Me,_e*oe,_e/q.locationSize*ce*oe,de)}}else if(z!==void 0){const Me=z[re];if(Me!==void 0)switch(Me.length){case 2:i.vertexAttrib2fv(q.location,Me);break;case 3:i.vertexAttrib3fv(q.location,Me);break;case 4:i.vertexAttrib4fv(q.location,Me);break;default:i.vertexAttrib1fv(q.location,Me)}}}}M()}function R(){I();for(const x in n){const E=n[x];for(const N in E){const L=E[N];for(const P in L)h(L[P].object),delete L[P];delete E[N]}delete n[x]}}function A(x){if(n[x.id]===void 0)return;const E=n[x.id];for(const N in E){const L=E[N];for(const P in L)h(L[P].object),delete L[P];delete E[N]}delete n[x.id]}function T(x){for(const E in n){const N=n[E];if(N[x.id]===void 0)continue;const L=N[x.id];for(const P in L)h(L[P].object),delete L[P];delete N[x.id]}}function I(){H(),a=!0,s!==r&&(s=r,c(s.object))}function H(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:I,resetDefaultState:H,dispose:R,releaseStatesOfGeometry:A,releaseStatesOfProgram:T,initAttributes:v,enableAttribute:p,disableUnusedAttributes:M}}function Im(i,e,t){let n;function r(c){n=c}function s(c,h){i.drawArrays(n,c,h),t.update(h,n,1)}function a(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function o(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let m=0;for(let g=0;g<u;g++)m+=h[g];t.update(m,n,1)}function l(c,h,u,f){if(u===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let g=0;g<c.length;g++)a(c[g],h[g],f[g]);else{m.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let g=0;for(let v=0;v<u;v++)g+=h[v];for(let v=0;v<f.length;v++)t.update(g,n,f[v])}}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Um(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const T=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(T){return!(T!==tn&&n.convert(T)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(T){const I=T===pr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(T!==An&&n.convert(T)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&T!==En&&!I)}function l(T){if(T==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,f=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(f===!0){const T=e.get("EXT_clip_control");T.clipControlEXT(T.LOWER_LEFT_EXT,T.ZERO_TO_ONE_EXT)}const m=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),R=g>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:m,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:p,maxAttributes:d,maxVertexUniforms:M,maxVaryings:S,maxFragmentUniforms:y,vertexTextures:R,maxSamples:A}}function Nm(i){const e=this;let t=null,n=0,r=!1,s=!1;const a=new ri,o=new et,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const m=u.length!==0||f||n!==0||r;return r=f,n=u.length,m},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,m){const g=u.clippingPlanes,v=u.clipIntersection,p=u.clipShadows,d=i.get(u);if(!r||g===null||g.length===0||s&&!p)s?h(null):c();else{const M=s?0:n,S=M*4;let y=d.clippingState||null;l.value=y,y=h(g,f,S,m);for(let R=0;R!==S;++R)y[R]=t[R];d.clippingState=y,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,m,g){const v=u!==null?u.length:0;let p=null;if(v!==0){if(p=l.value,g!==!0||p===null){const d=m+v*4,M=f.matrixWorldInverse;o.getNormalMatrix(M),(p===null||p.length<d)&&(p=new Float32Array(d));for(let S=0,y=m;S!==v;++S,y+=4)a.copy(u[S]).applyMatrix4(M,o),a.normal.toArray(p,y),p[y+3]=a.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,p}}function Fm(i){let e=new WeakMap;function t(a,o){return o===So?a.mapping=Wi:o===Mo&&(a.mapping=Xi),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===So||o===Mo)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new Yh(l.height);return c.fromEquirectangularTexture(i,a),e.set(a,c),a.addEventListener("dispose",r),t(c.texture,a.mapping)}else return null}}return a}function r(a){const o=a.target;o.removeEventListener("dispose",r);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}class Sa extends Bu{constructor(e=-1,t=1,n=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=n-e,a=n+e,o=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Ni=4,Ml=[.125,.215,.35,.446,.526,.582],ai=20,js=new Sa,El=new nt;let Ks=null,Zs=0,Js=0,Qs=!1;const si=(1+Math.sqrt(5))/2,Pi=1/si,yl=[new te(-si,Pi,0),new te(si,Pi,0),new te(-Pi,0,si),new te(Pi,0,si),new te(0,si,-Pi),new te(0,si,Pi),new te(-1,1,-1),new te(1,1,-1),new te(-1,1,1),new te(1,1,1)];class bl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100){Ks=this._renderer.getRenderTarget(),Zs=this._renderer.getActiveCubeFace(),Js=this._renderer.getActiveMipmapLevel(),Qs=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=wl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Al(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ks,Zs,Js),this._renderer.xr.enabled=Qs,e.scissorTest=!1,Gr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Wi||e.mapping===Xi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ks=this._renderer.getRenderTarget(),Zs=this._renderer.getActiveCubeFace(),Js=this._renderer.getActiveMipmapLevel(),Qs=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Qt,minFilter:Qt,generateMipmaps:!1,type:pr,format:tn,colorSpace:Kn,depthBuffer:!1},r=Tl(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Tl(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Om(s)),this._blurMaterial=Bm(s,e,t)}return r}_compileMaterial(e){const t=new an(this._lodPlanes[0],e);this._renderer.compile(t,js)}_sceneToCubeUV(e,t,n,r){const o=new Jt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(El),h.toneMapping=zn,h.autoClear=!1;const m=new Uu({name:"PMREM.Background",side:Nt,depthWrite:!1,depthTest:!1}),g=new an(new vr,m);let v=!1;const p=e.background;p?p.isColor&&(m.color.copy(p),e.background=null,v=!0):(m.color.copy(El),v=!0);for(let d=0;d<6;d++){const M=d%3;M===0?(o.up.set(0,l[d],0),o.lookAt(c[d],0,0)):M===1?(o.up.set(0,0,l[d]),o.lookAt(0,c[d],0)):(o.up.set(0,l[d],0),o.lookAt(0,0,c[d]));const S=this._cubeSize;Gr(r,M*S,d>2?S:0,S,S),h.setRenderTarget(r),v&&h.render(g,o),h.render(e,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=u,e.background=p}_textureToCubeUV(e,t){const n=this._renderer,r=e.mapping===Wi||e.mapping===Xi;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=wl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Al());const s=r?this._cubemapMaterial:this._equirectMaterial,a=new an(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const l=this._cubeSize;Gr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,js)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=yl[(r-s-1)%yl.length];this._blur(e,s-1,s,a,o)}t.autoClear=n}_blur(e,t,n,r,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,"latitudinal",s),this._halfBlur(a,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new an(this._lodPlanes[r],c),f=c.uniforms,m=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*m):2*Math.PI/(2*ai-1),v=s/g,p=isFinite(s)?1+Math.floor(h*v):ai;p>ai&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${ai}`);const d=[];let M=0;for(let T=0;T<ai;++T){const I=T/v,H=Math.exp(-I*I/2);d.push(H),T===0?M+=H:T<p&&(M+=2*H)}for(let T=0;T<d.length;T++)d[T]=d[T]/M;f.envMap.value=e.texture,f.samples.value=p,f.weights.value=d,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:S}=this;f.dTheta.value=g,f.mipInt.value=S-n;const y=this._sizeLods[r],R=3*y*(r>S-Ni?r-S+Ni:0),A=4*(this._cubeSize-y);Gr(t,R,A,3*y,2*y),l.setRenderTarget(t),l.render(u,js)}}function Om(i){const e=[],t=[],n=[];let r=i;const s=i-Ni+1+Ml.length;for(let a=0;a<s;a++){const o=Math.pow(2,r);t.push(o);let l=1/o;a>i-Ni?l=Ml[a-i+Ni-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],m=6,g=6,v=3,p=2,d=1,M=new Float32Array(v*g*m),S=new Float32Array(p*g*m),y=new Float32Array(d*g*m);for(let A=0;A<m;A++){const T=A%3*2/3-1,I=A>2?0:-1,H=[T,I,0,T+2/3,I,0,T+2/3,I+1,0,T,I,0,T+2/3,I+1,0,T,I+1,0];M.set(H,v*g*A),S.set(f,p*g*A);const x=[A,A,A,A,A,A];y.set(x,d*g*A)}const R=new fn;R.setAttribute("position",new rn(M,v)),R.setAttribute("uv",new rn(S,p)),R.setAttribute("faceIndex",new rn(y,d)),e.push(R),r>Ni&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Tl(i,e,t){const n=new hi(i,e,t);return n.texture.mapping=ps,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Gr(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function Bm(i,e,t){const n=new Float32Array(ai),r=new te(0,1,0);return new Vn({name:"SphericalGaussianBlur",defines:{n:ai,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Ma(),fragmentShader:`

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
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function Al(){return new Vn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ma(),fragmentShader:`

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
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function wl(){return new Vn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ma(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function Ma(){return`

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
	`}function zm(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===So||l===Mo,h=l===Wi||l===Xi;if(c||h){let u=e.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return t===null&&(t=new bl(i)),u=c?t.fromEquirectangular(o,u):t.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),u.texture;if(u!==void 0)return u.texture;{const m=o.image;return c&&m&&m.height>0||h&&m&&r(m)?(t===null&&(t=new bl(i)),u=c?t.fromEquirectangular(o):t.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),o.addEventListener("dispose",s),u.texture):null}}}return o}function r(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function s(o){const l=o.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function km(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const r=t(n);return r===null&&Jr("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function Hm(i,e,t,n){const r={},s=new WeakMap;function a(u){const f=u.target;f.index!==null&&e.remove(f.index);for(const g in f.attributes)e.remove(f.attributes[g]);for(const g in f.morphAttributes){const v=f.morphAttributes[g];for(let p=0,d=v.length;p<d;p++)e.remove(v[p])}f.removeEventListener("dispose",a),delete r[f.id];const m=s.get(f);m&&(e.remove(m),s.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(u,f){return r[f.id]===!0||(f.addEventListener("dispose",a),r[f.id]=!0,t.memory.geometries++),f}function l(u){const f=u.attributes;for(const g in f)e.update(f[g],i.ARRAY_BUFFER);const m=u.morphAttributes;for(const g in m){const v=m[g];for(let p=0,d=v.length;p<d;p++)e.update(v[p],i.ARRAY_BUFFER)}}function c(u){const f=[],m=u.index,g=u.attributes.position;let v=0;if(m!==null){const M=m.array;v=m.version;for(let S=0,y=M.length;S<y;S+=3){const R=M[S+0],A=M[S+1],T=M[S+2];f.push(R,A,A,T,T,R)}}else if(g!==void 0){const M=g.array;v=g.version;for(let S=0,y=M.length/3-1;S<y;S+=3){const R=S+0,A=S+1,T=S+2;f.push(R,A,A,T,T,R)}}else return;const p=new(Ru(f)?Fu:Nu)(f,1);p.version=v;const d=s.get(u);d&&e.remove(d),s.set(u,p)}function h(u){const f=s.get(u);if(f){const m=u.index;m!==null&&f.version<m.version&&c(u)}else c(u);return s.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function Gm(i,e,t){let n;function r(f){n=f}let s,a;function o(f){s=f.type,a=f.bytesPerElement}function l(f,m){i.drawElements(n,m,s,f*a),t.update(m,n,1)}function c(f,m,g){g!==0&&(i.drawElementsInstanced(n,m,s,f*a,g),t.update(m,n,g))}function h(f,m,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,m,0,s,f,0,g);let p=0;for(let d=0;d<g;d++)p+=m[d];t.update(p,n,1)}function u(f,m,g,v){if(g===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let d=0;d<f.length;d++)c(f[d]/a,m[d],v[d]);else{p.multiDrawElementsInstancedWEBGL(n,m,0,s,f,0,v,0,g);let d=0;for(let M=0;M<g;M++)d+=m[M];for(let M=0;M<v.length;M++)t.update(d,n,v[M])}}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Vm(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(s/3);break;case i.LINES:t.lines+=o*(s/2);break;case i.LINE_STRIP:t.lines+=o*(s-1);break;case i.LINE_LOOP:t.lines+=o*s;break;case i.POINTS:t.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function Wm(i,e,t){const n=new WeakMap,r=new _t;function s(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let x=function(){I.dispose(),n.delete(o),o.removeEventListener("dispose",x)};var m=x;f!==void 0&&f.texture.dispose();const g=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,p=o.morphAttributes.color!==void 0,d=o.morphAttributes.position||[],M=o.morphAttributes.normal||[],S=o.morphAttributes.color||[];let y=0;g===!0&&(y=1),v===!0&&(y=2),p===!0&&(y=3);let R=o.attributes.position.count*y,A=1;R>e.maxTextureSize&&(A=Math.ceil(R/e.maxTextureSize),R=e.maxTextureSize);const T=new Float32Array(R*A*4*u),I=new Pu(T,R,A,u);I.type=En,I.needsUpdate=!0;const H=y*4;for(let E=0;E<u;E++){const N=d[E],L=M[E],P=S[E],X=R*A*4*E;for(let z=0;z<N.count;z++){const re=z*H;g===!0&&(r.fromBufferAttribute(N,z),T[X+re+0]=r.x,T[X+re+1]=r.y,T[X+re+2]=r.z,T[X+re+3]=0),v===!0&&(r.fromBufferAttribute(L,z),T[X+re+4]=r.x,T[X+re+5]=r.y,T[X+re+6]=r.z,T[X+re+7]=0),p===!0&&(r.fromBufferAttribute(P,z),T[X+re+8]=r.x,T[X+re+9]=r.y,T[X+re+10]=r.z,T[X+re+11]=P.itemSize===4?r.w:1)}}f={count:u,texture:I,size:new lt(R,A)},n.set(o,f),o.addEventListener("dispose",x)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let g=0;for(let p=0;p<c.length;p++)g+=c[p];const v=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",v),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:s}}function Xm(i,e,t,n){let r=new WeakMap;function s(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);if(r.get(u)!==c&&(e.update(u),r.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),r.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;r.get(f)!==c&&(f.update(),r.set(f,c))}return u}function a(){r=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:a}}class Hu extends Ft{constructor(e,t,n,r,s,a,o,l,c,h=ki){if(h!==ki&&h!==Yi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===ki&&(n=fi),n===void 0&&h===Yi&&(n=qi),super(null,r,s,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:qt,this.minFilter=l!==void 0?l:qt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Gu=new Ft,Rl=new Hu(1,1),Vu=new Pu,Wu=new Lh,Xu=new zu,Cl=[],Pl=[],Ll=new Float32Array(16),Dl=new Float32Array(9),Il=new Float32Array(4);function Zi(i,e,t){const n=i[0];if(n<=0||n>0)return i;const r=e*t;let s=Cl[r];if(s===void 0&&(s=new Float32Array(r),Cl[r]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(s,o)}return s}function xt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function St(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function gs(i,e){let t=Pl[e];t===void 0&&(t=new Int32Array(e),Pl[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function qm(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Ym(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(xt(t,e))return;i.uniform2fv(this.addr,e),St(t,e)}}function $m(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(xt(t,e))return;i.uniform3fv(this.addr,e),St(t,e)}}function jm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(xt(t,e))return;i.uniform4fv(this.addr,e),St(t,e)}}function Km(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(xt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),St(t,e)}else{if(xt(t,n))return;Il.set(n),i.uniformMatrix2fv(this.addr,!1,Il),St(t,n)}}function Zm(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(xt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),St(t,e)}else{if(xt(t,n))return;Dl.set(n),i.uniformMatrix3fv(this.addr,!1,Dl),St(t,n)}}function Jm(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(xt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),St(t,e)}else{if(xt(t,n))return;Ll.set(n),i.uniformMatrix4fv(this.addr,!1,Ll),St(t,n)}}function Qm(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function e_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(xt(t,e))return;i.uniform2iv(this.addr,e),St(t,e)}}function t_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(xt(t,e))return;i.uniform3iv(this.addr,e),St(t,e)}}function n_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(xt(t,e))return;i.uniform4iv(this.addr,e),St(t,e)}}function i_(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function r_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(xt(t,e))return;i.uniform2uiv(this.addr,e),St(t,e)}}function s_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(xt(t,e))return;i.uniform3uiv(this.addr,e),St(t,e)}}function o_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(xt(t,e))return;i.uniform4uiv(this.addr,e),St(t,e)}}function a_(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(Rl.compareFunction=wu,s=Rl):s=Gu,t.setTexture2D(e||s,r)}function l_(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||Wu,r)}function c_(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||Xu,r)}function u_(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||Vu,r)}function f_(i){switch(i){case 5126:return qm;case 35664:return Ym;case 35665:return $m;case 35666:return jm;case 35674:return Km;case 35675:return Zm;case 35676:return Jm;case 5124:case 35670:return Qm;case 35667:case 35671:return e_;case 35668:case 35672:return t_;case 35669:case 35673:return n_;case 5125:return i_;case 36294:return r_;case 36295:return s_;case 36296:return o_;case 35678:case 36198:case 36298:case 36306:case 35682:return a_;case 35679:case 36299:case 36307:return l_;case 35680:case 36300:case 36308:case 36293:return c_;case 36289:case 36303:case 36311:case 36292:return u_}}function h_(i,e){i.uniform1fv(this.addr,e)}function d_(i,e){const t=Zi(e,this.size,2);i.uniform2fv(this.addr,t)}function p_(i,e){const t=Zi(e,this.size,3);i.uniform3fv(this.addr,t)}function m_(i,e){const t=Zi(e,this.size,4);i.uniform4fv(this.addr,t)}function __(i,e){const t=Zi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function g_(i,e){const t=Zi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function v_(i,e){const t=Zi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function x_(i,e){i.uniform1iv(this.addr,e)}function S_(i,e){i.uniform2iv(this.addr,e)}function M_(i,e){i.uniform3iv(this.addr,e)}function E_(i,e){i.uniform4iv(this.addr,e)}function y_(i,e){i.uniform1uiv(this.addr,e)}function b_(i,e){i.uniform2uiv(this.addr,e)}function T_(i,e){i.uniform3uiv(this.addr,e)}function A_(i,e){i.uniform4uiv(this.addr,e)}function w_(i,e,t){const n=this.cache,r=e.length,s=gs(t,r);xt(n,s)||(i.uniform1iv(this.addr,s),St(n,s));for(let a=0;a!==r;++a)t.setTexture2D(e[a]||Gu,s[a])}function R_(i,e,t){const n=this.cache,r=e.length,s=gs(t,r);xt(n,s)||(i.uniform1iv(this.addr,s),St(n,s));for(let a=0;a!==r;++a)t.setTexture3D(e[a]||Wu,s[a])}function C_(i,e,t){const n=this.cache,r=e.length,s=gs(t,r);xt(n,s)||(i.uniform1iv(this.addr,s),St(n,s));for(let a=0;a!==r;++a)t.setTextureCube(e[a]||Xu,s[a])}function P_(i,e,t){const n=this.cache,r=e.length,s=gs(t,r);xt(n,s)||(i.uniform1iv(this.addr,s),St(n,s));for(let a=0;a!==r;++a)t.setTexture2DArray(e[a]||Vu,s[a])}function L_(i){switch(i){case 5126:return h_;case 35664:return d_;case 35665:return p_;case 35666:return m_;case 35674:return __;case 35675:return g_;case 35676:return v_;case 5124:case 35670:return x_;case 35667:case 35671:return S_;case 35668:case 35672:return M_;case 35669:case 35673:return E_;case 5125:return y_;case 36294:return b_;case 36295:return T_;case 36296:return A_;case 35678:case 36198:case 36298:case 36306:case 35682:return w_;case 35679:case 36299:case 36307:return R_;case 35680:case 36300:case 36308:case 36293:return C_;case 36289:case 36303:case 36311:case 36292:return P_}}class D_{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=f_(t.type)}}class I_{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=L_(t.type)}}class U_{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(e,t[o.id],n)}}}const eo=/(\w+)(\])?(\[|\.)?/g;function Ul(i,e){i.seq.push(e),i.map[e.id]=e}function N_(i,e,t){const n=i.name,r=n.length;for(eo.lastIndex=0;;){const s=eo.exec(n),a=eo.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===r){Ul(t,c===void 0?new D_(o,i,e):new I_(o,i,e));break}else{let u=t.map[o];u===void 0&&(u=new U_(o),Ul(t,u)),t=u}}}class Qr{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){const s=e.getActiveUniform(t,r),a=e.getUniformLocation(t,s.name);N_(s,a,this)}}setValue(e,t,n,r){const s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){const r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,a=t.length;s!==a;++s){const o=t[s],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,t){const n=[];for(let r=0,s=e.length;r!==s;++r){const a=e[r];a.id in t&&n.push(a)}return n}}function Nl(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const F_=37297;let O_=0;function B_(i,e){const t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=r;a<s;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}function z_(i){const e=ot.getPrimaries(ot.workingColorSpace),t=ot.getPrimaries(i);let n;switch(e===t?n="":e===ss&&t===rs?n="LinearDisplayP3ToLinearSRGB":e===rs&&t===ss&&(n="LinearSRGBToLinearDisplayP3"),i){case Kn:case ms:return[n,"LinearTransferOETF"];case sn:case va:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function Fl(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=i.getShaderInfoLog(e).trim();if(n&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const a=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+B_(i.getShaderSource(e),a)}else return r}function k_(i,e){const t=z_(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function H_(i,e){let t;switch(e){case ih:t="Linear";break;case rh:t="Reinhard";break;case sh:t="Cineon";break;case oh:t="ACESFilmic";break;case lh:t="AgX";break;case ch:t="Neutral";break;case ah:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Vr=new te;function G_(){ot.getLuminanceCoefficients(Vr);const i=Vr.x.toFixed(4),e=Vr.y.toFixed(4),t=Vr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function V_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(or).join(`
`)}function W_(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function X_(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){const s=i.getActiveAttrib(e,r),a=s.name;let o=1;s.type===i.FLOAT_MAT2&&(o=2),s.type===i.FLOAT_MAT3&&(o=3),s.type===i.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function or(i){return i!==""}function Ol(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Bl(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const q_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Zo(i){return i.replace(q_,$_)}const Y_=new Map;function $_(i,e){let t=Qe[e];if(t===void 0){const n=Y_.get(e);if(n!==void 0)t=Qe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Zo(t)}const j_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function zl(i){return i.replace(j_,K_)}function K_(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function kl(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Z_(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===pu?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Ff?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===vn&&(e="SHADOWMAP_TYPE_VSM"),e}function J_(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Wi:case Xi:e="ENVMAP_TYPE_CUBE";break;case ps:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Q_(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Xi:e="ENVMAP_MODE_REFRACTION";break}return e}function eg(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case fa:e="ENVMAP_BLENDING_MULTIPLY";break;case th:e="ENVMAP_BLENDING_MIX";break;case nh:e="ENVMAP_BLENDING_ADD";break}return e}function tg(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function ng(i,e,t,n){const r=i.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=Z_(t),c=J_(t),h=Q_(t),u=eg(t),f=tg(t),m=V_(t),g=W_(s),v=r.createProgram();let p,d,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(or).join(`
`),p.length>0&&(p+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(or).join(`
`),d.length>0&&(d+=`
`)):(p=[kl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(or).join(`
`),d=[kl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==zn?"#define TONE_MAPPING":"",t.toneMapping!==zn?Qe.tonemapping_pars_fragment:"",t.toneMapping!==zn?H_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Qe.colorspace_pars_fragment,k_("linearToOutputTexel",t.outputColorSpace),G_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(or).join(`
`)),a=Zo(a),a=Ol(a,t),a=Bl(a,t),o=Zo(o),o=Ol(o,t),o=Bl(o,t),a=zl(a),o=zl(o),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,p=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,d=["#define varying in",t.glslVersion===il?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===il?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const S=M+p+a,y=M+d+o,R=Nl(r,r.VERTEX_SHADER,S),A=Nl(r,r.FRAGMENT_SHADER,y);r.attachShader(v,R),r.attachShader(v,A),t.index0AttributeName!==void 0?r.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(v,0,"position"),r.linkProgram(v);function T(E){if(i.debug.checkShaderErrors){const N=r.getProgramInfoLog(v).trim(),L=r.getShaderInfoLog(R).trim(),P=r.getShaderInfoLog(A).trim();let X=!0,z=!0;if(r.getProgramParameter(v,r.LINK_STATUS)===!1)if(X=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,v,R,A);else{const re=Fl(r,R,"vertex"),q=Fl(r,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(v,r.VALIDATE_STATUS)+`

Material Name: `+E.name+`
Material Type: `+E.type+`

Program Info Log: `+N+`
`+re+`
`+q)}else N!==""?console.warn("THREE.WebGLProgram: Program Info Log:",N):(L===""||P==="")&&(z=!1);z&&(E.diagnostics={runnable:X,programLog:N,vertexShader:{log:L,prefix:p},fragmentShader:{log:P,prefix:d}})}r.deleteShader(R),r.deleteShader(A),I=new Qr(r,v),H=X_(r,v)}let I;this.getUniforms=function(){return I===void 0&&T(this),I};let H;this.getAttributes=function(){return H===void 0&&T(this),H};let x=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=r.getProgramParameter(v,F_)),x},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=O_++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=R,this.fragmentShader=A,this}let ig=0;class rg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new sg(e),t.set(e,n)),n}}class sg{constructor(e){this.id=ig++,this.code=e,this.usedTimes=0}}function og(i,e,t,n,r,s,a){const o=new Du,l=new rg,c=new Set,h=[],u=r.logarithmicDepthBuffer,f=r.reverseDepthBuffer,m=r.vertexTextures;let g=r.precision;const v={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(x){return c.add(x),x===0?"uv":`uv${x}`}function d(x,E,N,L,P){const X=L.fog,z=P.geometry,re=x.isMeshStandardMaterial?L.environment:null,q=(x.isMeshStandardMaterial?t:e).get(x.envMap||re),fe=q&&q.mapping===ps?q.image.height:null,Me=v[x.type];x.precision!==null&&(g=r.getMaxPrecision(x.precision),g!==x.precision&&console.warn("THREE.WebGLProgram.getParameters:",x.precision,"not supported, using",g,"instead."));const _e=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Ne=_e!==void 0?_e.length:0;let Pe=0;z.morphAttributes.position!==void 0&&(Pe=1),z.morphAttributes.normal!==void 0&&(Pe=2),z.morphAttributes.color!==void 0&&(Pe=3);let Z,oe,de,ce;if(Me){const Dt=on[Me];Z=Dt.vertexShader,oe=Dt.fragmentShader}else Z=x.vertexShader,oe=x.fragmentShader,l.update(x),de=l.getVertexShaderID(x),ce=l.getFragmentShaderID(x);const le=i.getRenderTarget(),ge=P.isInstancedMesh===!0,he=P.isBatchedMesh===!0,ve=!!x.map,Te=!!x.matcap,F=!!q,Ke=!!x.aoMap,De=!!x.lightMap,ze=!!x.bumpMap,be=!!x.normalMap,Je=!!x.displacementMap,se=!!x.emissiveMap,C=!!x.metalnessMap,b=!!x.roughnessMap,k=x.anisotropy>0,j=x.clearcoat>0,ae=x.dispersion>0,ne=x.iridescence>0,Ue=x.sheen>0,xe=x.transmission>0,K=k&&!!x.anisotropyMap,He=j&&!!x.clearcoatMap,V=j&&!!x.clearcoatNormalMap,Ee=j&&!!x.clearcoatRoughnessMap,Oe=ne&&!!x.iridescenceMap,Be=ne&&!!x.iridescenceThicknessMap,Se=Ue&&!!x.sheenColorMap,qe=Ue&&!!x.sheenRoughnessMap,Ie=!!x.specularMap,Ye=!!x.specularColorMap,O=!!x.specularIntensityMap,ye=xe&&!!x.transmissionMap,Q=xe&&!!x.thicknessMap,U=!!x.gradientMap,ue=!!x.alphaMap,Y=x.alphaTest>0,we=!!x.alphaHash,ct=!!x.extensions;let Lt=zn;x.toneMapped&&(le===null||le.isXRRenderTarget===!0)&&(Lt=i.toneMapping);const it={shaderID:Me,shaderType:x.type,shaderName:x.name,vertexShader:Z,fragmentShader:oe,defines:x.defines,customVertexShaderID:de,customFragmentShaderID:ce,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:g,batching:he,batchingColor:he&&P._colorsTexture!==null,instancing:ge,instancingColor:ge&&P.instanceColor!==null,instancingMorph:ge&&P.morphTexture!==null,supportsVertexTextures:m,outputColorSpace:le===null?i.outputColorSpace:le.isXRRenderTarget===!0?le.texture.colorSpace:Kn,alphaToCoverage:!!x.alphaToCoverage,map:ve,matcap:Te,envMap:F,envMapMode:F&&q.mapping,envMapCubeUVHeight:fe,aoMap:Ke,lightMap:De,bumpMap:ze,normalMap:be,displacementMap:m&&Je,emissiveMap:se,normalMapObjectSpace:be&&x.normalMapType===dh,normalMapTangentSpace:be&&x.normalMapType===Au,metalnessMap:C,roughnessMap:b,anisotropy:k,anisotropyMap:K,clearcoat:j,clearcoatMap:He,clearcoatNormalMap:V,clearcoatRoughnessMap:Ee,dispersion:ae,iridescence:ne,iridescenceMap:Oe,iridescenceThicknessMap:Be,sheen:Ue,sheenColorMap:Se,sheenRoughnessMap:qe,specularMap:Ie,specularColorMap:Ye,specularIntensityMap:O,transmission:xe,transmissionMap:ye,thicknessMap:Q,gradientMap:U,opaque:x.transparent===!1&&x.blending===zi&&x.alphaToCoverage===!1,alphaMap:ue,alphaTest:Y,alphaHash:we,combine:x.combine,mapUv:ve&&p(x.map.channel),aoMapUv:Ke&&p(x.aoMap.channel),lightMapUv:De&&p(x.lightMap.channel),bumpMapUv:ze&&p(x.bumpMap.channel),normalMapUv:be&&p(x.normalMap.channel),displacementMapUv:Je&&p(x.displacementMap.channel),emissiveMapUv:se&&p(x.emissiveMap.channel),metalnessMapUv:C&&p(x.metalnessMap.channel),roughnessMapUv:b&&p(x.roughnessMap.channel),anisotropyMapUv:K&&p(x.anisotropyMap.channel),clearcoatMapUv:He&&p(x.clearcoatMap.channel),clearcoatNormalMapUv:V&&p(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ee&&p(x.clearcoatRoughnessMap.channel),iridescenceMapUv:Oe&&p(x.iridescenceMap.channel),iridescenceThicknessMapUv:Be&&p(x.iridescenceThicknessMap.channel),sheenColorMapUv:Se&&p(x.sheenColorMap.channel),sheenRoughnessMapUv:qe&&p(x.sheenRoughnessMap.channel),specularMapUv:Ie&&p(x.specularMap.channel),specularColorMapUv:Ye&&p(x.specularColorMap.channel),specularIntensityMapUv:O&&p(x.specularIntensityMap.channel),transmissionMapUv:ye&&p(x.transmissionMap.channel),thicknessMapUv:Q&&p(x.thicknessMap.channel),alphaMapUv:ue&&p(x.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(be||k),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:P.isPoints===!0&&!!z.attributes.uv&&(ve||ue),fog:!!X,useFog:x.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:x.flatShading===!0,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:f,skinning:P.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:Ne,morphTextureStride:Pe,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&N.length>0,shadowMapType:i.shadowMap.type,toneMapping:Lt,decodeVideoTexture:ve&&x.map.isVideoTexture===!0&&ot.getTransfer(x.map.colorSpace)===ht,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===xn,flipSided:x.side===Nt,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:ct&&x.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ct&&x.extensions.multiDraw===!0||he)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return it.vertexUv1s=c.has(1),it.vertexUv2s=c.has(2),it.vertexUv3s=c.has(3),c.clear(),it}function M(x){const E=[];if(x.shaderID?E.push(x.shaderID):(E.push(x.customVertexShaderID),E.push(x.customFragmentShaderID)),x.defines!==void 0)for(const N in x.defines)E.push(N),E.push(x.defines[N]);return x.isRawShaderMaterial===!1&&(S(E,x),y(E,x),E.push(i.outputColorSpace)),E.push(x.customProgramCacheKey),E.join()}function S(x,E){x.push(E.precision),x.push(E.outputColorSpace),x.push(E.envMapMode),x.push(E.envMapCubeUVHeight),x.push(E.mapUv),x.push(E.alphaMapUv),x.push(E.lightMapUv),x.push(E.aoMapUv),x.push(E.bumpMapUv),x.push(E.normalMapUv),x.push(E.displacementMapUv),x.push(E.emissiveMapUv),x.push(E.metalnessMapUv),x.push(E.roughnessMapUv),x.push(E.anisotropyMapUv),x.push(E.clearcoatMapUv),x.push(E.clearcoatNormalMapUv),x.push(E.clearcoatRoughnessMapUv),x.push(E.iridescenceMapUv),x.push(E.iridescenceThicknessMapUv),x.push(E.sheenColorMapUv),x.push(E.sheenRoughnessMapUv),x.push(E.specularMapUv),x.push(E.specularColorMapUv),x.push(E.specularIntensityMapUv),x.push(E.transmissionMapUv),x.push(E.thicknessMapUv),x.push(E.combine),x.push(E.fogExp2),x.push(E.sizeAttenuation),x.push(E.morphTargetsCount),x.push(E.morphAttributeCount),x.push(E.numDirLights),x.push(E.numPointLights),x.push(E.numSpotLights),x.push(E.numSpotLightMaps),x.push(E.numHemiLights),x.push(E.numRectAreaLights),x.push(E.numDirLightShadows),x.push(E.numPointLightShadows),x.push(E.numSpotLightShadows),x.push(E.numSpotLightShadowsWithMaps),x.push(E.numLightProbes),x.push(E.shadowMapType),x.push(E.toneMapping),x.push(E.numClippingPlanes),x.push(E.numClipIntersection),x.push(E.depthPacking)}function y(x,E){o.disableAll(),E.supportsVertexTextures&&o.enable(0),E.instancing&&o.enable(1),E.instancingColor&&o.enable(2),E.instancingMorph&&o.enable(3),E.matcap&&o.enable(4),E.envMap&&o.enable(5),E.normalMapObjectSpace&&o.enable(6),E.normalMapTangentSpace&&o.enable(7),E.clearcoat&&o.enable(8),E.iridescence&&o.enable(9),E.alphaTest&&o.enable(10),E.vertexColors&&o.enable(11),E.vertexAlphas&&o.enable(12),E.vertexUv1s&&o.enable(13),E.vertexUv2s&&o.enable(14),E.vertexUv3s&&o.enable(15),E.vertexTangents&&o.enable(16),E.anisotropy&&o.enable(17),E.alphaHash&&o.enable(18),E.batching&&o.enable(19),E.dispersion&&o.enable(20),E.batchingColor&&o.enable(21),x.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.reverseDepthBuffer&&o.enable(4),E.skinning&&o.enable(5),E.morphTargets&&o.enable(6),E.morphNormals&&o.enable(7),E.morphColors&&o.enable(8),E.premultipliedAlpha&&o.enable(9),E.shadowMapEnabled&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),E.alphaToCoverage&&o.enable(20),x.push(o.mask)}function R(x){const E=v[x.type];let N;if(E){const L=on[E];N=Vh.clone(L.uniforms)}else N=x.uniforms;return N}function A(x,E){let N;for(let L=0,P=h.length;L<P;L++){const X=h[L];if(X.cacheKey===E){N=X,++N.usedTimes;break}}return N===void 0&&(N=new ng(i,E,x,s),h.push(N)),N}function T(x){if(--x.usedTimes===0){const E=h.indexOf(x);h[E]=h[h.length-1],h.pop(),x.destroy()}}function I(x){l.remove(x)}function H(){l.dispose()}return{getParameters:d,getProgramCacheKey:M,getUniforms:R,acquireProgram:A,releaseProgram:T,releaseShaderCache:I,programs:h,dispose:H}}function ag(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function r(a,o,l){i.get(a)[o]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function lg(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Hl(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Gl(){const i=[];let e=0;const t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function a(u,f,m,g,v,p){let d=i[e];return d===void 0?(d={id:u.id,object:u,geometry:f,material:m,groupOrder:g,renderOrder:u.renderOrder,z:v,group:p},i[e]=d):(d.id=u.id,d.object=u,d.geometry=f,d.material=m,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=v,d.group=p),e++,d}function o(u,f,m,g,v,p){const d=a(u,f,m,g,v,p);m.transmission>0?n.push(d):m.transparent===!0?r.push(d):t.push(d)}function l(u,f,m,g,v,p){const d=a(u,f,m,g,v,p);m.transmission>0?n.unshift(d):m.transparent===!0?r.unshift(d):t.unshift(d)}function c(u,f){t.length>1&&t.sort(u||lg),n.length>1&&n.sort(f||Hl),r.length>1&&r.sort(f||Hl)}function h(){for(let u=e,f=i.length;u<f;u++){const m=i[u];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:o,unshift:l,finish:h,sort:c}}function cg(){let i=new WeakMap;function e(n,r){const s=i.get(n);let a;return s===void 0?(a=new Gl,i.set(n,[a])):r>=s.length?(a=new Gl,s.push(a)):a=s[r],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function ug(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new te,color:new nt};break;case"SpotLight":t={position:new te,direction:new te,color:new nt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new te,color:new nt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new te,skyColor:new nt,groundColor:new nt};break;case"RectAreaLight":t={color:new nt,position:new te,halfWidth:new te,halfHeight:new te};break}return i[e.id]=t,t}}}function fg(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let hg=0;function dg(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function pg(i){const e=new ug,t=fg(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new te);const r=new te,s=new pt,a=new pt;function o(c){let h=0,u=0,f=0;for(let H=0;H<9;H++)n.probe[H].set(0,0,0);let m=0,g=0,v=0,p=0,d=0,M=0,S=0,y=0,R=0,A=0,T=0;c.sort(dg);for(let H=0,x=c.length;H<x;H++){const E=c[H],N=E.color,L=E.intensity,P=E.distance,X=E.shadow&&E.shadow.map?E.shadow.map.texture:null;if(E.isAmbientLight)h+=N.r*L,u+=N.g*L,f+=N.b*L;else if(E.isLightProbe){for(let z=0;z<9;z++)n.probe[z].addScaledVector(E.sh.coefficients[z],L);T++}else if(E.isDirectionalLight){const z=e.get(E);if(z.color.copy(E.color).multiplyScalar(E.intensity),E.castShadow){const re=E.shadow,q=t.get(E);q.shadowIntensity=re.intensity,q.shadowBias=re.bias,q.shadowNormalBias=re.normalBias,q.shadowRadius=re.radius,q.shadowMapSize=re.mapSize,n.directionalShadow[m]=q,n.directionalShadowMap[m]=X,n.directionalShadowMatrix[m]=E.shadow.matrix,M++}n.directional[m]=z,m++}else if(E.isSpotLight){const z=e.get(E);z.position.setFromMatrixPosition(E.matrixWorld),z.color.copy(N).multiplyScalar(L),z.distance=P,z.coneCos=Math.cos(E.angle),z.penumbraCos=Math.cos(E.angle*(1-E.penumbra)),z.decay=E.decay,n.spot[v]=z;const re=E.shadow;if(E.map&&(n.spotLightMap[R]=E.map,R++,re.updateMatrices(E),E.castShadow&&A++),n.spotLightMatrix[v]=re.matrix,E.castShadow){const q=t.get(E);q.shadowIntensity=re.intensity,q.shadowBias=re.bias,q.shadowNormalBias=re.normalBias,q.shadowRadius=re.radius,q.shadowMapSize=re.mapSize,n.spotShadow[v]=q,n.spotShadowMap[v]=X,y++}v++}else if(E.isRectAreaLight){const z=e.get(E);z.color.copy(N).multiplyScalar(L),z.halfWidth.set(E.width*.5,0,0),z.halfHeight.set(0,E.height*.5,0),n.rectArea[p]=z,p++}else if(E.isPointLight){const z=e.get(E);if(z.color.copy(E.color).multiplyScalar(E.intensity),z.distance=E.distance,z.decay=E.decay,E.castShadow){const re=E.shadow,q=t.get(E);q.shadowIntensity=re.intensity,q.shadowBias=re.bias,q.shadowNormalBias=re.normalBias,q.shadowRadius=re.radius,q.shadowMapSize=re.mapSize,q.shadowCameraNear=re.camera.near,q.shadowCameraFar=re.camera.far,n.pointShadow[g]=q,n.pointShadowMap[g]=X,n.pointShadowMatrix[g]=E.shadow.matrix,S++}n.point[g]=z,g++}else if(E.isHemisphereLight){const z=e.get(E);z.skyColor.copy(E.color).multiplyScalar(L),z.groundColor.copy(E.groundColor).multiplyScalar(L),n.hemi[d]=z,d++}}p>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Le.LTC_FLOAT_1,n.rectAreaLTC2=Le.LTC_FLOAT_2):(n.rectAreaLTC1=Le.LTC_HALF_1,n.rectAreaLTC2=Le.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const I=n.hash;(I.directionalLength!==m||I.pointLength!==g||I.spotLength!==v||I.rectAreaLength!==p||I.hemiLength!==d||I.numDirectionalShadows!==M||I.numPointShadows!==S||I.numSpotShadows!==y||I.numSpotMaps!==R||I.numLightProbes!==T)&&(n.directional.length=m,n.spot.length=v,n.rectArea.length=p,n.point.length=g,n.hemi.length=d,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=S,n.pointShadowMap.length=S,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=S,n.spotLightMatrix.length=y+R-A,n.spotLightMap.length=R,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=T,I.directionalLength=m,I.pointLength=g,I.spotLength=v,I.rectAreaLength=p,I.hemiLength=d,I.numDirectionalShadows=M,I.numPointShadows=S,I.numSpotShadows=y,I.numSpotMaps=R,I.numLightProbes=T,n.version=hg++)}function l(c,h){let u=0,f=0,m=0,g=0,v=0;const p=h.matrixWorldInverse;for(let d=0,M=c.length;d<M;d++){const S=c[d];if(S.isDirectionalLight){const y=n.directional[u];y.direction.setFromMatrixPosition(S.matrixWorld),r.setFromMatrixPosition(S.target.matrixWorld),y.direction.sub(r),y.direction.transformDirection(p),u++}else if(S.isSpotLight){const y=n.spot[m];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(p),y.direction.setFromMatrixPosition(S.matrixWorld),r.setFromMatrixPosition(S.target.matrixWorld),y.direction.sub(r),y.direction.transformDirection(p),m++}else if(S.isRectAreaLight){const y=n.rectArea[g];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(p),a.identity(),s.copy(S.matrixWorld),s.premultiply(p),a.extractRotation(s),y.halfWidth.set(S.width*.5,0,0),y.halfHeight.set(0,S.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),g++}else if(S.isPointLight){const y=n.point[f];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(p),f++}else if(S.isHemisphereLight){const y=n.hemi[v];y.direction.setFromMatrixPosition(S.matrixWorld),y.direction.transformDirection(p),v++}}}return{setup:o,setupView:l,state:n}}function Vl(i){const e=new pg(i),t=[],n=[];function r(h){c.camera=h,t.length=0,n.length=0}function s(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function mg(i){let e=new WeakMap;function t(r,s=0){const a=e.get(r);let o;return a===void 0?(o=new Vl(i),e.set(r,[o])):s>=a.length?(o=new Vl(i),a.push(o)):o=a[s],o}function n(){e=new WeakMap}return{get:t,dispose:n}}class _g extends Ki{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=fh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class gg extends Ki{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const vg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,xg=`uniform sampler2D shadow_pass;
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
}`;function Sg(i,e,t){let n=new xa;const r=new lt,s=new lt,a=new _t,o=new _g({depthPacking:hh}),l=new gg,c={},h=t.maxTextureSize,u={[Gn]:Nt,[Nt]:Gn,[xn]:xn},f=new Vn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new lt},radius:{value:4}},vertexShader:vg,fragmentShader:xg}),m=f.clone();m.defines.HORIZONTAL_PASS=1;const g=new fn;g.setAttribute("position",new rn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new an(g,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=pu;let d=this.type;this.render=function(A,T,I){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||A.length===0)return;const H=i.getRenderTarget(),x=i.getActiveCubeFace(),E=i.getActiveMipmapLevel(),N=i.state;N.setBlending(Bn),N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);const L=d!==vn&&this.type===vn,P=d===vn&&this.type!==vn;for(let X=0,z=A.length;X<z;X++){const re=A[X],q=re.shadow;if(q===void 0){console.warn("THREE.WebGLShadowMap:",re,"has no shadow.");continue}if(q.autoUpdate===!1&&q.needsUpdate===!1)continue;r.copy(q.mapSize);const fe=q.getFrameExtents();if(r.multiply(fe),s.copy(q.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(s.x=Math.floor(h/fe.x),r.x=s.x*fe.x,q.mapSize.x=s.x),r.y>h&&(s.y=Math.floor(h/fe.y),r.y=s.y*fe.y,q.mapSize.y=s.y)),q.map===null||L===!0||P===!0){const _e=this.type!==vn?{minFilter:qt,magFilter:qt}:{};q.map!==null&&q.map.dispose(),q.map=new hi(r.x,r.y,_e),q.map.texture.name=re.name+".shadowMap",q.camera.updateProjectionMatrix()}i.setRenderTarget(q.map),i.clear();const Me=q.getViewportCount();for(let _e=0;_e<Me;_e++){const Ne=q.getViewport(_e);a.set(s.x*Ne.x,s.y*Ne.y,s.x*Ne.z,s.y*Ne.w),N.viewport(a),q.updateMatrices(re,_e),n=q.getFrustum(),y(T,I,q.camera,re,this.type)}q.isPointLightShadow!==!0&&this.type===vn&&M(q,I),q.needsUpdate=!1}d=this.type,p.needsUpdate=!1,i.setRenderTarget(H,x,E)};function M(A,T){const I=e.update(v);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,m.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,m.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new hi(r.x,r.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(T,null,I,f,v,null),m.uniforms.shadow_pass.value=A.mapPass.texture,m.uniforms.resolution.value=A.mapSize,m.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(T,null,I,m,v,null)}function S(A,T,I,H){let x=null;const E=I.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(E!==void 0)x=E;else if(x=I.isPointLight===!0?l:o,i.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0){const N=x.uuid,L=T.uuid;let P=c[N];P===void 0&&(P={},c[N]=P);let X=P[L];X===void 0&&(X=x.clone(),P[L]=X,T.addEventListener("dispose",R)),x=X}if(x.visible=T.visible,x.wireframe=T.wireframe,H===vn?x.side=T.shadowSide!==null?T.shadowSide:T.side:x.side=T.shadowSide!==null?T.shadowSide:u[T.side],x.alphaMap=T.alphaMap,x.alphaTest=T.alphaTest,x.map=T.map,x.clipShadows=T.clipShadows,x.clippingPlanes=T.clippingPlanes,x.clipIntersection=T.clipIntersection,x.displacementMap=T.displacementMap,x.displacementScale=T.displacementScale,x.displacementBias=T.displacementBias,x.wireframeLinewidth=T.wireframeLinewidth,x.linewidth=T.linewidth,I.isPointLight===!0&&x.isMeshDistanceMaterial===!0){const N=i.properties.get(x);N.light=I}return x}function y(A,T,I,H,x){if(A.visible===!1)return;if(A.layers.test(T.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&x===vn)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,A.matrixWorld);const L=e.update(A),P=A.material;if(Array.isArray(P)){const X=L.groups;for(let z=0,re=X.length;z<re;z++){const q=X[z],fe=P[q.materialIndex];if(fe&&fe.visible){const Me=S(A,fe,H,x);A.onBeforeShadow(i,A,T,I,L,Me,q),i.renderBufferDirect(I,null,L,Me,A,q),A.onAfterShadow(i,A,T,I,L,Me,q)}}}else if(P.visible){const X=S(A,P,H,x);A.onBeforeShadow(i,A,T,I,L,X,null),i.renderBufferDirect(I,null,L,X,A,null),A.onAfterShadow(i,A,T,I,L,X,null)}}const N=A.children;for(let L=0,P=N.length;L<P;L++)y(N[L],T,I,H,x)}function R(A){A.target.removeEventListener("dispose",R);for(const I in c){const H=c[I],x=A.target.uuid;x in H&&(H[x].dispose(),delete H[x])}}}const Mg={[ho]:po,[mo]:vo,[_o]:xo,[Vi]:go,[po]:ho,[vo]:mo,[xo]:_o,[go]:Vi};function Eg(i){function e(){let O=!1;const ye=new _t;let Q=null;const U=new _t(0,0,0,0);return{setMask:function(ue){Q!==ue&&!O&&(i.colorMask(ue,ue,ue,ue),Q=ue)},setLocked:function(ue){O=ue},setClear:function(ue,Y,we,ct,Lt){Lt===!0&&(ue*=ct,Y*=ct,we*=ct),ye.set(ue,Y,we,ct),U.equals(ye)===!1&&(i.clearColor(ue,Y,we,ct),U.copy(ye))},reset:function(){O=!1,Q=null,U.set(-1,0,0,0)}}}function t(){let O=!1,ye=!1,Q=null,U=null,ue=null;return{setReversed:function(Y){ye=Y},setTest:function(Y){Y?de(i.DEPTH_TEST):ce(i.DEPTH_TEST)},setMask:function(Y){Q!==Y&&!O&&(i.depthMask(Y),Q=Y)},setFunc:function(Y){if(ye&&(Y=Mg[Y]),U!==Y){switch(Y){case ho:i.depthFunc(i.NEVER);break;case po:i.depthFunc(i.ALWAYS);break;case mo:i.depthFunc(i.LESS);break;case Vi:i.depthFunc(i.LEQUAL);break;case _o:i.depthFunc(i.EQUAL);break;case go:i.depthFunc(i.GEQUAL);break;case vo:i.depthFunc(i.GREATER);break;case xo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}U=Y}},setLocked:function(Y){O=Y},setClear:function(Y){ue!==Y&&(i.clearDepth(Y),ue=Y)},reset:function(){O=!1,Q=null,U=null,ue=null}}}function n(){let O=!1,ye=null,Q=null,U=null,ue=null,Y=null,we=null,ct=null,Lt=null;return{setTest:function(it){O||(it?de(i.STENCIL_TEST):ce(i.STENCIL_TEST))},setMask:function(it){ye!==it&&!O&&(i.stencilMask(it),ye=it)},setFunc:function(it,Dt,hn){(Q!==it||U!==Dt||ue!==hn)&&(i.stencilFunc(it,Dt,hn),Q=it,U=Dt,ue=hn)},setOp:function(it,Dt,hn){(Y!==it||we!==Dt||ct!==hn)&&(i.stencilOp(it,Dt,hn),Y=it,we=Dt,ct=hn)},setLocked:function(it){O=it},setClear:function(it){Lt!==it&&(i.clearStencil(it),Lt=it)},reset:function(){O=!1,ye=null,Q=null,U=null,ue=null,Y=null,we=null,ct=null,Lt=null}}}const r=new e,s=new t,a=new n,o=new WeakMap,l=new WeakMap;let c={},h={},u=new WeakMap,f=[],m=null,g=!1,v=null,p=null,d=null,M=null,S=null,y=null,R=null,A=new nt(0,0,0),T=0,I=!1,H=null,x=null,E=null,N=null,L=null;const P=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,z=0;const re=i.getParameter(i.VERSION);re.indexOf("WebGL")!==-1?(z=parseFloat(/^WebGL (\d)/.exec(re)[1]),X=z>=1):re.indexOf("OpenGL ES")!==-1&&(z=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),X=z>=2);let q=null,fe={};const Me=i.getParameter(i.SCISSOR_BOX),_e=i.getParameter(i.VIEWPORT),Ne=new _t().fromArray(Me),Pe=new _t().fromArray(_e);function Z(O,ye,Q,U){const ue=new Uint8Array(4),Y=i.createTexture();i.bindTexture(O,Y),i.texParameteri(O,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(O,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let we=0;we<Q;we++)O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY?i.texImage3D(ye,0,i.RGBA,1,1,U,0,i.RGBA,i.UNSIGNED_BYTE,ue):i.texImage2D(ye+we,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ue);return Y}const oe={};oe[i.TEXTURE_2D]=Z(i.TEXTURE_2D,i.TEXTURE_2D,1),oe[i.TEXTURE_CUBE_MAP]=Z(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),oe[i.TEXTURE_2D_ARRAY]=Z(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),oe[i.TEXTURE_3D]=Z(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),s.setClear(1),a.setClear(0),de(i.DEPTH_TEST),s.setFunc(Vi),De(!1),ze(Za),de(i.CULL_FACE),F(Bn);function de(O){c[O]!==!0&&(i.enable(O),c[O]=!0)}function ce(O){c[O]!==!1&&(i.disable(O),c[O]=!1)}function le(O,ye){return h[O]!==ye?(i.bindFramebuffer(O,ye),h[O]=ye,O===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=ye),O===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=ye),!0):!1}function ge(O,ye){let Q=f,U=!1;if(O){Q=u.get(ye),Q===void 0&&(Q=[],u.set(ye,Q));const ue=O.textures;if(Q.length!==ue.length||Q[0]!==i.COLOR_ATTACHMENT0){for(let Y=0,we=ue.length;Y<we;Y++)Q[Y]=i.COLOR_ATTACHMENT0+Y;Q.length=ue.length,U=!0}}else Q[0]!==i.BACK&&(Q[0]=i.BACK,U=!0);U&&i.drawBuffers(Q)}function he(O){return m!==O?(i.useProgram(O),m=O,!0):!1}const ve={[oi]:i.FUNC_ADD,[Bf]:i.FUNC_SUBTRACT,[zf]:i.FUNC_REVERSE_SUBTRACT};ve[kf]=i.MIN,ve[Hf]=i.MAX;const Te={[Gf]:i.ZERO,[Vf]:i.ONE,[Wf]:i.SRC_COLOR,[uo]:i.SRC_ALPHA,[Kf]:i.SRC_ALPHA_SATURATE,[$f]:i.DST_COLOR,[qf]:i.DST_ALPHA,[Xf]:i.ONE_MINUS_SRC_COLOR,[fo]:i.ONE_MINUS_SRC_ALPHA,[jf]:i.ONE_MINUS_DST_COLOR,[Yf]:i.ONE_MINUS_DST_ALPHA,[Zf]:i.CONSTANT_COLOR,[Jf]:i.ONE_MINUS_CONSTANT_COLOR,[Qf]:i.CONSTANT_ALPHA,[eh]:i.ONE_MINUS_CONSTANT_ALPHA};function F(O,ye,Q,U,ue,Y,we,ct,Lt,it){if(O===Bn){g===!0&&(ce(i.BLEND),g=!1);return}if(g===!1&&(de(i.BLEND),g=!0),O!==Of){if(O!==v||it!==I){if((p!==oi||S!==oi)&&(i.blendEquation(i.FUNC_ADD),p=oi,S=oi),it)switch(O){case zi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ja:i.blendFunc(i.ONE,i.ONE);break;case Qa:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case el:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",O);break}else switch(O){case zi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ja:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Qa:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case el:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",O);break}d=null,M=null,y=null,R=null,A.set(0,0,0),T=0,v=O,I=it}return}ue=ue||ye,Y=Y||Q,we=we||U,(ye!==p||ue!==S)&&(i.blendEquationSeparate(ve[ye],ve[ue]),p=ye,S=ue),(Q!==d||U!==M||Y!==y||we!==R)&&(i.blendFuncSeparate(Te[Q],Te[U],Te[Y],Te[we]),d=Q,M=U,y=Y,R=we),(ct.equals(A)===!1||Lt!==T)&&(i.blendColor(ct.r,ct.g,ct.b,Lt),A.copy(ct),T=Lt),v=O,I=!1}function Ke(O,ye){O.side===xn?ce(i.CULL_FACE):de(i.CULL_FACE);let Q=O.side===Nt;ye&&(Q=!Q),De(Q),O.blending===zi&&O.transparent===!1?F(Bn):F(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),s.setFunc(O.depthFunc),s.setTest(O.depthTest),s.setMask(O.depthWrite),r.setMask(O.colorWrite);const U=O.stencilWrite;a.setTest(U),U&&(a.setMask(O.stencilWriteMask),a.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),a.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),Je(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?de(i.SAMPLE_ALPHA_TO_COVERAGE):ce(i.SAMPLE_ALPHA_TO_COVERAGE)}function De(O){H!==O&&(O?i.frontFace(i.CW):i.frontFace(i.CCW),H=O)}function ze(O){O!==Uf?(de(i.CULL_FACE),O!==x&&(O===Za?i.cullFace(i.BACK):O===Nf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ce(i.CULL_FACE),x=O}function be(O){O!==E&&(X&&i.lineWidth(O),E=O)}function Je(O,ye,Q){O?(de(i.POLYGON_OFFSET_FILL),(N!==ye||L!==Q)&&(i.polygonOffset(ye,Q),N=ye,L=Q)):ce(i.POLYGON_OFFSET_FILL)}function se(O){O?de(i.SCISSOR_TEST):ce(i.SCISSOR_TEST)}function C(O){O===void 0&&(O=i.TEXTURE0+P-1),q!==O&&(i.activeTexture(O),q=O)}function b(O,ye,Q){Q===void 0&&(q===null?Q=i.TEXTURE0+P-1:Q=q);let U=fe[Q];U===void 0&&(U={type:void 0,texture:void 0},fe[Q]=U),(U.type!==O||U.texture!==ye)&&(q!==Q&&(i.activeTexture(Q),q=Q),i.bindTexture(O,ye||oe[O]),U.type=O,U.texture=ye)}function k(){const O=fe[q];O!==void 0&&O.type!==void 0&&(i.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function j(){try{i.compressedTexImage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function ae(){try{i.compressedTexImage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function ne(){try{i.texSubImage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Ue(){try{i.texSubImage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function xe(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function K(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function He(){try{i.texStorage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function V(){try{i.texStorage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Ee(){try{i.texImage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Oe(){try{i.texImage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Be(O){Ne.equals(O)===!1&&(i.scissor(O.x,O.y,O.z,O.w),Ne.copy(O))}function Se(O){Pe.equals(O)===!1&&(i.viewport(O.x,O.y,O.z,O.w),Pe.copy(O))}function qe(O,ye){let Q=l.get(ye);Q===void 0&&(Q=new WeakMap,l.set(ye,Q));let U=Q.get(O);U===void 0&&(U=i.getUniformBlockIndex(ye,O.name),Q.set(O,U))}function Ie(O,ye){const U=l.get(ye).get(O);o.get(ye)!==U&&(i.uniformBlockBinding(ye,U,O.__bindingPointIndex),o.set(ye,U))}function Ye(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),c={},q=null,fe={},h={},u=new WeakMap,f=[],m=null,g=!1,v=null,p=null,d=null,M=null,S=null,y=null,R=null,A=new nt(0,0,0),T=0,I=!1,H=null,x=null,E=null,N=null,L=null,Ne.set(0,0,i.canvas.width,i.canvas.height),Pe.set(0,0,i.canvas.width,i.canvas.height),r.reset(),s.reset(),a.reset()}return{buffers:{color:r,depth:s,stencil:a},enable:de,disable:ce,bindFramebuffer:le,drawBuffers:ge,useProgram:he,setBlending:F,setMaterial:Ke,setFlipSided:De,setCullFace:ze,setLineWidth:be,setPolygonOffset:Je,setScissorTest:se,activeTexture:C,bindTexture:b,unbindTexture:k,compressedTexImage2D:j,compressedTexImage3D:ae,texImage2D:Ee,texImage3D:Oe,updateUBOMapping:qe,uniformBlockBinding:Ie,texStorage2D:He,texStorage3D:V,texSubImage2D:ne,texSubImage3D:Ue,compressedTexSubImage2D:xe,compressedTexSubImage3D:K,scissor:Be,viewport:Se,reset:Ye}}function Wl(i,e,t,n){const r=yg(n);switch(t){case xu:return i*e;case Mu:return i*e;case Eu:return i*e*2;case yu:return i*e/r.components*r.byteLength;case ma:return i*e/r.components*r.byteLength;case bu:return i*e*2/r.components*r.byteLength;case _a:return i*e*2/r.components*r.byteLength;case Su:return i*e*3/r.components*r.byteLength;case tn:return i*e*4/r.components*r.byteLength;case ga:return i*e*4/r.components*r.byteLength;case Yr:case $r:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case jr:case Kr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case To:case wo:return Math.max(i,16)*Math.max(e,8)/4;case bo:case Ao:return Math.max(i,8)*Math.max(e,8)/2;case Ro:case Co:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Po:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Lo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Do:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Io:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Uo:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case No:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Fo:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Oo:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Bo:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case zo:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case ko:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Ho:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Go:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Vo:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Wo:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Zr:case Xo:case qo:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Tu:case Yo:return Math.ceil(i/4)*Math.ceil(e/4)*8;case $o:case jo:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function yg(i){switch(i){case An:case _u:return{byteLength:1,components:1};case fr:case gu:case pr:return{byteLength:2,components:1};case da:case pa:return{byteLength:2,components:4};case fi:case ha:case En:return{byteLength:4,components:1};case vu:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function bg(i,e,t,n,r,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new lt,h=new WeakMap;let u;const f=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(C,b){return m?new OffscreenCanvas(C,b):as("canvas")}function v(C,b,k){let j=1;const ae=se(C);if((ae.width>k||ae.height>k)&&(j=k/Math.max(ae.width,ae.height)),j<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const ne=Math.floor(j*ae.width),Ue=Math.floor(j*ae.height);u===void 0&&(u=g(ne,Ue));const xe=b?g(ne,Ue):u;return xe.width=ne,xe.height=Ue,xe.getContext("2d").drawImage(C,0,0,ne,Ue),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ae.width+"x"+ae.height+") to ("+ne+"x"+Ue+")."),xe}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ae.width+"x"+ae.height+")."),C;return C}function p(C){return C.generateMipmaps&&C.minFilter!==qt&&C.minFilter!==Qt}function d(C){i.generateMipmap(C)}function M(C,b,k,j,ae=!1){if(C!==null){if(i[C]!==void 0)return i[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let ne=b;if(b===i.RED&&(k===i.FLOAT&&(ne=i.R32F),k===i.HALF_FLOAT&&(ne=i.R16F),k===i.UNSIGNED_BYTE&&(ne=i.R8)),b===i.RED_INTEGER&&(k===i.UNSIGNED_BYTE&&(ne=i.R8UI),k===i.UNSIGNED_SHORT&&(ne=i.R16UI),k===i.UNSIGNED_INT&&(ne=i.R32UI),k===i.BYTE&&(ne=i.R8I),k===i.SHORT&&(ne=i.R16I),k===i.INT&&(ne=i.R32I)),b===i.RG&&(k===i.FLOAT&&(ne=i.RG32F),k===i.HALF_FLOAT&&(ne=i.RG16F),k===i.UNSIGNED_BYTE&&(ne=i.RG8)),b===i.RG_INTEGER&&(k===i.UNSIGNED_BYTE&&(ne=i.RG8UI),k===i.UNSIGNED_SHORT&&(ne=i.RG16UI),k===i.UNSIGNED_INT&&(ne=i.RG32UI),k===i.BYTE&&(ne=i.RG8I),k===i.SHORT&&(ne=i.RG16I),k===i.INT&&(ne=i.RG32I)),b===i.RGB_INTEGER&&(k===i.UNSIGNED_BYTE&&(ne=i.RGB8UI),k===i.UNSIGNED_SHORT&&(ne=i.RGB16UI),k===i.UNSIGNED_INT&&(ne=i.RGB32UI),k===i.BYTE&&(ne=i.RGB8I),k===i.SHORT&&(ne=i.RGB16I),k===i.INT&&(ne=i.RGB32I)),b===i.RGBA_INTEGER&&(k===i.UNSIGNED_BYTE&&(ne=i.RGBA8UI),k===i.UNSIGNED_SHORT&&(ne=i.RGBA16UI),k===i.UNSIGNED_INT&&(ne=i.RGBA32UI),k===i.BYTE&&(ne=i.RGBA8I),k===i.SHORT&&(ne=i.RGBA16I),k===i.INT&&(ne=i.RGBA32I)),b===i.RGB&&k===i.UNSIGNED_INT_5_9_9_9_REV&&(ne=i.RGB9_E5),b===i.RGBA){const Ue=ae?is:ot.getTransfer(j);k===i.FLOAT&&(ne=i.RGBA32F),k===i.HALF_FLOAT&&(ne=i.RGBA16F),k===i.UNSIGNED_BYTE&&(ne=Ue===ht?i.SRGB8_ALPHA8:i.RGBA8),k===i.UNSIGNED_SHORT_4_4_4_4&&(ne=i.RGBA4),k===i.UNSIGNED_SHORT_5_5_5_1&&(ne=i.RGB5_A1)}return(ne===i.R16F||ne===i.R32F||ne===i.RG16F||ne===i.RG32F||ne===i.RGBA16F||ne===i.RGBA32F)&&e.get("EXT_color_buffer_float"),ne}function S(C,b){let k;return C?b===null||b===fi||b===qi?k=i.DEPTH24_STENCIL8:b===En?k=i.DEPTH32F_STENCIL8:b===fr&&(k=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===fi||b===qi?k=i.DEPTH_COMPONENT24:b===En?k=i.DEPTH_COMPONENT32F:b===fr&&(k=i.DEPTH_COMPONENT16),k}function y(C,b){return p(C)===!0||C.isFramebufferTexture&&C.minFilter!==qt&&C.minFilter!==Qt?Math.log2(Math.max(b.width,b.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?b.mipmaps.length:1}function R(C){const b=C.target;b.removeEventListener("dispose",R),T(b),b.isVideoTexture&&h.delete(b)}function A(C){const b=C.target;b.removeEventListener("dispose",A),H(b)}function T(C){const b=n.get(C);if(b.__webglInit===void 0)return;const k=C.source,j=f.get(k);if(j){const ae=j[b.__cacheKey];ae.usedTimes--,ae.usedTimes===0&&I(C),Object.keys(j).length===0&&f.delete(k)}n.remove(C)}function I(C){const b=n.get(C);i.deleteTexture(b.__webglTexture);const k=C.source,j=f.get(k);delete j[b.__cacheKey],a.memory.textures--}function H(C){const b=n.get(C);if(C.depthTexture&&C.depthTexture.dispose(),C.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(b.__webglFramebuffer[j]))for(let ae=0;ae<b.__webglFramebuffer[j].length;ae++)i.deleteFramebuffer(b.__webglFramebuffer[j][ae]);else i.deleteFramebuffer(b.__webglFramebuffer[j]);b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer[j])}else{if(Array.isArray(b.__webglFramebuffer))for(let j=0;j<b.__webglFramebuffer.length;j++)i.deleteFramebuffer(b.__webglFramebuffer[j]);else i.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&i.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let j=0;j<b.__webglColorRenderbuffer.length;j++)b.__webglColorRenderbuffer[j]&&i.deleteRenderbuffer(b.__webglColorRenderbuffer[j]);b.__webglDepthRenderbuffer&&i.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const k=C.textures;for(let j=0,ae=k.length;j<ae;j++){const ne=n.get(k[j]);ne.__webglTexture&&(i.deleteTexture(ne.__webglTexture),a.memory.textures--),n.remove(k[j])}n.remove(C)}let x=0;function E(){x=0}function N(){const C=x;return C>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+r.maxTextures),x+=1,C}function L(C){const b=[];return b.push(C.wrapS),b.push(C.wrapT),b.push(C.wrapR||0),b.push(C.magFilter),b.push(C.minFilter),b.push(C.anisotropy),b.push(C.internalFormat),b.push(C.format),b.push(C.type),b.push(C.generateMipmaps),b.push(C.premultiplyAlpha),b.push(C.flipY),b.push(C.unpackAlignment),b.push(C.colorSpace),b.join()}function P(C,b){const k=n.get(C);if(C.isVideoTexture&&be(C),C.isRenderTargetTexture===!1&&C.version>0&&k.__version!==C.version){const j=C.image;if(j===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(j.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Pe(k,C,b);return}}t.bindTexture(i.TEXTURE_2D,k.__webglTexture,i.TEXTURE0+b)}function X(C,b){const k=n.get(C);if(C.version>0&&k.__version!==C.version){Pe(k,C,b);return}t.bindTexture(i.TEXTURE_2D_ARRAY,k.__webglTexture,i.TEXTURE0+b)}function z(C,b){const k=n.get(C);if(C.version>0&&k.__version!==C.version){Pe(k,C,b);return}t.bindTexture(i.TEXTURE_3D,k.__webglTexture,i.TEXTURE0+b)}function re(C,b){const k=n.get(C);if(C.version>0&&k.__version!==C.version){Z(k,C,b);return}t.bindTexture(i.TEXTURE_CUBE_MAP,k.__webglTexture,i.TEXTURE0+b)}const q={[Eo]:i.REPEAT,[ci]:i.CLAMP_TO_EDGE,[yo]:i.MIRRORED_REPEAT},fe={[qt]:i.NEAREST,[uh]:i.NEAREST_MIPMAP_NEAREST,[yr]:i.NEAREST_MIPMAP_LINEAR,[Qt]:i.LINEAR,[Ts]:i.LINEAR_MIPMAP_NEAREST,[ui]:i.LINEAR_MIPMAP_LINEAR},Me={[ph]:i.NEVER,[Sh]:i.ALWAYS,[mh]:i.LESS,[wu]:i.LEQUAL,[_h]:i.EQUAL,[xh]:i.GEQUAL,[gh]:i.GREATER,[vh]:i.NOTEQUAL};function _e(C,b){if(b.type===En&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===Qt||b.magFilter===Ts||b.magFilter===yr||b.magFilter===ui||b.minFilter===Qt||b.minFilter===Ts||b.minFilter===yr||b.minFilter===ui)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,q[b.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,q[b.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,q[b.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,fe[b.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,fe[b.minFilter]),b.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,Me[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===qt||b.minFilter!==yr&&b.minFilter!==ui||b.type===En&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){const k=e.get("EXT_texture_filter_anisotropic");i.texParameterf(C,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,r.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function Ne(C,b){let k=!1;C.__webglInit===void 0&&(C.__webglInit=!0,b.addEventListener("dispose",R));const j=b.source;let ae=f.get(j);ae===void 0&&(ae={},f.set(j,ae));const ne=L(b);if(ne!==C.__cacheKey){ae[ne]===void 0&&(ae[ne]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,k=!0),ae[ne].usedTimes++;const Ue=ae[C.__cacheKey];Ue!==void 0&&(ae[C.__cacheKey].usedTimes--,Ue.usedTimes===0&&I(b)),C.__cacheKey=ne,C.__webglTexture=ae[ne].texture}return k}function Pe(C,b,k){let j=i.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(j=i.TEXTURE_2D_ARRAY),b.isData3DTexture&&(j=i.TEXTURE_3D);const ae=Ne(C,b),ne=b.source;t.bindTexture(j,C.__webglTexture,i.TEXTURE0+k);const Ue=n.get(ne);if(ne.version!==Ue.__version||ae===!0){t.activeTexture(i.TEXTURE0+k);const xe=ot.getPrimaries(ot.workingColorSpace),K=b.colorSpace===Nn?null:ot.getPrimaries(b.colorSpace),He=b.colorSpace===Nn||xe===K?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,He);let V=v(b.image,!1,r.maxTextureSize);V=Je(b,V);const Ee=s.convert(b.format,b.colorSpace),Oe=s.convert(b.type);let Be=M(b.internalFormat,Ee,Oe,b.colorSpace,b.isVideoTexture);_e(j,b);let Se;const qe=b.mipmaps,Ie=b.isVideoTexture!==!0,Ye=Ue.__version===void 0||ae===!0,O=ne.dataReady,ye=y(b,V);if(b.isDepthTexture)Be=S(b.format===Yi,b.type),Ye&&(Ie?t.texStorage2D(i.TEXTURE_2D,1,Be,V.width,V.height):t.texImage2D(i.TEXTURE_2D,0,Be,V.width,V.height,0,Ee,Oe,null));else if(b.isDataTexture)if(qe.length>0){Ie&&Ye&&t.texStorage2D(i.TEXTURE_2D,ye,Be,qe[0].width,qe[0].height);for(let Q=0,U=qe.length;Q<U;Q++)Se=qe[Q],Ie?O&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,Se.width,Se.height,Ee,Oe,Se.data):t.texImage2D(i.TEXTURE_2D,Q,Be,Se.width,Se.height,0,Ee,Oe,Se.data);b.generateMipmaps=!1}else Ie?(Ye&&t.texStorage2D(i.TEXTURE_2D,ye,Be,V.width,V.height),O&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,V.width,V.height,Ee,Oe,V.data)):t.texImage2D(i.TEXTURE_2D,0,Be,V.width,V.height,0,Ee,Oe,V.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){Ie&&Ye&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ye,Be,qe[0].width,qe[0].height,V.depth);for(let Q=0,U=qe.length;Q<U;Q++)if(Se=qe[Q],b.format!==tn)if(Ee!==null)if(Ie){if(O)if(b.layerUpdates.size>0){const ue=Wl(Se.width,Se.height,b.format,b.type);for(const Y of b.layerUpdates){const we=Se.data.subarray(Y*ue/Se.data.BYTES_PER_ELEMENT,(Y+1)*ue/Se.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,Y,Se.width,Se.height,1,Ee,we,0,0)}b.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,Se.width,Se.height,V.depth,Ee,Se.data,0,0)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Q,Be,Se.width,Se.height,V.depth,0,Se.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ie?O&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,Se.width,Se.height,V.depth,Ee,Oe,Se.data):t.texImage3D(i.TEXTURE_2D_ARRAY,Q,Be,Se.width,Se.height,V.depth,0,Ee,Oe,Se.data)}else{Ie&&Ye&&t.texStorage2D(i.TEXTURE_2D,ye,Be,qe[0].width,qe[0].height);for(let Q=0,U=qe.length;Q<U;Q++)Se=qe[Q],b.format!==tn?Ee!==null?Ie?O&&t.compressedTexSubImage2D(i.TEXTURE_2D,Q,0,0,Se.width,Se.height,Ee,Se.data):t.compressedTexImage2D(i.TEXTURE_2D,Q,Be,Se.width,Se.height,0,Se.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ie?O&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,Se.width,Se.height,Ee,Oe,Se.data):t.texImage2D(i.TEXTURE_2D,Q,Be,Se.width,Se.height,0,Ee,Oe,Se.data)}else if(b.isDataArrayTexture)if(Ie){if(Ye&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ye,Be,V.width,V.height,V.depth),O)if(b.layerUpdates.size>0){const Q=Wl(V.width,V.height,b.format,b.type);for(const U of b.layerUpdates){const ue=V.data.subarray(U*Q/V.data.BYTES_PER_ELEMENT,(U+1)*Q/V.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,U,V.width,V.height,1,Ee,Oe,ue)}b.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,V.width,V.height,V.depth,Ee,Oe,V.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Be,V.width,V.height,V.depth,0,Ee,Oe,V.data);else if(b.isData3DTexture)Ie?(Ye&&t.texStorage3D(i.TEXTURE_3D,ye,Be,V.width,V.height,V.depth),O&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,V.width,V.height,V.depth,Ee,Oe,V.data)):t.texImage3D(i.TEXTURE_3D,0,Be,V.width,V.height,V.depth,0,Ee,Oe,V.data);else if(b.isFramebufferTexture){if(Ye)if(Ie)t.texStorage2D(i.TEXTURE_2D,ye,Be,V.width,V.height);else{let Q=V.width,U=V.height;for(let ue=0;ue<ye;ue++)t.texImage2D(i.TEXTURE_2D,ue,Be,Q,U,0,Ee,Oe,null),Q>>=1,U>>=1}}else if(qe.length>0){if(Ie&&Ye){const Q=se(qe[0]);t.texStorage2D(i.TEXTURE_2D,ye,Be,Q.width,Q.height)}for(let Q=0,U=qe.length;Q<U;Q++)Se=qe[Q],Ie?O&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,Ee,Oe,Se):t.texImage2D(i.TEXTURE_2D,Q,Be,Ee,Oe,Se);b.generateMipmaps=!1}else if(Ie){if(Ye){const Q=se(V);t.texStorage2D(i.TEXTURE_2D,ye,Be,Q.width,Q.height)}O&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Ee,Oe,V)}else t.texImage2D(i.TEXTURE_2D,0,Be,Ee,Oe,V);p(b)&&d(j),Ue.__version=ne.version,b.onUpdate&&b.onUpdate(b)}C.__version=b.version}function Z(C,b,k){if(b.image.length!==6)return;const j=Ne(C,b),ae=b.source;t.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+k);const ne=n.get(ae);if(ae.version!==ne.__version||j===!0){t.activeTexture(i.TEXTURE0+k);const Ue=ot.getPrimaries(ot.workingColorSpace),xe=b.colorSpace===Nn?null:ot.getPrimaries(b.colorSpace),K=b.colorSpace===Nn||Ue===xe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);const He=b.isCompressedTexture||b.image[0].isCompressedTexture,V=b.image[0]&&b.image[0].isDataTexture,Ee=[];for(let U=0;U<6;U++)!He&&!V?Ee[U]=v(b.image[U],!0,r.maxCubemapSize):Ee[U]=V?b.image[U].image:b.image[U],Ee[U]=Je(b,Ee[U]);const Oe=Ee[0],Be=s.convert(b.format,b.colorSpace),Se=s.convert(b.type),qe=M(b.internalFormat,Be,Se,b.colorSpace),Ie=b.isVideoTexture!==!0,Ye=ne.__version===void 0||j===!0,O=ae.dataReady;let ye=y(b,Oe);_e(i.TEXTURE_CUBE_MAP,b);let Q;if(He){Ie&&Ye&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ye,qe,Oe.width,Oe.height);for(let U=0;U<6;U++){Q=Ee[U].mipmaps;for(let ue=0;ue<Q.length;ue++){const Y=Q[ue];b.format!==tn?Be!==null?Ie?O&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+U,ue,0,0,Y.width,Y.height,Be,Y.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+U,ue,qe,Y.width,Y.height,0,Y.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ie?O&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+U,ue,0,0,Y.width,Y.height,Be,Se,Y.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+U,ue,qe,Y.width,Y.height,0,Be,Se,Y.data)}}}else{if(Q=b.mipmaps,Ie&&Ye){Q.length>0&&ye++;const U=se(Ee[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ye,qe,U.width,U.height)}for(let U=0;U<6;U++)if(V){Ie?O&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+U,0,0,0,Ee[U].width,Ee[U].height,Be,Se,Ee[U].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+U,0,qe,Ee[U].width,Ee[U].height,0,Be,Se,Ee[U].data);for(let ue=0;ue<Q.length;ue++){const we=Q[ue].image[U].image;Ie?O&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+U,ue+1,0,0,we.width,we.height,Be,Se,we.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+U,ue+1,qe,we.width,we.height,0,Be,Se,we.data)}}else{Ie?O&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+U,0,0,0,Be,Se,Ee[U]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+U,0,qe,Be,Se,Ee[U]);for(let ue=0;ue<Q.length;ue++){const Y=Q[ue];Ie?O&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+U,ue+1,0,0,Be,Se,Y.image[U]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+U,ue+1,qe,Be,Se,Y.image[U])}}}p(b)&&d(i.TEXTURE_CUBE_MAP),ne.__version=ae.version,b.onUpdate&&b.onUpdate(b)}C.__version=b.version}function oe(C,b,k,j,ae,ne){const Ue=s.convert(k.format,k.colorSpace),xe=s.convert(k.type),K=M(k.internalFormat,Ue,xe,k.colorSpace);if(!n.get(b).__hasExternalTextures){const V=Math.max(1,b.width>>ne),Ee=Math.max(1,b.height>>ne);ae===i.TEXTURE_3D||ae===i.TEXTURE_2D_ARRAY?t.texImage3D(ae,ne,K,V,Ee,b.depth,0,Ue,xe,null):t.texImage2D(ae,ne,K,V,Ee,0,Ue,xe,null)}t.bindFramebuffer(i.FRAMEBUFFER,C),ze(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,j,ae,n.get(k).__webglTexture,0,De(b)):(ae===i.TEXTURE_2D||ae>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ae<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,j,ae,n.get(k).__webglTexture,ne),t.bindFramebuffer(i.FRAMEBUFFER,null)}function de(C,b,k){if(i.bindRenderbuffer(i.RENDERBUFFER,C),b.depthBuffer){const j=b.depthTexture,ae=j&&j.isDepthTexture?j.type:null,ne=S(b.stencilBuffer,ae),Ue=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,xe=De(b);ze(b)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,xe,ne,b.width,b.height):k?i.renderbufferStorageMultisample(i.RENDERBUFFER,xe,ne,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,ne,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Ue,i.RENDERBUFFER,C)}else{const j=b.textures;for(let ae=0;ae<j.length;ae++){const ne=j[ae],Ue=s.convert(ne.format,ne.colorSpace),xe=s.convert(ne.type),K=M(ne.internalFormat,Ue,xe,ne.colorSpace),He=De(b);k&&ze(b)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,He,K,b.width,b.height):ze(b)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,He,K,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,K,b.width,b.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ce(C,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,C),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(b.depthTexture).__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),P(b.depthTexture,0);const j=n.get(b.depthTexture).__webglTexture,ae=De(b);if(b.depthTexture.format===ki)ze(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0,ae):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0);else if(b.depthTexture.format===Yi)ze(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0,ae):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function le(C){const b=n.get(C),k=C.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==C.depthTexture){const j=C.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),j){const ae=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,j.removeEventListener("dispose",ae)};j.addEventListener("dispose",ae),b.__depthDisposeCallback=ae}b.__boundDepthTexture=j}if(C.depthTexture&&!b.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");ce(b.__webglFramebuffer,C)}else if(k){b.__webglDepthbuffer=[];for(let j=0;j<6;j++)if(t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[j]),b.__webglDepthbuffer[j]===void 0)b.__webglDepthbuffer[j]=i.createRenderbuffer(),de(b.__webglDepthbuffer[j],C,!1);else{const ae=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ne=b.__webglDepthbuffer[j];i.bindRenderbuffer(i.RENDERBUFFER,ne),i.framebufferRenderbuffer(i.FRAMEBUFFER,ae,i.RENDERBUFFER,ne)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=i.createRenderbuffer(),de(b.__webglDepthbuffer,C,!1);else{const j=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=b.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ae),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,ae)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function ge(C,b,k){const j=n.get(C);b!==void 0&&oe(j.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),k!==void 0&&le(C)}function he(C){const b=C.texture,k=n.get(C),j=n.get(b);C.addEventListener("dispose",A);const ae=C.textures,ne=C.isWebGLCubeRenderTarget===!0,Ue=ae.length>1;if(Ue||(j.__webglTexture===void 0&&(j.__webglTexture=i.createTexture()),j.__version=b.version,a.memory.textures++),ne){k.__webglFramebuffer=[];for(let xe=0;xe<6;xe++)if(b.mipmaps&&b.mipmaps.length>0){k.__webglFramebuffer[xe]=[];for(let K=0;K<b.mipmaps.length;K++)k.__webglFramebuffer[xe][K]=i.createFramebuffer()}else k.__webglFramebuffer[xe]=i.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){k.__webglFramebuffer=[];for(let xe=0;xe<b.mipmaps.length;xe++)k.__webglFramebuffer[xe]=i.createFramebuffer()}else k.__webglFramebuffer=i.createFramebuffer();if(Ue)for(let xe=0,K=ae.length;xe<K;xe++){const He=n.get(ae[xe]);He.__webglTexture===void 0&&(He.__webglTexture=i.createTexture(),a.memory.textures++)}if(C.samples>0&&ze(C)===!1){k.__webglMultisampledFramebuffer=i.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let xe=0;xe<ae.length;xe++){const K=ae[xe];k.__webglColorRenderbuffer[xe]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,k.__webglColorRenderbuffer[xe]);const He=s.convert(K.format,K.colorSpace),V=s.convert(K.type),Ee=M(K.internalFormat,He,V,K.colorSpace,C.isXRRenderTarget===!0),Oe=De(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,Oe,Ee,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+xe,i.RENDERBUFFER,k.__webglColorRenderbuffer[xe])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(k.__webglDepthRenderbuffer=i.createRenderbuffer(),de(k.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ne){t.bindTexture(i.TEXTURE_CUBE_MAP,j.__webglTexture),_e(i.TEXTURE_CUBE_MAP,b);for(let xe=0;xe<6;xe++)if(b.mipmaps&&b.mipmaps.length>0)for(let K=0;K<b.mipmaps.length;K++)oe(k.__webglFramebuffer[xe][K],C,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,K);else oe(k.__webglFramebuffer[xe],C,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0);p(b)&&d(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ue){for(let xe=0,K=ae.length;xe<K;xe++){const He=ae[xe],V=n.get(He);t.bindTexture(i.TEXTURE_2D,V.__webglTexture),_e(i.TEXTURE_2D,He),oe(k.__webglFramebuffer,C,He,i.COLOR_ATTACHMENT0+xe,i.TEXTURE_2D,0),p(He)&&d(i.TEXTURE_2D)}t.unbindTexture()}else{let xe=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(xe=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(xe,j.__webglTexture),_e(xe,b),b.mipmaps&&b.mipmaps.length>0)for(let K=0;K<b.mipmaps.length;K++)oe(k.__webglFramebuffer[K],C,b,i.COLOR_ATTACHMENT0,xe,K);else oe(k.__webglFramebuffer,C,b,i.COLOR_ATTACHMENT0,xe,0);p(b)&&d(xe),t.unbindTexture()}C.depthBuffer&&le(C)}function ve(C){const b=C.textures;for(let k=0,j=b.length;k<j;k++){const ae=b[k];if(p(ae)){const ne=C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,Ue=n.get(ae).__webglTexture;t.bindTexture(ne,Ue),d(ne),t.unbindTexture()}}}const Te=[],F=[];function Ke(C){if(C.samples>0){if(ze(C)===!1){const b=C.textures,k=C.width,j=C.height;let ae=i.COLOR_BUFFER_BIT;const ne=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ue=n.get(C),xe=b.length>1;if(xe)for(let K=0;K<b.length;K++)t.bindFramebuffer(i.FRAMEBUFFER,Ue.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Ue.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Ue.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ue.__webglFramebuffer);for(let K=0;K<b.length;K++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(ae|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(ae|=i.STENCIL_BUFFER_BIT)),xe){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ue.__webglColorRenderbuffer[K]);const He=n.get(b[K]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,He,0)}i.blitFramebuffer(0,0,k,j,0,0,k,j,ae,i.NEAREST),l===!0&&(Te.length=0,F.length=0,Te.push(i.COLOR_ATTACHMENT0+K),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Te.push(ne),F.push(ne),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,F)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Te))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),xe)for(let K=0;K<b.length;K++){t.bindFramebuffer(i.FRAMEBUFFER,Ue.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.RENDERBUFFER,Ue.__webglColorRenderbuffer[K]);const He=n.get(b[K]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Ue.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.TEXTURE_2D,He,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ue.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const b=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[b])}}}function De(C){return Math.min(r.maxSamples,C.samples)}function ze(C){const b=n.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function be(C){const b=a.render.frame;h.get(C)!==b&&(h.set(C,b),C.update())}function Je(C,b){const k=C.colorSpace,j=C.format,ae=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||k!==Kn&&k!==Nn&&(ot.getTransfer(k)===ht?(j!==tn||ae!==An)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),b}function se(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=N,this.resetTextureUnits=E,this.setTexture2D=P,this.setTexture2DArray=X,this.setTexture3D=z,this.setTextureCube=re,this.rebindTextures=ge,this.setupRenderTarget=he,this.updateRenderTargetMipmap=ve,this.updateMultisampleRenderTarget=Ke,this.setupDepthRenderbuffer=le,this.setupFrameBufferTexture=oe,this.useMultisampledRTT=ze}function Tg(i,e){function t(n,r=Nn){let s;const a=ot.getTransfer(r);if(n===An)return i.UNSIGNED_BYTE;if(n===da)return i.UNSIGNED_SHORT_4_4_4_4;if(n===pa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===vu)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===_u)return i.BYTE;if(n===gu)return i.SHORT;if(n===fr)return i.UNSIGNED_SHORT;if(n===ha)return i.INT;if(n===fi)return i.UNSIGNED_INT;if(n===En)return i.FLOAT;if(n===pr)return i.HALF_FLOAT;if(n===xu)return i.ALPHA;if(n===Su)return i.RGB;if(n===tn)return i.RGBA;if(n===Mu)return i.LUMINANCE;if(n===Eu)return i.LUMINANCE_ALPHA;if(n===ki)return i.DEPTH_COMPONENT;if(n===Yi)return i.DEPTH_STENCIL;if(n===yu)return i.RED;if(n===ma)return i.RED_INTEGER;if(n===bu)return i.RG;if(n===_a)return i.RG_INTEGER;if(n===ga)return i.RGBA_INTEGER;if(n===Yr||n===$r||n===jr||n===Kr)if(a===ht)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===Yr)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===$r)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===jr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Kr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===Yr)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===$r)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===jr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Kr)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===bo||n===To||n===Ao||n===wo)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===bo)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===To)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ao)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===wo)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ro||n===Co||n===Po)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Ro||n===Co)return a===ht?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===Po)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Lo||n===Do||n===Io||n===Uo||n===No||n===Fo||n===Oo||n===Bo||n===zo||n===ko||n===Ho||n===Go||n===Vo||n===Wo)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Lo)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Do)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Io)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Uo)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===No)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Fo)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Oo)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Bo)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===zo)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ko)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ho)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Go)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Vo)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Wo)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Zr||n===Xo||n===qo)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Zr)return a===ht?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Xo)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===qo)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Tu||n===Yo||n===$o||n===jo)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===Zr)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Yo)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===$o)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===jo)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===qi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}class Ag extends Jt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Fi extends bt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const wg={type:"move"};class to{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Fi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Fi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new te,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new te),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Fi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new te,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new te),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const v of e.hand.values()){const p=t.getJointPose(v,n),d=this._getHandJoint(c,v);p!==null&&(d.matrix.fromArray(p.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=p.radius),d.visible=p!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),m=.02,g=.005;c.inputState.pinching&&f>m+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=m-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(wg)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Fi;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Rg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Cg=`
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

}`;class Pg{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const r=new Ft,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Vn({vertexShader:Rg,fragmentShader:Cg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new an(new xr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Lg extends ji{constructor(e,t){super();const n=this;let r=null,s=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,m=null,g=null;const v=new Pg,p=t.getContextAttributes();let d=null,M=null;const S=[],y=[],R=new lt;let A=null;const T=new Jt;T.layers.enable(1),T.viewport=new _t;const I=new Jt;I.layers.enable(2),I.viewport=new _t;const H=[T,I],x=new Ag;x.layers.enable(1),x.layers.enable(2);let E=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let oe=S[Z];return oe===void 0&&(oe=new to,S[Z]=oe),oe.getTargetRaySpace()},this.getControllerGrip=function(Z){let oe=S[Z];return oe===void 0&&(oe=new to,S[Z]=oe),oe.getGripSpace()},this.getHand=function(Z){let oe=S[Z];return oe===void 0&&(oe=new to,S[Z]=oe),oe.getHandSpace()};function L(Z){const oe=y.indexOf(Z.inputSource);if(oe===-1)return;const de=S[oe];de!==void 0&&(de.update(Z.inputSource,Z.frame,c||a),de.dispatchEvent({type:Z.type,data:Z.inputSource}))}function P(){r.removeEventListener("select",L),r.removeEventListener("selectstart",L),r.removeEventListener("selectend",L),r.removeEventListener("squeeze",L),r.removeEventListener("squeezestart",L),r.removeEventListener("squeezeend",L),r.removeEventListener("end",P),r.removeEventListener("inputsourceschange",X);for(let Z=0;Z<S.length;Z++){const oe=y[Z];oe!==null&&(y[Z]=null,S[Z].disconnect(oe))}E=null,N=null,v.reset(),e.setRenderTarget(d),m=null,f=null,u=null,r=null,M=null,Pe.stop(),n.isPresenting=!1,e.setPixelRatio(A),e.setSize(R.width,R.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){s=Z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return f!==null?f:m},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(Z){if(r=Z,r!==null){if(d=e.getRenderTarget(),r.addEventListener("select",L),r.addEventListener("selectstart",L),r.addEventListener("selectend",L),r.addEventListener("squeeze",L),r.addEventListener("squeezestart",L),r.addEventListener("squeezeend",L),r.addEventListener("end",P),r.addEventListener("inputsourceschange",X),p.xrCompatible!==!0&&await t.makeXRCompatible(),A=e.getPixelRatio(),e.getSize(R),r.renderState.layers===void 0){const oe={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:s};m=new XRWebGLLayer(r,t,oe),r.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),M=new hi(m.framebufferWidth,m.framebufferHeight,{format:tn,type:An,colorSpace:e.outputColorSpace,stencilBuffer:p.stencil})}else{let oe=null,de=null,ce=null;p.depth&&(ce=p.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,oe=p.stencil?Yi:ki,de=p.stencil?qi:fi);const le={colorFormat:t.RGBA8,depthFormat:ce,scaleFactor:s};u=new XRWebGLBinding(r,t),f=u.createProjectionLayer(le),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),M=new hi(f.textureWidth,f.textureHeight,{format:tn,type:An,depthTexture:new Hu(f.textureWidth,f.textureHeight,de,void 0,void 0,void 0,void 0,void 0,void 0,oe),stencilBuffer:p.stencil,colorSpace:e.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await r.requestReferenceSpace(o),Pe.setContext(r),Pe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function X(Z){for(let oe=0;oe<Z.removed.length;oe++){const de=Z.removed[oe],ce=y.indexOf(de);ce>=0&&(y[ce]=null,S[ce].disconnect(de))}for(let oe=0;oe<Z.added.length;oe++){const de=Z.added[oe];let ce=y.indexOf(de);if(ce===-1){for(let ge=0;ge<S.length;ge++)if(ge>=y.length){y.push(de),ce=ge;break}else if(y[ge]===null){y[ge]=de,ce=ge;break}if(ce===-1)break}const le=S[ce];le&&le.connect(de)}}const z=new te,re=new te;function q(Z,oe,de){z.setFromMatrixPosition(oe.matrixWorld),re.setFromMatrixPosition(de.matrixWorld);const ce=z.distanceTo(re),le=oe.projectionMatrix.elements,ge=de.projectionMatrix.elements,he=le[14]/(le[10]-1),ve=le[14]/(le[10]+1),Te=(le[9]+1)/le[5],F=(le[9]-1)/le[5],Ke=(le[8]-1)/le[0],De=(ge[8]+1)/ge[0],ze=he*Ke,be=he*De,Je=ce/(-Ke+De),se=Je*-Ke;if(oe.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(se),Z.translateZ(Je),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),le[10]===-1)Z.projectionMatrix.copy(oe.projectionMatrix),Z.projectionMatrixInverse.copy(oe.projectionMatrixInverse);else{const C=he+Je,b=ve+Je,k=ze-se,j=be+(ce-se),ae=Te*ve/b*C,ne=F*ve/b*C;Z.projectionMatrix.makePerspective(k,j,ae,ne,C,b),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function fe(Z,oe){oe===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(oe.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(r===null)return;let oe=Z.near,de=Z.far;v.texture!==null&&(v.depthNear>0&&(oe=v.depthNear),v.depthFar>0&&(de=v.depthFar)),x.near=I.near=T.near=oe,x.far=I.far=T.far=de,(E!==x.near||N!==x.far)&&(r.updateRenderState({depthNear:x.near,depthFar:x.far}),E=x.near,N=x.far);const ce=Z.parent,le=x.cameras;fe(x,ce);for(let ge=0;ge<le.length;ge++)fe(le[ge],ce);le.length===2?q(x,T,I):x.projectionMatrix.copy(T.projectionMatrix),Me(Z,x,ce)};function Me(Z,oe,de){de===null?Z.matrix.copy(oe.matrixWorld):(Z.matrix.copy(de.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(oe.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(oe.projectionMatrix),Z.projectionMatrixInverse.copy(oe.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=Ko*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(f===null&&m===null))return l},this.setFoveation=function(Z){l=Z,f!==null&&(f.fixedFoveation=Z),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=Z)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(x)};let _e=null;function Ne(Z,oe){if(h=oe.getViewerPose(c||a),g=oe,h!==null){const de=h.views;m!==null&&(e.setRenderTargetFramebuffer(M,m.framebuffer),e.setRenderTarget(M));let ce=!1;de.length!==x.cameras.length&&(x.cameras.length=0,ce=!0);for(let ge=0;ge<de.length;ge++){const he=de[ge];let ve=null;if(m!==null)ve=m.getViewport(he);else{const F=u.getViewSubImage(f,he);ve=F.viewport,ge===0&&(e.setRenderTargetTextures(M,F.colorTexture,f.ignoreDepthValues?void 0:F.depthStencilTexture),e.setRenderTarget(M))}let Te=H[ge];Te===void 0&&(Te=new Jt,Te.layers.enable(ge),Te.viewport=new _t,H[ge]=Te),Te.matrix.fromArray(he.transform.matrix),Te.matrix.decompose(Te.position,Te.quaternion,Te.scale),Te.projectionMatrix.fromArray(he.projectionMatrix),Te.projectionMatrixInverse.copy(Te.projectionMatrix).invert(),Te.viewport.set(ve.x,ve.y,ve.width,ve.height),ge===0&&(x.matrix.copy(Te.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),ce===!0&&x.cameras.push(Te)}const le=r.enabledFeatures;if(le&&le.includes("depth-sensing")){const ge=u.getDepthInformation(de[0]);ge&&ge.isValid&&ge.texture&&v.init(e,ge,r.renderState)}}for(let de=0;de<S.length;de++){const ce=y[de],le=S[de];ce!==null&&le!==void 0&&le.update(ce,oe,c||a)}_e&&_e(Z,oe),oe.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:oe}),g=null}const Pe=new ku;Pe.setAnimationLoop(Ne),this.setAnimationLoop=function(Z){_e=Z},this.dispose=function(){}}}const ii=new un,Dg=new pt;function Ig(i,e){function t(p,d){p.matrixAutoUpdate===!0&&p.updateMatrix(),d.value.copy(p.matrix)}function n(p,d){d.color.getRGB(p.fogColor.value,Ou(i)),d.isFog?(p.fogNear.value=d.near,p.fogFar.value=d.far):d.isFogExp2&&(p.fogDensity.value=d.density)}function r(p,d,M,S,y){d.isMeshBasicMaterial||d.isMeshLambertMaterial?s(p,d):d.isMeshToonMaterial?(s(p,d),u(p,d)):d.isMeshPhongMaterial?(s(p,d),h(p,d)):d.isMeshStandardMaterial?(s(p,d),f(p,d),d.isMeshPhysicalMaterial&&m(p,d,y)):d.isMeshMatcapMaterial?(s(p,d),g(p,d)):d.isMeshDepthMaterial?s(p,d):d.isMeshDistanceMaterial?(s(p,d),v(p,d)):d.isMeshNormalMaterial?s(p,d):d.isLineBasicMaterial?(a(p,d),d.isLineDashedMaterial&&o(p,d)):d.isPointsMaterial?l(p,d,M,S):d.isSpriteMaterial?c(p,d):d.isShadowMaterial?(p.color.value.copy(d.color),p.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(p,d){p.opacity.value=d.opacity,d.color&&p.diffuse.value.copy(d.color),d.emissive&&p.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(p.map.value=d.map,t(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,t(d.alphaMap,p.alphaMapTransform)),d.bumpMap&&(p.bumpMap.value=d.bumpMap,t(d.bumpMap,p.bumpMapTransform),p.bumpScale.value=d.bumpScale,d.side===Nt&&(p.bumpScale.value*=-1)),d.normalMap&&(p.normalMap.value=d.normalMap,t(d.normalMap,p.normalMapTransform),p.normalScale.value.copy(d.normalScale),d.side===Nt&&p.normalScale.value.negate()),d.displacementMap&&(p.displacementMap.value=d.displacementMap,t(d.displacementMap,p.displacementMapTransform),p.displacementScale.value=d.displacementScale,p.displacementBias.value=d.displacementBias),d.emissiveMap&&(p.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,p.emissiveMapTransform)),d.specularMap&&(p.specularMap.value=d.specularMap,t(d.specularMap,p.specularMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest);const M=e.get(d),S=M.envMap,y=M.envMapRotation;S&&(p.envMap.value=S,ii.copy(y),ii.x*=-1,ii.y*=-1,ii.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(ii.y*=-1,ii.z*=-1),p.envMapRotation.value.setFromMatrix4(Dg.makeRotationFromEuler(ii)),p.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=d.reflectivity,p.ior.value=d.ior,p.refractionRatio.value=d.refractionRatio),d.lightMap&&(p.lightMap.value=d.lightMap,p.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,p.lightMapTransform)),d.aoMap&&(p.aoMap.value=d.aoMap,p.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,p.aoMapTransform))}function a(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,d.map&&(p.map.value=d.map,t(d.map,p.mapTransform))}function o(p,d){p.dashSize.value=d.dashSize,p.totalSize.value=d.dashSize+d.gapSize,p.scale.value=d.scale}function l(p,d,M,S){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.size.value=d.size*M,p.scale.value=S*.5,d.map&&(p.map.value=d.map,t(d.map,p.uvTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,t(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function c(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.rotation.value=d.rotation,d.map&&(p.map.value=d.map,t(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,t(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function h(p,d){p.specular.value.copy(d.specular),p.shininess.value=Math.max(d.shininess,1e-4)}function u(p,d){d.gradientMap&&(p.gradientMap.value=d.gradientMap)}function f(p,d){p.metalness.value=d.metalness,d.metalnessMap&&(p.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,p.metalnessMapTransform)),p.roughness.value=d.roughness,d.roughnessMap&&(p.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,p.roughnessMapTransform)),d.envMap&&(p.envMapIntensity.value=d.envMapIntensity)}function m(p,d,M){p.ior.value=d.ior,d.sheen>0&&(p.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),p.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(p.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,p.sheenColorMapTransform)),d.sheenRoughnessMap&&(p.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,p.sheenRoughnessMapTransform))),d.clearcoat>0&&(p.clearcoat.value=d.clearcoat,p.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(p.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,p.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(p.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Nt&&p.clearcoatNormalScale.value.negate())),d.dispersion>0&&(p.dispersion.value=d.dispersion),d.iridescence>0&&(p.iridescence.value=d.iridescence,p.iridescenceIOR.value=d.iridescenceIOR,p.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(p.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,p.iridescenceMapTransform)),d.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),d.transmission>0&&(p.transmission.value=d.transmission,p.transmissionSamplerMap.value=M.texture,p.transmissionSamplerSize.value.set(M.width,M.height),d.transmissionMap&&(p.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,p.transmissionMapTransform)),p.thickness.value=d.thickness,d.thicknessMap&&(p.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=d.attenuationDistance,p.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(p.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(p.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=d.specularIntensity,p.specularColor.value.copy(d.specularColor),d.specularColorMap&&(p.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,p.specularColorMapTransform)),d.specularIntensityMap&&(p.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,d){d.matcap&&(p.matcap.value=d.matcap)}function v(p,d){const M=e.get(d).light;p.referencePosition.value.setFromMatrixPosition(M.matrixWorld),p.nearDistance.value=M.shadow.camera.near,p.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function Ug(i,e,t,n){let r={},s={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,S){const y=S.program;n.uniformBlockBinding(M,y)}function c(M,S){let y=r[M.id];y===void 0&&(g(M),y=h(M),r[M.id]=y,M.addEventListener("dispose",p));const R=S.program;n.updateUBOMapping(M,R);const A=e.render.frame;s[M.id]!==A&&(f(M),s[M.id]=A)}function h(M){const S=u();M.__bindingPointIndex=S;const y=i.createBuffer(),R=M.__size,A=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,R,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,S,y),y}function u(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(M){const S=r[M.id],y=M.uniforms,R=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,S);for(let A=0,T=y.length;A<T;A++){const I=Array.isArray(y[A])?y[A]:[y[A]];for(let H=0,x=I.length;H<x;H++){const E=I[H];if(m(E,A,H,R)===!0){const N=E.__offset,L=Array.isArray(E.value)?E.value:[E.value];let P=0;for(let X=0;X<L.length;X++){const z=L[X],re=v(z);typeof z=="number"||typeof z=="boolean"?(E.__data[0]=z,i.bufferSubData(i.UNIFORM_BUFFER,N+P,E.__data)):z.isMatrix3?(E.__data[0]=z.elements[0],E.__data[1]=z.elements[1],E.__data[2]=z.elements[2],E.__data[3]=0,E.__data[4]=z.elements[3],E.__data[5]=z.elements[4],E.__data[6]=z.elements[5],E.__data[7]=0,E.__data[8]=z.elements[6],E.__data[9]=z.elements[7],E.__data[10]=z.elements[8],E.__data[11]=0):(z.toArray(E.__data,P),P+=re.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,N,E.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(M,S,y,R){const A=M.value,T=S+"_"+y;if(R[T]===void 0)return typeof A=="number"||typeof A=="boolean"?R[T]=A:R[T]=A.clone(),!0;{const I=R[T];if(typeof A=="number"||typeof A=="boolean"){if(I!==A)return R[T]=A,!0}else if(I.equals(A)===!1)return I.copy(A),!0}return!1}function g(M){const S=M.uniforms;let y=0;const R=16;for(let T=0,I=S.length;T<I;T++){const H=Array.isArray(S[T])?S[T]:[S[T]];for(let x=0,E=H.length;x<E;x++){const N=H[x],L=Array.isArray(N.value)?N.value:[N.value];for(let P=0,X=L.length;P<X;P++){const z=L[P],re=v(z),q=y%R,fe=q%re.boundary,Me=q+fe;y+=fe,Me!==0&&R-Me<re.storage&&(y+=R-Me),N.__data=new Float32Array(re.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=y,y+=re.storage}}}const A=y%R;return A>0&&(y+=R-A),M.__size=y,M.__cache={},this}function v(M){const S={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(S.boundary=4,S.storage=4):M.isVector2?(S.boundary=8,S.storage=8):M.isVector3||M.isColor?(S.boundary=16,S.storage=12):M.isVector4?(S.boundary=16,S.storage=16):M.isMatrix3?(S.boundary=48,S.storage=48):M.isMatrix4?(S.boundary=64,S.storage=64):M.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",M),S}function p(M){const S=M.target;S.removeEventListener("dispose",p);const y=a.indexOf(S.__bindingPointIndex);a.splice(y,1),i.deleteBuffer(r[S.id]),delete r[S.id],delete s[S.id]}function d(){for(const M in r)i.deleteBuffer(r[M]);a=[],r={},s={}}return{bind:l,update:c,dispose:d}}class Ng{constructor(e={}){const{canvas:t=Eh(),context:n=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;const m=new Uint32Array(4),g=new Int32Array(4);let v=null,p=null;const d=[],M=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=sn,this.toneMapping=zn,this.toneMappingExposure=1;const S=this;let y=!1,R=0,A=0,T=null,I=-1,H=null;const x=new _t,E=new _t;let N=null;const L=new nt(0);let P=0,X=t.width,z=t.height,re=1,q=null,fe=null;const Me=new _t(0,0,X,z),_e=new _t(0,0,X,z);let Ne=!1;const Pe=new xa;let Z=!1,oe=!1;const de=new pt,ce=new pt,le=new te,ge=new _t,he={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ve=!1;function Te(){return T===null?re:1}let F=n;function Ke(w,G){return t.getContext(w,G)}try{const w={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${ua}`),t.addEventListener("webglcontextlost",U,!1),t.addEventListener("webglcontextrestored",ue,!1),t.addEventListener("webglcontextcreationerror",Y,!1),F===null){const G="webgl2";if(F=Ke(G,w),F===null)throw Ke(G)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(w){throw console.error("THREE.WebGLRenderer: "+w.message),w}let De,ze,be,Je,se,C,b,k,j,ae,ne,Ue,xe,K,He,V,Ee,Oe,Be,Se,qe,Ie,Ye,O;function ye(){De=new km(F),De.init(),Ie=new Tg(F,De),ze=new Um(F,De,e,Ie),be=new Eg(F),ze.reverseDepthBuffer&&be.buffers.depth.setReversed(!0),Je=new Vm(F),se=new ag,C=new bg(F,De,be,se,ze,Ie,Je),b=new Fm(S),k=new zm(S),j=new Kh(F),Ye=new Dm(F,j),ae=new Hm(F,j,Je,Ye),ne=new Xm(F,ae,j,Je),Be=new Wm(F,ze,C),V=new Nm(se),Ue=new og(S,b,k,De,ze,Ye,V),xe=new Ig(S,se),K=new cg,He=new mg(De),Oe=new Lm(S,b,k,be,ne,f,l),Ee=new Sg(S,ne,ze),O=new Ug(F,Je,ze,be),Se=new Im(F,De,Je),qe=new Gm(F,De,Je),Je.programs=Ue.programs,S.capabilities=ze,S.extensions=De,S.properties=se,S.renderLists=K,S.shadowMap=Ee,S.state=be,S.info=Je}ye();const Q=new Lg(S,F);this.xr=Q,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){const w=De.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=De.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return re},this.setPixelRatio=function(w){w!==void 0&&(re=w,this.setSize(X,z,!1))},this.getSize=function(w){return w.set(X,z)},this.setSize=function(w,G,ee=!0){if(Q.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=w,z=G,t.width=Math.floor(w*re),t.height=Math.floor(G*re),ee===!0&&(t.style.width=w+"px",t.style.height=G+"px"),this.setViewport(0,0,w,G)},this.getDrawingBufferSize=function(w){return w.set(X*re,z*re).floor()},this.setDrawingBufferSize=function(w,G,ee){X=w,z=G,re=ee,t.width=Math.floor(w*ee),t.height=Math.floor(G*ee),this.setViewport(0,0,w,G)},this.getCurrentViewport=function(w){return w.copy(x)},this.getViewport=function(w){return w.copy(Me)},this.setViewport=function(w,G,ee,ie){w.isVector4?Me.set(w.x,w.y,w.z,w.w):Me.set(w,G,ee,ie),be.viewport(x.copy(Me).multiplyScalar(re).round())},this.getScissor=function(w){return w.copy(_e)},this.setScissor=function(w,G,ee,ie){w.isVector4?_e.set(w.x,w.y,w.z,w.w):_e.set(w,G,ee,ie),be.scissor(E.copy(_e).multiplyScalar(re).round())},this.getScissorTest=function(){return Ne},this.setScissorTest=function(w){be.setScissorTest(Ne=w)},this.setOpaqueSort=function(w){q=w},this.setTransparentSort=function(w){fe=w},this.getClearColor=function(w){return w.copy(Oe.getClearColor())},this.setClearColor=function(){Oe.setClearColor.apply(Oe,arguments)},this.getClearAlpha=function(){return Oe.getClearAlpha()},this.setClearAlpha=function(){Oe.setClearAlpha.apply(Oe,arguments)},this.clear=function(w=!0,G=!0,ee=!0){let ie=0;if(w){let W=!1;if(T!==null){const Re=T.texture.format;W=Re===ga||Re===_a||Re===ma}if(W){const Re=T.texture.type,Fe=Re===An||Re===fi||Re===fr||Re===qi||Re===da||Re===pa,ke=Oe.getClearColor(),Ge=Oe.getClearAlpha(),$e=ke.r,Ze=ke.g,Ve=ke.b;Fe?(m[0]=$e,m[1]=Ze,m[2]=Ve,m[3]=Ge,F.clearBufferuiv(F.COLOR,0,m)):(g[0]=$e,g[1]=Ze,g[2]=Ve,g[3]=Ge,F.clearBufferiv(F.COLOR,0,g))}else ie|=F.COLOR_BUFFER_BIT}G&&(ie|=F.DEPTH_BUFFER_BIT,F.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),ee&&(ie|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),F.clear(ie)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",U,!1),t.removeEventListener("webglcontextrestored",ue,!1),t.removeEventListener("webglcontextcreationerror",Y,!1),K.dispose(),He.dispose(),se.dispose(),b.dispose(),k.dispose(),ne.dispose(),Ye.dispose(),O.dispose(),Ue.dispose(),Q.dispose(),Q.removeEventListener("sessionstart",ba),Q.removeEventListener("sessionend",Ta),Zn.stop()};function U(w){w.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),y=!0}function ue(){console.log("THREE.WebGLRenderer: Context Restored."),y=!1;const w=Je.autoReset,G=Ee.enabled,ee=Ee.autoUpdate,ie=Ee.needsUpdate,W=Ee.type;ye(),Je.autoReset=w,Ee.enabled=G,Ee.autoUpdate=ee,Ee.needsUpdate=ie,Ee.type=W}function Y(w){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function we(w){const G=w.target;G.removeEventListener("dispose",we),ct(G)}function ct(w){Lt(w),se.remove(w)}function Lt(w){const G=se.get(w).programs;G!==void 0&&(G.forEach(function(ee){Ue.releaseProgram(ee)}),w.isShaderMaterial&&Ue.releaseShaderCache(w))}this.renderBufferDirect=function(w,G,ee,ie,W,Re){G===null&&(G=he);const Fe=W.isMesh&&W.matrixWorld.determinant()<0,ke=ef(w,G,ee,ie,W);be.setMaterial(ie,Fe);let Ge=ee.index,$e=1;if(ie.wireframe===!0){if(Ge=ae.getWireframeAttribute(ee),Ge===void 0)return;$e=2}const Ze=ee.drawRange,Ve=ee.attributes.position;let ut=Ze.start*$e,ft=(Ze.start+Ze.count)*$e;Re!==null&&(ut=Math.max(ut,Re.start*$e),ft=Math.min(ft,(Re.start+Re.count)*$e)),Ge!==null?(ut=Math.max(ut,0),ft=Math.min(ft,Ge.count)):Ve!=null&&(ut=Math.max(ut,0),ft=Math.min(ft,Ve.count));const mt=ft-ut;if(mt<0||mt===1/0)return;Ye.setup(W,ie,ke,ee,Ge);let Ot,rt=Se;if(Ge!==null&&(Ot=j.get(Ge),rt=qe,rt.setIndex(Ot)),W.isMesh)ie.wireframe===!0?(be.setLineWidth(ie.wireframeLinewidth*Te()),rt.setMode(F.LINES)):rt.setMode(F.TRIANGLES);else if(W.isLine){let We=ie.linewidth;We===void 0&&(We=1),be.setLineWidth(We*Te()),W.isLineSegments?rt.setMode(F.LINES):W.isLineLoop?rt.setMode(F.LINE_LOOP):rt.setMode(F.LINE_STRIP)}else W.isPoints?rt.setMode(F.POINTS):W.isSprite&&rt.setMode(F.TRIANGLES);if(W.isBatchedMesh)if(W._multiDrawInstances!==null)rt.renderMultiDrawInstances(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount,W._multiDrawInstances);else if(De.get("WEBGL_multi_draw"))rt.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{const We=W._multiDrawStarts,yt=W._multiDrawCounts,st=W._multiDrawCount,$t=Ge?j.get(Ge).bytesPerElement:1,pi=se.get(ie).currentProgram.getUniforms();for(let Bt=0;Bt<st;Bt++)pi.setValue(F,"_gl_DrawID",Bt),rt.render(We[Bt]/$t,yt[Bt])}else if(W.isInstancedMesh)rt.renderInstances(ut,mt,W.count);else if(ee.isInstancedBufferGeometry){const We=ee._maxInstanceCount!==void 0?ee._maxInstanceCount:1/0,yt=Math.min(ee.instanceCount,We);rt.renderInstances(ut,mt,yt)}else rt.render(ut,mt)};function it(w,G,ee){w.transparent===!0&&w.side===xn&&w.forceSinglePass===!1?(w.side=Nt,w.needsUpdate=!0,Mr(w,G,ee),w.side=Gn,w.needsUpdate=!0,Mr(w,G,ee),w.side=xn):Mr(w,G,ee)}this.compile=function(w,G,ee=null){ee===null&&(ee=w),p=He.get(ee),p.init(G),M.push(p),ee.traverseVisible(function(W){W.isLight&&W.layers.test(G.layers)&&(p.pushLight(W),W.castShadow&&p.pushShadow(W))}),w!==ee&&w.traverseVisible(function(W){W.isLight&&W.layers.test(G.layers)&&(p.pushLight(W),W.castShadow&&p.pushShadow(W))}),p.setupLights();const ie=new Set;return w.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;const Re=W.material;if(Re)if(Array.isArray(Re))for(let Fe=0;Fe<Re.length;Fe++){const ke=Re[Fe];it(ke,ee,W),ie.add(ke)}else it(Re,ee,W),ie.add(Re)}),M.pop(),p=null,ie},this.compileAsync=function(w,G,ee=null){const ie=this.compile(w,G,ee);return new Promise(W=>{function Re(){if(ie.forEach(function(Fe){se.get(Fe).currentProgram.isReady()&&ie.delete(Fe)}),ie.size===0){W(w);return}setTimeout(Re,10)}De.get("KHR_parallel_shader_compile")!==null?Re():setTimeout(Re,10)})};let Dt=null;function hn(w){Dt&&Dt(w)}function ba(){Zn.stop()}function Ta(){Zn.start()}const Zn=new ku;Zn.setAnimationLoop(hn),typeof self<"u"&&Zn.setContext(self),this.setAnimationLoop=function(w){Dt=w,Q.setAnimationLoop(w),w===null?Zn.stop():Zn.start()},Q.addEventListener("sessionstart",ba),Q.addEventListener("sessionend",Ta),this.render=function(w,G){if(G!==void 0&&G.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(y===!0)return;if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),Q.enabled===!0&&Q.isPresenting===!0&&(Q.cameraAutoUpdate===!0&&Q.updateCamera(G),G=Q.getCamera()),w.isScene===!0&&w.onBeforeRender(S,w,G,T),p=He.get(w,M.length),p.init(G),M.push(p),ce.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),Pe.setFromProjectionMatrix(ce),oe=this.localClippingEnabled,Z=V.init(this.clippingPlanes,oe),v=K.get(w,d.length),v.init(),d.push(v),Q.enabled===!0&&Q.isPresenting===!0){const Re=S.xr.getDepthSensingMesh();Re!==null&&vs(Re,G,-1/0,S.sortObjects)}vs(w,G,0,S.sortObjects),v.finish(),S.sortObjects===!0&&v.sort(q,fe),ve=Q.enabled===!1||Q.isPresenting===!1||Q.hasDepthSensing()===!1,ve&&Oe.addToRenderList(v,w),this.info.render.frame++,Z===!0&&V.beginShadows();const ee=p.state.shadowsArray;Ee.render(ee,w,G),Z===!0&&V.endShadows(),this.info.autoReset===!0&&this.info.reset();const ie=v.opaque,W=v.transmissive;if(p.setupLights(),G.isArrayCamera){const Re=G.cameras;if(W.length>0)for(let Fe=0,ke=Re.length;Fe<ke;Fe++){const Ge=Re[Fe];wa(ie,W,w,Ge)}ve&&Oe.render(w);for(let Fe=0,ke=Re.length;Fe<ke;Fe++){const Ge=Re[Fe];Aa(v,w,Ge,Ge.viewport)}}else W.length>0&&wa(ie,W,w,G),ve&&Oe.render(w),Aa(v,w,G);T!==null&&(C.updateMultisampleRenderTarget(T),C.updateRenderTargetMipmap(T)),w.isScene===!0&&w.onAfterRender(S,w,G),Ye.resetDefaultState(),I=-1,H=null,M.pop(),M.length>0?(p=M[M.length-1],Z===!0&&V.setGlobalState(S.clippingPlanes,p.state.camera)):p=null,d.pop(),d.length>0?v=d[d.length-1]:v=null};function vs(w,G,ee,ie){if(w.visible===!1)return;if(w.layers.test(G.layers)){if(w.isGroup)ee=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(G);else if(w.isLight)p.pushLight(w),w.castShadow&&p.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||Pe.intersectsSprite(w)){ie&&ge.setFromMatrixPosition(w.matrixWorld).applyMatrix4(ce);const Fe=ne.update(w),ke=w.material;ke.visible&&v.push(w,Fe,ke,ee,ge.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||Pe.intersectsObject(w))){const Fe=ne.update(w),ke=w.material;if(ie&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),ge.copy(w.boundingSphere.center)):(Fe.boundingSphere===null&&Fe.computeBoundingSphere(),ge.copy(Fe.boundingSphere.center)),ge.applyMatrix4(w.matrixWorld).applyMatrix4(ce)),Array.isArray(ke)){const Ge=Fe.groups;for(let $e=0,Ze=Ge.length;$e<Ze;$e++){const Ve=Ge[$e],ut=ke[Ve.materialIndex];ut&&ut.visible&&v.push(w,Fe,ut,ee,ge.z,Ve)}}else ke.visible&&v.push(w,Fe,ke,ee,ge.z,null)}}const Re=w.children;for(let Fe=0,ke=Re.length;Fe<ke;Fe++)vs(Re[Fe],G,ee,ie)}function Aa(w,G,ee,ie){const W=w.opaque,Re=w.transmissive,Fe=w.transparent;p.setupLightsView(ee),Z===!0&&V.setGlobalState(S.clippingPlanes,ee),ie&&be.viewport(x.copy(ie)),W.length>0&&Sr(W,G,ee),Re.length>0&&Sr(Re,G,ee),Fe.length>0&&Sr(Fe,G,ee),be.buffers.depth.setTest(!0),be.buffers.depth.setMask(!0),be.buffers.color.setMask(!0),be.setPolygonOffset(!1)}function wa(w,G,ee,ie){if((ee.isScene===!0?ee.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[ie.id]===void 0&&(p.state.transmissionRenderTarget[ie.id]=new hi(1,1,{generateMipmaps:!0,type:De.has("EXT_color_buffer_half_float")||De.has("EXT_color_buffer_float")?pr:An,minFilter:ui,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ot.workingColorSpace}));const Re=p.state.transmissionRenderTarget[ie.id],Fe=ie.viewport||x;Re.setSize(Fe.z,Fe.w);const ke=S.getRenderTarget();S.setRenderTarget(Re),S.getClearColor(L),P=S.getClearAlpha(),P<1&&S.setClearColor(16777215,.5),S.clear(),ve&&Oe.render(ee);const Ge=S.toneMapping;S.toneMapping=zn;const $e=ie.viewport;if(ie.viewport!==void 0&&(ie.viewport=void 0),p.setupLightsView(ie),Z===!0&&V.setGlobalState(S.clippingPlanes,ie),Sr(w,ee,ie),C.updateMultisampleRenderTarget(Re),C.updateRenderTargetMipmap(Re),De.has("WEBGL_multisampled_render_to_texture")===!1){let Ze=!1;for(let Ve=0,ut=G.length;Ve<ut;Ve++){const ft=G[Ve],mt=ft.object,Ot=ft.geometry,rt=ft.material,We=ft.group;if(rt.side===xn&&mt.layers.test(ie.layers)){const yt=rt.side;rt.side=Nt,rt.needsUpdate=!0,Ra(mt,ee,ie,Ot,rt,We),rt.side=yt,rt.needsUpdate=!0,Ze=!0}}Ze===!0&&(C.updateMultisampleRenderTarget(Re),C.updateRenderTargetMipmap(Re))}S.setRenderTarget(ke),S.setClearColor(L,P),$e!==void 0&&(ie.viewport=$e),S.toneMapping=Ge}function Sr(w,G,ee){const ie=G.isScene===!0?G.overrideMaterial:null;for(let W=0,Re=w.length;W<Re;W++){const Fe=w[W],ke=Fe.object,Ge=Fe.geometry,$e=ie===null?Fe.material:ie,Ze=Fe.group;ke.layers.test(ee.layers)&&Ra(ke,G,ee,Ge,$e,Ze)}}function Ra(w,G,ee,ie,W,Re){w.onBeforeRender(S,G,ee,ie,W,Re),w.modelViewMatrix.multiplyMatrices(ee.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),W.onBeforeRender(S,G,ee,ie,w,Re),W.transparent===!0&&W.side===xn&&W.forceSinglePass===!1?(W.side=Nt,W.needsUpdate=!0,S.renderBufferDirect(ee,G,ie,W,w,Re),W.side=Gn,W.needsUpdate=!0,S.renderBufferDirect(ee,G,ie,W,w,Re),W.side=xn):S.renderBufferDirect(ee,G,ie,W,w,Re),w.onAfterRender(S,G,ee,ie,W,Re)}function Mr(w,G,ee){G.isScene!==!0&&(G=he);const ie=se.get(w),W=p.state.lights,Re=p.state.shadowsArray,Fe=W.state.version,ke=Ue.getParameters(w,W.state,Re,G,ee),Ge=Ue.getProgramCacheKey(ke);let $e=ie.programs;ie.environment=w.isMeshStandardMaterial?G.environment:null,ie.fog=G.fog,ie.envMap=(w.isMeshStandardMaterial?k:b).get(w.envMap||ie.environment),ie.envMapRotation=ie.environment!==null&&w.envMap===null?G.environmentRotation:w.envMapRotation,$e===void 0&&(w.addEventListener("dispose",we),$e=new Map,ie.programs=$e);let Ze=$e.get(Ge);if(Ze!==void 0){if(ie.currentProgram===Ze&&ie.lightsStateVersion===Fe)return Pa(w,ke),Ze}else ke.uniforms=Ue.getUniforms(w),w.onBeforeCompile(ke,S),Ze=Ue.acquireProgram(ke,Ge),$e.set(Ge,Ze),ie.uniforms=ke.uniforms;const Ve=ie.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Ve.clippingPlanes=V.uniform),Pa(w,ke),ie.needsLights=nf(w),ie.lightsStateVersion=Fe,ie.needsLights&&(Ve.ambientLightColor.value=W.state.ambient,Ve.lightProbe.value=W.state.probe,Ve.directionalLights.value=W.state.directional,Ve.directionalLightShadows.value=W.state.directionalShadow,Ve.spotLights.value=W.state.spot,Ve.spotLightShadows.value=W.state.spotShadow,Ve.rectAreaLights.value=W.state.rectArea,Ve.ltc_1.value=W.state.rectAreaLTC1,Ve.ltc_2.value=W.state.rectAreaLTC2,Ve.pointLights.value=W.state.point,Ve.pointLightShadows.value=W.state.pointShadow,Ve.hemisphereLights.value=W.state.hemi,Ve.directionalShadowMap.value=W.state.directionalShadowMap,Ve.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Ve.spotShadowMap.value=W.state.spotShadowMap,Ve.spotLightMatrix.value=W.state.spotLightMatrix,Ve.spotLightMap.value=W.state.spotLightMap,Ve.pointShadowMap.value=W.state.pointShadowMap,Ve.pointShadowMatrix.value=W.state.pointShadowMatrix),ie.currentProgram=Ze,ie.uniformsList=null,Ze}function Ca(w){if(w.uniformsList===null){const G=w.currentProgram.getUniforms();w.uniformsList=Qr.seqWithValue(G.seq,w.uniforms)}return w.uniformsList}function Pa(w,G){const ee=se.get(w);ee.outputColorSpace=G.outputColorSpace,ee.batching=G.batching,ee.batchingColor=G.batchingColor,ee.instancing=G.instancing,ee.instancingColor=G.instancingColor,ee.instancingMorph=G.instancingMorph,ee.skinning=G.skinning,ee.morphTargets=G.morphTargets,ee.morphNormals=G.morphNormals,ee.morphColors=G.morphColors,ee.morphTargetsCount=G.morphTargetsCount,ee.numClippingPlanes=G.numClippingPlanes,ee.numIntersection=G.numClipIntersection,ee.vertexAlphas=G.vertexAlphas,ee.vertexTangents=G.vertexTangents,ee.toneMapping=G.toneMapping}function ef(w,G,ee,ie,W){G.isScene!==!0&&(G=he),C.resetTextureUnits();const Re=G.fog,Fe=ie.isMeshStandardMaterial?G.environment:null,ke=T===null?S.outputColorSpace:T.isXRRenderTarget===!0?T.texture.colorSpace:Kn,Ge=(ie.isMeshStandardMaterial?k:b).get(ie.envMap||Fe),$e=ie.vertexColors===!0&&!!ee.attributes.color&&ee.attributes.color.itemSize===4,Ze=!!ee.attributes.tangent&&(!!ie.normalMap||ie.anisotropy>0),Ve=!!ee.morphAttributes.position,ut=!!ee.morphAttributes.normal,ft=!!ee.morphAttributes.color;let mt=zn;ie.toneMapped&&(T===null||T.isXRRenderTarget===!0)&&(mt=S.toneMapping);const Ot=ee.morphAttributes.position||ee.morphAttributes.normal||ee.morphAttributes.color,rt=Ot!==void 0?Ot.length:0,We=se.get(ie),yt=p.state.lights;if(Z===!0&&(oe===!0||w!==H)){const Gt=w===H&&ie.id===I;V.setState(ie,w,Gt)}let st=!1;ie.version===We.__version?(We.needsLights&&We.lightsStateVersion!==yt.state.version||We.outputColorSpace!==ke||W.isBatchedMesh&&We.batching===!1||!W.isBatchedMesh&&We.batching===!0||W.isBatchedMesh&&We.batchingColor===!0&&W.colorTexture===null||W.isBatchedMesh&&We.batchingColor===!1&&W.colorTexture!==null||W.isInstancedMesh&&We.instancing===!1||!W.isInstancedMesh&&We.instancing===!0||W.isSkinnedMesh&&We.skinning===!1||!W.isSkinnedMesh&&We.skinning===!0||W.isInstancedMesh&&We.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&We.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&We.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&We.instancingMorph===!1&&W.morphTexture!==null||We.envMap!==Ge||ie.fog===!0&&We.fog!==Re||We.numClippingPlanes!==void 0&&(We.numClippingPlanes!==V.numPlanes||We.numIntersection!==V.numIntersection)||We.vertexAlphas!==$e||We.vertexTangents!==Ze||We.morphTargets!==Ve||We.morphNormals!==ut||We.morphColors!==ft||We.toneMapping!==mt||We.morphTargetsCount!==rt)&&(st=!0):(st=!0,We.__version=ie.version);let $t=We.currentProgram;st===!0&&($t=Mr(ie,G,W));let pi=!1,Bt=!1,xs=!1;const gt=$t.getUniforms(),Rn=We.uniforms;if(be.useProgram($t.program)&&(pi=!0,Bt=!0,xs=!0),ie.id!==I&&(I=ie.id,Bt=!0),pi||H!==w){ze.reverseDepthBuffer?(de.copy(w.projectionMatrix),bh(de),Th(de),gt.setValue(F,"projectionMatrix",de)):gt.setValue(F,"projectionMatrix",w.projectionMatrix),gt.setValue(F,"viewMatrix",w.matrixWorldInverse);const Gt=gt.map.cameraPosition;Gt!==void 0&&Gt.setValue(F,le.setFromMatrixPosition(w.matrixWorld)),ze.logarithmicDepthBuffer&&gt.setValue(F,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(ie.isMeshPhongMaterial||ie.isMeshToonMaterial||ie.isMeshLambertMaterial||ie.isMeshBasicMaterial||ie.isMeshStandardMaterial||ie.isShaderMaterial)&&gt.setValue(F,"isOrthographic",w.isOrthographicCamera===!0),H!==w&&(H=w,Bt=!0,xs=!0)}if(W.isSkinnedMesh){gt.setOptional(F,W,"bindMatrix"),gt.setOptional(F,W,"bindMatrixInverse");const Gt=W.skeleton;Gt&&(Gt.boneTexture===null&&Gt.computeBoneTexture(),gt.setValue(F,"boneTexture",Gt.boneTexture,C))}W.isBatchedMesh&&(gt.setOptional(F,W,"batchingTexture"),gt.setValue(F,"batchingTexture",W._matricesTexture,C),gt.setOptional(F,W,"batchingIdTexture"),gt.setValue(F,"batchingIdTexture",W._indirectTexture,C),gt.setOptional(F,W,"batchingColorTexture"),W._colorsTexture!==null&&gt.setValue(F,"batchingColorTexture",W._colorsTexture,C));const Ss=ee.morphAttributes;if((Ss.position!==void 0||Ss.normal!==void 0||Ss.color!==void 0)&&Be.update(W,ee,$t),(Bt||We.receiveShadow!==W.receiveShadow)&&(We.receiveShadow=W.receiveShadow,gt.setValue(F,"receiveShadow",W.receiveShadow)),ie.isMeshGouraudMaterial&&ie.envMap!==null&&(Rn.envMap.value=Ge,Rn.flipEnvMap.value=Ge.isCubeTexture&&Ge.isRenderTargetTexture===!1?-1:1),ie.isMeshStandardMaterial&&ie.envMap===null&&G.environment!==null&&(Rn.envMapIntensity.value=G.environmentIntensity),Bt&&(gt.setValue(F,"toneMappingExposure",S.toneMappingExposure),We.needsLights&&tf(Rn,xs),Re&&ie.fog===!0&&xe.refreshFogUniforms(Rn,Re),xe.refreshMaterialUniforms(Rn,ie,re,z,p.state.transmissionRenderTarget[w.id]),Qr.upload(F,Ca(We),Rn,C)),ie.isShaderMaterial&&ie.uniformsNeedUpdate===!0&&(Qr.upload(F,Ca(We),Rn,C),ie.uniformsNeedUpdate=!1),ie.isSpriteMaterial&&gt.setValue(F,"center",W.center),gt.setValue(F,"modelViewMatrix",W.modelViewMatrix),gt.setValue(F,"normalMatrix",W.normalMatrix),gt.setValue(F,"modelMatrix",W.matrixWorld),ie.isShaderMaterial||ie.isRawShaderMaterial){const Gt=ie.uniformsGroups;for(let Ms=0,rf=Gt.length;Ms<rf;Ms++){const La=Gt[Ms];O.update(La,$t),O.bind(La,$t)}}return $t}function tf(w,G){w.ambientLightColor.needsUpdate=G,w.lightProbe.needsUpdate=G,w.directionalLights.needsUpdate=G,w.directionalLightShadows.needsUpdate=G,w.pointLights.needsUpdate=G,w.pointLightShadows.needsUpdate=G,w.spotLights.needsUpdate=G,w.spotLightShadows.needsUpdate=G,w.rectAreaLights.needsUpdate=G,w.hemisphereLights.needsUpdate=G}function nf(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return T},this.setRenderTargetTextures=function(w,G,ee){se.get(w.texture).__webglTexture=G,se.get(w.depthTexture).__webglTexture=ee;const ie=se.get(w);ie.__hasExternalTextures=!0,ie.__autoAllocateDepthBuffer=ee===void 0,ie.__autoAllocateDepthBuffer||De.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),ie.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(w,G){const ee=se.get(w);ee.__webglFramebuffer=G,ee.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(w,G=0,ee=0){T=w,R=G,A=ee;let ie=!0,W=null,Re=!1,Fe=!1;if(w){const Ge=se.get(w);if(Ge.__useDefaultFramebuffer!==void 0)be.bindFramebuffer(F.FRAMEBUFFER,null),ie=!1;else if(Ge.__webglFramebuffer===void 0)C.setupRenderTarget(w);else if(Ge.__hasExternalTextures)C.rebindTextures(w,se.get(w.texture).__webglTexture,se.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const Ve=w.depthTexture;if(Ge.__boundDepthTexture!==Ve){if(Ve!==null&&se.has(Ve)&&(w.width!==Ve.image.width||w.height!==Ve.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(w)}}const $e=w.texture;($e.isData3DTexture||$e.isDataArrayTexture||$e.isCompressedArrayTexture)&&(Fe=!0);const Ze=se.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Ze[G])?W=Ze[G][ee]:W=Ze[G],Re=!0):w.samples>0&&C.useMultisampledRTT(w)===!1?W=se.get(w).__webglMultisampledFramebuffer:Array.isArray(Ze)?W=Ze[ee]:W=Ze,x.copy(w.viewport),E.copy(w.scissor),N=w.scissorTest}else x.copy(Me).multiplyScalar(re).floor(),E.copy(_e).multiplyScalar(re).floor(),N=Ne;if(be.bindFramebuffer(F.FRAMEBUFFER,W)&&ie&&be.drawBuffers(w,W),be.viewport(x),be.scissor(E),be.setScissorTest(N),Re){const Ge=se.get(w.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+G,Ge.__webglTexture,ee)}else if(Fe){const Ge=se.get(w.texture),$e=G||0;F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,Ge.__webglTexture,ee||0,$e)}I=-1},this.readRenderTargetPixels=function(w,G,ee,ie,W,Re,Fe){if(!(w&&w.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ke=se.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Fe!==void 0&&(ke=ke[Fe]),ke){be.bindFramebuffer(F.FRAMEBUFFER,ke);try{const Ge=w.texture,$e=Ge.format,Ze=Ge.type;if(!ze.textureFormatReadable($e)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ze.textureTypeReadable(Ze)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}G>=0&&G<=w.width-ie&&ee>=0&&ee<=w.height-W&&F.readPixels(G,ee,ie,W,Ie.convert($e),Ie.convert(Ze),Re)}finally{const Ge=T!==null?se.get(T).__webglFramebuffer:null;be.bindFramebuffer(F.FRAMEBUFFER,Ge)}}},this.readRenderTargetPixelsAsync=async function(w,G,ee,ie,W,Re,Fe){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ke=se.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Fe!==void 0&&(ke=ke[Fe]),ke){const Ge=w.texture,$e=Ge.format,Ze=Ge.type;if(!ze.textureFormatReadable($e))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ze.textureTypeReadable(Ze))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(G>=0&&G<=w.width-ie&&ee>=0&&ee<=w.height-W){be.bindFramebuffer(F.FRAMEBUFFER,ke);const Ve=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,Ve),F.bufferData(F.PIXEL_PACK_BUFFER,Re.byteLength,F.STREAM_READ),F.readPixels(G,ee,ie,W,Ie.convert($e),Ie.convert(Ze),0);const ut=T!==null?se.get(T).__webglFramebuffer:null;be.bindFramebuffer(F.FRAMEBUFFER,ut);const ft=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await yh(F,ft,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,Ve),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,Re),F.deleteBuffer(Ve),F.deleteSync(ft),Re}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(w,G=null,ee=0){w.isTexture!==!0&&(Jr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),G=arguments[0]||null,w=arguments[1]);const ie=Math.pow(2,-ee),W=Math.floor(w.image.width*ie),Re=Math.floor(w.image.height*ie),Fe=G!==null?G.x:0,ke=G!==null?G.y:0;C.setTexture2D(w,0),F.copyTexSubImage2D(F.TEXTURE_2D,ee,0,0,Fe,ke,W,Re),be.unbindTexture()},this.copyTextureToTexture=function(w,G,ee=null,ie=null,W=0){w.isTexture!==!0&&(Jr("WebGLRenderer: copyTextureToTexture function signature has changed."),ie=arguments[0]||null,w=arguments[1],G=arguments[2],W=arguments[3]||0,ee=null);let Re,Fe,ke,Ge,$e,Ze;ee!==null?(Re=ee.max.x-ee.min.x,Fe=ee.max.y-ee.min.y,ke=ee.min.x,Ge=ee.min.y):(Re=w.image.width,Fe=w.image.height,ke=0,Ge=0),ie!==null?($e=ie.x,Ze=ie.y):($e=0,Ze=0);const Ve=Ie.convert(G.format),ut=Ie.convert(G.type);C.setTexture2D(G,0),F.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,G.flipY),F.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),F.pixelStorei(F.UNPACK_ALIGNMENT,G.unpackAlignment);const ft=F.getParameter(F.UNPACK_ROW_LENGTH),mt=F.getParameter(F.UNPACK_IMAGE_HEIGHT),Ot=F.getParameter(F.UNPACK_SKIP_PIXELS),rt=F.getParameter(F.UNPACK_SKIP_ROWS),We=F.getParameter(F.UNPACK_SKIP_IMAGES),yt=w.isCompressedTexture?w.mipmaps[W]:w.image;F.pixelStorei(F.UNPACK_ROW_LENGTH,yt.width),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,yt.height),F.pixelStorei(F.UNPACK_SKIP_PIXELS,ke),F.pixelStorei(F.UNPACK_SKIP_ROWS,Ge),w.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,W,$e,Ze,Re,Fe,Ve,ut,yt.data):w.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,W,$e,Ze,yt.width,yt.height,Ve,yt.data):F.texSubImage2D(F.TEXTURE_2D,W,$e,Ze,Re,Fe,Ve,ut,yt),F.pixelStorei(F.UNPACK_ROW_LENGTH,ft),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,mt),F.pixelStorei(F.UNPACK_SKIP_PIXELS,Ot),F.pixelStorei(F.UNPACK_SKIP_ROWS,rt),F.pixelStorei(F.UNPACK_SKIP_IMAGES,We),W===0&&G.generateMipmaps&&F.generateMipmap(F.TEXTURE_2D),be.unbindTexture()},this.copyTextureToTexture3D=function(w,G,ee=null,ie=null,W=0){w.isTexture!==!0&&(Jr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),ee=arguments[0]||null,ie=arguments[1]||null,w=arguments[2],G=arguments[3],W=arguments[4]||0);let Re,Fe,ke,Ge,$e,Ze,Ve,ut,ft;const mt=w.isCompressedTexture?w.mipmaps[W]:w.image;ee!==null?(Re=ee.max.x-ee.min.x,Fe=ee.max.y-ee.min.y,ke=ee.max.z-ee.min.z,Ge=ee.min.x,$e=ee.min.y,Ze=ee.min.z):(Re=mt.width,Fe=mt.height,ke=mt.depth,Ge=0,$e=0,Ze=0),ie!==null?(Ve=ie.x,ut=ie.y,ft=ie.z):(Ve=0,ut=0,ft=0);const Ot=Ie.convert(G.format),rt=Ie.convert(G.type);let We;if(G.isData3DTexture)C.setTexture3D(G,0),We=F.TEXTURE_3D;else if(G.isDataArrayTexture||G.isCompressedArrayTexture)C.setTexture2DArray(G,0),We=F.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}F.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,G.flipY),F.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),F.pixelStorei(F.UNPACK_ALIGNMENT,G.unpackAlignment);const yt=F.getParameter(F.UNPACK_ROW_LENGTH),st=F.getParameter(F.UNPACK_IMAGE_HEIGHT),$t=F.getParameter(F.UNPACK_SKIP_PIXELS),pi=F.getParameter(F.UNPACK_SKIP_ROWS),Bt=F.getParameter(F.UNPACK_SKIP_IMAGES);F.pixelStorei(F.UNPACK_ROW_LENGTH,mt.width),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,mt.height),F.pixelStorei(F.UNPACK_SKIP_PIXELS,Ge),F.pixelStorei(F.UNPACK_SKIP_ROWS,$e),F.pixelStorei(F.UNPACK_SKIP_IMAGES,Ze),w.isDataTexture||w.isData3DTexture?F.texSubImage3D(We,W,Ve,ut,ft,Re,Fe,ke,Ot,rt,mt.data):G.isCompressedArrayTexture?F.compressedTexSubImage3D(We,W,Ve,ut,ft,Re,Fe,ke,Ot,mt.data):F.texSubImage3D(We,W,Ve,ut,ft,Re,Fe,ke,Ot,rt,mt),F.pixelStorei(F.UNPACK_ROW_LENGTH,yt),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,st),F.pixelStorei(F.UNPACK_SKIP_PIXELS,$t),F.pixelStorei(F.UNPACK_SKIP_ROWS,pi),F.pixelStorei(F.UNPACK_SKIP_IMAGES,Bt),W===0&&G.generateMipmaps&&F.generateMipmap(We),be.unbindTexture()},this.initRenderTarget=function(w){se.get(w).__webglFramebuffer===void 0&&C.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?C.setTextureCube(w,0):w.isData3DTexture?C.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?C.setTexture2DArray(w,0):C.setTexture2D(w,0),be.unbindTexture()},this.resetState=function(){R=0,A=0,T=null,be.reset(),Ye.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return yn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===va?"display-p3":"srgb",t.unpackColorSpace=ot.workingColorSpace===ms?"display-p3":"srgb"}}class Fg extends bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new un,this.environmentIntensity=1,this.environmentRotation=new un,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Jo extends Ki{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new nt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const ls=new te,cs=new te,Xl=new pt,rr=new Lu,Wr=new _s,no=new te,ql=new te;class Yl extends bt{constructor(e=new fn,t=new Jo){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let r=1,s=t.count;r<s;r++)ls.fromBufferAttribute(t,r-1),cs.fromBufferAttribute(t,r),n[r]=n[r-1],n[r]+=ls.distanceTo(cs);e.setAttribute("lineDistance",new kn(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Wr.copy(n.boundingSphere),Wr.applyMatrix4(r),Wr.radius+=s,e.ray.intersectsSphere(Wr)===!1)return;Xl.copy(r).invert(),rr.copy(e.ray).applyMatrix4(Xl);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const m=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let v=m,p=g-1;v<p;v+=c){const d=h.getX(v),M=h.getX(v+1),S=Xr(this,e,rr,l,d,M);S&&t.push(S)}if(this.isLineLoop){const v=h.getX(g-1),p=h.getX(m),d=Xr(this,e,rr,l,v,p);d&&t.push(d)}}else{const m=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let v=m,p=g-1;v<p;v+=c){const d=Xr(this,e,rr,l,v,v+1);d&&t.push(d)}if(this.isLineLoop){const v=Xr(this,e,rr,l,g-1,m);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function Xr(i,e,t,n,r,s){const a=i.geometry.attributes.position;if(ls.fromBufferAttribute(a,r),cs.fromBufferAttribute(a,s),t.distanceSqToSegment(ls,cs,no,ql)>n)return;no.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(no);if(!(l<e.near||l>e.far))return{distance:l,point:ql.clone().applyMatrix4(i.matrixWorld),index:r,face:null,faceIndex:null,barycoord:null,object:i}}class Og extends Ki{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new nt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new nt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Au,this.normalScale=new lt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new un,this.combine=fa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class qu extends bt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new nt(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const io=new pt,$l=new te,jl=new te;class Bg{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new lt(512,512),this.map=null,this.mapPass=null,this.matrix=new pt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new xa,this._frameExtents=new lt(1,1),this._viewportCount=1,this._viewports=[new _t(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;$l.setFromMatrixPosition(e.matrixWorld),t.position.copy($l),jl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(jl),t.updateMatrixWorld(),io.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(io),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(io)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class zg extends Bg{constructor(){super(new Sa(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class kg extends qu{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.target=new bt,this.shadow=new zg}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Hg extends qu{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ua}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ua);function Yu(i,e,t){const n=new Fg;n.background=new nt(922912);const r=new Ng({antialias:!0});r.setPixelRatio(window.devicePixelRatio),i.appendChild(r.domElement),r.domElement.style.position="absolute",r.domElement.style.inset="0";const s={cx:Mt/2,cy:Mt/2,k:8},a=new Sa(-1,1,1,-1,-1e3,2e3);a.up.set(0,0,-1),a.position.set(0,500,0),a.lookAt(0,0,0),n.add(new Hg(16777215,.75));const o=new kg(16777215,1.4);o.position.set(120,300,80),n.add(o);const l=128,c=new xr(Mt,Mt,l,l);c.rotateX(-Math.PI/2);const h=c.attributes.position,u=new Float32Array(h.count*3),f=new nt(2972221),m=new nt(9076566),g=new nt(14210248),v=new nt;for(let L=0;L<h.count;L++){const P=h.getX(L)+Mt/2,X=h.getZ(L)+Mt/2,z=bs(P,X);h.setY(L,z*.06);const re=Math.min(1,z/320);re<.5?v.copy(f).lerp(m,re*2):v.copy(m).lerp(g,(re-.5)*2),u[L*3]=v.r,u[L*3+1]=v.g,u[L*3+2]=v.b}c.setAttribute("color",new rn(u,3)),c.computeVertexNormals();const p=new an(c,new Og({vertexColors:!0}));n.add(p);const d=new Fi;for(const L of e){const P=L.ring.map(([z,re])=>new te(z-Mt/2,bs(z,re)*.06+.6,re-Mt/2)),X=new fn().setFromPoints(P);d.add(new Yl(X,new Jo({color:16765286})))}n.add(d);const M=new Fi,S=new Jo({color:3820127,transparent:!0,opacity:.6});for(let L=0;L<=Mt;L+=lo)for(const P of[!0,!1]){const X=[];for(let z=0;z<=Mt;z+=2){const re=P?z:L,q=P?L:z;X.push(new te(re-Mt/2,bs(re,q)*.06+.3,q-Mt/2))}M.add(new Yl(new fn().setFromPoints(X),S))}n.add(M);function y(){const L=i.clientWidth,P=i.clientHeight;r.setSize(L,P),R()}function R(){const L=i.clientWidth,P=i.clientHeight,X=L/2/s.k,z=P/2/s.k;a.left=-X,a.right=X,a.top=z,a.bottom=-z,a.position.set(s.cx-Mt/2,500,s.cy-Mt/2),a.lookAt(s.cx-Mt/2,0,s.cy-Mt/2),a.updateProjectionMatrix(),t&&t(s)}let A=!1,T=0,I=0;const H=r.domElement;H.addEventListener("pointerdown",L=>{L.button!==0&&L.button!==1||(A=!0,T=L.clientX,I=L.clientY)}),window.addEventListener("pointermove",L=>{A&&(s.cx-=(L.clientX-T)/s.k,s.cy-=(L.clientY-I)/s.k,s.cx=Math.max(0,Math.min(Mt,s.cx)),s.cy=Math.max(0,Math.min(Mt,s.cy)),T=L.clientX,I=L.clientY,R())}),window.addEventListener("pointerup",()=>{A=!1}),H.addEventListener("wheel",L=>{L.preventDefault();const P=L.deltaY<0?1.15:1/1.15;s.k=Math.max(2,Math.min(80,s.k*P)),R()},{passive:!1}),window.addEventListener("resize",y),y();function x(){r.render(n,a)}function E(L,P){const X=i.clientWidth,z=i.clientHeight;return[(L-s.cx)*s.k+X/2,(P-s.cy)*s.k+z/2]}function N(L,P){const X=i.clientWidth,z=i.clientHeight;return[(L-X/2)/s.k+s.cx,(P-z/2)/s.k+s.cy]}return{render:x,resize:y,view:s,worldToScreen:E,screenToWorld:N,domElement:H}}function $u(i,e){const t=document.createElement("canvas");t.style.position="absolute",t.style.inset="0",t.style.pointerEvents="none",t.style.zIndex="5",i.appendChild(t);const n=t.getContext("2d");function r(){t.width=i.clientWidth*window.devicePixelRatio,t.height=i.clientHeight*window.devicePixelRatio,t.style.width=i.clientWidth+"px",t.style.height=i.clientHeight+"px"}r(),window.addEventListener("resize",r);function s(l,c){const[h,u]=e.worldToScreen(l,c);return[h*window.devicePixelRatio,u*window.devicePixelRatio]}function a(l){for(const c of l)for(const h of c)n.beginPath(),h.forEach(([u,f],m)=>{const[g,v]=s(u,f);m===0?n.moveTo(g,v):n.lineTo(g,v)}),n.closePath()}function o(l){n.clearRect(0,0,t.width,t.height),n.lineWidth=2*window.devicePixelRatio,l.diff&&(l.diff.added&&l.diff.added.length&&(n.fillStyle="rgba(46, 204, 113, 0.35)",n.strokeStyle="#2ecc71",n.beginPath(),a(l.diff.added),n.fill("evenodd"),n.stroke()),l.diff.removed&&l.diff.removed.length&&(n.fillStyle="rgba(231, 76, 60, 0.35)",n.strokeStyle="#e74c3c",n.beginPath(),a(l.diff.removed),n.fill("evenodd"),n.stroke()));for(const c of l.zones||[]){n.fillStyle=(c.color||"#3498db")+"55",n.strokeStyle=c.color||"#3498db",n.beginPath(),a(c.geom),n.fill("evenodd"),n.stroke();const h=c.geom[0]&&c.geom[0][0];if(h){let u=0,f=0;for(let v=0;v<h.length-1;v++)u+=h[v][0],f+=h[v][1];u/=h.length-1,f/=h.length-1;const[m,g]=s(u,f);n.fillStyle="#fff",n.font=`${13*window.devicePixelRatio}px sans-serif`,n.textAlign="center",n.fillText(c.name,m,g)}}n.strokeStyle="#e67e22",n.setLineDash([8*window.devicePixelRatio,5*window.devicePixelRatio]);for(const c of l.isoglosses||[])n.beginPath(),c.points.forEach(([h,u],f)=>{const[m,g]=s(h,u);f===0?n.moveTo(m,g):n.lineTo(m,g)}),n.stroke();n.setLineDash([]);for(const c of l.points||[]){const[h,u]=s(c.x,c.y);n.beginPath(),n.arc(h,u,5*window.devicePixelRatio,0,Math.PI*2),n.fillStyle=c.id===l.selectedPointId?"#f1c40f":"#ecf0f1",n.fill(),n.strokeStyle="#2c3e50",n.lineWidth=1.5*window.devicePixelRatio,n.stroke()}if(l.draft&&l.draft.length){n.strokeStyle="#9b59b6",n.beginPath(),l.draft.forEach(([c,h],u)=>{const[f,m]=s(c,h);u===0?n.moveTo(f,m):n.lineTo(f,m)}),n.stroke();for(const[c,h]of l.draft){const[u,f]=s(c,h);n.beginPath(),n.arc(u,f,3.5*window.devicePixelRatio,0,Math.PI*2),n.fillStyle="#9b59b6",n.fill()}}if(l.snapTarget){const[c,h]=s(l.snapTarget[0],l.snapTarget[1]);n.beginPath(),n.arc(c,h,9*window.devicePixelRatio,0,Math.PI*2),n.strokeStyle=l.snapTarget.kind==="boundary"?"#1abc9c":"#3498db",n.lineWidth=2.5*window.devicePixelRatio,n.stroke()}}return{draw:o,resize:r,canvas:t}}function Gg(i=100){let e=[],t=[];return{push(n){e.push(JSON.stringify(n)),e.length>i&&e.shift(),t=[]},undo(n){return e.length?(t.push(JSON.stringify(n)),JSON.parse(e.pop())):null},redo(n){return t.length?(e.push(JSON.stringify(n)),JSON.parse(t.pop())):null},canUndo:()=>e.length>0,canRedo:()=>t.length>0,clear(){e=[],t=[]}}}function ju(i,e){const t=i[0]-e[0],n=i[1]-e[1];return t*t+n*n}function Vg(i,e,t){const n=t[0]-e[0],r=t[1]-e[1],s=n*n+r*r;let a=s===0?0:((i[0]-e[0])*n+(i[1]-e[1])*r)/s;return a=Math.max(0,Math.min(1,a)),[e[0]+a*n,e[1]+a*r]}function Wg(i,e){let t=null,n=1/0;for(const r of e)for(let s=0;s<r.length-1;s++){const a=Vg(i,r[s],r[s+1]),o=ju(i,a);o<n&&(n=o,t=a)}return t?{point:t,dist:Math.sqrt(n),kind:"boundary"}:null}function Xg(i,e){const t=Math.round(i[0]/e)*e,n=Math.round(i[1]/e)*e,r=[t,n];return{point:r,dist:Math.sqrt(ju(i,r)),kind:"grid"}}function Kl(i,e,t,n){const r=[],s=Wg(i,e);s&&s.dist<=n&&r.push(s);const a=Xg(i,t);if(a.dist<=n&&r.push(a),!r.length)return{point:i,kind:null,snapped:!1};r.sort((l,c)=>l.dist-c.dist);const o=r[0];return{point:o.point,kind:o.kind,snapped:!0}}class Wn{constructor(e,t){this.next=null,this.key=e,this.data=t,this.left=null,this.right=null}}function qg(i,e){return i>e?1:i<e?-1:0}function Fn(i,e,t){const n=new Wn(null,null);let r=n,s=n;for(;;){const a=t(i,e.key);if(a<0){if(e.left===null)break;if(t(i,e.left.key)<0){const o=e.left;if(e.left=o.right,o.right=e,e=o,e.left===null)break}s.left=e,s=e,e=e.left}else if(a>0){if(e.right===null)break;if(t(i,e.right.key)>0){const o=e.right;if(e.right=o.left,o.left=e,e=o,e.right===null)break}r.right=e,r=e,e=e.right}else break}return r.right=e.left,s.left=e.right,e.left=n.right,e.right=n.left,e}function ro(i,e,t,n){const r=new Wn(i,e);if(t===null)return r.left=r.right=null,r;t=Fn(i,t,n);const s=n(i,t.key);return s<0?(r.left=t.left,r.right=t,t.left=null):s>=0&&(r.right=t.right,r.left=t,t.right=null),r}function Zl(i,e,t){let n=null,r=null;if(e){e=Fn(i,e,t);const s=t(e.key,i);s===0?(n=e.left,r=e.right):s<0?(r=e.right,e.right=null,n=e):(n=e.left,e.left=null,r=e)}return{left:n,right:r}}function Yg(i,e,t){return e===null?i:(i===null||(e=Fn(i.key,e,t),e.left=i),e)}function Qo(i,e,t,n,r){if(i){n(`${e}${t?"└── ":"├── "}${r(i)}
`);const s=e+(t?"    ":"│   ");i.left&&Qo(i.left,s,!1,n,r),i.right&&Qo(i.right,s,!0,n,r)}}class Ea{constructor(e=qg){this._root=null,this._size=0,this._comparator=e}insert(e,t){return this._size++,this._root=ro(e,t,this._root,this._comparator)}add(e,t){const n=new Wn(e,t);this._root===null&&(n.left=n.right=null,this._size++,this._root=n);const r=this._comparator,s=Fn(e,this._root,r),a=r(e,s.key);return a===0?this._root=s:(a<0?(n.left=s.left,n.right=s,s.left=null):a>0&&(n.right=s.right,n.left=s,s.right=null),this._size++,this._root=n),this._root}remove(e){this._root=this._remove(e,this._root,this._comparator)}_remove(e,t,n){let r;return t===null?null:(t=Fn(e,t,n),n(e,t.key)===0?(t.left===null?r=t.right:(r=Fn(e,t.left,n),r.right=t.right),this._size--,r):t)}pop(){let e=this._root;if(e){for(;e.left;)e=e.left;return this._root=Fn(e.key,this._root,this._comparator),this._root=this._remove(e.key,this._root,this._comparator),{key:e.key,data:e.data}}return null}findStatic(e){let t=this._root;const n=this._comparator;for(;t;){const r=n(e,t.key);if(r===0)return t;r<0?t=t.left:t=t.right}return null}find(e){return this._root&&(this._root=Fn(e,this._root,this._comparator),this._comparator(e,this._root.key)!==0)?null:this._root}contains(e){let t=this._root;const n=this._comparator;for(;t;){const r=n(e,t.key);if(r===0)return!0;r<0?t=t.left:t=t.right}return!1}forEach(e,t){let n=this._root;const r=[];let s=!1;for(;!s;)n!==null?(r.push(n),n=n.left):r.length!==0?(n=r.pop(),e.call(t,n),n=n.right):s=!0;return this}range(e,t,n,r){const s=[],a=this._comparator;let o=this._root,l;for(;s.length!==0||o;)if(o)s.push(o),o=o.left;else{if(o=s.pop(),l=a(o.key,t),l>0)break;if(a(o.key,e)>=0&&n.call(r,o))return this;o=o.right}return this}keys(){const e=[];return this.forEach(({key:t})=>{e.push(t)}),e}values(){const e=[];return this.forEach(({data:t})=>{e.push(t)}),e}min(){return this._root?this.minNode(this._root).key:null}max(){return this._root?this.maxNode(this._root).key:null}minNode(e=this._root){if(e)for(;e.left;)e=e.left;return e}maxNode(e=this._root){if(e)for(;e.right;)e=e.right;return e}at(e){let t=this._root,n=!1,r=0;const s=[];for(;!n;)if(t)s.push(t),t=t.left;else if(s.length>0){if(t=s.pop(),r===e)return t;r++,t=t.right}else n=!0;return null}next(e){let t=this._root,n=null;if(e.right){for(n=e.right;n.left;)n=n.left;return n}const r=this._comparator;for(;t;){const s=r(e.key,t.key);if(s===0)break;s<0?(n=t,t=t.left):t=t.right}return n}prev(e){let t=this._root,n=null;if(e.left!==null){for(n=e.left;n.right;)n=n.right;return n}const r=this._comparator;for(;t;){const s=r(e.key,t.key);if(s===0)break;s<0?t=t.left:(n=t,t=t.right)}return n}clear(){return this._root=null,this._size=0,this}toList(){return jg(this._root)}load(e,t=[],n=!1){let r=e.length;const s=this._comparator;if(n&&na(e,t,0,r-1,s),this._root===null)this._root=ea(e,t,0,r),this._size=r;else{const a=Kg(this.toList(),$g(e,t),s);r=this._size+r,this._root=ta({head:a},0,r)}return this}isEmpty(){return this._root===null}get size(){return this._size}get root(){return this._root}toString(e=t=>String(t.key)){const t=[];return Qo(this._root,"",!0,n=>t.push(n),e),t.join("")}update(e,t,n){const r=this._comparator;let{left:s,right:a}=Zl(e,this._root,r);r(e,t)<0?a=ro(t,n,a,r):s=ro(t,n,s,r),this._root=Yg(s,a,r)}split(e){return Zl(e,this._root,this._comparator)}*[Symbol.iterator](){let e=this._root;const t=[];let n=!1;for(;!n;)e!==null?(t.push(e),e=e.left):t.length!==0?(e=t.pop(),yield e,e=e.right):n=!0}}function ea(i,e,t,n){const r=n-t;if(r>0){const s=t+Math.floor(r/2),a=i[s],o=e[s],l=new Wn(a,o);return l.left=ea(i,e,t,s),l.right=ea(i,e,s+1,n),l}return null}function $g(i,e){const t=new Wn(null,null);let n=t;for(let r=0;r<i.length;r++)n=n.next=new Wn(i[r],e[r]);return n.next=null,t.next}function jg(i){let e=i;const t=[];let n=!1;const r=new Wn(null,null);let s=r;for(;!n;)e?(t.push(e),e=e.left):t.length>0?(e=s=s.next=t.pop(),e=e.right):n=!0;return s.next=null,r.next}function ta(i,e,t){const n=t-e;if(n>0){const r=e+Math.floor(n/2),s=ta(i,e,r),a=i.head;return a.left=s,i.head=i.head.next,a.right=ta(i,r+1,t),a}return null}function Kg(i,e,t){const n=new Wn(null,null);let r=n,s=i,a=e;for(;s!==null&&a!==null;)t(s.key,a.key)<0?(r.next=s,s=s.next):(r.next=a,a=a.next),r=r.next;return s!==null?r.next=s:a!==null&&(r.next=a),n.next}function na(i,e,t,n,r){if(t>=n)return;const s=i[t+n>>1];let a=t-1,o=n+1;for(;;){do a++;while(r(i[a],s)<0);do o--;while(r(i[o],s)>0);if(a>=o)break;let l=i[a];i[a]=i[o],i[o]=l,l=e[a],e[a]=e[o],e[o]=l}na(i,e,t,o,r),na(i,e,o+1,n,r)}const bn=11102230246251565e-32,Rt=134217729,Zg=(3+8*bn)*bn;function so(i,e,t,n,r){let s,a,o,l,c=e[0],h=n[0],u=0,f=0;h>c==h>-c?(s=c,c=e[++u]):(s=h,h=n[++f]);let m=0;if(u<i&&f<t)for(h>c==h>-c?(a=c+s,o=s-(a-c),c=e[++u]):(a=h+s,o=s-(a-h),h=n[++f]),s=a,o!==0&&(r[m++]=o);u<i&&f<t;)h>c==h>-c?(a=s+c,l=a-s,o=s-(a-l)+(c-l),c=e[++u]):(a=s+h,l=a-s,o=s-(a-l)+(h-l),h=n[++f]),s=a,o!==0&&(r[m++]=o);for(;u<i;)a=s+c,l=a-s,o=s-(a-l)+(c-l),c=e[++u],s=a,o!==0&&(r[m++]=o);for(;f<t;)a=s+h,l=a-s,o=s-(a-l)+(h-l),h=n[++f],s=a,o!==0&&(r[m++]=o);return(s!==0||m===0)&&(r[m++]=s),m}function Jg(i,e){let t=e[0];for(let n=1;n<i;n++)t+=e[n];return t}function pe(i){return new Float64Array(i)}const Qg=(3+16*bn)*bn,e0=(2+12*bn)*bn,t0=(9+64*bn)*bn*bn,Li=pe(4),Jl=pe(8),Ql=pe(12),ec=pe(16),Ct=pe(4);function n0(i,e,t,n,r,s,a){let o,l,c,h,u,f,m,g,v,p,d,M,S,y,R,A,T,I;const H=i-r,x=t-r,E=e-s,N=n-s;y=H*N,f=Rt*H,m=f-(f-H),g=H-m,f=Rt*N,v=f-(f-N),p=N-v,R=g*p-(y-m*v-g*v-m*p),A=E*x,f=Rt*E,m=f-(f-E),g=E-m,f=Rt*x,v=f-(f-x),p=x-v,T=g*p-(A-m*v-g*v-m*p),d=R-T,u=R-d,Li[0]=R-(d+u)+(u-T),M=y+d,u=M-y,S=y-(M-u)+(d-u),d=S-A,u=S-d,Li[1]=S-(d+u)+(u-A),I=M+d,u=I-M,Li[2]=M-(I-u)+(d-u),Li[3]=I;let L=Jg(4,Li),P=e0*a;if(L>=P||-L>=P||(u=i-H,o=i-(H+u)+(u-r),u=t-x,c=t-(x+u)+(u-r),u=e-E,l=e-(E+u)+(u-s),u=n-N,h=n-(N+u)+(u-s),o===0&&l===0&&c===0&&h===0)||(P=t0*a+Zg*Math.abs(L),L+=H*h+N*o-(E*c+x*l),L>=P||-L>=P))return L;y=o*N,f=Rt*o,m=f-(f-o),g=o-m,f=Rt*N,v=f-(f-N),p=N-v,R=g*p-(y-m*v-g*v-m*p),A=l*x,f=Rt*l,m=f-(f-l),g=l-m,f=Rt*x,v=f-(f-x),p=x-v,T=g*p-(A-m*v-g*v-m*p),d=R-T,u=R-d,Ct[0]=R-(d+u)+(u-T),M=y+d,u=M-y,S=y-(M-u)+(d-u),d=S-A,u=S-d,Ct[1]=S-(d+u)+(u-A),I=M+d,u=I-M,Ct[2]=M-(I-u)+(d-u),Ct[3]=I;const X=so(4,Li,4,Ct,Jl);y=H*h,f=Rt*H,m=f-(f-H),g=H-m,f=Rt*h,v=f-(f-h),p=h-v,R=g*p-(y-m*v-g*v-m*p),A=E*c,f=Rt*E,m=f-(f-E),g=E-m,f=Rt*c,v=f-(f-c),p=c-v,T=g*p-(A-m*v-g*v-m*p),d=R-T,u=R-d,Ct[0]=R-(d+u)+(u-T),M=y+d,u=M-y,S=y-(M-u)+(d-u),d=S-A,u=S-d,Ct[1]=S-(d+u)+(u-A),I=M+d,u=I-M,Ct[2]=M-(I-u)+(d-u),Ct[3]=I;const z=so(X,Jl,4,Ct,Ql);y=o*h,f=Rt*o,m=f-(f-o),g=o-m,f=Rt*h,v=f-(f-h),p=h-v,R=g*p-(y-m*v-g*v-m*p),A=l*c,f=Rt*l,m=f-(f-l),g=l-m,f=Rt*c,v=f-(f-c),p=c-v,T=g*p-(A-m*v-g*v-m*p),d=R-T,u=R-d,Ct[0]=R-(d+u)+(u-T),M=y+d,u=M-y,S=y-(M-u)+(d-u),d=S-A,u=S-d,Ct[1]=S-(d+u)+(u-A),I=M+d,u=I-M,Ct[2]=M-(I-u)+(d-u),Ct[3]=I;const re=so(z,Ql,4,Ct,ec);return ec[re-1]}function i0(i,e,t,n,r,s){const a=(e-s)*(t-r),o=(i-r)*(n-s),l=a-o,c=Math.abs(a+o);return Math.abs(l)>=Qg*c?l:-n0(i,e,t,n,r,s,c)}pe(4);pe(4);pe(4);pe(4);pe(4);pe(4);pe(4);pe(4);pe(4);pe(8);pe(8);pe(8);pe(4);pe(8);pe(8);pe(16);pe(12);pe(192);pe(192);pe(4);pe(4);pe(4);pe(4);pe(4);pe(4);pe(4);pe(4);pe(8);pe(8);pe(8);pe(8);pe(8);pe(8);pe(8);pe(8);pe(8);pe(4);pe(4);pe(4);pe(8);pe(16);pe(16);pe(16);pe(32);pe(32);pe(48);pe(64);pe(1152);pe(1152);pe(4);pe(4);pe(4);pe(4);pe(4);pe(4);pe(4);pe(4);pe(4);pe(4);pe(24);pe(24);pe(24);pe(24);pe(24);pe(24);pe(24);pe(24);pe(24);pe(24);pe(1152);pe(1152);pe(1152);pe(1152);pe(1152);pe(2304);pe(2304);pe(3456);pe(5760);pe(8);pe(8);pe(8);pe(16);pe(24);pe(48);pe(48);pe(96);pe(192);pe(384);pe(384);pe(384);pe(768);pe(96);pe(96);pe(96);pe(1152);var Ku={};const sr=(i,e)=>i.ll.x<=e.x&&e.x<=i.ur.x&&i.ll.y<=e.y&&e.y<=i.ur.y,ia=(i,e)=>{if(e.ur.x<i.ll.x||i.ur.x<e.ll.x||e.ur.y<i.ll.y||i.ur.y<e.ll.y)return null;const t=i.ll.x<e.ll.x?e.ll.x:i.ll.x,n=i.ur.x<e.ur.x?i.ur.x:e.ur.x,r=i.ll.y<e.ll.y?e.ll.y:i.ll.y,s=i.ur.y<e.ur.y?i.ur.y:e.ur.y;return{ll:{x:t,y:r},ur:{x:n,y:s}}};let On=Number.EPSILON;On===void 0&&(On=Math.pow(2,-52));const r0=On*On,tc=(i,e)=>{if(-On<i&&i<On&&-On<e&&e<On)return 0;const t=i-e;return t*t<r0*i*e?0:i<e?-1:1};class s0{constructor(){this.reset()}reset(){this.xRounder=new nc,this.yRounder=new nc}round(e,t){return{x:this.xRounder.round(e),y:this.yRounder.round(t)}}}class nc{constructor(){this.tree=new Ea,this.round(0)}round(e){const t=this.tree.add(e),n=this.tree.prev(t);if(n!==null&&tc(t.key,n.key)===0)return this.tree.remove(e),n.key;const r=this.tree.next(t);return r!==null&&tc(t.key,r.key)===0?(this.tree.remove(e),r.key):e}}const hr=new s0,es=(i,e)=>i.x*e.y-i.y*e.x,Zu=(i,e)=>i.x*e.x+i.y*e.y,ic=(i,e,t)=>{const n=i0(i.x,i.y,e.x,e.y,t.x,t.y);return n>0?-1:n<0?1:0},us=i=>Math.sqrt(Zu(i,i)),o0=(i,e,t)=>{const n={x:e.x-i.x,y:e.y-i.y},r={x:t.x-i.x,y:t.y-i.y};return es(r,n)/us(r)/us(n)},a0=(i,e,t)=>{const n={x:e.x-i.x,y:e.y-i.y},r={x:t.x-i.x,y:t.y-i.y};return Zu(r,n)/us(r)/us(n)},rc=(i,e,t)=>e.y===0?null:{x:i.x+e.x/e.y*(t-i.y),y:t},sc=(i,e,t)=>e.x===0?null:{x:t,y:i.y+e.y/e.x*(t-i.x)},l0=(i,e,t,n)=>{if(e.x===0)return sc(t,n,i.x);if(n.x===0)return sc(i,e,t.x);if(e.y===0)return rc(t,n,i.y);if(n.y===0)return rc(i,e,t.y);const r=es(e,n);if(r==0)return null;const s={x:t.x-i.x,y:t.y-i.y},a=es(s,e)/r,o=es(s,n)/r,l=i.x+o*e.x,c=t.x+a*n.x,h=i.y+o*e.y,u=t.y+a*n.y,f=(l+c)/2,m=(h+u)/2;return{x:f,y:m}};class Xt{static compare(e,t){const n=Xt.comparePoints(e.point,t.point);return n!==0?n:(e.point!==t.point&&e.link(t),e.isLeft!==t.isLeft?e.isLeft?1:-1:Hn.compare(e.segment,t.segment))}static comparePoints(e,t){return e.x<t.x?-1:e.x>t.x?1:e.y<t.y?-1:e.y>t.y?1:0}constructor(e,t){e.events===void 0?e.events=[this]:e.events.push(this),this.point=e,this.isLeft=t}link(e){if(e.point===this.point)throw new Error("Tried to link already linked events");const t=e.point.events;for(let n=0,r=t.length;n<r;n++){const s=t[n];this.point.events.push(s),s.point=this.point}this.checkForConsuming()}checkForConsuming(){const e=this.point.events.length;for(let t=0;t<e;t++){const n=this.point.events[t];if(n.segment.consumedBy===void 0)for(let r=t+1;r<e;r++){const s=this.point.events[r];s.consumedBy===void 0&&n.otherSE.point.events===s.otherSE.point.events&&n.segment.consume(s.segment)}}}getAvailableLinkedEvents(){const e=[];for(let t=0,n=this.point.events.length;t<n;t++){const r=this.point.events[t];r!==this&&!r.segment.ringOut&&r.segment.isInResult()&&e.push(r)}return e}getLeftmostComparator(e){const t=new Map,n=r=>{const s=r.otherSE;t.set(r,{sine:o0(this.point,e.point,s.point),cosine:a0(this.point,e.point,s.point)})};return(r,s)=>{t.has(r)||n(r),t.has(s)||n(s);const{sine:a,cosine:o}=t.get(r),{sine:l,cosine:c}=t.get(s);return a>=0&&l>=0?o<c?1:o>c?-1:0:a<0&&l<0?o<c?-1:o>c?1:0:l<a?-1:l>a?1:0}}}let c0=0;class Hn{static compare(e,t){const n=e.leftSE.point.x,r=t.leftSE.point.x,s=e.rightSE.point.x,a=t.rightSE.point.x;if(a<n)return 1;if(s<r)return-1;const o=e.leftSE.point.y,l=t.leftSE.point.y,c=e.rightSE.point.y,h=t.rightSE.point.y;if(n<r){if(l<o&&l<c)return 1;if(l>o&&l>c)return-1;const u=e.comparePoint(t.leftSE.point);if(u<0)return 1;if(u>0)return-1;const f=t.comparePoint(e.rightSE.point);return f!==0?f:-1}if(n>r){if(o<l&&o<h)return-1;if(o>l&&o>h)return 1;const u=t.comparePoint(e.leftSE.point);if(u!==0)return u;const f=e.comparePoint(t.rightSE.point);return f<0?1:f>0?-1:1}if(o<l)return-1;if(o>l)return 1;if(s<a){const u=t.comparePoint(e.rightSE.point);if(u!==0)return u}if(s>a){const u=e.comparePoint(t.rightSE.point);if(u<0)return 1;if(u>0)return-1}if(s!==a){const u=c-o,f=s-n,m=h-l,g=a-r;if(u>f&&m<g)return 1;if(u<f&&m>g)return-1}return s>a?1:s<a||c<h?-1:c>h?1:e.id<t.id?-1:e.id>t.id?1:0}constructor(e,t,n,r){this.id=++c0,this.leftSE=e,e.segment=this,e.otherSE=t,this.rightSE=t,t.segment=this,t.otherSE=e,this.rings=n,this.windings=r}static fromRing(e,t,n){let r,s,a;const o=Xt.comparePoints(e,t);if(o<0)r=e,s=t,a=1;else if(o>0)r=t,s=e,a=-1;else throw new Error(`Tried to create degenerate segment at [${e.x}, ${e.y}]`);const l=new Xt(r,!0),c=new Xt(s,!1);return new Hn(l,c,[n],[a])}replaceRightSE(e){this.rightSE=e,this.rightSE.segment=this,this.rightSE.otherSE=this.leftSE,this.leftSE.otherSE=this.rightSE}bbox(){const e=this.leftSE.point.y,t=this.rightSE.point.y;return{ll:{x:this.leftSE.point.x,y:e<t?e:t},ur:{x:this.rightSE.point.x,y:e>t?e:t}}}vector(){return{x:this.rightSE.point.x-this.leftSE.point.x,y:this.rightSE.point.y-this.leftSE.point.y}}isAnEndpoint(e){return e.x===this.leftSE.point.x&&e.y===this.leftSE.point.y||e.x===this.rightSE.point.x&&e.y===this.rightSE.point.y}comparePoint(e){if(this.isAnEndpoint(e))return 0;const t=this.leftSE.point,n=this.rightSE.point,r=this.vector();if(t.x===n.x)return e.x===t.x?0:e.x<t.x?1:-1;const s=(e.y-t.y)/r.y,a=t.x+s*r.x;if(e.x===a)return 0;const o=(e.x-t.x)/r.x,l=t.y+o*r.y;return e.y===l?0:e.y<l?-1:1}getIntersection(e){const t=this.bbox(),n=e.bbox(),r=ia(t,n);if(r===null)return null;const s=this.leftSE.point,a=this.rightSE.point,o=e.leftSE.point,l=e.rightSE.point,c=sr(t,o)&&this.comparePoint(o)===0,h=sr(n,s)&&e.comparePoint(s)===0,u=sr(t,l)&&this.comparePoint(l)===0,f=sr(n,a)&&e.comparePoint(a)===0;if(h&&c)return f&&!u?a:!f&&u?l:null;if(h)return u&&s.x===l.x&&s.y===l.y?null:s;if(c)return f&&a.x===o.x&&a.y===o.y?null:o;if(f&&u)return null;if(f)return a;if(u)return l;const m=l0(s,this.vector(),o,e.vector());return m===null||!sr(r,m)?null:hr.round(m.x,m.y)}split(e){const t=[],n=e.events!==void 0,r=new Xt(e,!0),s=new Xt(e,!1),a=this.rightSE;this.replaceRightSE(s),t.push(s),t.push(r);const o=new Hn(r,a,this.rings.slice(),this.windings.slice());return Xt.comparePoints(o.leftSE.point,o.rightSE.point)>0&&o.swapEvents(),Xt.comparePoints(this.leftSE.point,this.rightSE.point)>0&&this.swapEvents(),n&&(r.checkForConsuming(),s.checkForConsuming()),t}swapEvents(){const e=this.rightSE;this.rightSE=this.leftSE,this.leftSE=e,this.leftSE.isLeft=!0,this.rightSE.isLeft=!1;for(let t=0,n=this.windings.length;t<n;t++)this.windings[t]*=-1}consume(e){let t=this,n=e;for(;t.consumedBy;)t=t.consumedBy;for(;n.consumedBy;)n=n.consumedBy;const r=Hn.compare(t,n);if(r!==0){if(r>0){const s=t;t=n,n=s}if(t.prev===n){const s=t;t=n,n=s}for(let s=0,a=n.rings.length;s<a;s++){const o=n.rings[s],l=n.windings[s],c=t.rings.indexOf(o);c===-1?(t.rings.push(o),t.windings.push(l)):t.windings[c]+=l}n.rings=null,n.windings=null,n.consumedBy=t,n.leftSE.consumedBy=t.leftSE,n.rightSE.consumedBy=t.rightSE}}prevInResult(){return this._prevInResult!==void 0?this._prevInResult:(this.prev?this.prev.isInResult()?this._prevInResult=this.prev:this._prevInResult=this.prev.prevInResult():this._prevInResult=null,this._prevInResult)}beforeState(){if(this._beforeState!==void 0)return this._beforeState;if(!this.prev)this._beforeState={rings:[],windings:[],multiPolys:[]};else{const e=this.prev.consumedBy||this.prev;this._beforeState=e.afterState()}return this._beforeState}afterState(){if(this._afterState!==void 0)return this._afterState;const e=this.beforeState();this._afterState={rings:e.rings.slice(0),windings:e.windings.slice(0),multiPolys:[]};const t=this._afterState.rings,n=this._afterState.windings,r=this._afterState.multiPolys;for(let o=0,l=this.rings.length;o<l;o++){const c=this.rings[o],h=this.windings[o],u=t.indexOf(c);u===-1?(t.push(c),n.push(h)):n[u]+=h}const s=[],a=[];for(let o=0,l=t.length;o<l;o++){if(n[o]===0)continue;const c=t[o],h=c.poly;if(a.indexOf(h)===-1)if(c.isExterior)s.push(h);else{a.indexOf(h)===-1&&a.push(h);const u=s.indexOf(c.poly);u!==-1&&s.splice(u,1)}}for(let o=0,l=s.length;o<l;o++){const c=s[o].multiPoly;r.indexOf(c)===-1&&r.push(c)}return this._afterState}isInResult(){if(this.consumedBy)return!1;if(this._isInResult!==void 0)return this._isInResult;const e=this.beforeState().multiPolys,t=this.afterState().multiPolys;switch(nn.type){case"union":{const n=e.length===0,r=t.length===0;this._isInResult=n!==r;break}case"intersection":{let n,r;e.length<t.length?(n=e.length,r=t.length):(n=t.length,r=e.length),this._isInResult=r===nn.numMultiPolys&&n<r;break}case"xor":{const n=Math.abs(e.length-t.length);this._isInResult=n%2===1;break}case"difference":{const n=r=>r.length===1&&r[0].isSubject;this._isInResult=n(e)!==n(t);break}default:throw new Error(`Unrecognized operation type found ${nn.type}`)}return this._isInResult}}class oc{constructor(e,t,n){if(!Array.isArray(e)||e.length===0)throw new Error("Input geometry is not a valid Polygon or MultiPolygon");if(this.poly=t,this.isExterior=n,this.segments=[],typeof e[0][0]!="number"||typeof e[0][1]!="number")throw new Error("Input geometry is not a valid Polygon or MultiPolygon");const r=hr.round(e[0][0],e[0][1]);this.bbox={ll:{x:r.x,y:r.y},ur:{x:r.x,y:r.y}};let s=r;for(let a=1,o=e.length;a<o;a++){if(typeof e[a][0]!="number"||typeof e[a][1]!="number")throw new Error("Input geometry is not a valid Polygon or MultiPolygon");let l=hr.round(e[a][0],e[a][1]);l.x===s.x&&l.y===s.y||(this.segments.push(Hn.fromRing(s,l,this)),l.x<this.bbox.ll.x&&(this.bbox.ll.x=l.x),l.y<this.bbox.ll.y&&(this.bbox.ll.y=l.y),l.x>this.bbox.ur.x&&(this.bbox.ur.x=l.x),l.y>this.bbox.ur.y&&(this.bbox.ur.y=l.y),s=l)}(r.x!==s.x||r.y!==s.y)&&this.segments.push(Hn.fromRing(s,r,this))}getSweepEvents(){const e=[];for(let t=0,n=this.segments.length;t<n;t++){const r=this.segments[t];e.push(r.leftSE),e.push(r.rightSE)}return e}}class u0{constructor(e,t){if(!Array.isArray(e))throw new Error("Input geometry is not a valid Polygon or MultiPolygon");this.exteriorRing=new oc(e[0],this,!0),this.bbox={ll:{x:this.exteriorRing.bbox.ll.x,y:this.exteriorRing.bbox.ll.y},ur:{x:this.exteriorRing.bbox.ur.x,y:this.exteriorRing.bbox.ur.y}},this.interiorRings=[];for(let n=1,r=e.length;n<r;n++){const s=new oc(e[n],this,!1);s.bbox.ll.x<this.bbox.ll.x&&(this.bbox.ll.x=s.bbox.ll.x),s.bbox.ll.y<this.bbox.ll.y&&(this.bbox.ll.y=s.bbox.ll.y),s.bbox.ur.x>this.bbox.ur.x&&(this.bbox.ur.x=s.bbox.ur.x),s.bbox.ur.y>this.bbox.ur.y&&(this.bbox.ur.y=s.bbox.ur.y),this.interiorRings.push(s)}this.multiPoly=t}getSweepEvents(){const e=this.exteriorRing.getSweepEvents();for(let t=0,n=this.interiorRings.length;t<n;t++){const r=this.interiorRings[t].getSweepEvents();for(let s=0,a=r.length;s<a;s++)e.push(r[s])}return e}}class ac{constructor(e,t){if(!Array.isArray(e))throw new Error("Input geometry is not a valid Polygon or MultiPolygon");try{typeof e[0][0][0]=="number"&&(e=[e])}catch{}this.polys=[],this.bbox={ll:{x:Number.POSITIVE_INFINITY,y:Number.POSITIVE_INFINITY},ur:{x:Number.NEGATIVE_INFINITY,y:Number.NEGATIVE_INFINITY}};for(let n=0,r=e.length;n<r;n++){const s=new u0(e[n],this);s.bbox.ll.x<this.bbox.ll.x&&(this.bbox.ll.x=s.bbox.ll.x),s.bbox.ll.y<this.bbox.ll.y&&(this.bbox.ll.y=s.bbox.ll.y),s.bbox.ur.x>this.bbox.ur.x&&(this.bbox.ur.x=s.bbox.ur.x),s.bbox.ur.y>this.bbox.ur.y&&(this.bbox.ur.y=s.bbox.ur.y),this.polys.push(s)}this.isSubject=t}getSweepEvents(){const e=[];for(let t=0,n=this.polys.length;t<n;t++){const r=this.polys[t].getSweepEvents();for(let s=0,a=r.length;s<a;s++)e.push(r[s])}return e}}class fs{static factory(e){const t=[];for(let n=0,r=e.length;n<r;n++){const s=e[n];if(!s.isInResult()||s.ringOut)continue;let a=null,o=s.leftSE,l=s.rightSE;const c=[o],h=o.point,u=[];for(;a=o,o=l,c.push(o),o.point!==h;)for(;;){const f=o.getAvailableLinkedEvents();if(f.length===0){const v=c[0].point,p=c[c.length-1].point;throw new Error(`Unable to complete output ring starting at [${v.x}, ${v.y}]. Last matching segment found ends at [${p.x}, ${p.y}].`)}if(f.length===1){l=f[0].otherSE;break}let m=null;for(let v=0,p=u.length;v<p;v++)if(u[v].point===o.point){m=v;break}if(m!==null){const v=u.splice(m)[0],p=c.splice(v.index);p.unshift(p[0].otherSE),t.push(new fs(p.reverse()));continue}u.push({index:c.length,point:o.point});const g=o.getLeftmostComparator(a);l=f.sort(g)[0].otherSE;break}t.push(new fs(c))}return t}constructor(e){this.events=e;for(let t=0,n=e.length;t<n;t++)e[t].segment.ringOut=this;this.poly=null}getGeom(){let e=this.events[0].point;const t=[e];for(let c=1,h=this.events.length-1;c<h;c++){const u=this.events[c].point,f=this.events[c+1].point;ic(u,e,f)!==0&&(t.push(u),e=u)}if(t.length===1)return null;const n=t[0],r=t[1];ic(n,e,r)===0&&t.shift(),t.push(t[0]);const s=this.isExteriorRing()?1:-1,a=this.isExteriorRing()?0:t.length-1,o=this.isExteriorRing()?t.length:-1,l=[];for(let c=a;c!=o;c+=s)l.push([t[c].x,t[c].y]);return l}isExteriorRing(){if(this._isExteriorRing===void 0){const e=this.enclosingRing();this._isExteriorRing=e?!e.isExteriorRing():!0}return this._isExteriorRing}enclosingRing(){return this._enclosingRing===void 0&&(this._enclosingRing=this._calcEnclosingRing()),this._enclosingRing}_calcEnclosingRing(){let e=this.events[0];for(let r=1,s=this.events.length;r<s;r++){const a=this.events[r];Xt.compare(e,a)>0&&(e=a)}let t=e.segment.prevInResult(),n=t?t.prevInResult():null;for(;;){if(!t)return null;if(!n)return t.ringOut;if(n.ringOut!==t.ringOut)return n.ringOut.enclosingRing()!==t.ringOut?t.ringOut:t.ringOut.enclosingRing();t=n.prevInResult(),n=t?t.prevInResult():null}}}class lc{constructor(e){this.exteriorRing=e,e.poly=this,this.interiorRings=[]}addInterior(e){this.interiorRings.push(e),e.poly=this}getGeom(){const e=[this.exteriorRing.getGeom()];if(e[0]===null)return null;for(let t=0,n=this.interiorRings.length;t<n;t++){const r=this.interiorRings[t].getGeom();r!==null&&e.push(r)}return e}}class f0{constructor(e){this.rings=e,this.polys=this._composePolys(e)}getGeom(){const e=[];for(let t=0,n=this.polys.length;t<n;t++){const r=this.polys[t].getGeom();r!==null&&e.push(r)}return e}_composePolys(e){const t=[];for(let n=0,r=e.length;n<r;n++){const s=e[n];if(!s.poly)if(s.isExteriorRing())t.push(new lc(s));else{const a=s.enclosingRing();a.poly||t.push(new lc(a)),a.poly.addInterior(s)}}return t}}class h0{constructor(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:Hn.compare;this.queue=e,this.tree=new Ea(t),this.segments=[]}process(e){const t=e.segment,n=[];if(e.consumedBy)return e.isLeft?this.queue.remove(e.otherSE):this.tree.remove(t),n;const r=e.isLeft?this.tree.add(t):this.tree.find(t);if(!r)throw new Error(`Unable to find segment #${t.id} [${t.leftSE.point.x}, ${t.leftSE.point.y}] -> [${t.rightSE.point.x}, ${t.rightSE.point.y}] in SweepLine tree.`);let s=r,a=r,o,l;for(;o===void 0;)s=this.tree.prev(s),s===null?o=null:s.key.consumedBy===void 0&&(o=s.key);for(;l===void 0;)a=this.tree.next(a),a===null?l=null:a.key.consumedBy===void 0&&(l=a.key);if(e.isLeft){let c=null;if(o){const u=o.getIntersection(t);if(u!==null&&(t.isAnEndpoint(u)||(c=u),!o.isAnEndpoint(u))){const f=this._splitSafely(o,u);for(let m=0,g=f.length;m<g;m++)n.push(f[m])}}let h=null;if(l){const u=l.getIntersection(t);if(u!==null&&(t.isAnEndpoint(u)||(h=u),!l.isAnEndpoint(u))){const f=this._splitSafely(l,u);for(let m=0,g=f.length;m<g;m++)n.push(f[m])}}if(c!==null||h!==null){let u=null;c===null?u=h:h===null?u=c:u=Xt.comparePoints(c,h)<=0?c:h,this.queue.remove(t.rightSE),n.push(t.rightSE);const f=t.split(u);for(let m=0,g=f.length;m<g;m++)n.push(f[m])}n.length>0?(this.tree.remove(t),n.push(e)):(this.segments.push(t),t.prev=o)}else{if(o&&l){const c=o.getIntersection(l);if(c!==null){if(!o.isAnEndpoint(c)){const h=this._splitSafely(o,c);for(let u=0,f=h.length;u<f;u++)n.push(h[u])}if(!l.isAnEndpoint(c)){const h=this._splitSafely(l,c);for(let u=0,f=h.length;u<f;u++)n.push(h[u])}}}this.tree.remove(t)}return n}_splitSafely(e,t){this.tree.remove(e);const n=e.rightSE;this.queue.remove(n);const r=e.split(t);return r.push(n),e.consumedBy===void 0&&this.tree.add(e),r}}const cc=typeof process<"u"&&Ku.POLYGON_CLIPPING_MAX_QUEUE_SIZE||1e6,d0=typeof process<"u"&&Ku.POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS||1e6;class p0{run(e,t,n){nn.type=e,hr.reset();const r=[new ac(t,!0)];for(let u=0,f=n.length;u<f;u++)r.push(new ac(n[u],!1));if(nn.numMultiPolys=r.length,nn.type==="difference"){const u=r[0];let f=1;for(;f<r.length;)ia(r[f].bbox,u.bbox)!==null?f++:r.splice(f,1)}if(nn.type==="intersection")for(let u=0,f=r.length;u<f;u++){const m=r[u];for(let g=u+1,v=r.length;g<v;g++)if(ia(m.bbox,r[g].bbox)===null)return[]}const s=new Ea(Xt.compare);for(let u=0,f=r.length;u<f;u++){const m=r[u].getSweepEvents();for(let g=0,v=m.length;g<v;g++)if(s.insert(m[g]),s.size>cc)throw new Error("Infinite loop when putting segment endpoints in a priority queue (queue size too big).")}const a=new h0(s);let o=s.size,l=s.pop();for(;l;){const u=l.key;if(s.size===o){const m=u.segment;throw new Error(`Unable to pop() ${u.isLeft?"left":"right"} SweepEvent [${u.point.x}, ${u.point.y}] from segment #${m.id} [${m.leftSE.point.x}, ${m.leftSE.point.y}] -> [${m.rightSE.point.x}, ${m.rightSE.point.y}] from queue.`)}if(s.size>cc)throw new Error("Infinite loop when passing sweep line over endpoints (queue size too big).");if(a.segments.length>d0)throw new Error("Infinite loop when passing sweep line over endpoints (too many sweep line segments).");const f=a.process(u);for(let m=0,g=f.length;m<g;m++){const v=f[m];v.consumedBy===void 0&&s.insert(v)}o=s.size,l=s.pop()}hr.reset();const c=fs.factory(a.segments);return new f0(c).getGeom()}}const nn=new p0,m0=function(i){for(var e=arguments.length,t=new Array(e>1?e-1:0),n=1;n<e;n++)t[n-1]=arguments[n];return nn.run("union",i,t)},_0=function(i){for(var e=arguments.length,t=new Array(e>1?e-1:0),n=1;n<e;n++)t[n-1]=arguments[n];return nn.run("intersection",i,t)},g0=function(i){for(var e=arguments.length,t=new Array(e>1?e-1:0),n=1;n<e;n++)t[n-1]=arguments[n];return nn.run("xor",i,t)},v0=function(i){for(var e=arguments.length,t=new Array(e>1?e-1:0),n=1;n<e;n++)t[n-1]=arguments[n];return nn.run("difference",i,t)};var ya={union:m0,intersection:_0,xor:g0,difference:v0};function ra(i){return!i||!i.length?[]:i}function Ju(i,e){return!i||!i.length?ra(e):!e||!e.length?ra(i):ya.union(i,e)}function x0(i,e){return!i||!i.length||!e||!e.length?[]:ya.intersection(i,e)}function sa(i,e){return!i||!i.length?[]:!e||!e.length?ra(i):ya.difference(i,e)}function uc(i){let e=[];for(const t of i)e=Ju(e,t);return e}function fc(i){let e=0;for(let t=0;t<i.length-1;t++)e+=i[t][0]*i[t+1][1]-i[t+1][0]*i[t][1];return e/2}function Qu(i){if(!i||!i.length)return 0;let e=Math.abs(fc(i[0]));for(let t=1;t<i.length;t++)e-=Math.abs(fc(i[t]));return e}function Sn(i){return i?i.reduce((e,t)=>e+Qu(t),0):0}function hc(i){if(!i||!i.length)return[0,0];let e=i[0],t=-1;for(const o of i){const l=Qu(o);l>t&&(t=l,e=o)}const n=e[0];let r=0,s=0,a=Math.max(1,n.length-1);for(let o=0;o<n.length-1;o++)r+=n[o][0],s+=n[o][1];return[r/a,s/a]}function dc(i,e,t){const n=i.slice();return n[52]=e[t],n}function pc(i,e,t){const n=i.slice();return n[55]=e[t],n}function mc(i,e,t){const n=i.slice();return n[58]=e[t],n}function _c(i,e,t){const n=i.slice();return n[61]=e[t][0],n[62]=e[t][1],n}function gc(i){let e,t,n;function r(){return i[25](i[61])}return{c(){e=D("button"),e.textContent=`${i[62]}`,ln(e,"ghost",i[2]!==i[61])},m(s,a){Ce(s,e,a),t||(n=Xe(e,"click",r),t=!0)},p(s,a){i=s,a[0]&4&&ln(e,"ghost",i[2]!==i[61])},d(s){s&&Ae(e),t=!1,n()}}}function vc(i){let e,t,n;return{c(){e=D("input"),$(e,"placeholder","分区名称(可选)")},m(r,s){Ce(r,e,s),tt(e,i[9]),t||(n=Xe(e,"input",i[26]),t=!0)},p(r,s){s[0]&512&&e.value!==r[9]&&tt(e,r[9])},d(r){r&&Ae(e),t=!1,n()}}}function xc(i){let e,t,n;return{c(){e=D("input"),$(e,"placeholder","同音线名称(可选)")},m(r,s){Ce(r,e,s),tt(e,i[10]),t||(n=Xe(e,"input",i[27]),t=!0)},p(r,s){s[0]&1024&&e.value!==r[10]&&tt(e,r[10])},d(r){r&&Ae(e),t=!1,n()}}}function Sc(i){let e,t,n;return{c(){e=D("button"),e.textContent="完成绘制",$(e,"class","ghost")},m(r,s){Ce(r,e,s),t||(n=Xe(e,"click",i[17]),t=!0)},p:at,d(r){r&&Ae(e),t=!1,n()}}}function Mc(i){let e,t,n,r,s,a,o=i[58].name+"",l,c,h,u=Sn(i[58].geom).toFixed(1)+"",f,m,g,v;function p(){return i[30](i[58])}return{c(){e=D("label"),t=D("input"),r=J(),s=D("span"),a=J(),l=B(o),c=J(),h=D("span"),f=B(u),m=B(" km²"),$(t,"type","checkbox"),t.checked=n=i[7].has(i[58].id),$(s,"class","swatch svelte-1uhe70z"),Ht(s,"background",i[58].color),$(h,"class","muted"),$(e,"class","item svelte-1uhe70z")},m(d,M){Ce(d,e,M),_(e,t),_(e,r),_(e,s),_(e,a),_(e,l),_(e,c),_(e,h),_(h,f),_(h,m),g||(v=Xe(t,"change",p),g=!0)},p(d,M){i=d,M[0]&136&&n!==(n=i[7].has(i[58].id))&&(t.checked=n),M[0]&8&&Ht(s,"background",i[58].color),M[0]&8&&o!==(o=i[58].name+"")&&me(l,o),M[0]&8&&u!==(u=Sn(i[58].geom).toFixed(1)+"")&&me(f,u)},d(d){d&&Ae(e),g=!1,v()}}}function Ec(i){let e,t,n,r,s=i[55].name+"",a,o,l,c=i[55].points.length+"",h,u,f,m,g;function v(){return i[32](i[55])}return{c(){e=D("label"),t=D("input"),r=J(),a=B(s),o=J(),l=D("span"),h=B(c),u=B(" 点"),f=J(),$(t,"type","checkbox"),t.checked=n=i[7].has(i[55].id),$(l,"class","muted"),$(e,"class","item svelte-1uhe70z")},m(p,d){Ce(p,e,d),_(e,t),_(e,r),_(e,a),_(e,o),_(e,l),_(l,h),_(l,u),_(e,f),m||(g=Xe(t,"change",v),m=!0)},p(p,d){i=p,d[0]&144&&n!==(n=i[7].has(i[55].id))&&(t.checked=n),d[0]&16&&s!==(s=i[55].name+"")&&me(a,s),d[0]&16&&c!==(c=i[55].points.length+"")&&me(h,c)},d(p){p&&Ae(e),m=!1,g()}}}function yc(i){let e,t,n=i[52].name+"",r,s,a,o,l=i[52].x+"",c,h,u=i[52].y+"",f,m,g=i[52].township+"",v,p,d,M,S,y;function R(){return i[33](i[52])}return{c(){e=D("div"),t=B("📍 "),r=B(n),s=J(),a=D("span"),o=B("("),c=B(l),h=B(", "),f=B(u),m=B(") "),v=B(g),p=J(),d=D("button"),d.textContent="删",M=J(),$(a,"class","muted"),$(d,"class","danger mini svelte-1uhe70z"),$(e,"class","item svelte-1uhe70z")},m(A,T){Ce(A,e,T),_(e,t),_(e,r),_(e,s),_(e,a),_(a,o),_(a,c),_(a,h),_(a,f),_(a,m),_(a,v),_(e,p),_(e,d),_(e,M),S||(y=Xe(d,"click",R),S=!0)},p(A,T){i=A,T[0]&32&&n!==(n=i[52].name+"")&&me(r,n),T[0]&32&&l!==(l=i[52].x+"")&&me(c,l),T[0]&32&&u!==(u=i[52].y+"")&&me(f,u),T[0]&32&&g!==(g=i[52].township+"")&&me(v,g)},d(A){A&&Ae(e),S=!1,y()}}}function S0(i){let e,t,n,r,s,a,o,l,c,h,u,f,m,g,v,p,d,M,S,y,R,A,T,I,H,x,E,N,L,P,X,z=i[3].length+"",re,q,fe,Me,_e,Ne,Pe,Z,oe,de,ce,le,ge,he,ve,Te,F,Ke,De,ze=i[4].length+"",be,Je,se,C,b,k,j,ae=i[5].length+"",ne,Ue,xe,K,He,V=je([["pan","平移"],["line","画同音线"],["polygon","画分区路径"],["point","调查点"]]),Ee=[];for(let U=0;U<4;U+=1)Ee[U]=gc(_c(i,V,U));let Oe=i[2]==="polygon"&&vc(i),Be=i[2]==="line"&&xc(i),Se=i[6].length&&Sc(i),qe=je(i[3]),Ie=[];for(let U=0;U<qe.length;U+=1)Ie[U]=Mc(mc(i,qe,U));let Ye=je(i[4]),O=[];for(let U=0;U<Ye.length;U+=1)O[U]=Ec(pc(i,Ye,U));let ye=je(i[5]),Q=[];for(let U=0;U<ye.length;U+=1)Q[U]=yc(dc(i,ye,U));return{c(){e=D("div"),t=D("div");for(let U=0;U<4;U+=1)Ee[U].c();n=J(),r=D("span"),s=J(),a=D("button"),o=B("↩ 撤销"),c=J(),h=D("button"),u=B("↪ 重做"),m=J(),g=D("span"),v=J(),Oe&&Oe.c(),p=J(),Be&&Be.c(),d=J(),Se&&Se.c(),M=J(),S=D("div"),y=B(i[11]),R=J(),A=D("span"),A.textContent=`吸附阈值 ${oa}km · Ctrl+Z 撤销 / Ctrl+Shift+Z 重做`,T=J(),I=D("div"),H=D("div"),x=D("div"),E=J(),N=D("div"),L=D("div"),P=D("h4"),X=B("方言分区("),re=B(z),q=B(")"),fe=J();for(let U=0;U<Ie.length;U+=1)Ie[U].c();Me=J(),_e=D("div"),Ne=D("select"),Pe=D("option"),Pe.textContent="并集",Z=D("option"),Z.textContent="差集(首个−其余)",oe=D("option"),oe.textContent="交集",de=J(),ce=D("button"),ce.textContent="运算并合并",le=J(),ge=D("button"),he=B("删除选中"),Te=J(),F=D("div"),Ke=D("h4"),De=B("同音线("),be=B(ze),Je=B(")"),se=J();for(let U=0;U<O.length;U+=1)O[U].c();C=J(),b=D("div"),k=D("h4"),j=B("调查点("),ne=B(ae),Ue=B(")"),xe=J();for(let U=0;U<Q.length;U+=1)Q[U].c();$(r,"class","sep svelte-1uhe70z"),a.disabled=l=!i[12],h.disabled=f=!i[13],$(g,"class","sep svelte-1uhe70z"),$(t,"class","toolbar svelte-1uhe70z"),$(A,"class","muted"),$(S,"class","status svelte-1uhe70z"),$(x,"class","overlay svelte-1uhe70z"),Ht(x,"pointer-events",i[2]==="pan"?"none":"auto"),$(H,"class","viewport svelte-1uhe70z"),$(P,"class","svelte-1uhe70z"),Pe.__value="union",tt(Pe,Pe.__value),Z.__value="difference",tt(Z,Z.__value),oe.__value="intersect",tt(oe,oe.__value),$(Ne,"class","svelte-1uhe70z"),i[8]===void 0&&Mn(()=>i[31].call(Ne)),$(_e,"class","boolrow svelte-1uhe70z"),$(ge,"class","danger"),ge.disabled=ve=!i[7].size,$(L,"class","panel svelte-1uhe70z"),$(Ke,"class","svelte-1uhe70z"),$(F,"class","panel svelte-1uhe70z"),$(k,"class","svelte-1uhe70z"),$(b,"class","panel svelte-1uhe70z"),$(N,"class","side svelte-1uhe70z"),$(I,"class","body svelte-1uhe70z"),$(e,"class","workbench svelte-1uhe70z")},m(U,ue){Ce(U,e,ue),_(e,t);for(let Y=0;Y<4;Y+=1)Ee[Y]&&Ee[Y].m(t,null);_(t,n),_(t,r),_(t,s),_(t,a),_(a,o),_(t,c),_(t,h),_(h,u),_(t,m),_(t,g),_(t,v),Oe&&Oe.m(t,null),_(t,p),Be&&Be.m(t,null),_(t,d),Se&&Se.m(t,null),_(e,M),_(e,S),_(S,y),_(S,R),_(S,A),_(e,T),_(e,I),_(I,H),_(H,x),i[28](x),i[29](H),_(I,E),_(I,N),_(N,L),_(L,P),_(P,X),_(P,re),_(P,q),_(L,fe);for(let Y=0;Y<Ie.length;Y+=1)Ie[Y]&&Ie[Y].m(L,null);_(L,Me),_(L,_e),_(_e,Ne),_(Ne,Pe),_(Ne,Z),_(Ne,oe),Wt(Ne,i[8],!0),_(_e,de),_(_e,ce),_(L,le),_(L,ge),_(ge,he),_(N,Te),_(N,F),_(F,Ke),_(Ke,De),_(Ke,be),_(Ke,Je),_(F,se);for(let Y=0;Y<O.length;Y+=1)O[Y]&&O[Y].m(F,null);_(N,C),_(N,b),_(b,k),_(k,j),_(k,ne),_(k,Ue),_(b,xe);for(let Y=0;Y<Q.length;Y+=1)Q[Y]&&Q[Y].m(b,null);K||(He=[Xe(a,"click",i[14]),Xe(h,"click",i[15]),Xe(x,"pointerdown",i[18]),Xe(x,"pointermove",i[19]),Xe(x,"pointerup",i[20]),Xe(Ne,"change",i[31]),Xe(ce,"click",i[21]),Xe(ge,"click",i[22])],K=!0)},p(U,ue){if(ue[0]&65540){V=je([["pan","平移"],["line","画同音线"],["polygon","画分区路径"],["point","调查点"]]);let Y;for(Y=0;Y<4;Y+=1){const we=_c(U,V,Y);Ee[Y]?Ee[Y].p(we,ue):(Ee[Y]=gc(we),Ee[Y].c(),Ee[Y].m(t,n))}for(;Y<4;Y+=1)Ee[Y].d(1)}if(ue[0]&4096&&l!==(l=!U[12])&&(a.disabled=l),ue[0]&8192&&f!==(f=!U[13])&&(h.disabled=f),U[2]==="polygon"?Oe?Oe.p(U,ue):(Oe=vc(U),Oe.c(),Oe.m(t,p)):Oe&&(Oe.d(1),Oe=null),U[2]==="line"?Be?Be.p(U,ue):(Be=xc(U),Be.c(),Be.m(t,d)):Be&&(Be.d(1),Be=null),U[6].length?Se?Se.p(U,ue):(Se=Sc(U),Se.c(),Se.m(t,null)):Se&&(Se.d(1),Se=null),ue[0]&2048&&me(y,U[11]),ue[0]&4&&Ht(x,"pointer-events",U[2]==="pan"?"none":"auto"),ue[0]&8&&z!==(z=U[3].length+"")&&me(re,z),ue[0]&8388744){qe=je(U[3]);let Y;for(Y=0;Y<qe.length;Y+=1){const we=mc(U,qe,Y);Ie[Y]?Ie[Y].p(we,ue):(Ie[Y]=Mc(we),Ie[Y].c(),Ie[Y].m(L,Me))}for(;Y<Ie.length;Y+=1)Ie[Y].d(1);Ie.length=qe.length}if(ue[0]&256&&Wt(Ne,U[8]),ue[0]&128&&ve!==(ve=!U[7].size)&&(ge.disabled=ve),ue[0]&16&&ze!==(ze=U[4].length+"")&&me(be,ze),ue[0]&8388752){Ye=je(U[4]);let Y;for(Y=0;Y<Ye.length;Y+=1){const we=pc(U,Ye,Y);O[Y]?O[Y].p(we,ue):(O[Y]=Ec(we),O[Y].c(),O[Y].m(F,null))}for(;Y<O.length;Y+=1)O[Y].d(1);O.length=Ye.length}if(ue[0]&32&&ae!==(ae=U[5].length+"")&&me(ne,ae),ue[0]&16777248){ye=je(U[5]);let Y;for(Y=0;Y<ye.length;Y+=1){const we=dc(U,ye,Y);Q[Y]?Q[Y].p(we,ue):(Q[Y]=yc(we),Q[Y].c(),Q[Y].m(b,null))}for(;Y<Q.length;Y+=1)Q[Y].d(1);Q.length=ye.length}},i:at,o:at,d(U){U&&Ae(e),dt(Ee,U),Oe&&Oe.d(),Be&&Be.d(),Se&&Se.d(),i[28](null),i[29](null),dt(Ie,U),dt(O,U),dt(Q,U),K=!1,Tt(He)}}}const oa=2.5;function M0(i,e){let t=!1;for(let n=0,r=e.length-1;n<e.length;r=n++){const[s,a]=e[n],[o,l]=e[r];a>i[1]!=l>i[1]&&i[0]<(o-s)*(i[1]-a)/(l-a)+s&&(t=!t)}return t}function E0(i,e,t){const n=["#3498db","#e74c3c","#2ecc71","#9b59b6","#f39c12","#1abc9c","#e67e22","#95a5a6"];let r,s,a,o,l="pan",c=[],h=[],u=[],f=[],m=null,g=new Set,v="union",p="",d="",M="工具:平移(拖拽地图,滚轮缩放)",S=!1,y=!1,R=1,A=null;const T=Gg();let I=ur,H=I.map(se=>se.ring);function x(){return{zones:JSON.parse(JSON.stringify(c)),isoglosses:JSON.parse(JSON.stringify(h)),points:JSON.parse(JSON.stringify(u))}}function E(){T.push(x()),N()}function N(){t(12,S=T.canUndo()),t(13,y=T.canRedo())}function L(){a.draw({zones:c,isoglosses:h,points:u,draft:f,snapTarget:m}),P()}function P(){clearTimeout(A),A=setTimeout(()=>{Ui("workDraft",{zones:c,isoglosses:h,points:u,savedAt:Date.now()})},500)}function X(){const se=T.undo(x());se&&(t(3,{zones:c,isoglosses:h,points:u}=se,c,t(4,h),t(5,u)),N(),L())}function z(){const se=T.redo(x());se&&(t(3,{zones:c,isoglosses:h,points:u}=se,c,t(4,h),t(5,u)),N(),L())}function re(se){(se.ctrlKey||se.metaKey)&&se.key.toLowerCase()==="z"?(se.preventDefault(),se.shiftKey?z():X()):(se.ctrlKey||se.metaKey)&&se.key.toLowerCase()==="y"?(se.preventDefault(),z()):se.key==="Escape"?(t(6,f=[]),L()):se.key==="Enter"&&(l==="polygon"||l==="line")&&Me()}function q(se){t(2,l=se),t(6,f=[]),m=null,t(11,M={pan:"工具:平移(拖拽地图,滚轮缩放)",line:"工具:画同音线 — 单击加点,回车或双击完成,Esc 取消",polygon:"工具:画分区路径 — 单击加点,回车或双击完成,Esc 取消",point:"工具:调查点 — 单击空白放点(自动吸附乡镇界/网格),拖动已有点移动"}[se]),L()}function fe(se){const C=o.getBoundingClientRect();return s.screenToWorld(se.clientX-C.left,se.clientY-C.top)}function Me(){if(l==="polygon"&&f.length>=3){E();const se=[...f,f[0]],C=p.trim()||`分区${String(R).padStart(2,"0")}`;t(3,c=[...c,{id:R,name:C,color:n[(R-1)%n.length],geom:[[se]]}]),R++,t(9,p="")}else l==="line"&&f.length>=2&&(E(),t(4,h=[...h,{id:R++,name:d.trim()||`同音线${h.length+1}`,points:[...f]}]),t(10,d=""));t(6,f=[]),L()}let _e=null;function Ne(se,C,b){let k=null,j=b;for(const ae of u){const ne=Math.hypot(ae.x-se,ae.y-C);ne<j&&(j=ne,k=ae)}return k}function Pe(se){const[C,b]=fe(se);if(l==="point"){const k=Ne(C,b,6/s.view.k*2);k&&(E(),_e=k)}}function Z(se){const[C,b]=fe(se);if(l==="point"){const k=Kl([C,b],H,lo,oa);if(k.snapped){const j=[k.point[0],k.point[1]];j.kind=k.kind,m=j}else m=null;_e&&(_e.x=k.point[0],_e.y=k.point[1],t(5,u)),L()}}function oe(se){if(_e){_e=null,L();return}if(se.detail===2){Me();return}const[C,b]=fe(se);if(l==="polygon"||l==="line")t(6,f=[...f,[+C.toFixed(2),+b.toFixed(2)]]),L();else if(l==="point"){E();const k=Kl([C,b],H,lo,oa),[j,ae]=k.point,ne=I.find(Ue=>M0([j,ae],Ue.ring));t(5,u=[...u,{id:R++,name:`调查点${u.length+1}`,x:+j.toFixed(2),y:+ae.toFixed(2),township:ne?ne.name:""}]),m=null,L()}}function de(){const se=c.filter(j=>g.has(j.id));if(se.length<2){alert("请先在列表中勾选至少两个分区");return}E();let C;if(v==="union"?C=se.reduce((j,ae)=>Ju(j,ae.geom),[]):v==="intersect"?C=se.reduce((j,ae)=>x0(j,ae.geom),se[0].geom):C=se.reduce((j,ae)=>sa(j,ae.geom),se[0].geom),!C.length||Sn(C)<.01){alert("运算结果为空,未合并");return}const b=se[0],k={id:R++,name:`${b.name}(合并)`,color:b.color,geom:C};t(3,c=[...c.filter(j=>!g.has(j.id)),k]),t(7,g=new Set),L()}function ce(){g.size&&(E(),t(3,c=c.filter(se=>!g.has(se.id))),t(4,h=h.filter(se=>!g.has(se.id))),t(7,g=new Set),L())}function le(se){g.has(se)?g.delete(se):g.add(se),t(7,g)}function ge(se){E(),t(5,u=u.filter(C=>C.id!==se)),L()}Xn(async()=>{const se=await Gi("townships");se&&se.length&&(I=se,H=se.map(j=>j.ring)),s=Yu(r,I,()=>L()),a=$u(r,s);const C=await Gi("workDraft");C&&(t(3,{zones:c=[],isoglosses:h=[],points:u=[]}=C,c,t(4,h),t(5,u)),R=1+Math.max(0,...c.map(j=>j.id),...h.map(j=>j.id),...u.map(j=>j.id)));const b=()=>{s.render(),k=requestAnimationFrame(b)};let k=requestAnimationFrame(b);oo(()=>cancelAnimationFrame(k)),L(),window.addEventListener("keydown",re),oo(()=>window.removeEventListener("keydown",re))});const he=se=>q(se);function ve(){p=this.value,t(9,p)}function Te(){d=this.value,t(10,d)}function F(se){cr[se?"unshift":"push"](()=>{o=se,t(1,o)})}function Ke(se){cr[se?"unshift":"push"](()=>{r=se,t(0,r)})}const De=se=>le(se.id);function ze(){v=Ii(this),t(8,v)}return[r,o,l,c,h,u,f,g,v,p,d,M,S,y,X,z,q,Me,Pe,Z,oe,de,ce,le,ge,he,ve,Te,F,Ke,De,ze,se=>le(se.id),se=>ge(se.id)]}class y0 extends jn{constructor(e){super(),$n(this,e,E0,S0,wn,{},null,[-1,-1,-1])}}function bc(i,e,t=1.5){const n=uc((i||[]).map(d=>d.geom)),r=uc((e||[]).map(d=>d.geom)),s=sa(r,n),a=sa(n,r),o=Sn(n),l=Sn(s),c=Sn(a),h=l+c,u=o>0?h/o:h>0?1:0,f=[],m=new Map((i||[]).map(d=>[d.name,d]));for(const d of e||[]){const M=m.get(d.name);if(!M)continue;const S=hc(M.geom),y=hc(d.geom),R=Math.hypot(S[0]-y[0],S[1]-y[1]),A=Sn(M.geom),T=Sn(d.geom),I=A>0?Math.abs(T-A)/A:0;(R>t||I>.05)&&f.push({name:d.name,shift:+R.toFixed(2),areaChange:+(I*100).toFixed(1)})}const g=(e||[]).filter(d=>!m.has(d.name)).map(d=>d.name),v=new Set((e||[]).map(d=>d.name)),p=(i||[]).filter(d=>!v.has(d.name)).map(d=>d.name);return{added:s,removed:a,addedArea:+l.toFixed(2),removedArea:+c.toFixed(2),diffArea:+h.toFixed(2),diffRatio:+u.toFixed(4),diffPercent:+(u*100).toFixed(1),moved:f,addedZones:g,removedZones:p,needChangeNote:u>.05}}function Tc(i,e,t){const n=i.slice();return n[14]=e[t],n}function Ac(i,e,t){const n=i.slice();return n[17]=e[t],n}function wc(i,e,t){const n=i.slice();return n[17]=e[t],n}function Rc(i,e,t){const n=i.slice();return n[22]=e[t],n}function b0(i){let e,t,n=i[2]?`V${i[2].num}(${i[2].status==="archived"?"已归档":"待审"})`:"无(首个版本)",r,s,a,o=i[3]&&Cc(i);return{c(){e=D("p"),t=B("基准版本:"),r=B(n),s=J(),o&&o.c(),a=uu()},m(l,c){Ce(l,e,c),_(e,t),_(e,r),Ce(l,s,c),o&&o.m(l,c),Ce(l,a,c)},p(l,c){c&4&&n!==(n=l[2]?`V${l[2].num}(${l[2].status==="archived"?"已归档":"待审"})`:"无(首个版本)")&&me(r,n),l[3]?o?o.p(l,c):(o=Cc(l),o.c(),o.m(a.parentNode,a)):o&&(o.d(1),o=null)},d(l){l&&(Ae(e),Ae(s),Ae(a)),o&&o.d(l)}}}function T0(i){let e;return{c(){e=D("p"),e.textContent="加工台暂无工作稿。请先到「区划加工台」绘制分区。",$(e,"class","muted")},m(t,n){Ce(t,e,n)},p:at,d(t){t&&Ae(e)}}}function Cc(i){let e,t,n,r,s,a=i[3].addedArea+"",o,l,c,h,u=i[3].removedArea+"",f,m,g,v,p=i[3].diffArea+"",d,M,S,y,R=i[3].diffPercent+"",A,T,I=i[3].needChangeNote?" ⚠ 超过 5%":"",H,x,E,N,L,P,X,z,re,q,fe,Me,_e,Ne,Pe,Z,oe,de=i[3].moved.length&&Pc(i),ce=i[3].addedZones.length&&Dc(i),le=i[3].removedZones.length&&Uc(i),ge=i[3].needChangeNote&&Fc(),he=i[6]&&Oc(i);return{c(){e=D("table"),t=D("tr"),t.innerHTML="<th>新增面积</th><th>删除面积</th><th>差异总面积</th><th>差异占比</th>",n=J(),r=D("tr"),s=D("td"),o=B(a),l=B(" km²"),c=J(),h=D("td"),f=B(u),m=B(" km²"),g=J(),v=D("td"),d=B(p),M=B(" km²"),S=J(),y=D("td"),A=B(R),T=B("%"),H=B(I),x=J(),de&&de.c(),E=J(),ce&&ce.c(),N=J(),le&&le.c(),L=J(),P=D("p"),P.textContent="地图上:绿色=新增区域,红色=删除区域。",X=J(),z=D("label"),re=B("变更说明"),ge&&ge.c(),q=J(),fe=D("textarea"),Me=J(),_e=D("button"),_e.textContent="提交新版本(进入待审核)",Ne=J(),he&&he.c(),Pe=uu(),Ht(s,"color","#2ecc71"),Ht(h,"color","#e74c3c"),$(y,"class","svelte-epob96"),ln(y,"warn",i[3].needChangeNote),$(P,"class","muted"),$(fe,"rows","3"),$(fe,"placeholder","说明本轮边界调整的原因、依据的调查资料…"),$(fe,"class","svelte-epob96"),$(z,"class","note svelte-epob96")},m(ve,Te){Ce(ve,e,Te),_(e,t),_(e,n),_(e,r),_(r,s),_(s,o),_(s,l),_(r,c),_(r,h),_(h,f),_(h,m),_(r,g),_(r,v),_(v,d),_(v,M),_(r,S),_(r,y),_(y,A),_(y,T),_(y,H),Ce(ve,x,Te),de&&de.m(ve,Te),Ce(ve,E,Te),ce&&ce.m(ve,Te),Ce(ve,N,Te),le&&le.m(ve,Te),Ce(ve,L,Te),Ce(ve,P,Te),Ce(ve,X,Te),Ce(ve,z,Te),_(z,re),ge&&ge.m(z,null),_(z,q),_(z,fe),tt(fe,i[4]),Ce(ve,Me,Te),Ce(ve,_e,Te),Ce(ve,Ne,Te),he&&he.m(ve,Te),Ce(ve,Pe,Te),Z||(oe=[Xe(fe,"input",i[8]),Xe(_e,"click",i[7])],Z=!0)},p(ve,Te){Te&8&&a!==(a=ve[3].addedArea+"")&&me(o,a),Te&8&&u!==(u=ve[3].removedArea+"")&&me(f,u),Te&8&&p!==(p=ve[3].diffArea+"")&&me(d,p),Te&8&&R!==(R=ve[3].diffPercent+"")&&me(A,R),Te&8&&I!==(I=ve[3].needChangeNote?" ⚠ 超过 5%":"")&&me(H,I),Te&8&&ln(y,"warn",ve[3].needChangeNote),ve[3].moved.length?de?de.p(ve,Te):(de=Pc(ve),de.c(),de.m(E.parentNode,E)):de&&(de.d(1),de=null),ve[3].addedZones.length?ce?ce.p(ve,Te):(ce=Dc(ve),ce.c(),ce.m(N.parentNode,N)):ce&&(ce.d(1),ce=null),ve[3].removedZones.length?le?le.p(ve,Te):(le=Uc(ve),le.c(),le.m(L.parentNode,L)):le&&(le.d(1),le=null),ve[3].needChangeNote?ge||(ge=Fc(),ge.c(),ge.m(z,q)):ge&&(ge.d(1),ge=null),Te&16&&tt(fe,ve[4]),ve[6]?he?he.p(ve,Te):(he=Oc(ve),he.c(),he.m(Pe.parentNode,Pe)):he&&(he.d(1),he=null)},d(ve){ve&&(Ae(e),Ae(x),Ae(E),Ae(N),Ae(L),Ae(P),Ae(X),Ae(z),Ae(Me),Ae(_e),Ae(Ne),Ae(Pe)),de&&de.d(ve),ce&&ce.d(ve),le&&le.d(ve),ge&&ge.d(),he&&he.d(ve),Z=!1,Tt(oe)}}}function Pc(i){let e,t,n=je(i[3].moved),r=[];for(let s=0;s<n.length;s+=1)r[s]=Lc(Rc(i,n,s));return{c(){e=D("p"),t=B("移动边界:");for(let s=0;s<r.length;s+=1)r[s].c()},m(s,a){Ce(s,e,a),_(e,t);for(let o=0;o<r.length;o+=1)r[o]&&r[o].m(e,null)},p(s,a){if(a&8){n=je(s[3].moved);let o;for(o=0;o<n.length;o+=1){const l=Rc(s,n,o);r[o]?r[o].p(l,a):(r[o]=Lc(l),r[o].c(),r[o].m(e,null))}for(;o<r.length;o+=1)r[o].d(1);r.length=n.length}},d(s){s&&Ae(e),dt(r,s)}}}function Lc(i){let e,t=i[22].name+"",n,r,s=i[22].shift+"",a,o,l=i[22].areaChange+"",c,h;return{c(){e=D("span"),n=B(t),r=B(" 位移 "),a=B(s),o=B("km / 面积变化 "),c=B(l),h=B("%"),$(e,"class","tag moved svelte-epob96")},m(u,f){Ce(u,e,f),_(e,n),_(e,r),_(e,a),_(e,o),_(e,c),_(e,h)},p(u,f){f&8&&t!==(t=u[22].name+"")&&me(n,t),f&8&&s!==(s=u[22].shift+"")&&me(a,s),f&8&&l!==(l=u[22].areaChange+"")&&me(c,l)},d(u){u&&Ae(e)}}}function Dc(i){let e,t,n=je(i[3].addedZones),r=[];for(let s=0;s<n.length;s+=1)r[s]=Ic(wc(i,n,s));return{c(){e=D("p"),t=B("新增分区:");for(let s=0;s<r.length;s+=1)r[s].c()},m(s,a){Ce(s,e,a),_(e,t);for(let o=0;o<r.length;o+=1)r[o]&&r[o].m(e,null)},p(s,a){if(a&8){n=je(s[3].addedZones);let o;for(o=0;o<n.length;o+=1){const l=wc(s,n,o);r[o]?r[o].p(l,a):(r[o]=Ic(l),r[o].c(),r[o].m(e,null))}for(;o<r.length;o+=1)r[o].d(1);r.length=n.length}},d(s){s&&Ae(e),dt(r,s)}}}function Ic(i){let e,t=i[17]+"",n;return{c(){e=D("span"),n=B(t),$(e,"class","tag added svelte-epob96")},m(r,s){Ce(r,e,s),_(e,n)},p(r,s){s&8&&t!==(t=r[17]+"")&&me(n,t)},d(r){r&&Ae(e)}}}function Uc(i){let e,t,n=je(i[3].removedZones),r=[];for(let s=0;s<n.length;s+=1)r[s]=Nc(Ac(i,n,s));return{c(){e=D("p"),t=B("删除分区:");for(let s=0;s<r.length;s+=1)r[s].c()},m(s,a){Ce(s,e,a),_(e,t);for(let o=0;o<r.length;o+=1)r[o]&&r[o].m(e,null)},p(s,a){if(a&8){n=je(s[3].removedZones);let o;for(o=0;o<n.length;o+=1){const l=Ac(s,n,o);r[o]?r[o].p(l,a):(r[o]=Nc(l),r[o].c(),r[o].m(e,null))}for(;o<r.length;o+=1)r[o].d(1);r.length=n.length}},d(s){s&&Ae(e),dt(r,s)}}}function Nc(i){let e,t=i[17]+"",n;return{c(){e=D("span"),n=B(t),$(e,"class","tag removed svelte-epob96")},m(r,s){Ce(r,e,s),_(e,n)},p(r,s){s&8&&t!==(t=r[17]+"")&&me(n,t)},d(r){r&&Ae(e)}}}function Fc(i){let e;return{c(){e=D("b"),e.textContent="(差异超 5%,必填)",Ht(e,"color","#e74c3c")},m(t,n){Ce(t,e,n)},d(t){t&&Ae(e)}}}function Oc(i){let e,t;return{c(){e=D("p"),t=B(i[6]),Ht(e,"color","#2ecc71")},m(n,r){Ce(n,e,r),_(e,t)},p(n,r){r&64&&me(t,n[6])},d(n){n&&Ae(e)}}}function Bc(i){let e,t,n,r=i[14].num+"",s,a,o,l=new Date(i[14].createdAt).toLocaleString()+"",c,h,u,f={draft:"草稿",pending:"待审核",archived:"已归档",rejected:"已驳回"}[i[14].status]+"",m,g,v,p=i[14].diff?i[14].diff.diffPercent+"%":"—",d,M,S,y=(i[14].changeNote||"—")+"",R,A;return{c(){e=D("tr"),t=D("td"),n=B("V"),s=B(r),a=J(),o=D("td"),c=B(l),h=J(),u=D("td"),m=B(f),g=J(),v=D("td"),d=B(p),M=J(),S=D("td"),R=B(y),A=J(),$(S,"class","muted")},m(T,I){Ce(T,e,I),_(e,t),_(t,n),_(t,s),_(e,a),_(e,o),_(o,c),_(e,h),_(e,u),_(u,m),_(e,g),_(e,v),_(v,d),_(e,M),_(e,S),_(S,R),_(e,A)},p(T,I){I&32&&r!==(r=T[14].num+"")&&me(s,r),I&32&&l!==(l=new Date(T[14].createdAt).toLocaleString()+"")&&me(c,l),I&32&&f!==(f={draft:"草稿",pending:"待审核",archived:"已归档",rejected:"已驳回"}[T[14].status]+"")&&me(m,f),I&32&&p!==(p=T[14].diff?T[14].diff.diffPercent+"%":"—")&&me(d,p),I&32&&y!==(y=(T[14].changeNote||"—")+"")&&me(R,y)},d(T){T&&Ae(e)}}}function A0(i){let e,t,n,r,s,a,o,l,c,h,u,f,m,g,v;function p(R,A){return R[1]?b0:T0}let d=p(i),M=d(i),S=je(i[5]),y=[];for(let R=0;R<S.length;R+=1)y[R]=Bc(Tc(i,S,R));return{c(){e=D("div"),t=D("div"),n=D("div"),r=D("h3"),r.textContent="提交新版本 — 与上一轮分区比对",s=J(),M.c(),a=J(),o=D("div"),l=D("h3"),l.textContent="历史版本",c=J(),h=D("table"),u=D("thead"),u.innerHTML="<tr><th>版本</th><th>提交时间</th><th>状态</th><th>差异占比</th><th>变更说明</th></tr>",f=J(),m=D("tbody");for(let R=0;R<y.length;R+=1)y[R].c();g=J(),v=D("div"),$(r,"class","svelte-epob96"),$(n,"class","card"),$(l,"class","svelte-epob96"),$(o,"class","card"),$(t,"class","left svelte-epob96"),$(v,"class","map svelte-epob96"),$(e,"class","layout svelte-epob96")},m(R,A){Ce(R,e,A),_(e,t),_(t,n),_(n,r),_(n,s),M.m(n,null),_(t,a),_(t,o),_(o,l),_(o,c),_(o,h),_(h,u),_(h,f),_(h,m);for(let T=0;T<y.length;T+=1)y[T]&&y[T].m(m,null);_(e,g),_(e,v),i[9](v)},p(R,[A]){if(d===(d=p(R))&&M?M.p(R,A):(M.d(1),M=d(R),M&&(M.c(),M.m(n,null))),A&32){S=je(R[5]);let T;for(T=0;T<S.length;T+=1){const I=Tc(R,S,T);y[T]?y[T].p(I,A):(y[T]=Bc(I),y[T].c(),y[T].m(m,null))}for(;T<y.length;T+=1)y[T].d(1);y.length=S.length}},i:at,o:at,d(R){R&&Ae(e),M.d(),dt(y,R),i[9](null)}}}function w0(i,e,t){let n,r,s,a=null,o=null,l=null,c="",h=[],u="";async function f(){t(5,h=(await Yt("versions")).sort((d,M)=>M.num-d.num)),t(2,o=h.find(d=>d.status==="archived")||h[0]||null),t(1,a=await Gi("workDraft")),a&&o?t(3,l=bc(o.zones,a.zones)):a?t(3,l=bc([],a.zones)):t(3,l=null),m()}function m(){s&&s.draw({zones:a?a.zones:[],isoglosses:a?a.isoglosses:[],points:a?a.points:[],diff:l})}async function g(){if(!a||!a.zones.length){alert("加工台还没有分区工作稿,请先在加工台绘制");return}if(l&&l.needChangeNote&&!c.trim()){alert(`差异面积 ${l.diffPercent}% 超过 5%,必须填写变更说明`);return}const d=(h.length?Math.max(...h.map(M=>M.num)):0)+1;await dr("versions",{num:d,createdAt:Date.now(),year:new Date().getFullYear(),status:"pending",zones:a.zones,isoglosses:a.isoglosses,points:a.points,baseVersion:o?o.num:null,diff:l,changeNote:c.trim()}),t(6,u=`已提交版本 V${d},等待审核`),t(4,c=""),await f()}Xn(async()=>{const d=await Gi("townships");r=Yu(n,d&&d.length?d:ur,()=>m()),s=$u(n,r);const M=()=>{r.render(),S=requestAnimationFrame(M)};let S=requestAnimationFrame(M);oo(()=>cancelAnimationFrame(S)),await f()});function v(){c=this.value,t(4,c)}function p(d){cr[d?"unshift":"push"](()=>{n=d,t(0,n)})}return[n,a,o,l,c,h,u,g,v,p]}class R0 extends jn{constructor(e){super(),$n(this,e,w0,A0,wn,{})}}function zc(i,e,t){const n=i.slice();return n[12]=e[t],n}function kc(i,e,t){const n=i.slice();return n[15]=e[t],n}function Hc(i,e,t){const n=i.slice();return n[18]=e[t],n}function Gc(i){let e;return{c(){e=D("p"),e.textContent="暂无待审核版本,请在「版本比对」页提交。",$(e,"class","muted")},m(t,n){Ce(t,e,n)},d(t){t&&Ae(e)}}}function Vc(i){let e,t,n,r=i[18].num+"",s,a,o,l=new Date(i[18].createdAt).toLocaleString()+"",c,h,u=i[18].zones.length+"",f,m,g=i[18].diff?i[18].diff.diffPercent+"%":"—",v,p,d,M,S=(i[18].changeNote||"无")+"",y,R,A,T,I,H,x,E,N,L,P;function X(){return i[6](i[18])}function z(){return i[7](i[18])}function re(){return i[8](i[18])}return{c(){e=D("div"),t=D("b"),n=B("V"),s=B(r),a=J(),o=D("span"),c=B(l),h=B(" · 分区 "),f=B(u),m=B(" 个 · 差异 "),v=B(g),p=J(),d=D("span"),M=B("变更说明:"),y=B(S),R=J(),A=D("div"),T=D("button"),T.textContent="预览成果报告",I=J(),H=D("button"),H.textContent="✔ 审核通过并归档",x=J(),E=D("button"),E.textContent="✘ 驳回",N=J(),$(o,"class","muted"),$(d,"class","muted"),$(E,"class","danger"),$(e,"class","ver svelte-y07fur")},m(q,fe){Ce(q,e,fe),_(e,t),_(t,n),_(t,s),_(e,a),_(e,o),_(o,c),_(o,h),_(o,f),_(o,m),_(o,v),_(e,p),_(e,d),_(d,M),_(d,y),_(e,R),_(e,A),_(A,T),_(A,I),_(A,H),_(A,x),_(A,E),_(e,N),L||(P=[Xe(T,"click",X),Xe(H,"click",z),Xe(E,"click",re)],L=!0)},p(q,fe){i=q,fe&1&&r!==(r=i[18].num+"")&&me(s,r),fe&1&&l!==(l=new Date(i[18].createdAt).toLocaleString()+"")&&me(c,l),fe&1&&u!==(u=i[18].zones.length+"")&&me(f,u),fe&1&&g!==(g=i[18].diff?i[18].diff.diffPercent+"%":"—")&&me(v,g),fe&1&&S!==(S=(i[18].changeNote||"无")+"")&&me(y,S)},d(q){q&&Ae(e),L=!1,Tt(P)}}}function Wc(i){let e,t,n=i[2].title+"",r,s,a,o,l=i[2].date+"",c,h,u,f,m=i[2].zoneCount+"",g,v,p,d,M,S,y,R,A,T,I,H=i[2].informantCount+"",x,E,N=i[2].totalPhoneme+"",L,P,X=i[2].totalRec+"",z,re,q=i[2].isoglossCount+"",fe,Me,_e=i[2].pointCount+"",Ne,Pe,Z,oe,de,ce,le,ge,he,ve,Te=je(i[2].zones),F=[];for(let De=0;De<Te.length;De+=1)F[De]=Xc(kc(i,Te,De));let Ke=i[2].diff&&qc(i);return{c(){e=D("div"),t=D("h2"),r=B(n),s=J(),a=D("p"),o=B("生成时间:"),c=B(l),h=J(),u=D("h4"),f=B("一、方言分区("),g=B(m),v=B(" 个)"),p=J(),d=D("table"),M=D("tr"),M.innerHTML='<th class="svelte-y07fur">分区名称</th><th class="svelte-y07fur">面积(km²)</th>',S=J();for(let De=0;De<F.length;De+=1)F[De].c();y=J(),R=D("h4"),R.textContent="二、调查规模",A=J(),T=D("p"),I=B("发音人 "),x=B(H),E=B(" 人;音系条目累计 "),L=B(N),P=B(" 条;录音条目 "),z=B(X),re=B(" 条;同音线 "),fe=B(q),Me=B(" 条;调查点 "),Ne=B(_e),Pe=B(" 个。"),Z=J(),Ke&&Ke.c(),oe=J(),de=D("div"),ce=D("button"),ce.textContent="打印 / 导出 PDF",le=J(),ge=D("button"),ge.textContent="关闭预览",$(t,"class","svelte-y07fur"),$(a,"class","muted svelte-y07fur"),$(u,"class","svelte-y07fur"),$(d,"class","svelte-y07fur"),$(R,"class","svelte-y07fur"),$(ge,"class","ghost"),$(de,"class","noprint svelte-y07fur"),$(e,"class","card report svelte-y07fur"),$(e,"id","report")},m(De,ze){Ce(De,e,ze),_(e,t),_(t,r),_(e,s),_(e,a),_(a,o),_(a,c),_(e,h),_(e,u),_(u,f),_(u,g),_(u,v),_(e,p),_(e,d),_(d,M),_(d,S);for(let be=0;be<F.length;be+=1)F[be]&&F[be].m(d,null);_(e,y),_(e,R),_(e,A),_(e,T),_(T,I),_(T,x),_(T,E),_(T,L),_(T,P),_(T,z),_(T,re),_(T,fe),_(T,Me),_(T,Ne),_(T,Pe),_(e,Z),Ke&&Ke.m(e,null),_(e,oe),_(e,de),_(de,ce),_(de,le),_(de,ge),he||(ve=[Xe(ce,"click",P0),Xe(ge,"click",i[9])],he=!0)},p(De,ze){if(ze&4&&n!==(n=De[2].title+"")&&me(r,n),ze&4&&l!==(l=De[2].date+"")&&me(c,l),ze&4&&m!==(m=De[2].zoneCount+"")&&me(g,m),ze&4){Te=je(De[2].zones);let be;for(be=0;be<Te.length;be+=1){const Je=kc(De,Te,be);F[be]?F[be].p(Je,ze):(F[be]=Xc(Je),F[be].c(),F[be].m(d,null))}for(;be<F.length;be+=1)F[be].d(1);F.length=Te.length}ze&4&&H!==(H=De[2].informantCount+"")&&me(x,H),ze&4&&N!==(N=De[2].totalPhoneme+"")&&me(L,N),ze&4&&X!==(X=De[2].totalRec+"")&&me(z,X),ze&4&&q!==(q=De[2].isoglossCount+"")&&me(fe,q),ze&4&&_e!==(_e=De[2].pointCount+"")&&me(Ne,_e),De[2].diff?Ke?Ke.p(De,ze):(Ke=qc(De),Ke.c(),Ke.m(e,oe)):Ke&&(Ke.d(1),Ke=null)},d(De){De&&Ae(e),dt(F,De),Ke&&Ke.d(),he=!1,Tt(ve)}}}function Xc(i){let e,t,n=i[15].name+"",r,s,a=i[15].area+"",o;return{c(){e=D("tr"),t=D("td"),r=B(n),s=D("td"),o=B(a),$(t,"class","svelte-y07fur"),$(s,"class","svelte-y07fur")},m(l,c){Ce(l,e,c),_(e,t),_(t,r),_(e,s),_(s,o)},p(l,c){c&4&&n!==(n=l[15].name+"")&&me(r,n),c&4&&a!==(a=l[15].area+"")&&me(o,a)},d(l){l&&Ae(e)}}}function qc(i){let e,t,n,r,s=i[2].diff.addedArea+"",a,o,l=i[2].diff.removedArea+"",c,h,u=i[2].diff.diffPercent+"",f,m,g,v,p,d,M=(i[2].changeNote||"无")+"",S,y=i[2].diff.moved.length&&Yc(i);return{c(){e=D("h4"),e.textContent="三、本轮区划变更",t=J(),n=D("p"),r=B("新增 "),a=B(s),o=B(" km²,删除 "),c=B(l),h=B(" km²,差异占比 "),f=B(u),m=B("%。"),g=J(),y&&y.c(),v=J(),p=D("p"),d=B("变更说明:"),S=B(M),$(e,"class","svelte-y07fur")},m(R,A){Ce(R,e,A),Ce(R,t,A),Ce(R,n,A),_(n,r),_(n,a),_(n,o),_(n,c),_(n,h),_(n,f),_(n,m),Ce(R,g,A),y&&y.m(R,A),Ce(R,v,A),Ce(R,p,A),_(p,d),_(p,S)},p(R,A){A&4&&s!==(s=R[2].diff.addedArea+"")&&me(a,s),A&4&&l!==(l=R[2].diff.removedArea+"")&&me(c,l),A&4&&u!==(u=R[2].diff.diffPercent+"")&&me(f,u),R[2].diff.moved.length?y?y.p(R,A):(y=Yc(R),y.c(),y.m(v.parentNode,v)):y&&(y.d(1),y=null),A&4&&M!==(M=(R[2].changeNote||"无")+"")&&me(S,M)},d(R){R&&(Ae(e),Ae(t),Ae(n),Ae(g),Ae(v),Ae(p)),y&&y.d(R)}}}function Yc(i){let e,t,n=i[2].diff.moved.map(jc).join("、")+"",r;return{c(){e=D("p"),t=B("移动边界:"),r=B(n)},m(s,a){Ce(s,e,a),_(e,t),_(e,r)},p(s,a){a&4&&n!==(n=s[2].diff.moved.map(jc).join("、")+"")&&me(r,n)},d(s){s&&Ae(e)}}}function $c(i){let e,t,n=i[12].title+"",r,s,a,o=i[12].versionNum+"",l,c,h,u=new Date(i[12].createdAt).toLocaleString()+"",f,m,g,v=i[12].zoneCount+"",p,d,M=i[12].informantCount+"",S,y;return{c(){e=D("tr"),t=D("td"),r=B(n),s=D("td"),a=B("V"),l=B(o),c=J(),h=D("td"),f=B(u),m=J(),g=D("td"),p=B(v),d=D("td"),S=B(M),y=J()},m(R,A){Ce(R,e,A),_(e,t),_(t,r),_(e,s),_(s,a),_(s,l),_(e,c),_(e,h),_(h,f),_(e,m),_(e,g),_(g,p),_(e,d),_(d,S),_(e,y)},p(R,A){A&2&&n!==(n=R[12].title+"")&&me(r,n),A&2&&o!==(o=R[12].versionNum+"")&&me(l,o),A&2&&u!==(u=new Date(R[12].createdAt).toLocaleString()+"")&&me(f,u),A&2&&v!==(v=R[12].zoneCount+"")&&me(p,v),A&2&&M!==(M=R[12].informantCount+"")&&me(S,M)},d(R){R&&Ae(e)}}}function C0(i){let e,t,n,r=i[0].length+"",s,a,o,l,c,h,u,f,m,g=i[1].length+"",v,p,d,M,S,y,R,A=!i[0].length&&Gc(),T=je(i[0]),I=[];for(let N=0;N<T.length;N+=1)I[N]=Vc(Hc(i,T,N));let H=i[2]&&Wc(i),x=je(i[1]),E=[];for(let N=0;N<x.length;N+=1)E[N]=$c(zc(i,x,N));return{c(){e=D("div"),t=D("h3"),n=B("待审核版本("),s=B(r),a=B(")"),o=J(),A&&A.c(),l=J();for(let N=0;N<I.length;N+=1)I[N].c();c=J(),H&&H.c(),h=J(),u=D("div"),f=D("h3"),m=B("已归档成果报告("),v=B(g),p=B(")"),d=J(),M=D("table"),S=D("thead"),S.innerHTML="<tr><th>报告</th><th>对应版本</th><th>归档时间</th><th>分区数</th><th>发音人</th></tr>",y=J(),R=D("tbody");for(let N=0;N<E.length;N+=1)E[N].c();$(t,"class","svelte-y07fur"),$(e,"class","card"),$(f,"class","svelte-y07fur"),$(u,"class","card")},m(N,L){Ce(N,e,L),_(e,t),_(t,n),_(t,s),_(t,a),_(e,o),A&&A.m(e,null),_(e,l);for(let P=0;P<I.length;P+=1)I[P]&&I[P].m(e,null);Ce(N,c,L),H&&H.m(N,L),Ce(N,h,L),Ce(N,u,L),_(u,f),_(f,m),_(f,v),_(f,p),_(u,d),_(u,M),_(M,S),_(M,y),_(M,R);for(let P=0;P<E.length;P+=1)E[P]&&E[P].m(R,null)},p(N,[L]){if(L&1&&r!==(r=N[0].length+"")&&me(s,r),N[0].length?A&&(A.d(1),A=null):A||(A=Gc(),A.c(),A.m(e,l)),L&61){T=je(N[0]);let P;for(P=0;P<T.length;P+=1){const X=Hc(N,T,P);I[P]?I[P].p(X,L):(I[P]=Vc(X),I[P].c(),I[P].m(e,null))}for(;P<I.length;P+=1)I[P].d(1);I.length=T.length}if(N[2]?H?H.p(N,L):(H=Wc(N),H.c(),H.m(h.parentNode,h)):H&&(H.d(1),H=null),L&2&&g!==(g=N[1].length+"")&&me(v,g),L&2){x=je(N[1]);let P;for(P=0;P<x.length;P+=1){const X=zc(N,x,P);E[P]?E[P].p(X,L):(E[P]=$c(X),E[P].c(),E[P].m(R,null))}for(;P<E.length;P+=1)E[P].d(1);E.length=x.length}},i:at,o:at,d(N){N&&(Ae(e),Ae(c),Ae(h),Ae(u)),A&&A.d(),dt(I,N),H&&H.d(N),dt(E,N)}}}function P0(){window.print()}const jc=i=>`${i.name}(位移 ${i.shift}km)`;function L0(i,e,t){let n=[],r=[],s=[],a=null;async function o(){const v=await Yt("versions");t(0,n=v.filter(p=>p.status==="pending").sort((p,d)=>d.num-p.num)),t(1,r=(await Yt("reports")).sort((p,d)=>d.id-p.id)),s=await Yt("informants")}Xn(o);function l(v){const p=v.year,d=s.filter(y=>!p||y.year<=p),M=d.reduce((y,R)=>y+(R.phonemeCount||0),0),S=d.reduce((y,R)=>y+(R.recordings||[]).length,0);return{title:`方言区划调查成果报告(V${v.num})`,date:new Date().toLocaleString(),zoneCount:v.zones.length,zones:v.zones.map(y=>({name:y.name,area:+Sn(y.geom).toFixed(1)})),isoglossCount:(v.isoglosses||[]).length,pointCount:(v.points||[]).length,informantCount:d.length,totalPhoneme:M,totalRec:S,diff:v.diff,changeNote:v.changeNote}}async function c(v){const p=l(v);await ts("versions",{...v,status:"archived",reviewedAt:Date.now()}),await dr("reports",{versionNum:v.num,createdAt:Date.now(),...p}),t(2,a=null),await o(),alert(`V${v.num} 审核通过,成果报告已生成并归档`)}async function h(v){const p=prompt("驳回原因:");p!==null&&(await ts("versions",{...v,status:"rejected",rejectReason:p}),await o())}return[n,r,a,l,c,h,v=>t(2,a=l(v)),v=>c(v),v=>h(v),()=>t(2,a=null)]}class D0 extends jn{constructor(e){super(),$n(this,e,L0,C0,wn,{})}}function Kc(i,e,t){const n=i.slice();return n[17]=e[t],n}function Zc(i,e,t){const n=i.slice();return n[20]=e[t],n}function Jc(i,e,t){const n=i.slice();return n[23]=e[t],n}function I0(i,e,t){const n=i.slice();return n[26]=e[t],n}function U0(i,e,t){const n=i.slice();return n[29]=e[t],n}function Qc(i,e,t){const n=i.slice();return n[32]=e[t],n}function eu(i){let e,t=i[32]+"",n,r;return{c(){e=D("option"),n=B(t),e.__value=r=i[32],tt(e,e.__value)},m(s,a){Ce(s,e,a),_(e,n)},p(s,a){a[0]&16&&t!==(t=s[32]+"")&&me(n,t),a[0]&16&&r!==(r=s[32])&&(e.__value=r,tt(e,e.__value))},d(s){s&&Ae(e)}}}function N0(i){let e;return{c(){e=D("option"),e.textContent=`${i[29]}`,e.__value=i[29],tt(e,e.__value)},m(t,n){Ce(t,e,n)},p:at,d(t){t&&Ae(e)}}}function F0(i){let e;return{c(){e=D("option"),e.textContent=`${i[26]}`,e.__value=i[26],tt(e,e.__value)},m(t,n){Ce(t,e,n)},p:at,d(t){t&&Ae(e)}}}function tu(i){let e,t=i[23]+"",n,r;return{c(){e=D("option"),n=B(t),e.__value=r=i[23],tt(e,e.__value)},m(s,a){Ce(s,e,a),_(e,n)},p(s,a){a[0]&128&&t!==(t=s[23]+"")&&me(n,t),a[0]&128&&r!==(r=s[23])&&(e.__value=r,tt(e,e.__value))},d(s){s&&Ae(e)}}}function nu(i){let e,t,n=i[20].code+"",r,s,a=i[20].name+"",o,l,c=i[20].age+"",h,u,f=i[20].township+"",m,g,v,p=i[20].phonemeCount+"",d,M,S=(i[20].recordings||[]).length+"",y,R,A=i[20].year+"",T,I,H,x=(i[20].features||[]).join("、")+"",E,N;return{c(){e=D("tr"),t=D("td"),r=B(n),s=D("td"),o=B(a),l=D("td"),h=B(c),u=D("td"),m=B(f),g=J(),v=D("td"),d=B(p),M=D("td"),y=B(S),R=D("td"),T=B(A),I=J(),H=D("td"),E=B(x),N=J(),$(H,"class","muted")},m(L,P){Ce(L,e,P),_(e,t),_(t,r),_(e,s),_(s,o),_(e,l),_(l,h),_(e,u),_(u,m),_(e,g),_(e,v),_(v,d),_(e,M),_(M,y),_(e,R),_(R,T),_(e,I),_(e,H),_(H,E),_(e,N)},p(L,P){P[0]&64&&n!==(n=L[20].code+"")&&me(r,n),P[0]&64&&a!==(a=L[20].name+"")&&me(o,a),P[0]&64&&c!==(c=L[20].age+"")&&me(h,c),P[0]&64&&f!==(f=L[20].township+"")&&me(m,f),P[0]&64&&p!==(p=L[20].phonemeCount+"")&&me(d,p),P[0]&64&&S!==(S=(L[20].recordings||[]).length+"")&&me(y,S),P[0]&64&&A!==(A=L[20].year+"")&&me(T,A),P[0]&64&&x!==(x=(L[20].features||[]).join("、")+"")&&me(E,x)},d(L){L&&Ae(e)}}}function iu(i){let e,t,n=i[17].title+"",r,s,a,o=i[17].versionNum+"",l,c,h,u=new Date(i[17].createdAt).toLocaleString()+"",f,m,g,v=(i[17].zones||[]).map(ru).join("、")+"",p,d;return{c(){e=D("tr"),t=D("td"),r=B(n),s=D("td"),a=B("V"),l=B(o),c=J(),h=D("td"),f=B(u),m=J(),g=D("td"),p=B(v),d=J(),$(g,"class","muted")},m(M,S){Ce(M,e,S),_(e,t),_(t,r),_(e,s),_(s,a),_(s,l),_(e,c),_(e,h),_(h,f),_(e,m),_(e,g),_(g,p),_(e,d)},p(M,S){S[0]&32&&n!==(n=M[17].title+"")&&me(r,n),S[0]&32&&o!==(o=M[17].versionNum+"")&&me(l,o),S[0]&32&&u!==(u=new Date(M[17].createdAt).toLocaleString()+"")&&me(f,u),S[0]&32&&v!==(v=(M[17].zones||[]).map(ru).join("、")+"")&&me(p,v)},d(M){M&&Ae(e)}}}function O0(i){let e,t,n,r,s,a,o,l,c,h,u,f,m,g,v,p,d,M,S,y,R,A,T,I,H,x,E,N,L,P=i[6].length+"",X,z,re,q,fe,Me,_e,Ne,Pe,Z,oe,de=i[5].length+"",ce,le,ge,he,ve,Te,F,Ke,De,ze=je(i[4]),be=[];for(let K=0;K<ze.length;K+=1)be[K]=eu(Qc(i,ze,K));let Je=je(ns),se=[];for(let K=0;K<Je.length;K+=1)se[K]=N0(U0(i,Je,K));let C=je(co),b=[];for(let K=0;K<C.length;K+=1)b[K]=F0(I0(i,C,K));let k=je(i[7]),j=[];for(let K=0;K<k.length;K+=1)j[K]=tu(Jc(i,k,K));let ae=je(i[6]),ne=[];for(let K=0;K<ae.length;K+=1)ne[K]=nu(Zc(i,ae,K));let Ue=je(i[5]),xe=[];for(let K=0;K<Ue.length;K+=1)xe[K]=iu(Kc(i,Ue,K));return{c(){e=D("div"),t=D("h3"),t.textContent="组合检索",n=J(),r=D("div"),s=D("label"),a=B(`方言区
      `),o=D("select"),l=D("option"),l.textContent="全部";for(let K=0;K<be.length;K+=1)be[K].c();c=J(),h=D("label"),u=B(`乡镇
      `),f=D("select"),m=D("option"),m.textContent="全部";for(let K=0;K<se.length;K+=1)se[K].c();g=J(),v=D("label"),p=B(`音系特征
      `),d=D("select"),M=D("option"),M.textContent="全部";for(let K=0;K<b.length;K+=1)b[K].c();S=J(),y=D("label"),R=B(`年份
      `),A=D("select"),T=D("option"),T.textContent="全部";for(let K=0;K<j.length;K+=1)j[K].c();I=J(),H=D("button"),H.textContent="清空条件",x=J(),E=D("div"),N=D("h3"),L=B("发音人结果("),X=B(P),z=B(")"),re=J(),q=D("table"),fe=D("thead"),fe.innerHTML="<tr><th>编号</th><th>姓名</th><th>年龄</th><th>乡镇</th><th>音系条目</th><th>录音条目</th><th>年份</th><th>特征</th></tr>",Me=J(),_e=D("tbody");for(let K=0;K<ne.length;K+=1)ne[K].c();Ne=J(),Pe=D("div"),Z=D("h3"),oe=B("归档报告结果("),ce=B(de),le=B(")"),ge=J(),he=D("table"),ve=D("thead"),ve.innerHTML="<tr><th>报告</th><th>版本</th><th>归档时间</th><th>分区</th></tr>",Te=J(),F=D("tbody");for(let K=0;K<xe.length;K+=1)xe[K].c();$(t,"class","svelte-l96u6n"),l.__value="",tt(l,l.__value),i[0]===void 0&&Mn(()=>i[11].call(o)),m.__value="",tt(m,m.__value),i[1]===void 0&&Mn(()=>i[12].call(f)),M.__value="",tt(M,M.__value),i[2]===void 0&&Mn(()=>i[13].call(d)),T.__value="",tt(T,T.__value),i[3]===void 0&&Mn(()=>i[14].call(A)),$(H,"class","ghost"),$(r,"class","filters svelte-l96u6n"),$(e,"class","card"),$(N,"class","svelte-l96u6n"),$(E,"class","card"),$(Z,"class","svelte-l96u6n"),$(Pe,"class","card")},m(K,He){Ce(K,e,He),_(e,t),_(e,n),_(e,r),_(r,s),_(s,a),_(s,o),_(o,l);for(let V=0;V<be.length;V+=1)be[V]&&be[V].m(o,null);Wt(o,i[0],!0),_(r,c),_(r,h),_(h,u),_(h,f),_(f,m);for(let V=0;V<se.length;V+=1)se[V]&&se[V].m(f,null);Wt(f,i[1],!0),_(r,g),_(r,v),_(v,p),_(v,d),_(d,M);for(let V=0;V<b.length;V+=1)b[V]&&b[V].m(d,null);Wt(d,i[2],!0),_(r,S),_(r,y),_(y,R),_(y,A),_(A,T);for(let V=0;V<j.length;V+=1)j[V]&&j[V].m(A,null);Wt(A,i[3],!0),_(r,I),_(r,H),Ce(K,x,He),Ce(K,E,He),_(E,N),_(N,L),_(N,X),_(N,z),_(E,re),_(E,q),_(q,fe),_(q,Me),_(q,_e);for(let V=0;V<ne.length;V+=1)ne[V]&&ne[V].m(_e,null);Ce(K,Ne,He),Ce(K,Pe,He),_(Pe,Z),_(Z,oe),_(Z,ce),_(Z,le),_(Pe,ge),_(Pe,he),_(he,ve),_(he,Te),_(he,F);for(let V=0;V<xe.length;V+=1)xe[V]&&xe[V].m(F,null);Ke||(De=[Xe(o,"change",i[11]),Xe(f,"change",i[12]),Xe(d,"change",i[13]),Xe(A,"change",i[14]),Xe(H,"click",i[15])],Ke=!0)},p(K,He){if(He[0]&16){ze=je(K[4]);let V;for(V=0;V<ze.length;V+=1){const Ee=Qc(K,ze,V);be[V]?be[V].p(Ee,He):(be[V]=eu(Ee),be[V].c(),be[V].m(o,null))}for(;V<be.length;V+=1)be[V].d(1);be.length=ze.length}if(He[0]&17&&Wt(o,K[0]),He[0]&2&&Wt(f,K[1]),He[0]&4&&Wt(d,K[2]),He[0]&128){k=je(K[7]);let V;for(V=0;V<k.length;V+=1){const Ee=Jc(K,k,V);j[V]?j[V].p(Ee,He):(j[V]=tu(Ee),j[V].c(),j[V].m(A,null))}for(;V<j.length;V+=1)j[V].d(1);j.length=k.length}if(He[0]&136&&Wt(A,K[3]),He[0]&64&&P!==(P=K[6].length+"")&&me(X,P),He[0]&64){ae=je(K[6]);let V;for(V=0;V<ae.length;V+=1){const Ee=Zc(K,ae,V);ne[V]?ne[V].p(Ee,He):(ne[V]=nu(Ee),ne[V].c(),ne[V].m(_e,null))}for(;V<ne.length;V+=1)ne[V].d(1);ne.length=ae.length}if(He[0]&32&&de!==(de=K[5].length+"")&&me(ce,de),He[0]&32){Ue=je(K[5]);let V;for(V=0;V<Ue.length;V+=1){const Ee=Kc(K,Ue,V);xe[V]?xe[V].p(Ee,He):(xe[V]=iu(Ee),xe[V].c(),xe[V].m(F,null))}for(;V<xe.length;V+=1)xe[V].d(1);xe.length=Ue.length}},i:at,o:at,d(K){K&&(Ae(e),Ae(x),Ae(E),Ae(Ne),Ae(Pe)),dt(be,K),dt(se,K),dt(b,K),dt(j,K),dt(ne,K),dt(xe,K),Ke=!1,Tt(De)}}}function B0(i,e){for(const t of e){const n=t[0];let r=!1;for(let s=0,a=n.length-1;s<n.length;a=s++){const[o,l]=n[s],[c,h]=n[a];l>i[1]!=h>i[1]&&i[0]<(c-o)*(i[1]-l)/(h-l)+o&&(r=!r)}if(r)return!0}return!1}const ru=i=>i.name;function z0(i,e,t){let n,r,s,a=[],o=[],l=[],c="",h="",u="",f="",m=[];async function g(){t(8,a=await Yt("informants")),t(9,o=await Yt("versions")),t(10,l=await Yt("reports"));const y=new Set;for(const R of o)for(const A of R.zones||[])y.add(A.name);t(4,m=[...y])}Xn(g);function v(){c=Ii(this),t(0,c),t(4,m)}function p(){h=Ii(this),t(1,h)}function d(){u=Ii(this),t(2,u)}function M(){f=Ii(this),t(3,f),t(7,n),t(8,a)}const S=()=>{t(0,c=t(1,h=t(2,u=t(3,f=""))))};return i.$$.update=()=>{i.$$.dirty[0]&256&&t(7,n=[...new Set(a.map(y=>y.year))].sort()),i.$$.dirty[0]&783&&t(6,r=a.filter(y=>{if(h&&y.township!==h||u&&!(y.features||[]).includes(u)||f&&String(y.year)!==String(f))return!1;if(c){const R=[...o].sort((A,T)=>T.num-A.num).find(A=>(A.zones||[]).some(T=>T.name===c));if(R){const A=R.zones.find(I=>I.name===c),T=new Set((R.points||[]).filter(I=>I.township&&B0([I.x,I.y],A.geom)).map(I=>I.township));if(T.size&&!T.has(y.township))return!1}}return!0})),i.$$.dirty[0]&1033&&t(5,s=l.filter(y=>!(c&&!(y.zones||[]).some(R=>R.name===c)||f&&String(new Date(y.createdAt).getFullYear())!==String(f))))},[c,h,u,f,m,s,r,n,a,o,l,v,p,d,M,S]}class k0 extends jn{constructor(e){super(),$n(this,e,z0,O0,wn,{},null,[-1,-1])}}function su(i){let e,t;return{c(){e=D("p"),t=B(i[1]),Ht(e,"color","#7ec8ff")},m(n,r){Ce(n,e,r),_(e,t)},p(n,r){r&2&&me(t,n[1])},d(n){n&&Ae(e)}}}function H0(i){let e,t,n,r,s,a=i[0]?`自定义 GeoJSON(${i[0].length} 个乡镇)`:`内置模拟县域(${ur.length} 个乡镇)`,o,l,c,h,u,f,m,g,v,p,d,M,S,y,R,A,T,I,H,x=i[1]&&su(i);return{c(){e=D("div"),t=D("h3"),t.textContent="底图数据",n=J(),r=D("p"),s=B("当前乡镇界:"),o=B(a),l=J(),c=D("label"),h=B("导入乡镇界 GeoJSON "),u=D("input"),f=J(),m=D("button"),g=B("恢复内置数据"),p=J(),x&&x.c(),d=J(),M=D("p"),M.textContent="说明:坐标需为 0–100 范围内的平面公里坐标,与内置县域坐标系一致。",S=J(),y=D("div"),R=D("h3"),R.textContent="危险操作",A=J(),T=D("button"),T.textContent="清空全部数据",$(t,"class","svelte-oo2cbb"),$(u,"type","file"),$(u,"accept",".json,.geojson"),$(c,"class","svelte-oo2cbb"),$(m,"class","ghost"),m.disabled=v=!i[0],$(M,"class","muted"),$(e,"class","card"),$(R,"class","svelte-oo2cbb"),$(T,"class","danger"),$(y,"class","card")},m(E,N){Ce(E,e,N),_(e,t),_(e,n),_(e,r),_(r,s),_(r,o),_(e,l),_(e,c),_(c,h),_(c,u),_(e,f),_(e,m),_(m,g),_(e,p),x&&x.m(e,null),_(e,d),_(e,M),Ce(E,S,N),Ce(E,y,N),_(y,R),_(y,A),_(y,T),I||(H=[Xe(u,"change",i[2]),Xe(m,"click",i[3]),Xe(T,"click",i[4])],I=!0)},p(E,[N]){N&1&&a!==(a=E[0]?`自定义 GeoJSON(${E[0].length} 个乡镇)`:`内置模拟县域(${ur.length} 个乡镇)`)&&me(o,a),N&1&&v!==(v=!E[0])&&(m.disabled=v),E[1]?x?x.p(E,N):(x=su(E),x.c(),x.m(e,d)):x&&(x.d(1),x=null)},i:at,o:at,d(E){E&&(Ae(e),Ae(S),Ae(y)),x&&x.d(),I=!1,Tt(H)}}}function G0(i,e,t){let n=null,r="";Xn(async()=>{t(0,n=await Gi("townships"))});async function s(l){const c=l.target.files[0];if(c){try{const h=JSON.parse(await c.text()),u=h.type==="FeatureCollection"?h.features:[h],f=[];for(const m of u){const g=m.properties&&(m.properties.name||m.properties.NAME)||`乡镇${f.length+1}`,v=m.geometry;if(!v)continue;const p=v.type==="Polygon"?v.coordinates[0]:v.type==="MultiPolygon"?v.coordinates[0][0]:null;p&&p.length>=4&&f.push({name:g,ring:p})}if(!f.length){t(1,r="未在文件中找到有效的面要素");return}await Ui("townships",f),t(0,n=f),t(1,r=`已导入 ${f.length} 个乡镇界,刷新加工台后生效`)}catch(h){t(1,r="解析失败:"+h.message)}l.target.value=""}}async function a(){await Ui("townships",null),t(0,n=null),t(1,r="已恢复内置模拟乡镇界")}async function o(){if(confirm("将清空全部档案、批次、版本与报告,确认?")){for(const l of["informants","batches","versions","reports"]){const c=await Yt(l);for(const h of c)await ca(l,h.id)}await Ui("workDraft",null),await Ui("seeded",null),t(1,r="已清空全部数据,刷新页面后重新播种示例数据")}}return[n,r,s,a,o]}class V0 extends jn{constructor(e){super(),$n(this,e,G0,H0,wn,{})}}function ou(i,e,t){const n=i.slice();return n[3]=e[t][0],n[4]=e[t][1],n}function au(i){let e,t=i[4]+"",n;return{c(){e=D("a"),n=B(t),$(e,"href","#/"+i[3]),$(e,"class","svelte-1o0cey"),ln(e,"active",i[0]===i[3])},m(r,s){Ce(r,e,s),_(e,n)},p(r,s){s&3&&ln(e,"active",r[0]===r[3])},d(r){r&&Ae(e)}}}function W0(i){let e,t;return e=new V0({}),{c(){di(e.$$.fragment)},m(n,r){qn(e,n,r),t=!0},i(n){t||(cn(e.$$.fragment,n),t=!0)},o(n){Tn(e.$$.fragment,n),t=!1},d(n){Yn(e,n)}}}function X0(i){let e,t;return e=new k0({}),{c(){di(e.$$.fragment)},m(n,r){qn(e,n,r),t=!0},i(n){t||(cn(e.$$.fragment,n),t=!0)},o(n){Tn(e.$$.fragment,n),t=!1},d(n){Yn(e,n)}}}function q0(i){let e,t;return e=new D0({}),{c(){di(e.$$.fragment)},m(n,r){qn(e,n,r),t=!0},i(n){t||(cn(e.$$.fragment,n),t=!0)},o(n){Tn(e.$$.fragment,n),t=!1},d(n){Yn(e,n)}}}function Y0(i){let e,t;return e=new R0({}),{c(){di(e.$$.fragment)},m(n,r){qn(e,n,r),t=!0},i(n){t||(cn(e.$$.fragment,n),t=!0)},o(n){Tn(e.$$.fragment,n),t=!1},d(n){Yn(e,n)}}}function $0(i){let e,t;return e=new y0({}),{c(){di(e.$$.fragment)},m(n,r){qn(e,n,r),t=!0},i(n){t||(cn(e.$$.fragment,n),t=!0)},o(n){Tn(e.$$.fragment,n),t=!1},d(n){Yn(e,n)}}}function j0(i){let e,t;return e=new If({}),{c(){di(e.$$.fragment)},m(n,r){qn(e,n,r),t=!0},i(n){t||(cn(e.$$.fragment,n),t=!0)},o(n){Tn(e.$$.fragment,n),t=!1},d(n){Yn(e,n)}}}function K0(i){let e,t;return e=new Cf({}),{c(){di(e.$$.fragment)},m(n,r){qn(e,n,r),t=!0},i(n){t||(cn(e.$$.fragment,n),t=!0)},o(n){Tn(e.$$.fragment,n),t=!1},d(n){Yn(e,n)}}}function Z0(i){let e,t,n,r,s,a,o,l,c,h,u=je(i[1]),f=[];for(let p=0;p<u.length;p+=1)f[p]=au(ou(i,u,p));const m=[K0,j0,$0,Y0,q0,X0,W0],g=[];function v(p,d){return p[0]==="informants"?0:p[0]==="batches"?1:p[0]==="workbench"?2:p[0]==="versions"?3:p[0]==="review"?4:p[0]==="search"?5:p[0]==="settings"?6:-1}return~(l=v(i))&&(c=g[l]=m[l](i)),{c(){e=D("div"),t=D("header"),n=D("h1"),n.textContent="方言调查档案与区划图加工系统",r=J(),s=D("nav");for(let p=0;p<f.length;p+=1)f[p].c();a=J(),o=D("main"),c&&c.c(),$(n,"class","svelte-1o0cey"),$(s,"class","svelte-1o0cey"),$(t,"class","svelte-1o0cey"),$(o,"class","svelte-1o0cey"),$(e,"class","layout svelte-1o0cey")},m(p,d){Ce(p,e,d),_(e,t),_(t,n),_(t,r),_(t,s);for(let M=0;M<f.length;M+=1)f[M]&&f[M].m(s,null);_(e,a),_(e,o),~l&&g[l].m(o,null),h=!0},p(p,[d]){if(d&3){u=je(p[1]);let S;for(S=0;S<u.length;S+=1){const y=ou(p,u,S);f[S]?f[S].p(y,d):(f[S]=au(y),f[S].c(),f[S].m(s,null))}for(;S<f.length;S+=1)f[S].d(1);f.length=u.length}let M=l;l=v(p),l!==M&&(c&&(mf(),Tn(g[M],1,1,()=>{g[M]=null}),_f()),~l?(c=g[l],c||(c=g[l]=m[l](p),c.c()),cn(c,1),c.m(o,null)):c=null)},i(p){h||(cn(c),h=!0)},o(p){Tn(c),h=!1},d(p){p&&Ae(e),dt(f,p),~l&&g[l].d()}}}function J0(i,e,t){let n;lf(i,la,a=>t(2,n=a));const r=[["informants","发音人建档"],["batches","批次记音表"],["workbench","区划加工台"],["versions","版本比对"],["review","审核归档"],["search","成果检索"],["settings","数据设置"]];let s="informants";return Xn(async()=>{if(!await Gi("seeded")){for(const a of bf)await dr("informants",{...a,createdAt:Date.now()});await Ui("seeded",!0)}}),i.$$.update=()=>{i.$$.dirty&4&&t(0,s=(n||"#/informants").replace(/^#\//,"")||"informants")},[s,r,n]}class Q0 extends jn{constructor(e){super(),$n(this,e,J0,Z0,wn,{})}}new Q0({target:document.getElementById("app")});
