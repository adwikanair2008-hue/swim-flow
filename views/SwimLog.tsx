
import React, { useState, useEffect } from 'react';
import { SwimSession, UserProfile } from '../types';
import { PlusIcon, XMarkIcon, ClockIcon, MapIcon, SparklesIcon, ChatBubbleBottomCenterTextIcon, BoltIcon } from '@heroicons/react/24/outline';
import { geminiService } from '../services/gemini';

interface SwimLogProps {
  sessions: SwimSession[];
  onAdd: (session: SwimSession) => void;
  profile: UserProfile;
}

const FEELINGS = [
  { label: 'Energized', icon: '⚡', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { label: 'Good', icon: '😊', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
  { label: 'Tired', icon: '😴', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  { label: 'Exhausted', icon: '😫', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' }
] as const;

const SwimLog: React.FC<SwimLogProps> = ({ sessions, onAdd, profile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [formData, setFormData] = useState<Partial<SwimSession>>({
    date: new Date().toISOString().split('T')[0],
    stroke: 'Freestyle',
    distance: 1000,
    time: 1200,
    feeling: 'Good',
    notes: ''
  });

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: SwimSession = {
      id: Date.now().toString(),
      date: formData.date || new Date().toISOString(),
      stroke: formData.stroke || 'Freestyle',
      distance: Number(formData.distance),
      time: Number(formData.time),
      feeling: (formData.feeling as SwimSession['feeling']) || 'Good',
      notes: formData.notes || ''
    };
    
    onAdd(newSession);
    setIsModalOpen(false);
    
    setIsGeneratingFeedback(true);
    try {
      const quickFeedback = await geminiService.getQuickSessionFeedback(profile, newSession);
      setFeedback(quickFeedback);
    } catch (err) {
      console.error("Failed to get feedback:", err);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const calculatePace = () => {
    const dist = Number(formData.distance);
    const time = Number(formData.time);
    if (dist > 0 && time > 0) {
      return ((time / dist) * 100).toFixed(1);
    }
    return null;
  };

  const currentPace = calculatePace();

  return (
    <div className="space-y-8 lg:space-y-12 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Swim Logs</h1>
          <p className="text-slate-500 font-medium">Your historical pool performance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-500 text-white px-6 py-4 rounded-2xl shadow-xl shadow-sky-100 active:scale-95 transition-all flex items-center gap-2 font-bold"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Add Entry</span>
        </button>
      </header>

      { (feedback || isGeneratingFeedback) && (
        <div className="fixed top-6 left-4 right-4 md:left-auto md:right-8 z-[100] animate-in fade-in slide-in-from-top-4 duration-500 max-w-sm ml-auto">
          <div className="bg-white/95 backdrop-blur-md border border-sky-100 shadow-2xl rounded-3xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-sky-100">
              <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1">Coach Blue</p>
              {isGeneratingFeedback ? (
                <div className="flex gap-1.5 py-1">
                  <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              ) : (
                <p className="text-slate-700 text-sm font-bold leading-tight">"{feedback}"</p>
              )}
            </div>
            {!isGeneratingFeedback && (
              <button onClick={() => setFeedback(null)} className="text-slate-300 hover:text-slate-400">
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[52px] border border-dashed border-sky-200">
          <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-8">
             <MapIcon className="h-12 w-12 text-sky-200" />
          </div>
          <h2 className="font-black text-2xl text-slate-800 mb-2">Ready to dive in?</h2>
          <p className="text-slate-400 font-medium max-w-xs mx-auto mb-8">Start logging your sessions to see detailed pace analysis and coaching insights.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-sky-500 font-black text-xs uppercase tracking-widest bg-sky-50 px-8 py-4 rounded-2xl border border-sky-100 hover:bg-sky-100 transition-colors"
          >
            Log your first swim
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white p-6 lg:p-8 rounded-[40px] border border-sky-50 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all hover:border-sky-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <span className="text-[10px] font-black text-sky-500 tracking-widest uppercase bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100">
                      {session.stroke}
                    </span>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50">
                      <span className="text-sm">{FEELINGS.find(f => f.label === session.feeling)?.icon}</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{session.feeling}</span>
                    </div>
                  </div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight">{new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-800 tracking-tighter">{session.distance}m</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Distance</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 mt-6 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-3xl">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><ClockIcon className="h-5 w-5 text-slate-400" /></div>
                  <div>
                    <div className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Duration</div>
                    <span className="font-black text-slate-700">{Math.floor(session.time / 60)}m {session.time % 60}s</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-sky-50/50 p-4 rounded-3xl">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><SparklesIcon className="h-5 w-5 text-sky-400" /></div>
                  <div>
                    <div className="text-[10px] font-black text-sky-200 uppercase leading-none mb-1">Pace</div>
                    <span className="font-black text-sky-700">{((session.time / session.distance) * 100).toFixed(1)}s/100m</span>
                  </div>
                </div>
              </div>

              {session.notes && (
                <div className="mt-6 bg-slate-50/30 p-5 rounded-3xl border border-slate-50 italic">
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    "{session.notes}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[150] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-t-[52px] sm:rounded-[52px] p-8 lg:p-12 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Log New Swim</h2>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Pool Session Details</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-50 p-4 rounded-2xl text-slate-400 hover:text-slate-600 active:scale-90 transition-all border border-slate-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Session Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 p-5 rounded-3xl outline-none focus:ring-4 ring-sky-100 border border-slate-100 font-bold text-slate-700"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Stroke Style</label>
                  <select 
                    className="w-full bg-slate-50 p-5 rounded-3xl outline-none focus:ring-4 ring-sky-100 border border-slate-100 appearance-none font-bold text-slate-700"
                    value={formData.stroke}
                    onChange={e => setFormData({...formData, stroke: e.target.value})}
                  >
                    <option>Freestyle</option>
                    <option>Backstroke</option>
                    <option>Breaststroke</option>
                    <option>Butterfly</option>
                    <option>IM (Medley)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-sky-50/50 p-6 rounded-[40px] border border-sky-100">
                  <label className="text-[10px] font-black text-sky-600 uppercase ml-4 mb-2 block tracking-widest">Distance (meters)</label>
                  <input 
                    type="number" 
                    placeholder="1000"
                    className="w-full bg-transparent p-2 text-3xl font-black text-sky-900 outline-none"
                    value={formData.distance}
                    onChange={e => setFormData({...formData, distance: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="bg-slate-50 p-6 rounded-[40px] border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Time (seconds)</label>
                  <input 
                    type="number" 
                    placeholder="1200"
                    className="w-full bg-transparent p-2 text-3xl font-black text-slate-800 outline-none"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              {currentPace && (
                <div className="bg-sky-600 p-6 rounded-[32px] flex items-center justify-between animate-in zoom-in duration-300 shadow-xl shadow-sky-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                      <BoltIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-sky-100 uppercase tracking-widest block">Predicted Pace</span>
                      <span className="text-white font-black text-lg">Consistent Training</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white">{currentPace}</span>
                    <span className="text-[10px] font-black text-sky-100 uppercase ml-2 tracking-tighter">s/100m</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase text-center block tracking-widest mb-6">How did it feel?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {FEELINGS.map((f) => (
                    <button
                      key={f.label}
                      type="button"
                      onClick={() => setFormData({...formData, feeling: f.label as any})}
                      className={`p-6 rounded-[36px] border-2 transition-all flex flex-col items-center gap-3 ${
                        formData.feeling === f.label 
                          ? `${f.bg} ${f.border} ring-8 ring-sky-50/50 scale-105 shadow-xl` 
                          : 'border-slate-50 bg-white hover:border-slate-200'
                      }`}
                    >
                      <span className="text-4xl">{f.icon}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${formData.feeling === f.label ? f.color : 'text-slate-400'}`}>
                        {f.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Notes & Reflection</label>
                <textarea 
                  className="w-full bg-slate-50 p-6 rounded-[40px] outline-none focus:ring-4 ring-sky-100 border border-slate-100 min-h-[140px] text-base font-bold text-slate-700"
                  placeholder="Focus on high elbow catch, maintained streamline after flip turns..."
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-6 pb-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white text-slate-400 font-black uppercase tracking-widest py-6 rounded-[32px] border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-sky-500 text-white font-black uppercase tracking-widest py-6 rounded-[32px] shadow-2xl shadow-sky-100 active:scale-[0.98] transition-all text-sm hover:bg-sky-600"
                >
                  Save Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwimLog;
