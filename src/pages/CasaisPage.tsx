import { useState, useRef, useEffect } from 'react'
import { useCasaisState } from '../hooks/useCasaisState'
import { situations } from '../data/situations'
import type { VoteOption } from '../types'

const VOTE_OPTIONS = [
  {
    key: 'fire' as VoteOption,
    emoji: '🔥',
    name: 'Reação da Carne (Moisés)',
    desc: 'Resposta impulsiva, dominada pela emoção',
    selected: 'bg-fire/10 border-fire',
    idle: 'bg-white border-fire/25 hover:bg-fire/5',
    nameColor: 'text-fire',
  },
  {
    key: 'silence' as VoteOption,
    emoji: '😶',
    name: 'Guardei pra Mim (Neemias)',
    desc: 'Silêncio, reflexão ou recolhimento',
    selected: 'bg-silence/10 border-silence',
    idle: 'bg-white border-silence/25 hover:bg-silence/5',
    nameColor: 'text-silence',
  },
  {
    key: 'mature' as VoteOption,
    emoji: '❤️',
    name: 'Reação Madura (José)',
    desc: 'Resposta guiada por graça e maturidade',
    selected: 'bg-mature/10 border-mature',
    idle: 'bg-white border-mature/25 hover:bg-mature/5',
    nameColor: 'text-mature',
  },
]

const VOTE_LABELS: Record<VoteOption, string> = {
  fire: '🔥 Reação da Carne',
  silence: '😶 Guardei pra Mim',
  mature: '❤️ Reação Madura',
}

const RESULT_ROWS = [
  { key: 'fire' as VoteOption, emoji: '🔥', label: 'Reação da Carne', color: 'text-fire', bar: 'bg-fire' },
  { key: 'silence' as VoteOption, emoji: '😶', label: 'Guardei pra Mim', color: 'text-silence', bar: 'bg-silence' },
  { key: 'mature' as VoteOption, emoji: '❤️', label: 'Reação Madura', color: 'text-mature', bar: 'bg-mature' },
]

const myIdRef = { current: `couple_${Math.random().toString(36).slice(2, 10)}` }

export default function CasaisPage() {
  const myId = myIdRef.current
  const { appState, loading, joinDynamic, submitVote } = useCasaisState(myId)

  const [myName, setMyName] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [selectedOption, setSelectedOption] = useState<VoteOption | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSelectedOption(null)
  }, [appState.currentSit])

  useEffect(() => {
    if (myName && !appState.couples[myId]) {
      setMyName('')
      setInputValue('')
      setSelectedOption(null)
    }
  }, [appState.couples, myId, myName])

  function handleEnter() {
    const name = inputValue.trim()
    if (!name) {
      inputRef.current?.focus()
      return
    }
    setMyName(name)
    joinDynamic(name)
  }

  function handleVote() {
    if (!selectedOption) return
    submitVote(selectedOption)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-muted text-sm animate-pulse">Conectando…</p>
      </div>
    )
  }

  const sitKey = `sit_${appState.currentSit}`
  const alreadyVoted = !!(appState.votes?.[sitKey]?.[myId])
  const myVote = appState.votes?.[sitKey]?.[myId]
  const sit = situations[appState.currentSit]

  const votes = appState.votes?.[sitKey] ?? {}

  type Screen = 'login' | 'waiting' | 'voting' | 'voted' | 'results'
  let screen: Screen
  if (!myName) {
    screen = 'login'
  } else if (!appState.started || appState.phase === 'waiting') {
    screen = 'waiting'
  } else if (appState.phase === 'active') {
    screen = alreadyVoted ? 'voted' : 'voting'
  } else {
    screen = 'results'
  }

  return (
    <div
      className="min-h-screen bg-cream flex items-center justify-center p-6"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full max-w-md">

        {/* LOGIN */}
        {screen === 'login' && (
          <div className="animate-fade-in">
            <div className="text-center mb-10">
              <span className="text-6xl block mb-4">💑</span>
              <h1 className="font-display text-4xl text-wine leading-tight">Dinâmica do Casal</h1>
              <p className="text-muted mt-2 text-sm leading-relaxed">
                Bem-vindos à noite especial! Digite o nome do casal para participar.
              </p>
            </div>

            {appState.phase === 'active' && (
              <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 text-center font-medium">
                ⚠️ Você precisa entrar primeiro.
              </div>
            )}

            <div className="bg-white border border-wine/15 rounded-2xl p-8">
              <label className="block text-xs font-medium text-muted uppercase tracking-widest mb-2">
                Nome do casal
              </label>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEnter()}
                placeholder="Ex: João e Maria"
                maxLength={50}
                autoComplete="off"
                className="w-full px-4 py-3.5 border-2 border-wine/15 rounded-xl text-sm bg-cream text-prose outline-none focus:border-wine focus:ring-2 focus:ring-wine/10 placeholder:text-muted mb-5 transition-all"
              />
              <button
                onClick={handleEnter}
                className="w-full py-4 bg-wine text-white rounded-2xl font-medium text-lg hover:bg-wine-light active:scale-95 transition-all cursor-pointer"
              >
                Entrar na Dinâmica ❤️
              </button>
            </div>
          </div>
        )}

        {/* WAITING */}
        {screen === 'waiting' && (
          <div className="text-center py-8 animate-fade-in">
            <div className="font-display text-2xl text-wine mb-2">💑 {myName}</div>
            <span className="text-6xl block my-6 animate-bounce">⏳</span>
            <p className="text-muted leading-loose text-sm">
              {!appState.started
                ? <>Vocês estão conectados!<br />Aguardando o apresentador<br />iniciar a dinâmica…</>
                : <>Aguardando o apresentador<br />iniciar a votação…</>
              }
            </p>
            <div className="flex gap-1.5 justify-center mt-6">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-wine/60 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* VOTING */}
        {screen === 'voting' && sit && (
          <div className="animate-fade-in">
            <div className="mb-7">
              <span className="inline-block bg-wine-pale text-wine text-xs font-medium px-3 py-1 rounded-full uppercase tracking-widest mb-3">
                Situação {appState.currentSit + 1} de {situations.length}
              </span>
              <p className="font-display text-xl text-prose leading-snug whitespace-pre-line">{sit.text}</p>
            </div>
            <div className="flex flex-col gap-3">
              {VOTE_OPTIONS.map(opt => {
                const override = sit.optionOverrides?.[opt.key]
                const emoji = override?.emoji ?? opt.emoji
                const name = override?.name ?? opt.name
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedOption(opt.key)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      selectedOption === opt.key ? opt.selected : opt.idle
                    }`}
                  >
                    <span className="text-3xl flex-shrink-0">{emoji}</span>
                    <div>
                      <div className={`font-medium text-sm ${opt.nameColor}`}>{name}</div>
                      <div className="text-xs text-muted mt-0.5 leading-snug whitespace-pre-line">
                        {sit.reactions ? sit.reactions[opt.key] : opt.desc}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <button
              onClick={handleVote}
              disabled={!selectedOption}
              className={`w-full mt-5 py-4 rounded-2xl font-medium transition-all ${
                selectedOption
                  ? 'bg-wine text-white hover:bg-wine-light cursor-pointer'
                  : 'bg-wine/30 text-white cursor-not-allowed'
              }`}
            >
              Confirmar resposta
            </button>
          </div>
        )}

        {/* VOTED */}
        {screen === 'voted' && (
          <div className="text-center py-8 animate-fade-in">
            <span className="text-6xl block mb-6">✅</span>
            <div className="font-display text-3xl text-wine mb-3">Resposta enviada!</div>
            <p className="text-muted text-sm leading-loose">
              Aguardando o apresentador<br />encerrar a votação…
            </p>
            {myVote && (
              <div className="mt-6 max-w-xs mx-auto bg-white border border-wine/15 rounded-2xl px-5 py-4 text-sm text-prose leading-relaxed">
                Você escolheu:<br />
                <strong className="text-wine">
                  {(() => {
                    const override = sit.optionOverrides?.[myVote]
                    return override ? `${override.emoji} ${override.name}` : VOTE_LABELS[myVote]
                  })()}
                </strong>
              </div>
            )}
            <div className="mt-4 text-sm text-muted font-medium">
              {Object.keys(votes).length} de {Object.keys(appState.couples).length}{' '}
              {Object.keys(appState.couples).length === 1 ? 'casal respondeu' : 'casais responderam'}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {screen === 'results' && (
          <div className="animate-fade-in">
            <div className="text-center mb-5">
              <h2 className="font-display text-2xl text-wine">Seu Perfil 📊</h2>
              <p className="text-xs text-muted mt-1">Suas respostas em todas as situações</p>
            </div>

            {/* Lista por situação */}
            <div className="bg-white border border-wine/15 rounded-2xl overflow-hidden mb-5">
              {situations.map((sitObj, idx) => {
                const sitK = `sit_${idx}`
                const chosen = appState.votes?.[sitK]?.[myId] as VoteOption | undefined
                const rows = RESULT_ROWS.map(row => ({
                  ...row,
                  emoji: sitObj.optionOverrides?.[row.key]?.emoji ?? row.emoji,
                  label: sitObj.optionOverrides?.[row.key]?.name ?? row.label,
                }))
                const chosenRow = chosen ? rows.find(r => r.key === chosen) : null
                return (
                  <div key={idx} className="flex items-center gap-3 px-4 py-3 border-b border-wine/10 last:border-0">
                    <span className="text-xs text-muted font-medium flex-shrink-0 w-20">Situação {idx + 1}</span>
                    {chosenRow ? (
                      <>
                        <span className="text-base flex-shrink-0">{chosenRow.emoji}</span>
                        <span className={`text-xs font-medium ${chosenRow.color}`}>{chosenRow.label}</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted italic">Não respondida</span>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="text-center text-muted text-sm py-3 bg-wine-pale rounded-xl animate-pulse">
              Aguardando próxima situação…
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
