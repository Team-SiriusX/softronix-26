import { store } from '@/constants/store';

// We take top products and their images.
const products = store.products.filter(p => p.images && p.images.length > 0).slice(0, 10);

// Ensure we have enough images. If not, repeat.
const rawImages = products.map(p => p.images[0]);
while (rawImages.length < 5) {
    if(rawImages.length > 0) rawImages.push(...rawImages);
    else rawImages.push('https://via.placeholder.com/800x1000'); // Fallback
}

export const images = rawImages.slice(0, 8); // Limit to 8 for performance

export const imageConfig = {
  width: 800,
  height: 1200,
};

export const cylinderConfig = {
  radius: 2,
  height: 1.8, // Reduced height for more header space
};

export const particleConfig = {
  numParticles: 60,
  radius: 2.2,
  segments: 20,
};


export const perspectives = [
  {
    title: "SOFTRONIX",
    subtitle: "AI AGENT",
    year: "2026",
    position: "center"
  },
  {
    title: "PREMIUM",
    subtitle: "COLLECTION",
    year: "EST. 2024",
    position: "right"
  },
  {
    title: "SEAMLESS",
    subtitle: "DESIGN",
    year: "UI/UX",
    position: "left"
  },
  {
    title: "GLOBAL",
    subtitle: "REACH",
    year: "WORLDWIDE",
    position: "bottom"
  },
  {
    title: "FUTURE",
    subtitle: "READY",
    year: "NEXT GEN",
    position: "center"
  }
];
