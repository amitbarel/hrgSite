// =========================================================
// נתוני התחלה: אם המסד ריק, טוענים את הנתונים שכבר אספנו (data/seed.json)
// כדי שהאתר יעבוד מיד, גם בלי חיבור לאתר המנהלת.
// =========================================================
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { saveFixtures, replacePlayers, saveGameDetails, savePlayerStats, count, playersWithStats } from "./db.js";

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "seed.json");

export async function seedIfEmpty() {
  if (!existsSync(file)) return false;
  const seed = JSON.parse(readFileSync(file, "utf8"));
  await seedStatsIfMissing(seed);
  if ((await count("games")) > 0) return false;
  await saveFixtures(seed.teams, seed.games);
  for (const g of seed.games) if (g.attendance || g.referee) await saveGameDetails(g.id, g);
  await replacePlayers(seed.players);
  await seedStatsIfMissing(seed);
  console.log(`[seed] loaded ${seed.games.length} games, ${seed.players.length} players`);
  return true;
}

// סטטיסטיקה התחלתית, למסד שעוד לא משך אותה אף פעם
async function seedStatsIfMissing(seed) {
  if (!seed.stats?.length) return;
  if ((await playersWithStats()) === 0) await savePlayerStats(seed.stats);
}
