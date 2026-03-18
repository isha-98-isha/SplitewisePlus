import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"))
    } catch (e) {
      return null
    }
  })

  useEffect(() => {
    const handler = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user")))
      } catch (e) {
        setUser(null)
      }
    }

    window.addEventListener("authChanged", handler)
    return () => window.removeEventListener("authChanged", handler)
  }, [])

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
    window.dispatchEvent(new Event("authChanged"))
    navigate("/login")
  }

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <Link to="/" className="font-bold text-xl">SplitWise+</Link>

      <div className="space-x-4">
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && <button onClick={logout}>Logout</button>}
      </div>
    </nav>
  )
}

export default Navbar
