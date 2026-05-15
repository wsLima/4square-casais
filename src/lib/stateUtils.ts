import type { AppState, Phase, VoteOption } from '../types'

export type SessionRow = { id: string; started: boolean; current_sit: number; phase: string }
export type CoupleRow = { id: string; name: string }
export type VoteRow = { couple_id: string; sit_key: string; vote: string }

export function buildVotes(rows: VoteRow[]): AppState['votes'] {
  const votes: AppState['votes'] = {}
  for (const row of rows) {
    if (!votes[row.sit_key]) votes[row.sit_key] = {}
    votes[row.sit_key][row.couple_id] = row.vote as VoteOption
  }
  return votes
}

export function buildState(
  session: SessionRow | null,
  couples: CoupleRow[],
  voteRows: VoteRow[],
): AppState {
  const couplesMap: AppState['couples'] = {}
  for (const c of couples) couplesMap[c.id] = { id: c.id, name: c.name }
  return {
    started: session?.started ?? false,
    currentSit: session?.current_sit ?? 0,
    phase: (session?.phase as Phase) ?? 'waiting',
    couples: couplesMap,
    votes: buildVotes(voteRows),
  }
}
