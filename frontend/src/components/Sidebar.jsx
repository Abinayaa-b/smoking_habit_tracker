import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useStore'
import { useTranslation } from '../utils/i18n'
import {
  Heart, BarChart2, Target, MapPin, Settings, LogOut, Flame, Home
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'analytics', label: 'Analytics', icon: BarChart2, path: '/analytics' },
  { id: 'quit-plan', label: 'Quit Plan', icon: Target, path: '/quit-plan' },
  { id: 'location', label: 'Nearby Help', icon: MapPin, path: '/location' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
]

export default function Sidebar({ active }) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { t } = useTranslation()

  return (
    <aside className="w-64 min-h-screen bg-smoke-card/80 border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-accent-red/20 flex items-center justify-center">
          <Heart className="w-5 h-5 text-accent-red" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-glow leading-tight">BreatheFree</h1>
          <p className="text-[10px] text-gray-500 -mt-0.5">AI Health Companion</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
              ${active === id
                ? 'bg-accent-red/15 text-white border border-accent-red/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <Icon size={18} className={active === id ? 'text-accent-red' : ''} />
            {t(label)}
          </button>
        ))}
      </nav>

      {/* Urge Emergency */}
      <div className="p-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold
            border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-all"
        >
          <Flame size={18} /> Urge? Get Help
        </button>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
