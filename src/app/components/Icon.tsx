import {
  HeartHandshake,
  Route,
  ClipboardCheck,
  Ban,
  ChefHat,
  Users,
  CreditCard,
  Sparkles,
  MapPin,
  Handshake,
  AlertTriangle,
  FileSignature,
  Circle,
  type LucideProps,
} from 'lucide-react'

/**
 * Registro explícito dos ícones usados pelo conteúdo dos módulos.
 * Importar nominalmente (em vez de `import * as Lucide`) permite o
 * tree-shaking — não embarca a biblioteca inteira no bundle.
 */
const REGISTRY: Record<string, React.ComponentType<LucideProps>> = {
  HeartHandshake,
  Route,
  ClipboardCheck,
  Ban,
  ChefHat,
  Users,
  CreditCard,
  Sparkles,
  MapPin,
  Handshake,
  AlertTriangle,
  FileSignature,
}

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = REGISTRY[name] ?? Circle
  return <C {...props} />
}
