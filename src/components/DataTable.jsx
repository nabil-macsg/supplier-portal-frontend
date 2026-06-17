export default function DataTable({ columns, rows, actions }) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key}>{column.label}</th>)}
            {actions && <th className="right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="empty-cell">No records available</td></tr>
          )}
          {rows.map((row, index) => (
            <tr key={row.id || row.bidNo || row.poNo || row.invoiceNo || row.ref || row.name || index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.badge ? <span className={`status ${String(row[column.key]).toLowerCase().replaceAll(' ', '-')}`}>{row[column.key]}</span> : row[column.key]}
                </td>
              ))}
              {actions && <td className="right action-cell">{actions(row, index)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
