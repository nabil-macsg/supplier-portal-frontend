export const Icon = ({ name, size = 20 }) => {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    dashboard: <><path d="M4 13h6V4H4v9Z"/><path d="M14 20h6V4h-6v16Z"/><path d="M4 20h6v-3H4v3Z"/></>,
    registration: <><path d="M4 5h16v14H4z"/><path d="M8 9h8"/><path d="M8 13h5"/></>,
    rfq: <><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4"/><path d="M9 12h6"/><path d="M9 16h4"/></>,
    bid: <><path d="M12 3v18"/><path d="M17 7H9.5a3 3 0 0 0 0 6H15a3 3 0 0 1 0 6H6"/></>,
    po: <><path d="M5 4h14v16H5z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/></>,
    invoice: <><path d="M7 3h10v18l-2-1-2 1-2-1-2 1-2-1V3Z"/><path d="M10 8h4"/><path d="M10 12h4"/></>,
    payment: <><path d="M3 7h18v10H3z"/><path d="M3 10h18"/><circle cx="12" cy="14" r="2"/></>,
    docs: <><path d="M4 7h6l2 2h8v10H4z"/><path d="M4 7V5h6l2 2"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
};
