import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { API_URL } from "../config"
import { Lock, ArrowLeft, CheckCircle } from "lucide-react"

function ResetPassword() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState({ text: "", type: "" })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            return setMessage({ text: "Passwords do not match", type: "error" })
        }

        setLoading(true)
        setMessage({ text: "", type: "" })
        try {
            const res = await fetch(`${API_URL}/users/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password })
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ text: "Password reset successful! Redirecting...", type: "success" })
                setTimeout(() => navigate("/login"), 2500)
            } else {
                setMessage({ text: data.message || "Reset failed", type: "error" })
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
                <div className="mb-10">
                    <h2 className="text-2xl font-black text-stone-900 mb-2 tracking-tighter">New Password</h2>
                    <p className="text-sm text-stone-400 font-medium">Please create a secure password that you don't use elsewhere.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors" size={18} />
                            <input
                                type="password"
                                required
                                className={inputClass}
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors" size={18} />
                            <input
                                type="password"
                                required
                                className={inputClass}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                            {message.type === "success" && <CheckCircle size={14} />}
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-800 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-amber-900 transition shadow-xl shadow-amber-900/20 active:scale-[0.98]"
                    >
                        {loading ? "Updating..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword
