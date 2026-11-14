// =========================================================
// פרטי משחק (קהל ושופט): הנתונים האלה מגיעים מווידג'ט של Opta שנטען
// רק בדפדפן, ולכן פותחים את עמוד המשחק בדפדפן אוטומטי (Playwright).
// Playwright היא תלות אופציונלית: אם היא לא מותקנת, מדלגים בשקט.
// =========================================================
import { url } from "./http.js";

let browserPromise = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = (async () => {
      const { chromium } = await import("playwright");
      // CHROMIUM_PATH: אופציונלי, אם רוצים להשתמש בדפדפן שכבר מותקן במחשב
      return chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
    })().catch(err => {
      browserPromise = null;
      throw err;
    });
  }
  return browserPromise;
}

export async function closeBrowser() {
  if (browserPromise) {
    const b = await browserPromise.catch(() => null);
    browserPromise = null;
    await b?.close();
  }
}

export async function fetchGameDetails(gameId) {
  let browser;
  try {
    browser = await getBrowser();
  } catch (err) {
    console.warn(`[details] Playwright not available (${err.message}). Run: npx playwright install chromium`);
    return null;
  }
  const page = await browser.newPage();
  try {
    await page.goto(url(`/game/${gameId}`), { waitUntil: "domcontentloaded", timeout: 45000 });
    // מחכים שהווידג'ט יציג את שורת האצטדיון/שופט
    await page.waitForFunction(() => /Referee|Attendance/.test(document.body.innerText), null, { timeout: 30000 });
    const text = await page.evaluate(() => document.body.innerText);
    const attendance = text.match(/Attendance\s*([\d,]+)/)?.[1];
    const referee = text.match(/Referee\s*([^\n]+)/)?.[1]?.trim();
    return {
      attendance: attendance ? Number(attendance.replace(/,/g, "")) : null,
      referee: referee || null,
    };
  } catch (err) {
    console.warn(`[details] game ${gameId}: ${err.message}`);
    return null;
  } finally {
    await page.close();
  }
}
