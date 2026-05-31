import { useState } from 'react';
import { sanitizeQuery } from '../../utils/sanitize';

export default function SearchBar({ initialValue = '', onSearch, placeholder = 'Chercher un service, une entreprise...' }) {
  const [query, setQuery] = useState(initialValue);

  const submit = (event) => {
    event.preventDefault();
    const clean = sanitizeQuery(query);
    onSearch(clean);
  };

  return (
    <form className="search-bar" role="search" onSubmit={submit}>
      <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,.5)' }}>🔍</span>
      <input
        type="text"
        className="hero-search-input"
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Recherche"
      />
      <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Chercher</button>
    </form>
  );
}
