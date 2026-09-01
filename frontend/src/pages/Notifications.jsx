import { useEffect, useState } from 'react'
import api from '../api/axios'
import { formatDate } from '../utils/format'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications', { params: { page: 0, size: 50 } })
      setNotifications(res.data.data.content || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {}
  }

  const markRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
    } catch {}
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Notifications {unreadCount > 0 && <span className="text-sm font-normal text-gray-400">({unreadCount} unread)</span>}
        </h2>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-orb-600 hover:underline">Mark all as read</button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-10">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-400 text-center py-10">No notifications yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {notifications.map((n) => (
            <div key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`p-4 cursor-pointer transition-colors ${!n.isRead ? 'bg-orb-50/50' : 'hover:bg-gray-50'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-orb-500 flex-shrink-0" />}
                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-800' : 'font-medium text-gray-600'}`}>
                      {n.title}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-4">{n.message}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{formatDate(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
