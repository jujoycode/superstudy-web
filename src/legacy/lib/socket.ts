import { useCallback } from 'react'
import io from 'socket.io-client'

const backUrl = process.env.REACT_APP_API_URL

// @ts-ignore
const sockets: { [key: string]: SocketIOClient.Socket } = {}

/**
 * useSocket
 * @desc ~
 * @author AIden
 * @deprecated 구현 잘못됨
 */
// @ts-ignore
export function useSocket(workspace?: string): [SocketIOClient.Socket | undefined, () => void] {
  console.log('rerender', workspace)
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect()
      delete sockets[workspace]
    }
  }, [workspace])
  if (!workspace) {
    return [undefined, disconnect]
  }
  if (!sockets[workspace]) {
    // @ts-ignore
    sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`, {
      transports: ['websocket', 'polling'],
    })
  }

  return [sockets[workspace], disconnect]
}
