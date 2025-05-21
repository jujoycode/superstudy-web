import { cn } from '@/utils/commonUtil'
import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from 'react-query'
import { ReactComponent as SvgUser } from '@/assets/svg/user.svg'
import { Select } from '@/legacy/components/common'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Constants } from '@/legacy/constants'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { useTeacherStudentUpdate } from '@/legacy/container/teacher-student-update'
import { useTeacherStudentCard } from '@/legacy/container/teacher-studentcard'
import { Category, Code, ResponseParentUserDto } from '@/legacy/generated/model'
import { Validator } from '@/legacy/util/validator'

interface StudentInfoCardProps {
  id: number
}

export function StudentInfoCard({ id }: StudentInfoCardProps) {
  const queryClient = useQueryClient()
  const [studentStatesKey, setStudentStatesKey] = useState(0)

  const { studentInfo: info } = useTeacherStudentCard(id)

  const { categoryData: studentStates } = useCodeByCategoryName(Category.studentstatus)

  const {
    isEditMode,
    setIsEditMode,
    phone,
    setPhone,
    barcode,
    setBarcode,
    nokName,
    setNokName,
    nokPhone,
    setNokPhone,
    expired,
    setExpired,
    expiredReason,
    setExpiredReason,
    profile,
    birthDate,
    setBirthDate,
    setStudentInfo,
    updateStudent,
    sendParentSignUpV2Mutate,
    handleChangeImage,
    toggleImageDelete,
  } = useTeacherStudentUpdate()

  const studentInfo = useMemo(() => {
    setStudentInfo(info?.student)
    return info?.student
  }, [info])
  const parentInfo = useMemo(() => info?.parents, [info])

  useEffect(() => {
    if (expiredReason && studentStates) {
      const selItem = studentStates?.filter((item: Code) => item.name === expiredReason)
      if (selItem) {
        setStudentStatesKey(selItem[0].key)
      }
    }
  }, [expiredReason, studentStates])

  const checkParentJoin = () => {
    let rst = false

    if (nokPhone) {
      parentInfo?.map((item: ResponseParentUserDto) => {
        if (nokPhone === item.phone) {
          rst = true
        }
      })
    } else {
      rst = true
    }
    return rst
  }

  const klassName = studentInfo?.klassGroupName
    ? studentInfo?.klassGroupName + ' ' + studentInfo?.studentNumber.toString() + '번'
    : ''

  const studMyRole = studentInfo?.studentRole

  const setStudExpiredObj = (exp: Code) => {
    console.log(exp)
    setExpired(exp.etc1 === 'true' ? true : false)
    setExpiredReason(exp.name)
  }

  return (
    <div className="mb-5">
      <div className="flex justify-between text-xl font-semibold">
        <p>학생정보카드</p>
        <p> {studentInfo?.firstVisit && <div className="text-red-500">미가입</div>}</p>
      </div>
      <div className="relative h-full rounded-lg border bg-white p-3">
        <div className="w-full border px-30 py-3 md:hidden">
          <img src={`${Constants.imageUrl}${profile}`} alt="" loading="lazy" />
        </div>
        <table className="w-full">
          <tr>
            <td className="w-32 border-b-2 font-semibold">학번</td>
            <td className="border-b-2">
              {klassName} ({studMyRole})
            </td>
            <td className="hidden w-60 border p-4 md:table-cell" rowSpan={11}>
              {isEditMode ? (
                <>
                  {profile && (
                    <span className="absolute top-3 right-3 z-40 block h-6 w-6 rounded-full bg-red-700 ring-2 ring-white">
                      <div
                        className="flex h-full w-full cursor-pointer items-center justify-center text-white"
                        onClick={() => {
                          toggleImageDelete()
                        }}
                        style={{ transform: 'translate(0.1px, 0.1px)' }}
                      >
                        X
                      </div>
                    </span>
                  )}
                  <label htmlFor="imageupload">
                    <div className=" ">
                      <div className="h-full w-full rounded-sm bg-white object-cover">
                        <div className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                          <img
                            src={`${Constants.imageUrl}${profile}`}
                            alt=""
                            loading="lazy"
                            onError={({ currentTarget }) => {
                              currentTarget.onerror = null // prevents looping
                              currentTarget.src = SvgUser as unknown as string
                              currentTarget.className = 'w-full'
                            }}
                          />
                          {!profile && (
                            <div className="text-primary-800 h-full w-full text-center">학생사진을 선택해주세요.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="imageupload"
                    accept=".pdf, .png, .jpeg, .jpg"
                    onChange={(e) => handleChangeImage(e)}
                    className="hidden"
                  />
                </>
              ) : (
                <img
                  src={`${Constants.imageUrl}${profile}`}
                  alt=""
                  loading="lazy"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null // prevents looping
                    currentTarget.src = SvgUser as unknown as string
                    currentTarget.className = 'w-full'
                  }}
                />
              )}
            </td>
          </tr>
          <tr>
            <td className="border-b-2 font-semibold">이름</td>
            <td className="border-b-2">{studentInfo?.name}</td>
          </tr>
          <tr>
            <td className="border-b-2 font-semibold">이메일</td>
            <td className="border-b-2">{studentInfo?.email}</td>
          </tr>
          <tr>
            <td className="border-b-2 font-semibold">전화번호</td>
            <td className="border-b-2">
              {isEditMode ? (
                <TextInput
                  placeholder="전화번호 입력"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-primary-800 h-5 w-48"
                />
              ) : (
                phone
              )}
            </td>
          </tr>
          <tr>
            <td className="border-b-2 font-semibold">생년월일</td>
            <td className="border-b-2">
              {isEditMode ? (
                <TextInput
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="border-primary-800 h-5 w-48"
                />
              ) : (
                birthDate
              )}
            </td>
          </tr>
          <tr>
            <td className="border-b-2 font-semibold">바코드</td>
            <td className="border-b-2">
              {isEditMode ? (
                <TextInput
                  placeholder="바코드 입력"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="border-primary-800 h-5 w-48"
                />
              ) : (
                barcode
              )}
            </td>
          </tr>
          {/* <tr>
            <td className="border-b-2 font-semibold">희망진로</td>
            <td className="border-b-2">
              {isEditMode ? (
                <TextInput
                  placeholder="희망진로 입력"
                  value={hopePath}
                  onChange={(e) => setHopePath(e.target.value)}
                  className="h-5 w-48 border-primary-800"
                />
              ) : (
                hopePath
              )}
            </td>
          </tr>
          <tr>
            <td className="border-b-2 font-semibold">희망학과</td>
            <td className="border-b-2">
              {isEditMode ? (
                <TextInput
                  placeholder="희망학과 입력"
                  value={hopeMajor}
                  onChange={(e) => setHopeMajor(e.target.value)}
                  className="h-5 w-48 border-primary-800"
                />
              ) : (
                hopeMajor
              )}
            </td>
          </tr> */}
          <tr>
            <td className="border-b-2 font-semibold">학적상태</td>
            <td className="border-b-2">
              {isEditMode ? (
                <Select.lg
                  placeholder="학적 선택"
                  value={studentStatesKey}
                  onChange={(e) => {
                    const selItem = studentStates?.filter((item: Code) => item.key === Number(e.target.value))
                    selItem && setStudExpiredObj(selItem[0])
                  }}
                  className="border-primary-800 h-6 w-48 py-0"
                >
                  {studentStates?.map((item: Code) => (
                    <option key={item.key} value={item.key} className={cn(item?.etc1 === 'true' && 'text-red-500')}>
                      {item.name}
                    </option>
                  ))}
                </Select.lg>
              ) : (
                <div className={` ${expired && 'text-red-500'} `}>{expiredReason}</div>
              )}
            </td>
          </tr>
          <tr>
            <td className="w-32 border-b-2 font-semibold">보호자이름</td>
            <td className="border-b-2">
              {isEditMode ? (
                <TextInput
                  placeholder="이름 입력"
                  value={nokName}
                  onChange={(e) => setNokName(e.target.value)}
                  onKeyDown={(e) => {
                    if (Validator.onlyEngAndHan(e.key) === false) {
                      e.preventDefault()
                    }
                  }}
                  className="border-primary-800 h-5 w-48"
                />
              ) : (
                nokName
              )}
            </td>
          </tr>
          <tr>
            <td className="border-b-2 font-semibold">보호자전화번호</td>
            <td className="border-b-2">
              {isEditMode ? (
                <TextInput
                  placeholder="전화번호 입력"
                  value={nokPhone}
                  onChange={(e) => setNokPhone(e.target.value)}
                  className="border-primary-800 h-5 w-48"
                />
              ) : (
                <div className="flex">
                  {nokPhone}
                  {checkParentJoin() === false && (
                    <button
                      children="가입요청알림톡 보내기"
                      onClick={() => {
                        if (nokName && nokPhone) {
                          sendParentSignUpV2Mutate({
                            studentId: Number(studentInfo?.id),
                            data: { name: nokName, phone: nokPhone },
                          })
                        } else {
                          alert('보호자 정보를 확인해 주세요.')
                        }
                      }}
                      className="bg-light_orange text-primary-800 hover:bg-primary-800 hover:text-light_orange rounded-md px-2 text-sm focus:outline-hidden"
                    />
                  )}
                </div>
              )}
            </td>
          </tr>
        </table>
        <div className="flex justify-end">
          {isEditMode && (
            <>
              <button
                children="취소"
                className="bg-light_orange text-primary-800 hover:text-light_orange rounded-md px-2 py-1 text-sm hover:bg-red-500 focus:outline-hidden"
                onClick={() => {
                  queryClient.refetchQueries({ active: true })
                  setIsEditMode(false)
                }}
              />
            </>
          )}
          <button
            children={isEditMode ? '저장하기' : '수정하기'}
            className="bg-light_orange text-primary-800 hover:bg-primary-800 hover:text-light_orange rounded-md px-2 py-1 text-sm focus:outline-hidden"
            onClick={() => {
              if (isEditMode) {
                if (phone && !Validator.phoneNumberRule(phone)) {
                  alert('학생 전화번호를 확인해 주세요.')
                  return
                }

                if (nokPhone && !Validator.phoneNumberRule(nokPhone)) {
                  alert('보호자 전화번호를 확인해 주세요.')
                  return
                }

                updateStudent()
              }
              setIsEditMode(true)
            }}
          />
        </div>
      </div>
    </div>
  )
}
