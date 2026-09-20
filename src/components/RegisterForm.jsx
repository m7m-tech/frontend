import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineUser,
  HiOutlineBuildingOffice2,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineLockClosed,
  HiOutlineGlobeAlt,
  HiOutlineArrowLeft,
  HiCheck,
  HiMiniCheck,
} from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const registerSchema = Yup.object({
  firstName: Yup.string().required("Full name is required"),
  lastName: Yup.string().required("Full name is required"),
  companyName: Yup.string().required("Company name is required"),
  country: Yup.string().required("Please select your country"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Business email is required"),
  phone: Yup.string().required("Phone number is required"),
  hearAboutUs: Yup.string(),
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

// Step 1 only validates/gates on these fields; everything else belongs to step 2.
const STEP1_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "password",
  "confirmPassword",
];

const GULF_COUNTRIES = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
];

const GULF_DIAL_CODES = [
  { code: "+966", flag: "🇸🇦", label: "Saudi Arabia" },
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+974", flag: "🇶🇦", label: "Qatar" },
  { code: "+965", flag: "🇰🇼", label: "Kuwait" },
  { code: "+973", flag: "🇧🇭", label: "Bahrain" },
  { code: "+968", flag: "🇴🇲", label: "Oman" },
];

const HEAR_ABOUT_OPTIONS = [
  "Social Media",
  "Search Engine",
  "Friend or Colleague",
  "Advertisement",
  "Other",
];

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  // const [showCriteria, setShowCriteria] = useState(flase);

  // Which dropdown is open: "dialCode" | "country" | "hearAbout" | null.
  // Only one can be open at a time.
  const [openDropdown, setOpenDropdown] = useState(null);

  // Step management
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current)
        clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  // استرجاع البيانات سابقة التعبئة إن وجدت من التوجيه
  const passedState = location.state?.formData || {};

  const [dialCode, setDialCode] = useState(passedState.dialCode || "+966");

  const initialValues = {
    firstName: passedState.firstName || "",
    lastName: passedState.lastName || "",
    companyName: passedState.companyName || "",
    country: passedState.country || "",
    email: passedState.email || "",
    phone: passedState.phone || "",
    hearAboutUs: passedState.hearAboutUs || "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  };

  const formik = useFormik({
    initialValues,
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError("");

      const cleanEmail = values.email.trim().toLowerCase();
      const fullPhoneNumber = `${dialCode}${values.phone.trim()}`;

      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        companyName: values.companyName.trim(),
        country: values.country,
        email: cleanEmail,
        password: values.password,
        phone: fullPhoneNumber,
        hearAboutUs: values.hearAboutUs || undefined,
        role: "DISPATCHER",
        registrationNumber: `REG-${Date.now()}`,
      };

      try {
        const result = await register(payload);

        if (result.success) {
          // تمرير البريد والبيانات الحالية لصفحة التفعيل
          navigate("/verification", {
            state: {
              email: cleanEmail,
              formData: { ...values, dialCode },
            },
          });
        } else {
          setApiError(
            result.message || "Registration failed. Please try again.",
          );
        }
      } catch (error) {
        setApiError("An unexpected error occurred. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Derived password-strength criteria (UI only, no logic/validation change)
  const passwordCriteria = [
    {
      key: "length",
      label: "At least 8 characters",
      met: formik.values.password.length >= 8,
    },
    {
      key: "uppercase",
      label: "Includes an uppercase letter",
      met: /[A-Z]/.test(formik.values.password),
    },
    {
      key: "number",
      label: "Includes a number",
      met: /[0-9]/.test(formik.values.password),
    },
    {
      key: "special",
      label: "Includes a special character",
      met: /[^A-Za-z0-9]/.test(formik.values.password),
    },
  ];

  const inputClasses = (field, hasIcon = true) => {
    const isFilled = !!formik.values[field];
    const isFocused = focusedField === field;
    const hasError = formik.touched[field] && formik.errors[field];

    return `w-full ${hasIcon ? "pl-10" : "pl-3.5"} pr-4 py-3 border rounded-lg outline-none transition-all text-sm text-black placeholder:text-black/35 ${
      hasError
        ? "border-red-500 ring-2 ring-red-500/20"
        : isFocused || isFilled
          ? "border-brand ring-2 ring-brand/20"
          : "border-border"
    }`;
  };

  const iconClasses = (field) =>
    `absolute left-3.5 top-1/2 -translate-y-1/2 text-[17px] transition-colors ${
      focusedField === field || formik.values[field]
        ? "text-brand"
        : "text-black/35"
    }`;

  // Same visual language as inputClasses, for button-triggered custom selects.
  const selectButtonClasses = (field, hasIcon = true) => {
    const isFilled = !!formik.values[field];
    const isFocused = focusedField === field || openDropdown === field;
    const hasError = formik.touched[field] && formik.errors[field];

    return `w-full ${hasIcon ? "pl-10" : "pl-3.5"} pr-4 py-3 border rounded-lg outline-none transition-all text-sm text-left flex items-center justify-between ${
      isFilled ? "text-black" : "text-black/35"
    } ${
      hasError
        ? "border-error ring-2 ring-error/20"
        : isFocused
          ? "border-brand ring-2 ring-brand/20"
          : "border-border"
    }`;
  };

  const goToStep = (nextStep, dir) => {
    setDirection(dir);
    setIsTransitioning(true);
    transitionTimeoutRef.current = setTimeout(() => {
      setStep(nextStep);
      requestAnimationFrame(() => setIsTransitioning(false));
    }, 150);
  };

  const handleNext = async () => {
    const errors = await formik.validateForm();
    const touchedUpdate = STEP1_FIELDS.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    formik.setTouched({ ...formik.touched, ...touchedUpdate });

    const hasStep1Errors = STEP1_FIELDS.some((field) => errors[field]);
    if (hasStep1Errors) return;

    // This design shows no explicit terms checkbox on step 2 — agreement is
    // implied by the "By submitting this application..." text under the
    // final button. We satisfy the existing Yup requirement here so the
    // schema itself doesn't need to change.
    formik.setFieldValue("agreeToTerms", true);
    goToStep(2, "forward");
  };

  const handleBack = () => {
    goToStep(1, "backward");
  };

  return (
    <div className="w-full max-w-[400px] mx-auto space-y-6 font-base">
      {/* <img src={logo} alt="" className="w-30 mx-auto mb-2 md:w-35 lg:hidden" /> */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {step === 2 && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back to previous step"
              className="text-black/60 hover:text-black transition-colors"
            >
              <HiOutlineArrowLeft className="text-xl" />
            </button>
          )}

          {/* RouteX Icon */}
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
        </div>

        {/* Progress bar */}
        <div
          className="flex items-center gap-2"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={2}
          aria-label={`Step ${step} of 2`}
        >
          <svg
            width="72"
            height="5"
            viewBox="0 0 72 5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="72" height="5" rx="2.5" className="fill-brand" />
          </svg>
          <svg
            width="72"
            height="5"
            viewBox="0 0 72 5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              width="72"
              height="5"
              rx="2.5"
              className={`transition-colors duration-500 ${step === 2 ? "fill-brand" : "fill-muted"}`}
            />
          </svg>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {step === 1
          ? "Step 1 of 2: Create your account"
          : "Step 2 of 2: Tell us about your company"}
      </span>

      <div className="text-left space-y-1.5">
        {step === 1 ? (
          <>
            <h2 className="text-3xl md:text-4xl font-bold text-black">
              Create your<br /> <span className="text-brand">account.</span>
            </h2>
            <p className="text-black/50 text-sm md:text-base">
              Enter your details to create your account and<br/> begin your
              application.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl md:text-4xl font-bold text-black">
              Tell us about <span className="text-brand">your company.</span>
            </h2>
            <p className="text-black/50 text-sm md:text-base">
              Add your company details to complete your application.
            </p>
          </>
        )}
      </div>

      {apiError && (
        <div className="p-3 text-sm text-error bg-warning border border-error/20 rounded-lg text-center">
          {apiError}
        </div>
      )}

      <form
        onSubmit={formik.handleSubmit}
        noValidate
        className="w-full space-y-4"
      >
        <div
          className={`space-y-4 transition-all duration-300 ease-in-out ${
            isTransitioning
              ? direction === "forward"
                ? "opacity-0 -translate-x-3"
                : "opacity-0 translate-x-3"
              : "opacity-100 translate-x-0"
          }`}
        >
          {step === 1 ? (
            <>
              {/* Full Name */}
              <div className="flex flex-col w-full text-left">
                {/* حقول الإدخال جنباً إلى جنب */}
                <div className="flex items-center justify-between w-full gap-6">
                  <div className="space-y-1.5 text-left w-1/2">
                    <label className="block text-sm font-medium text-black">
                      First Name
                    </label>
                    <div className="relative w-full">
                      <HiOutlineUser className={iconClasses("firstName")} />
                      <input
                        type="text"
                        name="firstName"
                        placeholder="John"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        onFocus={() => setFocusedField("firstName")}
                        onBlur={(e) => {
                          formik.handleBlur(e);
                          setFocusedField(null);
                        }}
                        className={inputClasses("firstName")}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left w-1/2">
                    <label className="block text-sm font-medium text-black">
                      Last Name
                    </label>
                    <div className="relative w-full">
                      <HiOutlineUser className={iconClasses("lastName")} />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Doe"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        onFocus={() => setFocusedField("lastName")}
                        onBlur={(e) => {
                          formik.handleBlur(e);
                          setFocusedField(null);
                        }}
                        className={inputClasses("lastName")}
                      />
                    </div>
                  </div>
                </div>

                {((formik.touched.firstName && formik.errors.firstName) ||
                  (formik.touched.lastName && formik.errors.lastName)) && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.firstName || formik.errors.lastName}
                  </p>
                )}
              </div>

              {/* Business Email */}
              <div className="space-y-1.5 text-left w-full">
                <label className="block text-sm font-medium text-black">
                  Email Address
                </label>
                <div className="relative w-full">
                  <HiOutlineEnvelope className={iconClasses("email")} />
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      setFocusedField(null);
                    }}
                    className={inputClasses("email")}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-error text-xs mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <label className="block text-sm font-medium text-black">
                  Password
                </label>
                <div className="relative w-full">
                  <HiOutlineLockClosed className={iconClasses("password")} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onFocus={() => (setFocusedField("password"))}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      setFocusedField(null);
                    }}
                    className={`${inputClasses("password")} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 hover:text-black transition-colors"
                  >
                    {showPassword ? (
                      <HiOutlineEyeSlash className="text-[17px]" />
                    ) : (
                      <HiOutlineEye className="text-[17px]" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-error text-xs mt-1">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 text-left">
                <label className="block text-sm font-medium text-black">
                  Confirm Password
                </label>
                <div className="relative w-full">
                  <HiOutlineLockClosed
                    className={iconClasses("confirmPassword")}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Enter your password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      setFocusedField(null);
                    }}
                    className={`${inputClasses("confirmPassword")} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 hover:text-black transition-colors"
                  >
                    {showPassword ? (
                      <HiOutlineEyeSlash className="text-[17px]" />
                    ) : (
                      <HiOutlineEye className="text-[17px]" />
                    )}
                  </button>
                </div>
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <p className="text-error text-xs mt-1">
                      {formik.errors.confirmPassword}
                    </p>
                  )}

                {/* Password criteria checklist */}
                <div className="grid grid-cols-1 gap-x-3 gap-y-1.5 pt-1 pl-2">
                  {passwordCriteria.map((c) => (
                    <div key={c.key} className="flex items-center gap-1.5">
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all shrink-0 ${
                          c.met
                            ? "bg-brand border-brand animate-[check-pop_0.3s_ease-out]"
                            : "border-border bg-transparent"
                        }`}
                      >
                        {c.met && (
                          <HiMiniCheck className="text-white text-xs" />
                        )}
                      </span>
                      <span
                        className={`text-xs transition-colors ${
                          c.met ? "text-black" : "text-black/90"
                        }`}
                      >
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Company Name */}
              <div className="space-y-1.5 text-left">
                <label className="block text-sm font-medium text-black">
                  Company Name
                </label>
                <div className="relative w-full">
                  <HiOutlineBuildingOffice2
                    className={iconClasses("companyName")}
                  />
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Enter your company or business name"
                    value={formik.values.companyName}
                    onChange={formik.handleChange}
                    onFocus={() => setFocusedField("companyName")}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      setFocusedField(null);
                    }}
                    className={inputClasses("companyName")}
                  />
                </div>
                {formik.touched.companyName && formik.errors.companyName && (
                  <p className="text-error text-xs mt-1">
                    {formik.errors.companyName}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-1.5 text-left">
                <label className="block text-sm font-medium text-black">
                  Country
                </label>
                <div className="relative w-full">
                  <HiOutlineGlobeAlt className={iconClasses("country")} />
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === "country" ? null : "country",
                      )
                    }
                    onFocus={() => setFocusedField("country")}
                    onBlur={() => setFocusedField(null)}
                    className={selectButtonClasses("country")}
                  >
                    <span>
                      {formik.values.country || "Select your country"}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                        openDropdown === "country"
                          ? "rotate-180 text-brand"
                          : formik.values.country
                            ? "text-brand"
                            : "text-black/35"
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

                  {openDropdown === "country" && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenDropdown(null)}
                      />
                      <div className="absolute left-0 top-full mt-1 w-full bg-white border border-border rounded-lg shadow-lg z-20 py-1 overflow-hidden max-h-56 overflow-y-auto">
                        {GULF_COUNTRIES.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={async () => {
                              await formik.setFieldValue("country", c, true);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-3.5 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                              formik.values.country === c
                                ? "bg-soft text-brand font-bold"
                                : "text-black hover:bg-muted/30"
                            }`}
                          >
                            <span>{c}</span>
                            {formik.values.country === c && (
                              <HiCheck className="text-brand" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {formik.touched.country && formik.errors.country && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.country}
                  </p>
                )}
              </div>

              {/* Business Phone Number */}
              <div className="space-y-1.5 text-left">
                <label className="block text-sm font-medium text-black">
                  Business Phone Number
                </label>
                <div className="flex gap-2 relative">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "dialCode" ? null : "dialCode",
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-3 h-full border border-border rounded-lg bg-white text-black font-medium hover:border-brand/50 transition-all cursor-pointer select-none shrink-0"
                    >
                      <span>
                        {GULF_DIAL_CODES.find((d) => d.code === dialCode)?.flag}
                      </span>
                      <span className="text-sm">{dialCode}</span>
                      <svg
                        className={`w-3.5 h-3.5 text-black/35 transition-transform duration-200 ${
                          openDropdown === "dialCode"
                            ? "rotate-180 text-brand"
                            : ""
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

                    {openDropdown === "dialCode" && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-border rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                          {GULF_DIAL_CODES.map((d) => (
                            <button
                              key={d.code}
                              type="button"
                              onClick={() => {
                                setDialCode(d.code);
                                setOpenDropdown(null);
                              }}
                              className={`w-full text-left px-3.5 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                                dialCode === d.code
                                  ? "bg-soft text-brand font-bold"
                                  : "text-black hover:bg-muted/30"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span>{d.flag}</span>
                                <span>{d.code}</span>
                              </span>
                              {dialCode === d.code && (
                                <HiCheck className="text-brand" />
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative w-full">
                    {/* <HiOutlinePhone className={iconClasses("phone")} /> */}
                    <input
                      type="text"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={(e) => {
                        formik.handleBlur(e);
                        setFocusedField(null);
                      }}
                      className={inputClasses("phone")}
                    />
                  </div>
                </div>
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-error text-xs mt-1">
                    {formik.errors.phone}
                  </p>
                )}
              </div>

              {/* How did you hear about us? (Optional) */}
              <div className="space-y-1.5 text-left">
                <label className="block text-sm font-medium text-black">
                  How did you hear about us?{" "}
                  <span className="text-black/40 font-normal">(Optional)</span>
                </label>
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === "hearAbout" ? null : "hearAbout",
                      )
                    }
                    onFocus={() => setFocusedField("hearAboutUs")}
                    onBlur={() => setFocusedField(null)}
                    className={selectButtonClasses("hearAboutUs", false)}
                  >
                    <span>
                      {formik.values.hearAboutUs || "Select an option"}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-black/35 transition-transform duration-200 shrink-0 ${
                        openDropdown === "hearAbout"
                          ? "rotate-180 text-brand"
                          : ""
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

                  {openDropdown === "hearAbout" && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenDropdown(null)}
                      />
                      <div className="absolute left-0 top-full mt-1 w-full bg-white border border-border rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                        {HEAR_ABOUT_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              formik.setFieldValue("hearAboutUs", opt);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-3.5 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                              formik.values.hearAboutUs === opt
                                ? "bg-soft text-brand font-bold"
                                : "text-black hover:bg-muted/30"
                            }`}
                          >
                            <span>{opt}</span>
                            {formik.values.hearAboutUs === opt && (
                              <HiCheck className="text-brand" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {step === 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="w-full bg-brand hover:bg-secondary text-black font-bold py-3.5 rounded-lg transition-all duration-300 ease-in-out shadow-sm hover:shadow-md active:scale-[0.99] text-sm cursor-pointer"
          >
            Continue
          </button>
        ) : (
          <>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-brand hover:bg-secondary text-black font-bold py-3.5 rounded-lg transition-all duration-300 ease-in-out shadow-sm hover:shadow-md active:scale-[0.99] text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {formik.isSubmitting
                ? "Redirecting..."
                : "Continue to verification"}
            </button>
            <p className="text-center text-[14px] text-black/50 pt-1">
              By submitting this application, you agree to our{" "} <br />
              <a
                href="#terms"
                className="text-brand hover:underline font-medium"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#privacy"
                className="text-brand hover:underline font-medium"
              >
                Privacy Policy
              </a>
              .
            </p>
          </>
        )}
      </form>

      {step === 1 && (
        <p className="text-center text-xs text-black/50 pt-1">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
};

export default RegisterForm;
