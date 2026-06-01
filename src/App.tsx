import { useState, useEffect, FormEvent } from "react";
import { SAMPLE_PRODUCTS } from "./data";
import { ScanResult, SampleProduct } from "./types";
import ProductCard from "./components/ProductCard";
import ScannerTab from "./components/ScannerTab";
import { Login } from "./components/Login";
import { BeforeAfterDemo } from "./components/BeforeAfterDemo";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { PricingSection } from "./components/PricingSection";
import { FAQSection } from "./components/FAQSection";
import ScanResultPanel from "./components/ScanResultPanel";
import CoachPanel from "./components/CoachPanel";
import { supabase } from "./lib/supabase";
import { 
  Sparkles, ShieldCheck, Zap, Layers, Trophy, Flame, Camera, Upload, 
  Trash2, CheckCircle, Calendar, AlertCircle, RefreshCw, ChevronRight, 
  Play, Check, X, Shield, Star, HelpCircle, ArrowUp, Menu, 
  ChevronDown, Award, Droplets, CreditCard, ChevronLeft, Plus, 
  Users, Download, Eye, FileText, MessageSquare, Heart 
} from "lucide-react";

import PremiumPaywallModal from "./components/PremiumPaywallModal";

export default function App() {
  // Session storage keys
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [activeResult, setActiveResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // App views: 'landing' | 'dashboard' | 'login'
  const [viewMode, setViewMode] = useState<"landing" | "dashboard" | "login">(
    window.location.pathname === "/scanner" ? "dashboard" : 
    window.location.pathname === "/login" ? "login" : "landing"
  );
  
  // Sidebar tab index for dashboard
  const [activeTab, setActiveTab] = useState<"home" | "history" | "upgrade">("home");
  
  // Onboarding Active Flow state
  const [boardingActive, setBoardingActive] = useState(false);
  const [boardingStep, setBoardingStep] = useState(1);
  const [authError, setAuthError] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("error") === "verification_failed" ? "Échec de l'authentification ou lien invalide." : null;
    }
    return null;
  });

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
  const [plan, setPlan] = useState<string>("free");
  const [freeScansUsed, setFreeScansUsed] = useState<number>(0);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [paywallType, setPaywallType] = useState<"standard" | "expert_upgrade">("standard");
  const [userId, setUserId] = useState<string | null>(null);
  const [dontKnowTarget, setDontKnowTarget] = useState(false);

  // Custom interactive portion modifier state (value between 0.5 and 2.5)
  const [portionSize, setPortionSize] = useState(1.0);
  
  // Interactive Water Intake Tracker cup count (250ml per cup)
  const [waterCups, setWaterCups] = useState(0);
  const waterGoalCups = 10; // 2500ml

  // History Page Specific state
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [showWeeklyReportModal, setShowWeeklyReportModal] = useState(false);

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const normalizeFrenchResultToLegacy = (res: any): ScanResult => {
    if (res.calories !== undefined) return res;
    
    return {
      ...res,
      brand: res.brand || "Aucune",
      product_name: res.product_name || "Inconnu",
      flavor: res.flavor || "",
      category: res.category || "Produit",
      estimated_weight_or_volume: "Standard",
      calories: res.nutrition_100g?.calories?.toString().replace(/kcal/i, '').trim() || "0",
      protein: res.nutrition_100g?.protein?.toString().replace(/g/i, '').trim() || "0",
      carbs: res.nutrition_100g?.carbs?.toString().replace(/g/i, '').trim() || "0",
      sugar: res.nutrition_100g?.sugar?.toString().replace(/g/i, '').trim() || "0",
      fat: res.nutrition_100g?.fat?.toString().replace(/g/i, '').trim() || "0",
      caffeine: "N/A",
      sweeteners: res.alerts ? res.alerts.filter((a: string) => a.toLowerCase().includes("édulcorant")) : [],
      health_score: res.health_score ? res.health_score.replace(/[^0-9]/g, '').substring(0, 1) + "/5" : "3/5",
      fitness_score: res.objectives?.muscle_gain?.includes("Oui") ? "8/10" : "5/10",
      summary: res.custom_advice,
      better_alternative: "N/A",
      confidence: res.confidence || "90%"
    };
  };

  // Load cache states on initial client hydration
  useEffect(() => {
    const fetchUserPlan = async (uid: string) => {
      try {
        const { data } = await supabase
          .from('subscriptions')
          .select('plan, status')
          .eq('user_id', uid)
          .eq('status', 'active')
          .single();
        
        if (data && data.plan) {
          setPlan(data.plan);
        } else {
          setPlan("free");
        }

        const { data: profData } = await supabase
          .from('profiles')
          .select('free_scans_used')
          .eq('id', uid)
          .single();
          
        if (profData && typeof profData.free_scans_used === 'number') {
          setFreeScansUsed(profData.free_scans_used);
        } else {
          const stored = localStorage.getItem("ns_free_scans");
          if (stored) {
            setFreeScansUsed(parseInt(stored, 10) || 0);
          }
        }
      } catch (e) {
        setPlan("free");
      }
    };

    const handleInitialRoute = async () => {
      const href = window.location.href;
      const url = new URL(href);
      const searchParams = url.searchParams;
      const hashParams = new URLSearchParams(url.hash.substring(1));

      const code = searchParams.get("code") || hashParams.get("code");
      const token_hash = searchParams.get("token_hash") || hashParams.get("token_hash");
      const type = searchParams.get("type") || hashParams.get("type") || "signup";
      
      const hasError = href.includes("error=") || href.includes("error_code=");

      if (hasError) {
        window.history.replaceState(null, "", "/");
        setAuthError("Erreur de connexion, réessaie");
        setViewMode("landing");
        return;
      }

      if (code) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError) {
             window.history.replaceState(null, "", "/scanner");
             setViewMode("dashboard");
             setActiveTab("home");
             return;
          } else {
             console.error("Code exchange failed:", exchangeError.message);
             window.history.replaceState(null, "", "/");
             setAuthError("Erreur de connexion, réessaie");
             setViewMode("landing");
             return;
          }
        } catch (e) {
          console.error("Code exchange error:", e);
          window.history.replaceState(null, "", "/");
          setAuthError("Erreur de connexion, réessaie");
          setViewMode("landing");
          return;
        }
      }

      if (token_hash) {
        try {
          const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
          if (!error) {
             window.history.replaceState(null, "", "/scanner");
             setViewMode("dashboard");
             setActiveTab("home");
             return;
          } else {
             console.error("OTP verification failed:", error.message);
             window.history.replaceState(null, "", "/");
             setAuthError("Erreur de connexion, réessaie");
             setViewMode("landing");
             return;
          }
        } catch (e) {
          console.error("OTP verification error:", e);
          window.history.replaceState(null, "", "/");
          setAuthError("Erreur de connexion, réessaie");
          setViewMode("landing");
          return;
        }
      }

      if (window.location.pathname === "/auth/confirm") {
        const confirmCode = searchParams.get("code") || hashParams.get("code");
        const confirmTokenHash = searchParams.get("token_hash") || hashParams.get("token_hash");
        const confirmType = searchParams.get("type") || hashParams.get("type") || "signup";

        if (confirmCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(confirmCode);
          if (!error) {
             window.history.replaceState(null, "", "/scanner");
             setViewMode("dashboard");
             setActiveTab("home");
             return;
          }
        } else if (confirmTokenHash) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: confirmTokenHash, type: confirmType as any });
          if (!error) {
             window.history.replaceState(null, "", "/scanner");
             setViewMode("dashboard");
             setActiveTab("home");
             return;
          }
        }
        window.history.replaceState(null, "", "/");
        setAuthError("Erreur de connexion, réessaie");
        setViewMode("landing");
        return;
      }

      if (window.location.hash.includes("access_token")) {
          window.history.replaceState(null, "", "/scanner");
          setViewMode("dashboard");
          setActiveTab("home");
          return;
      }

      // 2. Check session and navigate
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUserId(session.user.id);
          fetchUserPlan(session.user.id);
          if (session.user?.email) {
            setProfileEmail(session.user.email);
          }
          if (window.location.pathname === "/" || window.location.pathname === "/login" || window.location.hash.includes("access_token") || window.location.pathname === "/auth/confirm") {
              window.history.replaceState(null, "", "/scanner");
          }
          setViewMode("dashboard");
          setActiveTab("home");
        } else {
          if (window.location.pathname === "/scanner") {
              window.location.href = "/";
          } else if (window.location.pathname === "/auth/confirm") {
              window.location.href = "/";
          }
        }
      });
    };

    handleInitialRoute();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
          setUserId(null);
          setPlan("free");
          setFreeScansUsed(0);
          setProfileEmail("");
          setHistory([]);
          setProfileGoals([]);
          localStorage.removeItem("ns_profile_active");
          localStorage.removeItem("ns_history_v2");
          setViewMode("landing");
      } else if (session) {
        setUserId(session.user.id);
        fetchUserPlan(session.user.id);
        if (session.user?.email) {
            setProfileEmail(session.user.email);
        }
        if (window.location.pathname === "/" || window.location.pathname === "/login" || window.location.hash.includes("access_token") || window.location.pathname === "/auth/confirm") {
            window.history.replaceState(null, "", "/scanner");
        }
        setViewMode("dashboard");
        setActiveTab("home");
      }
    });

    try {
      const storedHistory = localStorage.getItem("ns_history_v2");
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        setHistory(parsed.map(normalizeFrenchResultToLegacy));
      }
      
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
      
      const storedPlan = localStorage.getItem("ns_plan");
      const storedScans = localStorage.getItem("ns_free_scans_used");
      if (storedPlan) setPlan(storedPlan);
      if (storedScans) setFreeScansUsed(parseInt(storedScans, 10));

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
    setActiveTab("home");
    
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
    const normalized = normalizeFrenchResultToLegacy(result);
    // Features are ALWAYS locked for free users
    // But we use isLocked specifically for the premium modal trigger maybe?
    // Actually, we'll set isLocked = true for all free users.
    const isLocked = plan === "free";
    
    const enriched = {
      ...normalized,
      id: `scan-${Date.now()}`,
      scannedAt: new Date().toISOString(),
      isLocked
    };
    const updated = [enriched, ...history];
    syncHistory(updated);
    setActiveResult(enriched);
    setPortionSize(1.0);
    
    // Update scan usage
    if (plan === "free") {
      const newScansUsed = freeScansUsed + 1;
      // Cap at 5 if we want, or just increment
      setFreeScansUsed(newScansUsed);
      if (userId) {
        supabase.from('profiles').update({ free_scans_used: newScansUsed }).eq('id', userId)
          .then(() => {})
          .catch(console.error);
      } else {
        localStorage.setItem("ns_free_scans", newScansUsed.toString());
      }
      
      if (newScansUsed >= 5) {
        setTimeout(() => {
          setPaywallType("standard");
          setShowPaywall(true);
        }, 1500);
      }
    }
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
            onClick={() => {
              if (viewMode !== "dashboard") setViewMode("landing");
              else setActiveTab("home");
            }} 
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
          <div className="hidden md:flex items-center gap-4">
            {viewMode === "landing" ? (
              <>
                <button 
                  onClick={() => {
                    setViewMode("login");
                  }} 
                  className="text-sm font-bold text-white hover:text-[#00FF88] transition-colors duration-200"
                >
                  Connexion
                </button>
                <button 
                  onClick={() => {
                    setViewMode("dashboard");
                    setActiveTab("home");
                  }} 
                  className="text-sm font-bold text-white hover:text-[#00FF88] transition-colors duration-200"
                >
                  Direct Sandbox
                </button>
                <button 
                  onClick={resetOnboarding}
                  className="bg-[#00FF88] hover:bg-[#00e67a] active:scale-95 text-black font-extrabold text-sm px-6 py-2.5 rounded-full shadow-[0_4px_20px_rgba(0,255,136,0.25)] transition-all cursor-pointer"
                >
                  Scanner gratuitement →
                </button>
              </>
            ) : (
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  setViewMode("landing");
                }}
                className="text-xs border border-[#2a2a2a] hover:bg-white/5 text-slate-300 font-bold px-4 py-2 rounded-full transition-all"
              >
                Sign Out / Exit Dashboard
              </button>
            )}
          </div>

          {/* Hamburger Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden flex flex-col justify-center items-center h-10 w-10 gap-1.5 focus:outline-none"
          >
            <div className="w-6 h-0.5 bg-white rounded"></div>
            <div className="w-6 h-0.5 bg-white rounded"></div>
            <div className="w-6 h-0.5 bg-white rounded"></div>
          </button>
        </div>
      </nav>

      {/* MOBILE FULL-SCREEN NAV OVERLAY */}
      <div 
        className={`fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col pt-8 pb-12 px-6 transition-transform duration-300 ease-in-out sm:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end mb-8">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="h-10 w-10 bg-[#1a1a1a] rounded-full flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex flex-col gap-6 flex-1 text-2xl font-bold text-white">
          <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#00FF88] transition-colors">Fonctionnalités</a>
          <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#00FF88] transition-colors">Avis</a>
          <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#00FF88] transition-colors">Tarifs</a>
          <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#00FF88] transition-colors">FAQ</a>
          <button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              setViewMode("login");
            }} 
            className="text-left hover:text-[#00FF88] transition-colors"
          >
            Connexion
          </button>
        </div>

        <button 
          onClick={() => {
            setIsMobileMenuOpen(false);
            resetOnboarding();
          }}
          className="w-full bg-[#00FF88] text-black font-extrabold text-lg py-5 rounded-full active:scale-95 transition-transform"
        >
          📸 Scanner gratuitement
        </button>
      </div>

      {/* FULL-SCREEN ONBOARDING OVERLAY FLUID STEPSEQUENCE */}
      {boardingActive && (
        <div className="fixed inset-0 bg-[#0d0d0d] z-50 overflow-y-auto">
          <div className="flex flex-col min-h-full p-4 py-8">
            <div className="max-w-xl w-full my-auto mx-auto bg-[#161616] rounded-[36px] border border-[#2a2a2a] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col relative min-h-[520px]">
            
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

              {/* STEP 12: EMAIL REGISTRATION VIA SUPABASE */}
              {boardingStep === 12 && (
                <div className="space-y-6 animate-fade-in text-center">
                  <div>
                    <span className="text-[#00d4aa] text-xs font-bold font-mono tracking-widest uppercase">Presque Terminé</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">Créez votre compte pour sauvegarder votre plan</h3>
                    <p className="text-xs text-slate-400">Vos données personnalisées seront sécurisées dans votre tableau de bord.</p>
                  </div>

                  <div className="text-left w-full mx-auto pb-4">
                    <Login onSuccess={() => {
                      // Completes the onboarding flow via Supabase Login
                      handleFinishOnboarding();
                    }} />
                  </div>

                  <div className="flex justify-center flex-col pt-2 max-w-md mx-auto">
                    <button onClick={() => setBoardingStep(11)} className="w-full py-3 hover:bg-white/5 border border-[#2a2a2a] text-slate-300 font-bold rounded-xl transition-all">Retour aux questions</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
        </div>
      )}

      {/* VIEW 1: SAAS OFF-LOGGED LANDING PAGE */}
      {viewMode === "landing" && (
        <div className="w-full">
          {authError && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 text-center text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {authError}
            </div>
          )}
          
          <HeroSection onCtaClick={resetOnboarding} />

          <BeforeAfterDemo />

          <FeaturesSection />

          {/* USER TESTIMONIALS */}
          <TestimonialsSection />

          {/* PRICING PLANS SECTION */}
          <PricingSection 
            onUpgradeClick={() => {
              setIsPremiumUser(true);
              setViewMode("dashboard");
              setActiveTab("upgrade");
              alert("Abonnement Premium activé dans le simulateur ! Merci.");
            }}
            onDashboardClick={() => {
              setViewMode("dashboard");
              setActiveTab("home");
            }}
            annualBilling={annualBilling}
            setAnnualBilling={setAnnualBilling}
          />

          {/* FAQ ACCORDION SECTION */}
          <FAQSection />

        </div>
      )}

      {/* VIEW 3: LOGIN / SIGN UP */}
      {viewMode === "login" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 flex flex-col min-h-[calc(100vh-80px)]">
          <div className="my-auto w-full">
            <Login onSuccess={() => {
              setViewMode("dashboard");
              setActiveTab("home");
            }} />
          </div>
        </div>
      )}

      {/* VIEW 2: PREMIUM HEALTH-TECH DASHBOARD WORKSPACE */}
      {viewMode === "dashboard" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <aside className="hidden lg:block lg:col-span-3 bg-[#141414] border border-[#2a2a2a] rounded-3xl p-5 space-y-6">
              
              {/* User Identity HUD Card */}
              <div className="p-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#00d4aa] flex items-center justify-center font-bold text-xs uppercase text-black">
                  {profileEmail ? profileEmail.substring(0, 2).toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-white block truncate">{profileEmail || "No Email"}</span>
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
                  { id: "home", label: "📸 Scanner", icon: <Camera className="w-4 h-4" /> },
                  { id: "history", label: "📊 Historique", icon: <Calendar className="w-4 h-4" /> },
                  { id: "coach", label: "🐙 Coach", icon: <MessageSquare className="w-4 h-4" /> },
                  { id: "profile", label: "👤 Profil", icon: <CreditCard className="w-4 h-4" /> }
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
              
              {/* TAB 1: DASHBOARD HOME (Scanner Layout) */}
              {activeTab === "home" && (
                <div className="space-y-8 animate-fade-in max-w-3xl mx-auto pb-24 md:pb-0">
                  
                  {/* Welcome Message */}
                  <div className="pt-2 pb-4">
                    <h2 className="text-2xl font-extrabold text-white font-display">
                      Bonjour {localStorage.getItem("ns_boarding_name") || "👋"}
                    </h2>
                  </div>

                  {/* LIVE AI SCANNER ENGINE */}
                  <div className="w-full">
                    <ScannerTab 
                      onScanComplete={handleScannerTabComplete}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      plan={plan}
                      freeScansUsed={freeScansUsed}
                    />
                    
                    {plan === "free" && (
                      <div className="mt-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-xs font-bold text-slate-300 shadow-sm">
                          <span className="text-[#00FF88]">📸</span> Scans gratuits restants : <span className="text-white">{Math.max(0, 5 - freeScansUsed)}/5</span>
                        </span>
                        {freeScansUsed >= 5 && (
                          <div className="mt-2 block">
                            <button onClick={() => setShowPaywall(true)} className="text-[10px] text-[#00FF88] hover:underline underline-offset-2 uppercase tracking-wide font-bold">Débloquer Pro →</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ACTIVE SCAN RESULTS VIEW PANEL */}
                  {activeResult && (
                    <div id="scan-result-anchor" className="animate-fade-in-up">
                      <div className="flex items-center justify-center my-8">
                        <div className="h-px bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent w-full"></div>
                        <span className="shrink-0 px-4 text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">━━ Résultat ━━</span>
                        <div className="h-px bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent w-full"></div>
                      </div>

                      <ScanResultPanel 
                        result={activeResult} 
                        onClear={() => setActiveResult(null)} 
                        plan={plan}
                        onUnlock={() => setShowPaywall(true)}
                      />
                    </div>
                  )}

                  {/* RECENT HISTORY BLOCK */}
                  {history.length > 0 && !activeResult && (
                    <div className="pt-12 text-center space-y-6 max-w-lg mx-auto border-t border-[#2a2a2a]/40">
                      <h3 className="text-base font-bold text-white">Tes derniers scans</h3>
                      <div className="flex flex-col gap-3">
                        {history.slice(0, 3).map((item, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setActiveResult(item);
                              setTimeout(() => {
                                document.getElementById('scan-result-anchor')?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }}
                            className="flex items-center gap-4 bg-[#141414] hover:bg-[#1a1a1a] p-4 rounded-2xl border border-[#2a2a2a] cursor-pointer transition-colors text-left"
                          >
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black/50 border border-slate-800 flex items-center justify-center">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl">🥑</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-bold text-white truncate">{item.product_name}</h4>
                              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">
                                {item.health_score || 0}/100 • {item.calories || 0}
                              </p>
                            </div>
                            <div className="shrink-0 text-[#00FF88]">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: CALENDAR FEED MEAL HISTORIES LOGS & HIGHLIGHTS */}
              {activeTab === "history" && (() => {
                  const todayObj = new Date();
                  todayObj.setHours(0,0,0,0);
                  
                  const calendarDays = [];
                  for (let i = 6; i >= 0; i--) {
                    const d = new Date(todayObj);
                    d.setDate(todayObj.getDate() - i);
                    calendarDays.push(d);
                  }

                  const selectedDateObj = new Date(selectedHistoryDate);
                  const selectedDateISO = selectedDateObj.toISOString().split('T')[0];
                  
                  // Format Date Label (e.g. "Jeudi 29 Mai 2026")
                  const dateLabel = selectedDateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                  const capitalizedDateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
                  const isTodaySelected = selectedDateISO === todayObj.toISOString().split('T')[0];

                  const dailyScans = history.filter(item => {
                    if (!item.scannedAt) return false;
                    return item.scannedAt.split('T')[0] === selectedDateISO;
                  });

                  // Summaries
                  const dCals = dailyScans.reduce((sum, item) => sum + (parseFloat(item.calories) || 0), 0);
                  const dProts = dailyScans.reduce((sum, item) => sum + (parseFloat(item.protein) || 0), 0);
                  const dSugars = dailyScans.reduce((sum, item) => sum + (parseFloat(item.sugar) || 0), 0);
                  const dLipids = dailyScans.reduce((sum, item) => sum + (parseFloat(item.fat) || 0), 0);
                  const dCarbs = dailyScans.reduce((sum, item) => sum + (parseFloat(item.carbs) || 0), 0);
                  
                  let validScores = 0; let totalScore = 0;
                  dailyScans.forEach(item => { 
                    const match = item.health_score?.match(/(\d+)/);
                    if (match) {
                      const s = parseFloat(match[0]);
                      if (!isNaN(s) && s > 0) { totalScore += s; validScores++; }
                    }
                  });
                  const avgHealthScore = validScores > 0 ? (totalScore / validScores).toFixed(1) : "-";

                  // Groupings
                  const getMealTimeInfo = (isoStr: string) => {
                    const d = new Date(isoStr);
                    const h = d.getHours();
                    const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    if (h >= 6 && h < 11) return { group: "🌅 Matin (6h-11h)", time: timeStr, order: 1 };
                    if (h >= 11 && h < 14) return { group: "☀️ Midi (11h-14h)", time: timeStr, order: 2 };
                    if (h >= 14 && h < 18) return { group: "🌆 Après-midi (14h-18h)", time: timeStr, order: 3 };
                    return { group: "🌙 Soir (18h-23h)", time: timeStr, order: 4 };
                  };

                  const groupedScans = dailyScans.reduce((groups, item) => {
                    const info = getMealTimeInfo(item.scannedAt!);
                    if(!groups[info.group]) groups[info.group] = { order: info.order, items: [] };
                    groups[info.group].items.push({...item, displayTime: info.time});
                    return groups;
                  }, {} as Record<string, { order: number, items: any[] }>);
                  const sortedGroups = (Object.entries(groupedScans) as [string, { order: number, items: any[] }][]).sort((a, b) => a[1].order - b[1].order);

                  return (
                    <div className="space-y-6 animate-fade-in w-full max-w-3xl mx-auto pb-24 md:pb-0">
                      
                      {/* TOP - DAILY SUMMARY CARD */}
                      <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-[32px] space-y-6 shadow-sm relative overflow-hidden">
                        <div className="text-center space-y-1">
                          <h3 className="text-[10px] font-mono tracking-widest uppercase text-slate-500">Résumé Journalier</h3>
                          <h2 className="text-xl font-bold font-display text-white capitalize">
                            📅 {capitalizedDateLabel}
                          </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/50 p-4 rounded-3xl border border-[#222] relative overflow-hidden">
                            <h4 className="text-3xl font-black font-display text-white">🔥 {Math.round(dCals)} <span className="text-[10px] font-normal text-slate-500 uppercase tracking-widest font-mono">kcal</span></h4>
                            <span className="text-xs text-slate-400 block mt-1">Calories aujourd'hui</span>
                            <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden mt-3 max-w-[80%]">
                              <div className="h-full bg-[#00FF88] rounded-full transition-all duration-700" style={{ width: `${Math.min((dCals / profileCalories) * 100, 100)}%` }}></div>
                            </div>
                            <div className="text-[10px] mt-1 text-slate-500 font-mono">{Math.round(dCals)} / {profileCalories}</div>
                          </div>
                          <div className="bg-black/50 p-4 rounded-3xl border border-[#222] relative overflow-hidden">
                            <h4 className="text-3xl font-black font-display text-white">💪 {dProts.toFixed(1)} <span className="text-[10px] font-normal text-slate-500 uppercase tracking-widest font-mono">g</span></h4>
                            <span className="text-xs text-slate-400 block mt-1">Protéines aujourd'hui</span>
                            <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden mt-3 max-w-[80%]">
                              <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${Math.min((dProts / 150) * 100, 100)}%` }}></div>
                            </div>
                            <div className="text-[10px] mt-1 text-slate-500 font-mono">{dProts.toFixed(1)} / 150</div>
                          </div>
                        </div>

                        <div className="flex justify-between bg-black/30 border border-[#2a2a2a] rounded-2xl p-4 text-[11px] sm:text-xs font-mono font-bold text-slate-300">
                          <div className="flex flex-col items-center"><span className="text-slate-500 text-[10px] mb-1">🍬 Sucres</span>{dSugars.toFixed(1)}g</div>
                          <div className="w-px bg-[#2a2a2a]"></div>
                          <div className="flex flex-col items-center"><span className="text-slate-500 text-[10px] mb-1">🧈 Lipides</span>{dLipids.toFixed(1)}g</div>
                          <div className="w-px bg-[#2a2a2a]"></div>
                          <div className="flex flex-col items-center"><span className="text-slate-500 text-[10px] mb-1">🌾 Glucides</span>{dCarbs.toFixed(1)}g</div>
                        </div>

                        {isTodaySelected && (
                          <div className="text-center text-[10px] text-slate-500 pt-2 font-mono uppercase tracking-widest">
                            🔄 Remise à zéro automatique à minuit
                          </div>
                        )}
                      </div>

                      {/* MINI CALENDAR HORIZONTAL */}
                      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full">
                        {calendarDays.map((d, i) => {
                          const dateISO = d.toISOString().split('T')[0];
                          const isSelected = selectedDateISO === dateISO;
                          
                          // Check if day has scans
                          const hasScans = history.some(item => item.scannedAt && item.scannedAt.split('T')[0] === dateISO);
                          
                          const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' });
                          const dayNum = d.toLocaleDateString('fr-FR', { day: 'numeric' });

                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedHistoryDate(dateISO)}
                              className={`shrink-0 snap-center flex flex-col items-center justify-center py-3 px-4 rounded-2xl border transition-all ${
                                isSelected 
                                  ? "bg-[#00FF88] text-black border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.3)]" 
                                  : "bg-[#141414] text-slate-400 border-[#2a2a2a] hover:bg-[#1a1a1a]"
                              } min-w-[70px] cursor-pointer`}
                            >
                              <span className="text-[10px] uppercase font-bold" style={{ color: isSelected ? 'rgba(0,0,0,0.6)' : undefined }}>{dayName}</span>
                              <span className={`text-xl font-black font-display leading-tight mt-0.5 ${isSelected ? "text-black" : "text-white"}`}>{dayNum}</span>
                              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                                hasScans ? (isSelected ? "bg-black/50" : "bg-[#00FF88]") : "bg-[#2a2a2a]"
                              }`}></div>
                            </button>
                          );
                        })}
                      </div>

                      {/* ACTIONS ROW */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowWeeklyReportModal(true)}
                          className="flex-1 bg-[#1a1a1a] border-2 border-[#2a2a2a] hover:bg-[#222] text-white font-bold text-[13px] py-4 rounded-[20px] transition-all flex justify-center items-center gap-2 cursor-pointer"
                        >
                          📊 Rapport de la semaine
                        </button>
                        <button
                          onClick={clearAllScans}
                          disabled={history.length === 0}
                          className="bg-rose-950/20 border-2 border-rose-900/30 hover:bg-rose-900/40 text-[#f43f5e] font-bold text-[13px] px-6 py-4 rounded-[20px] transition-all disabled:opacity-30 cursor-pointer flex justify-center items-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* MEAL LIST IMPROVEMENTS */}
                      {dailyScans.length === 0 ? (
                        <div className="py-12 border-2 border-dashed border-[#2a2a2a] bg-[#141414] rounded-[32px] text-center text-slate-500">
                          <span className="text-4xl block mb-2 opacity-50">🍽️</span>
                          <h4 className="font-bold text-slate-400">Aucun repas ce jour</h4>
                          <p className="text-[11px] mt-1 text-slate-500">Scanne tes repas pour les voir apparaître ici.</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {sortedGroups.map(([groupName, groupData]) => (
                            <div key={groupName} className="space-y-3">
                              <h4 className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2">
                                <div className="h-px bg-[#2a2a2a] flex-1"></div>
                                {groupName}
                                <div className="h-px bg-[#2a2a2a] flex-1"></div>
                              </h4>
                              {groupData.items.map((item) => (
                                <div key={item.id} className="p-4 bg-[#141414] border border-[#2a2a2a] rounded-[24px] flex flex-col sm:flex-row justify-between gap-4 relative">
                                  <div className="flex flex-row items-center gap-3 w-full sm:w-auto overflow-hidden">
                                    <div className="w-12 h-12 bg-black/50 border border-[#2a2a2a] rounded-[14px] flex items-center justify-center shrink-0 overflow-hidden">
                                      {item.imageUrl ? (
                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-2xl">{item.product_name.toLowerCase().includes("toast") ? "🥑" : "🥫"}</span>
                                      )}
                                    </div>
                                    <div className="min-w-0 pr-4 flex-1">
                                      <span className="text-[10px] font-mono text-slate-500 uppercase block truncate">{item.brand || item.category}</span>
                                      <h4 className="text-[14px] font-bold text-white leading-tight truncate mt-0.5">{item.product_name}</h4>
                                      <span className="text-[10px] font-mono text-[#00FF88] uppercase font-bold tracking-wider mt-1 flex items-center gap-1 opacity-80">
                                        ⏱️ {item.displayTime}
                                      </span>
                                    </div>
                                    {/* Mobile Only Quick Actions / Stats */}
                                    <div className="flex sm:hidden flex-col items-end shrink-0 gap-1 absolute top-4 right-4 text-right">
                                      <span className="text-[13px] font-bold text-white">{item.calories} <span className="text-[9px] text-slate-500 font-mono">kcal</span></span>
                                      <span className="text-[12px] font-bold text-blue-400">{item.protein} <span className="text-[9px] text-slate-500 font-mono">g</span></span>
                                    </div>
                                  </div>

                                  <div className="hidden sm:flex items-center gap-4 shrink-0 sm:justify-end text-right border-t sm:border-t-0 border-[#2a2a2a] pt-3 sm:pt-0 mt-2 sm:mt-0">
                                    <div>
                                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Calories</span>
                                      <span className="text-[13px] font-bold text-white">{item.calories}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Protéines</span>
                                      <span className="text-[13px] font-bold text-blue-400">{item.protein}</span>
                                    </div>
                                    <div className="hidden md:block">
                                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Score</span>
                                      <span className="text-[13px] font-bold text-[#b088f1]">{item.health_score}</span>
                                    </div>
                                    <button
                                      onClick={() => deleteScanItem(item.id || "")}
                                      className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] hover:bg-rose-950/50 text-slate-600 hover:text-rose-400 rounded-full transition-colors shrink-0 ml-2 border border-transparent hover:border-rose-900/50"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  
                                  {/* Mobile Delete */}
                                  <button
                                      onClick={() => deleteScanItem(item.id || "")}
                                      className="sm:hidden absolute bottom-4 right-4 text-slate-600 p-2"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                      
                    </div>
                  );
              })()}

              {/* TAB 4: COACH PANEL */}
              {activeTab === "coach" && (
                <div className="animate-fade-in">
                  <CoachPanel history={history} plan={plan} onUnlockExpert={() => setShowPaywall(true)} />
                </div>
              )}

              {/* TAB 5: PROFILE / PREMIUM */}
              {activeTab === "profile" && (
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
                        <span className="text-white font-bold font-mono">{profileEmail || "No Email"}</span>
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

      {showWeeklyReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowWeeklyReportModal(false)}></div>
          <div className="relative w-full max-w-sm bg-[#141414] border-2 border-[#2a2a2a] rounded-[32px] p-6 shadow-2xl animate-fade-in-up">
            <button onClick={() => setShowWeeklyReportModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white bg-[#1a1a1a] p-2 rounded-full transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-2 mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-[#00FF88] to-[#00aa55] text-black rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.2)]">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mt-4">Rapport Hebdomadaire</h3>
              <p className="text-xs text-slate-400">Analyse de vos 7 derniers jours</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                <span className="text-sm font-bold text-slate-300">Calories moyennes</span>
                <span className="text-sm font-mono font-bold text-[#00FF88]">
                  {Math.round(history.reduce((sum, item) => sum + (parseFloat(item.calories) || 0), 0) / Math.max(1, new Set(history.map(item => item.scannedAt?.split('T')[0])).size))} <span className="text-[10px] text-slate-500">kcal/j</span>
                </span>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                <span className="text-sm font-bold text-slate-300">Protéines moyennes</span>
                <span className="text-sm font-mono font-bold text-blue-400">
                  {Math.round(history.reduce((sum, item) => sum + (parseFloat(item.protein) || 0), 0) / Math.max(1, new Set(history.map(item => item.scannedAt?.split('T')[0])).size))} <span className="text-[10px] text-slate-500">g/j</span>
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-2xl text-center">
              <p className="text-xs text-[#00FF88] font-bold">
                💡 {history.length > 0 ? "Excellente semaine ! Tu as un bon suivi global de tes macros. Continue sur ce rythme pour atteindre tes objectifs." : "Ton historique est vide pour cette semaine. Commence à scanner tes repas !"}
              </p>
            </div>
            
            <button onClick={() => setShowWeeklyReportModal(false)} className="w-full bg-[#00FF88] text-black font-bold font-display text-sm py-4 rounded-2xl mt-6 active:scale-95 transition-all cursor-pointer">
              Fermer le rapport
            </button>
          </div>
        </div>
      )}

      {/* FOOTER BAR */}
      <footer className="border-t border-[#202020] bg-black py-12 mt-20 text-center space-y-6 pb-28 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left">
            <span className="font-extrabold tracking-tight text-white block">
              NutriScan <span className="text-[#00FF88]">AI</span>
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

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {viewMode === "dashboard" && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d0d]/95 backdrop-blur-md border-t border-[#2a2a2a] z-50 px-6 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pb-safe-offset" style={{ paddingBottom: "env(safe-area-inset-bottom, 1rem)", height: "calc(60px + env(safe-area-inset-bottom, 0px))" }}>
          
          <button onClick={() => { setActiveTab("home"); }} className="flex flex-col items-center justify-center relative active:scale-95 transition-transform" style={{ width: '25%' }}>
            <div className={`absolute -bottom-[16px] h-[64px] w-[64px] rounded-full flex items-center justify-center border-4 border-[#0d0d0d] shadow-[0_0_20px_rgba(0,255,136,0.2)] ${activeTab === 'home' ? 'bg-[#00FF88]' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`}>
              <span className="text-3xl">📸</span>
            </div>
            <span className={`text-[10px] font-bold mt-[26px] ${activeTab === "home" ? "text-[#00FF88]" : "text-slate-400"}`}>Scanner</span>
          </button>

          <button onClick={() => { setActiveTab("history"); }} className={`flex flex-col items-center justify-center p-2 w-[25%] ${activeTab === "history" ? "text-[#00FF88]" : "text-slate-400"}`}>
            <span className="text-[22px] leading-none mb-1">📊</span>
            <span className="text-[10px] font-bold">Historique</span>
          </button>

          <button onClick={() => { setActiveTab("coach"); }} className={`flex flex-col items-center justify-center p-2 w-[25%] ${activeTab === "coach" ? "text-[#00FF88]" : "text-slate-400"}`}>
            <span className="text-[22px] leading-none mb-1">🐙</span>
            <span className="text-[10px] font-bold">Coach</span>
          </button>

          <button onClick={() => { setActiveTab("profile"); }} className={`flex flex-col items-center justify-center p-2 w-[25%] ${activeTab === "profile" ? "text-[#00FF88]" : "text-slate-400"}`}>
            <span className="text-[22px] leading-none mb-1">👤</span>
            <span className="text-[10px] font-bold">Profil</span>
          </button>
        </div>
      )}

      {/* PAYWALL MODAL */}
      {showPaywall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] w-full max-w-xl rounded-[32px] p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#00FF88] opacity-10 blur-[80px] pointer-events-none rounded-full"></div>
            
            <div className="text-center space-y-4 relative z-10">
              <div className="mb-4 flex flex-col items-center group">
                {/* Transform animation container */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 mb-2 relative flex items-center justify-center text-7xl select-none group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                   <div className="absolute inset-0 flex items-center justify-center transition-all duration-1000 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100">
                     <img src="/octopus-4.png" alt="Octopus Muscular" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display='none')} />
                     <span className="text-6xl absolute" style={{ display: 'none' }}>💪🐙</span>
                     <span className="text-6xl" style={{ display: 'none' }}>💪🐙</span>
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center transition-all duration-1000 opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-150">
                     <img src="/octopus-2.png" alt="Octopus Sad" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.setAttribute('style', 'display:block')} } />
                     <span className="text-6xl absolute" style={{ display: 'none' }}>🥺🐙</span>
                   </div>
                </div>
                <div className="bg-[#141414] border border-[#2a2a2a] px-5 py-3 rounded-2xl relative inline-block">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#141414] border-t border-l border-[#2a2a2a] rotate-45 transform"></div>
                  <p className="text-sm text-slate-300 italic">
                    "Hé !<br/>
                    Tu mérites de tout savoir sur ce que tu manges !<br/>
                    Débloque ton vrai potentiel 💪"
                  </p>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white !mt-6 tracking-tight">
                C'était ton dernier scan gratuit !
              </h2>
              <p className="text-slate-400 text-sm mb-6 pb-4 border-b border-[#2a2a2a]">
                Débloque tout pour continuer et accéder à l'analyse avancée.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mt-6">
                {/* PRO PLAN */}
                <div className="bg-[#141414] border border-[#2a2a2a] p-5 rounded-3xl hover:border-[#00FF88]/50 transition-colors flex flex-col justify-between group">
                  <div>
                     <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">PRO <span className="bg-[#1a1a1a] text-slate-400 text-[10px] px-2 py-0.5 rounded-full border border-[#222]">6.99€/m</span></h3>
                     <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-4 border-b border-[#2a2a2a] pb-3 block">
                       ☕ Moins qu'un café par semaine
                     </p>
                     <ul className="space-y-2 mb-6">
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="text-[#00FF88]">✓</span> Scans illimités</li>
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="text-[#00FF88]">✓</span> Analyse complète</li>
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="text-[#00FF88]">✓</span> Coach poulpe</li>
                     </ul>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/checkout-session", {
                          method: "POST", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ priceId: "price_1TcVGlIcQouyQI6K6uttG2JD", userId: "local-user" })
                        });
                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                      } catch (e) {
                         alert("Erreur Stripe");
                      }
                    }}
                    className="w-full bg-[#1a1a1a] border border-[#222] group-hover:border-[#00FF88]/30 group-hover:bg-[#00FF88]/10 text-[#00FF88] py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1">
                    Essayer Pro gratuit 7 jours <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>

                {/* EXPERT PLAN */}
                <div className="bg-gradient-to-b from-[#1c1228] to-[#141414] border border-[#a855f7]/30 p-5 rounded-3xl hover:border-[#a855f7]/60 transition-colors flex flex-col justify-between group relative overflow-hidden">
                  <div className="absolute top-0 right-0 py-1 px-3 bg-[#a855f7]/20 text-[#a855f7] text-[9px] font-bold uppercase tracking-widest rounded-bl-xl border-l border-b border-[#a855f7]/30">Le plus choisi</div>
                  <div>
                     <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">EXPERT <span className="bg-[#1a1a1a] text-slate-400 text-[10px] px-2 py-0.5 rounded-full border border-[#222]">14.99€/m</span></h3>
                     <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-4 border-b border-[#2a2a2a] pb-3 block">
                       🍽️ Moins qu'un repas au restaurant
                     </p>
                     <ul className="space-y-2 mb-6">
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="text-[#a855f7]">✓</span> Tout Pro +</li>
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="text-[#a855f7]">✓</span> Suivi photos évolution</li>
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="text-[#a855f7]">✓</span> Plan alimentaire IA</li>
                     </ul>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/checkout-session", {
                          method: "POST", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ priceId: "price_1TcVHFIcQouyQI6KSdytzdTQ", userId: "local-user" })
                        });
                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                      } catch (e) {
                         alert("Erreur Stripe");
                      }
                    }}
                    className="w-full bg-[#a855f7] text-white py-2.5 rounded-xl font-bold text-xs shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center gap-1 active:scale-95 transition-all">
                    Essayer Expert gratuit 7 jours <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-4">
                 <p className="text-[11px] text-slate-500 font-medium">7 jours gratuits • Sans engagement • Annulation en 1 clic</p>
                 <button onClick={() => setShowPaywall(false)} className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-2">
                   Continuer avec accès limité →
                 </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {showPaywall && (
        <PremiumPaywallModal 
          onClose={() => setShowPaywall(false)}
          userId={userId}
          userEmail={profileEmail}
          currentPlan={plan}
        />
      )}
    </div>
  );
}
