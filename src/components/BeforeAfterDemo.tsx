import { ArrowRight, Check, X } from "lucide-react";
import { motion } from "motion/react";

export function BeforeAfterDemo() {
  return (
    <section className="py-24 bg-[#0a0a0a] border-t border-[#202020] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display text-white transition-all">
            Scannez. Découvrez. <br/> Transformez votre alimentation. 🔍
          </h2>
          <p className="text-slate-400 text-sm">
            Notre IA analyse chimiquement vos aliments d'un simple coup d'œil.
          </p>
        </motion.div>

        <div className="space-y-16">
          {/* EXAMPLE 1: Coca-Cola */}
          <div className="flex flex-col md:flex-row items-center gap-8 justify-center group">
            {/* Before */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-1/3 bg-[#111] p-6 rounded-[28px] border border-[#2a2a2a] relative transition-transform transform md:group-hover:-translate-x-2 duration-500"
            >
              <span className="absolute top-4 left-6 text-[10px] font-mono font-bold text-slate-500 uppercase">Avant</span>
              <div className="mt-6 aspect-square w-full rounded-2xl bg-[#1c1c1c] flex items-center justify-center border border-[#232323] overflow-hidden relative">
                {/* Photo mock */}
                <div className="text-center">
                  <div className="text-7xl mb-2">🥤</div>
                  <span className="text-xs text-slate-500 font-bold">Canette Rouge (Standard)</span>
                </div>
              </div>
            </motion.div>

            {/* Arrow & Scanner Effect */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex flex-col items-center justify-center relative"
            >
               <div className="absolute inset-0 bg-[#00d4aa] blur-[40px] opacity-20 rounded-full w-20 h-20"></div>
               <ArrowRight className="w-8 h-8 text-[#00d4aa] animate-pulse relative z-10" />
               <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#00d4aa] to-transparent h-40 animate-pulse delay-75"></div>
            </motion.div>

            {/* After */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full md:w-1/3 bg-[#0d0d0d] p-6 rounded-[28px] border border-rose-900/30 relative transition-transform transform md:group-hover:translate-x-2 duration-500 shadow-[0_0_30px_rgba(225,29,72,0.05)]"
            >
              <span className="absolute top-4 left-6 text-[10px] font-mono font-bold text-[#00d4aa] uppercase tracking-widest">Apres (NutriScan)</span>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-rose-950">
                  <span className="text-xs font-bold text-slate-400">Score Santé</span>
                  <span className="text-xs font-black text-rose-500 bg-rose-950/50 px-2 py-1 rounded">🔴 1/5</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-[#222]">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold text-xs">Energie</span>
                    <p className="font-mono text-[13px] font-bold text-white mt-1">⚡ 42 kcal/100ml</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold text-xs">Sucres</span>
                    <p className="font-mono text-[13px] font-bold text-white mt-1">🍬 10.6 g</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-rose-400">Ultra-transformé</span>
                </div>

                <div className="bg-rose-950/20 border border-rose-900/30 p-3 rounded-xl flex items-start gap-3">
                  <span className="text-2xl mt-1">😔</span>
                  <p className="text-[11px] text-rose-200 font-medium italic leading-relaxed">
                    "Tu viens de scanner du sirop coloré... ton pancréas te déteste déjà 😬"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* EXAMPLE 2: Chips */}
          <div className="flex flex-col md:flex-row items-center gap-8 justify-center group">
            {/* Before */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-1/3 bg-[#111] p-6 rounded-[28px] border border-[#2a2a2a] relative transition-transform transform md:group-hover:-translate-x-2 duration-500"
            >
              <span className="absolute top-4 left-6 text-[10px] font-mono font-bold text-slate-500 uppercase">Avant</span>
              <div className="mt-6 aspect-square w-full rounded-2xl bg-[#1c1c1c] flex items-center justify-center border border-[#232323] overflow-hidden relative">
                <div className="text-center">
                  <div className="text-7xl mb-2">🥔</div>
                  <span className="text-xs text-slate-500 font-bold">Sachet Jaune (Chips)</span>
                </div>
              </div>
            </motion.div>

            {/* Arrow & Scanner Effect */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex flex-col items-center justify-center relative"
            >
               <div className="absolute inset-0 bg-[#00d4aa] blur-[40px] opacity-20 rounded-full w-20 h-20"></div>
               <ArrowRight className="w-8 h-8 text-[#00d4aa] animate-pulse relative z-10" />
               <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#00d4aa] to-transparent h-40 animate-pulse delay-75"></div>
            </motion.div>

            {/* After */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full md:w-1/3 bg-[#0d0d0d] p-6 rounded-[28px] border border-orange-900/30 relative transition-transform transform md:group-hover:translate-x-2 duration-500 shadow-[0_0_30px_rgba(249,115,22,0.05)]"
            >
              <span className="absolute top-4 left-6 text-[10px] font-mono font-bold text-[#00d4aa] uppercase tracking-widest">Apres (NutriScan)</span>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-orange-950">
                  <span className="text-xs font-bold text-slate-400">Score Santé</span>
                  <span className="text-xs font-black text-orange-500 bg-orange-950/50 px-2 py-1 rounded">🟠 2/5</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-[#222]">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold text-xs">Energie</span>
                    <p className="font-mono text-[13px] font-bold text-white mt-1">⚡ 536 kcal/100g</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold text-xs">Sel</span>
                    <p className="font-mono text-[13px] font-bold text-white mt-1">🧂 1.5 g</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-orange-400">Ultra-transformé</span>
                </div>

                <div className="bg-orange-950/20 border border-orange-900/30 p-3 rounded-xl flex items-start gap-3">
                  <span className="text-2xl mt-1">😅</span>
                  <p className="text-[11px] text-orange-200 font-medium italic leading-relaxed">
                    "Croustillant pour les papilles, moins croustillant pour les artères 😅"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* EXAMPLE 3: Poulet */}
          <div className="flex flex-col md:flex-row items-center gap-8 justify-center group">
            {/* Before */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-1/3 bg-[#111] p-6 rounded-[28px] border border-[#2a2a2a] relative transition-transform transform md:group-hover:-translate-x-2 duration-500"
            >
              <span className="absolute top-4 left-6 text-[10px] font-mono font-bold text-slate-500 uppercase">Avant</span>
              <div className="mt-6 aspect-square w-full rounded-2xl bg-[#1c1c1c] flex items-center justify-center border border-[#232323] overflow-hidden relative">
                <div className="text-center">
                  <div className="text-7xl mb-2">🍗</div>
                  <span className="text-xs text-slate-500 font-bold">Blanc de poulet</span>
                </div>
              </div>
            </motion.div>

            {/* Arrow & Scanner Effect */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex flex-col items-center justify-center relative"
            >
               <div className="absolute inset-0 bg-[#00d4aa] blur-[40px] opacity-20 rounded-full w-20 h-20"></div>
               <ArrowRight className="w-8 h-8 text-[#00d4aa] animate-pulse relative z-10" />
               <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#00d4aa] to-transparent h-40 animate-pulse delay-100"></div>
            </motion.div>

            {/* After */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full md:w-1/3 bg-[#0d0d0d] p-6 rounded-[28px] border border-[#059669]/30 relative transition-transform transform md:group-hover:translate-x-2 duration-500 shadow-[0_0_30px_rgba(5,150,105,0.05)]"
            >
              <span className="absolute top-4 left-6 text-[10px] font-mono font-bold text-[#00d4aa] uppercase tracking-widest">Apres (NutriScan)</span>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-emerald-950">
                  <span className="text-xs font-bold text-slate-400">Score Santé</span>
                  <span className="text-xs font-black text-emerald-500 bg-emerald-950/50 px-2 py-1 rounded">🟢 5/5</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-[#222]">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold text-xs">Energie</span>
                    <p className="font-mono text-[13px] font-bold text-white mt-1">⚡ 110 kcal/100g</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold text-xs">Protéines</span>
                    <p className="font-mono text-[13px] font-bold text-white mt-1">💪 23 g</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-400">Peu transformé</span>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl flex items-start gap-3">
                  <span className="text-2xl mt-1">😎</span>
                  <p className="text-[11px] text-emerald-200 font-medium italic leading-relaxed">
                    "Ton futur six-pack vient de sourire ! 🏆"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* HOW IT WORKS STEPS */}
        <div className="mt-32 border-t border-[#222] pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4 bg-[#141414] p-8 rounded-3xl border border-[#252525] hover:border-[#00d4aa] transition-colors duration-300"
            >
              <div className="text-4xl">📸</div>
              <h3 className="text-lg font-extrabold text-white">1. Prends en photo</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Pointe ton téléphone vers n'importe quel aliment ou étiquette nutritionnelle.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-4 bg-[#141414] p-8 rounded-3xl border border-[#252525] hover:border-[#00d4aa] transition-colors duration-300"
            >
              <div className="text-4xl">🤖</div>
              <h3 className="text-lg font-extrabold text-white">2. L'IA analyse</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Notre IA détecte instantanément tous les nutriments, additifs et le niveau de transformation.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-4 bg-[#141414] p-8 rounded-3xl border border-[#252525] hover:border-[#00d4aa] transition-colors duration-300"
            >
              <div className="text-4xl">💡</div>
              <h3 className="text-lg font-extrabold text-white">3. Découvre tout</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Calories, vitamines, bienfaits, dangers et conseils personnalisés en français.</p>
            </motion.div>
          </div>
        </div>

      </div>

      {/* TRUST BANNER */}
      <div className="bg-gradient-to-r from-[#059669] to-[#00d4aa] mt-24 py-4 w-full text-black overflow-hidden relative shadow-[0_0_20px_rgb(0,212,170,0.3)]">
        <div className="flex items-center justify-center space-x-6 font-extrabold text-[11px] md:text-sm uppercase tracking-widest text-center px-4 flex-wrap gap-y-2">
          <span>✅ Base de données Open Food Facts</span>
          <span className="hidden md:inline">•</span>
          <span>✅ Table Ciqual officielle française</span>
          <span className="hidden md:inline">•</span>
          <span>✅ 3 millions de produits reconnus</span>
          <span className="hidden md:inline">•</span>
          <span>✅ Données mises à jour en temps réel</span>
        </div>
      </div>
    </section>
  );
}
