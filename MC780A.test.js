import * as t from "https://deno.land/std/testing/asserts.ts";
import { MC780A } from "./MC780A.js";

Deno.test("simple", () => {
  const src = `{0,16,~0,1,~1,1,~2,1,MO,"MC-780",ID,"0000000000000000",St,0,CC,"0000000000000000",DT,"2026/06/03",TI,"15:00",Bt,5,GE,1,AG,47,Hm,175.5,Pt,0.0,Wk,67.6,FW,18.3,fW,12.4,MW,55.2,mW,52.3,sW,0,bW,2.9,wW,38.2,ww,56.5,MI,21.9,Sf,18.0,IF,9,LP,102,rB,1514,rJ,11,BA,0,BF,0,Ap,55,gF,0,gW,0.0,gf,0.0,gt,0.0,FR,16.3,fR,2.1,MR,10.9,mR,10.3,SR,-1,sR,0,FL,16.9,fL,2.2,ML,10.8,mL,10.2,SL,0,sL,0,Fr,13.9,fr,0.5,Mr,2.9,mr,2.7,Sr,0,sr,0,Fl,15.4,fl,0.5,Ml,2.8,ml,2.6,Sl,0,sl,-1,FT,20.3,fT,7.1,MT,27.8,mT,26.5,ST,0,sT,-2,aH,0.0,cH,0.0,GH,665.2,HH,-29.2,RH,586.1,XH,-61.5,JH,523.8,KH,-54.6,LH,0.0,QH,0.0,iH,0.0,jH,0.0,aR,0.0,cR,0.0,GR,256.1,HR,-10.8,RR,225.8,XR,-22.0,JR,205.1,KR,-16.4,LR,0.0,QR,0.0,iR,0.0,jR,0.0,aL,0.0,cL,0.0,GL,270.1,HL,-12.4,RL,236.4,XL,-23.9,JL,213.9,KL,-17.6,LL,0.0,QL,0.0,iL,0.0,jL,0.0,ar,0.0,cr,0.0,Gr,360.1,Hr,-14.6,Rr,317.2,Xr,-36.6,Jr,277.0,Kr,-38.1,Lr,0.0,Qr,0.0,ir,0.0,jr,0.0,al,0.0,cl,0.0,Gl,368.6,Hl,-15.0,Rl,326.0,Xl,-35.3,Jl,287.4,Kl,-35.6,Ll,0.0,Ql,0.0,il,0.0,jl,0.0,aF,0.0,cF,0.0,GF,529.4,HF,-24.6,RF,464.9,XF,-47.3,JF,418.8,KF,-36.0,LF,0.0,QF,0.0,iF,0.0,jF,0.0,aM,0.0,cM,0.0,GM,643.8,HM,-28.3,RM,565.9,XM,-61.0,JM,504.4,KM,-56.4,LM,0.0,QM,0.0,iM,0.0,jM,0.0,pH,-6.0,pR,-5.6,pL,-5.8,pr,-6.6,pl,-6.2,pF,-5.8,pM,-6.2,mh,16.98,mb,0.77,ah,8.38,ab,0.38,AS,25.8,CS,24`;
  const data = MC780A.parse(src);
  console.log(data);
});
