const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add OnboardingTunnel import
if (!code.includes('OnboardingTunnel')) {
  code = code.replace(
    'import { Login } from "./components/Login";',
    'import { Login } from "./components/Login";\nimport { OnboardingTunnel } from "./components/OnboardingTunnel";'
  );
}

// 2. Add handleLogout function
if (!code.includes('const handleLogout = async () =>')) {
  const handleLogoutCode = `
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
`;
  code = code.replace(/(const resetOnboarding = \(\) => {)/, `${handleLogoutCode}\n  $1`);
}

// 3. Use handleLogout in the button
code = code.replace(
  /onClick=\{async \(\) => \{\s*await supabase\.auth\.signOut\(\);\s*setViewMode\("landing"\);\s*\}\}/g,
  'onClick={handleLogout}'
);


// 4. Update viewMode type and unverified check
code = code.replace(/useState<"landing" \| "dashboard" \| "login" \| "pricing" \| "auth-callback">/g, 
  'useState<"landing" | "dashboard" | "login" | "pricing" | "auth-callback" | "email-unverified">');

// Update onAuthStateChange
const oldOnAuth = `(async () => {
          const hasPlan = await fetchUserPlan(session.user.id, session.user?.email);`;
const newOnAuth = `(async () => {
          if (!session.user.email_confirmed_at && session.user.app_metadata?.provider === 'email') {
             setViewMode("email-unverified");
             return;
          }
          const hasPlan = await fetchUserPlan(session.user.id, session.user?.email);`;
if (code.includes(oldOnAuth)) {
    code = code.replace(oldOnAuth, newOnAuth);
}

// Fix background colors (bg-[#0a0a0a] -> bg-[#0B0F19])
code = code.replace(/bg-\[#0a0a0a\]/g, 'bg-[#0B0F19]');

// Fix Sidebar identity card
const oldSidebarIdentity = `{/* User Identity HUD Card */}
              <div className="p-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#00d4aa] flex items-center justify-center font-bold text-xs uppercase text-black">
                  {profileEmail ? profileEmail.substring(0, 2).toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-white block truncate">{profileEmail || "No Email"}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex w-1.5 h-1.5 bg-[#00d4aa] rounded-full" />
                    <span className="text-[10px] font-mono text-[#00d4aa] uppercase font-bold tracking-wider">
                      {['pro', 'expert', 'starter', 'active', 'trialing'].includes(plan) ? "PRO" : "Gratuit"}
                    </span>
                  </div>
                </div>
              </div>`;

const newSidebarIdentity = `{/* User Identity HUD Card */}
              <div className="p-4 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-xs uppercase text-black shadow-lg">
                  {profileEmail ? profileEmail.substring(0, 2).toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                     {profileEmail ? profileEmail.split('@')[0] + '...' : "No Email"}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                      {['pro', 'expert', 'starter', 'active', 'trialing'].includes(plan) ? "PRO" : "Gratuit"}
                    </span>
                  </div>
                </div>
              </div>`;
if (code.includes(oldSidebarIdentity)) {
    code = code.replace(oldSidebarIdentity, newSidebarIdentity);
}

// Add the OnboardingTunnel and email unverified views
const newViews = `
      {viewMode === "email-unverified" && (
        <div className="w-full flex-grow flex items-center justify-center min-h-[80vh]">
           <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                 <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold font-display text-white mb-2">Veuillez vérifier votre email</h2>
              <p className="text-sm text-slate-400 mb-6 font-medium">Pour accéder à votre tableau de bord, cliquez sur le lien que nous avons envoyé à <b>{profileEmail}</b>.</p>
              <button onClick={() => window.location.reload()} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] mb-4">
                 J'ai confirmé mon email
              </button>
              <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-white transition-colors underline underline-offset-2">Se déconnecter</button>
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
                await supabase.from("profiles").upsert({
                   id: userId,
                   goals,
                   sex,
                   age: parseInt(age),
                   height: parseInt(height),
                   weight: parseFloat(weight)
                }, { onConflict: 'id' });
             }
             
             setBoardingActive(false);
             handleFinishOnboarding();
          }} 
        />
      )}
`;

// we will replace the big block from '{/* FULL-SCREEN ONBOARDING OVERLAY FLUID STEPSEQUENCE */}' to its end
const startIndex = code.indexOf('{/* FULL-SCREEN ONBOARDING OVERLAY FLUID STEPSEQUENCE */}');
if (startIndex !== -1) {
    const endString = '                </div>\n              )}\n\n            </div>\n          </div>\n        </div>\n        </div>\n      )}';
    const endIndex = code.indexOf(endString, startIndex);
    if (endIndex !== -1) {
        code = code.slice(0, startIndex) + newViews + code.slice(endIndex + endString.length);
    } else {
        console.error("Could not find endIndex for the big overlay.")
    }
}

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Rewrite complete!");
