import { useState, useEffect, FormEvent } from "react";
import { SAMPLE_PRODUCTS } from "./data";
import { ScanResult, SampleProduct } from "./types";
import ProductCard from "./components/ProductCard";
import ScannerTab from "./components/ScannerTab";
import { Login } from "./components/Login";
import { OnboardingTunnel } from "./components/OnboardingTunnel";
import { AuthCallback } from "./components/AuthCallback";
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
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  Trophy,
  Flame,
  Camera,
  Upload,
  Trash2,
  CheckCircle,
  Calendar,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Play,
  Check,
  X,
  Shield,
  Star,
  HelpCircle,
  ArrowUp,
  Menu,
  ChevronDown,
  Award,
  Droplets,
  CreditCard,
  ChevronLeft,
  Plus,
  Users,
  Download,
  Eye,
  FileText,
  MessageSquare,
  Heart,
  Lock,
  Mail,
} from "lucide-react";

import PremiumPaywallModal from "./components/PremiumPaywallModal";

export default function App() {
  // Session storage keys
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [activeResult, setActiveResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // App views: 'landing' | 'dashboard' | 'login' | 'pricing' | 'auth-callback'
  const [viewMode, setViewMode] = useState<
    | "landing"
    | "dashboard"
    | "login"
    | "pricing"
    | "auth-callback"
    | "email-unverified"
  >(
    window.location.pathname === "/auth/callback"
      ? "auth-callback"
      : window.location.pathname === "/scanner"
        ? "dashboard"
        : window.location.pathname === "/pricing"
          ? "pricing"
          : window.location.pathname === "/login"
            ? "login"
            : "landing",
  );

  // Sidebar tab index for dashboard
  const [activeTab, setActiveTab] = useState<string>("home");

  // Onboarding Active Flow state
  const [boardingActive, setBoardingActive] = useState(false);
  const [boardingStep, setBoardingStep] = useState(1);
  const [authError, setAuthError] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("error") === "verification_failed"
        ? "Échec de l'authentification ou lien invalide."
        : null;
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
  const [profileName, setProfileName] = useState<string>("");
  const [plan, setPlan] = useState<string>("free");
  const [freeScansUsed, setFreeScansUsed] = useState<number>(0);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [paywallType, setPaywallType] = useState<"standard" | "expert_upgrade">(
    "standard",
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [dontKnowTarget, setDontKnowTarget] = useState(false);

  // Custom interactive portion modifier state (value between 0.5 and 2.5)
  const [portionSize, setPortionSize] = useState(1.0);

  // Interactive Water Intake Tracker cup count (250ml per cup)
  const [waterCups, setWaterCups] = useState(0);
  const waterGoalCups = 10; // 2500ml

  // History Page Specific state
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [showWeeklyReportModal, setShowWeeklyReportModal] = useState(false);

  const [annualBilling, setAnnualBilling] = useState(true);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  // Floating support widgets and exit intent
  const [showSupportBot, setShowSupportBot] = useState(false);
  const [supportMessages, setSupportMessages] = useState<
    Array<{ sender: "user" | "bot"; text: string }>
  >([
    {
      sender: "bot",
      text: "Welcome to Scan My Macro live cellular support! Ask me any nutrition, macro, or fitness question.",
    },
  ]);
  const [supportInput, setSupportInput] = useState("");
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
      calories:
        res.nutrition_100g?.calories?.toString().replace(/kcal/i, "").trim() ||
        "0",
      protein:
        res.nutrition_100g?.protein?.toString().replace(/g/i, "").trim() || "0",
      carbs:
        res.nutrition_100g?.carbs?.toString().replace(/g/i, "").trim() || "0",
      sugar:
        res.nutrition_100g?.sugar?.toString().replace(/g/i, "").trim() || "0",
      fat: res.nutrition_100g?.fat?.toString().replace(/g/i, "").trim() || "0",
      caffeine: "N/A",
      sweeteners: res.alerts
        ? res.alerts.filter((a: string) =>
            a.toLowerCase().includes("édulcorant"),
          )
        : [],
      health_score: res.health_score
        ? res.health_score.replace(/[^0-9]/g, "").substring(0, 1) + "/5"
        : "3/5",
      fitness_score: res.objectives?.muscle_gain?.includes("Oui")
        ? "8/10"
        : "5/10",
      summary: res.custom_advice,
      better_alternative: "N/A",
      confidence: res.confidence || "90%",
    };
  };

  // Load cache states on initial client hydration

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("ns_affiliate_ref", ref);
      // Clean url without refreshing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Track on backend
      fetch("/api/affiliate/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref })
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    const handleOpenPaywall = () => {
      setPaywallType(plan === "pro" ? "expert_upgrade" : "standard");
      setShowPaywall(true);
    };
    document.addEventListener("openPaywall", handleOpenPaywall);
    return () => {
      document.removeEventListener("openPaywall", handleOpenPaywall);
    };
  }, [plan]);

  useEffect(() => {
    const handleUrlParams = () => {
      const url = new URL(window.location.href);
      if (url.searchParams.get("welcome") === "true") {
        alert(
          "🎉 Paiement réussi ! Vous avez maintenant accès à votre forfait.",
        );
        url.searchParams.delete("welcome");
        window.history.replaceState(null, "", url.toString());
      }
    };
    handleUrlParams();

    const fetchUserPlan = async (uid: string, userEmail?: string) => {
      let hasActivePlan = false;

      if (userEmail === "davidsauvaget69@gmail.com") {
        setPlan("expert");
        return true;
      }

      try {
        const { data: profData, error: profError } = await supabase
          .from("profiles")
          .select("subscription_status, free_scans_used")
          .eq("id", uid)
          .maybeSingle();

        if (profError) {
          console.error("fetchUserPlan error", profError);
        }

        if (!profData && !profError) {
          await supabase.from("profiles").insert({ id: uid });
        }

        if (profData) {
          const status = profData.subscription_status;
          if (
            status === "active" ||
            status === "trialing" ||
            status === "starter" ||
            status === "pro" ||
            status === "expert"
          ) {
            hasActivePlan = true;
            // Si c'est juste 'active'/'trialing', on suppose pro par défaut (legacy fallback), sinon on prend la valeur
            setPlan(
              status === "active" || status === "trialing" ? "pro" : status,
            );
          } else {
            setPlan("free");
          }

          if (typeof profData.free_scans_used === "number") {
            setFreeScansUsed(profData.free_scans_used);
          }
        } else {
          setPlan("free");
          const stored = localStorage.getItem("ns_free_scans");
          if (stored) {
            setFreeScansUsed(parseInt(stored, 10) || 0);
          }
        }
      } catch (e) {
        setPlan("free");
      }
      return hasActivePlan;
    };

    const handleInitialRoute = async () => {
      const href = window.location.href;
      const url = new URL(href);
      const searchParams = url.searchParams;
      const hashParams = new URLSearchParams(url.hash.substring(1));

      const code = searchParams.get("code") || hashParams.get("code");
      const token_hash =
        searchParams.get("token_hash") || hashParams.get("token_hash");
      const type =
        searchParams.get("type") || hashParams.get("type") || "signup";

      const hasError = href.includes("error=") || href.includes("error_code=");

      if (hasError) {
        const errorDesc =
          searchParams.get("error_description") ||
          hashParams.get("error_description") ||
          "Erreur de connexion, réessaie";
        window.history.replaceState(null, "", "/");
        setAuthError(decodeURIComponent(errorDesc.replace(/\+/g, " ")));
        setViewMode("landing");
        return;
      }

      if (window.location.pathname === "/auth/callback") {
        return; // Handled by AuthCallback component
      }

      if (token_hash) {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });
          if (error) {
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
        const confirmTokenHash =
          searchParams.get("token_hash") || hashParams.get("token_hash");
        const confirmType =
          searchParams.get("type") || hashParams.get("type") || "signup";

        if (confirmCode) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(confirmCode);
          if (error) {
            window.history.replaceState(null, "", "/");
            setAuthError("Erreur de connexion, réessaie");
            setViewMode("landing");
            return;
          }
        } else if (confirmTokenHash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: confirmTokenHash,
            type: confirmType as any,
          });
          if (error) {
            window.history.replaceState(null, "", "/");
            setAuthError("Erreur de connexion, réessaie");
            setViewMode("landing");
            return;
          }
        } else {
          window.history.replaceState(null, "", "/");
          setAuthError("Erreur de connexion, réessaie");
          setViewMode("landing");
          return;
        }
      }

      // 2. Check session and navigate
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          setUserId(session.user.id);
          if (session.user?.email) {
            setProfileEmail(session.user.email);
          }
          if (session.user?.user_metadata) {
            const m = session.user.user_metadata;
            const name =
              m.first_name || m.name || m.full_name || m.prenom || "";
            if (name) setProfileName(name);
          }
          const hasPlan = await fetchUserPlan(
            session.user.id,
            session.user?.email,
          );
          if (hasPlan) {
            if (
              window.location.pathname === "/" ||
              window.location.pathname === "/login" ||
              window.location.pathname === "/pricing" ||
              window.location.hash.includes("access_token") ||
              window.location.pathname === "/auth/confirm"
            ) {
              window.history.replaceState(null, "", "/scanner");
            }
            setViewMode("dashboard");
            setActiveTab("home");
          } else {
            if (
              window.location.pathname === "/scanner" ||
              window.location.hash.includes("access_token") ||
              window.location.pathname === "/auth/confirm" ||
              window.location.pathname === "/login"
            ) {
              window.history.replaceState(null, "", "/pricing");
              setViewMode("pricing");
            }
          }
        } else {
          if (window.location.pathname === "/auth/confirm") {
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
        if (session.user?.email) {
          setProfileEmail(session.user.email);
        }
        if (session.user?.user_metadata) {
          const m = session.user.user_metadata;
          const name = m.first_name || m.name || m.full_name || m.prenom || "";
          if (name) setProfileName(name);
        }

        if (window.location.pathname === "/auth/callback") {
          return; // Let AuthCallback handle this to avoid race conditions
        }

        (async () => {
          if (
            !session.user.email_confirmed_at &&
            session.user.app_metadata?.provider === "email"
          ) {
            setViewMode("email-unverified");
            return;
          }
          const hasPlan = await fetchUserPlan(
            session.user.id,
            session.user?.email,
          );
          if (hasPlan) {
            if (
              window.location.pathname === "/" ||
              window.location.pathname === "/login" ||
              window.location.pathname === "/pricing" ||
              window.location.hash.includes("access_token") ||
              window.location.pathname === "/auth/confirm"
            ) {
              window.history.replaceState(null, "", "/scanner");
            }
            setViewMode("dashboard");
            setActiveTab("home");
          } else {
            if (
              window.location.pathname === "/scanner" ||
              window.location.hash.includes("access_token") ||
              window.location.pathname === "/auth/confirm" ||
              window.location.pathname === "/login"
            ) {
              window.history.replaceState(null, "", "/pricing");
              setViewMode("pricing");
            }
          }
        })();
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

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Update calories suggest dynamically based on profile goals selected
  useEffect(() => {
    if (
      profileWeight &&
      profileHeight &&
      profileAge &&
      profileSex &&
      profileActivityLevel
    ) {
      let bmr =
        10 * Number(profileWeight) +
        6.25 * Number(profileHeight) -
        5 * Number(profileAge);
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
  }, [
    profileGoals,
    profileSex,
    profileAge,
    profileHeight,
    profileWeight,
    profileActivityLevel,
  ]);

  useEffect(() => {
    if (!profileWeight) return;
    const w = Number(profileWeight);
    let p = 0,
      f = 0,
      c = 0;

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

    const caloriesFromPF = p * 4 + f * 9;
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
        setAnalysisProgress((p) => {
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
      email: profileEmail,
    };
    localStorage.setItem("ns_profile_active", JSON.stringify(profile));
    setBoardingActive(false);

    // Après onboarding 1-12, si on n'a pas de plan, on va sur /pricing
    if (!["pro", "expert", "starter"].includes(plan) && plan !== "expert") {
      // Davids account matches 'expert'
      window.history.replaceState(null, "", "/pricing");
      setViewMode("pricing");
    } else {
      window.history.replaceState(null, "", "/scanner");
      setViewMode("dashboard");
      setActiveTab("home");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      await supabase.auth.signOut();
      localStorage.clear();
      setUserId(null);
      setProfileEmail("");
      setHistory([]);
      setActiveResult(null);
      setProfileGoals([]);
      setViewMode("landing");
      window.location.href = "/";
    }
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
      document
        .getElementById("main-workspace-anchor")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    setTimeout(() => {
      // Find matches or build default standard
      const matched = SAMPLE_PRODUCTS.find((p) =>
        p.product_name.toLowerCase().includes(name.toLowerCase()),
      );

      const result: ScanResult = {
        id: `scan-${Date.now()}`,
        brand: matched ? matched.brand : brand,
        product_name: matched ? matched.product_name : name,
        flavor: matched ? matched.flavor : "Original Organic Formula",
        category: matched ? matched.category : "Superfood Compound",
        estimated_weight_or_volume: matched
          ? matched.estimated_weight_or_volume
          : "320g Portion",
        calories: matched ? matched.calories : "240 kcal",
        protein: matched ? matched.protein : "12g",
        carbs: matched ? matched.carbs : "28g",
        sugar: matched ? matched.sugar : "1.8g",
        fat: matched ? matched.fat : "8g",
        caffeine: matched ? matched.caffeine : "0mg",
        sweeteners: matched ? matched.sweeteners : ["None"],
        health_score: matched ? matched.health_score : "9.5/10",
        fitness_score: matched ? matched.fitness_score : "9/10",
        summary: matched
          ? matched.summary
          : "Superior micronutrient dense biological fuel cell. Delivers premium fibers alongside necessary mono-unsaturated fats to promote balanced hormone metabolism and safe cardiac efficiency.",
        better_alternative: matched
          ? matched.better_alternative
          : "Organic Stevia Leaf tea or alkaline spring water",
        confidence: matched ? matched.confidence : "98%",
        scannedAt: new Date().toISOString(),
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
      isLocked,
    };
    const updated = [enriched, ...history];
    syncHistory(updated);
    setActiveResult(enriched);
    setPortionSize(1.0);

    // Update scan usage
    if (plan === "free" || plan === "starter") {
      const newScansUsed = freeScansUsed + 1;
      const limit = plan === "starter" ? 20 : 5;

      setFreeScansUsed(newScansUsed);
      if (userId) {
        const updateScans = async () => {
          try {
            await supabase
              .from("profiles")
              .update({ free_scans_used: newScansUsed })
              .eq("id", userId);
          } catch (err) {
            console.error(err);
          }
        };
        updateScans();
      } else {
        localStorage.setItem("ns_free_scans", newScansUsed.toString());
      }

      if (newScansUsed >= limit) {
        setTimeout(() => {
          setPaywallType(plan === "starter" ? "expert_upgrade" : "standard");
          setShowPaywall(true);
        }, 1500);
      }
    }
  };

  const deleteScanItem = (uid: string) => {
    const filtered = history.filter((item) => item.id !== uid);
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
    const updated = [
      ...supportMessages,
      { sender: "user" as const, text: userMsg },
    ];
    setSupportMessages(updated);
    setSupportInput("");

    setTimeout(() => {
      let botResp =
        "Based on your clinical goals, this looks excellent! Make sure to maintain a balanced ratio of raw protein isolates and dietary fiber.";
      const query = userMsg.toLowerCase();
      if (query.includes("protein") || query.includes("muscle")) {
        botResp =
          "Excellent question! High biological value proteins like milk whey isolates, egg whites, and grass-fed lean beef promote muscle hypertrophy. Aim for 2.0g of protein per kg of bodyweight.";
      } else if (
        query.includes("calorie") ||
        query.includes("weight") ||
        query.includes("lose")
      ) {
        botResp = `Your personal Scan My Macro goal is currently set to ${profileCalories} kcal. Keeping a steady daily negative calorie balance of roughly 300 to 500 kcal is ideal for healthy body fat reduction without taxing metabolic recovery.`;
      } else if (
        query.includes("sweetener") ||
        query.includes("sucralose") ||
        query.includes("diet")
      ) {
        botResp =
          "Processed sweeteners (Acesulfame K, Sucralose, Aspartame) bypass immediate glucose digestion but are clinically tracked for potentially altering microbiome flora and increasing sweet cravings.";
      } else if (query.includes("avocado") || query.includes("toast")) {
        botResp =
          "Avocado Toast with a whole egg scores an outstanding 9.5/10! It consists of slow-digesting sourdough, premium healthy monounsaturated heart-healthy fats, and whole direct amino acids.";
      }
      setSupportMessages((prev) => [...prev, { sender: "bot", text: botResp }]);
    }, 1000);
  };

  // Hardcoded alternative cleaner options matcher
  const getAlternatesList = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("energy")) {
      return [
        {
          name: "Unsweetened Ceremonial Matcha",
          cal: "15 kcal",
          health: "10/10",
          reason: "Clean L-Theanine focus without crashes.",
        },
        {
          name: "Organic Cold Pressed Yerba Mate",
          cal: "45 kcal",
          health: "9/10",
          reason: "Polyphenol dense herbal stimulant.",
        },
      ];
    } else if (cat.includes("soda") || cat.includes("cola")) {
      return [
        {
          name: "Sparkling Water with Fresh Lime",
          cal: "5 kcal",
          health: "10/10",
          reason: "Zero chemical loading. Pure hydration.",
        },
        {
          name: "Prebiotic Botanical Extract Cola",
          cal: "35 kcal",
          health: "8/10",
          reason: "9g plant fiber to feed gut microbiotica.",
        },
      ];
    } else {
      return [
        {
          name: "Pasture raised Boiled Eggs & Walnut Halves",
          cal: "190 kcal",
          health: "10/10",
          reason: "Vitamins D, K2, and direct natural fats.",
        },
        {
          name: "Organic Low Fat Greek Yogurt",
          cal: "120 kcal",
          health: "9.5/10",
          reason: "Natural live probiotics + whole calcium.",
        },
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
              <Zap className="w-6 h-6 text-black fill-black/20" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight font-display text-white block">
                Scan My Macro
              </span>
              <p className="text-[9px] font-mono text-slate-400 tracking-wider font-semibold uppercase leading-none">
                Analyse nutritionnelle
              </p>
            </div>
          </div>

          {/* Nav links (Only when viewing Landing Page) */}
          {viewMode === "landing" ? (
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
              <a
                href="#features"
                className="hover:text-[#00d4aa] transition-colors"
              >
                Platform Features
              </a>
              <a
                href="#how-it-works"
                className="hover:text-[#00d4aa] transition-colors"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="hover:text-[#00d4aa] transition-colors"
              >
                Real Reviews
              </a>
              <a
                href="#pricing"
                className="hover:text-[#00d4aa] transition-colors"
              >
                Pricing Options
              </a>
              <a href="#faq" className="hover:text-[#00d4aa] transition-colors">
                FAQs
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              {plan === "expert" && (
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.3)] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-white" />
                  PLAN EXPERT ACTIF
                </span>
              )}
              {plan === "pro" && (
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#00d4aa]/20 border border-[#00d4aa]/50 text-[#00d4aa] px-3 py-1.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#00d4aa]" />
                  PLAN PRO ACTIF
                </span>
              )}
              {(plan === "free" || plan === "starter") && (
                <span className="hidden sm:flex text-xs bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-1.5 rounded-full text-slate-300 font-mono items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  Mode {plan === "starter" ? "Starter" : "Gratuit"} (
                  {(plan === "starter" ? 20 : 5) -
                    Math.min(freeScansUsed, plan === "starter" ? 20 : 5)}{" "}
                  scans restants)
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
                onClick={handleLogout}
                className="text-xs border border-[#2a2a2a] hover:bg-white/5 text-slate-300 font-bold px-4 py-2 rounded-full transition-all"
              >
                Se déconnecter
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
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
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
          <a
            href="#features"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-[#00FF88] transition-colors"
          >
            Fonctionnalités
          </a>
          <a
            href="#testimonials"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-[#00FF88] transition-colors"
          >
            Avis
          </a>
          <a
            href="#pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-[#00FF88] transition-colors"
          >
            Tarifs
          </a>
          <a
            href="#faq"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-[#00FF88] transition-colors"
          >
            FAQ
          </a>
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

      {viewMode === "email-unverified" && (
        <div className="w-full flex-grow flex items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-display text-white mb-2">
              Veuillez vérifier votre email
            </h2>
            <p className="text-sm text-slate-400 mb-6 font-medium">
              Pour accéder à votre tableau de bord, cliquez sur le lien que nous
              avons envoyé à <b>{profileEmail}</b>.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] mb-4"
            >
              J'ai confirmé mon email
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-white transition-colors underline underline-offset-2"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      {boardingActive && (
        <OnboardingTunnel
          onCancel={() => setBoardingActive(false)}
          onComplete={async (goals, sex, age, height, weight) => {
            setProfileGoals(goals);
            setProfileSex(sex);
            setProfileAge(age);
            setProfileHeight(height);
            setProfileWeight(weight);

            // The user should have been signed up through the Login component in Step 4.
            // Usually, an insert into 'profiles' would be done here or triggered by Supabase Auth hook.
            // Let's insert the goals straight to supabase just in case:
            if (userId) {
              await supabase.from("profiles").upsert(
                {
                  id: userId,
                  goals,
                  sex,
                  age: parseInt(age),
                  height: parseInt(height),
                  weight: parseFloat(weight),
                },
                { onConflict: "id" },
              );
            }

            setBoardingActive(false);
            handleFinishOnboarding();
          }}
        />
      )}

      {/* VIEW 1: SAAS OFF-LOGGED LANDING PAGE */}
      
      {viewMode === "admin-affiliates" && (
        <AdminAffiliates onBack={() => { setViewMode("dashboard"); setActiveTab("home"); }} session={session} />
      )}
      {viewMode === "affiliate-dashboard" && (
        <AffiliateDashboard onBack={() => { setViewMode("dashboard"); setActiveTab("home"); }} session={session} />
      )}

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
              setViewMode("login");
            }}
            onDashboardClick={() => {
              setViewMode("login");
            }}
          />

          {/* FAQ ACCORDION SECTION */}
          <FAQSection />
        </div>
      )}

      {/* VIEW 5: AUTH CALLBACK */}
      {viewMode === "auth-callback" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 flex flex-col min-h-[calc(100vh-80px)]">
          <AuthCallback />
        </div>
      )}

      {/* VIEW 3: LOGIN / SIGN UP */}
      {viewMode === "login" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 flex flex-col min-h-[calc(100vh-80px)]">
          <div className="my-auto w-full">
            <Login
              onSuccess={() => {
                setViewMode("dashboard");
                setActiveTab("home");
              }}
            />
          </div>
        </div>
      )}

      {/* VIEW 4: PRICING (POST-LOGIN NO PLAN) */}
      {viewMode === "pricing" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 flex flex-col min-h-[calc(100vh-80px)]">
          <PricingSection
            onUpgradeClick={async (priceId) => {
              if (priceId) {
                try {
                  const res = await fetch("/api/checkout-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      priceId,
                      userId: userId || "anonymous",
                      customer_email: profileEmail || undefined,
                    }),
                  });

                  if (!res.ok) {
                    const errorData = await res.text();
                    throw new Error(
                      `Erreur réseau: ${res.status} ${errorData}`,
                    );
                  }

                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                } catch (e: any) {
                  console.error("Stripe Error Details:", e);
                  alert(
                    "Erreur de connexion avec Stripe. Veuillez vérifier votre réseau ou contacter le support.",
                  );
                }
              } else {
                setIsPremiumUser(true);
                setViewMode("dashboard");
                setActiveTab("upgrade");
              }
            }}
            onDashboardClick={() => {
              setViewMode("dashboard");
              setActiveTab("home");
            }}
            hideFreePlan={true}
          />
        </div>
      )}

      {/* VIEW 2: PREMIUM HEALTH-TECH DASHBOARD WORKSPACE */}
      {viewMode === "dashboard" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:block lg:col-span-3 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 space-y-6 shadow-2xl">
              {/* User Identity HUD Card */}
              <div className="p-4 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-xs uppercase text-black shadow-lg">
                  {profileEmail
                    ? profileEmail.substring(0, 2).toUpperCase()
                    : "U"}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {profileEmail
                      ? profileEmail.split("@")[0] + "..."
                      : "No Email"}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                      {[
                        "pro",
                        "expert",
                        "starter",
                        "active",
                        "trialing",
                      ].includes(plan)
                        ? "PRO"
                        : "Gratuit"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar Tabs Links */}
              <nav className="flex flex-col gap-1.5">
                {[
                  {
                    id: "home",
                    label: "Scanner",
                    icon: (
                      <Camera
                        className="w-5 h-5 flex-shrink-0"
                        strokeWidth={1.5}
                      />
                    ),
                  },
                  {
                    id: "history",
                    label: "Historique",
                    icon: (
                      <Calendar
                        className="w-5 h-5 flex-shrink-0"
                        strokeWidth={1.5}
                      />
                    ),
                  },
                  {
                    id: "coach",
                    label: "Coach IA",
                    icon: (
                      <MessageSquare
                        className="w-5 h-5 flex-shrink-0"
                        strokeWidth={1.5}
                      />
                    ),
                  },
                  {
                    id: "profile",
                    label: "Profil",
                    icon: (
                      <Users
                        className="w-5 h-5 flex-shrink-0"
                        strokeWidth={1.5}
                      />
                    ),
                  },
                ].filter(Boolean).map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        
                          if (item.id === "admin-affiliates" || item.id === "affiliate-dashboard") {
                             setViewMode(item.id);
                          } else {
                             setActiveTab(item.id as any);
                          }

                      }}
                      className={`flex items-center gap-3 px-4 py-3 font-medium text-sm rounded-xl transition-all duration-200 text-left ${
                        active
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-lg shadow-emerald-500/20"
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
              <div className="pt-4 border-t border-white/10 space-y-3">
                <button
                  onClick={resetOnboarding}
                  className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 py-2 rounded-xl transition-colors block"
                >
                  ⚙️ Recalibrer mes objectifs
                </button>
              </div>
            </aside>

            {/* Dashboard Primary Workspace Stage */}
            <main
              id="main-workspace-anchor"
              className="lg:col-span-9 space-y-8"
            >
              {/* TAB 1: DASHBOARD HOME (Scanner Layout) */}
              {activeTab === "home" && (
                <div className="space-y-8 animate-fade-in max-w-3xl mx-auto pb-24 md:pb-0">
                  {/* Welcome Message */}
                  <div className="pt-2 pb-4">
                    <h2 className="text-2xl font-extrabold text-white font-display">
                      Bonjour{" "}
                      {profileName || localStorage.getItem("ns_boarding_name")
                        ? `${profileName || localStorage.getItem("ns_boarding_name")} 👋`
                        : "👋"}
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
                      userObjective={profileGoals.join(", ")}
                    />

                    {(plan === "free" || plan === "starter") && (
                      <div className="mt-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-xs font-bold text-slate-300 shadow-sm">
                          <span className="text-[#00FF88]">📸</span> Scans{" "}
                          {plan === "starter" ? "Starter" : "gratuits"} restants
                          :{" "}
                          <span className="text-white">
                            {Math.max(
                              0,
                              (plan === "starter" ? 20 : 5) - freeScansUsed,
                            )}
                            /{plan === "starter" ? 20 : 5}
                          </span>
                        </span>
                        {freeScansUsed >= (plan === "starter" ? 20 : 5) && (
                          <div className="mt-2 block">
                            <button
                              onClick={() => setShowPaywall(true)}
                              className="text-[10px] text-[#00FF88] hover:underline underline-offset-2 uppercase tracking-wide font-bold"
                            >
                              Débloquer Pro →
                            </button>
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
                        <span className="shrink-0 px-4 text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">
                          ━━ Résultat ━━
                        </span>
                        <div className="h-px bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent w-full"></div>
                      </div>

                      <ScanResultPanel
                        result={activeResult}
                        onClear={() => setActiveResult(null)}
                        plan={plan}
                        profileGoals={profileGoals}
                        onUnlock={() => setShowPaywall(true)}
                      />
                    </div>
                  )}

                  {/* RECENT HISTORY BLOCK */}
                  {history.length > 0 && !activeResult && (
                    <div className="pt-12 text-center space-y-6 max-w-lg mx-auto border-t border-[#2a2a2a]/40">
                      <h3 className="text-base font-bold text-white">
                        Tes derniers scans
                      </h3>
                      <div className="flex flex-col gap-3">
                        {history.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setActiveResult(item);
                              setTimeout(() => {
                                document
                                  .getElementById("scan-result-anchor")
                                  ?.scrollIntoView({ behavior: "smooth" });
                              }, 100);
                            }}
                            className="flex items-center gap-4 bg-[#141414] hover:bg-[#1a1a1a] p-4 rounded-2xl border border-[#2a2a2a] cursor-pointer transition-colors text-left"
                          >
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black/50 border border-slate-800 flex items-center justify-center">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl">🥑</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-bold text-white truncate">
                                {item.product_name}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">
                                {item.health_score || 0}/100 •{" "}
                                {item.calories || 0}
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
              {activeTab === "history" &&
                (() => {
                  const todayObj = new Date();
                  todayObj.setHours(0, 0, 0, 0);

                  const calendarDays = [];
                  for (let i = 6; i >= 0; i--) {
                    const d = new Date(todayObj);
                    d.setDate(todayObj.getDate() - i);
                    calendarDays.push(d);
                  }

                  const selectedDateObj = new Date(selectedHistoryDate);
                  const selectedDateISO = selectedDateObj
                    .toISOString()
                    .split("T")[0];

                  // Format Date Label (e.g. "Jeudi 29 Mai 2026")
                  const dateLabel = selectedDateObj.toLocaleDateString(
                    "fr-FR",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  );
                  const capitalizedDateLabel =
                    dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
                  const isTodaySelected =
                    selectedDateISO === todayObj.toISOString().split("T")[0];

                  const dailyScans = history.filter((item) => {
                    if (!item.scannedAt) return false;
                    return item.scannedAt.split("T")[0] === selectedDateISO;
                  });

                  // Summaries
                  const dCals = dailyScans.reduce(
                    (sum, item) => sum + (parseFloat(item.calories) || 0),
                    0,
                  );
                  const dProts = dailyScans.reduce(
                    (sum, item) => sum + (parseFloat(item.protein) || 0),
                    0,
                  );
                  const dSugars = dailyScans.reduce(
                    (sum, item) => sum + (parseFloat(item.sugar) || 0),
                    0,
                  );
                  const dLipids = dailyScans.reduce(
                    (sum, item) => sum + (parseFloat(item.fat) || 0),
                    0,
                  );
                  const dCarbs = dailyScans.reduce(
                    (sum, item) => sum + (parseFloat(item.carbs) || 0),
                    0,
                  );

                  let validScores = 0;
                  let totalScore = 0;
                  dailyScans.forEach((item) => {
                    const match = item.health_score?.match(/(\d+)/);
                    if (match) {
                      const s = parseFloat(match[0]);
                      if (!isNaN(s) && s > 0) {
                        totalScore += s;
                        validScores++;
                      }
                    }
                  });
                  const avgHealthScore =
                    validScores > 0
                      ? (totalScore / validScores).toFixed(1)
                      : "-";

                  // Groupings
                  const getMealTimeInfo = (isoStr: string) => {
                    const d = new Date(isoStr);
                    const h = d.getHours();
                    const timeStr = d.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    if (h >= 6 && h < 11)
                      return {
                        group: "🌅 Matin (6h-11h)",
                        time: timeStr,
                        order: 1,
                      };
                    if (h >= 11 && h < 14)
                      return {
                        group: "☀️ Midi (11h-14h)",
                        time: timeStr,
                        order: 2,
                      };
                    if (h >= 14 && h < 18)
                      return {
                        group: "🌆 Après-midi (14h-18h)",
                        time: timeStr,
                        order: 3,
                      };
                    return {
                      group: "🌙 Soir (18h-23h)",
                      time: timeStr,
                      order: 4,
                    };
                  };

                  const groupedScans = dailyScans.reduce(
                    (groups, item) => {
                      const info = getMealTimeInfo(item.scannedAt!);
                      if (!groups[info.group])
                        groups[info.group] = { order: info.order, items: [] };
                      groups[info.group].items.push({
                        ...item,
                        displayTime: info.time,
                      });
                      return groups;
                    },
                    {} as Record<string, { order: number; items: any[] }>,
                  );
                  const sortedGroups = (
                    Object.entries(groupedScans) as [
                      string,
                      { order: number; items: any[] },
                    ][]
                  ).sort((a, b) => a[1].order - b[1].order);

                  return (
                    <div className="space-y-6 animate-fade-in w-full max-w-3xl mx-auto pb-24 md:pb-0">
                      {/* TOP - DAILY SUMMARY CARD */}
                      <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-[32px] space-y-6 shadow-sm relative overflow-hidden">
                        <div className="text-center space-y-1">
                          <h3 className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
                            Résumé Journalier
                          </h3>
                          <h2 className="text-xl font-bold font-display text-white capitalize">
                            📅 {capitalizedDateLabel}
                          </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/50 p-4 rounded-3xl border border-[#222] relative overflow-hidden">
                            <h4 className="text-3xl font-black font-display text-white">
                              🔥 {Math.round(dCals)}{" "}
                              <span className="text-[10px] font-normal text-slate-500 uppercase tracking-widest font-mono">
                                kcal
                              </span>
                            </h4>
                            <span className="text-xs text-slate-400 block mt-1">
                              Calories aujourd'hui
                            </span>
                            <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden mt-3 max-w-[80%]">
                              <div
                                className="h-full bg-[#00FF88] rounded-full transition-all duration-700"
                                style={{
                                  width: `${Math.min((dCals / profileCalories) * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-[10px] mt-1 text-slate-500 font-mono">
                              {Math.round(dCals)} / {profileCalories}
                            </div>
                          </div>
                          <div className="bg-black/50 p-4 rounded-3xl border border-[#222] relative overflow-hidden">
                            <h4 className="text-3xl font-black font-display text-white">
                              💪 {dProts.toFixed(1)}{" "}
                              <span className="text-[10px] font-normal text-slate-500 uppercase tracking-widest font-mono">
                                g
                              </span>
                            </h4>
                            <span className="text-xs text-slate-400 block mt-1">
                              Protéines aujourd'hui
                            </span>
                            <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden mt-3 max-w-[80%]">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                style={{
                                  width: `${Math.min((dProts / 150) * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-[10px] mt-1 text-slate-500 font-mono">
                              {dProts.toFixed(1)} / 150
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between bg-black/30 border border-[#2a2a2a] rounded-2xl p-4 text-[11px] sm:text-xs font-mono font-bold text-slate-300">
                          <div className="flex flex-col items-center">
                            <span className="text-slate-500 text-[10px] mb-1">
                              🍬 Sucres
                            </span>
                            {dSugars.toFixed(1)}g
                          </div>
                          <div className="w-px bg-[#2a2a2a]"></div>
                          <div className="flex flex-col items-center">
                            <span className="text-slate-500 text-[10px] mb-1">
                              🧈 Lipides
                            </span>
                            {dLipids.toFixed(1)}g
                          </div>
                          <div className="w-px bg-[#2a2a2a]"></div>
                          <div className="flex flex-col items-center">
                            <span className="text-slate-500 text-[10px] mb-1">
                              🌾 Glucides
                            </span>
                            {dCarbs.toFixed(1)}g
                          </div>
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
                          const dateISO = d.toISOString().split("T")[0];
                          const isSelected = selectedDateISO === dateISO;

                          // Check if day has scans
                          const hasScans = history.some(
                            (item) =>
                              item.scannedAt &&
                              item.scannedAt.split("T")[0] === dateISO,
                          );

                          const dayName = d.toLocaleDateString("fr-FR", {
                            weekday: "short",
                          });
                          const dayNum = d.toLocaleDateString("fr-FR", {
                            day: "numeric",
                          });

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
                              <span
                                className="text-[10px] uppercase font-bold"
                                style={{
                                  color: isSelected
                                    ? "rgba(0,0,0,0.6)"
                                    : undefined,
                                }}
                              >
                                {dayName}
                              </span>
                              <span
                                className={`text-xl font-black font-display leading-tight mt-0.5 ${isSelected ? "text-black" : "text-white"}`}
                              >
                                {dayNum}
                              </span>
                              <div
                                className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                                  hasScans
                                    ? isSelected
                                      ? "bg-black/50"
                                      : "bg-[#00FF88]"
                                    : "bg-[#2a2a2a]"
                                }`}
                              ></div>
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
                          <span className="text-4xl block mb-2 opacity-50">
                            🍽️
                          </span>
                          <h4 className="font-bold text-slate-400">
                            Aucun repas ce jour
                          </h4>
                          <p className="text-[11px] mt-1 text-slate-500">
                            Scanne tes repas pour les voir apparaître ici.
                          </p>
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
                                <div
                                  key={item.id}
                                  className="p-4 bg-[#141414] border border-[#2a2a2a] rounded-[24px] flex flex-col sm:flex-row justify-between gap-4 relative"
                                >
                                  <div className="flex flex-row items-center gap-3 w-full sm:w-auto overflow-hidden">
                                    <div className="w-12 h-12 bg-black/50 border border-[#2a2a2a] rounded-[14px] flex items-center justify-center shrink-0 overflow-hidden">
                                      {item.imageUrl ? (
                                        <img
                                          src={item.imageUrl}
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-2xl">
                                          {item.product_name
                                            .toLowerCase()
                                            .includes("toast")
                                            ? "🥑"
                                            : "🥫"}
                                        </span>
                                      )}
                                    </div>
                                    <div className="min-w-0 pr-4 flex-1">
                                      <span className="text-[10px] font-mono text-slate-500 uppercase block truncate">
                                        {item.brand || item.category}
                                      </span>
                                      <h4 className="text-[14px] font-bold text-white leading-tight truncate mt-0.5">
                                        {item.product_name}
                                      </h4>
                                      <span className="text-[10px] font-mono text-[#00FF88] uppercase font-bold tracking-wider mt-1 flex items-center gap-1 opacity-80">
                                        ⏱️ {item.displayTime}
                                      </span>
                                    </div>
                                    {/* Mobile Only Quick Actions / Stats */}
                                    <div className="flex sm:hidden flex-col items-end shrink-0 gap-1 absolute top-4 right-4 text-right">
                                      <span className="text-[13px] font-bold text-white">
                                        {item.calories}{" "}
                                        <span className="text-[9px] text-slate-500 font-mono">
                                          kcal
                                        </span>
                                      </span>
                                      <span className="text-[12px] font-bold text-blue-400">
                                        {item.protein}{" "}
                                        <span className="text-[9px] text-slate-500 font-mono">
                                          g
                                        </span>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="hidden sm:flex items-center gap-4 shrink-0 sm:justify-end text-right border-t sm:border-t-0 border-[#2a2a2a] pt-3 sm:pt-0 mt-2 sm:mt-0">
                                    <div>
                                      <span className="text-[9px] text-slate-500 uppercase font-mono block">
                                        Calories
                                      </span>
                                      <span className="text-[13px] font-bold text-white">
                                        {item.calories}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-500 uppercase font-mono block">
                                        Protéines
                                      </span>
                                      <span className="text-[13px] font-bold text-blue-400">
                                        {item.protein}
                                      </span>
                                    </div>
                                    <div className="hidden md:block">
                                      <span className="text-[9px] text-slate-500 uppercase font-mono block">
                                        Score
                                      </span>
                                      <span className="text-[13px] font-bold text-[#b088f1]">
                                        {item.health_score}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() =>
                                        deleteScanItem(item.id || "")
                                      }
                                      className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] hover:bg-rose-950/50 text-slate-600 hover:text-rose-400 rounded-full transition-colors shrink-0 ml-2 border border-transparent hover:border-rose-900/50"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Mobile Delete */}
                                  <button
                                    onClick={() =>
                                      deleteScanItem(item.id || "")
                                    }
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
                  <CoachPanel
                    history={history}
                    plan={plan}
                    onUnlockExpert={() => setShowPaywall(true)}
                  />
                </div>
              )}

              {/* TAB 5: PROFILE / PREMIUM */}
              {activeTab === "profile" && (
                <div className="space-y-8 animate-fade-in text-center">
                  <div className="bg-[#141414] border border-[#2a2a2a] p-8 sm:p-12 rounded-[32px] space-y-6 max-w-2xl mx-auto">
                    <span className="text-xs font-bold font-mono uppercase bg-[#7c3aed]/15 border border-[#7c3aed]/25 text-[#c084fc] px-3.5 py-1.5 rounded-full inline-block">
                      Profil
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Espace Membre
                    </h3>

                    <div className="p-6 bg-[#181818] border border-slate-800 rounded-2xl max-w-md mx-auto space-y-3 text-left">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">
                          Statut du compte:
                        </span>
                        <span className="text-[#00d4aa] font-extrabold">
                          {[
                            "pro",
                            "expert",
                            "starter",
                            "active",
                            "trialing",
                          ].includes(plan)
                            ? "PRO ACTIVE"
                            : "Gratuit"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Email:</span>
                        <span className="text-white font-bold font-mono">
                          {profileEmail || "Non renseigné"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Objectifs:</span>
                        <span className="text-white font-mono truncate max-w-[150px]">
                          {profileGoals.join(", ") || "Général"}
                        </span>
                      </div>
                    </div>
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
                  <h4 className="text-xs font-extrabold text-white block">
                    Scan My Macro Coach
                  </h4>
                  <span className="text-[9px] text-slate-400">
                    Online 24/7 • David & Marcus Assistance
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSupportBot(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Support message timeline content */}
            <div className="p-4 space-y-3.5 max-h-[220px] overflow-y-auto font-sans">
              {supportMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                    msg.sender === "bot"
                      ? "bg-[#202020] text-slate-200 mr-auto text-left"
                      : "bg-[#00d4aa] text-black font-semibold ml-auto text-right"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Reply Input Form */}
            <form
              onSubmit={handleSendSupport}
              className="p-3 bg-black/45 border-t border-[#252525] flex gap-2"
            >
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

      {showWeeklyReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowWeeklyReportModal(false)}
          ></div>
          <div className="relative w-full max-w-sm bg-[#141414] border-2 border-[#2a2a2a] rounded-[32px] p-6 shadow-2xl animate-fade-in-up">
            <button
              onClick={() => setShowWeeklyReportModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white bg-[#1a1a1a] p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-2 mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-[#00FF88] to-[#00aa55] text-black rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.2)]">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mt-4">
                Rapport Hebdomadaire
              </h3>
              <p className="text-xs text-slate-400">
                Analyse de vos 7 derniers jours
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                <span className="text-sm font-bold text-slate-300">
                  Calories moyennes
                </span>
                <span className="text-sm font-mono font-bold text-[#00FF88]">
                  {Math.round(
                    history.reduce(
                      (sum, item) => sum + (parseFloat(item.calories) || 0),
                      0,
                    ) /
                      Math.max(
                        1,
                        new Set(
                          history.map((item) => item.scannedAt?.split("T")[0]),
                        ).size,
                      ),
                  )}{" "}
                  <span className="text-[10px] text-slate-500">kcal/j</span>
                </span>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                <span className="text-sm font-bold text-slate-300">
                  Protéines moyennes
                </span>
                <span className="text-sm font-mono font-bold text-blue-400">
                  {Math.round(
                    history.reduce(
                      (sum, item) => sum + (parseFloat(item.protein) || 0),
                      0,
                    ) /
                      Math.max(
                        1,
                        new Set(
                          history.map((item) => item.scannedAt?.split("T")[0]),
                        ).size,
                      ),
                  )}{" "}
                  <span className="text-[10px] text-slate-500">g/j</span>
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-2xl text-center">
              <p className="text-xs text-[#00FF88] font-bold">
                💡{" "}
                {history.length > 0
                  ? "Excellente semaine ! Tu as un bon suivi global de tes macros. Continue sur ce rythme pour atteindre tes objectifs."
                  : "Ton historique est vide pour cette semaine. Commence à scanner tes repas !"}
              </p>
            </div>

            <button
              onClick={() => setShowWeeklyReportModal(false)}
              className="w-full bg-[#00FF88] text-black font-bold font-display text-sm py-4 rounded-2xl mt-6 active:scale-95 transition-all cursor-pointer"
            >
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
              Scan My Macro
            </span>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono tracking-widest">
              Commercial clinical sport diagnostic compounds
            </p>
          </div>
        </div>
        <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest pt-4 border-t border-[#1a1a1a]">
          © 2026 SCAN MY MACRO SAAS INC. CLINIC METRIC ANALYSIS CLUSTER. ALL
          RIGHTS RESERVED.
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {viewMode === "dashboard" && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d0d]/95 backdrop-blur-md border-t border-[#2a2a2a] z-50 px-6 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pb-safe-offset"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 1rem)",
            height: "calc(60px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <button
            onClick={() => {
              setActiveTab("home");
            }}
            className="flex flex-col items-center justify-center relative active:scale-95 transition-transform"
            style={{ width: "25%" }}
          >
            <div
              className={`absolute -bottom-[16px] h-[64px] w-[64px] rounded-full flex items-center justify-center border-4 border-[#0d0d0d] shadow-[0_0_20px_rgba(0,255,136,0.2)] ${activeTab === "home" ? "bg-[#00FF88]" : "bg-[#1a1a1a] border-[#2a2a2a]"}`}
            >
              <span className="text-3xl">📸</span>
            </div>
            <span
              className={`text-[10px] font-bold mt-[26px] ${activeTab === "home" ? "text-[#00FF88]" : "text-slate-400"}`}
            >
              Scanner
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("history");
            }}
            className={`flex flex-col items-center justify-center p-2 w-[25%] ${activeTab === "history" ? "text-[#00FF88]" : "text-slate-400"}`}
          >
            <span className="text-[22px] leading-none mb-1">📊</span>
            <span className="text-[10px] font-bold">Historique</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("coach");
            }}
            className={`flex flex-col items-center justify-center p-2 w-[25%] ${activeTab === "coach" ? "text-[#00FF88]" : "text-slate-400"}`}
          >
            <span className="text-[22px] leading-none mb-1">🐙</span>
            <span className="text-[10px] font-bold">Coach</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("profile");
            }}
            className={`flex flex-col items-center justify-center p-2 w-[25%] ${activeTab === "profile" ? "text-[#00FF88]" : "text-slate-400"}`}
          >
            <span className="text-[22px] leading-none mb-1">👤</span>
            <span className="text-[10px] font-bold">Profil</span>
          </button>
        </div>
      )}

      {/* PAYWALL MODAL */}
      {showPaywall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0B0F19] border border-[#2a2a2a] w-full max-w-xl rounded-[32px] p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#00FF88] opacity-10 blur-[80px] pointer-events-none rounded-full"></div>

            <div className="text-center space-y-4 relative z-10">
              <div className="mb-4 flex flex-col items-center group">
                {/* Transform animation container */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 mb-2 relative flex items-center justify-center text-7xl select-none group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center transition-all duration-1000 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 bg-[#1a1a1a] rounded-full border-4 border-[#00FF88]/30">
                    <Flame className="w-16 h-16 sm:w-20 sm:h-20 text-[#00FF88]" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center transition-all duration-1000 opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-150 bg-[#141414] rounded-full border-4 border-[#2a2a2a]">
                    <Lock className="w-16 h-16 sm:w-20 sm:h-20 text-slate-500" />
                  </div>
                </div>
                <div className="bg-[#141414] border border-[#2a2a2a] px-5 py-3 rounded-2xl relative inline-block">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#141414] border-t border-l border-[#2a2a2a] rotate-45 transform"></div>
                  <p className="text-sm text-slate-300 italic">
                    "Hé !<br />
                    Tu mérites de tout savoir sur ce que tu manges !<br />
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
                {/* STARTER PLAN */}
                <div className="bg-[#141414] border border-[#2a2a2a] p-5 rounded-3xl hover:border-[#00FF88]/50 transition-colors flex flex-col justify-between group">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                      STARTER{" "}
                      <span className="bg-[#1a1a1a] text-slate-400 text-[10px] px-2 py-0.5 rounded-full border border-[#222]">
                        0.90€/m
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-4 border-b border-[#2a2a2a] pb-3 block">
                      L'essentiel pour bien manger
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="text-[#00FF88]">✓</span> Scans basiques
                      </li>
                      <li className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="text-[#00FF88]">✓</span> Calories &
                        Macros
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/checkout-session", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            priceId: "starter",
                            userId: userId || "anonymous",
                            customer_email: profileEmail || undefined,
                          }),
                        });

                        if (!res.ok) {
                          const errorData = await res.text();
                          throw new Error(
                            `Erreur réseau: ${res.status} ${errorData}`,
                          );
                        }

                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                      } catch (e: any) {
                        console.error("Stripe Error Details:", e);
                        alert(
                          "Erreur de connexion avec Stripe. Veuillez vérifier votre réseau ou contacter le support.",
                        );
                      }
                    }}
                    className="w-full bg-[#1a1a1a] border border-[#222] group-hover:border-[#00FF88]/30 group-hover:bg-[#00FF88]/10 text-white py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    Choisir Starter
                  </button>
                </div>

                {/* PREMIUM PLAN */}
                <div className="bg-gradient-to-b from-[#1c2820] to-[#141414] border border-[#00FF88]/30 p-5 rounded-3xl hover:border-[#00FF88]/60 transition-colors flex flex-col justify-between group relative overflow-hidden">
                  <div className="absolute top-0 right-0 py-1 px-3 bg-[#00FF88]/20 text-[#00FF88] text-[9px] font-bold uppercase tracking-widest rounded-bl-xl border-l border-b border-[#00FF88]/30">
                    Recommandé
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                      PREMIUM{" "}
                      <span className="bg-[#1a1a1a] text-slate-400 text-[10px] px-2 py-0.5 rounded-full border border-[#222]">
                        6.99€/m
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-4 border-b border-[#2a2a2a] pb-3 block">
                      🏆 Accès Total
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="text-[#00FF88]">✓</span> Scans
                        illimités
                      </li>
                      <li className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="text-[#00FF88]">✓</span> Alerte Toxique
                      </li>
                      <li className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="text-[#00FF88]">✓</span> alternatives
                        saines
                      </li>
                      <li className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="text-[#00FF88]">✓</span> Coach IA
                        Complet
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/checkout-session", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            priceId: "price_1TcVGlIcQouyQI6K6uttG2JD",
                            userId: userId || "anonymous",
                            customer_email: profileEmail || undefined,
                          }),
                        });

                        if (!res.ok) {
                          const errorData = await res.text();
                          throw new Error(
                            `Erreur réseau: ${res.status} ${errorData}`,
                          );
                        }

                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                      } catch (e: any) {
                        console.error("Stripe Error Details:", e);
                        alert(
                          "Erreur de connexion avec Stripe. Veuillez vérifier votre réseau ou contacter le support.",
                        );
                      }
                    }}
                    className="w-full bg-[#00FF88] text-black py-2.5 rounded-xl font-bold text-xs shadow-[0_0_15px_rgba(0,255,136,0.3)] flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    Démarrer mes 7 jours gratuits{" "}
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-center gap-4">
                <p className="text-[11px] text-slate-500 font-medium">
                  7 jours gratuits • Sans engagement • Annulation en 1 clic
                </p>
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
