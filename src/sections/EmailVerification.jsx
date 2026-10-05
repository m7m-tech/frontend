import React, { useState, useRef, useEffect } from "react";
import verifyEmailImg from "../assets/verifyEmail.png";
import mail from "../assets/mail.png"
import { useNavigate, useLocation } from "react-router-dom";
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
import Notification from "../components/Notification";

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { logout, verifyEmail, resendOtp } = useAuth();
  const { verifyEmail, resendOtp } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [apiError, setApiError] = useState("");

  const draftData = JSON.parse(
    localStorage.getItem("smartroute-register-draft") || "{}",
  );

  const userEmail = location.state?.email || draftData.email || "";
  const formData = location.state?.formData || null;

  const [timer, setTimer] = useState(5);
  const [showToast, setShowToast] = useState(false);
  const [status, setStatus] = useState("success");
  const [content, setContent] = useState();
  const [details, setDetails] = useState();

  useEffect(() => {
    if (!userEmail) {
      navigate("/register", { replace: true });
    }
  }, [userEmail, navigate]);

  useEffect(() => {
    if (timer <= 0) return;

    const countdown = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const handleResendCode = async () => {
    if (timer > 0 || !userEmail || isResending) return;

    setApiError("");
    setIsResending(true);

    const result = await resendOtp(userEmail);

    if (result.success) {
      setTimer(5);
      setStatus("success");
      setContent("Verification code sent!");
      setDetails("Check your inbox or spam folder.");
      setShowToast(true);
    } else {
      setApiError(result.message);
      setStatus("failed");
      setContent("Failed to send code.");
      setDetails(result.message);
      setShowToast(true);
    }

    setIsResending(false);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleChange = (value, index) => {
    const cleanedValue = value.replace(/\D/g, "").slice(-1);

    if (!cleanedValue && value !== "") return;

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

    if (!pastedData) return;

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

  // const handleSignOut = () => {
  //   logout();
  //   navigate("/login", { replace: true });
  // };

  const handleEditEmail = () => {
    navigate("/register", { state: { formData } });
  };

  const isCodeComplete = otp.every((digit) => digit !== "");

  const handleVerify = async (e) => {
    if (e) e.preventDefault();

    const code = otp.join("");
    if (code.length < 6 || isSubmitting) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      const result = await verifyEmail(userEmail, code);

      if (result.success) {
        const token =
          result.resetToken || result.token || result.data?.resetToken;

        if (token) {
          localStorage.setItem("resetToken", token);
        }

        if (userEmail) {
          localStorage.setItem("userEmail", userEmail);
        }

        navigate("/account-under-review", { replace: true });
      } else {
        setApiError(
          result.message || "Invalid verification code. Please try again.",
        );
      }
    } catch (err) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Same "no scrollbar" architecture as the signup page: h-dvh + overflow-hidden
    // on the root locks the page to exactly one viewport, and the scrollable
    // safety-net panel below has its scrollbar hidden (not removed) so an
    // edge case (apiError + long email + small window) scrolls invisibly
    // instead of ever showing a visible bar.
    <div className="h-dvh w-full flex overflow-hidden bg-bg font-base text-black">
      {showToast && (
        <Notification status={status} content={content} details={details} />
      )}

      {/* Left side - form */}
      <div className="w-full lg:w-[40%] h-full flex items-center justify-center px-6 md:px-10 lg:px-14 py-[clamp(0.5rem,2.2vh,1.5rem)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-full max-w-[400px] mx-auto flex flex-col gap-[clamp(1.5rem,3.5vh,2.25rem)]">
          {/* RouteX logo — identical brand mark used on the signup page */}
          <svg
            width="117"
            height="19"
            viewBox="0 0 117 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M19.6318 7.60823C19.6318 10.3442 18.2398 12.3602 15.9838 13.2482L19.0798 18.2402H13.9918L11.2798 13.7522H4.31977V18.2402H-0.000226527V1.44023H13.1998C17.0158 1.44023 19.6318 3.86423 19.6318 7.60823ZM4.31977 5.06423V10.1282H11.9998C13.2958 10.1282 15.3118 10.1282 15.3118 7.60823C15.3118 5.06423 13.2958 5.06423 11.9998 5.06423H4.31977ZM30.5986 18.4802C24.7426 18.4802 20.8066 16.3682 20.8066 11.1842C20.8066 5.97623 24.7426 3.86423 30.5986 3.86423C36.4306 3.86423 40.3906 5.97623 40.3906 11.1842C40.3906 16.3682 36.4306 18.4802 30.5986 18.4802ZM30.5986 15.0482C34.3906 15.0482 36.2626 14.1122 36.2626 11.1842C36.2626 8.23223 34.3906 7.29623 30.5986 7.29623C26.7826 7.29623 24.9106 8.23223 24.9106 11.1842C24.9106 14.1122 26.7826 15.0482 30.5986 15.0482ZM57.5049 4.10423H61.6089V18.2402H57.5049V15.7682C55.4889 17.3522 52.7049 18.4802 49.2729 18.4802C45.5049 18.4802 41.9769 17.1362 41.9289 11.9282L41.9769 4.10423H46.1049V10.3682C46.1049 13.3682 47.1129 14.9282 50.4969 14.9282C53.2569 14.9282 56.2329 13.5122 57.5049 12.0242V4.10423ZM77.7256 7.53623H71.0296V11.6162C71.0296 14.3522 71.5576 15.0482 74.0536 15.0482C75.3496 15.0482 76.0696 15.0482 77.7256 14.8082V18.1202C76.3576 18.3602 74.7976 18.4802 72.9016 18.4802C69.2536 18.4802 66.9016 17.1122 66.9016 13.9922V7.53623H63.1816V4.10423H66.9016V1.17623L71.0296 0.000233173V4.10423H77.7256V7.53623ZM88.2961 15.1442C91.1281 15.1442 92.8561 14.6162 93.8881 13.1762H97.9681C97.0321 16.7762 93.5281 18.4802 88.2961 18.4802C82.9201 18.4802 78.7441 16.3682 78.7441 11.1842C78.7441 5.97623 82.8001 3.86423 88.5361 3.86423C93.9121 3.86423 98.2081 5.71223 98.2081 12.1442H82.9441C83.4001 14.4002 85.5601 15.1442 88.2961 15.1442ZM88.5121 6.98423C85.7041 6.98423 83.7361 7.53623 83.0881 9.52823H93.8161C93.1201 7.53623 91.1041 6.98423 88.5121 6.98423Z"
              fill="#222222"
            />
            <path
              d="M105.89 9.86133L99.292 1.48242H103.218L107.847 7.59961L112.476 1.48242H116.401L109.815 9.86133L116.401 18.2402H112.476L107.847 12.123L103.218 18.2402H99.292L105.89 9.86133Z"
              fill="#8FE600"
            />
          </svg>

          {/* Heading + subtext */}
          <div className="text-left space-y-2">
            <h1 className="text-[clamp(1.75rem,3.4vh,2.25rem)] leading-tight font-bold text-black">
              Verify your
              <br />
              <span className="text-brand">email.</span>
            </h1>
            <p className="text-sm text-gray leading-relaxed">
              We've sent a verification code to your email
              <br />
              <span className="font-semibold text-black">
                {userEmail || "your email"}
              </span>
            </p>
          </div>

          {apiError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium text-center">
              {apiError}
            </div>
          )}

          {/* Verification cluster: icon + code entry + actions, centered as
             its own symmetric group beneath the left-aligned heading. */}
          <div className="flex flex-col items-center gap-[clamp(1.25rem,2.8vh,1.75rem)]">
            {/* Envelope icon — a lightweight custom SVG standing in for the
               illustration in the reference (no matching asset available
               to import). Swap for a real <img> if you have the source
               file. */}
            <div className="relative w-50 h-30 ml-2 shrink-0 rotate-15">
              <img src={mail} />
            </div>

            <form
              onSubmit={handleVerify}
              className="w-full flex flex-col items-center gap-[clamp(1.25rem,2.6vh,1.75rem)]"
            >
              <div className="flex justify-center items-center gap-2.5 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={isSubmitting}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-11 h-13 sm:w-13 sm:h-14 text-center text-lg font-semibold rounded-lg border border-border bg-bg focus:bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all disabled:opacity-50"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={!isCodeComplete || isSubmitting}
                className={`w-full font-semibold py-[clamp(0.85rem,1.9vh,1.05rem)] rounded-xl transition-all duration-300 ease-in-out text-[15px] flex items-center justify-center gap-1.5 ${
                  isCodeComplete && !isSubmitting
                    ? "bg-brand hover:bg-secondary text-black shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
                    : "bg-muted text-gray cursor-not-allowed"
                }`}
              >
                <span>
                  {isSubmitting ? "Verifying..." : "Verify & Complete Setup"}
                </span>
                <HiChevronRight className="text-base" />
              </button>

              <div className="text-center mt-1">
                <p className="text-xs text-gray">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={timer > 0 || isResending}
                    className={`font-semibold underline decoration-2 underline-offset-2 transition-colors ${
                      timer > 0 || isResending
                        ? "text-gray decoration-gray/40 cursor-not-allowed"
                        : "text-black decoration-brand hover:text-brand cursor-pointer"
                    }`}
                  >
                    {isResending ? "Sending..." : "Resend code"}
                  </button>
                </p>
                {timer > 0 && (
                  <p className="text-[11px] text-gray/70 mt-0.5">
                    (00:{timer < 10 ? `0${timer}` : timer})
                  </p>
                )}
              </div>
            </form>

            <button
              type="button"
              onClick={handleEditEmail}
              className="text-sm font-medium text-black underline decoration-brand decoration-2 underline-offset-2 hover:text-brand transition-colors cursor-pointer"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>

      {/* Right side - hero image, flush edge-to-edge per the reference
         (no rounded border/gap this time, unlike the signup page). */}
      <div className="hidden md:block top-0 h-dvh md:w-[60%] rounded-2xl border-6 border-white overflow-hidden bg-linear-to-tl from-brand/20 to-secondary/40 relative">
        <div className="h-dvh w-full overflow-hidden">
          <img
            src={verifyEmailImg}
            alt="Email verification"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-10 right-10 text-right">
            <p className="text-white text-xs font-semibold tracking-[0.15em] uppercase leading-relaxed z-5">
              Logistics
              <br />
              for a brighter
              <br />
              tomorrow
            </p>
            <div className="mt-1.5 h-0.5 w-16 bg-brand ml-auto" />
            <div className="absolute -right-10 -bottom-20 w-400 h-70 bg-[linear-gradient(180deg,rgba(24,26,32,0)_20.55%,rgba(24,26,32,0.102083)_36.52%,#181A20_100%)]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;