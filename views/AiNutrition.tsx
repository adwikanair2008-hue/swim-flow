
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { geminiService } from '../services/gemini';
import { SparklesIcon, BeakerIcon, ScaleIcon, FireIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface AiNutritionProps {
  profile: UserProfile;
}

const NUTRITION_GOALS = [
  { id: 'General', label: 'Balanced', color: 'emerald' },
  { id: 'Weight Gain', label: 'Mass Gain', color: 'blue' },
  { id: 'Weight Loss', label: 'Weight Loss', color: 'orange' },
  { id: 'Tapering', label: 'Tapering', color: 'purple' },
  { id: 'Strength Building', label: 'Strength', color: 'indigo' }
];

const AiNutrition: React.FC<AiNutritionProps> = ({ profile }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState('General');
  const [targetWeight, setTargetWeight] = useState<number>(profile.targetWeight || profile.weight - 5);

  const fetchNutrition = async () => {
    setLoading(true);
    const res = await geminiService.getNutritionAdvice(profile, selectedGoal, selectedGoal === 'Weight Loss' ? targetWeight : undefined);
    setAdvice(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchNutrition();
  }, [profile, selectedGoal]);

  const handleUpdateTargetWeight = () => {
    fetchNutrition();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-8 rounded-[40px] text-white shadow-xl shadow-emerald-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-2 rounded-xl">
             <SparklesIcon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Swimming Nutrition</h1>
        </div>
        <p className="text-emerald-50 text-sm">Fuel your body for performance and recovery, tailored for {profile.swimmingLevel} goals.</p>
      </div>

      {/* Goal Selector */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide px-1">
        {NUTRITION_GOALS.map((goal) => (
          <button
            key={goal.id}
            onClick={() => setSelectedGoal(goal.id)}
            className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
              selectedGoal === goal.id 
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg scale-105' 
                : 'bg-white text-slate-500 border-slate-100 hover:border-emerald-200'
            }`}
          >
            {selectedGoal === goal.id && <FireIcon className="h-3 w-3 text-white" />}
            {goal.label}
          </button>
        ))}
      </div>

      {/* Weight Loss Target Input */}
      {selectedGoal === 'Weight Loss' && (
        <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ScaleIcon className="h-5 w-5 text-orange-500" />
                <h3 className="font-bold text-orange-800 text-sm">Target Setting</h3>
              </div>
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Goal Oriented</span>
           </div>
           <div className="flex gap-3">
              <div className="flex-1 bg-white p-4 rounded-2xl border border-orange-200">
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Desired Weight (kg)</label>
                <input 
                  type="number"
                  className="w-full text-xl font-black text-slate-800 outline-none"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value))}
                />
              </div>
              <button 
                onClick={handleUpdateTargetWeight}
                disabled={loading}
                className="bg-orange-500 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
              </button>
           </div>
           <p className="text-[10px] text-orange-600 mt-3 font-medium px-1">
             Coach Blue will adjust your caloric deficit and supplement plan to reach {targetWeight}kg safely while maintaining pool performance.
           </p>
        </div>
      )}

      <div className="bg-white p-8 rounded-[40px] border border-emerald-50 shadow-sm relative overflow-hidden min-h-[350px]">
        {loading ? (
          <div className="space-y-6 animate-pulse pt-4">
            <div className="h-6 bg-slate-100 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-50 rounded w-full"></div>
              <div className="h-4 bg-slate-50 rounded w-5/6"></div>
              <div className="h-4 bg-slate-50 rounded w-full"></div>
            </div>
            <div className="h-6 bg-slate-100 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-50 rounded w-full"></div>
              <div className="h-4 bg-slate-50 rounded w-4/5"></div>
            </div>
          </div>
        ) : (
          <div className="prose prose-emerald prose-sm max-w-none">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BeakerIcon className="h-5 w-5 text-emerald-500" />
                <span className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em]">
                  Personalized {selectedGoal} Protocol
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] text-emerald-600 font-black uppercase">Coach Active</span>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium text-sm space-y-4">
              {advice.split('\n').map((line, i) => (
                <div key={i} className={line.startsWith('**') ? 'mt-4 first:mt-0' : ''}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100">
        <h3 className="font-bold text-orange-800 text-sm mb-2 flex items-center gap-2">
          💡 Hydration Check
        </h3>
        <p className="text-orange-700 text-xs leading-relaxed font-medium">
          Swimmers often forget to hydrate because the body stays cool in water. Aim for at least 500ml of electrolyte-rich fluid for every hour of intense swimming, especially when pursuing {selectedGoal}.
        </p>
      </div>

      <div className="pb-8 flex justify-center">
         <button 
           onClick={fetchNutrition}
           disabled={loading}
           className="bg-emerald-500 text-white font-black uppercase tracking-widest text-xs px-10 py-5 rounded-[24px] shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center gap-3"
         >
           <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
           Regenerate Nutrition Plan
         </button>
      </div>
    </div>
  );
};

export default AiNutrition;
