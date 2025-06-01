import { useState } from 'react'
import { Outlet } from 'react-router'
import { useHistory } from '@/hooks/useHistory'

import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import AnnouncementBadge from '@/legacy/components/announcement/AnnouncementBadge'
import { BackButton, Blank, TopNavbar } from '@/legacy/components/common'
import { useAnnouncementByCategory } from '@/legacy/container/announcement-category'
import { Announcement } from '@/legacy/generated/model/announcement'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import AnnouncementMobilePage from './AnnouncementMobilePage'

export default function AnnouncementPage() {
  const { t } = useLanguage()
  const { push } = useHistory()
  const [searchTitle, setSearchTitle] = useState('')
  const { announcements, category, setCategory, isLoading } = useAnnouncementByCategory()
  return (
    <>
      <Grid>
        <ResponsiveRenderer
          mobile={
            <>
              <TopNavbar title={`${t('superschool_announcement')}`} left={<BackButton onClick={() => push('/')} />} />
              <AnnouncementMobilePage />
            </>
          }
        />
        <GridItem colSpan={4}>
          <PageHeaderTemplate
            title={t('superschool_announcement')}
            config={{
              filters: [
                {
                  items: [
                    {
                      label: t('all'),
                      value: 'ALL',
                    },
                    {
                      label: t('update'),
                      value: 'UPDATE',
                    },
                    {
                      label: t('service'),
                      value: 'SERVICE',
                    },
                    {
                      label: t('work'),
                      value: 'WORK',
                    },
                  ],
                  filterState: {
                    value: category || 'ALL',
                    setValue: (v) => setCategory(v as 'UPDATE' | 'SERVICE' | 'WORK' | undefined),
                  },
                },
              ],
              searchBar: {
                placeholder: t('enter_title'),
                searchState: {
                  value: searchTitle,
                  setValue: (v) => setSearchTitle(v),
                },
              },
            }}
          />
          <div className="h-screen-10 flex-1 overflow-y-scroll">
            {announcements
              ?.filter((announcement) => searchTitle === '' || announcement.title.includes(searchTitle))
              .map((item: Announcement) => <AnnouncementBadge news={item} key={item.id} type="teacher" />)}
          </div>
        </GridItem>
        <GridItem colSpan={8} className="bg-gray-50">
          <Outlet />
        </GridItem>
      </Grid>

      {/* Desktop V */}
      {isLoading && <Blank reversed />}
    </>
  )
}
