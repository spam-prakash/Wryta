import { io } from 'socket.io-client'

const SOCKET_URL = process.env.REACT_APP_HOSTLINK || 'http://localhost:8000'

export const socket = io(SOCKET_URL, {
  autoConnect: false
})
