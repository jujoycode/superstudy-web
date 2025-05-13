import Logo from '@/assets/svg/logo.svg'
import { BackButton, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { YoutubeLink } from '@/legacy/components/YoutubeLink'
import { useLanguage } from '@/legacy/hooks/useLanguage'

export function AboutSuperSchoolPage() {
  const { t } = useLanguage()
  return (
    <div className="box-border flex w-full items-center justify-center">
      <div className="scroll-box h-screen w-full max-w-xl overflow-auto">
        <TopNavbar
          title={`${t('superschool_preview')}`}
          left={
            <div className="h-15">
              <BackButton className="h-15" />
            </div>
          }
        />
        <div className="flex flex-col items-center justify-center">
          <div className="mt-5 w-28">
            <Logo />
          </div>
          <div className="font-bold">{t('intro_superschool')}</div>
        </div>

        <div className="mx-2 mt-5 flex flex-col gap-2 sm:flex-row">
          <div className="flex w-full items-center gap-2">
            <a href="https://superstudy.kr" target="blank" className="w-1/2 flex-grow">
              <Button className="filled-gray-light w-full overflow-hidden rounded-full py-1 text-ellipsis whitespace-normal">
                {t('go_to_homepage')}
              </Button>
            </a>
            <a
              href={`https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/aboutsuperschool.pdf`}
              target="_blank"
              rel="noreferrer"
              download
              className="w-1/2 flex-grow"
            >
              <Button className="filled-gray-light w-full overflow-hidden rounded-full py-1 text-ellipsis whitespace-normal">
                {t('download_brochure')}
              </Button>
            </a>
          </div>
          <div className="flex w-full items-center gap-2">
            <a href="https://superstudy.kr/Contact" target="blank" className="w-1/2 flex-grow">
              <Button
                //children="설명회 신청하기"
                className="filled-gray-light w-full overflow-hidden rounded-full py-1 text-ellipsis whitespace-normal"
              >
                {t('inquiry_about_introduction')}
              </Button>
            </a>
            <a href="https://superstudy.kr/46" target="blank" className="w-1/2 flex-grow">
              <Button
                children={t('apply_for_info_session')}
                className="filled-gray-light w-full overflow-hidden rounded-full py-1 text-ellipsis whitespace-normal"
              />
            </a>
          </div>
        </div>

        <Section>
          <YoutubeLink ContentTitle="슈퍼스쿨 소개" videoId="DgJcoDfC8tc" />
          <YoutubeLink ContentTitle="슈퍼스쿨 온라인 오리엔테이션" videoId="aSszea8H_rw" />
          <YoutubeLink ContentTitle="슈퍼스쿨 교사 오리엔테이션" videoId="hCmXRwfE6sQ" />
          <YoutubeLink ContentTitle="슈퍼스쿨 교사 사용후기" videoId="Vgce8DlJn00" />
          <YoutubeLink ContentTitle="슈퍼스쿨 학생 사용후기" videoId="sdc2TJfwMnI" />
          <YoutubeLink ContentTitle="실사용 조퇴/외출/학생증" videoId="l8Jr-k7p_oI" />
          <YoutubeLink ContentTitle="결석신고서 사용방법" videoId="xQl6wpaUJNM" />
          <YoutubeLink ContentTitle="체험학습서류 사용방법" videoId="7sTRgYMGyx8" />
          <YoutubeLink ContentTitle="출석부 사용방법" videoId="CbHhd9cE4Xo" />
        </Section>
      </div>
    </div>
  )
}
