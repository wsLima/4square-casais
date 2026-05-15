import { useState, useEffect, useRef, useCallback } from 'react'
import type { AppState, VoteOption } from '../types'

const STORAGE_KEY = 'culto_casais_v1'

const defaultState: AppState = {
  started: false,
  currentSit: 0,
  phase: 'waiting',
  couples: {},
  votes: {},
}

function load(): AppState {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (!s) return defaultState
    return { ...defaultState, ...(JSON.parse(s) as Partial<AppState>) }
  } catch {
    return defaultState
  }
}

export function useCasaisState(myId: string) {
  const [appState, setAppState] = useState<AppState>(load)
  const appStateRef = useRef(appState)
  appStateRef.current = appState

  useEffect(() => {
    const id = setInterval(() => {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const s = JSON.parse(saved) as AppState
      if (JSON.stringify(s) !== JSON.stringify(appStateRef.current)) {
        appStateRef.current = s
        setAppState(s)
      }
    }, 800)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const bc = new BroadcastChannel('culto_casais')
    bc.onmessage = (e: MessageEvent) => {
      if (e.data && !e.data.type) {
        const s = e.data as AppState
        appStateRef.current = s
        setAppState(s)
      }
    }
    return () => bc.close()
  }, [])

  const joinDynamic = useCallback(
    (name: string) => {
      const bc = new BroadcastChannel('culto_casais')
      bc.postMessage({ type: 'join', id: myId, name })
      bc.close()

      const s = appStateRef.current
      const next: AppState = {
        ...s,
        couples: { ...s.couples, [myId]: { id: myId, name } },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      appStateRef.current = next
      setAppState(next)
    },
    [myId],
  )

  const submitVote = useCallback(
    (vote: VoteOption) => {
      const s = appStateRef.current
      const sitKey = `sit_${s.currentSit}`
      const next: AppState = {
        ...s,
        votes: {
          ...s.votes,
          [sitKey]: { ...(s.votes[sitKey] ?? {}), [myId]: vote },
        },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      appStateRef.current = next
      setAppState(next)

      const bc = new BroadcastChannel('culto_casais')
      bc.postMessage({ type: 'vote', id: myId, vote, sitKey })
      bc.close()
    },
    [myId],
  )

  return { appState, joinDynamic, submitVote }
}
