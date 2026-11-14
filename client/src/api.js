// כל הפניות לשרת עוברות דרך כאן.
// התשובות נשמרות בזיכרון, כך שחזרה לדף שכבר ביקרנו בו מוצגת מיד, בלי "טוען…".
import { useEffect, useState } from "react";

const cache = new Map();    // path -> data
const pending = new Map();  // path -> Promise

function load(path) {
  if (!pending.has(path)) {
    const p = fetch(`/api${path}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(data => { cache.set(path, data); return data; })
      .catch(err => { pending.delete(path); throw err; });
    pending.set(path, p);
  }
  return pending.get(path);
}

// טוען מראש נתונים שכנראה נצטרך, כדי שהמעבר לדף הבא יהיה מיידי
export function prefetch(...paths) {
  paths.forEach(path => load(path).catch(() => {}));
}

const ready = path => ({ data: cache.get(path), error: null, loading: false });

export function useApi(path) {
  const [state, setState] = useState(() =>
    cache.has(path) ? ready(path) : { data: null, error: null, loading: true }
  );
  useEffect(() => {
    if (cache.has(path)) { setState(ready(path)); return; }
    let alive = true;
    load(path)
      .then(() => alive && setState(ready(path)))
      .catch(error => alive && setState({ data: null, error, loading: false }));
    return () => { alive = false; };
  }, [path]);
  return state;
}
