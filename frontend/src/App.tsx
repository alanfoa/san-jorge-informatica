import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { HomePage } from '@/pages/HomePage'
import { ProductosPage } from '@/pages/ProductosPage'
import { ProductoPage } from '@/pages/ProductoPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { AdminPage } from '@/pages/AdminPage'
import { AdminCategoriasPage } from '@/pages/AdminCategoriasPage'
import { AdminNewPage } from '@/pages/AdminNewPage'
import { AdminEditPage } from '@/pages/AdminEditPage'
import { AdminRoute } from '@/components/AdminRoute'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/productos/:id" element={<ProductoPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
          <Route path="/admin/nuevo" element={<AdminNewPage />} />
          <Route path="/admin/editar/:id" element={<AdminEditPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  )
}
