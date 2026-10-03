import {clamp} from './gestures.js';
export const themes=[{name:'Rose aurora',h:340,s:56},{name:'Champagne',h:30,s:44},{name:'Lilac moon',h:275,s:45}];
const TAU=Math.PI*2,rand=(a,b)=>a+Math.random()*(b-a),ease=n=>1-(1-clamp(n,0,1))**3;
const cache=new Map();
function flowerSprite(theme,type,stage){
 const key=`${theme}-${type}-${stage}`;if(cache.has(key))return cache.get(key);
 const c=document.createElement('canvas');c.width=c.height=360;const p=c.getContext('2d');p.translate(180,180);const {h,s}=themes[theme],opening=.2+stage/8*.8;
 const halo=p.createRadialGradient(0,0,8,0,0,178);halo.addColorStop(0,`hsla(${h},80%,77%,.27)`);halo.addColorStop(.65,`hsla(${h},80%,77%,.09)`);halo.addColorStop(1,'#fff0');p.fillStyle=halo;p.fillRect(-180,-180,360,360);
 if(type===0){
  for(let ring=0;ring<6;ring++){
   const n=ring<3?7:5,R=(139-ring*19)*(opening+(1-opening)*ring/7);
   for(let j=0;j<n;j++){
    p.save();p.rotate(j/n*TAU+ring*2.4);p.translate(0,-R*.075);p.rotate(.25+ring*.055);
    const g=p.createLinearGradient(-R*.4,-R,R*.15,10);g.addColorStop(0,`hsl(${h+8},${s}%,${88-ring*2}%)`);g.addColorStop(.3,`hsl(${h},${s}%,${72-ring*3}%)`);g.addColorStop(.77,`hsl(${h-7},${s+5}%,${47-ring*2}%)`);g.addColorStop(1,`hsl(${h-9},${s}%,21%)`);
    p.fillStyle=g;p.beginPath();p.moveTo(0,5);p.bezierCurveTo(-R*.24,-R*.19,-R*.59,-R*.59,-R*.43,-R*.86);p.bezierCurveTo(-R*.33,-R*1.04,-R*.11,-R*1.1,R*.02,-R*.94);p.bezierCurveTo(R*.22,-R*1.09,R*.52,-R*.91,R*.46,-R*.71);p.bezierCurveTo(R*.46,-R*.34,R*.19,-R*.12,0,5);p.fill();
    p.strokeStyle=`hsla(${h+20},75%,92%,.35)`;p.lineWidth=.85;p.beginPath();p.moveTo(-R*.43,-R*.86);p.bezierCurveTo(-R*.33,-R*1.04,-R*.11,-R*1.1,R*.02,-R*.94);p.bezierCurveTo(R*.22,-R*1.09,R*.52,-R*.91,R*.46,-R*.71);p.stroke();
    p.strokeStyle='#ffeae70e';p.lineWidth=.6;for(let vein=-2;vein<3;vein++){p.beginPath();p.moveTo(0,0);p.quadraticCurveTo(vein*R*.09,-R*.45,vein*R*.13,-R*.84);p.stroke();}p.restore();
   }
  }
 }else{
  const n=type===1?6:9;
  for(let ring=0;ring<2;ring++)for(let j=0;j<n;j++){
   const R=(142-ring*36)*opening;p.save();p.rotate(j/n*TAU+ring*.4);p.scale(type===1?.9:1,1);
   const g=p.createLinearGradient(0,-R,0,0);g.addColorStop(0,`hsl(${h+14},${s-8}%,94%)`);g.addColorStop(.42,`hsl(${h},${s}%,${type===1?83:74}%)`);g.addColorStop(.8,`hsl(${h-12},${s+10}%,48%)`);g.addColorStop(1,'#f6d9a5');
   p.fillStyle=g;p.beginPath();p.moveTo(0,0);if(type===1){p.bezierCurveTo(-R*.55,-R*.31,-R*.27,-R*.69,0,-R);p.bezierCurveTo(R*.3,-R*.8,R*.55,-R*.26,0,0);}else{p.bezierCurveTo(-R*.18,-R*.23,-R*.52,-R*.87,-R*.17,-R);p.quadraticCurveTo(0,-R*.96,R*.17,-R);p.bezierCurveTo(R*.52,-R*.87,R*.18,-R*.23,0,0);}p.fill();p.strokeStyle='#fff5';p.lineWidth=.7;p.stroke();p.strokeStyle='#f2e6cb35';for(let k=-2;k<3;k++){p.beginPath();p.moveTo(0,0);p.quadraticCurveTo(k*R*.11,-R*.48,k*R*.025,-R*.91);p.stroke();}p.restore();
  }
  const center=p.createRadialGradient(-5,-4,1,0,0,22);center.addColorStop(0,'#fff4c1');center.addColorStop(.5,'#e5ad4e');center.addColorStop(1,'#915526');p.fillStyle=center;p.beginPath();p.arc(0,0,type===1?10:23,0,TAU);p.fill();
  for(let i=0;i<38;i++){const a=i*2.399,r=Math.sqrt(i/38)*(type===1?39:22);const x=Math.cos(a)*r,y=Math.sin(a)*r;p.strokeStyle='#fff0b9aa';p.lineWidth=.8;if(type===1){p.beginPath();p.moveTo(0,0);p.quadraticCurveTo(x*.3,y*.7-10,x,y);p.stroke();}p.fillStyle=i%2?'#fff4bf':'#d89436';p.beginPath();p.ellipse(x,y,type===1?3:1.7,type===1?1.7:1.3,a,0,TAU);p.fill();}
 }
 cache.set(key,c);return c;
}
function leaf(ctx,x,y,size,angle){ctx.save();ctx.translate(x,y);ctx.rotate(angle);const g=ctx.createLinearGradient(0,0,size,0);g.addColorStop(0,'#2c6550');g.addColorStop(.6,'#6ea985');g.addColorStop(1,'#d3e4a8');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(size*.25,-size*.4,size*.73,-size*.28,size,0);ctx.bezierCurveTo(size*.7,size*.24,size*.3,size*.2,0,0);ctx.fill();ctx.strokeStyle='#e6f0c87a';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(size,0);ctx.stroke();ctx.restore();}
export class Garden{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.theme=0;this.time=0;this.sprouts=[];this.sparks=[];this.bouquets=[];this.reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;this.resize();}
 resize(){this.w=innerWidth;this.h=innerHeight;this.dpr=Math.min(devicePixelRatio||1,1.75);this.canvas.width=this.w*this.dpr;this.canvas.height=this.h*this.dpr;this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);this.clear();}
 clear(){this.sprouts=[];this.sparks=[];this.bouquets=[];this.ctx.clearRect(0,0,this.w,this.h);}
 color(){this.theme=(this.theme+1)%themes.length;return themes[this.theme];}
 bloom(x,y,size,type=0,life=7){this.sprouts.push({x,y,size,type,age:0,life,theme:this.theme,angle:rand(-.6,.6)});this.sprouts=this.sprouts.slice(-40);}
 burst(x,y,count=40){for(let i=0;i<(this.reduced?Math.min(count,10):count);i++){const a=rand(0,TAU),v=rand(30,160);this.sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-25,life:rand(1.5,3.7),age:0,angle:rand(0,TAU),spin:rand(-3,3),size:rand(3,10),petal:i%3!==0,h:themes[this.theme].h});}this.sparks=this.sparks.slice(-240);}
 release(x,y){this.bloom(x,y,rand(64,92),1,8);for(let i=0;i<4;i++){let a=i*TAU/4+.5;this.bloom(x+Math.cos(a)*65,y+Math.sin(a)*60,rand(24,40),i%2?2:0,6);}this.burst(x,y,50);}
 bouquet(x,y){this.bouquets.push({x,y,age:0,theme:this.theme});this.bouquets=this.bouquets.slice(-2);this.burst(x,y,90);}
 drawFlower(x,y,size,type,opening,angle=0,theme=this.theme){const c=this.ctx;c.save();c.translate(x,y);c.rotate(angle);const stage=Math.round(clamp(opening,0,1)*8);c.drawImage(flowerSprite(theme,type,stage),-size,-size,size*2,size*2);c.restore();}
 stem(x,y,tx,ty,size,alpha=1){const c=this.ctx;c.save();c.globalAlpha*=alpha;c.strokeStyle='#749e76';c.lineWidth=Math.max(1,size*.024);c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+size*.22,y-size*.35,tx-size*.19,ty+size*.3,tx,ty);c.stroke();leaf(c,x+(tx-x)*.3,y+(ty-y)*.35,size*.48,-.55);leaf(c,x+(tx-x)*.58,y+(ty-y)*.55,size*.35,-2.8);c.restore();}
 draw(dt,hands){this.time+=dt;const c=this.ctx;c.clearRect(0,0,this.w,this.h);
  for(const v of hands){
   if(v.opacity<.01)continue;c.save();c.globalAlpha=v.opacity*(this.bouquets.some(b=>b.age<9)?.18:1);
   if(v.open>.02){const grow=ease(v.open),size=v.size*(.18+.82*grow),fy=v.y-size*.95;this.stem(v.x,v.y+size*.2,v.x,fy,size,grow);this.drawFlower(v.x,fy,size,0,v.open,Math.sin(this.time*.6)*.04);const a=this.time*.8;c.strokeStyle='#ffe1ba33';c.lineWidth=.8;c.beginPath();c.ellipse(v.x,v.y+4,size*.55,size*.15,-.12,0,TAU);c.stroke();for(let i=0;i<5;i++){const angle=a+i*TAU/5;c.fillStyle='#ffe7bebb';c.beginPath();c.arc(v.x+Math.cos(angle)*size*.6,fy+Math.sin(angle)*size*.65,1.2,0,TAU);c.fill();}}
   if(v.charge>0){const r=10+v.charge*18,g=c.createRadialGradient(v.px,v.py,0,v.px,v.py,r*3);g.addColorStop(0,'#fff3daee');g.addColorStop(.15,'#ffd6dfbb');g.addColorStop(.45,'#f6afd33a');g.addColorStop(1,'#f5b5d000');c.fillStyle=g;c.fillRect(v.px-r*3,v.py-r*3,r*6,r*6);c.strokeStyle='#fff0dbaa';c.lineWidth=1;c.beginPath();c.arc(v.px,v.py,r,-Math.PI/2,-Math.PI/2+TAU*v.charge);c.stroke();for(let i=0;i<6;i++){let a=this.time*2+i*TAU/6;c.fillStyle='#fff0ca';c.beginPath();c.arc(v.px+Math.cos(a)*r*1.5,v.py+Math.sin(a)*r*.8,1.5,0,TAU);c.fill();}}
   c.restore();
  }
  for(const b of this.bouquets){b.age+=dt;const intro=ease(b.age/1.5),fade=clamp((11-b.age)/2,0,1),scale=Math.min(this.w/640,this.h/780,1.05);c.save();c.globalAlpha=fade;c.translate(b.x,b.y);c.scale(scale,scale);const layout=[[-100,-103,58,1],[104,-117,55,1],[-25,-160,58,0],[-126,-20,63,2],[116,-18,61,0],[-57,-57,73,0],[27,-70,89,0],[2,33,61,1]];for(let i=0;i<layout.length;i++){const[x,y,r,type]=layout[i],grow=ease((b.age-i*.09)/1.25);this.stem(0,128,x*intro,y*intro,r*grow,1);this.drawFlower(x*intro,y*intro,r*grow,type,grow,i*.3,b.theme);}c.strokeStyle='#f6c0cf';c.lineWidth=2;c.beginPath();c.moveTo(0,113);c.bezierCurveTo(-72,74,-62,155,0,113);c.bezierCurveTo(62,75,70,155,0,113);c.moveTo(0,113);c.quadraticCurveTo(-32,163,-10,175);c.stroke();
   // A heart constellation assembled from miniature blossoms, revealed progressively.
   for(let i=0;i<32*intro;i++){const a=i/32*TAU,x=16*Math.sin(a)**3*14,y=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*14-25;const pulse=1+Math.sin(this.time+i)*.08;this.drawFlower(x,y,(i%3===0?15:8)*pulse,2,1,a,b.theme);}c.restore();}
  this.bouquets=this.bouquets.filter(b=>b.age<11);
  for(const f of this.sprouts){f.age+=dt;c.save();c.globalAlpha=clamp((f.life-f.age)/1.4,0,1);const growth=ease(f.age/.85),float=this.reduced?0:Math.sin(this.time+f.angle)*5;this.drawFlower(f.x,f.y-f.age*3+float,f.size*growth,f.type,growth,f.angle,f.theme);c.restore();}this.sprouts=this.sprouts.filter(f=>f.age<f.life);
  for(const p of this.sparks){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=20*dt;p.angle+=p.spin*dt;c.save();c.globalAlpha=clamp((p.life-p.age)/.9,0,1);c.translate(p.x,p.y);c.rotate(p.angle);if(p.petal){c.scale(Math.cos(p.angle)*.45+.6,1);const g=c.createLinearGradient(0,-p.size,0,p.size);g.addColorStop(0,`hsl(${p.h+9},70%,88%)`);g.addColorStop(1,`hsl(${p.h},55%,59%)`);c.fillStyle=g;c.beginPath();c.moveTo(0,p.size);c.bezierCurveTo(-p.size*1.5,-p.size*.4,-p.size,-p.size*1.5,0,-p.size*.6);c.bezierCurveTo(p.size,-p.size*1.5,p.size*1.3,0,0,p.size);c.fill();}else{c.fillStyle='#fff2c5';c.shadowColor='#ffe3aa';c.shadowBlur=8;c.fillRect(-1,-1,2,2);}c.restore();}this.sparks=this.sparks.filter(p=>p.age<p.life);
 }
}
