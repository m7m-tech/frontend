import React, { useState, useEffect, useCallback } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineEllipsisHorizontal,
  HiOutlineLockClosed,
  HiOutlineArrowRightOnRectangle,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineExclamationCircle,
  HiOutlinePencilSquare,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";

const AccountUnderReview = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // الحالات الممكنة: 'PENDING' | 'APPROVED' | 'REJECTED'
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(
    "Incomplete fleet registration documents and invalid commercial registry number.",
  );
  const [applicationId, setApplicationId] = useState("SR-99283-XQ");
  const [reviewDate, setReviewDate] = useState("October 24, 2024");

  // فحص حالة الحساب من الـ API
  const checkStatus = useCallback(async () => {
    const token = localStorage.getItem("token");

    // 1. التوقف فوراً إذا لم يكن هناك توكن (المستخدم غير مسجل دخوله)
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch("/api/user/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 2. التحقق من أن الرد سليم وأن نوعه JSON وليس HTML (مثل صفحات الخطأ 404/500)
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setStatus(data.status);
        if (data.rejectionReason) setRejectionReason(data.rejectionReason);
        if (data.applicationId) setApplicationId(data.applicationId);
        if (data.reviewDate) setReviewDate(data.reviewDate);

        if (data.status === "APPROVED") {
          setTimeout(() => {
            navigate("/dashboard");
          }, 2500);
        }
      }
    } catch (error) {
      console.error("Failed to check status:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };
  
  const handleEditDetails = () => {
    logout();
    window.location.href = "/register";
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 font-sans">
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

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div
          className={`w-full max-w-xl bg-white rounded-2xl shadow-lg border overflow-hidden text-center transition-all ${
            status === "REJECTED"
              ? "border-red-100"
              : status === "APPROVED"
                ? "border-emerald-100"
                : "border-slate-100"
          }`}
        >
          {/* Top Decorative Line */}
          <div
            className={`h-1.5 w-full ${
              status === "REJECTED"
                ? "bg-red-500"
                : status === "APPROVED"
                  ? "bg-emerald-500"
                  : "bg-transparent"
            }`}
          />

          {/* 1. حالة الرفض REJECTED VIEW */}
          {status === "REJECTED" && (
            <div>
              <div className="p-8 space-y-6">
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md">
                    <HiOutlineXMark className="text-2xl stroke-[2.5]" />
                  </div>
                </div>

                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-bold tracking-wider uppercase">
                  <span>STATUS: REJECTED</span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Registration Application Rejected
                  </h1>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    We reviewed your application and unfortunately cannot
                    proceed with your account activation at this time.
                  </p>
                </div>

                <div className="bg-red-50/70 border-l-4 border-red-500 rounded-r-xl p-4 text-left space-y-1">
                  <div className="flex items-center space-x-2 text-red-700 font-bold text-xs">
                    <HiOutlineExclamationCircle className="text-sm shrink-0" />
                    <span>Rejection Reason</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">
                    {rejectionReason}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="border border-slate-200 rounded-xl p-3 bg-white">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      APPLICATION ID
                    </p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {applicationId}
                    </p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3 bg-white">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      REVIEW DATE
                    </p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {reviewDate}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => console.log("Contact support")}
                    className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <HiOutlineChatBubbleLeftRight className="text-base" />
                    <span>Contact Support</span>
                  </button>

                  <button
                    onClick={handleEditDetails}
                    className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    <HiOutlinePencilSquare className="text-base" />
                    <span>Resubmit Application / Edit Details</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50/80 border-t border-slate-100 py-3 text-center">
                <p className="text-[11px] text-slate-500">
                  Need help? Read our{" "}
                  <a
                    href="#guidelines"
                    className="text-slate-700 underline font-medium"
                  >
                    Application Guidelines
                  </a>{" "}
                  or visit the{" "}
                  <a
                    href="#help"
                    className="text-slate-700 underline font-medium"
                  >
                    Help Center
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {/* 2. حالة الانتظار والقبول PENDING / APPROVED */}
          {status !== "REJECTED" && (
            <div>
              <div className="p-8 space-y-6">
                {status === "APPROVED" ? (
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <HiOutlineCheckCircle className="text-sm text-emerald-600" />
                    <span>Status: ACCOUNT_APPROVED</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                    <HiOutlineClock className="text-sm text-amber-700" />
                    <span>Status: PENDING_ADMIN_APPROVAL</span>
                  </div>
                )}

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {status === "APPROVED"
                      ? "Account Approved!"
                      : "Account Under Review"}
                  </h1>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    {status === "APPROVED"
                      ? "Your request has been approved. Redirecting you to your control center..."
                      : "Your fleet manager registration request has been submitted successfully and is currently being verified by the System Administrator."}
                  </p>
                </div>

                <div className="py-2">
                  <div className="relative flex items-center justify-between max-w-sm mx-auto">
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0">
                      <div
                        className={`h-full transition-all duration-500 ${
                          status === "APPROVED"
                            ? "bg-emerald-500 w-full"
                            : "bg-slate-900 w-full"
                        }`}
                      ></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                          status === "APPROVED"
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-900 text-white"
                        }`}
                      >
                        <HiOutlineCheck className="text-lg font-bold" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 mt-2">
                        Submitted
                      </span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                          status === "APPROVED"
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-900 text-white"
                        }`}
                      >
                        <HiOutlineCheck className="text-lg font-bold" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 mt-2">
                        Submitted
                      </span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          status === "APPROVED"
                            ? "bg-emerald-600 text-white shadow-md"
                            : "bg-slate-100 border-2 border-slate-900 text-slate-900"
                        }`}
                      >
                        {status === "APPROVED" ? (
                          <HiOutlineCheck className="text-lg font-bold" />
                        ) : (
                          <HiOutlineLockClosed className="text-lg" />
                        )}
                      </div>
                      <span
                        className={`text-[11px] mt-2 ${status === "APPROVED" ? "font-bold text-emerald-600" : "font-semibold text-slate-400"}`}
                      >
                        Activation
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {status === "PENDING" && (
                    <button
                      onClick={checkStatus}
                      disabled={loading}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-md active:scale-95 disabled:opacity-50"
                    >
                      <HiOutlineArrowPath
                        className={`text-sm ${loading ? "animate-spin" : ""}`}
                      />
                      <span>{loading ? "Checking..." : "Refresh Status"}</span>
                    </button>
                  )}

                  {status === "APPROVED" && (
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 bg-linear-to-l from-[#4edea3] via-[#009668] to-[#007d56] bg-size-[200%_100%] bg-right hover:bg-left text-white rounded-xl text-xs font-bold transition-all duration-500 shadow-md active:scale-95"
                    >
                      <HiOutlineArrowRightOnRectangle className="text-lg" />
                      <span>Go to Control Center</span>
                    </button>
                  )}
                </div>

                <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4 text-left space-y-3">
                  <h3 className="text-xs font-bold text-slate-800">
                    Need help?
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
                        <HiOutlineEnvelope className="text-xs" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Admin Email
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                          support@smartroute.logistics
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
                        <HiOutlinePhone className="text-xs" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Support Hotline
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                          +972 56 778 9251
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 border-t border-slate-100 py-3 text-center">
                <p className="text-[11px] text-slate-500 font-medium">
                  Expected review time:{" "}
                  <span className="text-slate-700">12-24 business hours.</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-100/60 border-t border-slate-200 py-4 px-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <p>© 2024 SmartRoute Logistics. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="#privacy" className="hover:text-slate-800 transition-colors">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-slate-800 transition-colors">
            Terms of Service
          </a>
          <a
            href="#security"
            className="hover:text-slate-800 transition-colors"
          >
            Security
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AccountUnderReview;