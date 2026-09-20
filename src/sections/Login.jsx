import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import heroSide from "../assets/loginHero.png";
import { FaGaugeSimpleHigh } from "react-icons/fa6";
import { GiCheckedShield } from "react-icons/gi";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isEmailVerified, isLoading } = useAuth();

  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      isEmailVerified &&
      localStorage.getItem("token")
    ) {
      navigate("/account-under-review", { replace: true });
    }
  }, [isAuthenticated, isEmailVerified, isLoading, navigate]);

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left hero side */}
      <div className="w-full lg:w-[40%] h-full flex items-center justify-center p-4 lg:px-18 lg:py-30 bg-white overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <LoginForm />
      </div>
      {/* right hero side */}
      <div className="sticky top-0 h-screen w-[60%] rounded-tl-3xl rounded-bl-3xl overflow-hidden bg-linear-to-tl from-brand/20 to-secondary/40">
        <img src={heroSide} alt="hero" className="h-full w-full object-cover rounded-tl-3xl rounded-bl-3xl" />
      </div>
    </div>
  );
};

export default Login;