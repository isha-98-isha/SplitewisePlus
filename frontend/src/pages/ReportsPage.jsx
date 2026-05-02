import { useEffect, useState } from "react"
import { BarChart3, PieChart, Download, FileText, Table, Check } from "lucide-react"
import { API_URL } from "../config"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

function ReportsPage() {
    const [expenses, setExpenses] = useState([])
    const [settlements, setSettlements] = useState([])
    const [loading, setLoading] = useState(false)
    const [exportType, setExportType] = useState("CSV")
    const [dataType, setDataType] = useState("All") // "All", "Expenses", "Settlements"

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
            csvContent += "EXPENSES\n"
            csvContent += "Title,Amount,Category,Paid By,Date,Notes\n"
            expenses.forEach(e => {
                const date = new Date(e.createdAt).toLocaleDateString()
                csvContent += `"${e.title}",${e.amount},"${e.category}","${e.paidBy}","${date}","${(e.notes || "").replace(/"/g, '""')}"\n`
            })
        }

        if (doSet) {
            if (doExp) csvContent += "\n"
            csvContent += "SETTLEMENTS\n"
            csvContent += "From/To,Amount,Date\n"
            settlements.forEach(s => {
                const date = new Date(s.createdAt).toLocaleDateString()
                csvContent += `"${s.personName}",${s.amount},"${date}"\n`
            })
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `SplitWisePlus_${dataType}_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const exportToPDF = (doExp, doSet) => {
        try {
            const doc = new jsPDF()
            
            // Header
            doc.setFontSize(22)
            doc.setTextColor(120, 53, 15) // amber-900 color
            doc.text("SplitWisePlus Report", 14, 22)
            
            doc.setFontSize(10)
            doc.setTextColor(100)
            doc.text(`Type: ${dataType} History`, 14, 30)
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35)
            doc.text(`User: ${userData?.name || "Member"}`, 14, 40)

            let lastY = 50

            if (doExp) {
                doc.setFontSize(14)
                doc.setTextColor(0)
                doc.text("Expense History", 14, lastY)
                
                const expenseColumns = ["Title", "Amount", "Category", "Paid By", "Date"]
                const expenseRows = expenses.map(e => [
                    e.title,
                    `INR ${Number(e.amount || 0).toLocaleString()}`,
                    e.category,
                    e.paidBy,
                    new Date(e.createdAt).toLocaleDateString()
                ])

                autoTable(doc, {
                    head: [expenseColumns],
                    body: expenseRows,
                    startY: lastY + 4,
                    theme: 'striped',
                    headStyles: { fillColor: [120, 53, 15] },
                    margin: { left: 14, right: 14 }
                })
                lastY = doc.lastAutoTable.finalY + 15
            }

            if (doSet) {
                doc.setFontSize(14)
                doc.setTextColor(0)
                doc.text("Settlement History", 14, lastY)

                const settlementColumns = ["Person", "Amount", "Date"]
                const settlementRows = settlements.map(s => [
                    s.personName,
                    `INR ${Number(s.amount || 0).toLocaleString()}`,
                    new Date(s.createdAt).toLocaleDateString()
                ])

                autoTable(doc, {
                    head: [settlementColumns],
                    body: settlementRows,
                    startY: lastY + 4,
                    theme: 'grid',
                    headStyles: { fillColor: [68, 64, 60] },
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
            <div className="mb-8">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Financial Intelligence</h1>
                <p className="text-sm text-stone-500 font-medium tracking-tight">Detailed analytics and exportable insights of your spending habits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-10 border border-stone-100 shadow-xl shadow-stone-200/40 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 mb-6 shadow-inner">
                        <BarChart3 size={32} />
                    </div>
                    <h3 className="text-sm font-black text-stone-800 uppercase tracking-widest mb-2">Spending Trends</h3>
                    <p className="text-xs text-stone-400 font-medium px-4">Detailed monthly graphs are being prepared for your account.</p>
                </div>

                <div className="bg-white rounded-3xl p-10 border border-stone-100 shadow-xl shadow-stone-200/40 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 mb-6 shadow-inner">
                        <PieChart size={32} />
                    </div>
                    <h3 className="text-sm font-black text-stone-800 uppercase tracking-widest mb-2">Category Split</h3>
                    <p className="text-xs text-stone-400 font-medium px-4">Interactive charts to see where your money goes.</p>
                </div>
            </div>

            <div className="mt-8 bg-amber-800 rounded-3xl p-8 md:p-10 text-white flex flex-col items-stretch gap-8 overflow-hidden relative shadow-2xl shadow-amber-900/40">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-black tracking-tight mb-1">Custom Export</h3>
                        <p className="text-amber-200 text-xs font-medium">Configure and download your transaction records.</p>
                    </div>
                    <button 
                        onClick={handleExport}
                        disabled={loading}
                        className="bg-white text-amber-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-stone-50 transition shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
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
