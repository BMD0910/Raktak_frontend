export default function FaIcon({ name, className = '', title = '', brand = false, regular = false, solid = true, style = {} }) {
  const prefix = brand ? 'fa-brands' : regular ? 'fa-regular' : 'fa-solid';
  return (
    <i
      className={`${prefix} fa-${name} ${className}`.trim()}
      aria-hidden={title ? undefined : 'true'}
      title={title || undefined}
      style={style}
    />
  );
}