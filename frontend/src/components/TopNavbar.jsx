import { Search, LogOut, Menu } from "lucide-react"
import { useNavigate } from "react-router-dom"
import NotificationBell from "./NotificationBell"

function TopNavbar({ onMenuClick }) {
    const navigate = useNavigate()
    const userData = (() => {
        try { return JSON.parse(localStorage.getItem("user")) }
        catch (e) { return null }
    })()
    const username = userData?.name || "Guest"

    const logout = () => {
        localStorage.removeItem("user")
        window.dispatchEvent(new Event("authChanged"))
        navigate("/login")
    }

    return (
        <header className="bg-white border-b border-stone-100 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors">
            {/* Left section: Hamburger + Search */}
            <div className="flex items-center gap-4 flex-1 max-w-lg">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-stone-500 hover:text-stone-900 lg:hidden shrink-0"
                >
                    <Menu size={20} />
                </button>

                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-800 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-700 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 md:gap-3 ml-4">
                {/* Real-time Notifications */}
                <NotificationBell />

                {/* Direct Logout Button */}
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-stone-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group relative border border-stone-100"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:block text-sm font-bold">Logout</span>
                </button>
            </div>
        </header>
    )
}

export default TopNavbar
