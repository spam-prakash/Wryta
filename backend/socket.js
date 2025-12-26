const { Server } = require('socket.io')

let io
const onlineUsers = new Map()

const initSocket = (server) => {
  const allowedOrigins = [
    'https://wryta-frontend.vercel.app',
    'https://theprakash.xyz',
    'http://localhost:3006'
  ]

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: true,
      allowedHeaders: '*' // Accept all headers
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  })

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id)

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

const emitNotification = (userId, notification) => {
  const socketSet = onlineUsers.get(userId.toString())
  if (!socketSet || !io) return

  socketSet.forEach(socketId => {
    io.to(socketId).emit('new-notification', notification)
  })
}

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
