export default function KpiCard({ icon, value, label, tone = 'orange' }) {
  return (
    <div className="kpi-card">
      <div className="kpi-header"><div className={`kpi-icon ${tone}`}>{icon}</div></div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}
