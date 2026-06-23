import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { getModule, modulesForRole } from '@/lib/content'
import { useSession } from '../context/SessionContext'
import { StoryPlayer } from '../components/StoryPlayer'
import { getVideoViews, markVideoWatched, saveQuizAnswer } from '@/lib/storage'
import type { QuizQuestion } from '@/lib/types'

export default function ModulePage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { employee, progress, setStoryIndex, completeModule } = useSession()
  const module = getModule(id)
  const [watched, setWatched] = useState<Set<string>>(new Set())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!employee) return
    let active = true
    getVideoViews(employee.id).then((ids) => {
      if (active) {
        setWatched(new Set(ids))
        setReady(true)
      }
    })
    return () => {
      active = false
    }
  }, [employee])

  if (!employee) {
    return <Navigate to="/login" replace />
  }
  if (!module) {
    return <Navigate to="/feed" replace />
  }
  if (!ready) return null

  const startIndex = progress[module.id]?.story_index ?? 0

  const allModules = modulesForRole(employee.role)
  const currentIdx = allModules.findIndex((m) => m.id === module.id)
  const nextModule = currentIdx >= 0 && currentIdx < allModules.length - 1 ? allModules[currentIdx + 1] : null

  const handleQuizAnswer = (
    moduleId: string,
    q: QuizQuestion,
    selectedIndex: number,
    correct: boolean,
  ) => {
    void saveQuizAnswer(employee.id, {
      module_id: moduleId,
      question_id: q.id,
      answer: q.options[selectedIndex],
      correct,
      answered_at: new Date().toISOString(),
    })
  }

  const handleQuizReview = (
    moduleId: string,
    q: QuizQuestion,
    selectedIndex: number,
    correct: boolean,
  ) => {
    void saveQuizAnswer(employee.id, {
      module_id: moduleId,
      question_id: q.id,
      answer: q.options[selectedIndex],
      correct,
      answered_at: new Date().toISOString(),
      reviewed: true,
      reviewed_at: new Date().toISOString(),
    })
  }

  const handleVideoWatched = (moduleId: string, videoId: string) => {
    void markVideoWatched(employee.id, moduleId, videoId)
    setWatched((prev) => new Set(prev).add(videoId))
  }

  return (
    <StoryPlayer
      module={module}
      startIndex={startIndex}
      quizSeed={`${employee.id}:${module.id}`}
      watchedVideos={watched}
      onClose={() => navigate('/feed')}
      onIndexChange={(i) => setStoryIndex(module.id, i)}
      onModuleComplete={() => completeModule(module.id)}
      onNextModule={nextModule ? () => navigate(`/modulo/${nextModule.id}`) : undefined}
      onQuizAnswer={handleQuizAnswer}
      onQuizReview={handleQuizReview}
      onVideoWatched={handleVideoWatched}
    />
  )
}
