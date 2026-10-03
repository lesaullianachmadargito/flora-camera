import {describeHand,HandState,BouquetGate,matchHands,coverPoint,clamp} from './gestures.js';
import {Garden} from './art.js';
const $=s=>document.querySelector(s),video=$('#camera'),garden=new Garden($('#flowers'));
let stream=null,detector=null,detectorPromise=null,session=0,busy=false,facing='user',active=false,trackingReady=false,tracks=[],visuals=[],bouquetGate=new BouquetGate(),lastFrame=0,lastInference=0,lastVideo=-1,animation=0,lastHand=0,lastGift=-Infinity,audio=null,sound=false;
function status(text){$('#status span').textContent=text;}
function hint(text,progress=0){$('#hint-text').textContent=text;$('#charge i').style.width=clamp(progress*100,0,100)+'%';}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,5000);}
function project(p){return coverPoint(p,video.videoWidth||640,video.videoHeight||480,garden.w,garden.h,facing==='user');}
async function prepareDetector(){
 if(detector)return detector;if(detectorPromise)return detectorPromise;
 detectorPromise=(async()=>{const {HandLandmarker,FilesetResolver}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs');const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');const options={baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',delegate:'GPU'},runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:.55,minTrackingConfidence:.55};try{return await HandLandmarker.createFromOptions(files,options);}catch{options.baseOptions.delegate='CPU';return await HandLandmarker.createFromOptions(files,options);}})();
 try{detector=await detectorPromise;return detector;}finally{detectorPromise=null;}
}
function stop(message='Kamera dijeda'){session++;stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;active=false;busy=false;trackingReady=false;tracks=[];visuals=[];bouquetGate=new BouquetGate();garden.clear();document.body.classList.remove('live','clean');$('#welcome').hidden=false;$('#hint').hidden=true;$('footer').hidden=true;$('#start').disabled=false;$('#start').innerHTML='Buka kamera <span>↗</span>';$('#flip').disabled=false;status(message);audio?.suspend();}
async function start(){
 if(busy)return;if(!isSecureContext||!navigator.mediaDevices?.getUserMedia){$('#welcome-copy').textContent='Buka melalui HTTPS di Chrome atau Safari agar kamera bisa digunakan.';return;}
 busy=true;const id=++session;$('#start').disabled=true;$('#start').textContent='Membuka kamera…';status('Menunggu izin kamera');
 let acquired;
 try{
  acquired=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:1280},height:{ideal:720}},audio:false});
  if(id!==session){acquired.getTracks().forEach(t=>t.stop());return;}
  stream=acquired;const actualFacing=stream.getVideoTracks()[0].getSettings().facingMode;if(['user','environment'].includes(actualFacing))facing=actualFacing;video.srcObject=stream;video.classList.toggle('rear',facing!=='user');await video.play();if(id!==session)return;
  active=true;document.body.classList.add('live');$('#welcome').hidden=true;$('footer').hidden=false;$('#hint').hidden=false;status('Menyiapkan bunga');hint('Menyiapkan keajaiban…');$('#flip').disabled=true;
  stream.getVideoTracks()[0].addEventListener('ended',()=>{if(id===session)stop('Kamera terputus');},{once:true});
  try{await prepareDetector();if(id!==session)return;trackingReady=true;status('Tampilkan tanganmu');hint('Buka telapak tangan ke kamera');}
  catch(error){if(id!==session)return;status('Deteksi belum siap');hint('Jeda lalu buka kamera lagi');toast('Kamera aktif, tetapi deteksi bunga gagal dimuat. Periksa internet, lalu jeda dan buka kamera lagi.');console.warn('Detector unavailable',error);}
  busy=false;$('#flip').disabled=false;lastVideo=-1;lastHand=performance.now();if(sound)audio?.resume();
 }catch(error){acquired?.getTracks().forEach(t=>t.stop());if(id!==session)return;stop('Kamera belum aktif');const messages={NotAllowedError:'Izinkan akses kamera di pengaturan browser, lalu coba lagi.',NotFoundError:'Kamera tidak ditemukan di perangkat ini.',NotReadableError:'Kamera sedang digunakan aplikasi lain. Tutup aplikasi itu, lalu coba lagi.',OverconstrainedError:'Kamera ini belum mendukung pengaturan yang diminta.'};$('#welcome-copy').textContent=messages[error.name]||'Kamera belum bisa dibuka. Coba lagi melalui Chrome atau Safari.';}
}
$('#start').onclick=start;$('#stop').onclick=()=>stop();
$('#flip').onclick=async()=>{if(busy)return;const next=facing==='user'?'environment':'user';stop();facing=next;await start();};
function processHands(results,now){
 const observed=results.landmarks.map(describeHand).filter(Boolean);tracks=matchHands(tracks,observed);const live=new Set();let currentHint='Buka telapak tangan ke kamera',progress=0;
 for(const track of tracks){
  const hand=track.hand,action=track.state.update(hand,now),p=project(hand.palm),pinch=project(hand.pinchPoint),tip=project(hand.tip);
  const scale=Math.max(garden.w/(video.videoWidth||640),garden.h/(video.videoHeight||480));const size=clamp(hand.scale*(video.videoWidth||640)*scale*.8,48,Math.min(150,garden.w*.3));
  if(!track.visual){track.visual={x:p.x,y:p.y,px:pinch.x,py:pinch.y,tx:p.x,ty:p.y,tpx:pinch.x,tpy:pinch.y,size,open:0,targetOpen:0,charge:0,opacity:0,present:true};visuals.push(track.visual);}
  const v=track.visual;Object.assign(v,{tx:p.x,ty:p.y,tpx:pinch.x,tpy:pinch.y,size,targetOpen:action.open,charge:action.charge,present:true});live.add(v);
  if(action.open>.1){currentHint='Ia mekar karena hadirmu';progress=action.open;}
  if(action.pinching){currentHint=action.charge>.7?'Lepaskan. Lihat keajaibannya.':'Tahan cubitan, kumpulkan cahaya';progress=action.charge;}
  if(action.release){garden.release(pinch.x,pinch.y);chime();lastGift=now;}
  if(action.trail){garden.bloom(tip.x,tip.y,20+Math.random()*14,2,5);currentHint='Lukis bunga di udara';progress=1;}
 }
 for(const v of visuals)if(!live.has(v)){v.present=false;v.charge=0;}
 const bouquet=bouquetGate.update(observed,now);
 if(bouquet.progress>0){currentHint=bouquet.fire?'Satu buket, hanya untukmu.':'Dekatkan dua telapak, tahan sebentar';progress=bouquet.progress;}
 if(bouquet.fire){const a=project(observed[0].palm),b=project(observed[1].palm);garden.bouquet(clamp((a.x+b.x)/2,garden.w*.25,garden.w*.75),clamp((a.y+b.y)/2,garden.h*.3,garden.h*.7));chime(true);lastGift=now;}
 if(observed.length){lastHand=now;status(observed.length===2?'Dua tangan terhubung':'Mengikuti tanganmu');hint(currentHint,progress);}
 else if(now-lastHand>650){status('Mencari tangan');hint('Tampilkan seluruh tangan di tempat terang');}
 if(now-lastGift<2400)hint('Untuk seseorang yang membuat duniamu mekar',1);
}
function frame(now){const dt=Math.min((now-lastFrame)/1000||.016,.15);lastFrame=now;
 if(active&&trackingReady&&video.readyState>=2&&now-lastInference>85&&video.currentTime!==lastVideo){lastVideo=video.currentTime;lastInference=now;try{processHands(detector.detectForVideo(video,now),now);}catch(error){trackingReady=false;tracks=[];visuals.forEach(v=>{v.present=false;v.charge=0;});hint('Deteksi terhenti. Jeda dan buka kamera lagi.');status('Kamera aktif');console.warn('Inference stopped',error);}}
 for(const v of visuals){const a=1-Math.exp(-dt*13);v.x+=(v.tx-v.x)*a;v.y+=(v.ty-v.y)*a;v.px+=(v.tpx-v.px)*a;v.py+=(v.tpy-v.py)*a;v.open+=(v.targetOpen-v.open)*(1-Math.exp(-dt*7));v.opacity+=((v.present?1:0)-v.opacity)*(1-Math.exp(-dt*5));}visuals=visuals.filter(v=>v.present||v.opacity>.01);
 garden.draw(dt,visuals);animation=requestAnimationFrame(frame);}
animation=requestAnimationFrame(frame);
addEventListener('resize',()=>{garden.resize();tracks=[];visuals=[];});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(active||busy)stop('Kamera dijeda saat tab ditinggalkan');cancelAnimationFrame(animation);}else{lastFrame=performance.now();animation=requestAnimationFrame(frame);}});
addEventListener('pagehide',()=>{stop();detector?.close();detector=null;});
$('#stage').onclick=()=>{if(active)document.body.classList.toggle('clean');};
$('#palette').onclick=()=>{const theme=garden.color();$('.swatch').style.background=`linear-gradient(135deg,hsl(${theme.h+10},60%,87%),hsl(${theme.h},45%,55%))`;toast(theme.name);};
$('#help').onclick=()=>$('#guide').showModal();$('#close-guide').onclick=$('#understood').onclick=()=>$('#guide').close();
$('#capture').onclick=()=>{if(!active||video.readyState<2){toast('Aktifkan kamera terlebih dahulu.');return;}const photo=document.createElement('canvas');photo.width=garden.canvas.width;photo.height=garden.canvas.height;const c=photo.getContext('2d');c.scale(garden.dpr,garden.dpr);const vw=video.videoWidth,vh=video.videoHeight,s=Math.max(garden.w/vw,garden.h/vh);c.save();if(facing==='user'){c.translate(garden.w,0);c.scale(-1,1);}c.drawImage(video,(garden.w-vw*s)/2,(garden.h-vh*s)/2,vw*s,vh*s);c.restore();c.drawImage(garden.canvas,0,0,garden.w,garden.h);$('#flash').classList.remove('flash');void $('#flash').offsetWidth;$('#flash').classList.add('flash');photo.toBlob(blob=>{if(!blob){toast('Foto belum bisa disimpan.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mekar-di-tanganmu.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Foto dengan bungamu disimpan.');},'image/png');};
function note(freq,delay=0){if(!sound||!audio||audio.state!=='running')return;const osc=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+delay;osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.025,at+.035);gain.gain.exponentialRampToValueAtTime(.0001,at+2);osc.connect(gain);gain.connect(audio.destination);osc.start(at);osc.stop(at+2);}
function chime(bouquet=false){(bouquet?[261.63,329.63,392,523.25,659.25]:[523.25,659.25,783.99]).forEach((f,i)=>note(f,i*.13));}
$('#sound').onclick=async()=>{try{audio??=new(window.AudioContext||window.webkitAudioContext)();sound=!sound;if(sound){await audio.resume();chime();}else await audio.suspend();$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').setAttribute('aria-label',sound?'Matikan suara':'Nyalakan suara');toast(sound?'Suara keajaiban aktif':'Suara dimatikan');}catch{sound=false;toast('Suara tidak tersedia di browser ini.');}};
