export function convertToWebp(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          blob ? resolve(blob) : reject(new Error('WebP conversion failed'))
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => reject(new Error('Could not read image'))
    img.src = url
  })
}