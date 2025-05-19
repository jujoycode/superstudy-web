import { useState } from 'react'

interface YoutubeLinkProps {
  ContentTitle: string
  videoId: string
}

export function YoutubeLink({ ContentTitle, videoId }: YoutubeLinkProps) {
  const apiKey = import.meta.env.VITE_API_URL

  const [videoTitel, setVideoTitel] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const fetchYoutubeData = async () => {
    try {
      // 첫 번째 API 호출
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`,
      )
      const videoData = await videoResponse.json()
      const videoInfo = videoData.items[0].snippet
      const title = videoInfo.title
      const thumbnailUrl = videoInfo.thumbnails.medium.url
      const channelId = videoInfo.channelId

      setVideoTitel(title)
      setVideoUrl(thumbnailUrl)

      // 두 번째 API 호출
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`,
      )
      const channelData = await channelResponse.json()
      const profileImage = channelData.items[0].snippet.thumbnails.high.url
      setProfileImage(profileImage)
    } catch (error) {
      console.error('에러 발생:', error)
    }
  }

  // 함수 호출
  fetchYoutubeData()

  return (
    <a href={`https://youtu.be/${videoId}`} target="blank">
      <div className="mx-4 flex">
        <div className="w-[40%]">
          <img src={videoUrl} className="w-full rounded-lg" />
        </div>
        <div className="ml-3 w-[60%]">
          <div className="font-bold">{ContentTitle}</div>
          <div className="mt-1 text-sm">{videoTitel}</div>
          <div className="mt-1 flex items-center gap-1">
            <img className="w-7" src={profileImage} />
            <div className="text-sm text-gray-600">슈퍼스쿨 슈퍼스터디</div>
          </div>
        </div>
      </div>
    </a>
  )
}
