import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Love Link</h3>
            <p className="text-gray-500 text-sm">
              Find your perfect match and build meaningful connections.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-900 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/matches" className="text-gray-500 hover:text-gray-900 text-sm">
                  Matches
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-gray-500 hover:text-gray-900 text-sm">
                  Chat
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy" className="text-gray-500 hover:text-gray-900 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-500 hover:text-gray-900 text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Contact
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="mailto:harperkollinsinc@gmail.com" className="text-gray-500 hover:text-gray-900 text-sm">
                  harperkollinsinc@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+2348163048787" className="text-gray-500 hover:text-gray-900 text-sm">
                  +234 816 304 8787
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} Love Link. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 