import FaIcon from './FaIcon';

export default function SectionHeader({ label, icon, title, subtitle, centered = false }) {
  return (
    <div className={`section-header ${centered ? 'text-center' : ''}`}>
      {label ? (
        <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {icon ? <FaIcon name={icon} /> : null}
          <span>{label}</span>
        </span>
      ) : null}
      <h2 className="display-sm" style={{ marginTop: 8 }}>{title}</h2>
      {subtitle ? <p className="text-muted" style={{ maxWidth: 620, margin: centered ? '0 auto' : '0' }}>{subtitle}</p> : null}
    </div>
  );
}
