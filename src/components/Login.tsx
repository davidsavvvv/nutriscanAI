import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Mail, Lock, Loader2 } from "lucide-react";

interface LoginProps {
  onSuccess?: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas.");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg("Inscription réussie ! Veuillez vérifier votre e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg("Connexion réussie !");
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://scanmymacros.com/scanner",
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#141414] border border-[#232323] shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-display text-white mb-2">
          {isSignUp ? "Créer un compte" : "Bon retour"}
        </h2>
        <p className="text-sm text-slate-400">
          {isSignUp
            ? "Rejoignez-nous pour commencer."
            : "Connectez-vous pour accéder à votre espace."}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            E-mail
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] transition-colors"
              placeholder="votre@email.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {isSignUp && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-xs text-red-200">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-900/50 rounded-xl text-xs text-emerald-200">
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full relative flex items-center justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-black bg-[#00d4aa] hover:bg-[#00eabf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141414] focus:ring-[#00d4aa] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isSignUp ? (
            "Créer mon compte"
          ) : (
            "Se connecter"
          )}
        </button>
      </form>

      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-[#232323]"></div>
        <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase font-black tracking-wider">ou</span>
        <div className="flex-grow border-t border-[#232323]"></div>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-[#2a2a2a] rounded-xl text-sm font-bold text-white bg-[#0e0e0e] hover:bg-[#1a1a1a] hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141414] focus:ring-[#00d4aa] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mb-2"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.353 0 3.393 2.7 1.517 6.632l3.749 3.133z"
          />
          <path
            fill="#34A853"
            d="M16.04 15.341c-1.07.697-2.42 1.142-4.04 1.142-2.927 0-5.418-1.92-6.3-4.545L1.91 15.027A11.94 11.94 0 0 0 12 24c3.245 0 6.136-1.091 8.318-2.973l-4.278-5.686z"
          />
          <path
            fill="#4285F4"
            d="M23.491 12.273c0-.818-.082-1.609-.218-2.373H12v4.514h6.477a5.55 5.55 0 0 1-2.409 3.655l4.277 5.686c2.5-2.3 3.945-5.686 3.945-9.482z"
          />
          <path
            fill="#FBBC05"
            d="M5.7 11.938A6.98 6.98 0 0 1 5.7 9.53L1.95 6.398a11.96 11.96 0 0 0 0 11.077l3.75-3.132A6.98 6.98 0 0 1 5.7 11.938z"
          />
        </svg>
        Continuer avec Google
      </button>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setSuccessMsg(null);
          }}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          {isSignUp
            ? "Déjà un compte ? Connectez-vous"
            : "Pas encore de compte ? S'inscrire"}
        </button>
      </div>
    </div>
  );
}
