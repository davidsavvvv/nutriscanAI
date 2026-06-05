import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Copy, Users, TrendingUp, DollarSign } from "lucide-react";

export default function AffiliateDashboard({ onBack, session }: { onBack: () => void, session: any }) {
  const [affiliate, setAffiliate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/affiliates/stats", {
      headers: { Authorization: `Bearer \${session?.access_token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.affiliate) {
          setAffiliate(data.affiliate);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [session]);

  const copyLink = () => {
    navigator.clipboard.writeText(\`https://scanmymacros.com/?ref=\${affiliate.code}\`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex-grow min-h-screen bg-[#0B0F19] text-white p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors bg-white/5 px-4 py-2 rounded-full text-sm font-bold w-fit">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        {!loading && !affiliate && (
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-center space-y-4">
             <div className="w-16 h-16 bg-blue-500/20 text-blue-500 flex items-center justify-center rounded-full mx-auto">
               <Users className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-display font-bold">Devenir Ambassadeur</h2>
             <p className="text-slate-400 max-w-md mx-auto">Contactez-nous sur instagram ou par email pour obtenir votre code d'affiliation exclusif et gagnez 30% sur chaque parrainage !</p>
             <button className="bg-emerald-500 text-black px-6 py-3 rounded-full font-bold shadow-lg shadow-emerald-500/20" onClick={() => window.open('mailto:davidsauvaget69@gmail.com')}>Demander un accès</button>
          </div>
        )}

        {affiliate && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold">Bonjour {affiliate.name}</h1>
                <p className="text-emerald-400 font-bold flex items-center gap-2 mt-1">
                  <CheckCircle className="w-4 h-4" /> Ambassadeur vérifié
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="font-bold text-slate-300">Votre lien de parrainage unique</h3>
              <div className="flex bg-black/40 border border-white/5 rounded-xl p-2 items-center gap-2">
                <input readOnly value={\`https://scanmymacros.com/?ref=\${affiliate.code}\`} className="flex-1 bg-transparent text-emerald-300 font-mono text-sm px-4 outline-none" />
                <button onClick={copyLink} className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all">
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copié!" : "Copier"}
                </button>
              </div>
              <p className="text-xs text-slate-500">Partagez ce lien sur vos réseaux sociaux pour gagner 30% de commission sur chaque abonnement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2 opacity-80">Clics générés</span>
                <span className="text-3xl font-mono font-bold text-white">{affiliate.clicks}</span>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2 opacity-80">Conversions (Payants)</span>
                <span className="text-3xl font-mono font-bold text-emerald-400">{affiliate.conversions}</span>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2 opacity-80">Gains validés (Total)</span>
                <span className="text-3xl font-mono font-bold text-slate-300">{(affiliate.earnings_total || 0).toFixed(2)}€</span>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden">
                <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-500/10" />
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block mb-2 relative z-10 opacity-90">Gains en attente</span>
                <span className="text-3xl font-mono font-bold text-emerald-300 relative z-10">{(affiliate.earnings_pending || 0).toFixed(2)}€</span>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 rounded-3xl mt-8">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-display font-bold text-xl">Dernières conversions</h3>
               </div>
               <div className="text-center py-10 opacity-50">
                 <p className="text-sm">Vos 10 dernières conversions s'afficheront ici.</p>
               </div>
               <button disabled={parseFloat(affiliate.earnings_pending) < 20} className="w-full mt-4 bg-emerald-500 disabled:bg-white/5 disabled:text-slate-500 text-black font-extrabold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none">
                 Demander mon paiement (Min. 20€)
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
