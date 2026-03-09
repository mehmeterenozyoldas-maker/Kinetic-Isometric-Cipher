import React, { useRef, useState, useCallback } from 'react';
import { Scene } from './components/Scene';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture at 60 FPS
    // @ts-ignore - captureStream is not in standard Typescript types for HTMLCanvasElement yet
    const stream = canvas.captureStream(60) as MediaStream;

    // High Quality Options
    const options: MediaRecorderOptions = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 8000000 // 8 Mbps
    };

    // Fallback if VP9 is not supported (e.g. Safari)
    if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
      console.warn("VP9 not supported, falling back to default");
      delete options.mimeType; // Let browser choose default (usually mp4/h264 or webm/vp8)
    }

    try {
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        chunksRef.current = [];
        
        // Trigger Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kinetic-cipher-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      recorder.start();
      setIsRecording(true);
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return (
    <main className="relative w-full h-full min-h-screen font-sans text-white select-none overflow-hidden">
      <Scene ref={canvasRef} />
      
      {/* Scandinavian Minimal UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-12 flex flex-col justify-between">
        
        {/* Header - Clean typography, floating */}
        <header className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-medium tracking-wide text-white/90">
              Kinetic Isometric Cipher
            </h1>
            <span className="text-xs font-light text-white/50 tracking-widest uppercase">
              Procedural Monument
            </span>
          </div>

          {/* Status & Actions - Minimal, functional */}
          <div className="flex items-center gap-6 pointer-events-auto">
            {/* Recorder Button */}
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 text-[10px] font-medium tracking-wider uppercase transition-all duration-300 hover:opacity-100 ${isRecording ? 'text-red-500 opacity-100' : 'text-white opacity-40'}`}
              title={isRecording ? "Stop Recording" : "Start Recording"}
            >
              <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-current'}`} />
              {isRecording ? 'Stop Rec' : 'Rec'}
            </button>

            {/* Live Indicator */}
            <div className="flex items-center gap-3 text-white/60">
              <span className="text-[10px] font-medium tracking-wider uppercase">Live</span>
              <div className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </div>
            </div>
          </div>
        </header>

        {/* Footer - Information hierarchy */}
        <footer className="flex justify-between items-end">
          
          {/* Data Points - Clean columns with ample spacing */}
          <div className="flex gap-12 text-[10px] font-light text-white/40 tracking-wide">
            <div className="flex flex-col gap-0.5">
              <span className="uppercase text-white/20">Grid</span>
              <span>6x6x6</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="uppercase text-white/20">Motion</span>
              <span>Quantized</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="uppercase text-white/20">Seed</span>
              <span>42</span>
            </div>
          </div>

          {/* Subtle Interaction Hint */}
          <div className="text-[10px] font-light text-white/20">
            Scroll to zoom / Drag to pan
          </div>
        </footer>
      </div>
    </main>
  );
};

export default App;