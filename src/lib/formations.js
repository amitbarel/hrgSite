// =========================================================
// מערכים: לכל מערך של Opta, איזה תפקיד יש לכל מקום במערך (formation_place, 1-11).
// מקור: הטבלה של ספריית mplsoccer (רישיון MIT), שממפה את המקומות של Opta לתפקידים.
// מהתפקיד נגזר המיקום במגרש: עומק (שוער -> חלוץ) וצד (ימין -> שמאל).
// =========================================================
export const FORMATION_PLACES = {
  "442": { 1: "GK", 2: "RB", 3: "LB", 4: "RCM", 5: "RCB", 6: "LCB", 7: "RM", 8: "LCM", 9: "LCF", 10: "RCF", 11: "LM" },
  "41212": { 1: "GK", 2: "RB", 3: "LB", 4: "CDM", 5: "RCB", 6: "LCB", 7: "RCM", 8: "CAM", 9: "LCF", 10: "RCF", 11: "LCM" },
  "433": { 1: "GK", 2: "RB", 3: "LB", 4: "CDM", 5: "RCB", 6: "LCB", 7: "RCM", 8: "LCM", 9: "ST", 10: "RW", 11: "LW" },
  "451": { 1: "GK", 2: "RB", 3: "LB", 4: "RCM", 5: "RCB", 6: "LCB", 7: "RM", 8: "LCM", 9: "ST", 10: "CM", 11: "LM" },
  "4411": { 1: "GK", 2: "RB", 3: "LB", 4: "RCM", 5: "RCB", 6: "LCB", 7: "RM", 8: "LCM", 9: "ST", 10: "CAM", 11: "LM" },
  "4141": { 1: "GK", 2: "RB", 3: "LB", 4: "CDM", 5: "RCB", 6: "LCB", 7: "RM", 8: "RCM", 9: "ST", 10: "LCM", 11: "LM" },
  "4231": { 1: "GK", 2: "RB", 3: "LB", 4: "LDM", 5: "RCB", 6: "LCB", 7: "RW", 8: "RDM", 9: "ST", 10: "CAM", 11: "LW" },
  "4321": { 1: "GK", 2: "RB", 3: "LB", 4: "CM", 5: "RCB", 6: "LCB", 7: "LCM", 8: "RCM", 9: "ST", 10: "RW", 11: "LW" },
  "532": { 1: "GK", 2: "RB", 3: "LB", 4: "LCB", 5: "CB", 6: "RCB", 7: "RCM", 8: "CDM", 9: "LCF", 10: "RCF", 11: "LCM" },
  "541": { 1: "GK", 2: "RB", 3: "LB", 4: "LCB", 5: "CB", 6: "RCB", 7: "RM", 8: "RCM", 9: "ST", 10: "LCM", 11: "LM" },
  "352": { 1: "GK", 2: "RWB", 3: "LWB", 4: "LCB", 5: "CB", 6: "RCB", 7: "RCM", 8: "LCM", 9: "LCF", 10: "RCF", 11: "CM" },
  "343": { 1: "GK", 2: "RWB", 3: "LWB", 4: "LCB", 5: "CB", 6: "RCB", 7: "RCM", 8: "LCM", 9: "ST", 10: "RW", 11: "LW" },
  "4222": { 1: "GK", 2: "RB", 3: "LB", 4: "RCM", 5: "RCB", 6: "LCB", 7: "RW", 8: "LCM", 9: "LCF", 10: "RCF", 11: "LW" },
  "3511": { 1: "GK", 2: "RWB", 3: "LWB", 4: "LCB", 5: "RCB", 6: "CB", 7: "RCM", 8: "LCM", 9: "ST", 10: "CAM", 11: "CDM" },
  "3421": { 1: "GK", 2: "RWB", 3: "LWB", 4: "LCB", 5: "CB", 6: "RCB", 7: "RDM", 8: "LDM", 9: "ST", 10: "RAM", 11: "LAM" },
  "3412": { 1: "GK", 2: "RWB", 3: "LWB", 4: "LCB", 5: "CB", 6: "RCB", 7: "RCM", 8: "LCM", 9: "CAM", 10: "RCF", 11: "LCF" },
  "3142": { 1: "GK", 2: "RM", 3: "LM", 4: "CB", 5: "RCB", 6: "LCB", 7: "RCM", 8: "CDM", 9: "RCF", 10: "LCF", 11: "LCM" },
  "4132": { 1: "GK", 2: "RB", 3: "LB", 4: "CDM", 5: "RCB", 6: "LCB", 7: "RW", 8: "CAM", 9: "RCF", 10: "LCF", 11: "LW" },
  "4312": { 1: "GK", 2: "RB", 3: "LB", 4: "CM", 5: "RCB", 6: "LCB", 7: "RCM", 8: "CAM", 9: "RCF", 10: "LCF", 11: "LCM" },
  "3241": { 1: "GK", 2: "RDM", 3: "LDM", 4: "LCB", 5: "CB", 6: "RCB", 7: "RAM", 8: "LAM", 9: "ST", 10: "RW", 11: "LW" },
  "3331": { 1: "GK", 2: "RDM", 3: "LDM", 4: "LCB", 5: "CB", 6: "RCB", 7: "CAM", 8: "CDM", 9: "ST", 10: "RM", 11: "LM" },
};

// עומק: 0 שוער ... 5 חלוץ
const DEPTH = { GK: 0, B: 1, CB: 1, WB: 1.6, DM: 2.1, M: 3, AM: 4, W: 4, F: 5, ST: 5, SS: 4.5 };
// צד: 0 ימין קיצוני, 2 מרכז, 4 שמאל קיצוני
function role(name) {
  if (name === "GK") return { depth: 0, lat: 2 };
  const side = name[0] === "R" ? (name[1] === "C" || name.endsWith("DM") || name.endsWith("AM") ? 1 : 0)
    : name[0] === "L" ? (name[1] === "C" || name.endsWith("DM") || name.endsWith("AM") ? 3 : 4)
    : 2;
  const core = name.replace(/^(RC|LC|R|L|C)(?=[A-Z])/, "");
  return { depth: DEPTH[core] ?? 3, lat: side };
}

/**
 * מיקום לכל שחקן פותח: { depth (0-5), lat (0-4) }.
 * מערך שלא בטבלה: לפי סוג התפקיד ש-Opta נותנת (2 הגנה, 3 קישור, 4 התקפה), מפוזרים לרוחב.
 */
export function placePlayers(formation, starters) {
  const places = FORMATION_PLACES[formation];
  if (places && starters.every(p => places[p.slot])) {
    return starters.map(p => ({ ...p, ...role(places[p.slot]) }));
  }
  const depthOf = { 1: 0, 2: 1, 3: 3, 4: 5 };
  const rows = Map.groupBy(starters, p => depthOf[p.pos] ?? 3);
  return [...rows].flatMap(([depth, row]) => row.map((p, i) => ({ ...p, depth, lat: row.length === 1 ? 2 : (i * 4) / (row.length - 1) })));
}

/** "4231" -> "4-2-3-1" */
export const formationLabel = f => (f ? f.replace(/d$/, "").split("").join("-") : null);
