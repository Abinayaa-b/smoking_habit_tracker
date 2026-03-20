import { useState, useEffect } from 'react'
import { useAuthStore, useAppStore } from '../store/useStore'
import { useTranslation } from '../utils/i18n'
import toast from 'react-hot-toast'
import Sidebar from '../components/Sidebar'
import { User, Globe, DollarSign, Save, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { user, token, logout } = useAuthStore()
  const { language, setLanguage } = useAppStore()
  const { t } = useTranslation()
  const [form, setForm] = useState({
    full_name: '', age: '', smoking_duration_years: '',
    avg_cigarettes_per_day: '', cigarette_cost_per_pack: '', lang_pref: 'English'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    try {
      const res = await fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setForm({
        full_name: data.full_name || '',
        age: data.age || '',
        smoking_duration_years: data.smoking_duration_years || '',
        avg_cigarettes_per_day: data.avg_cigarettes_per_day || '',
        cigarette_cost_per_pack: data.cigarette_cost_per_pack || 25,
        lang_pref: data.lang_pref || 'English',
      })
      setLanguage(data.lang_pref || 'English')
    } catch {}
  }

  const handleSave = async () => {
    setLoading(true)
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    try {
      await fetch(`${base}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          age: parseInt(form.age),
          smoking_duration_years: parseInt(form.smoking_duration_years),
          avg_cigarettes_per_day: parseInt(form.avg_cigarettes_per_day),
          cigarette_cost_per_pack: parseFloat(form.cigarette_cost_per_pack)
        })
      })
      setLanguage(form.lang_pref)
      toast.success('Profile updated successfully! ✅')
    } catch {
      toast.error('Failed to update profile.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex">
      <Sidebar active="settings" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-bold mb-2">⚙️ {t('Settings')}</h1>
          <p className="text-gray-400 mb-8">{t('Manage your profile, language, and preferences.')}</p>

          {/* Profile Section */}
          <div className="glass-card p-6 mb-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <User size={18} className="text-accent-red" /> {t('Profile Information')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">{t('Full Name')}</label>
                <input className="input-field" value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">{t('Age')}</label>
                  <input type="number" className="input-field" value={form.age}
                    onChange={e => setForm({ ...form, age: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">{t('Years of Smoking')}</label>
                  <input type="number" className="input-field" value={form.smoking_duration_years}
                    onChange={e => setForm({ ...form, smoking_duration_years: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">{t('Cigarettes Per Day (avg)')}</label>
                  <input type="number" className="input-field" value={form.avg_cigarettes_per_day}
                    onChange={e => setForm({ ...form, avg_cigarettes_per_day: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">{t('Cost per Cigarette (₹)')}</label>
                  <input type="number" className="input-field" value={form.cigarette_cost_per_pack}
                    onChange={e => setForm({ ...form, cigarette_cost_per_pack: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="glass-card p-6 mb-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Globe size={18} className="text-blue-400" /> {t('Language')}
            </h3>
            <div>
              <label className="text-xs text-gray-400 block mb-2 uppercase tracking-wider">{t('Preferred Language')}</label>
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                {['English', 'Tamil'].map(lang => (
                  <button key={lang}
                    className={`py-2 rounded-lg text-sm font-medium border transition-all
                      ${form.lang_pref === lang ? 'bg-accent-red border-accent-red text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-accent-red/40'}`}
                    onClick={() => setForm({ ...form, lang_pref: lang })}>{t(lang)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Affects AI messages, organ voice, and notifications.</p>
            </div>
          </div>

          {/* Save Button */}
          <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={handleSave} disabled={loading}>
            <Save size={18} /> {loading ? '...' : t('Save Changes')}
          </button>

          {/* Disclaimer */}
          <div className="glass-card p-4 mt-6 border-yellow-500/20">
            <div className="flex items-start gap-2">
              <Shield size={16} className="text-yellow-400 mt-0.5" />
              <p className="text-xs text-gray-400">
                ⚠️ All health predictions are educational estimates based on WHO/CDC research.
                They are not clinical diagnoses. Please consult a medical professional.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
