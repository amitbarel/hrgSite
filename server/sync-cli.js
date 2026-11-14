// הרצה ידנית של העדכון, ומה ש-GitHub Actions מריץ באוויר:
//   npm run sync           לוח משחקים + סגל + סטטיסטיקה (הרענון היומי)
//   npm run sync:details   וגם קהל ושופט לכל משחק שהסתיים וחסרים לו
//   npm run sync:games     רק משחקים שנגמרו ועוד לא עודכנו (השגרה של כל שעה)
//   node server/sync-cli.js --due   רק בודק כמה משחקים מחכים לעדכון (בלי לשנות כלום)
import "./env.js";
import { appendFileSync } from "node:fs";
import { dailyRefresh, updateFinishedGames } from "./jobs.js";
import { seedIfEmpty } from "./seed.js";
import { gamesNeedingUpdate } from "./db.js";

const has = flag => process.argv.includes(flag);
await seedIfEmpty();

if (has("--due")) {
  const due = (await gamesNeedingUpdate()).length;
  console.log(`games due: ${due}`);
  // ב-GitHub Actions: מעבירים את התשובה לשלב הבא, כדי להתקין דפדפן רק כשצריך
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `due=${due}\n`);
} else if (has("--games")) {
  console.log("games:", JSON.stringify(await updateFinishedGames(), null, 2));
} else {
  console.log("fixtures + squad + stats:", await dailyRefresh());
  if (has("--details")) console.log("details:", JSON.stringify(await updateFinishedGames({ force: true }), null, 2));
}
process.exit(0);
