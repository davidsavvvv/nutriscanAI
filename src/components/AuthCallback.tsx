import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function AuthCallback() {
  const [message, setMessage] = useState("Connexion en cours...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkSessionAndRedirect = async (session: any) => {
      try {
        if (!session?.user?.id) return;

        // On vérifie l'abonnement
        const { data: profData, error: profError } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profError) {
          console.error("Profile fetch error:", profError);
        }

        // Si le profil n'existe pas, on le crée
        if (!profData && !profError) {
            await supabase.from('profiles').insert({ id: session.user.id });
        }

        const status = profData?.subscription_status;
        
        let hasAccess = false;
        if (session.user.email === "davidsauvaget69@gmail.com") {
           hasAccess = true;
        } else if (status && ['active', 'trialing', 'pro', 'expert', 'starter'].includes(status)) {
           hasAccess = true;
        }
        
        if (hasAccess) {
          window.location.href = "/scanner";
        } else {
          window.location.href = "/pricing";
        }
      } catch (err: any) {
        console.error("Callback error:", err);
        if (isMounted) setErrorMsg("Erreur de connexion, réessaie");
      }
    };

    // La bibliothèque Supabase gère automatiquement l'échange du "code" dans l'URL.
    // Il suffit d'écouter le changement d'état d'authentification ou de récupérer la session.
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("getSession error:", error);
        if (isMounted) setErrorMsg("Erreur de connexion, réessaie");
        return;
      }
      
      if (session) {
        checkSessionAndRedirect(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkSessionAndRedirect(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold font-display text-white mb-2">Oups, une erreur s'est produite</h2>
        <p className="text-slate-400 mb-8 max-w-sm">{errorMsg}</p>
        <button 
          onClick={() => window.location.href = "/login"}
          className="px-6 py-3 bg-[#111] hover:bg-[#222] text-white rounded-xl border border-[#333] transition-colors"
        >
          Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-[#00FF88] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-white font-medium">{message}</p>
    </div>
  );
}
