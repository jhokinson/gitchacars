import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode(storedToken)
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = (data) => {
    const { token: newToken, user: newUser } = data
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  const isAuthenticated = !!token && !!user

  const isRole = (role) => user?.role === role

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isRole, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export default AuthContext
