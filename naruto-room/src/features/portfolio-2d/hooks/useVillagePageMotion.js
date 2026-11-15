import { useLayoutEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText, ScrollTrigger);

export default function useVillagePageMotion(rootRef) {
  const scrollRef = useRef(null);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const scroller = root.closest('.portfolio-2d-wrapper');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const tick = seconds => scrollRef.current?.raf(seconds * 1000);
    const stopScroll = () => {
      gsap.ticker.remove(tick);
      scrollRef.current?.destroy();
      scrollRef.current = null;
    };
    const configureScroll = () => {
      stopScroll();
      if (preference.matches) return;
      scrollRef.current = new Lenis({
        wrapper: scroller, content: root, lerp: 0.14, syncTouch: false,
        allowNestedScroll: true,
        prevent: node => node.matches?.('[aria-modal="true"], .p2d-mobile-drawer-backdrop, textarea, select'),
      });
      scrollRef.current.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
    };
    configureScroll();
    preference.addEventListener('change', configureScroll);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const triggers = element => ({ trigger: element, scroller, start: 'top 91%', once: true });
      const titles = root.querySelectorAll(
        '.gate-titles h1, .gate-copy blockquote, .skills-main-title, .contact-hero-heading, .contact-hero-subtitle'
      );
      const splits = Array.from(titles, title => {
        const split = SplitText.create(title, { type: 'words', tag: 'span', wordsClass: 'village-word', ignore: 'svg' });
        gsap.from(split.words, {
          yPercent: 26, opacity: 0, filter: 'blur(2px)', transformOrigin: 'left bottom',
          duration: .5, stagger: .045, delay: .04, ease: 'power3.out',
          clearProps: 'transform,opacity,filter', scrollTrigger: triggers(title),
        });
        return split;
      });

      // Keep the scene's original transforms free for page turns, hover and selection.
      const rows = root.querySelectorAll('.gate-route-stop, .contact-links a');
      rows.forEach((row, index) => {
        gsap.fromTo(row, { '--village-slide': index % 2 ? '8px' : '-8px' }, {
          '--village-slide': '0px', duration: .85, ease: 'power3.out', scrollTrigger: triggers(row),
        });
      });

      return () => {
        splits.forEach(split => split.revert());
      };
    }, root);
    return () => {
      preference.removeEventListener('change', configureScroll);
      stopScroll();
      media.revert();
    };
  }, [rootRef]);
  return scrollRef;
}
