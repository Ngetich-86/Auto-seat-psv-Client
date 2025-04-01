import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LoginFormData } from "../../features/login/loginAPI";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import { useDispatch } from "react-redux";
import Navbar from "../../components/Navbar/Navbar";
import { loginSuccess } from "../../features/users/userSlice";
import { ApiDomain } from "../../utils/ApiDomain"; // Use ApiDomain for API requests

type FormData = {
  email: string;
  password: string;
};

const schema = yup.object().shape({
  email: yup.string().email().required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false); // login loader
  const [showPassword, setShowPassword] = useState(false); // Add this line

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  // Submit form
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    console.log("Submitting login request:", JSON.stringify(data));
    try {
      setIsLoggingIn(true); // Show logging in loader

      // Use ApiDomain for the API request
      const response = await fetch(`${ApiDomain}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log("Login response:", response.status, responseData);

      if (!response.ok) {
        toast.error(responseData.message || "Invalid credentials", {
          position: "top-right",
          autoClose: 3000,
        }); // Show error toast
        console.error("API error:", responseData.message);
        return;
      }

      // ✅ Save user data in localStorage
      localStorage.setItem("user", JSON.stringify(responseData));

      dispatch(loginSuccess(responseData));
      toast.success("Login successful", {
        position: "top-right",
        autoClose: 3000,
      }); // Show success toast

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error("API error:", err); // Log error
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      }); // Show error toast
    } finally {
      setIsLoggingIn(false); // Hide loader
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <ToastContainer />
      <Navbar />
      
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row-reverse items-center gap-8 mt-8">
          {/* Login Form Card */}
          <div className="w-full lg:w-[45%] bg-[#1E293B] rounded-2xl p-8 shadow-2xl border border-indigo-500/20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-indigo-200">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-indigo-200 text-sm font-medium">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg bg-[#0F172A] text-indigo-200 border border-indigo-500/20 focus:border-indigo-500 placeholder-indigo-400/50"
                  required
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-indigo-200 text-sm font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-lg bg-[#0F172A] text-indigo-200 border border-indigo-500/20 focus:border-indigo-500 placeholder-indigo-400/50 pr-12"
                    required
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {showPassword ? (
                      <span className="text-xl" role="img" aria-label="hide password">👁️</span>
                    ) : (
                      <span className="text-xl" role="img" aria-label="show password">👁️‍🗨️</span>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <a 
                  href="/forgot-password" 
                  className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="text-center">
                <Link 
                  to="/register" 
                  className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  Don't have an account? Register
                </Link>
              </div>
            </form>
          </div>

          {/* Image Section */}
          <div className="hidden lg:block w-full lg:w-[55%]">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl"></div>
              <img
                src="https://www.gitsoftwaresolutions.com/assets/whyUs/4.png"
                alt="auth"
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;