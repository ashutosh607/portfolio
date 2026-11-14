import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// The same scene plays immediately in the village and on arrival in the 2D scrollport.
export function sectionEntrance(element, embedded) {
  return gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: embedded ? {
      trigger: element,
      scroller: element.closest('.portfolio-2d-wrapper'),
      start: 'top 85%',
      once: true,
    } : undefined,
  });
}
