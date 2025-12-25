const { Server } = require('socket.io')

let io

// userId -> Set of socketIds (supports multiple tabs/devices)
const onlineUsers = new Map()

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3006',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id)

    /**
     * Client emits:
     * socket.emit('register', userId)
     */
    socket.on('register', (userId) => {
      if (!userId) return

      const uid = userId.toString()

      if (!onlineUsers.has(uid)) {
        onlineUsers.set(uid, new Set())
      }

      onlineUsers.get(uid).add(socket.id)
      console.log(`✅ User ${uid} registered with socket ${socket.id}`)
    })

    socket.on('disconnect', () => {
      for (const [userId, socketSet] of onlineUsers.entries()) {
        if (socketSet.has(socket.id)) {
          socketSet.delete(socket.id)

          if (socketSet.size === 0) {
            onlineUsers.delete(userId)
          }

          console.log(`❌ Socket ${socket.id} disconnected for user ${userId}`)
          break
        }
      }
    })
  })
}

/**
 * 🔔 Emit notification to a specific user
 */
const emitNotification = (userId, notification) => {
  const socketSet = onlineUsers.get(userId.toString())
  if (!socketSet || !io) return

  socketSet.forEach(socketId => {
    io.to(socketId).emit('new-notification', notification)
  })
}

/**
 * Optional helpers
 */
const isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString())
}

module.exports = {
  initSocket,
  getIO: () => io,
  onlineUsers,
  emitNotification,
  isUserOnline
}
