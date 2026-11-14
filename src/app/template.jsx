// נבנה מחדש בכל מעבר דף, ולכן אנימציית הכניסה רצה כל פעם מחדש
export default function Template({ children }) {
  return <main className="page-anim">{children}</main>;
}
