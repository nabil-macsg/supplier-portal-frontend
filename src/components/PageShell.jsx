export default function PageShell({ title, subtitle, action, children }) {
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Supplier Workspace</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {action && <div className="heading-action">{action}</div>}
      </div>
      {children}
    </div>
  );
}
