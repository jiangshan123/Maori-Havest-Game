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
  { maori: "Kia kaha!", english: "Stay strong!" },
  { maori: "Tino pai!", english: "Very good!" },
  { maori: "Ka pai!", english: "Well done!" },
  { maori: "Kia ora!", english: "Be well!" },
  { maori: "Mīharo!", english: "Amazing!" },
  { maori: "Ka rawe!", english: "Awesome!" },
  { maori: "Whakatīnana!", english: "Celebrate!" },
  { maori: "E hoa!", english: "Well done, friend!" },
];

// 毛利语鼓励语 - 没接住时
const MAORI_MISS_ENCOURAGEMENTS = [
  { maori: "Kia tūpato!", english: "Be careful!" },
  {
    maori: "Whāia te iti kahurangi!",
    english: "Pursue excellence!",
  },
  {
    maori: "Kia mau ki tō ūpoko!",
    english: "Keep your head up!",
  },
  { maori: "Me whakamahi anō!", english: "Try again!" },
  { maori: "Kia manawanui!", english: "Be patient!" },
  { maori: "Haere tonu!", english: "Keep going!" },
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
  const [timeRemaining, setTimeRemaining] = useState(180); // 3分钟倒计时
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const nextFruitId = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const encouragementIdRef = useRef(0);
  const isShowingEncouragementRef = useRef(false);
  const gameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 朗读slogan
  const speakEncouragement = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      utterance.lang = 'mi';
      window.speechSynthesis.speak(utterance);
    }
  };

  // 摄像头和手势识别相关
  const videoRef = useRef<HTMLVideoElement>(null);
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
            video: { width: 640, height: 480, facingMode: "user" },
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
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
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

  // 处理手势识别结果 - 仅更新手部位置状态，不绘制canvas
  const onHandsResults = (results: Results) => {
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
      // 应用平滑过滤：混合 80% 当前值 + 20% 旧值，使移动更稳定
      const smoothedX = basketXRef.current * 0.2 + basketXPct * 0.8;
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
    // 在组件挂载时设置音乐音量
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      console.log("🎵 Audio element ready");
    }
    
    // 尝试自动播放背景音乐
    const tryAutoPlay = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.5;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("✅ Background music is playing");
            })
            .catch((err) => {
              console.log("ℹ️ Autoplay blocked, waiting for user interaction...", err.message);
            });
        }
      }
    };
    
    // 加载后立即尝试
    setTimeout(tryAutoPlay, 500);
    
    // 也在用户交互时尝试
    const handleUserInteraction = () => {
      console.log("👆 User interaction detected, attempting to play music...");
      tryAutoPlay();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
    
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
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

    // 防止短时间内重复触发（3秒，给用户足够时间准备接下一个）
    const now = Date.now();
    if (now - lastRightHandTouchRef.current < 3000) return;

    // 顶部水果区域大约在屏幕顶部 0-80%
    if (fingerYPct < 0 || fingerYPct > 80) return;

    console.log(`[RightHand] At screen (${fingerXPct.toFixed(1)}, ${fingerYPct.toFixed(1)}) checking ${topFruits.length} fruits`);

    // 检查每个水果的位置
    topFruits.forEach((fruit, index) => {
      const fruitX =
        (100 / topFruits.length) * index +
        100 / topFruits.length / 2;
      const distance = Math.abs(fingerXPct - fruitX);

      if (distance < 8) {
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

      // 1.5秒后检查是否接住并移除
      setTimeout(() => {
        console.log(`[checkCatch timeout] Checking if basket caught fruit at x=${fruitPosition}`);
        checkCatch(newFallingFruit);
      }, 1500);
    }
  };

  // 检查是否接住水果
  const checkCatch = (fallingFruit: FallingFruit) => {
    const distance = Math.abs(
      fallingFruit.x - basketXRef.current,
    );
    console.log(`[checkCatch] Fruit at x=${fallingFruit.x.toFixed(1)}, basket at x=${basketXRef.current.toFixed(1)}, distance=${distance.toFixed(1)}`);

    if (distance < 6) {
      // 接住了！
      console.log(`[checkCatch] SUCCESS! Caught fruit! Score +10`);
      setScore((prev) => prev + 10);
      showEncouragement();
    } else {
      // 没接住
      console.log(`[checkCatch] MISS! Distance ${distance.toFixed(1)} > 4`);
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
    // 朗读鼓励语
    speakEncouragement(fullText);
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
    setEncouragementQueue((prev) => [
      ...prev,
      { id, text: `${random.maori} ${random.english}` },
    ]);
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
    setGameStarted(true);
    setScore(0);
    setFallingFruits([]);
    setEncouragementQueue([]);
    setTimeRemaining(180); // 重置倒计时为3分钟
    lastRightHandTouchRef.current = 0; // 重置手势触碰计时器
    
    // 确保音乐播放
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("🔇 Autoplay blocked, user interaction may be required");
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

  if (!gameStarted) {
    return (
      <div className="size-full flex items-center justify-center relative overflow-hidden">
        {/* 隐藏的视频元素用于摄像头输入 */}
        <video ref={videoRef} className="hidden" playsInline />

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
            <p>🤚 Māui: Neke te kete | Left hand: Move basket</p>
            <p>👆 Matau: Pā ki te hua | Right hand: Touch fruit</p>
            <p>🧺 Hopu te hua! | Catch the fruit!</p>
          </div>
          <div className="text-xl text-white/70 mt-4">
            💡 Allow camera access or use mouse to play
          </div>

          <div className="flex gap-6 justify-center">
            <button
              onClick={startGame}
              className="px-12 py-6 bg-green-600 hover:bg-green-700 text-white text-2xl rounded-2xl shadow-lg transition-colors"
            >
              Tīmata | Start Game
            </button>
            <button
              onClick={toggleLeaderboard}
              className="px-12 py-6 bg-yellow-500 hover:bg-yellow-600 text-white text-2xl rounded-2xl shadow-lg transition-colors"
            >
              🏆 View Leader Doard
            </button>
          </div>
        </div>

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
        loop
        preload="auto"
        src="/Temple-Run-Running-Theme.mp3"
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
            className={`text-8xl transition-transform hover:scale-110 ${
              !cameraReady ? "cursor-pointer" : ""
            } ${
              fruit.name === targetFruit.name
                ? "ring-8 ring-yellow-400 rounded-full animate-pulse"
                : ""
            }`}
            whileHover={!cameraReady ? { scale: 1.2 } : {}}
            whileTap={!cameraReady ? { scale: 0.9 } : {}}
          >
            <span className="w-20 h-20">{fruit.emoji}</span>
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
            transition={{ duration: 1.5, ease: "linear" }}
            className="absolute text-7xl pointer-events-none z-15"
            style={{
              left: `${falling.x}%`,
              transform: "translateX(-50%)",
            }}
          >
            <span className="w-20 h-20">
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