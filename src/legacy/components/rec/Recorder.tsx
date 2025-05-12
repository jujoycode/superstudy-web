import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { UploadFileTypeEnum } from 'src/generated/model/uploadFileTypeEnum';
import { useFileUpload } from 'src/hooks/useFileUpload';
import { Button } from '../common/Button';

interface RecorderProps {
  onUpload: (uploadedFileNames: string[]) => void;
}

const Recorder: React.FC<RecorderProps & { ref?: Ref<{ uploadAndDestroy: (Upload: boolean) => void }> }> = forwardRef(
  ({ onUpload }, ref) => {
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [recording, setRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

    const { handleUploadFile, isUploadLoading } = useFileUpload();

    useEffect(() => {
      const enableAudioStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMediaStream(stream);
        } catch (err) {
          console.error('Error accessing media devices.', err);
        }
      };

      enableAudioStream();

      return () => {
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => {
            track.stop();
          });
        }
      };
    }, []);

    useEffect(() => {
      // Clean up timer when component unmounts
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, []);

    useEffect(() => {
      if (mediaStream) {
        const recorder = new MediaRecorder(mediaStream);

        recorder.ondataavailable = async (e) => {
          if (e.data.size > 0) {
            setAudioChunks((prev) => [...prev, e.data]);
          }
        };

        setMediaRecorder(recorder);
      }
    }, [mediaStream]);

    const startRecording = () => {
      if (mediaRecorder) {
        setRecording(true);
        //setRecordingTime(0);
        mediaRecorder.start();

        timerRef.current = setInterval(() => {
          setRecordingTime((prevTime) => prevTime + 1);
        }, 1000);
      }
    };

    const stopRecording = () => {
      if (mediaRecorder) {
        setRecording(false);
        mediaRecorder.stop();

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    };

    const playRecording = () => {
      if (audioChunks.length === 0) {
        alert('No audio recorded yet!');
        return;
      }

      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      setAudioPlayer(audio);

      setCurrentTime(0);

      timerRef.current = setInterval(() => {
        if (recordingTime > currentTime) {
          setCurrentTime((prevTime) => prevTime + 1);
        }
      }, 1000);

      // audio.addEventListener('timeupdate', () => {
      //   setCurrentTime(audio.currentTime);
      // });

      audio.addEventListener('ended', () => {
        setPlaying(false);

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      });

      setPlaying(true);
      audio.play();
    };

    const stopPlayback = () => {
      if (audioPlayer) {
        audioPlayer.pause(); // Pause the audio
        audioPlayer.currentTime = 0; // Reset the audio position to the beginning
        setPlaying(false); // Set isPlaying state to false

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    };

    const DeleteRecording = () => {
      // 기존 녹음된 오디오 초기화
      setAudioChunks([]);
      setRecordingTime(0);
    };

    const destroyRecording = () => {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
    };

    const mergeAudioChunks = (audioChunks: Blob[]) => {
      return new Blob(audioChunks, { type: 'audio/webm' });
    };

    const createWavFile = async (audioChunks: Blob[], targetSampleRate = 16000, targetBitDepth = 8) => {
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(await mergeAudioChunks(audioChunks).arrayBuffer());

      const numOfChannels = 1; // Convert to mono
      const originalSampleRate = audioBuffer.sampleRate;
      const originalLength = audioBuffer.length;

      // Create a mono buffer with the original sample rate
      const monoBuffer = audioContext.createBuffer(numOfChannels, originalLength, originalSampleRate);
      const monoData = monoBuffer.getChannelData(0);

      // Merge channels into mono
      for (let i = 0; i < originalLength; i++) {
        let sum = 0;
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
          sum += audioBuffer.getChannelData(channel)[i];
        }
        monoData[i] = sum / audioBuffer.numberOfChannels;
      }

      // Resample to target sample rate
      const offlineContext = new OfflineAudioContext(
        numOfChannels,
        Math.ceil((originalLength * targetSampleRate) / originalSampleRate),
        targetSampleRate,
      );
      const source = offlineContext.createBufferSource();
      source.buffer = monoBuffer;
      source.connect(offlineContext.destination);
      source.start();

      const resampledBuffer = await offlineContext.startRendering();
      const resampledData = resampledBuffer.getChannelData(0);

      const dataSize = resampledData.length * (targetBitDepth / 8);
      const wavHeader = createWavHeader(dataSize, targetSampleRate, numOfChannels, targetBitDepth);
      const wavBuffer = new Uint8Array(wavHeader.length + dataSize);

      wavBuffer.set(wavHeader);

      for (let i = 0; i < resampledData.length; i++) {
        const sample = Math.max(-1, Math.min(1, resampledData[i]));
        let intSample;

        if (targetBitDepth === 8) {
          intSample = (sample + 1) * 127.5; // Convert to 8-bit unsigned
        } else {
          intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        }

        const offset = wavHeader.length + i * (targetBitDepth / 8);
        if (targetBitDepth === 8) {
          wavBuffer[offset] = intSample & 0xff;
        } else {
          wavBuffer[offset] = intSample & 0xff;
          wavBuffer[offset + 1] = (intSample >> 8) & 0xff;
        }
      }

      return new Blob([wavBuffer], { type: 'audio/wav' });
    };

    const createWavHeader = (dataSize: number, sampleRate: number, numOfChannels: number, bitDepth: number) => {
      const header = new ArrayBuffer(44);
      const view = new DataView(header);

      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numOfChannels * (bitDepth / 8), true);
      view.setUint16(32, numOfChannels * (bitDepth / 8), true);
      view.setUint16(34, bitDepth, true);
      writeString(view, 36, 'data');
      view.setUint32(40, dataSize, true);

      return new Uint8Array(header);
    };

    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // const createAacFile = async (audioChunks: Blob[], targetSampleRate: number = 16000): Promise<Blob> => {
    //   const audioContext = new AudioContext();
    //   const audioBuffer = await audioContext.decodeAudioData(await mergeAudioChunks(audioChunks).arrayBuffer());

    //   const numOfChannels = 1; // 모노로 변환
    //   const originalSampleRate = audioBuffer.sampleRate;
    //   const originalLength = audioBuffer.length;

    //   // 원본 샘플 레이트로 모노 버퍼 생성
    //   const monoBuffer = audioContext.createBuffer(numOfChannels, originalLength, originalSampleRate);
    //   const monoData = monoBuffer.getChannelData(0);

    //   // 채널을 모노로 합침
    //   for (let i = 0; i < originalLength; i++) {
    //     let sum = 0;
    //     for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    //       sum += audioBuffer.getChannelData(channel)[i];
    //     }
    //     monoData[i] = sum / audioBuffer.numberOfChannels;
    //   }

    //   // 타겟 샘플 레이트로 리샘플링
    //   const offlineContext = new OfflineAudioContext(
    //     numOfChannels,
    //     Math.ceil((originalLength * targetSampleRate) / originalSampleRate),
    //     targetSampleRate,
    //   );
    //   const source = offlineContext.createBufferSource();
    //   source.buffer = monoBuffer;
    //   source.connect(offlineContext.destination);
    //   source.start();

    //   const resampledBuffer = await offlineContext.startRendering();
    //   const resampledData = resampledBuffer.getChannelData(0);

    //   // MediaRecorder를 사용하여 webm 형식으로 녹음
    //   const recordedChunks: Blob[] = [];
    //   const mediaStream = audioContext.createMediaStreamDestination();
    //   const sourceNode = audioContext.createBufferSource();
    //   sourceNode.buffer = resampledBuffer;
    //   sourceNode.connect(mediaStream);
    //   const mediaRecorder = new MediaRecorder(mediaStream.stream, { mimeType: 'audio/webm' });

    //   mediaRecorder.ondataavailable = (event: BlobEvent) => {
    //     if (event.data.size > 0) {
    //       recordedChunks.push(event.data);
    //     }
    //   };

    //   mediaRecorder.start();
    //   sourceNode.start();

    //   // 녹음이 끝나면 Blob으로 반환
    //   return new Promise<Blob>((resolve) => {
    //     sourceNode.onended = () => {
    //       mediaRecorder.stop();
    //       mediaRecorder.onstop = () => {
    //         const webmBlob = new Blob(recordedChunks, { type: 'audio/webm' });
    //         resolve(webmBlob);
    //       };
    //     };
    //   });
    // };

    const uploadRecordFile = async () => {
      let uploadedFileNames: string[] = [];

      if (audioChunks.length > 0) {
        const wavFile = await createWavFile(audioChunks);
        const file = new File([wavFile], 'voice.wav', { lastModified: new Date().getTime() });

        // const aacFile = await createAacFile(audioChunks);
        // const file = new File([aacFile], 'voice.aac', { lastModified: new Date().getTime() });

        uploadedFileNames = await handleUploadFile(UploadFileTypeEnum['counseling/voices'], [file]);

        console.log(uploadedFileNames);
      }

      return uploadedFileNames;
    };

    const uploadAndDestroy = async (save: boolean) => {
      if (save) {
        if (recording) {
          //stopRecording();
          alert('녹음을 중지하고 저장을 해주세요.');
          onUpload(['hold']);
        } else {
          const uploadedFileNames = await uploadRecordFile();
          destroyRecording();
          onUpload(uploadedFileNames);
        }
      } else {
        destroyRecording();
      }
    };

    useImperativeHandle(ref, () => ({
      uploadAndDestroy,
    }));

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
      <div className="flex space-x-2 rounded-md border border-red-400 p-2">
        {!playing && (
          <>
            {recording ? (
              <Button.sm
                children={`${formatTime(recordingTime)} Stop`}
                disabled={!recording || playing}
                onClick={stopRecording}
                className="filled-red"
              />
            ) : (
              <Button.sm
                children={`${formatTime(recordingTime)} Rec`}
                disabled={recording || playing}
                onClick={startRecording}
                className="filled-red"
              />
            )}
          </>
        )}

        {audioChunks.length > 0 && (
          <>
            {playing ? (
              <>
                <Button.sm
                  children={`${formatTime(currentTime)}/${formatTime(recordingTime)} Stop`}
                  disabled={!playing || recording || audioChunks.length === 0}
                  onClick={stopPlayback}
                  className="filled-green"
                />
              </>
            ) : (
              <Button.sm
                children="Play"
                disabled={playing || recording || audioChunks.length === 0}
                onClick={playRecording}
                className="filled-blue"
              />
            )}

            <Button.sm
              children="Del"
              disabled={playing || recording || audioChunks.length === 0}
              onClick={DeleteRecording}
              className="filled-red"
            />
          </>
        )}

        {/* <Button.sm children="종료" onClick={destroyRecording} className="filled-red" />

        <Button.sm children="업로드" onClick={uploadRecordFile} className="filled-red" /> */}
      </div>
    );
  },
);

export default Recorder;
