import { useRef, useState } from 'react'
import { t } from 'i18next'
import moment from 'moment'
import { Document, Page } from 'react-pdf'
import { useOutletContext, useParams } from 'react-router'
import { Button } from '@/atoms/Button'
import { Flex } from '@/atoms/Flex'
import { IconButton } from '@/molecules/IconButton'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { ErrorBlank, SuperModal } from '@/legacy/components'
import { AbsentPaper } from '@/legacy/components/absent/AbsentPaper'
import { ParentConfirmPaper } from '@/legacy/components/absent/ParentConfirmPaper'
import { TeacherConfirmPaper } from '@/legacy/components/absent/TeacherConfirmPaper'
import CertificationBadge from '@/legacy/components/blockchain/CertificationBadge'
import { BackButton, Blank, Section, Textarea, TopNavbar } from '@/legacy/components/common'
import { Button as OldButton } from '@/legacy/components/common/Button'
import { Constants } from '@/legacy/constants'
import { useBlockChainDocument } from '@/legacy/container/block-chain-document-status'
import { useTeacherAbsentDeatil } from '@/legacy/container/teacher-absent-detail'
import { AbsentStatus, ResponseUserDto } from '@/legacy/generated/model'
import { AbsentUpdatePage } from '@/legacy/pages/teacher/absent/AbsentUpdatePage'
import { AbsentEvidenceType, approveButtonType } from '@/legacy/types'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { extractImageData, extractReactData, extractReactDataArray, getDoc, getPdfImageSize } from '@/legacy/util/pdf'
import { buttonEnableState } from '@/legacy/util/permission'
import { makeStartEndToString } from '@/legacy/util/time'

interface AbsentDetailPageProps {
  setOpen: (b: boolean) => void
  setAbsentId: (n: number) => void
  setAgreeAll: (b: boolean) => void
  userId?: number
  me?: ResponseUserDto
}

export function AbsentDetailPage() {
  return <></>
}
