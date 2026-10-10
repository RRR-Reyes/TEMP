import { HashRouter, Routes, Route } from 'react-router-dom';
import { SelectionProvider } from '@/context/SelectionContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Overview from '@/pages/Overview';
import RiskRadar from '@/pages/RiskRadar';
import Forecast from '@/pages/Forecast';

export default function App() {
  return (
    <SelectionProvider>
      <HashRouter>
        <div className="min-h-screen bg-warmwhite">
          <Navigation />
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/radar" element={<RiskRadar />} />
            <Route path="/forecast" element={<Forecast />} />
          </Routes>
          <Footer />
        </div>
      </HashRouter>
    </SelectionProvider>
  );
}
