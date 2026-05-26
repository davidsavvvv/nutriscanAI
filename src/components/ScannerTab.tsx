import { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import { Camera, Upload, AlertCircle, Sparkles, Image as ImageIcon, Video, VideoOff, RefreshCw } from "lucide-react";

interface ScannerTabProps {
  onScanComplete: (result: any, previewUrl?: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function ScannerTab({ onScanComplete, isLoading, setIsLoading }: ScannerTabProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle Drag-and-Drop events
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Convert uploaded/captured file to Data URL base64
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // WebCam Capture flows
  const startCamera = async () => {
    setCameraError(null);
    setImagePreview(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // prefer rear camera for physical scanner
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Could not access camera. Please make sure camera permissions are granted or upload an image file instead."
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setImagePreview(dataUrl);
      stopCamera();
    }
  };

  // Request actual Gemini service through server endpoint
  const triggerScan = async () => {
    if (!imagePreview) return;

    setIsLoading(true);
    setScanMessage("Extracting brand visual components...");
    
    // Stagger loading messages for an immersive feel
    const msgs = [
      "Calibrating active additive indicators...",
      "Resolving micronutrient values and sweeteners...",
      "Computing metabolic and performance index...",
    ];
    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < msgs.length) {
        setScanMessage(msgs[msgIdx]);
        msgIdx++;
      }
    }, 1200);

    try {
      const resp = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imagePreview,
          mimeType: "image/jpeg",
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.message || data.error || "Analysis failed");
      }

      clearInterval(interval);
      // Map scannedAt & visual URL context
      onScanComplete({
        ...data,
        scannedAt: new Date().toISOString(),
        imageUrl: imagePreview,
      });

    } catch (err: any) {
      console.error("Scan API Error:", err);
      alert(`Nutrition scan failed: ${err.message || "An unexpected error occurred."}`);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Scanner Box container */}
      <div 
        className={`relative aspect-video max-w-2xl mx-auto w-full rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all bg-slate-50/50 ${
          dragActive ? "border-slate-400 bg-slate-100/50" : "border-slate-200 border-dashed"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {/* Animated Green Scanning Laser Overlay (only active when loading) */}
        {isLoading && (
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
            {/* The laser light bar */}
            <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-slate-800 to-transparent shadow-[0_0_15px_#1e293b] absolute top-0 animate-[bounce_3s_infinite_ease-in-out]"></div>
            <div className="absolute inset-0 bg-slate-200/10 backdrop-blur-[0.5px]"></div>
          </div>
        )}

        {/* 1. Camera live active stream */}
        {cameraActive && (
          <div className="absolute inset-0 w-full h-full z-10 flex flex-col">
            <video 
              ref={videoRef} 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            {/* Camera action HUD overlay */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-20">
              <button
                type="button"
                onClick={captureSnapshot}
                className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-display font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Camera className="w-4 h-4" /> Capture Product Snapshot
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="bg-white hover:bg-slate-100 text-slate-700 font-mono text-[10px] uppercase tracking-wider px-4 py-2 rounded-full border border-slate-200 cursor-pointer shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* 2. Image preview stage */}
        {imagePreview ? (
          <div className="absolute inset-0 w-full h-full z-10 flex flex-col justify-between items-center bg-slate-50 p-4">
            <img 
              src={imagePreview} 
              alt="Scan Preview" 
              className="max-h-[80%] w-auto object-contain rounded-2xl border border-slate-200 shadow-sm"
            />
            
            <div className="flex gap-4 w-full justify-center max-w-sm">
              <button
                onClick={triggerScan}
                disabled={isLoading}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold font-display text-xs uppercase tracking-wider py-3 px-5 rounded-full flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 select-none cursor-pointer active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" /> {isLoading ? "Analyzing Product..." : "Trigger AI Scans"}
              </button>

              <button
                onClick={() => {
                  setImagePreview(null);
                  setCameraActive(false);
                }}
                disabled={isLoading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] uppercase px-4 py-3 rounded-full cursor-pointer border border-slate-200/50"
              >
                Reset photo
              </button>
            </div>
          </div>
        ) : null}

        {/* 3. Drag Drop and Selection Default Interface */}
        {!cameraActive && !imagePreview && (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center mb-4 text-slate-500 transition-colors">
              <Upload className="w-8 h-8" />
            </div>
            
            <h4 className="text-slate-900 font-display font-semibold text-base">
              Drag snack product photo here, or <span className="text-slate-950 font-bold underline cursor-pointer hover:text-slate-800" onClick={() => fileInputRef.current?.click()}>browse files</span>
            </h4>
            <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
              Supported file types: PNG, JPEG, WEBP. Focus carefully on the brand labels and nutrition facts block.
            </p>

            {/* Camera option togglers */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={startCamera}
                className="text-xs font-display font-bold uppercase bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full border border-slate-900 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4 text-white" /> Start Device Camera
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-display font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-full border border-slate-200 flex items-center gap-2 cursor-pointer transition-all"
              >
                <ImageIcon className="w-4 h-4 text-slate-500" /> Select File
              </button>
            </div>
          </div>
        )}

        {/* Invisible file input */}
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      {/* Loading message HUD */}
      {isLoading && (
        <div className="text-center bg-slate-50 max-w-md mx-auto p-4 rounded-2xl border border-slate-200 animate-pulse text-slate-800 shadow-sm">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-950" />
          <p className="text-xs font-mono uppercase tracking-widest font-bold text-slate-900">Scanning Processing Engine</p>
          <p className="text-xs text-slate-500 mt-1">{scanMessage}</p>
        </div>
      )}

      {/* Camera failure alert block */}
      {cameraError && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl max-w-xl mx-auto flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <div>
            <span className="font-bold block uppercase tracking-wider mb-0.5">Camera Loading Blocked</span>
            {cameraError}
          </div>
        </div>
      )}

    </div>
  );
}
