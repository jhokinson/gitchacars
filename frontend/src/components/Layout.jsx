import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './Layout.css'

export default function Layout({ children }) {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <main className="layout">
      <div className="page-enter" key={location.pathname}>
        {children}
      </div>
    </main>
  )
}
