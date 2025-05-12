import { useState } from 'react'
import { Typography } from '@/legacy/components/common/Typography'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { ResponseIBPortfolioDto, ResponseUserDto } from '@/legacy/generated/model'
import CASCard from './CASCard'

interface CASPortfolioDataListProps {
  data?: ResponseIBPortfolioDto
  user: ResponseUserDto
}

function CASPortfolioDataList({ data, user }: CASPortfolioDataListProps) {
  const [open, setOpen] = useState<boolean>(false)
  const visibleProjects = open ? data?.projects : data?.projects.slice(0, 3)

  return (
    <div className="flex flex-col justify-between gap-6">
      <div className="grid grid-cols-3 gap-4">
        {visibleProjects?.map((project) => {
          return <CASCard key={project.id} data={project} user={user} />
        })}
      </div>
      {data?.projects && data.projects.length > 3 && (
        <footer
          className="relative flex w-full cursor-pointer items-center justify-center"
          onClick={() => setOpen((prev) => !prev)}
        >
          <div className="bg-primary-gray-100 absolute top-1/2 left-0 h-[1px] w-[calc(50%-12px)] -translate-y-1/2 transform"></div>
          <div className="bg-primary-gray-100 absolute top-1/2 right-0 h-[1px] w-[calc(50%-12px)] -translate-y-1/2 transform"></div>
          <div className="relative z-10 flex items-center gap-1 bg-white px-3">
            <Typography variant="body3" className="text-primary-gray-700 font-medium">
              {open ? '접기' : '전체보기'}
            </Typography>
            <SVGIcon.Arrow size={12} color="gray700" rotate={open ? 90 : 270} className="relative z-10" />
          </div>
        </footer>
      )}
    </div>
  )
}

export default CASPortfolioDataList
