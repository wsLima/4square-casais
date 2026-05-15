import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { buildVotes, buildState } from '../lib/stateUtils'
import type { SessionRow, CoupleRow, VoteRow } from '../lib/stateUtils'
import type { AppState, Phase } from '../types'
import { situations } from '../data/situations'

export function useHostState() {
  const [state, setState] = useState<AppState>({
    started: false,
    currentSit: 0,
    phase: 'waiting',
    couples: {},
    votes: {},
  })
  const [loading, setLoading] = useState(true)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    async function init() {
      // Garante que a sessão existe
      await supabase.from('sessions').upsert({ id: 'main' }, { onConflict: 'id', ignoreDuplicates: true })

      const [{ data: session }, { data: couples }, { data: votes }] = await Promise.all([
        supabase.from('sessions').select('*').eq('id', 'main').maybeSingle(),
        supabase.from('couples').select('*'),
        supabase.from('votes').select('*'),
      ])

      setState(buildState(session as SessionRow | null, (couples ?? []) as CoupleRow[], (votes ?? []) as VoteRow[]))
      setLoading(false)
    }

    void init()

    const channel = supabase
      .channel('host-channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: 'id=eq.main' },
        (payload) => {
          const row = payload.new as SessionRow
          setState(prev => ({
            ...prev,
            started: row.started,
            currentSit: row.current_sit,
            phase: row.phase as Phase,
          }))
        },
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'couples' },
        (payload) => {
          const row = payload.new as CoupleRow
          setState(prev => ({
            ...prev,
            couples: { ...prev.couples, [row.id]: { id: row.id, name: row.name } },
          }))
        },
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' },
        () => {
          supabase.from('votes').select('*').then(({ data }) => {
            if (data) setState(prev => ({ ...prev, votes: buildVotes(data as VoteRow[]) }))
          })
        },
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [])

  const updateSession = useCallback(async (updates: Partial<Omit<SessionRow, 'id'>>) => {
    setState(prev => {
      const next = { ...prev }
      if (updates.started !== undefined) next.started = updates.started
      if (updates.phase !== undefined) next.phase = updates.phase as Phase
      if (updates.current_sit !== undefined) next.currentSit = updates.current_sit
      return next
    })
    await supabase.from('sessions').update(updates).eq('id', 'main')
  }, [])

  const startDynamic = useCallback(() => updateSession({ started: true }), [updateSession])
  const startVoting = useCallback(() => updateSession({ phase: 'active' }), [updateSession])
  const showResults = useCallback(() => updateSession({ phase: 'results' }), [updateSession])

  const resetVotes = useCallback(async () => {
    const sitKey = `sit_${stateRef.current.currentSit}`
    setState(prev => ({ ...prev, phase: 'waiting', votes: { ...prev.votes, [sitKey]: {} } }))
    await supabase.from('votes').delete().eq('sit_key', sitKey)
    await supabase.from('sessions').update({ phase: 'waiting' }).eq('id', 'main')
  }, [])

  const changeSituation = useCallback(async (dir: -1 | 1) => {
    const next = stateRef.current.currentSit + dir
    if (next < 0 || next >= situations.length) return
    await updateSession({ current_sit: next, phase: 'waiting' })
  }, [updateSession])

  return { state, loading, startDynamic, startVoting, showResults, resetVotes, changeSituation }
}
