import { useState, useEffect } from 'react'
import api from '../api/axios'
import { formatCurrency, formatDate } from '../utils/format'
import { motion } from 'framer-motion'
import { ArrowDownLeft, Send, Search, Filter } from 'lucide-react'

export default function History() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('ALL') // ALL, SENT, RECEIVED
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [filter])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/transactions?filter=${filter}&page=0&size=50`)
      setTransactions(res.data.data.content)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
          <p className="text-gray-500 text-sm mt-1">Track your recent transactions</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          {['ALL', 'SENT', 'RECEIVED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === f ? 'bg-white text-orb-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orb-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx, idx) => {
              const isSent = tx.direction === 'SENT'
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={tx.id}
                  className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-full ${isSent ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'}`}>
                      {isSent ? <Send className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {isSent ? `Transfer to ${tx.receiverWalletTag}` : `Received from ${tx.senderWalletTag}`}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(tx.createdAt)} • Ref: {tx.referenceId.slice(0,8)}</p>
                    </div>
                  </div>
                  <div className="sm:text-right ml-16 sm:ml-0">
                    <p className={`font-bold text-xl tracking-tight ${isSent ? 'text-gray-900' : 'text-green-600'}`}>
                      {isSent ? '-' : '+'}{formatCurrency(tx.amount)}
                    </p>
                    {tx.note && <p className="text-sm text-gray-500 italic mt-1">&quot;{tx.note}&quot;</p>}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
