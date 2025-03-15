import { useState, useEffect, useRef, useCallback } from 'react'

export default function useSocket(url) {
	const [isConnected, setIsConnected] = useState(false)
	const [lastMessage, setLastMessage] = useState(null)
	const [error, setError] = useState(null)
	const socketRef = useRef(null)

	const sendMessage = useCallback((data) => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			socketRef.current.send(JSON.stringify(data))
			return true
		}
		return false
	}, [])

	const connect = useCallback(() => {
		if (socketRef.current?.readyState === WebSocket.OPEN) return

		const socket = new WebSocket(url)
		socketRef.current = socket

		socket.onopen = () => {
			setIsConnected(true)
			setError(null)
		}

		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data)
				setLastMessage(data)
			} catch (err) {
				setLastMessage(event.data)
			}
		}

		socket.onerror = (err) => {
			setError('WebSocket error occurred')
			console.error('WebSocket error:', err)
		}

		socket.onclose = () => {
			setIsConnected(false)
			// Try to reconnect after 3 seconds
			setTimeout(() => connect(), 3000)
		}

		return () => {
			if (socket.readyState === WebSocket.OPEN) {
				socket.close()
			}
		}
	}, [url])

	useEffect(() => {
		connect()
		return () => {
			if (socketRef.current?.readyState === WebSocket.OPEN) {
				socketRef.current.close()
			}
		}
	}, [connect])

	return { isConnected, lastMessage, error, sendMessage }
}