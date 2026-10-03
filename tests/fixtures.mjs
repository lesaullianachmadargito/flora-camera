export function hand(mode='open',offset=0){
 const p=Array.from({length:21},()=>({x:.5+offset,y:.65,z:0}));p[0]={x:.5+offset,y:.87,z:0};
 [5,9,13,17].forEach((i,j)=>p[i]={x:.39+j*.075+offset,y:.62+j*.01,z:0});
 [8,12,16,20].forEach((tip,j)=>{const extended=mode==='open'||((mode==='point'||mode==='pinch')&&j===0);p[tip-2]={x:.37+j*.09+offset,y:extended?.48:.60,z:0};p[tip]={x:.34+j*.12+offset,y:extended?.24+j*.018:.73,z:0};});
 p[4]={x:.25+offset,y:.65,z:0};if(mode==='pinch')p[4]={...p[8],x:p[8].x+.008};return p;
}
