import { useState } from "react"
import { API_URL } from "../config"
import { useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Receipt, DollarSign, Tag, Users, Plus, X, Save, AlertCircle, Calendar, FileText } from "lucide-react"

function AddExpensePage() {
    const [title, setTitle] = useState("")
    const [amount, setAmount] = useState("")
    const [category, setCategory] = useState("Food")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState("")
    const [splitWith, setSplitWith] = useState([])
    const [newPerson, setNewPerson] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [whoPaid, setWhoPaid] = useState("you")
    const [payerName, setPayerName] = useState("")
    const [isMeInSplit, setIsMeInSplit] = useState(false)

    const navigate = useNavigate()
    const userData = (() => {
        try { return JSON.parse(localStorage.getItem("user")) }
        catch (e) { return null }
    })()

    const handleAddPerson = () => {
        if (newPerson.trim()) {
            setSplitWith([...splitWith, {
                name: newPerson.trim(),
                email: newEmail.trim() || ""
            }])
            setNewPerson("")
            setNewEmail("")
        }
    }

    const removePerson = (name) => {
        setSplitWith(splitWith.filter(p => p.name !== name))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!userData?._id) return setError("User not logged in")

        const numericAmount = parseFloat(amount)
        if (isNaN(numericAmount) || numericAmount <= 0) return setError("Please enter a valid amount")

        setLoading(true)
        setError("")
        try {
            // Calculate equal split amount for each person if splitting
            // Total divisions = splitWith.length + 1 (the payer)
            const divisions = splitWith.length + 1
            const perPersonAmount = parseFloat((numericAmount / divisions).toFixed(2))

            const formattedSplits = splitWith.map(person => ({
                name: person.name,
                email: person.email,
                amount: perPersonAmount
            }))

            const finalPaidBy = whoPaid === "you" ? userData.name : (payerName || "Someone")

            const res = await fetch(`${API_URL}/expenses/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userData._id,
                    title,
                    amount: numericAmount,
                    category,
                    paidBy: finalPaidBy,
                    paidByEmail: whoPaid === "you" ? userData.email : "",
                    splitWith: formattedSplits,
                    totalSplit: divisions,
                    createdAt: new Date(date),
                    notes
                })
            })
            if (res.ok) {
                navigate("/expenses")
            } else {
                const data = await res.json()
                setError(data.message || "Failed to add expense")
            }
        } catch (err) {
            console.error("Submission error details:", err)
            setError(`Server connection failed: ${err.message}. Please check if the backend is running at ${API_URL}`)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-800/10 focus:border-amber-700 transition-all placeholder-stone-400 font-medium"
    const labelClass = "block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1"

    return (
        <div className="max-w-2xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/expenses" className="p-2.5 rounded-2xl bg-white border border-stone-100 text-stone-400 hover:text-amber-800 transition-colors shadow-sm">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-stone-900 tracking-tight">Add New Expense</h1>
                    <p className="text-sm text-stone-500 font-medium">Create a new bill and split it with your friends.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
                <div className="h-2 bg-amber-800"></div>
                <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Expense Title</label>
                            <div className="relative group">
                                <Receipt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors" size={18} />
                                <input
                                    required
                                    className={inputClass}
                                    placeholder="e.g. Dinner at Taj"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Amount (₹)</label>
                            <div className="relative group">
                                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors" size={18} />
                                <input
                                    type="number"
                                    required
                                    className={inputClass}
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Category</label>
                            <div className="relative group">
                                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors" size={18} />
                                <select
                                    className={inputClass}
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="Food">Food</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Shopping">Shopping</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Education">Education</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Gym">Gym</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors" size={18} />
                                <input
                                    type="date"
                                    required
                                    className={inputClass}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>Notes (Optional)</label>
                            <div className="relative group">
                                <FileText className="absolute left-3.5 top-4 text-stone-300 group-focus-within:text-amber-800 transition-colors" size={18} />
                                <textarea
                                    className={`${inputClass} !h-24 !py-4`}
                                    placeholder="Add any extra details here..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-stone-50">
                        <label className={labelClass}>Who Paid?</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setWhoPaid("you")}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border ${whoPaid === "you" ? "bg-amber-800 text-white border-amber-800 shadow-md" : "bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100"}`}
                            >
                                I Paid
                            </button>
                            <button
                                type="button"
                                onClick={() => setWhoPaid("other")}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border ${whoPaid === "other" ? "bg-amber-800 text-white border-amber-800 shadow-md" : "bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100"}`}
                            >
                                Someone Else
                            </button>
                        </div>
                        {whoPaid === "other" && (
                            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                                <input
                                    className={inputClass}
                                    placeholder="Enter payer's name"
                                    value={payerName}
                                    onChange={(e) => setPayerName(e.target.value)}
                                />
                                {payerName && !isMeInSplit && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!splitWith.some(p => p.name.toLowerCase() === userData.name.toLowerCase())) {
                                                setSplitWith([...splitWith, { name: userData.name, email: userData.email, amount: 0 }])
                                            }
                                            setIsMeInSplit(true)
                                        }}
                                        className="mt-2 text-[10px] font-black text-amber-800 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 hover:bg-amber-100 transition-all"
                                    >
                                        + Include Me in Split
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-stone-50">
                        <label className={labelClass}>Split With</label>
                        <div className="space-y-3 mb-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1 group">
                                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors" size={18} />
                                    <input
                                        className={inputClass}
                                        placeholder="Person's name"
                                        value={newPerson}
                                        onChange={(e) => setNewPerson(e.target.value)}
                                    />
                                </div>
                                <div className="relative flex-[1.5] group">
                                    <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-800 transition-colors" size={18} />
                                    <input
                                        className={inputClass}
                                        placeholder="Email (required for notifications)"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPerson())}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddPerson}
                                    className="bg-amber-100 text-amber-800 px-4 rounded-xl hover:bg-amber-200 transition-colors shadow-sm active:scale-95 font-black uppercase text-[10px] tracking-widest"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 min-h-[44px]">
                            {splitWith.map((p, idx) => (
                                <div key={idx} className="flex flex-col bg-stone-50 border border-stone-100 p-3 rounded-2xl text-sm font-bold text-stone-700 animate-in zoom-in duration-200 relative group/tag">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-stone-900">{p.name}</span>
                                        <button type="button" onClick={() => removePerson(p.name)} className="text-stone-300 hover:text-red-500 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    {p.email && <span className="text-[10px] text-stone-400 font-medium truncate max-w-[120px]">{p.email}</span>}
                                </div>
                            ))}
                            {splitWith.length === 0 && (
                                <p className="text-xs text-stone-400 font-medium italic mt-2">Add friends to split this expense...</p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest border border-red-100">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-amber-800 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-900 transition shadow-xl shadow-amber-900/20 disabled:opacity-50 active:scale-[0.98]"
                    >
                        <Save size={18} />
                        {loading ? "Processing..." : "Create Expense"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AddExpensePage
