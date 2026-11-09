import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText, ScrollTrigger);

export default function useVillagePageMotion(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const scroller = root.closest('.portfolio-2d-wrapper');
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const triggers = element => ({ trigger: element, scroller, start: 'top 91%', once: true });
      const titles = root.querySelectorAll(
        '.gate-titles h1, .gate-copy blockquote, .skills-main-title, .contact-hero-heading, .contact-hero-subtitle'
      );
      const splits = Array.from(titles, title => {
        const split = SplitText.create(title, { type: 'words', tag: 'span', wordsClass: 'village-word', ignore: 'svg' });
        gsap.from(split.words, {
          yPercent: 50, opacity: 0, rotation: 1.5, transformOrigin: 'left bottom',
          duration: .75, stagger: .065, delay: .18, ease: 'power3.out',
          clearProps: 'transform,opacity', scrollTrigger: triggers(title),
        });
        return split;
      });

      // Keep the scene's original transforms free for page turns, hover and selection.
      const rows = root.querySelectorAll('.gate-route-stop, .about-col-photo, .about-col-right, .contact-directory-item');
      rows.forEach((row, index) => {
        gsap.fromTo(row, { '--village-slide': index % 2 ? '42px' : '-42px' }, {
          '--village-slide': '0px', duration: .85, ease: 'power3.out', scrollTrigger: triggers(row),
        });
      });

      return () => splits.forEach(split => split.revert());
    }, root);
    return () => media.revert();
  }, [rootRef]);
}
