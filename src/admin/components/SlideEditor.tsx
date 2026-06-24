import { Trash2, ChevronUp, ChevronDown, FileText, MessageSquare, Sparkles, Info } from 'lucide-react'
import type { Story } from '@/lib/types'
import { setSlideKind, slideKind, type SlideKind } from '../lib/modules'

const KINDS: { id: SlideKind; label: string; Icon: typeof FileText; hint: string; color: string }[] = [
  { id: 'texto',    label: 'Texto',       Icon: FileText,      hint: 'Slide com título e parágrafos',      color: 'rgba(232,207,160,0.8)' },
  { id: 'destaque', label: 'Destaque',    Icon: Sparkles,      hint: 'Texto com frase em destaque visual', color: '#b8860b' },
  { id: 'citacao',  label: 'Fala da Lis', Icon: MessageSquare, hint: 'A Lis narra este texto em voz',      color: '#f37435' },
]

const fieldBase: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(232,207,160,0.15)',
  borderRadius: 11,
  padding: '10px 13px',
  color: '#fff',
  outline: 'none',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: 13,
  boxSizing: 'border-box' as const,
  lineHeight: 1.5,
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'rgba(232,207,160,0.45)',
  display: 'block',
  marginBottom: 7,
}

export function SlideEditor({
  story,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}: {
  story: Story
  index: number
  total: number
  onChange: (s: Story) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const kind         = slideKind(story)
  const currentKind  = KINDS.find((k) => k.id === kind)!
  const KindIcon     = currentKind.Icon

  return (
    <div style={{ background: 'rgba(14,6,0,0.96)' }}>

      {/* ── header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        borderBottom: '1px solid rgba(232,207,160,0.08)',
      }}>
        {/* número */}
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: `${currentKind.color}18`,
          border: `1px solid ${currentKind.color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <KindIcon size={13} color={currentKind.color} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: 'rgba(232,207,160,0.35)' }}>
              SLIDE {index + 1}
            </span>
            <span style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 700,
              color: currentKind.color, background: `${currentKind.color}15`,
              borderRadius: 5, padding: '1px 7px',
            }}>
              {currentKind.label}
            </span>
          </div>
        </div>

        {/* ações */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button onClick={() => onMove(-1)} disabled={index === 0} style={{
            width: 28, height: 28, borderRadius: 8, border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer',
            background: 'rgba(232,207,160,0.05)', color: index === 0 ? 'rgba(232,207,160,0.12)' : 'rgba(232,207,160,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ChevronUp size={14} />
          </button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} style={{
            width: 28, height: 28, borderRadius: 8, border: 'none', cursor: index === total - 1 ? 'not-allowed' : 'pointer',
            background: 'rgba(232,207,160,0.05)', color: index === total - 1 ? 'rgba(232,207,160,0.12)' : 'rgba(232,207,160,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ChevronDown size={14} />
          </button>
          <button onClick={onDelete} style={{
            width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'rgba(239,68,68,0.1)', color: '#f87171',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 18px 20px' }}>

        {/* ── seletor de tipo (pills compactos) ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {KINDS.map(({ id, label, Icon, color }) => {
            const active = kind === id
            return (
              <button
                key={id}
                onClick={() => onChange(setSlideKind(story, id))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 10, cursor: 'pointer', flex: 1,
                  justifyContent: 'center',
                  fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700,
                  transition: 'all 0.15s',
                  background: active ? `${color}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? `${color}45` : 'rgba(232,207,160,0.09)'}`,
                  color: active ? color : 'rgba(232,207,160,0.35)',
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            )
          })}
        </div>

        {/* ── TIPO: TEXTO ── */}
        {story.type === 'text' && story.highlight === undefined && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Etiqueta</label>
                <input style={fieldBase} value={story.tag}
                  onChange={(e) => onChange({ ...story, tag: e.target.value })}
                  placeholder="Ex.: Deveres" />
              </div>
              <div>
                <label style={labelStyle}>Título do slide</label>
                <input style={fieldBase} value={story.title}
                  onChange={(e) => onChange({ ...story, title: e.target.value })} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Conteúdo</label>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: 'rgba(232,207,160,0.35)', marginBottom: 8 }}>
                Separe cada parágrafo com uma linha em branco.
              </p>
              <textarea
                rows={5}
                style={{ ...fieldBase, resize: 'vertical' as const }}
                value={story.paragraphs.join('\n\n')}
                onChange={(e) => onChange({ ...story, paragraphs: e.target.value.split(/\n{2,}/) })}
              />
            </div>
          </div>
        )}

        {/* ── TIPO: DESTAQUE ── */}
        {story.type === 'text' && story.highlight !== undefined && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Etiqueta</label>
                <input style={fieldBase} value={story.tag}
                  onChange={(e) => onChange({ ...story, tag: e.target.value })}
                  placeholder="Ex.: Atenção" />
              </div>
              <div>
                <label style={labelStyle}>Título</label>
                <input style={fieldBase} value={story.title}
                  onChange={(e) => onChange({ ...story, title: e.target.value })} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Conteúdo</label>
              <textarea
                rows={3}
                style={{ ...fieldBase, resize: 'vertical' as const }}
                value={story.paragraphs.join('\n\n')}
                onChange={(e) => onChange({ ...story, paragraphs: e.target.value.split(/\n{2,}/) })}
              />
            </div>
            <div>
              <label style={labelStyle}>Frase em destaque</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...fieldBase, borderColor: 'rgba(184,134,11,0.3)', paddingLeft: 38 }}
                  value={story.highlight}
                  onChange={(e) => onChange({ ...story, highlight: e.target.value })}
                  placeholder="Frase exibida em destaque visual ao final do slide"
                />
                <Sparkles size={13} color="#b8860b" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── TIPO: FALA DA LIS ── */}
        {story.type === 'lis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'rgba(243,116,53,0.07)', border: '1px solid rgba(243,116,53,0.2)',
              borderRadius: 11, padding: '10px 13px',
            }}>
              <Info size={13} color="#f37435" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.6)', lineHeight: 1.6 }}>
                A Lis vai narrar este texto em voz. Escreva de forma natural, como ela falaria — sem listas ou formatação especial.
              </p>
            </div>
            <div>
              <label style={labelStyle}>Fala da Lis</label>
              <textarea
                rows={5}
                style={{ ...fieldBase, resize: 'vertical' as const, borderColor: 'rgba(243,116,53,0.2)' }}
                value={story.text}
                onChange={(e) => onChange({ ...story, text: e.target.value })}
                placeholder="Olá! Hoje vamos falar sobre..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
