import React from 'react'
import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Matches from './pages/Matches'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import Pricing from './pages/Pricing'
import StudentLounge from './components/feed/StudentLounge'
import TribeCodeAdmin from './components/tribe/TribeCodeAdmin'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <PrivateRoute>
                <Matches />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/lounge"
            element={
              <PrivateRoute>
                <StudentLounge currentUser={currentUser} />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/tribe-codes"
            element={
              <PrivateRoute>
                {currentUser?.isAdmin ? (
                  <TribeCodeAdmin />
                ) : (
                  <div className="max-w-4xl mx-auto p-6">
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      <p>You do not have permission to access this page.</p>
                    </div>
                  </div>
                )}
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
