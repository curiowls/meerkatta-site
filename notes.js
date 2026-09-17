const reader = document.querySelector('[data-notes-reader]');
if (reader) {
  const cards = [...reader.querySelectorAll('[data-note]')];
  const toolbar = reader.querySelector('.notes-toolbar');
  const pagination = reader.querySelector('.notes-pagination');
  const more = reader.querySelector('[data-load-notes]');
  const status = reader.querySelector('[data-notes-status]');
  const buttons = [...reader.querySelectorAll('[data-mode]')];
  const cache = new Map();
  const params = new URLSearchParams(location.search);
  let mode = params.get('mode') === 'read' ? 'read' : 'scan';
  const batch = () => mode === 'read' ? 2 : 6;
  let count = Math.min(cards.length, Math.max(batch(), Math.floor(Number(params.get('notes'))) || batch()));
  let revision = 0;
  toolbar.hidden = pagination.hidden = false;

  async function load(card) {
    if (card.dataset.loaded) return;
    const body = card.querySelector('.note-body');
    const url = card.querySelector('.note-permalink').getAttribute('href');
    body.textContent = 'Loading note…';
    body.setAttribute('aria-busy','true');
    try {
      if (!cache.has(url)) cache.set(url, fetch(url).then(async response => {
        if (!response.ok) throw new Error('Note unavailable');
        const doc = new DOMParser().parseFromString(await response.text(),'text/html');
        const main = doc.querySelector('main.journal-article');
        if (!main) throw new Error('Note unavailable');
        main.querySelector(':scope > a')?.remove();
        main.querySelector('.eyebrow')?.remove();
        main.querySelector('h1')?.remove();
        main.querySelector('.journal-lede')?.remove();
        // Content comes from our same-origin, authored canonical note.
        main.querySelectorAll('h2').forEach(h => {const h3=doc.createElement('h3');h3.textContent=h.textContent;h.replaceWith(h3);});
        return main.innerHTML;
      }));
      body.innerHTML = await cache.get(url);
      card.dataset.loaded = 'true';
    } catch {
      cache.delete(url);
      body.textContent = 'This note couldn’t load. Open it below, or ';
      const retry = document.createElement('button');
      retry.type='button';retry.textContent='try again';
      retry.addEventListener('click',()=>load(card));body.append(retry);
    } finally { body.removeAttribute('aria-busy'); }
  }
  async function paint({save=true,focusIndex=null}={}) {
    const current = ++revision;
    reader.dataset.mode=mode;
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
    cards.forEach((card,index)=>{
      card.hidden=index>=count;
      card.querySelector('.note-body').hidden=mode!=='read';
    });
    more.hidden=count>=cards.length;
    more.textContent=`Load ${Math.min(batch(),cards.length-count)} more notes`;
    status.textContent=`${Math.min(count,cards.length)} of ${cards.length} notes${count>=cards.length ? ' · You’re all caught up.' : ''}`;
    if(save){const url=new URL(location.href);url.searchParams.set('mode',mode);url.searchParams.set('notes',count);history.replaceState(null,'',url);}
    if(mode==='read') await Promise.all(cards.slice(0,count).map(load));
    if(current===revision&&focusIndex!==null) cards[focusIndex]?.querySelector('h2').focus({preventScroll:true});
  }
  buttons.forEach(button=>button.addEventListener('click',()=>{
    if(mode===button.dataset.mode)return;
    const currentCard=cards.find(card=>!card.hidden&&card.getBoundingClientRect().bottom>180);
    const preserve=reader.getBoundingClientRect().top<80;
    mode=button.dataset.mode;
    count=Math.min(cards.length,Math.max(batch(),preserve ? cards.indexOf(currentCard)+1 : 0));
    const selectedMode=mode;
    paint().then(()=>{if(mode===selectedMode&&preserve&&currentCard)currentCard.scrollIntoView({block:'start'});});
  }));
  more.addEventListener('click',()=>{const first=count;count=Math.min(cards.length,count+batch());paint({focusIndex:first});});
  paint({save:false});
}
