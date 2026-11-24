
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Assessment from "./pages/Assessment";
import Achievements from "./pages/Achievements";
import CareerGoals from "./pages/CareerGoals";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Discovery from "./pages/Discovery";
import CareerCoach from "./pages/CareerCoach";
import Simulation from "./pages/Simulation";
import SimulationHistory from "./pages/SimulationHistory";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/simulation/:sessionId" element={<Simulation />} />
          <Route path="/history" element={<SimulationHistory />} />
          <Route path="/assessment/:sessionId" element={<Assessment />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/goals" element={<CareerGoals />} />
          <Route path="/career-coach" element={<CareerCoach />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
