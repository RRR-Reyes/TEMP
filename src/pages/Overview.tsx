import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  Crosshair,
  TrendingUp,
  Thermometer,
  Droplets,
  CloudRain,
  Waves,
  AlertTriangle,
  Sprout,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { IMAGES } from '@/data/theme';
import OverviewGlobe from '@/components/OverviewGlobe';
import RiskLegend from '@/components/RiskLegend';

export default function Overview() {
  const navigate = useNavigate();
  const heroReveal = useScrollReveal<HTMLDivElement>();
  const problemReveal = useScrollReveal<HTMLDivElement>();
  const capabilitiesReveal = useScrollReveal<HTMLDivElement>();
  const envReveal = useScrollReveal<HTMLDivElement>();
  const globeReveal = useScrollReveal<HTMLDivElement>();
  const radarReveal = useScrollReveal<HTMLDivElement>();
  const howReveal = useScrollReveal<HTMLDivElement>();
  const ctaReveal = useScrollReveal<HTMLDivElement>();

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMAGES.heroField}
            alt="Aerial view of farmland with rolling crop fields"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-900/70 via-forest-900/50 to-forest-900/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-900/60 to-transparent" />
        </div>

        {/* Animated data motif overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 border border-olive-400/30 rounded-full animate-slow-rotate" />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 border border-olive-400/20 rounded-full" />
        </div>

        <div
          ref={heroReveal.ref}
          className={`relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full ${heroReveal.visible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <div className="max-w-2xl">
            <p className="text-olive-300 text-sm font-medium uppercase tracking-[0.2em] mb-6">
              Agricultural Intelligence Platform
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-warmwhite leading-[1.05] text-balance mb-6">
              See the Risk.
              <br />
              Protect the Harvest.
            </h1>
            <p className="text-warmwhite/70 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              CropWatch transforms weather and environmental data into actionable insights about
              agricultural pests and crop diseases across the contiguous United States.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/radar"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-olive-500 hover:bg-olive-400 text-warmwhite font-semibold rounded-sm transition-all hover:scale-[1.02]"
              >
                Explore Risk Radar
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-warmwhite/30 hover:border-warmwhite/60 text-warmwhite font-semibold rounded-sm transition-colors"
              >
                Discover How It Works
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-warmwhite/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-warmwhite/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Section B — The Problem */}
      <section className="py-24 lg:py-32 bg-warmwhite">
        <div
          ref={problemReveal.ref}
          className={`max-w-7xl mx-auto px-6 lg:px-8 ${problemReveal.visible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src={IMAGES.stormField}
                alt="Storm clouds gathering over a corn field"
                className="w-full h-[500px] object-cover rounded-sm"
              />
              <div className="absolute -bottom-6 -right-6 bg-forest-800 text-warmwhite p-6 rounded-sm max-w-xs hidden md:block">
                <p className="text-olive-300 text-xs uppercase tracking-wider mb-2">Environmental Risk</p>
                <p className="text-sm leading-relaxed">
                  Weather patterns create conditions that can rapidly shift agricultural risk profiles.
                </p>
              </div>
            </div>
            <div>
              <p className="text-olive-600 text-sm font-medium uppercase tracking-[0.15em] mb-4">
                The Challenge
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-forest-900 leading-tight mb-6 text-balance">
                Weather drives risk. Visibility drives action.
              </h2>
              <div className="space-y-4 text-charcoal/80 leading-relaxed">
                <p>
                  Environmental conditions — temperature, humidity, rainfall, drought — can create
                  favorable conditions for specific agricultural pests and pathogens. Risk can vary
                  significantly between neighboring counties.
                </p>
                <p>
                  Identifying vulnerable areas early, before conditions escalate, gives growers time
                  to monitor, prepare, and respond. Local, county-level information is essential —
                  statewide summaries miss the conditions that matter most to individual fields.
                </p>
              </div>
              <div className="mt-8 space-y-3">
                {[
                  'Weather-driven changes in agricultural risk',
                  'Early identification of vulnerable areas',
                  'County-level granularity, not just statewide summaries',
                  'Environmental suitability is not confirmed disease presence',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-olive-500 rounded-full mt-2.5 shrink-0" />
                    <span className="text-charcoal/70 text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section C — What CropWatch Does */}
      <section className="py-24 lg:py-32 bg-forest-900 text-warmwhite">
        <div
          ref={capabilitiesReveal.ref}
          className={`max-w-7xl mx-auto px-6 lg:px-8 ${capabilitiesReveal.visible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <div className="text-center mb-16">
            <p className="text-olive-300 text-sm font-medium uppercase tracking-[0.15em] mb-4">
              What CropWatch Does
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-balance">
              From raw environmental data to prepared fields
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Eye,
                title: 'Monitor',
                desc: 'Track relevant environmental conditions continuously — temperature, humidity, rainfall, and drought indicators — across the entire contiguous United States.',
                image: IMAGES.aerialFields,
              },
              {
                icon: Crosshair,
                title: 'Identify',
                desc: 'Highlight geographic areas where conditions may favor specific agricultural pests or diseases, down to the county level.',
                image: IMAGES.farmerInspect,
              },
              {
                icon: TrendingUp,
                title: 'Forecast',
                desc: 'Show how environmental conditions and weather forecasts may affect estimated risk over the next seven days.',
                image: IMAGES.rollingFields,
              },
            ].map((cap, idx) => (
              <div
                key={cap.title}
                className={`group relative overflow-hidden rounded-sm bg-forest-800/50 border border-forest-700/40 hover:border-olive-500/40 transition-colors duration-500 ${
                  capabilitiesReveal.visible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${idx * 150 + 150}ms` }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={cap.image}
                    alt={cap.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <cap.icon className="w-6 h-6 text-olive-300" />
                    <h3 className="font-display text-2xl font-semibold">{cap.title}</h3>
                  </div>
                  <p className="text-warmwhite/60 leading-relaxed text-sm">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section D — Environmental Intelligence */}
      <section className="py-24 lg:py-32 bg-warmwhite">
        <div
          ref={envReveal.ref}
          className={`max-w-7xl mx-auto px-6 lg:px-8 ${envReveal.visible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-olive-600 text-sm font-medium uppercase tracking-[0.15em] mb-4">
                Environmental Intelligence
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-forest-900 leading-tight mb-6 text-balance">
                Different threats respond to different conditions
              </h2>
              <p className="text-charcoal/70 leading-relaxed mb-8">
                Every agricultural pest and disease has its own environmental requirements. CropWatch
                evaluates multiple factors in combination — never assuming that the same weather
                predicts every threat.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Thermometer, label: 'Temperature', desc: 'Pathogen growth and pest development' },
                  { icon: Droplets, label: 'Relative Humidity', desc: 'Spore germination and fungal pressure' },
                  { icon: CloudRain, label: 'Precipitation', desc: 'Leaf wetness and disease spread' },
                  { icon: AlertTriangle, label: 'Drought Conditions', desc: 'Plant stress and susceptibility' },
                  { icon: Waves, label: 'Soil Moisture', desc: 'Root health and water stress' },
                  { icon: ShieldCheck, label: 'Suitability Index', desc: 'Disease-specific environmental scoring' },
                ].map((factor, idx) => (
                  <div
                    key={factor.label}
                    className={`border border-forest-100 rounded-sm p-4 hover:border-olive-400 hover:bg-olive-50/60 transition-colors duration-500 ${
                      envReveal.visible ? 'animate-fade-in-up' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${idx * 90 + 200}ms` }}
                  >
                    <factor.icon className="w-5 h-5 text-olive-600 mb-2" />
                    <p className="text-forest-900 font-medium text-sm">{factor.label}</p>
                    <p className="text-charcoal/50 text-xs mt-1">{factor.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src={IMAGES.cornRows}
                alt="Rows of healthy green corn plants"
                className="w-full h-[600px] object-cover rounded-sm"
              />
              <div className="absolute top-6 left-6 bg-warmwhite/90 backdrop-blur-sm p-5 rounded-sm max-w-[200px]">
                <p className="text-olive-600 text-xs font-semibold uppercase tracking-wider mb-2">Did you know?</p>
                <p className="text-charcoal text-sm leading-relaxed">
                  Gray leaf spot thrives at 75-85°F with prolonged leaf wetness — conditions that can
                  vary county by county.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section E — Geographic Coverage with Globe */}
      <section className="py-24 lg:py-32 bg-forest-950 text-warmwhite relative overflow-hidden">
        <div
          ref={globeReveal.ref}
          className={`max-w-7xl mx-auto px-6 lg:px-8 ${globeReveal.visible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-olive-300 text-sm font-medium uppercase tracking-[0.15em] mb-4">
                Geographic Coverage
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-balance leading-tight mb-6">
                From a national view to county-level insight
              </h2>
              <p className="text-warmwhite/60 leading-relaxed mb-6">
                CropWatch covers the entire contiguous United States. Move from a global geographic
                overview to individual U.S. counties — exploring environmental conditions and
                agricultural risk at every level.
              </p>
              <p className="text-warmwhite/50 text-sm leading-relaxed mb-8">
                Click the United States on the globe to explore detailed risk data, or use the Risk
                Radar for a dedicated monitoring experience.
              </p>
              <Link
                to="/radar"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-olive-500 hover:bg-olive-400 text-warmwhite font-semibold rounded-sm transition-all hover:scale-[1.02]"
              >
                Open Risk Radar
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-forest-900/40 rounded-lg blur-3xl" />
              <div className="relative rounded-lg overflow-hidden border border-forest-700/30">
                <OverviewGlobe
                  height="500px"
                  onUSClick={() => navigate('/radar')}
                />
              </div>
              <p className="text-center text-warmwhite/40 text-xs mt-4">
                Drag to rotate · Scroll to zoom · Click the United States to explore
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section F — Risk Radar Preview */}
      <section className="py-24 lg:py-32 bg-warmwhite">
        <div
          ref={radarReveal.ref}
          className={`max-w-7xl mx-auto px-6 lg:px-8 ${radarReveal.visible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-2">
              <p className="text-olive-600 text-sm font-medium uppercase tracking-[0.15em] mb-4">
                Risk Radar Preview
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-forest-900 leading-tight mb-6 text-balance">
                Explore risk across the entire contiguous United States
              </h2>
              <p className="text-charcoal/70 leading-relaxed mb-6">
                The Risk Radar provides an interactive, globe-based experience for exploring
                agricultural risk. Navigate from the national view into individual states and
                counties — clicking any county reveals its environmental conditions and
                pest-specific risk predictions.
              </p>
              <div className="mb-8">
                <p className="text-charcoal/50 text-xs uppercase tracking-wider mb-3">Risk Levels</p>
                <div className="flex gap-4 flex-wrap">
                  <RiskLegendDark />
                </div>
              </div>
              <Link
                to="/radar"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-forest-800 hover:bg-forest-700 text-warmwhite font-semibold rounded-sm transition-colors"
              >
                Open Risk Radar
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="lg:col-span-3 relative">
              <div className="rounded-sm overflow-hidden border border-forest-100 shadow-lg">
                <img
                  src={IMAGES.patchworkFields}
                  alt="Aerial view of patchwork agricultural fields across the US"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <p className="text-warmwhite font-display text-2xl font-semibold">3,100+ Counties</p>
                    <p className="text-warmwhite/70 text-sm">Contiguous U.S. coverage</p>
                  </div>
                  <div className="flex gap-2">
                    {['#4a7c3a', '#d4a72c', '#e07a3c', '#c0392b', '#6b6b6b'].map((c) => (
                      <span key={c} className="w-5 h-5 rounded-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section G — How It Works */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-forest-900 text-warmwhite">
        <div
          ref={howReveal.ref}
          className={`max-w-7xl mx-auto px-6 lg:px-8 ${howReveal.visible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <div className="text-center mb-16">
            <p className="text-olive-300 text-sm font-medium uppercase tracking-[0.15em] mb-4">
              How It Works
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-balance">
              Three steps from observation to preparation
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-olive-500/0 via-olive-500/40 to-olive-500/0" />
            {[
              { num: '01', icon: Eye, title: 'Observe', desc: 'Gather weather, forecast, and environmental information from across the contiguous United States.' },
              { num: '02', icon: Crosshair, title: 'Assess', desc: 'Evaluate conditions relevant to specific crops, pests, and diseases using environmental suitability models.' },
              { num: '03', icon: ShieldCheck, title: 'Prepare', desc: 'Explore future risk and review appropriate monitoring recommendations for your county.' },
            ].map((step, idx) => (
              <div
                key={step.num}
                className={`relative text-center ${howReveal.visible ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${idx * 180 + 150}ms` }}
              >
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-forest-800 border-2 border-olive-500/30 mb-6">
                  <step.icon className="w-8 h-8 text-olive-300" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-olive-500 text-warmwhite text-xs font-bold rounded-full flex items-center justify-center">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-warmwhite/60 leading-relaxed text-sm max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section H — Final CTA */}
      <section className="relative py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMAGES.wheatSunset}
            alt="Golden wheat field at sunset"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-forest-900/80" />
        </div>
        <div
          ref={ctaReveal.ref}
          className={`relative z-10 max-w-3xl mx-auto px-6 text-center ${ctaReveal.visible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <Sprout className="w-12 h-12 text-olive-300 mx-auto mb-6" />
          <h2 className="font-display text-4xl md:text-6xl font-bold text-warmwhite leading-tight mb-6 text-balance">
            Know Your Risk Before It Reaches Your Fields
          </h2>
          <p className="text-warmwhite/70 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Explore geographic risk patterns and review local forecasts for your county. From national
            overview to field-level awareness — CropWatch helps you stay ahead.
          </p>
          <Link
            to="/radar"
            className="inline-flex items-center gap-2 px-10 py-4 bg-olive-500 hover:bg-olive-400 text-warmwhite font-semibold rounded-sm transition-all hover:scale-[1.03]"
          >
            Explore the U.S. Risk Map
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function RiskLegendDark() {
  const levels = [
    { color: '#4a7c3a', label: 'Low' },
    { color: '#d4a72c', label: 'Moderate' },
    { color: '#e07a3c', label: 'Elevated' },
    { color: '#c0392b', label: 'High' },
  ];
  return (
    <>
      {levels.map((l) => (
        <div key={l.label} className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: l.color }} />
          <span className="text-charcoal/70 text-sm">{l.label}</span>
        </div>
      ))}
    </>
  );
}
