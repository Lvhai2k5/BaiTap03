import { useContext, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from './components/context/auth.context'
import Header from './components/layout/header'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import UserPage from './pages/user'
import { getUserApi } from './util/api'
import './App.css'

function App() {
  const { auth, setAuth, appLoading, setAppLoading } = useContext(AuthContext)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserApi()
        if (res && res.EC === 0) {
          setAuth({
            isAuthenticated: true,
            user: {
              email: res?.user?.email ?? "",
              name: res?.user?.name ?? ""
            }
          })
        } else {
          setAuth({
            isAuthenticated: false,
            user: {
              email: "",
              name: ""
            }
          })
        }
      } catch (error) {
        // Handle error silently if not authenticated
        setAuth({
          isAuthenticated: false,
          user: {
            email: "",
            name: ""
          }
        })
      } finally {
        setAppLoading(false)
      }
    }
    fetchUser()
  }, [])

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/user" element={auth?.isAuthenticated ? <UserPage /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
