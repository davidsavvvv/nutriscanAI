import { Camera, BrainCircuit, Activity } from "lucide-react";
import { motion } from "motion/react";

export function FeaturesSection() {
  const steps = [
    { 
      t: "1. Prends en photo", 
      desc: "Une simple photo de votre assiette, de votre menu ou du code-barres de votre produit suffit.",
      icon: <Camera className="w-6 h-6" />
    },
    { 
      t: "2. L'IA analyse", 
      desc: "Notre intelligence artificielle reconnaît les aliments, estime les portions et vérifie les listes d'ingrédients instantanément.",
      icon: <BrainCircuit className="w-6 h-6" />
    },
    { 
      t: "3. Découvre tout", 
      desc: "Obtenez vos calories, vos macros et détectez immédiatement les additifs toxiques cachés.",
      icon: <Activity className="w-6 h-6" />
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs text-emerald-500 font-bold font-mono uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full shadow-sm">
            Comment ça marche
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white mt-4">
            Trois étapes simples.
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mt-4">
            Ne te fie plus aux emballages marketing. Notre IA décompose la réalité chimique et nutritionnelle de chaque aliment en quelques secondes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Ligne de connexion pour Desktop */}
          <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent z-0"></div>

          {steps.map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:border-emerald-500/30 transition-all group relative z-10 shadow-lg"
            >
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h4 className="text-xl font-bold text-white mb-3">{item.t}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
