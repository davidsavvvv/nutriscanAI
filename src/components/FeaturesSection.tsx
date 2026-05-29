import { Layers, ScanBarcode, Beaker, Target, Droplet, Store } from "lucide-react";
import { motion } from "motion/react";

export function FeaturesSection() {
  const features = [
    { 
      t: "Reconnaissance Visuelle Instantanée", 
      desc: "Prends ton assiette en photo. L'IA identifie chaque ingrédient, estime les poids et calcule tout instantanément avec une précision redoutable.",
      icon: <Layers className="w-6 h-6" />
    },
    { 
      t: "Analyse Code-barres Mondiale", 
      desc: "Accède à une base de données de plus de 10 millions de produits. Supermarchés, compléments sportifs, tout est analysé.",
      icon: <ScanBarcode className="w-6 h-6" />
    },
    { 
      t: "Traque des Additifs Toxiques", 
      desc: "Édulcorants artificiels, épaississants inflammatoires, perturbateurs endocriniens. Ce que les industriels cachent, l'IA te le montre.",
      icon: <Beaker className="w-6 h-6" />
    },
    { 
      t: "Objectifs Sur-Mesure", 
      desc: "Perte de poids, prise de masse ou santé globale. Tes calories et macros s'ajustent automatiquement à ton métabolisme.",
      icon: <Target className="w-6 h-6" />
    },
    { 
      t: "Suivi d'Hydratation Intelligent", 
      desc: "Ne laisse plus ton corps s'assécher. Un suivi simple pour maintenir tes cellules et ton métabolisme au top.",
      icon: <Droplet className="w-6 h-6" />
    },
    { 
      t: "Scanner de Menu au Restaurant", 
      desc: "Prends la carte en photo. L'IA te suggère les plats les plus sains en fonction de tes objectifs et intolérances.",
      icon: <Store className="w-6 h-6" />
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-[#050505] to-[#0a0a0a] border-t border-[#202020]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs text-[#00FF88] font-bold font-mono uppercase tracking-widest bg-[#00FF88]/10 border border-[#00FF88]/20 px-4 py-1.5 rounded-full">
            La vérité nutritionnelle absolue
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white mt-4">
            L'outil que l'industrie agroalimentaire redoute.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mt-4">
            Ne te fie plus aux emballages marketing. Notre IA décompose la réalité chimique et nutritionnelle de chaque aliment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-[#111] border border-[#222] p-8 rounded-[28px] hover:border-[#00FF88]/50 transition-colors group"
            >
              <div className="h-12 w-12 rounded-2xl bg-[#00FF88]/10 flex items-center justify-center text-[#00FF88] mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h4 className="text-lg font-extrabold text-white mb-3">{item.t}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
