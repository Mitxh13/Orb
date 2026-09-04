import { useState, useEffect } from 'react'
import api from '../api/axios'
import { formatCurrency, formatDate } from '../utils/format'
import { motion } from 'framer-motion'
import { ArrowDownLeft, Send, Clock } from 'lucide-react'

export default function History() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchHistory()
  }, [filter, page])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/transactions?filter=${filter}&page=${page}&size=15`)
      setTransactions(res.data.data?.content || [])
      setTotalPages(res.data.data?.totalPages || 1)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const filters = ['ALL', 'SENT', 'RECEIVED']

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
      {/* Header + Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Activity</h1>

        {/* Filter tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0) }}
              className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filter === f ? 'bg-white text-orb-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'ALL' ? 'All' : f === 'SENT' ? 'Sent' : 'Received'}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orb-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx, idx) => {
              const isSent = tx.direction === 'SENT'
              return (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={tx.id}
                  className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSent ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {isSent ? <Send className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {isSent ? `To ${tx.receiverWalletTag}` : `From ${tx.senderWalletTag}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {formatDate(tx.createdAt)} {tx.referenceId && `• ${tx.referenceId.slice(0, 8)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className={`text-sm font-bold ${isSent ? 'text-gray-900' : 'text-green-600'}`}>
                      {isSent ? '-' : '+'}{formatCurrency(tx.amount)}
                    </p>
                    {tx.note && <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[120px]">{tx.note}</p>}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="text-sm font-medium text-orb-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:underline">
              Previous
            </button>
            <span className="text-xs text-gray-400">{page + 1} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="text-sm font-medium text-orb-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:underline">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
