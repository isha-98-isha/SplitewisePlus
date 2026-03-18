import React from "react"
import { X, Calendar, User, Tag, FileText, IndianRupee, Clock, CheckCircle2 } from "lucide-react"

function ExpenseDetailModal({ expense, settlements, isOpen, onClose, userData }) {
    if (!isOpen || !expense) return null

    const categoryEmojis = { Food: "🍔", Travel: "✈️", Shopping: "🛍️", Entertainment: "🎬", Utilities: "💡", Healthcare: "⚕️", Education: "📚", Rent: "🏠", Gym: "💪", Other: "❓" }

    const formattedDate = new Date(expense.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })

    const formattedTime = new Date(expense.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    })

    // Calculate my share logic (same as dashboard)
    const calculateMyShare = () => {
        if (!userData?._id || !expense) return 0
        const currentUserId = userData._id
        const currentUserEmail = (userData.email || "").toLowerCase()
        const currentUserName = (userData.name || "").toLowerCase()

        const iPaid = expense.userId === currentUserId || (expense.paidBy && expense.paidBy.toLowerCase() === currentUserName)
        const divisions = (expense.splitWith?.length || 0) + 1
        const totalSplitCount = expense.totalSplit || divisions
        const perPersonAmount = expense.amount / totalSplitCount

        if (iPaid) {
            return perPersonAmount
        } else {
            const mySplit = expense.splitWith?.find(p =>
                (p.email && p.email.toLowerCase() === currentUserEmail) ||
                (p.name && p.name.toLowerCase() === currentUserName)
            )
            return mySplit ? mySplit.amount || perPersonAmount : 0
        }
    }

    const myShare = calculateMyShare()

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-screen">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl shadow-stone-900/20 overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300 border border-stone-100">
                <div className="h-2 bg-amber-800 w-full" />

                {/* Header */}
                <div className="p-8 pb-4 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl shadow-inner border border-amber-100/50">
                            {categoryEmojis[expense.category] || "❓"}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-stone-900 tracking-tight leading-tight mb-1">{expense.title}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                                {expense.totalSplit > 1 ? "Transaction Details" : "Personal Expense"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-stone-300 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Amount Section */}
                <div className={`px-8 py-6 flex gap-4 ${expense.totalSplit <= 1 ? "justify-center" : ""}`}>
                    <div className={`${expense.totalSplit <= 1 ? "w-full max-w-[240px]" : "flex-1"} bg-stone-50/80 rounded-3xl p-5 border border-stone-100`}>
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <IndianRupee size={10} className="text-amber-800" /> {expense.totalSplit > 1 ? "Total Amount" : "Amount Paid"}
                        </p>
                        <p className="text-2xl font-black text-stone-900 tracking-tight">₹{Number(expense.amount || 0).toLocaleString()}</p>
                    </div>
                    {expense.totalSplit > 1 && (
                        <div className="flex-1 bg-amber-800 rounded-3xl p-5 shadow-lg shadow-amber-900/20">
                            <p className="text-[9px] font-black text-amber-100/70 uppercase tracking-widest mb-1.5">Your Portion</p>
                            <p className="text-2xl font-black text-white tracking-tight">₹{Number(myShare || 0).toLocaleString()}</p>
                        </div>
                    )}
                </div>

                {/* Content Tabs/Info */}
                <div className="p-8 pt-2 space-y-6">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-y-5 gap-x-8 py-4 border-y border-stone-50">
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-amber-800" />
                            <div>
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Date</p>
                                <p className="text-xs font-bold text-stone-700 leading-none">{formattedDate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock size={16} className="text-amber-800" />
                            <div>
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Time</p>
                                <p className="text-xs font-bold text-stone-700 leading-none">{formattedTime}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <User size={16} className="text-amber-800" />
                            <div>
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Paid By</p>
                                <p className="text-xs font-bold text-stone-700 leading-none truncate max-w-[120px]">
                                    {expense.paidBy && expense.paidBy.toLowerCase() === (userData?.name || "").toLowerCase() ? "You" : (expense.paidBy || "Someone")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Tag size={16} className="text-amber-800" />
                            <div>
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Category</p>
                                <p className="text-xs font-bold text-stone-700 leading-none">{expense.category}</p>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {expense.notes && (
                        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                            <p className="text-[9px] font-black text-amber-800/60 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <FileText size={12} /> Notes
                            </p>
                            <p className="text-xs font-medium text-stone-600 italic">"{expense.notes}"</p>
                        </div>
                    )}

                    {/* Split Breakdown */}
                    {expense.totalSplit > 1 && (
                        <div>
                            <p className="text-[10px] font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center justify-between">
                                Split Breakdown
                                <span className="text-[9px] text-stone-400 font-bold">{expense.totalSplit} ways</span>
                            </p>
                            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {/* Payer Share */}
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-[10px] text-amber-800 font-black uppercase">
                                            {(expense.paidBy || "U").slice(0, 1)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-stone-800">
                                                {expense.paidBy && expense.paidBy.toLowerCase() === (userData?.name || "").toLowerCase() ? "You" : (expense.paidBy || "Someone")}
                                                <span className="text-[10px] text-amber-800 opacity-60 font-black uppercase tracking-tight ml-1">(Payer)</span>
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-black text-stone-900">₹{(expense.amount / expense.totalSplit).toLocaleString()}</p>
                                </div>

                                {/* Other Splits */}
                                {expense.splitWith?.map((person, idx) => {
                                    const isSettled = settlements?.some(s => s.expenseId === expense._id && s.personName === person.name)
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-100">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[10px] text-stone-500 font-black uppercase">
                                                    {(person.name || "U").slice(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-stone-800">{person.name}</p>
                                                    {isSettled && (
                                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                                            <CheckCircle2 size={8} /> Settled
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs font-black text-stone-900">₹{(person.amount || (expense.amount / expense.totalSplit)).toLocaleString()}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="bg-stone-50 p-6 flex justify-center">
                    <button
                        onClick={onClose}
                        className="w-full bg-stone-900 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-stone-900/10 hover:bg-stone-800 transition active:scale-[0.98]"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ExpenseDetailModal
