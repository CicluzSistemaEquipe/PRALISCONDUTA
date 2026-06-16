import { Outlet } from 'react-router-dom'
import { AdminGuard } from '../components/AdminGuard'
import { AdminSidebar } from '../components/AdminSidebar'
import '../admin.css'

/** Shell do Admin: sidebar + área principal. Protegido pelo AdminGuard. */
export default function AdminLayout() {
  return (
    <AdminGuard>
      <div className="adm-root flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1 px-5 py-6 md:px-9 md:py-9">
          <div className="mx-auto w-full max-w-[1100px]">
            <Outlet />
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}
