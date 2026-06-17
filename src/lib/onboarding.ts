const GLOBAL_ONBOARDING_KEY = 'pralis:onboarding_seen'

function employeeOnboardingKey(employeeId: string) {
  return `pralis:onboarding_seen:${employeeId}`
}

export function hasRequiredOnboarding(employeeId: string | null | undefined) {
  if (!employeeId) return false
  return localStorage.getItem(employeeOnboardingKey(employeeId)) === '1'
}

export function markRequiredOnboardingSeen(employeeId: string | null | undefined) {
  localStorage.setItem(GLOBAL_ONBOARDING_KEY, '1')
  if (employeeId) localStorage.setItem(employeeOnboardingKey(employeeId), '1')
}
