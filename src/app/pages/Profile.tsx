import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Volume2, VolumeX, LogOut, Award, BookOpen } from 'lucide-react'
import { modulesForRole } from '@/lib/content'
import type { Module } from '@/lib/types'
import { useSession } from '../context/SessionContext'
import { getSignature } from '@/lib/storage'
import { LisAvatar } from '../components/LisAvatar'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { BottomNav, TAB_PATH } from '../components/BottomNav'
import { useTheme } from '../context/ThemeContext'
import { isSoundOn, setSoundOn } from '@/lib/effects'

export default function Profile() {
  const navigate = useNavigate()
  const { employee, progress, logout } = useSession()
  const [sound, setSound] = useState(isSoundOn())
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    if (employee) getSignature(employee.id).then((s) => setSigned(Boolean(s)))
  }, [employee, progress])

  const mods = useMemo(() => (employee ? modulesForRole(employee.role) : []), [employee])
  const contentMods = useMemo(() => mods.filter((m) => m.kind !== 'signature'), [mods])
  const isDone = (m: Module) => (m.kind === 'signature' ? signed : Boolean(progress[m.id]?.completed))
  const completed = mods.filter(isDone).length
  const allContentDone = contentMods.length > 0 && contentMods.every((m) => Boolean(progress[m.id]?.completed))

  if (!employee) return null

  const toggleSound = () => {
    const n = !sound
    setSoundOn(n)
    setSound(n)
  }

  return (
    <div className="app-shell">
      <AnimatedBackground />
      <main className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pb-28 pt-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <LisAvatar state="neutral" size={96} />
          <div>
            <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>{employee.name}</h1>
            <p className="font-body text-sm" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{employee.role}</p>
          </div>
          {signed && (
            <span
              className="flex items-center gap-1.5 px-3 py-1 font-body text-xs font-semibold"
              style={{
                borderRadius: 99,
                background: 'rgba(74,222,128,0.14)',
                border: '1px solid rgba(74,222,128,0.30)',
                color: '#4ade80',
              }}
            >
              <Award size={13} /> Código assinado
            </span>
          )}
        </div>

        {/* stats */}
        <div className="mt-8 flex gap-3">
          <Stat icon={<BookOpen size={18} />} value={`${completed}/${mods.length}`} label="Módulos" color="#b8860b" />
          <Stat icon={<Award size={18} />} value={signed ? 'Sim' : 'Não'} label="Assinou" color={signed ? '#4ade80' : '#f37435'} />
        </div>

        {/* ações */}
        <div className="mt-8 flex flex-col gap-2">
          <Row onClick={toggleSound} icon={sound ? <Volume2 size={18} /> : <VolumeX size={18} />} label="Som e feedback" value={sound ? 'Ligado' : 'Desligado'} />
          {(allContentDone || signed) && (
            <Row onClick={() => navigate('/conclusao')} icon={<Award size={18} />} label="Termos e assinatura" value={signed ? 'Assinado' : 'Liberado'} />
          )}
          <Row onClick={logout} icon={<LogOut size={18} />} label="Sair" value="" danger />
        </div>

        <p className="mt-10 text-center font-body text-sm italic" style={{ color: 'var(--text-secondary)' }}>a prova é ser feliz 🌾</p>
      </main>

      <BottomNav active="profile" onChange={(t) => navigate(TAB_PATH[t])} />
    </div>
  )
}

function Stat({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color?: string }) {
  const c = color ?? '#b8860b'
  return (
    <div
      className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-5"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${c}40`,
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        boxShadow: 'none',
      }}
    >
      <span style={{ color: c }}>{icon}</span>
      <span className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>{value}</span>
      <span className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  )
}

function Row({ onClick, icon, label, value, danger }: { onClick: () => void; icon: React.ReactNode; label: string; value: string; danger?: boolean }) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
      style={{
        background: danger ? (isLight ? '#fff0e8' : '#6a4038') : 'var(--bg-card)',
        border: danger ? '1px solid var(--orange)' : '1px solid var(--stroke)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        boxShadow: 'none',
      }}
    >
      <span
        className="flex items-center justify-center rounded-xl"
        style={{ width: 36, height: 36, background: danger ? 'var(--orange)' : 'var(--gold)', color: '#000000' }}
      >
        {icon}
      </span>
      <span className="flex-1 font-body text-sm font-semibold" style={{ color: danger ? 'var(--orange)' : 'var(--text-primary)' }}>
        {label}
      </span>
      {value && <span className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>{value}</span>}
    </button>
  )
}
