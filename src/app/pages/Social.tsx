import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Megaphone } from 'lucide-react'
import { useSession } from '../context/SessionContext'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { BottomNav, TAB_PATH } from '../components/BottomNav'
import { SocialPostCard } from '../components/SocialPostCard'
import { postsForEmployee, getReadIds, markAllRead, useSocialVersion } from '@/lib/social'

export default function Social() {
  const navigate = useNavigate()
  const { employee } = useSession()
  const version = useSocialVersion()

  const posts = useMemo(
    () => (employee ? postsForEmployee(employee) : []),
    [employee, version],
  )

  // Captura quais estavam "novos" ao abrir e marca tudo como lido (limpa o badge).
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const marked = useRef(false)
  useEffect(() => {
    if (!employee || marked.current || posts.length === 0) return
    marked.current = true
    const read = getReadIds(employee.id)
    setNewIds(new Set(posts.filter((p) => !read.has(p.id)).map((p) => p.id)))
    markAllRead(employee.id, posts.map((p) => p.id))
  }, [employee, posts])

  return (
    <div className="app-shell" style={{ background: 'var(--bg-base)', position: 'relative' }}>
      <AnimatedBackground accent="#f37435" />

      <div
        className="relative z-10 flex-1 overflow-y-auto no-scrollbar"
        style={{ paddingTop: 'calc(var(--safe-top) + 22px)', paddingBottom: 104 }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', padding: '0 18px' }}>
          <header style={{ marginBottom: 18 }}>
            <h1 className="font-display" style={{ fontSize: 28, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Social
            </h1>
            <p className="font-body" style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
              Comunicados e novidades da Pralis.
            </p>
          </header>

          {posts.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center text-center"
              style={{ padding: '60px 24px', color: 'var(--text-muted)' }}
            >
              <span
                style={{
                  width: 60, height: 60, borderRadius: 18, display: 'grid', placeItems: 'center',
                  background: 'rgba(243,116,53,0.12)', border: '1px solid rgba(243,116,53,0.28)', marginBottom: 14,
                }}
              >
                <Megaphone size={26} color="#f37435" strokeWidth={1.8} />
              </span>
              <p className="font-body" style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 600 }}>
                Nenhum comunicado por aqui ainda
              </p>
              <p className="font-body" style={{ fontSize: 13, marginTop: 6 }}>
                Quando a Pralis publicar avisos e novidades, eles aparecem aqui.
              </p>
            </div>
          ) : (
            <motion.div
              className="flex flex-col gap-3"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {posts.map((p) => (
                <motion.div
                  key={p.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SocialPostCard post={p} isNew={newIds.has(p.id)} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <BottomNav active="social" onChange={(t) => navigate(TAB_PATH[t])} />
    </div>
  )
}
