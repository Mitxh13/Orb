import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Send as SendIcon, CheckCircle2, ArrowRight, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react'
import { formatCurrency } from '../utils/format'

export default function Send() {
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    receiverWalletTag: searchParams.get('to') || '',
    amount: '',
    note: '',
    pin: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleNext = (e) => {
    e.preventDefault()
    if (!formData.receiverWalletTag || !formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid recipient and amount')
      return
    }
    setStep(2)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (formData.pin.length !== 4) {
      toast.error('PIN must be 4 digits')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/transactions/send', {
        receiverWalletTag: formData.receiverWalletTag,
        amount: parseFloat(formData.amount),
        pin: formData.pin,
        note: formData.note
      })
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed')
      setFormData(prev => ({ ...prev, pin: '' }))
    } finally {
      setLoading(false)
    }
  }

  const pageVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  }

  return (
    <div className="max-w-lg mx-auto">
      <AnimatePresence mode="wait">

        {/* === STEP 1: DETAILS === */}
        {step === 1 && (
          <motion.div key="step1" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <div className="gradient-blue p-5 sm:p-6 text-white">
              <div className="flex items-center gap-3 mb-1">
                <SendIcon className="w-5 h-5" />
                <h2 className="text-lg font-bold">Send Money</h2>
              </div>
              <p className="text-sm text-white/60">Fast and secure transfers.</p>
            </div>

            <form onSubmit={handleNext} className="p-5 sm:p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Recipient</label>
                <input
                  type="text"
                  placeholder="@username or wallet tag"
                  value={formData.receiverWalletTag}
                  onChange={(e) => setFormData({ ...formData, receiverWalletTag: e.target.value })}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orb-500 focus:border-transparent font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full text-2xl font-bold pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orb-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  placeholder="What's this for?"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orb-500 focus:border-transparent"
                />
              </div>

              <button type="submit"
                className="w-full py-3.5 bg-orb-800 text-white rounded-xl font-semibold text-sm hover:bg-orb-700 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}

        {/* === STEP 2: PIN CONFIRMATION === */}
        {step === 2 && (
          <motion.div key="step2" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-5 sm:p-6 text-center">
              <ShieldCheck className="w-12 h-12 text-orb-600 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Confirm Transfer</h2>

              {/* Summary card */}
              <div className="bg-gray-50 rounded-xl p-4 mt-4 mb-5 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">To</span>
                  <span className="font-semibold text-gray-900">{formData.receiverWalletTag}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-gray-900 text-lg">{formatCurrency(formData.amount)}</span>
                </div>
                {formData.note && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Note</span>
                    <span className="text-gray-700 italic">{formData.note}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSend} className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Enter your 4-digit PIN</p>
                  <input
                    type="password"
                    maxLength="4"
                    inputMode="numeric"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-32 mx-auto block text-center text-2xl tracking-[0.5em] font-bold py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orb-500 focus:border-orb-500 bg-gray-50"
                    required autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setStep(1); setFormData(prev => ({ ...prev, pin: '' })) }}
                    disabled={loading}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button type="submit" disabled={loading || formData.pin.length !== 4}
                    className="flex-1 py-3.5 bg-orb-800 text-white rounded-xl font-semibold text-sm hover:bg-orb-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Now'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* === STEP 3: SUCCESS ANIMATION === */}
        {step === 3 && (
          <motion.div key="step3" variants={pageVariants} initial="enter" animate="center"
            className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 250, damping: 20 }}
              className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5 success-pulse"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>

            <motion.h2 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
              className="text-xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </motion.h2>

            <motion.p initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
              className="text-gray-500 text-sm mb-6">
              You sent <span className="font-bold text-gray-900">{formatCurrency(formData.amount)}</span> to <span className="font-bold text-gray-900">{formData.receiverWalletTag}</span>
            </motion.p>

            <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
              className="space-y-3">
              <button onClick={() => { setStep(1); setFormData({ receiverWalletTag: '', amount: '', note: '', pin: '' }) }}
                className="w-full py-3.5 bg-orb-800 text-white rounded-xl font-semibold text-sm hover:bg-orb-700 transition-colors active:scale-[0.98]">
                Send Again
              </button>
              <button onClick={() => navigate('/dashboard')}
                className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors active:scale-[0.98]">
                Back to Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
