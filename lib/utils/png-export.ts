// Exporta un canvas WebGL (o 2D) como PNG descargable.
// Usa `toBlob` para no cargar el DOM con dataURLs largos.

export async function exportCanvasPng(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas vacío o CORS bloqueado"))
          return
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        // Dar tiempo al navegador antes de revocar.
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        resolve()
      }, "image/png")
    } catch (err) {
      reject(err)
    }
  })
}
