import { useEffect } from 'react'
import {
  ArrowRight,
  Cpu,
  Database,
  Gauge,
  LineChart,
  Loader2,
  Server,
  Sparkles,
  TreePine,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { trainDataStore } from '../zustand/traningdataState'

const FEATURES = [
  {
    icon: Database,
    title: 'Dataset Training',
    desc: 'Paste a raw CSV URL and train the Random Forest model instantly.',
  },
  {
    icon: Gauge,
    title: 'Live Accuracy',
    desc: 'Real-time training status with accuracy and row counts as ML runs.',
  },
  {
    icon: TreePine,
    title: 'Tree Visualization',
    desc: 'Inspect the first decision tree of the forest with SVG rendering.',
  },
]

function SplashScreen() {
  const navigate = useNavigate()
  const { health, healthLoading, getHealth } = trainDataStore()

  useEffect(() => {
    getHealth()
  }, [getHealth])

  const checkState =
    healthLoading || health === null ? 'checking' : health === 200 ? 'online' : 'offline'

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <Server className="w-4 h-4 text-emerald-400" />
          Express Gateway + FastAPI Microservice
        </div>

        {/* Backend health chip */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
            checkState === 'online'
              ? 'bg-emerald-500/10 border-emerald-400/40 text-emerald-300'
              : checkState === 'offline'
                ? 'bg-red-500/10 border-red-400/40 text-red-300'
                : 'bg-slate-500/10 border-slate-400/40 text-slate-300'
          }`}
        >
          {checkState === 'checking' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : checkState === 'online' ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-red-400" />
          )}
          {checkState === 'checking'
            ? 'Checking backend…'
            : checkState === 'online'
              ? 'Backend online'
              : 'Backend offline'}
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center gap-10 px-6">
        {/* Animated logo */}
        <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-blue-500/20 border border-blue-400/30 shadow-lg shadow-blue-500/30 animate-float">
          <Cpu className="w-12 h-12 text-sky-400 animate-pulse" />
        </div>

        {/* Title / tagline */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-sky-300 text-xs font-mono uppercase tracking-[0.3em]">
            <LineChart className="w-4 h-4" />
            AI Churn Prediction Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Churn Detection{' '}
            <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Model
            </span>
          </h1>
          {/* description */}
          <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            Train a Random Forest on your customer dataset and instantly visualize
            the decision tree that drives churn predictions.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
            >
              <Icon className="w-5 h-5 text-sky-400 mb-2" />
              <h3 className="text-sm font-semibold text-sky-200 mb-1">{title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* button of start - this start button navigates to main screen */}
        <button
          onClick={() => navigate('/main')}
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-lg shadow-xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-400/40"
        >
          <Sparkles className="w-5 h-5" />
          Start
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>

        {checkState === 'offline' && (
          <p className="text-xs text-red-300 -mt-4">
            Backend is unreachable. You can still explore, but training will fail.
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 text-center text-xs text-slate-500 font-mono">
        Churn Prediction Platform · v1.0.0
      </footer>
    </div>
  )
}

export default SplashScreen