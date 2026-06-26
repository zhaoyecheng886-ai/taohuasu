const { chromium } = require('C:/Users/86156/AppData/Local/Temp/tmp.5UI6S5F41j/node_modules/playwright');
const { execSync } = require('child_process');
const { readdirSync, statSync, rmSync, existsSync } = require('fs');

const FFMPEG = 'C:/Users/86156/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.1-full_build/bin/ffmpeg.exe';
const OUT = 'd:/Desktop/AI相册/桃花酥_高清.mp4';

if (existsSync(OUT)) rmSync(OUT);
console.log('🎬 录制 (1280x720 + 有头GPU + 30fps)');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-extensions', '--start-maximized'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: 'd:/Desktop/AI相册', size: { width: 1280, height: 720 }, fps: 30 },
  });
  const page = await ctx.newPage();

  const keepAlive = setInterval(async () => {
    try { await page.evaluate(() => { document.body.style.cursor = document.body.style.cursor ? '' : 'default'; }); } catch(e) {}
  }, 3000);

  await page.goto('http://localhost:8765/index.html?record', { waitUntil: 'domcontentloaded', timeout: 15000 });
  console.log('✅ 加载');
  await page.waitForTimeout(200);
  console.log('▶️  点击');
  await page.click('body');

  for (let s = 1; s <= 52; s++) {
    await page.waitForTimeout(1000);
    if (s % 10 === 0) console.log(`  ${s}s`);
  }

  clearInterval(keepAlive);
  console.log('⏹️  完成');
  await ctx.close();
  await browser.close();

  const files = readdirSync('d:/Desktop/AI相册').filter(f => f.endsWith('.webm'));
  if (!files.length) { console.log('❌ 无视频'); process.exit(1); }
  const raw = 'd:/Desktop/AI相册/' + files.sort().pop();

  console.log('🔊 BGM + H.264...');
  execSync(
    `"${FFMPEG}" -i "${raw}" -i "d:/Desktop/AI相册/想你和我们的以后.mp3" ` +
    `-c:v libx264 -preset fast -crf 16 -c:a aac -b:a 192k ` +
    `-map 0:v:0 -map 1:a:0 -filter:a "volume=0.55" ` +
    `-map_metadata -1 -map_chapters -1 -t 48 ` +
    `-movflags +faststart -y "${OUT}"`,
    { stdio: 'inherit' }
  );

  rmSync(raw);
  console.log('✅', OUT, (statSync(OUT).size / 1024 / 1024).toFixed(1) + 'MB');
  process.exit(0);
})();
