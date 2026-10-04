





import React, { useState, useRef, useCallback, useEffect } from "react";
import { Circle, Square, Mic, MicOff, Trash2, Play } from "lucide-react";
import { RecordingHistory } from "../data/RecordingHistory";

interface DrawingRecorderProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const DrawingRecorder: React.FC<DrawingRecorderProps> = ({
  canvasRef,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [recordings, setRecordings] = useState<
    { id: string; timestamp: number; duration: number; hasAudio: boolean; name?: string }[]
  >([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const loadRecordings = useCallback(async () => {
    const recs = await RecordingHistory.getRecordings();
    setRecordings(
      recs.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        duration: r.duration,
        hasAudio: r.hasAudio,
        name: r.name,
      })),
    );
  }, []);

  useEffect(() => {
    if (showPanel) {
      loadRecordings();
    }
  }, [showPanel, loadRecordings]);

  const startRecording = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      
      const videoStream = canvas.captureStream(60);

      
      let combinedStream: MediaStream;
      if (audioEnabled) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000,
              channelCount: 2,
            },
          });
          audioStreamRef.current = audioStream;
          combinedStream = new MediaStream([
            ...videoStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
          ]);
        } catch {
          
          combinedStream = videoStream;
        }
      } else {
        combinedStream = videoStream;
      }

      
      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];

      let mimeType = "";
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      // High bitrate for 60fps smooth recording (8Mbps video + clear audio)
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: mimeType || undefined,
        videoBitsPerSecond: 8000000, // 8Mbps for 60fps quality
        audioBitsPerSecond: 256000,   // 256kbps for clear audio
      });

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "video/webm",
        });

        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

        
        let thumbnail: string | undefined;
        try {
          thumbnail = canvas.toDataURL("image/jpeg", 0.3);
        } catch {
          
        }

        await RecordingHistory.saveRecording({
          timestamp: startTimeRef.current,
          duration,
          hasAudio: audioEnabled && !!audioStreamRef.current,
          blob,
          thumbnail,
        });

        
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vision-suite-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((t) => t.stop());
          audioStreamRef.current = null;
        }
      };

      recorder.start(500); 
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setElapsedSeconds(0);

      timerRef.current = setInterval(() => {
        setElapsedSeconds(
          Math.floor((Date.now() - startTimeRef.current) / 1000),
        );
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }, [canvasRef, audioEnabled]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setElapsedSeconds(0);
  }, []);

  const playRecording = useCallback(async (id: string) => {
    const recording = await RecordingHistory.getRecording(id);
    if (!recording) return;

    const url = URL.createObjectURL(recording.blob);
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.style.cssText =
      "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);max-width:90vw;max-height:90vh;z-index:99999;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5);";

    const backdrop = document.createElement("div");
    backdrop.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99998;";
    backdrop.onclick = () => {
      video.pause();
      document.body.removeChild(video);
      document.body.removeChild(backdrop);
      URL.revokeObjectURL(url);
    };

    document.body.appendChild(backdrop);
    document.body.appendChild(video);
    video.play();
  }, []);

  const deleteRecording = useCallback(
    async (id: string) => {
      await RecordingHistory.deleteRecording(id);
      loadRecordings();
    },
    [loadRecordings],
  );

  return (
    <>
      {}
      <button
        className={`vd-btn vd-btn--icon vd-btn--ghost ${isRecording ? "vd-recording-active" : ""}`}
        onClick={isRecording ? stopRecording : startRecording}
        title={isRecording ? "Stop recording" : "Start recording"}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? (
          <span className="vd-recording-indicator">
            <span className="vd-recording-dot" />
            <Mic size={14} style={{ marginRight: 2 }} />
            <span className="vd-recording-time">{formatTime(elapsedSeconds)}</span>
          </span>
        ) : (
          <Mic size={16} />
        )}
      </button>

      {}
      {!isRecording && (
        <button
          className={`vd-btn vd-btn--icon vd-btn--ghost ${!audioEnabled ? "vd-recording-muted" : ""}`}
          onClick={() => setAudioEnabled(!audioEnabled)}
          title={audioEnabled ? "Microphone on" : "Microphone off"}
          aria-label={audioEnabled ? "Microphone on" : "Microphone off"}
        >
          {audioEnabled ? <Mic size={15} /> : <MicOff size={15} />}
        </button>
      )}

      {}
      {showPanel && (
        <div className="vd-recording-panel">
          <div className="vd-recording-panel__header">
            <span className="vd-recording-panel__title">Recordings</span>
            <button
              className="vd-btn vd-btn--icon vd-btn--ghost"
              onClick={() => setShowPanel(false)}
            >
              ×
            </button>
          </div>
          <div className="vd-recording-panel__list">
            {recordings.length === 0 ? (
              <div className="vd-recording-panel__empty">
                No recordings yet
              </div>
            ) : (
              recordings.map((rec) => (
                <div key={rec.id} className="vd-recording-panel__item">
                  <div className="vd-recording-panel__info">
                    <span className="vd-recording-panel__duration">
                      {formatTime(rec.duration)}
                    </span>
                    <span className="vd-recording-panel__date">
                      {new Date(rec.timestamp).toLocaleDateString()}
                    </span>
                    {rec.hasAudio && <Mic size={10} />}
                  </div>
                  <div className="vd-recording-panel__actions">
                    <button
                      className="vd-btn vd-btn--icon vd-btn--ghost vd-btn--sm"
                      onClick={() => playRecording(rec.id)}
                      title="Play"
                    >
                      <Play size={12} />
                    </button>
                    <button
                      className="vd-btn vd-btn--icon vd-btn--ghost vd-btn--sm"
                      onClick={() => deleteRecording(rec.id)}
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};
