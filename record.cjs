const { chromium } = require('C:/Users/86156/AppData/Local/Temp/tmp.5UI6S5F41j/node_modules/playwright');
const { execSync } = require('child_process');
const { readdirSync, statSync, rmSync, existsSync } = require('fs');

const FFMPEG = 'C:/Users/86156/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.1-full_build/bin/ffmpeg.exe';
const OUT = 'd:/Desktop/AI相册/桃花酥_高清.mp4';

// Clean old files
if (existsSync(OUT)) rmSync(OUT);
['d:/Desktop/AI相册'].forEach(d => {
  try { readdirSync(d).filter(f => f.endsWith('.webm')).forEach(f => rmSync(d + '/' + f)); } catch(e) {}
});

console.log('🎬 录制: headless=new + 原生1920x1080 + 无Canvas + CRF 16');

(async () => {
  // Use headless=new — has much better rAF behavior than old headless
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--no-first-run',
      '--disable-default-apps',
    ],
  });

  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: 'd:/Desktop/AI相册', size: { width: 1920, height: 1080 }, fps: 24 },
  });

  const page = await ctx.newPage();

  // Aggressive keep-alive: move virtual mouse every 1.5s to prevent throttling
  const ka = setInterval(async () => {
    try {
      await page.mouse.move(Math.random() * 100 + 10, Math.random() * 100 + 10);
    } catch(e) {}
  }, 1500);

  await page.goto('http://localhost:8765/index.html?record', { waitUntil: 'networkidle', timeout: 20000 });
  console.log('✅ 页面加载');

  // Wait for all resources
  console.log('⏳ 等待资源...');
  await page.waitForFunction('window.__recordReady===true', { timeout: 30000 });
  await page.waitForTimeout(800);
  console.log('✅ 资源就绪');

  // Start
  console.log('▶️  启动');
  await page.click('body');

  // Record 50s
  for (let s = 1; s <= 50; s++) {
    await page.waitForTimeout(1000);
    if (s % 10 === 0) console.log(`  ${s}s`);
  }

  clearInterval(ka);
  console.log('⏹️  完成，关闭浏览器...');
  await ctx.close();
  await browser.close();

  // Find webm
  const files = readdirSync('d:/Desktop/AI相册').filter(f => f.endsWith('.webm'));
  if (!files.length) { console.log('❌ 无视频文件'); process.exit(1); }
  const raw = 'd:/Desktop/AI相册/' + files.sort().pop();
  console.log('📹', raw);

  // Merge BGM + recode at high quality
  console.log('🔊 合成 + 高质量编码...');
  execSync(
    `"${FFMPEG}" -i "${raw}" -i "d:/Desktop/AI相册/想你和我们的以后.mp3" ` +
    `-c:v libx264 -preset fast -crf 16 -c:a aac -b:a 192k ` +
    `-map 0:v:0 -map 1:a:0 -filter:a "volume=0.55" ` +
    `-map_metadata -1 -map_chapters -1 -t 47 ` +
    `-movflags +faststart -y "${OUT}"`,
    { stdio: 'inherit' }
  );

  rmSync(raw);

  // Quick sanity check
  const info = statSync(OUT);
  const dur = execSync(`"${FFMPEG}" -i "${OUT}" 2>&1`).toString();
  const durMatch = dur.match(/Duration: (\d+:\d+:\d+)/);
  const fpsMatch = dur.match(/(\d+) fps/);

  console.log('---');
  console.log('✅ 输出:', OUT);
  console.log('   大小:', (info.size / 1024 / 1024).toFixed(1) + 'MB');
  console.log('   时长:', durMatch ? durMatch[1] : '?');
  console.log('   帧率:', fpsMatch ? fpsMatch[1] + 'fps' : '?');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
