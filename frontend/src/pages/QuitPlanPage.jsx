import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useStore'
import { useTranslation } from '../utils/i18n'
import toast from 'react-hot-toast'
import Sidebar from '../components/Sidebar'
import { Target, CheckCircle, XCircle, Clock, Award, Heart, ChevronRight, ChevronDown, Sparkles } from 'lucide-react'

export default function QuitPlanPage() {
  const { token } = useAuthStore()
  const { t } = useTranslation()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedWeek, setExpandedWeek] = useState(0) // Default expand first week
  const [completedWeeks, setCompletedWeeks] = useState([])
  const [failedWeeks, setFailedWeeks] = useState([])

  useEffect(() => {
    fetchPlan()
  }, [])

  const fetchPlan = async () => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    try {
      const res = await fetch(`${base}/user/quit-plan`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPlan(await res.json())
    } catch { toast.error('Could not load quit plan.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex">
      <Sidebar active="quit-plan" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl font-bold mb-2">🎯 {t('Your Quit Plan')}</h1>
          <p className="text-gray-400 mb-8">{t('A personalized 8-week gradual reduction strategy.')}</p>

          {loading ? (
            <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 glass-card animate-pulse" />)}</div>
          ) : plan ? (
            <>
              {/* Current Level */}
              <div className="glass-card p-6 mb-6 border-accent-red/20">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="text-accent-red" size={24} />
                  <div>
                    <h3 className="font-display font-semibold">{t('Starting Point')}</h3>
                    <p className="text-gray-400 text-sm">{t('Currently:')} <span className="text-white font-bold">{plan.starting_cigarettes_per_day} cigarettes/day</span></p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{t('Goal:')} <span className="text-green-400 font-semibold">{plan.quit_date_estimate}</span></p>
              </div>

              {/* Weekly Plan Timeline */}
              <div className="space-y-3 mb-8">
                {plan.weekly_plan.map((week, i) => {
                  const isExpanded = expandedWeek === i;
                  const isCompleted = completedWeeks.includes(i);
                  const isFailed = failedWeeks.includes(i);
                  const isMarked = isCompleted || isFailed;
                  
                  const cardBorder = isCompleted ? 'border-green-500/30 bg-green-500/5' : isFailed ? 'border-red-500/30 bg-red-500/5' : '';
                  const circleBg = isCompleted ? 'bg-green-500 text-white' : isFailed ? 'bg-red-500 text-white' : week.target_cigarettes_per_day === 0 ? 'bg-green-500/20 text-green-400' : 'bg-accent-red/20 text-accent-red';
                  const circleIcon = isCompleted ? <CheckCircle size={18} /> : isFailed ? <XCircle size={18} /> : `W${week.week}`;
                  const chevronColor = isCompleted ? 'text-green-400' : isFailed ? 'text-red-400' : 'text-accent-red';

                  return (
                    <div key={i} className={`glass-card overflow-hidden hover:border-accent-red/30 transition-all ${cardBorder}`}>
                      <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedWeek(isExpanded ? null : i)}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${circleBg}`}>
                          {circleIcon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm flex items-center gap-2">
                              {t('Target:')} <span className={isCompleted ? 'text-green-400' : isFailed ? 'text-red-400' : 'text-white'}>{week.target_cigarettes_per_day} cigs/day</span>
                              {isCompleted && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider">{t('Accomplished')}</span>}
                              {isFailed && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-wider">{t('Missed')}</span>}
                            </span>
                            <span className="text-xs text-green-400 font-bold">-{week.percentage_reduced}%</span>
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown size={16} className={`${chevronColor} flex-shrink-0`} /> : <ChevronRight size={16} className="text-gray-600 flex-shrink-0" />}
                      </div>
                      <div className={`px-4 pb-4 pt-0 transition-all ${isExpanded ? 'block' : 'hidden'}`}>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-300">
                          <strong className="text-white block mb-2 text-xs uppercase tracking-wider opacity-70">{t('Weekly Focus Tip:')}</strong>
                          <p className="mb-4">{week.tip}</p>
                          
                          {/* Completion Action */}
                          <div className="flex justify-end border-t border-white/10 pt-3 mt-2">
                            {isMarked ? (
                              <button onClick={() => {
                                setCompletedWeeks(completedWeeks.filter(w => w !== i));
                                setFailedWeeks(failedWeeks.filter(w => w !== i));
                              }} 
                                className="text-xs text-gray-400 hover:text-white transition-colors">
                                {t('Undo status')}
                              </button>
                            ) : (
                              <div className="flex gap-2">
                                <button onClick={() => {
                                  setFailedWeeks([...failedWeeks, i]);
                                  toast.error(`Week ${week.week} Target Missed. We'll try harder next week!`);
                                  setExpandedWeek(i < plan.weekly_plan.length - 1 ? i + 1 : null);
                                }} 
                                  className="flex items-center gap-2 px-3 py-2 bg-red-600/40 border border-red-500/50 hover:bg-red-500 hover:border-red-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg" >
                                  <XCircle size={14} /> {t('Missed Target')}
                                </button>
                                <button onClick={() => {
                                  setCompletedWeeks([...completedWeeks, i]);
                                  toast.success(`Week ${week.week} Target Accomplished! 🎉`);
                                  setExpandedWeek(i < plan.weekly_plan.length - 1 ? i + 1 : null);
                                }} 
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-green-900/20">
                                  <CheckCircle size={14} /> {t('Accomplished')}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Health Milestones */}
              <div className="glass-card p-6 mb-6">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Award size={18} className="text-yellow-400" /> {t('Health Recovery Milestones')}
                </h3>
                <div className="space-y-3">
                  {plan.milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={14} className="text-green-400" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white">{t('Day')} {m.day}</span>
                        <p className="text-xs text-gray-400">{m.benefit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Habit Replacements */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-400" /> {t('Habit Replacement Techniques')}
                </h3>
                <div className="space-y-2">
                  {plan.habit_replacements.map((tip, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <Heart size={14} className="text-accent-red flex-shrink-0" />
                      <span className="text-sm text-gray-300">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-gray-500">Could not generate your quit plan. Please try again.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
