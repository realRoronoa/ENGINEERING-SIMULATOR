import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.js';
import { Privacy } from './pages/Privacy.js';
import { Terms } from './pages/Terms.js';

import { Login } from './features/auth/Login.js';
import { Signup } from './features/auth/Signup.js';
import { ForgotPassword } from './features/auth/ForgotPassword.js';

import { Onboarding } from './features/onboarding/Onboarding.js';
import { Diagnostic } from './features/diagnostic/Diagnostic.js';
import { DiagnosticResults } from './features/diagnostic/DiagnosticResults.js';

import { Dashboard } from './features/dashboard/Dashboard.js';
import { MissionsLibrary } from './features/missions/MissionsLibrary.js';
import { MissionWorkspace } from './features/missions/MissionWorkspace.js';
import { Evaluation } from './features/evaluation/Evaluation.js';
import { Viva } from './features/viva/Viva.js';
import { TransferTask } from './features/transfer/TransferTask.js';

import { Profile } from './features/profile/Profile.js';
import { ProgressHistory } from './features/profile/ProgressHistory.js';
import { WeeklyReport } from './features/reports/WeeklyReport.js';

import { useLearner } from './state/LearnerContext.js';
import './styles/global.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useLearner();
  if (!state.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/diagnostic"
          element={
            <ProtectedRoute>
              <Diagnostic />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/results"
          element={
            <ProtectedRoute>
              <DiagnosticResults />
            </ProtectedRoute>
          }
        />

        {/* Learner Workspace */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/missions"
          element={
            <ProtectedRoute>
              <MissionsLibrary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/missions/:missionId"
          element={
            <ProtectedRoute>
              <MissionWorkspace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/missions/:missionId/evaluation/:attemptId"
          element={
            <ProtectedRoute>
              <Evaluation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/missions/:missionId/viva/:attemptId"
          element={
            <ProtectedRoute>
              <Viva />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer/:taskId"
          element={
            <ProtectedRoute>
              <TransferTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/weekly"
          element={
            <ProtectedRoute>
              <WeeklyReport />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
