import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { usersAPI } from "../../features/users/usersAPI";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import Navbar from "../../components/Navbar/Navbar";

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  username: string;
  confirmPassword: string;
};

const schema = yup.object().shape({
  first_name: yup.string().required("First Name is required"),
  last_name: yup.string().required("Last Name is required"),
  email: yup.string().email().required("Email is required"),
  phone_number: yup.string().required("Phone number is required"),
  username: yup.string().required("Username is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup.string().oneOf([yup.ref("password")], "Passwords must match").required("Confirm password is required"),
});

const Register = () => {
  const navigate = useNavigate();
  const [createUser, { error }] = usersAPI.useCreateUserMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log("Submitting data:", data);
    try {
      setIsSubmitting(true);
      const response = await createUser(data);
      console.log("Response data:", response);
      toast.success("Registration successful", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      if (error) {
        console.error("API error:", error);
        if ("data" in error && error.data) {
          toast.error("Invalid credentials", {
            position: "top-right",
            autoClose: 3000,
          });
          console.error("Error details:", error.data);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <ToastContainer />
      <Navbar />

      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row-reverse items-center gap-8 mt-8">
          {/* Register Form Card */}
          <div className="w-full lg:w-[45%] bg-[#1E293B] rounded-2xl p-8 shadow-2xl border border-indigo-500/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
              <p className="text-indigo-200 text-sm">Join us today</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-indigo-200 text-sm font-medium">First Name</label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    className="w-full px-3 py-2 rounded-lg bg-[#0F172A] text-indigo-200 border border-indigo-500/20 focus:border-indigo-500 placeholder-indigo-400/50 text-sm"
                    required
                    {...register("first_name")}
                  />
                  {errors.first_name && (
                    <p className="text-red-400 text-xs">{errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-indigo-200 text-sm font-medium">Last Name</label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    className="w-full px-3 py-2 rounded-lg bg-[#0F172A] text-indigo-200 border border-indigo-500/20 focus:border-indigo-500 placeholder-indigo-400/50 text-sm"
                    required
                    {...register("last_name")}
                  />
                  {errors.last_name && (
                    <p className="text-red-400 text-xs">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-indigo-200 text-sm font-medium">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 rounded-lg bg-[#0F172A] text-indigo-200 border border-indigo-500/20 focus:border-indigo-500 placeholder-indigo-400/50 text-sm"
                  required
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-indigo-200 text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 rounded-lg bg-[#0F172A] text-indigo-200 border border-indigo-500/20 focus:border-indigo-500 placeholder-indigo-400/50 text-sm"
                  required
                  {...register("phone_number")}
                />
                {errors.phone_number && (
                  <p className="text-red-400 text-xs">{errors.phone_number.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-indigo-200 text-sm font-medium">Username</label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  className="w-full px-3 py-2 rounded-lg bg-[#0F172A] text-indigo-200 border border-indigo-500/20 focus:border-indigo-500 placeholder-indigo-400/50 text-sm"
                  required
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-red-400 text-xs">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-indigo-200 text-sm font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="w-full px-3 py-2 rounded-lg bg-[#0F172A] text-indigo-200 border border-indigo-500/20 focus:border-indigo-500 placeholder-indigo-400/50 text-sm pr-10"
                    required
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {showPassword ? (
                      <span className="text-lg" role="img" aria-label="hide password">👁️</span>
                    ) : (
                      <span className="text-lg" role="img" aria-label="show password">👁️‍🗨️</span>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-indigo-200 text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="w-full px-3 py-2 rounded-lg bg-[#0F172A] text-indigo-200 border border-indigo-500/20 focus:border-indigo-500 placeholder-indigo-400/50 text-sm pr-10"
                    required
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <span className="text-lg" role="img" aria-label="hide password">👁️</span>
                    ) : (
                      <span className="text-lg" role="img" aria-label="show password">👁️‍🗨️</span>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 text-sm mt-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="text-center mt-2">
                <Link 
                  to="/login" 
                  className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </form>
          </div>

          {/* Image Section */}
          <div className="hidden lg:block w-full lg:w-[55%]">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl"></div>
              <img
                src="https://www.gitsoftwaresolutions.com/assets/whyUs/3.png"
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

export default Register;