export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z||0)-(b.z||0));
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Shared by video projection and landmarks: preserve object-fit: cover crop exactly.
export function coverPoint(p,vw,vh,w,h,mirror=true){const s=Math.max(w/vw,h/vh);return{x:((mirror?1-p.x:p.x)*vw-vw/2)*s+w/2,y:(p.y*vh-vh/2)*s+h/2};}
export function describeHand(points){
 if(!points||points.length!==21)return null;
 const scale=Math.max(distance(points[0],points[9]),.025);
 const extended=[8,12,16,20].map(t=>distance(points[t],points[0])>distance(points[t-2],points[0])*1.2);
 const ratio=distance(points[4],points[8])/scale;
 return {palm:{x:(points[0].x+points[5].x+points[9].x+points[17].x)/4,y:(points[0].y+points[5].y+points[9].y+points[17].y)/4},tip:points[8],pinchPoint:{x:(points[4].x+points[8].x)/2,y:(points[4].y+points[8].y)/2},scale,open:extended.filter(Boolean).length>=3,pointing:extended[0]&&!extended[1]&&!extended[2]&&!extended[3],pinchRatio:ratio};
}
export class HandState{
 constructor(){this.openSince=null;this.pinchSince=null;this.lastSeen=-Infinity;this.wasOpen=false;this.lastTrail=null;this.lastTrailTime=-Infinity;this.lastRelease=-Infinity;}
 update(hand,now){
  if(!hand){this.openSince=null;this.pinchSince=null;this.wasOpen=false;this.lastTrail=null;return {open:0,charge:0,release:false,trail:false};}
  if(now-this.lastSeen>850){this.openSince=null;this.pinchSince=null;this.lastTrail=null;}
  this.lastSeen=now;
  const pinching=hand.pinchRatio<(this.pinchSince===null?.29:.43);
  let release=false,charge=0;
  if(pinching){this.pinchSince??=now;charge=clamp((now-this.pinchSince)/1100,0,1);}
  else if(this.pinchSince!==null){release=now-this.pinchSince>=220&&now-this.lastRelease>700;if(release)this.lastRelease=now;this.pinchSince=null;}
  if(hand.open&&!pinching)this.openSince??=now;else this.openSince=null;
  const open=this.openSince===null?0:clamp((now-this.openSince-150)/650,0,1);
  const trail=hand.pointing&&!pinching&&now-this.lastTrailTime>170&&(!this.lastTrail||distance(hand.tip,this.lastTrail)>.035);
  if(trail){this.lastTrail={...hand.tip};this.lastTrailTime=now;}
  return {open,charge,release,trail,pinching};
 }
}
export class BouquetGate{
 constructor(){this.since=null;this.fired=false;this.last=-Infinity;}
 update(hands,now){
  const eligible=hands.length===2&&hands.every(h=>h.open&&h.pinchRatio>.43)&&distance(hands[0].palm,hands[1].palm)<(hands[0].scale+hands[1].scale)*1.5;
  if(!eligible){this.since=null;this.fired=false;return {progress:0,fire:false};}
  this.since??=now;const progress=clamp((now-this.since)/1000,0,1);const fire=progress===1&&!this.fired&&now-this.last>7000;
  if(fire){this.fired=true;this.last=now;}return{progress,fire};
 }
}
// Nearest-neighbour matching avoids swapping flower anchors when MediaPipe reorders hands.
export function matchHands(previous,hands){
 const remaining=new Set(previous.map((_,i)=>i));
 return hands.map(hand=>{let chosen=-1,best=.32;for(const i of remaining){const d=distance(previous[i].hand.palm,hand.palm);if(d<best){best=d;chosen=i;}}
 if(chosen>=0){remaining.delete(chosen);return {...previous[chosen],hand};}return{hand,state:new HandState(),visual:null};});
}
