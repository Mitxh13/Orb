import { useEffect, useState, useRef } from 'react'
import api from '../api/axios'
import jsQR from 'jsqr'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function QR() {
  const [qrImage, setQrImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/wallet/qr')
      .then((res) => setQrImage(res.data.data.qrCode))
      .catch(() => toast.error('Failed to load QR code'))
      .finally(() => setLoading(false))

    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        requestAnimationFrame(scanFrame)
      }
    } catch {
      toast.error('Camera access denied')
      setScanning(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code && code.data) {
        stopCamera()
        toast.success(`Scanned: ${code.data}`)
        // Navigate to send page with pre-filled wallet tag
        navigate('/send', { state: { walletTag: code.data } })
        return
      }
    }
    requestAnimationFrame(scanFrame)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">QR Code</h2>

      {/* My QR */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Your Wallet QR</h3>
        {loading ? (
          <p className="text-gray-400 py-10">Loading...</p>
        ) : qrImage ? (
          <img src={`data:image/png;base64,${qrImage}`} alt="Wallet QR Code"
            className="mx-auto w-64 h-64 border border-gray-100 rounded-lg" />
        ) : (
          <p className="text-gray-400 py-10">Failed to generate QR</p>
        )}
        <p className="text-xs text-gray-400 mt-3">Share this QR to receive payments</p>
      </div>

      {/* Scanner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Scan to Pay</h3>
        {!scanning ? (
          <button onClick={startCamera}
            className="px-6 py-2.5 bg-orb-600 text-white rounded-lg font-medium hover:bg-orb-700 transition-colors">
            Open Camera
          </button>
        ) : (
          <div className="space-y-3">
            <div className="relative mx-auto w-64 h-64 bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} className="w-full h-full object-cover" />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <button onClick={stopCamera}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Stop Camera
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
