import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import {
  imagesUploadImage,
  studentManagementUpdateStudent,
  useAdminCommonFindAllKlassBySchool,
  useStudentManagementGetStudents,
} from '@/legacy/generated/endpoint'
import { ResponseStudentInfoDto, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useSignedUrl } from '@/legacy/lib/query'
import { useSearch } from '@/legacy/lib/router'
import { cn } from '@/legacy/lib/tailwind-merge'
import { getNickName } from '@/legacy/util/status'
import { AdminContext } from '../AdminMainPage'

const MAX_UPLOAD_FILES = 25

export function StudentPhotosPage() {
  const { t } = useTranslation()
  const { t: ta } = useTranslation('admin', { keyPrefix: 'student_photos_page' })
  const { year } = useContext(AdminContext)
  const { page, size } = useSearch({ page: 1, size: 10000 })
  const [klassName, setKlassName] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [selectedStudent, setSelectedStudent] = useState<ResponseStudentInfoDto>()
  const [selectedFile, setSelectedFile] = useState<File>()
  const [changes, setChanges] = useState<[ResponseStudentInfoDto, File][]>([])

  const { data: klasses } = useAdminCommonFindAllKlassBySchool({ year })
  const { data: students } = useStudentManagementGetStudents(
    { page, size, year, klass: klassName },
    { query: { enabled: !!klassName, keepPreviousData: true } },
  )

  useEffect(() => {
    setSelectedStudent(undefined)
    setSelectedFile(undefined)
    setChanges([])
  }, [files])

  useEffect(() => {
    if (!selectedStudent || !selectedFile) return
    setChanges((prev) => [...prev.filter(([s]) => s.id !== selectedStudent.id), [selectedStudent, selectedFile]])
    setSelectedStudent(undefined)
    setSelectedFile(undefined)
  }, [selectedStudent, selectedFile])

  useEffect(() => setKlassName(klasses?.[0]?.name ?? ''), [klasses])

  async function save() {
    if (!confirm(ta('confirm_save'))) return
    const promises = changes.map(async ([student, file]) => {
      const profile = await imagesUploadImage({ file }, { uploadFileType: UploadFileTypeEnum.profiles })
      studentManagementUpdateStudent(student.id, { profile })
    })
    await Promise.all(promises)
    setFiles([])
    setSelectedStudent(undefined)
    setSelectedFile(undefined)
    setChanges([])
  }

  return (
    <>
      <Admin.Section>
        <Admin.H2>{ta('edit_student_photos')}</Admin.H2>
      </Admin.Section>

      <div className="grid grid-cols-2">
        <Admin.Section>
          <Admin.H2>{ta('current_photos')}</Admin.H2>

          <Select value={klassName} onChange={(e) => setKlassName(e.target.value)}>
            {klasses
              ?.reduce((acc: any[], current: any) => {
                if (!acc.find((item) => item.id === current.id)) {
                  acc.push(current)
                }
                return acc
              }, [])
              .map((k) => (
                <option key={k.id} value={k.name ?? ''}>
                  {k.name}
                </option>
              ))}
          </Select>

          <div className="flex flex-wrap gap-2">
            {students?.items.map((student) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent((prev) => (prev?.id === student.id ? undefined : student))}
                className={cn(
                  'hover:outline-primary-orange-700 flex w-20 cursor-pointer flex-col hover:outline',
                  student.id === selectedStudent?.id && 'outline-primary-orange-700 outline',
                )}
              >
                <StudentImage url={student.profile} />
                <div className="text-14 break-all">{student.name + getNickName(student.nickName)}</div>
              </div>
            ))}
          </div>
        </Admin.Section>

        <Admin.Section>
          <Admin.H2>
            {ta('new_photos')} ({files.length}/{MAX_UPLOAD_FILES})
          </Admin.H2>

          <Button as="label" className="outlined-gray cursor-pointer">
            <p>{ta('select_image_files')}</p>
            <input
              type="file"
              accept=".png, .jpeg, .jpg"
              multiple
              onChange={(e) => {
                if (!e.target.files || e.target.files.length === 0) return
                const files = [...e.target.files].slice(0, MAX_UPLOAD_FILES)
                setFiles(files)
              }}
              className="sr-only"
            />
          </Button>

          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <div
                key={file.name}
                onClick={() => setSelectedFile((prev) => (prev?.name === file.name ? undefined : file))}
                className={cn(
                  'hover:outline-primary-orange-700 flex w-20 cursor-pointer flex-col hover:outline',
                  file.name === selectedFile?.name && 'outline-primary-orange-700 outline',
                )}
              >
                <img src={URL.createObjectURL(file)} className="aspect-square object-cover" />
                <div className="text-14 break-all">{file.name}</div>
              </div>
            ))}
          </div>
        </Admin.Section>
      </div>

      <Admin.Section>
        <Admin.H2>
          {ta('changes')} ({changes.length})
        </Admin.H2>

        <div className="flex flex-wrap gap-8">
          {changes.map(([student, file]) => (
            <div
              key={student.id}
              onClick={() => setChanges((prev) => prev.filter(([s]) => s.id !== student.id))}
              className="flex cursor-pointer gap-1 hover:outline hover:outline-gray-300"
            >
              <div className="flex w-20 flex-col text-start">
                <StudentImage url={student.profile} />
                <div className="text-14 break-all">{student.name + getNickName(student.nickName)}</div>
              </div>
              <div className="flex h-20 items-center">
                <Icon.ChevronRight />
              </div>
              <div className="flex w-20 flex-col text-start">
                <img src={URL.createObjectURL(file)} className="aspect-square object-cover" />
                <div className="text-14 break-all">{file.name}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex">
          <Button.lg children={t('save')} disabled={changes.length === 0} onClick={save} className="filled-gray" />
        </div>
      </Admin.Section>
    </>
  )
}

function StudentImage({ url }: { url?: string }) {
  const { data: profile } = useSignedUrl(url)

  return <img src={profile} className="aspect-square object-cover" />
}
