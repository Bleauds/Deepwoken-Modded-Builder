import{n as Y,i as at,e as Xt,j as Be,s as Ee,r as lt,c as xe,l as $t,b as xt,m as zt,u as Bt,o as Nt,p as Ut}from"../chunks/By8VydLX.js";import{e as k,k as L,c as $,a as j,d as b,l as S,g as f,z as ze,i as A,h as g,q as B,o as Re,N as Rt,Q as Zt,r as he,S as en,x as Ct,C as Gt,t as Wt,m as z,b as Yt,p as I,j as tn,f as nn}from"../chunks/nyUOTgEe.js";import{n as Ft,l as Kt,f as rn,h as sn,S as Le,i as Se,g as De,a as P,c as je,t as H,b as ne,d as ue,m as re,e as ie,j as on,k as an}from"../chunks/CLoJ4m2a.js";import{e as Ne,u as ln,f as cn}from"../chunks/ByWBCxsZ.js";import{c as un,f as dn,a as fn}from"../chunks/CKM_XLov.js";import{t as Ce,g as Et,a as Lt,I as St,A as pn}from"../chunks/DpzCjbIr.js";import{w as mn}from"../chunks/C8XpiCkM.js";import{g as hn}from"../chunks/D0QH3NT1.js";import{u as _e,a as Ae}from"../chunks/CVAU0KcF.js";import{n as gn}from"../chunks/4fQGrV8C.js";const vn=!1;function _n(r,e,t,n){if(!e)return Y;const i=r.getBoundingClientRect();if(e.left===i.left&&e.right===i.right&&e.top===i.top&&e.bottom===i.bottom)return Y;const{delay:o=0,duration:a=300,easing:s=at,start:l=Ft()+o,end:c=l+a,tick:w=Y,css:h}=t(r,{from:e,to:i},n);let p=!0,y=!1,_;function m(){h&&(_=rn(r,0,1,a,o,s,h)),o||(y=!0)}function v(){h&&sn(r,_),p=!1}return Kt(T=>{if(!y&&T>=l&&(y=!0),y&&T>=c&&(w(1,0),v()),!p)return!1;if(y){const d=T-l,C=0+1*s(d/a);w(C,1-C)}return!0}),m(),w(0,1),v}function bn(r){const e=getComputedStyle(r);if(e.position!=="absolute"&&e.position!=="fixed"){const{width:t,height:n}=e,i=r.getBoundingClientRect();r.style.position="absolute",r.style.width=t,r.style.height=n,Qt(r,i)}}function Qt(r,e){const t=r.getBoundingClientRect();if(e.left!==t.left||e.top!==t.top){const n=getComputedStyle(r),i=n.transform==="none"?"":n.transform;r.style.transform=`${i} translate(${e.left-t.left}px, ${e.top-t.top}px)`}}const Tt=vn,ir=Object.freeze(Object.defineProperty({__proto__:null},Symbol.toStringTag,{value:"Module"}));function yn(r,{from:e,to:t},n={}){const i=getComputedStyle(r),o=i.transform==="none"?"":i.transform,[a,s]=i.transformOrigin.split(" ").map(parseFloat),l=e.left+e.width*a/t.width-(t.left+a),c=e.top+e.height*s/t.height-(t.top+s),{delay:w=0,duration:h=y=>Math.sqrt(y)*120,easing:p=un}=n;return{delay:w,duration:Xt(h)?h(Math.sqrt(l*l+c*c)):h,easing:p,css:(y,_)=>{const m=_*l,v=_*c,T=y+_*e.width/t.width,d=y+_*e.height/t.height;return`transform: ${o} translate(${m}px, ${v}px) scale(${T}, ${d});`}}}function It(r){return Object.prototype.toString.call(r)==="[object Date]"}function ot(r,e){if(r===e||r!==r)return()=>r;const t=typeof r;if(t!==typeof e||Array.isArray(r)!==Array.isArray(e))throw new Error("Cannot interpolate values of different type");if(Array.isArray(r)){const n=e.map((i,o)=>ot(r[o],i));return i=>n.map(o=>o(i))}if(t==="object"){if(!r||!e)throw new Error("Object cannot be null");if(It(r)&&It(e)){r=r.getTime(),e=e.getTime();const o=e-r;return a=>new Date(r+a*o)}const n=Object.keys(e),i={};return n.forEach(o=>{i[o]=ot(r[o],e[o])}),o=>{const a={};return n.forEach(s=>{a[s]=i[s](o)}),a}}if(t==="number"){const n=e-r;return i=>r+i*n}throw new Error(`Cannot interpolate ${t} values`)}function wn(r,e={}){const t=mn(r);let n,i=r;function o(a,s){if(r==null)return t.set(r=a),Promise.resolve();i=a;let l=n,c=!1,{delay:w=0,duration:h=400,easing:p=at,interpolate:y=ot}=Be(Be({},e),s);if(h===0)return l&&(l.abort(),l=null),t.set(r=i),Promise.resolve();const _=Ft()+w;let m;return n=Kt(v=>{if(v<_)return!0;c||(m=y(r,a),typeof h=="function"&&(h=h(r,a)),c=!0),l&&(l.abort(),l=null);const T=v-_;return T>h?(t.set(r=a),!1):(t.set(r=m(p(T/h))),!0)}),n.promise}return{set:o,update:(a,s)=>o(a(i,r),s),subscribe:t.subscribe}}function kn(r){let e,t=r[0].msg+"",n;return{c(){e=new Zt(!1),n=he(),this.h()},l(i){e=en(i,!1),n=he(),this.h()},h(){e.a=n},m(i,o){e.m(t,i,o),A(i,n,o)},p(i,o){o&1&&t!==(t=i[0].msg+"")&&e.p(t)},i:Y,o:Y,d(i){i&&(b(n),e.d())}}}function $n(r){let e,t,n;const i=[r[2]];var o=r[0].component.src;function a(s,l){let c={};for(let w=0;w<i.length;w+=1)c=Be(c,i[w]);return l!==void 0&&l&4&&(c=Be(c,Et(i,[Lt(s[2])]))),{props:c}}return o&&(e=Ct(o,a(r))),{c(){e&&ne(e.$$.fragment),t=he()},l(s){e&&ue(e.$$.fragment,s),t=he()},m(s,l){e&&re(e,s,l),A(s,t,l),n=!0},p(s,l){if(l&1&&o!==(o=s[0].component.src)){if(e){De();const c=e;P(c.$$.fragment,1,0,()=>{ie(c,1)}),je()}o?(e=Ct(o,a(s,l)),ne(e.$$.fragment),H(e.$$.fragment,1),re(e,t.parentNode,t)):e=null}else if(o){const c=l&4?Et(i,[Lt(s[2])]):{};e.$set(c)}},i(s){n||(e&&H(e.$$.fragment,s),n=!0)},o(s){e&&P(e.$$.fragment,s),n=!1},d(s){s&&b(t),e&&ie(e,s)}}}function At(r){let e,t,n;return{c(){e=k("div"),this.h()},l(i){e=$(i,"DIV",{class:!0,role:!0,tabindex:!0}),j(e).forEach(b),this.h()},h(){f(e,"class","_toastBtn pe svelte-l65oht"),f(e,"role","button"),f(e,"tabindex","0")},m(i,o){A(i,e,o),t||(n=[B(e,"click",r[8]),B(e,"keydown",r[9])],t=!0)},p:Y,d(i){i&&b(e),t=!1,lt(n)}}}function xn(r){let e,t,n,i,o,a,s,l,c,w;const h=[$n,kn],p=[];function y(m,v){return m[0].component?0:1}n=y(r),i=p[n]=h[n](r);let _=r[0].dismissable&&At(r);return{c(){e=k("div"),t=k("div"),i.c(),o=L(),_&&_.c(),a=L(),s=k("progress"),this.h()},l(m){e=$(m,"DIV",{role:!0,class:!0});var v=j(e);t=$(v,"DIV",{class:!0});var T=j(t);i.l(T),T.forEach(b),o=S(v),_&&_.l(v),a=S(v),s=$(v,"PROGRESS",{class:!0}),j(s).forEach(b),v.forEach(b),this.h()},h(){f(t,"class","_toastMsg svelte-l65oht"),ze(t,"pe",r[0].component),f(s,"class","_toastBar svelte-l65oht"),s.value=r[1],f(e,"role","status"),f(e,"class","_toastItem svelte-l65oht"),ze(e,"pe",r[0].pausable)},m(m,v){A(m,e,v),g(e,t),p[n].m(t,null),g(e,o),_&&_.m(e,null),g(e,a),g(e,s),l=!0,c||(w=[B(e,"mouseenter",r[10]),B(e,"mouseleave",r[6])],c=!0)},p(m,[v]){let T=n;n=y(m),n===T?p[n].p(m,v):(De(),P(p[T],1,1,()=>{p[T]=null}),je(),i=p[n],i?i.p(m,v):(i=p[n]=h[n](m),i.c()),H(i,1),i.m(t,null)),(!l||v&1)&&ze(t,"pe",m[0].component),m[0].dismissable?_?_.p(m,v):(_=At(m),_.c(),_.m(e,a)):_&&(_.d(1),_=null),(!l||v&2)&&(s.value=m[1]),(!l||v&1)&&ze(e,"pe",m[0].pausable)},i(m){l||(H(i),l=!0)},o(m){P(i),l=!1},d(m){m&&b(e),p[n].d(),_&&_.d(),c=!1,lt(w)}}}function Dt(r,e="undefined"){return typeof r===e}function Cn(r,e,t){let n,{item:i}=e,o=i.initial,a=o,s=!1,l={},c,w;const h=wn(i.initial,{duration:i.duration,easing:at});xe(r,h,u=>t(1,n=u));function p(u){u&&(w=u),Ce.pop(i.id)}function y(){(n===1||n===0)&&p()}function _(){!s&&n!==o&&(h.set(n,{duration:0}),s=!0)}function m(){if(s){const u=i.duration,E=u-u*((n-a)/(o-a));h.set(o,{duration:E}).then(y),s=!1}}function v(u=document){if(Dt(u.hidden))return;const E=()=>u.hidden?_():m(),D="visibilitychange";u.addEventListener(D,E),c=()=>u.removeEventListener(D,E),E()}Re(v),Rt(()=>{i.onpop&&i.onpop(i.id,{event:w}),c&&c()});const T=u=>p(u),d=u=>{u instanceof KeyboardEvent&&["Enter"," "].includes(u.key)&&p(u)},C=()=>{i.pausable&&_()};return r.$$set=u=>{"item"in u&&t(0,i=u.item)},r.$$.update=()=>{if(r.$$.dirty&1&&(Dt(i.progress)||t(0,i.next=i.progress,i)),r.$$.dirty&131&&o!==i.next&&(t(7,o=i.next),a=n,s=!1,h.set(o).then(y)),r.$$.dirty&1&&i.component){const{props:u={},sendIdTo:E}=i.component;t(2,l={...u,...E&&{[E]:i.id}})}},[i,n,l,h,p,_,m,o,T,d,C]}class En extends Le{constructor(e){super(),Se(this,e,Cn,xn,Ee,{item:0})}}function jt(r,e,t){const n=r.slice();return n[4]=e[t],n}function Mt(r,e){let t,n,i,o,a,s,l,c,w=Y,h;return n=new En({props:{item:e[4]}}),{key:r,first:null,c(){t=k("li"),ne(n.$$.fragment),i=L(),this.h()},l(p){t=$(p,"LI",{class:!0,style:!0});var y=j(t);ue(n.$$.fragment,y),i=S(y),y.forEach(b),this.h()},h(){var p;f(t,"class",o=$t((p=e[4].classes)==null?void 0:p.join(" "))+" svelte-yh90az"),f(t,"style",a=Ht(e[4].theme)),this.first=t},m(p,y){A(p,t,y),re(n,t,null),g(t,i),h=!0},p(p,y){var m;e=p;const _={};y&1&&(_.item=e[4]),n.$set(_),(!h||y&1&&o!==(o=$t((m=e[4].classes)==null?void 0:m.join(" "))+" svelte-yh90az"))&&f(t,"class",o),(!h||y&1&&a!==(a=Ht(e[4].theme)))&&f(t,"style",a)},r(){c=t.getBoundingClientRect()},f(){bn(t),w(),Qt(t,c)},a(){w(),w=_n(t,c,yn,{duration:200})},i(p){h||(H(n.$$.fragment,p),p&&Gt(()=>{h&&(l&&l.end(1),s=on(t,dn,e[4].intro),s.start())}),h=!0)},o(p){P(n.$$.fragment,p),s&&s.invalidate(),p&&(l=an(t,fn,{})),h=!1},d(p){p&&b(t),ie(n),p&&l&&l.end()}}}function Ln(r){let e,t=[],n=new Map,i,o=Ne(r[0]);const a=s=>s[4].id;for(let s=0;s<o.length;s+=1){let l=jt(r,o,s),c=a(l);n.set(c,t[s]=Mt(c,l))}return{c(){e=k("ul");for(let s=0;s<t.length;s+=1)t[s].c();this.h()},l(s){e=$(s,"UL",{class:!0});var l=j(e);for(let c=0;c<t.length;c+=1)t[c].l(l);l.forEach(b),this.h()},h(){f(e,"class","_toastContainer svelte-yh90az")},m(s,l){A(s,e,l);for(let c=0;c<t.length;c+=1)t[c]&&t[c].m(e,null);i=!0},p(s,[l]){if(l&1){o=Ne(s[0]),De();for(let c=0;c<t.length;c+=1)t[c].r();t=ln(t,l,a,1,s,o,n,e,cn,Mt,null,jt);for(let c=0;c<t.length;c+=1)t[c].a();je()}},i(s){if(!i){for(let l=0;l<o.length;l+=1)H(t[l]);i=!0}},o(s){for(let l=0;l<t.length;l+=1)P(t[l]);i=!1},d(s){s&&b(e);for(let l=0;l<t.length;l+=1)t[l].d()}}}function Ht(r){return r?Object.keys(r).reduce((e,t)=>`${e}${t}:${r[t]};`,""):void 0}function Sn(r,e,t){let n;xe(r,Ce,s=>t(3,n=s));let{options:i={}}=e,{target:o="default"}=e,a=[];return r.$$set=s=>{"options"in s&&t(1,i=s.options),"target"in s&&t(2,o=s.target)},r.$$.update=()=>{r.$$.dirty&6&&Ce._init(o,i),r.$$.dirty&12&&t(0,a=n.filter(s=>s.target===o))},[a,i,o,n]}class Tn extends Le{constructor(e){super(),Se(this,e,Sn,Ln,Ee,{options:1,target:2})}}const In={displayed:!0,"--button-background":"#04100d","--background":"radial-gradient(#18221a, #04100d)"},An={displayed:!0,"--button-background":"#012833","--background":"radial-gradient(#264a50, #040d13)"},Dn={displayed:!0,"--button-background":"#1f1f1f","--background":"radial-gradient(#c0c2cb, #4c4f53)"},jn={displayed:!0,"--button-background":"#240d01","--background":"radial-gradient(#4f3c29, #1a1814)"},Mn={displayed:!0,"--button-background":"#5c001c","--background":"radial-gradient(#5c001c, #400114)"},Ue={overworld:In,depths:An,gale:Dn,chimes:jn,silksong:Mn,"black-silence":{displayed:!1,"--button-background":"black","--background":"black","--color":"white"}},{window:Jt}=hn;function Pt(r,e,t){const n=r.slice();return n[17]=e[t][0],n[18]=e[t][1],n}function Hn(r){let e,t,n;return{c(){e=k("button"),this.h()},l(i){e=$(i,"BUTTON",{class:!0,style:!0,id:!0}),j(e).forEach(b),this.h()},h(){f(e,"class","theme-button"),f(e,"style",`background: ${r[18]["--background"]}`),f(e,"id",r[17])},m(i,o){A(i,e,o),t||(n=B(e,"click",r[3]),t=!0)},p:Y,d(i){i&&b(e),t=!1,n()}}}function qt(r){let e,t=r[18].displayed&&Hn(r);return{c(){t&&t.c(),e=he()},l(n){t&&t.l(n),e=he()},m(n,i){t&&t.m(n,i),A(n,e,i)},p(n,i){n[18].displayed&&t.p(n,i)},d(n){n&&b(e),t&&t.d(n)}}}function Ot(r){let e,t,n,i,o;return{c(){e=k("div"),t=k("input"),n=Wt("Desktop Mode"),this.h()},l(a){e=$(a,"DIV",{class:!0});var s=j(e);t=$(s,"INPUT",{id:!0,type:!0}),n=Yt(s,"Desktop Mode"),s.forEach(b),this.h()},h(){f(t,"id","toggleDesktop"),f(t,"type","checkbox"),f(e,"class","toggle-desktop")},m(a,s){A(a,e,s),g(e,t),g(e,n),i||(o=B(t,"change",r[2]),i=!0)},p:Y,d(a){a&&b(e),i=!1,o()}}}function Pn(r){let e,t,n,i,o,a,s="User controls",l,c,w,h,p,y="Profile",_,m,v="Log out",T,d,C,u,E,D,R,ge="Navigation",be,se,F,ye,Q,ct="Home",Ge,J,ut="Builder",We,X,dt="Talents",Ye,K,ft="Discord",Fe,Z,pt="Aen (Discord Bot)",Ke,ee,mt="Support Me",Qe,te,ht="Privacy Policy",Je,G,Xe,Ze,de,et,Me,oe,gt="<b>@cyfiee</b> - v3.1",He,ae,fe,le,vt='<img src="/menu.png" alt="nav menu" style="max-height: 100%;"/>',tt,W,_t='<img src="/favicon.png" alt="icon" style="max-width: 25px; margin-right: 5px;"/> <p>Deepwoken Hub</p>',nt,pe,ve,Te=(r[1]&&Object.keys(r[1]).length>0?r[1].username:"Guest")+"",Pe,rt,ce,Ie,it,bt;Gt(r[4]),w=new St({props:{icon:"octicon:x-16"}}),F=new St({props:{icon:"octicon:x-16"}});let we=Ne(Object.entries(Ue)),O=[];for(let x=0;x<we.length;x+=1)O[x]=qt(Pt(r,we,x));let V=r[0]>800&&Ot(r);return ce=new pn({props:{img:r[1]?r[1].avatar:"/discord.png",w:"25px",h:"25px"}}),ce.$on("click",r[8]),{c(){e=k("div"),t=k("div"),n=k("img"),o=L(),a=k("p"),a.textContent=s,l=L(),c=k("button"),ne(w.$$.fragment),h=L(),p=k("a"),p.textContent=y,_=L(),m=k("a"),m.textContent=v,T=L(),d=k("div"),C=k("div"),u=k("img"),D=L(),R=k("p"),R.textContent=ge,be=L(),se=k("button"),ne(F.$$.fragment),ye=L(),Q=k("a"),Q.textContent=ct,Ge=L(),J=k("a"),J.textContent=ut,We=L(),X=k("a"),X.textContent=dt,Ye=L(),K=k("a"),K.textContent=ft,Fe=L(),Z=k("a"),Z.textContent=pt,Ke=L(),ee=k("a"),ee.textContent=mt,Qe=L(),te=k("a"),te.textContent=ht,Je=L(),G=k("div"),Xe=k("hr"),Ze=L(),de=k("div");for(let x=0;x<O.length;x+=1)O[x].c();et=L(),V&&V.c(),Me=L(),oe=k("div"),oe.innerHTML=gt,He=L(),ae=k("div"),fe=k("div"),le=k("button"),le.innerHTML=vt,tt=L(),W=k("a"),W.innerHTML=_t,nt=L(),pe=k("div"),ve=k("p"),Pe=Wt(Te),rt=L(),ne(ce.$$.fragment),this.h()},l(x){e=$(x,"DIV",{class:!0});var q=j(e);t=$(q,"DIV",{style:!0});var U=j(t);n=$(U,"IMG",{src:!0,alt:!0,style:!0}),o=S(U),a=$(U,"P",{"data-svelte-h":!0}),z(a)!=="svelte-1erc25j"&&(a.textContent=s),l=S(U),c=$(U,"BUTTON",{class:!0});var N=j(c);ue(w.$$.fragment,N),N.forEach(b),U.forEach(b),h=S(q),p=$(q,"A",{class:!0,id:!0,href:!0,"data-svelte-h":!0}),z(p)!=="svelte-1gyv62p"&&(p.textContent=y),_=S(q),m=$(q,"A",{class:!0,id:!0,href:!0,"data-svelte-h":!0}),z(m)!=="svelte-1jv28vl"&&(m.textContent=v),q.forEach(b),T=S(x),d=$(x,"DIV",{class:!0,"data-sveltekit-reload":!0});var M=j(d);C=$(M,"DIV",{style:!0});var ke=j(C);u=$(ke,"IMG",{src:!0,alt:!0,style:!0}),D=S(ke),R=$(ke,"P",{"data-svelte-h":!0}),z(R)!=="svelte-1qxw3o2"&&(R.textContent=ge),be=S(ke),se=$(ke,"BUTTON",{class:!0});var yt=j(se);ue(F.$$.fragment,yt),yt.forEach(b),ke.forEach(b),ye=S(M),Q=$(M,"A",{id:!0,class:!0,href:!0,"data-svelte-h":!0}),z(Q)!=="svelte-wq15t4"&&(Q.textContent=ct),Ge=S(M),J=$(M,"A",{id:!0,class:!0,href:!0,"data-svelte-h":!0}),z(J)!=="svelte-1wqtt15"&&(J.textContent=ut),We=S(M),X=$(M,"A",{id:!0,class:!0,href:!0,"data-svelte-h":!0}),z(X)!=="svelte-2cz34x"&&(X.textContent=dt),Ye=S(M),K=$(M,"A",{id:!0,class:!0,target:!0,rel:!0,href:!0,"data-svelte-h":!0}),z(K)!=="svelte-51rhru"&&(K.textContent=ft),Fe=S(M),Z=$(M,"A",{id:!0,class:!0,href:!0,"data-svelte-h":!0}),z(Z)!=="svelte-zsn60e"&&(Z.textContent=pt),Ke=S(M),ee=$(M,"A",{id:!0,class:!0,href:!0,"data-svelte-h":!0}),z(ee)!=="svelte-lpvlrt"&&(ee.textContent=mt),Qe=S(M),te=$(M,"A",{id:!0,class:!0,href:!0,"data-svelte-h":!0}),z(te)!=="svelte-15849ia"&&(te.textContent=ht),Je=S(M),G=$(M,"DIV",{class:!0});var me=j(G);Xe=$(me,"HR",{}),Ze=S(me),de=$(me,"DIV",{style:!0});var wt=j(de);for(let st=0;st<O.length;st+=1)O[st].l(wt);wt.forEach(b),et=S(me),V&&V.l(me),Me=S(me),oe=$(me,"DIV",{style:!0,"data-svelte-h":!0}),z(oe)!=="svelte-1aul8bd"&&(oe.innerHTML=gt),me.forEach(b),M.forEach(b),He=S(x),ae=$(x,"DIV",{class:!0});var qe=j(ae);fe=$(qe,"DIV",{class:!0});var Oe=j(fe);le=$(Oe,"BUTTON",{id:!0,class:!0,"data-svelte-h":!0}),z(le)!=="svelte-131a9vx"&&(le.innerHTML=vt),tt=S(Oe),W=$(Oe,"A",{style:!0,href:!0,"data-svelte-h":!0}),z(W)!=="svelte-4d1lng"&&(W.innerHTML=_t),Oe.forEach(b),nt=S(qe),pe=$(qe,"DIV",{id:!0});var Ve=j(pe);ve=$(Ve,"P",{id:!0,style:!0});var kt=j(ve);Pe=Yt(kt,Te),kt.forEach(b),rt=S(Ve),ue(ce.$$.fragment,Ve),Ve.forEach(b),qe.forEach(b),this.h()},h(){xt(n.src,i="/menu.png")||f(n,"src",i),f(n,"alt","icon"),I(n,"max-width","18px"),I(n,"margin-right","10px"),f(c,"class","close-button"),I(t,"display","flex"),I(t,"align-items","center"),I(t,"padding","0px 25px 0px 15px"),I(t,"border-bottom","1px lightgray solid"),f(p,"class","nav-option"),f(p,"id","login"),f(p,"href","/"),f(m,"class","nav-option"),f(m,"id","logout"),f(m,"href","/"),f(e,"class","nav right nav-menu border"),xt(u.src,E="/menu.png")||f(u,"src",E),f(u,"alt","icon"),I(u,"max-width","18px"),I(u,"margin-right","10px"),f(se,"class","close-button"),I(C,"display","flex"),I(C,"align-items","center"),I(C,"padding","0px 25px 0px 15px"),I(C,"border-bottom","1px lightgray solid"),f(Q,"id","home"),f(Q,"class","nav-option"),f(Q,"href","/"),f(J,"id","builder"),f(J,"class","nav-option"),f(J,"href","/builder"),f(X,"id","talents"),f(X,"class","nav-option"),f(X,"href","/talents"),f(K,"id","discord"),f(K,"class","nav-option"),f(K,"target","_blank"),f(K,"rel","noreferrer"),f(K,"href","https://discord.gg/B3BwytYWVK"),f(Z,"id","aen"),f(Z,"class","nav-option"),f(Z,"href","/aen"),f(ee,"id","support"),f(ee,"class","nav-option"),f(ee,"href","/support"),f(te,"id","privacy"),f(te,"class","nav-option"),f(te,"href","/privacy"),I(de,"display","flex"),I(de,"justify-content","space-between"),I(oe,"font-size","12px"),I(oe,"color","grey"),I(oe,"margin","5px"),f(G,"class","themes"),f(d,"class","nav left nav-menu border"),f(d,"data-sveltekit-reload",""),f(le,"id","navbutton"),f(le,"class","nav-button border-thin"),I(W,"display","flex"),I(W,"align-items","center"),I(W,"color","white"),I(W,"font-size","15px"),I(W,"margin-left","10px"),I(W,"text-decoration","none"),f(W,"href","/"),f(fe,"class","logo"),f(ve,"id","profileName"),I(ve,"margin-right","15px"),f(pe,"id","profile"),f(ae,"class","navbar border")},m(x,q){A(x,e,q),g(e,t),g(t,n),g(t,o),g(t,a),g(t,l),g(t,c),re(w,c,null),g(e,h),g(e,p),g(e,_),g(e,m),A(x,T,q),A(x,d,q),g(d,C),g(C,u),g(C,D),g(C,R),g(C,be),g(C,se),re(F,se,null),g(d,ye),g(d,Q),g(d,Ge),g(d,J),g(d,We),g(d,X),g(d,Ye),g(d,K),g(d,Fe),g(d,Z),g(d,Ke),g(d,ee),g(d,Qe),g(d,te),g(d,Je),g(d,G),g(G,Xe),g(G,Ze),g(G,de);for(let U=0;U<O.length;U+=1)O[U]&&O[U].m(de,null);g(G,et),V&&V.m(G,null),g(G,Me),g(G,oe),A(x,He,q),A(x,ae,q),g(ae,fe),g(fe,le),g(fe,tt),g(fe,W),g(ae,nt),g(ae,pe),g(pe,ve),g(ve,Pe),g(pe,rt),re(ce,pe,null),Ie=!0,it||(bt=[B(Jt,"resize",r[4]),B(c,"click",r[5]),B(se,"click",r[6]),B(Q,"click",$e),B(J,"click",$e),B(X,"click",$e),B(Z,"click",$e),B(ee,"click",$e),B(te,"click",$e),B(le,"click",r[7])],it=!0)},p(x,[q]){if(q&8){we=Ne(Object.entries(Ue));let N;for(N=0;N<we.length;N+=1){const M=Pt(x,we,N);O[N]?O[N].p(M,q):(O[N]=qt(M),O[N].c(),O[N].m(de,null))}for(;N<O.length;N+=1)O[N].d(1);O.length=we.length}x[0]>800?V?V.p(x,q):(V=Ot(x),V.c(),V.m(G,Me)):V&&(V.d(1),V=null),(!Ie||q&2)&&Te!==(Te=(x[1]&&Object.keys(x[1]).length>0?x[1].username:"Guest")+"")&&tn(Pe,Te);const U={};q&2&&(U.img=x[1]?x[1].avatar:"/discord.png"),ce.$set(U)},i(x){Ie||(H(w.$$.fragment,x),H(F.$$.fragment,x),H(ce.$$.fragment,x),Ie=!0)},o(x){P(w.$$.fragment,x),P(F.$$.fragment,x),P(ce.$$.fragment,x),Ie=!1},d(x){x&&(b(e),b(T),b(d),b(He),b(ae)),ie(w),ie(F),nn(O,x),V&&V.d(),ie(ce),it=!1,lt(bt)}}}function $e(r){var t;const e=document.getElementsByClassName("selected")[0];e&&e.classList.remove("selected"),(t=document.getElementById(r.target.id))==null||t.classList.add("selected")}function qn(r,e,t){let n;xe(r,_e,u=>t(1,n=u));let i=0,o="overworld";const a=["home","builder","talents","discord","aen","support","privacy"],s=["Stats","Talents","Mantras","Weapons","Summary"];function l(u){const E=document.getElementById("builder-container");E&&(u.target.checked?(E.style.maxWidth="none",E.style.width="95vw"):(E.style.maxWidth="475px",E.style.width="100vw",s.forEach(D=>{D!=="Stats"&&(document.getElementById(D).style.display="none")})))}function c(u){var D;const E=u.target.id;Ue[o]!==u.target.classList[0]&&(u.target.classList.add("active-theme"),(D=document.querySelector(`#${o}`))==null||D.classList.remove("active-theme"),w(E))}function w(u){u!=="festive"&&u!=="black-silence"&&localStorage.setItem("_dwb.theme",u),o=u;const E=document.querySelector(":root"),D=Ue[u];Object.entries(D).forEach(([R,ge])=>{E.style.setProperty(R,ge)})}async function h(){try{const u=await fetch(`${Ae}/user/me`,{credentials:"include"}),E=document.querySelector("#login"),D=document.querySelector("#logout");if(!u.ok){if(u.status===401){y(E,D);return}throw new Error(`Auth request failed with status ${u.status}`)}const R=await u.json();if(R&&R.id)p(R,E,D);else throw new Error("Invalid user data received")}catch(u){throw u}}function p(u,E,D){u.avatar=`https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`,_e.set(u),E&&(E.href=`/profile/u/${u.username}`,E.innerHTML="Profile"),D&&(D.style.display="block",D.addEventListener("click",_))}function y(u,E){u&&(u.href=`${Ae}/login`,u.innerHTML="Log in"),E&&(E.style.display="none"),_e.set(null)}async function _(){try{await fetch(`${Ae}/logout`,{credentials:"include"}),_e.set(null),location.reload()}catch(u){console.error("Logout error:",u),Ce.push("Failed to log out. Please try again.")}}Re(()=>{var ge,be;const u=window.location.pathname.substring(1),E=u&&a.includes(u)?u:"home";(ge=document.querySelector(`#${E}`))==null||ge.classList.add("selected"),(be=document.querySelector("#overworld"))==null||be.classList.add("active-theme");const D=localStorage.getItem("_dwb.theme")||"overworld";w(D),new URLSearchParams(window.location.search).get("id")==="WORKSHOP"&&w("black-silence"),h().catch(se=>{console.error("Failed to initialize auth:",se),Ce.push("Authentication failed. Some features may be unavailable.");const F=document.querySelector("#login"),ye=document.querySelector("#logout");F&&(F.href=`${Ae}/login`,F.innerHTML="Log in"),ye&&(ye.style.display="none"),_e.set(null)})});function m(){t(0,i=Jt.innerWidth)}return[i,n,l,c,m,()=>document.querySelector(".nav.right").classList.toggle("active"),()=>document.querySelector(".nav.left").classList.toggle("active"),()=>document.querySelector(".nav.left").classList.toggle("active"),()=>document.querySelector(".nav.right").classList.toggle("active")]}class On extends Le{constructor(e){super(),Se(this,e,qn,Pn,Ee,{})}}function Vn(r){let e,t='<div class="icon"><img id="loading-icon" src="/ouroboros.png" alt="loading icon" class="svelte-19nvfll"/> <p>Loading...</p></div>';return{c(){e=k("div"),e.innerHTML=t,this.h()},l(n){e=$(n,"DIV",{id:!0,class:!0,"data-svelte-h":!0}),z(e)!=="svelte-fzl1v0"&&(e.innerHTML=t),this.h()},h(){f(e,"id","loading-screen"),f(e,"class","svelte-19nvfll")},m(n,i){A(n,e,i)},p:Y,i:Y,o:Y,d(n){n&&b(e)}}}class zn extends Le{constructor(e){super(),Se(this,e,null,Vn,Ee,{})}}function Bn(r){let e;const t=r[3].default,n=zt(t,r,r[2],null);return{c(){n&&n.c()},l(i){n&&n.l(i)},m(i,o){n&&n.m(i,o),e=!0},p(i,[o]){n&&n.p&&(!e||o&4)&&Bt(n,t,i,i[2],e?Ut(t,i[2],o,null):Nt(i[2]),null)},i(i){e||(H(n,i),e=!0)},o(i){P(n,i),e=!1},d(i){n&&n.d(i)}}}function Nn(r,e,t){let n;xe(r,_e,m=>t(8,n=m));let{$$slots:i={},$$scope:o}=e,{interval:a=3e4}=e,{minTimeActive:s=5e3}=e,l=Date.now(),c,w=!1,h,p=[];function y(){l=Date.now()}async function _(){const m=Date.now()-l;if(!(!w||m>s||!n))try{const v=await fetch(`${Ae}/user/heartbeat`,{method:"POST",headers:{"content-type":"application/json"},credentials:"include"});if(v.status===429){const d=await v.json(),C=parseInt(v.headers.get("Retry-After")||d.retryAfter||"60");c&&(clearInterval(c),setTimeout(()=>{c=setInterval(_,a),_()},C*1e3));return}if(!v.ok)throw new Error("Heartbeat failed");if(!(await v.json()).success)throw new Error("Heartbeat unsuccessful")}catch(v){v.name==="TypeError"&&Ce.push("Lost connection to server. Some features may be unavailable.")}}return Re(()=>{w=!0,_(),["mousemove","keydown","click","scroll","touchstart"].forEach(v=>{typeof window<"u"&&(window.addEventListener(v,y),p.push({event:v,handler:y}))}),c=setInterval(_,a),typeof window<"u"&&(h=()=>{Date.now()-l<=s&&n&&_()},window.addEventListener("beforeunload",h))}),Rt(()=>{w=!1,c&&clearInterval(c),typeof window<"u"&&(p.forEach(({event:m,handler:v})=>{window.removeEventListener(m,v)}),h&&window.removeEventListener("beforeunload",h))}),r.$$set=m=>{"interval"in m&&t(0,a=m.interval),"minTimeActive"in m&&t(1,s=m.minTimeActive),"$$scope"in m&&t(2,o=m.$$scope)},[a,s,o,i]}class Un extends Le{constructor(e){super(),Se(this,e,Nn,Bn,Ee,{interval:0,minTimeActive:1})}}function Rn(r){let e,t,n=r[1]&&Vt();const i=r[5].default,o=zt(i,r,r[4],null);return{c(){n&&n.c(),e=L(),o&&o.c()},l(a){n&&n.l(a),e=S(a),o&&o.l(a)},m(a,s){n&&n.m(a,s),A(a,e,s),o&&o.m(a,s),t=!0},p(a,s){a[1]?n?s&2&&H(n,1):(n=Vt(),n.c(),H(n,1),n.m(e.parentNode,e)):n&&(De(),P(n,1,1,()=>{n=null}),je()),o&&o.p&&(!t||s&16)&&Bt(o,i,a,a[4],t?Ut(i,a[4],s,null):Nt(a[4]),null)},i(a){t||(H(n),H(o,a),t=!0)},o(a){P(n),P(o,a),t=!1},d(a){a&&b(e),n&&n.d(a),o&&o.d(a)}}}function Gn(r){let e,t;return e=new zn({}),{c(){ne(e.$$.fragment)},l(n){ue(e.$$.fragment,n)},m(n,i){re(e,n,i),t=!0},p:Y,i(n){t||(H(e.$$.fragment,n),t=!0)},o(n){P(e.$$.fragment,n),t=!1},d(n){ie(e,n)}}}function Vt(r){let e,t;return e=new Un({}),{c(){ne(e.$$.fragment)},l(n){ue(e.$$.fragment,n)},m(n,i){re(e,n,i),t=!0},i(n){t||(H(e.$$.fragment,n),t=!0)},o(n){P(e.$$.fragment,n),t=!1},d(n){ie(e,n)}}}function Wn(r){let e,t=`<meta charset="utf-8"/> <link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&amp;display=swap" rel="stylesheet"/> <script>var global = global || window;

		//
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('js', new Date());

		gtag('config', 'G-00M516D817');<\/script> <style lang="scss">/* CSS variables */
		:root {
			--button-background: #04100d;
			--background: radial-gradient(#18221a, #04100d);
			--color: white;
			--container-background: rgba(216, 215, 202, 1);
		}
		body {
			display: flex;
			align-items: center;
			flex-direction: column;
			padding: 60px;
			background: var(--background);
			min-height: 600px;
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			overflow-x: hidden;
		}
		.black-silence {
			background: #171717 !important;
			color: white !important;
		}
		/* Festive stuff! 
		.festive-grid-item {
			border: 5px solid transparent !important;
			border-image: url(/borderthin-festive.png) 25% repeat !important;
			border-image-width: 5px !important;
			background: white;
		}
		.festive-builder-container {
			border: 5px solid transparent !important;
			border-image: url(/border-festive.png) 25% repeat !important;
			border-image-width: 10px !important;
		}
		.festive {
			background: radial-gradient(#820016, #45000c);
		}
		.snow-container {
			position: fixed;
			top: 0;
			left: 0;
			overflow: hidden;
			width: 100vw;
			height: 100vh;
			z-index: 99999;
			pointer-events: none;
		}

		.snowflake {
			position: absolute !important;
			background-color: white;
			border-radius: 50%;
			opacity: 0.8;
			pointer-events: none;
		}

		@keyframes fall {
			0% {
				opacity: 0;
				transform: translateY(0);
			}
			10% {
				opacity: 1;
			}
			100% {
				opacity: 0.5;
				transform: translateY(100vh);
			}
		}

		@keyframes diagonal-fall {
			0% {
				opacity: 0;
				transform: translate(0, 0);
			}
			10% {
				opacity: 1;
			}
			100% {
				opacity: 0.25;
				transform: translate(10vw, 100vh);
			}
		}*/
		.fixed {
			position: fixed;
			color: white;
			border: 1px solid transparent;
			border-image: url(/border.png) 45%;
			border-image-width: 15px;
			border-image-outset: 2px;
			padding: 5px;
		}
		/* */
		.toggle-desktop {
			margin: 5px;
			color: #202020;
			border: 1px solid transparent;
			border-image: url(/border.png) 45%;
			border-image-width: 15px;
			border-image-outset: 2px;
			padding: 5px;
			font-size: 14px;
			background-color: hsl(56, 16%, 82%);
		}
		/* */
		.footer {
			font-family: 'Lora', 'sans-serif';
			font-size: 12px;
			padding: 5px;
		}
		.selected {
			color: white !important;
			background-color: #1a1a1a !important;
		}
		/* Loading */
		.loading {
			display: none;
		}
		#footer-ad {
			width: 100%;
		}
		#first-med-rect {
			display: none;
		}
		@media only screen and (max-width: 600px) {
			#first-med-rect {
				display: block;
			}
		}
		._toastItem {
			border-image: url(/borderthin.png) 45% !important;
			border-image-width: 10px !important;
			border-image-outset: 2px !important;
			background: hsl(56, 16%, 82%) !important;
			color: black !important;
		}

		input:disabled,
		select:disabled {
			cursor: not-allowed;
		}</style>`,n,i,o,a,s,l,c,w,h,p,y,_;o=new Tn({props:{options:r[2]}}),s=new On({});const m=[Gn,Rn],v=[];function T(d,C){return d[0]?0:1}return h=T(r),p=v[h]=m[h](r),{c(){e=k("head"),e.innerHTML=t,n=L(),i=k("div"),ne(o.$$.fragment),a=L(),ne(s.$$.fragment),l=L(),c=k("div"),w=L(),p.c(),y=he(),this.h()},l(d){e=$(d,"HEAD",{"data-svelte-h":!0}),z(e)!=="svelte-1v51az5"&&(e.innerHTML=t),n=S(d),i=$(d,"DIV",{class:!0});var C=j(i);ue(o.$$.fragment,C),C.forEach(b),a=S(d),ue(s.$$.fragment,d),l=S(d),c=$(d,"DIV",{id:!0}),j(c).forEach(b),w=S(d),p.l(d),y=he(),this.h()},h(){f(i,"class","notifWrapper"),f(c,"id","first-med-rect")},m(d,C){A(d,e,C),A(d,n,C),A(d,i,C),re(o,i,null),A(d,a,C),re(s,d,C),A(d,l,C),A(d,c,C),A(d,w,C),v[h].m(d,C),A(d,y,C),_=!0},p(d,[C]){let u=h;h=T(d),h===u?v[h].p(d,C):(De(),P(v[u],1,1,()=>{v[u]=null}),je(),p=v[h],p?p.p(d,C):(p=v[h]=m[h](d),p.c()),H(p,1),p.m(y.parentNode,y))},i(d){_||(H(o.$$.fragment,d),H(s.$$.fragment,d),H(p),_=!0)},o(d){P(o.$$.fragment,d),P(s.$$.fragment,d),P(p),_=!1},d(d){d&&(b(e),b(n),b(i),b(a),b(l),b(c),b(w),b(y)),ie(o),ie(s,d),v[h].d(d)}}}function Yn(r,e,t){let n,i;xe(r,gn,c=>t(0,n=c)),xe(r,_e,c=>t(1,i=c));let{$$slots:o={},$$scope:a}=e;const s={};let l=!1;return Re(async()=>{}),r.$$set=c=>{"$$scope"in c&&t(4,a=c.$$scope)},r.$$.update=()=>{r.$$.dirty&9&&(n!=null?(document.body.style.overflowY="hidden",t(3,l=!0),console.log(typeof window.ramp<"u")):l&&(document.body.style.overflowY="scroll"))},[n,i,s,l,a,o]}class sr extends Le{constructor(e){super(),Se(this,e,Yn,Wn,Ee,{})}}export{sr as component,ir as universal};
//# sourceMappingURL=0.Bq8xyTit.js.map
