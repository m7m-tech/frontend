import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { FaGaugeSimpleHigh } from "react-icons/fa6";
import { GiCheckedShield } from "react-icons/gi";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/account-under-review", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left hero side */}
      <div className="hidden md:flex h-full w-[50%] bg-linear-to-tl from-primary from-20% to-emerald to-80% flex-col gap-7 p-10 md:items-center md:justify-center rounded-tr-3xl rounded-br-3xl">
        <div className="w-full flex items-center justify-center">
          <img src={logo} alt="logo" className="w-[256px] h-50.25" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-bold text-white text-center text-3xl px-10">
            Mastering Logistics through Intelligence.
          </h1>
          <p className="text-white/90 text-center font-extralight mt-7 px-8">
            Experience the next generation of fleet management with real-time
            routing, predictive analytics, and enterprise-grade security.
          </p>
          <div className="flex gap-4 justify-center items-center mt-6">
            <button className="flex items-center justify-center gap-1 text-white border border-white/10 p-2 bg-white/10 rounded-xl backdrop-blur-md hover:bg-white/20 transition-all duration-200">
              <FaGaugeSimpleHigh className="text-emerald w-4 h-5" /> Fast Setup
            </button>
            <button className="flex items-center justify-center gap-1 text-white border border-white/10 p-2 bg-white/10 rounded-xl backdrop-blur-md hover:bg-white/20 transition-all duration-200">
              <GiCheckedShield className="text-emerald w-4 h-5" /> Enterprise
              Grade
            </button>
          </div>
        </div>
      </div>

      {/* Right hero side */}
      <div className="w-full md:w-[50%] h-full flex items-center justify-center p-8 bg-white overflow-y-auto">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
