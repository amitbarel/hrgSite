export default function SectionHead({ en, title, children }) {
  return (
    <div className="section-head">
      <h2><span className="en">{en}</span>{title}</h2>
      {children}
    </div>
  );
}
