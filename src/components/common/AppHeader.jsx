import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import FaIcon from './FaIcon';

function IconLink({ to, children, icon, onClick, className = '' }) {
  return (
    <NavLink to={to} onClick={onClick} className={({ isActive }) => `${className} ${isActive ? 'is-active' : ''}`.trim()}>
      {icon ? <FaIcon name={icon} style={{ marginRight: 8 }} /> : null}
      <span>{children}</span>
    </NavLink>
  );
}

export default function AppHeader() {
  const [open, setOpen] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [browseDropdownOpen, setBrowseDropdownOpen] = useState(false);
  const { user, profile, isVendor, vendorVerified, logout, resolveDashboardPath, getUserType } = useAuth();
  const dashboardPath = resolveDashboardPath(user, { isVendor, vendorVerified });
  const userType = getUserType(user, { isVendor, vendorVerified });

  return (
    <header className="header" id="header">
      <div className="container">
        <div className="header-inner">
          <Link to="/" className="logo" aria-label="Raktakk Accueil">
            <div className="logo-mark">R</div>
            <div className="logo-text">
              <span className="logo-name">Raktak<span>k</span></span>
              <small className="logo-tagline">Services vérifiés</small>
            </div>
          </Link>
          <nav className="nav" aria-label="Navigation principale">
            <NavLink end to="/" className={({ isActive }) => `nav-link-item ${isActive ? 'is-active' : ''}`.trim()}><FaIcon name="house" /> <span>Accueil</span></NavLink>
            <div
              className="account-dropdown"
              onMouseEnter={() => setBrowseDropdownOpen(true)}
              onMouseLeave={() => setBrowseDropdownOpen(false)}
            >
              <button 
                className="btn btn-ghost btn-sm header-action-link action-secondary account-dropdown-btn"
                onClick={() => setBrowseDropdownOpen((value) => !value)}
                aria-expanded={browseDropdownOpen}
                aria-haspopup="true"
              >
                <FaIcon name="compass" className="me-2" />
                Explorer
                <FaIcon name={browseDropdownOpen ? 'chevron-up' : 'chevron-down'} className="ms-1" style={{ fontSize: '0.75rem' }} />
              </button>
              {browseDropdownOpen && (
                <div className="account-dropdown-menu">
                  <NavLink 
                    to="/categories" 
                    className="account-dropdown-item"
                    onClick={() => setBrowseDropdownOpen(false)}
                  >
                    <FaIcon name="layer-group" className="me-2" />
                    Catégories
                  </NavLink>
                  <NavLink 
                    to="/vendors" 
                    className="account-dropdown-item"
                    onClick={() => setBrowseDropdownOpen(false)}
                  >
                    <FaIcon name="building" className="me-2" />
                    Prestataires
                  </NavLink>
                  <NavLink 
                    to="/services" 
                    className="account-dropdown-item"
                    onClick={() => setBrowseDropdownOpen(false)}
                  >
                    <FaIcon name="screwdriver-wrench" className="me-2" />
                    Services
                  </NavLink>
                </div>
              )}
            </div>
            <NavLink to="/pricing" className={({ isActive }) => `nav-link-item ${isActive ? 'is-active' : ''}`.trim()}><FaIcon name="money-bill-wave" /> <span>Tarifs</span></NavLink>
            <NavLink to="/contact" className={({ isActive }) => `nav-link-item ${isActive ? 'is-active' : ''}`.trim()}><FaIcon name="envelope" /> <span>Contact</span></NavLink>
          </nav>
          <div className={`header-actions ${user ? 'is-authenticated' : 'is-guest'}`}>
            {user ? (
              <>
                {userType === 'ADMIN' ? <NavLink to="/dashboard/admin" className="btn btn-ghost btn-sm header-action-link action-primary"><FaIcon name="chart-column" className="me-2" />Admin</NavLink> : null}
                {userType === 'VENDOR' ? <NavLink to="/dashboard/vendor" className="btn btn-ghost btn-sm header-action-link action-primary"><FaIcon name="briefcase" className="me-2" />Dashboard vendeur</NavLink> : null}
                {userType === 'CLIENT' ? (
                  <div
                    className="account-dropdown"
                    onMouseEnter={() => setClientDropdownOpen(true)}
                    onMouseLeave={() => setClientDropdownOpen(false)}
                  >
                    <button 
                      className="btn btn-ghost btn-sm header-action-link action-secondary account-dropdown-btn"
                      onClick={() => setClientDropdownOpen((value) => !value)}
                      aria-expanded={clientDropdownOpen}
                      aria-haspopup="true"
                    >
                      <FaIcon name="user" className="me-2" />
                      Mon compte
                      <FaIcon name={clientDropdownOpen ? 'chevron-up' : 'chevron-down'} className="ms-1" style={{ fontSize: '0.75rem' }} />
                    </button>
                    {clientDropdownOpen && (
                      <div className="account-dropdown-menu">
                        <NavLink 
                          to="/account/requests" 
                          className="account-dropdown-item"
                          onClick={() => setClientDropdownOpen(false)}
                        >
                          <FaIcon name="clipboard-list" className="me-2" />
                          Mes demandes
                        </NavLink>
                        <NavLink 
                          to="/account/profile" 
                          className="account-dropdown-item"
                          onClick={() => setClientDropdownOpen(false)}
                        >
                          <FaIcon name="user" className="me-2" />
                          Profil
                        </NavLink>
                        <NavLink 
                          to="/become-vendor" 
                          className="account-dropdown-item"
                          onClick={() => setClientDropdownOpen(false)}
                        >
                          <FaIcon name="screwdriver-wrench" className="me-2" />
                          Devenir prestataire
                        </NavLink>
                      </div>
                    )}
                  </div>
                ) : null}
                {userType === 'VENDOR' && !profile?.profileCompleted ? <NavLink to="/vendor/setup-profile" className="btn btn-secondary btn-sm header-action-link action-secondary"><FaIcon name="file-pen" className="me-2" />Compléter profil</NavLink> : null}
                {userType === 'VENDOR' && profile?.profileCompleted ? <NavLink to="/dashboard/vendor/create-service" className="btn btn-secondary btn-sm header-action-link action-secondary"><FaIcon name="plus" className="me-2" />Créer un service</NavLink> : null}
                <button className="btn btn-primary btn-sm header-action-link action-primary" onClick={logout}><FaIcon name="right-from-bracket" className="me-2" />Déconnexion</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-ghost btn-sm header-action-link action-secondary"><FaIcon name="right-to-bracket" className="me-2" />Connexion</NavLink>
                <NavLink to="/register" className="btn btn-primary btn-sm header-action-link action-primary"><FaIcon name="pen-to-square" className="me-2" />Inscription</NavLink>
              </>
            )}
          </div>
          <button className="mobile-toggle" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <FaIcon name={open ? 'xmark' : 'bars'} />
          </button>
        </div>
      </div>
      <nav className={`mobile-menu ${open ? 'open' : ''}`} aria-label="Menu mobile">
        <div className="mobile-menu-panel">
          <IconLink to="/" onClick={() => setOpen(false)} icon="house" className="mobile-nav-link">Accueil</IconLink>
          <div className="mobile-browse-menu">
            <button 
              className="mobile-browse-menu-btn mobile-nav-link"
              onClick={() => setBrowseDropdownOpen(!browseDropdownOpen)}
              aria-expanded={browseDropdownOpen}
            >
              <FaIcon name="compass" style={{ marginRight: 8 }} />
              <span>Explorer</span>
              <FaIcon name={browseDropdownOpen ? 'chevron-up' : 'chevron-down'} style={{ marginLeft: 8, fontSize: '0.75rem' }} />
            </button>
            {browseDropdownOpen && (
              <div className="mobile-browse-menu-items">
                <IconLink to="/categories" onClick={() => { setOpen(false); setBrowseDropdownOpen(false); }} icon="layer-group" className="mobile-nav-link mobile-nested-link">Catégories</IconLink>
                <IconLink to="/vendors" onClick={() => { setOpen(false); setBrowseDropdownOpen(false); }} icon="building" className="mobile-nav-link mobile-nested-link">Prestataires</IconLink>
                <IconLink to="/services" onClick={() => { setOpen(false); setBrowseDropdownOpen(false); }} icon="screwdriver-wrench" className="mobile-nav-link mobile-nested-link">Services</IconLink>
              </div>
            )}
          </div>
          <IconLink to="/pricing" onClick={() => setOpen(false)} icon="money-bill-wave" className="mobile-nav-link">Tarifs</IconLink>
          <IconLink to="/contact" onClick={() => setOpen(false)} icon="envelope" className="mobile-nav-link">Contact</IconLink>
        {user ? (
          <>
            {userType === 'CLIENT' ? <IconLink to="/account" onClick={() => setOpen(false)} icon="house" className="mobile-nav-link">Espace client</IconLink> : <IconLink to={dashboardPath} onClick={() => setOpen(false)} icon="chart-column" className="mobile-nav-link">Dashboard</IconLink>}
            {userType === 'CLIENT' ? (
              <div className="mobile-account-menu">
                <button 
                  className="mobile-account-menu-btn mobile-nav-link"
                  onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                  aria-expanded={clientDropdownOpen}
                >
                  <FaIcon name="user" style={{ marginRight: 8 }} />
                  <span>Mon compte</span>
                  <FaIcon name={clientDropdownOpen ? 'chevron-up' : 'chevron-down'} style={{ marginLeft: 8, fontSize: '0.75rem' }} />
                </button>
                {clientDropdownOpen && (
                  <div className="mobile-account-menu-items">
                    <IconLink to="/account/requests" onClick={() => { setOpen(false); setClientDropdownOpen(false); }} icon="clipboard-list" className="mobile-nav-link mobile-nested-link">Mes demandes</IconLink>
                    <IconLink to="/account/profile" onClick={() => { setOpen(false); setClientDropdownOpen(false); }} icon="user" className="mobile-nav-link mobile-nested-link">Profil</IconLink>
                    <IconLink to="/become-vendor" onClick={() => { setOpen(false); setClientDropdownOpen(false); }} icon="screwdriver-wrench" className="mobile-nav-link mobile-nested-link">Devenir prestataire</IconLink>
                  </div>
                )}
              </div>
            ) : null}
            {userType === 'VENDOR' && !profile?.profileCompleted ? <IconLink to="/vendor/setup-profile" onClick={() => setOpen(false)} icon="file-pen" className="mobile-nav-link">Compléter profil</IconLink> : null}
            {userType === 'VENDOR' && profile?.profileCompleted ? <IconLink to="/dashboard/vendor/create-service" onClick={() => setOpen(false)} icon="plus" className="mobile-nav-link">Créer un service</IconLink> : null}
            <button className="btn btn-primary mobile-logout" onClick={async () => { setOpen(false); await logout(); }}><FaIcon name="right-from-bracket" style={{ marginRight: 8 }} />Déconnexion</button>
          </>
        ) : (
          <>
            <IconLink to="/login" onClick={() => setOpen(false)} icon="right-to-bracket" className="mobile-nav-link">Connexion</IconLink>
            <IconLink to="/register" onClick={() => setOpen(false)} icon="pen-to-square" className="mobile-nav-link">Inscription</IconLink>
          </>
        )}
        </div>
      </nav>
      <button
        type="button"
        className={`mobile-menu-backdrop ${open ? 'open' : ''}`}
        aria-label="Fermer le menu"
        onClick={() => setOpen(false)}
      />
    </header>
  );
}
