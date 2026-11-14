// טוען הגדרות מקובץ .env אם קיים (חייב להיות ה-import הראשון)
try {
  process.loadEnvFile();
} catch {
  /* אין .env, ממשיכים עם ברירות המחדל */
}
