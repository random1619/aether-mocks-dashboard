/**
 * Aether Mocks — Provider Page Engine
 * Shared filtering, search, pagination and completion state
 * for all dedicated provider portal pages.
 */
'use strict';

function htmlEnc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

class ProviderPage {
    /**
     * @param {Object} opts
     * @param {string}   opts.providerKey   - Exact provider string in MOCK_DATA
     * @param {number}   [opts.limit=60]    - Cards per page
     * @param {Function} opts.onUpdate      - Called with ({ mocks, total, hasMore, stats, append })
     */
    constructor({ providerKey, limit = 60, onUpdate }) {
        this.providerKey = providerKey;
        this.limit       = limit;
        this.onUpdate    = onUpdate;

        this.completed = JSON.parse(localStorage.getItem('completedMocks') || '{}');

        this._state = { q: '', category: 'all', subject: 'all', sort: 'name-asc', page: 1 };

        if (typeof MOCK_DATA === 'undefined') {
            console.error('[ProviderPage] MOCK_DATA not loaded.');
            this._all = [];
        } else {
            this._all = MOCK_DATA.filter(m => m.provider === providerKey);
        }

        // Derived options
        this.categories = [...new Set(this._all.map(m => m.category))].sort();
        this.subjects   = [...new Set(this._all.map(m => m.subject))].sort();
    }

    // ── Public API ────────────────────────────────────────────
    stats() {
        const total = this._all.length;
        const done  = this._all.filter(m => this.completed[m.path]).length;
        return { total, done, pending: total - done, pct: total ? Math.round(done / total * 100) : 0 };
    }

    search(q)   { this._state.q        = q.toLowerCase().trim(); this._go(); }
    category(c) { this._state.category = c; this._go(); }
    subject(s)  { this._state.subject  = s; this._go(); }
    sort(s)     { this._state.sort     = s; this._go(); }
    more()      { this._state.page++;       this._emit(true); }
    refresh()   { this._emit(false); }

    toggle(path) {
        if (this.completed[path]) delete this.completed[path];
        else this.completed[path] = true;
        localStorage.setItem('completedMocks', JSON.stringify(this.completed));
        return !!this.completed[path];
    }

    isDone(path) { return !!this.completed[path]; }

    // ── Internals ─────────────────────────────────────────────
    _filtered() {
        const { q, category, subject, sort } = this._state;
        let m = this._all;
        if (category !== 'all') m = m.filter(x => x.category === category);
        if (subject  !== 'all') m = m.filter(x => x.subject  === subject);
        if (q) m = m.filter(x =>
            x.name.toLowerCase().includes(q) ||
            x.category.toLowerCase().includes(q) ||
            x.subject.toLowerCase().includes(q)
        );
        return [...m].sort((a, b) => sort === 'name-desc'
            ? b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' })
            : a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        );
    }

    _go()  { this._state.page = 1; this._emit(false); }

    _emit(append) {
        const filtered = this._filtered();
        const end      = this._state.page * this.limit;
        const slice    = filtered.slice(0, end);
        const hasMore  = end < filtered.length;
        if (this.onUpdate) {
            this.onUpdate({ mocks: slice, total: filtered.length, hasMore, stats: this.stats(), append });
        }
    }
}

window.ProviderPage = ProviderPage;
window.htmlEnc = htmlEnc;
