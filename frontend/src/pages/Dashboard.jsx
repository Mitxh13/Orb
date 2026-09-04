import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { formatCurrency, formatDate } from '../utils/format'
import { motion } from 'framer-motion'
import { Send, ArrowDownLeft, QrCode, Clock, ChevronRight, Wallet, Eye, EyeOff } from 'lucide-react'

export default function Dashboard() {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [balanceHidden, setBalanceHidden] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/api/wallet/me'),
      api.get('/api/transactions?page=0&size=5')
    ])
    .then(([walletRes, txRes]) => {
      setWallet(walletRes.data.data)
      setTransactions(txRes.data.data?.content || [])
    })
    .catch(() => {})
    .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orb-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      {/* === Balance Card (Gradient header like UPI apps) === */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-blue rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-white/5"></div>
        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-white/5"></div>

        <div className="relative z-10">
          {/* Wallet tag */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/70 font-medium">{wallet?.walletTag}</span>
            </div>
            <button onClick={() => setBalanceHidden(!balanceHidden)} className="text-white/60 hover:text-white/90 p-1 transition-colors">
              {balanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Balance */}
          <div className="mb-1">
            <p className="text-xs text-white/50 uppercase tracking-wider font-medium mb-1">Available Balance</p>
            <motion.p
              key={balanceHidden ? 'hidden' : 'visible'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            >
              {balanceHidden ? '₹ ••••••' : formatCurrency(wallet?.balance || 0)}
            </motion.p>
          </div>
        </div>

        {/* Quick action buttons inside the card */}
        <div className="flex gap-3 mt-6 relative z-10">
          <Link to="/send" className="flex-1 bg-white/15 hover:bg-white/25 rounded-xl py-3 flex flex-col items-center gap-1.5 transition-colors active:scale-95">
            <Send className="w-5 h-5" />
            <span className="text-xs font-semibold">Send</span>
          </Link>
          <Link to="/qr" className="flex-1 bg-white/15 hover:bg-white/25 rounded-xl py-3 flex flex-col items-center gap-1.5 transition-colors active:scale-95">
            <QrCode className="w-5 h-5" />
            <span className="text-xs font-semibold">Scan & Pay</span>
          </Link>
          <Link to="/history" className="flex-1 bg-white/15 hover:bg-white/25 rounded-xl py-3 flex flex-col items-center gap-1.5 transition-colors active:scale-95">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-semibold">History</span>
          </Link>
        </div>
      </motion.section>

      {/* === Recent Activity === */}
      <section className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100">
        <div className="flex justify-between items-center p-4 sm:p-6 pb-0 sm:pb-0">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Recent Activity</h3>
          <Link to="/history" className="text-orb-600 text-xs sm:text-sm font-semibold flex items-center hover:underline">
            See all <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No transactions yet</p>
            <p className="text-xs text-gray-400 mt-1">Send or receive money to see your activity here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx, idx) => {
              const isSent = tx.direction === 'SENT'
              return (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  key={tx.id}
                  className="flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSent ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {isSent ? <Send className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {isSent ? tx.receiverWalletTag : tx.senderWalletTag}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold flex-shrink-0 ml-3 ${isSent ? 'text-gray-900' : 'text-green-600'}`}>
                    {isSent ? '-' : '+'}{formatCurrency(tx.amount)}
                  </p>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
