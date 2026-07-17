(function(){
  const STORAGE_KEY = 'todo-app-v1';
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const state = {
    tasks: [],
    filter: 'all',
    search: '',
    theme: localStorage.getItem('theme') || 'light'
  };

  const nowDateStr = () => new Date().toISOString().slice(0,10);
  const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

  function load(){
    try { const raw = localStorage.getItem(STORAGE_KEY); if(raw){ state.tasks = JSON.parse(raw); } }
    catch(e){ console.error('Load error', e); state.tasks = []; }
    document.documentElement.setAttribute('data-theme', state.theme);
  }
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks)); }

  function addTask({title, dueDate, priority, important}){
    const t = {
      id: uid(),
      title: title.trim(),
      dueDate: dueDate || '',
      priority: priority || 'medium',
      important: !!important,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: state.tasks.length
    };
    state.tasks.push(t); save(); render();
  }
  function updateTask(id, patch){
    const t = state.tasks.find(x=>x.id===id); if(!t) return;
    Object.assign(t, patch, {updatedAt: Date.now()}); save(); render();
  }
  function deleteTask(id){ state.tasks = state.tasks.filter(x=>x.id!==id); resequence(); save(); render(); }
  function toggleComplete(id){ const t = state.tasks.find(x=>x.id===id); if(!t) return; t.completed=!t.completed; t.updatedAt=Date.now(); save(); render(); }
  function resequence(){ state.tasks.forEach((t,i)=>t.order=i); }

  function matchesFilter(t){
    const today = nowDateStr();
    switch(state.filter){
      case 'active': return !t.completed;
      case 'completed': return t.completed;
      case 'important': return t.important;
      case 'today': return t.dueDate === today;
      case 'overdue': return !!t.dueDate && t.dueDate < today && !t.completed;
      default: return true;
    }
  }
  function matchesSearch(t){
    if(!state.search) return true;
    const q = state.search.toLowerCase();
    return (t.title||'').toLowerCase().includes(q);
  }

  function render(){
    const list = $('#taskList'); list.innerHTML='';
    const filtered = state.tasks.slice().sort((a,b)=>a.order-b.order).filter(t=>matchesFilter(t)&&matchesSearch(t));
    filtered.forEach((t,i)=>list.appendChild(renderItem(t,i)));
    const total = state.tasks.length;
    const active = state.tasks.filter(t=>!t.completed).length;
    const completed = total - active;
    $('#counts').textContent = `${active} active · ${completed} completed · ${total} total`;
    // Update filter button selection
    $$('.filter').forEach(b=>b.setAttribute('aria-selected', b.dataset.filter===state.filter ? 'true':'false'));
  }

  function renderItem(t,i){
    const li = document.createElement('li');
    li.className = 'task-item'; li.setAttribute('role','listitem');
    li.dataset.id = t.id; li.draggable = true;
    li.style.setProperty('--i', i);

    const cb = document.createElement('input'); cb.type='checkbox'; cb.checked=t.completed; cb.title='Mark complete'; cb.addEventListener('change', ()=>toggleComplete(t.id));

    const mid = document.createElement('div');
    const title = document.createElement('div'); title.className='task-title'; title.textContent = t.title; title.setAttribute('tabindex','0');
    title.addEventListener('dblclick', ()=>enableEdit(title, t));
    title.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); enableEdit(title,t); }});

    const badges = document.createElement('div'); badges.className='badges';
    const pr = document.createElement('span'); pr.className = `badge priority-${t.priority}`; pr.textContent = `Priority: ${capitalize(t.priority)}`; badges.appendChild(pr);
    if(t.dueDate){
      const today = nowDateStr();
      const due = document.createElement('span');
      const cls = t.dueDate < today && !t.completed ? 'overdue' : (t.dueDate===today ? 'today' : '');
      due.className = `badge ${cls}`; due.textContent = `Due: ${t.dueDate}`; badges.appendChild(due);
    }
    if(t.important){ const imp = document.createElement('span'); imp.className='badge'; imp.textContent='★ Important'; badges.appendChild(imp); }

    mid.appendChild(title); mid.appendChild(badges);

    const actions = document.createElement('div'); actions.className='item-actions';
    const importantBtn = button('★', 'Toggle important', ()=>updateTask(t.id,{important:!t.important}));
    const editBtn = button('✎', 'Edit title', ()=>enableEdit(title,t));
    const dateInput = document.createElement('input'); dateInput.type='date'; dateInput.value=t.dueDate||''; dateInput.title='Set due date'; dateInput.className='input';
    dateInput.addEventListener('change', ()=>updateTask(t.id,{dueDate:dateInput.value}));
    const prioritySel = document.createElement('select'); prioritySel.className='input'; ['low','medium','high'].forEach(p=>{
      const o=document.createElement('option'); o.value=p; o.textContent=capitalize(p); if(t.priority===p) o.selected=true; prioritySel.appendChild(o);
    });
    prioritySel.addEventListener('change', ()=>updateTask(t.id,{priority:prioritySel.value}));
    const delBtn = button('🗑', 'Delete', ()=>deleteTask(t.id));
    const drag = document.createElement('span'); drag.textContent='↕'; drag.className='icon-btn drag'; drag.title='Drag to reorder';

    actions.appendChild(importantBtn); actions.appendChild(editBtn); actions.appendChild(dateInput); actions.appendChild(prioritySel); actions.appendChild(delBtn); actions.appendChild(drag);

    li.appendChild(cb); li.appendChild(mid); li.appendChild(actions);

    // Drag and drop
    li.addEventListener('dragstart', onDragStart);
    li.addEventListener('dragover', onDragOver);
    li.addEventListener('drop', onDrop);

    return li;
  }

  function button(text, title, handler){
    const b = document.createElement('button'); b.className='icon-btn'; b.textContent=text; b.title=title; b.addEventListener('click', handler); return b;
  }
  function capitalize(s){ return s[0].toUpperCase()+s.slice(1); }

  function enableEdit(titleEl, t){
    titleEl.setAttribute('contenteditable','true'); titleEl.focus();
    const sel = window.getSelection(); sel.selectAllChildren(titleEl); sel.collapseToEnd();
    function finish(saveIt){
      titleEl.removeAttribute('contenteditable');
      titleEl.removeEventListener('blur', onBlur);
      titleEl.removeEventListener('keydown', onKey);
      if(saveIt){ const newVal = titleEl.textContent.trim(); if(newVal){ updateTask(t.id,{title:newVal}); } else { titleEl.textContent=t.title; }}
    }
    function onBlur(){ finish(true); }
    function onKey(e){ if(e.key==='Enter'){ e.preventDefault(); finish(true);} else if(e.key==='Escape'){ e.preventDefault(); titleEl.textContent=t.title; finish(false);} }
    titleEl.addEventListener('blur', onBlur);
    titleEl.addEventListener('keydown', onKey);
  }

  // Drag and drop handlers
  let dragId = null;
  function onDragStart(e){ dragId = e.currentTarget.dataset.id; e.dataTransfer.effectAllowed='move'; }
  function onDragOver(e){ e.preventDefault(); e.dataTransfer.dropEffect='move'; }
  function onDrop(e){
    e.preventDefault(); const targetId = e.currentTarget.dataset.id; if(!dragId||dragId===targetId) return;
    const ids = $$('#taskList .task-item').map(el=>el.dataset.id);
    const from = ids.indexOf(dragId); const to = ids.indexOf(targetId);
    const item = state.tasks.splice(from,1)[0]; state.tasks.splice(to,0,item); resequence(); save(); render();
  }

  // UI wiring
  function initUI(){
    $('#themeToggle').addEventListener('click', toggleTheme);
    const addForm = $('#addForm'); const newTitle = $('#newTitle'); const newDue = $('#newDue'); const newPriority = $('#newPriority'); const newImportant = $('#newImportant');
    newImportant.addEventListener('click', ()=>{ const pressed=newImportant.getAttribute('aria-pressed')==='true'; newImportant.setAttribute('aria-pressed', (!pressed).toString()); });
    addForm.addEventListener('submit', (e)=>{
      e.preventDefault(); if(!newTitle.value.trim()) return;
      addTask({ title: newTitle.value, dueDate: newDue.value, priority: newPriority.value, important: newImportant.getAttribute('aria-pressed')==='true' });
      addForm.reset(); newImportant.setAttribute('aria-pressed','false'); newTitle.focus();
    });

    $('#search').addEventListener('input', (e)=>{ state.search = e.target.value; render(); });
    $$('.filter').forEach(b=>b.addEventListener('click', ()=>{ state.filter = b.dataset.filter; render(); }));

    $('#clearCompleted').addEventListener('click', ()=>{ state.tasks = state.tasks.filter(t=>!t.completed); resequence(); save(); render(); });
    $('#deleteAll').addEventListener('click', ()=>{ if(confirm('Delete all tasks?')){ state.tasks=[]; save(); render(); } });
    $('#exportBtn').addEventListener('click', ()=>{
      const blob = new Blob([JSON.stringify(state.tasks,null,2)], {type:'application/json'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'tasks.json'; a.click(); URL.revokeObjectURL(a.href);
    });
    $('#importBtn').addEventListener('click', ()=> $('#importFile').click());
    $('#importFile').addEventListener('change', async (e)=>{
      const file = e.target.files[0]; if(!file) return; const text = await file.text();
      try { const arr = JSON.parse(text); if(Array.isArray(arr)){ state.tasks = arr.map((t,i)=>({ ...t, order: i })); save(); render(); } }
      catch(err){ alert('Invalid JSON file'); }
      e.target.value='';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e)=>{
      if(e.key==='/' && !e.ctrlKey && !e.metaKey){ e.preventDefault(); $('#search').focus(); }
      if(e.key.toLowerCase()==='n'){ $('#newTitle').focus(); }
      if(e.key.toLowerCase()==='d'){ toggleTheme(); }
    });
  }

  function toggleTheme(){
    const seq = ['light','dark','hc'];
    const idx = seq.indexOf(state.theme);
    state.theme = seq[(idx+1)%seq.length];
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
  }

  // Boot
  load(); initUI(); render();
})();