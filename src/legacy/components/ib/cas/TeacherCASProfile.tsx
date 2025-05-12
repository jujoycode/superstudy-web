import SvgUser from 'src/assets/images/no_profile.png'
import { Typography } from '@/legacy/components/common/Typography'
import { Constants } from '@/legacy/constants'
import { ResponseIBPortfolioDto } from '@/legacy/generated/model'
import { makeStudNum5 } from '@/legacy/util/status'

interface TeacherCASProfileProps {
  data: ResponseIBPortfolioDto
}

function TeacherCASProfile({ data }: TeacherCASProfileProps) {
  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <Typography variant="title1">프로필</Typography>
        <div className="flex flex-row items-center">
          <Typography variant="body3" className="text-primary-gray-700">
            지도교사
          </Typography>
          <Typography variant="body3" className="text-primary-gray-400 mx-1">
            ·
          </Typography>
          <Typography variant="body3" className="text-primary-gray-700">
            {data.profile.mentor ? `${data.profile.mentor.name} 선생님` : '미지정'}
          </Typography>
        </div>
      </div>
      <div className="flex items-center gap-4 py-2 select-none">
        <div className="flex h-12 w-12 overflow-hidden rounded-xl">
          <img
            className="mx-auto h-12 w-12 rounded-xl"
            src={`${Constants.imageUrl}${data?.profile}`}
            alt=""
            loading="lazy"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null // prevents looping
              currentTarget.src = SvgUser
              currentTarget.className = 'w-full'
            }}
          />
        </div>
        <div className="flex h-12 flex-1 flex-col justify-between gap-1">
          <div className="flex items-center">
            <Typography variant="title3">
              {data.profile.user.name.length > 5 ? `${data.profile.user.name.slice(0, 5)}` : data.profile.user.name}
            </Typography>
            <span className="mx-1">·</span>
            <Typography variant="title3">
              {makeStudNum5({
                grade: data.profile.user.studentGroup.group.grade || 0,
                classNum: data.profile.user.studentGroup.group.klass || 0,
                studentNum: data.profile.user.studentGroup.studentNumber,
              })}
            </Typography>
          </div>
          {/* TODO : 서버에서 전달받은 코드 사용 */}
          {/* <Typography variant="caption2" className="font-medium text-primary-gray-500">
            응시코드 18472
          </Typography> */}
          <Typography variant="caption2" className="text-primary-gray-500 font-medium">
            응시코드 {data?.profile.ibCode || '-'}
          </Typography>
        </div>
      </div>
      <span>
        <div className="flex flex-col gap-4">
          {data.profile.casInfo?.map((qna) => {
            return (
              <div key={qna.question} className="flex flex-col gap-1">
                <Typography variant="body3" className="text-primary-gray-500">
                  {qna.question}
                </Typography>
                <Typography variant="body3" className="font-medium">
                  {qna.answer}
                </Typography>
              </div>
            )
          })}
        </div>
      </span>
    </>
  )
}

export default TeacherCASProfile
