const MODEL = "MC-780";

const BODY_TYPES = {
  0: "standard",
  2: "athlete",
  5: "auto",
};

const SEXES = {
  1: "male",
  2: "female",
};

const STATUS = {
  0: "ok",
  1: "segment_error",
};

const BALANCE = {
  "-2": "left++",
  "-1": "left+",
  0: "even",
  1: "right+",
  2: "right++",
};

const TYPE_STRING = "string";
const TYPE_NUMBER = "number";
const TYPE_INTEGER = "integer";
const TYPE_DATE = "date";
const TYPE_TIME = "time";
const TYPE_CHECKSUM = "checksum";
const CONTROL_CODES = new Set(["{0", "~0", "~1", "~2"]);

const SERIAL_FIELDS = new Map();
const SD_HEADER_MAP = new Map();

function define(code, key, options = {}) {
  const field = {
    code,
    key,
    type: options.type ?? TYPE_NUMBER,
    unit: options.unit,
    label: options.label,
    enum: options.enum,
  };
  if (code) {
    SERIAL_FIELDS.set(code, field);
  }
  if (options.sd) {
    for (const header of Array.isArray(options.sd) ? options.sd : [options.sd]) {
      SD_HEADER_MAP.set(header, field);
    }
  }
  return field;
}

define("MO", "model", { type: TYPE_STRING, sd: "型番" });
define("ID", "id", { type: TYPE_STRING, sd: ["IDナンバー", "ID"] });
define("St", "statusCode", { type: TYPE_INTEGER, enum: STATUS, sd: "ステータス" });
define("DT", "date", { type: TYPE_DATE, sd: "測定日" });
define("TI", "time", { type: TYPE_TIME, sd: "測定時刻" });
define("Bt", "bodyTypeCode", { type: TYPE_INTEGER, enum: BODY_TYPES, sd: "体型" });
define("GE", "sexCode", { type: TYPE_INTEGER, enum: SEXES, sd: "性別" });
define("AG", "age", { type: TYPE_INTEGER, unit: "years", sd: "年令" });
define("Hm", "heightCm", { unit: "cm", sd: "身長" });
define("Pt", "tareKg", { unit: "kg", sd: "着衣量" });
define("Wk", "weightKg", { unit: "kg", sd: "体重" });
define("FW", "bodyFatPercent", { unit: "%", sd: "体脂肪率" });
define("fW", "fatMassKg", { unit: "kg", sd: "脂肪量" });
define("MW", "fatFreeMassKg", { unit: "kg", sd: "除脂肪量" });
define("mW", "muscleMassKg", { unit: "kg", sd: "筋肉量" });
define("sW", "muscleScore", { type: TYPE_INTEGER, sd: "全身筋肉スコア" });
define("bW", "boneMassKg", { unit: "kg", sd: "推定骨量" });
define("wW", "bodyWaterKg", { unit: "kg", sd: "体水分量" });
define("ww", "bodyWaterPercent", { unit: "%", sd: "体水分率" });
define("MI", "bmi", { sd: "BMI" });
define("Sw", "standardWeightKg", { unit: "kg", sd: "標準体重" });
define("OV", "obesityDegreePercent", { unit: "%", sd: "肥満度" });
define("Sf", "standardBodyFatPercent", { unit: "%", sd: "標準体脂肪率" });
define("SM", "standardMuscleMassKg", { unit: "kg", sd: "標準筋肉量" });
define("IF", "visceralFatLevel", { type: TYPE_INTEGER, sd: "内臓脂肪レベル" });
define("LP", "legScore", { type: TYPE_INTEGER, sd: "脚点" });
define("rB", "basalMetabolicRateKcal", { type: TYPE_INTEGER, unit: "kcal", sd: "基礎代謝量" });
define("rJ", "basalMetabolicRateScore", { type: TYPE_INTEGER, sd: "基礎代謝判定" });
define("BA", "handBalanceCode", { type: TYPE_INTEGER, enum: BALANCE, sd: "左右バランス（手）" });
define("BF", "legBalanceCode", { type: TYPE_INTEGER, enum: BALANCE, sd: "左右バランス（足）" });
define("Ap", "athleteIndex", { type: TYPE_INTEGER, sd: "アスリート指数" });
define("gF", "targetBodyFatPercent", { type: TYPE_INTEGER, unit: "%", sd: "GS目標体脂肪率" });
define("gW", "predictedWeightKg", { unit: "kg", sd: "GS予測体重" });
define("gf", "predictedFatMassKg", { unit: "kg", sd: "GS予測脂肪量" });
define("gt", "fatMassChangeKg", { unit: "kg", sd: "GS脂肪量増減量" });
define("CS", "checksum", { type: TYPE_CHECKSUM, sd: "チェックサム" });

const SEGMENTS = [
  ["rightLeg", "右足", { bodyFatPercent: "FR", fatMassKg: "fR", fatFreeMassKg: "MR", muscleMassKg: "mR", bodyFatScore: "SR", muscleScore: "sR" }],
  ["leftLeg", "左足", { bodyFatPercent: "FL", fatMassKg: "fL", fatFreeMassKg: "ML", muscleMassKg: "mL", bodyFatScore: "SL", muscleScore: "sL" }],
  ["rightArm", "右腕", { bodyFatPercent: "Fr", fatMassKg: "fr", fatFreeMassKg: "Mr", muscleMassKg: "mr", bodyFatScore: "Sr", muscleScore: "sr" }],
  ["leftArm", "左腕", { bodyFatPercent: "Fl", fatMassKg: "fl", fatFreeMassKg: "Ml", muscleMassKg: "ml", bodyFatScore: "Sl", muscleScore: "sl" }],
  ["trunk", "体幹部", { bodyFatPercent: "FT", fatMassKg: "fT", fatFreeMassKg: "MT", muscleMassKg: "mT", bodyFatScore: "ST", muscleScore: "sT" }],
];

for (const [, label, codes] of SEGMENTS) {
  define(codes.bodyFatPercent, `${segmentKey(label)}BodyFatPercent`, { unit: "%", sd: `${label}体脂肪率` });
  define(codes.fatMassKg, `${segmentKey(label)}FatMassKg`, { unit: "kg", sd: `${label}脂肪量` });
  define(codes.fatFreeMassKg, `${segmentKey(label)}FatFreeMassKg`, { unit: "kg", sd: `${label}除脂肪量` });
  define(codes.muscleMassKg, `${segmentKey(label)}MuscleMassKg`, { unit: "kg", sd: `${label}筋肉量` });
  define(codes.bodyFatScore, `${segmentKey(label)}BodyFatScore`, { type: TYPE_INTEGER, sd: `${label}体脂肪率スコア` });
  define(codes.muscleScore, `${segmentKey(label)}MuscleScore`, { type: TYPE_INTEGER, sd: `${label}筋肉量スコア` });
}

const IMPEDANCE_SEGMENTS = [
  ["leftSide", "左半身", "H"],
  ["rightLeg", "右足", "R"],
  ["leftLeg", "左足", "L"],
  ["rightArm", "右腕", "r"],
  ["leftArm", "左腕", "l"],
  ["bothLegs", "両足", "F"],
  ["wholeBody", "全身", "M"],
];

const IMPEDANCE_CODES = [
  ["R", "1kHz", "a"],
  ["X", "1kHz", "c"],
  ["R", "5kHz", "G"],
  ["X", "5kHz", "H"],
  ["R", "50kHz", "R"],
  ["X", "50kHz", "X"],
  ["R", "250kHz", "J"],
  ["X", "250kHz", "K"],
  ["R", "500kHz", "L"],
  ["X", "500kHz", "Q"],
  ["R", "1000kHz", "i"],
  ["X", "1000kHz", "j"],
];

for (const [segment, label, suffix] of IMPEDANCE_SEGMENTS) {
  for (const [kind, frequency, prefix] of IMPEDANCE_CODES) {
    const kindKey = kind === "R" ? "resistance" : "reactance";
    define(`${prefix}${suffix}`, `${segment}${capitalize(kindKey)}${frequency}`, {
      unit: "ohm",
      sd: `${label}${kind}(${frequency})`,
    });
  }
  define(`p${suffix}`, `${segment}PhaseAngle50kHz`, {
    unit: "degree",
    sd: `位相差(${label})`,
  });
}

define(null, "intracellularWaterKg", { unit: "kg", sd: "細胞内液" });
define(null, "extracellularWaterKg", { unit: "kg", sd: "細胞外液" });
define(null, "extracellularWaterPercent", { unit: "%", sd: "外液比" });
define(null, "basalMetabolicRateKj", { type: TYPE_INTEGER, unit: "kJ", sd: "基礎代謝量kJ" });
define(null, "metabolicAge", { type: TYPE_INTEGER, unit: "years", sd: "体内年齢" });
define(null, "userName", { type: TYPE_STRING, sd: "ユーザー名" });
define(null, "goalSettingEnabled", { type: TYPE_INTEGER, sd: "GS機能" });
define("CC", "cardId", { type: TYPE_STRING });
define("mh", "muscleMassHeightSquared", { sd: "MM/H2" });
define("mb", "muscleMassBodyWeight", { sd: "MM/BW" });
define("ah", "appendicularSkeletalMuscleMassHeightSquared", { sd: "SMI" });
define("ab", "appendicularSkeletalMuscleMassBodyWeight", { sd: "ASM/BW" });
define("AS", "appendicularSkeletalMuscleMassKg", { unit: "kg", sd: "四肢骨格筋量" });

function segmentKey(label) {
  return {
    右足: "rightLeg",
    左足: "leftLeg",
    右腕: "rightArm",
    左腕: "leftArm",
    体幹部: "trunk",
  }[label];
}

function capitalize(value) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function normalizeInput(input) {
  if (input instanceof Uint8Array) {
    return new TextDecoder().decode(input);
  }
  return String(input ?? "");
}

function parseCSVLine(line) {
  const values = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        value += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      values.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }

  values.push(value.trim());
  return values;
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        value += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(value.trim());
      value = "";
    } else if (char === "\n") {
      row.push(value.trim());
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value.trim());
    rows.push(row);
  }
  return rows;
}

function coerceValue(value, field) {
  if (value == null || value === "") return null;
  if (!field) return value;
  if (field.type === TYPE_STRING || field.type === TYPE_DATE || field.type === TYPE_TIME || field.type === TYPE_CHECKSUM) {
    return value;
  }
  if (field.type === TYPE_INTEGER) {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? value : parsed;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? value : parsed;
}

function addField(target, field, value) {
  target[field.key] = coerceValue(value, field);
  if (field.enum && target[field.key] != null) {
    target[field.key.replace(/Code$/, "")] = field.enum[target[field.key]] ?? String(target[field.key]);
  }
}

function addDerivedFields(target) {
  if (target.date && target.time) {
    target.measuredAt = `${target.date.replaceAll("/", "-")}T${target.time}:00`;
  }
  if (target.model === MODEL) {
    target.model = MODEL;
  }
  return target;
}

function groupSegments(fields) {
  const segments = {};
  for (const [segment, label] of SEGMENTS) {
    const prefix = segmentKey(label);
    const group = {};
    for (const [key, value] of Object.entries(fields)) {
      if (key.startsWith(prefix) && !key.includes("Resistance") && !key.includes("Reactance") && !key.includes("PhaseAngle")) {
        group[key.slice(prefix.length, prefix.length + 1).toLowerCase() + key.slice(prefix.length + 1)] = value;
      }
    }
    if (Object.keys(group).length) {
      segments[segment] = group;
    }
  }
  return segments;
}

function groupImpedance(fields) {
  const impedance = {};
  for (const [segment] of IMPEDANCE_SEGMENTS) {
    const group = {};
    for (const [key, value] of Object.entries(fields)) {
      if (key.startsWith(segment) && (key.includes("Resistance") || key.includes("Reactance") || key.includes("PhaseAngle"))) {
        group[key.slice(segment.length, segment.length + 1).toLowerCase() + key.slice(segment.length + 1)] = value;
      }
    }
    if (Object.keys(group).length) {
      impedance[segment] = group;
    }
  }
  return impedance;
}

function buildRecord(format, fields, raw) {
  addDerivedFields(fields);
  return {
    format,
    model: fields.model,
    id: fields.id,
    status: fields.status,
    bodyType: fields.bodyType,
    sex: fields.sex,
    measuredAt: fields.measuredAt,
    fields,
    segments: groupSegments(fields),
    impedance: groupImpedance(fields),
    raw,
  };
}

export function parseSerial(input) {
  const raw = normalizeInput(input).trim();
  const tokens = parseCSVLine(raw);
  const fields = {};
  const unknown = {};

  for (let i = 0; i < tokens.length - 1; i += 2) {
    const code = tokens[i];
    const value = tokens[i + 1];
    const field = SERIAL_FIELDS.get(code);
    if (field) {
      addField(fields, field, value);
    } else if (CONTROL_CODES.has(code)) {
      continue;
    } else {
      unknown[code] = value;
    }
  }

  if (Object.keys(unknown).length) {
    fields.unknown = unknown;
  }
  return buildRecord("serial", fields, raw);
}

export function parseSDCSV(input, options = {}) {
  const raw = normalizeInput(input).trim();
  const rows = parseCSV(raw).filter((row) => row.some((value) => value !== ""));
  if (rows.length === 0) return [];

  const headerIndex = options.headerIndex ?? rows.findIndex((row) => row.includes("型番") || row.includes("IDナンバー"));
  if (headerIndex < 0) {
    throw new Error("MC-780A SD CSV header row was not found.");
  }

  const headers = rows[headerIndex];
  return rows.slice(headerIndex + 1).map((row) => {
    const fields = {};
    const unknown = {};
    headers.forEach((header, index) => {
      const normalizedHeader = header.trim();
      const value = row[index] ?? "";
      if (normalizedHeader === "" && value === "") return;
      const field = SD_HEADER_MAP.get(normalizedHeader);
      if (field) {
        addField(fields, field, value);
      } else if (normalizedHeader) {
        unknown[normalizedHeader] = value;
      }
    });
    if (Object.keys(unknown).length) {
      fields.unknown = unknown;
    }
    return buildRecord("sd", fields, row);
  });
}

export function parse(input, options = {}) {
  const text = normalizeInput(input).trim();
  if (options.format === "serial") return parseSerial(text);
  if (options.format === "sd") return parseSDCSV(text, options);
  if (/^(\{0|MO,|[^,\r\n]+,ID,)/.test(text) || text.includes(",MO,")) {
    return parseSerial(text);
  }
  return parseSDCSV(text, options);
}

export const MC780A = {
  MODEL,
  parse,
  parseSerial,
  parseSDCSV,
  SERIAL_FIELDS,
  SD_HEADER_MAP,
  BODY_TYPES,
  SEXES,
  STATUS,
  BALANCE,
};

export {
  MODEL,
  SERIAL_FIELDS,
  SD_HEADER_MAP,
  BODY_TYPES,
  SEXES,
  STATUS,
  BALANCE,
};
