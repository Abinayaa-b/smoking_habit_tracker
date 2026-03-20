import { useState, useEffect, useRef } from 'react'
import { aiAPI } from '../api/client'
import { useAuthStore, useAppStore } from '../store/useStore'
import { X, Flame, Wind, Clock, BookOpen, Lightbulb } from 'lucide-react'
import { useTranslation } from '../utils/i18n'

const BREATHING_STEPS = [
  { label: 'Breathe In', duration: 4, color: 'bg-blue-500' },
  { label: 'Hold', duration: 4, color: 'bg-purple-500' },
  { label: 'Breathe Out', duration: 6, color: 'bg-green-500' },
]

export default function UrgeModal({ onClose }) {
  const { user } = useAuthStore()
  const { language } = useAppStore()
  const { t } = useTranslation()
  
  const [phase, setPhase] = useState('breathing') // breathing | support
  const [breathStep, setBreathStep] = useState(0)
  const [timer, setTimer] = useState(10 * 60) // 10 minute delay
  const [aiContent, setAiContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef(null)

  // Delay Timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(intervalRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  // Auto-Breathing Logic
  useEffect(() => {
    if (phase !== 'breathing') return
    const currentPhase = BREATHING_STEPS[breathStep % BREATHING_STEPS.length]
    
    const timeout = setTimeout(() => {
      setBreathStep(b => b + 1)
    }, currentPhase.duration * 1000)
    
    return () => clearTimeout(timeout)
  }, [breathStep, phase])

  const fetchAiSupport = async () => {
    setLoading(true)
    try {
      const { data } = await aiAPI.getUrgeSupport({
        cigarettes_per_day: user?.avg_cigarettes_per_day || 10,
        smoking_years: user?.smoking_duration_years || 5,
        language,
        delay_timer_used: true,
        breathing_done: true,
      })
      setAiContent(data)
      setPhase('support')
    } catch {
      setAiContent({
        story: 'Many people have overcome this exact moment. You are not alone.',
        motivation: 'This urge will pass in the next few minutes. You have the strength.',
        tip: 'Walk to another room or drink a glass of cold water right now.',
      })
      setPhase('support')
    } finally {
      setLoading(false)
    }
  }

  const mins = Math.floor(timer / 60)
  const secs = timer % 60
  const current = BREATHING_STEPS[breathStep % BREATHING_STEPS.length]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-card p-8 max-w-lg w-full border-orange-500/30 animate-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg">{t('Urge Support')}</h2>
            <p className="text-gray-400 text-sm">{t("You've got this. Let's get through this together.")}</p>
          </div>
        </div>

        {/* Delay timer */}
        <div className="glass-card p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            <span className="text-sm text-gray-300">{t('Delay Timer')}</span>
          </div>
          <div className="text-xl font-mono font-bold text-orange-400">
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
        </div>

        {phase === 'breathing' && (
          <div className="text-center space-y-6">
            <div>
              <div className="relative inline-flex items-center justify-center">
                <div className={`w-32 h-32 rounded-full ${current.color} animate-pulse-slow opacity-20`} />
                <div className={`absolute w-24 h-24 rounded-full ${current.color} opacity-40`} />
                <div className="absolute flex flex-col items-center">
                  <Wind className="w-8 h-8 text-white mb-1" />
                  <span className="text-xs font-bold">{t(current.label)}</span>
                  <span className="text-lg font-mono font-bold">{current.duration}s</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {BREATHING_STEPS.map((s, i) => (
                <div key={i} className={`flex-1 text-center p-2 rounded-lg border text-xs transition-colors duration-500
                  ${i === breathStep % BREATHING_STEPS.length
                    ? `${s.color}/20 border-current text-white`
                    : 'border-white/10 text-gray-500'}`}>
                  {t(s.label)}<br />{s.duration}s
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button className="btn-primary w-full text-sm" onClick={fetchAiSupport} disabled={loading}>
                {loading ? t('Loading...') : t('Get AI Support 🌿')}
              </button>
            </div>
          </div>
        )}

        {phase === 'support' && aiContent && (
          <div className="space-y-4 animate-in">
            <div className="glass-card p-4 border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{t('Inspiring Story')}</span>
              </div>
              <p className="text-sm text-gray-200">{aiContent.story}</p>
            </div>

            <div className="glass-card p-4 border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={16} className="text-green-400" />
                <span className="text-xs font-bold text-green-400 uppercase tracking-wider">{t('Motivation')}</span>
              </div>
              <p className="text-sm text-gray-200">{aiContent.motivation}</p>
            </div>

            <div className="glass-card p-4 border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={16} className="text-yellow-400" />
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">{t('Try This Now')}</span>
              </div>
              <p className="text-sm text-gray-200">{aiContent.tip}</p>
            </div>

            <button className="btn-primary w-full" onClick={onClose}>
              {t('I Got Through It! 💪')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
