import React, { useState, useEffect } from 'react';
import { XMarkIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const WelcomePopup = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [isVisible, setIsVisible] = useState(true);

    // Check if user has seen the popup before
    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('lovelink_welcome_seen');
        if (hasSeenWelcome) {
            setIsVisible(false);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('lovelink_welcome_seen', 'true');
        setIsVisible(false);
        if (onClose) onClose();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white bg-opacity-20 rounded-full p-4">
                            <HeartIcon className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Welcome to Love Link! 💕
                    </h2>
                    <p className="text-pink-100">
                        {currentUser?.displayName ? `Hey ${currentUser.displayName}!` : 'Hey there!'}
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-white hover:text-pink-200 transition-colors"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>

                {/* Content */}
                <div className="px-6 py-6">
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <SparklesIcon className="h-6 w-6 text-pink-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-gray-800">Find Your Match</h3>
                                <p className="text-sm text-gray-600">
                                    Discover students from your campus who share your interests
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <HeartIcon className="h-6 w-6 text-pink-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-gray-800">Swipe & Connect</h3>
                                <p className="text-sm text-gray-600">
                                    Like profiles you're interested in and start meaningful conversations
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="h-6 w-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-pink-500 text-xs font-bold">3</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">3-Day Free Trial</h3>
                                <p className="text-sm text-gray-600">
                                    Enjoy full access during your trial period
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="mt-6 w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-[1.02]"
                    >
                        Start Exploring 💖
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-4">
                        Swipe right to like, left to pass
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomePopup;
