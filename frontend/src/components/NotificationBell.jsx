import { useState, useEffect, useRef } from "react"
import { Bell, CheckCircle2, Receipt, Trash2, X } from "lucide-react"
import { API_URL } from "../config"
import { useNavigate } from "react-router-dom"

function NotificationBell() {
    const [notifications, setNotifications] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()

    const userData = (() => {
        try { return JSON.parse(localStorage.getItem("user")) }
        catch (e) { return null }
    })()

    const unreadCount = notifications.filter(n => !n.isRead).length

    const fetchNotifications = async () => {
        if (!userData?._id) return
        try {
            const res = await fetch(`${API_URL}/notifications/${userData._id}`)
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err)
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds
        return () => clearInterval(interval)
    }, [userData?._id])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const markAsRead = async (id) => {
        try {
            await fetch(`${API_URL}/notifications/read/${id}`, { method: "PUT" })
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n))
        } catch (err) {
            console.error(err)
        }
    }

    const clearAll = async () => {
        if (!userData?._id) return
        try {
            await fetch(`${API_URL}/notifications/clear/${userData._id}`, { method: "DELETE" })
            setNotifications([])
        } catch (err) {
            console.error(err)
        }
    }

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) markAsRead(notification._id)
        setIsOpen(false)
        navigate("/settlements")
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-xl transition-all relative ${isOpen ? "bg-amber-100 text-amber-800" : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl border border-stone-100 shadow-2xl shadow-stone-200/50 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="p-4 border-b border-stone-50 flex items-center justify-between">
                        <h3 className="text-xs font-black text-stone-900 uppercase tracking-widest">Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAll}
                                className="text-[10px] font-bold text-stone-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                            >
                                <Trash2 size={12} /> Clear All
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <Bell className="mx-auto mb-3 text-stone-100" size={40} />
                                <p className="text-sm font-bold text-stone-300">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n._id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`w-full p-4 text-left hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0 flex gap-3 relative ${!n.isRead ? "bg-amber-50/30" : ""}`}
                                >
                                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${n.type === "expense_added" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                                        {n.type === "expense_added" ? <Receipt size={16} /> : <CheckCircle2 size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs leading-relaxed mb-1 ${!n.isRead ? "font-black text-stone-900" : "font-medium text-stone-500"}`}>
                                            {n.message}
                                        </p>
                                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!n.isRead && (
                                        <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 absolute right-4 top-4"></div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    <div className="p-3 bg-stone-50 text-center">
                        <button
                            onClick={() => { setIsOpen(false); navigate("/reports"); }}
                            className="text-[10px] font-black text-amber-800 uppercase tracking-widest hover:underline"
                        >
                            View All Activity
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationBell
