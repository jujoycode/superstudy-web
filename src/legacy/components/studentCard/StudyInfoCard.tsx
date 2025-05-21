import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Time } from '@/legacy/components/common/Time'
import { useStudentPropertyUpdate } from '@/legacy/container/student-property-update'

interface StudyInfoCard {
  studentId?: number
  isCard: boolean
  isForbidden?: boolean
}

export function StudyInfoCard({ studentId, isCard, isForbidden }: StudyInfoCard) {
  const {
    isEditMode,
    setIsEditMode,
    resolution,
    setResolution,
    hopeUnivMajor,
    setHopeUnivMajor,
    admission,
    setAdmission,
    joinGroup,
    setJoinGroup,
    schoolOrigin,
    setSchoolOrigin,
    extraCurricular,
    setExtraCurricular,
    selfStudy,
    setSelfStudy,
    motto,
    setMotto,
    hopeCareerPath,
    setHopeCareerPath,
    updateStudentProperty,
    refetch,
    lastUpdateAt,
  } = useStudentPropertyUpdate({
    studentId: studentId || 0,
  })

  const handleUpdate = () => {
    updateStudentProperty(
      JSON.stringify(resolution),
      JSON.stringify(hopeUnivMajor),
      JSON.stringify(admission),
      JSON.stringify(joinGroup),
      JSON.stringify(schoolOrigin),
      JSON.stringify(extraCurricular),
      JSON.stringify(selfStudy),
      motto,
      hopeCareerPath,
    )
  }

  const setValues = (type: string, row: string, col: string, value: string) => {
    if (type === 'resolution') {
      const tmp = JSON.parse(JSON.stringify(resolution))
      if (tmp?.[row] === undefined) {
        tmp[row] = { 항목: '', 목표: '', 기한: '' }
      }
      tmp[row][col] = value
      setResolution(tmp)
    } else if (type === 'hopeUnivMajor') {
      const tmpHopeUnivMajor = JSON.parse(JSON.stringify(hopeUnivMajor))
      if (tmpHopeUnivMajor?.[row] === undefined) {
        tmpHopeUnivMajor[row] = { univ: '', major: '' }
      }
      tmpHopeUnivMajor[row][col] = value
      setHopeUnivMajor(tmpHopeUnivMajor)
    } else if (type === 'admission') {
      const tmp = JSON.parse(JSON.stringify(admission))
      if (tmp?.[row] === undefined) {
        tmp[row] = { 입시전형: '', 비고: '' }
      }
      tmp[row][col] = value
      setAdmission(tmp)
    } else if (type === 'joinGroup') {
      const tmp = JSON.parse(JSON.stringify(joinGroup))
      if (tmp?.[row] === undefined) {
        tmp[row] = { 활동구분: '', 활동명: '', 비고: '' }
      }
      tmp[row][col] = value
      setJoinGroup(tmp)
    } else if (type === 'schoolOrigin') {
      const tmp = JSON.parse(JSON.stringify(schoolOrigin))
      if (tmp?.[row] === undefined) {
        tmp[row] = { 학교명: '', 비고: '' }
      }
      tmp[row][col] = value
      setSchoolOrigin(tmp)
    } else if (type === 'extraCurricular') {
      const tmp = JSON.parse(JSON.stringify(extraCurricular))
      if (tmp?.[row] === undefined) {
        tmp[row] = { 과목: '', 장소: '', 요일: '', 비고: '' }
      }
      tmp[row][col] = value
      setExtraCurricular(tmp)
    } else if (type === 'selfStudy') {
      const tmp = JSON.parse(JSON.stringify(selfStudy))
      if (tmp?.[row] === undefined) {
        tmp[row] = { 장소: '', 요일: '', 시간: '' }
      }
      tmp[row][col] = value
      setSelfStudy(tmp)
    }
  }

  return (
    <div className="scroll-box h-screen-5 md:h-screen-4 mt-0 overflow-y-auto pt-4 pb-4 md:mt-4">
      {isCard && (
        <div className="flex justify-between text-xl font-semibold">
          <p>학습/진로 목표</p>
          <div className="flex items-center justify-end">
            {isEditMode && (
              <>
                <button
                  children="취소"
                  className="bg-light_orange text-brand-1 hover:text-light_orange rounded-md px-2 py-1 text-sm hover:bg-red-500 focus:outline-hidden"
                  onClick={() => {
                    setIsEditMode(false)
                    refetch()
                  }}
                />
              </>
            )}
            {!isForbidden ? (
              <button
                children={isEditMode ? '저장하기' : '수정하기'}
                className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange rounded-md px-2 py-1 text-sm focus:outline-hidden"
                onClick={() => {
                  if (isEditMode) {
                    handleUpdate()
                    refetch()
                  }
                  setIsEditMode(true)
                }}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
      )}
      <div className={`bg-white p-3 ${isCard ? 'rounded-lg border' : ''} `}>
        <div className="h-2 w-full text-right text-xs">
          {lastUpdateAt && (
            <span>
              최종수정일: <Time date={lastUpdateAt} />{' '}
            </span>
          )}
        </div>
        <div className="text-lg font-bold">1. 목표</div>

        {/* 좌우명 */}
        <table className="mt-3 w-full text-sm break-words">
          <tr>
            <td className="border-b-2 text-base font-semibold" colSpan={1}>
              좌우명
            </td>
          </tr>
          <tr>
            <td className="w-full" colSpan={1}>
              <div className="mb-1 flex flex-row flex-wrap"></div>
            </td>
          </tr>
          <tr>
            <td className="h-5 border border-black">
              {isEditMode ? (
                <TextInput value={motto} onChange={(e) => setMotto(e.target.value)} className="h-5 text-sm" />
              ) : (
                motto
              )}
            </td>
          </tr>
        </table>

        {/* 희망진로 */}
        <table className="mt-3 w-full text-sm break-words">
          <tr>
            <td className="border-b-2 text-base font-semibold" colSpan={3}>
              희망 진로
            </td>
          </tr>
          <tr>
            <td className="w-full" colSpan={1}>
              <div className="mb-1 flex flex-row flex-wrap"></div>
            </td>
          </tr>
          <tr>
            <td className="h-5 border border-black">
              {isEditMode ? (
                <TextInput
                  value={hopeCareerPath}
                  onChange={(e) => setHopeCareerPath(e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                hopeCareerPath
              )}
            </td>
          </tr>
        </table>

        {/* 올해목표 */}
        <table className="mt-3 w-full text-sm break-words">
          <tr>
            <td className="border-b-2 text-base font-semibold" colSpan={3}>
              올해 목표
            </td>
          </tr>
          <tr>
            <td className="w-full" colSpan={3}>
              <div className="mb-2 flex flex-row flex-wrap"></div>
            </td>
          </tr>
          <tr>
            <th className="w-[25%] border border-black bg-gray-200">항목</th>
            <th className="border border-black bg-gray-200">목표</th>
            <th className="w-[25%] border border-black bg-gray-200">기한</th>
          </tr>
          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['1']?.['항목'] || ''}
                  placeholder="꿈찾기"
                  onChange={(e) => setValues('resolution', '1', '항목', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['1']?.['항목'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['1']?.['목표'] || ''}
                  placeholder="희망 진로 정하기"
                  onChange={(e) => setValues('resolution', '1', '목표', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['1']?.['목표'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['1']?.['기한'] || ''}
                  placeholder="~24.11.11"
                  onChange={(e) => setValues('resolution', '1', '기한', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['1']?.['기한'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['2']?.['항목'] || ''}
                  placeholder="건강"
                  onChange={(e) => setValues('resolution', '2', '항목', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['2']?.['항목'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['2']?.['목표'] || ''}
                  placeholder="매일 유산소 운동 30분씩 하기"
                  onChange={(e) => setValues('resolution', '2', '목표', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['2']?.['목표'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['2']?.['기한'] || ''}
                  placeholder="매일"
                  onChange={(e) => setValues('resolution', '2', '기한', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['2']?.['기한'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['3']?.['항목'] || ''}
                  placeholder="마음"
                  onChange={(e) => setValues('resolution', '3', '항목', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['3']?.['항목'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['3']?.['목표'] || ''}
                  placeholder="먼저 웃으며 인사하기 "
                  onChange={(e) => setValues('resolution', '3', '목표', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['3']?.['목표'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['3']?.['기한'] || ''}
                  placeholder="매일"
                  onChange={(e) => setValues('resolution', '3', '기한', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['3']?.['기한'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['4']?.['항목'] || ''}
                  placeholder="학업"
                  onChange={(e) => setValues('resolution', '4', '항목', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['4']?.['항목'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['4']?.['목표'] || ''}
                  placeholder="수학 1등급 받기 "
                  onChange={(e) => setValues('resolution', '4', '목표', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['4']?.['목표'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['4']?.['기한'] || ''}
                  placeholder="~24.11.11"
                  onChange={(e) => setValues('resolution', '4', '기한', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['4']?.['기한'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['5']?.['항목'] || ''}
                  placeholder=""
                  onChange={(e) => setValues('resolution', '5', '항목', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['5']?.['항목'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['5']?.['목표'] || ''}
                  placeholder=""
                  onChange={(e) => setValues('resolution', '5', '목표', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['5']?.['목표'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={resolution?.['5']?.['기한'] || ''}
                  placeholder=""
                  onChange={(e) => setValues('resolution', '5', '기한', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                resolution?.['5']?.['기한'] || ''
              )}
            </td>
          </tr>
        </table>

        {/* 진학목표 */}
        <table className="mt-3 w-full table-fixed text-sm break-words">
          <tr>
            <td className="border-b-2 text-base font-semibold" colSpan={4}>
              진학 목표
            </td>
          </tr>
          <tr>
            <td className="w-full" colSpan={4}>
              <div className="mb-2 flex flex-row flex-wrap"></div>
            </td>
          </tr>
          <tr>
            <th className="w-5 border border-black bg-gray-200">구분</th>
            <th className="w-auto border border-black bg-gray-200">1지망</th>
            <th className="w-auto border border-black bg-gray-200">2지망</th>
            <th className="w-auto border border-black bg-gray-200">3지망</th>
          </tr>
          <tr>
            <th className="border border-black bg-gray-200">희망대학</th>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={hopeUnivMajor?.['1st']?.['univ'] || ''}
                  onChange={(e) => setValues('hopeUnivMajor', '1st', 'univ', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                hopeUnivMajor?.['1st']?.['univ'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={hopeUnivMajor?.['2nd']?.['univ'] || ''}
                  onChange={(e) => setValues('hopeUnivMajor', '2nd', 'univ', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                hopeUnivMajor?.['2nd']?.['univ'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={hopeUnivMajor?.['3rd']?.['univ'] || ''}
                  onChange={(e) => setValues('hopeUnivMajor', '3rd', 'univ', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                hopeUnivMajor?.['3rd']?.['univ'] || ''
              )}
            </td>
          </tr>
          <tr>
            <th className="border border-black bg-gray-200">희망학과</th>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={hopeUnivMajor?.['1st']?.['major'] || ''}
                  onChange={(e) => setValues('hopeUnivMajor', '1st', 'major', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                hopeUnivMajor?.['1st']?.['major'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={hopeUnivMajor?.['2nd']?.['major'] || ''}
                  onChange={(e) => setValues('hopeUnivMajor', '2nd', 'major', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                hopeUnivMajor?.['2nd']?.['major'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={hopeUnivMajor?.['3rd']?.['major'] || ''}
                  onChange={(e) => setValues('hopeUnivMajor', '3rd', 'major', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                hopeUnivMajor?.['3rd']?.['major'] || ''
              )}
            </td>
          </tr>
        </table>

        {/* 해당 입시전형 */}
        <table className="mt-3 w-full text-sm break-words">
          <tr>
            <td className="border-b-2 text-base font-semibold" colSpan={2}>
              해당 입시전형
            </td>
          </tr>
          <tr>
            <td className="w-full" colSpan={2}>
              <div className="mb-2 flex flex-row flex-wrap"></div>
            </td>
          </tr>
          <tr>
            <th className="w-[25%] border border-black bg-gray-200">입시전형</th>
            <th className="border border-black bg-gray-200">비고</th>
          </tr>
          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={admission?.['1']?.['입시전형'] || ''}
                  placeholder="기회균등"
                  onChange={(e) => setValues('admission', '1', '입시전형', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                admission?.['1']?.['입시전형'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={admission?.['1']?.['비고'] || ''}
                  placeholder="농어촌특별전형 6년 "
                  onChange={(e) => setValues('admission', '1', '비고', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                admission?.['1']?.['비고'] || ''
              )}
            </td>
          </tr>
        </table>

        <div className="mt-4 text-lg font-bold">2. 학교생활</div>

        {/* 소속 정보 */}
        <table className="mt-3 w-full text-sm break-words">
          <tr>
            <td className="border-b-2 text-base font-semibold" colSpan={3}>
              소속 정보
            </td>
          </tr>
          <tr>
            <td className="w-full" colSpan={3}>
              <div className="mb-2 flex flex-row flex-wrap"></div>
            </td>
          </tr>
          <tr>
            <th className="w-[25%] border border-black bg-gray-200">활동구분</th>
            <th className="border border-black bg-gray-200">활동명</th>
            <th className="w-[25%] border border-black bg-gray-200">비고</th>
          </tr>
          <tr>
            <th className="border border-black bg-gray-200">동아리</th>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={joinGroup?.['1']?.['활동명'] || ''}
                  placeholder="봉사"
                  onChange={(e) => setValues('joinGroup', '1', '활동명', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                joinGroup?.['1']?.['활동명'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={joinGroup?.['1']?.['비고'] || ''}
                  placeholder="단장"
                  onChange={(e) => setValues('joinGroup', '1', '비고', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                joinGroup?.['1']?.['비고'] || ''
              )}
            </td>
          </tr>
          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={joinGroup?.['2']?.['활동구분'] || ''}
                  placeholder="학생회"
                  onChange={(e) => setValues('joinGroup', '2', '활동구분', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                joinGroup?.['2']?.['활동구분'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={joinGroup?.['2']?.['활동명'] || ''}
                  placeholder="학교 학생회"
                  onChange={(e) => setValues('joinGroup', '2', '활동명', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                joinGroup?.['2']?.['활동명'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={joinGroup?.['2']?.['비고'] || ''}
                  placeholder="생활안전부장"
                  onChange={(e) => setValues('joinGroup', '2', '비고', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                joinGroup?.['2']?.['비고'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={joinGroup?.['3']?.['활동구분'] || ''}
                  placeholder="기획단"
                  onChange={(e) => setValues('joinGroup', '3', '활동구분', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                joinGroup?.['3']?.['활동구분'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={joinGroup?.['3']?.['활동명'] || ''}
                  placeholder="축제 기획단"
                  onChange={(e) => setValues('joinGroup', '3', '활동명', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                joinGroup?.['3']?.['활동명'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={joinGroup?.['3']?.['비고'] || ''}
                  placeholder="홍보부장"
                  onChange={(e) => setValues('joinGroup', '3', '비고', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                joinGroup?.['3']?.['비고'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={joinGroup?.['4']?.['활동구분'] || ''}
                  placeholder=""
                  onChange={(e) => setValues('joinGroup', '4', '활동구분', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                joinGroup?.['4']?.['활동구분'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={joinGroup?.['4']?.['활동명'] || ''}
                  placeholder=""
                  onChange={(e) => setValues('joinGroup', '4', '활동명', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                joinGroup?.['4']?.['활동명'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={joinGroup?.['4']?.['비고'] || ''}
                  placeholder=""
                  onChange={(e) => setValues('joinGroup', '4', '비고', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                joinGroup?.['4']?.['비고'] || ''
              )}
            </td>
          </tr>
        </table>

        {/* 출신학교 */}
        <table className="mt-3 w-full text-sm break-words">
          <tr>
            <td className="border-b-2 text-base font-semibold" colSpan={2}>
              출신학교
            </td>
          </tr>
          <tr>
            <td className="w-full" colSpan={2}>
              <div className="mb-2 flex flex-row flex-wrap"></div>
            </td>
          </tr>
          <tr>
            <th className="w-[30%] border border-black bg-gray-200">학교명</th>
            <th className="border border-black bg-gray-200">비고</th>
          </tr>
          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={schoolOrigin?.['1']?.['학교명'] || ''}
                  placeholder="슈퍼초등학교"
                  onChange={(e) => setValues('schoolOrigin', '1', '학교명', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                schoolOrigin?.['1']?.['학교명'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={schoolOrigin?.['1']?.['비고'] || ''}
                  placeholder="3학년 때 전학"
                  onChange={(e) => setValues('schoolOrigin', '1', '비고', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                schoolOrigin?.['1']?.['비고'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={schoolOrigin?.['2']?.['학교명'] || ''}
                  placeholder="슈퍼중학교"
                  onChange={(e) => setValues('schoolOrigin', '2', '학교명', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                schoolOrigin?.['2']?.['학교명'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={schoolOrigin?.['2']?.['비고'] || ''}
                  placeholder=""
                  onChange={(e) => setValues('schoolOrigin', '2', '비고', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                schoolOrigin?.['2']?.['비고'] || ''
              )}
            </td>
          </tr>
        </table>

        <div className="mt-4 text-lg font-bold">3. 학습</div>

        {/* 학습 정보 */}
        <table className="mt-3 w-full table-fixed text-sm break-words">
          <tr>
            <td className="border-b-2 text-base font-semibold" colSpan={4}>
              학습 정보
            </td>
          </tr>
          <tr>
            <td className="w-full" colSpan={4}>
              <div className="mb-2 flex flex-row flex-wrap"></div>
            </td>
          </tr>
          <tr>
            <th className="border border-black bg-gray-200">과목</th>
            <th className="border border-black bg-gray-200">장소</th>
            <th className="border border-black bg-gray-200">요일</th>
            <th className="border border-black bg-gray-200">비고</th>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['1']?.['과목'] || ''}
                  placeholder="수학"
                  onChange={(e) => setValues('extraCurricular', '1', '과목', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['1']?.['과목'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['1']?.['장소'] || ''}
                  placeholder="쑥쑥수학학원"
                  onChange={(e) => setValues('extraCurricular', '1', '장소', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['1']?.['장소'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['1']?.['요일'] || ''}
                  placeholder="월, 수, 금"
                  onChange={(e) => setValues('extraCurricular', '1', '요일', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['1']?.['요일'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['1']?.['비고'] || ''}
                  placeholder="18시~20시"
                  onChange={(e) => setValues('extraCurricular', '1', '비고', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['1']?.['비고'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['2']?.['과목'] || ''}
                  placeholder="영어"
                  onChange={(e) => setValues('extraCurricular', '2', '과목', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['2']?.['과목'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['2']?.['장소'] || ''}
                  onChange={(e) => setValues('extraCurricular', '2', '장소', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['2']?.['장소'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['2']?.['요일'] || ''}
                  onChange={(e) => setValues('extraCurricular', '2', '요일', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['2']?.['요일'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['2']?.['비고'] || ''}
                  onChange={(e) => setValues('extraCurricular', '2', '비고', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['2']?.['비고'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['3']?.['과목'] || ''}
                  placeholder="국어"
                  onChange={(e) => setValues('extraCurricular', '3', '과목', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['3']?.['과목'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['3']?.['장소'] || ''}
                  onChange={(e) => setValues('extraCurricular', '3', '장소', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['3']?.['장소'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['3']?.['요일'] || ''}
                  onChange={(e) => setValues('extraCurricular', '3', '요일', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['3']?.['요일'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['3']?.['비고'] || ''}
                  onChange={(e) => setValues('extraCurricular', '3', '비고', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['3']?.['비고'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['4']?.['과목'] || ''}
                  placeholder="과학"
                  onChange={(e) => setValues('extraCurricular', '4', '과목', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['4']?.['과목'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['4']?.['장소'] || ''}
                  onChange={(e) => setValues('extraCurricular', '4', '장소', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['4']?.['장소'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['4']?.['요일'] || ''}
                  onChange={(e) => setValues('extraCurricular', '4', '요일', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['4']?.['요일'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['4']?.['비고'] || ''}
                  onChange={(e) => setValues('extraCurricular', '4', '비고', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['4']?.['비고'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['5']?.['과목'] || ''}
                  placeholder=""
                  onChange={(e) => setValues('extraCurricular', '5', '과목', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['5']?.['과목'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['5']?.['장소'] || ''}
                  onChange={(e) => setValues('extraCurricular', '5', '장소', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['5']?.['장소'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['5']?.['요일'] || ''}
                  onChange={(e) => setValues('extraCurricular', '5', '요일', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['5']?.['요일'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['5']?.['비고'] || ''}
                  onChange={(e) => setValues('extraCurricular', '5', '비고', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['5']?.['비고'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['6']?.['과목'] || ''}
                  placeholder=""
                  onChange={(e) => setValues('extraCurricular', '6', '과목', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['6']?.['과목'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['6']?.['장소'] || ''}
                  onChange={(e) => setValues('extraCurricular', '6', '장소', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['6']?.['장소'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['6']?.['요일'] || ''}
                  onChange={(e) => setValues('extraCurricular', '6', '요일', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['6']?.['요일'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={extraCurricular?.['6']?.['비고'] || ''}
                  onChange={(e) => setValues('extraCurricular', '6', '비고', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                extraCurricular?.['6']?.['비고'] || ''
              )}
            </td>
          </tr>
        </table>

        {/* 자기주도학습 */}
        <table className="mt-3 w-full text-sm break-words">
          <tr>
            <td className="border-b-2 text-base font-semibold" colSpan={3}>
              자기주도학습
            </td>
          </tr>
          <tr>
            <td className="w-full" colSpan={3}>
              <div className="mb-2 flex flex-row flex-wrap"></div>
            </td>
          </tr>
          <tr>
            <th className="w-[25%] border border-black bg-gray-200">장소</th>
            <th className="border border-black bg-gray-200">요일</th>
            <th className="border border-black bg-gray-200">시간</th>
          </tr>
          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={selfStudy?.['1']?.['장소'] || ''}
                  placeholder="독서실"
                  onChange={(e) => setValues('selfStudy', '1', '장소', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                selfStudy?.['1']?.['장소'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={selfStudy?.['1']?.['요일'] || ''}
                  onChange={(e) => setValues('selfStudy', '1', '요일', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                selfStudy?.['1']?.['요일'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={selfStudy?.['1']?.['시간'] || ''}
                  onChange={(e) => setValues('selfStudy', '1', '시간', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                selfStudy?.['1']?.['시간'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={selfStudy?.['2']?.['장소'] || ''}
                  placeholder="집"
                  onChange={(e) => setValues('selfStudy', '2', '장소', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                selfStudy?.['2']?.['장소'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={selfStudy?.['2']?.['요일'] || ''}
                  onChange={(e) => setValues('selfStudy', '2', '요일', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                selfStudy?.['2']?.['요일'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={selfStudy?.['2']?.['시간'] || ''}
                  onChange={(e) => setValues('selfStudy', '2', '시간', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                selfStudy?.['2']?.['시간'] || ''
              )}
            </td>
          </tr>

          <tr>
            <td className="h-5 border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={selfStudy?.['3']?.['장소'] || ''}
                  placeholder="학교"
                  onChange={(e) => setValues('selfStudy', '3', '장소', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                selfStudy?.['3']?.['장소'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={selfStudy?.['3']?.['요일'] || ''}
                  onChange={(e) => setValues('selfStudy', '3', '요일', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                selfStudy?.['3']?.['요일'] || ''
              )}
            </td>
            <td className="border border-black text-center">
              {isEditMode ? (
                <TextInput
                  value={selfStudy?.['3']?.['시간'] || ''}
                  onChange={(e) => setValues('selfStudy', '3', '시간', e.target.value)}
                  className="h-5 text-sm"
                />
              ) : (
                selfStudy?.['3']?.['시간'] || ''
              )}
            </td>
          </tr>
        </table>
      </div>

      {!isCard && (
        <div className="flex justify-end space-x-2 p-3">
          {isEditMode && (
            <>
              <Button.lg
                children="취소"
                className="outlined-primary w-full"
                onClick={() => {
                  setIsEditMode(false)
                  refetch()
                }}
              />
            </>
          )}
          <Button.lg
            children={isEditMode ? '저장하기' : '수정하기'}
            className="filled-primary w-full"
            onClick={() => {
              if (isEditMode) {
                handleUpdate()
              }
              setIsEditMode(true)
            }}
          />
        </div>
      )}
    </div>
  )
}
