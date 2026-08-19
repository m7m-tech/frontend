import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const registerSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  companyName: Yup.string().required("Company name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Business email is required"),
  phone: Yup.string().required("Phone number is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
  agreeToTerms: Yup.boolean().oneOf(
    [true],
    "You must accept the Terms of Service and Privacy Policy",
  ),
});

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [dialCode, setDialCode] = useState(() => {
    try {
      const savedDraft = localStorage.getItem("smartroute-register-draft");
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        return parsedDraft.dialCode || "+970";
      }
    } catch (error) {
      console.error("Failed to restore dial code:", error);
    }

    return "+970";
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const initialValues = {
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  };

  const getSavedDraft = () => {
    try {
      const savedDraft = localStorage.getItem("smartroute-register-draft");
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        return {
          ...initialValues,
          ...parsedDraft,
          password: "",
          confirmPassword: "",
          phone: parsedDraft.phone?.replace(/^\+\d{2,3}/, "") || "",
        };
      }
    } catch (error) {
      console.error("Failed to restore register draft:", error);
    }

    return initialValues;
  };

  const formik = useFormik({
    initialValues: getSavedDraft(),
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        const fullPhoneNumber = `${dialCode}${values.phone}`;
        const payload = { ...values, phone: fullPhoneNumber };

        console.log("Registration Payload:", payload);

        const draftPayload = {
          ...values,
          phone: fullPhoneNumber,
          dialCode,
          password: "",
          confirmPassword: "",
        };

        localStorage.setItem(
          "smartroute-register-draft",
          JSON.stringify(draftPayload),
        );

        register({
          email: values.email,
          fullName: values.fullName,
          companyName: values.companyName,
          phone: fullPhoneNumber,
        });

        navigate("/verification");
      } catch (error) {
        console.error("Registration failed:", error);
      }
    },
  });

  useEffect(() => {
    const draftPayload = {
      ...formik.values,
      phone: `${dialCode}${formik.values.phone}`,
      dialCode,
      password: "",
      confirmPassword: "",
    };
    localStorage.setItem(
      "smartroute-register-draft",
      JSON.stringify(draftPayload),
    );
  }, [formik.values, dialCode]);

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">
      <img src={logo} alt="" className="w-30 mx-auto mb-7 md:w-35 lg:hidden " />
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl md:text-5xl lg:text-3xl font-bold text-slate-900">
          Register Fleet Owner
        </h2>
        <p className="text-slate-500 text-xs md:text-lg lg:text-base">
          Get started with your dedicated dispatch control center.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={formik.handleSubmit} className="w-full space-y-3.5">
        {/* Full Name & Company Name */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 text-left">
            <label className="block font-semibold text-slate-800">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-all ${
                formik.touched.fullName && formik.errors.fullName
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              }`}
            />
            {formik.touched.fullName && formik.errors.fullName && (
              <p className="text-red-500 text-[11px] mt-0.5">
                {formik.errors.fullName}
              </p>
            )}
          </div>

          <div className="space-y-1 text-left">
            <label className="block font-semibold text-slate-800">
              Company/Fleet Name
            </label>
            <input
              type="text"
              name="companyName"
              placeholder="Global Logistics Inc."
              value={formik.values.companyName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-all ${
                formik.touched.companyName && formik.errors.companyName
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              }`}
            />
            {formik.touched.companyName && formik.errors.companyName && (
              <p className="text-red-500 text-[11px] mt-0.5">
                {formik.errors.companyName}
              </p>
            )}
          </div>
        </div>

        {/* Business Email */}
        <div className="space-y-1 text-left">
          <label className="block font-semibold text-slate-800">
            Business Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="name@company.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-all ${
              formik.touched.email && formik.errors.email
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            }`}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-[11px] mt-0.5">
              {formik.errors.email}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1 text-left">
          <label className="block font-semibold text-slate-800">
            Phone Number
          </label>
          <div className="flex gap-2 relative">
            {/* Clickable Trigger Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between gap-1 px-3 py-2.5 h-full border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 transition-all cursor-pointer select-none shrink-0"
              >
                <span>{dialCode}</span>
                {/* Animated Arrow Icon */}
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180 text-emerald-600" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropped Menu Overlay */}
              {isDropdownOpen && (
                <>
                  {/* Backdrop to close menu when clicking outside */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  {/* Floating Dropdown List */}
                  <div className="absolute left-0 top-full mt-1 w-24 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    {["+970", "+972"].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setDialCode(code);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 font-medium transition-colors flex items-center justify-between ${
                          dialCode === code
                            ? "bg-emerald-50 text-emerald-600 font-bold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{code}</span>
                        {dialCode === code && (
                          <span className="text-emerald-500">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Phone Text Input */}
            <input
              type="text"
              name="phone"
              placeholder="59 1234567"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3.5 py-2.5 border rounded-xl outline-none transition-all ${
                formik.touched.phone && formik.errors.phone
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              }`}
            />
          </div>

          {formik.touched.phone && formik.errors.phone && (
            <p className="text-red-500 text-[11px] mt-0.5">
              {formik.errors.phone}
            </p>
          )}
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 text-left">
            <label className="block text-md font-semibold text-slate-800">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-3.5 pr-8 py-2.5 text-sm border rounded-xl outline-none transition-all ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <HiOutlineEyeOff className="text-lg" />
                ) : (
                  <HiOutlineEye className="text-lg" />
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-[11px] mt-0.5">
                {formik.errors.password}
              </p>
            )}
          </div>

          <div className="space-y-1 text-left">
            <label className="block text-md font-semibold text-slate-800">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="••••••••"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-all ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              }`}
            />
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="text-red-500 text-[11px] mt-0.5">
                  {formik.errors.confirmPassword}
                </p>
              )}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formik.values.agreeToTerms}
              onChange={formik.handleChange}
              className="w-4 h-4 accent-emerald-500 cursor-pointer rounded transition-all"
            />
            <label
              htmlFor="agreeToTerms"
              className="text-xs text-slate-600 cursor-pointer select-none"
            >
              I agree to the{" "}
              <a
                href="#terms"
                className="text-emerald-600 hover:underline font-medium"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#privacy"
                className="text-emerald-600 hover:underline font-medium"
              >
                Privacy Policy
              </a>
              .
            </label>
          </div>
          {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
            <p className="text-red-500 text-[11px]">
              {formik.errors.agreeToTerms}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-l from-[#4edea3] via-[#009668] to-[#007d56] bg-[length:200%_100%] bg-right hover:bg-left text-white font-medium p-3.5 rounded-xl transition-all duration-500 ease-in-out shadow-md hover:shadow-lg active:scale-[0.99] text-sm"
        >
          Create Fleet Owner Account
        </button>
      </form>

      {/* Sign In Link */}
      <p className="text-center text-xs text-slate-500 pt-1">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-emerald-600 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
