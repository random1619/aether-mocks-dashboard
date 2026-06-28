// Custom Enhancements for SSC Quant Super Practice Quiz
// Author: Antigravity AI
// Designed for premium aesthetics, smoother animations, and interactive elements.

(function() {
    // -------------------------------------------------------------
    // Hooking into TestApp Lifecycle via prototype overrides
    // -------------------------------------------------------------
    
    // Intercept TestApp instantiation to grab the active instance
    if (typeof TestApp !== 'undefined') {
        const OriginalTestApp = TestApp;
        window.TestApp = function() {
            const instance = new OriginalTestApp(...arguments);
            window.testAppInstance = instance;
            return instance;
        };
        window.TestApp.prototype = OriginalTestApp.prototype;
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (typeof TestApp === 'undefined') return;

        const originalInit = TestApp.prototype.init;
        const originalShowResults = TestApp.prototype.showResults;
        const originalLoadQ = TestApp.prototype.loadQ;
        const originalSelOpt = TestApp.prototype.selOpt;

        // Hook: init
        TestApp.prototype.init = function() {
            window.testAppInstance = this;
            originalInit.apply(this, arguments);
            setupCalculator();
            setupMathRendering();
            setupEnhancedAnimations(this);
            setupKeyboardNavigation(this);
            setupSavedMocksUI(this);
        };

        // Hook: showResults
        TestApp.prototype.showResults = function(results) {
            const totalQs = this.qs.length;
            this.els.scoreDisp.textContent = `${results.score}/${totalQs}`;
            
            originalShowResults.apply(this, arguments);
            
            // Fire Confetti!
            triggerConfetti(results);
            
            // Render Dynamic Chart
            renderChart(results);
        };

        // Hook: loadQ
        TestApp.prototype.loadQ = function(idx) {
            const card = document.querySelector('.q-card');
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(10px)';
            }
            
            originalLoadQ.apply(this, arguments);
            
            // Fade in slide animation
            setTimeout(() => {
                if (card) {
                    card.style.transition = 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }
                
                // Rerender KaTeX math expressions in newly loaded content
                if (window.renderMathInElement) {
                    renderMathInElement(document.querySelector('.q-card'), {
                        delimiters: [
                            {left: '$$', right: '$$', display: true},
                            {left: '$', right: '$', display: false},
                            {left: '\\(', right: '\\)', display: false},
                            {left: '\\[', right: '\\]', display: true}
                        ],
                        throwOnError: false
                    });
                }
            }, 50);

            // Inject/update Bookmark/Save button for the current question
            renderBookmarkButton(this, idx);
        };

        // Hook: selOpt to add subtle click bubble effect
        TestApp.prototype.selOpt = function(optIdx, qIdx) {
            originalSelOpt.apply(this, arguments);
            
            const optEl = document.querySelectorAll('.opt')[optIdx];
            if (optEl && !this.sub) {
                // Add pop animation class
                optEl.classList.add('pulse-pop');
                setTimeout(() => optEl.classList.remove('pulse-pop'), 300);
            }
        };

        // Initialize saved mocks welcome screen button
        setupWelcomeScreenSavedMocksBtn();
        // Inject styles
        injectCustomStyles();
    });

    // -------------------------------------------------------------
    // Saved Mocks / Lists Feature Implementation
    // -------------------------------------------------------------
    const DB_KEY = 'custom_mocks_data_v1';

    // Helper: Generate unique question ID
    function getQuestionId(q) {
        let str = q.question + (q.options ? q.options.join('') : '');
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return 'q_' + Math.abs(hash);
    }

    // Helper: Load database from localStorage
    function getDB() {
        let db = localStorage.getItem(DB_KEY);
        if (!db) {
            db = { lists: { "My Bookmarks": [] } };
            localStorage.setItem(DB_KEY, JSON.stringify(db));
            return db;
        }
        try {
            return JSON.parse(db);
        } catch (e) {
            return { lists: { "My Bookmarks": [] } };
        }
    }

    // Helper: Save database to localStorage
    function saveDB(db) {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }

    // Check if question exists in a list
    function isQuestionSavedInList(listName, qId) {
        const db = getDB();
        if (!db.lists[listName]) return false;
        return db.lists[listName].some(q => q.id === qId);
    }

    // Save/Unsave question from a list
    function toggleQuestionInList(listName, q, sourceTopic) {
        const db = getDB();
        if (!db.lists[listName]) {
            db.lists[listName] = [];
        }
        const qId = getQuestionId(q);
        const index = db.lists[listName].findIndex(item => item.id === qId);
        
        if (index > -1) {
            db.lists[listName].splice(index, 1);
            saveDB(db);
            return false; // Removed
        } else {
            db.lists[listName].push({
                id: qId,
                question: q.question,
                options: q.options,
                correct_option_id: q.correct_option_id,
                solution: q.solution,
                comp: q.comp || null,
                source: sourceTopic || document.title || 'Practice Mock',
                savedAt: new Date().toLocaleDateString()
            });
            saveDB(db);
            return true; // Added
        }
    }

    // Render the Bookmark Button inside the language selector bar
    function renderBookmarkButton(appInstance, idx) {
        const langDiv = document.querySelector('.q-card .lang');
        if (!langDiv) return;

        // Check if bookmark button already exists
        let btn = document.getElementById('qBookmarkBtn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'qBookmarkBtn';
            btn.className = 'lang-btn bookmark-btn';
            btn.style.marginLeft = 'auto';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.gap = '6px';
            langDiv.appendChild(btn);
        }

        const q = appInstance.qs[idx];
        const qId = getQuestionId(q);
        const db = getDB();
        
        // Find if this question is saved in ANY list
        let isSavedInAny = false;
        for (const listName in db.lists) {
            if (db.lists[listName].some(item => item.id === qId)) {
                isSavedInAny = true;
                break;
            }
        }

        if (isSavedInAny) {
            btn.innerHTML = '<i class="fas fa-bookmark" style="color: #6366f1;"></i> <span>Saved</span>';
            btn.classList.add('active');
        } else {
            btn.innerHTML = '<i class="far fa-bookmark"></i> <span>Save Question</span>';
            btn.classList.remove('active');
        }

        btn.onclick = (e) => {
            e.stopPropagation();
            openSaveQuestionModal(appInstance, q);
        };
    }

    // Open Modal to choose lists to save this question
    function openSaveQuestionModal(appInstance, q) {
        let modal = document.getElementById('saveQuestionModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'saveQuestionModal';
            modal.className = 'sm-modal sm-mini';
            document.body.appendChild(modal);
        }

        const qId = getQuestionId(q);
        const db = getDB();
        
        let listsHtml = '';
        for (const listName in db.lists) {
            const hasQ = db.lists[listName].some(item => item.id === qId);
            listsHtml += `
                <label class="sm-checkbox-label">
                    <input type="checkbox" data-list="${listName}" ${hasQ ? 'checked' : ''}>
                    <span class="sm-custom-checkbox"></span>
                    <span class="sm-list-text">${listName} (${db.lists[listName].length} qs)</span>
                </label>
            `;
        }

        modal.innerHTML = `
            <div class="sm-modal-content">
                <div class="sm-modal-header">
                    <h3>Save Question to...</h3>
                    <button class="sm-close-btn" id="closeSaveQuestionModal"><i class="fas fa-times"></i></button>
                </div>
                <div class="sm-modal-body">
                    <div class="sm-list-selector">
                        ${listsHtml}
                    </div>
                    <hr class="sm-divider">
                    <div class="sm-create-list-box">
                        <input type="text" id="miniNewListNameInput" placeholder="Or create new list...">
                        <button class="sm-btn sm-btn-p" id="miniCreateListBtn"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('show');

        // Event: Close Modal
        document.getElementById('closeSaveQuestionModal').onclick = () => {
            modal.classList.remove('show');
            renderBookmarkButton(appInstance, appInstance.curQ);
        };

        // Event: Toggle check/uncheck
        modal.querySelectorAll('.sm-list-selector input[type="checkbox"]').forEach(chk => {
            chk.onchange = () => {
                const listName = chk.getAttribute('data-list');
                const sourceTopic = document.querySelector('.welcome-title')?.textContent || document.title;
                toggleQuestionInList(listName, q, sourceTopic);
            };
        });

        // Event: Create list and add
        const miniInput = document.getElementById('miniNewListNameInput');
        const miniCreateBtn = document.getElementById('miniCreateListBtn');
        const createAndAdd = () => {
            const listName = miniInput.value.trim();
            if (!listName) return;
            const currentDb = getDB();
            if (currentDb.lists[listName]) {
                alert('List already exists!');
                return;
            }
            currentDb.lists[listName] = [];
            saveDB(currentDb);
            
            const sourceTopic = document.querySelector('.welcome-title')?.textContent || document.title;
            toggleQuestionInList(listName, q, sourceTopic);
            openSaveQuestionModal(appInstance, q); // Refresh modal
        };

        miniCreateBtn.onclick = createAndAdd;
        miniInput.onkeydown = (e) => {
            if (e.key === 'Enter') createAndAdd();
        };
    }

    // Setup dashboard buttons on both Welcome Screen and Main Header
    function setupWelcomeScreenSavedMocksBtn() {
        const welcomeBtns = document.querySelector('.welcome-buttons');
        if (welcomeBtns && !document.getElementById('openSavedMocksBtn')) {
            const savedBtn = document.createElement('button');
            savedBtn.className = 'welcome-button btn-saved-mocks';
            savedBtn.id = 'openSavedMocksBtn';
            savedBtn.style.background = 'linear-gradient(135deg, #a855f7, #6366f1)';
            savedBtn.style.color = '#fff';
            savedBtn.innerHTML = '<i class="fas fa-folder-open"></i> Saved Mocks / Lists';
            
            const telegramBtn = welcomeBtns.querySelector('.join-channel');
            if (telegramBtn) {
                welcomeBtns.insertBefore(savedBtn, telegramBtn);
            } else {
                welcomeBtns.appendChild(savedBtn);
            }

            savedBtn.onclick = () => openSavedMocksDashboard();
        }
    }

    function setupSavedMocksUI(appInstance) {
        const hdrR = document.querySelector('.hdr-r');
        if (hdrR && !document.getElementById('headerSavedMocksBtn')) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-o btn-sm';
            btn.id = 'headerSavedMocksBtn';
            btn.title = 'Saved Mocks / Lists';
            btn.innerHTML = '<i class="fas fa-folder-open"></i>';
            btn.style.marginRight = '8px';

            const menuBtn = document.getElementById('menuBtn');
            if (menuBtn) {
                hdrR.insertBefore(btn, menuBtn);
            } else {
                hdrR.appendChild(btn);
            }

            btn.onclick = () => openSavedMocksDashboard();
        }
    }

    // Open Saved Mocks Dashboard
    let activeListName = null;
    function openSavedMocksDashboard() {
        let modal = document.getElementById('savedMocksModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'savedMocksModal';
            modal.className = 'sm-modal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="sm-modal-content sm-dashboard">
                <div class="sm-modal-header">
                    <h2><i class="fas fa-folder-open"></i> My Saved Mocks & Lists</h2>
                    <div class="sm-header-actions">
                        <button class="sm-btn sm-btn-o" id="smExportBtn"><i class="fas fa-file-export"></i> Export All</button>
                        <button class="sm-btn sm-btn-o" id="smImportBtn"><i class="fas fa-file-import"></i> Import</button>
                        <button class="sm-close-btn" id="closeSavedMocksModal"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="sm-modal-body">
                    <div class="sm-sidebar">
                        <div class="sm-create-list-box">
                            <input type="text" id="newListNameInput" placeholder="New Mock Name...">
                            <button class="sm-btn sm-btn-p" id="createListBtn"><i class="fas fa-plus"></i></button>
                        </div>
                        <div class="sm-lists-container" id="smListsContainer"></div>
                    </div>
                    <div class="sm-main-content" id="smMainContent"></div>
                </div>
            </div>
        `;

        modal.classList.add('show');

        // Close Event
        document.getElementById('closeSavedMocksModal').onclick = () => {
            modal.classList.remove('show');
            if (window.testAppInstance) {
                renderBookmarkButton(window.testAppInstance, window.testAppInstance.curQ);
            }
        };

        // Render List & Details
        renderDashboardLists();
        renderDashboardMainContent();

        // New list creation event
        const createBtn = document.getElementById('createListBtn');
        const listInput = document.getElementById('newListNameInput');
        const handleCreate = () => {
            const name = listInput.value.trim();
            if (!name) return;
            const db = getDB();
            if (db.lists[name]) {
                alert('List already exists!');
                return;
            }
            db.lists[name] = [];
            saveDB(db);
            listInput.value = '';
            activeListName = name;
            renderDashboardLists();
            renderDashboardMainContent();
        };
        createBtn.onclick = handleCreate;
        listInput.onkeydown = (e) => { if (e.key === 'Enter') handleCreate(); };

        // Export Event
        document.getElementById('smExportBtn').onclick = () => {
            const db = getDB();
            const jsonStr = JSON.stringify(db, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `my_saved_mocks_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };

        // Import Event
        document.getElementById('smImportBtn').onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    try {
                        const imported = JSON.parse(evt.target.result);
                        if (imported && imported.lists) {
                            const db = getDB();
                            db.lists = { ...db.lists, ...imported.lists };
                            saveDB(db);
                            alert('Mocks and lists imported successfully!');
                            renderDashboardLists();
                            renderDashboardMainContent();
                        } else {
                            alert('Invalid file format.');
                        }
                    } catch (err) {
                        alert('Error parsing JSON.');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        };
    }

    function renderDashboardLists() {
        const container = document.getElementById('smListsContainer');
        if (!container) return;
        
        const db = getDB();
        let html = '';
        const keys = Object.keys(db.lists);

        if (keys.length === 0) {
            container.innerHTML = '<div class="sm-empty-text">No custom mocks yet.</div>';
            return;
        }

        if (!activeListName || !db.lists[activeListName]) {
            activeListName = keys[0];
        }

        keys.forEach(name => {
            const count = db.lists[name].length;
            const isActive = name === activeListName ? 'active' : '';
            html += `
                <div class="sm-list-item ${isActive}" data-name="${name}">
                    <div class="sm-list-item-title"><i class="fas fa-list"></i> ${name}</div>
                    <div class="sm-list-item-badge">${count} qs</div>
                </div>
            `;
        });

        container.innerHTML = html;

        container.querySelectorAll('.sm-list-item').forEach(item => {
            item.onclick = () => {
                activeListName = item.getAttribute('data-name');
                renderDashboardLists();
                renderDashboardMainContent();
            };
        });
    }

    function renderDashboardMainContent() {
        const main = document.getElementById('smMainContent');
        if (!main) return;

        const db = getDB();
        if (!activeListName || !db.lists[activeListName]) {
            main.innerHTML = `
                <div class="sm-dashboard-empty">
                    <i class="fas fa-folder-open sm-empty-icon"></i>
                    <h3>No Mock Selected</h3>
                    <p>Select or create a mock list from the sidebar to manage and start customized mock tests.</p>
                </div>
            `;
            return;
        }

        const list = db.lists[activeListName];
        
        let questionsListHtml = '';
        list.forEach((q, i) => {
            // strip HTML for preview
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = q.question;
            let plainText = tempDiv.textContent.replace(/Options:|विकल्प:/gi, '').substring(0, 140);
            if (plainText.length >= 140) plainText += '...';

            questionsListHtml += `
                <div class="sm-question-row" data-id="${q.id}">
                    <div class="sm-question-row-num">${i + 1}</div>
                    <div class="sm-question-row-content">
                        <div class="sm-question-row-preview">${plainText}</div>
                        <div class="sm-question-row-meta">Source: ${q.source} | Added: ${q.savedAt || 'N/A'}</div>
                    </div>
                    <button class="sm-question-row-delete" title="Remove question"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        });

        main.innerHTML = `
            <div class="sm-list-details-header">
                <div>
                    <h2 class="sm-active-list-title">${activeListName}</h2>
                    <p class="sm-active-list-meta">${list.length} questions in this custom mock</p>
                </div>
                <div class="sm-list-actions">
                    <button class="sm-btn sm-btn-p" id="startCustomMockBtn" ${list.length === 0 ? 'disabled' : ''}>
                        <i class="fas fa-play"></i> Take Mock Test
                    </button>
                    <button class="sm-btn sm-btn-o" id="renameListBtn"><i class="fas fa-edit"></i> Rename</button>
                    <button class="sm-btn sm-btn-danger" id="deleteListBtn"><i class="fas fa-trash"></i> Delete Mock</button>
                </div>
            </div>
            
            <div class="sm-questions-list">
                ${list.length === 0 ? `
                    <div class="sm-dashboard-empty">
                        <i class="far fa-sticky-note sm-empty-icon"></i>
                        <h3>Empty Mock</h3>
                        <p>No questions added to this list yet. Browse existing practice sections and use the "Save Question" button to add them here.</p>
                    </div>
                ` : questionsListHtml}
            </div>
        `;

        // Start Mock Event
        const startBtn = document.getElementById('startCustomMockBtn');
        if (startBtn) {
            startBtn.onclick = () => {
                if (window.testAppInstance) {
                    startCustomMock(window.testAppInstance, activeListName, list);
                } else {
                    alert('Error: Quiz engine is not loaded yet.');
                }
            };
        }

        // Rename Event
        document.getElementById('renameListBtn').onclick = () => {
            const newName = prompt('Enter new name for the mock:', activeListName);
            if (!newName || newName.trim() === activeListName) return;
            const trimmed = newName.trim();
            const currentDb = getDB();
            if (currentDb.lists[trimmed]) {
                alert('A list with this name already exists.');
                return;
            }
            currentDb.lists[trimmed] = currentDb.lists[activeListName];
            delete currentDb.lists[activeListName];
            saveDB(currentDb);
            activeListName = trimmed;
            renderDashboardLists();
            renderDashboardMainContent();
        };

        // Delete Event
        document.getElementById('deleteListBtn').onclick = () => {
            if (!confirm(`Are you sure you want to delete the mock "${activeListName}"? This action cannot be undone.`)) return;
            const currentDb = getDB();
            delete currentDb.lists[activeListName];
            saveDB(currentDb);
            activeListName = null;
            renderDashboardLists();
            renderDashboardMainContent();
        };

        // Question Row Delete Event
        main.querySelectorAll('.sm-question-row-delete').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const qId = btn.closest('.sm-question-row').getAttribute('data-id');
                const currentDb = getDB();
                if (currentDb.lists[activeListName]) {
                    currentDb.lists[activeListName] = currentDb.lists[activeListName].filter(q => q.id !== qId);
                    saveDB(currentDb);
                    renderDashboardLists();
                    renderDashboardMainContent();
                }
            };
        });
    }

    // Launch a custom mock test!
    function startCustomMock(appInstance, listName, questions) {
        if (!appInstance.sub && appInstance.curQ > 0) {
            if (!confirm('Starting this mock test will abort your current test session. Do you want to proceed?')) {
                return;
            }
        }

        // Close Dashboard Modal
        document.getElementById('savedMocksModal').classList.remove('show');

        // Stop current timers
        if (appInstance.timer) clearInterval(appInstance.timer);
        if (appInstance.sectionTimer) clearInterval(appInstance.sectionTimer);

        // Load custom questions
        appInstance.qs = JSON.parse(JSON.stringify(questions)); // Deep clone
        appInstance.curQ = 0;
        appInstance.ans = new Array(appInstance.qs.length).fill(null);
        appInstance.reviewed = new Array(appInstance.qs.length).fill(false);
        appInstance.timeSpent = new Array(appInstance.qs.length).fill(0);
        appInstance.sub = false;
        appInstance.sections = null;
        appInstance.timeLeft = appInstance.qs.length * 60; // 1 minute per question
        appInstance.startT = Date.now();

        // Update welcome / title values dynamically
        const welcomeTitle = document.querySelector('.welcome-title');
        if (welcomeTitle) welcomeTitle.textContent = `Custom Mock: ${listName}`;

        const welcomeDetailsVal = document.querySelectorAll('.welcome-detail-value');
        if (welcomeDetailsVal.length >= 5) {
            welcomeDetailsVal[0].textContent = "Saved List"; // Test ID
            welcomeDetailsVal[1].textContent = appInstance.qs.length; // Total Questions
            welcomeDetailsVal[2].textContent = appInstance.qs.length; // Total Marks
            welcomeDetailsVal[3].textContent = `${appInstance.qs.length} minutes`; // Duration
            welcomeDetailsVal[4].textContent = "+1 / -0.25"; // Marking
        }

        // Switch to the main test interface
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('mainTestInterface').style.display = '';

        // Update top center header text to custom mock title
        const headerCenter = document.querySelector('.hdr-c');
        if (headerCenter) headerCenter.textContent = `Custom Mock: ${listName}`;

        // Initialize quiz
        setTimeout(() => {
            appInstance.init();
            // Show submit button, review button (which might have been hidden in submission state)
            const subBtn = document.getElementById('subBtn');
            if (subBtn) subBtn.style.display = '';
            const reviewBtn = document.getElementById('reviewBtn');
            if (reviewBtn) reviewBtn.style.display = '';
        }, 100);
    }

    // -------------------------------------------------------------
    // CSS Injector for Premium Dashboard Aesthetics
    // -------------------------------------------------------------
    function injectCustomStyles() {
        const css = `
            /* Modals background and wrapper */
            .sm-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(8px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .sm-modal.show {
                opacity: 1;
                visibility: visible;
            }
            
            /* Modal Content Card */
            .sm-modal-content {
                background: var(--theme-card, #ffffff);
                border: 1px solid var(--theme-border, #e2e8f0);
                border-radius: 16px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                width: 90%;
                max-width: 900px;
                height: 80vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.95);
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .sm-modal.show .sm-modal-content {
                transform: scale(1);
            }
            
            /* Smaller mini modal */
            .sm-modal.sm-mini .sm-modal-content {
                max-width: 420px;
                height: auto;
                max-height: 80vh;
            }
            
            /* Modal Header */
            .sm-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 24px;
                border-bottom: 1px solid var(--theme-border, #e2e8f0);
                background: var(--theme-card);
            }
            .sm-modal-header h2, .sm-modal-header h3 {
                margin: 0;
                color: var(--theme-text, #0f172a);
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .sm-header-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .sm-close-btn {
                background: none;
                border: none;
                color: var(--theme-text-muted, #64748b);
                font-size: 20px;
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: background-color 0.2s;
            }
            .sm-close-btn:hover {
                background: rgba(100, 116, 139, 0.1);
                color: var(--theme-text);
            }
            
            /* Modal Body Layout */
            .sm-modal-body {
                flex: 1;
                display: flex;
                overflow: hidden;
                padding: 0;
            }
            .sm-modal.sm-mini .sm-modal-body {
                flex-direction: column;
                padding: 20px;
                overflow-y: auto;
            }
            
            /* Sidebar for Lists */
            .sm-sidebar {
                width: 280px;
                border-right: 1px solid var(--theme-border, #e2e8f0);
                display: flex;
                flex-direction: column;
                background: rgba(248, 250, 252, 0.35);
            }
            body.dark-mode .sm-sidebar {
                background: rgba(15, 23, 42, 0.2);
            }
            .sm-create-list-box {
                padding: 16px;
                display: flex;
                gap: 8px;
                border-bottom: 1px solid var(--theme-border, #e2e8f0);
            }
            .sm-create-list-box input {
                flex: 1;
                padding: 8px 12px;
                border-radius: 8px;
                border: 1.5px solid var(--theme-border, #e2e8f0);
                outline: none;
                background: var(--theme-card);
                color: var(--theme-text);
                font-size: 14px;
                transition: border-color 0.2s;
            }
            .sm-create-list-box input:focus {
                border-color: #6366f1;
            }
            .sm-lists-container {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .sm-list-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 14px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            .sm-list-item:hover {
                background: rgba(99, 102, 241, 0.08);
            }
            .sm-list-item.active {
                background: rgba(99, 102, 241, 0.12);
                border-color: rgba(99, 102, 241, 0.25);
            }
            .sm-list-item-title {
                font-weight: 600;
                font-size: 14px;
                color: var(--theme-text);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-right: 8px;
            }
            .sm-list-item-badge {
                font-size: 11px;
                font-weight: 700;
                padding: 2px 8px;
                border-radius: 20px;
                background: var(--theme-border, #e2e8f0);
                color: var(--theme-text-muted);
            }
            .sm-list-item.active .sm-list-item-title {
                color: #6366f1;
            }
            .sm-list-item.active .sm-list-item-badge {
                background: #6366f1;
                color: #fff;
            }
            
            /* Main Content Area */
            .sm-main-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: var(--theme-card);
            }
            .sm-list-details-header {
                padding: 20px 24px;
                border-bottom: 1px solid var(--theme-border, #e2e8f0);
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 16px;
            }
            .sm-active-list-title {
                margin: 0 0 4px 0;
                font-size: 22px;
                font-weight: 850;
                color: var(--theme-text);
            }
            .sm-active-list-meta {
                margin: 0;
                font-size: 13px;
                color: var(--theme-text-muted);
            }
            .sm-list-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            /* Question List Inside Dashboard */
            .sm-questions-list {
                flex: 1;
                overflow-y: auto;
                padding: 20px 24px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .sm-question-row {
                display: flex;
                align-items: center;
                padding: 16px;
                background: var(--theme-card);
                border: 1px solid var(--theme-border);
                border-radius: 12px;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .sm-question-row:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            }
            .sm-question-row-num {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: rgba(99, 102, 241, 0.1);
                color: #6366f1;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 13px;
                margin-right: 16px;
                flex-shrink: 0;
            }
            .sm-question-row-content {
                flex: 1;
                min-width: 0;
            }
            .sm-question-row-preview {
                font-size: 14px;
                color: var(--theme-text);
                margin-bottom: 4px;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .sm-question-row-meta {
                font-size: 11px;
                color: var(--theme-text-muted);
            }
            .sm-question-row-delete {
                background: none;
                border: none;
                color: #f43f5e;
                cursor: pointer;
                padding: 8px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 12px;
                transition: background-color 0.2s;
            }
            .sm-question-row-delete:hover {
                background: rgba(244, 63, 94, 0.1);
            }
            
            /* Empty and Selector UI States */
            .sm-dashboard-empty {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                padding: 40px;
                text-align: center;
                color: var(--theme-text-muted);
            }
            .sm-empty-icon {
                font-size: 48px;
                margin-bottom: 16px;
                color: #6366f1;
                opacity: 0.6;
            }
            .sm-dashboard-empty h3 {
                margin: 0 0 8px 0;
                color: var(--theme-text);
                font-weight: 750;
            }
            .sm-dashboard-empty p {
                margin: 0;
                max-width: 320px;
                font-size: 13px;
                line-height: 1.5;
            }
            
            /* Checkbox list selector for mini modal */
            .sm-list-selector {
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-height: 240px;
                overflow-y: auto;
                padding-right: 4px;
            }
            .sm-checkbox-label {
                display: flex;
                align-items: center;
                position: relative;
                cursor: pointer;
                font-size: 14px;
                font-weight: 550;
                color: var(--theme-text);
                user-select: none;
            }
            .sm-checkbox-label input {
                position: absolute;
                opacity: 0;
                cursor: pointer;
                height: 0;
                width: 0;
            }
            .sm-custom-checkbox {
                height: 18px;
                width: 18px;
                background-color: var(--theme-card);
                border: 1.5px solid var(--theme-border);
                border-radius: 4px;
                margin-right: 12px;
                position: relative;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            .sm-checkbox-label:hover input ~ .sm-custom-checkbox {
                border-color: #6366f1;
            }
            .sm-checkbox-label input:checked ~ .sm-custom-checkbox {
                background-color: #6366f1;
                border-color: #6366f1;
            }
            .sm-custom-checkbox:after {
                content: "";
                position: absolute;
                display: none;
                left: 5px;
                top: 2px;
                width: 5px;
                height: 9px;
                border: solid white;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
            }
            .sm-checkbox-label input:checked ~ .sm-custom-checkbox:after {
                display: block;
            }
            
            /* Buttons general */
            .sm-btn {
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                border: 1.5px solid transparent;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s;
            }
            .sm-btn-p {
                background: #6366f1;
                color: #fff;
            }
            .sm-btn-p:hover:not(:disabled) {
                background: #4f46e5;
                box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.25);
            }
            .sm-btn-o {
                background: transparent;
                border-color: var(--theme-border);
                color: var(--theme-text);
            }
            .sm-btn-o:hover:not(:disabled) {
                background: rgba(100, 116, 139, 0.05);
            }
            .sm-btn-danger {
                background: rgba(244, 63, 94, 0.1);
                color: #f43f5e;
                border-color: rgba(244, 63, 94, 0.2);
            }
            .sm-btn-danger:hover:not(:disabled) {
                background: #f43f5e;
                color: #fff;
            }
            .sm-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .sm-divider {
                border: 0;
                height: 1px;
                background: var(--theme-border);
                margin: 16px 0;
            }
            .sm-empty-text {
                font-size: 13px;
                color: var(--theme-text-muted);
                text-align: center;
                padding: 20px;
            }
            
            /* Animations */
            .pulse-pop {
                animation: popEffect 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            @keyframes popEffect {
                0% { transform: scale(1); }
                50% { transform: scale(0.96); }
                100% { transform: scale(1); }
            }
            
            /* Welcome screen save mock button overrides */
            .welcome-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
                justify-content: center;
                align-items: center;
            }
            .welcome-button.btn-saved-mocks {
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
            }
            .welcome-button.btn-saved-mocks:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
            }
            
            /* Responsive styling for dashboard */
            @media (max-width: 768px) {
                .sm-modal-content.sm-dashboard {
                    width: 95%;
                    height: 90vh;
                }
                .sm-modal-body {
                    flex-direction: column;
                }
                .sm-sidebar {
                    width: 100%;
                    height: 200px;
                    border-right: none;
                    border-bottom: 1px solid var(--theme-border);
                }
                .sm-lists-container {
                    flex-direction: row;
                    overflow-x: auto;
                    overflow-y: hidden;
                    height: 80px;
                }
                .sm-list-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                    padding: 8px 12px;
                    height: 50px;
                }
            }
        `;
        const style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);
    }

    // -------------------------------------------------------------
    // Keyboard Navigation for Premium Desktop feel
    // -------------------------------------------------------------
    function setupKeyboardNavigation(appInstance) {
        document.addEventListener('keydown', (e) => {
            if (appInstance.sub) return;
            
            // Arrow Left / Arrow Right for Prev/Next
            if (e.key === 'ArrowLeft') {
                const prevBtn = document.getElementById('prevBtn');
                if (prevBtn && !prevBtn.disabled) prevBtn.click();
            } else if (e.key === 'ArrowRight') {
                const nextBtn = document.getElementById('nextBtn');
                if (nextBtn && !nextBtn.disabled) nextBtn.click();
            }
            
            // Number keys 1-4 to select options A-D
            if (['1', '2', '3', '4'].includes(e.key)) {
                const optIndex = parseInt(e.key) - 1;
                const opts = document.querySelectorAll('.opt');
                if (opts[optIndex] && !opts[optIndex].classList.contains('submitted')) {
                    opts[optIndex].click();
                }
            }
            
            // 'r' key to toggle Review
            if (e.key.toLowerCase() === 'r') {
                const reviewBtn = document.getElementById('reviewBtn');
                if (reviewBtn && reviewBtn.style.display !== 'none') reviewBtn.click();
            }
        });
    }

    // -------------------------------------------------------------
    // KaTeX Math Rendering Setup
    // -------------------------------------------------------------
    function setupMathRendering() {
        if (window.renderMathInElement) {
            renderMathInElement(document.body, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        }
    }

    // -------------------------------------------------------------
    // Dynamic Chart rendering with Chart.js
    // -------------------------------------------------------------
    let scoreChartInstance = null;

    function renderChart(results) {
        const modal = document.querySelector('.result');
        if (!modal) return;

        // Check if chart container exists, if not create it
        let chartContainer = document.getElementById('chartContainer');
        if (!chartContainer) {
            chartContainer = document.createElement('div');
            chartContainer.id = 'chartContainer';
            chartContainer.style.width = '100%';
            chartContainer.style.maxWidth = '260px';
            chartContainer.style.margin = '20px auto';
            chartContainer.style.position = 'relative';
            chartContainer.innerHTML = '<canvas id="scoreDoughnutChart"></canvas>';
            
            // Insert it before the stats grid
            const statsGrid = modal.querySelector('.stats');
            if (statsGrid) {
                statsGrid.parentNode.insertBefore(chartContainer, statsGrid);
            }
        }

        // Wait for Chart.js to load
        if (typeof Chart === 'undefined') {
            setTimeout(() => renderChart(results), 200);
            return;
        }

        const ctx = document.getElementById('scoreDoughnutChart').getContext('2d');
        
        // Destroy old instance if exists to prevent hover glitches
        if (scoreChartInstance) {
            scoreChartInstance.destroy();
        }

        const isDark = document.body.classList.contains('dark-mode');
        const textMuted = isDark ? '#94a3b8' : '#64748b';
        const centerTextColor = isDark ? '#f8fafc' : '#0f172a';

        scoreChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Correct', 'Incorrect', 'Unattempted'],
                datasets: [{
                    data: [results.correct, results.incorrect, results.unattempted],
                    backgroundColor: [
                        '#10b981', // Emerald
                        '#f43f5e', // Rose
                        '#64748b'  // Slate Muted
                    ],
                    borderColor: isDark ? '#1e293b' : '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${context.raw}`;
                            }
                        }
                    }
                },
                cutout: '72%'
            },
            plugins: [{
                id: 'centerText',
                beforeDraw: function(chart) {
                    const width = chart.width;
                    const height = chart.height;
                    const ctx = chart.ctx;
                    ctx.restore();
                    
                    // Draw Main Score
                    ctx.font = 'bold 24px Inter, sans-serif';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = centerTextColor;
                    const scoreText = `${results.correct}/${results.correct + results.incorrect + results.unattempted}`;
                    const scoreX = Math.round((width - ctx.measureText(scoreText).width) / 2);
                    const scoreY = height / 2 - 10;
                    ctx.fillText(scoreText, scoreX, scoreY);
                    
                    // Draw Label "Solved"
                    ctx.font = '600 11px Inter, sans-serif';
                    ctx.fillStyle = textMuted;
                    const labelText = 'QUESTIONS';
                    const labelX = Math.round((width - ctx.measureText(labelText).width) / 2);
                    const labelY = height / 2 + 15;
                    ctx.fillText(labelText, labelX, labelY);
                    
                    ctx.save();
                }
            }]
        });
    }

    // -------------------------------------------------------------
    // Canvas Confetti effect on submit
    // -------------------------------------------------------------
    function triggerConfetti(results) {
        if (typeof confetti === 'undefined') return;

        const scorePercent = (results.correct / (results.correct + results.incorrect + results.unattempted)) * 100;
        
        // Good performance deserves a premium celebrate!
        if (scorePercent >= 40) {
            const duration = 2.5 * 1000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.8 },
                    colors: ['#6366f1', '#10b981', '#a855f7']
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.8 },
                    colors: ['#6366f1', '#10b981', '#a855f7']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }

    // -------------------------------------------------------------
    // Floating Premium Calculator Widget
    // -------------------------------------------------------------
    function setupCalculator() {
        if (document.getElementById('floatingCalc')) return;

        // Create Widget Container
        const calcContainer = document.createElement('div');
        calcContainer.id = 'floatingCalc';
        calcContainer.className = 'floating-calc-widget';
        calcContainer.innerHTML = `
            <button class="calc-toggle-btn" id="calcToggleBtn" title="Toggle Calculator">
                <i class="fas fa-calculator"></i>
            </button>
            <div class="calc-panel" id="calcPanel">
                <div class="calc-header">
                    <span><i class="fas fa-calculator"></i> Calculator</span>
                    <button class="calc-close-btn" id="calcCloseBtn"><i class="fas fa-times"></i></button>
                </div>
                <div class="calc-screen">
                    <div class="calc-history" id="calcHistory"></div>
                    <div class="calc-output" id="calcOutput">0</div>
                </div>
                <div class="calc-grid">
                    <button class="calc-btn op" data-val="C">C</button>
                    <button class="calc-btn op" data-val="back"><i class="fas fa-backspace"></i></button>
                    <button class="calc-btn op" data-val="%">%</button>
                    <button class="calc-btn op" data-val="/">/</button>

                    <button class="calc-btn" data-val="7">7</button>
                    <button class="calc-btn" data-val="8">8</button>
                    <button class="calc-btn" data-val="9">9</button>
                    <button class="calc-btn op" data-val="*">*</button>

                    <button class="calc-btn" data-val="4">4</button>
                    <button class="calc-btn" data-val="5">5</button>
                    <button class="calc-btn" data-val="6">6</button>
                    <button class="calc-btn op" data-val="-">-</button>

                    <button class="calc-btn" data-val="1">1</button>
                    <button class="calc-btn" data-val="2">2</button>
                    <button class="calc-btn" data-val="3">3</button>
                    <button class="calc-btn op" data-val="+">+</button>

                    <button class="calc-btn double" data-val="0">0</button>
                    <button class="calc-btn" data-val=".">.</button>
                    <button class="calc-btn eq" data-val="=">=</button>
                </div>
            </div>
        `;

        document.body.appendChild(calcContainer);

        // Bind DOM events
        const toggleBtn = document.getElementById('calcToggleBtn');
        const panel = document.getElementById('calcPanel');
        const closeBtn = document.getElementById('calcCloseBtn');
        const output = document.getElementById('calcOutput');
        const history = document.getElementById('calcHistory');
        const buttons = document.querySelectorAll('.calc-btn');

        let currentExpr = '';
        let resultShown = false;

        toggleBtn.addEventListener('click', () => {
            panel.classList.toggle('open');
            toggleBtn.classList.toggle('active');
        });

        closeBtn.addEventListener('click', () => {
            panel.classList.remove('open');
            toggleBtn.classList.remove('active');
        });

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-val');
                
                // Add mini vibration/click feedback
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = '', 100);

                if (val === 'C') {
                    currentExpr = '';
                    output.textContent = '0';
                    history.textContent = '';
                } else if (val === 'back') {
                    if (resultShown) {
                        currentExpr = '';
                        output.textContent = '0';
                        history.textContent = '';
                        resultShown = false;
                    } else if (currentExpr.length > 0) {
                        currentExpr = currentExpr.slice(0, -1);
                        output.textContent = currentExpr || '0';
                    }
                } else if (val === '=') {
                    try {
                        if (!currentExpr) return;
                        
                        // Clean mathematical expression strings for safety evaluation
                        let cleanExpr = currentExpr.replace(/[^0-9+\-*/%.()]/g, '');
                        
                        // Standard math evaluation
                        const result = eval(cleanExpr);
                        
                        history.textContent = currentExpr + ' =';
                        output.textContent = Number.isFinite(result) ? Number(result.toFixed(6)) : result;
                        currentExpr = String(result);
                        resultShown = true;
                    } catch (e) {
                        output.textContent = 'Error';
                        currentExpr = '';
                    }
                } else {
                    if (resultShown && !isNaN(val)) {
                        currentExpr = val;
                        resultShown = false;
                    } else {
                        currentExpr += val;
                        resultShown = false;
                    }
                    output.textContent = currentExpr;
                }
            });
        });
    }

    // -------------------------------------------------------------
    // Enhanced Transitions for welcome screen
    // -------------------------------------------------------------
    function setupEnhancedAnimations(appInstance) {
        // Welcome Screen Fade Out Enhancement
        const startBtn = document.getElementById('startTestBtn');
        const welcome = document.getElementById('welcomeScreen');
        if (startBtn && welcome) {
            startBtn.addEventListener('click', () => {
                welcome.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                welcome.style.opacity = '0';
                welcome.style.transform = 'scale(0.96)';
            });
        }
    }
})();
