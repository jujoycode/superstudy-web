import { useParams } from 'react-router'
import { useRecoilValue } from 'recoil'

import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import CASChart from '@/legacy/components/ib/cas/CASChart'
import CASPortfolioDataList from '@/legacy/components/ib/cas/CASPortfolioDataList'
import CASPortfolioTimeline from '@/legacy/components/ib/cas/CASPortfolioTimeline'
import TeacherCASProfile from '@/legacy/components/ib/cas/TeacherCASProfile'
import TeacherCASRefNInt from '@/legacy/components/ib/cas/TeacherCASRefInt'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { useIBPortfolioGetById } from '@/legacy/container/ib-cas'
import { makeStudNum5 } from '@/legacy/util/status'
import { meState } from '@/stores'

import NODATA from '@/assets/images/no-data.png'

function CASPortfolioPage() {
  const { id: idParams } = useParams<{ id: string }>()

  const id = Number(idParams)
  const me = useRecoilValue(meState)
  const { data, isLoading } = useIBPortfolioGetById(id || 0)

  if (me == null || data?.profile.user === undefined) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {isLoading && <IBBlank />}
      <div className="h-screen w-full">
        <div className="">
          <IBLayout
            topContent={
              <div>
                <div className="w-full pt-16 pb-6">
                  <div className="flex flex-col items-start gap-3">
                    <div className="flex w-full justify-between">
                      <div className="flex flex-row gap-1">
                        <BadgeV2 color="navy" size={24} type="solid_strong">
                          CAS
                        </BadgeV2>
                      </div>
                      <Breadcrumb
                        data={{
                          'CAS Portfolio': `/teacher/project/portfolio`,
                        }}
                      />
                    </div>
                    <div className="flex w-full justify-between">
                      <Typography
                        variant="heading"
                        className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {`${data?.profile.user?.name}의 CAS Portfolio`}
                      </Typography>
                      <div className="text-16 text-primary-orange-800 rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 font-semibold">
                        {makeStudNum5({
                          grade: data.profile.user.studentGroup.group.grade,
                          classNum: data.profile.user.studentGroup.group.klass,
                          studentNum: data.profile.user?.studentGroup.studentNumber,
                        })}{' '}
                        · {data?.profile.user?.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
            bottomContent={
              <div className="flex h-full items-center pt-6">
                <div className="flex h-full flex-row gap-4 pt-6">
                  <section className="flex w-[848px] flex-col gap-4">
                    <article className="flex flex-col gap-6 rounded-xl bg-white p-6">
                      <Typography variant="title1">활동비율 및 7가지 학습성과</Typography>
                      <CASChart data={data} />
                    </article>
                    <article className="flex flex-col gap-6 rounded-xl bg-white p-6">
                      <Typography variant="title1">타임라인</Typography>
                      {data?.projects.length === 0 || data === undefined ? (
                        <div className="flex flex-col items-center justify-center gap-6 py-20">
                          <div className="h-12 w-12 px-[2.50px]">
                            <img src={NODATA} className="h-12 w-[43px] object-cover" />
                          </div>
                          <Typography
                            variant="body2"
                            className="text-center"
                          >{`진행중인 CAS 활동이 없습니다.`}</Typography>
                        </div>
                      ) : (
                        <>
                          <CASPortfolioTimeline data={data} />
                          <CASPortfolioDataList data={data} user={me} />
                        </>
                      )}
                    </article>
                    <article className="flex flex-col gap-6 rounded-xl bg-white p-6">
                      <TeacherCASRefNInt data={data} user={me} />
                    </article>
                  </section>
                  <section className="flex w-[416px] flex-col gap-6 self-start rounded-xl bg-white p-6">
                    <TeacherCASProfile data={data} />
                  </section>
                </div>
              </div>
            }
            bottomBgColor="bg-primary-gray-50"
          />
        </div>
      </div>
    </div>
  )
}

export default CASPortfolioPage
