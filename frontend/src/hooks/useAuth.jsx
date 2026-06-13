import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getToken, setToken } from '../api/client'
import { loginWithGoogle, getMe } from '../api/auth'

const AuthContext = createContext({
  user: null,
  loading: false,
  canEdit: false,
  isOwner: false,
  login: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) { setLoading(false); return }
    getMe()
      .then(({ user }) => setUser(user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credential) => {
    const { token, user } = await loginWithGoogle(credential)
    setToken(token)
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const canEdit = ['editor', 'admin', 'owner'].includes(user?.role)
  const isOwner = user?.role === 'owner'

  return (
    <AuthContext.Provider value={{ user, loading, canEdit, isOwner, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
