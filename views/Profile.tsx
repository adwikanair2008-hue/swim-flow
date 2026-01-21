
import React, { useRef } from 'react';
import { UserProfile, SwimSession, ChatMessage } from '../types';
import { 
  IdentificationIcon, 
  AcademicCapIcon, 
  EnvelopeIcon, 
  CloudArrowDownIcon, 
  CloudArrowUpIcon,
  TrashIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  CircleStackIcon,
  ScaleIcon,
  ArrowUpIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface ProfileProps {
  profile: UserProfile;
  sessions: SwimSession[];
  chatHistory: ChatMessage[];
  lastSaved: number;
  onUpdate: (profile: UserProfile) => void;
  onImport: (data: any) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, sessions, chatHistory, lastSaved, onUpdate, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);

  const calculateBMI = () => {
    if (!profile.height || !profile.weight) return 0;
    const heightInMeters = profile.height / 100;
    return parseFloat((profile.weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const bmi = calculateBMI();

  const getBMIStatus = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-blue-500', bg: 'bg-blue-500' };
    if (val < 25) return { label: 'Healthy', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (val < 30) return { label: 'Overweight', color: 'text-orange-500', bg: 'bg-orange-500' };
    return { label: 'Obese', color: 'text-rose-500', bg: 'bg-rose-500' };
  };

  const status = getBMIStatus(bmi);

  const resetApp = () => {
    if (confirm('DANGER: This will permanently delete all your swimming history and profile data from this device. Proceed?')) {
      localStorage.removeItem('swimflow_data');
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      profile,
      sessions,
      chatHistory,
      lastSaved: Date.now(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `swimflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.profile && json.sessions) {
          onImport(json);
          alert('Device restored successfully!');
        } else {
          alert('Invalid data format.');
        }
      } catch (err) {
        alert('Failed to read file.');
      }
    };
    reader.readAsText(file);
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...profile, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const dataSize = Math.round(JSON.stringify({ profile, sessions, chatHistory }).length / 1024);

  return (
    <div className="space-y-8 lg:space-y-12 pb-24">
      <header className="flex flex-col items-center py-10 lg:py-16">
        <div className="relative group">
          <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-[48px] lg:rounded-[56px] flex items-center justify-center text-white text-5xl shadow-2xl shadow-sky-200 mb-6 font-black overflow-hidden border-4 border-white transition-transform group-hover:scale-105 duration-500">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              profile.name.charAt(0)
            )}
          </div>
          <button 
            onClick={() => profilePicInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-xl border border-slate-50 text-sky-500 active:scale-90 transition-all hover:bg-sky-50"
          >
            <PhotoIcon className="h-6 w-6" />
          </button>
          <input 
            type="file" 
            ref={profilePicInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleProfilePicChange} 
          />
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">{profile.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-100">{profile.swimmingLevel} Athlete</span>
          <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">{profile.gender}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Body Metrics & BMI */}
        <section className="bg-white rounded-[52px] border border-sky-50 shadow-sm overflow-hidden p-8 lg:p-10">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
            <ScaleIcon className="h-5 w-5" />
            Performance Metrics
          </h3>
          
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="space-y-2">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Athlete Height</div>
               <div className="flex items-end gap-1">
                 <span className="text-3xl font-black text-slate-800">{profile.height}</span>
                 <span className="text-sm font-bold text-slate-400 mb-1.5 uppercase">cm</span>
               </div>
            </div>
            <div className="space-y-2">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Athlete Weight</div>
               <div className="flex items-end gap-1">
                 <span className="text-3xl font-black text-slate-800">{profile.weight}</span>
                 <span className="text-sm font-bold text-slate-400 mb-1.5 uppercase">kg</span>
               </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-[40px] p-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
               <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Body Mass Index</div>
                 <div className="text-4xl font-black text-slate-800 tracking-tighter">{bmi}</div>
               </div>
               <div className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest bg-white shadow-md ${status.color}`}>
                 {status.label}
               </div>
            </div>
            
            <div className="relative h-3 w-full bg-slate-200 rounded-full overflow-hidden">
               <div 
                 className={`absolute top-0 left-0 h-full transition-all duration-1000 ${status.bg}`}
                 style={{ width: `${Math.min(100, (bmi / 40) * 100)}%` }}
               ></div>
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
               <span>18.5 (Min)</span>
               <span>25 (Ideal)</span>
               <span>30 (Max)</span>
            </div>
          </div>
        </section>

        {/* Data & Storage */}
        <div className="space-y-8 lg:space-y-12">
          <section className="bg-white rounded-[52px] border border-sky-50 shadow-sm overflow-hidden h-full">
            <div className="p-8 lg:p-10 bg-slate-50/30 border-b border-slate-50">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                <DevicePhoneMobileIcon className="h-5 w-5" />
                Local Intelligence
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Device Storage</p>
                  <p className="text-2xl font-black text-slate-800">{dataSize} <span className="text-sm font-bold text-slate-300 uppercase tracking-tight">KB</span></p>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sync Integrity</p>
                  <p className="text-sm font-black text-slate-800">{new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Authenticated</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-10 space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-sky-50 rounded-[22px] flex items-center justify-center border border-sky-100 shadow-inner">
                  <EnvelopeIcon className="h-6 w-6 text-sky-500" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Coach Connectivity</div>
                  <div className="text-slate-800 font-bold text-lg">{profile.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-sky-50 rounded-[22px] flex items-center justify-center border border-sky-100 shadow-inner">
                  <CircleStackIcon className="h-6 w-6 text-sky-500" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Athlete Records</div>
                  <div className="text-slate-800 font-bold text-lg">{sessions.length} Logged Sessions</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Data Management - Responsive Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <button onClick={exportData} className="group flex flex-col items-center justify-center gap-3 bg-white text-sky-600 p-8 rounded-[44px] border border-sky-100 active:scale-95 transition-all hover:bg-sky-50 hover:border-sky-300">
          <CloudArrowDownIcon className="h-8 w-8 transition-transform group-hover:translate-y-1" />
          <span className="text-xs font-black uppercase tracking-widest">Backup Database</span>
        </button>
        <button onClick={handleImportClick} className="group flex flex-col items-center justify-center gap-3 bg-white text-indigo-600 p-8 rounded-[44px] border border-indigo-100 active:scale-95 transition-all hover:bg-indigo-50 hover:border-indigo-300">
          <CloudArrowUpIcon className="h-8 w-8 transition-transform group-hover:-translate-y-1" />
          <span className="text-xs font-black uppercase tracking-widest">Restore Records</span>
        </button>
        <button onClick={resetApp} className="group flex flex-col items-center justify-center gap-3 bg-rose-50 text-rose-600 p-8 rounded-[44px] border border-rose-100 active:scale-95 transition-all hover:bg-rose-100 lg:col-span-1 sm:col-span-2 lg:col-auto">
          <TrashIcon className="h-8 w-8 transition-transform group-hover:scale-110" />
          <span className="text-xs font-black uppercase tracking-widest">Wipe Device Data</span>
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={onFileChange} />
      </section>

      <div className="text-center p-12 max-w-2xl mx-auto">
        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full mx-auto mb-6"></div>
        <p className="text-slate-400 text-sm font-medium leading-relaxed italic">"SwimFlow is a zero-latency performance suite. Your biological data and training history reside exclusively on your local hardware for maximum privacy and performance."</p>
      </div>
    </div>
  );
};

export default Profile;
