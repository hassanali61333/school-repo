"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
const router=useRouter()

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call – replace with your authentication logic
    console.log({ email, password, rememberMe });
    setTimeout(() => setLoading(false), 1000);
  };
console.log("hassan")
  return (
     <div className="min-h-screen flex items-center justify-center  p-6">
      {/* White Card */}
      <div className="w-full max-w-md bg-[rgb(27,31,53)] rounded-3xl shadow-xl p-8 border border-gray-100">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">EduAdmin</h2>
          <p className="text-white text-sm mt-1">Super Admin Panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            onClick={()=>router.push("/superAdmin")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition shadow-sm disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 py-0.5 text-gray-500">Secure Login</span>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm">
          © 2025 EduAdmin. All rights reserved.
        </p>
      </div>
    </div>
  );
}