import { BarChart3, PieChart, Download } from "lucide-react"

function ReportsPage() {
    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Financial Intelligence</h1>
                <p className="text-sm text-stone-500 font-medium tracking-tight">Detailed analytics and exportable insights of your spending habits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-10 border border-stone-100 shadow-xl shadow-stone-200/40 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 mb-6">
                        <BarChart3 size={32} />
                    </div>
                    <h3 className="text-sm font-black text-stone-800 uppercase tracking-widest mb-2">Spending Trends</h3>
                    <p className="text-xs text-stone-400 font-medium px-4">Detailed monthly graphs are being prepared for your account.</p>
                </div>

                <div className="bg-white rounded-3xl p-10 border border-stone-100 shadow-xl shadow-stone-200/40 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 mb-6">
                        <PieChart size={32} />
                    </div>
                    <h3 className="text-sm font-black text-stone-800 uppercase tracking-widest mb-2">Category Split</h3>
                    <p className="text-xs text-stone-400 font-medium px-4">Interactive charts to see where your money goes.</p>
                </div>
            </div>

            <div className="mt-8 bg-amber-800 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="relative z-10">
                    <h3 className="text-lg font-black tracking-tight mb-1">Export Data</h3>
                    <p className="text-amber-200 text-xs font-medium">Download your entire transaction history as CSV or PDF.</p>
                </div>
                <button className="relative z-10 bg-white text-amber-900 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-stone-50 transition shadow-lg flex items-center gap-2">
                    <Download size={18} /> Export Now
                </button>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            </div>
        </div>
    )
}

export default ReportsPage
