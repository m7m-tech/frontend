import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { useAuth } from "../context/AuthContext";
import signupImg from "../assets/signupImg.png";

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/verification", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    // No h-screen/overflow-hidden here: the page scrolls normally (single,
    // native browser scrollbar) instead of a nested scroll container.
    <div className="min-h-screen w-full flex">
      {/* Left side - form, part of normal document flow */}
      <div className="w-full lg:w-[40%] flex items-start justify-center px-6 md:px-10 py-10">
        <RegisterForm />
      </div>

      {/* Right side - pinned to the viewport while the left side scrolls,
          so it always renders at the exact viewport size with no empty
          space appearing below it. */}
      <div className="hidden lg:block lg:w-[60%] relative">
        <div className="sticky top-0 h-screen w-full rounded-2xl border-6 border-white overflow-hidden bg-linear-to-tl from-brand/20 to-secondary/40">
          <img
            src={signupImg}
            alt="hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute top-16 left-4">
            <p className="text-[32px] text-left font-bold text-black z-30">
              Plan smarter.
              <br />
              Deliver better.
            </p>
            <p className="text-[16px] text-black/80">
              Smart routing.
              <br />
              Efficient deliveries.
              <br />
              Keep your business moving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;