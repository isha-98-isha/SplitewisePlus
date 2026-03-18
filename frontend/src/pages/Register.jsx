import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { API_URL } from "../config"
import { User, Mail, Lock, UserPlus, ArrowRight, Wallet } from "lucide-react"

function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        navigate("/login", { state: { message: "Account created successfully! Please sign in." } })
      } else {
        setError(data.message || "Registration failed")
      }
    } catch (err) {
      setError("Server error")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-800/5 focus:border-amber-800 transition-all font-bold text-stone-800 placeholder-stone-300"

  return (
    <div className="min-h-screen bg-[#FCF9F6] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-800 flex items-center justify-center text-white shadow-xl shadow-amber-900/20 logo-dance mb-4">
            <Wallet size={32} />
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tighter">
            SplitWise<span className="text-amber-800">+</span>
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-stone-300/50 border border-stone-50 p-10">
          <h2 className="text-xl font-black text-stone-800 mb-2">Create Account</h2>
          <p className="text-stone-400 text-sm font-medium mb-8">Join the smartest expense sharing community.</p>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Full name"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  className={inputClass}
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
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-xs font-black p-4 rounded-2xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-900 transition shadow-xl shadow-amber-900/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              <UserPlus size={18} />
              {loading ? "Creating..." : "Register Now"}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center text-xs font-bold text-stone-400 mt-8 uppercase tracking-widest">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-800 font-black hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
