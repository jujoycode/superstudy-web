import _, { map, max } from 'lodash'
import { FC, useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { Label, Select, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useStudentSelfAssessmentCreate } from '@/legacy/generated/endpoint'
import { StudentSelfAssessment } from '@/legacy/generated/model'
import { SELF_TEST_TYPES } from '@/legacy/pages/student/self-test/self-test.type'
import { getDayOfYear } from '@/legacy/util/time'
// * 추후 types로 이관

interface StudentSelfAssessmentUpdateProps {
  studentSelfAssessment?: StudentSelfAssessment
  goToView: () => void
}

export const StudentSelfAssessmentUpdate: FC<StudentSelfAssessmentUpdateProps> = ({
  studentSelfAssessment,
  goToView,
}) => {
  const [category1, setCategory1] = useState('')
  const [category2, setCategory2] = useState('')
  const [category3, setCategory3] = useState('')
  const [keywords, setKeywords] = useState<Record<number, { keyword: string; reason: string }>>({})
  const [assessment, setAssessment] = useState<string>('')

  const reset = (data: StudentSelfAssessment) => {
    setCategory1(data?.category1)
    setCategory2(data?.category2)
    setCategory3(data?.category3)
    setKeywords(data?.keywords)
    setAssessment(data?.assessment)
  }

  const { mutate: createStudentSelfAssessment } = useStudentSelfAssessmentCreate({
    mutation: {
      onSuccess: (data) => {
        reset(data)
        goToView()
      },
    },
  })

  useEffect(() => {
    if (studentSelfAssessment) {
      reset(studentSelfAssessment)
    }
  }, [studentSelfAssessment])

  const category3Data =
    SELF_TEST_TYPES.filter((ct1) => ct1.name === category1)?.[0]?.values?.filter((ct2) => ct2.name === category2)?.[0]
      ?.values || []

  const keywordDatas: string[] =
    typeof category3Data[0] === 'string'
      ? category3Data
      : category3
        ? //@ts-ignore
          category3Data.filter((ct3: any) => ct3.name === category3)?.[0]?.values || []
        : []

  return (
    <div className="flex flex-col space-y-4">
      <Label.col>
        <Label.Text children="범주1" />
        <Select.lg
          placeholder="선택"
          value={category1}
          onChange={(e) => {
            setCategory1(e.target.value)
            setCategory2('')
          }}
        >
          <option selected hidden value="">
            범주를 선택해주세요.
          </option>
          {SELF_TEST_TYPES.map((ct1) => (
            <option key={ct1.id} value={ct1.name}>
              {ct1.name}
            </option>
          ))}
        </Select.lg>
      </Label.col>
      <Label.col>
        <Label.Text children="범주2" />
        <Select.lg
          placeholder="선택"
          disabled={!category1}
          value={category2}
          onChange={(e) => {
            setCategory2(e.target.value)
            setCategory3('')
          }}
        >
          <option selected hidden value="">
            범주를 선택해주세요.
          </option>
          {category1 &&
            SELF_TEST_TYPES.filter((ct1) => ct1.name === category1)?.[0]?.values?.map((ct2) => (
              <option key={ct2.id} value={ct2.name}>
                {ct2.name}
              </option>
            ))}
        </Select.lg>
      </Label.col>
      {!!category3Data?.length && typeof category3Data[0] !== 'string' && (
        <Label.col>
          <Label.Text children="범주3" />
          <Select.lg
            placeholder="선택"
            disabled={!category2}
            value={category3}
            onChange={(e) => {
              setCategory3(e.target.value)
            }}
          >
            <option selected hidden value="">
              범주를 선택해주세요.
            </option>
            {category3Data.map(
              (ct3) =>
                typeof ct3 !== 'string' && (
                  <option key={ct3.id} value={ct3.name}>
                    {ct3.name}
                  </option>
                ),
            )}
          </Select.lg>
        </Label.col>
      )}
      {!!keywordDatas.length && (
        <Label.col>
          <Label.Text children="특성단어" />
          <Label.Text className="text-16">해당 학생을 나타내는 특성단어를 선택해주세요.</Label.Text>
          <div className="mt-2">
            {keywordDatas.map((el) => {
              const selected = Object.values(keywords).some(({ keyword }) => el === keyword)
              return (
                <div
                  className={twMerge(
                    'mr-2 mb-2 inline-block cursor-pointer rounded-full border border-gray-600 px-4 py-2',
                    selected && 'border-primary-800 bg-light_orange text-primary-800',
                  )}
                  onClick={() => {
                    if (Object.keys(keywords).length >= 5) {
                      alert('단어는 최대 5개 입력할 수 있습니다.')
                      return
                    }
                    if (Object.values(keywords).some(({ keyword }) => keyword === '')) {
                      alert('추가한 단어를 먼저 입력해주세요.')
                      return
                    }
                    if (selected) {
                      setKeywords(_.omitBy(keywords, ({ keyword }) => keyword === el))
                    } else {
                      const keys = map(Object.keys(keywords), (el) => Number(el))
                      const key: number = (max(keys) || 0) + 1
                      setKeywords({
                        ...keywords,
                        [key]: { keyword: el, reason: '' },
                      })
                    }
                  }}
                  key={el}
                >
                  {el}
                </div>
              )
            })}
          </div>
        </Label.col>
      )}
      <Label.col>
        <Label.Text children="선택단어/근거 (단어는 직접 수정할 수 있습니다)" />
        <div className="flex flex-col space-y-2">
          {Object.entries(keywords)
            .sort(([id1], [id2]) => Number(id1) - Number(id2))
            .map(([id, { keyword, reason }]) => (
              <div key={id} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <TextInput
                    value={keyword}
                    onChange={(e) => {
                      setKeywords({ ...keywords, [id]: { keyword: e.target.value, reason } })
                    }}
                  />
                  <Button.lg
                    className="bg-red-600 text-white"
                    onClick={() => {
                      const _keywords = structuredClone(keywords)
                      delete _keywords[Number(id)]
                      setKeywords(_keywords)
                    }}
                  >
                    삭제
                  </Button.lg>
                </div>
                <Textarea
                  rows={3}
                  className="h-16"
                  placeholder="특성단어를 선택한 근거를 작성해주세요."
                  value={reason}
                  onChange={(e) => {
                    setKeywords({ ...keywords, [id]: { keyword, reason: e.target.value } })
                  }}
                />
              </div>
            ))}
          <div
            className="flex cursor-pointer items-center justify-center space-x-2 rounded-lg border border-gray-600 bg-slate-50 py-2 text-gray-600"
            onClick={() => {
              if (Object.keys(keywords).length >= 5) {
                alert('단어는 최대 5개 입력할 수 있습니다.')
                return
              }
              if (Object.values(keywords).some(({ keyword }) => keyword === '')) {
                alert('추가한 단어를 먼저 입력해주세요.')
                return
              }
              const keys = map(Object.keys(keywords), (el) => Number(el))
              const key: number = (max(keys) || 0) + 1
              setKeywords({ ...keywords, [key]: { keyword: '', reason: '' } })
            }}
          >
            <div> 단어 추가 </div>
            <Icon.Plus />
          </div>
        </div>
      </Label.col>
      <Label.col>
        <Label.Text children="자기평가 내용" />
        <Textarea
          placeholder="추가적으로 표현하고 싶은 자기평가를 작성해주세요."
          onChange={(e) => setAssessment(e.target.value)}
          value={assessment}
        />
      </Label.col>
      <div className="flex w-full space-x-2">
        <Button.lg
          children="취소하기"
          className="bg-primary-800 w-full text-white disabled:bg-gray-300 disabled:text-gray-600"
          onClick={() => {
            goToView()
          }}
        />
        <Button.lg
          children="저장하기"
          className="bg-primary-800 w-full text-white disabled:bg-gray-300 disabled:text-gray-600"
          onClick={() => {
            createStudentSelfAssessment({
              data: {
                category1,
                category2,
                category3,
                keywords,
                assessment,
                year: getDayOfYear(new Date()),
              },
            })
          }}
        />
      </div>
    </div>
  )
}
