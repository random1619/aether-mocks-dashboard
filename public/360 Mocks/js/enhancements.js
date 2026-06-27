/**
 * 360 Mocks — Shared Enhancements
 * Libraries: SweetAlert2, Chart.js, localForage, Tippy.js, Lucide Icons
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     1. SWEETALERT2 — Replace browser confirm()
     ───────────────────────────────────────────── */

  /**
   * Patch the CBTExam.confirmSubmit method once the exam is initialized.
   * We watch for window.activeExam to appear, then wrap its methods.
   */
  function patchExamConfirm() {
    if (!window.activeExam) return;
    const exam = window.activeExam;
    if (exam._sweetPatched) return;
    exam._sweetPatched = true;

    // Override confirmSubmit
    const origConfirm = exam.confirmSubmit.bind(exam);
    exam.confirmSubmit = function () {
      const unanswered = exam.sections
        ? exam.answers
            .slice(
              exam.sections[exam.currentSection].start,
              exam.sections[exam.currentSection].end + 1
            )
            .filter((a) => a === null).length
        : exam.answers.filter((a) => a === null).length;

      const total = exam.sections
        ? exam.sections[exam.currentSection].end -
          exam.sections[exam.currentSection].start +
          1
        : exam.questions.length;

      const answered = total - unanswered;

      window.Swal.fire({
        title: unanswered > 0 ? '⚠️ Unanswered Questions' : '✅ Submit Test?',
        html:
          unanswered > 0
            ? `<p>You have answered <strong>${answered}</strong> of <strong>${total}</strong> questions.</p>
               <p style="color:var(--warning,#f59e0b);margin-top:8px"><strong>${unanswered}</strong> question${unanswered !== 1 ? 's' : ''} left unanswered.</p>`
            : `<p>All <strong>${total}</strong> questions answered. Ready to submit?</p>`,
        icon: unanswered > 0 ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Submit',
        cancelButtonText: 'Continue Test',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6366f1',
        background: document.body.classList.contains('light-theme')
          ? '#ffffff'
          : '#111827',
        color: document.body.classList.contains('light-theme')
          ? '#1f2937'
          : '#f3f4f6',
        customClass: {
          popup: 'swal-360-popup',
          confirmButton: 'swal-360-confirm',
          cancelButton: 'swal-360-cancel',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          if (exam.sections) {
            exam.submitSection();
          } else {
            exam.submitTest();
          }
        }
      });
    };
  }

  /* ─────────────────────────────────────────────
     2. SWEETALERT2 — Timer warning at 2 minutes
     ───────────────────────────────────────────── */
  let timerWarnFired = false;
  let timerWarnInterval = null;

  function startTimerWatch() {
    if (timerWarnInterval) return;
    timerWarnInterval = setInterval(() => {
      const exam = window.activeExam;
      if (!exam || exam.isSubmitted) {
        clearInterval(timerWarnInterval);
        return;
      }
      // Add danger class when <= 2 minutes
      const timerBox = document.getElementById('mainTimer');
      if (timerBox) {
        if (exam.totalTimeLeft <= 120 && exam.totalTimeLeft > 0) {
          timerBox.classList.add('danger');
        } else {
          timerBox.classList.remove('danger');
        }
      }

      if (!timerWarnFired && exam.totalTimeLeft <= 120 && exam.totalTimeLeft > 0) {
        timerWarnFired = true;
        window.Swal && window.Swal.fire({
          title: '⏰ 2 Minutes Left!',
          text: 'Please review and submit your answers soon.',
          icon: 'warning',
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          background: document.body.classList.contains('light-theme')
            ? '#ffffff'
            : '#111827',
          color: document.body.classList.contains('light-theme')
            ? '#1f2937'
            : '#f3f4f6',
        });
      }
    }, 1000);
  }

  /* ── Inject keyboard hint below nav bar ── */
  function injectKeyboardHint() {
    const navBar = document.querySelector('.navigation-bar');
    if (!navBar || document.querySelector('.keyboard-hint')) return;
    const hint = document.createElement('div');
    hint.className = 'keyboard-hint';
    hint.textContent = '← → Arrow keys to navigate questions';
    navBar.appendChild(hint);
  }

  /* ─────────────────────────────────────────────
     3. CHART.JS — Performance doughnut in result modal
     ───────────────────────────────────────────── */
  let perfChart = null;

  function injectChartCanvas() {
    const resultGrid = document.querySelector('.result-grid');
    if (!resultGrid || document.getElementById('perfChartWrap')) return;

    const wrap = document.createElement('div');
    wrap.id = 'perfChartWrap';
    wrap.style.cssText =
      'grid-column:1/-1;display:flex;justify-content:center;padding:8px 0 4px;';

    const canvas = document.createElement('canvas');
    canvas.id = 'perfChart';
    canvas.width = 180;
    canvas.height = 180;
    canvas.style.cssText = 'max-width:180px;max-height:180px;';

    wrap.appendChild(canvas);
    resultGrid.parentNode.insertBefore(wrap, resultGrid);
  }

  function renderResultChart(correct, incorrect, unattempted) {
    injectChartCanvas();
    const ctx = document.getElementById('perfChart');
    if (!ctx || !window.Chart) return;

    if (perfChart) {
      perfChart.destroy();
      perfChart = null;
    }

    const isLight = document.body.classList.contains('light-theme');
    perfChart = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Correct', 'Incorrect', 'Unattempted'],
        datasets: [
          {
            data: [correct, incorrect, unattempted],
            backgroundColor: ['#10b981', '#ef4444', isLight ? '#d1d5db' : '#374151'],
            borderColor: isLight ? '#ffffff' : '#111827',
            borderWidth: 3,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        cutout: '65%',
        responsive: false,
        animation: { animateRotate: true, duration: 800 },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: isLight ? '#1f2937' : '#f3f4f6',
              font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
              padding: 10,
              boxWidth: 12,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`,
            },
          },
        },
      },
    });
  }

  /* ─────────────────────────────────────────────
     4. LOCALFORAGE — Answer persistence & recovery
     ───────────────────────────────────────────── */
  const STORE_KEY = 'exam_progress_' + (document.title || 'mock').replace(/\s+/g, '_').substring(0, 40);
  let saveInterval = null;

  function saveProgress() {
    const exam = window.activeExam;
    if (!exam || exam.isSubmitted) return;
    window.localforage
      .setItem(STORE_KEY, {
        answers: exam.answers,
        markedForReview: exam.markedForReview,
        currentQuestion: exam.currentQuestion,
        totalTimeLeft: exam.totalTimeLeft,
        savedAt: Date.now(),
      })
      .catch(() => {});
  }

  function startAutoSave() {
    if (saveInterval) return;
    saveInterval = setInterval(saveProgress, 5000);
  }

  async function tryRestoreProgress() {
    if (!window.localforage) return;
    try {
      const saved = await window.localforage.getItem(STORE_KEY);
      if (!saved) return;

      const ageMin = (Date.now() - (saved.savedAt || 0)) / 60000;
      if (ageMin > 90) {
        await window.localforage.removeItem(STORE_KEY);
        return;
      }

      const exam = window.activeExam;
      if (!exam || exam.isSubmitted || exam.startTime === null) return;

      // Only restore if less than 1 question answered (fresh start)
      const currentAnswered = exam.answers.filter((a) => a !== null).length;
      if (currentAnswered > 0) return;

      const savedAnswered = (saved.answers || []).filter((a) => a !== null).length;
      if (savedAnswered === 0) return;

      window.Swal.fire({
        title: '📂 Resume Previous Session?',
        html: `<p>Found a saved session with <strong>${savedAnswered}</strong> answered question${savedAnswered !== 1 ? 's' : ''}.</p>
               <p style="font-size:12px;opacity:.7;margin-top:6px">Saved ${Math.round(ageMin)} min${Math.round(ageMin) !== 1 ? 's' : ''} ago</p>`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Resume',
        cancelButtonText: 'Start Fresh',
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#6b7280',
        background: document.body.classList.contains('light-theme')
          ? '#ffffff'
          : '#111827',
        color: document.body.classList.contains('light-theme')
          ? '#1f2937'
          : '#f3f4f6',
      }).then((result) => {
        if (result.isConfirmed) {
          exam.answers = saved.answers || exam.answers;
          exam.markedForReview = saved.markedForReview || exam.markedForReview;
          if (saved.totalTimeLeft && saved.totalTimeLeft > 0) {
            exam.totalTimeLeft = saved.totalTimeLeft;
          }
          exam.loadQuestion(saved.currentQuestion || 0);
          exam.updateNavigator();
          exam.updateAnsweredCount();
        } else {
          window.localforage.removeItem(STORE_KEY);
        }
      });
    } catch (e) {}
  }

  function clearProgressOnSubmit() {
    window.localforage && window.localforage.removeItem(STORE_KEY).catch(() => {});
  }

  /* ─────────────────────────────────────────────
     5. LUCIDE ICONS — Replace icon text/placeholders
     ───────────────────────────────────────────── */
  function applyLucideIcons() {
    if (!window.lucide) return;

    // Replace pause button emoji with lucide svg
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn && !pauseBtn.dataset.lucideDone) {
      pauseBtn.innerHTML = '<i data-lucide="pause-circle"></i>';
      pauseBtn.dataset.lucideDone = '1';
    }

    // Add lucide icons to nav buttons if they don't have FA icons
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn && !prevBtn.querySelector('i.fas')) {
      prevBtn.prepend(createLucideEl('chevron-left'));
    }
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn && !nextBtn.querySelector('i.fas')) {
      nextBtn.appendChild(createLucideEl('chevron-right'));
    }

    window.lucide.createIcons();
  }

  function createLucideEl(name) {
    const i = document.createElement('i');
    i.setAttribute('data-lucide', name);
    i.style.cssText = 'width:16px;height:16px;vertical-align:middle;display:inline-block;';
    return i;
  }

  /* ─────────────────────────────────────────────
     6. TIPPY.JS — Useful tooltips
     ───────────────────────────────────────────── */
  function addTooltips() {
    if (!window.tippy) return;

    const tooltipTargets = [
      { sel: '#themeToggle', content: 'Toggle light / dark mode' },
      { sel: '#pauseBtn', content: 'Pause the test (timer stops)' },
      { sel: '#prevBtn', content: 'Previous question' },
      { sel: '#nextBtn', content: 'Next question' },
      { sel: '#reviewBtn', content: 'Mark this question for review' },
      { sel: '#submitBtn', content: 'Submit your test' },
      { sel: '#submitBtnDesktop', content: 'Submit your test' },
      { sel: '#navigatorBtn', content: 'Open question navigator' },
      { sel: '#closeNav', content: 'Close navigator' },
      { sel: '#engBtn', content: 'Switch to English' },
      { sel: '#hinBtn', content: 'Switch to Hindi' },
      { sel: '.lang-toggle', content: null }, // skip container
    ];

    const isLight = document.body.classList.contains('light-theme');
    tooltipTargets.forEach(({ sel, content }) => {
      if (!content) return;
      const el = document.querySelector(sel);
      if (!el || el._tippyDone) return;
      el._tippyDone = true;
      window.tippy(el, {
        content,
        placement: 'bottom',
        theme: isLight ? 'light' : 'translucent',
        delay: [300, 0],
        arrow: true,
        offset: [0, 6],
      });
    });

    // Tooltip on timer — show remaining time as full sentence
    const timerBox = document.getElementById('mainTimer');
    if (timerBox && !timerBox._tippyDone) {
      timerBox._tippyDone = true;
      window.tippy(timerBox, {
        content: 'Time remaining',
        placement: 'bottom',
        theme: isLight ? 'light' : 'translucent',
      });
    }
  }

  /* ─────────────────────────────────────────────
     7. DARK-MODE TABLE FIX — inline border:1px solid
        The question/solution tables have `border:1px solid` which renders black in dark mode.
     ───────────────────────────────────────────── */
  function fixInlineBorders() {
    // Already handled by CSS, but do a JS fallback for dynamic content
    if (!document.body.classList.contains('light-theme')) {
      // Inject a style node once
      if (!document.getElementById('_360-border-fix')) {
        const s = document.createElement('style');
        s.id = '_360-border-fix';
        s.textContent = `
          body:not(.light-theme) td[style*="border"],
          body:not(.light-theme) th[style*="border"],
          body:not(.light-theme) table[style*="border"] {
            border-color: rgba(255,255,255,0.18) !important;
          }
          body.light-theme td[style*="border"],
          body.light-theme th[style*="border"],
          body.light-theme table[style*="border"] {
            border-color: #9ca3af !important;
          }
        `;
        document.head.appendChild(s);
      }
    }
  }

  /* ─────────────────────────────────────────────
     8. WRAP EXAM SUBMIT to trigger chart + cleanup
     ───────────────────────────────────────────── */
  function patchSubmitTest() {
    const exam = window.activeExam;
    if (!exam || exam._submitPatched) return;
    exam._submitPatched = true;

    const origSubmit = exam.submitTest.bind(exam);
    exam.submitTest = function () {
      origSubmit();
      clearProgressOnSubmit();
      // Slight delay to let results render
      setTimeout(() => {
        const correct = parseInt(
          document.getElementById('correctCount')?.textContent || '0',
          10
        );
        const incorrect = parseInt(
          document.getElementById('incorrectCount')?.textContent || '0',
          10
        );
        const unattempted = parseInt(
          document.getElementById('unattemptedCount')?.textContent || '0',
          10
        );
        renderResultChart(correct, incorrect, unattempted);
      }, 200);
    };
  }

  /* ─────────────────────────────────────────────
     9. KEYBOARD SHORTCUT — ArrowLeft/Right navigation
     ───────────────────────────────────────────── */
  function setupKeyboardNav() {
    if (document._360KeyNav) return;
    document._360KeyNav = true;
    document.addEventListener('keydown', function (e) {
      const exam = window.activeExam;
      if (!exam) return;
      // Only when exam container is active and no input is focused
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') exam.navigate(-1);
      if (e.key === 'ArrowRight') exam.navigate(1);
    });
  }

  /* ─────────────────────────────────────────────
     10. INIT — run after exam is started
     ───────────────────────────────────────────── */
  function init() {
    fixInlineBorders();
    setupKeyboardNav();

    // Wait for activeExam to be set (it's set inside CBTExam constructor)
    let attempts = 0;
    const pollExam = setInterval(() => {
      attempts++;
      const exam = window.activeExam;
      if (exam) {
        clearInterval(pollExam);
        patchExamConfirm();
        patchSubmitTest();
        startTimerWatch();

        // Hook into startExam to trigger auto-save and restore
        const origStartExam = exam.startExam.bind(exam);
        exam.startExam = function () {
          origStartExam();
          startAutoSave();
          setTimeout(tryRestoreProgress, 500);
          setTimeout(applyLucideIcons, 200);
          setTimeout(addTooltips, 300);
        };
      }
      if (attempts > 100) clearInterval(pollExam);
    }, 100);
  }

  // Theme change observer — refresh tooltips/chart colors on toggle
  const themeObserver = new MutationObserver(() => {
    fixInlineBorders();
    // Re-render chart with updated colors if visible
    const resultModal = document.getElementById('resultModal');
    if (resultModal && resultModal.classList.contains('show')) {
      const correct = parseInt(
        document.getElementById('correctCount')?.textContent || '0',
        10
      );
      const incorrect = parseInt(
        document.getElementById('incorrectCount')?.textContent || '0',
        10
      );
      const unattempted = parseInt(
        document.getElementById('unattemptedCount')?.textContent || '0',
        10
      );
      renderResultChart(correct, incorrect, unattempted);
    }
  });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
