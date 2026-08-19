import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import logo from "../assets/logo.png"; // Adjust path to your logo asset

const PasswordEmailVerification = () => {
  // 1. Initialize state with 6 empty strings to prevent autofill on initial boxes
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(58);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, sentCode } = location.state || {};
  const [error, setError] = useState("");

  // 2. Focus the FIRST field on initial mount (index 0)
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Resend Countdown Timer logic
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Handle Input Changes
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Take only the last entered digit
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input field if current is filled
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Key Press (Backspace & Navigation)
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move focus back if box is already empty
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // Handle Paste Event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return; // Only allow numbers

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];

    digits.forEach((digit, index) => {
      newOtp[index] = digit;
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = digit;
      }
    });

    setOtp(newOtp);

    // Focus either the next empty slot or the last digit input
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    if (inputRefs.current[nextEmptyIndex]) {
      inputRefs.current[nextEmptyIndex].focus();
    }
  };

  // Format Timer Display (00:58)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const verificationCode = otp.join("");
    if (verificationCode.length !== 6) return;

    if (!sentCode || verificationCode !== String(sentCode)) {
      setError("The code is incorrect. Please check your email and try again.");
      return;
    }

    navigate("/reset-password", { state: { email } });
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(["", "", "", "", "", ""]);
    setTimer(58);
    setCanResend(false);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between p-6">
      {/* Header Bar */}
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center py-2">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="SmartRoute Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold text-xl text-slate-800">SmartRoute</span>
        </div>
        <Link
          to="/login"
          className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 bg-white px-3 py-1.5 rounded-lg shadow-sm transition-colors"
        >
          <IoChevronBack className="text-xs" />
          <span>Back to login</span>
        </Link>
      </header>

      {/* Main Verification Card */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10 text-center space-y-6">
          {/* Shield Icon Container */}
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100/70 flex items-center justify-center text-emerald-600">
              <HiOutlineShieldCheck className="w-7 h-7" />
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Verify code
            </h1>
            <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
              An authentication code has been sent to your email.
            </p>
          </div>

          {/* Verification Code Inputs */}
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <div
              className="flex justify-center items-center gap-2 md:gap-3"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  autoComplete="off" // Disable browser autofill suggestions
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`w-11 h-14 md:w-12 md:h-14 text-center text-xl font-semibold border rounded-xl outline-none transition-all ${
                    digit
                      ? "border-emerald-500 text-slate-900 bg-white"
                      : "border-slate-200 bg-slate-50/50 text-slate-800"
                  } focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:bg-white`}
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}

            {/* Resend Code Timer */}
            <div className="text-xs text-slate-400 font-medium">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-emerald-600 font-semibold hover:underline cursor-pointer"
                >
                  Resend code now
                </button>
              ) : (
                <span>Resend code in {formatTime(timer)}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={otp.join("").length !== 6}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-all text-sm shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Verify</span>
              <IoChevronForward className="text-xs" />
            </button>
          </form>

          {/* Help & Edit Email Options */}
          <div className="space-y-3 pt-2">
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Didn't receive the email? Check your spam folder or try again
              later.
            </p>
            <Link
              to="/email-forgot-password"
              className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800 tracking-wider uppercase transition-colors"
            >
              EDIT EMAIL ADDRESS
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 py-2 gap-2">
        <p>© 2024 SmartRoute Logistics. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#privacy" className="hover:text-slate-600 transition-colors">
            Privacy Policy
          </a>
          <a href="#api" className="hover:text-slate-600 transition-colors">
            API Documentation
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PasswordEmailVerification;
