import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface ScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  active: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose, active }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Logic to determine initial camera
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setFacingMode(isMobile ? 'environment' : 'user');
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: { exact: facingMode }
        }
      };

      // Fallback if exact facing mode fails
      const fallbackConstraints = {
        video: {
          facingMode: facingMode
        }
      };

      let newStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        newStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      }

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError('');
    } catch (err) {
      console.error("Camera Error:", err);
      setError('No se pudo acceder a la cámara. Verifique los permisos.');
    }
  }, [facingMode]);

  useEffect(() => {
    if (active) {
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, startCamera]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md relative bg-black rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
          <span className="text-white font-medium flex items-center gap-2">
            <Camera className="w-5 h-5 text-green-400" />
            Escaneando...
          </span>
          <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Area */}
        <div className="relative aspect-[3/4] w-full bg-gray-900">
          {!error ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-red-400 p-4 text-center">
              {error}
            </div>
          )}

          {/* Scanner Overlay/Reticle */}
          <div className="absolute inset-0 border-2 border-green-500/50 m-12 rounded-lg flex flex-col items-center justify-center pointer-events-none">
            <div className="w-full h-0.5 bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 bg-gray-900 flex justify-center gap-4">
          <button 
            onClick={toggleCamera}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Cambiar Cámara
          </button>
        </div>
      </div>
      
      <p className="text-gray-400 mt-4 text-sm max-w-xs text-center">
        Alinee el código QR o de barras dentro del marco.
      </p>
    </div>
  );
};

export default Scanner;