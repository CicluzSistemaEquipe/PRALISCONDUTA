import { Outlet } from 'react-router-dom'
import { AdminGuard } from '../components/AdminGuard'
import { AdminSidebar } from '../components/AdminSidebar'
import { AdminTopbar } from '../components/AdminTopbar'
import '../admin.css'

/** Shell do Admin: sidebar + topbar + área principal. Protegido pelo AdminGuard. */
export default function AdminLayout() {
  return (
    <AdminGuard>
      <div className="adm-root flex min-h-[100dvh] flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <div className="flex-1 px-5 py-6 md:px-9 md:py-8">
            <div className="mx-auto w-full max-w-[1200px]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}
