
import React, { useState, useEffect } from 'react';
import { UserProfile, SwimSession } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { geminiService } from '../services/gemini';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface ProgressProps {
  sessions: SwimSession[];
  profile: UserProfile;
}

const Progress: React.FC<ProgressProps> = ({ sessions, profile }) => {
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const res = await geminiService.getPerformanceInsights(profile, sessions);
      setInsights(res);
      setLoadingInsights(false);
    };
    if (sessions.length > 0) fetchInsights();
  }, [sessions, profile]);

  // Data processing for charts
  const timeData = [...sessions].reverse().map(s => ({
    date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    pace: (s.time / s.distance) * 100 // seconds per 100m
  }));

  const weekDataMap = new Map();
  sessions.forEach(s => {
    const d = new Date(s.date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff)).toLocaleDateString();
    weekDataMap.set(monday, (weekDataMap.get(monday) || 0) + s.distance);
  });

  const distanceData = Array.from(weekDataMap.entries()).map(([week, distance]) => ({
    week,
    distance
  })).slice(-4).reverse();

  return (
    <div className="space-y-8 lg:space-y-12">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Your Progress</h1>
        <p className="text-slate-500 mt-1 font-medium">Tracking metrics for the {profile.swimmingLevel} journey.</p>
      </header>

      {/* Chart Section - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {/* Pace Chart */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-sky-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 text-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center">
                <LineChart className="h-4 w-4 text-sky-500" />
              </div>
              Pace Trend
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl">sec/100m</span>
          </div>
          <div className="h-64 w-full">
            {timeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                    itemStyle={{ fontWeight: 'black', color: '#0ea5e9' }}
                    labelClassName="font-bold text-slate-400 text-xs mb-1"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pace" 
                    stroke="#0ea5e9" 
                    strokeWidth={4} 
                    dot={{ r: 5, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 8, strokeWidth: 0 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-2xl">📈</div>
                <p className="italic font-medium text-center">Not enough data to plot pace.<br/>Log more swims!</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Distance Bar Chart */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-sky-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 text-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                <BarChart className="h-4 w-4 text-indigo-500" />
              </div>
              Weekly Volume
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl">Meters</span>
          </div>
          <div className="h-64 w-full">
            {distanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distanceData}>
                  <XAxis dataKey="week" hide />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', radius: 12 }}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                    itemStyle={{ fontWeight: 'black', color: '#6366f1' }}
                    labelClassName="font-bold text-slate-400 text-xs mb-1"
                  />
                  <Bar dataKey="distance" fill="#818cf8" radius={[12, 12, 12, 12]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-2xl">📊</div>
                <p className="italic font-medium text-center">Not enough data to plot volume.<br/>Consistency is key!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights Section - More Expansive */}
      <section className="bg-gradient-to-br from-indigo-600 to-sky-700 p-8 lg:p-12 rounded-[52px] text-white shadow-2xl shadow-sky-200 relative overflow-hidden transition-transform hover:scale-[1.005]">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
           <SparklesIcon className="w-64 h-64 lg:w-96 lg:h-96" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight">AI Performance Analysis</h2>
              <p className="text-sky-100 text-sm font-medium opacity-80 uppercase tracking-[0.1em] mt-1">Generated by Coach Blue</p>
            </div>
          </div>
          
          {loadingInsights ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded-2xl w-3/4"></div>
              <div className="h-6 bg-white/10 rounded-2xl w-full"></div>
              <div className="h-6 bg-white/10 rounded-2xl w-5/6"></div>
            </div>
          ) : (
            <div className="text-white text-lg lg:text-xl leading-relaxed font-bold max-w-4xl space-y-6">
              {insights.split('\n').filter(line => line.trim()).map((line, idx) => (
                <div key={idx} className="flex gap-4">
                   <div className="w-2 h-2 rounded-full bg-sky-400 mt-3 shrink-0"></div>
                   <p className="opacity-95">{line.replace(/^[-*•]\s+/, '')}</p>
                </div>
              ))}
            </div>
          )}

          {!loadingInsights && sessions.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-4">
               <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-200 block mb-1">Consistency Score</span>
                  <span className="font-black text-xl">Elite Rhythm</span>
               </div>
               <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-200 block mb-1">Pace Stability</span>
                  <span className="font-black text-xl">+4.2% Optimization</span>
               </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Progress;
