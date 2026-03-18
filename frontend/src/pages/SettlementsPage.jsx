import { useEffect, useState } from "react"
import { API_URL } from "../config"
import { ArrowUpRight, ArrowDownLeft, CheckCircle2, IndianRupee, Clock, Search, Wallet, History } from "lucide-react"

function SettlementsPage() {
    const userData = (() => {
        try { return JSON.parse(localStorage.getItem("user")) }
        catch (e) { return null }
    })()

    const [expenses, setExpenses] = useState([])
    const [settlements, setSettlements] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

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
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [userData?._id])

    const settlePayment = async (expenseId, personName, amount, targetUserId) => {
        try {
            const res = await fetch(`${API_URL}/expenses/settle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    expenseId,
                    personName,
                    personEmail: userData.email, // Include current user's email if they are settling
                    amount,
                    userId: userData._id // Record who performed the settlement
                })
            })
            if (res.ok) {
                const newSettle = await res.json()
                setSettlements([...settlements, newSettle])
            }
        } catch (err) {
            console.error(err)
        }
    }

    // Logic for "People Owe Me"
    const peopleOweMe = []
    // Logic for "I Owe People"
    const iOwePeople = []

    expenses.forEach(exp => {
        if (!exp || !exp.splitWith) return

        const currentUserName = (userData.name || "").toLowerCase()
        const currentUserEmail = (userData.email || "").toLowerCase()
        const payerNameStr = (exp.paidBy || "").toLowerCase()
        const iPaid = payerNameStr === currentUserName

        exp.splitWith.forEach(person => {
            if (!person || !person.name) return

            const personNameStr = person.name.toLowerCase()
            const personEmailStr = (person.email || "").toLowerCase()

            const isSettled = settlements.some(s =>
                s.expenseId === exp._id &&
                (s.personName || "").toLowerCase() === personNameStr
            )
            if (isSettled) return

            if (iPaid) {
                // If I paid, everyone in the split list owes me
                peopleOweMe.push({
                    expenseId: exp._id,
                    title: exp.title,
                    person: person.name,
                    amount: person.amount || (exp.amount / (exp.totalSplit || exp.splitWith.length + 1)),
                    date: exp.createdAt,
                    email: person.email,
                    targetUserId: userData._id
                })
            } else if (personNameStr === currentUserName || (personEmailStr && personEmailStr === currentUserEmail)) {
                // If someone else paid, and I am in the split list (by name or email), I owe the payer
                iOwePeople.push({
                    expenseId: exp._id,
                    title: exp.title,
                    person: exp.paidBy && exp.paidBy.toLowerCase() === currentUserName ? "You" : (exp.paidBy || "Someone"),
                    personEmail: exp.paidByEmail,
                    borrowerName: person.name, // The exact name used in split list for settlement recording
                    amount: person.amount || (exp.amount / (exp.totalSplit || exp.splitWith.length + 1)),
                    date: exp.createdAt,
                    targetUserId: exp.userId
                })
            }
        })
    })

    const filteredOweMe = peopleOweMe.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.person.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const filteredIOwe = iOwePeople.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.person.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) return <div className="p-8 text-center text-stone-400 font-bold">Loading settlements...</div>

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Settlements</h1>
                <p className="text-sm text-stone-500 font-medium">Manage what you owe and what's owed to you.</p>
            </div>

            {/* Search */}
            <div className="relative mb-8 max-w-md group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-800 transition-colors" size={18} />
                <input
                    className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-800/10 focus:border-amber-700 transition-all placeholder-stone-400 font-medium shadow-sm"
                    placeholder="Search people or expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Owed to Me Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1 mb-2">
                        <ArrowDownLeft className="text-emerald-600" size={18} />
                        <h2 className="text-xs font-black text-stone-400 uppercase tracking-widest">People Owe You</h2>
                        <span className="ml-auto bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-black">{filteredOweMe.length} Pending</span>
                    </div>

                    {filteredOweMe.length === 0 ? (
                        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-stone-200">
                            <CheckCircle2 className="mx-auto mb-3 text-emerald-200" size={40} />
                            <p className="text-sm font-bold text-stone-400">All clear! No one owes you money.</p>
                        </div>
                    ) : (
                        filteredOweMe.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-3xl p-5 border border-stone-100 shadow-xl shadow-stone-200/30 flex items-center justify-between group hover:border-emerald-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs">
                                        {item.person.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-stone-900 leading-none mb-1">{item.person}</p>
                                        <div className="flex flex-col gap-0.5 mt-1">
                                            {item.email && <p className="text-[9px] font-bold text-stone-400 truncate max-w-[120px]">{item.email}</p>}
                                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight truncate max-w-[120px]">For: {item.title}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-6">
                                    <div>
                                        <p className="text-xs font-black text-stone-900 tracking-tight">₹{item.amount.toLocaleString()}</p>
                                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{new Date(item.date).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={() => settlePayment(item.expenseId, item.person, item.amount, item.targetUserId)}
                                        className="p-2.5 rounded-xl bg-stone-50 text-stone-400 hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                                        title="Mark as Settled"
                                    >
                                        <CheckCircle2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* I Owe Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1 mb-2">
                        <ArrowUpRight className="text-amber-700" size={18} />
                        <h2 className="text-xs font-black text-stone-400 uppercase tracking-widest">You Owe People</h2>
                        <span className="ml-auto bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black">{filteredIOwe.length} Pending</span>
                    </div>

                    {filteredIOwe.length === 0 ? (
                        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-stone-200">
                            <Wallet className="mx-auto mb-3 text-amber-100" size={40} />
                            <p className="text-sm font-bold text-stone-400">Great! You don't owe anyone anything.</p>
                        </div>
                    ) : (
                        filteredIOwe.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-3xl p-5 border border-stone-100 shadow-xl shadow-stone-200/30 flex items-center justify-between group hover:border-amber-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-black text-xs">
                                        {item.person.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-stone-900 leading-none mb-1">{item.person}</p>
                                        <div className="flex flex-col gap-0.5 mt-1">
                                            {item.personEmail && <p className="text-[9px] font-bold text-stone-400 truncate max-w-[120px]">{item.personEmail}</p>}
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tight truncate max-w-[120px]">For: {item.title}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-6">
                                    <div>
                                        <p className="text-xs font-black text-red-600 tracking-tight">₹{item.amount.toLocaleString()}</p>
                                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{new Date(item.date).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={() => settlePayment(item.expenseId, item.borrowerName, item.amount, item.targetUserId)}
                                        className="px-4 py-2 rounded-xl bg-amber-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-900 transition-all active:scale-95 shadow-lg shadow-amber-900/10"
                                    >
                                        Settle
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Summary Banner */}
            <div className="mt-12 bg-stone-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-stone-900/40">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Overall Balance</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl md:text-5xl font-black tracking-tight">
                                ₹{(peopleOweMe.reduce((s, i) => s + i.amount, 0) - iOwePeople.reduce((s, i) => s + i.amount, 0)).toLocaleString()}
                            </span>
                            <span className="text-stone-400 text-xs font-bold uppercase tracking-widest">NET</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Total Owed to You</p>
                            <p className="text-lg font-black text-emerald-400">₹{peopleOweMe.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Total You Owe</p>
                            <p className="text-lg font-black text-amber-500">₹{iOwePeople.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-800/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {/* Settlement History Section */}
            <div className="mt-16 space-y-6">
                <div className="flex items-center gap-2 px-1">
                    <History size={18} className="text-stone-400" />
                    <h2 className="text-xs font-black text-stone-400 uppercase tracking-widest text-center">Settlement History</h2>
                    <div className="flex-1 h-px bg-stone-100 ml-4"></div>
                </div>

                {settlements.length === 0 ? (
                    <div className="text-center py-10 opacity-40">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">No history yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {[...settlements].reverse().map((s, idx) => {
                            const relatedExpense = expenses.find(e => e._id === s.expenseId)
                            const currentUserName = (userData.name || "").toLowerCase()
                            const isReceived = s.userId !== userData._id // If I didn't perform the settle, I received it

                            return (
                                <div key={idx} className="bg-stone-50/50 rounded-2xl p-4 border border-stone-100 flex items-center justify-between group hover:bg-white transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl ${isReceived ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-500"} flex items-center justify-center`}>
                                            {isReceived ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-stone-900 leading-none mb-1">
                                                {isReceived ? `Received from ${s.personName}` : `Paid to ${relatedExpense?.paidBy || "Friend"}`}
                                            </p>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tight">
                                                For: {relatedExpense?.title || "Settled Expense"} {s.personEmail && `| ${s.personEmail}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs font-black ${isReceived ? "text-emerald-600" : "text-stone-500"}`}>
                                            {isReceived ? "+" : "-"} ₹{s.amount.toLocaleString()}
                                        </p>
                                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                                            {new Date(s.settledAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SettlementsPage
