import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import DemoGate from './components/DemoGate'
import NavBar from './components/NavBar'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import WantListingDetailPage from './pages/WantListingDetailPage'
import CreateListingPage from './pages/CreateListingPage'
import EditListingPage from './pages/EditListingPage'
import DashboardPage from './pages/DashboardPage'
import AddVehiclePage from './pages/AddVehiclePage'
import EditVehiclePage from './pages/EditVehiclePage'
import VehicleMatchesPage from './pages/VehicleMatchesPage'
import IntroductionsPage from './pages/IntroductionsPage'
import MessagesPage from './pages/MessagesPage'
import ChatPage from './pages/ChatPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <DemoGate>
      <NavBar />
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
          <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />
          <Route path="/want-listings/:id" element={<WantListingDetailPage />} />

          {/* Unified dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          {/* Backward-compat redirects for old dashboard URLs */}
          <Route path="/buyer/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/seller/dashboard" element={<Navigate to="/dashboard" replace />} />

          {/* Listing routes — any authenticated user */}
          <Route path="/create-listing" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
          <Route path="/buyer/create-listing" element={<Navigate to="/create-listing" replace />} />
          <Route path="/edit-listing/:id" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
          <Route path="/buyer/edit-listing/:id" element={<Navigate to="/edit-listing/:id" replace />} />

          {/* Vehicle routes — any authenticated user */}
          <Route path="/add-vehicle" element={<ProtectedRoute><AddVehiclePage /></ProtectedRoute>} />
          <Route path="/seller/add-vehicle" element={<Navigate to="/add-vehicle" replace />} />
          <Route path="/edit-vehicle/:id" element={<ProtectedRoute><EditVehiclePage /></ProtectedRoute>} />
          <Route path="/seller/edit-vehicle/:id" element={<Navigate to="/edit-vehicle/:id" replace />} />
          <Route path="/vehicles/:id/matches" element={<ProtectedRoute><VehicleMatchesPage /></ProtectedRoute>} />
          <Route path="/seller/vehicles/:id/matches" element={<Navigate to="/vehicles/:id/matches" replace />} />

          {/* Shared protected routes */}
          <Route path="/introductions" element={<ProtectedRoute><IntroductionsPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/messages/:introductionId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<RoleRoute role="admin"><AdminPage /></RoleRoute>} />
        </Routes>
      </Layout>
      </DemoGate>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
