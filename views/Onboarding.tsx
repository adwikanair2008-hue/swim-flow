
import React, { useState, useRef } from 'react';
import { UserProfile, SwimmingLevel, Gender } from '../types';
import { PhotoIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    password: '',
    age: 18,
    gender: Gender.MALE,
    swimmingLevel: SwimmingLevel.BEGINNER,
    height: 175,
    weight: 70,
    profilePicture: undefined
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleComplete = () => {
    onComplete({
      ...(formData as Omit<UserProfile, 'isOnboarded'>),
      isOnboarded: true
    } as UserProfile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isEmailValid = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const isPasswordValid = (password: string) => {
    return (password?.length || 0) >= 6;
  };

  const isStep1Valid = 
    formData.name?.trim() && 
    isEmailValid(formData.email || '') && 
    isPasswordValid(formData.password || '') && 
    (formData.age || 0) > 0 &&
    (formData.weight || 0) > 0 &&
    (formData.height || 0) > 0;

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-sky-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-sky-200">
        <span className="text-3xl">🏊‍♂️</span>
      </div>

      {step === 1 && (
        <div className="animate-in fade-in duration-500 w-full max-w-sm">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to SwimFlow</h1>
          <p className="text-slate-500 mb-8">Let's personalize your coaching experience.</p>
          <div className="space-y-4 w-full">
            <div className="text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 mb-1 block">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full p-4 rounded-2xl border-none ring-2 ring-sky-100 focus:ring-sky-400 transition-all outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 mb-1 block">Age</label>
                <input
                  type="number"
                  className="w-full p-4 rounded-2xl border-none ring-2 ring-sky-100 focus:ring-sky-400 transition-all outline-none"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 mb-1 block">Gender</label>
                <select
                  className="w-full p-4 rounded-2xl border-none ring-2 ring-sky-100 focus:ring-sky-400 transition-all outline-none appearance-none bg-white"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                >
                  {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 mb-1 block">Height (cm)</label>
                <input
                  type="number"
                  placeholder="175"
                  className="w-full p-4 rounded-2xl border-none ring-2 ring-sky-100 focus:ring-sky-400 transition-all outline-none"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 mb-1 block">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="70"
                  className="w-full p-4 rounded-2xl border-none ring-2 ring-sky-100 focus:ring-sky-400 transition-all outline-none"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 mb-1 block">Email Address</label>
              <input
                type="email"
                placeholder="swimmer@example.com"
                className={`w-full p-4 rounded-2xl border-none ring-2 transition-all outline-none ${
                  formData.email && !isEmailValid(formData.email) ? 'ring-rose-200 focus:ring-rose-400' : 'ring-sky-100 focus:ring-sky-400'
                }`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 mb-1 block">Password (min 6 chars)</label>
              <input
                type="password"
                placeholder="••••••"
                className={`w-full p-4 rounded-2xl border-none ring-2 transition-all outline-none ${
                  formData.password && !isPasswordValid(formData.password) ? 'ring-rose-200 focus:ring-rose-400' : 'ring-sky-100 focus:ring-sky-400'
                }`}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              onClick={nextStep}
              disabled={!isStep1Valid}
              className="w-full bg-sky-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-sky-200 active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale mt-4"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in duration-500 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Choose your level</h2>
          <div className="space-y-3 mb-8">
            {Object.values(SwimmingLevel).map((level) => (
              <button
                key={level}
                onClick={() => setFormData({ ...formData, swimmingLevel: level })}
                className={`w-full p-5 rounded-3xl border-2 transition-all text-left flex items-center justify-between ${
                  formData.swimmingLevel === level ? 'border-sky-500 bg-sky-50 ring-4 ring-sky-50' : 'border-slate-100 bg-white'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-800">{level}</div>
                  <div className="text-xs text-slate-400">
                    {level === SwimmingLevel.BEGINNER ? 'Learning the basics & strokes' : level === SwimmingLevel.COMPETITIVE ? 'Training regularly for performance' : 'Competing at high levels'}
                  </div>
                </div>
                {formData.swimmingLevel === level && <div className="w-5 h-5 bg-sky-500 rounded-full"></div>}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button
              onClick={prevStep}
              className="flex-1 bg-white text-slate-400 font-bold py-4 rounded-2xl border border-slate-100 active:scale-95 transition-transform"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="flex-[2] bg-sky-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-sky-200 active:scale-95 transition-transform"
            >
              One Last Step
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in duration-500 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Add a Profile Picture</h2>
          <p className="text-slate-500 mb-8">Personalize your Athlete Hub.</p>
          
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="relative group">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 rounded-[48px] bg-sky-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-all"
              >
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center">
                    <UserCircleIcon className="h-20 w-20 text-sky-300" />
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest mt-1">Select Photo</span>
                  </div>
                )}
              </div>
              {formData.profilePicture && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData(prev => ({ ...prev, profilePicture: undefined }));
                  }}
                  className="absolute -top-2 -right-2 bg-white p-2 rounded-2xl shadow-lg text-rose-500 active:scale-90 transition-all border border-rose-50"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-sky-600 text-sm font-bold flex items-center gap-2 px-6 py-3 bg-sky-50 rounded-2xl border border-sky-100"
            >
              <PhotoIcon className="h-5 w-5" />
              {formData.profilePicture ? 'Change Photo' : 'Choose from Library'}
            </button>
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={prevStep}
              className="flex-1 bg-white text-slate-400 font-bold py-4 rounded-2xl border border-slate-100 active:scale-95 transition-transform"
            >
              Back
            </button>
            <button
              onClick={handleComplete}
              className="flex-[2] bg-sky-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-sky-200 active:scale-95 transition-transform"
            >
              {formData.profilePicture ? 'Looks Good!' : 'Skip for now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
