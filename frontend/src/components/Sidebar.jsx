import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, Receipt, BarChart3, Settings, Wallet, Plus, X, Clock, Shield } from "lucide-react"

const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/expenses", label: "Expenses", icon: Receipt },
    { path: "/expenses/add", label: "Add Expense", icon: Plus },
    { path: "/settlements", label: "Settlements", icon: Clock },
    { path: "/groups", label: "Groups", icon: Users },
    { path: "/reports", label: "Reports", icon: BarChart3 },
    { path: "/settings", label: "Settings", icon: Settings },
]

function Sidebar({ isOpen, onClose }) {
    const [isHovered, setIsHovered] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const [userData, setUserData] = useState(() => {
        try { return JSON.parse(localStorage.getItem("user")) }
        catch (e) { return null }
    })

    useEffect(() => {
        const handler = () => {
            try { setUserData(JSON.parse(localStorage.getItem("user"))) }
            catch (e) { setUserData(null) }
        }
        window.addEventListener("authChanged", handler)
        return () => window.removeEventListener("authChanged", handler)
    }, [])

    const username = userData?.name || "User"


    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`bg-white border-r border-stone-200 flex flex-col h-screen transition-all duration-300 z-50 overflow-hidden
        /* Desktop: Relative position */
        lg:relative lg:translate-x-0 
        /* Width transition */
        ${isHovered ? "w-72" : "w-72 lg:w-20"}
        /* Mobile: Fixed position drawer */
        fixed left-0 top-0 
        ${isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}
      `}
        >
            {/* Logo Section */}
            <div className={`px-6 py-6 border-b border-stone-100 flex items-center h-20 shrink-0 ${isHovered ? "justify-between" : "justify-center"}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-800 flex items-center justify-center text-white shrink-0 logo-dance shadow-lg shadow-amber-900/20">
                        <Wallet size={20} />
                    </div>
                    {(isHovered || window.innerWidth < 1024) && (
                        <span className="text-xl font-extrabold text-stone-900 tracking-tight truncate transition-all duration-300">
                            SplitWise<span className="text-amber-700">+</span>
                        </span>
                    )}
                </div>
                {(isHovered || window.innerWidth < 1024) && (
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-stone-400 hover:text-stone-900 lg:hidden"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto overflow-x-hidden">
                {isHovered && (
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-4 mb-4 transition-all duration-300">Main Menu</p>
                )}
                {[
                    ...navItems,
                    ...(userData?.role === "admin" ? [{ path: "/admin", label: "Admin Panel", icon: Shield }] : [])
                ].map(item => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => { if (window.innerWidth < 1024) onClose() }}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-1.5 text-sm font-medium transition-all duration-200 group relative ${isActive
                                ? "bg-amber-800 text-white shadow-md shadow-amber-900/10"
                                : "text-stone-500 hover:bg-stone-50 hover:text-amber-800"
                                }`}
                        >
                            <div className={`shrink-0 flex items-center justify-center ${isHovered ? "" : "w-full"}`}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            {(isHovered || window.innerWidth < 1024) && (
                                <span className="truncate flex-1">{item.label}</span>
                            )}

                            {!isHovered && window.innerWidth >= 1024 && (
                                <div className="absolute left-full ml-4 px-3 py-1 bg-stone-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User info */}
            <div className="px-3 py-4 border-t border-stone-100 bg-stone-50/50">
                <Link
                    to="/profile"
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-2 hover:bg-white transition-colors group relative ${isHovered ? "" : "justify-center"}`}
                >
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center text-sm font-bold shrink-0 border-2 border-white shadow-sm">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    {(isHovered || window.innerWidth < 1024) && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-stone-900 truncate">{username}</p>
                            <p className="text-[10px] font-medium text-stone-400 truncate">View Profile</p>
                        </div>
                    )}
                    {!isHovered && window.innerWidth >= 1024 && (
                        <div className="absolute left-full ml-4 px-3 py-1 bg-stone-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            Profile
                        </div>
                    )}
                </Link>
            </div>
        </aside>
    )
}

export default Sidebar
