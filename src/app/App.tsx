import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Hands, Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

// CSS篮子样式 - 真实篮子设计
const basketStyles = `
  .basket-container {
    position: relative;
    width: 150px;
    height: 120px;
  }
  
  /* 篮子底部 */
  .basket-bottom {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 130px;
    height: 40px;
    background: linear-gradient(to bottom, #D4933F, #8B5A1A);
    border-radius: 0 0 35px 35px;
    box-shadow: 
      inset -2px -2px 8px rgba(0,0,0,0.4),
      inset 2px 2px 6px rgba(255,255,255,0.1),
      0 8px 16px rgba(0,0,0,0.5);
  }
  
  /* 篮子中部（梯形） */
  .basket-middle {
    position: absolute;
    bottom: 35px;
    left: 50%;
    transform: translateX(-50%);
    width: 140px;
    height: 50px;
    background: linear-gradient(135deg, #E8A038 0%, #D4933F 50%, #9E6820 100%);
    clip-path: polygon(0% 100%, 15% 0%, 85% 0%, 100% 100%);
    box-shadow: 
      inset -3px 0 10px rgba(0,0,0,0.3),
      inset 3px 0 8px rgba(255,255,255,0.1),
      -5px 5px 15px rgba(0,0,0,0.4);
  }
  
  /* 篮子编织纹理 */
  .basket-weave {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 8px,
        rgba(0,0,0,0.1) 8px,
        rgba(0,0,0,0.1) 9px
      ),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 5px,
        rgba(0,0,0,0.05) 5px,
        rgba(0,0,0,0.05) 6px
      );
  }
  
  /* 篮子口/边缘 */
  .basket-rim {
    position: absolute;
    top: 33px;
    left: 50%;
    transform: translateX(-50%);
    width: 145px;
    height: 20px;
    background: linear-gradient(to bottom, #E8A038 0%, #D4933F 100%);
    border-radius: 50%;
    box-shadow: 
      inset 0 2px 4px rgba(255,255,255,0.3),
      inset 0 -2px 4px rgba(0,0,0,0.3),
      0 4px 10px rgba(0,0,0,0.4);
    z-index: 5;
  }
  
  /* 篮子顶部（展开部分） */
  .basket-top {
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 155px;
    height: 30px;
    background: linear-gradient(to bottom, #C89030 0%, transparent 100%);
    border-radius: 50% 50% 0 0 / 60% 60% 0 0;
    opacity: 0.7;
    box-shadow: inset 0 3px 8px rgba(0,0,0,0.2);
  }
  
  /* 篮子把手 - 现在是手的位置 */
  .basket-handle {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 60px;
    pointer-events: none;
    z-index: 10;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    animation: basketHandWave 0.8s ease-in-out infinite;
  }

  @keyframes basketHandWave {
    0%, 100% { transform: translateX(-50%) rotate(0deg) scaleX(1); }
    25% { transform: translateX(-50%) rotate(-15deg) scaleX(0.95); }
    50% { transform: translateX(-50%) rotate(-25deg) scaleX(0.9); }
    75% { transform: translateX(-50%) rotate(-15deg) scaleX(0.95); }
  }
  
  /* 篮子里的水果 */
  .basket-fruits {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    font-size: 26px;
    z-index: 3;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
    animation: fruitBobbing 2.5s ease-in-out infinite;
  }
  
  @keyframes fruitBobbing {
    0%, 100% { transform: translateX(-50%) translateY(0px); }
    50% { transform: translateX(-50%) translateY(-3px); }
  }
  
  /* 动画的手 */
  .hand {
    position: fixed;
    font-size: 60px;
    pointer-events: none;
    z-index: 100;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    will-change: transform;
  }
  
  .hand-right {
    animation: fingerPoint 0.6s ease-in-out infinite;
  }

  @keyframes fingerPoint {
    0%, 100% { transform: scaleY(1) rotate(0deg); }
    50% { transform: scaleY(0.9) rotate(2deg); }
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = basketStyles;
  document.head.appendChild(style);
}

// 新篮子图片 - 简单卡通篮子
const BASKET_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDE2MCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0Q0OTMzMDtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0E2NzAyMDtzdG9wLW9wYWNpdHk6MSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwhLS0gQmFza2V0IGJvZHktLT48ZWxsaXBzZSBjeD0iODAiIGN5PSI3MCIgcng9IjU4IiByeT0iNDIiIGZpbGw9InVybCgjYikiIHN0cm9rZT0iIzhCNTAyMCIgc3Ryb2tlLXdpZHRoPSIyLjUiLz48IS0tIEJhc2tldCBoYW5kbGUtLT48cGF0aCBkPSJNIDM0IDMwIFEgODAgMTAgMTI2IDMwIiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTU5MzAiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PCEtLSBQYXR0ZXJuIC0tPjxwYXRoIGQ9Ik0gNTAgNDAgTCA1MCAxMDAiIHN0cm9rZT0iIzg5NjMwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1kYXNoYXJyYXk9IjMsMiIgb3BhY2l0eT0iMC42Ii8+PHBhdGggZD0iTSA4MCA0MCBMIDgwIDEwMCIgc3Ryb2tlPSIjODk2MzAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWRhc2hhcnJheT0iMywyIiBvcGFjaXR5PSIwLjYiLz48cGF0aCBkPSJNIDExMCA0MCBMIDExMCAxMDAiIHN0cm9rZT0iIzg5NjMwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1kYXNoYXJyYXk9IjMsMiIgb3BhY2l0eT0iMC42Ii8+PHBhdGggZD0iTSAzNCA1MCBMIDE1MCA1MCIgc3Ryb2tlPSIjODk2MzAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWRhc2hhcnJheT0iMywyIiBvcGFjaXR5PSIwLjYiLz48cGF0aCBkPSJNIDM0IDcwIEwgMTUwIDcwIiBzdHJva2U9IiM4OTYzMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtZGFzaGFycmF5PSIzLDIiIG9wYWNpdHk9IjAuNiIvPjwvc3ZnPg==";

// 背景图片 - 毛利木雕元素
const MAORI_BACKGROUND =
  "https://media.easy-peasy.ai/27feb2bb-aeb4-4a83-9fb6-8f3f2a15885e/b79c1f25-f64f-40bd-acb0-b18f5ccb95de_medium.webp";

// 背景音乐文件路径，交给打包器解析，确保部署后资源地址有效
const BACKGROUND_MUSIC_URL = new URL(
  "./desifreemusic-tribal-rhythm-patterns-with-bamboo-flute-376294.mp3",
  import.meta.url,
).href;

// 新西兰本地水果 - 卡通图片
const NZ_FRUITS = [
  { name: "Kiwifruit", maori: "Huakiwi", emoji: "🥝" },
  { name: "Feijoa", maori: "Feioa", emoji: "🍐" },
  { name: "Apple", maori: "Āporo", emoji: "🍎" },
  { name: "Tamarillo", maori: "Tamarillo", emoji: "🍅" },
  { name: "Pear", maori: "Pea", emoji: "🍏" },
  { name: "Orange", maori: "Ārani", emoji: "🍊" },
  { name: "Strawberry", maori: "Rōpere", emoji: "🍓" },
  { name: "Peach", maori: "Pītiti", emoji: "🍑" },
  { name: "Plum", maori: "Paramu", emoji: "🍑" },
  { name: "Watermelon", maori: "Merengi", emoji: "🍉" },
  { name: "Grapes", maori: "Wāina", emoji: "🍇" },
  { name: "Banana", maori: "Panana", emoji: "🍌" },
  { name: "Lemon", maori: "Rēmana", emoji: "🍋" },
  { name: "Cherry", maori: "Tiere", emoji: "🍒" },
];

// 毛利语鼓励语 - 接住时
const MAORI_ENCOURAGEMENTS = [
  { maori: "Kia kaha!", english: "Excellent!", audioFile: "encouragement-yes.mp3" },
  { maori: "Tino pai!", english: "Well done!", audioFile: "encouragement-thatsit.mp3" },
  { maori: "Ka pai!", english: "Perfect!", audioFile: "encouragement-go.mp3" },
  { maori: "Kia ora!", english: "Awesome!", audioFile: "encouragement-boom.mp3" },
  { maori: "Mīharo!", english: "Fantastic!", audioFile: "encouragement-comeon.mp3" },
  { maori: "Ka rawe!", english: "Amazing!", audioFile: "encouragement-push.mp3" },
  { maori: "Whakatīnana!", english: "Brilliant!", audioFile: "encouragement-waytogo.mp3" },
  { maori: "E hoa!", english: "Outstanding!", audioFile: "encouragement-onemore.mp3" },
];

// 毛利语鼓励语 - 没接住时
const MAORI_MISS_ENCOURAGEMENTS = [
  { maori: "Kia tūpato!", english: "Try again!", audioFile: "miss-again.mp3" },
  {
    maori: "Whāia te iti kahurangi!",
    english: "Keep going!",
    audioFile: "miss-comeon.mp3",
  },
  {
    maori: "Kia mau ki tō ūpoko!",
    english: "You can do it!",
    audioFile: "miss-push.mp3",
  },
  { maori: "Me whakamahi anō!", english: "Next one!", audioFile: "miss-nextone.mp3" },
  { maori: "Kia manawanui!", english: "Don't give up!", audioFile: "miss-go.mp3" },
  { maori: "Haere tonu!", english: "Come on!", audioFile: "miss-letsgo.mp3" },
];

interface FallingFruit {
  id: number;
  fruit: (typeof NZ_FRUITS)[0];
  x: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export default function App() {
  // 难度级别配置
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  
  const difficultyConfig = {
    easy: { fallDuration: 2, label: '🟢 Easy', description: 'Slower speed' },
    normal: { fallDuration: 1.5, label: '🟡 Normal', description: 'Standard speed' },
    hard: { fallDuration: 1, label: '🔴 Hard', description: 'Fast speed' },
  };

  const [score, setScore] = useState(0);
  const [basketX, setBasketX] = useState(50); // 篮子位置百分比
  const basketXRef = useRef(50);
  const [targetFruit, setTargetFruit] = useState(NZ_FRUITS[0]);
  const [topFruits, setTopFruits] = useState<typeof NZ_FRUITS>(
    [],
  );
  const [fallingFruits, setFallingFruits] = useState<
    FallingFruit[]
  >([]);
  const [encouragementQueue, setEncouragementQueue] = useState<
    Array<{ id: number; text: string }>
  >([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);
  const [timeRemaining, setTimeRemaining] = useState(60); // 3分钟倒计时
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const nextFruitId = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const encouragementIdRef = useRef(0);
  const isShowingEncouragementRef = useRef(false);
  const gameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 播放鼓励语音频
  const playEncouragementAudio = (audioFile: string, fallbackText: string) => {
    if (!audioFile) return;
    
    try {
      // 尝试加载音频文件
      const audio = new Audio(`/audio/${audioFile}`);
      audio.volume = 0.8;
      audio.play().catch(() => {
        // 如果音频播放失败，回退到 TTS
        console.warn(`音频播放失败: ${audioFile}，使用 TTS 备用`);
        speakEncouragementFallback(fallbackText);
      });
    } catch (error) {
      console.error('音频加载错误:', error);
      speakEncouragementFallback(fallbackText);
    }
  };

  // TTS 备用方案
  const speakEncouragementFallback = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // 朗读slogan（支持音频和备用 TTS）
  const speakEncouragement = (text: string, audioFile?: string) => {
    if (audioFile) {
      playEncouragementAudio(audioFile, text);
    } else {
      speakEncouragementFallback(text);
    }
  };

  // 摄像头和手势识别相关
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const lastRightHandTouchRef = useRef<number>(0); // 防止重复触发
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>("unknown");
  const initCameraRef = useRef<(() => Promise<void>) | null>(null);
  
  // 手部位置状态 - 用于在屏幕上显示动画的手
  const [rightHandPos, setRightHandPos] = useState<{ x: number; y: number } | null>(null);

  // Load leaderboard from localStorage on mount
  useEffect(() => {
    const savedLeaderboard = localStorage.getItem(
      "maoriGameLeaderboard",
    );
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard));
    }
  }, []);

  // 初始化摄像头和手势识别
  useEffect(() => {
    let mounted = true;
    let stream: MediaStream | null = null;

    const initCamera = async () => {
      // 清理之前的状态
      setPermissionDenied(false);
      setCameraError("");
      setCameraReady(false);
      setCameraInitialized(true);

      try {
        // 等待隐藏 video 元素挂载完成，避免点击瞬间 ref 仍为空
        let retries = 0;
        while (!videoRef.current && retries < 20) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          retries++;
        }

        if (!videoRef.current) {
          throw new Error("Video element not ready");
        }
        const videoEl = videoRef.current;

        // 检查权限API状态
        try {
          if (navigator.permissions) {
            const result = await navigator.permissions.query({
              name: "camera" as PermissionName,
            });
            setPermissionStatus(result.state);
            console.log("Camera permission status:", result.state);
          }
        } catch (e) {
          console.log("Permission API not available:", e);
        }

        // 步骤1：请求摄像头权限
        console.log("Requesting camera access...");
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user" 
          },
          });
          console.log("Camera access granted!");
        } catch (permError) {
          console.error("Camera access error:", permError);
          // 权限错误，立即处理
          if (
            permError instanceof Error &&
            (permError.name === "NotAllowedError" ||
              permError.name === "PermissionDeniedError")
          ) {
            setPermissionDenied(true);
            setCameraError(`Permission denied: ${permError.name}`);
            return; // 不继续初始化
          }
          throw permError;
        }

        if (!mounted || !stream) {
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
          return;
        }

        // 步骤2：设置视频流
        videoEl.srcObject = stream;
        await videoEl.play();

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        // 步骤3：初始化 MediaPipe Hands
        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 0,
          minDetectionConfidence: 0.4,  // 进一步降低门槛以改善检测灵敏度
          minTrackingConfidence: 0.4,   // 降低追踪门槛
        });

        hands.onResults(onHandsResults);
        handsRef.current = hands;

        // 步骤4：使用 Camera 工具类
        const camera = new Camera(videoEl, {
          onFrame: async () => {
            if (handsRef.current && mounted) {
              try {
                await handsRef.current.send({
                  image: videoEl,
                });
              } catch (e) {
                console.warn("Frame processing error:", e);
              }
            }
          },
          width: 640,
          height: 480,
        });

        await camera.start();

        if (!mounted) {
          camera.stop();
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        cameraRef.current = camera;
        setCameraReady(true);
        setCameraError("");
        setPermissionDenied(false);
      } catch (error) {
        console.error("Camera init error:", error);

        // 清理stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        if (
          error instanceof Error &&
          (error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError")
        ) {
          setPermissionDenied(true);
          setCameraError("Camera permission denied. Using mouse control.");
        } else {
          setCameraError(
            error instanceof Error
              ? error.message
              : "Camera unavailable. Using mouse control.",
          );
        }
      }
    };

    initCameraRef.current = initCamera;

    // 不自动初始化，等待用户点击按钮

    return () => {
      mounted = false;

      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (e) {
          console.warn("Error stopping camera:", e);
        }
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const mediaStream = videoRef.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 处理手势识别结果 - 在Canvas上绘制骨架，并更新游戏逻辑
  const onHandsResults = (results: Results) => {
    // 绘制骨架到Canvas（仅用于校准窗口显示，不影响游戏逻辑性能）
    const canvas = canvasRef.current;
    if (canvas && videoRef.current && canvas.getContext) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 设置Canvas尺寸
        const videoElement = videoRef.current;
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;

        // 绘制视频帧
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // 手指连接关系（骨架）
        const FINGER_CONNECTIONS = [
          [0, 1], [1, 2], [2, 3], [3, 4], // 大拇指
          [0, 5], [5, 6], [6, 7], [7, 8], // 食指
          [0, 9], [9, 10], [10, 11], [11, 12], // 中指
          [0, 13], [13, 14], [14, 15], [15, 16], // 无名指
          [0, 17], [17, 18], [18, 19], [19, 20], // 小指
          [5, 9], [9, 13], [13, 17], // 掌心连接
        ];

        // 绘制骨架线条
        if (results.multiHandLandmarks) {
          results.multiHandLandmarks.forEach((landmarks, handIndex) => {
            const handedness = results.multiHandedness?.[handIndex]?.label;
            const isLeftHand = handedness === 'Left';
            const color = isLeftHand ? '#00FF00' : '#FF0000'; // 左手绿色，右手红色
            const lineColor = isLeftHand ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)';

            // 绘制连接线
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            FINGER_CONNECTIONS.forEach(([start, end]) => {
              const startPoint = landmarks[start];
              const endPoint = landmarks[end];

              const startX = startPoint.x * canvas.width;
              const startY = startPoint.y * canvas.height;
              const endX = endPoint.x * canvas.width;
              const endY = endPoint.y * canvas.height;

              ctx.beginPath();
              ctx.moveTo(startX, startY);
              ctx.lineTo(endX, endY);
              ctx.stroke();
            });

            // 绘制关键点（圆点）
            landmarks.forEach((landmark, index) => {
              const x = landmark.x * canvas.width;
              const y = landmark.y * canvas.height;

              // 关键点大小根据是否是手腕来调整
              const radius = index === 0 ? 6 : 4;

              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(x, y, radius, 0, 2 * Math.PI);
              ctx.fill();

              // 绘制外圈
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.lineWidth = 1;
              ctx.stroke();
            });
          });
        }
      }
    }

    // 游戏逻辑处理
    if (!results.multiHandLandmarks || !results.multiHandedness) {
      setRightHandPos(null);
      return;
    }

    // 将每只手的必要信息抽取出来
    const detectedHands = results.multiHandLandmarks.map((landmarks, i) => ({
      landmarks,
      label: results.multiHandedness?.[i]?.label || "",
      wristX: landmarks[0].x,
      wristY: landmarks[0].y,
      indexX: landmarks[8].x,
      indexY: landmarks[8].y,
    }));

    // 位置优先分配：按 wristX 排序选择
    // 镜像下：wristX 大 = 用户左手, wristX 小 = 用户右手
    let basketHand = null as typeof detectedHands[number] | null;
    let fingerHand = null as typeof detectedHands[number] | null;

    if (detectedHands.length === 1) {
      // 只有一只手时，默认用来控制篮子
      basketHand = detectedHands[0];
    } else if (detectedHands.length >= 2) {
      // 两只手都在时，按 wristX 倒序排：大在前(用户左手=篮子), 小在后(用户右手=触碰)
      const sortedHands = [...detectedHands].sort((a, b) => b.wristX - a.wristX);
      basketHand = sortedHands[0]; // wristX 最大 = 用户左手
      fingerHand = sortedHands[1] || null; // wristX 最小 = 用户右手
      
      // 双手模式：使用置信度最高的手来控制篮子
      const hand0 = detectedHands[0];
      const hand1 = detectedHands[1] || null;
      if (hand0 && hand1) {
        // 优先使用更稳定、置信度更高的手（通常是检测到更清晰的手）
        // 保持原逻辑但增加稳定性
      }
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    console.debug(`Detected hands: ${detectedHands.length}`, detectedHands.map(h => ({wristX: h.wristX, label: h.label})));
    if (basketHand) console.debug("Selected basketHand:", { wristX: basketHand.wristX, label: basketHand.label });
    if (fingerHand) console.debug("Selected fingerHand:", { indexX: fingerHand.indexX, label: fingerHand.label });

    // 如果有篮子手，更新篮子位置（将视频坐标映射到屏幕坐标，水平翻转以修正镜像）
    if (basketHand) {
      const basketXPct = Math.max(
        5,
        Math.min(95, (1 - basketHand.wristX) * 100),
      );
      // 应用平滑过滤：混合 50% 当前值 + 50% 旧值，使移动更稳定和缓慢
      const smoothedX = basketXRef.current * 0.5 + basketXPct * 0.5;
      setBasketX(smoothedX);
      basketXRef.current = smoothedX;
    }

    // 如果有手指手，只更新右手显示位置（触碰检测由 effect 处理）
    if (fingerHand) {
      setRightHandPos({
        x: (1 - fingerHand.indexX) * screenWidth,
        y: fingerHand.indexY * screenHeight,
      });
    } else {
      setRightHandPos(null);
    }
  };

  // 游戏倒计时
  useEffect(() => {
    if (gameStarted && timeRemaining > 0) {
      gameTimerRef.current = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (gameStarted && timeRemaining === 0) {
      // 时间到，游戏结束
      endGame();
    }

    return () => {
      if (gameTimerRef.current) {
        clearTimeout(gameTimerRef.current);
      }
    };
  }, [gameStarted, timeRemaining]);

  // 游戏页面加载时，初始化音乐（不需要等待游戏开始）
  useEffect(() => {
    const initAudio = () => {
      if (!audioRef.current) return;
      
      // 设置音乐属性
      audioRef.current.volume = 0.4;
      audioRef.current.loop = true;
      
      console.log("🎵 Audio initialized, src:", BACKGROUND_MUSIC_URL);
      
      // 音频事件监听
      const handlePlay = () => {
        setIsMusicPlaying(true);
        console.log("▶️ Music playing");
      };
      
      const handlePause = () => {
        setIsMusicPlaying(false);
        console.log("⏸ Music paused");
      };
      
      const handleCanPlay = () => {
        console.log("✅ Audio loaded and ready to play");
      };
      
      const handleError = (e: Event) => {
        console.error("❌ Audio load error:", audioRef.current?.error?.message);
      };
      
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);
      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('error', handleError);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('play', handlePlay);
          audioRef.current.removeEventListener('pause', handlePause);
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('error', handleError);
        }
      };
    };
    
    const timer = setTimeout(initAudio, 500);
    
    // 在用户交互时播放
    let interactionHandler: (() => void) | null = null;
    
    const setupInteractionHandler = () => {
      interactionHandler = async () => {
        console.log("👆 User interaction detected");
        if (!audioRef.current) return;
        
        try {
          audioRef.current.muted = false;
          audioRef.current.volume = 0.4;
          audioRef.current.loop = true;
          
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            setIsMusicPlaying(true);
            console.log("✅ Music started by user interaction");
          }
        } catch (err) {
          console.warn("⚠️ Play failed:", err);
        }
        
        // 移除监听器
        document.removeEventListener('click', interactionHandler!);
        document.removeEventListener('touchstart', interactionHandler!);
      };
      
      document.addEventListener('click', interactionHandler);
      document.addEventListener('touchstart', interactionHandler);
    };
    
    setupInteractionHandler();
    
    return () => {
      clearTimeout(timer);
      if (interactionHandler) {
        document.removeEventListener('click', interactionHandler);
        document.removeEventListener('touchstart', interactionHandler);
      }
    };
  }, []);

  // 处理鼓励语队列
  useEffect(() => {
    if (
      encouragementQueue.length > 0 &&
      !isShowingEncouragementRef.current
    ) {
      isShowingEncouragementRef.current = true;
      const current = encouragementQueue[0];

      // 2.5秒后移除当前鼓励语并显示下一个
      setTimeout(() => {
        setEncouragementQueue((prev) => prev.slice(1));
        isShowingEncouragementRef.current = false;
      }, 2500);
    }
  }, [encouragementQueue]);

  // 初始化顶部水果
  useEffect(() => {
    if (gameStarted) {
      const shuffled = [...NZ_FRUITS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
      setTopFruits(shuffled);
      setTargetFruit(
        shuffled[Math.floor(Math.random() * shuffled.length)],
      );
    }
  }, [gameStarted]);

  // 自动刷新水果 - 每30秒刷新一次
  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        refreshFruits();
      }, 10000); // 30秒

      return () => clearInterval(interval);
    }
  }, [gameStarted]);

  // 游戏开始时自动初始化摄像头和手势检测
  useEffect(() => {
    if (gameStarted && !cameraReady && initCameraRef.current) {
      console.log("[Game Start] Auto-initializing camera and hand detection...");
      initCameraRef.current();
    }
  }, [gameStarted]);

  // 简化的右手触碰检测：直接通过 rightHandPos 检测是否触碰到目标水果
  useEffect(() => {
    if (!gameStarted || !rightHandPos || !topFruits || topFruits.length === 0) return;

    const fingerXPct = (rightHandPos.x / window.innerWidth) * 100;
    const fingerYPct = (rightHandPos.y / window.innerHeight) * 100;

    // 防止短时间内重复触发（2秒，允许更快的操作）
    const now = Date.now();
    if (now - lastRightHandTouchRef.current < 2000) return;

    // 顶部水果区域大约在屏幕顶部 0-80%
    if (fingerYPct < 0 || fingerYPct > 80) return;

    console.log(`[RightHand] At screen (${fingerXPct.toFixed(1)}, ${fingerYPct.toFixed(1)}) checking ${topFruits.length} fruits`);

    // 检查每个水果的位置
    topFruits.forEach((fruit, index) => {
      const fruitX =
        (100 / topFruits.length) * index +
        100 / topFruits.length / 2;
      const distance = Math.abs(fingerXPct - fruitX);

      if (distance < 15) {
        console.log(`[RightHand] HIT fruit #${index} ${fruit.name} distance=${distance.toFixed(1)}`);
        if (fruit.name === targetFruit.name) {
          console.log(`[RightHand] ✓✓✓ TARGET FRUIT HIT: ${fruit.name}`);
          lastRightHandTouchRef.current = now;
          handleFruitClick(fruit, index);
        }
      }
    });
  }, [gameStarted, rightHandPos, topFruits, targetFruit]);

  // 点击水果
  const handleFruitClick = (
    fruit: (typeof NZ_FRUITS)[0],
    index: number,
  ) => {
    console.log(`[handleFruitClick] Called with fruit=${fruit.name}, index=${index}, gameStarted=${gameStarted}`);
    if (!gameStarted) return;

    console.log(`[handleFruitClick] Checking: fruit.name=${fruit.name} vs targetFruit.name=${targetFruit.name}`);
    if (fruit.name === targetFruit.name) {
      console.log(`[handleFruitClick] MATCH! Creating falling fruit...`);
      // 正确的水果 - 创建掉落动画
      const fruitPosition =
        (100 / topFruits.length) * index +
        100 / topFruits.length / 2;
      const newFallingFruit: FallingFruit = {
        id: nextFruitId.current++,
        fruit: fruit,
        x: fruitPosition,
      };
      console.log(`[handleFruitClick] FallingFruit created:`, newFallingFruit);
      setFallingFruits((prev) => [...prev, newFallingFruit]);
      
      // 立即选择下一个目标水果（防止同一水果被触碰多次）
      selectNewTarget();

      // 根据难度调整检查时间
      const checkDelay = difficultyConfig[difficulty].fallDuration * 1000;
      setTimeout(() => {
        console.log(`[checkCatch timeout] Checking if basket caught fruit at x=${fruitPosition}`);
        checkCatch(newFallingFruit);
      }, checkDelay);
    }
  };

  // 检查是否接住水果
  const checkCatch = (fallingFruit: FallingFruit) => {
    const distance = Math.abs(
      fallingFruit.x - basketXRef.current,
    );
    console.log(`[checkCatch] Fruit at x=${fallingFruit.x.toFixed(1)}, basket at x=${basketXRef.current.toFixed(1)}, distance=${distance.toFixed(1)}`);

    if (distance < 20) {
      // 接住了！（命中范围扩大到20，更容易接住）
      console.log(`[checkCatch] SUCCESS! Caught fruit! Score +10`);
      setScore((prev) => prev + 10);
      showEncouragement();
    } else {
      // 没接住
      console.log(`[checkCatch] MISS! Distance ${distance.toFixed(1)} > 12`);
      showMissEncouragement();
    }

    // 移除掉落的水果
    setFallingFruits((prev) =>
      prev.filter((f) => f.id !== fallingFruit.id),
    );
  };

  // 显示鼓励语
  const showEncouragement = () => {
    const random =
      MAORI_ENCOURAGEMENTS[
        Math.floor(Math.random() * MAORI_ENCOURAGEMENTS.length)
      ];
    const id = encouragementIdRef.current++;
    const fullText = `${random.maori} ${random.english}`;
    setEncouragementQueue((prev) => [
      ...prev,
      { id, text: fullText },
    ]);
    // 播放音频或 TTS
    speakEncouragement(fullText, random.audioFile);
  };

  // 显示未接住的鼓励语
  const showMissEncouragement = () => {
    const random =
      MAORI_MISS_ENCOURAGEMENTS[
        Math.floor(
          Math.random() * MAORI_MISS_ENCOURAGEMENTS.length,
        )
      ];
    const id = encouragementIdRef.current++;
    const fullText = `${random.maori} ${random.english}`;
    setEncouragementQueue((prev) => [
      ...prev,
      { id, text: fullText },
    ]);
    // 播放音频或 TTS
    speakEncouragement(fullText, random.audioFile);
  };

  // 选择新的目标水果
  const selectNewTarget = () => {
    const newTarget =
      topFruits[Math.floor(Math.random() * topFruits.length)];
    setTargetFruit(newTarget);
  };

  // 刷新顶部水果
  const refreshFruits = () => {
    const shuffled = [...NZ_FRUITS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
    setTopFruits(shuffled);
    setTargetFruit(
      shuffled[Math.floor(Math.random() * shuffled.length)],
    );
  };

  // 开始游戏
  const startGame = () => {
    setShowDifficultySelect(false);
    setGameStarted(true);
    setScore(0);
    setFallingFruits([]);
    setEncouragementQueue([]);
    setTimeRemaining(60); // 重置倒计时为3分钟
    lastRightHandTouchRef.current = 0; // 重置手势触碰计时器
    
    // 确保音乐播放
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.volume = 0.4;
      audioRef.current.loop = true;
      audioRef.current.currentTime = 0; // 从头开始
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMusicPlaying(true);
            console.log("✅ Game music playing");
          })
          .catch((error) => {
            console.warn("⚠️ Music autoplay blocked:", error.message);
            // 可能需要用户交互，已经在useEffect中处理了
          });
      }
    }
  };

  // 结束游戏并显示排行榜
  const endGame = () => {
    if (score > 0) {
      const playerName = prompt(
        "Enter your name for the leaderboard:",
      );
      if (playerName) {
        const newEntry: LeaderboardEntry = {
          name: playerName,
          score: score,
          date: new Date().toLocaleDateString(),
        };
        const updatedLeaderboard = [...leaderboard, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 5); // 只保留前5名
        setLeaderboard(updatedLeaderboard);
        localStorage.setItem(
          "maoriGameLeaderboard",
          JSON.stringify(updatedLeaderboard),
        );
      }
    }
    setGameStarted(false);
    if (score > 0) {
      setShowLeaderboard(true);
    }
  };

  // 切换排行榜显示
  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  // 播放/暂停背景音乐
  const toggleBackgroundMusic = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
        console.log("⏸️ Music paused");
      } else {
        audioRef.current.muted = false;
        audioRef.current.volume = 0.4;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsMusicPlaying(true);
          console.log("▶️ Music playing");
        }
      }
    } catch (err) {
      console.error("Music control error:", err);
    }
  };

  if (!gameStarted) {
    return (
      <div className="size-full flex items-center justify-center relative overflow-hidden">
        {/* 隐藏的视频元素用于摄像头输入 */}
        <video ref={videoRef} className="hidden" playsInline />
        {/* 隐藏的Canvas用于绘制骨架 */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 启用摄像头按钮 - 开始菜单 */}
        <div className="absolute top-4 left-4 z-40">
          {!cameraInitialized && !permissionDenied && (
            <button
              onClick={async () => {
                if (initCameraRef.current) {
                  await initCameraRef.current();
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
            >
              <div className="text-xl animate-bounce">🎥</div>
              Enable Hands
            </button>
          )}
          {permissionDenied && (
            <button
              onClick={async () => {
                if (initCameraRef.current) {
                  await initCameraRef.current();
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
            >
              <div>🚫</div>
              Retry Camera
            </button>
          )}
          {cameraInitialized && !cameraReady && !permissionDenied && (
            <div className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
              <div className="animate-spin text-lg">⏳</div>
              Initializing...
            </div>
          )}
          {cameraReady && (
            <div className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Camera Ready
            </div>
          )}
        </div>

        {/* ✅ 背景图（只保留一层） */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${MAORI_BACKGROUND})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.6)",
          }}
        />

        {/* ✅ 内容层（放最上面） */}
        <div className="relative z-10 text-center space-y-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">
            Kia Ora! Movement Game
          </h1>

          <p className="text-3xl text-white/90">
            Kēmu Neke mō ngā Kaumātua
          </p>

          <div className="space-y-4 text-3xl text-white/90">
            <p>🤚 Mauī: Neke te kete | Left hand: Move basket</p>
            <p>👆 Matau: Pā ki te hua | Right hand: Touch the fruit</p>
            <p>🧺 Hopu te hua! | Catch the fruit!</p>
          </div>
          <div className="text-xl text-white/70 mt-4">
            💡 Allow camera access or use mouse to play
          </div>

          <div className="flex gap-6 justify-center">
            <button
              onClick={() => setShowDifficultySelect(true)}
              className="px-12 py-6 bg-green-600 hover:bg-green-700 text-white text-2xl rounded-2xl shadow-lg transition-colors"
            >
              Tīmata | Start Game
            </button>
            <button
              onClick={toggleLeaderboard}
              className="px-12 py-6 bg-yellow-500 hover:bg-yellow-600 text-white text-2xl rounded-2xl shadow-lg transition-colors"
            >
              🏆 Leader Board
            </button>
          </div>

          {/* 难度选择对话框 */}
          {showDifficultySelect && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl p-10 shadow-2xl max-w-2xl">
                <h2 className="text-4xl font-bold text-center mb-2">Choose Difficulty</h2>
                <p className="text-center text-gray-600 mb-8">Select how fast the fruits fall</p>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {(['easy', 'normal', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        setDifficulty(level);
                        startGame();
                      }}
                      className={`p-6 rounded-2xl font-bold text-lg transition-all ${
                        difficulty === level
                          ? 'bg-blue-600 text-white scale-105 shadow-lg'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{difficultyConfig[level].label}</div>
                      <div className="text-sm">{difficultyConfig[level].description}</div>
                      <div className="text-xs mt-2">
                        {difficultyConfig[level].fallDuration}s fall
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowDifficultySelect(false)}
                  className="w-full px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 手部移动校准窗口 - 显示实时视频和骨架 */}
        {cameraReady && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-6 right-6 z-30 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 max-w-md"
          >
            <div className="text-center mb-3">
              <h3 className="text-lg font-bold text-green-800 mb-1">
                🎯 Movement Calibration
              </h3>
              <p className="text-xs text-gray-600">Adjust your hand position</p>
            </div>

            {/* Canvas - 显示摄像头视频和骨架线条 */}
            <canvas
              ref={canvasRef}
              className="w-full rounded-xl shadow-md border-2 border-gray-300"
              style={{
                display: 'block',
                aspectRatio: '4 / 3',
              }}
            />

            {/* 校准指导 */}
            <div className="bg-blue-50 rounded-lg p-2 mt-3 text-xs text-gray-700">
              <p className="font-semibold mb-1">✓ Tips:</p>
              <ul className="space-y-0.5 text-xs">
                <li>• Green skeleton = Left hand (move basket)</li>
                <li>• Red skeleton = Right hand (touch fruit)</li>
                <li>• Move both hands to center of camera</li>
              </ul>
            </div>

            {/* 状态指示器 */}
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-gray-600">Detection Status:</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-bold">Active</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 摄像头初始化提示 */}
        {!cameraReady && cameraInitialized && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-6 right-6 z-30 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-sm"
          >
            <div className="text-center">
              <div className="text-4xl mb-3 animate-spin">⏳</div>
              <p className="text-lg font-bold text-gray-800">Initializing...</p>
              <p className="text-sm text-gray-600 mt-2">
                Setting up hand detection
              </p>
            </div>
          </motion.div>
        )}

        {/* 排行榜模态框 - 也在开始屏幕显示 */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/60"
              onClick={toggleLeaderboard}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full mx-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-5xl font-bold text-green-800 mb-2">
                    🏆 Top 5 Champions 🏆
                  </h2>
                  <p className="text-2xl text-gray-600">
                    Hall of Fame
                  </p>
                </div>

                {leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-3xl text-gray-500">
                      No scores yet. Be the first champion!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((entry, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-6 rounded-2xl ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-300"
                            : index === 1
                              ? "bg-gradient-to-r from-gray-300 to-gray-200"
                              : index === 2
                                ? "bg-gradient-to-r from-amber-600 to-amber-500"
                                : "bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <div className="text-4xl font-bold w-12 text-center">
                            {index === 0
                              ? "🥇"
                              : index === 1
                                ? "🥈"
                                : index === 2
                                  ? "🥉"
                                  : `#${index + 1}`}
                          </div>
                          <div>
                            <p className="text-3xl font-bold">
                              {entry.name}
                            </p>
                            <p className="text-lg text-gray-600">
                              {entry.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-4xl font-bold text-green-700">
                          {entry.score}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <button
                  onClick={toggleLeaderboard}
                  className="mt-8 w-full py-4 bg-green-600 hover:bg-green-700 text-white text-2xl rounded-2xl shadow-lg transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      ref={gameAreaRef}
      className="size-full relative overflow-hidden bg-gradient-to-b from-sky-100 to-green-100"
      style={{
        backgroundImage: `url(${MAORI_BACKGROUND})`,
        backgroundSize: "cover",
      }}
    >
      {/* 隐藏的视频元素用于摄像头输入 */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
      />

      {/* 摄像头状态指示 - 游戏开始后显示 */}
      {gameStarted && (
        <div className="absolute top-4 left-4 z-40">
          {cameraReady ? (
            <div className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Camera Ready
            </div>
          ) : (
            <div className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
              <div className="animate-spin text-lg">⏳</div>
              Initializing Camera...
            </div>
          )}
        </div>
      )}

      {/* 动画的右手 - 红色手指 */}
      {rightHandPos && (
        <div
          className="hand hand-right"
          style={{
            left: `${rightHandPos.x}px`,
            top: `${rightHandPos.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          👆
        </div>
      )}

      {/* 背景音乐 */}
      <audio
        ref={audioRef}
        preload="auto"
        src={BACKGROUND_MUSIC_URL}
        crossOrigin="anonymous"
        loop
        autoPlay
        muted
      />

      {/* 分数和目标提示 */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 shadow-md py-4 px-8">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <button
            onClick={toggleLeaderboard}
            className="text-3xl font-bold text-green-800 cursor-pointer hover:text-green-600 transition-colors"
          >
            Kaute | Score: {score} 🏆
          </button>

          {/* 倒计时显示 */}
          <div
            className={`text-4xl font-bold ${timeRemaining <= 10 ? "text-red-600 animate-pulse" : "text-blue-600"}`}
          >
            ⏱️ {timeRemaining}s
          </div>

          {/* 难度显示 */}
          <div className="text-2xl font-bold text-orange-600">
            {difficultyConfig[difficulty].label}
          </div>

          <div className="text-2xl text-purple-700 font-bold flex items-center gap-4">
            <span>
              {cameraReady ? "Pā" : "Pāwhiri"} | {cameraReady ? "Touch" : "Click"}: {targetFruit.maori}{" "}
              {targetFruit.emoji}
            </span>
            <button
              onClick={refreshFruits}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer text-base"
            >
              🔄 Whakahōu | Refresh
            </button>
          </div>
          <div className="flex items-center gap-4">
            {/* 控制模式指示器 */}
            <div className="text-sm text-gray-600">
              {cameraReady ? "🎥 Camera" : "🖱️ Mouse"}
            </div>
            <button
              onClick={endGame}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer"
            >
              Puta | Exit
            </button>
          </div>
        </div>
      </div>

      {/* 排行榜模态框 */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 cursor-auto"
            onClick={toggleLeaderboard}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full mx-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-5xl font-bold text-green-800 mb-2">
                  🏆 Top 5 Champions 🏆
                </h2>
                <p className="text-2xl text-gray-600">
                  Hall of Fame
                </p>
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-3xl text-gray-500">
                    No scores yet. Be the first champion!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-6 rounded-2xl ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-300"
                          : index === 1
                            ? "bg-gradient-to-r from-gray-300 to-gray-200"
                            : index === 2
                              ? "bg-gradient-to-r from-amber-600 to-amber-500"
                              : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className="text-4xl font-bold w-12 text-center">
                          {index === 0
                            ? "🥇"
                            : index === 1
                              ? "🥈"
                              : index === 2
                                ? "🥉"
                                : `#${index + 1}`}
                        </div>
                        <div>
                          <p className="text-3xl font-bold">
                            {entry.name}
                          </p>
                          <p className="text-lg text-gray-600">
                            {entry.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-4xl font-bold text-green-700">
                        {entry.score}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <button
                onClick={toggleLeaderboard}
                className="mt-8 w-full py-4 bg-green-600 hover:bg-green-700 text-white text-2xl rounded-2xl shadow-lg transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 鼓励语 */}
      <AnimatePresence>
        {encouragementQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 text-6xl font-bold text-yellow-500 drop-shadow-lg"
            style={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {encouragementQueue[0].text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 顶部水果 */}
      <div className="absolute top-24 left-0 right-0 flex justify-around px-12 z-10">
        {topFruits.map((fruit, index) => (
          <motion.div
            key={index}
            onClick={() => !cameraReady && handleFruitClick(fruit, index)}
            className={`text-9xl transition-transform hover:scale-110 ${
              !cameraReady ? "cursor-pointer" : ""
            } ${
              fruit.name === targetFruit.name
                ? "ring-8 ring-yellow-400 rounded-full animate-pulse"
                : ""
            }`}
            whileHover={!cameraReady ? { scale: 1.2 } : {}}
            whileTap={!cameraReady ? { scale: 0.9 } : {}}
          >
            <span className="w-28 h-28">{fruit.emoji}</span>
          </motion.div>
        ))}
      </div>

      {/* 掉落的水果 */}
      <AnimatePresence>
        {fallingFruits.map((falling) => (
          <motion.div
            key={falling.id}
            initial={{ y: 150, opacity: 1 }}
            animate={{
              y: window.innerHeight - 200,
              opacity: 1,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: difficultyConfig[difficulty].fallDuration, ease: "linear" }}
            className="absolute text-9xl pointer-events-none z-15"
            style={{
              left: `${falling.x}%`,
              transform: "translateX(-50%)",
            }}
          >
            <span className="w-24 h-24">
              {falling.fruit.emoji}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 底部篮子 - CSS绘制 */}
      <div
        className="absolute bottom-8 z-20 transition-all duration-200 ease-linear"
        style={{
          left: `${basketX}%`,
          transform: "translateX(-50%)",
        }}
      >
        <motion.div
          className="basket-container"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="basket-handle">👋</div>
          <div className="basket-top"></div>
          <div className="basket-rim"></div>
          <div className="basket-middle">
            <div className="basket-weave"></div>
          </div>
          <div className="basket-bottom"></div>
          <div className="basket-fruits">🍎🍊🥝🍒🍌</div>
        </motion.div>
      </div>

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-300 to-transparent"></div>
    </div>
  );
}