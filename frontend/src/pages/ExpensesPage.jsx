import { useEffect, useState } from "react"
import { API_URL } from "../config"
import { Search, Filter, ArrowUpDown, Receipt, Plus, Trash2, CheckCircle2, X, Pencil, Info } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import ConfirmModal from "../components/ConfirmModal"
import ExpenseDetailModal from "../components/ExpenseDetailModal"

function ExpensesPage() {
    const navigate = useNavigate()
    const userData = (() => {
        try { return JSON.parse(localStorage.getItem("user")) }
        catch (e) { return null }
    })()
    const [expenses, setExpenses] = useState([])
    const [settlements, setSettlements] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterCategory, setFilterCategory] = useState("All")
    const [sortBy, setSortBy] = useState("Newest")
    const [message, setMessage] = useState({ text: "", type: "" })
    const [modalConfig, setModalConfig] = useState({ isOpen: false, id: null })
    const [selectedExpense, setSelectedExpense] = useState(null)

    useEffect(() => {
        if (!userData?._id) return
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [expRes, setRes] = await Promise.all([
                    fetch(`${API_URL}/expenses/${userData._id}`),
                    fetch(`${API_URL}/expenses/settle/${userData._id}`)
                ])
                const expData = await expRes.json()
                const setData = await setRes.json()
                setExpenses(Array.isArray(expData) ? expData.filter(Boolean) : [])
                setSettlements(Array.isArray(setData) ? setData.filter(Boolean) : [])
            } catch (err) {
                console.error(err)
                setMessage({ text: "Failed to load data", type: "error" })
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [userData?._id])

    const deleteExpense = async (id) => {
        setModalConfig({ isOpen: true, id })
    }

    const confirmDelete = async () => {
        const id = modalConfig.id
        setModalConfig({ isOpen: false, id: null })
        try {
            const res = await fetch(`${API_URL}/expenses/${id}`, { method: "DELETE" })
            if (res.ok) {
                setExpenses(expenses.filter(e => e._id !== id))
                setMessage({ text: "Expense removed", type: "success" })
            }
        } catch (err) {
            console.error(err)
            setMessage({ text: "Delete failed", type: "error" })
        }
    }

    const calculateMyShare = (e) => {
        if (!e || !userData?._id) return 0
        const currentUserId = userData._id
        const currentUserEmail = (userData.email || "").toLowerCase()
        const currentUserName = (userData.name || "").toLowerCase()

        const iPaid = e.userId === currentUserId || (e.paidBy && e.paidBy.toLowerCase() === currentUserName)
        const divisions = (e.splitWith?.length || 0) + 1
        const totalSplitCount = e.totalSplit || divisions
        const perPersonAmount = e.amount / totalSplitCount

        if (iPaid) {
            return perPersonAmount
        } else {
            const mySplit = e.splitWith?.find(p =>
                (p.email && p.email.toLowerCase() === currentUserEmail) ||
                (p.name && p.name.toLowerCase() === currentUserName)
            )
            return mySplit ? mySplit.amount || perPersonAmount : 0
        }
    }

    const filteredExpenses = expenses
        .filter(e => e && e.title && e.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(e => filterCategory === "All" || e.category === filterCategory)
        .sort((a, b) => {
            if (sortBy === "Newest") return new Date(b.createdAt) - new Date(a.createdAt)
            if (sortBy === "Oldest") return new Date(a.createdAt) - new Date(b.createdAt)
            if (sortBy === "Highest") return b.amount - a.amount
            if (sortBy === "Lowest") return a.amount - b.amount
            return 0
        })

    const categoryEmojis = { Food: "🍔", Travel: "✈️", Shopping: "🛍️", Entertainment: "🎬", Utilities: "💡", Healthcare: "⚕️", Education: "📚", Rent: "🏠", Gym: "💪", Other: "❓" }

    const toolClass = "flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-600 focus:outline-none focus:ring-4 focus:ring-amber-800/10 focus:border-amber-700 transition-all outline-none"

    if (isLoading) return <div className="p-8 text-center text-stone-400 font-bold">Loading expenses...</div>

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-stone-900 tracking-tight">Expenses</h1>
                    <p className="text-sm text-stone-500 font-medium">Tracking {expenses.length} activities across all groups.</p>
                </div>
                <Link
                    to="/expenses/add"
                    className="flex items-center justify-center gap-2 bg-amber-800 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-900/20 hover:bg-amber-900 transition active:scale-[0.98]"
                >
                    <Plus size={18} /> New Expense
                </Link>
            </div>

            {/* Tools Section */}
            <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/40 mb-8 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-800 transition-colors" size={16} />
                    <input
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-800/10 focus:border-amber-700 transition-all placeholder-stone-400 font-medium"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-stone-400" />
                        <select className={toolClass} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="All">All Categories</option>
                            {Object.keys(categoryEmojis).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <ArrowUpDown size={14} className="text-stone-400" />
                        <select className={toolClass} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="Newest">Newest First</option>
                            <option value="Oldest">Oldest First</option>
                            <option value="Highest">Highest Price</option>
                            <option value="Lowest">Lowest Price</option>
                        </select>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-xs font-black uppercase tracking-widest ${message.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        {message.text}
                    </div>
                    <button onClick={() => setMessage({ text: "", type: "" })}><X size={14} /></button>
                </div>
            )}

            {/* Grid */}
            {filteredExpenses.length === 0 ? (
                <div className="bg-white rounded-3xl py-24 text-center border border-stone-100 shadow-xl shadow-stone-200/40">
                    <Receipt className="mx-auto mb-4 opacity-10 text-stone-900" size={64} />
                    <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">No expenses found matching your criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExpenses.map(e => {
                        if (!e) return null
                        const myShare = calculateMyShare(e)
                        return (
                            <div key={e._id} className={`bg-white rounded-3xl p-6 border transition-all shadow-xl shadow-stone-200/30 group relative flex flex-col ${e.paidBy && e.paidBy.toLowerCase() === (userData.name || "").toLowerCase() ? "border-amber-200/50" : "border-stone-100 hover:border-amber-200"}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-10 h-10 rounded-2xl ${e.paidBy && e.paidBy.toLowerCase() === (userData.name || "").toLowerCase() ? "bg-amber-100 text-amber-800" : "bg-stone-50 text-stone-600"} text-lg flex items-center justify-center shrink-0`}>
                                        {categoryEmojis[e.category] || "❓"}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setSelectedExpense(e)}
                                            className="p-2 text-stone-300 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-all"
                                            title="View Details"
                                        >
                                            <Info size={16} />
                                        </button>
                                        <Link
                                            to={`/expenses/edit/${e._id}`}
                                            className="p-2 text-stone-300 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Pencil size={16} />
                                        </Link>
                                        <button
                                            onClick={() => deleteExpense(e._id)}
                                            className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-base font-black text-stone-900 truncate leading-tight mb-1">{e.title}</p>
                                <div className="flex items-center gap-2 mb-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 leading-none">
                                        Paid by {e.paidBy && e.paidBy.toLowerCase() === (userData.name || "").toLowerCase() ? "You" : (e.paidBy || "Someone")}
                                    </p>
                                    <span className="w-1 h-1 rounded-full bg-stone-200"></span>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 leading-none">
                                        {(() => {
                                            const d = new Date(e.createdAt);
                                            return isNaN(d.getTime()) ? "No date" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
                                        })()}
                                    </p>
                                </div>

                                <div className="space-y-3 mt-auto">
                                    <div className={`flex items-center gap-3 ${e.totalSplit <= 1 ? "justify-center" : ""}`}>
                                        <div className={`flex-1 bg-stone-50 p-3 rounded-2xl border border-stone-100 ${e.totalSplit <= 1 ? "max-w-[140px]" : ""}`}>
                                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-0.5">Total</p>
                                            <p className="text-sm font-black text-stone-900 leading-none">₹{Number(e.amount || 0).toLocaleString()}</p>
                                        </div>
                                        {e.totalSplit > 1 && (
                                            <div className="flex-1 bg-amber-50 p-3 rounded-2xl border border-amber-100/30">
                                                <p className="text-[8px] font-black text-amber-800/60 uppercase tracking-widest mb-0.5">Your Share</p>
                                                <p className="text-sm font-black text-amber-900 leading-none">₹{Number(myShare || 0).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-stone-50">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest italic">{e.category}</p>
                                        <button
                                            onClick={() => setSelectedExpense(e)}
                                            className="text-[9px] font-black text-amber-800 uppercase tracking-widest hover:underline underline-offset-4"
                                        >
                                            More Details
                                        </button>
                                    </div>
                                </div>

                                {/* Splits Summary Mini */}
                                {e.splitWith && Array.isArray(e.splitWith) && e.splitWith.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-stone-50">
                                        <div className="flex -space-x-2">
                                            {[...Array(Math.min(3, e.splitWith.length))].map((_, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-stone-400 uppercase">
                                                    {(e.splitWith[i].name || "U").slice(0, 1)}
                                                </div>
                                            ))}
                                            {e.splitWith.length > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-amber-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-amber-800">
                                                    +{e.splitWith.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                title="Delete Expense?"
                message="Are you sure you want to remove this expense? this action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setModalConfig({ isOpen: false, id: null })}
                confirmText="Delete"
                type="danger"
            />

            <ExpenseDetailModal
                isOpen={!!selectedExpense}
                onClose={() => setSelectedExpense(null)}
                expense={selectedExpense}
                userData={userData}
                settlements={settlements}
            />
        </div>
    )
}

export default ExpensesPage
