// Custom Enhancements for SSC Quant Super Practice Quiz
// Author: Antigravity AI
// Designed for premium aesthetics, smoother animations, and interactive elements.

(function() {
    // -------------------------------------------------------------
    // Hooking into TestApp Lifecycle via prototype overrides
    // -------------------------------------------------------------
    
    // Check if TestApp is defined. Since this script is loaded with 'defer',
    // it executes after parsing, but before DOMContentLoaded.
    // We hook into DOMContentLoaded to perform setup.
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof TestApp === 'undefined') return;

        const originalInit = TestApp.prototype.init;
        const originalShowResults = TestApp.prototype.showResults;
        const originalLoadQ = TestApp.prototype.loadQ;
        const originalSelOpt = TestApp.prototype.selOpt;

        // Hook: init
        TestApp.prototype.init = function() {
            originalInit.apply(this, arguments);
            setupCalculator();
            setupMathRendering();
            setupEnhancedAnimations(this);
            setupKeyboardNavigation(this);
        };

        // Hook: showResults
        TestApp.prototype.showResults = function(results) {
            // Fix total questions score display showing "0/0"
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
    });

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
