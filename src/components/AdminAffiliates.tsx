import React, { useEffect, useState } from "react";
import { ArrowLeft, UserPlus, CheckCircle, RefreshCw } from "lucide-react";

export default function AdminAffiliates({ onBack, session }: { onBack: () => void, session: any }) {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAffiliate, setNewAffiliate] = useState({ name: "", email: "", code: "", userId: "" });

  const fetchAffiliates = () => {
    setLoading(true);
    fetch("/api/admin/affiliates", {
      headers: { Authorization: `Bearer \${session?.access_token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.affiliates) setAffiliates(data.affiliates);
        setLoading(false);
      })
      .catch((e) => {
         console.error(e);
         setLoading(false);
      });
  };

  useEffect(() => {
    fetchAffiliates();
  }, [session]);

  const handleCreate = async () => {
    if (!newAffiliate.name || !newAffiliate.code || !newAffiliate.email) return alert("Remplissez les champs");
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { 
           "Content-Type": "application/json",
           Authorization: `Bearer \${session?.access_token}`
        },
        body: JSON.stringify(newAffiliate)
      });
      if (res.ok) {
        setNewAffiliate({ name: "", email: "", code: "", userId: "" });
        fetchAffiliates();
      } else {
        const error = await res.json();
        alert("Erreur: " + error.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePay = async (id: string, pending: number) => {
    if (pending <= 0) return alert("Pas de solde en attente");
    if (!window.confirm("Marquer comme payé ? Le solde passera à 0 et s'ajoutera au total.")) return;
    try {
      const res = await fetch(\`/api/admin/affiliates/\${id}/pay\`, {
        method: "POST",
        headers: { Authorization: `Bearer \${session?.access_token}` }
      });
      if (res.ok) {
        fetchAffiliates();
      } else {
         alert("Erreur lors du paiement");
      }
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full flex-grow min-h-screen bg-[#0B0F19] text-white p-6 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors bg-white/5 px-4 py-2 rounded-full text-sm font-bold w-fit">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <h1 className="text-3xl font-display font-bold">Administration Affiliés</h1>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-emerald-400" /> Créer un affilié</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input placeholder="Nom (ex: David S.)" value={newAffiliate.name} onChange={e => setNewAffiliate({...newAffiliate, name: e.target.value})} className="bg-black/50 border border-white/10 px-4 py-3 rounded-xl font-bold font-mono text-sm outline-none focus:border-emerald-500" />
            <input placeholder="Email" type="email" value={newAffiliate.email} onChange={e => setNewAffiliate({...newAffiliate, email: e.target.value})} className="bg-black/50 border border-white/10 px-4 py-3 rounded-xl font-bold font-mono text-sm outline-none focus:border-emerald-500" />
            <input placeholder="Code Unique (ex: david30)" value={newAffiliate.code} onChange={e => setNewAffiliate({...newAffiliate, code: e.target.value})} className="bg-black/50 border border-white/10 px-4 py-3 rounded-xl font-bold font-mono text-sm outline-none focus:border-emerald-500" />
            <input placeholder="ID Auth Supabase (Optionnel)" value={newAffiliate.userId} onChange={e => setNewAffiliate({...newAffiliate, userId: e.target.value})} className="bg-black/50 border border-white/10 px-4 py-3 rounded-xl font-bold font-mono text-xs outline-none focus:border-emerald-500" />
          </div>
          <button onClick={handleCreate} className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:brightness-110">Créer</button>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden mt-8">
           <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
             <h2 className="font-bold flex items-center gap-2">Liste des affiliés ({affiliates.length})</h2>
             <button onClick={fetchAffiliates} className="text-slate-400 hover:text-white p-2 bg-white/5 rounded-full"><RefreshCw className="w-4 h-4" /></button>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead>
                 <tr className="bg-black/40 border-b border-white/10">
                   <th className="p-4 font-bold text-slate-400 font-mono tracking-widest text-[10px] uppercase min-w-[150px]">Affilié</th>
                   <th className="p-4 font-bold text-slate-400 font-mono tracking-widest text-[10px] uppercase">Code (Lien)</th>
                   <th className="p-4 font-bold text-slate-400 font-mono tracking-widest text-[10px] uppercase text-center">Clics</th>
                   <th className="p-4 font-bold text-slate-400 font-mono tracking-widest text-[10px] uppercase text-center">Conv.</th>
                   <th className="p-4 font-bold text-slate-400 font-mono tracking-widest text-[10px] uppercase text-right">Gains Attendus</th>
                   <th className="p-4 font-bold text-slate-400 font-mono tracking-widest text-[10px] uppercase text-center">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {affiliates.length === 0 ? (
                    <tr><td colSpan={6} className="text-center p-8 opacity-50">Aucun affilié</td></tr>
                 ) : (
                   affiliates.map(a => (
                     <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                       <td className="p-4">
                         <div className="font-bold">{a.name}</div>
                         <div className="text-[10px] text-slate-500 font-mono">{a.email}</div>
                       </td>
                       <td className="p-4 font-mono font-bold text-emerald-400">?ref={a.code}</td>
                       <td className="p-4 text-center font-bold">{a.clicks}</td>
                       <td className="p-4 text-center font-bold text-emerald-400">{a.conversions}</td>
                       <td className="p-4 text-right">
                         <div className="font-bold font-mono text-amber-400">{(a.earnings_pending || 0).toFixed(2)}€</div>
                         <div className="text-[10px] text-slate-500 font-mono">Total paid: {(a.earnings_total || 0).toFixed(2)}€</div>
                       </td>
                       <td className="p-4 flex justify-center pt-5">
                         <button onClick={() => handlePay(a.id, parseFloat(a.earnings_pending))} disabled={parseFloat(a.earnings_pending) <= 0} className="bg-emerald-500/20 disabled:bg-white/5 disabled:text-slate-500 text-emerald-400 px-3 py-1.5 rounded-md font-bold text-xs flex items-center gap-1 transition-all">
                           <CheckCircle className="w-3 h-3" /> Payer
                         </button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
}
