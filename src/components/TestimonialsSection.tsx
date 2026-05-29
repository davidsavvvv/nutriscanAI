import { Star } from "lucide-react";
import { motion } from "motion/react";

export function TestimonialsSection() {
  const testimonials = [
    { name: "Marc T.", r: "A perdu 12kg", rating: 5, t: "Un électrochoc esthétique", desc: "NutriScan m'a ouvert les yeux sur les sucres cachés dans mes produits 'sains'. La prise de conscience a été brutale, mais les résultats sont là. Moins 12 kilos sans régime strict, juste en mangeant intelligemment." },
    { name: "Dr. Sarah L.", r: "Endocrinologue", rating: 5, t: "Un outil clinique redoutable", desc: "Je recommande NutriScan à mes patients insulinorésistants. L'application lit derrière les étiquettes complexes et pointe les édulcorants de synthèse en rouge. Une transparence rare." },
    { name: "Élise R.", r: "Mère de 3 enfants", rating: 5, t: "Je ne me fais plus avoir", desc: "Je pensais bien nourrir mes enfants jusqu'à ce que je scanne leurs goûters préférés. Le choc ! Aujourd'hui, je sais exactement ce qu'ils avalent. C'est sécurisant." },
    { name: "Jonathan B.", r: "Sportif de force", rating: 5, t: "Mes macros à la perfection", desc: "J'en avais marre de passer 45 minutes par jour sur d'autres applications lourdes. Une photo de l'assiette et j'ai mes protéines. C'est l'avenir du tracking." },
    { name: "Nadia B.", r: "Sensible au gluten", rating: 5, t: "L'application m'a sauvé", desc: "L'IA a détecté des traces d'extrait d'orge dans une barre de fitness 'sans gluten' que j'allais acheter. Impressionnant d'efficacité." },
    { name: "Thomas C.", r: "Pré-diabétique", rating: 5, t: "Ma glycémie est enfin stable", desc: "Je scanne absolument tout. L'application m'alerte sur les index glycémiques explosifs. Mon médecin n'en revient pas des changements." }
  ];

  return (
    <section id="testimonials" className="py-32 bg-[#050505] border-t border-[#202020]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs text-[#00FF88] font-bold font-mono uppercase tracking-widest pl-1">Rejoins les 20%</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display mt-4 text-white">
            Ils ont arrêté de manger à l'aveugle.
          </h2>
        </div>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
          {testimonials.map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-[#0f0f0f] border border-[#222] p-8 rounded-[32px] space-y-6 relative overflow-hidden group hover:border-[#00FF88]/30 transition-colors min-w-[280px] w-[85vw] sm:w-[400px] md:w-auto shrink-0 snap-center"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00FF88]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-1">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#00FF88] fill-[#00FF88]" />
                ))}
              </div>
              <h4 className="text-lg font-extrabold text-white">"{item.t}"</h4>
              <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-[#222] pl-4">"{item.desc}"</p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-[#222]">
                <div className="h-10 w-10 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center font-bold text-xs text-[#00FF88] uppercase">
                  {item.name[0]}
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">{item.name}</span>
                  <span className="text-xs text-[#00FF88]/70 font-mono">{item.r}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex md:hidden justify-center gap-2 mt-4 pb-4">
          <div className="w-2 h-2 rounded-full bg-[#00FF88]"></div>
          <div className="w-2 h-2 rounded-full bg-[#333]"></div>
          <div className="w-2 h-2 rounded-full bg-[#333]"></div>
        </div>

      </div>
    </section>
  );
}
