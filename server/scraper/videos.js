// =========================================================
// תקצירי משחקים מערוץ היוטיוב של מנהלת הליגות (@Ipflofficial).
// רלוונטי = סרטון שהכותרת שלו כוללת "תקציר" ואת שם הקבוצה, ושעלה מתחילת העונה.
// דרך YouTube Data API (צריך מפתח חינמי ב-YOUTUBE_API_KEY). חיפוש אחד עולה 100 יחידות
// מתוך 10,000 ביום, אז הרצה פעם ביום ואחרי כל משחק רחוקה מהמכסה.
// (הפיד החינמי של יוטיוב מחזיר רק 15 סרטונים אחרונים מכל הערוץ, וזה לא מספיק לעונה.)
// =========================================================
import { saveVideos, ourGames, getMeta, setMeta } from "../db.js";

const API = "https://www.googleapis.com/youtube/v3";
const HANDLE = "Ipflofficial";
const QUERY = 'הפועל ר"ג תקציר';
// איך השם שלנו מופיע בכותרות של המנהלת
const OUR_NAMES = ['הפועל ר"ג', "הפועל רמת גן", 'ר"ג'];

async function yt(path, params) {
  const qs = new URLSearchParams(params);
  const headers = process.env.YOUTUBE_API_KEY ? { "X-goog-api-key": process.env.YOUTUBE_API_KEY } : {};
  const res = await fetch(`${API}/${path}?${qs}`, { headers });
  if (!res.ok) throw new Error(`youtube ${path}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

// מזהה הערוץ לא משתנה, אז שומרים אותו במסד אחרי הפעם הראשונה (חוסך יחידה בכל הרצה)
async function channelId() {
  const saved = await getMeta("yt_channel_id");
  if (saved) return saved;
  const json = await yt("channels", { part: "id", forHandle: HANDLE });
  const id = json.items?.[0]?.id;
  if (!id) throw new Error(`youtube: channel @${HANDLE} not found`);
  await setMeta("yt_channel_id", id);
  return id;
}

const decode = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const relevant = title => title.includes("תקציר") && OUR_NAMES.some(n => title.includes(n));

/**
 * משייך סרטון למשחק שלנו. כותרות של הליגה מתחילות ב"מחזור N |", אז קודם לפי המחזור.
 * אחרת (או בגביע הטוטו, שאין לנו את המשחקים שלו): המשחק האחרון שהתחיל עד 4 ימים לפני ההעלאה.
 */
function matchGame(video, games) {
  const round = video.title.match(/^מחזור (\d+)\s*\|/)?.[1];
  if (round) {
    const g = games.find(x => x.round === Number(round) && x.score);
    if (g) return g;
  }
  if (video.title.includes("גביע")) return null;
  const t = new Date(video.publishedAt).getTime();
  return games
    .filter(g => g.score)
    .map(g => ({ g, lag: t - new Date(g.kickoff).getTime() }))
    .filter(x => x.lag > 0 && x.lag < 4 * 864e5)
    .sort((a, b) => a.lag - b.lag)[0]?.g ?? null;
}

export async function syncVideos() {
  const games = await ourGames();
  if (!games.length) return 0;
  // תחילת העונה = ה-1 בחודש של המשחק הראשון (בעונה הזאת: 1 באוגוסט 2026)
  const first = new Date(games[0].kickoff);
  const since = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1)).toISOString();

  const items = [];
  let pageToken;
  do {
    const json = await yt("search", {
      part: "snippet", channelId: await channelId(), q: QUERY, type: "video", order: "date",
      publishedAfter: since, maxResults: "50", ...(pageToken && { pageToken }),
    });
    items.push(...json.items);
    pageToken = json.nextPageToken;
  } while (pageToken && items.length < 150);

  const videos = items
    .map(i => ({
      id: i.id.videoId,
      title: decode(i.snippet.title),
      publishedAt: i.snippet.publishedAt,
      thumb: i.snippet.thumbnails?.high?.url || i.snippet.thumbnails?.medium?.url || null,
    }))
    // לכל משחק יש בדרך כלל שניים: "תקציר" ו"תקציר מורחב"
    .map(v => ({ ...v, kind: v.title.includes("תקציר מורחב") ? "extended" : "short" }))
    .filter(v => relevant(v.title))
    .map(v => ({ ...v, gameId: matchGame(v, games)?.id ?? null }));

  await saveVideos(videos);
  await setMeta("videos_synced_at", new Date().toISOString());
  return videos.length;
}
