import { useState } from "react"
import { Link } from "react-router-dom"
import { API_URL } from "../config"
import { Mail, ArrowLeft, Send } from "lucide-react"

function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState({ text: "", type: "" })
    const [loading, setLoading] = useState(false)
    const [debugToken, setDebugToken] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ text: "", type: "" })
        try {
            const res = await fetch(`${API_URL}/users/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ text: "Demo Link Generated Below", type: "success" })
                setDebugToken(data.resetToken)
            } else {
                setMessage({ text: data.message || "Request failed", type: "error" })
            }
        } catch (err) {
            setMessage({ text: "Server error", type: "error" })
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-800/5 focus:border-amber-800 transition-all font-bold text-stone-800 placeholder-stone-300"

    return (
        <div className="min-h-screen bg-[#FCF9F6] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-stone-300/50 border border-stone-50 p-10 md:p-12">
                <Link to="/login" className="inline-flex items-center gap-2 text-xs font-black text-stone-400 hover:text-amber-800 mb-8 uppercase tracking-widest transition-colors">
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <div className="mb-10">
                    <h2 className="text-2xl font-black text-stone-900 mb-2 tracking-tighter">Forgot Password?</h2>
                    <p className="text-sm text-stone-400 font-medium">Enter your email and we'll send you a simulation link to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors" size={18} />
                        <input
                            type="email"
                            required
                            className={inputClass}
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {message.text && (
                        <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                            {message.text}
                        </div>
                    )}

                    {debugToken && (
                        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 animate-in zoom-in duration-300">
                            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-3 opacity-60">Control Panel: Demo Token</p>
                            <Link
                                to={`/reset-password/${debugToken}`}
                                className="inline-flex items-center gap-2 text-sm font-black text-amber-800 hover:text-amber-900 group"
                            >
                                Access Reset Page <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={16} />
                            </Link>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-800 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-amber-900 transition shadow-xl shadow-amber-900/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <Send size={18} />
                        {loading ? "Sending..." : "Request Reset Link"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ForgotPassword
