import { Navigate, Outlet } from "react-router-dom"

const AdminRoute = () => {
    const userData = (() => {
        try { return JSON.parse(localStorage.getItem("user")) }
        catch (e) { return null }
    })()

    if (!userData || userData.role !== "admin") {
        console.warn("Unauthorized access attempt to Admin Panel detected.")
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default AdminRoute
