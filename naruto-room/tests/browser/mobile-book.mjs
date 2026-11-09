import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { setTimeout as sleep } from 'node:timers/promises';
import assert from 'node:assert/strict';

async function testBook() {
  const profile = await mkdtemp(join(tmpdir(), 'shinobi-chrome-'));
  const browser = spawn(
    process.env.CMS_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    [
      '--headless=new',
      '--enable-unsafe-swiftshader',
      '--use-angle=swiftshader',
      '--no-first-run',
      '--disable-background-networking',
      '--remote-debugging-port=9594',
      '--user-data-dir=' + profile,
      'about:blank',
    ],
    { windowsHide: true, stdio: 'ignore' },
  );
  let socket;
  try {
    let page;
    for (let i = 0; i < 80 && !page; i++) {
      try {
        page = (await (await fetch('http://127.0.0.1:9594/json/list')).json()).find((p) => p.type === 'page');
      } catch {}
      await sleep(100);
    }
    socket = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((r) => (socket.onopen = r));
    let sequence = 0;
    const pending = new Map(),
      errors = [];
    socket.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id) {
        pending.get(m.id)?.(m.result);
        pending.delete(m.id);
      }
      if(m.method==='Runtime.consoleAPICalled' && m.params.type==='error') errors.push(m.params.args.map(a=>a.value || a.description).join(' '));
      if (m.method === 'Runtime.exceptionThrown')
        errors.push(m.params.exceptionDetails.exception?.description);
    };
    const call = (method, params = {}) =>
      new Promise((resolve) => {
        const id = ++sequence;
        pending.set(id, resolve);
        socket.send(JSON.stringify({ id, method, params }));
      });
    const run = async (expression) => {
      const out = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (!out) return undefined;
      if (out.exceptionDetails)
        throw Error(out.exceptionDetails.exception?.description || out.exceptionDetails.text);
      return out.result.value;
    };
    const check = async (expression) => {
      for (let i = 0; i < 100; i++) {
        if (await run('Boolean(' + expression + ')')) return;
        await sleep(120);
      }
      throw Error(
        'Browser check failed: ' + expression + ' ' + (await run('document.body.innerText.slice(0,200)')),
      );
    };

    const base=process.env.BOOK_BASE || 'http://localhost:5173';
    const size=(width,height)=>call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    const state=name=>check("document.querySelector('.ramen-book-container.state-"+name+"') && document.querySelector('.ramen-inline')?.getAttribute('aria-busy')==='false'");
    const current='.book-interior-spread .book-spread.is-current ';
    const click=sel=>run('document.querySelector('+JSON.stringify(sel)+').click()');
    const shot=async name=>{await run("document.querySelector('.ramen-inline').scrollIntoView({block:'center',behavior:'instant'})");await sleep(60);return writeFile(join(tmpdir(),'ichiraku-mobile-'+name+'.png'),Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'))};
    const tap=async(sel,touch)=>{
      await run(`(()=>{const el=document.querySelector(${JSON.stringify(sel)}),r=el.getBoundingClientRect();if(!el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)))el.scrollIntoView({block:'center',behavior:'instant'})})()`);
      await sleep(50);
      const pt=await run(`(()=>{const el=document.querySelector(${JSON.stringify(sel)});const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
      if(touch){
        await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[pt]});
        await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      }else{
        for(const type of ['mousePressed','mouseReleased'])await call('Input.dispatchMouseEvent',{type,...pt,button:'left',clickCount:1});
      }
    };
    await call('Runtime.enable'); await size(1440,900);
    await call('Page.navigate',{url:base});await check("document.querySelector('[title*=\"2D Classic\"]') || document.querySelector('.p2d-root')");
    await run("document.querySelector('[title*=\"2D Classic\"]')?.click()");
    await check("document.querySelector('.ramen-inline')");
    await call('Emulation.setTouchEmulationEnabled',{enabled:true});
    await run("(async()=>{const url=performance.getEntriesByType('resource').find(e=>/\\/gsap\\.js/.test(e.name)).name;window.testGsap=(await import(url)).gsap})()");
    const freezeAt=async(cls,position)=>{
      await check("document.querySelector('.ramen-book-container.state-"+cls+"')");
      const result=await run(`(()=>{const g=window.testGsap, cover=document.querySelector('.ramen-inline .book-front-cover-leaf');
        const animation=${JSON.stringify(cls)}==='turning-mobile' ? g.globalTimeline.getChildren(true,true,false).find(t=>t.vars.progress!==undefined && t.vars.onUpdate && t.isActive()) : g.getTweensOf(cover,true)[0]?.parent;
        if(animation){animation.pause().progress(${position});window.testPaused=animation;return true}return false})()`);
      assert.ok(result,'could not capture '+cls);
    };
    const resume=()=>run("window.testPaused?.resume();window.testPaused=null");
    for(const width of (process.env.BOOK_CAPTURE_ONLY ? [390] : [390,320,360,375,414,440,768,1440])){
      const mobile=width<=860;
      await size(width,width===320?568:width===1440?900:844);await sleep(300);
      if(width===390){
        await tap('.p2d-mobile-menu-btn',true);await check("document.querySelector('.p2d-mobile-drawer')");
        await run("[...document.querySelectorAll('.p2d-mobile-nav-item')].find(b=>b.textContent.includes('Projects')).click()");await sleep(1000);
        await check("!document.querySelector('.p2d-mobile-drawer') && document.querySelector('.p2d-nav-item.is-active').textContent.includes('Projects')");
      }
      await run("document.querySelector('.ramen-inline').scrollIntoView({behavior:'instant',block:'center'})");await sleep(200);
      // Desktop embedded books may intentionally open when the scene first enters view.
      if(!mobile && await run("!!document.querySelector('.ramen-book-container.state-open')")){await click('.ramen-menu-close-trigger');await state('closed')}
      await state('closed');
      const rect=()=>run("JSON.stringify([...['.ramen-inline','.ramen-book-container','#p2d-about'].map(sel=>{const r=document.querySelector(sel).getBoundingClientRect();return [Math.round(r.top-document.querySelector('.ramen-inline').getBoundingClientRect().top),r.height]})])");
      const before=await rect();
      if(width===390)await shot('closed');
      await tap('.cover-open-trigger-btn',mobile);
      if(width===390){await freezeAt('opening',.48);assert.ok(await run("getComputedStyle(document.querySelector('.book-front-cover-leaf')).transform.startsWith('matrix3d')"));await shot('opening');await resume()}
      await state('open');if(width===390)await shot('open');
      assert.equal(await rect(),before,'layout shifted at '+width);
      assert.ok(await run("document.querySelector('.portfolio-2d-wrapper').scrollWidth <= innerWidth"),'overflow '+width);
      const total=await run("document.querySelectorAll('.book-interior-spread > [data-spread]').length");
      for(const direction of [1,-1]) for(let step=1;step<total;step++){
        const button=current+'.page-left .page-footer-nav button:'+(direction>0?'last-child':'first-child');
        await tap(button,mobile);
        if(step===1 && direction===1){await click(button);if(width===390){await freezeAt('turning-mobile',.32);await shot('turning');await resume()}}
        await state('open');assert.equal(await run("Number(document.querySelector('.book-spread.is-current').dataset.spread)"),direction>0?step+1:total-step);
      }
      await tap(current+'.menu-dish-item',mobile);await state('open');
      if(mobile){await check("document.querySelector('.mobile-detail-active')");await tap(current+'.page-right .mobile-back-action-btn',true);await state('open');assert.ok(await run("!document.querySelector('.mobile-detail-active')"))}
      await tap('.ramen-menu-close-trigger',mobile);if(width===390){await freezeAt('closing',.5);await shot('closing');await resume()}await state('closed');
      await tap('.cover-open-trigger-btn',mobile);await state('open');await click('.ramen-menu-close-trigger');await state('closed');
      console.log('PASS open, all pages both directions, details, rapid taps, close/reopen, stable layout',width,total);
    }
    await size(390,844);await sleep(200);await click('.cover-open-trigger-btn');await state('open');
    await click(current+'.page-footer-nav button:last-child');await size(414,844);await state('open');
    assert.equal(await run("Number(document.querySelector('.book-spread.is-current').dataset.spread)"),2);
    await run("document.querySelector('.ramen-inline').scrollIntoView({block:'center',behavior:'instant'})");
    const swipe=async(dx,dy)=>{
      const start=await run("(()=>{const r=document.querySelector('.book-spread.is-current .page-left h2').getBoundingClientRect();return {x:r.x+r.width*.75,y:r.y+r.height/2}})()");
      await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
      for(let i=1;i<=5;i++){await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+dx*i/5,y:start.y+dy*i/5}]});await sleep(25)}
      await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    };
    await swipe(-110,3);await state('open');assert.equal(await run("Number(document.querySelector('.book-spread.is-current').dataset.spread)"),3);
    const beforePan=await run("document.querySelector('.portfolio-2d-wrapper').scrollTop");
    await swipe(1,-85);await sleep(450);
    assert.ok(await run("document.querySelector('.portfolio-2d-wrapper').scrollTop")>beforePan);
    console.log('PASS horizontal swipe and native vertical scrolling');
    await click('.ramen-menu-close-trigger');await state('closed');
    await size(390,844);await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await click('.cover-open-trigger-btn');await state('open');await click(current+'.page-footer-nav button:last-child');await state('open');assert.ok(await run("!document.querySelector('.ramen-sheet-panel')"));
    await size(1100,800);await sleep(250);await state('open');
    assert.deepEqual(errors,[]);console.log('PASS reduced motion, responsive open state, zero uncaught exceptions');
  } finally {
    socket?.close(); if(browser.exitCode===null){const ended=once(browser,'exit');browser.kill();await ended}
    await rm(profile,{recursive:true,force:true,maxRetries:4,retryDelay:150}).catch(()=>{});
  }
}
await testBook();
