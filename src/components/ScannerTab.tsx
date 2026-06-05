import { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import { Camera, Upload, AlertCircle, Sparkles, Image as ImageIcon, Video, VideoOff, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface ScannerTabProps {
  onScanComplete: (result: any, previewUrl?: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  plan?: string;
  freeScansUsed?: number;
}

export default function ScannerTab({ onScanComplete, isLoading, setIsLoading, plan = "free", freeScansUsed = 0 }: ScannerTabProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

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
      
      {/* SCAN BUDGET PROGRESS BAR (Only if free or starter) */}
      {(plan === "free" || plan === "starter") && (
        <div className="bg-[#111] border border-[#2a2a2a] p-4 rounded-3xl animate-in fade-in duration-500 mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display flex items-center gap-2">
              📸 Scans {plan === "starter" ? "Starter" : "Gratuits"} {freeScansUsed}/{plan === "starter" ? 20 : 5}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
              {(plan === "starter" ? 20 : 5) - freeScansUsed} restants
            </span>
          </div>
          <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden flex">
            {Array.from({ length: plan === "starter" ? 20 : 5 }).map((_, i) => {
              const active = i < freeScansUsed;
              const limit = plan === "starter" ? 20 : 5;
              let color = 'bg-[#00FF88]';
              if (freeScansUsed >= limit - 1) color = 'bg-rose-500';
              else if (freeScansUsed === limit - 2) color = 'bg-amber-400';

              return (
                <div 
                  key={i} 
                  className={`flex-1 h-full border-r border-[#111] last:border-r-0 transition-all duration-500 ${active ? color : 'bg-[#222]'}`} 
                />
              );
            })}
          </div>
          {(freeScansUsed === (plan === "starter" ? 18 : 3)) && (
            <p className="text-[11px] text-amber-400/80 mt-2 font-medium flex items-center gap-1.5 animate-pulse">
              ✨ Tu adores ScanMyMacros ? Plus que 2 scans...
            </p>
          )}
          {(freeScansUsed === (plan === "starter" ? 19 : 4)) && (
            <p className="text-[11px] text-rose-400 mt-2 font-bold flex items-center gap-1.5 animate-[pulse_1.5s_infinite]">
              ⚠️ Dernier scan disponible !
            </p>
          )}
          {freeScansUsed >= (plan === "starter" ? 20 : 5) && (
            <p className="text-[11px] text-rose-500 mt-2 font-bold flex items-center gap-1.5">
              🛑 Limite atteinte. Passe à Pro pour continuer.
            </p>
          )}
        </div>
      )}

      {/* Scanner Box container */}
      <div 
        className={`relative w-full flex flex-col items-center justify-center transition-all ${
          dragActive ? "opacity-70 scale-[0.98]" : ""
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {/* Animated Scanning Laser Overlay (only active when loading) */}
        {isLoading && (
          <div className="absolute inset-0 z-30 pointer-events-none rounded-3xl overflow-hidden shrink-0 mt-2">
            <div className="w-full h-1.5 bg-[#00FF88] shadow-[0_0_20px_#00FF88] absolute top-1/2 -translate-y-1/2 animate-pulse"></div>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-3xl flex items-center justify-center text-white font-bold tracking-widest text-xs uppercase z-40">
              Extraction en cours...
            </div>
          </div>
        )}

        {/* 1. Camera live active stream */}
        {cameraActive && (
          <div className="w-full aspect-video relative z-10 flex flex-col rounded-[24px] overflow-hidden bg-black mb-4 mt-2 border border-slate-800">
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
                className="bg-[#00FF88] text-black font-display font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Camera className="w-4 h-4" /> Capturer
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="bg-black/60 hover:bg-black text-white font-mono text-[10px] uppercase tracking-wider px-4 py-2 rounded-full cursor-pointer shadow-sm border border-slate-700"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* 2. Image preview stage */}
        {imagePreview ? (
          <div className="w-full relative z-10 flex flex-col items-center p-6 bg-[#141414] rounded-[24px] border-2 border-slate-800 mt-2">
            <img 
              src={imagePreview} 
              alt="Scan Preview" 
              className="max-h-[300px] w-auto object-contain rounded-xl border border-[#2a2a2a] shadow-lg mb-6"
            />
            
            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={triggerScan}
                disabled={isLoading}
                className="flex-1 bg-[#00FF88] text-black font-bold font-display text-xs uppercase tracking-wider py-4 px-5 rounded-[16px] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.15)] disabled:opacity-40 cursor-pointer active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" /> {isLoading ? "Analyse..." : "Lancer l'IA"}
              </button>

              <button
                onClick={() => {
                  setImagePreview(null);
                  setCameraActive(false);
                }}
                disabled={isLoading}
                className="bg-transparent hover:bg-slate-900 border-2 border-slate-800 text-slate-400 font-bold text-xs uppercase px-5 py-4 rounded-[16px] cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : null}

        {/* 3. Drag Drop and Selection Default Interface */}
        {!cameraActive && !imagePreview && (
          <div className="w-full text-center flex flex-col gap-4 mt-2">
            <button
              onClick={() => {
                 const limit = plan === "starter" ? 20 : 5;
                 if ((plan === "free" || plan === "starter") && freeScansUsed >= limit) {
                    alert("Limite de scans atteinte. Veuillez passer à Pro.");
                    return;
                 }
                 fileInputRef.current?.click();
              }}
              className={`w-full h-[120px] bg-[#00FF88] hover:bg-[#00e67a] active:scale-[0.98] text-black rounded-[24px] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.2)] transition-all cursor-pointer border border-[#00d4aa] ${((plan === "free" || plan === "starter") && freeScansUsed >= (plan === "starter" ? 20 : 5)) ? "opacity-50 grayscale" : ""}`}
            >
              <span className="text-4xl mb-1">📸</span>
              <span className="font-extrabold text-2xl font-display tracking-wider block">Prendre une photo</span>
              <span className="text-xs font-semibold opacity-70 mt-0.5">Pointe vers l'étiquette ou l'aliment</span>
            </button>

            <button
              onClick={() => {
                 const limit = plan === "starter" ? 20 : 5;
                 if ((plan === "free" || plan === "starter") && freeScansUsed >= limit) {
                    alert("Limite de scans atteinte. Veuillez passer à Pro.");
                    return;
                 }
                 uploadInputRef.current?.click();
              }}
              className={`w-full h-[54px] bg-[#1a1a1a] hover:bg-[#222] border-2 border-[#2a2a2a] text-slate-300 font-bold text-[13px] rounded-[16px] flex items-center justify-center transition-all cursor-pointer ${((plan === "free" || plan === "starter") && freeScansUsed >= (plan === "starter" ? 20 : 5)) ? "opacity-50" : ""}`}
            >
              <Upload className="w-4 h-4 mr-2 opacity-50" /> Télécharger une photo
            </button>
          </div>
        )}

        {/* Invisible file input for direct camera capture */}
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={(plan === "free" || plan === "starter") && freeScansUsed >= (plan === "starter" ? 20 : 5)}
        />

        {/* Secondary file input for standard gallery/file picker upload */}
        <input 
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={(plan === "free" || plan === "starter") && freeScansUsed >= (plan === "starter" ? 20 : 5)}
        />
      </div>

      {/* BLOCKING SCREEN IF LIMIT REACHED */}
      {(plan === "free" || plan === "starter") && freeScansUsed >= (plan === "starter" ? 20 : 5) && (
        <div className="absolute inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md rounded-[32px] flex flex-col justify-center items-center p-6 text-center shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
          
          <motion.div 
             className="w-20 h-20 mb-6 bg-rose-500/10 rounded-full flex justify-center items-center filter drop-shadow-xl"
             animate={{ rotate: [-3, 3, -3] }}
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
             <AlertCircle className="w-10 h-10 text-rose-500" />
          </motion.div>

          <h3 className="text-2xl font-black font-display text-white tracking-tight mb-2">
            Tu as utilisé tes 5 scans gratuits !
          </h3>
          <p className="text-slate-400 font-medium mb-8">
            Passe au Pro pour scanner illimité
          </p>

          <button 
             onClick={() => document.dispatchEvent(new CustomEvent('openPaywall'))}
             className="w-full h-[56px] min-h-[56px] bg-purple-600 hover:bg-purple-500 active:scale-[0.98] transition-all rounded-[16px] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(147,51,234,0.3)]"
          >
             Essayer Pro 7 jours gratuits →
          </button>
        </div>
      )}

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
