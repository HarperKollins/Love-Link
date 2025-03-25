import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useSubscription } from './contexts/SubscriptionContext'

// Layout Components
import BottomNavigation from './components/layout/BottomNavigation'
import TrialBanner from './components/payment/TrialBanner'

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import Profile from './pages/Profile'
import Matches from './pages/Matches'
import ChatList from './pages/ChatList'
import ChatDetail from './pages/ChatDetail'
import Subscription from './pages/Subscription'

function App() {
  const { currentUser } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {currentUser && <TrialBanner />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Protected Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/matches" element={
          <ProtectedRoute>
            <Matches />
          </ProtectedRoute>
        } />
        
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatList />
          </ProtectedRoute>
        } />
        
        <Route path="/chat/:matchId" element={
          <ProtectedRoute>
            <ChatDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/subscription" element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        } />
        
        {/* Redirect to login or matches based on auth state */}
        <Route path="/" element={
          currentUser ? <Navigate to="/matches" /> : <Navigate to="/login" />
        } />
      </Routes>
      
      {currentUser && <BottomNavigation />}
    </div>
  )
}

export default App
