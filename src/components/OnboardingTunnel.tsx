import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Login } from "./Login";

interface OnboardingProps {
  onComplete: (
    goals: string[],
    sex: string,
    age: string,
    height: string,
    weight: string,
  ) => void;
  onCancel: () => void;
}

export function OnboardingTunnel({ onComplete, onCancel }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep === 3) {
      let current = 0;
      const interval = setInterval(() => {
        current += 5;
        setProgress(current);
        if (current >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentStep(4), 500);
        }
      }, 150);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const handleNext = () => setCurrentStep((s) => s + 1);

  return (
    <div className="fixed inset-0 bg-[#0B0F19] z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative min-h-[500px] flex flex-col justify-center">
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 text-slate-400 hover:text-white h-8 w-8 flex items-center justify-center rounded-full bg-white/5 font-bold"
        >
          ✕
        </button>

        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-display font-bold text-white text-center mb-8">
              Quel est votre objectif principal ?
            </h2>
            <div className="flex flex-col gap-4 max-w-md mx-auto">
              {[
                {
                  id: "🏋️ Lose weight",
                  label: "Perdre du poids 📉",
                  desc: "Brûler la graisse tout en gardant son énergie",
                },
                {
                  id: "💪 Build muscle",
                  label: "Prendre du muscle 💪",
                  desc: "Optimiser l'hypertrophie et la force",
                },
                {
                  id: "🥗 Eat healthy",
                  label: "Manger sainement 🥗",
                  desc: "Équilibre, énergie et santé optimale",
                },
              ].map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => {
                    setSelectedGoal(goal.id);
                    handleNext();
                  }}
                  className="group relative overflow-hidden bg-white/5 border border-white/10 hover:border-emerald-500/50 p-6 rounded-2xl transition-all text-left flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                      {goal.label}
                    </h3>
                    <p className="text-slate-400 text-sm font-medium">
                      {goal.desc}
                    </p>
                  </div>
                  <span className="text-2xl opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all text-emerald-400">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto text-center w-full">
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              Parlez-nous de vous
            </h2>
            <p className="text-slate-400 mb-8">
              Ces données permettent de calibrer votre métabolisme.
            </p>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="col-span-2 flex gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                <button
                  onClick={() => setSex("Male")}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${sex === "Male" ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "text-white hover:bg-white/5"}`}
                >
                  Homme
                </button>
                <button
                  onClick={() => setSex("Female")}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${sex === "Female" ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "text-white hover:bg-white/5"}`}
                >
                  Femme
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1 block pl-2">
                  Âge
                </label>
                <input
                  type="number"
                  placeholder="ex: 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-4 font-bold focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1 block pl-2">
                  Taille (cm)
                </label>
                <input
                  type="number"
                  placeholder="ex: 175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-4 font-bold focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1 block pl-2">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  placeholder="ex: 70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-4 font-bold focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-4 text-slate-400 hover:text-white font-bold transition-colors border border-white/10 rounded-xl"
              >
                Retour
              </button>
              <button
                onClick={handleNext}
                disabled={!sex || !age || !height || !weight}
                className="flex-[2] bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 disabled:opacity-50 text-black font-extrabold py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
              >
                Génération IA
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-in fade-in flex flex-col items-center justify-center py-12 text-center">
            <div className="w-32 h-32 relative mb-8">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progress) / 100}
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-display font-black text-white">
                  {progress}%
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-emerald-400 animate-pulse mb-2">
              {progress < 50
                ? "Analyse du métabolisme..."
                : "Génération des macros personnalisées..."}
            </h3>
            <p className="text-slate-400 text-sm">
              Calibration algorithmique en cours
            </p>
          </div>
        )}

        {currentStep === 4 && (
          <div className="animate-in slide-in-from-right-4 duration-500 text-center max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mb-6">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Votre profil personnalisé est prêt !
            </h2>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">
              Créez votre compte pour sauvegarder vos objectifs et débloquer vos
              5 scans gratuits.
            </p>

            <Login
              onSuccess={() =>
                onComplete([selectedGoal], sex, age, height, weight)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
