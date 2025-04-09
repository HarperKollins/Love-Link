import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              Find Your Perfect Match with <span className="text-pink-600">Love Link</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Connect with like-minded individuals and start your journey to finding true love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {!currentUser ? (
                <>
                  <Link
                    to="/register"
                    className="bg-pink-600 text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-pink-700 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-pink-600 text-pink-600 px-6 py-3 rounded-lg text-center font-medium hover:bg-pink-50 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/lounge"
                    className="bg-pink-600 text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Student Lounge</span>
                    <span className="text-sm bg-pink-700 px-2 py-1 rounded">New!</span>
                  </Link>
                  <Link
                    to="/matches"
                    className="bg-pink-500 text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-pink-600 transition-colors"
                  >
                    View Matches
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
              alt="Couple enjoying time together"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Love Link?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-pink-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Our advanced algorithm helps you find compatible matches based on your preferences and interests.
              </p>
            </div>
            <div className="bg-pink-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
              <p className="text-gray-600">
                Connect instantly with your matches through our secure and user-friendly chat system.
              </p>
            </div>
            <div className="bg-pink-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-gray-600">
                Your privacy and security are our top priorities. We use advanced encryption to protect your data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-pink-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your Match?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Join thousands of singles who have found love through Love Link.
          </p>
          {!currentUser ? (
            <Link
              to="/register"
              className="bg-white text-pink-600 px-8 py-3 rounded-lg font-medium hover:bg-pink-50 transition-colors inline-block"
            >
              Create Your Profile
            </Link>
          ) : (
            <Link
              to="/matches"
              className="bg-white text-pink-600 px-8 py-3 rounded-lg font-medium hover:bg-pink-50 transition-colors inline-block"
            >
              View Your Matches
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 