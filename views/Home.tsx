
import React from 'react';
import { UserProfile, SwimSession } from '../types';
import { 
  PlusIcon, 
  FireIcon, 
  TrophyIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  MinusIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';

interface HomeProps {
  profile: UserProfile;
  sessions: SwimSession[];
  onNavigate: (tab: 'home' | 'log' | 'progress' | 'coach' | 'profile' | 'nutrition' | 'drylands') => void;
}

const Home: React.FC<HomeProps> = ({ profile, sessions, onNavigate }) => {
  const totalDistance = sessions.reduce((acc, s) => acc + s.distance, 0);
  const sessionCount = sessions.length;

  // Calculate weekly trends
  const now = new Date();
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const thisMonday = getMonday(now);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(lastMonday.getDate() - 7);

  const thisWeekSessions = sessions.filter(s => new Date(s.date) >= thisMonday);
  const lastWeekSessions = sessions.filter(s => {
    const d = new Date(s.date);
    return d >= lastMonday && d < thisMonday;
  });

  const thisWeekCount = thisWeekSessions.length;
  const lastWeekCount = lastWeekSessions.length;
  const thisWeekDist = thisWeekSessions.reduce((acc, s) => acc + s.distance, 0);
  const lastWeekDist = lastWeekSessions.reduce((acc, s) => acc + s.distance, 0);

  const PerformanceBadge = ({ current, prev }: { current: number, prev: number }) => {
    const isMet = current === prev && prev > 0;
    const isExceeded = current > prev;
    const isBelow = current < prev && prev > 0;
    const isFirstWeek = prev === 0 && current > 0;

    if (isExceeded || isFirstWeek) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white rounded-full text-[8px] lg:text-[10px] font-black animate-bounce-short shadow-md shadow-emerald-100">
          <TrophyIcon className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
          EXCEEDED
        </div>
      );
    } else if (isMet) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-sky-500 text-white rounded-full text-[8px] lg:text-[10px] font-black shadow-md shadow-sky-100">
          <CheckBadgeIcon className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
          MET GOAL
        </div>
      );
    } else if (isBelow) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-500 rounded-full text-[8px] lg:text-[10px] font-black border border-rose-100">
          <ArrowTrendingDownIcon className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
          BELOW
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-400 rounded-full text-[8px] lg:text-[10px] font-black border border-slate-100">
        <MinusIcon className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
        NEW
      </div>
    );
  };

  return (
    <div className="space-y-8 lg:space-y-12">
      <header className="flex items-center justify-between md:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hi, {profile.name}! 👋</h1>
          <p className="text-slate-500 text-sm">Ready for some laps today?</p>
        </div>
        <button 
          onClick={() => onNavigate('profile')}
          className="w-12 h-12 rounded-2xl overflow-hidden shadow-inner border-2 border-white ring-2 ring-sky-100 transition-transform active:scale-90"
        >
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-sky-200 flex items-center justify-center text-xl text-sky-600">🌊</div>
          )}
        </button>
      </header>

      {/* Quick Stats Grid - Responsive Layout */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-sky-100 shadow-sm relative flex flex-col justify-between h-40 lg:h-44 transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-orange-50 rounded-2xl">
              <FireIcon className="h-6 w-6 text-orange-400" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter">{sessionCount}</span>
              <PerformanceBadge current={thisWeekCount} prev={lastWeekCount} />
            </div>
            <div>
              <div className="text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-wider">Total Swims</div>
              <div className="text-[8px] lg:text-[10px] text-slate-300 font-bold uppercase">Vs. Last Week</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-sky-100 shadow-sm relative flex flex-col justify-between h-40 lg:h-44 transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-yellow-50 rounded-2xl">
              <TrophyIcon className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter">
                {(totalDistance / 1000).toFixed(1)}
                <small className="text-xs font-bold text-slate-400 ml-0.5">km</small>
              </span>
              <PerformanceBadge current={thisWeekDist} prev={lastWeekDist} />
            </div>
            <div>
              <div className="text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-wider">Total Distance</div>
              <div className="text-[8px] lg:text-[10px] text-slate-300 font-bold uppercase">Vs. Last Week</div>
            </div>
          </div>
        </div>

        {/* Bonus Stat: This Week (Only on Desktop) */}
        <div className="hidden lg:flex bg-white p-6 rounded-[32px] border border-emerald-100 shadow-sm flex-col justify-between h-44 transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-emerald-50 rounded-2xl">
              <CheckBadgeIcon className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <div className="space-y-2">
             <span className="text-3xl font-black text-slate-800 tracking-tighter">{thisWeekCount}</span>
             <div>
               <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Weekly Swims</div>
               <div className="text-[10px] text-emerald-500 font-bold uppercase">Target: 3+</div>
             </div>
          </div>
        </div>

        <div className="hidden lg:flex bg-white p-6 rounded-[32px] border border-indigo-100 shadow-sm flex-col justify-between h-44 transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-indigo-50 rounded-2xl">
              <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-400" />
            </div>
          </div>
          <div className="space-y-2">
             <span className="text-3xl font-black text-slate-800 tracking-tighter">{thisWeekDist}m</span>
             <div>
               <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Distance This Week</div>
               <div className="text-[10px] text-indigo-500 font-bold uppercase">Building Rhythm</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-black text-slate-800 text-xl tracking-tight">Recent Activity</h2>
            <button onClick={() => onNavigate('log')} className="text-sky-600 text-xs font-black uppercase tracking-widest hover:bg-sky-50 px-3 py-1.5 rounded-xl transition-colors">View All Logs</button>
          </div>
          
          {sessions.length === 0 ? (
            <div className="bg-white p-12 rounded-[40px] border border-dashed border-sky-200 text-center">
              <div className="text-5xl mb-4">🤿</div>
              <p className="text-slate-400 font-bold">No swims logged yet.</p>
              <button 
                onClick={() => onNavigate('log')}
                className="mt-4 text-sky-500 font-black text-xs uppercase tracking-widest"
              >
                Log your first lap
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 4).map((session) => (
                <div key={session.id} className="bg-white p-5 lg:p-6 rounded-[32px] flex items-center gap-5 border border-sky-50 shadow-sm hover:border-sky-200 transition-colors">
                  <div className="w-14 h-14 bg-sky-50 rounded-[22px] flex items-center justify-center text-2xl shadow-sm shrink-0">
                    {session.stroke === 'Butterfly' ? '🦋' : session.stroke === 'Breaststroke' ? '🦀' : session.stroke === 'Backstroke' ? '🦦' : '🏊'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-base">{session.stroke}</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">{new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-slate-800 text-lg">{session.distance}m</div>
                    <div className="text-[10px] text-slate-400 font-black tracking-tight">{Math.floor(session.time / 60)}m {session.time % 60}s</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="font-black text-slate-800 text-xl tracking-tight px-2">Quick Actions</h2>
          <div className="space-y-4">
            <button 
              onClick={() => onNavigate('log')}
              className="w-full bg-gradient-to-r from-sky-500 to-sky-600 p-8 rounded-[36px] flex items-center justify-between text-white shadow-xl shadow-sky-100 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all group"
            >
              <div className="text-left">
                <h3 className="font-black text-xl mb-1">Log a New Swim</h3>
                <p className="text-sky-100 text-sm font-medium opacity-80">Track today's workout</p>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl group-hover:rotate-90 transition-transform duration-300">
                <PlusIcon className="h-8 w-8" />
              </div>
            </button>

            {/* AI Coach Hint Box - Responsive Positioning */}
            <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-sm font-black">CB</div>
                <span className="font-black text-xs uppercase tracking-widest">Coach Blue's Wisdom</span>
              </div>
              <p className="text-indigo-50 text-base leading-relaxed font-bold">
                "Consistency is the bedrock of speed. For a {profile.swimmingLevel} athlete like you, finding rhythm in your stroke is priority #1 this week."
              </p>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => onNavigate('coach')}
                  className="bg-white/20 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/30 transition-colors"
                >
                  Chat with Coach
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-short {
          animation: bounce-short 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
