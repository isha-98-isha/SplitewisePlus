import { useState, useEffect } from "react"
import { API_URL } from "../config"
import { Users, Receipt, TrendingUp, Clock, ShieldCheck, Trash2, Mail, User as UserIcon, Loader2, AlertCircle } from "lucide-react"
import ConfirmModal from "../components/ConfirmModal"

function AdminDashboard() {
    const userData = (() => {
        try { return JSON.parse(localStorage.getItem("user")) }
        catch (e) { return null }
    })()

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalExpenses: 0,
        totalVolume: 0,
        pendingSettlements: 0
    })
    const [users, setUsers] = useState([])
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState("overview")
    const [modalConfig, setModalConfig] = useState({ isOpen: false, id: null })

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const headers = { "Content-Type": "application/json", "user-id": userData._id }

                const [statsRes, usersRes, expensesRes] = await Promise.all([
                    fetch(`${API_URL}/admin/stats?userId=${userData._id}`, { headers }),
                    fetch(`${API_URL}/admin/users?userId=${userData._id}`, { headers }),
                    fetch(`${API_URL}/admin/expenses?userId=${userData._id}`, { headers })
                ])

                const statsData = await statsRes.json()
                const usersData = await usersRes.json()
                const expensesData = await expensesRes.json()

                if (statsRes.ok) setStats(statsData)
                if (usersRes.ok) setUsers(usersData)
                if (expensesRes.ok) setExpenses(expensesData)
            } catch (err) {
                setError("Failed to load administrative data")
            } finally {
                setLoading(false)
            }
        }
        if (userData?._id) fetchAdminData()
    }, [userData?._id])

    const handleDeleteUser = async (userId) => {
        setModalConfig({ isOpen: true, id: userId })
    }

    const confirmDeleteUser = async () => {
        const userId = modalConfig.id
        setModalConfig({ isOpen: false, id: null })

        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}?userId=${userData._id}`, {
                method: "DELETE",
                headers: { "user-id": userData._id }
            })
            if (res.ok) {
                setUsers(users.filter(u => u._id !== userId))
                // Refresh stats
                const statsRes = await fetch(`${API_URL}/admin/stats?userId=${userData._id}`, {
                    headers: { "user-id": userData._id }
                })
                const statsData = await statsRes.json()
                setStats(statsData)
            } else {
                const data = await res.json()
                setError(data.message || "Failed to delete user")
            }
        } catch (err) {
            setError("Connection error during deletion")
        }
    }

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-amber-800" size={48} />
            <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Accessing Command Center...</p>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">System Secure / Admin Authenticated</span>
                    </div>
                    <h1 className="text-4xl font-black text-stone-900 tracking-tight">Admin Command Center</h1>
                    <p className="text-stone-400 font-bold mt-1 text-sm">Oversee users, expenses, and system health across SplitWise+</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "overview" ? "bg-amber-800 text-white shadow-xl shadow-amber-900/20" : "bg-white text-stone-400 hover:text-stone-900 border border-stone-100 shadow-sm"}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "users" ? "bg-amber-800 text-white shadow-xl shadow-amber-900/20" : "bg-white text-stone-400 hover:text-stone-900 border border-stone-100 shadow-sm"}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab("expenses")}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "expenses" ? "bg-amber-800 text-white shadow-xl shadow-amber-900/20" : "bg-white text-stone-400 hover:text-stone-900 border border-stone-100 shadow-sm"}`}
                    >
                        Expenses
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-800/10 border border-red-800/20 text-red-800 rounded-3xl text-sm font-bold flex items-center gap-3">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {activeTab === "overview" && (
                <div className="space-y-10">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Total Users", val: stats.totalUsers, icon: Users, color: "bg-blue-50 text-blue-600" },
                            { label: "System Expenses", val: stats.totalExpenses, icon: Receipt, color: "bg-amber-50 text-amber-600" },
                            { label: "Total Volume", val: `₹${stats.totalVolume?.toLocaleString()}`, icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
                            { label: "Pending Splits", val: stats.pendingSettlements, icon: Clock, color: "bg-purple-50 text-purple-600" },
                        ].map((s, i) => (
                            <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-xl shadow-stone-200/40 relative overflow-hidden group">
                                <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500`}>
                                    <s.icon size={24} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{s.label}</p>
                                <p className="text-3xl font-black text-stone-900 tracking-tight">{s.val}</p>
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <s.icon size={80} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-stone-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-2xl font-black mb-4">You're in Control</h2>
                            <p className="text-stone-400 text-sm leading-relaxed mb-8">
                                As an administrator, you have full visibility into the SplitWise+ ecosystem. You can manage user accounts, monitor every expense logged, and track global financial flows. Your account is protected with system-wide administrative privileges.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/5">
                                    <ShieldCheck className="text-emerald-400" size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-200">Security: Tier 1</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/5">
                                    <ShieldCheck className="text-emerald-400" size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-200">Encryption: Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-[-5%] bottom-[-10%] opacity-10">
                            <ShieldCheck size={300} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "users" && (
                <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-stone-50">
                        <h2 className="text-xl font-black text-stone-900">User Management</h2>
                        <p className="text-xs text-stone-400 font-bold mt-1">Manage all registered accounts across the system</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-stone-50/50 border-b border-stone-100">
                                <tr>
                                    <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">User / Identity</th>
                                    <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Email Address</th>
                                    <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Role</th>
                                    <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50">
                                {users.map(u => (
                                    <tr key={u._id} className="hover:bg-stone-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                                    <UserIcon size={20} />
                                                </div>
                                                <span className="text-sm font-black text-stone-800">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-stone-500 text-xs font-bold">
                                                <Mail size={14} className="opacity-40" /> {u.email}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            {u.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    className="p-3 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "expenses" && (
                <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-stone-50">
                        <h2 className="text-xl font-black text-stone-900">System Expenses</h2>
                        <p className="text-xs text-stone-400 font-bold mt-1">Audit trail of all expenses created across the platform</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-stone-50/50 border-b border-stone-100">
                                <tr>
                                    <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Expense Title</th>
                                    <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Payer</th>
                                    <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Amount</th>
                                    <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Recorded By</th>
                                    <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50">
                                {expenses.map(exp => (
                                    <tr key={exp._id} className="hover:bg-stone-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-stone-800">{exp.title}</span>
                                            <p className="text-[9px] font-black uppercase text-amber-700 mt-0.5">{exp.category}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-stone-600">👤 {exp.paidBy}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-stone-900">₹{exp.amount?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-stone-400">{exp.userId?.name || "System"}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-stone-400">
                                                {new Date(exp.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                title="Delete User?"
                message="Are you sure you want to delete this user and all their data? This action cannot be undone."
                onConfirm={confirmDeleteUser}
                onCancel={() => setModalConfig({ isOpen: false, id: null })}
                confirmText="Delete User"
                type="danger"
            />
        </div>
    )
}

export default AdminDashboard
