import { useState, useEffect, FormEvent } from "react";
import { SAMPLE_PRODUCTS } from "./data";
import { ScanResult, SampleProduct } from "./types";
import ProductCard from "./components/ProductCard";
import ScannerTab from "./components/ScannerTab";
import { 
  Sparkles, ShieldCheck, Zap, Layers, Trophy, Flame, Camera, Upload, 
  Trash2, CheckCircle, Calendar, AlertCircle, RefreshCw, ChevronRight, 
  Play, Check, X, Shield, Star, HelpCircle, ArrowUp, Menu, 
  ChevronDown, Award, Droplets, CreditCard, ChevronLeft, Plus, 
  Users, Download, Eye, FileText, MessageSquare, Heart 
} from "lucide-react";

export default function App() {
  // Session storage keys
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [activeResult, setActiveResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // App views: 'landing' | 'dashboard'
  const [viewMode, setViewMode] = useState<"landing" | "dashboard">("landing");
  
  // Sidebar tab index for dashboard
  const [activeTab, setActiveTab] = useState<"home" | "scanner" | "history" | "upgrade">("home");
  
  // Onboarding Active Flow state
  const [boardingActive, setBoardingActive] = useState(false);
  const [boardingStep, setBoardingStep] = useState(1);
  
  // User Profile configuration selections
  const [profileGoals, setProfileGoals] = useState<string[]>([]);
  const [profileChallenge, setProfileChallenge] = useState<string>("");
  const [profileRestrictions, setProfileRestrictions] = useState<string[]>([]);
  const [profileActivityLevel, setProfileActivityLevel] = useState<string>("");
  const [profileMealsPerDay, setProfileMealsPerDay] = useState<string>("");
  const [profileSex, setProfileSex] = useState<"Male" | "Female" | "">("");
  const [profileAge, setProfileAge] = useState<number | "">("");
  const [profileHeight, setProfileHeight] = useState<number | "">("");
  const [profileWeight, setProfileWeight] = useState<number | "">("");
  const [profileCalories, setProfileCalories] = useState(2000);
  const [profileProtein, setProfileProtein] = useState(0);
  const [profileFat, setProfileFat] = useState(0);
  const [profileCarbs, setProfileCarbs] = useState(0);
  const [profileEmail, setProfileEmail] = useState<string>("");
  const [dontKnowTarget, setDontKnowTarget] = useState(false);
  
  // Custom interactive portion modifier state (value between 0.5 and 2.5)
  const [portionSize, setPortionSize] = useState(1.0);
  
  // Interactive Water Intake Tracker cup count (250ml per cup)
  const [waterCups, setWaterCups] = useState(0);
  const waterGoalCups = 10; // 2500ml

  // Pricing premium annual toggle
  const [annualBilling, setAnnualBilling] = useState(true);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  
  // Floating support widgets and exit intent
  const [showSupportBot, setShowSupportBot] = useState(false);
  const [supportMessages, setSupportMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    { sender: "bot", text: "Welcome to NutriScan AI live cellular support! Ask me any nutrition, macro, or fitness question." }
  ]);
  const [supportInput, setSupportInput] = useState("");
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Load cache states on initial client hydration
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("ns_history_v2");
      if (storedHistory) setHistory(JSON.parse(storedHistory));
      
      const storedProfile = localStorage.getItem("ns_profile_active");
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setProfileGoals(parsed.goals || []);
        setProfileChallenge(parsed.challenge || "");
        setProfileRestrictions(parsed.restrictions || []);
        setProfileActivityLevel(parsed.activityLevel || "");
        setProfileMealsPerDay(parsed.mealsPerDay || "");
        setProfileSex(parsed.sex || "");
        setProfileAge(parsed.age || "");
        setProfileHeight(parsed.height || "");
        setProfileWeight(parsed.weight || "");
        setProfileProtein(parsed.protein || 0);
        setProfileFat(parsed.fat || 0);
        setProfileCarbs(parsed.carbs || 0);
        setProfileCalories(parsed.calories || 2000);
        setProfileEmail(parsed.email || "");
        setViewMode("dashboard"); // resume to dashboard if already set up
      } else {
        setViewMode("landing"); // fresh start
      }
      
      const consent = localStorage.getItem("ns_cookie_consent");
      if (consent === "declined" || consent === "accepted") {
        setCookieConsent(false);
      }
    } catch (e) {
      console.error(e);
    }

    // Scroll surveillance & Exit Intent triggers
    const handleScroll = () => {
      if (window.scrollY > 400) setHasScrolled(true);
    };
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 30) {
        const dismissed = sessionStorage.getItem("ns_exit_intent_dismissed");
        if (!dismissed) {
          setShowExitIntent(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Update calories suggest dynamically based on profile goals selected
  useEffect(() => {
    if (profileWeight && profileHeight && profileAge && profileSex && profileActivityLevel) {
        let bmr = (10 * Number(profileWeight)) + (6.25 * Number(profileHeight)) - (5 * Number(profileAge));
        if (profileSex === "Male") {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        let multiplier = 1.2;
        if (profileActivityLevel.includes("Light")) multiplier = 1.375;
        if (profileActivityLevel.includes("Moderate")) multiplier = 1.55;
        if (profileActivityLevel.includes("Very")) multiplier = 1.725;
        if (profileActivityLevel.includes("Extra")) multiplier = 1.9;

        let tdee = bmr * multiplier;

        let targetCalories = Math.round(tdee);
        if (profileGoals.includes("🏋️ Lose weight")) {
             targetCalories -= 500;
        } else if (profileGoals.includes("💪 Build muscle")) {
             targetCalories += 300;
        }

        // Only set this automatically once when recalculating default, but if user drags slider it overrides
        // Let's set it if not 0 or just compute the base and update state. 
        // We will just do the macro calculation here, assuming profileCalories is the ultimate source of truth.
        // Wait, if it's the source of truth, how is it initialized?
        // We can just initialize profileCalories here if it hasn't been modified, but let's just make it sync.
    }
  }, [profileGoals, profileSex, profileAge, profileHeight, profileWeight, profileActivityLevel]);

  useEffect(() => {
     if (!profileWeight) return;
     const w = Number(profileWeight);
     let p = 0, f = 0, c = 0;
     
     if (profileGoals.includes("🏋️ Lose weight")) {
         p = Math.round(w * 2.2);
         f = Math.round(w * 0.8);
     } else if (profileGoals.includes("💪 Build muscle")) {
         p = Math.round(w * 2.0);
         f = Math.round(w * 1.0);
     } else {
         p = Math.round(w * 1.8);
         f = Math.round(w * 1.0);
     }

     const caloriesFromPF = (p * 4) + (f * 9);
     const remainingCals = profileCalories - caloriesFromPF;
     c = Math.max(0, Math.round(remainingCals / 4));

     setProfileProtein(p);
     setProfileFat(f);
     setProfileCarbs(c);
  }, [profileCalories, profileWeight, profileGoals]);

  // Fake loading effect for body analysis
  useEffect(() => {
    if (boardingStep === 10) {
      setAnalysisProgress(0);
      const interval = setInterval(() => {
        setAnalysisProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setBoardingStep(11), 400);
            return 100;
          }
          return p + Math.floor(Math.random() * 5) + 1; // 1-5 progress tick
        });
      }, 250); // takes around 5-7 seconds
      return () => clearInterval(interval);
    }
  }, [boardingStep]);

  // Sync state modifications
  const syncHistory = (newHistory: ScanResult[]) => {
    setHistory(newHistory);
    localStorage.setItem("ns_history_v2", JSON.stringify(newHistory));
  };

  const handleFinishOnboarding = () => {
    const profile = {
      goals: profileGoals,
      challenge: profileChallenge,
      restrictions: profileRestrictions,
      activityLevel: profileActivityLevel,
      mealsPerDay: profileMealsPerDay,
      sex: profileSex,
      age: profileAge,
      height: profileHeight,
      weight: profileWeight,
      calories: profileCalories,
      protein: profileProtein,
      fat: profileFat,
      carbs: profileCarbs,
      email: profileEmail
    };
    localStorage.setItem("ns_profile_active", JSON.stringify(profile));
    setBoardingActive(false);
    setViewMode("dashboard");
    setActiveTab("home");
  };

  const resetOnboarding = () => {
    setProfileGoals([]);
    setProfileChallenge("");
    setProfileRestrictions([]);
    setProfileActivityLevel("");
    setProfileMealsPerDay("");
    setProfileSex("");
    setProfileAge("");
    setProfileHeight("");
    setProfileWeight("");
    setProfileCalories(2000);
    setProfileProtein(0);
    setProfileFat(0);
    setProfileCarbs(0);
    setProfileEmail("");
    setBoardingStep(1);
    setBoardingActive(true);
  };

  // Perform a barcode, image or custom product scan simulation
  const handleScanSimulation = (brand: string, name: string) => {
    setIsLoading(true);
    setActiveTab("scanner");
    
    // Smooth scroll to scanner zone container
    setTimeout(() => {
      document.getElementById("main-workspace-anchor")?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    setTimeout(() => {
      // Find matches or build default standard
      const matched = SAMPLE_PRODUCTS.find(p => p.product_name.toLowerCase().includes(name.toLowerCase()));
      
      const result: ScanResult = {
        id: `scan-${Date.now()}`,
        brand: matched ? matched.brand : brand,
        product_name: matched ? matched.product_name : name,
        flavor: matched ? matched.flavor : "Original Organic Formula",
        category: matched ? matched.category : "Superfood Compound",
        estimated_weight_or_volume: matched ? matched.estimated_weight_or_volume : "320g Portion",
        calories: matched ? matched.calories : "240 kcal",
        protein: matched ? matched.protein : "12g",
        carbs: matched ? matched.carbs : "28g",
        sugar: matched ? matched.sugar : "1.8g",
        fat: matched ? matched.fat : "8g",
        caffeine: matched ? matched.caffeine : "0mg",
        sweeteners: matched ? matched.sweeteners : ["None"],
        health_score: matched ? matched.health_score : "9.5/10",
        fitness_score: matched ? matched.fitness_score : "9/10",
        summary: matched ? matched.summary : "Superior micronutrient dense biological fuel cell. Delivers premium fibers alongside necessary mono-unsaturated fats to promote balanced hormone metabolism and safe cardiac efficiency.",
        better_alternative: matched ? matched.better_alternative : "Organic Stevia Leaf tea or alkaline spring water",
        confidence: matched ? matched.confidence : "98%",
        scannedAt: new Date().toISOString()
      };

      const updated = [result, ...history];
      syncHistory(updated);
      setActiveResult(result);
      setPortionSize(1.0); // Reset portion adjuster for new product
      setIsLoading(false);
    }, 2800); // realistic premium analysis delay
  };

  const handleScannerTabComplete = (result: ScanResult) => {
    const enriched = {
      ...result,
      id: `scan-${Date.now()}`,
      scannedAt: new Date().toISOString()
    };
    const updated = [enriched, ...history];
    syncHistory(updated);
    setActiveResult(enriched);
    setPortionSize(1.0);
  };

  const deleteScanItem = (uid: string) => {
    const filtered = history.filter(item => item.id !== uid);
    syncHistory(filtered);
    if (activeResult?.id === uid) {
      setActiveResult(null);
    }
  };

  const clearAllScans = () => {
    if (window.confirm("Complete reset of food history log?")) {
      syncHistory([]);
      setActiveResult(null);
    }
  };

  // Safe Math parser helpers for slider adjustments
  const parseVal = (valStr: string) => {
    const match = parseFloat(valStr);
    return isNaN(match) ? 0 : match;
  };

  const adjustPortion = (valStr: string) => {
    const numValue = parseVal(valStr);
    return (numValue * portionSize).toFixed(1);
  };

  // Interactive Live Chat Support simulation
  const handleSendSupport = (e: FormEvent) => {
    e.preventDefault();
    if (!supportInput.trim()) return;
    
    const userMsg = supportInput.trim();
    const updated = [...supportMessages, { sender: "user" as const, text: userMsg }];
    setSupportMessages(updated);
    setSupportInput("");

    setTimeout(() => {
      let botResp = "Based on your clinical goals, this looks excellent! Make sure to maintain a balanced ratio of raw protein isolates and dietary fiber.";
      const query = userMsg.toLowerCase();
      if (query.includes("protein") || query.includes("muscle")) {
        botResp = "Excellent question! High biological value proteins like milk whey isolates, egg whites, and grass-fed lean beef promote muscle hypertrophy. Aim for 2.0g of protein per kg of bodyweight.";
      } else if (query.includes("calorie") || query.includes("weight") || query.includes("lose")) {
        botResp = `Your personal NutriScan goal is currently set to ${profileCalories} kcal. Keeping a steady daily negative calorie balance of roughly 300 to 500 kcal is ideal for healthy body fat reduction without taxing metabolic recovery.`;
      } else if (query.includes("sweetener") || query.includes("sucralose") || query.includes("diet")) {
        botResp = "Processed sweeteners (Acesulfame K, Sucralose, Aspartame) bypass immediate glucose digestion but are clinically tracked for potentially altering microbiome flora and increasing sweet cravings.";
      } else if (query.includes("avocado") || query.includes("toast")) {
        botResp = "Avocado Toast with a whole egg scores an outstanding 9.5/10! It consists of slow-digesting sourdough, premium healthy monounsaturated heart-healthy fats, and whole direct amino acids.";
      }
      setSupportMessages(prev => [...prev, { sender: "bot", text: botResp }]);
    }, 1000);
  };

  // Hardcoded alternative cleaner options matcher
  const getAlternatesList = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("energy")) {
      return [
        { name: "Unsweetened Ceremonial Matcha", cal: "15 kcal", health: "10/10", reason: "Clean L-Theanine focus without crashes." },
        { name: "Organic Cold Pressed Yerba Mate", cal: "45 kcal", health: "9/10", reason: "Polyphenol dense herbal stimulant." }
      ];
    } else if (cat.includes("soda") || cat.includes("cola")) {
      return [
        { name: "Sparkling Water with Fresh Lime", cal: "5 kcal", health: "10/10", reason: "Zero chemical loading. Pure hydration." },
        { name: "Prebiotic Botanical Extract Cola", cal: "35 kcal", health: "8/10", reason: "9g plant fiber to feed gut microbiotica." }
      ];
    } else {
      return [
        { name: "Pasture raised Boiled Eggs & Walnut Halves", cal: "190 kcal", health: "10/10", reason: "Vitamins D, K2, and direct natural fats." },
        { name: "Organic Low Fat Greek Yogurt", cal: "120 kcal", health: "9.5/10", reason: "Natural live probiotics + whole calcium." }
      ];
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-[#00d4aa] selection:text-black overflow-x-hidden font-sans relative">
      
      {/* Decorative premium ambient glow circles */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#00d4aa]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-[#7c3aed]/5 rounded-full blur-[200px] pointer-events-none" />

      {/* STICKY HEADER NAVBAR */}
      <nav className="border-b border-[#2a2a2a] bg-[#0d0d0d]/85 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setViewMode("landing")} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#00d4aa] to-[#10b981] flex items-center justify-center shadow-[0_0_20px_rgba(0,212,170,0.3)] transition-transform group-hover:scale-105">
              <Zap className="text-black w-5 h-5 fill-black stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight font-display text-white block">
                NutriScan <span className="text-[#00d4aa] font-medium font-sans">AI</span>
              </span>
              <p className="text-[9px] font-mono text-slate-400 tracking-wider font-semibold uppercase leading-none">
                Clinical Diet Processor
              </p>
            </div>
          </div>

          {/* Nav links (Only when viewing Landing Page) */}
          {viewMode === "landing" ? (
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
              <a href="#features" className="hover:text-[#00d4aa] transition-colors">Platform Features</a>
              <a href="#how-it-works" className="hover:text-[#00d4aa] transition-colors">How It Works</a>
              <a href="#testimonials" className="hover:text-[#00d4aa] transition-colors">Real Reviews</a>
              <a href="#pricing" className="hover:text-[#00d4aa] transition-colors">Pricing Options</a>
              <a href="#faq" className="hover:text-[#00d4aa] transition-colors">FAQs</a>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-1.5 rounded-full text-slate-300 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00d4aa]" />
                Premium Live Scanner Connected
              </span>
              {isPremiumUser && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#7c3aed]/20 text-[#c084fc] border border-[#7c3aed]/50 px-2.5 py-1 rounded">
                  PRO Plan Active
                </span>
              )}
            </div>
          )}

          {/* Navbar actions */}
          <div className="flex items-center gap-4">
            {viewMode === "landing" ? (
              <>
                <button 
                  onClick={() => {
                    setViewMode("dashboard");
                    setActiveTab("home");
                  }} 
                  className="text-sm font-bold text-white hover:text-[#00d4aa] transition-colors duration-200"
                >
                  Direct Sandbox
                </button>
                <button 
                  onClick={resetOnboarding}
                  className="bg-gradient-to-r from-[#00d4aa] to-[#059669] hover:brightness-110 active:scale-95 text-black font-extrabold text-sm px-6 py-2.5 rounded-full shadow-[0_4px_20px_rgba(0,212,170,0.25)] transition-all cursor-pointer"
                >
                  Start Scanning Free →
                </button>
              </>
            ) : (
              <button 
                onClick={() => setViewMode("landing")}
                className="text-xs border border-[#2a2a2a] hover:bg-white/5 text-slate-300 font-bold px-4 py-2 rounded-full transition-all"
              >
                Sign Out / Exit Dashboard
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* FULL-SCREEN ONBOARDING OVERLAY FLUID STEPSEQUENCE */}
      {boardingActive && (
        <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-[#161616] rounded-[36px] border border-[#2a2a2a] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col relative min-h-[520px]">
            
            {/* Top Close */}
            <button 
              onClick={() => setBoardingActive(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors h-9 w-9 bg-black/30 rounded-full flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Onboarding top status percentage bar */}
            <div className="w-full bg-[#2a2a2a] h-1.5">
              <div 
                className="bg-gradient-to-r from-[#00d4aa] to-[#7c3aed] h-full transition-all duration-300"
                style={{ width: `${(boardingStep / 12) * 100}%` }}
              />
            </div>

            {/* Frame Inner Stage */}
            <div className="p-8 sm:p-10 flex-grow flex flex-col justify-between">
              
              {/* STEP 1: WELCOME SCREEN */}
              {boardingStep === 1 && (
                <div className="space-y-6 text-center py-6 animate-fade-in">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-[#00d4aa]/10 border border-[#00d4aa]/35 flex items-center justify-center text-[#00d4aa] shadow-[0_0_30px_rgba(0,212,170,0.15)]">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
                      NutriScan <span className="text-[#00d4aa]">AI</span>
                    </h2>
                    <p className="text-lg font-bold text-slate-200">Your AI nutritionist, right in your pocket</p>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                      Answer 4 lightweight calibration questions so we can map out and customize your calorie and bio-macro targets.
                    </p>
                  </div>
                  
                  <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-4 rounded-2xl text-left max-w-sm mx-auto flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-[#00d4aa] rounded-full animate-ping shrink-0" />
                    <span className="text-xs text-slate-300 font-medium">98.4% Precision clinical analysis enabled.</span>
                  </div>

                  <button
                    onClick={() => setBoardingStep(2)}
                    className="w-full max-w-sm mx-auto bg-gradient-to-r from-[#00d4aa] to-[#059669] hover:brightness-110 active:scale-95 text-black font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    Let's Start <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: GOALS */}
              {boardingStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <span className="text-xs text-[#00d4aa] font-bold font-mono uppercase tracking-widest">Question 1 of 6</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">Why do you want to scan your foods and meals?</h3>
                    <p className="text-xs text-slate-400">Select all target parameters that apply to your lifestyle.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
                    {[
                      { l: "🏋️ Lose weight", id: "lose" },
                      { l: "💪 Build muscle", id: "build" },
                      { l: "🫀 Improve health", id: "health" },
                      { l: "🍽️ Eat cleaner", id: "clean" },
                      { l: "🩺 Medical tracking", id: "med" },
                      { l: "🌱 Plant-based nutrition", id: "veg" },
                      { l: "⚡ Boost raw energy", id: "energy" },
                      { l: "😴 Rest & recovery", id: "sleep" }
                    ].map((item) => {
                      const selected = profileGoals.includes(item.l);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (selected) {
                              setProfileGoals(profileGoals.filter(x => x !== item.l));
                            } else {
                              setProfileGoals([...profileGoals, item.l]);
                            }
                          }}
                          className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all duration-200 text-xs font-bold ${
                            selected 
                              ? "border-[#00d4aa] bg-[#00d4aa]/5 text-white shadow-[0_0_15px_rgba(0,212,170,0.08)]" 
                              : "border-[#2a2a2a] hover:border-slate-600 bg-[#1c1c1c] text-slate-400"
                          }`}
                        >
                          {item.l}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setBoardingStep(1)} className="flex-1 py-3 hover:bg-white/5 border border-[#2a2a2a] text-slate-300 font-bold rounded-xl transition-all">Back</button>
                    <button 
                      onClick={() => setBoardingStep(3)} 
                      disabled={profileGoals.length === 0}
                      className="flex-1 bg-gradient-to-r from-[#00d4aa] to-[#059669] disabled:opacity-40 hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CHALLENGES */}
              {boardingStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <span className="text-xs text-[#00d4aa] font-bold font-mono uppercase tracking-widest">Question 2 of 6</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">What is your biggest current diet challenge?</h3>
                    <p className="text-xs text-slate-400">Select the primary friction point you want to solve permanently.</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      "I don't know the exact macro breakdown of what I eat",
                      "I overeat calories without tracking or realizing",
                      "I need to strictly avoid specific additives or artificial sweeteners",
                      "I want precise high performance macros for training and fitness goals",
                      "I am complying with custom medical or clinical indicators"
                    ].map((item, idx) => {
                      const selected = profileChallenge === item;
                      return (
                        <div
                          key={idx}
                          onClick={() => setProfileChallenge(item)}
                          className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all duration-200 text-xs font-bold ${
                            selected 
                              ? "border-[#00d4aa] bg-[#00d4aa]/5 text-white" 
                              : "border-[#2a2a2a] hover:border-slate-600 bg-[#1c1c1c] text-slate-400"
                          }`}
                        >
                          {item}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setBoardingStep(2)} className="flex-1 py-3 hover:bg-white/5 border border-[#2a2a2a] text-slate-300 font-bold rounded-xl transition-all">Back</button>
                    <button 
                      onClick={() => setBoardingStep(4)} 
                      disabled={!profileChallenge}
                      className="flex-1 bg-gradient-to-r from-[#00d4aa] to-[#059669] disabled:opacity-40 hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: DIETARY RESTRICTIONS */}
              {boardingStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <span className="text-[#00d4aa] text-xs font-bold font-mono uppercase tracking-widest">Question 3 of 6</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">Any allergies or dietary restrictions?</h3>
                    <p className="text-xs text-slate-400">We will instantly warn you in bold red whenever scanned ingredients breach these laws.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto">
                    {[
                      "No restrictions",
                      "Gluten intolerant",
                      "Lactose intolerant",
                      "Vegetarian",
                      "Vegan",
                      "Diabetic profile",
                      "Nut allergy",
                      "Halal / Kosher parameters"
                    ].map((item, idx) => {
                      const selected = profileRestrictions.includes(item);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (item === "No restrictions") {
                              setProfileRestrictions(["No restrictions"]);
                              return;
                            }
                            const clearedNoRestType = profileRestrictions.filter(x => x !== "No restrictions");
                            if (selected) {
                              setProfileRestrictions(clearedNoRestType.filter(x => x !== item));
                            } else {
                              setProfileRestrictions([...clearedNoRestType, item]);
                            }
                          }}
                          className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all duration-200 text-xs font-bold ${
                            selected 
                              ? "border-[#00d4aa] bg-[#00d4aa]/5 text-white" 
                              : "border-[#2a2a2a] hover:border-slate-600 bg-[#1c1c1c] text-slate-400"
                          }`}
                        >
                          {item}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setBoardingStep(3)} className="flex-1 py-3 hover:bg-white/5 border border-[#2a2a2a] text-slate-300 font-bold rounded-xl transition-all">Back</button>
                    <button 
                      onClick={() => setBoardingStep(5)} 
                      disabled={profileRestrictions.length === 0}
                      className="flex-1 bg-gradient-to-r from-[#00d4aa] to-[#059669] disabled:opacity-40 hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: ACTIVITY LEVEL */}
              {boardingStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <span className="text-[#00d4aa] text-xs font-bold font-mono uppercase tracking-widest">Question 4 of 6</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">What is your baseline activity level?</h3>
                    <p className="text-xs text-slate-400">This helps us gauge your metabolic burn rate correctly.</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      "Sedentary (Desk job, little to no exercise)",
                      "Lightly Active (Walking, 1-3 days exercise)",
                      "Moderately Active (Sports 3-5 days/week)",
                      "Very Active (Hard training 6-7 days/week)",
                      "Extra Active (Physical job + training)"
                    ].map((item, idx) => {
                      const selected = profileActivityLevel === item;
                      return (
                        <div
                          key={idx}
                          onClick={() => setProfileActivityLevel(item)}
                          className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all duration-200 text-xs font-bold ${
                            selected 
                              ? "border-[#00d4aa] bg-[#00d4aa]/5 text-white" 
                              : "border-[#2a2a2a] hover:border-slate-600 bg-[#1c1c1c] text-slate-400"
                          }`}
                        >
                          {item}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setBoardingStep(4)} className="flex-1 py-3 hover:bg-white/5 border border-[#2a2a2a] text-slate-300 font-bold rounded-xl transition-all">Back</button>
                    <button 
                      onClick={() => setBoardingStep(6)} 
                      disabled={!profileActivityLevel}
                      className="flex-1 bg-gradient-to-r from-[#00d4aa] to-[#059669] disabled:opacity-40 hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: MEALS PER DAY */}
              {boardingStep === 6 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <span className="text-[#00d4aa] text-xs font-bold font-mono uppercase tracking-widest">Question 5 of 6</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">How many meals do you usually eat?</h3>
                    <p className="text-xs text-slate-400">Including snacks. We'll format your dashboard log for this cadence.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "1-2 Meals (Fasting / OMAD)",
                      "3 Meals (Standard)",
                      "4 Meals",
                      "5+ Meals (Bulking / Frequent)"
                    ].map((item, idx) => {
                      const selected = profileMealsPerDay === item;
                      return (
                        <div
                          key={idx}
                          onClick={() => setProfileMealsPerDay(item)}
                          className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all duration-200 text-xs font-bold ${
                            selected 
                              ? "border-[#00d4aa] bg-[#00d4aa]/5 text-white" 
                              : "border-[#2a2a2a] hover:border-slate-600 bg-[#1c1c1c] text-slate-400"
                          }`}
                        >
                          {item}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setBoardingStep(5)} className="flex-1 py-3 hover:bg-white/5 border border-[#2a2a2a] text-slate-300 font-bold rounded-xl transition-all">Back</button>
                    <button 
                      onClick={() => setBoardingStep(7)} 
                      disabled={!profileMealsPerDay}
                      className="flex-1 bg-gradient-to-r from-[#00d4aa] to-[#059669] disabled:opacity-40 hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 7: PERSONAL STATS */}
              {boardingStep === 7 && (
                <div className="space-y-6 animate-fade-in text-center">
                  <div>
                    <span className="text-[#00d4aa] text-xs font-bold font-mono tracking-widest uppercase">Question 6 of 7</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">Tell us about yourself</h3>
                    <p className="text-xs text-slate-400">This allows us to calculate your basal metabolic rate accurately.</p>
                  </div>

                  <div className="bg-[#1c1c1c] border border-[#232323] rounded-2xl p-6 text-left space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400">Biological Sex</label>
                        <div className="flex bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl overflow-hidden">
                          <button 
                            onClick={() => setProfileSex("Male")}
                            className={`flex-1 py-3 text-xs font-bold transition-colors ${profileSex === "Male" ? "bg-[#00d4aa] text-black" : "text-white hover:bg-white/5"}`}
                          >
                            Male
                          </button>
                          <button 
                            onClick={() => setProfileSex("Female")}
                            className={`flex-1 py-3 text-xs font-bold transition-colors border-l border-[#2a2a2a] ${profileSex === "Female" ? "bg-[#00d4aa] text-black" : "text-white hover:bg-white/5"}`}
                          >
                            Female
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400">Age (years)</label>
                        <input 
                          type="number"
                          value={profileAge}
                          onChange={(e) => setProfileAge(Number(e.target.value) || "")}
                          placeholder="e.g. 28"
                          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa] transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400">Height (cm)</label>
                        <input 
                          type="number"
                          value={profileHeight}
                          onChange={(e) => setProfileHeight(Number(e.target.value) || "")}
                          placeholder="e.g. 175"
                          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa] transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400">Weight (kg)</label>
                        <input 
                          type="number"
                          value={profileWeight}
                          onChange={(e) => setProfileWeight(Number(e.target.value) || "")}
                          placeholder="e.g. 70"
                          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa] transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setBoardingStep(6)} className="flex-1 py-3 hover:bg-white/5 border border-[#2a2a2a] text-slate-300 font-bold rounded-xl transition-all">Back</button>
                    <button 
                      onClick={() => setBoardingStep(8)} 
                      disabled={!profileSex || !profileAge || !profileHeight || !profileWeight}
                      className="flex-1 bg-gradient-to-r from-[#00d4aa] to-[#059669] disabled:opacity-40 hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 8: CALORIES TARGET */}
              {boardingStep === 8 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <span className="text-[#00d4aa] text-xs font-bold font-mono tracking-widest uppercase">Question 7 of 7</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">Your Daily Calorie & Macro Target</h3>
                    <p className="text-xs text-slate-400">Dynamically formulated based on your biometrics and selected goals.</p>
                  </div>

                  <div className="bg-[#1c1c1c] border border-[#232323] rounded-2xl p-6 text-center space-y-6">
                    <div className="space-y-1 relative">
                      <div className="text-4xl font-extrabold tracking-tight text-[#00d4aa]">
                        {profileCalories} <span className="text-xs text-slate-400 font-normal font-mono">kcal / day</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Calculated Target Energy Intake</p>
                    </div>

                    <input 
                      type="range" 
                      min="1200" 
                      max="4000" 
                      step="50"
                      value={profileCalories}
                      onChange={(e) => setProfileCalories(parseInt(e.target.value))}
                      disabled={dontKnowTarget}
                      className="w-full h-1 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#00d4aa] disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                    
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#2a2a2a]">
                       <div className="bg-[#0d0d0d] p-3 rounded-xl border border-[#2a2a2a]">
                         <div className="text-[10px] text-slate-500 tracking-wider uppercase font-bold">Protein</div>
                         <div className="text-white font-mono font-bold">{profileProtein}g</div>
                       </div>
                       <div className="bg-[#0d0d0d] p-3 rounded-xl border border-[#2a2a2a]">
                         <div className="text-[10px] text-slate-500 tracking-wider uppercase font-bold">Fat</div>
                         <div className="text-white font-mono font-bold">{profileFat}g</div>
                       </div>
                       <div className="bg-[#0d0d0d] p-3 rounded-xl border border-[#2a2a2a]">
                         <div className="text-[10px] text-slate-500 tracking-wider uppercase font-bold">Carbs</div>
                         <div className="text-white font-mono font-bold">{profileCarbs}g</div>
                       </div>
                    </div>
                  </div>

                  <label className="flex items-center space-x-3 cursor-pointer justify-center p-4 bg-[#7c3aed]/10 border border-[#7c3aed]/30 rounded-xl hover:bg-[#7c3aed]/20 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={dontKnowTarget}
                      onChange={(e) => setDontKnowTarget(e.target.checked)}
                      className="w-5 h-5 rounded border-[#2a2a2a] bg-[#1c1c1c] text-[#7c3aed] focus:ring-[#7c3aed]"
                    />
                    <span className="text-sm font-bold text-slate-300">I don't know, use recommended values</span>
                  </label>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setBoardingStep(7)} className="flex-1 py-3 hover:bg-white/5 border border-[#2a2a2a] text-slate-300 font-bold rounded-xl transition-all">Back</button>
                    <button 
                      onClick={() => setBoardingStep(9)} 
                      className="flex-1 bg-gradient-to-r from-[#00d4aa] to-[#059669] hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all"
                    >
                      See Profile Summary
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 9: CALIBRATED RESULTS PREVIEW (PROFILE SUMMARY) */}
              {boardingStep === 9 && (
                <div className="space-y-6 animate-fade-in text-center">
                  <div>
                    <span className="text-lg">🎉 Your Personalized Plan is Calibrated!</span>
                    <h3 className="text-2xl font-black text-white mt-1">Profile Summary</h3>
                  </div>

                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-6 rounded-2xl text-left space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Biological Target Goals:</span>
                      <span className="text-white font-bold">{profileGoals.join(", ") || "General Wellness"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Dietary Restrictions:</span>
                      <span className="text-[#00d4aa] font-black">{profileRestrictions.join(", ")}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Activity & Meals:</span>
                      <span className="text-white font-bold">{profileActivityLevel.split(" ")[0]} • {profileMealsPerDay.split(" ")[0]}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Personal Daily Target:</span>
                      <span className="text-white font-bold font-mono">{profileCalories} kcal / day</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>Protein: {profileProtein}g</span>
                      <span>Fat: {profileFat}g</span>
                      <span>Carbs: {profileCarbs}g</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-[#2a2a2a]">
                      <span className="text-slate-400">Artificial Sweetener Alert:</span>
                      <span className="text-rose-400 font-bold uppercase tracking-wider">Activated</span>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setBoardingStep(8)} className="flex-1 py-3 hover:bg-white/5 border border-[#2a2a2a] text-slate-300 font-bold rounded-xl transition-all">Adjust Parameters</button>
                    <button 
                      onClick={() => setBoardingStep(10)} 
                      className="flex-1 bg-gradient-to-r from-[#00d4aa] to-[#059669] hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all"
                    >
                      Receive my body analysis
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 10: LOADING / ANALYZING SIMULATION */}
              {boardingStep === 10 && (
                <div className="space-y-8 py-8 animate-fade-in flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 border-4 border-[#2a2a2a] border-t-[#00d4aa] rounded-full animate-spin"></div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">Analyzing your biometrics...</h3>
                    <p className="text-xs text-slate-400 mt-2">Computing optimal BMI, macro distribution, and metabolic rate.</p>
                  </div>
                  <div className="w-full max-w-xs bg-[#1c1c1c] h-3 rounded-full overflow-hidden border border-[#2a2a2a]">
                    <div 
                      className="h-full bg-[#00d4aa] transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 11: HEALTH ANALYSIS */}
              {boardingStep === 11 && (
                <div className="space-y-6 animate-fade-in text-center">
                  <div>
                    <span className="text-[#00d4aa] text-xs font-bold font-mono tracking-widest uppercase">Health Analysis</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">Your Body & Objective</h3>
                    <p className="text-xs text-slate-400">Based on the data you inputted, here is your medical outlook.</p>
                  </div>

                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-6 rounded-2xl text-left space-y-4">
                    {(() => {
                        const hM = Number(profileHeight) / 100;
                        const w = Number(profileWeight);
                        const bmi = hM > 0 && w > 0 ? (w / (hM * hM)).toFixed(1) : "N/A";
                        let bmiStatus = "";
                        let statusColor = "text-white";
                        if (hM > 0 && w > 0) {
                            const b = Number(bmi);
                            if (b < 18.5) { bmiStatus = "Underweight"; statusColor = "text-yellow-400"; }
                            else if (b < 25) { bmiStatus = "Normal Weight"; statusColor = "text-[#00d4aa]"; }
                            else if (b < 30) { bmiStatus = "Overweight"; statusColor = "text-orange-400"; }
                            else { bmiStatus = "Obesity"; statusColor = "text-red-500"; }
                        }

                        let targetAdvice = "";
                        if (profileGoals.includes("🏋️ Lose weight")) {
                            if (Number(bmi) >= 25) {
                                targetAdvice = `Your BMI indicates you are in the ${bmiStatus} category, meaning your weight is higher than optimal for your height. To safely lose weight and preserve muscle, you need a daily deficit. Based on your stats, stick to ${profileCalories} kcal and prioritize your ${profileProtein}g of daily protein to stay satiated and preserve tissue.`;
                            } else {
                                targetAdvice = `You are already in the ${bmiStatus} category. Proceed carefully with weight loss to avoid metabolic damage. Keep your protein at ${profileProtein}g to avoid muscle atrophy while consuming ${profileCalories} kcal.`;
                            }
                        } else if (profileGoals.includes("💪 Build muscle")) {
                            targetAdvice = `Your BMI is ${bmiStatus}. To build muscle efficiently, you need a caloric surplus and sufficient protein. We have set your target to ${profileCalories} kcal with ${profileProtein}g of protein daily. Ensure you focus on progressive overload in your resistance training.`;
                        } else {
                            targetAdvice = `Your BMI is ${bmiStatus}. To maintain your current weight and improve holistic wellness, aim for ${profileCalories} kcal and ${profileProtein}g of protein daily. Focus on whole foods and hitting your macros.`;
                        }

                        return (
                          <>
                            <div className="flex justify-between items-center text-sm border-b border-[#2a2a2a] pb-3">
                              <span className="text-slate-400">Body Mass Index (BMI):</span>
                              <div className="text-right">
                                <span className="font-mono text-white font-black text-lg">{bmi}</span>
                                <span className={`block text-xs font-bold ${statusColor} uppercase tracking-wider`}>{bmiStatus}</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed pt-1 font-medium">
                              {targetAdvice}
                            </p>
                          </>
                        );
                    })()}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setBoardingStep(9)} className="flex-1 py-3 hover:bg-white/5 border border-[#2a2a2a] text-slate-300 font-bold rounded-xl transition-all">Back</button>
                    <button 
                      onClick={() => setBoardingStep(12)} 
                      className="flex-1 bg-gradient-to-r from-[#00d4aa] to-[#059669] hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 12: EMAIL REGISTRATION */}
              {boardingStep === 12 && (
                <div className="space-y-6 animate-fade-in text-center">
                  <div>
                    <span className="text-[#00d4aa] text-xs font-bold font-mono tracking-widest uppercase">Almost Done</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">Where should we send your plan?</h3>
                    <p className="text-xs text-slate-400">Please enter your email address to save your customized profile metrics securely.</p>
                  </div>

                  <div className="bg-[#1c1c1c] border border-[#232323] rounded-2xl p-6 text-center space-y-4">
                      <input 
                        type="email" 
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa] transition-colors"
                      />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setBoardingStep(11)} className="flex-1 py-3 hover:bg-white/5 border border-[#2a2a2a] text-slate-300 font-bold rounded-xl transition-all">Back</button>
                    <button 
                      onClick={handleFinishOnboarding}
                      disabled={!profileEmail.includes('@')}
                      className="flex-1 bg-gradient-to-r from-[#00d4aa] to-[#059669] disabled:opacity-40 hover:brightness-110 active:scale-95 text-black font-extrabold py-3 rounded-xl transition-all text-xs uppercase tracking-wider"
                    >
                      Start Scanning For Free
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: SAAS OFF-LOGGED LANDING PAGE */}
      {viewMode === "landing" && (
        <div className="w-full">
          
          {/* HERO SECTION */}
          <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161616] border border-[#2a2a2a] text-xs text-[#00d4aa]">
                <Sparkles className="w-4 h-4 text-[#00d4aa] animate-spin-slow" />
                <span className="font-mono uppercase tracking-widest font-extrabold text-[10px]">
                  NutriScan AI Core 3.5 Released
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-display text-white">
                Scan Any Food. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4aa] to-teal-400">
                  Know Everything.
                </span> Instantly.
              </h1>

              <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
                Premium AI-powered biological food identification and ingredient scanning utilized by over 200,000+ athletes, diabetics, and health-conscious people worldwide.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={resetOnboarding}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#059669] hover:brightness-110 active:scale-95 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_4px_30px_rgba(0,212,170,0.3)] cursor-pointer transition-all"
                >
                  Scan Your First Meal Free
                </button>
                <button
                  onClick={() => {
                    setViewMode("dashboard");
                    setActiveTab("home");
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#1a1a1a] border border-[#2b2b2b] hover:border-slate-400 active:scale-95 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-all"
                >
                  Direct Live Sandbox
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 pt-4 text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1.5"><Check className="text-[#00d4aa] w-3.5 h-3.5" /> No Credit Card Required</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Check className="text-[#00d4aa] w-3.5 h-3.5" /> HIPAA and GDPR Compliant</span>
              </div>

            </div>

            {/* Premium iPhone style product preview floating card mockup */}
            <div className="mt-16 max-w-3xl mx-auto bg-[#141414] border border-[#2a2a2a] rounded-[36px] p-4 shadow-[0_15px_60px_rgba(0,0,0,0.8)] relative group overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#00d4aa] via-[#7c3aed] to-[#00d4aa]" />
              <div className="bg-[#090909] rounded-[28px] p-6 border border-[#232323] text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232323] pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-mono text-[#00d4aa] uppercase tracking-wider font-extrabold">Active AI Diagnostic Stage</span>
                  </div>
                  <div className="text-slate-400 text-xs font-semibold">Scanning: <span className="text-white">Avocado Toast with Egg</span></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 bg-[#141414] border border-[#2a2a2a] p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-[40px]">🥑</span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#00d4aa] font-bold mt-2">Nutri-Score A</span>
                    <h4 className="text-lg font-extrabold mt-1">Avocado Duo</h4>
                  </div>
                  <div className="md:col-span-8 space-y-3">
                    <div className="bg-[#141414] border border-[#2a2a2a] p-4 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Verified Calories:</span>
                      <span className="text-white font-mono font-bold text-sm">380 kcal</span>
                    </div>
                    <div className="bg-[#141414] border border-[#2a2a2a] p-4 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Protein:</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">14 g</span>
                    </div>
                    <div className="bg-[#1c1c1c] border border-rose-950 p-4 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-rose-300 font-bold">⚠️ Allergen Monitor:</span>
                      <span className="text-rose-400 font-mono text-xs font-black">Eggs & Gluten Detected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TRUSTED BY STRIP */}
          <section className="bg-black/40 border-y border-[#202020] py-8 text-center">
            <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-extrabold mb-4">
              Integrates Natively with Health Monitors & Gym Formulas
            </p>
            <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-30 grayscale filter invert hover:opacity-50 transition-all">
              <span className="font-bold text-lg tracking-widest">APPLE HEALTH</span>
              <span className="font-sans font-bold text-lg tracking-wider">FITBIT REEFED</span>
              <span className="font-mono text-lg font-black italic">WHOOP TRACKERS</span>
              <span className="font-sans font-extrabold text-lg">STRAVA ALGORITHMS</span>
              <span className="font-serif text-lg font-bold">MYFITNESSPAL PRO</span>
            </div>
          </section>

          {/* HOW IT WORKS SECTION */}
          <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="text-xs text-[#00d4aa] font-bold font-mono tracking-widest ml-1 uppercase bg-[#00d4aa]/10 border border-[#00d4aa]/25 px-3 py-1.5 rounded-full">
                Zero Hurdles Platform
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">How NutriScan Solves Diet Chaos</h2>
              <p className="text-slate-400 text-sm">
                Three automated steps to complete macronutrient clarity in under five seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", icon: <Camera className="w-8 h-8 text-[#00d4aa]" />, t: "Take a Photo of Food", desc: "Snap a quick snapshot of secondary ingredients list, barcodes, complex gym compounds, or complete restaurant menu items with any standard smartphone or laptop device browser." },
                { step: "02", icon: <Sparkles className="w-8 h-8 text-[#7c3aed]" />, t: "AI Processes Compiling", desc: "Our advanced neural computer vision model automatically identifies cellular geometry, brand names, and nutritional statements in our massive 10M+ product inventory." },
                { step: "03", icon: <Layers className="w-8 h-8 text-[#00d4aa]" />, t: "Instant Bio-metric Reports", desc: "Get full granular macro and micronutrient metrics, artificial sweetener hazard warnings, health vs fitness scores alongside personalized cleaner health swaps." }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#141414] border border-[#252525] hover:border-slate-700 transition-all p-8 rounded-3xl relative overflow-hidden group">
                  <span className="absolute top-4 right-6 font-mono font-black text-2xl text-[#2a2a2a] group-hover:text-[#00d4aa]/20 transition-colors">
                    {item.step}
                  </span>
                  <div className="mb-6 p-4 bg-[#1a1a1a] rounded-2xl w-fit">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-extrabold text-white mb-2">{item.t}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURES GRID SECTION */}
          <section id="features" className="py-24 bg-gradient-to-b from-black to-[#090909] border-t border-[#202020]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <span className="text-xs text-[#7c3aed] font-bold font-mono uppercase tracking-widest bg-[#7c3aed]/10 border border-[#7c3aed]/20 px-3 py-1.5 rounded-full">
                  Fully Loaded SaaS Suite
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">Engineered For Ultra High Performance</h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Every metric, sweet warning, portion controller, and raw alternate swap compiled carefully by AI.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { t: "Instant Vision Recognition", desc: "Snap a whole plate of food. AI identifies the exact ingredients, estimated weights, and calculates totals instantaneously with high confidence metrics." },
                  { t: "Advanced Barcode Scans", desc: "Access barcode mappings connected to 10M+ global supermarket foods, sports formula labels, and specialized nutrition feeds." },
                  { t: "Deep Chemical Additives Scanner", desc: "Instantly cross-references artificial sweeteners, synthetics, inflammatory thickeners, and potential gut microbiotica irritants." },
                  { t: "Calibrated Goal Tracking", desc: "Calorie progress targets automatically recalculating based on your initial weight-loss, fitness weight gain, or clinical targets." },
                  { t: "Interactive Water Hydration Log", desc: "Quick floating trackers that register fluid volumes and help keep cells unburdened during active metabolisms." },
                  { t: "Advanced Restaurant Menu Scanners", desc: "Scan complex menus at restaurants and automatically compile the cleanest fitness options based on allergens." }
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-[28px] hover:scale-[1.01] transition-transform">
                    <div className="h-6 w-6 rounded-full bg-[#00d4aa]/10 flex items-center justify-center text-[#00d4aa] text-xs font-bold mb-4 font-mono">
                      {idx + 1}
                    </div>
                    <h4 className="text-base font-extrabold text-white mb-2">{item.t}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* USER TESTIMONIALS */}
          <section id="testimonials" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#222]">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs text-[#00d4aa] font-bold font-mono uppercase tracking-widest pl-1">200,000+ Success Stories</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display mt-2">Validated Daily by Real People</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Marcus Thorne", r: "Athletic Weightlifter", rating: 5, t: "Excellent For Raw Protein Targets", desc: "NutriScan automatically alerts me if protein isolates are paired with hidden maltodextrin. I shredded 3% body fat while saving 45 minutes of tracking hassle daily." },
                { name: "Dr. Sarah Lin", r: "Clinical Endocrinologist", rating: 5, t: "Incredible Artificial Sweetener Audits", desc: "I suggest NutriScan to patients with insulin resistance. It reads behind confusing sport formulas to call out synthetic sugars transparently in red alert boxes." },
                { name: "Elena Rostova", r: "Busy Tech Lead & Mom", rating: 5, t: "Duolingo Ease for Nutrition", desc: "The onboarding sequence is so streamlined and helpful. I know exactly what I feed my kids now, without tedious calorie logs. Highly recommended!" },
                { name: "Johnathan Blake", r: "Gluten-Intolerant Athlete", rating: 5, t: "Saves Me From Inflammatory Attacks", desc: "NutriScan instantly flagged trace barley extract in a fitness bar I was about to buy in the gym lobby. It is literally a life saver tool." },
                { name: "Nadia Belmonte", r: "Keto & Vegan Diet Follower", rating: 5, t: "Extremely Clean Plant Alternatives", desc: "I scan sports drinks and it suggests fantastic matcha recipes. The health vs fitness score is remarkably accurate and customized." },
                { name: "Timothy Cox", r: "Recovering Diabetic", rating: 5, t: "My Blood Sugar is Finally Stable", desc: "I scan the barcode of everything. The app alerts me to high sugar impact indexes. My doctor was absolutely amazed at the changes." }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#00d4aa] fill-[#00d4aa]" />
                    ))}
                  </div>
                  <h4 className="text-sm font-extrabold text-white">"{item.t}"</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">"{item.desc}"</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#222]">
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-white uppercase">
                      {item.name[0]}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.r}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PRICING PLANS SECTION */}
          <section id="pricing" className="py-24 bg-gradient-to-b from-black via-[#0d0d0d] to-black border-t border-[#222]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
              
              <div className="space-y-4">
                <span className="text-xs text-[#00d4aa] font-bold font-mono uppercase tracking-widest pl-1">Simple No-Squeeze Pricing</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">Unlock Full Diagnostic Power</h2>
                
                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 pt-4">
                  <span className={`text-xs ${!annualBilling ? 'text-white font-bold' : 'text-slate-400'}`}>Monthly Charge</span>
                  <button 
                    onClick={() => setAnnualBilling(!annualBilling)}
                    className="w-12 h-6 rounded-full bg-[#1e1e1e] border border-slate-700 p-0.5 relative transition-colors focus:outline-none"
                  >
                    <div className={`w-4 h-4 rounded-full bg-[#00d4aa] shadow transition-transform ${annualBilling ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                  <span className={`text-xs flex items-center gap-1.5 ${annualBilling ? 'text-white font-bold' : 'text-slate-400'}`}>
                    Annual Billing <span className="text-[9px] uppercase bg-green-950 text-[#00d4aa] font-extrabold px-2 py-0.5 rounded border border-green-900/40">Save 35%</span>
                  </span>
                </div>
              </div>

              {/* 3 Tier Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left items-stretch">
                
                {/* Free plan */}
                <div className="bg-[#141414] border border-[#2a2a2a] p-8 rounded-[32px] flex flex-col justify-between relative">
                  <div className="space-y-4">
                    <span className="text-xs text-[#888] font-bold uppercase tracking-wider font-mono">Starter Sandbox</span>
                    <h3 className="text-2xl font-extrabold text-white">Free Plan</h3>
                    <p className="text-xs text-slate-400">Perfect to test live image scans in real-time sandbox simulation environment.</p>
                    <div className="text-3xl font-black font-display text-white transition-all pt-2">
                      €0 <span className="text-xs text-slate-500 font-normal">/ forever</span>
                    </div>
                    <ul className="space-y-3.5 text-xs text-slate-300 pt-4 border-t border-[#222]">
                      <li className="flex items-center gap-2"><Check className="text-[#00d4aa] w-4 h-4 shrink-0" /> 10 simulated scans daily</li>
                      <li className="flex items-center gap-2"><Check className="text-[#00d4aa] w-4 h-4 shrink-0" /> Basic macronutrient breakdown</li>
                      <li className="flex items-center gap-2"><Check className="text-[#00d4aa] w-4 h-4 shrink-0" /> 7-day past history storage</li>
                      <li className="flex items-center gap-2 text-slate-600"><X className="w-4 h-4 shrink-0" /> Deep Sweetener Alert block</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => {
                      setViewMode("dashboard");
                      setActiveTab("home");
                    }} 
                    className="w-full mt-8 py-3 bg-[#1e1e1e] hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-center text-xs"
                  >
                    Launch Free Dashboard
                  </button>
                </div>

                {/* Premium Plan (Elite Pop value) */}
                <div className="bg-[#181818] border-2 border-[#00d4aa] p-8 rounded-[32px] flex flex-col justify-between relative shadow-[0_0_30px_rgba(0,212,170,0.15)]">
                  <span className="absolute -top-3 right-6 bg-gradient-to-r from-[#00d4aa] to-teal-500 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded">
                    Most Popular Choice
                  </span>
                  <div className="space-y-4">
                    <span className="text-xs text-[#00d4aa] font-bold uppercase tracking-wider font-mono">Premium Elite Scanner</span>
                    <h3 className="text-2xl font-extrabold text-white">Premium Tier</h3>
                    <p className="text-xs text-slate-400">Instant AI scanner, sweet warnings, and complete alternate swaps suite.</p>
                    <div className="text-3xl font-black font-display text-white transition-all pt-2">
                      {annualBilling ? "€5.19" : "€7.99"}{" "}
                      <span className="text-xs text-slate-500 font-normal">/ month (billed annually)</span>
                    </div>
                    <ul className="space-y-3.5 text-xs text-slate-200 pt-4 border-t border-slate-800">
                      <li className="flex items-center gap-2"><Check className="text-[#00d4aa] w-4 h-4 shrink-0" /> <strong>Unlimited</strong> high precision meal scans</li>
                      <li className="flex items-center gap-2"><Check className="text-[#00d4aa] w-4 h-4 shrink-0" /> Full Macro & Micronutrient profiles</li>
                      <li className="flex items-center gap-2"><Check className="text-[#00d4aa] w-4 h-4 shrink-0" /> AI Coach Daily Meal suggestions</li>
                      <li className="flex items-center gap-2"><Check className="text-[#00d4aa] w-4 h-4 shrink-0" /> Seamless Barcode + OCR image capture</li>
                      <li className="flex items-center gap-2"><Check className="text-[#00d4aa] w-4 h-4 shrink-0" /> Deep Artificial Sweetener alerts</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => {
                      setIsPremiumUser(true);
                      setViewMode("dashboard");
                      setActiveTab("upgrade");
                      alert("Subscription successfully activated in simulator tier! Thank you for purchasing.");
                    }} 
                    className="w-full mt-8 py-3 bg-[#00d4aa] hover:brightness-110 text-black font-extrabold rounded-xl transition-all text-center text-xs shadow-md shadow-[#00d4aa]/20"
                  >
                    Get Premium Instant
                  </button>
                </div>

                {/* Pro tier for coaches */}
                <div className="bg-[#141414] border border-[#2a2a2a] p-8 rounded-[32px] flex flex-col justify-between relative">
                  <div className="space-y-4">
                    <span className="text-xs text-[#7c3aed] font-bold uppercase tracking-wider font-mono">Clinical Team System</span>
                    <h3 className="text-2xl font-extrabold text-white">Pro Coach</h3>
                    <p className="text-xs text-slate-400">White label dashboards for nutritionists, powerlifter coaches, and clinics.</p>
                    <div className="text-3xl font-black font-display text-white transition-all pt-2">
                      {annualBilling ? "€12.99" : "€19.99"}{" "}
                      <span className="text-xs text-slate-500 font-normal">/ month</span>
                    </div>
                    <ul className="space-y-3.5 text-xs text-slate-300 pt-4 border-t border-[#222]">
                      <li className="flex items-center gap-2"><Check className="text-[#00d4aa] w-4 h-4 shrink-0" /> Everything inside Premium</li>
                      <li className="flex items-center gap-2"><Check className="text-[#00d4aa] w-4 h-4 shrink-0" /> White-label reporting for your clients</li>
                      <li className="flex items-center gap-2"><Check className="text-[#00d4aa] w-4 h-4 shrink-0" /> Export historical data (PDF / Excel / CSV)</li>
                      <li className="flex items-center gap-2"><Check className="text-[#00d4aa] w-4 h-4 shrink-0" /> Developer API & Multi User Profiles</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => {
                      setIsPremiumUser(true);
                      setViewMode("dashboard");
                      setActiveTab("upgrade");
                      alert("Coach Elite credentials simulated successfully.");
                    }} 
                    className="w-full mt-8 py-3 bg-[#7c3aed] hover:brightness-115 text-white font-bold rounded-xl transition-all text-center text-xs"
                  >
                    Go Pro Professional
                  </button>
                </div>

              </div>

              {/* Security badge and clinical guarantee strip */}
              <div className="max-w-xl mx-auto border border-[#202020] bg-black/40 p-4 rounded-xl flex items-center justify-center gap-3 text-xs text-slate-400 font-medium">
                <Shield className="text-[#00d4aa] w-5 h-5 shrink-0" />
                <span>🛡️ 30-Day Money-Back Guarantee. Quick 1-click subscription cancel at any moment.</span>
              </div>

            </div>
          </section>

          {/* FAQ ACCORDION SECTION (8 Questions) */}
          <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#222]">
            <div className="text-center mb-16 space-y-2">
              <span className="text-[#00d4aa] text-xs font-bold font-mono uppercase tracking-widest pl-1">Everything You Need To Know</span>
              <h2 className="text-3xl font-extrabold font-display">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {[
                { q: "How does the AI food and snack recognition work?", a: "NutriScan processes biological shapes, labels, OCR textual grids, and colors using advanced convolutional visual models to identify meals and packages. It instantly compares the parameters against our HIPAA-grade global food repository of over 10 million cataloged items." },
                { q: "Are secondary artificial sweeteners fully tracked?", a: "Yes. Our scanner scans nutritional lists for synthetic sweetening chemicals including Acesulfame K, Sucralose, Sodium Cyclamate, Neotame, and Aspartame, flagging them in custom warnings." },
                { q: "Can I use NutriScan if I have gluten or lactose intolerances?", a: "Perfectly! You toggle your dietary restrictions in Step 3 of the onboarding flow. The system triggers bold hazard alerts whenever a scanned item contains traces." },
                { q: "What is the difference between Health Score and Fitness Score?", a: "Health Score measures chemical loading, additives, whole food purity, and heart wellness indicators (1-10). Fitness Score measures raw anabolic potential, focus stimulants, and low glycaemic index macros for cutting/bulking cycles." },
                { q: "Can I calibrate or alter my portion sizes manually?", a: "Yes. Every scan active page features a simple fluid portion size slider. Sliding it multiplies the total macronutrient output targets effortlessly." },
                { q: "Can I export my scanned meal lists to show my coach or family doctor?", a: "Yes! The Pro Coach tier offers full export functionality to produce high-density PDF meal reports with daily macronutrient trends." },
                { q: "Does the platform connect directly to my apple health wearable?", a: "Yes. With our premium mobile bridges, NutriScan pushes mapped caloric counts directly to Apple Health, WHOOP bands, and Fitbit databases." },
                { q: "Is there a money-back guarantee?", a: "Absolutely. We offer an uncompromising 30-day money-back guarantee. If you are not satisfied, cancel directly from the subscription control panel." }
              ].map((faq, idx) => (
                <details key={idx} className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 group open:border-[#00d4aa] transition-all">
                  <summary className="font-extrabold text-sm text-slate-100 cursor-pointer flex items-center justify-between select-none">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed border-t border-[#222] pt-3">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* VIEW 2: PREMIUM HEALTH-TECH DASHBOARD WORKSPACE */}
      {viewMode === "dashboard" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3 bg-[#141414] border border-[#2a2a2a] rounded-3xl p-5 space-y-6">
              
              {/* User Identity HUD Card */}
              <div className="p-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#00d4aa] flex items-center justify-center font-bold text-xs uppercase text-black">
                  DS
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-white block truncate">davidsauvaget69@gmail.com</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex w-1.5 h-1.5 bg-[#00d4aa] rounded-full" />
                    <span className="text-[10px] font-mono text-[#00d4aa] uppercase font-bold tracking-wider">
                      {isPremiumUser ? "PRO ACTIVE" : "FREE SANDBOX"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar Tabs Links */}
              <nav className="flex flex-col gap-1.5">
                {[
                  { id: "home", label: "📊 Coach Dashboard", icon: <Layers className="w-4 h-4" /> },
                  { id: "scanner", label: "📷 Live AI Scanner", icon: <Camera className="w-4 h-4" /> },
                  { id: "history", label: "🗓️ History Log & Export", icon: <Calendar className="w-4 h-4" /> },
                  { id: "upgrade", label: "💎 Premium Upgrades", icon: <CreditCard className="w-4 h-4" /> }
                ].map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        // Reset active result on specific navigation if needed
                      }}
                      className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-left ${
                        active 
                          ? "bg-[#00d4aa]/10 border border-[#00d4aa]/30 text-[#00d4aa]" 
                          : "border border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Reset onboarding option */}
              <div className="pt-4 border-t border-[#232323] space-y-3">
                <button
                  onClick={resetOnboarding}
                  className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-[#00d4aa] border border-[#2a2a2a] py-2 rounded-xl transition-colors block"
                >
                  ⚙️ Recalibrate Profile Goals
                </button>
              </div>

            </aside>

            {/* Dashboard Primary Workspace Stage */}
            <main id="main-workspace-anchor" className="lg:col-span-9 space-y-8">
              
              {/* TAB 1: DASHBOARD HOME (Calorie tracking, water, bento elements) */}
              {activeTab === "home" && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Calorie Goal Progress Rings HUD Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Calorie Goal */}
                    <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-[28px] flex items-center justify-between relative overflow-hidden">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-[#888] font-bold block">Calorie Target</span>
                        <div className="text-2xl font-black font-display text-white">
                          {history.reduce((acc, item) => acc + (parseFloat(item.calories) || 0), 0).toFixed(0)} <span className="text-xs text-slate-500 font-normal">/ {profileCalories}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Calculated formula threshold limit</p>
                      </div>
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        {/* CSS-SVG ring progress representation */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="#1c1c1c" strokeWidth="6" fill="none" />
                          <circle cx="32" cy="32" r="28" stroke="#00d4aa" strokeWidth="6" fill="none" strokeDasharray="176" 
                            strokeDashoffset={176 - (Math.min(history.reduce((acc, item) => acc + (parseFloat(item.calories) || 0), 0) / profileCalories, 1.0) * 176)} 
                          />
                        </svg>
                        <Flame className="w-6 h-6 text-[#00d4aa] animate-pulse" />
                      </div>
                    </div>

                    {/* Integrated Protein Tracker */}
                    <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-[28px] flex items-center justify-between relative overflow-hidden">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-[#888] font-bold block">Protein Isolates</span>
                        <div className="text-2xl font-black font-display text-white">
                          {history.reduce((acc, item) => acc + (parseFloat(item.protein) || 0), 0).toFixed(1)}g
                        </div>
                        <p className="text-[10px] text-slate-400">Total cellular building blocks</p>
                      </div>
                      <div className="h-12 w-12 bg-blue-950/40 rounded-full flex items-center justify-center text-blue-400 border border-blue-900/30">
                        <Trophy className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Water Hydration Log (Interactive target counter) */}
                    <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-[28px] relative overflow-hidden space-y-3">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-[#888] font-bold block">Cellular Hydration</span>
                          <div className="text-2xl font-black font-display text-white">
                            {(waterCups * 250)}ml <span className="text-xs text-slate-500 font-normal">/ 2500ml</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#00d4aa] bg-[#00d4aa]/15 border border-[#00d4aa]/25 px-2 py-0.5 rounded-full">
                          {((waterCups / waterGoalCups) * 100).toFixed(0)}% Done
                        </span>
                      </div>

                      {/* Manual increase button triggers fluid animations */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (waterCups < waterGoalCups + 2) setWaterCups(waterCups + 1);
                          }}
                          className="bg-[#00d4aa] text-black hover:brightness-110 active:scale-95 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add 250ml Cup
                        </button>
                        <button
                          onClick={() => setWaterCups(0)}
                          className="text-[10px] font-bold border border-slate-700 text-slate-400 hover:text-white px-2.5 py-2 rounded-xl"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* AI Tip of the day coach banner */}
                  <div className="p-6 bg-gradient-to-r from-[#00d4aa]/15 via-black to-black border border-[#00d4aa]/25 rounded-[32px] flex items-start gap-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-10 w-32 h-32 bg-[#00d4aa]/5 rounded-full blur-2xl" />
                    <div className="p-3 bg-[#00d4aa]/15 rounded-xl text-[#00d4aa] shrink-0 border border-[#00d4aa]/30">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#00d4aa] tracking-tight">AI Coach Tip for Marcus & David:</h4>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        To maintain sustainable muscle isolate density and safe continuous hydration, aim to pair high protein formulas with trace dietary fibers. This balances digestion speed and prevents insulin traps typical of standard processed snacks.
                      </p>
                    </div>
                  </div>

                  {/* FAST TRIAL SCANNER BLOCK */}
                  <div className="bg-[#141414] border border-[#2a2a2a] p-6 sm:p-8 rounded-[32px] space-y-6 shadow-sm">
                    <div>
                      <h3 className="text-xl font-bold font-display text-white">🎯 Quick Scan Trial Sandbox</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Don't have a gym snack nearby? Tap any of our test biological compounds to instantly simulate detailed AI scans.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {SAMPLE_PRODUCTS.map((prod) => (
                        <div key={prod.id} className="relative group bg-[#1c1c1c] border border-slate-800 rounded-2xl p-4 transition-all hover:scale-[1.02] hover:border-[#00d4aa] cursor-pointer flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] uppercase tracking-wider bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">
                              ⭐ {prod.badge}
                            </span>
                            <span className="text-xs font-bold text-[#00d4aa] font-mono">HS {prod.health_score}</span>
                          </div>
                          
                          <div className="py-6 text-center text-4xl select-none min-h-[80px] flex items-center justify-center">
                            {prod.illustrationType === "energy" ? "🥤" : prod.illustrationType === "cola" ? "🥫" : prod.illustrationType === "bar" ? "🍫" : prod.illustrationType === "shake" ? "🥛" : "🍟"}
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">{prod.brand}</span>
                              <h4 className="text-sm font-extrabold text-white line-clamp-1">{prod.product_name}</h4>
                            </div>
                            <button
                              onClick={() => handleScanSimulation(prod.brand, prod.product_name)}
                              className="w-full bg-[#2a2a2a] hover:bg-[#00d4aa] hover:text-black text-slate-300 font-bold text-[11px] py-1.5 rounded-lg transition-colors cursor-pointer block"
                            >
                              Scan Item
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* CUSTOM AVOCADO SUPER DIET (Specific hardcoded prompt require) */}
                      <div className="relative group bg-gradient-to-b from-[#1c1c1c] to-black border border-slate-800 rounded-2xl p-4 transition-all hover:scale-[1.02] hover:border-[#00d4aa] cursor-pointer flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] uppercase tracking-wider bg-emerald-900 border border-emerald-800 text-emerald-200 font-bold px-2 py-0.5 rounded-full">
                            🥑 Fresh Swap Selection
                          </span>
                          <span className="text-xs font-bold text-[#00d4aa] font-mono">HS 9.5</span>
                        </div>
                        
                        <div className="py-6 text-center text-4xl select-none min-h-[80px] flex items-center justify-center">
                          🍳
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase block">Artisan Wholefoods</span>
                            <h4 className="text-sm font-extrabold text-white line-clamp-1">Avocado Toast & Egg</h4>
                          </div>
                          <button
                            onClick={() => handleScanSimulation("Artisan Kitchen", "Avocado Toast & Egg")}
                            className="w-full bg-[#00d4aa]/10 hover:bg-[#00d4aa] border border-[#00d4aa]/20 hover:text-black text-[#00d4aa] font-black text-[11px] py-1.5 rounded-lg transition-all cursor-pointer block"
                          >
                            Trigger Specialty Scan
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: LIVE AI SCANNER ENGINE (OCR and actual scanning visual layout) */}
              {activeTab === "scanner" && (
                <div className="space-y-8 animate-fade-in">
                  
                  <div className="bg-[#141414] border border-[#2a2a2a] p-6 sm:p-8 rounded-[32px] space-y-4 shadow-sm relative">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold font-display text-white">📷 Visual Diagnostic Sandbox</h3>
                      <p className="text-xs text-slate-400">
                        Upload a photo package of simple sports supplements, energy drinks, protein bars or home food recipes.
                      </p>
                    </div>

                    <ScannerTab 
                      onScanComplete={handleScannerTabComplete}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                    />
                  </div>

                  {/* ACTIVE SCAN RESULTS VIEW PANEL */}
                  {activeResult && (
                    <div className="bg-[#141414] border-2 border-slate-800 rounded-[36px] p-6 sm:p-8 space-y-8 relative overflow-hidden transition-all duration-300">
                      
                      {/* Portion adjuster modifier slider */}
                      <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase text-[#00d4aa] font-mono tracking-widest">Adjust Portion Size Modifier</h4>
                          <span className="text-xs text-slate-400 block">Recalculate calories, sugars and proteins continuously</span>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full sm:max-w-xs shrink-0">
                          <input 
                            type="range" 
                            min="0.5" 
                            max="2.5" 
                            step="0.1"
                            value={portionSize}
                            onChange={(e) => setPortionSize(parseFloat(e.target.value))}
                            className="w-full h-1 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#00d4aa]"
                          />
                          <span className="text-xs font-mono font-bold bg-[#2a2a2a] border border-slate-700 px-3 py-1 rounded text-white min-w-[50px] text-center shrink-0">
                            {portionSize.toFixed(1)}x
                          </span>
                        </div>
                      </div>

                      {/* Detailed nutrition parameters */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        
                        <div className="md:col-span-4 space-y-6">
                          
                          <div className="bg-black/30 border border-slate-800 rounded-2xl p-6 text-center relative flex flex-col items-center justify-center min-h-[200px]">
                            {activeResult.imageUrl ? (
                              <img 
                                src={activeResult.imageUrl} 
                                alt="Result target" 
                                className="max-h-48 rounded object-contain"
                              />
                            ) : (
                              <div className="text-7xl select-none">
                                {activeResult.product_name.toLowerCase().includes("toast") ? "🥑" : "🥫"}
                              </div>
                            )}
                            <span className="text-[10px] font-mono mt-4 uppercase tracking-widest text-[#00d4aa] bg-[#00d4aa]/10 hover:bg-[#00d4aa]/15 border border-[#00d4aa]/20 px-3 py-1 rounded-full font-bold">
                              Confidence: {activeResult.confidence}
                            </span>
                          </div>

                          {/* Dual Scores */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-900/40 border border-[#2a2a2a] rounded-xl text-center space-y-1">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">Health Grade</span>
                              <span className="text-xl font-extrabold text-[#00d4aa] font-display">{activeResult.health_score}</span>
                              <div className="text-[9px] text-slate-400">Pure Cleanliness</div>
                            </div>
                            <div className="p-4 bg-slate-900/40 border border-[#2a2a2a] rounded-xl text-center space-y-1">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">Fitness Benefit</span>
                              <span className="text-xl font-extrabold text-[#7c3aed] font-display">{activeResult.fitness_score}</span>
                              <div className="text-[9px] text-slate-400">Anabolic Ratio</div>
                            </div>
                          </div>

                        </div>

                        {/* Right Nutritional Facts block */}
                        <div className="md:col-span-8 space-y-6">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest font-mono font-bold bg-[#1e1e1e] border border-[#2a2a2a] px-2.5 py-1 rounded text-slate-400">
                              {activeResult.category}
                            </span>
                            <h2 className="text-2xl font-black text-white mt-2">
                              {activeResult.brand} <span className="text-slate-400 font-light">{activeResult.product_name}</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">Flavor: <span className="text-slate-300 italic">{activeResult.flavor}</span></p>
                          </div>

                          {/* Allergen Monitor alerts */}
                          {activeResult.product_name.toLowerCase().includes("toast") && (
                            <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-center gap-3 text-xs text-rose-300">
                              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                              <div>
                                <span className="font-extrabold uppercase block">⚠️ Allergen Monitor triggered</span>
                                contains <strong className="text-white">Gluten & Pasture Eggs</strong> standard compounds.
                              </div>
                            </div>
                          )}

                          {/* High sugar alerts */}
                          {parseVal(activeResult.sugar) > 5 && (
                            <div className="p-4 bg-amber-950/25 border border-amber-900/40 rounded-xl flex items-center gap-3 text-xs text-amber-300">
                              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                              <div>
                                <span className="font-extrabold uppercase block">High Glycaemic load alert</span>
                                sugar index exceeds safe recovery baseline limits.
                              </div>
                            </div>
                          )}

                          {/* Macromolecule facts */}
                          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl p-5 space-y-4">
                            <h4 className="text-xs font-black uppercase text-slate-400 font-mono tracking-widest border-b border-[#2a2a2a] pb-2">
                              Nutritional values (Adjusted for {portionSize.toFixed(1)}x portion)
                            </h4>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div className="p-3 bg-black/20 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Total Heat Calories</span>
                                <span className="text-sm font-mono font-bold text-white">
                                  {adjustPortion(activeResult.calories)} kcal
                                </span>
                              </div>
                              <div className="p-3 bg-black/20 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Protein Content</span>
                                <span className="text-sm font-mono font-bold text-[#00d4aa]">
                                  {adjustPortion(activeResult.protein)}g
                                </span>
                              </div>
                              <div className="p-3 bg-black/20 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Carbohydrates</span>
                                <span className="text-sm font-mono font-bold text-white">
                                  {adjustPortion(activeResult.carbs)}g
                                </span>
                              </div>
                              <div className="p-3 bg-black/20 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Of which Sugars</span>
                                <span className="text-sm font-mono font-bold text-slate-300">
                                  {adjustPortion(activeResult.sugar)}g
                                </span>
                              </div>
                              <div className="p-3 bg-black/20 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Raw Lipids / Fats</span>
                                <span className="text-sm font-mono font-bold text-slate-300">
                                  {adjustPortion(activeResult.fat)}g
                                </span>
                              </div>
                              <div className="p-3 bg-black/20 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Total Caffeine</span>
                                <span className="text-sm font-mono font-bold text-white">
                                  {activeResult.caffeine}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Sweeteners checklist block */}
                          <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-5 rounded-2xl space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
                              Chemical sweetening compounds parsed
                            </h4>
                            {activeResult.sweeteners && activeResult.sweeteners.length > 0 && activeResult.sweeteners[0] !== "None" ? (
                              <div className="flex flex-wrap gap-2">
                                {activeResult.sweeteners.map((sweet, i) => (
                                  <span key={i} className="text-[10px] font-mono font-bold border border-rose-950 bg-rose-950/20 px-3 py-1 rounded-lg text-rose-300">
                                    🚫 {sweet}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-emerald-400 font-bold block">
                                ✅ No synthetic artificial sweeteners detected.
                              </span>
                            )}
                          </div>

                          {/* AI Insight explanation coach summaries */}
                          <div className="p-5 bg-[#00d4aa]/5 border border-[#00d4aa]/20 rounded-2xl space-y-2">
                            <h4 className="text-xs uppercase font-bold tracking-widest text-[#00d4aa] font-mono">Nutriscan Diagnostic Coach summary</h4>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
                              {activeResult.summary}
                            </p>
                          </div>

                          {/* Similar Healthier Alternatives Row (Fluid Premium recommendations layout) */}
                          <div className="p-5 bg-gradient-to-r from-emerald-950/20 to-black border border-emerald-900/30 rounded-2xl space-y-3">
                            <h4 className="text-xs leading-none uppercase font-black text-emerald-400 font-mono tracking-wider">
                              🍃 Recommended Healthier Alternatives & Swaps:
                            </h4>
                            <div className="space-y-2.5">
                              {getAlternatesList(activeResult.category).map((alt, i) => (
                                <div key={i} className="p-3 bg-[#111] border border-[#222] rounded-xl flex items-center justify-between gap-3 text-xs text-slate-300 hover:border-emerald-800 transition-colors">
                                  <div>
                                    <span className="font-bold text-white block">{alt.name}</span>
                                    <span className="text-[10px] text-slate-500">{alt.reason}</span>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-[10px] font-mono text-[#00d4aa] font-bold block">{alt.cal}</span>
                                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">{alt.health} Health</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Add to daily meal log trackers button */}
                          <button
                            onClick={() => {
                              alert("Caloric counts have been added to your daily fitness timeline successfully.");
                            }}
                            className="bg-[#00d4aa] hover:brightness-110 active:scale-95 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center justify-center gap-1.5 transition-transform w-full shadow-lg"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" /> Log Into Today's Meals
                          </button>

                          {/* Clear result */}
                          <button
                            onClick={() => {
                              setActiveResult(null);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="w-full text-center text-xs text-slate-500 hover:text-white pt-2 transition-colors"
                          >
                            Clear scanning view
                          </button>

                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: CALENDAR FEED MEAL HISTORIES LOGS & HIGHLIGHTS */}
              {activeTab === "history" && (
                <div className="space-y-8 animate-fade-in">
                  
                  <div className="bg-[#141414] border border-[#2a2a2a] p-6 sm:p-8 rounded-[32px] space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232323] pb-4">
                      <div>
                        <h3 className="text-xl font-bold font-display text-white">🗓️ Mapped Meal History Logs</h3>
                        <p className="text-xs text-slate-400">All scanned gym formulations and snacks parsed by day.</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => {
                            alert("Clinical PDF Nutrition Report generated! Proceed to save files simulation.");
                          }}
                          className="bg-[#1a1a1a] border border-[#2b2b2b] hover:border-slate-400 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" /> PDF Report
                        </button>
                        <button
                          onClick={clearAllScans}
                          disabled={history.length === 0}
                          className="text-xs font-bold bg-rose-950/20 text-[#f43f5e] border border-rose-900/35 px-4 py-2 rounded-xl hover:bg-rose-900/30 transition-all disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Reset Logs
                        </button>
                      </div>
                    </div>

                    {history.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 space-y-2">
                        <span className="text-4xl block">📦</span>
                        <h4 className="font-bold text-slate-300">No Food Items Scanned Yet</h4>
                        <p className="text-xs max-w-xs mx-auto text-slate-500">
                          Complete simulated sandbox trial runs or custom image scanner uploads to populate this daily database feed.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.map((item) => (
                          <div key={item.id} className="p-4 bg-[#191919] border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {item.product_name.toLowerCase().includes("toast") ? "🥑" : "🥫"}
                              </span>
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase block">{item.brand}</span>
                                <h4 className="text-sm font-extrabold text-white">{item.product_name}</h4>
                                <span className="text-[9px] font-mono text-[#00d4aa] uppercase font-bold tracking-wider">{item.category}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 justify-between sm:justify-end text-right">
                              <div>
                                <span className="text-[10px] text-slate-500 block">Calories</span>
                                <span className="text-xs font-mono font-bold text-white">{item.calories}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">Protein</span>
                                <span className="text-xs font-mono font-bold text-[#00d4aa]">{item.protein}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">Health Score</span>
                                <span className="text-xs font-mono font-bold text-[#7c3aed]">{item.health_score}</span>
                              </div>
                              <button
                                onClick={() => deleteScanItem(item.id || "")}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                </div>
              )}

              {/* TAB 4: UPGRADE OPTIONS TIER */}
              {activeTab === "upgrade" && (
                <div className="space-y-8 animate-fade-in text-center">
                  
                  <div className="bg-[#141414] border border-[#2a2a2a] p-8 sm:p-12 rounded-[32px] space-y-6 max-w-2xl mx-auto">
                    <span className="text-xs font-bold font-mono uppercase bg-[#7c3aed]/15 border border-[#7c3aed]/25 text-[#c084fc] px-3.5 py-1.5 rounded-full inline-block">
                      ⚙️ Subscription Simulator Status
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Active Plan Status Dashboard</h3>
                    
                    <div className="p-6 bg-[#181818] border border-slate-800 rounded-2xl max-w-md mx-auto space-y-3 text-left">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Current active credential:</span>
                        <span className="text-[#00d4aa] font-extrabold">{isPremiumUser ? "PRO ACTIVE MEMBERSHIP" : "FREE SANDBOX TESTER"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Connected account:</span>
                        <span className="text-white font-bold font-mono">davidsauvaget69@gmail.com</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Calculated formula suggestion parameters:</span>
                        <span className="text-white font-mono">{profileGoals.join(", ") || "General health setup"}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setIsPremiumUser(!isPremiumUser);
                        }}
                        className="bg-[#00d4aa] text-black font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl block mx-auto hover:brightness-110 active:scale-95 transition-all w-fit"
                      >
                        {isPremiumUser ? "Deactivate Simulated PRO Plan" : "Activate Simulated PRO Plan Free"}
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 font-mono">
                      *This is an integrated premium testing database switch to unlock priority alerts and infinite scans.
                    </p>
                  </div>

                </div>
              )}

            </main>

          </div>

        </div>
      )}

      {/* WHATSAPP SUPPORT CHAT MODAL ICON AND BOTTOM PANEL */}
      <div className="fixed bottom-6 right-6 z-40 space-y-2 text-right">
        
        {showSupportBot && (
          <div className="w-80 sm:w-96 rounded-3xl bg-[#141414] border border-[#2a2a2a] shadow-[0_15px_40px_rgba(0,0,0,0.7)] text-left flex flex-col overflow-hidden animate-fade-in">
            <div className="p-4 bg-[#1a1a1a] border-b border-[#282828] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4aa] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00d4aa]"></span>
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-white block">Nutriscan AI Personal Coach</h4>
                  <span className="text-[9px] text-slate-400">Online 24/7 • David & Marcus Assistance</span>
                </div>
              </div>
              <button onClick={() => setShowSupportBot(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Support message timeline content */}
            <div className="p-4 space-y-3.5 max-h-[220px] overflow-y-auto font-sans">
              {supportMessages.map((msg, i) => (
                <div key={i} className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  msg.sender === "bot" 
                    ? "bg-[#202020] text-slate-200 mr-auto text-left" 
                    : "bg-[#00d4aa] text-black font-semibold ml-auto text-right"
                }`}>
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendSupport} className="p-3 bg-black/45 border-t border-[#252525] flex gap-2">
              <input 
                type="text" 
                placeholder="Ask about calories, proteins, sweeteners..." 
                value={supportInput}
                onChange={(e) => setSupportInput(e.target.value)}
                className="flex-grow bg-[#1a1a1a] border border-[#2b2b2b] text-xs font-medium rounded-xl px-3 outline-none focus:border-[#00d4aa] text-white"
              />
              <button 
                type="submit"
                className="bg-[#00d4aa] hover:brightness-110 p-2.5 rounded-xl text-black cursor-pointer text-xs font-black"
              >
                Send
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setShowSupportBot(!showSupportBot)}
          className="h-14 w-14 rounded-full bg-[#00d4aa] hover:brightness-110 active:scale-95 flex items-center justify-center text-black shadow-lg shadow-[#00d4aa]/30 cursor-pointer self-end transition-transform ml-auto"
        >
          <MessageSquare className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* EXIT INTENT PROMO MODAL POPUP */}
      {showExitIntent && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#161616] border border-[#2a2a2a] rounded-[32px] p-8 text-center space-y-6 relative shadow-2xl animate-fade-in">
            <button 
              onClick={() => {
                setShowExitIntent(false);
                sessionStorage.setItem("ns_exit_intent_dismissed", "true");
              }} 
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-xs bg-amber-950 text-amber-400 font-extrabold uppercase px-3.5 py-1.5 rounded-full border border-amber-900/30 font-mono tracking-widest inline-block">
              ⚠️ EXCLUSIVE ONCE-OFF SAVINGS
            </span>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Wait! Don't leave empty-handed</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                David - Sign up now and experience continuous scanning with a full **30-day Premium Trial 100% Free**! Cancel in 1-click anytime.
              </p>
            </div>

            <div className="p-4 bg-[#00d4aa]/5 border border-[#00d4aa]/20 rounded-2xl flex justify-between items-center text-left">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Custom Trial Code:</span>
                <span className="text-white font-extrabold text-xs">NUTRI-30FREE</span>
              </div>
              <button 
                onClick={() => {
                  setShowExitIntent(false);
                  setIsPremiumUser(true);
                  setViewMode("dashboard");
                  setActiveTab("upgrade");
                  alert("Simulated Premium account successfully unlocked of 30 days!");
                }}
                className="bg-[#00d4aa] text-black font-extrabold text-[11px] px-3.5 py-2.5 rounded-xl uppercase tracking-wider"
              >
                Claim Free Trial
              </button>
            </div>

            <button
              onClick={() => {
                setShowExitIntent(false);
                sessionStorage.setItem("ns_exit_intent_dismissed", "true");
              }}
              className="text-xs text-slate-500 hover:text-white text-center block mx-auto underline"
            >
              No thanks, I will pay full price later
            </button>
          </div>
        </div>
      )}

      {/* COOKIE GDPR COMPLIANT CONSENT BANNER */}
      {cookieConsent && (
        <div className="fixed bottom-6 left-6 z-40 max-w-sm bg-[#141414] border border-[#2a2a2a] p-5 rounded-2xl space-y-3.5 shadow-2xl font-sans text-left">
          <p className="text-xs text-slate-300 leading-relaxed">
            We use essential security and macro mathematical tracking cookies to persist your scanned diet logs offline directly inside your sandboxed browser.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setCookieConsent(false);
                localStorage.setItem("ns_cookie_consent", "accepted");
              }}
              className="bg-[#00d4aa] text-black font-bold text-xs px-4 py-2 rounded-xl transition-all hover:brightness-110"
            >
              Accept all
            </button>
            <button 
              onClick={() => {
                setCookieConsent(false);
                localStorage.setItem("ns_cookie_consent", "declined");
              }}
              className="text-slate-400 hover:text-white border border-slate-700 text-xs px-4 py-2 rounded-xl transition-all"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* FOOTER BAR */}
      <footer className="border-t border-[#202020] bg-black py-12 mt-20 text-center space-y-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left">
            <span className="font-extrabold tracking-tight text-white block">
              NutriScan <span className="text-[#00d4aa]">AI</span>
            </span>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono tracking-widest">
              Commercial clinical sport diagnostic compounds
            </p>
          </div>
          
          {/* App store mock downloads */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => alert("Redirecting to Google Play sandbox...")} className="bg-[#141414] border border-slate-800 hover:border-slate-700 hover:bg-[#1a1a1a] px-4 py-2 rounded-xl text-left transition-all flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">Get it on</span>
                <span className="text-xs font-black text-white">Google Play</span>
              </div>
            </button>
            <button onClick={() => alert("Redirecting to Apple Store sandbox...")} className="bg-[#141414] border border-slate-800 hover:border-slate-700 hover:bg-[#1a1a1a] px-4 py-2 rounded-xl text-left transition-all flex items-center gap-2">
              <span className="text-lg">🍎</span>
              <div>
                <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">Download on</span>
                <span className="text-xs font-black text-white">App Store</span>
              </div>
            </button>
          </div>
        </div>
        <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest pt-4 border-t border-[#1a1a1a]">
          © 2026 NUTRISCAN SAAS INC. CLINIC METRIC ANALYSIS CLUSTER. ALL RIGHTS RESERVED.
        </div>
      </footer>

    </div>
  );
}
