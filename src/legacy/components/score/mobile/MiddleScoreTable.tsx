export function MiddleScoreTable({ scores }: any) {
  const simpleScores = scores?.filter((score: any) => !('percentage' in score))
  const detailedScores = scores?.filter((score: any) => 'percentage' in score)

  return (
    <div className="flex flex-col pt-4">
      <div className="w-full">
        <table className="table-auto border-collapse">
          <thead className="text-15 border-b border-b-gray-200 text-center font-normal text-gray-600">
            <tr>
              <td className="min-w-[129px] bg-gray-50 px-2 py-[9px]">과목(단위수)</td>
              <td className="min-w-[44px] border-x border-b border-gray-200 bg-gray-50 px-2 py-[9px]">점수</td>
              <td className="border-x border-b border-gray-200 bg-gray-50 px-2 py-[9px]">석차</td>
              <td className="min-w-[44px] border-x border-b border-gray-200 bg-gray-50 px-2 py-[9px]">백분</td>
              <td className="min-w-[44px] border-b border-l border-gray-200 bg-gray-50 px-2 py-[9px]">등급</td>
            </tr>
          </thead>
          <tbody className="text-15 text-center text-gray-900">
            {simpleScores.map((score: any, index: number) => (
              <tr key={score.subject}>
                <td
                  className={`border-r border-b border-r-gray-100 px-2 py-[11px] font-medium ${
                    index === simpleScores.length - 1 ? 'border-b-gray-200' : 'border-b-gray-100'
                  }`}
                >
                  {score.subject}
                </td>
                <td
                  className={`w-[44px] border border-gray-100 px-2 py-[11px] font-medium ${
                    index === simpleScores.length - 1 ? 'border-b-gray-200' : 'border-b-gray-100'
                  }`}
                >
                  {score.score || '-'}
                </td>
                <td
                  className={`w-full border border-gray-100 px-2 py-[11px] font-medium ${
                    index === simpleScores.length - 1 ? 'border-b-gray-200' : 'border-b-gray-100'
                  }`}
                >
                  {score.position || '-'}
                </td>
                <td
                  className={`w-[40px] border border-gray-100 px-2 py-[11px] font-medium ${
                    index === simpleScores.length - 1 ? 'border-b-gray-200' : 'border-b-gray-100'
                  }`}
                >
                  {score.percentage || '-'}
                </td>
                <td
                  className={`w-[40px] border-b border-l border-gray-100 px-2 py-[11px] font-medium ${
                    index === simpleScores.length - 1 ? 'border-b-gray-200' : 'border-b-gray-100'
                  }`}
                >
                  {score.rank || '-'}
                </td>
              </tr>
            ))}
            {detailedScores.map((score: any) => (
              <tr key={score.subject}>
                <td className="border-r border-b border-r-gray-100 border-b-gray-100 px-2 py-[11px]">
                  {score.subject}
                </td>
                <td className="w-[44px] border border-gray-100 px-2 py-[11px]">{score.score || '-'}</td>
                <td className="w-full border border-gray-100 px-2 py-[11px]">
                  {score.position || '-'}({score.num_same_score || '-'})/{score.total_enrolled_student_num || '-'}
                </td>
                <td className="w-[40px] border border-gray-100 px-2 py-[11px]">{score.percentage || '-'}</td>
                <td className="w-[40px] border-b border-l border-gray-100 px-2 py-[11px]">{score.rank || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
