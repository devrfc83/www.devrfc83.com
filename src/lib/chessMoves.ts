export type MovePair = {
  number: number
  white: string
  black?: string
}

export function historyToMovePairs(history: string[]): MovePair[] {
  const pairs: MovePair[] = []
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
    })
  }
  return pairs
}
