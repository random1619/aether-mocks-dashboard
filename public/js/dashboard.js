// ─── CSS.escape Polyfill ─────────────────────────────────────────────────────
if (typeof CSS === 'undefined' || !CSS.escape) {
    CSS = CSS || {};
    CSS.escape = function(str) {
        return String(str).replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, '\\$1');
    };
}

function encodeHtmlAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Color Theme Definitions ───────────────────────────────────────────────
const themeColors = {
    blue:    { main: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    pink:    { main: '#ec4899', bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
    amber:   { main: '#f59e0b', bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    emerald: { main: '#10b981', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
    violet:  { main: '#8b5cf6', bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
    rose:    { main: '#f43f5e', bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
    teal:    { main: '#14b8a6', bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
    orange:  { main: '#f97316', bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' }
};

const providerThemeMap = {
    'Oliiveboardd':   themeColors.emerald,
    'Oliveboard':     themeColors.emerald,
    'Pundiits':       themeColors.blue,
    'Pundits':        themeColors.blue,
    'The solver':     themeColors.violet,
    'The Solver':     themeColors.violet,
    'English Madhyam':themeColors.amber,
    '360 Mocks':      themeColors.pink,
    'static GK':      themeColors.teal
};

const availableThemeKeys = ['blue', 'pink', 'amber', 'emerald', 'violet', 'rose', 'teal', 'orange'];

let providerColors = {};
let subjectColors  = {};

// ─── Application State ─────────────────────────────────────────────────────
let state = {
    searchQuery:    '',
    provider:       'all',
    subject:        'all',
    category:       'all',
    status:         'all',
    sort:           'name-asc',
    page:           1,
    limit:          60,
    viewMode:       'grid',
    chapterSubject: null,
    completed:      JSON.parse(localStorage.getItem('completedMocks') || '{}')
};

// ─── DOM References ────────────────────────────────────────────────────────
const DOM = {
    search:          document.getElementById('global-search'),
    providers:       document.getElementById('provider-filters'),
    subjects:        document.getElementById('subject-filters'),
    category:        document.getElementById('category-filter'),
    status:          document.getElementById('status-filters'),
    sort:            document.getElementById('sort-select'),
    timerToggle:     document.getElementById('sectional-timer-toggle'),
    grid:            document.getElementById('grid'),
    count:           document.getElementById('results-count'),
    resultsText:     document.getElementById('results-text'),
    loadMoreBtn:     document.getElementById('load-more-btn'),
    loadMoreWrap:    document.getElementById('load-more-wrapper'),
    statTotal:       document.getElementById('hero-total'),
    statCompleted:   document.getElementById('hero-completed'),
    statRemaining:   document.getElementById('hero-remaining'),
    statProgTxt:     document.getElementById('hero-progress-txt'),
    statProgBar:     document.getElementById('hero-progress-bar'),
    viewGrid:        document.getElementById('view-grid-btn'),
    viewRoadmap:     document.getElementById('view-roadmap-btn'),
    
    // Responsive Mobile Elements
    sidebarToggle:   document.getElementById('sidebar-toggle-btn'),
    sidebarOverlay:  document.getElementById('sidebar-overlay'),
    sidebar:         document.getElementById('sidebar')
};

// ─── Color Assignment ──────────────────────────────────────────────────────
function assignColors() {
    const providers = [...new Set(MOCK_DATA.map(m => m.provider))].sort();
    const subjects  = [...new Set(MOCK_DATA.map(m => m.subject))].sort();

    providers.forEach((p, i) => {
        providerColors[p] = providerThemeMap[p] ||
            themeColors[availableThemeKeys[i % availableThemeKeys.length]];
    });

    subjects.forEach((s, i) => {
        const key = availableThemeKeys[(i + 3) % availableThemeKeys.length];
        subjectColors[s] = themeColors[key];
    });
}

// ─── Filter Initialization ─────────────────────────────────────────────────
function initFilters() {
    // Provider pills
    const providers = [...new Set(MOCK_DATA.map(m => m.provider))].sort();
    DOM.providers.innerHTML = `<button class="pill active" data-val="all">All</button>`;
    providers.forEach(p => {
        const c = providerColors[p];
        DOM.providers.innerHTML += `
            <button class="pill" data-val="${p}">
                <div class="color-dot" style="background:${c.main}"></div>${p}
            </button>`;
    });

    // Subject pills
    const subjects = [...new Set(MOCK_DATA.map(m => m.subject))].sort();
    DOM.subjects.innerHTML = `<button class="pill active" data-val="all">All</button>`;
    subjects.forEach(s => {
        const c = subjectColors[s];
        DOM.subjects.innerHTML += `
            <button class="pill" data-val="${s}">
                <div class="color-dot" style="background:${c.main}"></div>${s}
            </button>`;
    });

    // Categories
    const categories = [...new Set(MOCK_DATA.map(m => m.category))].sort();
    categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        DOM.category.appendChild(opt);
    });

    bindEvents();
}

// ─── Mobile Sidebar Helpers ────────────────────────────────────────────────
function closeMobileSidebar() {
    if (DOM.sidebar && DOM.sidebar.classList.contains('active')) {
        DOM.sidebar.classList.remove('active');
        DOM.sidebarOverlay.classList.remove('active');
    }
}

// ─── Event Binding ─────────────────────────────────────────────────────────
function bindEvents() {
    DOM.search.addEventListener('input', e => {
        state.searchQuery = e.target.value.toLowerCase();
        resetAndRender();
    });

    DOM.providers.addEventListener('click', e => {
        const btn = e.target.closest('.pill');
        if (!btn) return;
        Array.from(DOM.providers.children).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.provider = btn.dataset.val;
        resetAndRender();
        closeMobileSidebar();
    });

    DOM.subjects.addEventListener('click', e => {
        const btn = e.target.closest('.pill');
        if (!btn) return;
        Array.from(DOM.subjects.children).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.subject = btn.dataset.val;
        resetAndRender();
        closeMobileSidebar();
    });

    DOM.category.addEventListener('change', e => {
        state.category = e.target.value;
        resetAndRender();
        closeMobileSidebar();
    });

    DOM.sort.addEventListener('change', e => {
        state.sort = e.target.value;
        resetAndRender();
        closeMobileSidebar();
    });

    if (DOM.timerToggle) {
        const savedTimer = localStorage.getItem('sectionalTimerOverride') || 'default';
        DOM.timerToggle.checked = (savedTimer === '10');
        
        DOM.timerToggle.addEventListener('change', e => {
            const val = e.target.checked ? '10' : 'default';
            localStorage.setItem('sectionalTimerOverride', val);
        });
    }

    DOM.status.addEventListener('click', e => {
        const btn = e.target.closest('.status-tab');
        if (!btn) return;
        Array.from(DOM.status.children).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.status = btn.dataset.status;
        resetAndRender();
        closeMobileSidebar();
    });

    DOM.loadMoreBtn.addEventListener('click', () => {
        state.page++;
        render(true);
    });

    DOM.viewGrid.addEventListener('click', () => {
        DOM.viewGrid.classList.add('active');
        DOM.viewRoadmap.classList.remove('active');
        state.viewMode = 'grid';
        resetAndRender();
    });

    DOM.viewRoadmap.addEventListener('click', () => {
        DOM.viewRoadmap.classList.add('active');
        DOM.viewGrid.classList.remove('active');
        state.viewMode = 'roadmap';
        resetAndRender();
    });

    // Mobile Sidebar Drawer bindings
    if (DOM.sidebarToggle) {
        DOM.sidebarToggle.addEventListener('click', () => {
            DOM.sidebar.classList.toggle('active');
            DOM.sidebarOverlay.classList.toggle('active');
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }

    if (DOM.sidebarOverlay) {
        DOM.sidebarOverlay.addEventListener('click', () => {
            closeMobileSidebar();
        });
    }

    // Keyboard Shortcuts (Pressing '/' or 'Cmd+K' / 'Ctrl+K' focuses Search bar)
    document.addEventListener('keydown', e => {
        const active = document.activeElement;
        const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
        
        if (!isInput) {
            if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
                e.preventDefault();
                DOM.search.focus();
                DOM.search.select();
            }
        }
    });

    // Event delegation for completion toggle buttons
    DOM.grid.addEventListener('click', e => {
        const btn = e.target.closest('.toggle-btn, .completion-btn');
        if (btn && btn.dataset.path) {
            toggleComplete(btn.dataset.path);
        }
    });
}

// ─── Toggle Completion ─────────────────────────────────────────────────────
function toggleComplete(path) {
    if (state.completed[path]) {
        delete state.completed[path];
    } else {
        state.completed[path] = true;
    }
    localStorage.setItem('completedMocks', JSON.stringify(state.completed));
    updateStats();

    const grid = document.getElementById('grid');
    if (grid) {
        const btns = grid.querySelectorAll('.toggle-btn, .completion-btn');
        btns.forEach(btn => {
            if (btn.dataset.path === path) {
                if (state.completed[path]) {
                    btn.classList.add('completed');
                    btn.innerHTML = '<i data-lucide="check"></i>';
                } else {
                    btn.classList.remove('completed');
                    btn.innerHTML = '<i data-lucide="square"></i>';
                }
            }
        });
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    if (state.status !== 'all' || state.viewMode === 'roadmap') {
        resetAndRender();
    }
}

window.toggleComplete = toggleComplete;

window.toggleTrack = function(trackId) {
    const el = document.getElementById(trackId);
    if (el) {
        const trackBody = el.querySelector('.track-body');
        const toggleBtn = el.querySelector('.roadmap-track-toggle');
        if (trackBody) {
            trackBody.classList.toggle('collapsed');
            if (toggleBtn) {
                toggleBtn.classList.toggle('expanded');
            }
        }
    }
};

// ─── Mock Track Classification ─────────────────────────────────────────────
function getMockTrack(mock) {
    const cat  = mock.category.toLowerCase();
    const name = mock.name.toLowerCase();
    const subj = mock.subject.toLowerCase();

    if (cat === 'chapter wise pyqs' || cat.includes('chapter') || cat.includes('pyq') ||
        name.includes('chapter') || name.includes('topic wise')) {
        return 'Chapter-wise Mocks';
    }
    if (subj === 'full mock' || cat.includes('full') || name.includes('full') ||
        cat.includes('pre') || name.includes(' pre ') || cat.includes('tier') ||
        name.includes('tier') || name.includes('cgl 2026 pre')) {
        return 'Full Mocks';
    }
    if (subj.startsWith('quant') || cat.includes('quant') || name.includes('quant') ||
        cat.includes('math') || name.includes('math') || /\bcalc\b/.test(name)) {
        return 'Quant Mocks';
    }
    if (subj.startsWith('english') || cat.includes('english') || name.includes('english') ||
        name.includes('vocab') || name.includes('grammar')) {
        return 'English Mocks';
    }
    if (subj.startsWith('reasoning') || cat.includes('reasoning') || name.includes('reasoning') ||
        name.includes('analog') || name.includes('speed')) {
        return 'Reasoning Mocks';
    }
    if (subj === 'general studies' || subj === 'gs' || cat.includes('gs') ||
        name.includes(' gs ') || cat.includes('gk') || name.includes(' gk ') ||
        cat.includes('current affairs') || name.includes('current affairs') ||
        cat.includes('history') || cat.includes('geography') ||
        cat.includes('polity') || cat.includes('science')) {
        return 'GS Mocks';
    }
    return 'General Practice Mocks';
}

function extractChapterName(name) {
    let clean = name.replace(/^Paid\s+/i, '');
    clean = clean.replace(/\s*[-–]?\s*\(?(?:SSC\s+\w+(?:\s+\w+)?(?:\s+\d{4})?|CGL\s+202[0-6]|PRE\s+\d{4}|CHSL|CPO|Selection Post(?:\s+\d{4})?)\)?\s*$/i, '');
    let parts = clean.split(/\b(?:PART|Part|part)\b/i);
    let chap = parts[0].trim().replace(/[\s\-_]+$/, '').trim();
    return chap || 'General Topic';
}

window.setChapterSubject = function(subj) {
    state.chapterSubject = subj;
    render();
};

// ─── Roadmap Rendering ─────────────────────────────────────────────────────
function renderRoadmap(filtered) {
    const tracks = {};
    filtered.forEach(mock => {
        const t = getMockTrack(mock);
        if (!tracks[t]) tracks[t] = [];
        tracks[t].push(mock);
    });

    DOM.grid.innerHTML = '<div class="roadmap-container"></div>';
    const container = DOM.grid.querySelector('.roadmap-container');

    const trackOrder = [
        'Full Mocks', 'Quant Mocks', 'English Mocks',
        'Reasoning Mocks', 'GS Mocks', 'Chapter-wise Mocks', 'General Practice Mocks'
    ];

    const sorted = Object.keys(tracks).sort((a, b) => {
        const ia = trackOrder.indexOf(a);
        const ib = trackOrder.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    if (sorted.length === 0) {
        DOM.grid.innerHTML = buildEmptyState('No tracks found', "We couldn't find any mock tests matching your filters.");
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        return;
    }

    sorted.forEach((trackName, trackIdx) => {
        const mocks = tracks[trackName];
        const done  = mocks.filter(m => state.completed[m.path]).length;
        const pct   = mocks.length ? Math.round((done / mocks.length) * 100) : 0;
        const id    = `track-${trackIdx}`;
        const firstUncompleted = mocks.findIndex(m => !state.completed[m.path]);

        let trackContent = '';

        if (trackName === 'Chapter-wise Mocks') {
            if (!state.chapterSubject) {
                const availableSubjects = [...new Set(mocks.map(m => m.subject))].sort();
                const icons = { 'Quant': 'calculator', 'Reasoning': 'brain', 'English': 'book', 'General Studies': 'globe', 'General': 'graduation-cap' };
                const cards = availableSubjects.map(subj => {
                    const cnt  = mocks.filter(m => m.subject === subj).length;
                    const comp = mocks.filter(m => m.subject === subj && state.completed[m.path]).length;
                    const icon  = icons[subj] || 'graduation-cap';
                    const color = subjectColors[subj] || themeColors.blue;
                    return `
                        <div class="subject-card" onclick="window.setChapterSubject('${subj}')">
                            <div class="subject-card-icon" style="background:${color.bg};color:${color.main}">
                                <i data-lucide="${icon}"></i>
                            </div>
                            <div class="subject-card-title">${subj}</div>
                            <div class="subject-card-count">${comp}/${cnt} Done</div>
                        </div>`;
                }).join('');
                trackContent = `
                    <div class="subject-select-portal">
                        <div class="portal-instruction">Select a subject to view its chapter-wise roadmap:</div>
                        <div class="subject-cards-grid">${cards}</div>
                    </div>`;
            } else {
                const subjectMocks = mocks.filter(m => m.subject === state.chapterSubject);
                const chapters = {};
                subjectMocks.forEach(mock => {
                    const ch = extractChapterName(mock.name);
                    if (!chapters[ch]) chapters[ch] = [];
                    chapters[ch].push(mock);
                });

                const chapList = Object.keys(chapters).sort().map(chapName => {
                    const cMocks = chapters[chapName];
                    const firstUC = cMocks.findIndex(m => !state.completed[m.path]);
                    const steps = cMocks.map((mock, idx) => buildRoadmapStep(mock, idx, firstUC)).join('');
                    return `
                        <div class="chapter-section">
                            <div class="chapter-title">
                                <i data-lucide="book-open"></i> ${chapName} &nbsp;<span style="color:var(--text-muted);font-weight:500;font-size:0.8rem;">(${cMocks.length} Mocks)</span>
                            </div>
                            <div style="position:relative;display:flex;flex-direction:column;">
                                <div class="roadmap-timeline"></div>
                                ${steps}
                            </div>
                        </div>`;
                }).join('');

                trackContent = `
                    <div class="chapter-roadmap-header">
                        <button class="back-btn" onclick="window.setChapterSubject(null)">
                            <i data-lucide="arrow-left"></i> Back to Subjects
                        </button>
                        <div class="active-subject-badge">
                            Subject: <strong>${state.chapterSubject}</strong>
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:2rem;">${chapList}</div>`;
            }
        } else {
            const steps = mocks.map((mock, idx) => buildRoadmapStep(mock, idx, firstUncompleted)).join('');
            trackContent = `
                <div style="position:relative;display:flex;flex-direction:column;">
                    <div class="roadmap-timeline"></div>
                    ${steps}
                </div>`;
        }

        const div = document.createElement('div');
        div.className = 'track-section';
        div.id = id;
        div.innerHTML = `
            <div class="track-header" onclick="window.toggleTrack('${id}')">
                <div class="track-header-title">
                    <i data-lucide="git-branch"></i> ${trackName}
                </div>
                <div class="track-header-meta">
                    <div class="track-progress">
                        <div class="track-progress-fill">
                            <div class="track-progress-fill-inner" style="width:${pct}%"></div>
                        </div>
                        <span class="track-progress-text">${done}/${mocks.length} (${pct}%)</span>
                    </div>
                    <div class="roadmap-track-toggle"><i data-lucide="chevron-down"></i></div>
                </div>
            </div>
            <div class="track-body collapsed">${trackContent}</div>
        `;
        container.appendChild(div);
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function buildRoadmapStep(mock, idx, firstUncompletedIdx) {
    const isComp   = !!state.completed[mock.path];
    const isActive = idx === firstUncompletedIdx;
    const pColor   = providerColors[mock.provider];
    const sColor   = subjectColors[mock.subject];

    let stepClass = 'pending';
    let nodeContent = idx + 1;
    if (isComp)        { stepClass = 'completed'; nodeContent = '<i data-lucide="check"></i>'; }
    else if (isActive) { stepClass = 'active';    nodeContent = '<i data-lucide="play"></i>'; }

    const nodeStyle = isActive ? `border-color:${pColor.main};background:${pColor.main};color:white;` : '';

    return `
        <div class="roadmap-step ${stepClass}" data-card-path="${encodeHtmlAttr(mock.path)}">
            <div class="step-indicator" style="${nodeStyle}">${nodeContent}</div>
            <div class="step-content">
                <div class="step-header">
                    <div class="step-name" title="${encodeHtmlAttr(mock.name)}">${mock.name}</div>
                    <div class="step-meta">
                        <span class="provider-badge" style="border-color:${pColor.border};background:${pColor.bg};color:${pColor.text}">
                            <div class="provider-dot" style="background:${pColor.main}"></div>${mock.provider}
                        </span>
                        <span class="subject-badge" style="border-color:${sColor.border};background:${sColor.bg};color:${sColor.text}">${mock.subject}</span>
                        <span><i data-lucide="folder-open"></i> ${mock.category}</span>
                    </div>
                </div>
                <div class="step-action">
                    <button class="completion-btn ${isComp ? 'completed' : ''}"
                            data-path="${encodeHtmlAttr(mock.path)}"
                            title="Toggle Completion">
                        ${isComp ? '<i data-lucide="check"></i>' : '<i data-lucide="square"></i>'}
                    </button>
                    <a href="${encodeHtmlAttr(mock.path)}" target="_blank" class="launch-btn"
                       style="background:linear-gradient(135deg,${pColor.main},${sColor.main})">
                        <i data-lucide="play"></i> Launch
                    </a>
                </div>
            </div>
        </div>`;
}

// ─── Stats Update ──────────────────────────────────────────────────────────
function updateStats() {
    const total     = MOCK_DATA.length;
    const comp      = Object.keys(state.completed).length;
    const remaining = total - comp;
    const pct       = total ? Math.round((comp / total) * 100) : 0;

    DOM.statTotal.textContent     = total.toLocaleString();
    DOM.statCompleted.textContent = comp.toLocaleString();
    DOM.statRemaining.textContent = remaining.toLocaleString();
    DOM.statProgTxt.textContent   = pct + '%';
    DOM.statProgBar.style.width   = pct + '%';
}

// ─── Empty State Helper ────────────────────────────────────────────────────
function buildEmptyState(title, message) {
    return `
        <div class="empty-state">
            <i data-lucide="frown"></i>
            <div class="empty-state-title">${title}</div>
            <div class="empty-state-desc">${message}</div>
        </div>`;
}

// ─── Reset & Render ────────────────────────────────────────────────────────
function resetAndRender() {
    state.page = 1;
    render(false);
}

function render(append = false) {
    let filtered = MOCK_DATA.filter(m => {
        if (state.provider !== 'all' && m.provider !== state.provider) return false;
        if (state.subject  !== 'all' && m.subject  !== state.subject)  return false;
        if (state.category !== 'all' && m.category !== state.category) return false;

        const isComp = !!state.completed[m.path];
        if (state.status === 'completed' && !isComp) return false;
        if (state.status === 'pending'   &&  isComp) return false;

        if (state.searchQuery) {
            const q = state.searchQuery;
            if (!m.name.toLowerCase().includes(q) &&
                !m.category.toLowerCase().includes(q) &&
                !m.provider.toLowerCase().includes(q)) return false;
        }

        return true;
    });

    filtered.sort((a, b) => {
        if (state.sort === 'name-asc')      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        if (state.sort === 'name-desc')     return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
        if (state.sort === 'provider-asc') {
            const d = a.provider.localeCompare(b.provider);
            return d !== 0 ? d : a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        }
        return 0;
    });

    // Update both count displays
    const countText = `${filtered.length.toLocaleString()} mocks`;
    if (DOM.count) DOM.count.textContent = countText;
    if (DOM.resultsText) DOM.resultsText.innerHTML = `Found <strong>${filtered.length.toLocaleString()}</strong> mocks`;

    if (state.viewMode === 'roadmap') {
        DOM.loadMoreWrap.style.display = 'none';
        renderRoadmap(filtered);
        return;
    }

    const end    = state.page * state.limit;
    const sliced = filtered.slice(0, end);

    DOM.loadMoreWrap.style.display = end < filtered.length ? 'flex' : 'none';

    if (!append) DOM.grid.innerHTML = '';

    if (filtered.length === 0) {
        DOM.grid.innerHTML = buildEmptyState(
            'No mocks found',
            "No mock tests match your current filters. Try adjusting your search criteria."
        );
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        return;
    }

    const existing = append
        ? new Set(Array.from(DOM.grid.children).map(c => c.dataset.cardPath))
        : new Set();

    const frag = document.createDocumentFragment();
    let newIndex = 0;

    sliced.forEach(mock => {
        if (existing.has(mock.path)) return;

        const isComp  = !!state.completed[mock.path];
        const pColor  = providerColors[mock.provider];
        const sColor  = subjectColors[mock.subject];
        const track   = getMockTrack(mock);
        const delay   = (newIndex * 0.03).toFixed(2);
        newIndex++;

        const div = document.createElement('div');
        div.className = 'card';
        div.dataset.cardPath = mock.path;
        div.style.animationDelay = `${delay}s`;

        div.innerHTML = `
            <div class="card-accent-bar" style="background:linear-gradient(90deg,${pColor.main},${sColor.main})"></div>
            <div class="card-body">
                <div class="card-badges">
                    <span class="provider-badge"
                          style="border-color:${pColor.border};background:${pColor.bg};color:${pColor.text}">
                        <div class="provider-dot" style="background:${pColor.main}"></div>
                        ${mock.provider}
                    </span>
                    <span class="subject-badge"
                          style="border-color:${sColor.border};background:${sColor.bg};color:${sColor.text}">
                        ${mock.subject}
                    </span>
                </div>
                <h3 class="card-title" title="${encodeHtmlAttr(mock.name)}">${mock.name}</h3>
                <div class="card-meta-row">
                    <span class="card-meta-chip">
                        <i data-lucide="folder-open"></i> ${mock.category}
                    </span>
                    <span class="card-meta-chip">
                        <i data-lucide="git-branch"></i> ${track}
                    </span>
                </div>
            </div>
            <div class="card-footer">
                <button class="completion-btn ${isComp ? 'completed' : ''}"
                        data-path="${encodeHtmlAttr(mock.path)}"
                        title="Toggle Completion">
                    ${isComp ? '<i data-lucide="check"></i>' : '<i data-lucide="square"></i>'}
                </button>
                <a href="${encodeHtmlAttr(mock.path)}" target="_blank" class="launch-btn"
                   style="background:linear-gradient(135deg,${pColor.main},${sColor.main})">
                    <i data-lucide="arrow-right"></i> Start Test
                </a>
            </div>`;

        frag.appendChild(div);
    });

    DOM.grid.appendChild(frag);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ─── Boot ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (typeof MOCK_DATA === 'undefined') {
        console.error('MOCK_DATA not found. Ensure mocks-data.js is loaded before dashboard.js.');
        return;
    }
    assignColors();
    initFilters();
    updateStats();
    render();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
