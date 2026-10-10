import { Link } from 'react-router-dom';
import { Sprout, Leaf, AlertTriangle, MapPin, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-warmwhite/70">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="w-6 h-6 text-olive-300" />
              <span className="font-display text-xl font-semibold text-warmwhite">CropWatch</span>
            </div>
            <p className="text-sm leading-relaxed">
              Agricultural pest and crop disease risk intelligence for the contiguous United States.
            </p>
          </div>

          <div>
            <h4 className="text-warmwhite font-semibold mb-4 text-sm uppercase tracking-wider">Navigate</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-olive-300 transition-colors">Overview</Link></li>
              <li><Link to="/radar" className="hover:text-olive-300 transition-colors">Risk Radar</Link></li>
              <li><Link to="/forecast" className="hover:text-olive-300 transition-colors">Forecast</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-warmwhite font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.weather.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-olive-300 transition-colors">NOAA Weather Service</a></li>
              <li><a href="https://droughtmonitor.unl.edu/" target="_blank" rel="noopener noreferrer" className="hover:text-olive-300 transition-colors">U.S. Drought Monitor</a></li>
              <li><a href="https://www.nass.usda.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-olive-300 transition-colors">USDA NASS</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-warmwhite font-semibold mb-4 text-sm uppercase tracking-wider">About</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-olive-400 shrink-0" />Geographic Coverage: Contiguous U.S.</li>
              <li className="flex items-start gap-2"><FileText className="w-4 h-4 mt-0.5 text-olive-400 shrink-0" />Methodology: Environmental Suitability Model</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 text-olive-400 shrink-0" />Prediction Limitations & Disclaimer</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-forest-700/40">
          <p className="text-xs text-warmwhite/50 leading-relaxed">
            CropWatch provides environmental suitability estimates based on weather and environmental data. Risk
            indicators reflect conditions that may favor pest or disease development — they do not confirm the
            actual presence of any pest or disease. Always verify field conditions through direct scouting and
            consult licensed agricultural extension professionals before making management decisions. Current
            data shown is for demonstration purposes and should not be used for operational decisions.
          </p>
          <p className="text-xs text-warmwhite/40 mt-4">
            © 2026 CropWatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
