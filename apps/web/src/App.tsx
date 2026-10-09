import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.js';
import { PlaceholderPage } from './components/placeholders/PlaceholderPage.js';
import './styles/global.css';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PlaceholderPage
              title="Learner Login"
              description="Authentication services will connect when identity provider milestone arrives."
            />
          }
        />
        <Route
          path="/signup"
          element={
            <PlaceholderPage
              title="Learner Sign Up"
              description="Registration and onboarding workflows are planned for Phase 2."
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <PlaceholderPage
              title="Learner Dashboard"
              description="Dashboard view will present assigned missions, mastery progress, and upcoming tasks."
            />
          }
        />
        <Route
          path="/missions/:missionId"
          element={
            <PlaceholderPage
              title="Mission Execution Environment"
              description="Interactive live sandbox workspace for running real codebases."
            />
          }
        />
        <Route
          path="/profile"
          element={
            <PlaceholderPage
              title="Learner Skill Profile"
              description="Verified engineering skills, evidence records, and transfer scores."
            />
          }
        />
        <Route
          path="/reports"
          element={
            <PlaceholderPage
              title="Evaluation Reports"
              description="Forensic evidence reports and candidate verification summaries for reviewers."
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
