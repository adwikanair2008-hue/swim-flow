
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DrylandExercise } from '../types';
import { geminiService } from '../services/gemini';
import { 
  BoltIcon, 
  FireIcon, 
  ArrowPathIcon as ArrowPathIconSolid,
  ShieldCheckIcon,
  RocketLaunchIcon,
  SunIcon,
  HeartIcon,
  PlayIcon,
  UserIcon
} from '@heroicons/react/24/solid';
import { 
  ClockIcon, 
  SparklesIcon, 
  ArrowPathIcon, 
  ListBulletIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  PuzzlePieceIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface AiDrylandsProps {
  profile: UserProfile;
}

const DRYLAND_GOALS = [
  { id: 'Strength', label: 'Max Strength', icon: ShieldCheckIcon, color: 'text-indigo-500' },
  { id: 'Power', label: 'Explosive Power', icon: RocketLaunchIcon, color: 'text-orange-500' },
  { id: 'Endurance', label: 'Stamina', icon: ArrowPathIconSolid, color: 'text-emerald-500' },
  { id: 'Mobility', label: 'Injury Prevention', icon: SunIcon, color: 'text-yellow-500' }
];

const AiDrylands: React.FC<AiDrylandsProps> = ({ profile }) => {
  const [exercises, setExercises] = useState<DrylandExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState('Strength');
  const [selectedExercise, setSelectedExercise] = useState<DrylandExercise | null>(null);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const fetchWorkout = async () => {
    setLoading(true);
    try {
      const res = await geminiService.getDrylandWorkout(profile, selectedGoal);
      setExercises(res);
    } catch (error) {
      console.error("Workout generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, [profile, selectedGoal]);

  useEffect(() => {
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isTimerRunning]);

  const handleTimerComplete = () => {
    setIsTimerRunning(false);
    setTimeLeft(null);
    playCompleteSound();
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const playCompleteSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio feedback failed:", e);
    }
  };

  const startRest = (seconds: number) => {
    setTimeLeft(seconds);
    setIsTimerRunning(true);
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(null);
  };

  const getExerciseIcon = (focusArea: string) => {
    const area = focusArea.toLowerCase();
    if (area.includes('core') || area.includes('abs') || area.includes('oblique')) return HeartIcon;
    if (area.includes('shoulder') || area.includes('deltoid') || area.includes('arm') || area.includes('tricep')) return BoltIcon;
    if (area.includes('leg') || area.includes('glute') || area.includes('quad') || area.includes('hamstring')) return FireIcon;
    if (area.includes('mobility') || area.includes('stretch') || area.includes('flexibility')) return SunIcon;
    if (area.includes('back') || area.includes('lat') || area.includes('posterior')) return UserIcon;
    if (area.includes('chest') || area.includes('pec')) return ShieldCheckIcon;
    return PuzzlePieceIcon;
  };

  const GoalIcon = DRYLAND_GOALS.find(g => g.id === selectedGoal)?.icon || BoltIcon;

  return (
    <div className="space-y-6 pb-24 px-1">
      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-t-[48px] sm:rounded-[48px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 flex justify-between items-center z-10 border-b border-slate-50">
               <div>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedExercise.name}</h2>
                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{selectedExercise.focusArea}</p>
               </div>
               <button 
                onClick={() => setSelectedExercise(null)}
                className="bg-slate-50 p-3 rounded-2xl text-slate-400 active:scale-90 transition-all"
               >
                 <XMarkIcon className="h-6 w-6" />
               </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3">
                 <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Sets</div>
                    <div className="text-xl font-black text-slate-800">{selectedExercise.sets}</div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reps</div>
                    <div className="text-xl font-black text-slate-800">{selectedExercise.reps}</div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Rest</div>
                    <div className="text-xl font-black text-slate-800">{selectedExercise.restTime}s</div>
                 </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <InformationCircleIcon className="h-5 w-5 text-indigo-500" />
                   Instructions
                </h3>
                <div className="space-y-4">
                  {selectedExercise.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start group">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-xs font-black text-indigo-500 border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed pt-1.5 font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video CTA */}
              {selectedExercise.videoUrl && (
                <div className="bg-indigo-500 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100">
                  <div className="flex justify-between items-center">
                    <div className="max-w-[60%]">
                      <h4 className="font-bold text-lg leading-tight mb-1">Watch Guide</h4>
                      <p className="text-indigo-100 text-xs font-medium">Visual demonstration for correct form.</p>
                    </div>
                    <a 
                      href={selectedExercise.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white text-indigo-600 p-4 rounded-[24px] shadow-lg active:scale-95 transition-all flex items-center justify-center"
                    >
                      <PlayIcon className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              )}

              {/* Coach Insight */}
              <div className="bg-amber-50 rounded-[32px] p-6 border border-amber-100">
                 <div className="flex items-center gap-2 mb-3">
                   <SparklesIcon className="h-5 w-5 text-amber-500" />
                   <h4 className="font-black text-[10px] text-amber-600 uppercase tracking-[0.15em]">Coach Insight</h4>
                 </div>
                 <p className="text-amber-900/80 text-sm leading-relaxed font-medium">
                   {selectedExercise.benefit}
                 </p>
              </div>

              <div className="pb-8">
                <button 
                  onClick={() => setSelectedExercise(null)}
                  className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-[24px] shadow-xl active:scale-[0.98] transition-all"
                >
                  I'm Ready
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer Overlay */}
      {timeLeft !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xs rounded-[48px] p-10 text-center shadow-2xl scale-in-center">
            <button 
              onClick={stopTimer}
              className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">Resting</div>
            <div className="text-7xl font-black text-slate-800 tabular-nums mb-8 leading-none">
              {timeLeft}
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-8">
               <div 
                 className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                 style={{ width: `${(timeLeft / 60) * 100}%` }}
               ></div>
            </div>
            <p className="text-xs font-medium text-slate-400 leading-relaxed px-4">
              Focus on deep, controlled breathing to maximize recovery.
            </p>
          </div>
        </div>
      )}

      <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
             <GoalIcon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Dryland Training</h1>
        </div>
        <p className="text-slate-400 text-sm font-medium leading-relaxed">
          Strong out of the water, fast in it. Custom dryland routine for {profile.swimmingLevel} level.
        </p>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {DRYLAND_GOALS.map((goal) => (
          <button
            key={goal.id}
            onClick={() => setSelectedGoal(goal.id)}
            className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
              selectedGoal === goal.id 
                ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-100 scale-105' 
                : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'
            }`}
          >
            <goal.icon className={`h-3.5 w-3.5 ${selectedGoal === goal.id ? 'text-white' : goal.color}`} />
            {goal.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-2">
              <FireIcon className="h-5 w-5 text-orange-500" />
              <span className="font-bold text-slate-800 uppercase text-xs tracking-widest">
                {selectedGoal} Routine
              </span>
           </div>
           <button 
             onClick={fetchWorkout}
             disabled={loading}
             className="flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50"
           >
             <ArrowPathIconSolid className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
             Refresh
           </button>
        </div>

        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 animate-pulse h-32"></div>
             ))}
          </div>
        ) : exercises.length > 0 ? (
          <div className="space-y-4">
            {exercises.map((ex, idx) => {
              const FocusIcon = getExerciseIcon(ex.focusArea);
              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedExercise(ex)}
                  className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm relative overflow-hidden group hover:border-indigo-200 cursor-pointer transition-colors active:scale-[0.99]"
                >
                  <div className="flex justify-between items-start mb-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2 items-center">
                      <div className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm">
                        {idx + 1}
                      </div>
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <FocusIcon className="h-3 w-3" />
                        {ex.focusArea}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-slate-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-slate-100">
                        <ListBulletIcon className="h-3.5 w-3.5 text-indigo-500" />
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase leading-none">Sets</span>
                          <span className="text-xs font-black text-slate-800 leading-tight">{ex.sets}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-slate-100">
                        <ArrowPathIcon className="h-3.5 w-3.5 text-indigo-500" />
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase leading-none">Reps</span>
                          <span className="text-xs font-black text-slate-800 leading-tight">{ex.reps}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100/50">
                      <FocusIcon className="h-5 w-5 text-indigo-500 shrink-0" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{ex.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">{ex.description}</p>
                  
                  <div className="flex gap-2 mb-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startRest(ex.restTime || 45);
                      }}
                      className="flex-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest py-3.5 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Finish Set
                    </button>
                    <div className="px-4 flex items-center gap-2 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100">
                       <ClockIcon className="h-3.5 w-3.5" />
                       <span className="text-[10px] font-black uppercase tracking-tight">{ex.restTime}s Rest</span>
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-50 flex gap-3">
                     <div className="shrink-0 mt-0.5">
                       <SparklesIcon className="h-4 w-4 text-indigo-500" />
                     </div>
                     <p className="text-[11px] text-indigo-700 leading-tight font-medium">
                       <span className="font-bold uppercase tracking-tighter mr-1 text-[9px] opacity-60">Coach Insight:</span>
                       {ex.benefit}
                     </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[40px] text-center border border-dashed border-slate-200">
             <p className="text-slate-400 font-medium">No exercises found. Try refreshing!</p>
          </div>
        )}
      </div>

      <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full -mb-8 -mr-8 blur-xl"></div>
        <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
           <ClockIcon className="h-4 w-4" />
           Land vs Water
        </h3>
        <p className="text-indigo-50 text-xs leading-relaxed opacity-90">
          Swimmers spend 90% of their life prone. Dryland helps combat "swimmer's slouch" by strengthening the posterior chain and stabilizing your core for better hydrodynamic position.
        </p>
      </div>

      <div className="pb-8 flex justify-center">
         <button 
           onClick={fetchWorkout}
           disabled={loading}
           className="bg-indigo-500 text-white font-black uppercase tracking-widest text-xs px-10 py-5 rounded-[24px] shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-3"
         >
           <ArrowPathIconSolid className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
           Regenerate Full Workout
         </button>
      </div>

      <style>{`
        .scale-in-center {
          animation: scale-in-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
        @keyframes scale-in-center {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default AiDrylands;
