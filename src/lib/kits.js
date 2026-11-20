// =========================================================
// צבעי תלבושות להרכב בדף המשחק: לכל קבוצה תלבושת בית ותלבושת חוץ.
// כל תלבושת: { shirt, num } ואופציונלי second + pattern ("half" חצי-חצי, "stripes" פסים לאורך).
// קבוצה שלא ברשימה מקבלת לבן.
// =========================================================
const RED = "#d4111b", WHITE = "#ffffff", BLACK = "#111111", YELLOW = "#f7d417";
const BLUE = "#1450a3", NAVY = "#0b2a5b", GOLD = "#c9a227", GREEN = "#00843d", SKY = "#1e88e5";

const k = (shirt, num, second, pattern) => ({ shirt, num, second, pattern });

export const KITS = {
  4551:  { home: k(RED, WHITE), away: k(WHITE, RED) },                              // הפועל ר"ג
  4530:  { home: k(RED, WHITE), away: k(WHITE, RED) },                              // הפועל ת"א
  4536:  { home: k(YELLOW, NAVY), away: k(NAVY, GOLD) },                            // מכבי ת"א
  4554:  { home: k(RED, WHITE), away: k(WHITE, RED) },                              // הפועל ב"ש
  4524:  { home: k(BLACK, WHITE, YELLOW, "half"), away: k(WHITE, BLACK) },          // בית"ר ירושלים
  4539:  { home: k(GREEN, WHITE), away: k(WHITE, GREEN) },                          // מכבי חיפה
  4545:  { home: k(YELLOW, BLACK), away: k(BLACK, YELLOW) },                        // מכבי נתניה
  15960: { home: k(RED, WHITE), away: k(WHITE, RED) },                              // בני סכנין
  14316: { home: k(RED, WHITE, BLACK, "stripes"), away: k(WHITE, BLACK) },          // הפועל חיפה
  15006: { home: k(BLUE, WHITE), away: k(WHITE, BLUE) },                            // מכבי פ"ת
  7020:  { home: k(RED, WHITE, BLACK, "stripes"), away: k(WHITE, BLACK) },          // הפועל ירושלים
  4563:  { home: k(BLUE, WHITE), away: k(WHITE, BLUE) },                            // הפועל ק"ש
  4542:  { home: k(BLUE, BLACK), away: k(WHITE, BLACK) },                           // הפועל פ"ת
  12039: { home: k(SKY, WHITE), away: k(BLACK, WHITE) },                            // עירוני טבריה
};

const FALLBACK = { home: k(WHITE, BLACK), away: k(WHITE, BLACK) };

// כמה שני צבעים קרובים (0 = זהים). משמש לזיהוי התנגשות בין התלבושות
function distance(a, b) {
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [rgb(a), rgb(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

/** הסגנון של עיגול המספר לפי התלבושת */
export function kitStyle(kit) {
  const bg = kit.pattern === "half" ? `linear-gradient(90deg, ${kit.shirt} 50%, ${kit.second} 50%)`
    : kit.pattern === "stripes" ? `repeating-linear-gradient(90deg, ${kit.shirt} 0 5px, ${kit.second} 5px 10px)`
    : kit.shirt;
  return { background: bg, color: kit.num, ...(kit.pattern && { textShadow: "0 0 3px rgba(0,0,0,.8)" }) };
}

/**
 * הקבוצה המארחת לובשת תלבושת בית. האורחת לובשת תלבושת בית, אלא אם היא דומה מדי לזו של המארחת,
 * ואז תלבושת חוץ. מחזיר { home, away }.
 */
export function matchKits(homeId, awayId) {
  const h = KITS[homeId] ?? FALLBACK;
  const a = KITS[awayId] ?? FALLBACK;
  const home = h.home;
  let away = a.home;
  if (distance(home.shirt, away.shirt) < 120) away = a.away;
  if (distance(home.shirt, away.shirt) < 120) away = home.shirt === WHITE ? k(BLACK, WHITE) : k(WHITE, BLACK);
  return { home, away };
}
