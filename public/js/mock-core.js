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
        
        this.timer = null;
        this.timeRemaining = 0;
        this.totalQuestions = 0;
        
        // Bind functions
        this.init = this.init.bind(this);
        this.updateUI = this.updateUI.bind(this);
    }
    
    init() {
        // Find all question cards
        this.questions = Array.from(document.querySelectorAll('.question-card'));
        this.totalQuestions = this.questions.length;
        if (this.totalQuestions === 0) {
            console.warn("No .question-card elements found in the DOM.");
            return;
        }
        
        // Auto-assign ID and index attributes to question cards if missing
        this.questions.forEach((card, idx) => {
            card.dataset.index = idx;
            
            // Add options click handlers
            const options = card.querySelectorAll('.quiz-option');
            options.forEach((opt, optIdx) => {
                opt.dataset.optIndex = optIdx;
                opt.addEventListener('click', () => {
                    this.selectOption(idx, optIdx);
                });
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
        delete this.answers[questionIdx];
        
        const card = this.questions[questionIdx];
        const options = card.querySelectorAll('.quiz-option');
        options.forEach(opt => opt.classList.remove('selected'));
        
        this.updateUI();
    }
    
    toggleFlag(questionIdx) {
        if (this.flags.has(questionIdx)) {
            this.flags.delete(questionIdx);
        } else {
            this.flags.add(questionIdx);
        }
        this.updateUI();
    }
    
    updateUI() {
        // Toggle question cards active visibility
        this.questions.forEach((card, idx) => {
            if (idx === this.currentIdx) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        // Update sidebar Questions Grid Item classes
        const gridItems = document.querySelectorAll('.questions-grid .grid-item');
        gridItems.forEach((item) => {
            const index = parseInt(item.dataset.index, 10);
            
            // Remove previous states
            item.classList.remove('active', 'answered', 'flagged', 'unvisited');
            
            if (index === this.currentIdx) {
                item.classList.add('active');
            }
            
            if (this.flags.has(index)) {
                item.classList.add('flagged');
            } else if (this.answers[index] !== undefined) {
                item.classList.add('answered');
            } else if (!this.visited.has(index)) {
                item.classList.add('unvisited');
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
        
        // Display score results
        alert(`Exam submitted successfully!\nTotal Answered: ${Object.keys(this.answers).length}/${this.totalQuestions}`);
        
        // Go back to dashboard portal (relative path fallback)
        window.close();
    }
}

// Auto-run on document loaded
document.addEventListener('DOMContentLoaded', () => {
    const controller = new MockExamController();
    controller.init();
    window.quizController = controller; // Expose globally for debugging
});
