const { chromium } = require('C:/Users/86156/AppData/Local/Temp/tmp.5UI6S5F41j/node_modules/playwright');
const { execSync } = require('child_process');
const { readdirSync, statSync, rmSync, existsSync } = require('fs');

const FFMPEG = 'C:/Users/86156/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.1-full_build/bin/ffmpeg.exe';
const OUT = 'd:/Desktop/AI相册/桃花酥_高清.mp4';

if (existsSync(OUT)) rmSync(OUT);
console.log('🎬 1920x1080 原生 + 星空可见 + 320px卡片');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--disable-gpu','--disable-background-timer-throttling'] });
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: 'd:/Desktop/AI相册', size: { width: 1920, height: 1080 }, fps: 24 },
  });
  const page = await ctx.newPage();

  // keep-alive
  const ka = setInterval(async () => { try { await page.mouse.move(10, 10); } catch(e) {} }, 1500);

  await page.goto('http://localhost:8765/index.html?record', { waitUntil: 'networkidle', timeout: 20000 });
  console.log('✅ 加载');
  await page.waitForFunction('window.__recordReady===true', { timeout: 30000 });
  await page.waitForTimeout(500);
  console.log('✅ 就绪 ▶️');
  await page.click('body');

  for (let s = 1; s <= 50; s++) {
    await page.waitForTimeout(1000);
    if (s % 10 === 0) console.log(`  ${s}s`);
  }

  clearInterval(ka);
  await ctx.close();
  await browser.close();
  console.log('⏹️ 录完');

  const files = readdirSync('d:/Desktop/AI相册').filter(f => f.endsWith('.webm'));
  if (!files.length) { console.log('❌ 无视频'); process.exit(1); }
  const raw = 'd:/Desktop/AI相册/' + files.sort().pop();

  console.log('🔊 BGM + CRF16...');
  execSync(
    `"${FFMPEG}" -i "${raw}" -i "d:/Desktop/AI相册/想你和我们的以后.mp3" ` +
    `-c:v libx264 -preset fast -crf 16 -c:a aac -b:a 192k ` +
    `-map 0:v:0 -map 1:a:0 -filter:a "volume=0.55" ` +
    `-map_metadata -1 -map_chapters -1 -t 47 -movflags +faststart -y "${OUT}"`,
    { stdio: 'inherit' }
  );

  rmSync(raw);
  const info = statSync(OUT);
  console.log('✅', OUT, (info.size/1048576).toFixed(1)+'MB');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
