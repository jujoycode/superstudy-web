import { format } from 'date-fns'
import _ from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import { useHistory, useParams } from 'react-router-dom'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { useRecoilState, useRecoilValue } from 'recoil'
import { ReactComponent as FileItemIcon } from '@/legacy/assets/svg/file-item-icon.svg'
import { SuperModal } from '@/legacy/components'
import { SessionCommentItem } from '@/legacy/components/activityv3/SessionCommentItem'
import { Avatar, BackButton, Textarea, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Time } from '@/legacy/components/common/Time'
import { Icon } from '@/legacy/components/common/icons'
import { SuperSurveyComponent } from '@/legacy/components/survey/SuperSurveyComponent'
import { SuperSurveyViewComponent } from '@/legacy/components/survey/SuperSurveyViewComponent'
import { Constants } from '@/legacy/constants'
import { ACTIVITYV3_TYPE_KOR } from '@/legacy/constants/activityv3.enum'
import {
  useActivitySessionFindOne,
  useActivityV3FindByGroupIds,
  useActivityV3FindOne,
  useSessionCommentCreate,
  useStudentActivitySessionFindOneByTeacher,
} from '@/legacy/generated/endpoint'
import { ActivityType, StudentGroup } from '@/legacy/generated/model'
import { handleBulkDownload } from '@/legacy/hooks/useBatchDownload'
import { meState, toastState } from '@/legacy/store'
import { downloadFile } from '@/legacy/util/download-image'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'
import { getNickName } from '@/legacy/util/status'
import { makeDateToString, makeTimeToString } from '@/legacy/util/time'

interface ActivityV3SessionReportPageProps {}

export const ActivityV3SessionReportPage: React.FC<ActivityV3SessionReportPageProps> = () => {
  const { id: activityId, sessionId, studentId } = useParams<{ id: string; sessionId: string; studentId: string }>()
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isSurveyModalOpen, setSurveyModalOpen] = useState(false)
  const [userSelectView, setUserSelectView] = useState(false)
  const [toastMsg, setToastMsg] = useRecoilState(toastState)
  const { replace } = useHistory()
  const [selectedUserId, setSelectedUserId] = useState<number>(Number(studentId))
  const [sessionComment, setSessionComment] = useState('')
  const me = useRecoilValue(meState)

  const { data: activityv3 } = useActivityV3FindOne(Number(activityId), undefined, {
    query: { enabled: !!Number(activityId) },
  })

  useEffect(() => {
    if (studentId) {
      setSelectedUserId(Number(studentId))
    }
  }, [studentId])
  const {
    data: studentActivitySession,
    refetch: refetchSAS,
    isLoading: sessionLoading,
  } = useStudentActivitySessionFindOneByTeacher(
    {
      studentId: selectedUserId,
      sessionId: Number(sessionId) || 0,
    },
    {
      query: {
        enabled: !!selectedUserId && !!sessionId,
        onError: (err) => {
          setToastMsg(err.message)
        },
      },
    },
  )

  const { data: activitySession } = useActivitySessionFindOne(Number(sessionId), {
    query: { enabled: !!Number(sessionId) },
  })

  const { data } = useActivityV3FindByGroupIds(
    Number(sessionId),
    { ids: activityv3?.groupActivityV3s?.map((el) => el.group.id) || [] },
    { query: { enabled: !!activityv3?.groupActivityV3s?.length, staleTime: 100000 } },
  )

  const sortStudentGroups = (studentGroups: StudentGroup[]) => {
    return studentGroups?.sort((a, b) => {
      const Agroup = a.user?.studentGroups?.[0]?.group
      const Bgroup = b.user?.studentGroups?.[0]?.group

      if (Agroup?.grade === Bgroup?.grade && Agroup?.klass === Bgroup?.klass) {
        return (a.user?.studentGroups?.[0]?.studentNumber || 0) - (b.user?.studentGroups?.[0]?.studentNumber || 0)
      } else if (Agroup?.grade === Bgroup?.grade) {
        return (a.user?.studentGroups?.[0]?.group?.klass || 0) - (b.user?.studentGroups?.[0]?.group?.klass || 0)
      } else {
        return (a.user?.studentGroups?.[0]?.group?.grade || 0) - (b.user?.studentGroups?.[0]?.group?.grade || 0)
      }
    })
  }

  const studentGroups = useMemo(() => {
    if (!data) return []
    return sortStudentGroups(_.chain(data).uniqBy('user.id').sortBy('groupId').value())
  }, [data])

  const { mutate: createSessionComment, isLoading: createSessionCommentLoading } = useSessionCommentCreate({
    mutation: {
      onSuccess: () => {
        refetchSAS()
        setSessionComment('')
      },
      onError: (error) => setToastMsg(error.message),
    },
  })

  const files = studentActivitySession?.files || []
  const images = studentActivitySession?.images || []

  const batchData = [...files, ...images]

  let surveyContent = {}
  try {
    surveyContent = JSON.parse(studentActivitySession?.content || '{}')
  } catch (err) {}

  const viewerImages: ImageDecorator[] = []

  if (studentActivitySession) {
    for (const image of images) {
      if (isPdfFile(image) === false) {
        viewerImages.push({
          src: `${Constants.imageUrl}${image}`,
        })
      }
    }
  }

  const isSessionCommentLoading = createSessionCommentLoading || sessionLoading
  const selectedUserIndex = studentGroups?.findIndex((el) => el.userId === Number(selectedUserId))
  const selectedUser: any = studentGroups?.[selectedUserIndex]?.user
  const prevUser = selectedUserIndex > 0 ? studentGroups[selectedUserIndex - 1]?.user : null
  const nextUser = selectedUserIndex < studentGroups.length - 1 ? studentGroups[selectedUserIndex + 1]?.user : null
  const type = activitySession?.type

  const isMobile = () => {
    return (
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    )
  }

  if (!activityv3) return <></>
  if (!activitySession) return <></>

  return (
    <div className="col-span-6">
      <div className="md:hidden">
        <TopNavbar title={activitySession.title} left={<BackButton />} />
      </div>
      {/* 활동기록부 상세 */}
      <div className="h-screen-6 3xl:px-[208px] 3xl:pb-[128px] 3xl:pt-[64px] flex flex-col bg-gray-50 p-2 md:h-screen md:px-10 md:pt-10 md:pb-20">
        <div className="relative h-full">
          {/* 브레드크럼 */}
          <div className="absolute -top-6 left-0 flex h-6 items-center justify-evenly text-sm text-neutral-500">
            <p onClick={() => replace('/teacher/activityv3')} className="cursor-pointer">
              활동 기록
            </p>
            <Icon.FillArrow className="-rotate-90" />
            <p onClick={() => replace(`/teacher/activityv3/${activityv3.id}`)} className="cursor-pointer">
              {activityv3?.title?.length >= 15 ? activityv3.title?.slice(0, 15) + '...' : activityv3.title || '활동명'}
            </p>
            <Icon.FillArrow className="-rotate-90" />
            <p className="cursor-pointer">
              {activitySession.title.length >= 15
                ? activitySession.title.slice(0, 15) + '...'
                : activitySession.title || '차시명'}
            </p>
          </div>
          <div className="3xl:px-30 3xl:py-20 h-full overflow-y-auto bg-white p-2 md:px-10 md:py-5">
            <div className="flex flex-col rounded border border-neutral-200">
              <div className="border-b border-neutral-200 px-10 pt-8 pb-8">
                <div className="flex pb-4">
                  <h1 className="flex-1 text-2xl font-bold break-words whitespace-pre-line">
                    [{ACTIVITYV3_TYPE_KOR[activityv3.type]}] {activityv3.title}
                  </h1>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <div className="text-sm font-semibold whitespace-pre md:w-40">활동 기간</div>
                    <div className="w-full text-sm">
                      {activityv3.startDate && format(new Date(activityv3.startDate), 'yyyy.MM.dd')} ~{' '}
                      {activityv3.endDate && format(new Date(activityv3.endDate), 'yyyy.MM.dd')}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-sm font-semibold whitespace-pre md:w-40">활동 설명</div>
                    <div className="w-full text-sm break-words whitespace-pre-line">{activityv3?.description}</div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-sm font-semibold whitespace-pre md:w-40">공통문구</div>
                    <div className="w-full text-sm break-words whitespace-pre-line">{activityv3?.commonText}</div>
                  </div>
                  {(activityv3.images?.length > 0 || activityv3.files?.length > 0) && (
                    <div className="flex items-start">
                      <div className="text-sm font-semibold whitespace-pre md:w-40">첨부파일</div>
                      <div className="w-full">
                        {!!activityv3.images?.length && (
                          <div className="grid w-full grid-flow-row grid-cols-6 gap-2 pb-2">
                            {activityv3.images?.map((image: string, i: number) => (
                              <div
                                key={i}
                                onClick={() => {
                                  setActiveIndex(i)
                                }}
                                className="w-full"
                              >
                                <div className="aspect-square rounded border border-neutral-200">
                                  <LazyLoadImage
                                    src={`${Constants.imageUrl}${image}`}
                                    alt=""
                                    loading="lazy"
                                    className="object-fit h-full w-full rounded"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {!!activityv3.files?.length && (
                          <div className="flex flex-col gap-1 pb-2">
                            {activityv3.files?.map((fileUrl: string, index) => (
                              <div
                                key={index}
                                className="flex h-8 w-max items-center space-x-2 rounded bg-stone-50 px-3 py-1"
                              >
                                <FileItemIcon />
                                <a
                                  className="ml-2 text-xs text-neutral-500"
                                  href={`${Constants.imageUrl}${fileUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={getFileNameFromUrl(fileUrl)}
                                >
                                  {getFileNameFromUrl(fileUrl)}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* 내부 하단 영역 */}
              <div className="flex items-center px-10 py-5">
                <div className="text-sm font-semibold whitespace-pre md:w-40">전달 대상</div>
                <div className="flex w-full flex-wrap gap-1">
                  {_.chain(activityv3?.groupActivityV3s || [])
                    .sortBy(['group.grade', 'group.klass'])
                    .map((el) => (
                      <div
                        key={el.group?.id}
                        className="h-8 rounded-lg border border-stone-300 px-2 py-1 text-center whitespace-pre"
                      >
                        {el.group?.name}
                      </div>
                    ))
                    .value()}
                </div>
              </div>
            </div>

            {/* 차시 설명 영역 */}
            <div className="mt-4 mb-16 flex flex-col rounded border-2 border-zinc-800">
              <div className="border-b border-neutral-200 px-10 pt-8 pb-8">
                <div className="flex items-baseline justify-between pb-4">
                  <h1 className="flex-1 text-2xl font-bold break-words whitespace-pre-line">{activitySession.title}</h1>
                </div>
                {/* 차시 Content */}
                <div className="flex flex-col gap-2">
                  {type !== 'NOTICE' && (
                    <div className="flex w-full">
                      <div className="text-sm font-semibold whitespace-pre md:w-40">마감기한</div>
                      <div className="w-full">
                        {activitySession.endDate
                          ? `${makeDateToString(activitySession.endDate)} ${makeTimeToString(activitySession.endDate)}`
                          : '미설정'}
                      </div>
                    </div>
                  )}
                  {activitySession.content && (
                    <div className="flex w-full">
                      <div className="text-sm font-semibold whitespace-pre md:w-40">차시 설명</div>
                      <div className="feedback_space w-full text-base break-words whitespace-pre-line text-gray-500">
                        <Linkify>{activitySession?.content}</Linkify>
                      </div>
                    </div>
                  )}
                  {(activitySession.images?.length > 0 || activitySession.files?.length > 0) && (
                    <div className="flex items-start">
                      <div className="text-sm font-semibold whitespace-pre md:w-40">첨부파일</div>
                      <div className="w-full">
                        {!!activitySession.images?.length && (
                          <div className="grid w-full grid-flow-row grid-cols-6 gap-2 pb-2">
                            {activitySession.images?.map((image: string, i: number) => (
                              <div key={i} className="w-full">
                                <div className="aspect-square cursor-pointer rounded border border-neutral-200">
                                  <LazyLoadImage
                                    src={`${Constants.imageUrl}${image}`}
                                    alt=""
                                    loading="lazy"
                                    className="object-fit h-full w-full rounded"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {!!activitySession.files?.length && (
                          <div className="flex flex-col gap-1 pb-2">
                            {activitySession.files?.map((fileUrl: string, index) => (
                              <div
                                key={index}
                                className="flex h-8 w-max items-center space-x-2 rounded bg-stone-50 px-3 py-1"
                              >
                                <FileItemIcon />
                                <a
                                  className="ml-2 text-xs text-neutral-500"
                                  href={`${Constants.imageUrl}${fileUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={getFileNameFromUrl(fileUrl)}
                                >
                                  {getFileNameFromUrl(fileUrl)}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {activitySession.type === ActivityType.SURVEY && (
                  <div className="mt-2 flex w-full items-center">
                    <div className="text-sm font-semibold whitespace-pre md:w-40">설문 내용</div>
                    <div className="w-full">
                      <Button
                        className="h-8 w-28 rounded-lg border border-zinc-800"
                        onClick={() => setSurveyModalOpen(true)}
                      >
                        설문지 보기
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <>
              {/* 제목 영역 */}
              <div className="flex w-full gap-1">
                <div className="text-24 mb-4 w-2/3 font-bold">차시 제출물</div>
                <div className="text-24 mb-4 w-1/3 font-bold">1:1 피드백</div>
              </div>

              {/* 내용 영역 */}
              <div className="flex h-[661px] w-full items-stretch space-x-2">
                {/* 차시 제출물 영역 */}
                <div className="flex h-full w-2/3 flex-col rounded border border-neutral-400 bg-white">
                  {/* 학생 리스트 영역 */}
                  <div className="flex w-full items-center justify-center space-x-4 pt-5">
                    <Icon.ChevronLeft
                      className={`${!prevUser ? 'pointer-events-none text-gray-300' : 'cursor-pointer'}`}
                      stroke={prevUser ? '#000' : '#DDD'}
                      onClick={() =>
                        prevUser && replace(`/teacher/activityv3/${activityId}/session/${sessionId}/${prevUser.id}`)
                      }
                    />
                    <div className="relative flex h-14 w-64 items-center justify-center">
                      <div className="scroll-box absolute inset-x-0 top-0 z-10 flex max-h-64 flex-col space-y-2 overflow-y-auto rounded-3xl border border-gray-300 bg-white p-3">
                        <div className="item-center flex w-full justify-between gap-2">
                          <div className="item-center flex gap-2">
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
                            {selectedUser?.studentGroups && selectedUser?.studentGroups[0] && (
                              <div className="flex items-center">
                                {selectedUser.studentGroups[0].group.grade}
                                {selectedUser.studentGroups[0].group.klass.toString().padStart(2, '0')}
                                {selectedUser.studentGroups[0].studentNumber.toString().padStart(2, '0')}
                              </div>
                            )}
                            <div className="flex items-center whitespace-pre">
                              {selectedUser?.name} {getNickName(selectedUser?.nickName)}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {userSelectView ? (
                              <Icon.ChevronUp className="cursor-pointer" onClick={() => setUserSelectView(false)} />
                            ) : (
                              <Icon.ChevronDown className="cursor-pointer" onClick={() => setUserSelectView(true)} />
                            )}
                          </div>
                        </div>
                        {userSelectView &&
                          studentGroups
                            .filter((sg) => sg.userId !== Number(selectedUserId))
                            .map((sg) => (
                              <div
                                key={sg.id}
                                className="flex cursor-pointer items-center gap-2"
                                onClick={() => {
                                  setUserSelectView(false)
                                  replace(`/teacher/activityv3/${activityId}/session/${sessionId}/${sg.user.id}`)
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
                                {sg.user.studentGroups && sg.user.studentGroups[0] && (
                                  <div>
                                    {sg.user.studentGroups[0].group.grade}
                                    {sg.user.studentGroups[0].group.klass.toString().padStart(2, '0')}
                                    {sg.user.studentGroups[0].studentNumber.toString().padStart(2, '0')}
                                  </div>
                                )}
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
                      onClick={() =>
                        nextUser && replace(`/teacher/activityv3/${activityId}/session/${sessionId}/${nextUser.id}`)
                      }
                    />
                  </div>
                  {/* 컨텐츠, 파일 영역 */}
                  <div className="relative my-5 h-full overflow-y-auto">
                    {activitySession.type === 'SURVEY' ? (
                      <div className="flex h-full">
                        <SuperSurveyViewComponent
                          surveyContent={activitySession?.surveyContent || '[]'}
                          setContent={() => {}}
                          content={surveyContent}
                          readOnly
                        />
                      </div>
                    ) : (
                      <div className="flex h-full flex-col gap-4 overflow-y-auto">
                        <div className="flex w-full px-8 whitespace-pre-line">{studentActivitySession?.content}</div>
                        <div className="flex flex-col gap-2">
                          {!!images?.length && (
                            <div className="grid w-full grid-flow-row grid-cols-6 gap-2 px-8 pb-2">
                              {images?.map((image: string, i: number) => (
                                <div
                                  key={image}
                                  className="aspect-square cursor-pointer rounded border border-neutral-200"
                                  onClick={() => {
                                    setActiveIndex(i)
                                    setImagesModalOpen(true)
                                  }}
                                >
                                  <LazyLoadImage
                                    src={`${Constants.imageUrl}${image}`}
                                    alt={getFileNameFromUrl(image)}
                                    title={getFileNameFromUrl(image)}
                                    loading="lazy"
                                    className="object-fit h-full w-full rounded"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 px-8">
                            {images?.map((fileUrl: string, index) => (
                              <div
                                key={index}
                                className="flex h-8 w-max cursor-pointer items-center justify-between rounded bg-zinc-100 px-2 py-1"
                              >
                                <button
                                  className="flex items-center gap-1 text-xs font-semibold text-zinc-800"
                                  onClick={() =>
                                    downloadFile(`${Constants.imageUrl}${fileUrl}`, getFileNameFromUrl(fileUrl))
                                  }
                                >
                                  {getFileNameFromUrl(fileUrl)}
                                </button>
                              </div>
                            ))}
                            {files?.map((fileUrl: string, index) => (
                              <div
                                key={index}
                                className="flex h-8 w-max cursor-pointer items-center justify-between rounded bg-zinc-100 px-2 py-1"
                              >
                                {isMobile() ? (
                                  <a
                                    className="flex items-center gap-1 text-xs font-semibold text-zinc-800"
                                    href={`${Constants.imageUrl}${fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    download={getFileNameFromUrl(fileUrl)}
                                  >
                                    {getFileNameFromUrl(fileUrl)}
                                  </a>
                                ) : (
                                  <div
                                    className="flex items-center gap-1 text-xs font-semibold text-zinc-800"
                                    onClick={() =>
                                      downloadFile(`${Constants.imageUrl}${fileUrl}`, getFileNameFromUrl(fileUrl))
                                    }
                                  >
                                    {getFileNameFromUrl(fileUrl)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        {studentActivitySession?.content && (
                          <div className="text-12 mt-auto flex items-center justify-end space-x-2 px-2 font-bold">
                            <span className="font-semibold text-gray-400">글자 수 (공백 제외)</span>&nbsp;
                            {studentActivitySession?.content?.replaceAll(' ', '').length}자&nbsp;
                            {new TextEncoder().encode(studentActivitySession?.content?.replaceAll(' ', '')).length} Byte
                            <span className="font-semibold text-gray-400">글자 수 (공백 포함)</span>&nbsp;
                            {studentActivitySession?.content?.length}자&nbsp;
                            {new TextEncoder().encode(studentActivitySession?.content).length}Byte
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-auto min-h-[80px] w-full rounded-b border-t border-t-gray-300 bg-gray-50 px-6 py-4">
                    <div className="text-14 flex flex-col gap-2">
                      {studentActivitySession ? (
                        <div className="flex flex-row items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <p>
                              최초 제출 일시 :&nbsp;
                              <Time date={studentActivitySession?.createdAt} className="text-14 text-inherit" /> (
                              <Time
                                date={studentActivitySession?.createdAt}
                                formatDistanceToNow
                                className="text-14 text-inherit"
                              />
                              )
                            </p>
                            <p>
                              마지막 수정 일시 :&nbsp;
                              <Time date={studentActivitySession?.updatedAt} className="text-14 text-inherit" /> (
                              <Time
                                date={studentActivitySession?.updatedAt}
                                formatDistanceToNow
                                className="text-14 text-inherit"
                              />
                              )
                            </p>
                          </div>
                          <div>
                            {(images.length !== 0 || files.length !== 0) && (
                              <button
                                onClick={() =>
                                  handleBulkDownload(batchData, `${activitySession.title}_${selectedUser.name}`)
                                }
                                className="flex h-8 w-max items-center justify-center gap-1 rounded border border-zinc-300 bg-white px-3 py-1 text-center text-xs text-zinc-800"
                              >
                                <Icon.Download /> 모든 파일 저장
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">제출내역이 존재하지 않습니다.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 1:1 피드백 영역 */}
                <div className="flex h-full w-1/3 flex-col overflow-hidden rounded border border-neutral-400">
                  <div className="relative h-full w-full flex-col space-y-4 overflow-y-auto bg-white p-5">
                    {isSessionCommentLoading && <div className="bg-littleblack absolute inset-0">로딩 중...</div>}
                    {studentActivitySession?.sessionComments
                      ?.sort((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1))
                      ?.map((sessionComment) => (
                        <SessionCommentItem
                          key={sessionComment.id}
                          me={me}
                          sessionComment={sessionComment}
                          refetch={() => refetchSAS()}
                        />
                      ))}
                  </div>
                  {studentActivitySession ? (
                    <div className="flex h-20 items-center justify-between border-t border-gray-300 px-4 py-4">
                      <Textarea
                        value={sessionComment || ''}
                        onChange={(e) => setSessionComment(e.target.value)}
                        className="h-auto w-full resize-none border-none px-0 py-0 text-sm"
                        placeholder="1:1 피드백 작성"
                        rows={3}
                        disabled={isSessionCommentLoading}
                      />
                      <Button
                        className="h-8 w-16 rounded-lg bg-orange-500 font-semibold text-white disabled:bg-gray-50 disabled:text-gray-500"
                        onClick={() =>
                          studentActivitySession &&
                          createSessionComment({
                            params: { sessionId: studentActivitySession?.id },
                            data: { content: sessionComment },
                          })
                        }
                        disabled={isSessionCommentLoading}
                      >
                        등록
                      </Button>
                    </div>
                  ) : (
                    <div className="flex min-h-[80px] items-center justify-center border-t border-gray-300 px-4 py-4">
                      <div className="text-sm text-gray-500">학생의 제출 이후 작성 가능합니다.</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          </div>
        </div>
      </div>
      <SuperModal
        modalOpen={isSurveyModalOpen}
        setModalClose={() => setSurveyModalOpen(false)}
        className="h-2/3 w-1/4 overflow-y-auto"
      >
        <SuperSurveyComponent
          surveyContent={activitySession?.surveyContent || '[]'}
          setContent={(c: any) => {}}
          content={{}}
          readOnly
        />
      </SuperModal>
      <div className="absolute">
        <Viewer
          visible={hasImagesModalOpen}
          rotatable
          noImgDetails
          scalable={false}
          images={viewerImages}
          onChange={(activeImage, index) => setActiveIndex(index)}
          onClose={() => setImagesModalOpen(false)}
          activeIndex={activeIndex}
        />
      </div>
    </div>
  )
}
