import { Typography } from 'src/components/common/Typography';
import SolidSVGIcon from 'src/components/icon/SolidSVGIcon';

type strands = { activity?: number; creativity?: number; service?: number };

interface StudentActivityRatioProps {
  before: strands;
  after: strands;
}

function StudentActivityRatio({ before, after }: StudentActivityRatioProps) {
  const totalSum = (before?.creativity || 0) + (before?.activity || 0) + (before?.service || 0);
  const creativityPercent = ((before?.creativity || 0) / totalSum) * 100 || 0;
  const activityPercent = ((before?.activity || 0) / totalSum) * 100 || 0;
  const servicePercent = ((before?.service || 0) / totalSum) * 100 || 0;

  const AftertotalSum = (after?.creativity || 0) + (after?.activity || 0) + (after?.service || 0);
  const AftercreativityPercent = ((after?.creativity || 0) / AftertotalSum) * 100 || 0;
  const AfteractivityPercent = ((after?.activity || 0) / AftertotalSum) * 100 || 0;
  const AfterservicePercent = ((after?.service || 0) / AftertotalSum) * 100 || 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 rounded-lg border border-primary-gray-200 p-4">
        <div className="flex flex-row items-center justify-between">
          <Typography variant="body3" className="font-medium">
            현재 진행중
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
                  className="rounded-l-[2px] border-dim-8 bg-gradient-orange-400 opacity-40"
                  style={{
                    width: `${creativityPercent}%`,
                    marginRight: creativityPercent > 0 ? '1px' : '0',
                  }}
                ></div>
              )}
              {activityPercent > 0 && (
                <div
                  className="border-dim-8 bg-gradient-blue-400 opacity-40"
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
                      : 'rounded-r-[2px] border-dim-8 bg-gradient-green-400 opacity-40'
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
      <div className="flex flex-col gap-2 rounded-lg border border-primary-orange-200 p-4">
        <div className="flex flex-row items-center justify-between">
          <Typography variant="body3" className="font-medium">
            계획서 승인 후
          </Typography>
          <nav className="flex flex-row items-center gap-3">
            <div className="flex flex-row items-center gap-1.5">
              <SolidSVGIcon.C size={16} color="orange800" />
              <Typography variant="caption" className="font-medium">
                {Math.round(AftercreativityPercent)}%
              </Typography>
            </div>
            <div className="flex flex-row items-center gap-1.5">
              <SolidSVGIcon.A size={16} color="orange800" />
              <Typography variant="caption" className="font-medium">
                {Math.round(AfteractivityPercent)}%
              </Typography>
            </div>
            <div className="flex flex-row items-center gap-1.5">
              <SolidSVGIcon.S size={16} color="orange800" />
              <Typography variant="caption" className="font-medium">
                {Math.round(AfterservicePercent)}%
              </Typography>
            </div>
          </nav>
        </div>
        <div className="flex h-2 w-full">
          {AftercreativityPercent > 0 && (
            <div
              className="rounded-l-[2px] border-dim-8 bg-gradient-orange-400"
              style={{
                width: `${AftercreativityPercent}%`,
                marginRight: AftercreativityPercent > 0 ? '1px' : '0',
              }}
            ></div>
          )}
          {AfteractivityPercent > 0 && (
            <div
              className="border-dim-8 bg-gradient-blue-400"
              style={{
                width: `${AfteractivityPercent}%`,
                marginRight: AfteractivityPercent > 0 ? '1px' : '0',
              }}
            ></div>
          )}
          {AfterservicePercent > 0 && (
            <div
              className={
                AftercreativityPercent === 0 && AfteractivityPercent === 0
                  ? 'rounded-l-[2px] rounded-r-[2px]'
                  : 'rounded-r-[2px] border-dim-8 bg-gradient-green-400'
              }
              style={{
                width: `${AfterservicePercent}%`,
              }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentActivityRatio;
