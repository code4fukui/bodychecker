import {
  assert,
  assertEquals,
  assertObjectMatch,
  assertRejects,
} from "https://deno.land/std/testing/asserts.ts";
import { MC780A, parse, parseSDCSV, parseSerial, SERIAL_FIELDS } from "./MC780A.js";

const FULL_SERIAL_SAMPLE = `{0,16,~0,1,~1,1,~2,1,MO,"MC-780",ID,"0000000000000000",St,0,CC,"0000000000000000",DT,"2026/06/03",TI,"15:00",Bt,5,GE,1,AG,47,Hm,175.5,Pt,0.0,Wk,67.6,FW,18.3,fW,12.4,MW,55.2,mW,52.3,sW,0,bW,2.9,wW,38.2,ww,56.5,MI,21.9,Sf,18.0,IF,9,LP,102,rB,1514,rJ,11,BA,0,BF,0,Ap,55,gF,0,gW,0.0,gf,0.0,gt,0.0,FR,16.3,fR,2.1,MR,10.9,mR,10.3,SR,-1,sR,0,FL,16.9,fL,2.2,ML,10.8,mL,10.2,SL,0,sL,0,Fr,13.9,fr,0.5,Mr,2.9,mr,2.7,Sr,0,sr,0,Fl,15.4,fl,0.5,Ml,2.8,ml,2.6,Sl,0,sl,-1,FT,20.3,fT,7.1,MT,27.8,mT,26.5,ST,0,sT,-2,aH,0.0,cH,0.0,GH,665.2,HH,-29.2,RH,586.1,XH,-61.5,JH,523.8,KH,-54.6,LH,0.0,QH,0.0,iH,0.0,jH,0.0,aR,0.0,cR,0.0,GR,256.1,HR,-10.8,RR,225.8,XR,-22.0,JR,205.1,KR,-16.4,LR,0.0,QR,0.0,iR,0.0,jR,0.0,aL,0.0,cL,0.0,GL,270.1,HL,-12.4,RL,236.4,XL,-23.9,JL,213.9,KL,-17.6,LL,0.0,QL,0.0,iL,0.0,jL,0.0,ar,0.0,cr,0.0,Gr,360.1,Hr,-14.6,Rr,317.2,Xr,-36.6,Jr,277.0,Kr,-38.1,Lr,0.0,Qr,0.0,ir,0.0,jr,0.0,al,0.0,cl,0.0,Gl,368.6,Hl,-15.0,Rl,326.0,Xl,-35.3,Jl,287.4,Kl,-35.6,Ll,0.0,Ql,0.0,il,0.0,jl,0.0,aF,0.0,cF,0.0,GF,529.4,HF,-24.6,RF,464.9,XF,-47.3,JF,418.8,KF,-36.0,LF,0.0,QF,0.0,iF,0.0,jF,0.0,aM,0.0,cM,0.0,GM,643.8,HM,-28.3,RM,565.9,XM,-61.0,JM,504.4,KM,-56.4,LM,0.0,QM,0.0,iM,0.0,jM,0.0,pH,-6.0,pR,-5.6,pL,-5.8,pr,-6.6,pl,-6.2,pF,-5.8,pM,-6.2,mh,16.98,mb,0.77,ah,8.38,ab,0.38,AS,25.8,CS,24`;

Deno.test("parseSerial parses core MC-780A fields and enums", () => {
  const data = parseSerial(FULL_SERIAL_SAMPLE);

  assertObjectMatch(data, {
    format: "serial",
    model: "MC-780",
    id: "0000000000000000",
    status: "ok",
    bodyType: "auto",
    sex: "male",
    measuredAt: "2026-06-03T15:00:00",
  });
  assertObjectMatch(data.fields, {
    cardId: "0000000000000000",
    age: 47,
    heightCm: 175.5,
    weightKg: 67.6,
    bodyFatPercent: 18.3,
    fatMassKg: 12.4,
    muscleMassKg: 52.3,
    bodyWaterPercent: 56.5,
    bmi: 21.9,
    standardBodyFatPercent: 18,
    visceralFatLevel: 9,
    basalMetabolicRateKcal: 1514,
    handBalance: "even",
    legBalance: "even",
    appendicularSkeletalMuscleMassHeightSquared: 8.38,
    appendicularSkeletalMuscleMassKg: 25.8,
    checksum: "24",
  });
});

Deno.test("parseSerial groups segment and impedance values", () => {
  const data = parseSerial(FULL_SERIAL_SAMPLE);

  assertObjectMatch(data.segments.rightLeg, {
    bodyFatPercent: 16.3,
    fatMassKg: 2.1,
    fatFreeMassKg: 10.9,
    muscleMassKg: 10.3,
    bodyFatScore: -1,
    muscleScore: 0,
  });
  assertObjectMatch(data.segments.trunk, {
    bodyFatPercent: 20.3,
    muscleMassKg: 26.5,
    muscleScore: -2,
  });
  assertObjectMatch(data.impedance.wholeBody, {
    resistance5kHz: 643.8,
    reactance5kHz: -28.3,
    resistance50kHz: 565.9,
    reactance50kHz: -61,
    phaseAngle50kHz: -6.2,
  });
});

Deno.test("parseSerial ignores MC-780A control codes and preserves unknown data", () => {
  const data = parseSerial('{0,16,~0,1,MO,"MC-780",ID,"1",XX,abc,Wk,67.6');

  assertEquals(data.fields.weightKg, 67.6);
  assertEquals(data.fields.unknown, { XX: "abc" });
  assert(!("{0" in data.fields.unknown));
  assert(!("~0" in data.fields.unknown));
});

Deno.test("parse auto-detects serial output and supports MC780A facade", () => {
  const data = parse('MO,"MC-780",ID,"42",St,0,Bt,0,GE,2,Wk,55.5,CS,AA');
  const facade = MC780A.parse('MO,"MC-780",ID,"42",St,0,Bt,0,GE,2,Wk,55.5,CS,AA');

  assertEquals(data.format, "serial");
  assertEquals(data.id, "42");
  assertEquals(data.status, "ok");
  assertEquals(data.bodyType, "standard");
  assertEquals(data.sex, "female");
  assertEquals(data.fields.weightKg, 55.5);
  assertEquals(facade.fields.weightKg, data.fields.weightKg);
});

Deno.test("parseSDCSV parses Japanese header CSV rows", () => {
  const csv = [
    "メモ行",
    "型番,IDナンバー,ステータス,測定日,測定時刻,体型,性別,年令,身長,体重,体脂肪率,筋肉量,内臓脂肪レベル,SMI,不明列",
    "MC-780,0001,0,2026/06/03,15:00,5,1,47,175.5,67.6,18.3,52.3,9,8.38,foo",
    "MC-780,0002,1,2026/06/04,09:30,2,2,48,160.0,55.2,22.1,40.0,6,6.10,bar",
  ].join("\n");

  const rows = parseSDCSV(csv);

  assertEquals(rows.length, 2);
  assertObjectMatch(rows[0], {
    format: "sd",
    model: "MC-780",
    id: "0001",
    status: "ok",
    bodyType: "auto",
    sex: "male",
    measuredAt: "2026-06-03T15:00:00",
  });
  assertObjectMatch(rows[0].fields, {
    age: 47,
    heightCm: 175.5,
    weightKg: 67.6,
    bodyFatPercent: 18.3,
    muscleMassKg: 52.3,
    visceralFatLevel: 9,
    appendicularSkeletalMuscleMassHeightSquared: 8.38,
    unknown: { "不明列": "foo" },
  });
  assertEquals(rows[1].status, "segment_error");
  assertEquals(rows[1].bodyType, "athlete");
  assertEquals(rows[1].sex, "female");
});

Deno.test("parseSDCSV throws when no SD header row exists", async () => {
  await assertRejects(
    async () => parseSDCSV("a,b,c\n1,2,3"),
    Error,
    "header row was not found",
  );
});

Deno.test("exported field maps expose known serial definitions", () => {
  assertEquals(SERIAL_FIELDS.get("Wk").key, "weightKg");
  assertEquals(SERIAL_FIELDS.get("FW").unit, "%");
  assertEquals(SERIAL_FIELDS.has(null), false);
});
