import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useCompany from "../hooks/useCompany";
import { useWhatsAppStatus } from "../hooks/useWhatsApp";
import { WA_STATE } from "../services/whatsappService";
import { NON_APPROVED_STATUSES } from "../services/companyService";
import {
  HiOutlineCheck,
  HiOutlineBookOpen,
  HiOutlineArrowRight,
  HiOutlineChatBubbleLeftRight,
  HiOutlineDocumentText,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";

// Right-Side Hero Section Images
import reviewHero from "../assets/account-under-review.png";
import successHero from "../assets/success-hero.png";
import rejectionHero from "../assets/smile-reject-hero.png";

// Left-Side Status Center Illustrations
import pendingImg from "../assets/pending.png";
import acceptedImg from "../assets/accepted.png";
import rejectionImg from "../assets/rejected.png";

// Maps whatever the backend calls the status to our internal keys.
// SUSPENDED has no dedicated screen — closest in severity to a rejection,
// so it reuses that view until there's a distinct design for it.
const STATUS_MAP = {
  PENDING: "pending",
  APPROVED: "accepted",
  REJECTED: "rejected",
  SUSPENDED: "rejected",
};

// Once the user has confirmed they're in (pressed "Go to Dashboard" on the
// accepted screen), we never want to show this page again on future logins —
// they should land straight on the dashboard instead.
const ACTIVATED_FLAG_KEY = "smartroute-account-activated";

const RouteXLogo = (props) => (
  <svg
    width="117"
    height="19"
    viewBox="0 0 117 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M19.632 7.60823C19.632 10.3442 18.24 12.3602 15.984 13.2482L19.08 18.2402H13.992L11.28 13.7522H4.32002V18.2402H1.76132e-05V1.44023H13.2C17.016 1.44023 19.632 3.86423 19.632 7.60823ZM4.32002 5.06423V10.1282H12C13.296 10.1282 15.312 10.1282 15.312 7.60823C15.312 5.06423 13.296 5.06423 12 5.06423H4.32002ZM30.5989 18.4802C24.7429 18.4802 20.8069 16.3682 20.8069 11.1842C20.8069 5.97623 24.7429 3.86423 30.5989 3.86423C36.4309 3.86423 40.3909 5.97623 40.3909 11.1842C40.3909 16.3682 36.4309 18.4802 30.5989 18.4802ZM30.5989 15.0482C34.3909 15.0482 36.2629 14.1122 36.2629 11.1842C36.2629 8.23223 34.3909 7.29623 30.5989 7.29623C26.7829 7.29623 24.9109 8.23223 24.9109 11.1842C24.9109 14.1122 26.7829 15.0482 30.5989 15.0482ZM57.5051 4.10423H61.6091V18.2402H57.5051V15.7682C55.4891 17.3522 52.7051 18.4802 49.2731 18.4802C45.5051 18.4802 41.9771 17.1362 41.9291 11.9282L41.9771 4.10423H46.1051V10.3682C46.1051 13.3682 47.1131 14.9282 50.4971 14.9282C53.2571 14.9282 56.2331 13.5122 57.5051 12.0242V4.10423ZM77.7259 7.53623H71.0299V11.6162C71.0299 14.3522 71.5579 15.0482 74.0539 15.0482C75.3499 15.0482 76.0699 15.0482 77.7259 14.8082V18.1202C76.3579 18.3602 74.7979 18.4802 72.9019 18.4802C69.2539 18.4802 66.9019 17.1122 66.9019 13.9922V7.53623H63.1819V4.10423H66.9019V1.17623L71.0299 0.000233173V4.10423H77.7259V7.53623ZM88.2964 15.1442C91.1284 15.1442 92.8564 14.6162 93.8884 13.1762H97.9684C97.0324 16.7762 93.5284 18.4802 88.2964 18.4802C82.9204 18.4802 78.7444 16.3682 78.7444 11.1842C78.7444 5.97623 82.8004 3.86423 88.5364 3.86423C93.9124 3.86423 98.2084 5.71223 98.2084 12.1442H82.9444C83.4004 14.4002 85.5604 15.1442 88.2964 15.1442ZM88.5124 6.98423C85.7044 6.98423 83.7364 7.53623 83.0884 9.52823H93.8164C93.1204 7.53623 91.1044 6.98423 88.5124 6.98423Z"
      fill="#222222"
    />
    <path
      d="M105.89 9.86133L99.2922 1.48242H103.218L107.847 7.59961L112.476 1.48242H116.402L109.816 9.86133L116.402 18.2402H112.476L107.847 12.123L103.218 18.2402H99.2922L105.89 9.86133Z"
      fill="#8FE600"
    />
  </svg>
);

// Static copy + assets per state — keeps the JSX below purely structural.
const STATUS_CONTENT = {
  pending: {
    titleLine1: "You're almost",
    titleLine2: "there!",
    illustration: pendingImg,
    hero: reviewHero,
  },
  accepted: {
    titleLine1: "You're all",
    titleLine2: "set!",
    illustration: acceptedImg,
    hero: successHero,
  },
  rejected: {
    titleLine1: "We couldn't",
    titleLine2: "approve account",
    illustration: rejectionImg,
    hero: rejectionHero,
  },
};

const AccountUnderReview = () => {
  const navigate = useNavigate();
  const { checkCompanyStatus, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // null while we're still deciding what to show (checking the activated
  // flag, then waiting on the API) — nothing renders until this resolves,
  // so there's no flash of "pending" before a redirect.
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [fetchError, setFetchError] = useState("");

  // WhatsApp linking is the step after approval: only read its (backend)
  // status once the account is actually approved.
  const { companyId } = useCompany();
  const whatsapp = useWhatsAppStatus(status === "accepted" ? companyId : null);
  const whatsappConnected = whatsapp.data?.state === WA_STATE.CONNECTED;
  const whatsappChecking = status === "accepted" && Boolean(companyId) && whatsapp.isLoading;

  const checkStatus = useCallback(
    async (signal) => {
      try {
        const result = await checkCompanyStatus(signal);

        if (!result.success) {
          // Retain the default PENDING state on any 4xx/5xx — don't alter status.
          setFetchError(result.message);
          setStatus((current) => current || "pending");
          return;
        }

        const mapped = STATUS_MAP[result.status] || "pending";

        setFetchError("");
        setStatusMessage(result.message || "");
        setStatus(mapped);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Failed to check status:", error);
        setFetchError("Couldn't refresh your status right now. Please try again later.");
        setStatus((current) => current || "pending");
      }
    },
    [checkCompanyStatus]
  );

  useEffect(() => {
    // Lifetime gate: if this user already confirmed their activation once,
    // skip straight to the dashboard — this screen is never shown again.
    // Not when the known status says otherwise — the app layout sends such
    // users here, and skipping straight back would loop between the two.
    const alreadyActivated = localStorage.getItem(ACTIVATED_FLAG_KEY) === "true";
    if (alreadyActivated && !NON_APPROVED_STATUSES.has(user?.status)) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Aborts the in-flight request on unmount, so React StrictMode's
    // dev-only mount/unmount/remount cycle can't land two overlapping calls.
    const controller = new AbortController();
    checkStatus(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkStatus, navigate]);

  const handlePrimaryAction = () => {
    if (status === "accepted") {
      // Set once, for life — future logins skip this page entirely.
      localStorage.setItem(ACTIVATED_FLAG_KEY, "true");
      // Approved but WhatsApp not linked yet → the setup step comes first.
      navigate(whatsappConnected ? "/dashboard" : "/whatsapp-setup");
    } else if (status === "rejected") {
      window.location.href = "mailto:support@smartroute.logistics";
    }
  };

  // Still resolving the flag/API check — render nothing rather than a
  // flash of the wrong state.
  if (!status) return null;

  const content = STATUS_CONTENT[status];

  return (
    <div className="h-dvh w-full flex overflow-hidden bg-bg font-base text-black">
      {/* Left side - status panel */}
      <div className="w-full lg:w-[40%] h-full flex items-center justify-center px-6 md:px-10 lg:px-14 py-[clamp(0.5rem,2.2vh,1.5rem)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-full max-w-[400px] mx-auto flex flex-col gap-[clamp(1rem,2.4vh,1.5rem)]">
          <div className="flex items-center justify-between">
            <RouteXLogo />
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-gray hover:text-black transition-colors cursor-pointer"
            >
              <HiOutlineArrowRightOnRectangle className="text-sm" />
              Log out
            </button>
          </div>

          {fetchError && (
            <div className="p-2.5 rounded-lg bg-[color-mix(in_srgb,var(--color-error)_8%,white)] border border-[color-mix(in_srgb,var(--color-error)_25%,white)] text-[color:var(--color-error)] text-xs font-medium text-center">
              {fetchError}
            </div>
          )}

          {/* Heading + subtext */}
          <div className="text-left space-y-2">
            <h1 className="font-[family-name:var(--font-base)] text-[clamp(2.6rem,3.2vh,2.1rem)] leading-tight font-bold text-[color:var(--color-black)]">
              {content.titleLine1}
              <br />
              <span className="text-[color:var(--color-brand)]">{content.titleLine2}</span>
            </h1>

            {status === "pending" && (
              <p className="text-sm text-gray leading-relaxed text-justify">
                {statusMessage ||
                  "We've received your information and our team is reviewing your application. We'll notify you once your account is approved."}
              </p>
            )}
            {status === "accepted" && (
              <p className="text-sm text-gray leading-relaxed">
                {statusMessage ||
                  "Your account has been approved. You can now access the dashboard and start using RouteX"}
              </p>
            )}
            {status === "rejected" && (
              <p className="text-sm text-gray leading-relaxed">
                {statusMessage ||
                  "After reviewing your information, we're unable to approve your RouteX account at this time."}
              </p>
            )}
          </div>

          {/* Illustration — pre-composited per state */}
          <div className="flex justify-center py-1">
            <img
              src={content.illustration}
              alt=""
              className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
            />
          </div>

          {/* Dynamic middle block */}
          {status === "pending" && (
            <div className="relative flex items-start justify-between">
              <div className="absolute top-3 left-3 right-3 h-px bg-[color:var(--color-border)]" />
              {[
                { label: "Application submitted", state: "done" },
                { label: "Verification in progress", state: "active" },
                { label: "Account Activated", state: "upcoming" },
              ].map((step) => (
                <div
                  key={step.label}
                  className="relative z-10 flex flex-col items-center gap-1.5 flex-1 px-1"
                >
                  {step.state === "done" && (
                    <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center shrink-0">
                      <HiOutlineCheck className="text-xs text-black stroke-[3]" />
                    </div>
                  )}
                  {step.state === "active" && (
                    <div className="w-6 h-6 rounded-full border-2 border-brand bg-white flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-brand" />
                    </div>
                  )}
                  {step.state === "upcoming" && (
                    <div className="w-6 h-6 rounded-full border-2 border-[color:var(--color-border)] bg-white shrink-0" />
                  )}
                  <span
                    className={`text-[13px] text-center leading-tight ${
                      step.state === "upcoming" ? "text-gray/60" : "font-semibold text-black"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {(status === "accepted" || status === "rejected") && (
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={whatsappChecking}
              className="w-full font-semibold py-[clamp(0.75rem,1.7vh,0.95rem)] rounded-xl text-sm bg-brand hover:bg-secondary text-black shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {status === "accepted"
                ? whatsappChecking
                  ? "Checking WhatsApp…"
                  : whatsappConnected
                  ? "Go to Dashboard"
                  : "Connect WhatsApp"
                : "Contact Support"}
            </button>
          )}

          <div className="h-px w-full bg-[color:var(--color-border)]" />

          {/* Dynamic bottom block */}
          {status === "pending" && (
            <div className="flex flex-col">
              <p className="text-xs text-gray font-medium mb-1">In the meantime</p>

              <button
                type="button"
                onClick={() => navigate("/about")}
                className="flex items-center justify-between py-2.5 border-b border-[color:var(--color-border)] group cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-brand/15 flex items-center justify-center text-black">
                    <HiOutlineBookOpen className="text-sm" />
                  </span>
                  <span className="text-sm font-medium text-black">
                    learn more about RouteX
                  </span>
                </span>
                <HiOutlineArrowRight className="text-sm text-gray group-hover:text-brand transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => (window.location.href = "mailto:support@smartroute.logistics")}
                className="flex items-center justify-between py-2.5 group cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-brand/15 flex items-center justify-center text-black">
                    <HiOutlineChatBubbleLeftRight className="text-sm" />
                  </span>
                  <span className="text-sm font-medium text-black">Contact support</span>
                </span>
                <HiOutlineArrowRight className="text-sm text-gray group-hover:text-brand transition-colors" />
              </button>
            </div>
          )}

          {status === "accepted" && (
            <div>
              <p className="text-xs font-bold text-black mb-2.5">Next Steps:</p>
              <div className="flex flex-col">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center shrink-0">
                      <HiOutlineCheck className="text-xs text-black stroke-[3]" />
                    </div>
                    <div className="w-px flex-1 bg-[color:var(--color-border)] my-1" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold text-black">Explore your dashboard</p>
                    <p className="text-xs text-gray mt-0.5">
                      Get familiar with your workspace and key features.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-100 border border-[color:var(--color-border)] flex items-center justify-center text-[10px] font-bold text-gray shrink-0">
                      2
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray">Set up your fleet</p>
                    <p className="text-xs text-gray mt-0.5">
                      Add your vehicles and drivers to get started.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === "rejected" && (
            <div>
              <p className="text-xs font-bold text-black mb-2.5">What happened?</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand/15 flex items-center justify-center shrink-0">
                    <HiOutlineDocumentText className="text-sm text-black" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">Application Details</p>
                    <p className="text-xs text-gray mt-0.5">
                      Some information may need to be updated.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand/15 flex items-center justify-center shrink-0">
                    <HiOutlineMagnifyingGlass className="text-sm text-black" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">Review outcome</p>
                    <p className="text-xs text-gray mt-0.5">
                      {statusMessage || "Our team was unable to approve your account."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - hero image, one fully composited asset per state */}
      <div className="sticky hidden md:block top-0 h-dvh w-[60%] rounded-2xl border-6 border-white overflow-hidden bg-linear-to-tl from-brand/20 to-secondary/40">
        <img
          key={status}
          src={content.hero}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
};

export default AccountUnderReview;