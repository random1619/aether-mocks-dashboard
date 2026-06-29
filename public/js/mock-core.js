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
        
        // Bind functions
        this.init = this.init.bind(this);
        this.updateUI = this.updateUI.bind(this);
        this.toggleTheme = this.toggleTheme.bind(this);
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
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
            // Listen for fullscreen change to update icon
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
            
            // Add options click handlers if not already added
            const options = card.querySelectorAll('.quiz-option');
            options.forEach((opt, optIdx) => {
                opt.dataset.optIndex = optIdx;
                // Add click listener if not already handled dynamically
                if (opt.onclick === null && opt.listenersCount === undefined) {
                    opt.addEventListener('click', () => {
                        this.selectOption(idx, optIdx);
                    });
                    opt.listenersCount = 1;
                }
            });
        });
        
        // Build or bind questions grid in the sidebar
        this.buildQuestionGrid();
        
        // Bind navigation controls
        this.bindControls();
        
        // Initialize timer from meta tag or default (e.g. 60 minutes)
        let duration = 60 * 60; // 60 minutes default
        const timerMeta = document.querySelector('meta[name="exam-duration"]');
        if (timerMeta && timerMeta.content) {
            duration = parseInt(timerMeta.content, 10) * 60;
        }
        this.initTimer(duration);
        
        // Initial draw
        this.updateUI();
        
        // Whitelist LaTeX processors
        this.triggerLaTeXRender();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
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
    
    bindControls() {
        const btnNext = document.querySelector('.btn-next');
        const btnPrev = document.querySelector('.btn-prev');
        const btnFlag = document.querySelector('.btn-flag');
        const btnClear = document.querySelector('.btn-clear');
        const btnSubmit = document.querySelector('.btn-submit');
        
        if (btnNext) btnNext.addEventListener('click', () => this.nextQuestion());
        if (btnPrev) btnPrev.addEventListener('click', () => this.prevQuestion());
        if (btnFlag) btnFlag.addEventListener('click', () => this.toggleFlag(this.currentIdx));
        if (btnClear) btnClear.addEventListener('click', () => this.clearSelection(this.currentIdx));
        if (btnSubmit) btnSubmit.addEventListener('click', () => this.submitExam());
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
    
    navigateToQuestion(index) {
        if (index < 0 || index >= this.totalQuestions) return;
        this.currentIdx = index;
        this.visited.add(index);
        this.updateUI();
        this.triggerLaTeXRender();
    }
    
    nextQuestion() {
        if (this.currentIdx < this.totalQuestions - 1) {
            this.navigateToQuestion(this.currentIdx + 1);
        }
    }
    
    prevQuestion() {
        if (this.currentIdx > 0) {
            this.navigateToQuestion(this.currentIdx - 1);
        }
    }
    
    selectOption(questionIdx, optionIdx) {
        if (this.isSubmitted) return;
        this.answers[questionIdx] = optionIdx;
        
        // Update styling of option blocks inside active card
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
        delete this.answers[questionIdx];
        
        const card = this.questions[questionIdx];
        const options = card.querySelectorAll('.quiz-option');
        options.forEach(opt => opt.classList.remove('selected'));
        
        this.updateUI();
    }
    
    toggleFlag(questionIdx) {
        if (this.isSubmitted) return;
        if (this.flags.has(questionIdx)) {
            this.flags.delete(questionIdx);
        } else {
            this.flags.add(questionIdx);
        }
        this.updateUI();
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
                    <div class="solution-header" style="font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-lightbulb" style="color: #eab308;"></i> Solution & Explanation
                    </div>
                    <div class="solution-content" style="margin-top: 0.5rem; line-height: 1.6; color: #334155;">
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
            item.classList.remove('active', 'answered', 'flagged', 'unvisited', 'correct', 'incorrect');
            
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
    }
    
    triggerLaTeXRender() {
        // Trigger MathJax re-render if it exists in the window scope
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
        // Trigger KaTeX re-render if it exists in the window scope
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
        if (btnFlag) btnFlag.style.display = 'none';
        if (btnClear) btnClear.style.display = 'none';
        if (btnSubmit) btnSubmit.style.display = 'none';
        
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
            // Fallback if global questions variable is missing
            correctCount = Object.keys(this.answers).length;
            unattemptedCount = this.totalQuestions - correctCount;
            totalScore = correctCount * 2.0;
            maxScore = this.totalQuestions * 2.0;
        }
        totalScore = Math.max(0, totalScore); // Prevent negative score
        
        // Build and display results modal
        let modal = document.getElementById('resultModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'resultModal';
            modal.className = 'result-modal';
            modal.innerHTML = `
                <div class="result-container">
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
                    <div class="result-actions">
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
