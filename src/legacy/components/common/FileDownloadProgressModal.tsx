import { ReactComponent as DownloadIcon } from '@/assets/svg/file-download.svg'
import { SuperModal } from '../SuperModal'
import AlertV2 from './AlertV2'
import { Typography } from './Typography'

interface FileDownloadProgressModalProps {
  percentage: number
  isDownloading: boolean
  isError: boolean
  onErrorConfirm: () => void
}

export default function FileDownloadProgressModal({
  percentage,
  isDownloading,
  isError,
  onErrorConfirm,
}: FileDownloadProgressModalProps) {
  return (
    <>
      <SuperModal modalOpen={isDownloading} hasClose={false} className="h-[166px] w-[416px] rounded-xl p-8">
        <div className="flex gap-4">
          <DownloadIcon />
          <div className="w-full">
            <div className="flex w-full justify-between">
              <Typography variant="title2" className="text-gray-900">
                파일 다운로드 중
              </Typography>
              <Typography variant="title2" className="text-primary-800">
                {percentage}%
              </Typography>
            </div>
            {/* 프로그레스 바 */}
            <div className="mt-2 mb-4 h-2 w-full rounded-2xl bg-gray-200">
              <div className="bg-primary-800 h-2 rounded-2xl" style={{ width: `${percentage}%` }} />
            </div>
            <Typography variant="body2" className="text-gray-700">
              전체 파일의 크기가 1.5GB 이상이면,
              <br />
              여러개의 압축파일로 분할 다운로드 됩니다.
            </Typography>
          </div>
        </div>
      </SuperModal>

      {isError && (
        <AlertV2
          message="다운로드 중 문제가 발생했습니다."
          description="'문의하기 채널톡'으로 문의해주세요."
          confirmText="확인"
          onConfirm={onErrorConfirm}
        />
      )}
    </>
  )
}
