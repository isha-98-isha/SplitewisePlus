import { useEffect, useState, useMemo } from "react"
import { BarChart3, PieChart, Download, FileText, Table, Check, Calendar } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart as RechartsPie, Pie, Cell } from "recharts"
import { API_URL } from "../config"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

const CATEGORY_COLORS = {
    Food: "#f59e0b",
    Travel: "#3b82f6",
    Shopping: "#ec4899",
    Entertainment: "#8b5cf6",
    Utilities: "#10b981",
    Healthcare: "#ef4444",
    Education: "#6366f1",
    Rent: "#14b8a6",
    Gym: "#f97316",
    Other: "#78716c"
}

const PALETTE = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#ef4444"]

const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

function ReportsPage() {
    const [expenses, setExpenses] = useState([])
    const [settlements, setSettlements] = useState([])
    const [loading, setLoading] = useState(false)
    const [exportType, setExportType] = useState("CSV")
    const [dataType, setDataType] = useState("All") // "All", "Expenses", "Settlements"
    
    // Tracking starts from 2026 onwards
    const currentRealYear = new Date().getFullYear() // 2026
    
    // Separate states for Card 1 (Spending Trends) and Card 2 (Category Split)
    const [trendYear, setTrendYear] = useState(Math.max(2026, currentRealYear))
    const [pieYear, setPieYear] = useState(Math.max(2026, currentRealYear))
    const [pieMonth, setPieMonth] = useState("All")

    const userData = (() => {
        try { return JSON.parse(localStorage.getItem("user")) }
        catch (e) { return null }
    })()

    useEffect(() => {
        if (!userData?._id) return
        const fetchData = async () => {
            setLoading(true)
            try {
                const [expRes, setRes] = await Promise.all([
                    fetch(`${API_URL}/expenses/${userData._id}`),
                    fetch(`${API_URL}/expenses/settle/${userData._id}`)
                ])
                const expData = await expRes.json()
                const setData = await setRes.json()
                setExpenses(Array.isArray(expData) ? expData : [])
                setSettlements(Array.isArray(setData) ? setData : [])
            } catch (err) {
                console.error("Failed to fetch report data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [userData?._id])

    // Available years: Start from 2026 up to current year + next year
    const availableYears = useMemo(() => {
        const startYear = 2026
        const maxYear = Math.max(startYear, new Date().getFullYear())
        const years = []
        for (let y = startYear; y <= maxYear; y++) {
            years.push(y)
        }
        return years
    }, [])

    // Helper: calculate available months for a specific year
    const getMonthsForYear = (year) => {
        const now = new Date()
        const nowYear = now.getFullYear()
        const nowMonthIdx = now.getMonth() // 0-based: 10 for Nov

        let limit = 12
        if (year === nowYear) {
            limit = nowMonthIdx + 1 // e.g. 11 months for Nov 2026
        } else if (year > nowYear) {
            limit = 0
        }
        return MONTH_NAMES.slice(0, limit)
    }

    const monthsForTrendYear = useMemo(() => getMonthsForYear(trendYear), [trendYear])
    const monthsForPieYear = useMemo(() => getMonthsForYear(pieYear), [pieYear])

    // Reset pieMonth when switching pieYear if selected month doesn't exist in that year
    useEffect(() => {
        if (pieMonth !== "All" && !monthsForPieYear.includes(pieMonth)) {
            setPieMonth("All")
        }
    }, [pieYear, monthsForPieYear, pieMonth])

    // 1. Data for "Spending Trends" (Monthly Bar Chart)
    const monthlySpendingData = useMemo(() => {
        const yearExpenses = expenses.filter(e => {
            const raw = e.createdAt || e.date
            if (!raw) return false
            const d = new Date(raw)
            return d.getFullYear() === Number(trendYear)
        })

        const monthTotals = {}
        monthsForTrendYear.forEach(m => { monthTotals[m] = 0 })

        yearExpenses.forEach(e => {
            const raw = e.createdAt || e.date
            const d = new Date(raw)
            const mName = MONTH_NAMES[d.getMonth()]
            if (monthTotals[mName] !== undefined) {
                monthTotals[mName] += Number(e.amount) || 0
            }
        })

        return monthsForTrendYear.map(m => ({
            month: m,
            amount: monthTotals[m] || 0
        }))
    }, [expenses, trendYear, monthsForTrendYear])

    // 2. Data for "Category Split" (Pie Chart for selected pieYear & pieMonth)
    const filteredPieExpenses = useMemo(() => {
        return expenses.filter(e => {
            const raw = e.createdAt || e.date
            if (!raw) return false
            const d = new Date(raw)
            if (d.getFullYear() !== Number(pieYear)) return false
            if (pieMonth === "All") return true
            return MONTH_NAMES[d.getMonth()] === pieMonth
        })
    }, [expenses, pieYear, pieMonth])

    const categoryData = useMemo(() => {
        const map = {}
        filteredPieExpenses.forEach(e => {
            const cat = e.category || "Other"
            const amt = Number(e.amount) || 0
            map[cat] = (map[cat] || 0) + amt
        })
        return Object.keys(map).map((k, i) => ({
            name: k,
            value: map[k],
            color: CATEGORY_COLORS[k] || PALETTE[i % PALETTE.length]
        }))
    }, [filteredPieExpenses])

    const totalPieAmount = useMemo(() => {
        return filteredPieExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    }, [filteredPieExpenses])

    const handleExport = () => {
        const hasExpenses = expenses.length > 0 && (dataType === "All" || dataType === "Expenses")
        const hasSettlements = settlements.length > 0 && (dataType === "All" || dataType === "Settlements")

        if (!hasExpenses && !hasSettlements) {
            alert(`No ${dataType === "All" ? "data" : dataType.toLowerCase()} available to export`)
            return
        }

        if (exportType === "CSV") {
            exportToCSV(hasExpenses, hasSettlements)
        } else {
            exportToPDF(hasExpenses, hasSettlements)
        }
    }

    const exportToCSV = (doExp, doSet) => {
        let csvContent = `TRANSACTION HISTORY - ${dataType.toUpperCase()}\n\n`
        
        if (doExp) {
            csvContent += "--- EXPENSES ---\n"
            csvContent += "Title,Amount,Category,Paid By,Date,Notes\n"
            expenses.forEach(e => {
                const date = e.createdAt ? new Date(e.createdAt).toLocaleDateString() : (e.date ? new Date(e.date).toLocaleDateString() : "N/A")
                csvContent += `"${e.title}",${e.amount},"${e.category}","${e.paidBy}","${date}","${(e.notes || "").replace(/"/g, '""')}"\n`
            })
            csvContent += "\n"
        }

        if (doSet) {
            csvContent += "--- SETTLEMENTS ---\n"
            csvContent += "From/To,Amount,Date\n"
            settlements.forEach(s => {
                const date = s.date ? new Date(s.date).toLocaleDateString() : "N/A"
                csvContent += `"${s.personName}",${s.amount},"${date}"\n`
            })
        }

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `SplitWisePlus_${dataType}_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const exportToPDF = (doExp, doSet) => {
        try {
            const doc = new jsPDF()

            doc.setFillColor(245, 158, 11)
            doc.rect(0, 0, 210, 15, "F")
            
            doc.setFontSize(22)
            doc.setTextColor(40, 40, 40)
            doc.text("SplitWisePlus Report", 14, 28)
            
            doc.setFontSize(10)
            doc.setTextColor(120, 120, 120)
            doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 35)
            doc.text(`User: ${userData?.name || "Member"} (${userData?.email || ""})`, 14, 40)
            doc.text(`Scope: ${dataType} Records`, 14, 45)

            let finalY = 50

            if (doExp) {
                doc.setFontSize(14)
                doc.setTextColor(180, 83, 9)
                doc.text("Expenses Log", 14, finalY + 6)
                
                const expenseColumns = ["Title", "Amount", "Category", "Paid By", "Date"]
                const expenseRows = expenses.map(e => [
                    e.title || "Untitled",
                    `INR ${Number(e.amount || 0).toLocaleString()}`,
                    e.category || "General",
                    e.paidBy || "You",
                    e.createdAt ? new Date(e.createdAt).toLocaleDateString() : (e.date ? new Date(e.date).toLocaleDateString() : "N/A")
                ])

                autoTable(doc, {
                    startY: finalY + 10,
                    head: [expenseColumns],
                    body: expenseRows,
                    theme: "striped",
                    headStyles: { fillColor: [217, 119, 6] },
                    styles: { fontSize: 8 },
                    margin: { left: 14, right: 14 }
                })

                finalY = doc.lastAutoTable.finalY + 10
            }

            if (doSet) {
                if (finalY > 240) {
                    doc.addPage()
                    finalY = 20
                }

                doc.setFontSize(14)
                doc.setTextColor(180, 83, 9)
                doc.text("Settlements Log", 14, finalY + 6)

                const settlementColumns = ["Person", "Amount", "Date"]
                const settlementRows = settlements.map(s => [
                    s.personName || "Unknown",
                    `INR ${Number(s.amount || 0).toLocaleString()}`,
                    s.date ? new Date(s.date).toLocaleDateString() : "N/A"
                ])

                autoTable(doc, {
                    startY: finalY + 10,
                    head: [settlementColumns],
                    body: settlementRows,
                    theme: "striped",
                    headStyles: { fillColor: [180, 83, 9] },
                    styles: { fontSize: 8 },
                    margin: { left: 14, right: 14 }
                })
            }

            doc.save(`SplitWisePlus_${dataType}_${new Date().toISOString().split('T')[0]}.pdf`)
        } catch (err) {
            console.error("PDF Generation error:", err)
            alert("Error generating PDF. Please check console for details.")
        }
    }

    const SelectorButton = ({ type, label, current, setter, icon: Icon }) => (
        <button 
            onClick={() => setter(type)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${current === type ? "bg-white text-amber-900 border-white shadow-lg scale-105" : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"}`}
        >
            {Icon && <Icon size={14} />}
            {label}
            {current === type && <Check size={12} className="ml-1" />}
        </button>
    )

    return (
        <div className="max-w-4xl mx-auto pb-10 px-4">
            {/* Header: Clean & Uncluttered */}
            <div className="mb-6">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Financial Intelligence</h1>
                <p className="text-sm text-stone-500 font-medium tracking-tight">Detailed analytics and exportable insights of your spending habits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Spending Trends (Bar Chart Area) */}
                <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-xl shadow-stone-200/40 flex flex-col">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700 shadow-inner">
                                <BarChart3 size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-stone-800 uppercase tracking-widest">Spending Trends</h3>
                                <p className="text-[11px] text-stone-400 font-medium">Monthly progress overview</p>
                            </div>
                        </div>

                        {/* Year Dropdown placed right next to Spending Trends */}
                        <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Year:</span>
                            <select 
                                value={trendYear} 
                                onChange={(e) => setTrendYear(Number(e.target.value))}
                                className="text-xs font-black text-stone-800 bg-transparent outline-none cursor-pointer"
                            >
                                {availableYears.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="h-56 w-full mt-2">
                        {monthlySpendingData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-stone-400 font-medium">
                                No tracking data available for {trendYear}.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={monthlySpendingData} 
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    barCategoryGap="20%"
                                >
                                    <XAxis 
                                        dataKey="month" 
                                        tick={{ fontSize: 10, fontWeight: 700, fill: "#78716c" }} 
                                        axisLine={false} 
                                        tickLine={false} 
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 10, fill: "#a8a29e" }} 
                                        axisLine={false} 
                                        tickLine={false} 
                                    />
                                    <Tooltip 
                                        formatter={(val) => [`₹${Number(val).toLocaleString()}`, "Spent"]}
                                        contentStyle={{ backgroundColor: "#1c1917", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px", fontWeight: "bold" }}
                                    />
                                    <Bar 
                                        dataKey="amount" 
                                        fill="#d97706" 
                                        radius={[6, 6, 0, 0]} 
                                        maxBarSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 2. Category Split (Pie Chart Area with Coordinated Year + Clean Month Dropdown) */}
                <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-xl shadow-stone-200/40 flex flex-col">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-700 shadow-inner">
                                <PieChart size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-stone-800 uppercase tracking-widest">Category Split</h3>
                                    <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg">
                                        ₹{totalPieAmount.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-[11px] text-stone-400 font-medium">
                                    {pieMonth === "All" ? `All ${pieYear}` : `${pieMonth} ${pieYear}`}
                                </p>
                            </div>
                        </div>

                        {/* Wider Control holding Year + Month Pickers */}
                        <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
                            {/* Year Picker */}
                            <select 
                                value={pieYear} 
                                onChange={(e) => setPieYear(Number(e.target.value))}
                                className="text-xs font-black text-stone-800 bg-transparent outline-none cursor-pointer pr-1 border-r border-stone-300"
                            >
                                {availableYears.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>

                            {/* Clean Jan-Dec Month Picker (without year repeat) */}
                            <select 
                                value={pieMonth} 
                                onChange={(e) => setPieMonth(e.target.value)}
                                className="text-xs font-black text-stone-800 bg-transparent outline-none cursor-pointer pl-1"
                            >
                                <option value="All">All Months</option>
                                {monthsForPieYear.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="h-56 w-full flex flex-col items-center justify-center">
                        {categoryData.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-xs text-stone-400 font-medium gap-1">
                                <span>No expenses recorded for</span>
                                <span className="font-bold text-stone-500">
                                    {pieMonth === "All" ? `Year ${pieYear}` : `${pieMonth} ${pieYear}`}
                                </span>
                            </div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={160}>
                                    <RechartsPie>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={45}
                                            outerRadius={70}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(val) => [`₹${Number(val).toLocaleString()}`, "Total"]}
                                            contentStyle={{ backgroundColor: "#1c1917", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px", fontWeight: "bold" }}
                                        />
                                    </RechartsPie>
                                </ResponsiveContainer>

                                {/* Legend chips */}
                                <div className="flex flex-wrap gap-2 justify-center mt-2 max-h-16 overflow-y-auto px-2">
                                    {categoryData.map(c => (
                                        <span key={c.name} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-stone-600 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-100">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></span>
                                            {c.name} (₹{c.value.toLocaleString()})
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Export Section (Preserved 100% Unchanged) */}
            <div className="mt-8 bg-amber-800 rounded-3xl p-8 md:p-10 text-white flex flex-col items-stretch gap-8 overflow-hidden relative shadow-2xl shadow-amber-900/40">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-black tracking-tight mb-1">Custom Export</h3>
                        <p className="text-amber-200 text-xs font-medium">Configure and download your transaction records.</p>
                    </div>
                    <button 
                        onClick={handleExport}
                        disabled={loading}
                        className="bg-white text-amber-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-stone-50 transition shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        <Download size={18} /> {loading ? "Fetching..." : "Export Now"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 pt-8 border-t border-white/10">
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-amber-200/60 mb-3 ml-1">1. Select Data Type</label>
                        <div className="flex flex-wrap gap-2">
                            <SelectorButton type="All" label="Everything" current={dataType} setter={setDataType} />
                            <SelectorButton type="Expenses" label="Expenses Only" current={dataType} setter={setDataType} />
                            <SelectorButton type="Settlements" label="Settlements Only" current={dataType} setter={setDataType} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-amber-200/60 mb-3 ml-1">2. File Format</label>
                        <div className="flex flex-wrap gap-2">
                            <SelectorButton type="CSV" label="CSV Excel" current={exportType} setter={setExportType} icon={Table} />
                            <SelectorButton type="PDF" label="PDF Document" current={exportType} setter={setExportType} icon={FileText} />
                        </div>
                    </div>
                </div>
                
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-[80px]"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-black/10 rounded-full blur-[60px]"></div>
            </div>
        </div>
    )
}

export default ReportsPage
