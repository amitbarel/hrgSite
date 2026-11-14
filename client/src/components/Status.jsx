// מצב טעינה / שגיאה אחיד לכל הדפים
export default function Status({ loading, error }) {
  if (loading) return <p className="status-msg">טוען…</p>;
  if (error) return <p className="status-msg error">לא הצלחנו לטעון את הנתונים מהשרת. האם השרת רץ? ({error.message})</p>;
  return null;
}
