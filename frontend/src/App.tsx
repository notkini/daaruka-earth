import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import ProjectDetail from "./pages/ProjectDetail";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import SiteAnalytics from "./pages/SiteAnalytics";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/projects/:projectId"
          element={<ProjectDetail />}
        />

        <Route
          path="/sites/:siteId"
          element={<SiteAnalytics />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;