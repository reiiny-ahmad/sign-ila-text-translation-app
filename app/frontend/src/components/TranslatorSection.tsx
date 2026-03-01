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
  Play,
  Pause,
  Hand,
} from "lucide-react";

const TIMING_OPTIONS = [2, 3, 4, 5];
const PREDICT_INTERVAL_MS = 900;
const HANDS_INTERVAL_MS = 140;
const PREDICT_ENDPOINT = "/api/predict";
const HANDS_ENDPOINT = "/api/hands";
const MAX_PARTICLES = 180;
const MAX_TRAIL_POINTS = 20;

type HandPoint = {
  x: number;
  y: number;
  pinch?: boolean;
  handedness?: string | null;
};

type Point2D = {
  x: number;
  y: number;
};

type TrailPoint = Point2D & {
  alpha: number;
};

type FxParticle = Point2D & {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  handIndex: number;
};

export default function TranslatorSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const predictInFlightRef = useRef(false);
  const handsInFlightRef = useRef(false);
  const handPointsRef = useRef<HandPoint[]>([]);
  const trailsRef = useRef<TrailPoint[][]>([[], []]);
  const fxParticlesRef = useRef<FxParticle[]>([]);
  const animationRef = useRef<number | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [translationActive, setTranslationActive] = useState(false);
  const [confirmTime, setConfirmTime] = useState(3);
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [handCount, setHandCount] = useState(0);

  const countdownRef = useRef(0);
  const currentLetterRef = useRef<string | null>(null);
  const confirmTimeRef = useRef(confirmTime);

  useEffect(() => {
    confirmTimeRef.current = confirmTime;
  }, [confirmTime]);

  const resetDetectionState = useCallback(() => {
    setCurrentLetter(null);
    setCountdown(0);
    countdownRef.current = 0;
    currentLetterRef.current = null;
  }, []);

  const resetInteractionEffects = useCallback(() => {
    trailsRef.current = [[], []];
    fxParticlesRef.current = [];

    if (!fxCanvasRef.current) {
      return;
    }

    const context = fxCanvasRef.current.getContext("2d");
    if (!context) {
      return;
    }

    context.clearRect(0, 0, fxCanvasRef.current.width, fxCanvasRef.current.height);
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

  const captureCurrentFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    if (!frameCanvasRef.current) {
      frameCanvasRef.current = document.createElement("canvas");
    }

    const canvas = frameCanvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  const requestPrediction = useCallback(async () => {
    if (!translationActive || !streamRef.current || predictInFlightRef.current) {
      return;
    }

    const image = captureCurrentFrame();
    if (!image) {
      return;
    }

    predictInFlightRef.current = true;
    try {
      const response = await fetch(PREDICT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        letter?: string | null;
      };

      if (data.letter) {
        handleDetection(data.letter.toLowerCase());
      }

      setError(null);
      setIsConnected(true);
    } catch {
      setIsConnected(false);
      setError(
        "Impossible de contacter le backend IA (localhost:8000). Lance d'abord l'API FastAPI."
      );
    } finally {
      predictInFlightRef.current = false;
    }
  }, [captureCurrentFrame, handleDetection, translationActive]);

  const requestHands = useCallback(async () => {
    if (translationActive || !streamRef.current || handsInFlightRef.current) {
      return;
    }

    const image = captureCurrentFrame();
    if (!image) {
      return;
    }

    handsInFlightRef.current = true;
    try {
      const response = await fetch(HANDS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as { hands?: HandPoint[] };
      const points = Array.isArray(data.hands) ? data.hands.slice(0, 2) : [];
      handPointsRef.current = points;
      setHandCount(points.length);
      setError(null);
      setIsConnected(true);
    } catch {
      handPointsRef.current = [];
      setHandCount(0);
      setIsConnected(false);
      setError(
        "Impossible de contacter le backend IA (localhost:8000). Lance d'abord l'API FastAPI."
      );
    } finally {
      handsInFlightRef.current = false;
    }
  }, [captureCurrentFrame, translationActive]);

  const startTranslation = useCallback(() => {
    setTranslationActive(true);
    handPointsRef.current = [];
    setHandCount(0);
    resetInteractionEffects();
    resetDetectionState();
    setError(null);
  }, [resetDetectionState, resetInteractionEffects]);

  const stopTranslation = useCallback(() => {
    setTranslationActive(false);
    resetInteractionEffects();
    resetDetectionState();
    setError(null);
  }, [resetDetectionState, resetInteractionEffects]);

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
      setTranslationActive(false);
      setIsConnected(false);
      handPointsRef.current = [];
      setHandCount(0);
      resetInteractionEffects();
      resetDetectionState();
    } catch {
      setError("Impossible d'acceder a la camera. Verifiez les permissions.");
    }
  }, [resetDetectionState, resetInteractionEffects]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setTranslationActive(false);
    setIsConnected(false);
    setError(null);
    handPointsRef.current = [];
    setHandCount(0);
    predictInFlightRef.current = false;
    handsInFlightRef.current = false;
    resetInteractionEffects();
    resetDetectionState();
  }, [resetDetectionState, resetInteractionEffects]);

  useEffect(() => {
    if (!cameraOn) {
      return;
    }

    const tick = () => {
      if (translationActive) {
        void requestPrediction();
      } else {
        void requestHands();
      }
    };

    tick();
    intervalRef.current = setInterval(
      tick,
      translationActive ? PREDICT_INTERVAL_MS : HANDS_INTERVAL_MS
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [cameraOn, translationActive, requestHands, requestPrediction]);

  useEffect(() => {
    if (!cameraOn || translationActive) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      resetInteractionEffects();
      return;
    }

    const canvas = fxCanvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const cssWidth = Math.max(1, Math.floor(rect.width));
      const cssHeight = Math.max(1, Math.floor(rect.height));

      canvas.width = Math.max(1, Math.floor(cssWidth * dpr));
      canvas.height = Math.max(1, Math.floor(cssHeight * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const pushTrailPoint = (handIndex: number, x: number, y: number) => {
      const trails = trailsRef.current;
      const trail = trails[handIndex];
      trail.push({ x, y, alpha: 1 });
      if (trail.length > MAX_TRAIL_POINTS) {
        trail.shift();
      }
    };

    const fadeMissingTrail = (handIndex: number) => {
      const trail = trailsRef.current[handIndex];
      if (trail.length === 0) {
        return;
      }

      for (const point of trail) {
        point.alpha *= 0.88;
      }

      while (trail.length > 0 && trail[0].alpha < 0.05) {
        trail.shift();
      }
    };

    const spawnParticles = (handIndex: number, x: number, y: number, pinch: boolean) => {
      const burst = pinch ? 5 : 2;
      for (let i = 0; i < burst; i += 1) {
        if (fxParticlesRef.current.length >= MAX_PARTICLES) {
          fxParticlesRef.current.shift();
        }

        const angle = Math.random() * Math.PI * 2;
        const speed = (pinch ? 1.4 : 0.8) + Math.random() * (pinch ? 2.4 : 1.6);
        fxParticlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: pinch ? 30 + Math.random() * 24 : 22 + Math.random() * 18,
          maxLife: pinch ? 54 : 40,
          size: pinch ? 1.8 + Math.random() * 2.8 : 1.2 + Math.random() * 1.9,
          hue: handIndex === 0 ? 340 + Math.random() * 25 : 190 + Math.random() * 35,
          handIndex,
        });
      }
    };

    const drawEnergyBeam = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      distance: number,
      time: number
    ) => {
      const intensity = Math.max(0.2, Math.min(1, 1 - distance / 520));
      const gradient = context.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `rgba(233,69,96,${0.85 * intensity})`);
      gradient.addColorStop(0.5, `rgba(255,255,255,${0.9 * intensity})`);
      gradient.addColorStop(1, `rgba(83,52,131,${0.82 * intensity})`);

      context.lineCap = "round";
      context.strokeStyle = gradient;
      context.lineWidth = 2 + 6 * intensity;
      context.beginPath();
      context.moveTo(x1, y1);

      const segments = 26;
      for (let i = 1; i < segments; i += 1) {
        const t = i / segments;
        const baseX = x1 + (x2 - x1) * t;
        const baseY = y1 + (y2 - y1) * t;
        const wave = Math.sin(t * 18 + time * 0.014) * (6 + 14 * intensity);
        const offsetX = -(y2 - y1) / Math.max(distance, 1) * wave;
        const offsetY = (x2 - x1) / Math.max(distance, 1) * wave;
        context.lineTo(baseX + offsetX, baseY + offsetY);
      }

      context.lineTo(x2, y2);
      context.stroke();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = (time: number) => {
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      context.clearRect(0, 0, width, height);

      const hands = handPointsRef.current;
      const ambient = context.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.65);
      ambient.addColorStop(0, "rgba(12, 20, 40, 0.22)");
      ambient.addColorStop(1, "rgba(4, 6, 12, 0.5)");
      context.fillStyle = ambient;
      context.fillRect(0, 0, width, height);

      hands.forEach((hand, index) => {
        const x = hand.x * width;
        const y = hand.y * height;
        pushTrailPoint(index, x, y);
        spawnParticles(index, x, y, Boolean(hand.pinch));
      });

      if (!hands[0]) fadeMissingTrail(0);
      if (!hands[1]) fadeMissingTrail(1);

      const trails = trailsRef.current;
      trails.forEach((trail, handIndex) => {
        if (trail.length < 2) {
          return;
        }

        for (let i = 1; i < trail.length; i += 1) {
          const prev = trail[i - 1];
          const point = trail[i];
          const t = i / trail.length;
          const alpha = Math.min(prev.alpha, point.alpha) * (0.15 + t * 0.65);
          context.strokeStyle =
            handIndex === 0
              ? `hsla(${336 + 8 * t}, 98%, 64%, ${alpha})`
              : `hsla(${200 + 25 * t}, 98%, 60%, ${alpha})`;
          context.lineWidth = 1.5 + t * 9;
          context.lineCap = "round";
          context.beginPath();
          context.moveTo(prev.x, prev.y);
          context.lineTo(point.x, point.y);
          context.stroke();
        }
      });

      if (hands.length >= 2) {
        const h1x = hands[0].x * width;
        const h1y = hands[0].y * height;
        const h2x = hands[1].x * width;
        const h2y = hands[1].y * height;
        const distance = Math.hypot(h2x - h1x, h2y - h1y);
        drawEnergyBeam(h1x, h1y, h2x, h2y, distance, time);
      }

      hands.forEach((hand, index) => {
        const x = hand.x * width;
        const y = hand.y * height;
        const pinch = Boolean(hand.pinch);
        const pulse = 1 + Math.sin(time * 0.01 + index * 2.2) * 0.12;
        const coreRadius = (pinch ? 17 : 12) * pulse;

        const glow = context.createRadialGradient(x, y, 0, x, y, coreRadius * 3.2);
        glow.addColorStop(
          0,
          index === 0
            ? `rgba(255, 120, 170, ${pinch ? 0.95 : 0.75})`
            : `rgba(120, 210, 255, ${pinch ? 0.95 : 0.75})`
        );
        glow.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, coreRadius * 3.2, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = pinch ? "rgba(255, 245, 180, 0.95)" : "rgba(255,255,255,0.8)";
        context.lineWidth = 2.3;
        context.beginPath();
        context.arc(x, y, coreRadius * 1.55, time * 0.012, time * 0.012 + Math.PI * 1.5);
        context.stroke();

        context.strokeStyle = "rgba(255,255,255,0.45)";
        context.lineWidth = 1.4;
        context.beginPath();
        context.arc(x, y, coreRadius * 2.15, -time * 0.01, -time * 0.01 + Math.PI * 1.35);
        context.stroke();
      });

      const particles = fxParticlesRef.current;
      context.save();
      context.globalCompositeOperation = "lighter";
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        particle.life -= 1;

        const hand = hands[particle.handIndex];
        if (hand) {
          const tx = hand.x * width;
          const ty = hand.y * height;
          const pull = hand.pinch ? 0.016 : 0.007;
          particle.vx += (tx - particle.x) * pull;
          particle.vy += (ty - particle.y) * pull;
        }

        particle.vx *= 0.96;
        particle.vy *= 0.96;
        particle.x += particle.vx;
        particle.y += particle.vy;

        const lifeRatio = Math.max(0, particle.life / particle.maxLife);
        if (particle.life <= 0 || lifeRatio <= 0.01) {
          particles.splice(i, 1);
          continue;
        }

        context.fillStyle = `hsla(${particle.hue}, 98%, 68%, ${lifeRatio * 0.92})`;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * (0.55 + lifeRatio), 0, Math.PI * 2);
        context.fill();
      }
      context.restore();

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [cameraOn, translationActive, resetInteractionEffects]);

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
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E94560]/10 border border-[#E94560]/20 text-[#E94560] text-xs font-semibold uppercase tracking-wider mb-4">
            <Camera className="w-3.5 h-3.5" />
            Traduction en temps reel
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Traducteur{" "}
            <span className="bg-gradient-to-r from-[#E94560] to-[#533483] bg-clip-text text-transparent">
              ASL
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Ouvrez la camera. En mode interaction, les mouvements de mains pilotent un rendu
            visuel dynamique haut niveau. Lancez la traduction uniquement avec le bouton dedie.
          </p>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-[#E94560] via-[#533483] to-[#E94560] rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 blur-[1px] animate-gradient-shift" />
            <div className="relative bg-[#16213E] rounded-3xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      cameraOn ? "bg-green-400 animate-pulse" : "bg-red-400"
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-400">
                    {cameraOn ? "Camera active" : "Camera inactive"}
                  </span>
                </div>
                {isConnected && (
                  <div className="flex items-center gap-1.5 text-green-400">
                    <Wifi className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Connecte</span>
                  </div>
                )}
              </div>

              <div className="relative aspect-[4/3] bg-black/50 overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraOn ? "block" : "hidden"}`}
                  style={{ transform: "scaleX(-1)" }}
                />

                <canvas
                  ref={fxCanvasRef}
                  className={`absolute inset-0 w-full h-full pointer-events-none ${
                    cameraOn && !translationActive ? "block" : "hidden"
                  }`}
                  style={{ transform: "scaleX(-1)" }}
                />

                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                      <CameraOff className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-500 text-sm">Cliquez sur le bouton pour activer la camera</p>
                  </div>
                )}

                {cameraOn && !translationActive && (
                  <div className="absolute left-3 bottom-3 px-3 py-2 rounded-lg bg-black/45 border border-white/15 text-xs text-gray-200 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Hand className="w-3.5 h-3.5 text-[#E94560]" />
                      Mode FX Pro
                    </div>
                    <div className="text-[11px] text-gray-300 mt-1">
                      Mains detectees: {handCount}/2
                    </div>
                  </div>
                )}

                {cameraOn && translationActive && currentLetter && (
                  <div className="absolute top-4 right-4 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <span className="text-3xl font-black text-white uppercase">{currentLetter}</span>
                    </div>
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

              <div className="flex flex-wrap items-center justify-center gap-3 p-4">
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
                      <CameraOff className="w-4 h-4" /> Arreter
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" /> Demarrer la camera
                    </>
                  )}
                </button>

                {cameraOn && (
                  <button
                    onClick={translationActive ? stopTranslation : startTranslation}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      translationActive
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/35 hover:bg-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 hover:bg-emerald-500/30"
                    }`}
                  >
                    {translationActive ? (
                      <>
                        <Pause className="w-4 h-4" /> Arreter la traduction
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Demarrer la traduction
                      </>
                    )}
                  </button>
                )}

              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-[#533483] via-[#E94560] to-[#533483] rounded-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 blur-[1px]" />
            <div className="relative bg-[#16213E] rounded-3xl overflow-hidden h-full flex flex-col">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <span className="text-xs font-medium text-gray-400">Traduction</span>
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
                          i === translatedText.length - 1 ? "text-[#E94560] animate-pulse" : "text-green-400"
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
                      <span className="text-3xl">FX</span>
                    </div>
                    <p className="text-gray-500 text-sm max-w-xs">
                      Les lettres detectees apparaitront ici apres activation de la traduction
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {translatedText.length} lettre
                  {translatedText.length !== 1 ? "s" : ""} detectee
                  {translatedText.length !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-gray-500">
                  Mode: {translationActive ? "Traduction active" : "Interaction"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 max-w-2xl mx-auto flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 max-w-lg mx-auto">
            <strong className="text-gray-500">
              {cameraOn
                ? translationActive
                  ? "Traduction en cours :"
                  : "Mode interaction 2 mains :"
                : "Pret :"}
            </strong>{" "}
              {cameraOn
                ? translationActive
                  ? "les lettres sont ajoutees quand un signe reste stable."
                : "deplacez vos mains pour manipuler les effets, puis cliquez sur Demarrer la traduction."
              : "activez la camera pour commencer."}
          </p>
        </div>
      </div>
    </section>
  );
}
