const { chromium } = require('C:/Users/86156/AppData/Local/Temp/tmp.5UI6S5F41j/node_modules/playwright');
const { execSync, spawn } = require('child_process');
const { statSync, rmSync, existsSync } = require('fs');

const FFMPEG = 'C:/Users/86156/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.1-full_build/bin/ffmpeg.exe';
const OUT = 'd:/Desktop/AI相册/桃花酥_高清.mp4';
const RAW = 'd:/Desktop/AI相册/_raw.mp4';
const CHROME = 'C:/Users/86156/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe';

if (existsSync(OUT)) rmSync(OUT);
if (existsSync(RAW)) rmSync(RAW);

console.log('🎬 录制 — 等待全部资源加载 → gdigrab 录屏 → 合成BGM');

(async () => {
  // 1. Launch Chrome kiosk mode
  const chromeProc = spawn(CHROME, [
    '--kiosk', 'http://localhost:8765/index.html?record',
    '--window-position=0,0', '--window-size=1920,1080',
    '--remote-debugging-port=9222', '--no-sandbox',
    '--disable-extensions', '--force-device-scale-factor=1',
  ], { stdio: 'ignore', detached: true });

  await new Promise(r => setTimeout(r, 3000));

  // 2. Connect
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages()[0];
  console.log('✅ 已连接');

  // 3. Wait for ALL images + BGM to load
  console.log('⏳ 等待图片和BGM加载...');
  await page.waitForFunction('window.__recordReady === true', { timeout: 30000 });
  console.log('✅ 全部资源就绪');
  await page.waitForTimeout(800); // let layout settle

  // 4. Start ffmpeg capture
  console.log('📹 录屏开始');
  const ffmpegProc = spawn(FFMPEG, [
    '-f', 'gdigrab', '-framerate', '20',
    '-offset_x', '0', '-offset_y', '0',
    '-video_size', '1920x1080',
    '-i', 'desktop',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-b:v', '12M',
    '-pix_fmt', 'yuv420p',
    '-t', '54', '-y', RAW,
  ], { stdio: 'inherit' });

  await new Promise(r => setTimeout(r, 1200));

  // 5. Click to start animation
  console.log('▶️  启动');
  await page.click('body');

  // 6. Wait for ffmpeg
  await new Promise(r => ffmpegProc.on('close', r));
  console.log('⏹️  录屏完成');

  await browser.close();
  try { chromeProc.kill(); } catch(e) {}

  // 7. Merge BGM + normalize fps
  console.log('🔊 合成...');
  execSync(
    `"${FFMPEG}" -i "${RAW}" -i "d:/Desktop/AI相册/想你和我们的以后.mp3" ` +
    `-c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k ` +
    `-map 0:v:0 -map 1:a:0 -filter:a "volume=0.55" ` +
    `-map_metadata -1 -map_chapters -1 -t 49 ` +
    `-movflags +faststart -y "${OUT}"`,
    { stdio: 'inherit' }
  );

  rmSync(RAW);
  console.log('✅', OUT, (statSync(OUT).size / 1024 / 1024).toFixed(1) + 'MB');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
