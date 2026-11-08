import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const publicDir = path.resolve('public/videos');

async function processVideos() {
  const configs = [
    { in: 'raw1.mp4', out: 'cam1_brasov.mp4', filter: 'noise=alls=20:allf=t+u,colorchannelmixer=.3:.4:.3:0:.3:.4:.3,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf:text=\'BREACH_DETECTED_S4\':x=10:y=10:fontsize=32:fontcolor=red:box=1:boxcolor=black@0.6' },
    { in: 'raw2.mp4', out: 'cam2_onesti.mp4', filter: 'hue=s=0,colorchannelmixer=0:0:0:0:0:1:0:0:0:0:0,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf:text=\'ANOMALY_SIGNAL_02\':x=10:y=10:fontsize=32:fontcolor=green:box=1:boxcolor=black@0.6' },
    { in: 'raw3.mp4', out: 'cam3_site19.mp4', filter: 'noise=alls=15:allf=t+u,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf:text=\'CONTAINMENT_FAIL_173\':x=10:y=10:fontsize=32:fontcolor=red:box=1:boxcolor=black@0.6' },
    { in: 'raw4.mp4', out: 'cam4_bodycam.mp4', filter: 'hue=s=0,colorchannelmixer=0:0:0:0:0:0:0:0:0:0:1,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf:text=\'MTF_VISION_ACT\':x=10:y=10:fontsize=32:fontcolor=blue:box=1:boxcolor=black@0.6' },
    { in: 'raw5.mp4', out: 'cam5_scpguard.mp4', filter: 'noise=alls=10:allf=t+u,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf:text=\'O5_AUTH_OK\':x=10:y=10:fontsize=32:fontcolor=white:box=1:boxcolor=black@0.6' }
  ];

  for (const config of configs) {
    const inPath = path.join(publicDir, config.in);
    const outPath = path.join(publicDir, config.out);
    
    if (!fs.existsSync(inPath)) continue;

    const cmd = `ffmpeg -y -i "${inPath}" -vf "${config.filter},scale=1280:720" -t 10 -c:v libx264 -pix_fmt yuv420p "${outPath}"`;
    
    console.log(`Processing ${config.out}...`);
    await new Promise((r) => exec(cmd, async (err) => {
      if (err) console.error(`Error processing ${config.out}:`, err);
      else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Synthesized ${config.out} for 2026 tactical feed.`);
      }
      r(true);
    }));
  }
  console.log('All tactical videos synthesized with SCP alerts.');
}

processVideos();
