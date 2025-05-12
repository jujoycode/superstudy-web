import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Label } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { useAdminPointGetOne } from '@/legacy/generated/endpoint'

export function PointDetailsPage() {
  const { t } = useTranslation()
  const { t: ta } = useTranslation('admin', { keyPrefix: 'point_details_page' })
  const { id: idString } = useParams<{ id: string }>()
  const id = Number(idString)

  const { data: point } = useAdminPointGetOne(id)

  return (
    <Admin.Section>
      <Admin.H2>{ta('point_details')}</Admin.H2>
      <div className="flex gap-2">
        <Button.sm as={Link} children={t('edit')} to={`${id}/edit`} className="outlined-gray" />
      </div>
      <Admin.Card>
        <Admin.Cell className="flex flex-col gap-4">
          <Label.col>
            <Label.Text children={ta('point_title')} />
            <p className="mt-2">{point?.title}</p>
          </Label.col>
          <Label.col>
            <Label.Text children={ta('point_value')} />
            <p className="mt-2">{point?.value}</p>
          </Label.col>
        </Admin.Cell>
      </Admin.Card>
    </Admin.Section>
  )
}
