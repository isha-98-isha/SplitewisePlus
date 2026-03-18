import { useState, useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { API_URL } from "./config"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import ExpensesPage from "./pages/ExpensesPage"
import AddExpensePage from "./pages/AddExpensePage"
import GroupsPage from "./pages/GroupsPage"
import ReportsPage from "./pages/ReportsPage"
import SettingsPage from "./pages/SettingsPage"
import ProfilePage from "./pages/ProfilePage"
import SettlementsPage from "./pages/SettlementsPage"
import EditExpensePage from "./pages/EditExpensePage"
import AdminDashboard from "./pages/AdminDashboard"
import AdminRoute from "./components/AdminRoute"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) }
    catch (e) { return null }
  })

  useEffect(() => {
    const handler = () => {
      try { setUser(JSON.parse(localStorage.getItem("user"))) }
      catch (e) { setUser(null) }
    }
    window.addEventListener("authChanged", handler)

    // Proactive role refresh
    const refreshUser = async () => {
      if (user && !user.role && user._id) {
        try {
          const res = await fetch(`${API_URL}/users/${user._id}`)
          if (res.ok) {
            const latestData = await res.json()
            const updatedUser = { ...user, ...latestData }
            localStorage.setItem("user", JSON.stringify(updatedUser))
            setUser(updatedUser)
            window.dispatchEvent(new Event("authChanged"))
          }
        } catch (e) {
          console.error("Failed to proactive refresh user role", e)
        }
      }
    }
    refreshUser()

    return () => window.removeEventListener("authChanged", handler)
  }, [user?._id, user?.role])

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/expenses/add" element={<AddExpensePage />} />
        <Route path="/expenses/edit/:id" element={<EditExpensePage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settlements" element={<SettlementsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
