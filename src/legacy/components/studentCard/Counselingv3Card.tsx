import { useRef, useState } from 'react'

import { useOutletContext } from 'react-router-dom'
import { ReactComponent as DownArrow } from '@/assets/icons/chevron-down.svg'
import { ReactComponent as Plus } from '@/assets/svg/plus.svg'
import { Blank, Select } from '@/legacy/components/common'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { useTeacherCounseling } from '@/legacy/container/teacher-counseling'
import { UserContainer } from '@/legacy/container/user'
import { Category, Code, ResponseCounselingDetailDto } from '@/legacy/generated/model'
import { AccessLevels } from '@/legacy/types'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { isValidDate } from '@/legacy/util/time'
import Recorder from '../rec/Recorder'
import CounselingDetailCard from './CounselingDetailCard'

interface CounselingCardProps {
  studentId: number
  groupId: number
}

export default function Counselingv3Card() {
  const { studentId } = useOutletContext<CounselingCardProps>()

  const { me } = UserContainer.useContext()
  const [page, setPage] = useState(1)
  const [uploading, setUploading] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const {
    isEditMode,
    setIsEditMode,
    editId,
    setEditId,
    isAddMode,
    setIsAddMode,
    content,
    setContent,
    counselingAt,
    setCounselingAt,
    setCategory,
    setCoulselorName,
    accessLevel,
    setAccessLevel,
    counselingData,
    createCounseling,
    updateCounseling,
    deleteCounseling,
    isLoading,
  } = useTeacherCounseling(studentId)

  const recorderRef = useRef<{ uploadAndDestroy: (save: boolean) => void }>(null)

  const handleUpload = (fileNames: string[]) => {
    setUploading(false)
    if (fileNames.length === 0 || (fileNames[0] && fileNames[0] !== 'hold')) {
      if (editId) {
        //console.log('업데이트');
        updateCounseling(editId)
      } else {
        //console.log('생성');
        createCounseling(fileNames)
      }
    }
  }

  const { categoryData: counselingType } = useCodeByCategoryName(Category.counselingtype)

  const [categoryObj, setCategoryObj] = useState<Code | undefined>()

  const categoryChanged = (item: Code) => {
    setCategoryObj(item)
    setCategory(item.name)
  }

  const filteredData = counselingData || []

  let MAXPAGE = 0
  if (filteredData.length > 0) {
    MAXPAGE = Math.ceil(filteredData.length / 6)
  }

  const editCounseling = (id: number) => {
    const data = filteredData.find((item) => item.id === id)

    if (data?.id) {
      setEditId(data?.id)
      setIsEditMode(true)
      setIsAddMode(true)
      setCategoryObj(counselingType?.find((item) => item.name === data?.category))
      setCategory(data?.category)
      setCounselingAt(data?.counselingAt || DateUtil.formatDate(new Date(), DateFormat['YYYY-MM-DD']))
      setAccessLevel(data?.accessLevel || 0)
      setContent(data?.content || '')
      setCoulselorName(me?.name || '')
    }
  }

  const handleSave = () => {
    if (!categoryObj || categoryObj?.key < 0) {
      alert('카테고리를 선택해주세요.')
      return
    }

    if (!content.trim()) {
      alert('내용을 입력해주세요.')
      return
    }

    if (recorderRef.current) {
      setUploading(true)
      recorderRef.current.uploadAndDestroy(true)

      // 녹음파일 업로드가 완료된 이후 처리되도록 handleUpload() 로 이전
      //createCounseling();
    } else {
      if (editId) {
        updateCounseling(editId)
      } else {
        createCounseling()
      }
    }
  }

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isMobile = () => {
    return (
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    )
  }

  if (uploading) return <Blank />
  if (isLoading) return <Blank />

  return (
    <div ref={contentRef} className="scroll-box h-screen-12 md:h-screen-4 overflow-y-auto pb-4">
      <div className="relative mt-4 flex flex-col rounded-md border-2 bg-white p-4">
        <div className="flex items-center justify-between pt-3 md:pt-0">
          <h6 className="text-lg font-semibold">상담내역</h6>
          {filteredData.length !== 0 && (
            <button
              onClick={() => {
                setIsAddMode(true)
                setContent('')
                setCoulselorName(me?.name || '')
              }}
              className="border-darkgray hover:bg-darkgray flex h-8 w-24 items-center justify-center gap-1 rounded-lg border bg-white font-semibold transition-all hover:text-white"
            >
              <Plus />
              <p>상담 추가</p>
            </button>
          )}
        </div>
        {filteredData.length === 0 && (
          <div className="mt-4 flex h-[228px] flex-col items-center justify-center gap-4 rounded-[4px] bg-[#F3F3F3] text-sm">
            <button
              onClick={() => {
                setIsAddMode(true)
                setContent('')
                setCoulselorName(me?.name || '')
              }}
              className="border-darkgray hover:bg-darkgray flex h-8 w-24 items-center justify-center gap-1 rounded-lg border bg-white font-semibold transition-all hover:text-white"
            >
              <Plus />
              <p>상담 추가</p>
            </button>
            <p className="text-center text-[#999999]">
              상담 내역이 없습니다.
              <br />
              상담 추가 버튼을 눌러 내용을 추가해 보세요.
            </p>
          </div>
        )}
        {filteredData.length > 0 && (
          <div className="mt-4 flex grid-cols-2 flex-col gap-4 2xl:grid">
            {filteredData
              .slice()
              .reverse()
              .slice(0, 6 * page)
              .map((item: ResponseCounselingDetailDto) => (
                <div key={item.id}>
                  <CounselingDetailCard
                    data={item}
                    deleteCounseling={deleteCounseling}
                    editCounseling={editCounseling}
                  />
                </div>
              ))}
          </div>
        )}

        {filteredData.length > 6 && (
          <>
            {page < MAXPAGE ? (
              <button
                onClick={() => setPage((page) => page + 1)}
                className="border-darkgray hover:bg-darkgray mt-4 flex w-full items-center justify-center gap-2 rounded-md py-2 text-[#666666] transition-all hover:text-white md:border"
              >
                <DownArrow />
                <p>더 보기 ({`${page}/${MAXPAGE}`})</p>
              </button>
            ) : (
              <button
                onClick={() => {
                  setPage(1)
                  scrollToTop()
                }}
                className="border-darkgray hover:bg-darkgray mt-4 flex w-full items-center justify-center gap-2 rounded-md border py-2 text-[#666666] transition-all hover:text-white"
              >
                <p>접기</p>
              </button>
            )}
          </>
        )}
        {(isAddMode || isEditMode) && (
          <div className="bg-littleblack fixed inset-0 z-60 flex h-screen w-full items-center justify-center">
            <section className="relative mx-4 flex h-2/3 w-full flex-col rounded-lg bg-white p-6 pb-20 md:mx-0 md:h-1/2 md:w-1/2 md:pb-0">
              <div className="flex items-center justify-between md:pb-4">
                <h1 className="text-xl font-bold">상담카드 작성</h1>
                <button
                  className="border-darkgray hover:bg-darkgray hidden h-8 w-12 rounded-md border font-semibold transition-all hover:text-white md:block"
                  onClick={() => {
                    if (recorderRef.current) {
                      recorderRef.current.uploadAndDestroy(false)
                    }
                    setIsAddMode(false)
                    setEditId(undefined)
                  }}
                >
                  취소
                </button>
                {/* <p className="block md:hidden text-darkgray text-sm">상담 학생 : </p> */}
              </div>
              <nav className="mt-2 flex w-full flex-col justify-between space-y-2 xl:mt-0 xl:flex-row">
                <span className="flex gap-2 md:flex-row md:items-center md:gap-4">
                  <Select.lg
                    value={categoryObj?.key}
                    onChange={(e) => {
                      const selItem = counselingType?.filter((item: Code) => item.key === Number(e.target.value))
                      selItem && categoryChanged(selItem[0])
                    }}
                    className="h-8 w-1/3 rounded-md border border-[#DDDDDD] py-0 text-xs focus:border-black lg:h-10 lg:w-40 lg:text-sm"
                  >
                    {counselingType?.map((item: Code) => (
                      <option key={item.key} value={item.key}>
                        {item.name}
                      </option>
                    ))}
                  </Select.lg>

                  <TextInput
                    type="date"
                    value={counselingAt}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value)
                      if (!isValidDate(selectedDate)) {
                        return
                      }
                      setCounselingAt(e.target.value)
                    }}
                    className="h-8 w-1/3 rounded-md border border-[#DDDDDD] text-right text-xs focus:border-black lg:h-10 lg:w-40 lg:text-sm"
                  />

                  <Select.lg
                    value={accessLevel}
                    onChange={(e) => {
                      setAccessLevel(Number(e.target.value))
                    }}
                    className="h-8 w-1/3 rounded-md border border-[#DDDDDD] py-0 text-xs focus:border-black lg:h-10 lg:w-40 lg:text-sm"
                  >
                    {AccessLevels?.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select.lg>
                </span>

                {/* <p className="hidden md:block">상담 학생 : </p> */}
                <div className="relative">
                  <div className="flex items-center gap-4">
                    <div className="hidden xl:block">
                      {!isMobile() && (
                        <div className="pointer-events-none opacity-50 md:pointer-events-auto md:opacity-100">
                          <Recorder ref={recorderRef} onUpload={handleUpload} />
                        </div>
                      )}
                    </div>
                    {isMobile() && (
                      <span className="text-xs text-gray-500">모바일에서는 녹음 기능을 사용할 수 없습니다</span>
                    )}
                  </div>
                </div>
              </nav>
              <textarea
                placeholder="상담 내용을 입력해 주세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-2 w-full flex-1 resize-none rounded-lg border border-[#DDDDDD] focus:border-black focus:ring-0"
              />
              <nav className="absolute inset-x-0 bottom-0 flex h-16 w-full md:hidden">
                <button
                  className="w-1/2 border-t font-semibold"
                  onClick={() => {
                    setIsAddMode(false)
                  }}
                >
                  취소
                </button>
                <button onClick={handleSave} className="bg-brand-1 w-1/2 rounded-br-lg text-white">
                  저장하기
                </button>
              </nav>
              <button
                onClick={handleSave}
                className="bg-brand-1 my-4 hidden h-10 w-full rounded-lg text-xl font-bold text-white md:block"
              >
                저장하기
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
