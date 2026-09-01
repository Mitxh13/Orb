import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { formatCurrency, formatDate } from '../utils/format'
import { motion } from 'framer-motion'
import { Send, ArrowDownLeft, QrCode, CreditCard, ChevronRight, Activity } from 'lucide-react'

export default function Dashboard() {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/wallet/me'),
      api.get('/api/transactions?page=0&size=3')
    ])
    .then(([walletRes, txRes]) => {
      setWallet(walletRes.data.data)
      setTransactions(txRes.data.data.content)
    })
    .catch(() => {})
    .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orb-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Balance Card Section */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orb-50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orb-50 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-gray-500 font-medium mb-2">Available Balance</h2>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight"
          >
            {formatCurrency(wallet?.balance || 0)}
          </motion.div>
          <p className="text-orb-600 font-medium mt-3 bg-orb-50 inline-block px-3 py-1 rounded-full text-sm">
            {wallet?.walletTag}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-10 relative z-10">
          <Link to="/send" className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-full bg-orb-800 text-white flex items-center justify-center shadow-lg group-hover:bg-orb-700 group-hover:-translate-y-1 transition-all">
              <Send className="w-6 h-6 ml-1" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Send</span>
          </Link>
          <Link to="/history" className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-full bg-orb-100 text-orb-800 flex items-center justify-center group-hover:bg-orb-200 group-hover:-translate-y-1 transition-all">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Activity</span>
          </Link>
          <Link to="/qr" className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-full bg-orb-100 text-orb-800 flex items-center justify-center group-hover:bg-orb-200 group-hover:-translate-y-1 transition-all">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Scan</span>
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          <Link to="/history" className="text-orb-600 text-sm font-semibold hover:underline flex items-center">
            View all <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No recent transactions.</p>
            <p className="text-sm text-gray-400 mt-1">When you send or receive money, it will show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, idx) => {
              const isSent = tx.direction === 'SENT'
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={tx.id} 
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${isSent ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'}`}>
                      {isSent ? <Send className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">
                        {isSent ? `To ${tx.receiverWalletTag}` : `From ${tx.senderWalletTag}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className={`font-bold text-lg tracking-tight ${isSent ? 'text-gray-900' : 'text-green-600'}`}>
                    {isSent ? '-' : '+'}{formatCurrency(tx.amount)}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
