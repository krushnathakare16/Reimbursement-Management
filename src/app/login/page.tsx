"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Building2, Wallet, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currencies, setCurrencies] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
    baseCurrency: "USD"
  });

  // Fetch all global currencies smoothly using the provided API for the hackathon
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,currencies")
      .then(res => res.json())
      .then(data => {
        const currSet = new Set<string>();
        data.forEach((country: any) => {
          if (country.currencies) {
            Object.keys(country.currencies).forEach(c => currSet.add(c));
          }
        });
        setCurrencies(Array.from(currSet).sort());
      })
      .catch(err => console.error("Error fetching currencies:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isLogin) {
      // Login flow
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } else {
      // Registration flow -> Auto creates Company & Admin
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Registration failed");
        }

        // Successfully registered! Immediately sign them in.
        await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });
        
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 px-4">
      {/* Dynamic Background glow to make it look premium */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            {isLogin ? "Welcome back" : "Create a Company"}
          </h1>
          <p className="text-zinc-400">
            {isLogin 
              ? "Reimbursement Management System" 
              : "Register your tech startup (Takes 10 seconds)"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {!isLogin && (
            <>
              {/* Company Name */}
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="text-sm font-medium text-zinc-300 mb-2 block">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    name="companyName"
                    required={!isLogin}
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Base Currency */}
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="text-sm font-medium text-zinc-300 mb-2 block">Base Currency</label>
                <select
                  name="baseCurrency"
                  value={formData.baseCurrency}
                  onChange={handleChange}
                  className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                >
                  <option value="USD">USD - United States Dollar</option>
                  {currencies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 font-semibold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Company")}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            {isLogin 
              ? "New Company? Sign up here →" 
              : "Already have an account? Log in →"}
          </button>
        </div>
      </div>
    </div>
  );
}
