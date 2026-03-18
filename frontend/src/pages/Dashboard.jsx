import { useEffect, useState } from "react"
import { API_URL } from "../config"
import ExpenseChart from "../components/ExpenseChart"
import { TrendingUp, Receipt, Clock, Users, ArrowRight, Plus, Info } from "lucide-react"
import { Link } from "react-router-dom"
import ExpenseDetailModal from "../components/ExpenseDetailModal"

function Dashboard() {
  const userDataString = localStorage.getItem("user")
  const userData = (() => {
    try { return userDataString ? JSON.parse(userDataString) : null }
    catch (e) { return null }
  })()
  const username = userData?.name || "Guest"

  const [expenses, setExpenses] = useState([])
  const [groups, setGroups] = useState([])
  const [settlements, setSettlements] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedExpense, setSelectedExpense] = useState(null)

  useEffect(() => {
    if (!userData?._id) return
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [expRes, groupRes, setRes] = await Promise.all([
          fetch(`${API_URL}/expenses/${userData._id}`),
          fetch(`${API_URL}/groups/user/${userData._id}`),
          fetch(`${API_URL}/expenses/settle/${userData._id}`)
        ])
        const expData = await expRes.json()
        const groupData = await groupRes.json()
        const setData = await setRes.json()

        setExpenses(Array.isArray(expData) ? expData : [])
        setGroups(Array.isArray(groupData) ? groupData : [])
        setSettlements(Array.isArray(setData) ? setData : [])
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [userData?._id])

  const safeExpenses = expenses || []
  const safeGroups = groups || []
  const safeSettlements = settlements || []

  const calculateMyShare = (exp) => {
    if (!exp || !userData?._id) return 0
    const currentUserId = userData._id
    const currentUserEmail = (userData.email || "").toLowerCase()
    const currentUserName = (userData.name || "").toLowerCase()

    const iPaid = exp.userId === currentUserId || (exp.paidBy && exp.paidBy.toLowerCase() === currentUserName)
    const divisions = (exp.splitWith?.length || 0) + 1
    const totalSplitCount = exp.totalSplit || divisions
    const perPersonAmount = exp.amount / totalSplitCount

    if (iPaid) {
      return perPersonAmount
    } else {
      const mySplit = exp.splitWith?.find(p =>
        (p.email && p.email.toLowerCase() === currentUserEmail) ||
        (p.name && p.name.toLowerCase() === currentUserName)
      )
      return mySplit ? mySplit.amount || perPersonAmount : 0
    }
  }

  const totalSpent = safeExpenses.reduce((sum, exp) => sum + calculateMyShare(exp), 0)
  const totalExpenses = safeExpenses.length
  const totalGroups = safeGroups.length

  const pendingCount = (() => {
    let count = 0
    safeExpenses.forEach(exp => {
      if (!exp || !exp.splitWith || !Array.isArray(exp.splitWith)) return

      const currentUserName = (userData.name || "").toLowerCase()
      const payerNameStr = (exp.paidBy || "").toLowerCase()
      const iPaid = payerNameStr === currentUserName

      exp.splitWith.forEach(person => {
        if (!person || !person.name) return

        const personNameStr = person.name.toLowerCase()
        const isSettled = safeSettlements.some(s =>
          s && s.expenseId === exp._id &&
          (s.personName || "").toLowerCase() === personNameStr
        )

        // If I paid, check if this person settled with me
        if (iPaid) {
          if (!isSettled) count++
        }
        // If someone else paid, check if I (myself) settled with them
        else if (personNameStr === currentUserName) {
          if (!isSettled) count++
        }
      })
    })
    return count
  })()

  const recentExpenses = [...safeExpenses]
    .filter(e => e && e.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const categoryEmojis = { Food: "🍔", Travel: "✈️", Shopping: "🛍️", Entertainment: "🎬", Utilities: "💡", Healthcare: "⚕️", Education: "📚", Rent: "🏠", Gym: "💪", Other: "❓" }

  const statCards = [
    { label: "My Total Share", value: `₹${totalSpent.toLocaleString()}`, icon: TrendingUp, color: "text-amber-700", iconBg: "bg-amber-50", path: "/expenses" },
    { label: "Total Expenses", value: totalExpenses, icon: Receipt, color: "text-stone-700", iconBg: "bg-stone-50", path: "/expenses" },
    { label: "Pending Settlements", value: pendingCount, icon: Clock, color: "text-orange-700", iconBg: "bg-orange-50", path: "/settlements" },
    { label: "Total Groups", value: totalGroups, icon: Users, color: "text-stone-500", iconBg: "bg-stone-100", path: "/groups" },
  ]

  if (isLoading) {
    return <div className="p-8 text-center text-stone-400 font-bold">Loading your dashboard...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-10">
      {/* Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">Welcome back, {username} 👋</h1>
          <p className="text-stone-500 text-sm mt-1 font-medium">You have <span className="text-amber-700 font-bold">{pendingCount}</span> pending settlements to track.</p>
        </div>
        <Link
          to="/expenses/add"
          className="bg-amber-800 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-amber-900 transition shadow-lg shadow-amber-900/20 active:scale-[0.98] flex items-center gap-2"
        >
          <Plus size={18} /> Add New Expense
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <Link
              key={i}
              to={card.path}
              className="bg-white rounded-3xl p-6 border border-stone-100 shadow-xl shadow-stone-200/40 hover:scale-[1.02] hover:border-amber-200 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center group-hover:bg-white transition-colors`}>
                  <Icon size={22} className={card.color} />
                </div>
                <ArrowRight size={14} className="text-stone-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-black text-stone-900 mt-1 tracking-tight">{card.value}</p>
            </Link>
          )
        })}
      </div>

      {/* Charts & Transactions Stack */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Chart Card */}
        <div className="w-full lg:w-2/5 bg-white rounded-3xl p-8 border border-stone-100 shadow-xl shadow-stone-200/40 flex flex-col">
          <h3 className="text-sm font-black text-stone-900 mb-6 uppercase tracking-widest">Expense Breakdown</h3>
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <ExpenseChart expenses={safeExpenses} userData={userData} />
          </div>
        </div>

        {/* Transactions Card */}
        <div className="w-full lg:w-3/5 bg-white rounded-3xl p-8 border border-stone-100 shadow-xl shadow-stone-200/40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">Recent Transactions</h3>
            <Link to="/expenses" className="text-amber-700 text-xs font-bold hover:text-amber-900 flex items-center gap-1 transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="text-center py-16 text-stone-300 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
              <Receipt className="mx-auto mb-3 opacity-20" size={48} />
              <p className="text-sm font-bold">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full min-w-[450px]">
                <thead>
                  <tr className="border-b border-stone-50">
                    <th className="text-left py-3 text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Date</th>
                    <th className="text-left py-3 text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Description</th>
                    <th className="text-left py-3 text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Category</th>
                    <th className="text-right py-3 text-[10px] font-black text-stone-400 uppercase tracking-widest px-4">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {recentExpenses.map(exp => {
                    if (!exp) return null
                    return (
                      <tr key={exp._id} className="group hover:bg-stone-50/50 transition-colors cursor-pointer" onClick={() => setSelectedExpense(exp)}>
                        <td className="py-4 text-xs font-bold text-stone-500 whitespace-nowrap px-2">
                          {(() => {
                            const d = new Date(exp.createdAt);
                            return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
                          })()}
                        </td>
                        <td className="py-4 whitespace-nowrap px-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-stone-800 truncate max-w-[150px]">{exp.title}</span>
                            <div className="flex items-center gap-1.5">
                              {exp.paidBy && exp.paidBy.toLowerCase() === (userData.name || "").toLowerCase() && (
                                <span className="text-[8px] font-black text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">You Paid</span>
                              )}
                              <div className="p-1 px-1.5 rounded-lg bg-stone-100 text-[8px] text-stone-400 opacity-0 group-hover:opacity-100 transition-all font-black uppercase">Info</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 whitespace-nowrap px-2">
                          <span className="text-[10px] font-black bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full uppercase">
                            {categoryEmojis[exp.category] || ""} {exp.category || "Other"}
                          </span>
                        </td>
                        <td className="py-4 text-right text-sm font-black text-stone-900 whitespace-nowrap tracking-tight px-4 flex flex-col items-end justify-center">
                          <span>₹{(exp.totalSplit > 1 ? calculateMyShare(exp) : exp.amount).toLocaleString()}</span>
                          {exp.totalSplit > 1 && <span className="text-[8px] text-stone-400 opacity-60 uppercase font-black">Your Share</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ExpenseDetailModal
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
        userData={userData}
        settlements={safeSettlements}
      />
    </div>
  )
}

export default Dashboard
