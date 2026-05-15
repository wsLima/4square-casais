import type { Situation } from '../types'

export const situations: Situation[] = [
  {
    title: 'Situação 1',
    text: 'Seu cônjuge esqueceu uma data importante.\n(Pausa)\nE aí… qual seria sua reação?',
    comment: '💬 O problema é que muitos casais entram em uma discussão querendo vencer, e não resolver. Quando, na verdade, deveriam conversar com o objetivo de encontrar uma solução e restaurar a paz.',
  },
  {
    title: 'Situação 2',
    text: 'Seu cônjuge respondeu de forma atravessada depois de um dia difícil.',
    comment: '💡 Maturidade emocional é entender que nem toda resposta difícil significa falta de amor… às vezes significa apenas cansaço, pressão, ou um coração sobrecarregado.',
  },
  {
    title: 'Situação 3',
    text: 'Uma discussão antiga voltou à tona… mais uma vez.',
    comment: '📖 "O amor não guarda rancor." (1 Coríntios 13:5)\nCasamentos saudáveis não são aqueles sem conflitos… mas aqueles em que existe disposição para conversar e coração aberto para perdoar.',
  },
  {
    title: 'Situação 4',
    text: 'Seu cônjuge fala:\n"Amor… precisamos economizar esse mês."\nE no outro dia aparece com uma sacola nova.',
    comment: '💰 Finanças é um dos temas que mais geram conflito no casamento — não por causa do dinheiro em si, mas pela falta de alinhamento. Quando dois se tornam um, a conversa sobre prioridades precisa ser contínua, honesta e sem julgamento.',
    reactions: {
      fire: '"Ahhh, então o problema era só EU gastar, né?"',
      silence: 'Sorri por fora…\nmas por dentro já abriu o aplicativo do banco.',
      mature: '"Vamos alinhar juntos nossas prioridades?"',
    },
  },
  {
    title: 'Situação 5',
    text: 'Você está contando algo importante…\ne percebe que o cônjuge não ouviu absolutamente nada.\n\nPorque estava olhando o celular.',
    comment: '📱 Você pode estar sentado ao lado de alguém e estar completamente ausente. A atenção é uma forma de amor. Quando o cônjuge fala, ele não está apenas compartilhando palavras — está dizendo: "você importa pra mim."',
    reactions: {
      fire: '"Claro… esse celular é mais importante!"',
      silence: '"Deixa pra lá…"',
      mature: '"Amor, isso era importante pra mim… você pode me ouvir agora?"',
    },
  },
  {
    title: 'Situação 6 — A mais temida',
    text: 'Seu cônjuge olha pra você com uma expressão séria e fala:\n"Precisamos conversar…"\n',
    optionOverrides: {
      fire: { emoji: '🧊', name: 'Coração gelado' },
      silence: { emoji: '😰', name: 'Frio na barriga' },
      mature: { emoji: '🔥', name: 'Calor no corpo todo' },
    },
    reactions: {
      fire: 'A pessoa tenta manter a postura de calma e controle…\nmas por dentro já começou a revisar mentalmente todos os acontecimentos da semana.',
      silence: 'Bate aquele nervosismo imediato.\nA mente começa a criar teorias,\nlembrar conversas antigas,\ne procurar onde possivelmente errou.',
      mature: 'A pressão sobe na hora.\nA pessoa já entra em modo de alerta máximo,\nfica inquieta,\ne sente o corpo inteiro reagindo ao suspense da conversa.',
    },
  },
]
