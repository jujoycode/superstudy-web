import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Constants } from 'src/constants';
import { DateFormat, DateUtil } from 'src/util/date';
import { isPdfFile } from 'src/util/file';
import { PdfCard } from '../common/PdfCard';
import { Time } from '../common/Time';

interface NewsletterPreviewProps {
  title: string;
  images: string[];
  klasses: string[];
  endAt: string | null;
  setPreview: (b: boolean) => void;
}

export function NewsletterPreview({ title, images, klasses, endAt }: NewsletterPreviewProps) {
  const now = DateUtil.formatDate(new Date(), DateFormat['YYYY-MM-DD HH:mm']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false);
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false);
  const [focusPdfFile, setFocusPdfFile] = useState('');

  const Pdfs = images.filter((image) => isPdfFile(image)) || [];
  images = images.filter((image) => !isPdfFile(image)) || [];

  return (
    <>
      {/* Desktop V */}
      <div className="scroll-box overflow-x-auto overflow-y-auto">
        <div className="hidden md:block">
          <div>
            <div className="flex w-full justify-between space-x-2">
              <div className="w-max rounded-md bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
                가정통신문
              </div>
            </div>
            {endAt && (
              <div className="flex gap-1 text-sm font-normal text-red-400">
                <span className="font-semibold">마감기한</span>
                <Time date={endAt} className="text-inherit" />
                <span>까지</span>
              </div>
            )}
            <div className="mt-3 flex flex-wrap">
              {klasses
                ?.sort((a, b) => +a - +b)
                .map((klass) => (
                  <span
                    key={klass}
                    className="mb-2 mr-2 rounded-full border border-gray-400 px-3 py-2 text-sm font-semibold text-gray-500"
                  >
                    {klass}학년
                  </span>
                ))}
            </div>
            <div className="flex text-lg font-bold text-grey-1">{title}</div>
            <div className="flex text-sm text-grey-3">{now}</div>
            <Time date={endAt} />
            <div className="grid w-full grid-flow-row grid-cols-3 gap-2">
              {images?.map((image: string, i: number) => {
                return (
                  <>
                    <div key={image}>
                      <div
                        onClick={() => {
                          setActiveIndex(i);
                          setImagesModalOpen(true);
                        }}
                        className="w-full"
                      >
                        <div className="relative aspect-5/3 rounded bg-gray-50">
                          <LazyLoadImage
                            src={`${Constants.imageUrl}${image}`}
                            alt=""
                            loading="lazy"
                            className="absolute h-full w-full rounded object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                );
              })}
            </div>
            <div>
              {Pdfs?.length
                ? Pdfs?.map((pdfFile: string, i: number) => {
                    return (
                      <>
                        <div key={pdfFile}>
                          <div className="w-full">
                            <div className="relative aspect-5/3 rounded bg-gray-50">
                              <PdfCard
                                fileUrl={`${Constants.imageUrl}${pdfFile}`}
                                visibleButton
                                onClick={() => {
                                  setFocusPdfFile(`${Constants.imageUrl}${pdfFile}`);
                                  setPdfModalOpen(true);
                                }}
                              ></PdfCard>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })
                : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
