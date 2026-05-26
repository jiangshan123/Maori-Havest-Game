#!/usr/bin/env python3
"""
生成鼓励语音频文件脚本
使用 pyttsx3 生成高质量的人声音频
"""

import os
import sys
import pyttsx3

# 输出目录
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '../public/audio')

# 确保输出目录存在
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 初始化 TTS 引擎
engine = pyttsx3.init()

# 配置语音参数 - 提高音量和音高使听起来更有活力
engine.setProperty('rate', 150)  # 稍快的语速
engine.setProperty('volume', 0.9)  # 音量 0-1

# 获取可用的语音并选择女性语音（通常听起来更有活力）
voices = engine.getProperty('voices')
print(f"可用语音: {len(voices)} 个")
for i, voice in enumerate(voices):
    print(f"  {i}: {voice.name} (ID: {voice.id})")

# 尝试选择英文语音
selected_voice = voices[1] if len(voices) > 1 else voices[0]
engine.setProperty('voice', selected_voice.id)
print(f"使用语音: {selected_voice.name}\n")

# 鼓励语列表 - 成功时
encouragements = [
    ("encouragement-yes.mp3", "Yes! Yes! Yes!"),
    ("encouragement-thatsit.mp3", "That's it! That's it!"),
    ("encouragement-go.mp3", "Go! Go! Go!"),
    ("encouragement-boom.mp3", "Boom! Boom! Boom!"),
    ("encouragement-comeon.mp3", "Come on! Come on!"),
    ("encouragement-push.mp3", "Push! Push! Push!"),
    ("encouragement-waytogo.mp3", "Way to go! Way to go!"),
    ("encouragement-onemore.mp3", "One more! One more!"),
]

# 鼓励语列表 - 失败时
miss_encouragements = [
    ("miss-again.mp3", "Again! Again! Again!"),
    ("miss-comeon.mp3", "Come on! Don't stop!"),
    ("miss-push.mp3", "Push! Push harder!"),
    ("miss-nextone.mp3", "Next one! Next one!"),
    ("miss-go.mp3", "Go! Go! Go!"),
    ("miss-letsgo.mp3", "Let's go! Let's go!"),
]

print("=" * 50)
print("生成成功时的鼓励语音频...")
print("=" * 50)

# 生成成功时的音频
for filename, text in encouragements:
    filepath = os.path.join(OUTPUT_DIR, filename)
    print(f"生成: {filename}")
    print(f"  文本: {text}")
    try:
        engine.save_to_file(text, filepath)
        engine.runAndWait()
        print(f"  ✓ 成功保存\n")
    except Exception as e:
        print(f"  ✗ 错误: {e}\n")

print("=" * 50)
print("生成失败时的鼓励语音频...")
print("=" * 50)

# 生成失败时的音频
for filename, text in miss_encouragements:
    filepath = os.path.join(OUTPUT_DIR, filename)
    print(f"生成: {filename}")
    print(f"  文本: {text}")
    try:
        engine.save_to_file(text, filepath)
        engine.runAndWait()
        print(f"  ✓ 成功保存\n")
    except Exception as e:
        print(f"  ✗ 错误: {e}\n")

print("=" * 50)
print(f"✓ 所有音频文件已生成到: {OUTPUT_DIR}")
print("=" * 50)

# 列出生成的文件
audio_files = os.listdir(OUTPUT_DIR)
print(f"\n生成的文件列表 ({len(audio_files)} 个):")
for f in sorted(audio_files):
    file_path = os.path.join(OUTPUT_DIR, f)
    file_size = os.path.getsize(file_path) / 1024  # KB
    print(f"  - {f} ({file_size:.1f} KB)")
