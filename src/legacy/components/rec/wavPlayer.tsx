import React, { useEffect, useRef } from 'react'

interface WAVPlayerProps {
  initialUrl?: string
}

const WAVPlayer: React.FC<WAVPlayerProps> = ({ initialUrl = '' }) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (initialUrl) {
      if (audioRef.current) {
        audioRef.current.src = initialUrl
      }
    }
  }, [initialUrl])

  return (
    <div>
      <audio ref={audioRef} controls className="h-7"></audio>
    </div>
  )
}

export default WAVPlayer
