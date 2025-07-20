import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Mail, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) return setError('Please enter your email address');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError('Please enter a valid email address');

    setIsRequestingOtp(true);
    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'reset' }),
      });
      const data = await response.json();

      if (response.ok) {
        setShowOtpInput(true);
        setSuccess('OTP sent to your email address');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp) return setError('Please enter the OTP');

    setIsVerifyingOtp(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();

      if (response.ok) {
        setIsOtpVerified(true);
        setSuccess('Email verified successfully! You can now set a new password.');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters long');

    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successfully! Redirecting to sign in...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmitHandler = () => isOtpVerified ? handleResetPassword : showOtpInput ? handleVerifyOtp : handleRequestOtp;

  const getSubmitButtonText = () => {
    if (isLoading) return 'Resetting Password...';
    if (isVerifyingOtp) return 'Verifying...';
    if (isRequestingOtp) return 'Sending OTP...';
    if (isOtpVerified) return 'Reset Password';
    if (showOtpInput) return 'Verify OTP';
    return 'Send OTP';
  };

  const isSubmitDisabled = () => {
    if (isLoading || isRequestingOtp || isVerifyingOtp) return true;
    if (isOtpVerified) return !newPassword || !confirmPassword;
    if (showOtpInput) return !otp;
    return !email;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SkillSwap</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-gray-600">Enter your email to receive a verification code</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={getSubmitHandler()} className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">{success}</div>}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isOtpVerified}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {showOtpInput && !isOtpVerified && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                />
                <p className="text-xs text-gray-500 mt-2">Check your email for the 6-digit OTP code</p>
              </div>
            )}

            {isOtpVerified && (
              <>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {getSubmitButtonText()}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
