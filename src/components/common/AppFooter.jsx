import { Link } from 'react-router-dom';
import FaIcon from './FaIcon';

export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <Link to="/" className="logo" style={{ color: '#fff' }}>
              <div className="logo-mark">R</div>Raktak<span>k</span>
            </Link>
            <p>
              Plateforme de mise en relation entre clients et prestataires vérifiés.
              Trouvez rapidement le bon service, dans la bonne ville.
            </p>
            <div className="footer-social-desktop">
              <a href="#" className="social-link" aria-label="Facebook" title="Facebook">
                <FaIcon name="facebook" />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn" title="LinkedIn">
                <FaIcon name="linkedin" />
              </a>
              <a href="#" className="social-link" aria-label="Twitter" title="Twitter">
                <FaIcon name="twitter" />
              </a>
              <a href="#" className="social-link" aria-label="Instagram" title="Instagram">
                <FaIcon name="instagram" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="footer-col">
            <h4>Plateforme</h4>
            <div className="footer-links">
              <Link to="/search"><FaIcon name="magnifying-glass" className="footer-icon" /> Rechercher</Link>
              <Link to="/categories"><FaIcon name="layer-group" className="footer-icon" /> Catégories</Link>
              <Link to="/listing"><FaIcon name="briefcase" className="footer-icon" /> Prestataires</Link>
              <Link to="/pricing"><FaIcon name="tag" className="footer-icon" /> Tarifs</Link>
            </div>
          </div>

          {/* Resources Links */}
          <div className="footer-col">
            <h4>Ressources</h4>
            <div className="footer-links">
              <Link to="/faq"><FaIcon name="circle-question" className="footer-icon" /> FAQ</Link>
              <Link to="/contact"><FaIcon name="envelope" className="footer-icon" /> Contact</Link>
              <Link to="/terms"><FaIcon name="file-lines" className="footer-icon" /> Conditions</Link>
              <Link to="/privacy"><FaIcon name="shield" className="footer-icon" /> Confidentialité</Link>
            </div>
          </div>

          {/* Account Links */}
          <div className="footer-col">
            <h4>Comptes</h4>
            <div className="footer-links">
              <Link to="/login"><FaIcon name="sign-in-alt" className="footer-icon" /> Connexion</Link>
              <Link to="/register-client"><FaIcon name="user-plus" className="footer-icon" /> Client</Link>
              <Link to="/register-vendor"><FaIcon name="store" className="footer-icon" /> Prestataire</Link>
              <Link to="/register-advertiser"><FaIcon name="bullhorn" className="footer-icon" /> Annonceur</Link>
            </div>
          </div>
        </div>

        {/* Footer Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; {year} Raktakk. Tous droits réservés.</p>
            <div className="footer-badges">
              <span className="badge badge-sm" title="Plateforme sécurisée">
                <FaIcon name="lock" /> Sécurisée
              </span>
              <span className="badge badge-sm" title="Support 24/7">
                <FaIcon name="headset" /> Support
              </span>
            </div>
          </div>
          <div className="footer-social-mobile">
            <a href="#" aria-label="Facebook"><FaIcon name="facebook" /></a>
            <a href="#" aria-label="LinkedIn"><FaIcon name="linkedin" /></a>
            <a href="#" aria-label="Twitter"><FaIcon name="twitter" /></a>
            <a href="#" aria-label="Instagram"><FaIcon name="instagram" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
