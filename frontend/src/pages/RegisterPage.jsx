import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/client'
import { useAuthStore } from '../store/useStore'
import { useTranslation } from '../utils/i18n'
import toast from 'react-hot-toast'
import { Heart, ChevronRight, ChevronLeft } from 'lucide-react'

const STEPS = ['Account', 'Profile', 'Smoking Info']

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    email: '', password: '', full_name: '',
    age: '', gender: 'Male',
    smoking_duration_years: '', avg_cigarettes_per_day: '',
    lang_pref: 'English',
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation(form.lang_pref)

  const update = (field, val) => setForm((f) => ({ ...f, [field]: val }))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data } = await authAPI.register({
        ...form,
        age: parseInt(form.age),
        smoking_duration_years: parseInt(form.smoking_duration_years),
        avg_cigarettes_per_day: parseInt(form.avg_cigarettes_per_day),
      })
      login(data.access_token, { id: data.user_id, full_name: data.full_name })
      toast.success('Account created! Welcome to BreatheFree 🌿')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-red/20 border border-accent-red/30 mb-4">
            <Heart className="w-8 h-8 text-accent-red animate-pulse" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white text-glow">BreatheFree</h1>
          <p className="text-gray-400 text-sm mt-1">Begin your quit journey today</p>
        </div>

        <div className="glass-card p-8">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${i <= step ? 'bg-accent-red text-white' : 'bg-white/10 text-gray-500'}`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block transition-colors
                  ${i === step ? 'text-white' : 'text-gray-500'}`}>{t(s)}</span>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 transition-all ${i < step ? 'bg-accent-red' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 0: Account */}
          {step === 0 && (
            <div className="space-y-4 animate-in">
              <div>
                <label className="text-xs text-gray-400 mb-1 block uppercase tracking-wider">{t('Full Name')}</label>
                <input className="input-field" placeholder="Your Name" value={form.full_name}
                  onChange={(e) => update('full_name', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block uppercase tracking-wider">{t('Email')}</label>
                <input type="email" className="input-field" placeholder="you@example.com" value={form.email}
                  onChange={(e) => update('email', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block uppercase tracking-wider">{t('Password')}</label>
                <input type="password" className="input-field" placeholder="Minimum 8 characters" value={form.password}
                  onChange={(e) => update('password', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 1: Profile */}
          {step === 1 && (
            <div className="space-y-4 animate-in">
              <div>
                <label className="text-xs text-gray-400 mb-1 block uppercase tracking-wider">{t('Age')}</label>
                <input type="number" className="input-field" placeholder="e.g. 32" value={form.age}
                  onChange={(e) => update('age', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block uppercase tracking-wider">{t('Gender')}</label>
                <div className="flex gap-3">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button key={g} type="button"
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all
                        ${form.gender === g ? 'bg-accent-red border-accent-red text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-accent-red/40'}`}
                      onClick={() => update('gender', g)}>{t(g)}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block uppercase tracking-wider">{t('Preferred Language')}</label>
                <div className="flex gap-3">
                  {['English', 'Tamil'].map((l) => (
                    <button key={l} type="button"
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all
                        ${form.lang_pref === l ? 'bg-accent-red border-accent-red text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-accent-red/40'}`}
                      onClick={() => update('lang_pref', l)}>{t(l)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Smoking Info */}
          {step === 2 && (
            <div className="space-y-4 animate-in">
              <div className="glass-card p-4 border-accent-red/20">
                <p className="text-xs text-gray-400 leading-relaxed">
                  ℹ️ This information helps our AI model calculate your health impact.
                  Predictions are educational estimates based on WHO/CDC research data.
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block uppercase tracking-wider">{t('Years of Smoking')}</label>
                <input type="number" className="input-field" placeholder="e.g. 5" value={form.smoking_duration_years}
                  onChange={(e) => update('smoking_duration_years', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block uppercase tracking-wider">{t('Cigarettes Per Day (avg)')}</label>
                <input type="number" className="input-field" placeholder="e.g. 10" value={form.avg_cigarettes_per_day}
                  onChange={(e) => update('avg_cigarettes_per_day', e.target.value)} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button className="btn-secondary flex items-center gap-2 flex-1" onClick={() => setStep(step - 1)}>
                <ChevronLeft size={18} /> {t('Back')}
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button className="btn-primary flex items-center justify-center gap-2 flex-1"
                onClick={() => setStep(step + 1)}>
                {t('Continue')} <ChevronRight size={18} />
              </button>
            ) : (
              <button className="btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? '...' : t('Start My Journey 🌿')}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-red hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
