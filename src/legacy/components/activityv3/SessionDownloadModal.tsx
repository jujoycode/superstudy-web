import { FC, useEffect, useState } from 'react';
import readXlsxFile, { Row } from 'read-excel-file';
import {
  useActivitySessionDownloadSubmitters,
  useActivitySessionFindOne,
  useActivityV3FindOne,
} from 'src/generated/endpoint';
import { downloadExcel } from 'src/util/download-excel';
import { SuperModal } from '../SuperModal';
import { Td } from '../Td';
import { Section } from '../common';
import { Button } from '../common/Button';

interface SessionDownloadModalProps {
  sessionId: number | undefined;
  modalOpen: boolean;
  setModalClose: () => void;
}

export const SessionDownloadModal: FC<SessionDownloadModalProps> = ({ sessionId: id, modalOpen, setModalClose }) => {
  const { data: activitySession, refetch } = useActivitySessionFindOne(Number(id), {
    query: { enabled: !!id },
  });
  const { data: activityv3, isLoading: isGetActivityLoading } = useActivityV3FindOne(
    Number(activitySession?.activityv3Id),
    undefined,
    {
      query: { enabled: !!activitySession?.activityv3Id },
    },
  );
  const [rows, setRows] = useState<Row[]>();

  const groupIds = activityv3?.groupActivityV3s?.map((el) => el.groupId) || [];

  const {
    data: excelData,
    isLoading: isActivityDownloadLoading,
    isFetching,
    error,
  } = useActivitySessionDownloadSubmitters(Number(id), { groupIds });

  useEffect(() => {
    if (excelData) {
      new Promise((r) => r(excelData))
        .then((blob) => readXlsxFile(blob as Blob))
        .then((rows) => setRows(rows))
        .catch((e) => console.log(e));
    }
  }, [id, excelData]);

  const isLoading = isActivityDownloadLoading || isGetActivityLoading;

  const handleDownload = () => {
    const filename = `${activitySession?.title ?? ''}-제출자 목록`;
    excelData && downloadExcel(excelData, filename);
  };

  return (
    <SuperModal modalOpen={modalOpen} setModalClose={setModalClose} className="w-full max-w-3/4">
      <div className="max-w- w-full border-b border-gray-500 bg-white px-5 py-3 pt-6">
        <Button.lg children="Excel" disabled={isLoading} onClick={handleDownload} className="filled-green" />
      </div>
      <div className="h-screen-18 w-full overflow-auto overflow-y-scroll bg-white">
        <Section className="mt-2">
          <table>
            <tbody>
              {rows?.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <Td key={cellIndex} innerClassName="min-w-max">
                      {cell}
                    </Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </SuperModal>
  );
};
