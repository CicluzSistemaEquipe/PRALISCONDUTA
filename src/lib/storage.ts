// ============================================================
// Camada de persistência — abstração sobre localStorage / Supabase
//
// Hoje o app roda 100% no navegador (localStorage). Quando as variáveis
// VITE_SUPABASE_* estiverem presentes, as mesmas operações passam a usar
// o Supabase, sem mudar nenhum componente. Veja `lib/supabase.ts`.
// ============================================================

import { supabase, hasSupabase } from './supabase'
import type {
  Employee,
  ModuleProgress,
  PollAnswerRecord,
  QuizAnswerRecord,
  SignatureRecord,
  Role,
} from './types'

const LS = {
  employees: 'pralis:employees',
  progress: (id: string) => `pralis:progress:${id}`,
  quiz: (id: string) => `pralis:quiz:${id}`,
  poll: (id: string) => `pralis:poll:${id}`,
  signature: (id: string) => `pralis:signature:${id}`,
  videos: (id: string) => `pralis:videos:${id}`,
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / modo privado — silenciar */
  }
}

function uid() {
  // crypto.randomUUID disponível em todos os browsers modernos / contexto seguro
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
}

export function makeToken() {
  const part = () => Math.random().toString(36).slice(2, 8)
  return `${part()}${part()}`
}

export function makeAccessCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

// ------------------------------------------------------------
// Employees
// ------------------------------------------------------------

export async function getEmployeeByToken(token: string): Promise<Employee | null> {
  if (hasSupabase && supabase) {
    const { data } = await supabase.from('employees').select('*').eq('token', token).maybeSingle()
    return (data as Employee) ?? null
  }
  const all = read<Employee[]>(LS.employees, [])
  return all.find((e) => e.token === token) ?? null
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  if (hasSupabase && supabase) {
    const { data } = await supabase.from('employees').select('*').eq('id', id).maybeSingle()
    return (data as Employee) ?? null
  }
  return read<Employee[]>(LS.employees, []).find((e) => e.id === id) ?? null
}

export async function createEmployee(input: {
  name: string
  phone: string
  role: Role
  token?: string
  access_code?: string
  gerenteId?: string
}): Promise<Employee> {
  const employee: Employee = {
    id: uid(),
    name: input.name,
    phone: input.phone,
    role: input.role,
    token: input.token ?? makeToken(),
    access_code: input.access_code ?? makeAccessCode(),
    gerenteId: input.gerenteId,
    created_at: new Date().toISOString(),
  }

  if (hasSupabase && supabase) {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        name: employee.name,
        phone: employee.phone,
        role: employee.role,
        token: employee.token,
        access_code: employee.access_code,
      })
      .select()
      .single()
    if (error) throw error
    return data as Employee
  }

  const all = read<Employee[]>(LS.employees, [])
  all.push(employee)
  write(LS.employees, all)
  return employee
}

/** Pré-cadastra um colaborador (dashboard RH) e devolve o token/link. */
export async function preRegisterEmployee(input: {
  name: string
  phone: string
  role: Role
}): Promise<Employee> {
  return createEmployee(input)
}

export async function updateEmployee(
  id: string,
  patch: Partial<Pick<Employee, 'name' | 'phone' | 'role' | 'token' | 'access_code' | 'gerenteId'>>,
): Promise<Employee | null> {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase
      .from('employees')
      .update(patch)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return (data as Employee) ?? null
  }

  const all = read<Employee[]>(LS.employees, [])
  const idx = all.findIndex((employee) => employee.id === id)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...patch }
  write(LS.employees, all)
  return all[idx]
}

export async function regenerateEmployeeAccess(id: string): Promise<Employee | null> {
  return updateEmployee(id, {
    token: makeToken(),
    access_code: makeAccessCode(),
  })
}

export async function deleteEmployee(id: string): Promise<void> {
  if (hasSupabase && supabase) {
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (error) throw error
    return
  }

  write(
    LS.employees,
    read<Employee[]>(LS.employees, []).filter((employee) => employee.id !== id),
  )
  localStorage.removeItem(LS.progress(id))
  localStorage.removeItem(LS.quiz(id))
  localStorage.removeItem(LS.signature(id))
  localStorage.removeItem(LS.videos(id))
}

export async function listEmployees(): Promise<Employee[]> {
  if (hasSupabase && supabase) {
    const { data } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })
    return (data as Employee[]) ?? []
  }
  return read<Employee[]>(LS.employees, []).sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )
}

// ------------------------------------------------------------
// Progress
// ------------------------------------------------------------

export async function getProgress(employeeId: string): Promise<ModuleProgress[]> {
  if (hasSupabase && supabase) {
    const { data } = await supabase.from('progress').select('*').eq('employee_id', employeeId)
    return (data as ModuleProgress[]) ?? []
  }
  return read<ModuleProgress[]>(LS.progress(employeeId), [])
}

export async function saveProgress(
  employeeId: string,
  p: ModuleProgress,
): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase.from('progress').upsert(
      {
        employee_id: employeeId,
        module_id: p.module_id,
        story_index: p.story_index,
        completed: p.completed,
        completed_at: p.completed_at,
      },
      { onConflict: 'employee_id,module_id' },
    )
    return
  }
  const all = read<ModuleProgress[]>(LS.progress(employeeId), [])
  const idx = all.findIndex((x) => x.module_id === p.module_id)
  if (idx >= 0) all[idx] = p
  else all.push(p)
  write(LS.progress(employeeId), all)
}

// ------------------------------------------------------------
// Quiz
// ------------------------------------------------------------

export async function saveQuizAnswer(
  employeeId: string,
  a: QuizAnswerRecord,
): Promise<void> {
  if (hasSupabase && supabase) {
    if (a.reviewed) {
      await supabase
        .from('quiz_answers')
        .update({
          answer: a.answer,
          correct: a.correct,
        })
        .eq('employee_id', employeeId)
        .eq('module_id', a.module_id)
        .eq('question_id', a.question_id)
      return
    }
    await supabase.from('quiz_answers').insert({
      employee_id: employeeId,
      module_id: a.module_id,
      question_id: a.question_id,
      answer: a.answer,
      correct: a.correct,
    })
    return
  }
  const all = read<QuizAnswerRecord[]>(LS.quiz(employeeId), [])
  const idx = all.findIndex((item) => item.module_id === a.module_id && item.question_id === a.question_id)
  if (idx >= 0) all[idx] = { ...all[idx], ...a, answered_at: all[idx].answered_at || a.answered_at }
  else all.push(a)
  write(LS.quiz(employeeId), all)
}

export async function getQuizAnswers(employeeId: string): Promise<QuizAnswerRecord[]> {
  if (hasSupabase && supabase) {
    const { data } = await supabase.from('quiz_answers').select('*').eq('employee_id', employeeId)
    return (data as QuizAnswerRecord[]) ?? []
  }
  return read<QuizAnswerRecord[]>(LS.quiz(employeeId), [])
}

// ------------------------------------------------------------
// Enquetes (poll) — opinião do colaborador, sem certo/errado.
// Persistência local por enquanto (sem tabela Supabase nesta etapa).

export async function savePollAnswer(employeeId: string, a: PollAnswerRecord): Promise<void> {
  const all = read<PollAnswerRecord[]>(LS.poll(employeeId), [])
  const idx = all.findIndex((item) => item.module_id === a.module_id && item.question === a.question)
  if (idx >= 0) all[idx] = a
  else all.push(a)
  write(LS.poll(employeeId), all)
}

export async function getPollAnswers(employeeId: string): Promise<PollAnswerRecord[]> {
  return read<PollAnswerRecord[]>(LS.poll(employeeId), [])
}

// ------------------------------------------------------------
// Vídeos assistidos
// ------------------------------------------------------------

export async function markVideoWatched(
  employeeId: string,
  moduleId: string,
  videoId: string,
): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase
      .from('video_views')
      .upsert(
        { employee_id: employeeId, module_id: moduleId, video_id: videoId },
        { onConflict: 'employee_id,video_id' },
      )
    return
  }
  const all = read<{ module_id: string; video_id: string; watched_at: string }[]>(
    LS.videos(employeeId),
    [],
  )
  if (!all.some((v) => v.video_id === videoId)) {
    all.push({ module_id: moduleId, video_id: videoId, watched_at: new Date().toISOString() })
    write(LS.videos(employeeId), all)
  }
}

export async function getVideoViews(employeeId: string): Promise<string[]> {
  if (hasSupabase && supabase) {
    const { data } = await supabase
      .from('video_views')
      .select('video_id')
      .eq('employee_id', employeeId)
    return (data as { video_id: string }[] | null)?.map((v) => v.video_id) ?? []
  }
  return read<{ video_id: string }[]>(LS.videos(employeeId), []).map((v) => v.video_id)
}

// ------------------------------------------------------------
// Assinatura
// ------------------------------------------------------------

export async function saveSignature(
  employeeId: string,
  sig: SignatureRecord,
): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase.from('signatures').upsert(
      {
        employee_id: employeeId,
        signed_at: sig.signed_at,
        ip_address: sig.ip_address,
        confirmed: sig.confirmed,
      },
      { onConflict: 'employee_id' },
    )
    return
  }
  write(LS.signature(employeeId), sig)
}

export async function getSignature(employeeId: string): Promise<SignatureRecord | null> {
  if (hasSupabase && supabase) {
    const { data } = await supabase
      .from('signatures')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle()
    return (data as SignatureRecord) ?? null
  }
  return read<SignatureRecord | null>(LS.signature(employeeId), null)
}
