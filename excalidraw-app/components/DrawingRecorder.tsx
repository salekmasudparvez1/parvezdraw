/**
 * Drawing Recorder for Parvez Draw
 * Records canvas time-lapse with optional voice narration.
 * Saves recordings locally via IndexedDB.
 */

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
      // Get canvas video stream
      const videoStream = canvas.captureStream(30);

      // Get audio stream if enabled
      let combinedStream: MediaStream;
      if (audioEnabled) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          audioStreamRef.current = audioStream;
          combinedStream = new MediaStream([
            ...videoStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
          ]);
        } catch {
          // Microphone denied, proceed with video only
          combinedStream = videoStream;
        }
      } else {
        combinedStream = videoStream;
      }

      // Determine supported mime type
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

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: mimeType || undefined,
        videoBitsPerSecond: 2500000,
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

        // Capture thumbnail
        let thumbnail: string | undefined;
        try {
          thumbnail = canvas.toDataURL("image/jpeg", 0.3);
        } catch {
          // Canvas may be tainted
        }

        await RecordingHistory.saveRecording({
          timestamp: startTimeRef.current,
          duration,
          hasAudio: audioEnabled && !!audioStreamRef.current,
          blob,
          thumbnail,
        });

        // Download the recording
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `parvez-draw-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Clean up audio tracks
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((t) => t.stop());
          audioStreamRef.current = null;
        }
      };

      recorder.start(1000); // Collect data every second
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
      {/* Record button */}
      <button
        className={`pd-btn pd-btn--icon pd-btn--ghost ${isRecording ? "pd-recording-active" : ""}`}
        onClick={isRecording ? stopRecording : startRecording}
        title={isRecording ? "Stop recording" : "Start recording"}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? (
          <span className="pd-recording-indicator">
            <span className="pd-recording-dot" />
            <span className="pd-recording-time">{formatTime(elapsedSeconds)}</span>
          </span>
        ) : (
          <Circle size={16} fill="#f42a41" color="#f42a41" />
        )}
      </button>

      {/* Audio toggle */}
      {!isRecording && (
        <button
          className={`pd-btn pd-btn--icon pd-btn--ghost ${!audioEnabled ? "pd-recording-muted" : ""}`}
          onClick={() => setAudioEnabled(!audioEnabled)}
          title={audioEnabled ? "Disable microphone" : "Enable microphone"}
          aria-label={audioEnabled ? "Disable microphone" : "Enable microphone"}
        >
          {audioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
        </button>
      )}

      {/* Recordings panel */}
      {showPanel && (
        <div className="pd-recording-panel">
          <div className="pd-recording-panel__header">
            <span className="pd-recording-panel__title">Recordings</span>
            <button
              className="pd-btn pd-btn--icon pd-btn--ghost"
              onClick={() => setShowPanel(false)}
            >
              ×
            </button>
          </div>
          <div className="pd-recording-panel__list">
            {recordings.length === 0 ? (
              <div className="pd-recording-panel__empty">
                No recordings yet
              </div>
            ) : (
              recordings.map((rec) => (
                <div key={rec.id} className="pd-recording-panel__item">
                  <div className="pd-recording-panel__info">
                    <span className="pd-recording-panel__duration">
                      {formatTime(rec.duration)}
                    </span>
                    <span className="pd-recording-panel__date">
                      {new Date(rec.timestamp).toLocaleDateString()}
                    </span>
                    {rec.hasAudio && <Mic size={10} />}
                  </div>
                  <div className="pd-recording-panel__actions">
                    <button
                      className="pd-btn pd-btn--icon pd-btn--ghost pd-btn--sm"
                      onClick={() => playRecording(rec.id)}
                      title="Play"
                    >
                      <Play size={12} />
                    </button>
                    <button
                      className="pd-btn pd-btn--icon pd-btn--ghost pd-btn--sm"
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
