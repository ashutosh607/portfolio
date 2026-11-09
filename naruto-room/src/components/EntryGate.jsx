import { published } from '../data/published';
import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { entryDestinations } from '../data/entryDestinations';
import { LOCATION_SVGS } from './locationIcons';
import './EntryGate.css';

const strokes = {
  laptop: 'M3 5h18v12H3z M1 20h22',
  layers: 'm2 8 10-5 10 5-10 5z M3 12l9 5 9-5 M3 16l9 5 9-5',
  target: 'M20 11a8 8 0 1 1-7-7 M16 11a4 4 0 1 1-4-3 M12 12l8-8 M17 4h3v3',
  mail: 'M2 5h20v14H2z M3 6l9 7 9-7',
  torii: 'M2 4q10 3 20 0 M2 7h20 M4 12h16 M7 7l-1 14 M17 7l1 14 M12 7v5',
  travel: 'M3 11 21 3l-7 18-3-8z M11 13 21 3',
  close: 'm5 5 14 14 M19 5 5 19',
};
function Icon({ name }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"><path d={strokes[name]}/></svg>;
}

function DestinationCard({ destination, onOpen, onTravel }) {
  const d = destination;
  return <article className="gate-card" data-location={d.id}>
    <img className="gate-card-art" src={d.image} alt="" loading="lazy" decoding="async"/>
    <header><span className="gate-number" style={{backgroundColor: d.color}}>{d.number}</span>
      <span className="gate-icon" aria-hidden="true" style={{color:d.color}}>{LOCATION_SVGS[d.icon]}</span>
      <div><h3>{d.title}</h3><p>{d.subtitle}</p></div>
    </header>
    <p className="gate-description">{d.description}</p>
    <div className="gate-actions"><button className="gate-red" aria-label={'Open ' + d.title + ' section'} onClick={() => onOpen(d.sectionId)}>Open Section <span aria-hidden="true">→</span></button>
      {onTravel && <button aria-label={'Teleport to ' + d.title} onClick={() => onTravel(d.teleportLocationId)}><Icon name="travel"/> Teleport Here</button>}
    </div>
  </article>;
}

export default function EntryGate({ onClose, onOpenModal, onTeleport, embedded = false }) {
  const hero = published?.profile?.hero;
  const dialog = useRef(null);
  const surface = useRef(null);
  const heading = useRef(null);
  const motion = useRef(null);
  const leaving = useRef(false);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  useLayoutEffect(() => {
    const root = dialog.current;
    if (!embedded) {
      root.showModal();
      heading.current.focus({preventScroll:true});
    }
    leaving.current = false;
    const context = gsap.context(() => {
      if (reduced()) return;
      motion.current = gsap.timeline({defaults:{ease:'power2.out'}})
        .from('.gate-dimmer', {opacity:0,duration:.3}, 0)
        .from(surface.current, {opacity:0,duration:.34}, 0)
        .from('.gate-titles,.gate-roles', {opacity:0,y:8,stagger:.07,duration:.4}, .18)
        .from('.gate-copy,.gate-main-actions', {opacity:0,y:5,stagger:.06,duration:.32}, .46)
        .from(embedded ? '.gate-route-stop' : '.gate-card', {opacity:0,y:8,stagger:.045,duration:.28,clearProps:'transform,opacity'}, .68);
    }, root);
    return () => { motion.current?.kill(); context.revert(); if (!embedded) root.close(); };
  }, [embedded]);

  function leave(next, teleport) {
    if (leaving.current) return;
    leaving.current = true;
    motion.current?.kill();
    if (reduced()) { teleport?.(); next(); return; }
    const tl = gsap.timeline({onComplete:next});
    motion.current = tl;
    tl.to(surface.current, {opacity:0,y:3,duration:.17}, 0);
    if (teleport) tl.to('.gate-dimmer', {backgroundColor:'rgba(19,12,16,.9)',duration:.17}, 0).call(teleport);
    tl.to(dialog.current, {opacity:0,duration:teleport ? .25 : .12});
  }
  function open(section) {
    if (embedded) { onOpenModal(section); return; }
    if (section === 'intro') {
      surface.current.scrollTo({top:0,behavior:reduced() ? 'instant' : 'smooth'});
      heading.current.focus({preventScroll:true});
    } else leave(() => onOpenModal(section));
  }
  const cards = entryDestinations.filter(d => d.visible).sort((a,b) => a.order-b.order);
  const Surface = embedded ? 'section' : 'dialog';
  return <Surface className={embedded ? 'entry-gate gate-inline' : 'entry-gate'} ref={dialog} aria-labelledby="entry-heading"
    onCancel={e => { e.preventDefault(); leave(onClose); }}>
    <div className="gate-dimmer" onClick={() => leave(onClose)} aria-hidden="true"/>
    <div className="gate-blossom" aria-hidden="true"/>
    <div className="gate-surface" ref={surface}>
      {!embedded && <div className="gate-close-row"><button className="gate-close" onClick={() => leave(onClose)}><Icon name="close"/> Close</button></div>}
      <header className="gate-hero">
        <div className="gate-hero-art" aria-hidden="true"/>
        <div className="gate-titles"><p className="gate-label">{LOCATION_SVGS['main-street']} Location 01 · Main Entry Gate</p>
          <h1 id="entry-heading" ref={heading} tabIndex={-1}>{hero?.greeting || <>Hello, I’m <span>Ashutosh</span>.</>}</h1></div>
        <div className="gate-roles">{(hero?.roleBadges?.map((label,i)=>[['laptop','layers','target'][i%3],label]) ?? [['laptop','AI/ML Developer'],['layers','Full-Stack Developer'],['target','Problem Solver']]).map(([icon,label]) => <span key={icon}><Icon name={icon}/>{label}</span>)}</div>
        <div className="gate-copy"><blockquote>“{hero?.quote || 'A shinobi of code, building things worth discovering.'}”</blockquote>
          <p>{hero?.introBio || (embedded ? <>Scroll through the <strong>six village destinations</strong> to explore my projects, skills, and experience. Open the menu at Ichiraku Ramen or unroll a mission dossier along the way.</> : <>Welcome to my interactive 3D Hidden Leaf Village portfolio. Walk down the streets of Konoha, interact with familiar shinobi, or travel directly to one of the <strong>six village destinations</strong> to explore my projects, development skills, AI/ML work, and experience.</>)}</p></div>
        <div className="gate-actions gate-main-actions">
          {onClose && <button className="gate-red" onClick={embedded ? onClose : () => leave(onClose)}>{LOCATION_SVGS['main-street']} {embedded ? 'Enter 3D Village' : 'Explore My World'} <span aria-hidden="true">→</span></button>}
          <button onClick={() => open('projects')}><Icon name="layers"/> View My Projects</button>
          <button onClick={() => open('contact')}><Icon name="mail"/> Contact Me</button>
        </div>
      </header>
      <section className="gate-directory" aria-labelledby="gate-directory-title"><h2 id="gate-directory-title"><Icon name="torii"/>Six village destinations — click to visit or explore</h2>
        {embedded ? <nav className="gate-route" aria-label="Jump to a village destination">
          {cards.map(d => <button key={d.id} className="gate-route-stop" onClick={() => open(d.sectionId)}>
            <span className="gate-route-number">{d.number}</span><span>{d.title}</span>
            <span className="gate-route-arrow" aria-hidden="true">↗</span>
          </button>)}
        </nav> : <div className="gate-grid">{cards.map(d => <DestinationCard key={d.id} destination={d} onOpen={open}
          onTravel={onTeleport && (id => leave(onClose, () => onTeleport(id)))}/>)}</div>}
      </section>
    </div>
  </Surface>;
}
