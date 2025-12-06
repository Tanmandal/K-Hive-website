'use client';
import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

export default function SignUpModal({ isOpen, onClose, initialMode = 'signup' }) {
    const [mode, setMode] = useState(initialMode);
    const [isVisible, setIsVisible] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            setIsVisible(false);
            setShowSuccess(false);
            setErrorMessage('');
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on ESC key - disabled until Google login is attempted
    useEffect(() => {
        const handleEsc = (e) => {
            // ESC is completely disabled - user must perform Google login action
            return;
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose, showSuccess, isSigningIn]);

    const handleClose = () => {
        // Close is disabled - user must interact with Google login button
        return;
    };

    const handleGoogleSignIn = async () => {
        // Show email input form
        setShowEmailInput(true);
        setErrorMessage('');
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsSigningIn(true);
        setErrorMessage('');

        try {
            if (!email.trim()) {
                setErrorMessage('Please enter your email address.');
                setIsSigningIn(false);
                return;
            }
            
            // Validate KIIT email domain
            if (!email.endsWith('@kiit.ac.in')) {
                setErrorMessage('Only @kiit.ac.in email addresses are allowed. Please use your KIIT email.');
                setIsSigningIn(false);
                return;
            }
            
            // Simulate authentication delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Success - show animation and then close
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setIsSigningIn(false);
                setShowEmailInput(false);
                setEmail('');
                // Actually close the modal after successful login
                setIsVisible(false);
                setTimeout(() => {
                    onClose();
                    setMode(initialMode);
                    setErrorMessage('');
                }, 300);
            }, 2000);
        } catch (error) {
            console.error('Sign-in error:', error);
            setErrorMessage('An error occurred. Please try again.');
            setIsSigningIn(false);
        }
    };

    // Return null when modal is closed - prevents rendering
    if (!isOpen) return null;

    return (
        <>
            <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(40px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateY(40px) scale(0.95);
            opacity: 0;
          }
        }

        @keyframes checkmark {
          0% {
            transform: scale(0) rotate(-45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(-45deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.6;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .slide-in-up {
          animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pulse-animate {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .modal-enter {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-exit {
          animation: slideDown 0.3s ease-in-out;
        }

        .checkmark-animate {
          animation: checkmark 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ripple-effect {
          animation: ripple 0.6s ease-out;
        }

        .shake-error {
          animation: shake 0.4s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        .glass-morphism {
          background: rgba(26, 26, 27, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>

            {/* FIXED FULL-SCREEN OVERLAY */}
            <div
                className={`fixed inset-0 z-[999] flex items-center justify-center p-4 transition-all duration-300 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {/* BACKGROUND CLICK HANDLER - Disabled */}
                <div
                    className="absolute inset-0 backdrop-blur-md bg-black/60 cursor-not-allowed"
                    onClick={(e) => e.preventDefault()}
                />

                {/* Modal Container */}
                <div
                    className={`relative glass-morphism border border-[#2a2a2b] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ${
                        isVisible ? 'modal-enter' : 'modal-exit'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Gradient glow effect */}
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00ff1187] rounded-full blur-[100px] opacity-20" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#ff4500] rounded-full blur-[100px] opacity-10" />

                    {/* Success Overlay */}
                    {showSuccess && (
                        <div className="absolute inset-0 glass-morphism z-10 flex items-center justify-center">
                            <div className="text-center">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-[#00ff1187] rounded-full ripple-effect" />
                                    <div className="relative bg-[#00ff1187] rounded-full p-6 shadow-2xl">
                                        <Check className="w-16 h-16 text-white checkmark-animate" strokeWidth={3} />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mt-6 mb-2">Success!</h3>
                                <p className="text-gray-300">Redirecting you now...</p>
                            </div>
                        </div>
                    )}

                    {/* Close Button - Disabled */}
                    <button
                        onClick={(e) => e.preventDefault()}
                        disabled={true}
                        className="absolute top-5 right-5 z-20 p-2 rounded-full transition-all duration-200 opacity-40 cursor-not-allowed text-gray-400"
                        aria-label="Close disabled until login"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Content */}
                    <div className="relative p-8 pt-12">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00ff1187] to-[#00ff1144] rounded-2xl mb-4 shadow-lg">
                                <span className="text-3xl">🚀</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
                                {mode === 'signup' ? 'Join the Hive' : 'Welcome Back'}
                            </h2>
                            <p className="text-gray-400 text-sm">
                                {mode === 'signup'
                                    ? 'Create your account and start exploring'
                                    : 'Log in to continue your journey'}
                            </p>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 shake-error">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300">{errorMessage}</p>
                            </div>
                        )}

                        {/* Email Input Form - Shows after clicking Google button */}
                        {showEmailInput ? (
                            <form onSubmit={handleEmailSubmit} className="space-y-4 slide-in-up">
                                <div className="relative">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                        KIIT Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your.name@kiit.ac.in"
                                            disabled={isSigningIn}
                                            className="w-full px-4 py-4 bg-[#2a2a2b] border border-[#3a3a3b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff1187] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            autoFocus
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                            🎓
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Only institutional email addresses are accepted
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEmailInput(false);
                                            setEmail('');
                                            setErrorMessage('');
                                        }}
                                        disabled={isSigningIn}
                                        className="flex-1 py-3 px-4 rounded-xl bg-[#2a2a2b] hover:bg-[#3a3a3b] text-gray-300 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSigningIn}
                                        className="flex-1 py-3 px-4 rounded-xl bg-[#00ff1187] hover:bg-[#00ff11] text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                    >
                                        {isSigningIn ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>Continue</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                {/* Google Sign-In Button */}
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={isSigningIn}
                                    className="group relative w-full py-4 px-6 rounded-2xl bg-white text-gray-900 font-semibold flex items-center justify-center gap-3 shadow-xl transition-all duration-300 transform overflow-hidden hover:bg-gray-50 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                                    <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span className="relative z-10">Continue with Google</span>
                                </button>

                                {/* KIIT Email Notice */}
                                <p className="text-center text-xs text-gray-500 mt-3">
                                    🎓 Only KIIT email addresses (@kiit.ac.in) are allowed
                                </p>
                            </>
                        )}

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#343536]" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-4 bg-[#1a1a1b] text-gray-500 uppercase tracking-wider">
                                    or
                                </span>
                            </div>
                        </div>

                        {/* Toggle Mode */}
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">
                                {mode === 'signup' ? 'Already a member?' : "Don't have an account?"}{' '}
                                <button
                                    onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                                    disabled={isSigningIn}
                                    className={`text-[#00ff1187] hover:text-[#00ff11] font-semibold hover:underline transition-colors inline-flex items-center gap-1
                                        ${isSigningIn ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {mode === 'signup' ? 'Log in' : 'Sign up'}
                                    <span className="text-base">{mode === 'signup' ? '🔐' : '✨'}</span>
                                </button>
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-[#343536]">
                            <p className="text-center text-xs text-gray-500 leading-relaxed">
                                By continuing, you agree to our{' '}
                                <a href="#" className="text-gray-400 hover:text-white underline transition-colors">
                                    Terms
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-gray-400 hover:text-white underline transition-colors">
                                    Privacy Policy
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}