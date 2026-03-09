import * as THREE from 'three';

/**
 * Generates a texture atlas containing numbers 0-9.
 * 10 columns, 1 row.
 */
export const generateAtlasTexture = (): THREE.CanvasTexture => {
  const width = 1024;
  const height = 128; // Aspect ratio allows for 10 square(ish) frames
  const cols = 10;
  const cellWidth = width / cols;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not create canvas context');

  // Background - Stone Grey
  ctx.fillStyle = '#888899';
  ctx.fillRect(0, 0, width, height);

  // Noise/Grunge Pass
  for(let i=0; i<5000; i++) {
     ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
     ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
  }

  // Text settings
  ctx.font = 'bold 80px "Courier New", monospace'; // Monospace for that "Data" feel
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';

  // Draw numbers 0-9
  for (let i = 0; i < 10; i++) {
    const x = i * cellWidth + cellWidth / 2;
    const y = height / 2;
    
    // Draw a border for "Brutalist" panel look
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 4;
    ctx.strokeRect(i * cellWidth + 5, 5, cellWidth - 10, height - 10);

    ctx.fillText(i.toString(), x, y);
    
    // Add some "Data" artifacts
    ctx.font = '10px monospace';
    ctx.fillText(`0x0${i}`, x, y + 40);
    ctx.font = 'bold 80px "Courier New", monospace';
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
};

/**
 * Generates a normal map for the stone texture
 */
export const generateNormalMap = (): THREE.CanvasTexture => {
   const size = 512;
   const canvas = document.createElement('canvas');
   canvas.width = size;
   canvas.height = size;
   const ctx = canvas.getContext('2d');
   if(!ctx) throw new Error("No context");

   ctx.fillStyle = '#8080ff'; // Flat normal color
   ctx.fillRect(0,0,size,size);

   // Simple noise for bumps
   for(let i=0; i<10000; i++) {
       const x = Math.random() * size;
       const y = Math.random() * size;
       // Creating localized perturbation
       const shade = Math.random() > 0.5 ? '#9090ff' : '#7070ff';
       ctx.fillStyle = shade;
       ctx.fillRect(x,y, 4, 4);
   }

   const tex = new THREE.CanvasTexture(canvas);
   tex.wrapS = THREE.RepeatWrapping;
   tex.wrapT = THREE.RepeatWrapping;
   return tex;
}
