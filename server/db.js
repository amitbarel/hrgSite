// =========================================================
// מסד הנתונים: SQLite דרך libSQL.
//  - במחשב (בלי הגדרות): קובץ אחד ב-data/hapoel.db, כמו קודם.
//  - באוויר (Vercel / GitHub Actions): מסד Turso בענן, לפי TURSO_DATABASE_URL ו-TURSO_AUTH_TOKEN.
// אותו קוד ואותן שאילתות בשני המקרים. כל הפונקציות כאן אסינכרוניות (מחזירות Promise).
// =========================================================
import { createClient } from "@libsql/client";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { refereeHe } from "./referees.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function localUrl() {
  const file = process.env.DB_PATH || path.join(root, "data", "hapoel.db");
  mkdirSync(path.dirname(file), { recursive: true });
  return pathToFileURL(file).href;
}

export const client = createClient({
  url: process.env.TURSO_DATABASE_URL || localUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const OUR_TEAM_ID = 4551;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS teams (
    id      INTEGER PRIMARY KEY,
    name    TEXT NOT NULL,      -- שם קצר בעברית, למשל: הפועל ר"ג
    slug    TEXT,
    logo    TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS games (
    id              INTEGER PRIMARY KEY,   -- מזהה המשחק באתר המנהלת
    season          TEXT,
    league          INTEGER,
    stage           TEXT,
    round           INTEGER,
    kickoff         TEXT,                  -- ISO, בשעון UTC
    stadium         TEXT,
    home_team_id    INTEGER REFERENCES teams(id),
    away_team_id    INTEGER REFERENCES teams(id),
    home_score      INTEGER,
    away_score      INTEGER,
    status          INTEGER,               -- 3 = הסתיים (לפי אתר המנהלת)
    attendance      INTEGER,
    referee         TEXT,
    details_at      TEXT,                  -- מתי נמשכו פרטי המשחק (קהל, שופט)
    last_attempt_at TEXT,                  -- הניסיון האחרון של השגרה
    updated_at      TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS players (
    id        INTEGER PRIMARY KEY,
    name      TEXT NOT NULL,
    grp       TEXT,       -- שוערים / הגנה / קישור / התקפה
    position  TEXT,
    number    INTEGER,
    birth     TEXT,       -- dd.mm.yy
    photo     TEXT,
    sort      INTEGER,
    active    INTEGER DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT
  )`,
];

// עמודות שנוספו אחרי הגרסה הראשונה. מסד קיים מקבל אותן כאן, בלי למחוק נתונים.
const STAT_COLS = ["appearances", "minutes", "goals", "assists", "yellow", "red", "clean_sheets", "sub_in"];

// הטבלאות נוצרות פעם אחת, בשאילתה הראשונה. כל פונקציה מחכה לזה דרך q().
let ready;
function init() {
  ready ??= (async () => {
    await client.batch(SCHEMA, "write");
    const cols = await client.execute("PRAGMA table_info(players)");
    const have = new Set(cols.rows.map(c => c.name));
    const add = STAT_COLS.filter(c => !have.has(c)).map(c => `ALTER TABLE players ADD COLUMN ${c} INTEGER DEFAULT 0`);
    if (!have.has("stats_at")) add.push("ALTER TABLE players ADD COLUMN stats_at TEXT");
    if (add.length) await client.batch(add, "write");
  })().catch(e => { ready = null; throw e; });
  return ready;
}

/** מריץ שאילתה אחת ומחזיר את השורות */
async function q(sql, args = []) {
  await init();
  return (await client.execute({ sql, args })).rows;
}
/** כמה שאילתות כטרנזקציה אחת: או שכולן נשמרות, או שאף אחת */
async function tx(statements) {
  await init();
  if (statements.length) await client.batch(statements, "write");
}

const now = () => new Date().toISOString();

// ---------- כתיבה ----------
const UPSERT_TEAM = `
  INSERT INTO teams (id, name, slug, logo) VALUES (?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET name = excluded.name,
    slug = COALESCE(excluded.slug, teams.slug), logo = COALESCE(excluded.logo, teams.logo)`;
const teamStmt = ({ id, name, slug = null, logo = null }) => ({ sql: UPSERT_TEAM, args: [id, name, slug, logo] });

const UPSERT_GAME = `
  INSERT INTO games (id, season, league, stage, round, kickoff, stadium, home_team_id, away_team_id,
                     home_score, away_score, status, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    season = excluded.season, league = excluded.league, stage = excluded.stage, round = excluded.round,
    kickoff = excluded.kickoff, stadium = excluded.stadium,
    home_team_id = excluded.home_team_id, away_team_id = excluded.away_team_id,
    home_score = excluded.home_score, away_score = excluded.away_score,
    status = excluded.status, updated_at = excluded.updated_at`;
const gameStmt = g => ({
  sql: UPSERT_GAME,
  args: [g.id, g.season, g.league, g.stage, g.round, g.kickoff, g.stadium,
    g.homeTeamId, g.awayTeamId, g.homeScore ?? null, g.awayScore ?? null, g.status ?? null, now()],
});

const detailsStmt = (id, { attendance = null, referee = null }) => ({
  sql: `UPDATE games SET attendance = COALESCE(?, attendance), referee = COALESCE(?, referee),
          details_at = ?, updated_at = ? WHERE id = ?`,
  args: [attendance, referee, now(), now(), id],
});

/** קבוצות ומשחקים בבת אחת (לוח המשחקים כולו בבקשה אחת למסד) */
export async function saveFixtures(teams, games) {
  await tx([...teams.map(teamStmt), ...games.map(gameStmt)]);
}

export async function saveGameDetails(id, details) {
  await tx([detailsStmt(id, details)]);
}

export async function markAttempt(id) {
  await q("UPDATE games SET last_attempt_at = ? WHERE id = ?", [now(), id]);
}

export async function replacePlayers(list) {
  await tx([
    "UPDATE players SET active = 0",
    ...list.map((p, i) => ({
      sql: `INSERT INTO players (id, name, grp, position, number, birth, photo, sort, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            ON CONFLICT(id) DO UPDATE SET name = excluded.name, grp = excluded.grp, position = excluded.position,
              number = excluded.number, birth = COALESCE(excluded.birth, players.birth),
              photo = excluded.photo, sort = excluded.sort, active = 1`,
      args: [p.id, p.name, p.group, p.position, p.number ?? null, p.birth ?? null, p.photo ?? null, i],
    })),
  ]);
}

// סטטיסטיקה עונתית, לפי מזהה שחקן. שחקן בסגל שלא מופיע ברשימה (עוד לא שיחק) מקבל 0.
export async function savePlayerStats(list) {
  const at = now();
  await tx([
    {
      sql: `UPDATE players SET appearances = 0, minutes = 0, goals = 0, assists = 0, yellow = 0, red = 0,
              clean_sheets = 0, sub_in = 0, stats_at = ? WHERE active = 1`,
      args: [at],
    },
    ...list.map(s => ({
      sql: `UPDATE players SET appearances = ?, minutes = ?, goals = ?, assists = ?, yellow = ?, red = ?,
              clean_sheets = ?, sub_in = ?, stats_at = ? WHERE id = ?`,
      args: [s.appearances, s.minutes, s.goals, s.assists, s.yellow, s.red, s.cleanSheets, s.subIn, at, s.id],
    })),
  ]);
}

export async function setMeta(key, value) {
  await q("INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, String(value)]);
}
export async function getMeta(key) {
  return (await q("SELECT value FROM meta WHERE key = ?", [key]))[0]?.value ?? null;
}

// ---------- קריאה ----------
const GAME_SELECT = `
  SELECT g.*, h.name AS home_name, h.slug AS home_slug, h.logo AS home_logo,
         a.name AS away_name, a.slug AS away_slug, a.logo AS away_logo
  FROM games g
  JOIN teams h ON h.id = g.home_team_id
  JOIN teams a ON a.id = g.away_team_id
`;

function toGame(r) {
  const played = r.status === 3 && r.home_score != null;
  const weAreHome = r.home_team_id === OUR_TEAM_ID;
  let result = null;
  if (played) {
    const ours = weAreHome ? r.home_score : r.away_score;
    const theirs = weAreHome ? r.away_score : r.home_score;
    result = ours > theirs ? "w" : ours < theirs ? "l" : "d";
  }
  return {
    id: r.id,
    round: r.round,
    stage: r.stage,
    kickoff: r.kickoff,
    stadium: r.stadium,
    isHome: weAreHome,
    home: { id: r.home_team_id, name: r.home_name, slug: r.home_slug, logo: r.home_logo },
    away: { id: r.away_team_id, name: r.away_name, slug: r.away_slug, logo: r.away_logo },
    score: played ? [r.home_score, r.away_score] : null,
    result,
    attendance: r.attendance,
    referee: refereeHe(r.referee),
  };
}

export async function ourGames() {
  const rows = await q(`${GAME_SELECT} WHERE g.home_team_id = ? OR g.away_team_id = ? ORDER BY g.kickoff`,
    [OUR_TEAM_ID, OUR_TEAM_ID]);
  return rows.map(toGame);
}

export async function players() {
  const rows = await q("SELECT * FROM players WHERE active = 1 ORDER BY sort");
  return rows.map(p => ({
    id: p.id, name: p.name, group: p.grp, position: p.position, number: p.number, birth: p.birth, photo: p.photo,
    stats: p.stats_at ? {
      appearances: p.appearances, minutes: p.minutes, goals: p.goals, assists: p.assists,
      yellow: p.yellow, red: p.red, cleanSheets: p.clean_sheets, subIn: p.sub_in, updatedAt: p.stats_at,
    } : null,
  }));
}

export async function count(table) {
  return (await q(`SELECT COUNT(*) AS n FROM ${table}`))[0].n;
}

export async function playersWithStats() {
  return (await q("SELECT COUNT(*) AS n FROM players WHERE stats_at IS NOT NULL"))[0].n;
}

/** הליגה והעונה לפי המשחקים שכבר יש במסד (למשל 902 ו-"26/27") */
export async function currentSeason() {
  return (await q("SELECT league, season FROM games WHERE league IS NOT NULL ORDER BY kickoff DESC LIMIT 1"))[0] ?? null;
}

export async function gameStatus(id) {
  return (await q("SELECT status FROM games WHERE id = ?", [id]))[0]?.status ?? null;
}

/** משחקים שהסתיימו ועוד אין להם קהל ושופט (לעדכון ידני מלא) */
export async function finishedWithoutDetails() {
  return q("SELECT id FROM games WHERE status = 3 AND details_at IS NULL");
}

/**
 * משחקים שהשגרה צריכה לטפל בהם:
 * עברו לפחות 150 דקות מהפתיחה, ופחות מ-36 שעות, ועדיין חסרה תוצאה סופית או פרטי משחק.
 * ניסיון חוזר לכל משחק לכל היותר פעם בשעה.
 */
export async function gamesNeedingUpdate(at = new Date()) {
  const from = new Date(at.getTime() - 36 * 3600e3).toISOString();
  const to = new Date(at.getTime() - 150 * 60e3).toISOString();
  const retry = new Date(at.getTime() - 55 * 60e3).toISOString();
  return q(`
    SELECT id, kickoff, status, details_at FROM games
    WHERE (home_team_id = ? OR away_team_id = ?)
      AND kickoff BETWEEN ? AND ?
      AND (status IS NOT 3 OR details_at IS NULL)
      AND (last_attempt_at IS NULL OR last_attempt_at < ?)
  `, [OUR_TEAM_ID, OUR_TEAM_ID, from, to, retry]);
}
