import React, { useEffect, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useParams } from 'react-router'
import { useRecoilState } from 'recoil'

import { Avatar, Blank, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Time } from '@/legacy/components/common/Time'
import { Constants } from '@/legacy/constants'
import {
  useRecordCreate,
  useStudentActivityV3FindByTeacher,
  useStudentActivityV3SaveByTeacher,
} from '@/legacy/generated/endpoint'
import { getNickName, padLeftstr } from '@/legacy/util/status'
import { toastState } from '@/stores'

import { RecordItem } from './RecordItem'

interface StudentActivityDetailProps {
  activityv3: any
  studentGroups: any[]
}

export const StudentActivityDetail: React.FC<StudentActivityDetailProps> = ({ activityv3, studentGroups }) => {
  const { id } = useParams<{ id: string }>()
  const [toastMsg, setToastMsg] = useRecoilState(toastState)
  const { studentId } = useParams<{ studentId: string }>()
  const [selectedUserId, setSelectedUserId] = useState<number>(Number(studentId))
  const [userSelectView, setUserSelectView] = useState(false)
  const [record, setRecord] = useState('')
  const [summary, setSummary] = useState('')
  const [title, setTitle] = useState('')
  const [isUpdate, setIsUpate] = useState<boolean>(false)

  const {
    data: studentActivityV3,
    refetch: refetchSAV,
    isLoading: savLoading,
  } = useStudentActivityV3FindByTeacher(
    {
      activityv3Id: Number(id),
      userId: Number(selectedUserId),
    },
    { query: { enabled: !!selectedUserId && !!id } },
  )

  const { mutate: saveStudentActivityV3 } = useStudentActivityV3SaveByTeacher({
    mutation: {
      onSuccess: () => {
        setToastMsg('변경 사항이 저장되었습니다.')
      },
      onError: (error) => setToastMsg(error.message),
    },
  })

  const { mutate: createRecord, isLoading: createRecordLoading } = useRecordCreate({
    mutation: {
      onSuccess: () => {
        setRecord('')
        setToastMsg('관찰 기록이 저장되었습니다.')
        refetchSAV()
      },
      onError: (error) => setToastMsg(error.message),
    },
  })

  const isRecordLoading = createRecordLoading

  useEffect(() => {
    const activityTitle = studentActivityV3?.title
    const activitySummary = studentActivityV3?.summary
    setTitle(activityTitle || '')
    setSummary(activitySummary || '')

    if (!activityTitle && !activitySummary) {
      setIsUpate(true)
    } else {
      setIsUpate(false)
    }
  }, [studentActivityV3])

  const selectedUserIndex = studentGroups?.findIndex((el) => el.userId === Number(selectedUserId))
  const selectedUser = studentGroups?.[selectedUserIndex]?.user
  const prevUser = selectedUserIndex > 0 ? studentGroups[selectedUserIndex - 1]?.user : null
  const nextUser = selectedUserIndex < studentGroups.length - 1 ? studentGroups[selectedUserIndex + 1]?.user : null

  if (!studentActivityV3) return <></>
  if (savLoading) return <Blank />

  const canRecord = !!studentActivityV3.studentText

  const generateSummary = () => {
    let summary = ''

    if (activityv3.commonText) {
      summary += activityv3.commonText
    }

    if (studentActivityV3?.studentText) {
      if (summary) summary += '\n'
      summary += studentActivityV3.studentText
    }

    const recordsContent = studentActivityV3?.records?.map((r) => r.content).join('\n')
    if (recordsContent) {
      if (summary) summary += '\n'
      summary += recordsContent
    }

    return summary
  }

  const handleSave = () => {
    const data = { record, summary, title }
    if (summary.trim() === '') {
      alert('내용을 입력해 주세요.')
      return
    }

    saveStudentActivityV3({
      params: { activityv3Id: Number(activityv3.id), userId: Number(selectedUserId) },
      data,
    })
  }

  return (
    <>
      <div className="max-h-screen-12 mt-16 flex h-full items-stretch space-x-2 overflow-hidden">
        <div className="flex w-2/3 flex-col pb-4">
          <div className="text-24 mb-4 font-bold">학생 활동 보고서</div>
          <div className="flex h-full w-full flex-col overflow-hidden rounded border border-neutral-400">
            <div className="flex h-full w-full flex-col space-y-5 overflow-hidden bg-white px-8 py-5">
              <div className="flex w-full items-center justify-center space-x-4">
                <Icon.ChevronLeft
                  className={`${!prevUser ? 'pointer-events-none text-gray-300' : 'cursor-pointer'}`}
                  stroke={prevUser ? '#000' : '#DDD'}
                  onClick={() => prevUser && setSelectedUserId(prevUser?.id)}
                />
                <div className="relative flex h-14 w-48 items-center justify-center">
                  <div className="scroll-box absolute inset-x-0 top-0 z-10 flex max-h-64 flex-col space-y-2 overflow-y-auto rounded-3xl border border-neutral-200 bg-white p-3">
                    <div className="flex w-full items-center justify-center gap-2 pb-1">
                      {selectedUser?.profile ? (
                        <LazyLoadImage
                          src={`${Constants.imageUrl}${selectedUser?.profile}`}
                          alt=""
                          loading="lazy"
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <Avatar />
                      )}
                      <div>
                        {selectedUser?.studentGroups[0].group.grade +
                          padLeftstr(selectedUser?.studentGroups[0].group.klass) +
                          padLeftstr(selectedUser?.studentGroups[0].studentNumber)}
                      </div>
                      <div className="whitespace-pre">{selectedUser?.name}</div>
                      {userSelectView ? (
                        <Icon.ChevronUp className="cursor-pointer" onClick={() => setUserSelectView(false)} />
                      ) : (
                        <Icon.FillArrow className="cursor-pointer" onClick={() => setUserSelectView(true)} />
                      )}
                    </div>
                    {userSelectView &&
                      studentGroups
                        .filter((sg) => sg.userId !== Number(selectedUserId))
                        .map((sg) => (
                          <div
                            key={sg.id}
                            className="flex cursor-pointer items-center justify-evenly gap-2"
                            onClick={() => {
                              setUserSelectView(false)
                              setSelectedUserId(sg.userId)
                            }}
                          >
                            {sg.user?.profile ? (
                              <LazyLoadImage
                                src={`${Constants.imageUrl}${sg.user?.profile}`}
                                alt=""
                                loading="lazy"
                                className="h-8 w-8 rounded object-cover"
                              />
                            ) : (
                              <Avatar />
                            )}
                            <div className="flex items-center">
                              {sg.user?.studentGroups[0].group.grade}
                              {sg.user?.studentGroups[0].group.klass.toString().padStart(2, '0')}
                              {sg.user?.studentGroups[0].studentNumber.toString().padStart(2, '0')}
                            </div>
                            <div className="whitespace-pre">
                              {sg.user?.name} {getNickName(sg.user?.nickName)}
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
                <Icon.ChevronRight
                  className={`${!nextUser ? 'pointer-events-none text-gray-300' : 'cursor-pointer'}`}
                  stroke={nextUser ? '#000' : '#DDD'}
                  onClick={() => nextUser && setSelectedUserId(nextUser?.id)}
                />
              </div>
              <div className="flex h-full flex-col justify-between overflow-y-auto">
                <div className="h-full w-full text-sm whitespace-pre-line">{studentActivityV3.studentText}</div>
                {studentActivityV3.studentText && (
                  <div className="text-12 mt-auto flex items-center justify-end space-x-2 px-2 font-bold">
                    <span className="font-semibold text-gray-400">글자 수 (공백 제외)</span>&nbsp;
                    {studentActivityV3.studentText?.replaceAll(' ', '').length}자&nbsp;
                    {new TextEncoder().encode(studentActivityV3.studentText?.replaceAll(' ', '')).length} Byte
                    <span className="font-semibold text-gray-400">글자 수 (공백 포함)</span>&nbsp;
                    {studentActivityV3.studentText?.length}자&nbsp;
                    {new TextEncoder().encode(studentActivityV3.studentText).length}Byte
                  </div>
                )}
              </div>
            </div>
            <div className="flex min-h-[80px] items-center justify-between border-t border-gray-300 bg-gray-50 px-6 py-4">
              <div className="text-14 flex flex-col gap-2">
                {canRecord ? (
                  <>
                    <p>
                      최초 제출 일시 : <Time date={studentActivityV3.createdAt} className="text-14 text-inherit" /> (
                      <Time date={studentActivityV3.createdAt} formatDistanceToNow className="text-14 text-inherit" />)
                    </p>
                    <p>
                      마지막 수정 일시 : <Time date={studentActivityV3.updatedAt} className="text-14 text-inherit" /> (
                      <Time date={studentActivityV3.updatedAt} formatDistanceToNow className="text-14 text-inherit" />)
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">제출내역이 존재하지 않습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 관찰기록 영역 */}
        <div className="flex w-1/3 min-w-40 flex-col pb-4">
          <div className="text-24 mb-4 font-bold">관찰기록</div>
          <div className="flex h-full w-full flex-col overflow-hidden rounded border border-neutral-400">
            <div className="relative h-full w-full flex-col space-y-4 overflow-y-auto bg-white p-5">
              {isRecordLoading && <div className="bg-littleblack absolute inset-0">로딩 중...</div>}
              {studentActivityV3.records
                ?.slice()
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((record) => <RecordItem key={record.id} record={record} refetch={() => {}} />)}
            </div>
            <div className="flex h-20 items-center justify-between border-t border-gray-300 px-4 py-4">
              <Textarea
                value={record}
                onChange={(e) => setRecord(e.target.value)}
                className="h-auto w-full resize-none border-none px-0 py-0 text-sm"
                placeholder="활동에 대한 학생별 관찰 기록을 작성해 보세요.
관찰 기록은 선생님에게만 보입니다."
                disabled={isRecordLoading}
                rows={3}
              />
              <Button
                className="h-8 w-16 rounded-lg bg-orange-500 font-semibold text-white disabled:bg-gray-50 disabled:text-gray-500"
                onClick={() =>
                  createRecord({
                    params: { activityv3Id: activityv3.id, userId: Number(selectedUserId) },
                    data: { content: record },
                  })
                }
                disabled={isRecordLoading}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 활동 요약 영역 */}
      <div className="mt-7">
        <div className="mb-4 flex w-full items-center justify-between">
          <div className="text-24 font-bold">활동 요약</div>
          {studentActivityV3.updatedAt && (
            <div className="text-14 text-[#777]">
              최근 저장시간 : <Time date={studentActivityV3.updatedAt} className="text-inherit" />
            </div>
          )}
        </div>
        <div>
          {isUpdate ? (
            <div>
              <div className="flex flex-col gap-2.5">
                <TextInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="활동요약 제목을 작성해주세요"
                  className="rounded-lg border border-stone-300 px-3 py-2"
                />
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="resize-none rounded-lg border border-stone-300 px-3 py-2"
                  placeholder="불러오기 버튼을 클릭하면 공통문구, 학생 활동 보고서, 관찰기록의 내용이 활동요약 작성칸에 모여 보여집니다."
                />
              </div>
              <div className="mt-2 flex w-full items-center justify-between space-x-2">
                {title !== '' || summary !== '' ? (
                  <Button
                    className="h-10 w-28 rounded-lg border border-neutral-500 bg-white text-lg text-neutral-500"
                    onClick={() => setIsUpate(false)}
                  >
                    취소
                  </Button>
                ) : (
                  <div></div>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    className="h-10 w-28 rounded-lg border border-orange-500 bg-white text-lg text-orange-500"
                    onClick={() => setSummary(generateSummary())}
                  >
                    불러오기
                  </Button>
                  <Button
                    className="h-10 w-28 rounded-lg bg-orange-500 text-lg font-bold text-white"
                    onClick={handleSave}
                  >
                    저장
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-2.5">
                <input
                  type="text"
                  className="disabled max-h-max w-full resize-none rounded-lg border border-stone-300 bg-white px-3 py-2"
                  disabled
                  placeholder="활동요약 제목"
                  value={title}
                />
                <textarea
                  className="min-h-48 w-full resize-none rounded-lg border border-stone-300 bg-white px-3 py-2"
                  cols={3}
                  placeholder="불러오기 버튼을 클릭하면 공통문구, 학생 활동 보고서, 관찰기록의 내용이 활동요약 작성칸에 모여 보여집니다."
                  disabled
                  value={summary}
                />
              </div>
              <div className="mt-2 flex w-full items-center justify-end space-x-2">
                <Button
                  className="h-10 w-28 rounded-lg bg-orange-500 text-lg font-bold text-white"
                  onClick={() => setIsUpate(true)}
                >
                  수정
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
