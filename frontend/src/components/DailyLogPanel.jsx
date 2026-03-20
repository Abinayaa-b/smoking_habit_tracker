import { useState } from 'react'
import { logsAPI } from '../api/client'
import { useTranslation } from '../utils/i18n'
import toast from 'react-hot-toast'
import { ClipboardList, Send } from 'lucide-react'

export default function DailyLogPanel({ onLogSubmit }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    cigarettes_smoked: '',
    craving_level: 5,
    mood: 'neutral',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.cigarettes_smoked) return toast.error('Please enter cigarettes smoked today.')

    setLoading(true)
    try {
      await logsAPI.submitDaily({
        ...form,
        cigarettes_smoked: parseInt(form.cigarettes_smoked),
        craving_level: parseInt(form.craving_level),
      })
      toast.success('✅ Daily log saved! Health data updated.')
      setForm({ ...form, cigarettes_smoked: '', notes: '' })
      if (onLogSubmit) onLogSubmit()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save log.')
    } finally {
      setLoading(false)
    }
  }

  const moods = ['😊 Great', '😐 Neutral', '😟 Stressed', '😤 Irritable', '😴 Tired']

  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-semibold flex items-center gap-2 mb-4">
        <ClipboardList size={18} className="text-accent-red" />
        {t("Today's Log")}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">{t('DATE')}</label>
          <input type="date" className="input-field" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            max={new Date().toISOString().split('T')[0]} />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">
            {t('Cigarettes Smoked Today')}
          </label>
          <input type="number" className="input-field" placeholder="e.g. 8" min="0" max="200"
            value={form.cigarettes_smoked}
            onChange={(e) => setForm({ ...form, cigarettes_smoked: e.target.value })} />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-2 uppercase tracking-wider">
            {t('Craving Level:')} <span className="text-white">{form.craving_level}/10</span>
          </label>
          <input type="range" min="1" max="10" className="w-full accent-red-500"
            value={form.craving_level}
            onChange={(e) => setForm({ ...form, craving_level: e.target.value })} />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{t('Low')}</span><span>{t('High')}</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-2 uppercase tracking-wider">{t('Mood')}</label>
          <div className="grid grid-cols-3 gap-2 flex-wrap">
            {moods.map((m) => (
              <button key={m} type="button"
                className={`text-xs py-1.5 px-2 rounded-lg border transition-all
                  ${form.mood === m.split(' ')[1].toLowerCase()
                    ? 'border-accent-red bg-accent-red/10 text-white'
                    : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                onClick={() => setForm({ ...form, mood: m.split(' ')[1].toLowerCase() })}>
                {m.split(' ')[0]} {t(m.split(' ')[1])}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">{t('Notes (optional)')}</label>
          <textarea className="input-field resize-none h-16 text-sm" placeholder="How did today feel?"
            value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          <Send size={16} />
          {loading ? '...' : t("Save Today's Log")}
        </button>
      </form>
    </div>
  )
}
