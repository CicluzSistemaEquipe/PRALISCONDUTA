import { listEmployees, getProgress, getSignature, getQuizAnswers } from '@/lib/storage'
import { modulesForRole } from '@/lib/content'
import type { Employee } from '@/lib/types'

export interface EmployeeRow {
  employee: Employee
  totalModules: number
  completedModules: number
  progress: number // 0..1
  signed: boolean
  signedAt: string | null
  quizCorrect: number
  quizTotal: number
  link: string
}

export function employeeLink(token: string): string {
  return `${window.location.origin}/login?t=${token}`
}

export async function loadEmployeeRows(): Promise<EmployeeRow[]> {
  const employees = await listEmployees()
  const rows = await Promise.all(
    employees.map(async (employee) => {
      const [progress, signature, quiz] = await Promise.all([
        getProgress(employee.id),
        getSignature(employee.id),
        getQuizAnswers(employee.id),
      ])
      const mods = modulesForRole(employee.role)
      const completedModules = mods.filter(
        (m) => progress.find((p) => p.module_id === m.id)?.completed,
      ).length
      return {
        employee,
        totalModules: mods.length,
        completedModules,
        progress: mods.length ? completedModules / mods.length : 0,
        signed: Boolean(signature),
        signedAt: signature?.signed_at ?? null,
        quizCorrect: quiz.filter((q) => q.correct).length,
        quizTotal: quiz.length,
        link: employeeLink(employee.token),
      }
    }),
  )
  return rows
}
