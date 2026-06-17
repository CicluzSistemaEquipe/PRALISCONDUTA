import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { brand, FILTER_WHITE } from '@/lib/brand'
import { getAdminData } from '@/lib/adminStore'
import { LisAvatar } from '../components/LisAvatar'

export default function Splash() {
  const navigate = useNavigate()
  const welcomeText = getAdminData().splashConfig.welcomeText

  useEffect(() => {
    const seen = localStorage.getItem('pralis:onboarding_seen')
    const current = localStorage.getItem('pralis:current-employee')
    const id = setTimeout(() => {
      if (current) navigate('/feed', { replace: true })
      else if (seen) navigate('/login', { replace: true })
      else navigate('/conheca', { replace: true })
    }, 2800)
    return () => clearTimeout(id)
  }, [navigate])

  return (
    <div
      className="app-shell items-center justify-center"
      style={{ background: '#150900', overflow: 'hidden' }}
    >
      {/* padrão de fundo oficial da marca */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.055 }}
        transition={{ duration: 2, delay: 0.3 }}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${brand.patternBrand})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '120px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* logo vetorial branca — desce com spring */}
        <motion.img
          src={brand.logoSVGBranca}
          alt="padaria pralís"
          initial={{ opacity: 0, y: -30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.15 }}
          style={{ width: 200, height: 'auto', filter: FILTER_WHITE }}
        />

        {/* Lis — mascote (corpo inteiro) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <LisAvatar state="neutral" size={140} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 13,
            fontStyle: 'italic',
            color: 'rgba(232,207,160,0.70)',
            letterSpacing: '0.04em',
          }}
        >
          {welcomeText}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          style={{ display: 'flex', gap: 6, marginTop: -8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#b8860b', display: 'block' }}
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
