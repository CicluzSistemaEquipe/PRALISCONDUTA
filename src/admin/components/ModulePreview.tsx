import type { Module, Story } from '@/lib/types'

/**
 * Preview fiel (simplificado) de como um slide aparece no app — dentro de
 * uma moldura de celular. Cobre os tipos text, lis, quiz, video, summary.
 */
export function ModulePreview({ module: m, story }: { module: Module; story: Story | null }) {
  const accent = m.accent || '#b8860b'
  return (
    <div className="sticky top-6">
      <p className="adm-label mb-2 text-center">Pré-visualização</p>
      <div
        className="mx-auto"
        style={{
          width: 240,
          height: 470,
          borderRadius: 36,
          border: '7px solid #2b2620',
          background: '#0a0600',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 26px 70px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '30px 14px 16px',
            display: 'flex',
            flexDirection: 'column',
            background: `radial-gradient(120% 60% at 80% 0%, ${accent}33, transparent 60%), linear-gradient(180deg,#160d02,#0a0600)`,
            color: '#f7ecd6',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {/* header do módulo */}
          <div className="mb-2 flex items-center gap-2">
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: accent, letterSpacing: '0.1em' }}>
              {m.number} · {m.tag}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff', marginBottom: 10, lineHeight: 1.15 }}>
            {m.title}
          </div>

          <StoryBody story={story} accent={accent} />
        </div>
      </div>
    </div>
  )
}

function StoryBody({ story, accent }: { story: Story | null; accent: string }) {
  if (!story) {
    return <div style={hint}>Selecione um slide para visualizar.</div>
  }

  if (story.type === 'lis') {
    return (
      <div style={{ marginTop: 6 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            margin: '4px auto 12px',
            background: `radial-gradient(circle at 38% 32%, #ffd98a, #e0921f 60%, ${accent})`,
            boxShadow: `0 0 22px ${accent}77`,
          }}
        />
        <div
          style={{
            fontSize: '0.64rem',
            lineHeight: 1.45,
            color: '#f7ecd6',
            background: 'rgba(255,245,220,0.07)',
            border: '1px solid rgba(232,207,160,0.12)',
            borderRadius: '12px 12px 12px 3px',
            padding: '10px 12px',
          }}
        >
          {story.text || '—'}
        </div>
      </div>
    )
  }

  if (story.type === 'text') {
    return (
      <div style={{ overflowY: 'auto', paddingRight: 2 }} className="adm-no-scrollbar">
        {story.tag && (
          <span style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent }}>
            {story.tag}
          </span>
        )}
        <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#fff', margin: '4px 0 8px', lineHeight: 1.2 }}>
          {story.title}
        </div>
        {story.paragraphs.map((p, i) => (
          <p key={i} style={{ fontSize: '0.6rem', lineHeight: 1.5, color: 'rgba(247,236,214,0.82)', marginBottom: 7 }}>
            {p}
          </p>
        ))}
        {story.highlight && (
          <div
            style={{
              marginTop: 6,
              fontSize: '0.6rem',
              fontWeight: 600,
              color: '#160d02',
              background: `linear-gradient(135deg, ${accent}, #f37435)`,
              borderRadius: 10,
              padding: '8px 10px',
            }}
          >
            {story.highlight}
          </div>
        )}
      </div>
    )
  }

  if (story.type === 'quiz') {
    const q = story.questions[0]
    if (!q) return <div style={hint}>Sem perguntas ainda.</div>
    return (
      <div style={{ overflowY: 'auto' }} className="adm-no-scrollbar">
        <div style={{ fontSize: '0.5rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Quiz
        </div>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#fff', margin: '6px 0 9px', lineHeight: 1.25 }}>
          {q.prompt}
        </div>
        {q.options.map((o, i) => {
          const ok = i === q.correctIndex
          return (
            <div
              key={i}
              style={{
                fontSize: '0.58rem',
                padding: '7px 9px',
                borderRadius: 9,
                marginBottom: 6,
                color: ok ? '#bfe6c6' : '#f7ecd6',
                background: ok ? 'rgba(105,192,122,0.14)' : 'rgba(255,245,220,0.045)',
                border: `1px solid ${ok ? 'rgba(105,192,122,0.5)' : 'rgba(232,207,160,0.12)'}`,
              }}
            >
              {String.fromCharCode(65 + i)}. {o} {ok ? '✓' : ''}
            </div>
          )
        })}
      </div>
    )
  }

  if (story.type === 'video') {
    return (
      <div>
        <div
          style={{
            height: 130,
            borderRadius: 12,
            background: 'linear-gradient(140deg,#3a2208,#1c1003)',
            border: '1px solid rgba(232,207,160,0.12)',
            display: 'grid',
            placeItems: 'center',
            marginBottom: 8,
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'grid', placeItems: 'center' }}>
            <span style={{ borderLeft: '12px solid #160d02', borderTop: '7px solid transparent', borderBottom: '7px solid transparent', marginLeft: 3 }} />
          </div>
        </div>
        <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#fff' }}>{story.title}</div>
        {story.duration && <div style={{ fontSize: '0.56rem', color: 'rgba(247,236,214,0.6)' }}>{story.duration}</div>}
      </div>
    )
  }

  if (story.type === 'summary') {
    return (
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{story.title}</div>
        {story.bullets.map((b, i) => (
          <div key={i} style={{ fontSize: '0.6rem', color: 'rgba(247,236,214,0.82)', marginBottom: 6, display: 'flex', gap: 6 }}>
            <span style={{ color: accent }}>•</span> {b}
          </div>
        ))}
      </div>
    )
  }

  if (story.type === 'completion') {
    return (
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <div style={{ fontSize: '2rem' }}>🌾</div>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: accent, margin: '8px 0 4px' }}>{story.badge}</div>
        <div style={{ fontSize: '0.62rem', color: 'rgba(247,236,214,0.82)' }}>{story.message}</div>
      </div>
    )
  }

  return <div style={hint}>Tipo de slide sem preview.</div>
}

const hint: React.CSSProperties = {
  fontSize: '0.62rem',
  color: 'rgba(247,236,214,0.5)',
  textAlign: 'center',
  marginTop: 30,
}
