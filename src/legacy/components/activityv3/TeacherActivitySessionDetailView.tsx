import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Viewer from 'react-viewer';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import { Constants } from 'src/constants';
import { ActivitySession, StudentActivitySession } from 'src/generated/model';
import { getFileNameFromUrl, isPdfFile } from 'src/util/file';
import { Section } from '../common';
import { PdfCard } from '../common/PdfCard';
import { SuperSurveyComponent } from '../survey/SuperSurveyComponent';

interface TeacherActivitySessionDetailView {
  activitySession: ActivitySession;
  studentActivitySession?: StudentActivitySession;
}

export const TeacherActivitySessionDetailView: React.FC<TeacherActivitySessionDetailView> = ({
  activitySession: activity,
  studentActivitySession: studentActivity,
}) => {
  const files = studentActivity?.files || [];
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false);
  const [focusPdfFile, setFocusPdfFile] = useState('');

  const images = studentActivity?.images?.filter((image) => !isPdfFile(image)) || [];
  const Pdfs = studentActivity?.images?.filter((image) => isPdfFile(image)) || [];

  const viewerImages: ImageDecorator[] = [];
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      });
    }
  }

  let surveyContent = {};
  try {
    surveyContent = JSON.parse(studentActivity?.content || '{}');
  } catch (err) {}

  return (
    <>
      <Section className="bg-gray-50">
        {activity.type === 'SURVEY' && (
          <SuperSurveyComponent
            surveyContent={activity?.surveyContent || '[]'}
            setContent={() => {}}
            content={surveyContent}
            readOnly
          />
        )}
        {images?.map((image: string, i: number) => (
          <div key={image}>
            <div
              onClick={() => {
                setActiveIndex(i);
                setImagesModalOpen(true);
              }}
              className="w-full"
            >
              <div className="aspect-5/3 rounded bg-gray-50">
                <LazyLoadImage
                  src={`${Constants.imageUrl}${image}`}
                  alt=""
                  loading="lazy"
                  className="h-full w-full rounded object-cover"
                />
              </div>
            </div>
          </div>
        ))}
        {Pdfs?.map((pdfFile: string, i: number) => {
          return (
            <>
              <div key={pdfFile}>
                <div className="w-full">
                  <div className="relative">
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
        })}
        {files?.map((fileUrl: string, index) => (
          <div key={index} className="relative m-2 flex items-center justify-between overflow-x-hidden bg-white p-2">
            <span>{getFileNameFromUrl(fileUrl)}</span>
            <div className="min-w-max bg-white px-2 text-lightpurple-4">
              <a
                href={`${Constants.imageUrl}${fileUrl}`}
                target="_blank"
                rel="noreferrer"
                download={getFileNameFromUrl(fileUrl)}
              >
                Download
              </a>
            </div>
          </div>
        ))}

        <div className="absolute">
          <Viewer
            visible={hasImagesModalOpen}
            rotatable
            noImgDetails
            scalable={false}
            images={viewerImages}
            onChange={(activeImage, index) => setActiveIndex(index)}
            onClose={() => setImagesModalOpen(false)}
            activeIndex={activeIndex}
          />
        </div>
        {activity.type !== 'SURVEY' && <p className="whitespace-pre-line">{studentActivity?.content}</p>}
      </Section>
    </>
  );
};
