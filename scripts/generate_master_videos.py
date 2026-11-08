import os
import wave
import struct
import math
import subprocess

def create_tactical_audio(filename, duration_sec, base_freq, geiger_rate):
    sample_rate = 44100
    num_samples = int(sample_rate * duration_sec)
    
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        
        frames = bytearray()
        for i in range(num_samples):
            t = i / sample_rate
            hum = 0.25 * math.sin(2 * math.pi * base_freq * t) + 0.1 * math.sin(2 * math.pi * (base_freq * 1.5) * t)
            noise = (hash(i) % 1000 - 500) / 10000.0
            geiger = 0
            if (i % int(sample_rate * geiger_rate)) < 15:
                geiger = 0.4 * math.sin(2 * math.pi * 1200 * t)
                
            sample = hum + noise + geiger
            sample = max(-0.95, min(0.95, sample))
            frames.extend(struct.pack('<h', int(sample * 32767)))
            
        f.writeframes(frames)

def generate_video(img_path, audio_path, out_path, zoom_rate, noise_level):
    zoom_filter = f"[0:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,zoompan=z='min(zoom+{zoom_rate},1.25)':d=300:s=1280x720,noise=alls={noise_level}:allf=t+u[v]"
    cmd = [
        'ffmpeg', '-y',
        '-loop', '1',
        '-i', img_path,
        '-i', audio_path,
        '-filter_complex', zoom_filter,
        '-map', '[v]',
        '-map', '1:a',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '22',
        '-t', '10',
        '-r', '30',
        '-pix_fmt', 'yuv420p',
        out_path
    ]
    print(f"Generating {out_path}...")
    subprocess.run(cmd, check=True)

def main():
    os.makedirs('/tmp/scp_gen', exist_ok=True)
    
    cameras = [
        {
            'name': 'cam1_brasov.mp4',
            'img': 'src/assets/images/cctv_brasov_subterranean_1793728562302.jpg',
            'freq': 55,
            'geiger': 0.8,
            'zoom': '0.0008',
            'noise': 12
        },
        {
            'name': 'cam2_onesti.mp4',
            'img': 'src/assets/images/cctv_onesti_dumbrava_1793728577062.jpg',
            'freq': 65,
            'geiger': 1.2,
            'zoom': '0.0006',
            'noise': 10
        },
        {
            'name': 'cam3_site19.mp4',
            'img': 'src/assets/images/cctv_site19_scp173_1793728606406.jpg',
            'freq': 80,
            'geiger': 0.4,
            'zoom': '0.0005',
            'noise': 15
        },
        {
            'name': 'cam4_bodycam.mp4',
            'img': 'src/assets/images/cctv_mtf_bodycam_1793728622584.jpg',
            'freq': 48,
            'geiger': 0.5,
            'zoom': '0.0010',
            'noise': 20
        },
        {
            'name': 'cam5_scpguard.mp4',
            'img': 'src/assets/images/scp_guard_edit_pinterest.jpg',
            'freq': 72,
            'geiger': 0.9,
            'zoom': '0.0004',
            'noise': 8
        }
    ]
    
    for cam in cameras:
        audio_file = f"/tmp/scp_gen/audio_{cam['name']}.wav"
        out_file = f"public/videos/{cam['name']}"
        create_tactical_audio(audio_file, 10.0, cam['freq'], cam['geiger'])
        generate_video(cam['img'], audio_file, out_file, cam['zoom'], cam['noise'])
        
    print("ALL MASTER VIDEOS GENERATED SUCCESSFULLY!")

if __name__ == '__main__':
    main()
