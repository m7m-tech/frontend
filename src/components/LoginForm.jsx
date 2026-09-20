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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
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
  const [focusedField, setFocusedField] = useState(null);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setApiError("");
    try {
      const decoded = decodeJwt(credentialResponse.credential);

      if (!decoded) {
        setApiError("Could not extract user details from Google.");
        return;
      }

      const userProfileData = {
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.picture,
        googleId: decoded.sub,
        emailVerified: decoded.email_verified,
      };

      const result = await googleLogin(credentialResponse.credential, "WEB");

      if (result && result.success) {
        localStorage.setItem("userProfile", JSON.stringify(userProfileData));
        navigate("/account-under-review");
      } else {
        setApiError(result?.message || "Email not recognized or server error.");
      }
    } catch (error) {
      console.error("Google Authentication Error Details:", error);
      setApiError("Failed to process Google authentication.");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-left space-y-1">
        <svg 
          className="mb-2"
          width="117"
          height="19"
          viewBox="0 0 117 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
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

        <h1 className="text-5xl leading-tight font-bold text-black">
          Welcome
          <br />
          <span className="text-brand">back.</span>
        </h1>
        <p className="text-black text-sm leading-snug mb-4">
          Sign in to manage routes, operations, and your bussiness performance.
        </p>
      </div>

      {apiError && (
        <div className="p-3 text-sm text-error bg-error/5 border border-error/30 rounded-lg text-center">
          {apiError}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="w-full space-y-4 pt-1">
        {/* Email */}
        <div className="space-y-1.5 text-left w-full">
          <label className="block text-lg font-medium text-black">
            Email Address
          </label>

          <div className="relative w-full">
            <HiOutlineMail
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xl transition-colors ${
                focusedField === "email" || formik.values.email
                  ? "text-brand"
                  : "text-black/35"
              }`}
            />

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={(e) => {
                formik.handleBlur(e);
                setFocusedField(null);
              }}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all text-sm text-black placeholder:text-black/35 ${
                formik.touched.email && formik.errors.email
                  ? "border-error ring-2 ring-error/20"
                  : focusedField === "email" || formik.values.email
                    ? "border-brand ring-2 ring-brand/20"
                    : "border-border"
              }`}
            />
          </div>

          {formik.touched.email && formik.errors.email && (
            <p className="text-error text-xs mt-1">{formik.errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5 text-left w-full">
          <label className="block text-lg font-medium text-black">
            Password
          </label>

          <div className="relative w-full">
            <HiOutlineLockClosed
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xl transition-colors ${
                focusedField === "password" || formik.values.password
                  ? "text-brand"
                  : "text-black/35"
              }`}
            />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onFocus={() => setFocusedField("password")}
              onBlur={(e) => {
                formik.handleBlur(e);
                setFocusedField(null);
              }}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all text-sm text-black placeholder:text-black/35 ${
                formik.touched.password && formik.errors.password
                  ? "border-error ring-2 ring-error/20"
                  : focusedField === "password" || formik.values.password
                    ? "border-brand ring-2 ring-brand/20"
                    : "border-border"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/35 hover:text-black/60 cursor-pointer"
            >
              {showPassword ? (
                <HiOutlineEyeOff className="text-lg" />
              ) : (
                <HiOutlineEye className="text-lg" />
              )}
            </button>
          </div>

          {formik.touched.password && formik.errors.password && (
            <p className="text-error text-xs mt-1">{formik.errors.password}</p>
          )}

          <div className="flex justify-end pt-0.5">
            <a
              href="#forgot"
              className="text-xs font-medium text-brand"
              onClick={(e) => {
                e.preventDefault();
                navigate("/email-forgot-password");
              }}
            >
              Forget Password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-brand hover:bg-brand/90 text-black font-semibold py-3 rounded-lg transition-all flex justify-center items-center disabled:opacity-50"
        >
          {formik.isSubmitting ? "Signing in..." : "Log in"}
        </button>
      </form>

      <div className="relative flex items-center justify-center w-full py-4">
        <div className="border-t border-border w-full"></div>
        <span className="bg-white px-3 text-xs text-black/40 absolute">or</span>
      </div>

      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            setApiError("Google Sign-In failed. Please try again.");
          }}
          useOneTap={false}
          theme="outline"
          shape="rectangular"
          width="384"
        />
      </div>

      <p className="text-center text-sm text-black/50 pt-1 mt-4">
        New Fleet Manager?{" "}
        <Link
          to="/register"
          className="font-semibold text-black underline underline-offset-2"
        >
          Register your Company
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
