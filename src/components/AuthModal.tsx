import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, User, Mail, UserCheck, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (name: string, email: string, avatar: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'
];

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [username, setUsername] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_PRESETS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !emailAddress.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess(username.trim(), emailAddress.trim(), selectedAvatar);
      setIsLoading(false);
      onClose();
    }, 1200);
  };

  const handleSimulatedGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      onLoginSuccess(
        'Developer Guest', 
        'guest.dev@aether-marketplace.io', 
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
      );
      setIsGoogleLoading(false);
      onClose();
    }, 1500);
  };

  return (
    <div id="auth-modal-panel-root" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-xs">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl w-full max-w-md shadow-2xl p-6"
      >
        
        {/* Close */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-150 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Display */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-650 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-sans font-bold text-zinc-900 dark:text-zinc-50">Setup Account Credentials</h3>
          <p className="text-xs text-zinc-400 max-w-[280px] mx-auto leading-normal">
            Establish your identity to purchase digital files, write verified product reviews, and view direct downloads.
          </p>
        </div>

        {/* Simulated Google SSO */}
        <button
          id="simulate-google-sso-btn"
          type="button"
          onClick={handleSimulatedGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          className="w-full py-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl font-sans font-semibold text-xs text-zinc-700 dark:text-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isGoogleLoading ? (
            <svg className="animate-spin h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 1.8 14.89 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.6 2.8C6.01 7.15 8.79 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.51 12.3c0-.83-.07-1.63-.2-2.4H12v4.6h6.48c-.28 1.48-1.11 2.73-2.38 3.58l3.63 2.82c2.13-1.97 3.78-4.87 3.78-8.6z" />
              <path fill="#FBBC05" d="M5.1 14.3c-.25-.75-.4-1.55-.4-2.38s.15-1.63.4-2.38L1.5 6.74C.54 8.66 0 10.77 0 13s.54 4.34 1.5 6.26l3.6-2.96z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.96-1.08 7.95-2.92l-3.63-2.82c-1.1.74-2.51 1.18-4.32 1.18-3.21 0-5.99-2.11-6.9-5.26l-3.6 2.8C3.4 20.35 7.35 23 12 23z" />
            </svg>
          )}
          <span>Simulate Google Single Sign-On</span>
        </button>

        {/* Separator rule */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute inset-x-0 h-[1px] bg-zinc-100 dark:bg-zinc-800" />
          <span className="relative bg-white dark:bg-zinc-950 px-3 text-[10px] font-mono text-zinc-400 uppercase">OR CUSTOMIZE</span>
        </div>

        {/* Manual email/name */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Avatar preset selection */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-405 dark:text-zinc-400 uppercase tracking-wide mb-2 text-center sm:text-left">Pick Dashboard Persona avatar</label>
            <div className="flex justify-center sm:justify-start gap-2.5">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedAvatar === preset;
                return (
                  <button
                    id={`preset-${preset.split('/').pop()}`}
                    type="button"
                    key={preset}
                    onClick={() => setSelectedAvatar(preset)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform ${isSelected ? 'ring-2 ring-indigo-650 ring-offset-2 dark:ring-offset-zinc-950' : 'opacity-65'}`}
                  >
                    <img src={preset} className="w-10 h-10 object-cover" alt="Preset profile selector" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-405 dark:text-zinc-400 tracking-wide uppercase mb-1">Developer Username</label>
            <div className="relative">
              <input
                id="auth-input-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Jane Doe"
                className="w-full text-xs p-3 pl-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-405 dark:text-zinc-400 tracking-wide uppercase mb-1">Email Coordinates</label>
            <div className="relative">
              <input
                id="auth-input-email"
                type="email"
                required
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="jane.doe@work.io"
                className="w-full text-xs p-3 pl-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          {isLoading ? (
            <button
              id="submit-auth-loading-btn"
              type="button"
              disabled
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 opacity-90 text-xs sm:text-sm"
            >
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Authenticating connection credentials...</span>
            </button>
          ) : (
            <button
              id="submit-auth-btn"
              type="submit"
              className="w-full py-2.5 bg-indigo-605 text-white bg-indigo-600 hover:bg-indigo-500 font-sans font-bold text-xs sm:text-sm rounded-xl cursor-pointer shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Validate & Mount Account</span>
            </button>
          )}

          <div className="flex justify-center items-center gap-1.5 text-[9.5px] text-zinc-450 leading-relaxed max-w-[260px] mx-auto text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Local sandbox integration only: zero persistent storage telemetry recorded.</span>
          </div>

        </form>

      </motion.div>
    </div>
  );
}
