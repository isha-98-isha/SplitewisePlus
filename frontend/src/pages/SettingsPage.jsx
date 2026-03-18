import { Settings as SettingsIcon, Bell, Lock, Globe, ShieldCheck } from "lucide-react"

function SettingsPage() {
    const settingsItems = [
        { icon: Bell, label: "Notifications", desc: "Manage your alerts and email updates" },
        { icon: Lock, label: "Security", desc: "Two-factor authentication and passwords" },
        { icon: Globe, label: "Preferences", desc: "Currency, language, and theme settings" },
        { icon: ShieldCheck, label: "Privacy", desc: "Control who can see your activity" },
    ]

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Account Preferences</h1>
                <p className="text-sm text-stone-500 font-medium tracking-tight">Configure your SplitWise+ experience and security settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settingsItems.map((item, idx) => (
                    <button key={idx} className="flex items-center gap-5 p-6 bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/40 hover:border-amber-200 hover:scale-[1.01] transition-all text-left group">
                        <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                            <item.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-stone-800 uppercase tracking-tight mb-0.5">{item.label}</p>
                            <p className="text-xs text-stone-400 font-medium">{item.desc}</p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-12 p-8 bg-stone-50 rounded-3xl border border-stone-200 border-dashed">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h4 className="text-sm font-black text-stone-900 mb-1">Advanced Controls</h4>
                        <p className="text-xs text-stone-400 font-medium">Deactivate account, download personal data, or reset all history.</p>
                    </div>
                    <button className="px-6 py-3 bg-white border border-stone-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 hover:border-red-100 transition-all">
                        Dangerous Territory
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage
