import { Typography } from 'src/components/common/Typography';
import SolidSVGIcon from 'src/components/icon/SolidSVGIcon';

type strands = { activity?: number; creativity?: number; service?: number };

interface CASPercentProps {
  data: strands;
}

function CASPercent({ data }: CASPercentProps) {
  const totalSum = (data?.creativity || 0) + (data?.activity || 0) + (data?.service || 0);
  const creativityPercent = ((data?.creativity || 0) / totalSum) * 100 || 0;
  const activityPercent = ((data?.activity || 0) / totalSum) * 100 || 0;
  const servicePercent = ((data?.service || 0) / totalSum) * 100 || 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center justify-between">
        <Typography variant="body3" className="font-medium">
          활동비율
        </Typography>
        <nav className="flex flex-row items-center gap-3">
          <div className="flex flex-row items-center gap-1.5">
            <SolidSVGIcon.C size={16} color="orange800" />
            <Typography variant="caption" className="font-medium">
              {Math.round(creativityPercent)}%
            </Typography>
          </div>
          <div className="flex flex-row items-center gap-1.5">
            <SolidSVGIcon.A size={16} color="orange800" />
            <Typography variant="caption" className="font-medium">
              {Math.round(activityPercent)}%
            </Typography>
          </div>
          <div className="flex flex-row items-center gap-1.5">
            <SolidSVGIcon.S size={16} color="orange800" />
            <Typography variant="caption" className="font-medium">
              {Math.round(servicePercent)}%
            </Typography>
          </div>
        </nav>
      </div>
      <div className="flex h-2 w-full">
        {totalSum === 0 ? (
          <div className="h-full w-full rounded-[2px] bg-primary-gray-200"></div>
        ) : (
          <>
            {creativityPercent > 0 && (
              <div
                className="rounded-l-[2px] border-dim-8 bg-gradient-orange-400"
                style={{
                  width: `${creativityPercent}%`,
                  marginRight: creativityPercent > 0 ? '1px' : '0',
                }}
              ></div>
            )}
            {activityPercent > 0 && (
              <div
                className="border-dim-8 bg-gradient-blue-400"
                style={{
                  width: `${activityPercent}%`,
                  marginRight: activityPercent > 0 ? '1px' : '0',
                }}
              ></div>
            )}
            {servicePercent > 0 && (
              <div
                className={
                  creativityPercent === 0 && activityPercent === 0
                    ? 'rounded-l-[2px] rounded-r-[2px]'
                    : 'rounded-r-[2px] border-dim-8 bg-gradient-green-400'
                }
                style={{
                  width: `${servicePercent}%`,
                }}
              ></div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CASPercent;
