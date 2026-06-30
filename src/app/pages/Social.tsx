import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Megaphone, RefreshCw } from 'lucide-react'
import { useSession } from '../context/SessionContext'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { BottomNav, TAB_PATH } from '../components/BottomNav'
import { SocialPostCard } from '../components/SocialPostCard'
import { SocialPostModal } from '../components/SocialPostModal'
import {
  postsForEmployee, markPostsViewed, recordAck, hasConfirmed, hasSeen, useSocialVersion,
} from '@/lib/social'
import { getAdminUserById } from '@/admin/auth'

export default function Social() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { employee } = useSession()
  const version = useSocialVersion()
  const [tick, setTick] = useState(0)
  const [openId, setOpenId] = useState<string | null>(null)

  const posts = useMemo(
    () => (employee ? postsForEmployee(employee) : []),
    [employee, version, tick],
  )
  const openPost = openId ? posts.find((p) => p.id === openId) ?? null : null

  // Marca os comunicados visiveis como VISTOS (limpa o badge) e guarda quais
  // eram novos nesta sessao para destacar com a tag NOVO.
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  useEffect(() => {
    if (!employee) return
    const unseen = posts.filter((p) => !hasSeen(p.id, employee.id)).map((p) => p.id)
    if (unseen.length) {
      setNewIds((prev) => { const n = new Set(prev); unseen.forEach((id) => n.add(id)); return n })
      markPostsViewed(employee, unseen)
    }
  }, [employee, posts])

  return (
    <div className="app-shell" style={{ background: 'var(--bg-base)', position: 'relative' }}>
      <AnimatedBackground accent="#f37435" />

      <div
        className="relative z-10 flex-1 overflow-y-auto no-scrollbar"
        style={{ paddingTop: 'calc(var(--safe-top) + 22px)', paddingBottom: 'calc(104px + var(--safe-bottom))' }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', padding: '0 18px' }}>
          <header className="flex items-end justify-between gap-3" style={{ marginBottom: 18 }}>
            <div>
              <h1 className="font-display" style={{ fontSize: 28, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Social
              </h1>
              <p className="font-body" style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
                Comunicados e novidades da Pralis.
              </p>
            </div>
            <button
              onClick={() => setTick((t) => t + 1)}
              aria-label="Atualizar feed"
              className="flex items-center gap-1.5"
              style={{
                flex: 'none', fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)',
                background: 'var(--glass-bg)', border: '1px solid var(--stroke)', borderRadius: 999,
                padding: '8px 14px', cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} strokeWidth={2.2} /> Atualizar
            </button>
          </header>

          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ padding: '60px 24px', color: 'var(--text-muted)' }}>
              <span style={{ width: 60, height: 60, borderRadius: 18, display: 'grid', placeItems: 'center', background: 'rgba(243,116,53,0.12)', border: '1px solid rgba(243,116,53,0.28)', marginBottom: 14 }}>
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
              className="flex flex-col gap-4"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {posts.map((p) => (
                <motion.div
                  key={p.id}
                  variants={{ hidden: { opacity: 0, y: reduce ? 0 : 12 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: reduce ? 0.001 : 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SocialPostCard
                    post={p}
                    isNew={newIds.has(p.id)}
                    confirmed={employee ? hasConfirmed(p.id, employee.id) : false}
                    onOpen={() => setOpenId(p.id)}
                    onAck={() => employee && recordAck(employee, p.id)}
                    authorAvatar={getAdminUserById(p.created_by)?.avatarUrl}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {openPost && (
          <SocialPostModal
            post={openPost}
            confirmed={employee ? hasConfirmed(openPost.id, employee.id) : false}
            onAck={() => employee && recordAck(employee, openPost.id)}
            onClose={() => setOpenId(null)}
            authorAvatar={getAdminUserById(openPost.created_by)?.avatarUrl}
          />
        )}
      </AnimatePresence>

      <BottomNav active="social" onChange={(t) => navigate(TAB_PATH[t])} />
    </div>
  )
}
