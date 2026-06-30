import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Reorder, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, GraduationCap, BookOpen, ChefHat, Coffee, Store, Users, Globe, Layers,
  Pencil, Plus, GripVertical, AlertTriangle, Eye, EyeOff, IdCard, Palette, ShieldCheck, type LucideIcon,
} from 'lucide-react'
import { getTreinamentos, treinamentoIncludes, orderForTreinamento } from '@/lib/content'
import { useCargos, useCargosVersion } from '@/lib/cargos'
import { useAdminStore } from '@/lib/adminStore'
import { listEmployees } from '@/lib/storage'
import { listGerentes } from '../auth'
import { makeBlankModule } from '../lib/modules'
import type { Employee, Module, Treinamento } from '@/lib/types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { EmptyState, ModalShell, ModalHeader, ModalFooter } from '../components/ui'

const PALETTE = ['#f37435', '#b8860b', '#5e3731', '#5dd87a', '#2980b9', '#8e44ad', '#c0392b', '#27ae60']
const ICON_OPTIONS: { key: string; Icon: LucideIcon }[] = [
  { key: 'grad', Icon: GraduationCap }, { key: 'book', Icon: BookOpen }, { key: 'chef', Icon: ChefHat },
  { key: 'cup', Icon: Coffee }, { key: 'store', Icon: Store }, { key: 'users', Icon: Users },
]
const iconOf = (key?: string): LucideIcon => ICON_OPTIONS.find((o) => o.key === key)?.Icon ?? GraduationCap

/** Cabeçalho de grupo (estilo Notion, igual ao editor de módulo). */
function SectionHead({ icon: Icon, label, hint, tone }: { icon: LucideIcon; label: string; hint?: string; tone: string }) {
  return (
    <div className="mb-4 flex items-start gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${tone}1f`, color: tone }}>
        <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <h3 className="text-[0.95rem] font-semibold leading-tight text-[var(--ink)]">{label}</h3>
        {hint && <p className="mt-0.5 text-[0.75rem] leading-snug text-[var(--text-muted)]">{hint}</p>}
      </div>
    </div>
  )
}

function ModuleRow({ m, kind, accent, onEdit, hidden, onToggleHidden }: {
  m: Module; kind: 'global' | 'especifico'; accent: string; onEdit: () => void
  hidden?: boolean; onToggleHidden?: () => void
}) {
  return (
    <Reorder.Item value={m} className="list-none">
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 transition-colors hover:border-[var(--border-strong)]"
        style={hidden ? { opacity: 0.55 } : undefined}>
        <span className="flex shrink-0 cursor-grab items-center text-[var(--text-disabled)]" aria-hidden><GripVertical size={16} /></span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[0.7rem] font-bold text-white" style={{ background: m.accent ?? accent }}>{m.number}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`adm-badge ${kind === 'global' ? 'adm-badge--gold' : 'adm-badge--muted'}`}>{kind === 'global' ? 'Global' : 'Específico'}</span>
            {m.status === 'draft' && <span className="adm-badge adm-badge--muted">Rascunho</span>}
            {hidden && <span className="adm-badge adm-badge--red">Oculto neste treinamento</span>}
          </div>
          <p className="mt-0.5 truncate text-[0.875rem] font-semibold text-[var(--ink)]">{m.title}</p>
        </div>
        {onToggleHidden && (
          <button type="button" onClick={onToggleHidden} onPointerDown={(e) => e.stopPropagation()}
            title={hidden ? 'Mostrar neste treinamento' : 'Ocultar neste treinamento'}
            aria-label={hidden ? 'Mostrar neste treinamento' : 'Ocultar neste treinamento'}
            className={`adm-btn h-8 shrink-0 ${hidden ? 'border-[var(--accent)] text-[var(--accent-text)]' : ''}`}>
            {hidden ? <><Eye className="h-[14px] w-[14px]" /> Mostrar</> : <><EyeOff className="h-[14px] w-[14px]" /> Ocultar</>}
          </button>
        )}
        <button type="button" onClick={onEdit} onPointerDown={(e) => e.stopPropagation()} className="adm-btn h-8 shrink-0">
          <Pencil className="h-[14px] w-[14px]" /> Editar
        </button>
      </div>
    </Reorder.Item>
  )
}

export default function AdminTreinamentoEditor() {
  const navigate = useNavigate()
  const { id } = useParams()
  const idStr = id ?? ''
  useCargosVersion()
  const cargos = useCargos()
  const { data, saveTreinamento, saveModule } = useAdminStore()

  const t = useMemo(() => getTreinamentos().find((x) => x.id === idStr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idStr, data.treinamentos, cargos])
  const cargo = t?.cargoId ? cargos.find((c) => c.id === t.cargoId) : undefined
  const cargoNome = cargo?.nome
  const geral = idStr === 'geral'

  // identidade — estados locais (digitação suave); demais campos persistem na hora
  const [tNome, setTNome] = useState(t?.nome ?? '')
  const [tDesc, setTDesc] = useState(t?.descricao ?? '')
  const [tHome, setTHome] = useState(t?.homeText ?? '')

  // listas reordenáveis (identidades estáveis); re-sincroniza quando módulos/ordem mudam
  const [herdados, setHerdados] = useState<Module[]>([])
  const [especificos, setEspecificos] = useState<Module[]>([])
  useEffect(() => {
    // visão ADMIN: inclui rascunhos/inativos (o módulo recém-criado aparece aqui)
    const mods = orderForTreinamento(idStr, data.modules.filter((m) => treinamentoIncludes(idStr, m)))
    setHerdados(mods.filter((m) => m.roles === 'all'))
    setEspecificos(mods.filter((m) => m.roles !== 'all'))
  }, [idStr, data.modules, data.treinamentos])

  // quem vê
  const [emps, setEmps] = useState<Employee[]>([])
  useEffect(() => { void listEmployees().then(setEmps) }, [])
  const gerentes = useMemo(() => listGerentes(), [])
  const colaboradores = useMemo(
    () => (cargoNome ? emps.filter((e) => (e.role ?? '').trim().toLowerCase() === cargoNome.trim().toLowerCase()) : []),
    [emps, cargoNome],
  )
  const gerentesDaEquipe = useMemo(() => {
    const ids = new Set(colaboradores.map((c) => c.gerenteId).filter(Boolean) as string[])
    return gerentes.filter((g) => ids.has(g.id))
  }, [colaboradores, gerentes])
  const lojas = useMemo(() => {
    const set = new Set<string>()
    if (cargo?.loja) set.add(cargo.loja)
    for (const c of colaboradores) if (c.store) set.add(c.store)
    return [...set]
  }, [cargo, colaboradores])

  // edição de módulo global pede confirmação
  const [warnModule, setWarnModule] = useState<Module | null>(null)

  if (!t) {
    return (
      <div className="mx-auto w-full max-w-[760px]">
        <Link to="/admin/treinamentos" className="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--text-muted)] no-underline hover:text-[var(--ink)]"><ArrowLeft size={15} /> Treinamentos</Link>
        <div className="adm-card"><EmptyState icon={GraduationCap} title="Treinamento não encontrado" hint="Volte para a lista de treinamentos." /></div>
      </div>
    )
  }

  const accent = t.accent ?? cargo?.accent ?? '#b8860b'
  const IconCur = iconOf(t.icon)

  /** Persiste o treinamento (identidade + ordem own). Não toca modules[].
   *  BUGFIX: espalha `...t` primeiro (preserva TODOS os campos atuais — em
   *  especial hiddenModuleIds) e `...patch` por último (aplica a mudança). Antes,
   *  o objeto era reconstruído sem hiddenModuleIds e sem `...patch`, então o
   *  botão Ocultar não gravava nada e edições/reorder apagavam os ocultos. */
  const commit = (patch: Partial<Treinamento> = {}, hList = herdados, eList = especificos) => {
    saveTreinamento({
      ...t,
      id: idStr,
      cargoId: t.cargoId,
      nome: (patch.nome ?? tNome).trim() || t.nome,
      descricao: (patch.descricao ?? tDesc).trim() || undefined,
      homeText: (patch.homeText ?? tHome).trim() || undefined,
      accent: patch.accent ?? t.accent ?? cargo?.accent,
      icon: patch.icon ?? t.icon,
      ativo: patch.ativo ?? t.ativo,
      order: patch.order ?? [...hList.map((m) => m.id), ...eList.map((m) => m.id)],
      ...patch,
    })
  }

  const reorderHerdados = (nl: Module[]) => { setHerdados(nl); commit({}, nl, especificos) }
  const reorderEspecificos = (nl: Module[]) => { setEspecificos(nl); commit({}, herdados, nl) }

  // ocultar/mostrar um módulo GLOBAL só neste treinamento (overlay; não exclui)
  const hiddenIds = t.hiddenModuleIds ?? []
  const toggleHidden = (moduleId: string) => {
    const next = hiddenIds.includes(moduleId) ? hiddenIds.filter((x) => x !== moduleId) : [...hiddenIds, moduleId]
    commit({ hiddenModuleIds: next })
  }

  const criarEspecifico = () => {
    if (!cargoNome) return
    const novo: Module = { ...makeBlankModule(data.modules.length + 1), roles: [cargoNome], section: 'cargo', title: `Novo módulo · ${cargoNome}` }
    saveModule(novo)
    commit({ order: [...herdados.map((m) => m.id), ...especificos.map((m) => m.id), novo.id] }, herdados, [...especificos, novo])
    navigate(`/admin/modulos/${novo.id}`)
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] pb-16">
      <Link to="/admin/treinamentos" className="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--ink)]">
        <ArrowLeft size={15} /> Treinamentos
      </Link>
      <AdminPageHeader
        eyebrow="Conteúdo · Treinamento"
        title={t.nome}
        description={geral ? 'Herdado por todos os cargos.' : `Cargo: ${cargoNome ?? '—'} · ${colaboradores.length} colaborador(es)`}
        action={
          <button onClick={() => commit({ ativo: t.ativo === false ? true : false })}
            className={`adm-btn ${t.ativo === false ? '' : 'border-[#cdebd9] bg-[#ecf7f0] text-[#1e7e4e]'}`}>
            <span className="h-2 w-2 rounded-full" style={{ background: t.ativo === false ? 'var(--text-muted)' : '#1e7e4e' }} />
            {t.ativo === false ? 'Inativo' : 'Ativo'}
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 1) IDENTIDADE */}
        <div className="adm-card p-5">
          <SectionHead icon={IdCard} label="Identidade do treinamento" hint="Nome, descrição e como aparece na Home." tone={accent} />
          <div className="flex flex-col gap-3">
            <div>
              <label className="adm-label" htmlFor="tn-nome">Nome</label>
              <input id="tn-nome" className="adm-input" value={tNome} onChange={(e) => setTNome(e.target.value)} onBlur={() => commit()} />
            </div>
            <div>
              <label className="adm-label" htmlFor="tn-desc">Descrição</label>
              <input id="tn-desc" className="adm-input" value={tDesc} onChange={(e) => setTDesc(e.target.value)} onBlur={() => commit()} placeholder="Aparece no card do admin." />
            </div>
            <div>
              <label className="adm-label" htmlFor="tn-home">Texto da Home</label>
              <textarea id="tn-home" className="adm-input" rows={2} value={tHome} onChange={(e) => setTHome(e.target.value)} onBlur={() => commit()} placeholder="Mensagem institucional na Home do colaborador (aplicada no Bloco E)." />
            </div>
            <div>
              <span className="adm-label flex items-center gap-1.5"><Palette className="h-3.5 w-3.5" /> Cor / acento</span>
              <div className="flex flex-wrap gap-1.5">
                {PALETTE.map((c) => (
                  <button key={c} type="button" aria-label={`Cor ${c}`} onClick={() => commit({ accent: c })}
                    className={`h-7 w-7 rounded-md border-2 transition-transform hover:scale-110 ${accent === c ? 'border-[var(--ink)]' : 'border-[var(--border)]'}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div>
              <span className="adm-label">Ícone</span>
              <div className="flex flex-wrap gap-1.5">
                {ICON_OPTIONS.map(({ key, Icon }) => (
                  <button key={key} type="button" aria-label={`Ícone ${key}`} onClick={() => commit({ icon: key })}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${t.icon === key ? 'border-[var(--accent)] bg-[var(--accent-tint)]' : 'border-[var(--border-strong)] bg-white hover:bg-[var(--bg-subtle)]'}`}>
                    <Icon className="h-[18px] w-[18px]" style={{ color: t.icon === key ? accent : 'var(--text-secondary)' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2) QUEM VÊ */}
        <div className="adm-card p-5">
          <SectionHead icon={Users} label="Quem vê este treinamento" hint="Cargo, colaboradores e responsáveis." tone="#b8860b" />
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="adm-badge adm-badge--gold"><GraduationCap className="h-3.5 w-3.5" /> {geral ? 'Todos os cargos' : (cargoNome ?? '—')}</span>
              {lojas.map((l) => <span key={l} className="adm-badge adm-badge--muted"><Store className="h-3 w-3" /> {l}</span>)}
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-[0.75rem] font-semibold text-[var(--ink)]"><Users className="h-3.5 w-3.5" /> Colaboradores ({geral ? emps.length : colaboradores.length})</p>
              {geral ? (
                <p className="text-[0.8rem] text-[var(--text-muted)]">Todos os colaboradores veem os módulos globais.</p>
              ) : colaboradores.length === 0 ? (
                <p className="text-[0.8rem] text-[var(--text-muted)]">Nenhum colaborador com este cargo ainda.</p>
              ) : (
                <p className="text-[0.82rem] text-[var(--text-secondary)]">{colaboradores.slice(0, 6).map((c) => c.name).join(' · ')}{colaboradores.length > 6 ? ` · +${colaboradores.length - 6}` : ''}</p>
              )}
            </div>
            {gerentesDaEquipe.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-[0.75rem] font-semibold text-[var(--ink)]"><ShieldCheck className="h-3.5 w-3.5" /> Gerente(s):</span>
                {gerentesDaEquipe.map((g) => <span key={g.id} className="adm-badge adm-badge--muted">{g.nome}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* 3) MÓDULOS GLOBAIS HERDADOS */}
        <div className="adm-card p-5">
          <SectionHead icon={Globe} label="Módulos globais herdados" hint="“Para todos”. Reordene aqui; editar afeta todos os treinamentos." tone="#b8860b" />
          {herdados.length === 0 ? (
            <p className="text-[0.82rem] text-[var(--text-muted)]">Nenhum módulo global.</p>
          ) : (
            <Reorder.Group axis="y" values={herdados} onReorder={reorderHerdados} className="m-0 flex list-none flex-col gap-2 p-0">
              {herdados.map((m) => (
                <ModuleRow key={m.id} m={m} kind="global" accent={accent} onEdit={() => setWarnModule(m)}
                  hidden={hiddenIds.includes(m.id)} onToggleHidden={() => toggleHidden(m.id)} />
              ))}
            </Reorder.Group>
          )}
        </div>

        {/* 4) MÓDULOS ESPECÍFICOS */}
        <div className="adm-card p-5">
          <SectionHead icon={Layers} label="Módulos específicos" hint={geral ? 'O treinamento Geral não tem módulos específicos.' : `Exclusivos de ${cargoNome}. Aparecem só aqui.`} tone={accent} />
          {geral ? (
            <p className="text-[0.82rem] text-[var(--text-muted)]">Crie módulos específicos dentro de cada treinamento de cargo.</p>
          ) : (
            <>
              {especificos.length === 0 ? (
                <p className="mb-3 text-[0.82rem] text-[var(--text-muted)]">Nenhum módulo específico de {cargoNome} ainda.</p>
              ) : (
                <Reorder.Group axis="y" values={especificos} onReorder={reorderEspecificos} className="m-0 mb-3 flex list-none flex-col gap-2 p-0">
                  {especificos.map((m) => (
                    <ModuleRow key={m.id} m={m} kind="especifico" accent={accent} onEdit={() => navigate(`/admin/modulos/${m.id}`)} />
                  ))}
                </Reorder.Group>
              )}
              <button type="button" onClick={criarEspecifico} className="adm-btn adm-btn--primary w-full">
                <Plus className="h-4 w-4" /> Criar módulo específico de {cargoNome}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 5) PREVIEW */}
      <div className="adm-card mt-4 p-5">
        <SectionHead icon={Eye} label="Prévia do treinamento" hint="Como o colaborador deste cargo verá os módulos (a Home real é aplicada no Bloco E)." tone="var(--accent)" />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${accent}1f`, color: accent }}><IconCur className="h-5 w-5" /></span>
            <div>
              <p className="text-[0.95rem] font-semibold text-[var(--ink)]">{t.nome}</p>
              {tHome && <p className="text-[0.78rem] text-[var(--text-muted)]">{tHome}</p>}
            </div>
          </div>
          <ol className="flex flex-col gap-1.5">
            {[...herdados.filter((m) => !hiddenIds.includes(m.id)), ...especificos].map((m, i) => (
              <li key={m.id} className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-white px-3 py-2">
                <span className="text-[0.72rem] font-bold text-[var(--text-muted)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1 truncate text-[0.82rem] font-medium text-[var(--ink)]">{m.title}</span>
                <span className={`adm-badge ${m.roles === 'all' ? 'adm-badge--gold' : 'adm-badge--muted'}`}>{m.roles === 'all' ? 'Global' : 'Específico'}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* aviso ao editar módulo global */}
      <AnimatePresence>
        {warnModule && (
          <ModalShell
            onClose={() => setWarnModule(null)}
            size="sm"
            header={<ModalHeader icon={Globe} eyebrow="Módulo global" title="Editar módulo global?" onClose={() => setWarnModule(null)} tone="gold" />}
            footer={
              <ModalFooter>
                <button onClick={() => setWarnModule(null)} className="adm-btn flex-1">Cancelar</button>
                <button onClick={() => { const m = warnModule; setWarnModule(null); navigate(`/admin/modulos/${m.id}`) }} className="adm-btn adm-btn--primary flex-[2]">
                  <Pencil className="h-4 w-4" /> Editar mesmo assim
                </button>
              </ModalFooter>
            }
          >
            <div className="flex items-start gap-2.5 rounded-xl border border-[#f5e2c0] bg-[#fdf4e3] p-3.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#9a6b15]" />
              <p className="text-[0.85rem] leading-relaxed text-[#7a5512]">
                <strong>{warnModule.title}</strong> é um módulo <strong>global</strong>. Alterações de conteúdo afetam <strong>todos os treinamentos</strong> que o herdam, não só este.
              </p>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  )
}
