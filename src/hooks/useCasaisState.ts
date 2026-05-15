import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { buildVotes, buildState } from '../lib/stateUtils'
import type { SessionRow, CoupleRow, VoteRow } from '../lib/stateUtils'
import type { AppState, Phase, VoteOption } from '../types'

export function useCasaisState(myId: string) {
  const [appState, setAppState] = useState<AppState>({
    started: false,
    currentSit: 0,
    phase: 'waiting',
    couples: {},
    votes: {},
  })
  const [loading, setLoading] = useState(true)
  const appStateRef = useRef(appState)
  appStateRef.current = appState

  useEffect(() => {
    async function init() {
      const [{ data: session }, { data: couples }, { data: votes }] = await Promise.all([
        supabase.from('sessions').select('*').eq('id', 'main').maybeSingle(),
        supabase.from('couples').select('*'),
        supabase.from('votes').select('*'),
      ])
      setAppState(buildState(session as SessionRow | null, (couples ?? []) as CoupleRow[], (votes ?? []) as VoteRow[]))
      setLoading(false)
    }

    void init()

    const channel = supabase
      .channel('casais-channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: 'id=eq.main' },
        (payload) => {
          const row = payload.new as SessionRow
          setAppState(prev => ({
            ...prev,
            started: row.started,
            currentSit: row.current_sit,
            phase: row.phase as Phase,
          }))
        },
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'couples' },
        (payload) => {
          const row = payload.old as CoupleRow
          setAppState(prev => {
            const couples = { ...prev.couples }
            delete couples[row.id]
            return { ...prev, couples }
          })
        },
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' },
        () => {
          supabase.from('votes').select('*').then(({ data }) => {
            if (data) setAppState(prev => ({ ...prev, votes: buildVotes(data as VoteRow[]) }))
          })
        },
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [])

  const joinDynamic = useCallback(async (name: string) => {
    setAppState(prev => ({
      ...prev,
      couples: { ...prev.couples, [myId]: { id: myId, name } },
    }))
    await supabase.from('couples').upsert({ id: myId, name }, { onConflict: 'id' })
  }, [myId])

  const submitVote = useCallback(async (vote: VoteOption) => {
    const sitKey = `sit_${appStateRef.current.currentSit}`
    setAppState(prev => ({
      ...prev,
      votes: { ...prev.votes, [sitKey]: { ...(prev.votes[sitKey] ?? {}), [myId]: vote } },
    }))
    await supabase.from('votes').upsert(
      { couple_id: myId, sit_key: sitKey, vote },
      { onConflict: 'couple_id,sit_key' },
    )
  }, [myId])

  return { appState, loading, joinDynamic, submitVote }
}
