#!/usr/bin/env node

/**
 * 使用 Web Speech API 和浏览器生成音频
 * 或使用 Google Translate TTS API (免费，无需 key)
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "../public/audio");

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 使用 Google Translate 的免费 TTS API
async function generateAudioFromGoogle(text, filename) {
  return new Promise((resolve, reject) => {
    try {
      // Google Translate TTS URL
      const encodedText = encodeURIComponent(text);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodedText}&tl=en`;

      const file = fs.createWriteStream(path.join(OUTPUT_DIR, filename));

      https
        .get(
          url,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          },
          (response) => {
            if (response.statusCode !== 200) {
              reject(new Error(`HTTP ${response.statusCode}`));
              return;
            }
            response.pipe(file);
            file.on("finish", () => {
              file.close();
              resolve();
            });
          },
        )
        .on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}

// 所有需要生成的文本
const textToGenerate = [
  // 成功时
  { filename: "encouragement-yes.mp3", text: "Excellent!" },
  { filename: "encouragement-thatsit.mp3", text: "Well done!" },
  { filename: "encouragement-go.mp3", text: "Perfect!" },
  { filename: "encouragement-boom.mp3", text: "Awesome!" },
  { filename: "encouragement-comeon.mp3", text: "Fantastic!" },
  { filename: "encouragement-push.mp3", text: "Amazing!" },
  { filename: "encouragement-waytogo.mp3", text: "Brilliant!" },
  { filename: "encouragement-onemore.mp3", text: "Outstanding!" },
  // 失败时
  { filename: "miss-again.mp3", text: "Try again!" },
  { filename: "miss-comeon.mp3", text: "Keep going!" },
  { filename: "miss-push.mp3", text: "You can do it!" },
  { filename: "miss-nextone.mp3", text: "Next one!" },
  { filename: "miss-go.mp3", text: "Don't give up!" },
  { filename: "miss-letsgo.mp3", text: "Come on!" },
];

async function generateAll() {
  console.log("开始生成音频文件...\n");
  let success = 0;
  let failed = 0;

  for (const item of textToGenerate) {
    try {
      console.log(`生成: ${item.filename}`);
      console.log(`文本: ${item.text}`);
      await generateAudioFromGoogle(item.text, item.filename);
      console.log("✓ 成功\n");
      success++;

      // 延迟以避免被限流
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`✗ 失败: ${error.message}\n`);
      failed++;
    }
  }

  console.log("=".repeat(50));
  console.log(
    `生成完成！ 成功: ${success}/${textToGenerate.length}, 失败: ${failed}`,
  );
  console.log("=".repeat(50));

  // 列出生成的文件
  const files = fs.readdirSync(OUTPUT_DIR);
  console.log(`\n生成的文件列表 (${files.length} 个):`);
  files.forEach((f) => {
    const filePath = path.join(OUTPUT_DIR, f);
    const stats = fs.statSync(filePath);
    console.log(`  - ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
  });
}

generateAll().catch(console.error);
