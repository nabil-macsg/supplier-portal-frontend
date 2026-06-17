export default function FormPanel({ title, description, children, onSubmit, submitLabel = 'Save', secondary }) {
  return (
    <form className="form-card refined" onSubmit={onSubmit}>
      <div className="card-title-row">
        <div>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
        {secondary}
      </div>
      <div className="form-grid">{children}</div>
      <div className="form-actions"><button className="primary-btn" type="submit">{submitLabel}</button></div>
    </form>
  );
}
