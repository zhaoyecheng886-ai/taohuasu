const { chromium } = require('C:/Users/86156/AppData/Local/Temp/tmp.5UI6S5F41j/node_modules/playwright');
const { execSync, spawn } = require('child_process');
const { statSync, rmSync, existsSync } = require('fs');

const FFMPEG = 'C:/Users/86156/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.1-full_build/bin/ffmpeg.exe';
const OUT = 'd:/Desktop/AI相册/桃花酥_高清.mp4';
const RAW = 'd:/Desktop/AI相册/_raw_video.mp4';

if (existsSync(OUT)) rmSync(OUT);
if (existsSync(RAW)) rmSync(RAW);

console.log('🎬 方案：ffmpeg gdigrab 录屏 + Playwright 驱动浏览器');

(async () => {
  // Launch browser positioned at (0,0) with 1920x1080 viewport
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--window-position=0,0',
      '--window-size=1920,1100',
      '--disable-extensions',
      '--disable-background-timer-throttling',
    ],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8765/index.html?record', { waitUntil: 'domcontentloaded', timeout: 15000 });
  console.log('✅ 页面就绪');

  // Start ffmpeg screen capture (grabs entire desktop, we'll crop later)
  console.log('📹 ffmpeg 开始录屏...');
  const ffmpegProc = spawn(FFMPEG, [
    '-f', 'gdigrab',
    '-framerate', '30',
    '-offset_x', '0',
    '-offset_y', '0',
    '-video_size', '1920x1080',
    '-i', 'desktop',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '16',
    '-pix_fmt', 'yuv420p',
    '-t', '55',
    '-y', RAW,
  ], { stdio: 'inherit' });

  // Wait for ffmpeg to start capturing
  await page.waitForTimeout(1000);

  // Click to start animation
  console.log('▶️  启动动画');
  await page.click('body');

  // Wait for ffmpeg to finish (55s video)
  await new Promise((resolve) => {
    ffmpegProc.on('close', resolve);
  });

  console.log('⏹️  录屏完成');
  await ctx.close();
  await browser.close();

  // Merge BGM — use the raw ffmpeg capture as video source
  console.log('🔊 叠加 BGM...');
  execSync(
    `"${FFMPEG}" -i "${RAW}" -i "d:/Desktop/AI相册/想你和我们的以后.mp3" ` +
    `-c:v copy -c:a aac -b:a 192k ` +
    `-map 0:v:0 -map 1:a:0 -filter:a "volume=0.55" ` +
    `-map_metadata -1 -map_chapters -1 -t 49 ` +
    `-movflags +faststart -y "${OUT}"`,
    { stdio: 'inherit' }
  );

  rmSync(RAW);
  console.log('✅', OUT, (statSync(OUT).size / 1024 / 1024).toFixed(1) + 'MB');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
