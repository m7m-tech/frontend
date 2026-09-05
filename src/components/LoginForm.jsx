import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import logo from "../assets/logo.png";

import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import { FaArrowRight } from "react-icons/fa6";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { GoogleLogin } from "@react-oauth/google";

// دالة محليّة لفك تشفير توكن Google لتجنب مشاكل استيراد jwt-decode مع Vite
const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode Google Token:", e);
    return null;
  }
};

const loginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email address is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  rememberMe: Yup.boolean(),
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const { login, googleLogin } = useAuth();

  const navigate = useNavigate();

  // Formik للتسجيل العادي (Email & Password)
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError("");
      try {
        const result = await login(values.email, values.password);

        if (result.success) {
          navigate("/account-under-review");
        } else {
          setApiError(result.message);
        }
      } catch (err) {
        setApiError("Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // المعالج الخاص بالتسجيل عبر Google
  const handleGoogleSuccess = async (credentialResponse) => {
    setApiError("");
    try {
      // 1. فك تشفير توكن جوجل للحصول على بيانات المستخدم العامة
      const decoded = decodeJwt(credentialResponse.credential);
      // console.log("Decoded Google Profile:", decoded);

      if (!decoded) {
        setApiError("Could not extract user details from Google.");
        return;
      }

      // 2. تجهيز هيكل البيانات الخاص بالبروفايل
      const userProfileData = {
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.picture,
        googleId: decoded.sub,
        emailVerified: decoded.email_verified,
      };

      // 3. إرسال التوكن للباك إند للتحقق من وجود الحساب
      const result = await googleLogin(
        credentialResponse.credential,
        "WEB"
      );

      // console.log("Backend Google Auth Response:", result);

      if (result && result.success) {
        // 4. حفظ بيانات البروفايل محلياً للوصول إليها لاحقاً
        localStorage.setItem(
          "userProfile",
          JSON.stringify(userProfileData)
        );

        navigate("/account-under-review");
      } else {
        setApiError(
          result?.message || "Email not recognized or server error."
        );
      }
    } catch (error) {
      console.error("Google Authentication Error Details:", error);
      setApiError("Failed to process Google authentication.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <img src={logo} alt="Logo" className="w-30 mx-auto mb-7 lg:hidden" />

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">
          Sign in to Fleet Manager Dashboard
        </h2>
        <p className="text-slate-500 text-sm">
          Enter your credentials to access your operation controls.
        </p>
      </div>

      {/* Global API Error Alert */}
      {apiError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl text-center">
          {apiError}
        </div>
      )}

      {/* Form العادي */}
      <form onSubmit={formik.handleSubmit} className="w-full space-y-4">
        {/* Email Field */}
        <div className="space-y-1 text-left w-full">
          <label className="block text-sm font-semibold text-slate-800">
            Email Address
          </label>
          <div className="relative w-full">
            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xl" />
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              }`}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1 text-left w-full">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-slate-800">
              Password
            </label>
          </div>
          <div className="relative w-full">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xl" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full pl-10 pr-10 py-3 border rounded-xl outline-none transition-all ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? (
                <HiOutlineEyeOff className="text-xl" />
              ) : (
                <HiOutlineEye className="text-xl" />
              )}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {formik.errors.password}
            </p>
          )}
          <a
            href="#forgot"
            className="text-sm font-medium text-emerald-600 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              navigate("/email-forgot-password");
            }}
          >
            Forgot Password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-linear-to-l from-[#4edea3] via-[#009668] to-[#007d56] bg-size-[200%_100%] bg-right hover:bg-left text-white font-medium p-3.5 rounded-xl transition-all duration-500 ease-in-out shadow-md hover:shadow-lg active:scale-[0.99] text-lg flex justify-center items-center gap-1 disabled:opacity-50 cursor-pointer"
        >
          <span>{formik.isSubmitting ? "Signing in..." : "Sign In"}</span>
          {!formik.isSubmitting && <FaArrowRight className="text-sm" />}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center w-full my-6">
        <div className="border-t border-slate-200 w-full"></div>
        <span className="bg-white px-3 text-xs text-slate-400 font-semibold tracking-wider uppercase absolute">
          Or continue with
        </span>
      </div>

      {/* Google Sign-In Button */}
      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            setApiError("Google Sign-In failed. Please try again.");
          }}
          useOneTap
          theme="outline"
          shape="circle"
          width="large"
        />
      </div>

      {/* Register Link */}
      <p className="text-center text-sm text-slate-500 pt-2">
        New Fleet Manager?{" "}
        <Link
          to="/register"
          className="font-medium text-emerald-600 hover:underline"
        >
          Register your organization
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;