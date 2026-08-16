import React, { useState, useRef, useEffect } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineCheck,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineChatBubbleLeftEllipsis,
  HiChevronRight,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";

const EmailVerification = () => {
  const navigate = useNavigate();
  const { logout, verifyEmail } = useAuth();

  // OTP State (6 digits)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // Countdown & Toast State
  const [timer, setTimer] = useState(58);
  const [showToast, setShowToast] = useState(false);

  // Countdown timer logic
  useEffect(() => {
    if (timer <= 0) return;

    const countdown = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  // Handle manual resend click
  const handleResendCode = () => {
    if (timer > 0) return;

    // 1. Reset timer back to 58 seconds
    setTimer(59);

    // 2. Show styled toast notification
    setShowToast(true);

    // 3. Auto-hide toast after 4 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 4000);

    // TODO: Add your API call here to actually resend the OTP email
  };

  const handleChange = (value, index) => {
    const cleanedValue = value.replace(/\D/g, "").slice(-1);

    if (!cleanedValue && value !== "") {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanedValue;
    setOtp(newOtp);

    if (cleanedValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) {
      return;
    }

    const newOtp = [...otp];
    pastedData.split("").forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleEditEmail = () => {
    logout();
    window.location.href = "/register";
  };

  const isCodeComplete = otp.every((digit) => digit !== "");

  const handleVerify = (e) => {
    if (e) {
      e.preventDefault();
    }

    const code = otp.join("");
    if (code.length < 6) {
      return;
    }

    verifyEmail();
    navigate("/account-under-review", { replace: true });
  };

//   useEffect(() => {
//     const code = otp.join("");
//     if (code.length === 6) {
//       handleVerify(null);
//     }
//   }, [otp]);

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-slate-100/70 text-slate-800 font-sans">
      {/* Styled Toast Notification */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 transition-all duration-300 animate-bounce-short">
          <HiOutlineCheckCircle className="text-emerald-400 text-xl shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-white">Verification code sent!</p>
            <p className="text-slate-300 text-[11px]">
              Check your inbox or spam folder.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200/80 px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center justify-center space-x-1">
          <div className="w-8 h-8">
            <img src={logo} alt="" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            SmartRoute
          </span>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <HiOutlineArrowRightOnRectangle className="text-sm" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm border border-slate-100">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-emerald-600">
            <HiOutlineChatBubbleLeftEllipsis className="text-2xl stroke-2" />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900 tracking-tight">
            Email Verification
          </h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            Please use the verification code sent to your email below to sign in
            to your account.
          </p>

          {/* Stepper Progress */}
          <div className="my-8 max-w-md mx-auto">
            <div className="relative flex items-center justify-between">
              <div className="absolute top-4 left-8 right-8 h-[2px] bg-slate-200 -z-0">
                <div className="h-full bg-slate-900 w-1/2 transition-all duration-300"></div>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-black text-white shadow-xs">
                  <HiOutlineCheck className="text-lg stroke-[3]" />
                </div>
                <span className="text-xs font-bold text-slate-900 mt-1.5">
                  Submitted
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border-2 border-slate-900 text-slate-900 shadow-xs">
                  <HiOutlineShieldCheck className="text-xl" />
                </div>
                <span className="text-xs font-bold text-slate-900 mt-1.5">
                  Verification
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-300">
                  <HiOutlineLockClosed className="text-xl" />
                </div>
                <span className="text-xs font-semibold text-slate-300 mt-1.5">
                  Activation
                </span>
              </div>
            </div>
          </div>

          {/* OTP Input Fields */}
          <form onSubmit={handleVerify}>
            <div className="flex justify-center items-center gap-2.5 my-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-11 h-13 text-center text-lg font-semibold rounded-lg border bg-slate-50/50 focus:bg-white focus:outline-none transition-all border-slate-200 focus:border-emerald-500`}
                />
              ))}
            </div>

            {/* Dynamic Resend Section */}
            <div className="my-4 h-6 flex items-center justify-center">
              {timer > 0 ? (
                <p className="text-[11px] text-slate-400 font-medium">
                  Resend code in 00:{timer < 10 ? `0${timer}` : timer}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all cursor-pointer"
                >
                  Resend code
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isCodeComplete}
              className={`w-full font-medium p-3.5 rounded-xl transition-all duration-500 ease-in-out text-sm flex items-center justify-center ${
                isCodeComplete
                  ? "bg-gradient-to-l from-[#4edea3] via-[#009668] to-[#007d56] bg-[length:200%_100%] bg-right hover:bg-left text-white shadow-md hover:shadow-lg active:scale-[0.99]"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>Verify & Complete Setup</span>
              <HiChevronRight className="text-base" />
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-8 pt-2 text-[11px] text-slate-500 leading-normal">
            <p>
              Didn't receive the email? Check your spam folder or try again
              later.
            </p>
            <button
              type="button"
              onClick={handleEditEmail}
              className="mt-1 text-indigo-600 hover:text-indigo-700 font-bold tracking-wide uppercase text-[10px] cursor-pointer"
            >
              EDIT EMAIL ADDRESS
            </button>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full py-4 px-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-2 border-t border-slate-200/50 bg-white/50">
        <p>© 2024 SmartRoute Logistics. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#privacy" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#api" className="hover:underline">
            API Documentation
          </a>
        </div>
      </footer>
    </div>
  );
};

export default EmailVerification;
