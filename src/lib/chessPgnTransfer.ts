const STORAGE_KEY = 'chess-pgn-for-analysis'

export function storePgnForAnalysis(pgn: string) {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, pgn)
}

/** Lee el PGN pendiente y lo elimina del almacenamiento (solo se consume una vez). */
export function consumePgnForAnalysis(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  const pgn = sessionStorage.getItem(STORAGE_KEY)
  if (pgn) sessionStorage.removeItem(STORAGE_KEY)
  return pgn
}
