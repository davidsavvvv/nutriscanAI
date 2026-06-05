import { Star } from "lucide-react";
import { motion } from "motion/react";

export function TestimonialsSection() {
  const testimonials = [
    { name: "Dr. Sarah L.", r: "Endocrinologue", rating: 5, t: "Un outil clinique redoutable", desc: "Je recommande Scan My Macro à mes patients insulinorésistants. L'application lit derrière les étiquettes complexes et pointe les édulcorants de synthèse en rouge.", size: "large", img: "https://i.pravatar.cc/150?u=sarah" },
    { name: "Marc T.", r: "A perdu 12kg", rating: 5, t: "Moins 12 kilos sans régime", desc: "La prise de conscience a été brutale, mais les résultats sont là. Moins 12 kilos sans régime strict, juste en mangeant intelligemment après chaque scan.", size: "normal", img: "https://i.pravatar.cc/150?u=marc" },
    { name: "Élise R.", r: "Mère de 3 enfants", rating: 5, t: "Sécurisant", desc: "Je pensais bien nourrir mes enfants jusqu'à ce que je scanne leurs goûters préférés.", size: "normal", img: "https://i.pravatar.cc/150?u=elise" },
    { name: "Jonathan B.", r: "Sportif de force", rating: 5, t: "Parfait pour mes macros", desc: "Une photo de l'assiette et j'ai mes protéines. C'est l'avenir du tracking.", size: "normal", img: "https://i.pravatar.cc/150?u=jonathan" },
    { name: "Thomas C.", r: "Pré-diabétique", rating: 5, t: "Glycémie stable", desc: "L'application m'alerte sur les index glycémiques explosifs. Impressionnant.", size: "large", img: "https://i.pravatar.cc/150?u=thomas" }
  ];

  return (
    <section id="testimonials" className="py-32 bg-slate-950 border-t border-slate-900 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs text-emerald-500 font-bold font-mono uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full shadow-sm">
            Preuve Sociale
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display mt-4 text-white">
            Ils ont arrêté de manger à l'aveugle.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)] max-w-6xl mx-auto">
          {testimonials.map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className={`bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 flex flex-col justify-between group hover:border-emerald-500/30 transition-colors shadow-lg
                ${item.size === 'large' ? 'md:col-span-2 lg:col-span-2' : ''}
                ${idx === 0 ? 'lg:row-span-2' : ''}
              `}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  ))}
                </div>
                <h4 className="text-xl font-bold text-white">"{item.t}"</h4>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed italic border-l-2 border-emerald-500/30 pl-4 bg-emerald-500/5 py-2 pr-2 rounded-r-lg">"{item.desc}"</p>
              </div>
              
              <div className="flex items-center gap-4 pt-6 border-t border-slate-800/80 mt-auto">
                <img src={item.img} alt={item.name} className="h-12 w-12 rounded-full border border-slate-700 shadow-sm" />
                <div>
                  <span className="text-sm font-bold text-white block">{item.name}</span>
                  <span className="text-xs text-emerald-500 font-mono">{item.r}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
