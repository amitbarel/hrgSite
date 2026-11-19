// בקשות לאתר המנהלת. מזדהים בשם כללי ושומרים על קצב נמוך.
const BASE = "https://www.football.co.il";
const HEADERS = { "User-Agent": "Mozilla/5.0 (fan-site learning project)", "Accept-Language": "he" };

export const url = path => `${BASE}${path}`;

export async function getHtml(path) {
  const res = await fetch(url(path), { headers: HEADERS });
  // האתר מחזיר לפעמים 404 גם לעמודים קיימים (עמודי שחקן ומשחק), אז בודקים את התוכן ולא רק את הסטטוס
  const html = await res.text();
  if (!html || html.length < 1000) throw new Error(`Empty response for ${path} (${res.status})`);
  return html;
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));

// מחלץ אובייקט JSON שמוגדר בקוד העמוד, למשל: var gamesByDate = {...};
export function extractJsonVar(html, name) {
  const marker = `var ${name} = `;
  const start = html.indexOf(marker);
  if (start < 0) return null;
  let i = start + marker.length;
  const open = html[i];
  const close = open === "{" ? "}" : "]";
  let depth = 0, inStr = false, esc = false;
  for (let j = i; j < html.length; j++) {
    const c = html[j];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close && --depth === 0) return JSON.parse(html.slice(i, j + 1));
  }
  return null;
}

export function decodeEntities(s) {
  return s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

// ---------- Bamboo: ה-API שאתר המנהלת עצמו מושך ממנו סטטיסטיקה וטבלה ----------
const BAMBOO = "https://cdnapi.bamboo-cloud.com/api/football";

// ה-API צריך מזהה אתר (iid) שמופיע בקוד של כל עמוד באתר המנהלת, אז לוקחים אותו משם
let iid;
async function bambooIid() {
  if (iid) return iid;
  const html = await getHtml("/scores/");
  iid = html.match(/iid=([0-9a-f]{24})/)?.[1];
  if (!iid) throw new Error("bamboo: site id (iid) not found on football.co.il");
  return iid;
}

/** קריאה ל-Bamboo. למשל bamboo("standings", { tournamentId: 902, seasonName: "26/27" }) */
export async function bamboo(endpoint, filter) {
  const qs = new URLSearchParams({
    format: "json", iid: await bambooIid(), filter: JSON.stringify(filter),
    returnZeros: "true", disableDefaultFilter: "true",
  });
  const res = await fetch(`${BAMBOO}/${endpoint}?${qs}`, { headers: { "User-Agent": HEADERS["User-Agent"] } });
  if (!res.ok) throw new Error(`bamboo ${endpoint}: HTTP ${res.status}`);
  return (await res.json()).data;
}
