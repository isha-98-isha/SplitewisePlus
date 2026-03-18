import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { API_URL } from "../config"
import { Mail, Lock, LogIn, ArrowRight, Wallet, CheckCircle2 } from "lucide-react"

function Login() {
  const location = useLocation()
  const successMsg = location.state?.message
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data))
        window.dispatchEvent(new Event("authChanged"))
        navigate("/")
      } else {
        setError(data.message || "Login failed")
      }
    } catch (err) {
      setError("Server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FCF9F6] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-[2rem] bg-amber-800 flex items-center justify-center text-white shadow-2xl shadow-amber-900/30 logo-dance mb-6 border-4 border-white/10">
            <Wallet size={36} />
          </div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter">
            SplitWise<span className="text-amber-800">+</span>
          </h1>
          <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px] mt-2">Personal Expense Architect</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-stone-300/50 border border-stone-50 p-10 md:p-12">
          <h2 className="text-2xl font-black text-stone-800 mb-2">Welcome Back</h2>
          <p className="text-stone-400 text-sm font-medium mb-8">Sign in to manage your shared expenses.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-5 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-800/5 focus:border-amber-800 transition-all font-bold text-stone-800 placeholder-stone-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-5 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-800/5 focus:border-amber-800 transition-all font-bold text-stone-800 placeholder-stone-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pr-1">
              <Link to="/forgot-password" size="sm" className="text-xs font-black text-amber-800 hover:text-amber-900 transition-colors uppercase tracking-widest">
                Forgot password?
              </Link>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl border border-emerald-100 animate-in fade-in zoom-in duration-200 flex items-center gap-2 mb-4">
                <CheckCircle2 size={14} /> {successMsg}
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl border border-red-100 animate-in fade-in zoom-in duration-200 mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-800 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-amber-900 transition-all shadow-xl shadow-amber-900/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              <LogIn size={20} />
              {loading ? "Authenticating..." : "Sign In"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center text-xs font-bold text-stone-400 mt-10 uppercase tracking-widest">
            Don't have an account?{" "}
            <Link to="/register" className="text-amber-800 font-black hover:underline underline-offset-4">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
