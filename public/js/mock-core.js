/**
 * Aether Mocks Centralized Quiz Core Engine
 * Manages state, navigation, timers, and option selection.
 */

class MockExamController {
    constructor() {
        this.questions = [];
        this.currentIdx = 0;
        this.answers = {}; // questionIndex -> optionIndex
        this.flags = new Set();
        this.visited = new Set([0]); // start with first question visited
        this.isSubmitted = false;
        
        this.timer = null;
        this.timeRemaining = 0;
        this.totalQuestions = 0;
        
        // Sectional timing variables
        this.isSectionalMode = false;
        this.sections = null;
        this.currentSectionIdx = 0;
        
        // Bind functions
        this.init = this.init.bind(this);
        this.updateUI = this.updateUI.bind(this);
        this.toggleTheme = this.toggleTheme.bind(this);
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
    }
    
    detectSections() {
        const globalQuestions = typeof questions !== 'undefined' ? questions : null;
        
        // If mock defines its own sectionsData, use it directly
        if (window.sectionsData) {
            this.sections = window.sectionsData.map(sec => ({
                name: sec.name,
                timer: sec.timer,
                start: sec.start,
                end: sec.end,
                timeRemaining: sec.timer || (15 * 60),
                isSubmitted: false
            }));
            this.isSectionalMode = true;
            return;
        }

        if (!globalQuestions || globalQuestions.length === 0) {
            this.sections = null;
            this.isSectionalMode = false;
            return;
        }

        const totalQ = globalQuestions.length;

        // Check if questions have section property
        const hasSections = globalQuestions.some(q => q.section && q.section.trim() !== '');
        
        if (hasSections) {
            // Auto-detect from question.section property (existing logic)
            const sectionsList = [];
            let currentSec = null;

            globalQuestions.forEach((q, idx) => {
                const secName = q.section || "General";
                if (!currentSec || currentSec.name !== secName) {
                    if (currentSec) {
                        currentSec.end = idx - 1;
                    }
                    currentSec = {
                        name: secName,
                        start: idx,
                        end: idx,
                        timer: 15 * 60,
                        timeRemaining: 15 * 60,
                        isSubmitted: false
                    };
                    sectionsList.push(currentSec);
                } else {
                    currentSec.end = idx;
                }
            });

            if (currentSec) {
                currentSec.end = globalQuestions.length - 1;
            }

            if (sectionsList.length > 1) {
                this.sections = sectionsList;
                this.isSectionalMode = true;
                return;
            }
        }

        // Auto-generate sections based on question count
        if (totalQ === 100) {
            // SSC CGL Tier 1 pattern: 4 sections x 25 questions, 15 min each
            this.sections = [
                { name: 'General Intelligence & Reasoning', start: 0, end: 24, timer: 15 * 60, timeRemaining: 15 * 60, isSubmitted: false },
                { name: 'General Awareness', start: 25, end: 49, timer: 15 * 60, timeRemaining: 15 * 60, isSubmitted: false },
                { name: 'Quantitative Aptitude', start: 50, end: 74, timer: 15 * 60, timeRemaining: 15 * 60, isSubmitted: false },
                { name: 'English Comprehension', start: 75, end: 99, timer: 15 * 60, timeRemaining: 15 * 60, isSubmitted: false }
            ];
            this.isSectionalMode = true;
            return;
        }

        if (totalQ === 130) {
            // SSC CGL Tier 2 pattern: 4 sections with varying question counts
            this.sections = [
                { name: 'Module I - Quantitative Abilities', start: 0, end: 29, timer: 30 * 60, timeRemaining: 30 * 60, isSubmitted: false },
                { name: 'Module II - English Language & Comprehension', start: 30, end: 59, timer: 30 * 60, timeRemaining: 30 * 60, isSubmitted: false },
                { name: 'Module III - General Awareness', start: 60, end: 89, timer: 15 * 60, timeRemaining: 15 * 60, isSubmitted: false },
                { name: 'Module IV - Computer Proficiency', start: 90, end: 129, timer: 15 * 60, timeRemaining: 15 * 60, isSubmitted: false }
            ];
            this.isSectionalMode = true;
            return;
        }

        // No sections detected and no matching count - no sectional timing
        this.sections = null;
        this.isSectionalMode = false;
    }

    injectSettingsUI() {
        if (!this.sections) return;
        
        const welcomeContainer = document.querySelector('.welcome-container');
        if (!welcomeContainer) return;

        if (document.getElementById('mockSettingsPanel')) return;

        const panel = document.createElement('div');
        panel.id = 'mockSettingsPanel';
        panel.className = 'settings-panel';
        panel.style.margin = '20px 0';
        panel.style.padding = '15px';
        panel.style.background = '#f8fafc';
        panel.style.border = '1px solid #e2e8f0';
        panel.style.borderRadius = '12px';
        panel.style.textAlign = 'left';

        // Build section info rows
        let sectionRows = '';
        this.sections.forEach((sec, idx) => {
            const mins = Math.floor(sec.timer / 60);
            const qCount = sec.end - sec.start + 1;
            sectionRows += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-weight: 500; color: var(--text-main); font-size: 0.85rem;">${sec.name}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${qCount}Q &middot; ${mins} min</span>
                </div>
            `;
        });

        const totalMins = this.sections.reduce((sum, s) => sum + Math.floor(s.timer / 60), 0);

        const savedOverride = localStorage.getItem('sectionalTimerOverride') || 'default';
        
        panel.innerHTML = `
            <h4 style="margin-bottom: 10px; font-weight: 600; color: var(--text-main); font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-clock" style="color: var(--primary);"></i> Sectional Timing Enabled
            </h4>
            <div style="margin-bottom: 10px; font-size: 0.85rem; color: var(--text-muted);">
                Total: ${this.sections.length} sections &middot; ${this.totalQuestions} questions &middot; ${totalMins} mins
            </div>

            <div style="margin: 15px 0; padding: 12px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                <div>
                    <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 2px;">10-Min Section Timer</label>
                    <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.3;">
                        Force a 10-minute limit on all sections.
                    </div>
                </div>
                <label class="switch" style="flex-shrink: 0;">
                    <input type="checkbox" id="sectionalTimerOverrideToggle" ${savedOverride === '10' ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0;">
                ${sectionRows}
            </div>
            <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted); font-style: italic;">
                <i class="fas fa-info-circle" style="margin-right: 4px;"></i> Each section has a fixed timer. You cannot switch sections until the timer expires.
            </div>
        `;

        const actions = welcomeContainer.querySelector('.welcome-actions') || welcomeContainer.querySelector('button');
        if (actions) {
            welcomeContainer.insertBefore(panel, actions);
        } else {
            welcomeContainer.appendChild(panel);
        }
    }

    injectSectionTabs() {
        const header = document.querySelector('.exam-header');
        if (!header) return;

        if (document.getElementById('sectionTabsContainer')) return;

        const container = document.createElement('div');
        container.id = 'sectionTabsContainer';
        container.className = 'section-tabs-container';
        
        this.sections.forEach((sec, idx) => {
            const tab = document.createElement('button');
            tab.className = `section-tab ${idx === 0 ? 'active' : 'locked'}`;
            tab.dataset.index = idx;
            tab.style.pointerEvents = 'none'; // Tabs are display-only during strict timing
            tab.innerHTML = `
                <span class="tab-status-icon" style="margin-right: 6px;">
                    ${idx === 0 ? '<i class="fas fa-edit"></i>' : '<i class="fas fa-lock"></i>'}
                </span>
                <span class="tab-name">${sec.name}</span>
                <span class="tab-timer-val" style="margin-left: 8px; font-weight: 600; display: ${idx === 0 ? 'inline' : 'none'};"></span>
            `;
            container.appendChild(tab);
        });

        header.parentNode.insertBefore(container, header.nextSibling);
    }

    init() {
        // Immediately apply saved theme preference to avoid layout flashes
        const savedTheme = localStorage.getItem('aether-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            const themeBtn = document.getElementById('themeToggleBtn');
            if (themeBtn) {
                themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
                themeBtn.title = "Switch to Light Mode";
            }
        }

        // Bind header controls
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', this.toggleTheme);
        }
        
        const fsBtn = document.getElementById('fullscreenToggleBtn');
        if (fsBtn) {
            fsBtn.addEventListener('click', this.toggleFullscreen);
            document.addEventListener('fullscreenchange', () => {
                if (document.fullscreenElement) {
                    fsBtn.innerHTML = '<i class="fas fa-compress"></i>';
                    fsBtn.title = "Exit Fullscreen";
                } else {
                    fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
                    fsBtn.title = "Toggle Fullscreen";
                }
            });
        }

        // Find all question cards
        this.questions = Array.from(document.querySelectorAll('.question-card'));
        
        // Dynamically build question cards if DOM is empty but questions array is defined
        const globalQuestions = typeof questions !== 'undefined' ? questions : null;
        if (this.questions.length === 0 && globalQuestions && globalQuestions.length > 0) {
            const container = document.getElementById('questionContainer');
            if (container) {
                globalQuestions.forEach((q, idx) => {
                    const card = document.createElement('div');
                    card.className = 'question-card';
                    card.dataset.index = idx;
                    
                    const badge = document.createElement('div');
                    badge.className = 'question-number-badge';
                    badge.textContent = `Question ${idx + 1} of ${globalQuestions.length}`;
                    card.appendChild(badge);
                    
                    const text = document.createElement('div');
                    text.className = 'question-text';
                    text.innerHTML = q.question || q.text || '';
                    card.appendChild(text);
                    
                    const list = document.createElement('div');
                    list.className = 'options-list';
                    
                    const optionsArray = q.options || [];
                    optionsArray.forEach((opt, optIdx) => {
                        const optDiv = document.createElement('div');
                        optDiv.className = 'quiz-option';
                        optDiv.dataset.optIndex = optIdx;
                        
                        const indicator = document.createElement('div');
                        indicator.className = 'option-indicator';
                        indicator.textContent = String.fromCharCode(65 + optIdx); // A, B, C, D...
                        optDiv.appendChild(indicator);
                        
                        const optText = document.createElement('div');
                        optText.className = 'option-text';
                        optText.innerHTML = opt;
                        optDiv.appendChild(optText);
                        
                        optDiv.addEventListener('click', () => {
                            this.selectOption(idx, optIdx);
                        });
                        
                        list.appendChild(optDiv);
                    });
                    
                    card.appendChild(list);
                    container.appendChild(card);
                });
                
                this.questions = Array.from(document.querySelectorAll('.question-card'));
            }
        }
        
        this.totalQuestions = this.questions.length;
        if (this.totalQuestions === 0) {
            console.warn("No .question-card elements found in the DOM.");
            return;
        }
        
        // Auto-assign ID and index attributes to question cards if missing
        this.questions.forEach((card, idx) => {
            card.dataset.index = idx;
            
            const options = card.querySelectorAll('.quiz-option');
            options.forEach((opt, optIdx) => {
                opt.dataset.optIndex = optIdx;
                if (opt.onclick === null && opt.listenersCount === undefined) {
                    opt.addEventListener('click', () => {
                        this.selectOption(idx, optIdx);
                    });
                    opt.listenersCount = 1;
                }
            });
        });
        
        // Detect sections first
        this.detectSections();
        
        // Apply Sectional Timing Override
        if (this.sections && this.sections.length > 0) {
            const override = localStorage.getItem('sectionalTimerOverride');
            if (override && override !== 'default') {
                const overrideSeconds = parseInt(override, 10) * 60;
                if (!isNaN(overrideSeconds)) {
                    this.sections.forEach(sec => {
                        sec.timer = overrideSeconds;
                        sec.timeRemaining = overrideSeconds;
                    });
                }
            }
        }
        
        this.injectSettingsUI();
        
        // Build or bind questions grid in the sidebar
        this.buildQuestionGrid();
        
        // Bind navigation controls
        this.bindControls();
        
        const welcomeScreen = document.getElementById('welcomeScreen');
        const startBtn = document.getElementById('startBtn');

        if (welcomeScreen && startBtn) {
            startBtn.removeAttribute('onclick');
            startBtn.addEventListener('click', () => {
                const overrideToggle = document.getElementById('sectionalTimerOverrideToggle');
                if (overrideToggle && this.sections && this.sections.length > 0) {
                    const val = overrideToggle.checked ? '10' : 'default';
                    localStorage.setItem('sectionalTimerOverride', val); // Save for dashboard
                    
                    if (val !== 'default') {
                        const overrideSeconds = parseInt(val, 10) * 60;
                        if (!isNaN(overrideSeconds)) {
                            this.sections.forEach(sec => {
                                sec.timer = overrideSeconds;
                                sec.timeRemaining = overrideSeconds;
                            });
                        }
                    } else {
                        // Re-detect to restore original defaults if they switch back to default
                        this.detectSections();
                    }
                }
                
                welcomeScreen.style.display = 'none';
                const examContainer = document.getElementById('examContainer');
                if (examContainer) examContainer.style.display = 'flex';
                this.startExam();
            });
        } else {
            this.startExam();
        }
        
        // Whitelist LaTeX processors
        this.triggerLaTeXRender();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    startExam() {
        // Sectional mode is auto-enabled when sections are detected
        this.isSectionalMode = this.sections && this.sections.length > 0;

        this.currentSectionIdx = 0;
        this.isSubmitted = false;

        // Inject Submit Section button if in sectional mode
        if (this.isSectionalMode && this.sections) {
            const navControls = document.querySelector('.nav-controls');
            const btnSubmit = document.querySelector('.btn-submit');
            if (navControls && btnSubmit && !document.querySelector('.btn-submit-section')) {
                const btnSecSubmit = document.createElement('button');
                btnSecSubmit.className = 'btn btn-success btn-submit-section';
                btnSecSubmit.style.marginRight = '8px';
                btnSecSubmit.innerHTML = `Submit Section <i class="fas fa-check-double" style="margin-left: 8px;"></i>`;
                btnSecSubmit.addEventListener('click', () => this.confirmSubmitSection());
                navControls.insertBefore(btnSecSubmit, btnSubmit);
            }
        }

        let duration = 60 * 60; // 60 minutes default
        const timerMeta = document.querySelector('meta[name="exam-duration"]');
        if (timerMeta && timerMeta.content) {
            duration = parseInt(timerMeta.content, 10) * 60;
        }

        if (this.isSectionalMode && this.sections) {
            this.initSectionTimer();
            this.injectSectionTabs();
            this.navigateToQuestion(this.sections[0].start);
        } else {
            this.initTimer(duration);
            this.navigateToQuestion(0);
        }
    }

    initTimer(durationSeconds) {
        this.timeRemaining = durationSeconds;
        const timerBox = document.querySelector('.timer-box');
        const timerDisplay = document.querySelector('.timer-val') || (timerBox ? timerBox.querySelector('span') : null);
        
        if (this.timer) clearInterval(this.timer);
        
        const formatTime = (secs) => {
            const m = Math.floor(secs / 60).toString().padStart(2, '0');
            const s = (secs % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        };
        
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(this.timeRemaining);
        }
        
        this.timer = setInterval(() => {
            this.timeRemaining--;
            if (timerDisplay) {
                timerDisplay.textContent = formatTime(this.timeRemaining);
            }
            
            // Under 5 minutes warning
            if (this.timeRemaining <= 300) {
                if (timerBox) timerBox.classList.add('warning');
            }
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.timer);
                alert("Time has expired! Submitting your exam.");
                this.submitExam(true);
            }
        }, 1000);
    }

    initSectionTimer() {
        const activeSec = this.sections[this.currentSectionIdx];
        
        const tabs = document.querySelectorAll('.section-tab');
        tabs.forEach((tab, idx) => {
            tab.classList.remove('active', 'locked', 'completed');
            const icon = tab.querySelector('.tab-status-icon');
            const timerSpan = tab.querySelector('.tab-timer-val');

            if (idx === this.currentSectionIdx) {
                tab.classList.add('active');
                if (icon) icon.innerHTML = '<i class="fas fa-edit"></i>';
                if (timerSpan) timerSpan.style.display = 'inline';
            } else if (idx < this.currentSectionIdx) {
                tab.classList.add('completed');
                if (icon) icon.innerHTML = '<i class="fas fa-check-circle" style="color: var(--success);"></i>';
                if (timerSpan) timerSpan.style.display = 'none';
            } else {
                tab.classList.add('locked');
                if (icon) icon.innerHTML = '<i class="fas fa-lock"></i>';
                if (timerSpan) timerSpan.style.display = 'none';
            }
        });

        if (this.timer) clearInterval(this.timer);

        const formatTime = (secs) => {
            const m = Math.floor(secs / 60).toString().padStart(2, '0');
            const s = (secs % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        };

        const timerDisplay = document.querySelector('.timer-val');
        const activeTabTimer = document.querySelector('.section-tab.active .tab-timer-val');

        const updateTimerUI = () => {
            const timeStr = formatTime(activeSec.timeRemaining);
            if (timerDisplay) {
                timerDisplay.textContent = `Sec: ${timeStr}`;
            }
            if (activeTabTimer) {
                activeTabTimer.textContent = `(${timeStr})`;
            }
        };

        updateTimerUI();

        this.timer = setInterval(() => {
            activeSec.timeRemaining--;
            updateTimerUI();

            const timerBox = document.querySelector('.timer-box');
            if (activeSec.timeRemaining <= 60) {
                if (timerBox) timerBox.classList.add('warning');
            } else {
                if (timerBox) timerBox.classList.remove('warning');
            }

            if (activeSec.timeRemaining <= 0) {
                clearInterval(this.timer);
                alert(`Time is up for section "${activeSec.name}"! Switching to next section.`);
                this.submitSection();
            }
        }, 1000);
    }

    submitSection() {
        if (!this.sections) return;
        
        const activeSec = this.sections[this.currentSectionIdx];
        activeSec.isSubmitted = true;
        
        const timerBox = document.querySelector('.timer-box');
        if (timerBox) timerBox.classList.remove('warning');

        const nextIdx = this.currentSectionIdx + 1;
        if (nextIdx < this.sections.length) {
            this.currentSectionIdx = nextIdx;
            this.initSectionTimer();
            this.navigateToQuestion(this.sections[nextIdx].start);
        } else {
            this.submitExam(true);
        }
    }

    confirmSubmitSection() {
        const activeSec = this.sections[this.currentSectionIdx];
        let unanswered = 0;
        for (let i = activeSec.start; i <= activeSec.end; i++) {
            if (this.answers[i] === undefined) {
                unanswered++;
            }
        }

        let msg = unanswered > 0
            ? `You have ${unanswered} unanswered questions in this section. Submit section anyway?`
            : "Are you sure you want to submit this section?";

        if (confirm(msg)) {
            this.submitSection();
        }
    }

    bindControls() {
        const btnNext = document.querySelector('.btn-next');
        const btnPrev = document.querySelector('.btn-prev');
        const btnFlag = document.querySelector('.btn-flag');
        const btnClear = document.querySelector('.btn-clear');
        const btnSubmit = document.querySelector('.btn-submit');
        const btnSecSubmit = document.querySelector('.btn-submit-section');
        
        if (btnNext) btnNext.addEventListener('click', () => this.nextQuestion());
        if (btnPrev) btnPrev.addEventListener('click', () => this.prevQuestion());
        if (btnFlag) btnFlag.addEventListener('click', () => this.toggleFlag(this.currentIdx));
        if (btnClear) btnClear.addEventListener('click', () => this.clearSelection(this.currentIdx));
        
        // Submit Exam - always submits the entire exam
        if (btnSubmit) {
            btnSubmit.addEventListener('click', () => this.submitExam());
        }
        
        // Submit Section - submits only the current section
        if (btnSecSubmit) {
            btnSecSubmit.addEventListener('click', () => this.confirmSubmitSection());
        }
    }

    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Skip keyboard shortcuts if user is typing in an input or textarea
            if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
                return;
            }
            
            if (this.isSubmitted) {
                // In review mode, only allow navigation
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prevQuestion();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextQuestion();
                }
                return;
            }
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevQuestion();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextQuestion();
                    break;
                case '1':
                case 'a':
                case 'A':
                    this.selectOption(this.currentIdx, 0);
                    break;
                case '2':
                case 'b':
                case 'B':
                    this.selectOption(this.currentIdx, 1);
                    break;
                case '3':
                case 'c':
                case 'C':
                    this.selectOption(this.currentIdx, 2);
                    break;
                case '4':
                case 'd':
                case 'D':
                    this.selectOption(this.currentIdx, 3);
                    break;
                case '5':
                case 'e':
                case 'E':
                    this.selectOption(this.currentIdx, 4);
                    break;
                case 'f':
                case 'F':
                    this.toggleFlag(this.currentIdx);
                    break;
                case 'Escape':
                case 'Delete':
                case 'Backspace':
                    this.clearSelection(this.currentIdx);
                    break;
            }
        });
    }

    
    buildQuestionGrid() {
        const gridContainer = document.querySelector('.questions-grid');
        if (!gridContainer) return;
        
        gridContainer.innerHTML = '';
        for (let i = 0; i < this.totalQuestions; i++) {
            const item = document.createElement('div');
            item.className = 'grid-item unvisited';
            item.textContent = i + 1;
            item.dataset.index = i;
            item.addEventListener('click', () => {
                this.navigateToQuestion(i);
            });
            gridContainer.appendChild(item);
        }
    }
    
    navigateToQuestion(index) {
        if (index < 0 || index >= this.totalQuestions) return;
        
        if (this.isSectionalMode && this.sections && !this.isSubmitted) {
            const activeSec = this.sections[this.currentSectionIdx];
            if (index < activeSec.start || index > activeSec.end) {
                return; // Block navigating outside the active section
            }
        }

        this.currentIdx = index;
        this.visited.add(index);
        this.updateUI();
        this.triggerLaTeXRender();
    }
    
    nextQuestion() {
        if (this.isSectionalMode && this.sections) {
            const activeSec = this.sections[this.currentSectionIdx];
            if (this.currentIdx < activeSec.end) {
                this.navigateToQuestion(this.currentIdx + 1);
            }
        } else if (this.currentIdx < this.totalQuestions - 1) {
            this.navigateToQuestion(this.currentIdx + 1);
        }
    }
    
    prevQuestion() {
        if (this.isSectionalMode && this.sections) {
            const activeSec = this.sections[this.currentSectionIdx];
            if (this.currentIdx > activeSec.start) {
                this.navigateToQuestion(this.currentIdx - 1);
            }
        } else if (this.currentIdx > 0) {
            this.navigateToQuestion(this.currentIdx - 1);
        }
    }
    
    selectOption(questionIdx, optionIdx) {
        if (this.isSubmitted) return;

        if (this.isSectionalMode && this.sections) {
            const activeSec = this.sections[this.currentSectionIdx];
            if (questionIdx < activeSec.start || questionIdx > activeSec.end) {
                return;
            }
        }

        this.answers[questionIdx] = optionIdx;
        
        const card = this.questions[questionIdx];
        const options = card.querySelectorAll('.quiz-option');
        options.forEach((opt, idx) => {
            if (idx === optionIdx) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        
        this.updateUI();
    }
    
    clearSelection(questionIdx) {
        if (this.isSubmitted) return;

        if (this.isSectionalMode && this.sections) {
            const activeSec = this.sections[this.currentSectionIdx];
            if (questionIdx < activeSec.start || questionIdx > activeSec.end) {
                return;
            }
        }

        delete this.answers[questionIdx];
        
        const card = this.questions[questionIdx];
        const options = card.querySelectorAll('.quiz-option');
        options.forEach(opt => opt.classList.remove('selected'));
        
        this.updateUI();
    }
    
    toggleFlag(questionIdx) {
        if (this.isSubmitted) return;

        if (this.isSectionalMode && this.sections) {
            const activeSec = this.sections[this.currentSectionIdx];
            if (questionIdx < activeSec.start || questionIdx > activeSec.end) {
                return;
            }
        }

        if (this.flags.has(questionIdx)) {
            this.flags.delete(questionIdx);
        } else {
            this.flags.add(questionIdx);
        }
        this.updateUI();
    }

    updateNavigationButtons() {
        const btnPrev = document.querySelector('.btn-prev');
        const btnNext = document.querySelector('.btn-next');
        const btnSubmit = document.querySelector('.btn-submit');
        const btnSecSubmit = document.querySelector('.btn-submit-section');

        if (this.isSectionalMode && this.sections && !this.isSubmitted) {
            const activeSec = this.sections[this.currentSectionIdx];
            if (btnPrev) btnPrev.disabled = (this.currentIdx === activeSec.start);
            if (btnNext) btnNext.disabled = (this.currentIdx === activeSec.end);
            
            if (btnSecSubmit) {
                if (this.currentSectionIdx === this.sections.length - 1) {
                    btnSecSubmit.style.display = 'none'; // Hide in last section
                } else {
                    btnSecSubmit.style.display = 'inline-flex';
                }
            }
            if (btnSubmit) {
                btnSubmit.innerHTML = `Submit Exam <i class="fas fa-paper-plane" style="margin-left: 8px;"></i>`;
            }
        } else {
            if (btnPrev) btnPrev.disabled = (this.currentIdx === 0);
            if (btnNext) btnNext.disabled = (this.currentIdx === this.totalQuestions - 1);
            if (btnSecSubmit) btnSecSubmit.style.display = 'none';
            if (btnSubmit && !this.isSubmitted) {
                btnSubmit.innerHTML = `Submit Exam <i class="fas fa-paper-plane" style="margin-left: 8px;"></i>`;
            }
        }
    }
    
    updateUI() {
        const globalQuestions = typeof questions !== 'undefined' ? questions : null;
        
        // Toggle question cards active visibility & apply option correctness styling
        this.questions.forEach((card, idx) => {
            if (idx === this.currentIdx) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
            
            if (this.isSubmitted && globalQuestions) {
                const qData = globalQuestions[idx];
                const correctOpt = qData ? qData.correct_option_id : null;
                const userOpt = this.answers[idx];
                
                // Style options
                const options = card.querySelectorAll('.quiz-option');
                options.forEach((opt, optIdx) => {
                    opt.style.pointerEvents = 'none';
                    opt.classList.remove('selected');
                    
                    if (optIdx === correctOpt) {
                        opt.classList.add('correct');
                    } else if (optIdx === userOpt) {
                        opt.classList.add('incorrect');
                    } else {
                        opt.classList.remove('correct', 'incorrect');
                    }
                });
                
                // Render solution box
                let solBox = card.querySelector('.solution-box');
                if (!solBox) {
                    solBox = document.createElement('div');
                    solBox.className = 'solution-box';
                    card.appendChild(solBox);
                }
                solBox.style.display = 'block';
                solBox.innerHTML = `
                    <div class="solution-header" style="font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-lightbulb" style="color: #eab308;"></i> Solution & Explanation
                    </div>
                    <div class="solution-content" style="margin-top: 0.5rem; line-height: 1.6; color: var(--text-muted);">
                        ${qData.solution || 'No explanation available.'}
                    </div>
                `;
                
                // Support dark mode styling within explanation text
                if (document.body.classList.contains('dark-theme')) {
                    const solHeader = solBox.querySelector('.solution-header');
                    if (solHeader) solHeader.style.color = '#f8fafc';
                    const solContent = solBox.querySelector('.solution-content');
                    if (solContent) solContent.style.color = '#94a3b8';
                }
            }
        });
        
        // Update sidebar Questions Grid Item classes
        const gridItems = document.querySelectorAll('.questions-grid .grid-item');
        gridItems.forEach((item) => {
            const index = parseInt(item.dataset.index, 10);
            
            // Remove previous states
            item.classList.remove('active', 'answered', 'flagged', 'unvisited', 'correct', 'incorrect', 'disabled-section');
            item.style.pointerEvents = '';
            item.style.opacity = '';
            
            if (index === this.currentIdx) {
                item.classList.add('active');
            }
            
            if (this.isSubmitted && globalQuestions) {
                const qData = globalQuestions[index];
                const correctOpt = qData ? qData.correct_option_id : null;
                const userOpt = this.answers[index];
                
                if (userOpt === undefined) {
                    item.classList.add('unvisited');
                } else if (userOpt === correctOpt) {
                    item.classList.add('correct');
                } else {
                    item.classList.add('incorrect');
                }
            } else {
                if (this.isSectionalMode && this.sections) {
                    const activeSec = this.sections[this.currentSectionIdx];
                    if (index < activeSec.start || index > activeSec.end) {
                        item.classList.add('disabled-section');
                        item.style.pointerEvents = 'none';
                        item.style.opacity = '0.4';
                    }
                }

                if (this.flags.has(index)) {
                    item.classList.add('flagged');
                } else if (this.answers[index] !== undefined) {
                    item.classList.add('answered');
                } else if (!this.visited.has(index)) {
                    item.classList.add('unvisited');
                }
            }
        });
        
        // Update stats numbers
        let answeredCount = Object.keys(this.answers).length;
        let flaggedCount = this.flags.size;
        let notAnsweredCount = this.totalQuestions - answeredCount;
        let notVisitedCount = this.totalQuestions - this.visited.size;
        
        const answeredEl = document.getElementById('stat-answered');
        const flaggedEl = document.getElementById('stat-flagged');
        const notAnsweredEl = document.getElementById('stat-not-answered');
        const notVisitedEl = document.getElementById('stat-not-visited');
        
        if (answeredEl) answeredEl.textContent = answeredCount;
        if (flaggedEl) flaggedEl.textContent = flaggedCount;
        if (notAnsweredEl) notAnsweredEl.textContent = notAnsweredCount;
        if (notVisitedEl) notVisitedEl.textContent = notVisitedCount;

        // Update nav controls disabled status
        this.updateNavigationButtons();
    }
    
    triggerLaTeXRender() {
        if (window.MathJax) {
            try {
                if (typeof window.MathJax.Hub !== 'undefined') {
                    window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
                } else if (typeof window.MathJax.typesetPromise !== 'undefined') {
                    window.MathJax.typesetPromise();
                }
            } catch (err) {
                console.warn("MathJax re-render failed:", err);
            }
        }
        if (window.renderMathInElement) {
            try {
                window.renderMathInElement(document.body);
            } catch (err) {
                console.warn("KaTeX re-render failed:", err);
            }
        }
    }
    
    submitExam(isAuto = false) {
        if (!isAuto) {
            const confirmSubmit = confirm("Are you sure you want to submit your exam?");
            if (!confirmSubmit) return;
        }
        
        if (this.timer) clearInterval(this.timer);
        this.isSubmitted = true;
        
        // Hide standard controls that are no longer needed
        const btnFlag = document.querySelector('.btn-flag');
        const btnClear = document.querySelector('.btn-clear');
        const btnSubmit = document.querySelector('.btn-submit');
        const btnSecSubmit = document.querySelector('.btn-submit-section');
        if (btnFlag) btnFlag.style.display = 'none';
        if (btnClear) btnClear.style.display = 'none';
        if (btnSubmit) btnSubmit.style.display = 'none';
        if (btnSecSubmit) btnSecSubmit.style.display = 'none';
        
        // Hide section tabs container
        const tabsContainer = document.getElementById('sectionTabsContainer');
        if (tabsContainer) tabsContainer.style.display = 'none';
        
        // Calculate scores
        let correctCount = 0;
        let incorrectCount = 0;
        let unattemptedCount = 0;
        let totalScore = 0;
        let maxScore = 0;
        
        const globalQuestions = typeof questions !== 'undefined' ? questions : null;
        if (globalQuestions) {
            globalQuestions.forEach((q, idx) => {
                const userAns = this.answers[idx];
                const correctAns = q.correct_option_id;
                const qMarks = q.marks !== undefined ? parseFloat(q.marks) : 2.0;
                maxScore += qMarks;
                
                if (userAns === undefined) {
                    unattemptedCount++;
                } else if (userAns === correctAns) {
                    correctCount++;
                    totalScore += qMarks;
                } else {
                    incorrectCount++;
                    totalScore -= 0.25 * qMarks; // Standard 25% negative marking penalty
                }
            });
        } else {
            correctCount = Object.keys(this.answers).length;
            unattemptedCount = this.totalQuestions - correctCount;
            totalScore = correctCount * 2.0;
            maxScore = this.totalQuestions * 2.0;
        }
        totalScore = Math.max(0, totalScore); // Prevent negative score
        
        // Build sectional table HTML if applicable
        let sectionsHTML = '';
        if (this.isSectionalMode && this.sections) {
            sectionsHTML = `
                <div class="result-sections-table-wrap" style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem; width: 100%; text-align: left;">
                    <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-main);">Sectional Performance</h3>
                    <table class="result-sections-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted); font-weight: 600;">
                                <th style="padding: 6px 4px;">Section</th>
                                <th style="padding: 6px 4px; text-align: center;">Correct</th>
                                <th style="padding: 6px 4px; text-align: center;">Wrong</th>
                                <th style="padding: 6px 4px; text-align: center;">Unattempted</th>
                                <th style="padding: 6px 4px; text-align: right;">Score</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            this.sections.forEach(sec => {
                let secCorrect = 0;
                let secIncorrect = 0;
                let secUnattempted = 0;
                let secScore = 0;

                for (let i = sec.start; i <= sec.end; i++) {
                    const q = globalQuestions ? globalQuestions[i] : null;
                    const userAns = this.answers[i];
                    const correctAns = q ? q.correct_option_id : null;
                    const qMarks = q && q.marks !== undefined ? parseFloat(q.marks) : 2.0;

                    if (userAns === undefined) {
                        secUnattempted++;
                    } else if (correctAns !== null && userAns === correctAns) {
                        secCorrect++;
                        secScore += qMarks;
                    } else {
                        secIncorrect++;
                        secScore -= 0.25 * qMarks;
                    }
                }
                secScore = Math.max(0, secScore);

                sectionsHTML += `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px 4px; font-weight: 500; color: var(--text-main);">${sec.name}</td>
                        <td style="padding: 8px 4px; text-align: center; color: var(--success); font-weight: 600;">${secCorrect}</td>
                        <td style="padding: 8px 4px; text-align: center; color: #ef4444; font-weight: 600;">${secIncorrect}</td>
                        <td style="padding: 8px 4px; text-align: center; color: var(--text-muted);">${secUnattempted}</td>
                        <td style="padding: 8px 4px; text-align: right; font-weight: 700; color: var(--primary);">${secScore.toFixed(2)}</td>
                    </tr>
                `;
            });

            sectionsHTML += `
                        </tbody>
                    </table>
                </div>
            `;
        }

        // Build and display results modal
        let modal = document.getElementById('resultModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'resultModal';
            modal.className = 'result-modal';
            modal.innerHTML = `
                <div class="result-container" style="max-height: 90vh; overflow-y: auto; padding: 2rem;">
                    <div class="result-header">
                        <h2>Test Completed!</h2>
                        <div class="result-score" id="resultScore">0.00 / 0.00</div>
                    </div>
                    <div class="result-grid">
                        <div class="result-stat correct">
                            <div class="result-stat-value" id="correctCount">0</div>
                            <div class="result-stat-label">Correct</div>
                        </div>
                        <div class="result-stat incorrect">
                            <div class="result-stat-value" id="incorrectCount">0</div>
                            <div class="result-stat-label">Incorrect</div>
                        </div>
                        <div class="result-stat">
                            <div class="result-stat-value" id="unattemptedCount">0</div>
                            <div class="result-stat-label">Unattempted</div>
                        </div>
                    </div>
                    <div id="sectionalResultsPlaceholder"></div>
                    <div class="result-actions" style="margin-top: 1.5rem;">
                        <button class="result-btn btn-close" id="closeResultBtn">Close Test</button>
                        <button class="result-btn btn-review-ans" id="reviewAnswersBtn">Review Answers</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listeners
            document.getElementById('closeResultBtn').addEventListener('click', () => {
                window.close();
            });
            document.getElementById('reviewAnswersBtn').addEventListener('click', () => {
                modal.classList.remove('show');
                modal.style.display = 'none';
            });
        }
        
        // Populate modal stats
        document.getElementById('resultScore').textContent = `${totalScore.toFixed(2)} / ${maxScore.toFixed(2)}`;
        document.getElementById('correctCount').textContent = correctCount;
        document.getElementById('incorrectCount').textContent = incorrectCount;
        document.getElementById('unattemptedCount').textContent = unattemptedCount;
        
        const placeholder = document.getElementById('sectionalResultsPlaceholder');
        if (placeholder) {
            placeholder.innerHTML = sectionsHTML;
        }

        // Show modal with animation
        modal.style.display = 'flex';
        // Force reflow
        modal.offsetHeight;
        modal.classList.add('show');
        
        // Trigger UI rendering to reflect correctness styling & reveal solution explanation boxes
        this.updateUI();
        this.triggerLaTeXRender();
    }
    
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('aether-theme', isDark ? 'dark' : 'light');
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            themeBtn.title = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Auto-run on document loaded
document.addEventListener('DOMContentLoaded', () => {
    const controller = new MockExamController();
    controller.init();
    window.quizController = controller; // Expose globally for debugging
});
