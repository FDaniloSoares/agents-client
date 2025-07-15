/** biome-ignore-all lint/suspicious/noConsole: will be necessary */
import { useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const isRecordingSupported =
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getUserMedia === 'function' &&
  typeof window.MediaRecorder === 'function';

type RoomParams = {
  roomId: string;
};

export function RecordRoomAudio() {
  const params = useParams<RoomParams>();

  const recorder = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    if (!isRecordingSupported) {
      return alert(`Your browser don't support recording`);
    }

    setIsRecording(true);

    const audio = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44_100,
      },
    });

    recorder.current = new MediaRecorder(audio, {
      mimeType: 'audio/webm',
      audioBitsPerSecond: 64_000,
    });

    recorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        uploadAudio(event.data);
      }
    };

    recorder.current.onstart = () => {
      console.log('Gravação iniciada!');
    };

    recorder.current.onstop = () => {
      console.log('Gravação encerrada!');
    };

    recorder.current.start();
  };

  const stopRecording = () => {
    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.stop();
    }
    setIsRecording(false);
  };

  const uploadAudio = async (audio: Blob) => {
    const formData = new FormData();
    formData.append('file', audio, 'audio.webm');

    const response = await fetch(
      `http://localhost:3333/rooms/${params.roomId}/audio`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = response.json();
    console.log(result);
  };

  if (!params.roomId) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      {isRecording ? (
        <Button onClick={stopRecording}>Pause recording</Button>
      ) : (
        <Button onClick={startRecording}>Record Audio</Button>
      )}
      {isRecording ? <p>Recording...</p> : <p>Stoped</p>}
    </div>
  );
}
