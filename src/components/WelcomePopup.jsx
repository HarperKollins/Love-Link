import React from 'react';
import PropTypes from 'prop-types';

const WelcomePopup = ({ onClose, isFirstTime }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-4xl mb-4">💝</div>
          <h2 className="text-2xl font-bold mb-4">
            {isFirstTime ? 'Welcome to Love Link!' : 'Welcome Back!'}
          </h2>
          
          <div className="space-y-4 text-gray-600 mb-6">
            <p>
              {isFirstTime
                ? "You're about to discover amazing connections in your university."
                : "Ready to find your perfect match?"}
            </p>
            
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="font-semibold text-pink-700 mb-2">Quick Tips:</h3>
              <ul className="text-left text-sm space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">💫</span>
                  <span>Swipe right on profiles you like</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🎯</span>
                  <span>Use filters to find your ideal match</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">💌</span>
                  <span>Send a message when you match!</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors"
          >
            {isFirstTime ? "Let's Get Started!" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

WelcomePopup.propTypes = {
  onClose: PropTypes.func.isRequired,
  isFirstTime: PropTypes.bool
};

WelcomePopup.defaultProps = {
  isFirstTime: true
};

export default WelcomePopup;
