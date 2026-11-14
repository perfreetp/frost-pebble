import { useEffect, useRef } from 'react'

/** 旋转曲面实时预览:渲染在 Worker 里的 OffscreenCanvas 上 */
export default function Preview3D({ samples, layers, patternId }) {
  const canvasRef = useRef(null)
  const workerRef = useRef(null)
  const transferredRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const worker = new Worker(new URL('../previewWorker.js', import.meta.url), { type: 'module' })
    workerRef.current = worker
    const rect = canvas.getBoundingClientRect()
    const off = canvas.transferControlToOffscreen()
    worker.postMessage(
      { type: 'init', canvas: off, dpr: Math.min(2, devicePixelRatio || 1), width: rect.width || 360, height: rect.height || 360 },
      [off],
    )
    transferredRef.current = true
    const ro = new ResizeObserver(() => {
      const r = canvas.getBoundingClientRect()
      worker.postMessage({ type: 'resize', width: r.width, height: r.height })
    })
    ro.observe(canvas)
    return () => { ro.disconnect(); worker.terminate() }
  }, [])

  useEffect(() => {
    if (!workerRef.current || !samples.length) return
    workerRef.current.postMessage({ type: 'params', samples, layers, patternId })
  }, [samples, layers, patternId])

  return <canvas ref={canvasRef} className="preview3d" />
}
