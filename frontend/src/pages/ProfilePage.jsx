import { useState } from "react"
import { API_URL } from "../config"
import { User, Mail, Shield, Save, Camera } from "lucide-react"

function ProfilePage() {
    const userData = (() => {
        try { return JSON.parse(localStorage.getItem("user")) }
        catch (e) { return null }
    })() || {}
    const [name, setName] = useState(userData.name || "")
    const [email, setEmail] = useState(userData.email || "")
    const [message, setMessage] = useState({ text: "", type: "" })
    const [loading, setLoading] = useState(false)

    const handleUpdate = async () => {
        setLoading(true)
        setMessage({ text: "", type: "" })
        try {
            const res = await fetch(`${API_URL}/users/update-profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userData._id, name, email })
            })
            const data = await res.json()
            if (res.ok) {
                localStorage.setItem("user", JSON.stringify({ ...userData, name: data.name, email: data.email }))
                setMessage({ text: "Profile updated successfully!", type: "success" })
                window.dispatchEvent(new Event("authChanged"))
            } else {
                setMessage({ text: data.message || "Update failed", type: "error" })
            }
        } catch (err) {
            setMessage({ text: "Server error", type: "error" })
        } finally {
            setLoading(false)
        }
    }

    // Consistent input styling to prevent overlap
    const inputClass = "w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:ring-4 focus:ring-amber-800/10 focus:border-amber-700 outline-none transition-all font-medium text-stone-800"
    const labelClass = "block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1"

    return (
        <div className="max-w-2xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-stone-900">Your Profile</h1>
                <p className="text-sm text-stone-500">Manage your personal information and security settings.</p>
            </div>

            <div className="space-y-6">
                {/* Profile Card */}
                <div className="bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
                    <div className="h-32 bg-amber-800 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    </div>
                    <div className="px-6 md:px-10 pb-10">
                        <div className="relative -mt-16 mb-8 inline-block">
                            <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-2xl rotate-3 transform transition-transform hover:rotate-0 duration-500">
                                <div className="w-full h-full rounded-[1.25rem] bg-amber-50 flex items-center justify-center text-amber-900 text-4xl font-black border-4 border-amber-50 overflow-hidden">
                                    {(name || "U").charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-lg border border-stone-50 text-stone-400 hover:text-amber-800 transition-all hover:scale-110">
                                <Camera size={18} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className={labelClass}>Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors" size={18} />
                                    <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors" size={18} />
                                    <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" />
                                </div>
                            </div>

                            {message.text && (
                                <div className={`p-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                                    {message.text}
                                </div>
                            )}

                            <button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-amber-800 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-900 transition shadow-xl shadow-amber-900/20 disabled:opacity-50 active:scale-[0.98]"
                            >
                                <Save size={18} />
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Info */}
                <div className="bg-white rounded-3xl border border-stone-100 p-8 shadow-xl shadow-stone-200/40">
                    <h3 className="text-sm font-black text-stone-900 mb-5 flex items-center gap-2 uppercase tracking-tight">
                        <Shield size={20} className="text-amber-700" />
                        Account Security
                    </h3>
                    <p className="text-sm text-stone-500 mb-6 leading-relaxed">Your account is secured with secondary encryption. You can change your password from the login screen if you forget it.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 hover:bg-white transition-colors">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Last Login</p>
                            <p className="text-sm font-bold text-stone-700">Today, 21:52</p>
                        </div>
                        <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 hover:bg-white transition-colors">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Account Status</p>
                            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                Verified Premium
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
