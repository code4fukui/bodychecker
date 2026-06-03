import { MC780A } from "./MC780A.js";

const src = `{0,16,~0,1,MO,"MC-780",ID,"0000000000000000",DT,"2026/06/03",TI,"15:22",Pt,0.0,Wk,67.8,CS,57"`;
console.log(MC780A.parse(src));

