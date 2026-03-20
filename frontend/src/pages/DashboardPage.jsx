import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useAppStore } from '../store/useStore'
import { predictionAPI, aiAPI, authAPI } from '../api/client'
import toast from 'react-hot-toast'
import OrganScene from '../components/3d/OrganScene'
import UrgeModal from '../components/UrgeModal'
import DailyLogPanel from '../components/DailyLogPanel'
import Sidebar from '../components/Sidebar'
import { useTranslation } from '../utils/i18n'
import {
  Heart, Brain, Wind, Activity,
  Flame, MessageCircle
} from 'lucide-react'

const ORGANS = [
  { id: 'lungs', label: 'Lungs', icon: Wind },
  { id: 'heart', label: 'Heart', icon: Heart },
  { id: 'brain', label: 'Brain', icon: Brain },
  { id: 'liver', label: 'Liver', icon: Activity },
]

function DamageBar({ value, label }) {
  const color = value <= 20 ? 'bg-green-500' : value <= 40 ? 'bg-yellow-400' : value <= 70 ? 'bg-orange-500' : 'bg-red-600'
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-bold text-white">{value?.toFixed(1)}%</span>
      </div>
      <div className="damage-bar-track">
        <div className={`damage-bar-fill ${color}`} style={{ width: `${Math.min(value || 0, 100)}%` }} />
      </div>
    </div>
  )
}

function SeverityBadge({ severity }) {
  const classes = { Low: 'severity-low', Medium: 'severity-medium', High: 'severity-high', Critical: 'severity-critical' }
  return <span className={`severity-badge ${classes[severity] || 'severity-medium'}`}>{severity}</span>
}

export default function DashboardPage() {
  const { user, updateUser } = useAuthStore()
  const { selectedOrgan, setSelectedOrgan, urgeModalOpen, setUrgeModalOpen, language, setLanguage, organSpeaking, setOrganSpeaking } = useAppStore()
  const { t } = useTranslation()
  const [prediction, setPrediction] = useState(null)
  const [organVoice, setOrganVoice] = useState('')
  const [speakingOrgan, setSpeakingOrgan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrediction()
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const { data } = await authAPI.getMe()
      setLanguage(data.lang_pref || 'English')
      updateUser(data)
    } catch {}
  }

  const fetchPrediction = async () => {
    try {
      const { data } = await predictionAPI.getCurrent()
      setPrediction(data)
    } catch {
      // User may not have logs yet — show empty state
    } finally { setLoading(false) }
  }

  const stopVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeakingOrgan(null)
    setOrganSpeaking(null)
    setOrganVoice('')
  }

  const handleOrganSpeak = async (organ) => {
    if (!prediction) return
    setSpeakingOrgan(organ)
    setOrganSpeaking(organ)
    setOrganVoice('Generating message...')
    try {
      const { data } = await aiAPI.getOrganVoice({
        organ, damage_pct: prediction[`${organ}_damage_pct`] || 0,
        severity: prediction.severity_level, missed_days: 0, language
      })
      setOrganVoice(data.message)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel() // Cancel any ongoing speech
        const utter = new SpeechSynthesisUtterance(data.message)
        const langMap = { English: 'en-US', Tamil: 'ta-IN' }
        utter.lang = langMap[language] || 'en-US'
        utter.rate = 0.9
        window.speechSynthesis.speak(utter)
        utter.onend = () => { setSpeakingOrgan(null); setOrganSpeaking(null) }
      } else { setTimeout(() => { setSpeakingOrgan(null); setOrganSpeaking(null) }, 5000) }
    } catch {
      setOrganVoice('Your organ cares about you. Take a deep breath.')
      setSpeakingOrgan(null); setOrganSpeaking(null)
    }
  }

  const currentDamage = prediction ? prediction[`${selectedOrgan}_damage_pct`] : 0

  return (
    <div className="min-h-screen bg-hero-gradient flex">
      <Sidebar active="dashboard" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">
                {t('Welcome')}, <span className="text-accent-red text-glow">{user?.full_name}</span> 👋
              </h1>
              <p className="text-gray-400 mt-1">
                {t('Your AI-powered health dashboard')}
                {prediction && <> · {t('Overall')}: <SeverityBadge severity={prediction.severity_level} /></>}
              </p>
            </div>
          </div>

          {/* Urge Button */}
          <button
            className="mb-6 w-full glass-card border-orange-500/30 p-4 flex items-center justify-center gap-3
              hover:border-orange-500/60 hover:bg-orange-500/10 transition-all duration-300 group"
            onClick={() => setUrgeModalOpen(true)}
          >
            <Flame className="w-6 h-6 text-orange-400 group-hover:animate-pulse" />
            <span className="font-semibold text-orange-300">{t("I'm Feeling an Urge to Smoke")}</span>
            <span className="text-gray-500 text-sm hidden md:inline">— {t('Tap for instant support')}</span>
          </button>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT: 3D Organ Viewer */}
            <div className="xl:col-span-2 space-y-4">
              {/* Organ Tabs */}
              <div className="grid grid-cols-4 gap-3">
                {ORGANS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setSelectedOrgan(id)}
                    className={`organ-card transition-all ${selectedOrgan === id ? 'border-accent-red/60 bg-accent-red/10' : ''}`}>
                    <Icon size={20} className={selectedOrgan === id ? 'text-accent-red' : 'text-gray-400'} />
                    <span className="text-xs font-medium capitalize">{t(label)}</span>
                    {prediction && <span className="text-xs text-gray-500">{prediction[`${id}_damage_pct`]?.toFixed(0)}%</span>}
                  </button>
                ))}
              </div>

              {/* 3D Canvas */}
              <div className="glass-card overflow-hidden" style={{ height: '380px' }}>
                <OrganScene organType={selectedOrgan} damagePct={currentDamage} />
              </div>

              {/* Organ Voice */}
              {organVoice && (
                <div className="glass-card p-4 border-accent-red/20 animate-in">
                  <div className="flex gap-3 items-start">
                    <MessageCircle className="w-5 h-5 text-accent-red mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-accent-red font-semibold mb-1 capitalize">{speakingOrgan || selectedOrgan} says:</p>
                      <p className="text-sm text-gray-200 leading-relaxed">{organVoice}</p>
                    </div>
                  </div>
                </div>
              )}
              {speakingOrgan ? (
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 border border-white/20 hover:border-red-500/50"
                  onClick={stopVoice}>
                  <div className="w-4 h-4 rounded-sm bg-current" />
                  {t('Stop Speaking')}
                </button>
              ) : (
                <button className="btn-secondary w-full flex items-center justify-center gap-2"
                  onClick={() => handleOrganSpeak(selectedOrgan)}>
                  <MessageCircle size={18} />
                  {t('Let your organ speak')}
                </button>
              )}
              <p className="text-xs text-gray-600 text-center">
                ⚠️ Predictions are educational estimates based on WHO/CDC research. Not a clinical diagnosis.
              </p>
            </div>

            {/* RIGHT: Stats + Log */}
            <div className="space-y-6">
              <div className="glass-card p-5 space-y-4">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  <Activity size={18} className="text-accent-red" /> {t('Health Impact')}
                </h3>
                {loading ? (
                  <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />)}</div>
                ) : prediction ? (
                  <div className="space-y-4">
                    <DamageBar label={t('Lungs')} value={prediction.lungs_damage_pct} />
                    <DamageBar label={t('Heart')} value={prediction.heart_damage_pct} />
                    <DamageBar label={t('Brain')} value={prediction.brain_damage_pct} />
                    <DamageBar label={t('Liver')} value={prediction.liver_damage_pct} />
                    <div className="pt-2 border-t border-white/10">
                      <DamageBar label={t('Overall')} value={prediction.avg_damage_pct} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Log your first smoking data to see your health impact.</p>
                )}
              </div>
              <DailyLogPanel onLogSubmit={fetchPrediction} />
            </div>
          </div>
        </div>
      </main>
      {urgeModalOpen && <UrgeModal onClose={() => setUrgeModalOpen(false)} />}
    </div>
  )
}
