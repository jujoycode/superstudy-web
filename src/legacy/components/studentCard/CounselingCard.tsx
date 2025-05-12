import { useState } from 'react'
import { Select, Textarea } from '@/legacy/components/common'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { useTeacherCounseling } from '@/legacy/container/teacher-counseling'
import { UserContainer } from '@/legacy/container/user'
import { Category, Code, Counseling } from '@/legacy/generated/model'
import { isValidDate } from '@/legacy/util/time'
import { SuperModal } from '..'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'

interface CounselingCardProps {
  studentId: number
}

export function CounselingCard({ studentId }: CounselingCardProps) {
  const { me } = UserContainer.useContext()

  const {
    isEditMode,
    setIsEditMode,
    isAddMode,
    setIsAddMode,
    content,
    setContent,
    counselingAt,
    setCounselingAt,
    category,
    setCategory,
    counselorName,
    setCoulselorName,
    userId,
    setUserId,
    counselingData,
    createCounseling,
    deleteCounseling,
  } = useTeacherCounseling(studentId)

  const { categoryData: counselingType } = useCodeByCategoryName(Category.counselingtype)

  const [categoryObj, setCategoryObj] = useState<Code | undefined>()

  const [warnMsg, setWarnMsg] = useState('')
  const [alertDelete, setAlertDelete] = useState(false)
  const [deleteItem, setDeleteItem] = useState(-1)

  const categoryChanged = (item: Code) => {
    setCategoryObj(item)
    setCategory(item.name)
  }

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between text-xl font-semibold">
        <p>메모</p>
        <button
          children="메모추가"
          onClick={() => {
            setContent('')
            setCoulselorName(me?.name || '')
            setIsAddMode(true)
          }}
          className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange rounded-md px-2 py-1 text-sm focus:outline-none"
        />
      </div>
      <div className="relative flex h-full flex-col gap-4 rounded-lg border bg-white p-3">
        {isAddMode && (
          <div className="flex flex-col gap-1">
            <div className="grid md:grid-cols-3">
              <div className="flex">
                <div className="w-20 border-b-2 font-semibold">카테고리</div>
                <div className="border-b-2">
                  <Select.lg
                    value={categoryObj?.key}
                    onChange={(e) => {
                      const selItem = counselingType?.filter((item: Code) => item.key === Number(e.target.value))
                      selItem && categoryChanged(selItem[0])
                    }}
                    className="border-brand-1 h-6 py-0"
                  >
                    {counselingType?.map((item: Code) => (
                      <option key={item.key} value={item.key}>
                        {item.name}
                      </option>
                    ))}
                  </Select.lg>
                </div>
              </div>
              <div className="flex md:text-center">
                <div className="w-20 border-b-2 pl-2 font-semibold">등록일</div>
                <div className="border-b-2">
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
                    className="border-brand-1 h-6"
                  />
                </div>
              </div>
              <div className="flex md:text-right">
                <div className="w-20 border-b-2 pl-2 font-semibold">작성자</div>
                <div className="border-b-2">
                  <TextInput
                    placeholder="이름 입력"
                    value={counselorName}
                    onChange={(e) => setCoulselorName(e.target.value)}
                    className="border-brand-1 h-6"
                  />
                </div>
              </div>
            </div>
            <Textarea
              placeholder="내용 입력"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-brand-1 h-30"
            />
            <div className="flex flex-row-reverse gap-1 text-right">
              {setIsAddMode && (
                <button
                  children="취소"
                  className="bg-light_orange text-brand-1 hover:text-light_orange rounded-md px-2 py-1 text-sm hover:bg-red-50 focus:outline-none"
                  onClick={() => {
                    setIsAddMode(false)
                    setWarnMsg('')
                  }}
                />
              )}
              <button
                children="저장"
                className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange rounded-md px-2 py-1 text-sm focus:outline-none"
                onClick={() => {
                  if (categoryObj && categoryObj?.key >= 0) {
                    if (isAddMode) {
                      createCounseling()
                    } else {
                      setIsAddMode(true)
                    }
                  } else {
                    setWarnMsg('* 카테고리를 선택해주세요.')
                  }
                }}
              />
              {warnMsg !== '' && <div className="text-red-500">{warnMsg}</div>}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {counselingData?.length === 0 && !isAddMode && '기록이 없습니다.'}
          {counselingData
            ?.slice()
            .reverse()
            .map((item: Counseling) => (
              <div key={item.id} className="flex flex-col gap-1">
                <div className="grid md:grid-cols-3">
                  <span>카테고리 : {item?.category}</span>
                  <span className="md:text-center">등록일 : {item?.counselingAt}</span>
                  <span className="md:text-end">작성자 : {item?.counselorName}</span>
                </div>
                <Textarea value={item?.content} disabled className="h-30" />
                {false && !isAddMode && (
                  <div className="text-right">
                    <button
                      children="수정"
                      onClick={() => setIsEditMode(true)}
                      className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange rounded-md px-2 py-1 text-sm focus:outline-none"
                    />
                  </div>
                )}
                {item?.writerId === me?.id && !isAddMode && (
                  <button
                    children="삭제"
                    className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange self-end rounded-md px-2 py-1 text-sm focus:outline-none"
                    onClick={() => {
                      setDeleteItem(item?.id)
                      setAlertDelete(true)
                    }}
                  />
                )}
              </div>
            ))}
        </div>
      </div>
      <SuperModal modalOpen={alertDelete} setModalClose={() => setAlertDelete(false)} className="w-max">
        <div className="px-12 py-6">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">상담 기록을 삭제하시겠습니까?</div>
          <Button.lg
            children="삭제하기"
            onClick={() => {
              deleteCounseling(deleteItem)
              setAlertDelete(false)
            }}
            className="filled-primary w-full"
          />
        </div>
      </SuperModal>
    </div>
  )
}
