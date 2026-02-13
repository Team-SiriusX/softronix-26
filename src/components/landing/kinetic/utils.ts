import gsap from 'gsap';
import { store } from '@/constants/store';

// Map store products to items format
const productItems = store.products
  .filter(p => p.images && p.images.length > 0)
  .slice(0, 4)
  .map((p, i) => ({
    id: `article-${i + 1}`,
    img: p.images[0],
    number: `0${i + 1}`,
    title: p.name,
    intro: p.description,
    description: p.extendedDescription || p.description
  }));

export const items = productItems.length >= 4 ? productItems : [
    // Fallback if store doesn't have enough items (though it does)
    ...productItems,
    {
        id: 'article-4',
        img: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=2080&auto=format&fit=crop',
        number: '04',
        title: 'Epilepsy',
        intro: 'The auditorium: an enormous half-globe of glass...',
        description: 'The circular rows of noble...' 
    }
].slice(0, 4);

export const backgroundTexts = [
  "bonjour bonjour bonjour",
  "attrayant attrayant attrayant",
  "charmante charmante charmante",
  "rosetta rosetta rosetta",
  "tendresse tendresse tendresse",
  "chatoyer chatoyer chatoyer",
  "bonjour bonjour bonjour",
  "attrayant attrayant attrayant",
  "charmante charmante charmante",
  "rosetta rosetta rosetta",
  "tendresse tendresse tendresse"
];

// Helper for type animation
export const createTypeTransition = (typeEl: HTMLElement, lines: HTMLElement[]) => {
    // CSS variable simulation for opacity
    const TYPE_LINE_OPACITY = 0.05; 

    return {
        in: () => {
            return gsap.timeline({paused: true})
            .to(typeEl, {
                duration: 1.4,
                ease: 'power2.inOut',
                scale: 2.7,
                rotate: -90
            })
            .to(lines, {
                keyframes: [
                    { x: '20%', duration: 1, ease: 'power1.inOut' },
                    { x: '-200%', duration: 1.5, ease: 'power1.in' }
                ],
                stagger: 0.04
            }, 0)
            .to(lines, {
                keyframes: [
                    { opacity: 1, duration: 1, ease: 'power1.in' },
                    { opacity: 0, duration: 1.5, ease: 'power1.in' }
                ]
            }, 0);
        },
        out: () => {
             return gsap.timeline({paused: true})
            .to(typeEl, {
                duration: 1.4,
                ease: 'power2.inOut',
                scale: 1,
                rotate: 0,
                overwrite: 'auto' // Important ensures we don't fight with previous tweens
            }, 1.2)
            .to(lines, {
                duration: 2.3, 
                ease: 'back.out(1.7)', // GSAP string syntax for ease
                x: '0%',
                stagger: -0.04,
                overwrite: 'auto'
            }, 0)
            .to(lines, {
                keyframes: [
                    { opacity: 1, duration: 1, ease: 'power1.in' },
                    { opacity: TYPE_LINE_OPACITY, duration: 1.5, ease: 'power1.in' }
                ],
                overwrite: 'auto'
            }, 0);
        }
    }
}
