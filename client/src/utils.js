export const OUR_TEAM_ID = 4551;
export const OUR_LOGO = "/logo.png";
const TZ = "Asia/Jerusalem";

export const teamLogo = t => (t.id === OUR_TEAM_ID ? OUR_LOGO : t.logo);

// "2026-11-28T15:30:00Z" -> "28.11.26"
export function fmtDate(iso) {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "2-digit" })
    .formatToParts(new Date(iso));
  const get = t => p.find(x => x.type === t).value;
  return `${get("day")}.${get("month")}.${get("year")}`;
}

// -> "17:30" (שעון ישראל). 00:00 = השעה עוד לא נקבעה
export function fmtTime(iso) {
  const t = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .format(new Date(iso));
  return t === "00:00" ? null : t;
}

export const fmtNum = n => n.toLocaleString("en-US");

// מספר + מילה בעברית: "שער אחד", "שני שערים", "3 שערים". f = מילה בלשון נקבה (הופעה אחת, שתי הופעות)
const HE_WORDS = {
  goal:       { one: "שער",   many: "שערים" },
  assist:     { one: "בישול", many: "בישולים" },
  appearance: { one: "הופעה", many: "הופעות", f: true },
  minute:     { one: "דקה",   many: "דקות",   f: true },
};
export function heCount(n, word) {
  const w = HE_WORDS[word];
  if (n === 1) return `${w.one} ${w.f ? "אחת" : "אחד"}`;
  if (n === 2) return `${w.f ? "שתי" : "שני"} ${w.many}`;
  return `${fmtNum(n)} ${w.many}`;
}

export const RESULT = {
  w: { label: "ניצחון", cls: "win", letter: "נ" },
  d: { label: "תיקו", cls: "draw", letter: "ת" },
  l: { label: "הפסד", cls: "loss", letter: "ה" },
};

export function ageFrom(birth) {
  if (!birth) return null;
  const [d, m, y] = birth.split(".").map(Number);
  const born = new Date(y > 30 ? 1900 + y : 2000 + y, m - 1, d);
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  if (now < new Date(now.getFullYear(), m - 1, d)) age--;
  return age;
}
