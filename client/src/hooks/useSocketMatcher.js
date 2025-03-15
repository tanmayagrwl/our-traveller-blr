'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export default function useSocket(url) {
	const [isConnected, setIsConnected] = useState(false)
	const [lastMessage, setLastMessage] = useState(null)
	const socketRef = useRef(null)
	const messagesQueue = useRef([])
	const reconnectTimeoutRef = useRef(null)

	// Function to send message through the socket
	const sendMessage = useCallback(
		(message) => {
			if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
				// Queue the message if socket is not open
				messagesQueue.current.push(message)
				return false
			}

			try {
				socketRef.current.send(JSON.stringify(message))
				return true
			} catch (error) {
				console.error('Error sending message:', error)
				return false
			}
		},
		[]
	)

	// Process any queued messages
	const processQueue = useCallback(() => {
		if (messagesQueue.current.length > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
			messagesQueue.current.forEach((message) => {
				try {
					socketRef.current.send(JSON.stringify(message))
				} catch (error) {
					console.error('Error sending queued message:', error)
				}
			})
			// Clear the queue after sending
			messagesQueue.current = []
		}
	}, [])

	// Setup WebSocket connection
	useEffect(() => {
		// Don't try to connect if no URL is provided
		if (!url) return

		const setupSocket = () => {
			// Clear any existing reconnect timeouts
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
			}

			// Create new WebSocket connection
			const socket = new WebSocket(url)

			// Connection opened
			socket.onopen = () => {
				console.log('WebSocket connected')
				setIsConnected(true)
				processQueue() // Process any queued messages
			}

			// Connection closed
			socket.onclose = (event) => {
				console.log('WebSocket disconnected:', event.code, event.reason)
				setIsConnected(false)

				// Setup reconnection after delay
				reconnectTimeoutRef.current = setTimeout(() => {
					console.log('Attempting to reconnect...')
					setupSocket()
				}, 3000) // Reconnect after 3 seconds
			}

			// Connection error
			socket.onerror = (error) => {
				console.error('WebSocket error:', error)
			}

			// Listen for messages
			socket.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data)
					setLastMessage(data)
				} catch (error) {
					console.error('Error parsing message:', error)
				}
			}

			// Store socket reference
			socketRef.current = socket

			// Cleanup function
			return () => {
				socket.close()
				if (reconnectTimeoutRef.current) {
					clearTimeout(reconnectTimeoutRef.current)
				}
			}
		}

		// Initial socket setup
		setupSocket()

		// Cleanup on unmount
		return () => {
			if (socketRef.current) {
				socketRef.current.close()
			}
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
			}
		}
	}, [url, processQueue])

	return {
		isConnected,
		lastMessage,
		sendMessage
	}
}