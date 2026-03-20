import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useAppStore } from '../store/useStore'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import {
  Heart, TrendingDown, DollarSign, Flame, BarChart2,
  ArrowLeft, BookOpen, ShieldCheck, Calendar
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useTranslation } from '../utils/i18n'

const COLORS = ['#e94560', '#0f3460', '#533483', '#ff6b6b']

function StatCard({ icon: Icon, label, value, sub, color = 'text-accent-red' }) {
  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider">
        <Icon size={14} className={color} /> {label}
      </div>
      <div className="text-2xl font-bold font-display">{value}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [trends, setTrends] = useState([])
  const [financial, setFinancial] = useState(null)
  const [overview, setOverview] = useState(null)
  const [urgeStats, setUrgeStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const token = useAuthStore.getState().token
    const headers = { Authorization: `Bearer ${token}` }
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    try {
      const [t, f, o, u] = await Promise.all([
        fetch(`${base}/analytics/trends?days=30`, { headers }).then(r => r.json()),
        fetch(`${base}/analytics/financial`, { headers }).then(r => r.json()),
        fetch(`${base}/analytics/overview`, { headers }).then(r => r.json()),
        fetch(`${base}/analytics/urge-stats`, { headers }).then(r => r.json()),
      ])
      setTrends(t)
      setFinancial(f)
      setOverview(o)
      setUrgeStats(u)
    } catch { toast.error('Could not load analytics.') }
    finally { setLoading(false) }
  }

  const pieData = financial ? [
    { name: 'Daily', value: financial.daily || 1 },
    { name: 'Monthly', value: financial.monthly || 1 },
    { name: 'Yearly', value: financial.yearly || 1 },
  ] : []

  return (
    <div className="min-h-screen bg-hero-gradient flex">
      <Sidebar active="analytics" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold mb-2">📊 {t('Analytics Dashboard')}</h1>
          <p className="text-gray-400 mb-8">{t('Track your progress, finances, and health trends.')}</p>

          {loading ? (
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 glass-card animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Calendar} label={t('Streak')} value={`${overview?.streak_days || 0} ${t('Days')}`} sub={t('Consecutive logs')} />
                <StatCard icon={TrendingDown} label={t('Weekly Change')} value={`${overview?.week_reduction_pct || 0}%`} sub={t('vs last week')} color="text-green-400" />
                <StatCard icon={BarChart2} label={t('Avg / Day')} value={overview?.avg_daily_cigarettes || 0} sub={t('Cigarettes')} />
                <StatCard icon={Flame} label={t('Urges')} value={urgeStats?.urges_this_week || 0} sub={t('This week')} color="text-orange-400" />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Smoking Trend Line Chart */}
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold mb-4 text-sm flex items-center gap-2">
                    <TrendingDown size={16} className="text-accent-red" /> {t('Smoking Trend (30 Days)')}
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={trends}>
                      <defs>
                        <linearGradient id="colorCig" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e94560" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#e94560" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #e9456030', borderRadius: 8 }} />
                      <Area type="monotone" dataKey="cigarettes" stroke="#e94560" fill="url(#colorCig)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Financial Pie Chart */}
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold mb-4 text-sm flex items-center gap-2">
                    <DollarSign size={16} className="text-green-400" /> {t('Money Spent on Smoking')}
                  </h3>
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width="50%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      <div><span className="text-xs text-gray-400">{t('Today')}</span><div className="text-lg font-bold">₹{financial?.daily || 0}</div></div>
                      <div><span className="text-xs text-gray-400">{t('This Month')}</span><div className="text-lg font-bold">₹{financial?.monthly || 0}</div></div>
                      <div><span className="text-xs text-gray-400">{t('This Year')}</span><div className="text-lg font-bold text-accent-red">₹{financial?.yearly || 0}</div></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Money Spending Bar */}
              <div className="glass-card p-6 mb-8">
                <h3 className="font-display font-semibold mb-4 text-sm flex items-center gap-2">
                  <DollarSign size={16} className="text-yellow-400" /> {t('Daily Spending Trend')}
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #e9456030', borderRadius: 8 }} />
                    <Bar dataKey="money" fill="#533483" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Alternatives */}
              {financial?.alternatives && (
                <div className="glass-card p-6 mb-8">
                  <h3 className="font-display font-semibold mb-4 text-sm flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-400" /> {t('Instead, You Could Have Bought...')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-4 text-center">
                      <div className="text-2xl mb-1">📚</div>
                      <div className="text-lg font-bold">{financial.alternatives.books}</div>
                      <div className="text-xs text-gray-400">{t('Books')}</div>
                    </div>
                    <div className="glass-card p-4 text-center">
                      <div className="text-2xl mb-1">🎬</div>
                      <div className="text-lg font-bold">{financial.alternatives.movies}</div>
                      <div className="text-xs text-gray-400">{t('Movie Tickets')}</div>
                    </div>
                    <div className="glass-card p-4 text-center">
                      <div className="text-2xl mb-1">💪</div>
                      <div className="text-lg font-bold">{financial.alternatives.gym_months}</div>
                      <div className="text-xs text-gray-400">{t('Gym Months')}</div>
                    </div>
                    <div className="glass-card p-4 text-center">
                      <div className="text-2xl mb-1">🍽️</div>
                      <div className="text-lg font-bold">{financial.alternatives.restaurant_meals}</div>
                      <div className="text-xs text-gray-400">{t('Restaurant Meals')}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Urge Analysis */}
              {urgeStats && (
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold mb-4 text-sm flex items-center gap-2">
                    <ShieldCheck size={16} className="text-green-400" /> {t('Urge Management Stats')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center"><span className="text-2xl font-bold">{urgeStats.total_urges}</span><p className="text-xs text-gray-400">{t('Total Urges')}</p></div>
                    <div className="text-center"><span className="text-2xl font-bold">{urgeStats.urges_this_week}</span><p className="text-xs text-gray-400">{t('This week')}</p></div>
                    <div className="text-center"><span className="text-2xl font-bold">{urgeStats.breathing_used}</span><p className="text-xs text-gray-400">{t('Breathing Used')}</p></div>
                    <div className="text-center"><span className="text-2xl font-bold">{urgeStats.timer_used}</span><p className="text-xs text-gray-400">{t('Timer Used')}</p></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
