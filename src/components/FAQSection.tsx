import { ChevronDown } from "lucide-react";

export function FAQSection() {
  const faqs = [
    { 
      q: "Comment fonctionne la reconnaissance photo ?", 
      a: "Tu prends ton repas en photo. Notre IA analyse la forme, la texture, les couleurs et même les codes barres visibles. Elle croise ensuite ces données avec notre base mondiale de 10 millions de produits pour te donner un bilan macronutritionnel en moins de 3 secondes." 
    },
    { 
      q: "Est-ce qu'il détecte vraiment les sucres cachés dans les aliments industriels ?", 
      a: "Absolument. NutriScan lit la liste des d'ingrédients ou le code-barres et met en lumière les édulcorants artificiels (Aspartame, Sucralose) ou les sirops modifiés que l'industrie utilise sous des noms complexes." 
    },
    { 
      q: "Je fais une sèche / prise de masse. Peut-il adapter les macros ?", 
      a: "Oui. Lors de ton inscription, tu définis ton objectif (perte de graisse, maintien, prise de muscles). L'application dresse une jauge dynamique de tes calories, protéines, lipides et glucides en fonction de ta métrique personnalisée." 
    },
    { 
      q: "Et si je suis intolérant au gluten ou végétalien ?", 
      a: "Parfait. Dans tes réglages, tu peux spécifier n'importe quelle restriction (sans gluten, sans lactose, végétalien). L'App affichera de grosses alertes rouges si elle détecte une trace de tes éléments interdits lors du scan." 
    },
    { 
      q: "Les données sont-elles vraiment à jour vis-à-vis des lois sanitaires ?", 
      a: "Oui. Nous exploitons en temps réel la Table Ciqual et Open Food Facts, complétées par nos propres analyses cliniques pour le marché francophone et international." 
    },
    { 
      q: "Faut-il payer pour utiliser l'app ?", 
      a: "Nous avons un plan gratuit 'Découverte' pour scanner occasionnellement. Pour ceux qui veulent un suivi calorique total et chasser les additifs dangereux quotidiennement, l'abonnement Premium est nécessaire pour couvrir les coûts serveurs colossaux de l'IA." 
    }
  ];

  return (
    <section id="faq" className="py-32 bg-black border-t border-[#222]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-20 space-y-4">
          <span className="text-[#00FF88] text-xs font-bold font-mono uppercase tracking-widest pl-1">Transparence totale</span>
          <h2 className="text-4xl font-black font-display text-white">On te dit tout.</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="bg-[#0a0a0a] border border-[#222] rounded-3xl p-6 group open:bg-[#111] open:border-[#00FF88]/30 transition-all duration-300">
              <summary className="font-bold text-base text-slate-100 cursor-pointer flex items-center justify-between select-none outline-none">
                <span className="pr-8">{faq.q}</span>
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0 group-open:bg-[#00FF88]/10 group-open:text-[#00FF88] transition-colors">
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:text-[#00FF88] group-open:rotate-180 transition-transform duration-300" />
                </div>
              </summary>
              <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-all duration-300">
                <div className="overflow-hidden">
                  <p className="text-sm text-slate-400 mt-4 leading-relaxed border-t border-[#222] pt-4 pr-12">
                    {faq.a}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>

      </div>
    </section>
  );
}
