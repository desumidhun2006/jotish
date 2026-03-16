import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './providers/AuthProvider'; // Assuming ProtectedRoute is exported from AuthProvider.jsx

// Lazy-load pages for performance. The JS for each page won't be downloaded
// by the browser until the user navigates to it.
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const EmployeeListPage = React.lazy(() => import('./pages/EmployeeListPage'));
const EmployeeDetailPage = React.lazy(() => import('./pages/EmployeeDetailPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));

// A simple loading component to show while pages are being lazy-loaded.
const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-screen bg-gray-100">
    <p className="text-lg text-gray-600">Loading Dashboard...</p>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/list"
          element={
            <ProtectedRoute>
              <EmployeeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/details/:id"
          element={
            <ProtectedRoute>
              <EmployeeDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback route: redirect any unknown URL to the login page */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
