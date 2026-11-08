import React, { useEffect, useRef } from 'react';

interface TacticalAnomalyOverlayProps {
  cameraId: string;
  channel: string;
  isPlaying: boolean;
  pictureMode: 'tv_clear' | 'flir' | 'cctv';
  isMuted: boolean;
}

export function TacticalAnomalyOverlay({
  cameraId,
  channel,
  isPlaying,
  pictureMode,
  isMuted,
}: TacticalAnomalyOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<{ osc?: OscillatorNode; gain?: GainNode } | null>(null);

  // Web Audio Procedural Ambiance Generator for SCP Surveillance
  useEffect(() => {
    if (isMuted || !isPlaying) {
      if (soundNodesRef.current?.gain && audioCtxRef.current) {
        soundNodesRef.current.gain.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }

      const ctx = audioCtxRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create base tactical hum
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch based on channel ID
      const baseFreq = cameraId === 'CAM-01' ? 55 : cameraId === 'CAM-02' ? 65 : cameraId === 'CAM-03' ? 80 : cameraId === 'CAM-04' ? 50 : 70;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.setTargetAtTime(0.04, ctx.currentTime, 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      soundNodesRef.current = { osc, gain };

      // Periodic Geiger / Radio click interval
      const interval = setInterval(() => {
        if (!audioCtxRef.current || isMuted || !isPlaying) return;
        const clickCtx = audioCtxRef.current;
        const clickOsc = clickCtx.createOscillator();
        const clickGain = clickCtx.createGain();

        clickOsc.type = 'sawtooth';
        clickOsc.frequency.setValueAtTime(800 + Math.random() * 600, clickCtx.currentTime);
        clickGain.gain.setValueAtTime(0.015, clickCtx.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, clickCtx.currentTime + 0.05);

        clickOsc.connect(clickGain);
        clickGain.connect(clickCtx.destination);
        clickOsc.start();
        clickOsc.stop(clickCtx.currentTime + 0.05);
      }, 1200 + Math.random() * 2000);

      return () => {
        clearInterval(interval);
        if (soundNodesRef.current?.osc) {
          try {
            soundNodesRef.current.osc.stop();
            soundNodesRef.current.osc.disconnect();
          } catch {}
        }
      };
    } catch (e) {
      // Ignore Web Audio autoplay restriction blocks
    }
  }, [cameraId, isMuted, isPlaying]);

  // Canvas 2D Dynamic Anomaly & Tactical HUD Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frameCount = 0;

    const render = () => {
      frameCount++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (!isPlaying) return;

      const t = frameCount * 0.03;

      // --- CAM-01: Brașov Subterranean Cavern (SCP-087 Shadow Entity) ---
      if (cameraId === 'CAM-01') {
        // Sonar depth wave rings
        const cx = w * 0.35;
        const cy = h * 0.55;
        const radius = (frameCount * 2) % (w * 0.4);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0, 0.5 - radius / (w * 0.4))})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Shadow Anomaly Bounding Box
        const bx = cx - 60 + Math.sin(t * 0.5) * 10;
        const by = cy - 80 + Math.cos(t * 0.7) * 5;
        const bw = 120;
        const bh = 150;

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Corner brackets
        const cl = 12;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(bx - 4, by + cl); ctx.lineTo(bx - 4, by - 4); ctx.lineTo(bx + cl, by - 4);
        // Top-right
        ctx.moveTo(bx + bw - cl, by - 4); ctx.lineTo(bx + bw + 4, by - 4); ctx.lineTo(bx + bw + 4, by + cl);
        // Bottom-left
        ctx.moveTo(bx - 4, by + bh - cl); ctx.lineTo(bx - 4, by + bh + 4); ctx.lineTo(bx + cl, by + bh + 4);
        // Bottom-right
        ctx.moveTo(bx + bw - cl, by + bh + 4); ctx.lineTo(bx + bw + 4, by + bh + 4); ctx.lineTo(bx + bw + 4, by + bh - cl);
        ctx.stroke();

        // Anomaly Label
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx, by - 18, 140, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('ANOMALIE SCP-087-B', bx + 4, by - 5);

        // Glowing Crimson Eyes in dark subterranean corner
        const eyeX = bx + bw * 0.5 + Math.sin(t) * 4;
        const eyeY = by + bh * 0.35;
        const eyeGlow = Math.sin(t * 2) * 0.3 + 0.7;

        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
        ctx.fillStyle = `rgba(255, 30, 30, ${eyeGlow})`;
        ctx.beginPath();
        ctx.arc(eyeX - 14, eyeY, 3.5, 0, Math.PI * 2);
        ctx.arc(eyeX + 14, eyeY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Depth Sonar Data Tag
        ctx.fillStyle = 'rgba(0, 255, 200, 0.85)';
        ctx.font = '9px monospace';
        ctx.fillText(`FLUX HUME: 0.68 | PROFUNZIME: -24.8m`, bx, by + bh + 14);
      }

      // --- CAM-02: Dumbrava / Onești (SCP-106 Abyssal Void Forest) ---
      else if (cameraId === 'CAM-02') {
        const cx = w * 0.65 + Math.sin(t * 0.8) * 20;
        const cy = h * 0.45 + Math.cos(t * 0.6) * 10;

        // Scranton SRA-4 Grid Field
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < w; x += gridSize) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Abyssal Corrosion Shadow Silhouette
        ctx.save();
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 25;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 35, 75, Math.sin(t * 0.3) * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Target Thermal Lock
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 50, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`ANCORE SRA-4 ACTIVE [SCP-106 COROZIUNE]`, cx - 100, cy - 60);
        ctx.fillText(`FLUX HUME: 0.62 | SECTOR RO-02`, cx - 100, cy + 65);
      }

      // --- CAM-03: Situl-19 Containment Cell (SCP-173 Concrete Entity) ---
      else if (cameraId === 'CAM-03') {
        const cx = w * 0.5;
        const cy = h * 0.48;

        // Containment Cell Frame
        const bw = 180;
        const bh = 240;
        const bx = cx - bw / 2;
        const by = cy - bh / 2;

        // Blink Status Warning Box
        const blinkCycle = (frameCount % 180) / 30; // 6 sec blink cycle
        const isBlinkWarning = blinkCycle > 4.5;

        ctx.strokeStyle = isBlinkWarning ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = isBlinkWarning ? 3 : 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Blink warning banner
        ctx.fillStyle = isBlinkWarning ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.85)';
        ctx.fillRect(bx, by - 22, bw, 20);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px monospace';
        const blinkText = isBlinkWarning ? '⚠️ AVERTISMENT CLIPIT (BLINK)!' : 'CONȚINERE SCP-173 STABILĂ';
        ctx.fillText(blinkText, bx + 8, by - 8);

        // Reticle target on sculpture
        ctx.strokeStyle = isBlinkWarning ? '#ef4444' : '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.moveTo(cx - 40, cy); ctx.lineTo(cx + 40, cy);
        ctx.moveTo(cx, cy - 40); ctx.lineTo(cx, cy + 40);
        ctx.stroke();

        // Pressure Gauge Footer
        ctx.fillStyle = '#06b6d4';
        ctx.font = '9px monospace';
        ctx.fillText('PRESIUNE CELULĂ: 101.3 kPa | CONTACT VIZUAL: CONTINUU', bx, by + bh + 14);
      }

      // --- CAM-04: MTF Bodycam Live (Postăvaru & Poiana Brașov) ---
      else if (cameraId === 'CAM-04') {
        // MTF Helmet Visor Overlay
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(15, 15, w - 30, h - 30);

        // Crosshair reticle
        const cx = w * 0.5;
        const cy = h * 0.5;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.beginPath();
        ctx.moveTo(cx - 15, cy); ctx.lineTo(cx + 15, cy);
        ctx.moveTo(cx, cy - 15); ctx.lineTo(cx, cy + 15);
        ctx.stroke();

        // Heart rate pulse graph
        const bpm = 138 + Math.floor(Math.sin(t * 2) * 6);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`PULS SOLDER MTF: ${bpm} BPM | AMMO: 28/30`, 25, 35);
        ctx.fillText(`BODYCAM-X26 // DETAȘAMENT NU-7 „HAMMER DOWN”`, 25, 50);

        // Auto-Censor Face Blur Grid (SCP-096 Protocol)
        const fx = cx + Math.sin(t * 0.7) * 40;
        const fy = cy - 20 + Math.cos(t * 0.5) * 20;

        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(fx - 40, fy - 40, 80, 80);
        ctx.strokeStyle = '#ef4444';
        ctx.strokeRect(fx - 40, fy - 40, 80, 80);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('SCRAMBLE-FACE ACTIVE', fx - 38, fy - 45);
      }

      // --- CAM-05: Central Garrison Security Post (Gardian Tactic Pinterest) ---
      else if (cameraId === 'CAM-05') {
        // Biometric Security Guard HUD
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 1.5;

        // Perimeter Scanning Radar in bottom right corner
        const rx = w - 65;
        const ry = h - 65;
        const rr = 45;

        ctx.beginPath();
        ctx.arc(rx, ry, rr, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rx, ry, rr * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // Radar sweep arm
        const sweepAngle = t * 2;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + Math.cos(sweepAngle) * rr, ry + Math.sin(sweepAngle) * rr);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#22d3ee';
        ctx.font = '8px monospace';
        ctx.fillText('RADAR RADIAL PERIMETRU', rx - 45, ry + rr + 12);

        // Biometric Status Header
        ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('GARDIAN TACTIC SCP // POST FIX 05', 25, 35);
        ctx.fillText('STARE BIOMETRICĂ: OPTIM (PULS 74 BPM | ARMURĂ 100%)', 25, 50);
      }

      animId = requestAnimationFrame(render);
    };

    // Resize canvas to match display container
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [cameraId, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
