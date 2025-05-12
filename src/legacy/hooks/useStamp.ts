import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Constants } from 'src/constants';
import { QueryKey } from 'src/constants/query-key';
import { UserContainer } from 'src/container/user';
import { useUserUpdateMe } from 'src/generated/endpoint';
import { UpdateUserDto, UploadFileTypeEnum } from 'src/generated/model';
import { useFileUpload } from './useFileUpload';

export function useStamp() {
  const { me } = UserContainer.useContext();
  const [stamp, setStamp] = useState(me?.stamp);
  const [stampMode, setStampMode] = useState(false);
  const { handleUploadFile, isUploadLoading } = useFileUpload();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (me?.stamp) {
      setStamp(me?.stamp);
    }
  }, [me]);

  const { mutateAsync: updateMeMutateAsync } = useUserUpdateMe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKey.me);
      },
    },
  });

  const updateMe = async ({ stamp }: Partial<UpdateUserDto>) => {
    await updateMeMutateAsync({ data: { stamp } as UpdateUserDto });
  };

  const updateStamp = async (file: File) => {
    const stampImagePath = await handleUploadFile(UploadFileTypeEnum['stamps'], [file]);
    updateMe({ stamp: stampImagePath[0] });
    setStamp(stampImagePath[0]);
  };

  return {
    stampImgUrl: stamp && `${Constants.imageUrl}${stamp}`,
    stamp,
    stampMode,
    setStampMode,
    updateStamp,
    isUploadStampLoading: isUploadLoading,
  };
}
