const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add tracking effect
const trackingEffect = `
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
`;
code = code.replace(
  '  useEffect(() => {',
  trackingEffect + '\n  useEffect(() => {'
);

// Inject affiliate_ref into checkout session
code = code.replace(
  /body: JSON\.stringify\(\{ priceId(.*?), userId(.*?), customer_email(.*?)\}\)/g,
  'body: JSON.stringify({ priceId$1, userId$2, customer_email$3, affiliate_ref: localStorage.getItem("ns_affiliate_ref") || undefined })'
);

// We also need to increment 'signups' if they register on the platform. But actually, the backend isn't tracking individual signups via an endpoint, the signup is through Supabase Auth.
// A simpler way: we'll handle the dashboard views.
// Add "Admin Affiliates" to viewMode enum
const viewModeRegex = /useState<"landing" \| "dashboard" \| "login" \| "pricing" \| "auth-callback" \| "email-unverified">/;
if (viewModeRegex.test(code)) {
  code = code.replace(
    'useState<"landing" | "dashboard" | "login" | "pricing" | "auth-callback" | "email-unverified">',
    'useState<"landing" | "dashboard" | "login" | "pricing" | "auth-callback" | "email-unverified" | "admin-affiliates" | "affiliate-dashboard">'
  );
} else {
  // If we missed it (the regex may be slightly different depending on what happened previously)
  code = code.replace(/useState<"landing" \|.*? \((.*)\);/, 'useState<string>($1);');
}

// Add the Admin Affiliates block inside the render body
const adminView = `
      {viewMode === "admin-affiliates" && (
        <AdminAffiliates onBack={() => { setViewMode("dashboard"); setActiveTab("home"); }} session={session} />
      )}
      {viewMode === "affiliate-dashboard" && (
        <AffiliateDashboard onBack={() => { setViewMode("dashboard"); setActiveTab("home"); }} session={session} />
      )}
`;
// add inside the root div, near other viewMode cases
code = code.replace(
  '{viewMode === "landing" && (',
  adminView + '\n      {viewMode === "landing" && ('
);

// Add Sidebar links for Affiliates if eligible? Or just a menu button.
// For the affiliate dashboard, let's create a nav item just for David => Admin.
const sidebarNavs = `
                  {profileEmail === "davidsauvaget69@gmail.com" && { id: "admin-affiliates", label: "Admin Affiliés", icon: <Users className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} /> }},
                  { id: "affiliate-dashboard", label: "Programme Affiliation", icon: <Award className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} /> }
`;
// we need to insert this into the sidebar array cleanly.
const sidebarArrayRegex = /\s*\{\s*id:\s*"profile",\s*label:\s*"Profil",\s*icon:.*?\}\s*/;
code = code.replace(sidebarArrayRegex, (match) => {
   return match + `, 
                  (profileEmail === "davidsauvaget69@gmail.com" ? { id: "admin-affiliates", label: "Admin Affiliés", icon: <Users className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} /> } : null),
                  { id: "affiliate-dashboard", label: "Programme Affiliation", icon: <Award className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} /> }
   `.trim();
});

// Since we are pushing nulls to the array, we need to filter them out
code = code.replace(/\.map\(\(item\) => \{/g, '.filter(Boolean).map((item) => {');

// The clicking of these items should set the viewMode.
const sidebarClickRegex = /setActiveTab\(item\.id as any\);/g;
code = code.replace(sidebarClickRegex, `
                          if (item.id === "admin-affiliates" || item.id === "affiliate-dashboard") {
                             setViewMode(item.id);
                          } else {
                             setActiveTab(item.id as any);
                          }
`);

// Imports 
const imports = `
import AdminAffiliates from "./components/AdminAffiliates";
import AffiliateDashboard from "./components/AffiliateDashboard";
`;
code = code.replace(/import \{.*?\} from "lucide-react";/, (m) => m + '\n' + imports);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("App.tsx tracked successfully");
