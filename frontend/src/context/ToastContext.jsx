import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, variant = 'success', duration = 3000) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const toast = useMemo(() => ({
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  }), [addToast])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} variant={t.variant} onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
