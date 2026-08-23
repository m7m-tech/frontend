import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { IoChevronBack } from "react-icons/io5";
import logo from "../assets/logo.png";

const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email address is required"),
});

const EmailForgotPassword = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      setStatus("");
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${baseUrl}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
        });

        const res = await response.json();

        if (!response.ok) {
          throw new Error(res.message || "Unable to send the reset code.");
        }

        // 🔑 التعديل الجوهري: الوصول للـ resetToken داخل res.data
        const resetToken = res.data?.resetToken || res.resetToken;

        if (resetToken) {
          localStorage.setItem("resetToken", resetToken);
          sessionStorage.setItem("resetToken", resetToken);
        }

        if (values.email) {
          localStorage.setItem("userEmail", values.email);
          sessionStorage.setItem("userEmail", values.email);
        }

        // 🚀 الانتقال لصفحة التحقق وتمرير التوكن
        navigate("/password-email-verification", {
          state: {
            email: values.email,
            resetToken: resetToken,
          },
        });
      } catch (error) {
        setStatus(error.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between">
      <header className="w-full bg-white border-b border-slate-200/80 px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center justify-center space-x-1">
          <div className="w-8 h-8">
            <img src={logo} alt="SmartRoute Logo" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            SmartRoute
          </span>
        </div>

        <Link
          to="/login"
          className="flex items-center space-x-2 px-3 py-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <IoChevronBack className="text-xs" />
          Back to login
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center py-8 px-4 md:px-0">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10 text-center space-y-7">
          <div className="flex justify-center">
            <img
              src={logo}
              alt="SmartRoute Logo"
              className="w-27 h-27 object-contain"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Forgot your password?
            </h1>
            <p className="text-slate-500 text-xs md:text-sm max-w-sm mx-auto leading-relaxed">
              Don't worry, it happens to all of us. Enter your email below to
              recover your password.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
            {formik.status && (
              <p className="text-red-500 text-xs text-left font-medium">{formik.status}</p>
            )}
            <div className="text-left">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-4 rounded-xl border text-sm outline-none transition-all ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs mt-1 pl-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-gradient-to-l from-[#4edea3] via-[#009668] to-[#007d56] bg-[length:200%_100%] bg-right hover:bg-left text-white font-medium p-3.5 rounded-xl transition-all duration-500 ease-in-out shadow-md hover:shadow-lg active:scale-[0.99] text-lg flex justify-center items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {formik.isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>

          <div className="relative flex items-center justify-center w-full my-4">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-slate-400 uppercase font-medium absolute">
              Or login with
            </span>
          </div>

          <button
            type="button"
            className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium p-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <FcGoogle className="text-lg" />
            <span>Continue with Google</span>
          </button>
        </div>
      </main>

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

export default EmailForgotPassword;