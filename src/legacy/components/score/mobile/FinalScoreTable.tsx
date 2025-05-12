import { Typography } from '@/legacy/components/common/Typography'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'

export function FinalScoreTable({ scores }: any) {
  const simpleScores = scores.filter((score: any) => !('percentage' in score))
  const detailedScores = scores.filter((score: any) => 'percentage' in score)

  return (
    <div className="flex flex-col pt-2">
      <span className="flex flex-row items-center gap-1">
        <SolidSVGIcon.Info color="gray400" size={16} />
        <Typography variant="caption" className="text-primary-gray-500">
          과목군별 점수는 단위수 가중치를 적용한 것입니다
        </Typography>
      </span>

      <div className="w-full pt-4">
        <table className="table-auto border-collapse">
          <thead className="border-b-primary-gray-200 text-15 text-primary-gray-600 border-b text-center font-normal">
            <tr>
              <td className="bg-primary-gray-50 min-w-[129px] px-2 py-[9px]">과목(단위수)</td>
              <td className="bg-primary-gray-50 min-w-[44px] border-x border-b border-gray-200 px-2 py-[9px]">점수</td>
              <td className="bg-primary-gray-50 border-x border-b border-gray-200 px-2 py-[9px]">석차</td>
              <td className="bg-primary-gray-50 min-w-[44px] border-x border-b border-gray-200 px-2 py-[9px]">백분</td>
              <td className="bg-primary-gray-50 min-w-[44px] border-b border-l border-gray-200 px-2 py-[9px]">등급</td>
            </tr>
          </thead>
          <tbody className="text-15 text-primary-gray-900 text-center">
            {simpleScores.map((score: any, index: number) => (
              <tr key={score.subject}>
                <td
                  className={`border-r border-b border-r-gray-100 px-2 py-[11px] font-medium ${
                    index === simpleScores.length - 1 ? 'border-b-primary-gray-200' : 'border-b-primary-gray-100'
                  }`}
                >
                  {score.subject}
                </td>
                <td
                  className={`border-primary-gray-100 w-[44px] border px-2 py-[11px] font-medium ${
                    index === simpleScores.length - 1 ? 'border-b-primary-gray-200' : 'border-b-primary-gray-100'
                  }`}
                >
                  {score.score || '-'}
                </td>
                <td
                  className={`border-primary-gray-100 w-full border px-2 py-[11px] font-medium ${
                    index === simpleScores.length - 1 ? 'border-b-primary-gray-200' : 'border-b-primary-gray-100'
                  }`}
                >
                  {score.position || '-'}
                </td>
                <td
                  className={`border-primary-gray-100 w-[40px] border px-2 py-[11px] font-medium ${
                    index === simpleScores.length - 1 ? 'border-b-primary-gray-200' : 'border-b-primary-gray-100'
                  }`}
                >
                  {score.percentage || '-'}
                </td>
                <td
                  className={`border-primary-gray-100 w-[40px] border-b border-l px-2 py-[11px] font-medium ${
                    index === simpleScores.length - 1 ? 'border-b-primary-gray-200' : 'border-b-primary-gray-100'
                  }`}
                >
                  {score.rank || '-'}
                </td>
              </tr>
            ))}
            {detailedScores.map((score: any) => (
              <tr key={score.subject}>
                <td className="border-b-primary-gray-100 border-r border-b border-r-gray-100 px-2 py-[11px]">
                  {score.subject}
                </td>
                <td className="border-primary-gray-100 w-[44px] border px-2 py-[11px]">{score.score || '-'}</td>
                <td className="border-primary-gray-100 w-full border px-2 py-[11px]">
                  {score.position || '-'}({score.num_same_score || '-'})/{score.total_enrolled_student_num || '-'}
                </td>
                <td className="border-primary-gray-100 w-[40px] border px-2 py-[11px]">{score.percentage || '-'}</td>
                <td className="border-primary-gray-100 w-[40px] border-b border-l px-2 py-[11px]">
                  {score.rank || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
