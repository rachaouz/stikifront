import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashPage          from "./pages/SplashPage";
import Home                from "./pages/Home";
import Auth                from "./pages/Auth";
import ChatbotPage         from "./pages/ChatbotPage";
import DashboardPage       from "./pages/DashboardPage";
import MissionPage         from "./pages/MissionPage";
import ModelsPage          from "./pages/ModelsPage";
import PlatformOverviewPage from "./pages/PlatformOverviewPage";
import PrivateRoute        from "./components/auth/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}