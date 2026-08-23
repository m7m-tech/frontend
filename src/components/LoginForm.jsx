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
import { FcGoogle } from "react-icons/fc";
import { FaArrowRight } from "react-icons/fa6";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  const navigate = useNavigate();
  const { login } = useAuth();

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

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <img src={logo} alt="" className="w-30 mx-auto mb-7 md:hidden" />
      
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

      {/* Form */}
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
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {formik.errors.password}
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formik.values.rememberMe}
            onChange={formik.handleChange}
            className="w-4 h-4 accent-emerald-500 cursor-pointer rounded transition-all"
          />
          <label
            htmlFor="rememberMe"
            className="text-sm text-slate-600 cursor-pointer select-none"
          >
            Remember Me for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-gradient-to-l from-[#4edea3] via-[#009668] to-[#007d56] bg-[length:200%_100%] bg-right hover:bg-left text-white font-medium p-3.5 rounded-xl transition-all duration-500 ease-in-out shadow-md hover:shadow-lg active:scale-[0.99] text-lg flex justify-center items-center gap-1 disabled:opacity-50"
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

      {/* Social Login */}
      <button
        type="button"
        className="w-full border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <FcGoogle className="text-xl" />
        <span>Continue with Google</span>
      </button>

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