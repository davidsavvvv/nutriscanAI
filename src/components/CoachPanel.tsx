import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, Activity, Heart, Lightbulb, Loader2, Camera, ShieldCheck, Check, Search } from "lucide-react";
import { ScanResult, SelfieEntry } from "../types";
import confetti from "canvas-confetti";

// Maximum image dimension for base64 storage
const MAX_IMG_DIMENSION = 600;

interface CoachPanelProps {
  history: ScanResult[];
}

export default function CoachPanel({ history }: CoachPanelProps) {
  const [profile, setProfile] = useState<any>(null);
  const [imc, setImc] = useState<number>(0);
  const [dailyCalories, setDailyCalories] = useState<number>(2000);
  const [dailyProteins, setDailyProteins] = useState<number>(150);
  const [tips, setTips] = useState<{ nutrition: string; activity: string; tip: string; fetchedAt: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Selfie State
  const [selfies, setSelfies] = useState<SelfieEntry[]>([]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Load profile
    const storedProfile = localStorage.getItem("ns_profile_active");
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      setProfile(parsed);

      // BMI calculation: weight / (height/100)^2
      const weight = parseFloat(parsed.weight);
      const height = parseFloat(parsed.height);
      const age = parseFloat(parsed.age);
      const isMale = parsed.sex === "Homme";

      let calculatedImc = 0;
      if (weight && height) {
        calculatedImc = weight / Math.pow(height / 100, 2);
        setImc(calculatedImc);
      }

      // Daily Calorie Target (Mifflin-St Jeor)
      if (weight && height && age) {
        let bmr = (10 * weight) + (6.25 * height) - (5 * age) + (isMale ? 5 : -161);
        
        // Activity multiplier
        let activityMultiplier = 1.2; // Sedentary
        const lvl = parsed.activityLevel?.toLowerCase() || "";
        if (lvl.includes("légère")) activityMultiplier = 1.375;
        else if (lvl.includes("modérée")) activityMultiplier = 1.55;
        else if (lvl.includes("intense")) activityMultiplier = 1.725;
        
        let targetCals = bmr * activityMultiplier;

        // Goal adjustment
        const goalStr = (parsed.goals?.join(" ") + " " + parsed.challenge).toLowerCase();
        if (goalStr.includes("perdre du poids") || goalStr.includes("mincir")) {
          targetCals *= 0.85; // 15% deficit
        } else if (goalStr.includes("prise de masse") || goalStr.includes("muscle")) {
          targetCals *= 1.1; // 10% surplus
        }

        setDailyCalories(Math.round(targetCals));
        setDailyProteins(Math.round((targetCals * 0.25) / 4)); // 25% of calories from protein
      }
    }

    // Load tips from local storage if valid for today
    const storedTips = localStorage.getItem("ns_coach_tips");
    if (storedTips) {
      const parsedTips = JSON.parse(storedTips);
      const today = new Date().toISOString().split('T')[0];
      if (parsedTips.fetchedAt && parsedTips.fetchedAt.startsWith(today)) {
        setTips(parsedTips);
      }
    }

    // Load selfies
    const storedSelfies = localStorage.getItem("ns_selfies");
    if (storedSelfies) {
      setSelfies(JSON.parse(storedSelfies));
    }
  }, []);

  useEffect(() => {
    // Auto-fetch if no tips and profile is loaded
    if (profile && !tips && !loading) {
      fetchNewTips();
    }
  }, [profile, tips]);

  const fetchNewTips = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const resp = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: { ...profile, imc: imc.toFixed(1) } })
      });
      if (resp.ok) {
        const data = await resp.json();
        const tipsData = { ...data, fetchedAt: new Date().toISOString() };
        setTips(tipsData);
        localStorage.setItem("ns_coach_tips", JSON.stringify(tipsData));
      } else {
        console.error("Failed to fetch tips");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setIsUploading(true);

    try {
      // Downscale image
      const resizedBase64 = await resizeImage(file);
      
      const resp = await fetch("/api/coach-selfie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: resizedBase64,
          mimeType: "image/jpeg",
          profile: { ...profile, imc: imc.toFixed(1) }
        })
      });

      if (!resp.ok) throw new Error("Failed to analyze selfie");

      const data = await resp.json();
      
      const previousScore = selfies.length > 0 ? selfies[0].octopusScore : 0;
      if (data.octopusScore > previousScore) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00FF88', '#00d4aa', '#ffffff']
        });
      }

      const newEntry: SelfieEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        weight: profile.weight,
        imageUrl: resizedBase64,
        message: data.message,
        tips: data.tips || [],
        level: data.level,
        octopusScore: data.octopusScore
      };

      const updatedSelfies = [newEntry, ...selfies];
      setSelfies(updatedSelfies);
      localStorage.setItem("ns_selfies", JSON.stringify(updatedSelfies));

    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'analyse. Veuillez réessayer.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_IMG_DIMENSION) {
              height = Math.round((height *= MAX_IMG_DIMENSION / width));
              width = MAX_IMG_DIMENSION;
            }
          } else {
            if (height > MAX_IMG_DIMENSION) {
              width = Math.round((width *= MAX_IMG_DIMENSION / height));
              height = MAX_IMG_DIMENSION;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const getOctopusFace = (score: number) => {
    switch (score) {
      case 1: return "😢";
      case 2: return "😟";
      case 3: return "😐";
      case 4: return "💪";
      case 5: return "🏆";
      default: return "🐙";
    }
  };

  const latestSelfie = selfies[0];
  const firstSelfie = selfies[selfies.length - 1];
  const weightDiff = firstSelfie && latestSelfie && firstSelfie.id !== latestSelfie.id
    ? parseFloat(latestSelfie.weight) - parseFloat(firstSelfie.weight)
    : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayScans = history.filter(item => item.scannedAt && item.scannedAt.startsWith(todayStr));
  const consumedCalories = todayScans.reduce((sum, item) => sum + (parseFloat(item.calories) || 0), 0);
  const consumedProteins = todayScans.reduce((sum, item) => sum + (parseFloat(item.protein) || 0), 0);

  // Default SVG for octopus until image is ready
  const OctopusAvatar = () => (
    <div className="w-[180px] h-[180px] relative mx-auto my-6 animate-bounce" style={{ animationDuration: '3s' }}>
      {/* Assuming user will drop coach-octopus.png here */}
      <img 
        src="/assets/coach-octopus.png" 
        alt="Coach Octopus" 
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback to SVG if image not found
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <svg className="w-full h-full text-[#00FF88] hidden" viewBox="0 0 100 100" fill="currentColor">
        {imc < 18.5 ? (
          // Thin worried octopus
          <path d="M50 10 c-15 0 -25 15 -25 35 c0 5 2 10 5 15 l-10 20 c-2 4 4 6 6 2 l5 -15 c5 3 12 5 19 5 s14 -2 19 -5 l5 15 c2 4 8 2 6 -2 l-10 -20 c3 -5 5 -10 5 -15 c0 -20 -10 -35 -25 -35 z m-10 25 a3 3 0 1 1 0 6 a3 3 0 1 1 0 -6 m20 0 a3 3 0 1 1 0 6 a3 3 0 1 1 0 -6 m-10 15 a5 3 0 0 1 -5 3 h10 a5 3 0 0 1 -5 -3 z" />
        ) : imc < 25 ? (
          // Athletic 💪
          <path d="M50 15 c-20 0 -30 15 -30 35 c0 5 2 10 5 15 l-15 25 c-3 5 5 8 8 3 l10 -20 c6 4 14 6 22 6 s16 -2 22 -6 l10 20 c3 5 11 2 8 -3 l-15 -25 c3 -5 5 -10 5 -15 c0 -20 -10 -35 -30 -35 z m-12 20 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8 m24 0 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8 m-12 15 c-4 0 -8 -2 -10 -5 c2 3 6 4 10 4 s8 -1 10 -4 c-2 3 -6 5 -10 5 z" />
        ) : imc < 30 ? (
          // Average motivated
          <path d="M50 15 c-25 0 -35 15 -35 35 c0 6 3 12 6 15 l-12 25 c-3 6 5 8 8 2 l10 -18 c8 4 17 6 23 6 s15 -2 23 -6 l10 18 c3 6 11 4 8 -2 l-12 -25 c3 -3 6 -9 6 -15 c0 -20 -10 -35 -35 -35 z m-14 22 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8 m28 0 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8 m-14 18 c-5 0 -10 -2 -14 -6 c3 4 8 5 14 5 s11 -1 14 -5 c-4 4 -9 6 -14 6 z" />
        ) : imc < 35 ? (
          // Chubby friendly
          <path d="M50 20 c-30 0 -40 20 -40 40 c0 6 3 12 6 18 l-15 20 c-4 5 4 10 8 5 l12 -20 c10 5 20 8 29 8 s19 -3 29 -8 l12 20 c4 5 12 0 8 -5 l-15 -20 c3 -6 6 -12 6 -18 c0 -20 -10 -40 -40 -40 z m-16 25 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8 m32 0 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8 m-16 15 c-5 0 -12 2 -18 6 c5 -3 11 -5 18 -5 s13 2 18 5 c-6 -4 -13 -6 -18 -6 z" />
        ) : (
          // Very chubby super motivated
          <path d="M50 20 c-35 0 -45 25 -45 45 c0 8 4 15 8 20 l-18 25 c-5 7 5 12 10 5 l15 -25 c10 6 22 10 30 10 s20 -4 30 -10 l15 25 c5 7 15 2 10 -5 l-18 -25 c4 -5 8 -12 8 -20 c0 -20 -10 -45 -45 -45 z m-18 28 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10 m36 0 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10 m-18 20 c-8 0 -15 -2 -22 -6 c6 3 14 5 22 5 s16 -2 22 -5 c-7 4 -14 6 -22 6 z" />
        )}
      </svg>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-2xl mx-auto pb-24 md:pb-0 z-[1] relative px-4 mt-8">
      
      {/* Speech Bubble */}
      <div className="relative bg-[#1a1a1a] border-[#2a2a2a] border rounded-2xl p-4 sm:p-5 text-center shadow-lg mx-auto w-fit max-w-[90%] sm:max-w-[80%]">
        <p className="text-white font-bold text-sm sm:text-base inline-block font-display animate-typing">
          Bonjour {profile?.name || ""} ! Je suis ton coach 🐙
        </p>
        {/* Tail */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-[#1a1a1a]"></div>
      </div>

      <OctopusAvatar />

      <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-[32px] space-y-5 shadow-sm">
        <h3 className="text-lg font-bold font-display text-white border-b border-[#2a2a2a] pb-3 text-center">🎯 Tes objectifs du jour {profile?.name}</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-black/40 p-3 rounded-2xl border border-[#222]">
            <span className="text-sm text-slate-300">🔥 Calories max</span>
            <span className="font-mono font-bold text-[#00FF88]">{dailyCalories} kcal</span>
          </div>
          <div className="flex justify-between items-center bg-black/40 p-3 rounded-2xl border border-[#222]">
            <span className="text-sm text-slate-300">💪 Protéines min</span>
            <span className="font-mono font-bold text-blue-400">{dailyProteins} g</span>
          </div>
          <div className="flex justify-between items-center bg-black/40 p-3 rounded-2xl border border-[#222]">
            <span className="text-sm text-slate-300">💧 Eau</span>
            <span className="font-mono font-bold text-cyan-400">2.5 L recommandé</span>
          </div>
          <div className="flex justify-between items-center bg-black/40 p-3 rounded-2xl border border-[#222]">
            <span className="text-sm text-slate-300">📸 Scans</span>
            <span className="font-mono font-bold text-purple-400">3 repas minimum</span>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-[32px] space-y-5">
        <h3 className="text-sm font-bold font-mono text-slate-400 uppercase tracking-widest text-center">Progression du jour</h3>
        
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white font-bold">🔥 {Math.round(consumedCalories)} / {dailyCalories} <span className="text-xs text-slate-500 font-normal">kcal</span></span>
              <span className="text-slate-400">Calories consommées</span>
            </div>
            <div className="h-2.5 w-full bg-[#111] rounded-full overflow-hidden">
              <div className="h-full bg-[#00FF88] rounded-full transition-all duration-1000" style={{ width: `${Math.min((consumedCalories / dailyCalories) * 100, 100)}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white font-bold">💪 {consumedProteins.toFixed(1)} / {dailyProteins} <span className="text-xs text-slate-500 font-normal">g</span></span>
              <span className="text-slate-400">Protéines consommées</span>
            </div>
            <div className="h-2.5 w-full bg-[#111] rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min((consumedProteins / dailyProteins) * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-display text-white">Message du Coach</h3>
          <button 
            onClick={fetchNewTips}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-[#00FF88] bg-[#00FF88]/10 px-3 py-1.5 rounded-full hover:bg-[#00FF88]/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Nouveaux conseils
          </button>
        </div>

        {loading && !tips ? (
          <div className="h-40 flex items-center justify-center bg-[#141414] rounded-3xl border border-[#2a2a2a]">
            <Loader2 className="w-8 h-8 text-[#00FF88] animate-spin" />
          </div>
        ) : tips ? (
          <div className="space-y-3">
            <div className="bg-[#141414] border border-[#2a2a2a] p-5 rounded-3xl flex gap-4">
              <div className="w-10 h-10 shrink-0 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">🥗 Nutrition du jour</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{tips.nutrition}</p>
              </div>
            </div>
            
            <div className="bg-[#141414] border border-[#2a2a2a] p-5 rounded-3xl flex gap-4">
              <div className="w-10 h-10 shrink-0 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">🏃 Activité recommandée</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{tips.activity}</p>
              </div>
            </div>

            <div className="bg-[#141414] border border-[#2a2a2a] p-5 rounded-3xl flex gap-4">
              <div className="w-10 h-10 shrink-0 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">💡 Astuce personnalisée</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{tips.tip}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-sm">
            Génération de ton programme personnalisé...
          </div>
        )}
      </div>

      {/* SELFIE SECTION */}
      <div className="space-y-6 pt-10 border-t border-[#2a2a2a] mt-8">
        <h3 className="text-xl font-bold font-display text-white border-b border-[#2a2a2a] pb-3">📸 Mon évolution</h3>

        {/* PROPOSE SELFIE / WEEKLY CHECK-IN */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#2a2a2a] p-6 rounded-[32px] text-center shadow-lg relative overflow-hidden">
          {/* Notification badge on top corner */}
          <div className="absolute top-4 right-4 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00FF88]"></span>
          </div>

          <p className="text-sm text-[#00FF88] font-bold mb-2">Check-in Hebdomadaire</p>
          <h4 className="text-lg font-bold text-white mb-4">C'est l'heure de ton check-in !</h4>
          <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto">
            Prends une photo pour que ton coach analyse ta progression visuelle et ajuste tes conseils.
          </p>

          {!privacyAccepted ? (
            <div className="bg-[#141414] border border-[#2a2a2a] p-4 rounded-2xl text-left space-y-4">
              <div className="flex gap-3 text-slate-300 text-xs leading-relaxed items-start">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Tes photos sont privées et sécurisées.</strong><br/>
                  Elles ne sont jamais partagées. Stockées uniquement dans ton espace personnel.
                </p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer group bg-black/40 p-3 rounded-xl border border-[#222] hover:border-[#00FF88]/50 transition-colors">
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${privacyAccepted ? 'bg-[#00FF88] border-[#00FF88] text-black' : 'bg-[#1a1a1a] border-slate-600 group-hover:border-slate-400'}`}>
                  <Check className={`w-3.5 h-3.5 opacity-0 ${privacyAccepted ? 'opacity-100' : ''}`} strokeWidth={3} />
                </div>
                <input type="checkbox" className="hidden" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} />
                <span className="text-[11px] text-slate-300 leading-tight">J'accepte que mon selfie soit analysé par l'IA pour personnaliser mon coaching</span>
              </label>
            </div>
          ) : isUploading ? (
            <div className="py-8 flex flex-col items-center gap-4 animate-fade-in">
              <div className="relative">
                <div className="text-5xl animate-bounce">🐙</div>
                <Search className="w-6 h-6 text-[#00FF88] absolute -right-2 -bottom-2 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-[#00FF88] animate-pulse">Ton coach analyse... 🔍</p>
            </div>
          ) : (
            <div className="animate-fade-in relative mt-2">
              <input
                type="file"
                accept="image/*"
                capture="user"
                id="selfie-upload"
                className="hidden"
                ref={fileInputRef}
                onChange={handleSelfieUpload}
              />
              <label 
                htmlFor="selfie-upload"
                className="w-full bg-[#00FF88] text-black font-extrabold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.2)] active:scale-95 transition-all cursor-pointer"
              >
                <Camera className="w-5 h-5" /> 📸 Prendre mon selfie
              </label>
            </div>
          )}
        </div>

        {/* POULPE EVOLUTION PROGRESS */}
        <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-[32px] text-center space-y-4">
          <h4 className="text-sm font-bold text-white">Ton poulpe évolue avec toi ! 🐙</h4>
          
          <div className="flex justify-between items-center px-2 py-4 relative">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[#1a1a1a] rounded-full z-0"></div>
            {[1, 2, 3, 4, 5].map((score) => {
              const currentScore = latestSelfie?.octopusScore || 3;
              const isActive = score === currentScore;
              return (
                <div key={score} className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg sm:text-2xl rounded-full transition-all duration-500 ${isActive ? 'bg-[#00FF88] scale-125 shadow-[0_0_15px_rgba(0,255,136,0.4)]' : 'bg-[#1a1a1a] opacity-40 grayscale'}`}>
                    {getOctopusFace(score)}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 italic">
            Continue comme ça, ton poulpe devient de plus en plus en forme !
          </p>
        </div>

        {/* BEFORE / AFTER SLIDER */}
        {selfies.length >= 2 && (
          <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-[32px] space-y-4">
            <h4 className="text-sm font-bold text-white text-center">Avant vs Maintenant</h4>
            <div className="flex gap-4 items-center justify-center text-center">
              <div className="space-y-2 flex-1">
                <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#2a2a2a] bg-[#1a1a1a]">
                  <img src={firstSelfie.imageUrl} className="w-full h-full object-cover" alt="Avant" />
                </div>
                <p className="text-xs text-slate-400">Début</p>
                <p className="text-sm font-bold text-white">{firstSelfie.weight} kg</p>
              </div>
              <div className="text-2xl text-slate-500">→</div>
              <div className="space-y-2 flex-1">
                <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#00FF88] bg-[#1a1a1a]">
                  <img src={latestSelfie.imageUrl} className="w-full h-full object-cover" alt="Maintenant" />
                </div>
                <p className="text-xs text-[#00FF88]">Maintenant</p>
                <p className="text-sm font-bold text-white">{latestSelfie.weight} kg</p>
              </div>
            </div>
            {weightDiff !== 0 && (
              <div className="text-center mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${weightDiff < 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {weightDiff < 0 ? `📉 ${weightDiff.toFixed(1)}kg depuis le début ! 💪` : `💪 +${weightDiff.toFixed(1)}kg de muscle !`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* TIMELINE */}
        {selfies.length > 0 && (
          <div className="space-y-6 pt-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">📅 Historique des check-ins</h4>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#00FF88] before:to-transparent">
              {selfies.map((entry, index) => {
                const dateObj = new Date(entry.date);
                const isLatest = index === 0;
                
                return (
                  <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0d0d0d] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${isLatest ? 'bg-[#00FF88] text-black shadow-[0_0_15px_rgba(0,255,136,0.3)]' : 'bg-[#1a1a1a] text-slate-400'}`}>
                      {isLatest ? <Check className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-[#141414] border border-[#2a2a2a] shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <time className="text-xs font-mono text-[#00FF88] block mb-1">
                            {dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </time>
                          <span className="text-white font-bold inline-flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-slate-400" /> {entry.weight} kg</span>
                        </div>
                        <div className="text-2xl bg-[#1a1a1a] w-10 h-10 rounded-full flex items-center justify-center border border-[#222]">
                          {getOctopusFace(entry.octopusScore)}
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden border border-[#2a2a2a]">
                          <img src={entry.imageUrl} alt="Selfie" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-xs text-slate-300 italic leading-snug">"{entry.message}"</p>
                          <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#1a1a1a] text-slate-400 border border-[#2a2a2a]">
                            Niveau: {entry.level}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
