import React from 'react';
import { Link } from 'react-router-dom';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import Button from '../components/ui/Button';

const Onboarding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex flex-col items-center justify-center p-6">
      {/* Logo and Title */}
      <div className="text-center mb-12">
        <div className="bg-white/20 p-6 rounded-full inline-block mb-6">
          <ChatBubbleLeftRightIcon className="h-16 w-16 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Love Link</h1>
        <p className="text-white/80 text-lg">
          Find your perfect match today
        </p>
      </div>

      {/* Features */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 w-full max-w-md">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-white">Smart Matching Algorithm</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-white">Real-time Chat</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-white">Secure & Private</span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full max-w-md space-y-4">
        <Link to="/signup" className="block">
          <Button fullWidth size="large">
            Join Us
          </Button>
        </Link>
        
        <Link to="/login" className="block">
          <Button variant="secondary" fullWidth size="large">
            Already have an account? Log in
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Onboarding; 