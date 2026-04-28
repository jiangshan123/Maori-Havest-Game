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
  
  /* 篮子把手 */
  .basket-handle {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 50px;
    border: 4px solid #B8802A;
    border-bottom: none;
    border-radius: 70% 70% 0 0 / 100% 100% 0 0;
    box-shadow: 
      inset -2px 2px 6px rgba(255,255,255,0.2),
      inset 2px 2px 6px rgba(0,0,0,0.3),
      -4px -6px 12px rgba(0,0,0,0.4);
    background: linear-gradient(90deg, #9E6820 0%, #C89030 50%, #9E6820 100%);
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
  
  .hand-left {
    animation: palmFlex 0.8s ease-in-out infinite;
  }
  
  .hand-right {
    animation: fingerPoint 0.6s ease-in-out infinite;
  }
  
  @keyframes palmFlex {
    0%, 100% { transform: scaleX(1) rotate(0deg); }
    50% { transform: scaleX(0.95) rotate(-5deg); }
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
  const [timeRemaining, setTimeRemaining] = useState(60); // 60秒倒计时
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const nextFruitId = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const encouragementIdRef = useRef(0);
  const isShowingEncouragementRef = useRef(false);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

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
  const initCameraRef = useRef<() => Promise<void>>();
  
  // 手部位置状态 - 用于在屏幕上显示动画的手
  const [leftHandPos, setLeftHandPos] = useState<{ x: number; y: number } | null>(null);
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
      setLeftHandPos(null);
      setRightHandPos(null);
      return;
    }

    // 处理检测到的手
    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
      const landmarks = results.multiHandLandmarks[i];
      // 注意：MediaPipe 的 handedness 会因为镜像原因导致左右反转
      // 这里的 label 是基于摄像头画面的，所以我们需要反向思维
      const rawHandedness = results.multiHandedness[i].label; 

      // 获取手腕位置 (landmark 0)
      const wrist = landmarks[0];
      // 获取食指指尖位置 (landmark 8)
      const indexTip = landmarks[8];

      // 修正逻辑：
      // 在镜像模式下，MediaPipe 标记为 "Right" 的通常是你真实的左手
      // 我们通过 (wrist.x) 直接使用原始坐标，因为在镜像视频中，
      // 物理左手出现在画面右侧（x值较大），这正好对应篮子移动到右侧。
      
      if (rawHandedness === "Right") { // 这里的 "Right" 实际上对应用户的物理左手
        // 左手控制篮子
        if (gameStarted) {
          // 使用原始 x 坐标 (0.0 - 1.0)，无需 1-x，以匹配镜像直觉
          const basketXPos = wrist.x * 100; 
          const newBasketX = Math.max(5, Math.min(95, basketXPos));
          setBasketX(newBasketX);
          basketXRef.current = newBasketX;
        }

        // 屏幕上显示左手
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        setLeftHandPos({
          x: wrist.x * screenWidth,
          y: wrist.y * screenHeight,
        });
      } else if (rawHandedness === "Left") { // 这里的 "Left" 对应用户的物理右手
        // 右手触碰水果
        const fingerX = indexTip.x * 100;
        const fingerY = indexTip.y * 100;

        if (gameStarted) {
          checkFingerTouchFruit(fingerX, fingerY);
        }

        // 屏幕上显示右手
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        setRightHandPos({
          x: indexTip.x * screenWidth,
          y: indexTip.y * screenHeight,
        });
      }
    }
  };

  // 检查右手是否触碰到水果
  const checkFingerTouchFruit = (fingerX: number, fingerY: number) => {
    if (!gameStarted || !gameAreaRef.current) return;

    // 防止短时间内重复触发
    const now = Date.now();
    if (now - lastRightHandTouchRef.current < 300) return; // 减少防抖时间

    // 顶部水果区域大约在屏幕顶部 5-30%（更宽松的范围）
    if (fingerY < 5 || fingerY > 30) {
      console.log(`Finger Y out of range: ${fingerY.toFixed(1)} (need 5-30)`);
      return;
    }

    // 检查每个水果的位置
    topFruits.forEach((fruit, index) => {
      const fruitX =
        (100 / topFruits.length) * index +
        100 / topFruits.length / 2;
      const distance = Math.abs(fingerX - fruitX);

      console.log(`Fruit ${index} (${fruit.name}): X=${fruitX.toFixed(1)}, Distance=${distance.toFixed(1)}, Target=${targetFruit.name}`);

      // 如果手指触碰到水果（距离小于阈值）
      // 降低距离阈值，或者允许触碰任何水果（不只是目标）
      if (distance < 12) { // 增加阈值从 8 到 12
        if (fruit.name === targetFruit.name) {
          console.log(`✓ Caught fruit: ${fruit.name}`);
          lastRightHandTouchRef.current = now;
          // 触发水果掉落
          handleFruitClick(fruit, index);
        } else {
          console.log(`✗ Wrong fruit touched: ${fruit.name} (target is ${targetFruit.name})`);
        }
      }
    });
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

  // 背景音乐控制
  useEffect(() => {
    if (gameStarted && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log("Audio play failed:", error);
      });
    } else if (!gameStarted && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [gameStarted]);

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

  // 鼠标控制作为后备方案（当摄像头不可用时）
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameAreaRef.current && gameStarted) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const newBasketX = Math.max(5, Math.min(95, x));

        setBasketX(newBasketX);
        basketXRef.current = newBasketX;
      }
    };

    // 只有当摄像头未准备好时才使用鼠标控制
    if (!cameraReady) {
      window.addEventListener("mousemove", handleMouseMove);
      return () =>
        window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [gameStarted, cameraReady]);

  // 点击水果
  const handleFruitClick = (
    fruit: (typeof NZ_FRUITS)[0],
    index: number,
  ) => {
    if (!gameStarted) return;

    if (fruit.name === targetFruit.name) {
      // 正确的水果 - 创建掉落动画
      const fruitPosition =
        (100 / topFruits.length) * index +
        100 / topFruits.length / 2;
      const newFallingFruit: FallingFruit = {
        id: nextFruitId.current++,
        fruit: fruit,
        x: fruitPosition,
      };
      setFallingFruits((prev) => [...prev, newFallingFruit]);

      // 3秒后检查是否接住并移除
      setTimeout(() => {
        checkCatch(newFallingFruit);
      }, 1500);
    }
  };

  // 检查是否接住水果
  const checkCatch = (fallingFruit: FallingFruit) => {
    const distance = Math.abs(
      fallingFruit.x - basketXRef.current,
    );

    if (distance < 4) {
      // 接住了！
      setScore((prev) => prev + 10);
      showEncouragement();
      selectNewTarget();
    } else {
      // 没接住
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
    setEncouragementQueue((prev) => [
      ...prev,
      { id, text: `${random.maori} ${random.english}` },
    ]);
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
    setTimeRemaining(60); // 重置倒计时
    lastRightHandTouchRef.current = 0; // 重置手势触碰计时器
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

      {/* 启用摄像头按钮 - 游戏开始后显示 */}
      {gameStarted && !cameraReady && (
        <div className="absolute top-4 left-4 z-40">
          {!permissionDenied ? (
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
          ) : (
            <div className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold">
              📷 Camera Blocked
            </div>
          )}
        </div>
      )}

      {/* 动画的左手 - 绿色手掌 */}
      {cameraReady && leftHandPos && (
        <div
          className="hand hand-left"
          style={{
            left: `${leftHandPos.x}px`,
            top: `${leftHandPos.y}px`,
            transform: "translate(-50%, -50%) scaleX(-1)",
          }}
        >
          👋
        </div>
      )}

      {/* 动画的右手 - 红色手指 */}
      {cameraReady && rightHandPos && (
        <div
          className="hand hand-right"
          style={{
            left: `${rightHandPos.x}px`,
            top: `${rightHandPos.y}px`,
            transform: "translate(-50%, -50%) scaleX(-1)",
          }}
        >
          👆
        </div>
      )}

      {/* 底部篮子 - CSS绘制 */}
      <audio
        ref={audioRef}
        loop
        src="https://cdn.pixabay.com/audio/2022/03/10/audio_c8a7e5c3ff.mp3"
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
        className="absolute bottom-8 z-20 transition-all duration-75 ease-linear"
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
          <div className="basket-handle"></div>
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