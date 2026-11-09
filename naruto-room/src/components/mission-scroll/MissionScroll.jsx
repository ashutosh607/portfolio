import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { listMissions, certificatesFor } from '../../data/missionRepository';
import { CertificateViewer, MissionCard, MissionDetail } from './Dossier';
import './mission-scroll.css';

const tabs = [['all', 'All Missions'], ['freelance', 'Freelance Projects'], ['hackathon', 'Hackathons'], ['internship', 'Internships']];
const board = { id: null, certificate: null };

function LeafSeal() {
  return <svg aria-hidden="true" viewBox="0 0 54 45" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
    <path d="M6 36 18 13C25 1 42 5 42 19c0 13-18 19-23 8-4-9 10-15 13-7 2 5-4 6-6 4M37 9l10-6M6 36l15-3"/>
  </svg>;
}

export default function MissionScroll({ onClose, onContact, embedded = false }) {
  const [records, setRecords] = useState(null);
  useEffect(() => {
    let active = true;
    listMissions().then(data => { if (active) setRecords(data); });
    return () => { active = false; };
  }, []);
  return records && <LoadedScroll embedded={embedded} records={records} onClose={onClose} onContact={onContact}/>;
}

function LoadedScroll({ records, onClose, onContact, embedded }) {
  const root = useRef(null);
  const timeline = useRef(null);
  const panel = useRef(null);
  const filterTween = useRef(null);
  const finish = useRef(onClose);
  const locked = useRef(false);
  const [phase, setPhase] = useState('closed');
  const [tab, setTab] = useState('all');
  const [view, setView] = useState(() => (!embedded && history.state?.missionScroll) || board);
  const mission = records.find(record => record.id === view.id);
  const certificates = mission ? certificatesFor(mission) : [];
  const hasPreview = view.certificate != null && Boolean(certificates[view.certificate]);
  const back = useCallback(() => {
    if (embedded) {
      setView(current => current.certificate != null ? { ...current, certificate: null } : board);
      return;
    }
    if (locked.current) return;
    locked.current = true;
    history.back();
  }, [embedded]);
  function navigate(next, replace = false) {
    if (!embedded) history[replace ? 'replaceState' : 'pushState']({ ...history.state, missionScroll: next }, '');
    setView(next);
  }

  useLayoutEffect(() => {
    const dialog = root.current;
    if (!embedded) dialog.showModal();
    if (!embedded && !history.state?.missionScroll) history.pushState({ ...history.state, missionScroll: board }, '');
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: embedded,
        onComplete: () => setPhase('open'),
        onReverseComplete: () => { setPhase('closed'); finish.current(); },
      });
      timeline.current = tl;
      setPhase('opening');
      tl.from('.ms-scene', { opacity: 0, duration: .55 }, 0)
        .from('.ms-bundle', { opacity: 0, y: 25, scale: .94, rotation: -2, duration: .6, ease: 'power3.out' }, 0)
        .to('.ms-cord', { rotation: 9, y: 5, duration: .25 }, .6)
        .to('.ms-medallion', { y: -9, rotation: -8, duration: .32 }, .67)
        .to('.ms-binding', { opacity: 0, duration: .25 }, .84)
        .to('.ms-bundle', { clipPath: 'inset(0 48% 0 48%)', opacity: 0, duration: .3 }, 1.05)
        .from('.ms-rail', { opacity: 0, duration: .24 }, 1.05)
        .fromTo('.ms-left', { xPercent: 0 }, { xPercent: -100, ease: 'power2.inOut', duration: 1.7 }, 1.1)
        .fromTo('.ms-right', { xPercent: 0 }, { xPercent: 100, ease: 'power2.inOut', duration: 1.7 }, 1.1)
        .fromTo('.ms-paper', { clipPath: 'inset(0 50%)' }, { clipPath: 'inset(0 0%)', ease: 'power2.inOut', duration: 1.7 }, 1.1)
        .fromTo('.ms-spindle', { backgroundPositionX: '0px, 0px, 0px' }, { backgroundPositionX: '0px, 18px, 0px', duration: 1.7 }, 1.1)
        .from('.ms-heading, .ms-tabs, .ms-list', { opacity: 0, y: 7, stagger: .08, duration: .36 }, 2.8);
      if (dialog.querySelector('.ms-card')) {
        tl.from('.ms-card', { opacity: 0, y: 6, stagger: { amount: .16 }, duration: .3 }, 2.98);
      }
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) tl.timeScale(100);
    }, dialog);
    const pop = event => {
      if (event.state?.missionScroll) {
        locked.current = false;
        setView(event.state.missionScroll);
        if (timeline.current.reversed()) { setPhase('opening'); timeline.current.play(); }
      } else {
        locked.current = true;
        setPhase('closing');
        timeline.current.reverse();
      }
    };
    let observer;
    if (embedded) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          timeline.current.play();
          observer.disconnect();
        }
      }, { threshold: 0.08 });
      observer.observe(dialog);
    } else window.addEventListener('popstate', pop);
    return () => {
      window.removeEventListener('popstate', pop);
      filterTween.current?.kill();
      ctx.revert();
      observer?.disconnect();
      if (!embedded) dialog.close();
    };
  }, [embedded]);

  useLayoutEffect(() => {
    if (view.id) root.current.querySelector('[data-detail-close]')?.focus();
    if (panel.current) panel.current.scrollTop = 0;
  }, [view, tab]);

  function filter(id) {
    if (id === tab || filterTween.current?.isActive()) return;
    const list = panel.current;
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .13;
    filterTween.current = gsap.timeline().to(list, { opacity: 0, duration })
      .call(() => setTab(id)).to(list, { opacity: 1, duration });
  }
  const visible = records.filter(record => tab === 'all' || record.type === tab);
  const Surface = embedded ? 'section' : 'dialog';
  return <Surface ref={root} className={embedded ? 'ms-root ms-inline' : 'ms-root'}
    onKeyDown={event => { if (embedded && view.id && event.key === 'Escape') back(); }} aria-label="Konoha Mission Board" data-phase={phase}
    onCancel={event => { event.preventDefault(); back(); }}>
    <div className="ms-scene"/>
    <button hidden={embedded} className="ms-close" autoFocus={!embedded} onClick={back} disabled={phase === 'closing'}>× <span>Close</span></button>
    <div className="ms-stage">
      <div className="ms-bundle" aria-hidden="true"><div className="ms-binding"><i className="ms-cord"/><b className="ms-medallion"><LeafSeal/></b></div></div>
      <div className="ms-paper" inert={phase !== 'open'}>
        <div className="ms-interior">
          <div hidden={!!mission} className="ms-index">
            <header className="ms-heading"><div className="ms-imprint"><LeafSeal/><small>Location 05 · Konoha Mission Board</small></div>
              <h1>Experience <em>&amp;</em> Mission Dossiers</h1>
              <p>A record of my real-world work, hackathons, and professional experiences.</p></header>
            <nav className="ms-tabs" aria-label="Mission categories">{tabs.map(([id,label]) => <button key={id} aria-pressed={id === tab}
              onClick={() => filter(id)}>{label} <span>{id === 'all' ? records.length : records.filter(r => r.type === id).length}</span></button>)}</nav>
            <div className="ms-list" ref={panel}>{visible.map(record => <MissionCard key={record.id} mission={record}
              onDetail={() => navigate({id: record.id, certificate: null})} onContact={() => { if (embedded) onContact(); else { finish.current = onContact; back(); } }}/>)}</div>
          </div>
          {mission && (!hasPreview ? <div className="ms-detailwrap">
            <button data-detail-close onClick={back}>← All dossiers</button>
            <MissionDetail mission={mission} onPreview={certificate => navigate({...view, certificate})}/></div> :
            <CertificateViewer key={view.certificate} items={certificates} index={view.certificate} onClose={back}
              onChange={certificate => navigate({...view, certificate}, true)}/>)}
        </div>
      </div>
      {['left','right'].map(side => <div aria-hidden="true" key={side} className={'ms-rail ms-' + side}><i className="ms-spindle"/></div>)}
    </div>
    <button className="ms-return" hidden={embedded || !!mission} onClick={back} disabled={phase !== 'open'}>← Return to Village</button>
  </Surface>;
}
