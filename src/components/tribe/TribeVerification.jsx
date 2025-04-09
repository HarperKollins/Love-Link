import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { verifyTribeCode } from '../../services/tribeService';

const TribeVerification = ({ currentUser, onVerificationComplete }) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const tribeInfo = await verifyTribeCode(code.trim().toUpperCase(), currentUser.uid);
      setSuccess(`Welcome to the ${tribeInfo.university} Tribe! 🎉`);
      onVerificationComplete(tribeInfo);
      setCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Join Your School Tribe</h2>
      
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
          <span className="text-3xl">🎓</span>
        </div>
        <p className="text-gray-600">
          Enter your School Tribe Code to connect with students from your university
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your tribe code (e.g., UNN-LINK-2025)"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !code.trim()}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
            isSubmitting || !code.trim()
              ? 'bg-pink-300 cursor-not-allowed'
              : 'bg-pink-500 hover:bg-pink-600'
          }`}
        >
          {isSubmitting ? 'Verifying...' : 'Join Tribe'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Don't have a code? Ask your campus ambassador or check your university's social media!</p>
      </div>
    </div>
  );
};

TribeVerification.propTypes = {
  currentUser: PropTypes.shape({
    uid: PropTypes.string.isRequired
  }).isRequired,
  onVerificationComplete: PropTypes.func.isRequired
};

export default TribeVerification;
