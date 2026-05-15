import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useHostState } from '../hooks/useHostState'
import { situations } from '../data/situations'
import type { VoteOption } from '../types'

type Tab = 'situacoes' | 'votacoes'

const VOTE_LABELS: Record<VoteOption, string> = {
  fire: '🔥 Reação da Carne',
  silence: '😶 Guardei pra Mim',
  mature: '❤️ Reação Madura',
}

const VOTE_ROWS = [
  { key: 'fire' as VoteOption, emoji: '🔥', label: 'Da Carne', ring: 'bg-fire/10 border-fire/30', count: 'text-fire', bar: 'bg-fire' },
  { key: 'silence' as VoteOption, emoji: '😶', label: 'Guardei pra mim', ring: 'bg-silence/10 border-silence/30', count: 'text-silence', bar: 'bg-silence' },
  { key: 'mature' as VoteOption, emoji: '❤️', label: 'Madura', ring: 'bg-mature/10 border-mature/30', count: 'text-mature', bar: 'bg-mature' },
]

export default function HostPage() {
  const { state, loading, startDynamic, startVoting, showResults, resetVotes, changeSituation } = useHostState()
  const [tab, setTab] = useState<Tab>('situacoes')
  const [copied, setCopied] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-muted text-sm animate-pulse">Conectando ao Supabase…</p>
      </div>
    )
  }

  const sit = situations[state.currentSit]
  const sitKey = `sit_${state.currentSit}`
  const votes = state.votes[sitKey] ?? {}
  const couples = Object.values(state.couples)

  const counts = { fire: 0, silence: 0, mature: 0 }
  Object.values(votes).forEach(v => { counts[v]++ })
  const total = counts.fire + counts.silence + counts.mature || 1

  const casaisUrl = `${window.location.protocol}//${window.location.host}/casais`

  function copyLink() {
    navigator.clipboard.writeText(casaisUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-cream p-6 lg:p-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="text-center mb-10 pb-8 border-b border-wine/15">
        <h1 className="font-display text-4xl text-wine">Dinâmica do Casal</h1>
        <p className="text-muted text-sm mt-2">Painel do Apresentador</p>
      </div>

      {/* ── LOBBY (antes de iniciar) ── */}
      {!state.started && (
        <div className="max-w-lg mx-auto animate-fade-in">
          {window.location.hostname === 'localhost' && (
            <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              ⚠️ Você está acessando via <strong>localhost</strong>. O QR Code não vai funcionar em outros dispositivos.
              Acesse esta página pelo <strong>IP da rede</strong> que o Vite exibe no terminal ao iniciar
              (ex: <code>http://192.168.x.x:5173/host</code>).
            </div>
          )}
          <div className="bg-white border border-wine/15 rounded-2xl p-8 mb-6">
            <p className="text-center text-prose font-medium mb-6">
              Escaneie e entre com o nome do casal para participar.
            </p>
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-wine/15">
                <QRCodeSVG value={casaisUrl} size={220} fgColor="#6B1E2E" level="M" />
              </div>
              <div className="text-xs text-muted text-center bg-wine-pale px-4 py-2 rounded-lg break-all w-full">
                {casaisUrl}
              </div>
            </div>
            <button
              onClick={copyLink}
              className="w-full py-2.5 bg-wine-pale text-wine rounded-xl text-sm font-medium hover:bg-pink-100 transition-colors cursor-pointer"
            >
              {copied ? '✓ Copiado!' : '📋 Copiar link'}
            </button>
          </div>

          <div className="bg-white border border-wine/15 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-wine">Casais Conectados</h2>
              <span className="text-sm font-medium text-wine bg-wine-pale px-3 py-1 rounded-full">
                {couples.length} {couples.length === 1 ? 'casal' : 'casais'}
              </span>
            </div>
            {couples.length === 0 ? (
              <p className="text-center text-muted text-sm py-6">
                Aguardando casais entrarem…
              </p>
            ) : (
              <div className="border border-wine/15 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                {couples.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center px-4 py-3 border-b border-wine/10 last:border-0 text-sm font-medium text-prose"
                  >
                    💑 {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={startDynamic}
            className="w-full py-4 bg-wine text-white rounded-2xl font-medium text-lg hover:bg-wine-light transition-colors cursor-pointer"
          >
            Iniciar Dinâmica →
          </button>
        </div>
      )}

      {/* ── PAINEL DE CONTROLE (após iniciar) ── */}
      {state.started && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto animate-fade-in">

          {/* LEFT: Controle */}
          <div className="bg-white border border-wine/15 rounded-2xl p-7">
            <div className="flex items-center gap-3 bg-wine-pale rounded-xl px-4 py-3 mb-6 text-sm font-medium text-wine">
              <span
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse ${
                  state.phase === 'active' ? 'bg-mature' : 'bg-gold'
                }`}
              />
              <span>
                {state.phase === 'waiting'
                  ? 'Aguardando iniciar votação...'
                  : state.phase === 'active'
                    ? 'Casais estão votando...'
                    : 'Resultados exibidos'}
              </span>
              <span className="ml-auto font-bold">
                {couples.length} {couples.length === 1 ? 'casal' : 'casais'}
              </span>
            </div>

            <div className="flex gap-1 bg-wine-pale p-1 rounded-xl mb-5">
              {(['situacoes', 'votacoes'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                    tab === t ? 'bg-white text-wine font-medium shadow-sm' : 'text-muted hover:text-wine'
                  }`}
                >
                  {t === 'situacoes' ? 'Situações' : 'Votações'}
                </button>
              ))}
            </div>

            {tab === 'situacoes' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <button
                    onClick={() => changeSituation(-1)}
                    disabled={state.currentSit === 0}
                    className="w-10 h-10 rounded-full bg-wine-pale text-wine flex items-center justify-center disabled:opacity-30 hover:bg-pink-100 transition-colors cursor-pointer"
                  >
                    ←
                  </button>
                  <span className="text-sm text-muted font-medium">
                    Situação {state.currentSit + 1} de {situations.length}
                  </span>
                  <button
                    onClick={() => changeSituation(1)}
                    disabled={state.currentSit === situations.length - 1}
                    className="w-10 h-10 rounded-full bg-wine-pale text-wine flex items-center justify-center disabled:opacity-30 hover:bg-pink-100 transition-colors cursor-pointer"
                  >
                    →
                  </button>
                </div>

                <div className="bg-wine-pale rounded-xl p-5 mb-4 min-h-[100px]">
                  <span
                    className={`inline-block text-xs px-3 py-1 rounded-full font-medium mb-3 ${
                      state.phase === 'waiting'
                        ? 'bg-yellow-100 text-yellow-800'
                        : state.phase === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {state.phase === 'waiting'
                      ? 'Aguardando'
                      : state.phase === 'active'
                        ? 'Votação aberta'
                        : 'Resultados'}
                  </span>
                  <h3 className="font-display text-lg text-wine mb-2">{sit.title}</h3>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-prose">{sit.text}</p>
                </div>

                {state.phase === 'results' && sit.comment && (
                  <div
                    className="bg-white border border-wine/15 rounded-r-xl p-4 text-sm leading-relaxed text-prose italic mb-4 whitespace-pre-line"
                    style={{ borderLeft: '3px solid #C9933A' }}
                  >
                    {sit.comment}
                  </div>
                )}

                {state.phase === 'waiting' && (
                  <button
                    onClick={startVoting}
                    className="w-full mt-2 py-3.5 bg-wine text-white rounded-xl font-medium hover:bg-wine-light transition-colors cursor-pointer"
                  >
                    ▶ Iniciar Votação
                  </button>
                )}

                {state.phase === 'active' && (
                  <button
                    onClick={showResults}
                    className="w-full mt-2 py-3.5 bg-silence text-white rounded-xl font-medium hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    📊 Encerrar e Ver Resultados
                  </button>
                )}

                {state.phase === 'results' && (
                  <div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {VOTE_ROWS.map(row => (
                        <div key={row.key} className={`rounded-xl p-3 text-center border-2 ${row.ring}`}>
                          <span className="text-3xl block mb-1">{row.emoji}</span>
                          <div className="text-xs text-muted font-medium">{row.label}</div>
                          <div className={`font-display text-2xl mt-1 ${row.count}`}>{counts[row.key]}</div>
                          <div className="h-1.5 bg-wine/10 rounded-full mt-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${row.bar}`}
                              style={{ width: `${(counts[row.key] / total) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={resetVotes}
                      className="w-full py-2.5 bg-wine-pale text-wine rounded-xl text-sm font-medium hover:bg-pink-100 transition-colors cursor-pointer"
                    >
                      🔄 Nova rodada (limpar votos)
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === 'votacoes' && (
              <div>
                <p className="text-sm text-muted mb-4">Respostas individuais dos casais na situação atual.</p>
                {couples.length === 0 ? (
                  <div className="text-center text-muted text-sm py-8">Nenhum voto ainda.</div>
                ) : (
                  <div className="border border-wine/15 rounded-xl overflow-hidden">
                    {couples.map(c => {
                      const vote = votes[c.id]
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between px-4 py-3 border-b border-wine/10 last:border-0 hover:bg-wine-pale/50 transition-colors"
                        >
                          <span className="font-medium text-sm text-prose">{c.name}</span>
                          <span className="text-xs bg-wine-pale text-wine px-2 py-1 rounded-full">
                            {vote ? VOTE_LABELS[vote] : '—'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: QR + Lista */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-wine/15 rounded-2xl p-7">
              <h2 className="font-display text-xl text-wine mb-5">QR Code para Casais</h2>
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-3 rounded-xl border border-wine/15">
                  <QRCodeSVG value={casaisUrl} size={180} fgColor="#6B1E2E" level="M" />
                </div>
                <div className="w-full text-xs text-muted text-center bg-wine-pale px-4 py-2 rounded-lg break-all">
                  {casaisUrl}
                </div>
              </div>
              <button
                onClick={copyLink}
                className="w-full mt-4 py-2.5 bg-wine-pale text-wine rounded-xl text-sm font-medium hover:bg-pink-100 transition-colors cursor-pointer"
              >
                {copied ? '✓ Copiado!' : '📋 Copiar link'}
              </button>
            </div>

            <div className="bg-white border border-wine/15 rounded-2xl p-7">
              <h2 className="font-display text-xl text-wine mb-4">Casais Conectados</h2>
              <div className="max-h-72 overflow-y-auto border border-wine/15 rounded-xl">
                {couples.length === 0 ? (
                  <div className="text-center text-muted text-sm py-8 px-4 leading-loose">
                    Nenhum casal conectado ainda.<br />Compartilhe o QR Code!
                  </div>
                ) : (
                  couples.map(c => {
                    const vote = votes[c.id]
                    const emoji =
                      vote === 'fire' ? '🔥' : vote === 'silence' ? '😶' : vote === 'mature' ? '❤️' : ''
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between px-4 py-3 border-b border-wine/10 last:border-0 hover:bg-wine-pale/50 transition-colors"
                      >
                        <span className="font-medium text-sm text-prose">💑 {c.name}</span>
                        <span className="text-xs bg-wine-pale text-wine px-2 py-1 rounded-full">
                          {emoji || 'aguardando'}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
