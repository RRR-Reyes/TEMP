import { Link, useLocation } from 'react-router-dom';
import { Sprout, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', label: 'Overview' },
    { to: '/radar', label: 'Risk Radar' },
    { to: '/forecast', label: 'Forecast' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-forest-900/90 backdrop-blur-md border-b border-forest-700/40">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-warmwhite hover:text-olive-200 transition-colors">
            <Sprout className="w-6 h-6 text-olive-300" />
            <span className="font-display text-xl font-semibold tracking-tight">CropWatch</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.to) ? 'text-olive-300' : 'text-warmwhite/70 hover:text-warmwhite'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/radar"
              className="inline-flex items-center px-5 py-2 bg-olive-500 hover:bg-olive-400 text-warmwhite text-sm font-semibold rounded-sm transition-colors"
            >
              Explore Risk Radar
            </Link>
          </div>

          <button
            className="md:hidden text-warmwhite"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors ${
                  isActive(link.to) ? 'text-olive-300' : 'text-warmwhite/70 hover:text-warmwhite'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/radar"
              onClick={() => setMobileOpen(false)}
              className="block py-2 px-4 bg-olive-500 text-warmwhite text-sm font-semibold rounded-sm text-center"
            >
              Explore Risk Radar
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
