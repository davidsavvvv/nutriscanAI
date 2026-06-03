import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Mail, Lock, Loader2 } from "lucide-react";

interface LoginProps {
  onSuccess?: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/scanner`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

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
          options: {
            data: {
              name: name,
              affiliate_code: affiliateCode,
            }
          }
        });
        if (error) throw error;
        setSuccessMsg(`Vérifiez votre boîte mail pour confirmer votre compte 📧\nUn lien de confirmation a été envoyé sur ${email}`);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          throw new Error("Email ou mot de passe incorrect");
        }
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

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#141414] border border-[#232323] shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-display text-white mb-2">
          {isSignUp ? "Créer un compte" : "Bon retour"}
        </h2>
        <p className="text-sm text-slate-400">
          {isSignUp
             ? "Rejoignez-nous pour commencer."
             : "Connectez-vous pour accéder à votre espace."}
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full relative flex items-center justify-center gap-3 py-3 px-4 mb-6 border border-[#2a2a2a] rounded-xl text-sm font-bold text-white bg-[#0a0a0a] hover:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141414] focus:ring-[#7c3aed] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google logo"
          className="w-5 h-5"
        />
        Continuer avec Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#2a2a2a]"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#141414] px-4 text-slate-500 uppercase tracking-wider font-bold">— ou —</span>
        </div>
      </div>

      <form onSubmit={handleAuth} className="space-y-5">
        {isSignUp && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
              Nom complet
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
                placeholder="Votre nom"
                required
              />
            </div>
          </div>
        )}

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
              className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
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
              className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {isSignUp && (
          <>
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
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                Code affilié (optionnel)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={affiliateCode}
                  onChange={(e) => setAffiliateCode(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
                  placeholder="Code..."
                />
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-xs text-red-200">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-900/50 rounded-xl text-xs text-emerald-200 whitespace-pre-line">
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full relative flex items-center justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-[#7c3aed] hover:bg-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141414] focus:ring-[#7c3aed] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isSignUp ? (
            "Continuer →"
          ) : (
            "Se connecter →"
          )}
        </button>
      </form>
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
