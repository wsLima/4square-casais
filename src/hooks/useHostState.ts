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

function persist(s: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  const bc = new BroadcastChannel('culto_casais')
  bc.postMessage(s)
  bc.close()
}

export function useHostState() {
  const [state, setState] = useState<AppState>(load)
  const stateRef = useRef(state)
  stateRef.current = state

  const update = useCallback((next: AppState) => {
    persist(next)
    stateRef.current = next
    setState(next)
  }, [])

  useEffect(() => {
    const bc = new BroadcastChannel('culto_casais')
    bc.onmessage = (e: MessageEvent) => {
      if (!e.data?.type) return
      const prev = stateRef.current
      let next: AppState
      if (e.data.type === 'join') {
        next = {
          ...prev,
          couples: {
            ...prev.couples,
            [e.data.id as string]: { id: e.data.id as string, name: e.data.name as string },
          },
        }
      } else if (e.data.type === 'vote') {
        const sitKey = `sit_${prev.currentSit}`
        next = {
          ...prev,
          votes: {
            ...prev.votes,
            [sitKey]: {
              ...(prev.votes[sitKey] ?? {}),
              [e.data.id as string]: e.data.vote as VoteOption,
            },
          },
        }
      } else {
        return
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      stateRef.current = next
      setState(next)
    }
    return () => bc.close()
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const s = JSON.parse(saved) as AppState
      const curr = stateRef.current
      if (
        JSON.stringify(s.couples) !== JSON.stringify(curr.couples) ||
        JSON.stringify(s.votes) !== JSON.stringify(curr.votes)
      ) {
        stateRef.current = s
        setState(s)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const startVoting = useCallback(() => {
    update({ ...stateRef.current, phase: 'active' })
  }, [update])

  const showResults = useCallback(() => {
    update({ ...stateRef.current, phase: 'results' })
  }, [update])

  const resetVotes = useCallback(() => {
    const curr = stateRef.current
    const sitKey = `sit_${curr.currentSit}`
    update({ ...curr, phase: 'waiting', votes: { ...curr.votes, [sitKey]: {} } })
  }, [update])

  const changeSituation = useCallback(
    (dir: -1 | 1) => {
      const curr = stateRef.current
      const next = curr.currentSit + dir
      if (next < 0 || next >= 4) return
      update({ ...curr, currentSit: next, phase: 'waiting' })
    },
    [update],
  )

  const startDynamic = useCallback(() => {
    update({ ...stateRef.current, started: true })
  }, [update])

  return { state, startDynamic, startVoting, showResults, resetVotes, changeSituation }
}
