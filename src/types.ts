export type Phase = 'waiting' | 'active' | 'results'
export type VoteOption = 'fire' | 'silence' | 'mature'

export interface Couple {
  id: string
  name: string
}

export interface Situation {
  title: string
  text: string
  comment: string
  reactions?: {
    fire: string
    silence: string
    mature: string
  }
  optionOverrides?: Partial<Record<VoteOption, { emoji: string; name: string }>>
}

export interface AppState {
  started: boolean
  currentSit: number
  phase: Phase
  couples: Record<string, Couple>
  votes: Record<string, Record<string, VoteOption>>
}
