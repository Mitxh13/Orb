import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Send as SendIcon, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react'
import { formatCurrency } from '../utils/format'

export default function Send() {
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1) // 1: Details, 2: PIN, 3: Success
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
    if (!formData.receiverWalletTag || !formData.amount) {
      toast.error('Please fill all required fields')
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
      setStep(3) // Show success animation
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed')
      setStep(1) // Reset to details on failure
      setFormData(prev => ({ ...prev, pin: '' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: TRANSFER DETAILS */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orb-50 text-orb-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <SendIcon className="w-8 h-8 ml-1" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Send Money</h2>
              <p className="text-gray-500 text-sm mt-1">Fast and secure transfers.</p>
            </div>

            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">To who?</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={formData.receiverWalletTag}
                  onChange={(e) => setFormData({ ...formData, receiverWalletTag: e.target.value })}
                  className="w-full text-lg px-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orb-500 focus:border-transparent transition-all placeholder-gray-400 font-medium text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (ORB)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full text-3xl font-bold px-10 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orb-500 focus:border-transparent transition-all placeholder-gray-300 text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">What's this for? <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  placeholder="Dinner, rent, etc."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orb-500 focus:border-transparent transition-all placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-orb-800 text-white rounded-2xl font-bold text-lg hover:bg-orb-700 transition-colors flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 2: SECURE PIN */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 text-center"
          >
            <ShieldCheck className="w-16 h-16 text-orb-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Transfer</h2>
            <p className="text-gray-500 mb-6">You are sending <span className="font-bold text-gray-900">{formatCurrency(formData.amount)}</span> to <span className="font-bold text-gray-900">{formData.receiverWalletTag}</span></p>

            <form onSubmit={handleSend} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Enter your 4-digit PIN</label>
                <div className="flex justify-center">
                  <input
                    type="password"
                    maxLength="4"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-40 text-center text-3xl tracking-[1em] pl-[1em] font-bold px-4 py-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orb-500 focus:border-orb-500 transition-all bg-gray-50"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.pin.length !== 4}
                  className="flex-1 py-4 bg-orb-600 text-white rounded-2xl font-bold hover:bg-orb-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : 'Send Now'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 3: SUCCESS ANIMATION */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center overflow-hidden relative"
          >
            {/* Payment Animation CSS in tailwind */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>
            
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              Money Sent!
            </motion.h2>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 mb-8"
            >
              You've successfully sent <span className="font-bold text-gray-900">{formatCurrency(formData.amount)}</span> to {formData.receiverWalletTag}
            </motion.p>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
