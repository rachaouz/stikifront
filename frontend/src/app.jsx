import { lazy, Suspense }          from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DarkModeProvider }        from "./context/DarkModeContext";
import PrivateRoute                from "./components/auth/PrivateRoute";

// Pages lourdes → chargées uniquement quand la route est visitée
const SplashPage           = lazy(() => import("./pages/SplashPage"));
const Home                 = lazy(() => import("./pages/Home"));
const Auth                 = lazy(() => import("./pages/Auth"));
const ChatbotPage          = lazy(() => import("./pages/ChatbotPage"));
const DashboardPage        = lazy(() => import("./pages/DashboardPage"));
const MissionPage          = lazy(() => import("./pages/MissionPage"));
const ModelsPage           = lazy(() => import("./pages/ModelsPage"));
const PlatformOverviewPage = lazy(() => import("./pages/PlatformOverviewPage"));

// Fallback minimal pendant le chargement — sans impact visuel
function PageLoader() {
  return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#040a12", color: "rgba(0,168,255,0.4)",
      fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "3px",
    }}>
      LOADING...
    </div>
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"          element={<SplashPage />} />
            <Route path="/home"      element={<Home />} />
            <Route path="/auth"      element={<Auth />} />
            <Route path="/mission"   element={<MissionPage />} />
            <Route path="/models"    element={<ModelsPage />} />
            <Route path="/platform"  element={<PlatformOverviewPage />} />
            <Route path="/chat"      element={<PrivateRoute><ChatbotPage /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </DarkModeProvider>
  );
}