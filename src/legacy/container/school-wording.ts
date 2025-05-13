import { useState } from 'react'
import { schoolPropertySetProperty, useSchoolPropertyGetProperty } from '@/legacy/generated/endpoint'

export function useSchoolWording() {
  const [edited, setEdited] = useState(false)
  const [fieldtripSafety, setFieldtripSafety] = useState<string>(
    '교외체험학습이 5일 이상 연속될 경우 학생의 건강과 안전을 위하여 주 1회 이상 학생이 담임(담당)교사와 직접 통화하겠습니다.',
  )
  const [fieldtripResultGuide, setFieldtripResultGuide] = useState<string>(
    '* 각 일정별로 느낀 점, 배운 점 등을 글, 그림 등으로 학생이 직접 기록합니다.',
  )

  useSchoolPropertyGetProperty(
    { key: 'WORDING_FIELDTRIP_SAFETY' },
    {
      query: {
        onSuccess: (data) => {
          if (data.value) setFieldtripSafety(data.value)
        },
      },
    },
  )
  useSchoolPropertyGetProperty(
    { key: 'WORDING_FIELDTRIPRESULT_GUIDE' },
    {
      query: {
        onSuccess: (data) => {
          if (data.value) setFieldtripResultGuide(data.value)
        },
      },
    },
  )

  const resetWording = () => {
    if (edited) {
      void schoolPropertySetProperty({ key: 'WORDING_FIELDTRIP_SAFETY', value: fieldtripSafety })
      void schoolPropertySetProperty({ key: 'WORDING_FIELDTRIPRESULT_GUIDE', value: fieldtripResultGuide })
    }
  }

  return {
    resetWording,
    setEdited,
    fieldtripSafety,
    setFieldtripSafety,
    fieldtripResultGuide,
    setFieldtripResultGuide,
  }
}
