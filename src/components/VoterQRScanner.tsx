import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { parseVoterQR } from '../utils/qrUtils';
import {
  Camera,
  CameraOff,
  SwitchCamera,
  Upload,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  QrCode,
} from 'lucide-react';

interface VoterQRScannerProps {
  onScanSuccess: (nisn: string, pin: string) => void;
  onSwitchToManual: () => void;
}

export const VoterQRScanner: React.FC<VoterQRScannerProps> = ({
  onScanSuccess,
  onSwitchToManual,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(true);
  const [scanDetected, setScanDetected] = useState<{ nisn: string; pin: string } | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Play short pleasant success sound using Web Audio API
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6 note

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // Audio not permitted or supported, non-blocking
    }
  };

  // Start Camera
  const startCamera = async (mode: 'environment' | 'user') => {
    setCameraError(null);
    setIsScanning(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Browser ini tidak mendukung akses kamera langsung. Silakan unggah foto kartu atau input manual.');
      return;
    }

    try {
      // Stop old stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      const error = err as { name?: string; message?: string };
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError('Izin akses kamera ditolak. Silakan izinkan kamera di browser atau gunakan input NISN & PIN.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('Kamera tidak ditemukan pada perangkat ini. Gunakan fitur upload gambar atau input manual.');
      } else {
        // Try fallback to any video device
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = fallbackStream;
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.setAttribute('playsinline', 'true');
            await videoRef.current.play();
          }
          return;
        } catch {
          setCameraError('Tidak dapat mengaktifkan kamera. Anda dapat mengunggah foto kartu suara atau memasukkan NISN secara manual.');
        }
      }
    }
  };

  // Camera toggle effect
  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  // Frame Scanning Loop using requestAnimationFrame
  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            const parsed = parseVoterQR(code.data);
            if (parsed) {
              setIsScanning(false);
              playBeep();
              setScanDetected(parsed);

              // Stop camera tracks
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
              }

              // Auto-forward
              setTimeout(() => {
                onScanSuccess(parsed.nisn, parsed.pin);
              }, 700);
              return;
            }
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isScanning, stream, onScanSuccess]);

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessingFile(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        setIsProcessingFile(false);

        if (code && code.data) {
          const parsed = parseVoterQR(code.data);
          if (parsed) {
            playBeep();
            setScanDetected(parsed);
            setTimeout(() => {
              onScanSuccess(parsed.nisn, parsed.pin);
            }, 600);
            return;
          }
        }
        alert('QR Code tidak terdeteksi atau tidak valid pada gambar tersebut. Pastikan QR code terlihat jelas dan terang.');
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="space-y-4">
      {/* Scanner Viewport */}
      <div className="relative w-full max-w-sm mx-auto aspect-square rounded-3xl overflow-hidden bg-slate-950 border-4 border-blue-600 shadow-2xl flex items-center justify-center">
        {/* Hidden internal canvas for QR processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Live Camera Video */}
        {!cameraError && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        )}

        {/* Camera Permission / Device Error Fallback View */}
        {cameraError && (
          <div className="p-6 text-center text-white space-y-3">
            <CameraOff className="w-12 h-12 text-rose-400 mx-auto" />
            <p className="text-xs sm:text-sm font-bold leading-relaxed text-slate-200">
              {cameraError}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Upload className="w-3.5 h-3.5" /> Unggah Foto Kartu
              </button>
            </div>
          </div>
        )}

        {/* Scanner Laser & Aiming Box Overlay */}
        {!cameraError && isScanning && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
            {/* Viewfinder box with glowing corners */}
            <div className="w-56 h-56 border-2 border-white/60 rounded-2xl relative shadow-2xl">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>

              {/* Animated Laser Scanning Line */}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-0 animate-pulse shadow-[0_0_12px_#38bdf8] duration-1000 transition-all"></div>
            </div>

            <p className="mt-4 text-xs font-black text-white bg-slate-900/80 px-3 py-1 rounded-full border border-white/20 backdrop-blur-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Arahkan QR Kartu ke Dalam Kotak
            </p>
          </div>
        )}

        {/* Scan Success Overlay */}
        {scanDetected && (
          <div className="absolute inset-0 bg-blue-900/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-black">Kartu Suara Terverifikasi!</h4>
            <p className="text-xs text-blue-200 mt-1 font-mono">
              ID Pemilih (NISN / NIP): <strong>{scanDetected.nisn}</strong>
            </p>
            <p className="text-xs text-blue-200 font-bold mt-2">
              Membuka bilik suara digital Anda...
            </p>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {!cameraError && (
          <button
            type="button"
            onClick={toggleCamera}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-300"
            title="Ganti kamera depan / belakang"
          >
            <SwitchCamera className="w-4 h-4 text-slate-600" />
            <span>Ganti Kamera</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessingFile}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-300"
          title="Unggah gambar atau foto kartu pemilih dari galeri/file"
        >
          <Upload className="w-4 h-4 text-blue-600" />
          <span>{isProcessingFile ? 'Membaca QR...' : 'Unggah Foto QR'}</span>
        </button>

        <button
          type="button"
          onClick={onSwitchToManual}
          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer border border-blue-200"
        >
          <span>Input Manual (NISN / NIP & PIN)</span>
        </button>
      </div>

      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs text-center flex items-center justify-center gap-2">
        <QrCode className="w-4 h-4 text-blue-700 shrink-0" />
        <span>
          QR Code pada Kartu Suara mencakup data <strong>NISN Siswa / NIP Guru</strong> dan <strong>PIN 6 Digit</strong> secara otomatis tanpa perlu mengetik manual.
        </span>
      </div>
    </div>
  );
};
