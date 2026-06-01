import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, Sparkles, ArrowRight, Home } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AdminLoginProps {
  onAdminAuthenticated: (profile: { email: string; name: string }) => void;
  onNavigateHome: () => void;
  onNavigateToDashboard: () => void;
}

export default function AdminLogin({ onAdminAuthenticated, onNavigateHome, onNavigateToDashboard }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorText('');

    try {
      // 1. Sign in with standard Firebase auth
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // 2. Fetch profile from firestore users collection to verify admin rights
      const userId = email.trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      const isGrantedAdmin = email.trim().toLowerCase() === 'mrflop786@gmail.com' || (userDoc.exists() && userDoc.data()?.isAdmin === true);

      if (isGrantedAdmin) {
        onAdminAuthenticated({
          email: email.trim(),
          name: userDoc.exists() ? userDoc.data()?.name || 'Administrator' : 'Administrator'
        });
        onNavigateToDashboard();
      } else {
        setErrorText('Access Denied: This account does not possess active system administrator credentials.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Decorative gradient sphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-zinc-900 border border-zinc-800/80 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8"
      >
        
        {/* Brand Banner */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto shadow-inner border border-indigo-500/20">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-sans font-extrabold text-white uppercase tracking-tight">
            Terminal Admin Login
          </h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-normal">
            Enter verified credentials below to unlock the real-time store database and manage production models.
          </p>
        </div>

        {errorText && (
          <div className="mb-5 p-3 bg-red-950/40 border border-red-900/50 rounded-2xl text-center">
            <p className="text-[11px] font-sans font-semibold text-red-400 leading-normal">{errorText}</p>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">
              SYSTEM USERNAME / EMAIL
            </label>
            <div className="relative">
              <input
                id="admin-form-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mrflop786@gmail.com"
                className="w-full text-xs p-3 pl-10 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white transition-all font-sans"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">
              SECURITY KEY / PASSWORD
            </label>
            <div className="relative">
              <input
                id="admin-form-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 pl-10 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white transition-all font-sans"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Submit Key Button */}
          <button
            id="admin-login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs rounded-xl cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Decrypting Workspace...
              </span>
            ) : (
              <>
                <span>Acknowledge & Access Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back and hint options */}
        <div className="flex justify-between items-center mt-6 pt-5 border-t border-zinc-800/60">
          <button
            onClick={onNavigateHome}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 font-sans font-semibold cursor-pointer transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </button>
          
          <span className="text-[10px] text-zinc-500 font-mono">mrflop786@gmail.com</span>
        </div>

      </motion.div>
    </div>
  );
}
