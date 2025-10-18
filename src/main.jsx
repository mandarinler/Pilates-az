import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AdminPanel from './Adminpanel.jsx'

const router = createBrowserRouter([
  {path: "/", element: <App />},
  {path: "/adminpanel", element: <AdminPanel />},
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
