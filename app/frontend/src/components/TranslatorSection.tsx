import { useState, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  CameraOff,
  Trash2,
  Clock,
  AlertCircle,
  Wifi,
  Copy,
  Check,
} from "lucide-react";

const TIMING_OPTIONS = [2, 3, 4, 5];

// Simulated detection for demo purposes (replace with actual API call to your Flask backend)
const ASL_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

export default function TranslatorSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [confirmTime, setConfirmTime] = useState(3);
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const countdownRef = useRef(0);
  const currentLetterRef = useRef<string | null>(null);
  const confirmTimeRef = useRef(confirmTime);

  useEffect(() => {
    confirmTimeRef.current = confirmTime;
  }, [confirmTime]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);

      // Simulate detection every second (in production, send frames to your Flask API)
      intervalRef.current = setInterval(() => {
        const randomLetter =
          ASL_LETTERS[Math.floor(Math.random() * ASL_LETTERS.length)];
        handleDetection(randomLetter);
      }, 1000);
    } catch {
      setError(
        "Impossible d'accéder à la caméra. Vérifiez les permissions."
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
    setCurrentLetter(null);
    setCountdown(0);
    setIsConnected(false);
    countdownRef.current = 0;
    currentLetterRef.current = null;
  }, []);

  const handleDetection = useCallback((letter: string) => {
    if (letter === currentLetterRef.current) {
      countdownRef.current += 1;
      setCountdown(countdownRef.current);
      if (countdownRef.current >= confirmTimeRef.current) {
        setTranslatedText((prev) => prev + letter);
        countdownRef.current = 0;
        setCountdown(0);
      }
    } else {
      currentLetterRef.current = letter;
      setCurrentLetter(letter);
      countdownRef.current = 1;
      setCountdown(1);
    }
    setIsConnected(true);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPercent = currentLetter
    ? Math.min((countdown / confirmTime) * 100, 100)
    : 0;

  return (
    <section id="translator" className="relative py-20 md:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E94560]/10 border border-[#E94560]/20 text-[#E94560] text-xs font-semibold uppercase tracking-wider mb-4">
            <Camera className="w-3.5 h-3.5" />
            Traduction en temps réel
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Traducteur{" "}
            <span className="bg-gradient-to-r from-[#E94560] to-[#533483] bg-clip-text text-transparent">
              ASL
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Activez votre caméra et commencez à signer. L'IA détectera vos
            gestes et les traduira en lettres.
          </p>
        </div>

        {/* Timing selector */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Temps de confirmation :</span>
          <div className="flex gap-2">
            {TIMING_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setConfirmTime(t)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 ${
                  confirmTime === t
                    ? "bg-gradient-to-r from-[#E94560] to-[#533483] text-white shadow-lg shadow-[#E94560]/25"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>

        {/* Main translator grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Webcam box */}
          <div className="relative group">
            {/* Animated border */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-[#E94560] via-[#533483] to-[#E94560] rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 blur-[1px] animate-gradient-shift" />
            <div className="relative bg-[#16213E] rounded-3xl overflow-hidden">
              {/* Camera header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      cameraOn ? "bg-green-400 animate-pulse" : "bg-red-400"
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-400">
                    {cameraOn ? "Caméra active" : "Caméra inactive"}
                  </span>
                </div>
                {isConnected && (
                  <div className="flex items-center gap-1.5 text-green-400">
                    <Wifi className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Connecté</span>
                  </div>
                )}
              </div>

              {/* Video area */}
              <div className="relative aspect-[4/3] bg-black/50">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    cameraOn ? "block" : "hidden"
                  }`}
                  style={{ transform: "scaleX(-1)" }}
                />
                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                      <CameraOff className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      Cliquez sur le bouton pour activer la caméra
                    </p>
                  </div>
                )}

                {/* Current detection overlay */}
                {cameraOn && currentLetter && (
                  <div className="absolute top-4 right-4 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <span className="text-3xl font-black text-white uppercase">
                        {currentLetter}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#E94560] to-[#533483] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {countdown}/{confirmTime}s
                    </span>
                  </div>
                )}
              </div>

              {/* Camera controls */}
              <div className="flex items-center justify-center gap-3 p-4">
                <button
                  onClick={cameraOn ? stopCamera : startCamera}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    cameraOn
                      ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                      : "bg-gradient-to-r from-[#E94560] to-[#533483] text-white shadow-lg shadow-[#E94560]/25 hover:scale-105"
                  }`}
                >
                  {cameraOn ? (
                    <>
                      <CameraOff className="w-4 h-4" /> Arrêter
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" /> Démarrer la caméra
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Translation box */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-[#533483] via-[#E94560] to-[#533483] rounded-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 blur-[1px]" />
            <div className="relative bg-[#16213E] rounded-3xl overflow-hidden h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <span className="text-xs font-medium text-gray-400">
                  Traduction
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!translatedText}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
                    title="Copier"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setTranslatedText("")}
                    disabled={!translatedText}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
                    title="Effacer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Translation output */}
              <div className="flex-1 p-6 min-h-[300px] lg:min-h-0">
                {translatedText ? (
                  <p
                    className="text-2xl sm:text-3xl font-mono font-bold text-white leading-relaxed tracking-wider break-all"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {translatedText.split("").map((char, i) => (
                      <span
                        key={i}
                        className={`inline-block ${
                          i === translatedText.length - 1
                            ? "text-[#E94560] animate-pulse"
                            : "text-green-400"
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                    <span className="inline-block w-0.5 h-8 bg-[#E94560] ml-1 animate-blink align-middle" />
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <span className="text-3xl">🤟</span>
                    </div>
                    <p className="text-gray-500 text-sm max-w-xs">
                      Les lettres détectées apparaîtront ici en temps réel
                    </p>
                  </div>
                )}
              </div>

              {/* Stats bar */}
              <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {translatedText.length} lettre
                  {translatedText.length !== 1 ? "s" : ""} détectée
                  {translatedText.length !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-gray-500">
                  Confirmation : {confirmTime}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 max-w-2xl mx-auto flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Info note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 max-w-lg mx-auto">
            💡 <strong className="text-gray-500">Mode démo :</strong> Les
            lettres sont simulées aléatoirement. Connectez votre backend Flask
            avec le modèle <code className="text-[#E94560]">model_sign_language.p</code> pour
            la détection réelle.
          </p>
        </div>
      </div>
    </section>
  );
}