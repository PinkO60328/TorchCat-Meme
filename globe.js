// Torch Cat globe — three.js dotted-land globe with fresnel atmosphere, arcs and travelling packets.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';
const host=document.getElementById('globe');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let gl;try{gl=!!document.createElement('canvas').getContext('webgl2')||!!document.createElement('canvas').getContext('webgl')}catch(e){}
if(host&&gl){
const mq=matchMedia('(max-width: 767px)');let mobile=mq.matches;
const R=1.6,G='#6EE787',DEEP='#58E088',DARK='#1E4230',BG='#060E0B';
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));host.appendChild(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(0,0,5.85);
const root=new THREE.Group(),spin=new THREE.Group();spin.scale.setScalar(.75);root.add(spin);scene.add(root);
const ll=(lat,lng,r)=>{const p=(90-lat)*Math.PI/180,t=(lng+180)*Math.PI/180;return new THREE.Vector3(-r*Math.sin(p)*Math.cos(t),r*Math.cos(p),r*Math.sin(p)*Math.sin(t))};
// base + faint wireframe
spin.add(new THREE.Mesh(new THREE.SphereGeometry(R*.999,64,64),new THREE.MeshBasicMaterial({color:BG})));
const facingVS=`varying float vF;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vF=max(dot(normalize(normalMatrix*normalize(position)),normalize(-mv.xyz)),0.);gl_Position=projectionMatrix*mv;}`;
const wire=new THREE.Mesh(new THREE.SphereGeometry(R*1.001,32,32),new THREE.ShaderMaterial({uniforms:{c:{value:new THREE.Color(DARK)}},vertexShader:facingVS,fragmentShader:`uniform vec3 c;varying float vF;void main(){gl_FragColor=vec4(c,mix(.05,.12,smoothstep(0.,.92,vF)));}`,wireframe:true,transparent:true,depthWrite:false}));spin.add(wire);
// atmosphere (back-side fresnel, additive)
const atm=new THREE.ShaderMaterial({uniforms:{c:{value:new THREE.Color(G)},k:{value:reduce?.35:0}},vertexShader:`varying vec3 n;varying vec3 v;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform vec3 c;uniform float k;varying vec3 n;varying vec3 v;void main(){float f=pow(1.-max(dot(v,n),0.),3.);gl_FragColor=vec4(c,f*k);}`,side:THREE.BackSide,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false});
spin.add(new THREE.Mesh(new THREE.SphereGeometry(R*1.018,64,64),atm));
// land dots that assemble from scattered positions
const ptsMat=new THREE.ShaderMaterial({uniforms:{uA:{value:reduce?1:0},uS:{value:mobile?.045:.055},c:{value:new THREE.Color(DEEP)}},
vertexShader:`attribute vec3 aS;uniform float uA,uS;varying float vF;void main(){float st=fract(sin(dot(aS.xy,vec2(12.9898,78.233)))*43758.5453)*.38;float t=clamp((uA-st)/max(1.-st,.001),0.,1.);t=1.-pow(1.-t,3.);vec3 p=mix(aS,position,t);vec4 mv=modelViewMatrix*vec4(p,1.);vF=max(dot(normalize(normalMatrix*normalize(p)),normalize(-mv.xyz)),0.);gl_PointSize=uS*(280./max(-mv.z,.001))*${renderer.getPixelRatio().toFixed(2)};gl_Position=projectionMatrix*mv;}`,
fragmentShader:`uniform vec3 c;varying float vF;void main(){vec2 q=gl_PointCoord-.5;if(dot(q,q)>.25)discard;gl_FragColor=vec4(c,mix(.25,1.,smoothstep(0.,.92,vF)));}`,transparent:true,depthWrite:false});
const img=new Image();img.src='img/land-mask.png?v=1';img.onload=()=>{const w=img.width,h=img.height,cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,w,h).data,land=[];
for(let y=0;y<h*.84;y+=1)for(let i=0;i<w;i+=1){if(d[(y*w+i)*4]>30)land.push([i,y])}
const N=mobile?4500:12000,step=Math.max(1,Math.floor(land.length/N)),pos=new Float32Array(N*3),sc=new Float32Array(N*3),v=new THREE.Vector3(),r=new THREE.Vector3();
for(let k=0;k<N;k++){const[px,py]=land[(k*step)%land.length];const p=ll(90-(py+.5)/h*180,(px+.5)/w*360-180,R);pos.set([p.x,p.y,p.z],k*3);
v.copy(p).normalize();const s=R*(1.55+.85*Math.random());r.set(Math.random()-.5,Math.random()-.5,Math.random()-.5);r.addScaledVector(v,-r.dot(v)).normalize().multiplyScalar((Math.random()-.5)*R*.35);const q=v.multiplyScalar(s).add(r);sc.set([q.x,q.y,q.z],k*3)}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aS',new THREE.BufferAttribute(sc,3));spin.add(new THREE.Points(g,ptsMat));ready=performance.now();if(reduce)renderer.render(scene,camera)};
// nodes (Torch Cat "lamp" cities) + arcs
const nodes={ny:[40.7,-74],la:[34,-118],ldn:[51.5,0],tok:[35.7,139.7],sg:[1.3,103.8],dxb:[25.2,55.3],sao:[-23.5,-46.6],syd:[-33.9,151.2],lag:[6.5,3.4]};
const routes=[['ny','ldn'],['ny','la'],['ny','sao'],['ldn','dxb'],['dxb','sg'],['sg','tok'],['tok','la'],['sg','syd'],['ldn','lag'],['lag','sao'],['ny','dxb']];
const tc=document.createElement('canvas');tc.width=tc.height=256;const t2=tc.getContext('2d'),gr=t2.createRadialGradient(128,128,0,128,128,128);
[[0,1],[.35,.85],[.65,.25],[1,0]].forEach(([o,a])=>gr.addColorStop(o,`rgba(255,255,255,${a})`));t2.fillStyle=gr;t2.fillRect(0,0,256,256);const tex=new THREE.CanvasTexture(tc);
const sm=o=>new THREE.SpriteMaterial({map:tex,color:G,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false});
const nodeMat=sm(.95),headMat=sm(1),trailMat=sm(.55),NS=.09;
const nodeSpr={};for(const k in nodes){const s=new THREE.Sprite(nodeMat.clone());s.position.copy(ll(...nodes[k],R*1.017));s.scale.setScalar(NS);s.userData.f=0;spin.add(s);nodeSpr[k]=s}
const arcs=routes.map(([a,b])=>{const A=ll(...nodes[a],1).normalize(),B=ll(...nodes[b],1).normalize(),pts=[];for(let i=0;i<=64;i++){const t=i/64;pts.push(A.clone().lerp(B,t).normalize().multiplyScalar(R*1.045*(1+.14*Math.sin(Math.PI*t))))}
spin.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:DARK,transparent:true,opacity:.6})));return{to:b,pts}});
const P=[];const PN=mobile?2:5;for(let i=0;i<PN;i++){const h=new THREE.Sprite(headMat);h.scale.setScalar(.075);h.visible=false;spin.add(h);const tr=[];for(let j=0;j<12;j++){const s=new THREE.Sprite(trailMat);s.scale.setScalar(.056*(1-(j+1)/13));s.visible=false;spin.add(s);tr.push(s)}P.push({a:false,r:0,p:0,s:.005,h,tr})}
const at=(pts,t,out)=>{const f=Math.min(64,Math.floor(64*Math.max(0,Math.min(1,t))));out.copy(pts[f])};
const launch=(o,first)=>{o.a=true;o.r=Math.floor(Math.random()*arcs.length);o.p=first?0:.55*Math.random();o.s=.0035+.0045*Math.random()};
// layout: globe sits right of hero copy (desktop), centred behind on mobile
const size=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();root.position.x=mobile?.38*Math.min(1,w/h):1.12*Math.min(1.25,w/h/1.6);ptsMat.uniforms.uS.value=mobile?.045:.055};
new ResizeObserver(size).observe(host);mq.addEventListener('change',e=>{mobile=e.matches;size()});size();
const restY=-.5,restX=.19;let rotY=restY,curX=restX,curY=0,ptr={x:0,y:0},ready=0,visible=true,last=performance.now(),timer=0,next=.6;
addEventListener('pointermove',e=>{ptr.x=e.clientX/innerWidth*2-1;ptr.y=-(e.clientY/innerHeight*2)+1},{passive:true});
new IntersectionObserver(([e])=>{visible=e.isIntersecting},{threshold:.05}).observe(host);
spin.rotation.set(restX,restY,0);
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;if(!visible||document.hidden||reduce)return;
if(ready){const t=(now-ready)/2200;ptsMat.uniforms.uA.value=Math.min(1,t);atm.uniforms.k.value=.35*Math.min(1,Math.max(0,t-.3)/.7);
if(t>.8){if(!P.some(o=>o.a))launch(P[0],true);timer+=dt;if(timer>next){timer=0;next=.35+1.4*Math.random();const f=P.find(o=>!o.a);if(f)launch(f,false)}}}
rotY+=2*Math.PI/90*dt;const ty=Math.max(-1,Math.min(1,ptr.x))*.4538,tx=restX-Math.max(-1,Math.min(1,ptr.y))*.2443;curY+=(ty-curY)*.045;curX+=(tx-curX)*.045;spin.rotation.y=rotY+curY;spin.rotation.x=curX;
for(const o of P){if(!o.a){o.h.visible=false;o.tr.forEach(s=>s.visible=false);continue}o.p+=o.s*dt*60;const A=arcs[o.r];if(o.p>=1){o.a=false;nodeSpr[A.to].userData.f=1;continue}
at(A.pts,o.p,o.h.position);o.h.visible=true;o.tr.forEach((s,j)=>{const q=o.p-.007*(j+1);if(q<=0){s.visible=false;return}at(A.pts,q,s.position);s.visible=true})}
for(const k in nodeSpr){const s=nodeSpr[k],f=s.userData.f;s.scale.setScalar(NS*(1+.85*f));s.material.opacity=Math.min(1,.95+.65*f);s.userData.f=Math.max(0,f-dt/.35)}
renderer.render(scene,camera)}
if(reduce){size();renderer.render(scene,camera)}requestAnimationFrame(frame);
}
