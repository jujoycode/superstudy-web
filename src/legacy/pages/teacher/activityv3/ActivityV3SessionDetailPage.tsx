import { useMemo, useState } from 'react'
import { differenceInSeconds, format } from 'date-fns'
import _ from 'lodash'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import { useLocation, useParams } from 'react-router-dom'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { ReactComponent as FileItemIcon } from '@/assets/svg/file-item-icon.svg'
import { useHistory } from '@/hooks/useHistory'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import { Button } from '@/atoms/Button'
import { Radio } from '@/atoms/Radio'
import { SuperModal } from '@/legacy/components'
import { Activityv3SubmitterItem } from '@/legacy/components/activityv3/ActivityV3SubmitterItem'
import { SessionDownloadModal } from '@/legacy/components/activityv3/SessionDownloadModal'
import { BackButton, Label, Select, TopNavbar } from '@/legacy/components/common'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import ConfirmDialog from '@/legacy/components/common/ConfirmDialog'
import FileDownloadProgressModal from '@/legacy/components/common/FileDownloadProgressModal'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { SuperSurveyComponent } from '@/legacy/components/survey/SuperSurveyComponent'
import { Constants } from '@/legacy/constants'
import { ACTIVITYV3_TYPE_KOR } from '@/legacy/constants/activityv3.enum'
import {
  useActivitySessionDelete,
  useActivitySessionFindOne,
  useActivitySessionFindSubmitters,
  useActivityV3FindOne,
  useStudentActivitySessionFindOneByTeacher,
} from '@/legacy/generated/endpoint'
import { ActivityType, Role, StudentGroup } from '@/legacy/generated/model'
import { handleSizeLimitedBatchDownload } from '@/legacy/util/download-batch'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'
import { makeStudNum5 } from '@/legacy/util/status'
import { makeDateToString, makeTimeToString } from '@/legacy/util/time'

interface ActivityV3SessionDetailPageProps {}

const SELECT_VIEWS = [
  { value: 'student', label: '학생별 보기' },
  { value: 'group', label: '그룹별 보기' },
]

const SELECT_SUBMITTED = [
  { value: 'all', label: '전체' },
  { value: 'IS_SUBMITTED', label: '제출' },
  { value: 'NOT_SUBMITTED', label: '미제출' },
]

export const ActivityV3SessionDetailPage: React.FC<ActivityV3SessionDetailPageProps> = () => {
  const { id: activityId, sessionId } = useParams<{ id: string; sessionId: string }>()
  const id = Number(sessionId)
  const { pathname, search } = useLocation()
  const { push, replace } = useHistory()
  const searchParams = new URLSearchParams(search)
  const selectedUserId = searchParams.get('selectedUserId')
  const view = searchParams.get('view') || 'group'
  const selectedFilter = searchParams.get('selectedFilter') || 'all'
  const { me } = useUserStore()
  const { setToast: setToastMsg } = useNotificationStore()
  const [searchedStudentname, setSearchedStudentName] = useState('')
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false)
  const [isSurveyModalOpen, setSurveyModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showDialog, setShowDialog] = useState(false)
  // 제출물 일괄 다운로드 프로그래스
  const [progress, setProgress] = useState({
    isDownloading: false,
    percentage: 0,
    isError: false,
  })

  const handleBatchDownload = (submittedStudentGroups: StudentGroup[], groupName: string) => {
    const groupFilter = activitySession?.studentActivitySessions?.filter((s) =>
      submittedStudentGroups.some((sg) => sg.user?.id === s.userId),
    )

    // 제출한 학생의 학번 정보와 다운받을 파일 정보 추출

    const fileInfo = submittedStudentGroups
      .map((studentGroup) => {
        const klassNum = makeStudNum5({
          grade: Number(studentGroup.user?.studentGroups?.[0]?.group?.grade),
          classNum: Number(studentGroup.user?.studentGroups?.[0]?.group?.klass),
          studentNum: Number(studentGroup.user?.studentGroups?.[0]?.studentNumber),
        })

        const studentActivitySession = groupFilter?.find((s) => s.userId === studentGroup.user?.id)
        const files = studentActivitySession?.files || []
        const images = studentActivitySession?.images || []

        return {
          user: {
            id: studentGroup.user?.id,
            name: studentGroup.user?.name,
            klassNum,
          },
          fileUrls: [...files, ...images],
        }
      })
      .sort((a, b) => parseInt(a.user.klassNum) - parseInt(b.user.klassNum))

    // 해당 그룹에 제출한 학생이 없으면 다운로드 진행하지 않고 토스트 메시지 표시
    if (groupFilter?.length === 0) {
      setToastMsg('<b>[이미지/파일]을 제출한 학생이 없습니다.</b>')
      return
    }

    const fileUrls: string[] = []
    const fileNames: string[] = []

    fileInfo.forEach((file) => {
      file.fileUrls.forEach((fileUrl) => {
        fileUrls.push(fileUrl)
        fileNames.push(file.user.klassNum + '_' + file.user.name + '_' + getFileNameFromUrl(fileUrl))
      })
    })

    if (fileUrls.length === 0) {
      setToastMsg('<b>[이미지/파일]을 제출한 학생이 없습니다.</b>')
      return
    } else {
      setToastMsg('<b>[이미지/파일]을 제출한 학생의 제출파일</b>만 다운로드 됩니다.')
    }

    setProgress({
      isDownloading: true,
      percentage: 0,
      isError: false,
    })

    // 활동 차시 번호 추출
    const activitySessionNumber = (activityv3?.activitySessions?.findIndex((session) => session.id === id) || 0) + 1

    const fileTitle = `${groupName}_${activitySession?.activityv3?.title}_${activitySessionNumber}차시`

    void handleSizeLimitedBatchDownload({
      files: fileUrls,
      baseFileName: fileTitle,
      options: {
        fileNames: fileNames,
        onProgress: (info) => {
          setProgress({
            isDownloading: info.percentage !== 100 && !info.isError,
            percentage: info.percentage,
            isError: info.isError || false,
          })
        },
      },
    })
  }

  const handleConfirm = () => {
    deleteActivitySession({ id: Number(id) })
    setShowDialog(false)
  }

  const handleCancel = () => {
    setShowDialog(false)
  }

  const { data: activitySession } = useActivitySessionFindOne(Number(id), {
    query: { enabled: !!id },
  })
  const { data: activityv3 } = useActivityV3FindOne(Number(activitySession?.activityv3Id), undefined, {
    query: { enabled: !!activitySession?.activityv3Id },
  })

  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>(
    activityv3?.groupActivityV3s?.map((gav) => gav.groupId) || [],
  )

  useStudentActivitySessionFindOneByTeacher(
    {
      studentId: Number(selectedUserId),
      sessionId: activitySession?.id || 0,
    },
    { query: { enabled: !!selectedUserId && !!activitySession?.id } },
  )

  const groupIds = activityv3?.groupActivityV3s?.map((el) => el.groupId) || []

  const { data } = useActivitySessionFindSubmitters(
    { id: activitySession?.id || 0, groupIds },

    {
      query: {
        enabled: !!activitySession?.id && groupIds.length > 0,
        staleTime: 60000,
      },
    },
  )

  const { mutate: deleteActivitySession } = useActivitySessionDelete({
    mutation: {
      onSuccess: () => {
        push('/teacher/activityv3')
      },
      onError: (error) => setToastMsg(error.message),
    },
  })

  const studentGroups: StudentGroup[] = useMemo(() => {
    if (!data) return []
    return _.chain(data).uniqBy('user.id').sortBy('groupId').value()
  }, [data])
  const submittedStudentAmount =
    studentGroups?.filter((sg) => sg.user?.studentActivitySessions?.[0]?.isSubmitted).length || 0
  const unSubmittedStudentAmount = (studentGroups?.length || 0) - submittedStudentAmount

  const studentsByGroupData =
    studentGroups?.reduce((acc: Record<number, StudentGroup[]>, cur) => {
      return {
        ...acc,
        [cur.groupId]: [...(acc[cur.groupId] || []), cur],
      }
    }, {}) || {}

  if (!activitySession) return <></>

  const type = activitySession.type

  const viewerImages: ImageDecorator[] = []
  for (const image of activitySession.images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  const getDDayLabel = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffSeconds = differenceInSeconds(end, now)

    if (diffSeconds > 0) {
      return `D-${Math.floor(diffSeconds / (60 * 60 * 24))}` // D-Day 계산
    } else if (diffSeconds === 0) {
      return 'D-Day'
    } else {
      return `D+${Math.abs(Math.floor(diffSeconds / (60 * 60 * 24)))}` // 경과한 D-Day 계산
    }
  }

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

  if (!activityv3) return <></>
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
            <div className="flex flex-col rounded-sm border border-neutral-200">
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
                                <div className="aspect-square rounded-sm border border-neutral-200">
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
                                className="flex h-8 w-max items-center space-x-2 rounded-sm bg-stone-50 px-3 py-1"
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
            <div className="mt-4 flex flex-col rounded-sm border-2 border-zinc-800">
              <div className="border-b border-neutral-200 px-10 pt-8 pb-8">
                <div className="flex items-baseline justify-between pb-4">
                  <h1 className="flex-1 text-2xl font-bold break-words whitespace-pre-line">{activitySession.title}</h1>
                  {(me?.role === Role.ADMIN || activityv3?.writerId === me?.id) && (
                    <div className="ml-4 flex shrink-0 items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => push(`/teacher/activityv3/${activityv3?.id}/session/${id}/update`)}
                        children="수정"
                      ></Button>
                      <Button
                        size="sm"
                        className="border-red-500 text-red-500"
                        variant="outline"
                        onClick={() => setShowDialog(true)}
                        children="삭제"
                      />
                    </div>
                  )}
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
                              <div
                                key={i}
                                onClick={() => {
                                  setActiveIndex(i)
                                  setImagesModalOpen(true)
                                }}
                                className="w-full"
                              >
                                <div className="aspect-square cursor-pointer rounded-sm border border-neutral-200">
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
                          <div className="flex gap-1 pb-2">
                            {activitySession.files?.map((fileUrl: string, index) => (
                              <div
                                key={index}
                                className="flex h-8 items-center space-x-2 rounded-sm bg-stone-50 px-3 py-1"
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
                        size="sm"
                        variant="outline"
                        color="secondary"
                        children="설문지 보기"
                        onClick={() => setSurveyModalOpen(true)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {activitySession.type !== ActivityType.NOTICE && (
              <>
                <div className="mt-16">
                  <div className="flex items-center justify-between">
                    <div className="text-24 font-bold whitespace-pre">제출자 현황</div>
                    <Button children="제출현황 다운로드" onClick={() => setDownloadModalOpen(true)} />
                  </div>
                  <div className="mt-4 flex rounded-sm border border-zinc-800 text-[#333333]">
                    <div className="text-16 flex w-full items-center justify-between border-r border-zinc-800 p-4 font-bold">
                      <div>제출</div>
                      <div className="flex items-center">
                        <span className="mr-1 text-3xl font-bold">{submittedStudentAmount}</span>명
                      </div>
                    </div>
                    <div className="text-16 flex w-full items-center justify-between border-r border-zinc-800 p-4 font-bold">
                      <div>미제출</div>
                      <div className="flex items-center">
                        <span className="mr-1 text-3xl font-bold">{unSubmittedStudentAmount}</span>명
                      </div>
                    </div>
                    <div className="text-16 flex w-full items-center justify-between p-4 font-bold">
                      <div>제출 마감</div>
                      {activitySession?.endDate ? (
                        <div className="text-center text-3xl font-bold">{getDDayLabel(activitySession?.endDate)}</div>
                      ) : (
                        <div className="text-3xl font-bold">-</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 bg-gray-50 p-4">
                    <div className="flex space-x-6">
                      <div className="text-15 border-r border-[#DDD] px-2 whitespace-pre md:w-40">전달 대상</div>
                      <div className="w-full">
                        <div className="text-14 mb-2 flex items-center space-x-2">
                          <Checkbox
                            id="select-all"
                            checked={selectedGroupIds.length === activityv3?.groupActivityV3s?.length}
                            onChange={() =>
                              selectedGroupIds.length === activityv3?.groupActivityV3s?.length
                                ? setSelectedGroupIds([])
                                : setSelectedGroupIds(activityv3?.groupActivityV3s?.map((gav) => gav.groupId) || [])
                            }
                          />
                          <label htmlFor="select-all" className="cursor-pointer">
                            전체
                          </label>
                        </div>
                        {_.chain(activityv3?.groupActivityV3s || [])
                          .sortBy(['group.grade', 'group.klass'])
                          .map((el) => (
                            <div
                              key={el.groupId}
                              className="text-14 mr-4 mb-2 inline-block rounded-md bg-gray-50 whitespace-pre"
                            >
                              <div className="text-14 flex items-center space-x-2">
                                <Checkbox
                                  id={String(el.groupId)}
                                  checked={selectedGroupIds.includes(el.groupId)}
                                  onChange={() =>
                                    selectedGroupIds.includes(el.groupId)
                                      ? setSelectedGroupIds(selectedGroupIds.filter((id) => id !== el.groupId))
                                      : setSelectedGroupIds(selectedGroupIds.concat(el.groupId))
                                  }
                                />
                                <label htmlFor={String(el.groupId)} className="cursor-pointer">
                                  {el.group?.name || ''}
                                </label>
                              </div>
                            </div>
                          ))
                          .value()}
                      </div>
                    </div>
                    <div className="flex space-x-6">
                      <div className="text-15 border-r border-[#DDD] px-2 pt-2 whitespace-pre md:w-40">제출 여부</div>
                      <div className="flex w-full items-center space-x-4 pt-2">
                        {SELECT_SUBMITTED.map(({ value, label }) => (
                          <Label.row htmlFor={value} key={value}>
                            <Radio
                              id={value}
                              name="submitted-filter"
                              checked={selectedFilter === value}
                              onChange={() => {
                                searchParams.set('selectedFilter', value)
                                replace({
                                  pathname,
                                  search: searchParams.toString(),
                                })
                              }}
                            />
                            <div className="text-14">{label}</div>
                          </Label.row>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Select.lg
                        value={view}
                        className="h-10 w-48 rounded-lg border border-neutral-200"
                        onChange={(e) => {
                          searchParams.set('view', e.target.value)
                          replace({
                            pathname,
                            search: searchParams.toString(),
                          })
                        }}
                      >
                        {SELECT_VIEWS.map((filter) => (
                          <option key={filter.value} value={filter.value} className="text-sm text-zinc-800">
                            {filter.label}
                          </option>
                        ))}
                      </Select.lg>
                    </div>
                    <div className="relative flex items-center space-x-2">
                      <SearchInput
                        placeholder="학생 이름으로 검색해 보세요."
                        onChange={(e) => setSearchedStudentName(e.target.value)}
                        value={searchedStudentname}
                        className="h-10 w-80 rounded-lg border border-neutral-200 text-neutral-400"
                      />
                      <Icon.Search className="absolute right-2" />
                    </div>
                  </div>
                </div>

                <div className="min-h-screen-48 bg-white py-4 text-[#333]">
                  {view === 'student' && (
                    <div className="space-y-1 pb-2">
                      <div className="flex justify-between py-2">
                        <div className="flex w-full items-center justify-between">
                          <div className="text-xl font-bold">전체 학급</div>
                          <div className="text-lg">
                            제출&nbsp;
                            <span className="text-primary-800">{submittedStudentAmount || 0}</span>/
                            {studentGroups?.length || 0}명
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div
                    className={
                      view === 'student' ? 'grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3' : ''
                    }
                  >
                    {_.chain(activityv3?.groupActivityV3s || [])
                      .sortBy(['group.grade', 'group.klass'])
                      .map((ga) => {
                        const studentGroups = studentsByGroupData[ga.groupId]
                          ?.filter((sg) => !selectedGroupIds.length || selectedGroupIds.includes(sg.groupId))
                          ?.filter((sg) => !searchedStudentname || sg.user.name.includes(searchedStudentname))

                        const submittedStudentGroups = studentGroups?.filter(
                          (el) => el?.user?.studentActivitySessions?.[0]?.isSubmitted,
                        )
                        const unSubmittedStudentGroups = studentGroups?.filter(
                          (el) => !el?.user?.studentActivitySessions?.[0]?.isSubmitted,
                        )

                        if (!studentGroups?.length) {
                          return <></>
                        }

                        if (view === 'student') {
                          return sortStudentGroups(
                            studentGroups?.filter((sg) => {
                              if (selectedFilter === 'NOT_SUBMITTED') {
                                return !sg?.user?.studentActivitySessions?.[0]?.isSubmitted
                              }

                              if (selectedFilter === 'IS_SUBMITTED') {
                                return sg?.user?.studentActivitySessions?.[0]?.isSubmitted
                              }

                              return true
                            }),
                          )?.map((sg: StudentGroup) => (
                            <Activityv3SubmitterItem
                              key={sg.id}
                              studentGroup={sg}
                              id={Number(activityId)}
                              sessionId={id}
                              submitted={sg?.user?.studentActivitySessions?.[0]?.isSubmitted}
                              submittedAt={sg?.user?.studentActivitySessions?.[0]?.submittedAt || ''}
                              endDate={activitySession.endDate}
                            />
                          ))
                        }

                        return (
                          <div className="space-y-1 pb-2" key={ga.id}>
                            <div className="flex justify-between py-2">
                              <div className="flex w-full items-center justify-between">
                                <div className="text-xl font-bold">{ga.group?.name}</div>
                                <div className="flex items-center gap-4">
                                  {activitySession?.isFile && (
                                    <Button
                                      children="파일 일괄 다운로드"
                                      onClick={() => handleBatchDownload(submittedStudentGroups, ga.group?.name || '')}
                                    />
                                  )}

                                  <div className="text-lg">
                                    제출&nbsp;
                                    <span className="text-primary-800">{submittedStudentGroups.length || 0}</span>/
                                    {studentGroups?.length || 0}명
                                  </div>
                                </div>
                              </div>
                            </div>
                            {selectedFilter === 'all' && (
                              <div className="grid grid-cols-2 gap-2 pb-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                                {sortStudentGroups(studentGroups).map((sg: StudentGroup) => (
                                  <Activityv3SubmitterItem
                                    key={sg.id}
                                    studentGroup={sg}
                                    id={Number(activityId)}
                                    sessionId={id}
                                    submitted={sg?.user?.studentActivitySessions?.[0]?.isSubmitted}
                                    submittedAt={sg?.user?.studentActivitySessions?.[0]?.submittedAt || ''}
                                    endDate={activitySession.endDate}
                                  />
                                ))}
                              </div>
                            )}
                            {selectedFilter === 'IS_SUBMITTED' && (
                              <div className="grid grid-cols-2 gap-2 pb-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                                {sortStudentGroups(submittedStudentGroups).map((sg: StudentGroup) => (
                                  <Activityv3SubmitterItem
                                    key={sg.id}
                                    studentGroup={sg}
                                    id={Number(activityId)}
                                    sessionId={id}
                                    submitted={sg?.user?.studentActivitySessions?.[0]?.isSubmitted}
                                    submittedAt={sg?.user?.studentActivitySessions?.[0]?.submittedAt || ''}
                                    endDate={activitySession.endDate}
                                  />
                                ))}
                              </div>
                            )}
                            {selectedFilter === 'NOT_SUBMITTED' && (
                              <div className="grid grid-cols-2 gap-2 pb-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                                {sortStudentGroups(unSubmittedStudentGroups).map((sg: StudentGroup) => (
                                  <Activityv3SubmitterItem
                                    key={sg.id}
                                    studentGroup={sg}
                                    id={Number(id)}
                                    sessionId={id}
                                    submitted={sg?.user?.studentActivitySessions?.[0]?.isSubmitted}
                                    submittedAt={sg?.user?.studentActivitySessions?.[0]?.submittedAt || ''}
                                    endDate={activitySession.endDate}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })
                      .value()}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <FileDownloadProgressModal
        percentage={progress.percentage}
        isDownloading={progress.isDownloading}
        isError={progress.isError}
        onErrorConfirm={() => {
          setProgress({ isDownloading: false, percentage: 0, isError: false })
        }}
      />

      {showDialog && (
        <ConfirmDialog
          message="해당 차시를 삭제하시겠습니까 ?"
          description={`삭제된 내용은 다시 불러올 수 없습니다. \n한번 더 확인해 주세요.`}
          confirmText="삭제"
          cancelText="취소"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      <SuperModal
        modalOpen={isSurveyModalOpen}
        setModalClose={() => setSurveyModalOpen(false)}
        className="h-2/3 w-1/4 overflow-y-auto"
      >
        <SuperSurveyComponent
          surveyContent={activitySession?.surveyContent || '[]'}
          setContent={() => {}}
          content={{}}
          readOnly
        />
      </SuperModal>
      <SessionDownloadModal
        sessionId={activitySession.id}
        modalOpen={isDownloadModalOpen}
        setModalClose={() => setDownloadModalOpen(false)}
      />
      <div className="absolute">
        <Viewer
          visible={hasImagesModalOpen}
          rotatable
          noImgDetails
          scalable={false}
          images={viewerImages}
          onChange={(_, index) => setActiveIndex(index)}
          onClose={() => setImagesModalOpen(false)}
          activeIndex={activeIndex}
        />
      </div>
    </div>
  )
}
