export async function downloadBoardPng(element: HTMLElement, filename: string) {
  const { toPng } = await import('html-to-image')
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    cacheBust: true,
  })

  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = filename
  anchor.click()
}
