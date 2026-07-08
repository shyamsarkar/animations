class HouseRobberVisualizer {
  constructor() {
    this.array = [2, 7, 9, 3, 1];
    this.steps = [];
    this.stepIndex = 0;
    this.isPlaying = false;
    this.speed = 1000;
    this.playInterval = null;

    this.initializeElements();
    this.initializeEventListeners();
    this.generateSteps();
    this.updateDisplay();
  }

  initializeElements() {
    this.housesDisplay = document.getElementById('housesDisplay');

    // Parity variable cards
    this.evenCard = document.getElementById('evenCard');
    this.evenValEl = document.getElementById('evenVal');
    this.evenPathEl = document.getElementById('evenPath');
    this.oddCard = document.getElementById('oddCard');
    this.oddValEl = document.getElementById('oddVal');
    this.oddPathEl = document.getElementById('oddPath');

    // Decision elements
    this.decisionBox = document.getElementById('decisionBox');
    this.robOptionEl = document.getElementById('robOption');
    this.skipOptionEl = document.getElementById('skipOption');
    this.robFormulaEl = document.getElementById('robFormula');
    this.skipFormulaEl = document.getElementById('skipFormula');
    this.robValEl = document.getElementById('robVal');
    this.skipValEl = document.getElementById('skipVal');
    this.decisionVsEl = document.getElementById('decisionVs');

    // General UI
    this.explanationBox = document.getElementById('explanation');
    this.stepCountEl = document.getElementById('stepCount');
    this.totalStepsEl = document.getElementById('totalSteps');
    this.progressFillEl = document.getElementById('progressFill');
    this.errorTextEl = document.getElementById('errorText');
    this.resultBox = document.getElementById('resultBox');
    this.resultSumEl = document.getElementById('resultSum');
    this.resultPathEl = document.getElementById('resultPath');

    // Controls
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.playBtn = document.getElementById('playBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.arrayInput = document.getElementById('arrayInput');
    this.playIcon = document.getElementById('playIcon');
    this.playText = document.getElementById('playText');
    this.speedSelect = document.getElementById('speedSelect');
  }

  initializeEventListeners() {
    this.arrayInput.addEventListener('change', (e) => this.handleArrayChange(e.target.value));
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.nextBtn.addEventListener('click', () => { this.pause(); this.goNext(); });
    this.prevBtn.addEventListener('click', () => { this.pause(); this.goPrev(); });
    this.resetBtn.addEventListener('click', () => this.reset());

    this.speedSelect.addEventListener('change', (e) => {
      this.speed = Number(e.target.value);
      if (this.isPlaying) {
        this.stopPlayInterval();
        this.startPlayInterval();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (document.activeElement === this.arrayInput) {
        return;
      }
      if (e.key === 'ArrowRight') {
        this.pause();
        this.goNext();
      }
      if (e.key === 'ArrowLeft') {
        this.pause();
        this.goPrev();
      }
    });
  }

  handleArrayChange(value) {
    try {
      let parsed;
      const trimmed = value.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        parsed = JSON.parse(trimmed);
      } else {
        parsed = JSON.parse(`[${trimmed}]`);
      }

      if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number' && !isNaN(n) && n >= 0)) {
        this.array = parsed;
        this.errorTextEl.textContent = '';
        this.pause();
        this.generateSteps();
        this.stepIndex = 0;
        this.updateDisplay();
      } else {
        this.errorTextEl.textContent = 'Please enter a valid array of non-negative numbers.';
      }
    } catch {
      this.errorTextEl.textContent = 'Invalid array format. Use comma-separated numbers.';
    }
  }

  generateSteps() {
    this.steps = [];
    if (this.array.length === 0) return;

    let even = 0;
    let odd = 0;
    let evenPath = [];
    let oddPath = [];

    // Step 0: Initialization
    this.steps.push({
      stage: 'init',
      index: -1,
      even,
      odd,
      evenPath: [...evenPath],
      oddPath: [...oddPath],
      desc: 'Initialize parity totals: <code>even = 0</code>, <code>odd = 0</code>. Both robber path histories start empty.'
    });

    // Run DP parity steps
    for (let i = 0; i < this.array.length; i++) {
      const num = this.array[i];
      const isEven = i % 2 === 0;

      // Stage 1: Evaluate choices at index i
      let formulaRob = '';
      let formulaSkip = '';
      let robVal = 0;
      let skipVal = 0;

      if (isEven) {
        robVal = even + num;
        skipVal = odd;
        formulaRob = `even + num = ${even} + ${num}`;
        formulaSkip = `odd = ${odd}`;
      } else {
        robVal = odd + num;
        skipVal = even;
        formulaRob = `odd + num = ${odd} + ${num}`;
        formulaSkip = `even = ${even}`;
      }

      this.steps.push({
        stage: 'evaluate',
        index: i,
        even,
        odd,
        evenPath: [...evenPath],
        oddPath: [...oddPath],
        robVal,
        skipVal,
        formulaRob,
        formulaSkip,
        isEven,
        desc: `Evaluating house <strong>${i}</strong> (Value: ${num}, Index is <strong>${isEven ? 'Even' : 'Odd'}</strong>). <br>Compare the options: <strong>Rob</strong> (add value to the last ${isEven ? 'Even' : 'Odd'} sum) vs. <strong>Skip</strong> (keep the current ${isEven ? 'Odd' : 'Even'} sum).`
      });

      // Stage 2: Apply the maximum option and update parity variable
      let nextEven = even;
      let nextOdd = odd;
      let nextEvenPath = [...evenPath];
      let nextOddPath = [...oddPath];
      let choice = '';

      if (isEven) {
        if (robVal >= skipVal) {
          nextEven = robVal;
          nextEvenPath = [...evenPath, i];
          choice = 'rob';
        } else {
          nextEven = skipVal;
          nextEvenPath = [...oddPath];
          choice = 'skip';
        }
      } else {
        if (robVal >= skipVal) {
          nextOdd = robVal;
          nextOddPath = [...oddPath, i];
          choice = 'rob';
        } else {
          nextOdd = skipVal;
          nextOddPath = [...evenPath];
          choice = 'skip';
        }
      }

      even = nextEven;
      odd = nextOdd;
      evenPath = nextEvenPath;
      oddPath = nextOddPath;

      const updatedVar = isEven ? 'even' : 'odd';
      const detailText = choice === 'rob'
        ? `Rob option is larger (${robVal} &ge; ${skipVal}). We rob house ${i}. Update <code>${updatedVar}</code> to <strong>${robVal}</strong> and add house ${i} to its path.`
        : `Skip option is larger (${skipVal} &gt; ${robVal}). We skip house ${i} to maximize loot without alerting police. Update <code>${updatedVar}</code> to <strong>${skipVal}</strong> by copying the alternate path.`;

      this.steps.push({
        stage: 'apply',
        index: i,
        even,
        odd,
        evenPath: [...evenPath],
        oddPath: [...oddPath],
        robVal,
        skipVal,
        formulaRob,
        formulaSkip,
        isEven,
        choice,
        desc: `Decision: <strong>${choice.toUpperCase()}</strong>. <br>${detailText}`
      });
    }

    // Step Final: Complete
    const finalMax = Math.max(even, odd);
    const finalPath = even > odd ? evenPath : oddPath;

    this.steps.push({
      stage: 'complete',
      index: this.array.length,
      even,
      odd,
      evenPath: [...evenPath],
      oddPath: [...oddPath],
      finalMax,
      finalPath: [...finalPath],
      desc: `Finished stepping through all houses. The maximum loot is <code>max(even, odd) = max(${even}, ${odd}) = ${finalMax}</code>. <br>The optimal houses robbed are: <strong>${finalPath.join(', ')}</strong>.`
    });
  }

  updateDisplay() {
    if (this.steps.length === 0) return;

    const step = this.steps[this.stepIndex];

    // 1. Progress indicators
    this.stepCountEl.textContent = this.stepIndex;
    this.totalStepsEl.textContent = this.steps.length - 1;
    const progress = (this.stepIndex / (this.steps.length - 1)) * 100;
    this.progressFillEl.style.width = `${progress}%`;

    // Disable buttons appropriately
    this.prevBtn.disabled = this.stepIndex === 0;
    this.nextBtn.disabled = this.stepIndex === this.steps.length - 1;

    // 2. Render Houses Row
    this.housesDisplay.innerHTML = '';

    // Figure out which houses are currently selected/robbed in the active path
    let currentRobbedSet = new Set();
    if (step.stage === 'complete') {
      currentRobbedSet = new Set(step.finalPath);
    } else {
      // If we are at index i, the active parity depends on index
      // But we can show the robbed houses according to the choice if applied,
      // or show the paths stored in evenPath / oddPath.
      // Let's color-code houses if they are in the active path being built.
      if (step.index >= 0 && step.index < this.array.length) {
        const isCurrentEven = step.index % 2 === 0;
        currentRobbedSet = new Set(isCurrentEven ? step.evenPath : step.oddPath);
      } else {
        currentRobbedSet = new Set(step.even > step.odd ? step.evenPath : step.oddPath);
      }
    }

    this.array.forEach((val, idx) => {
      const card = document.createElement('div');
      card.className = 'house-card';

      const isCurrent = idx === step.index;

      // Determine if skipped
      const isPast = idx < step.index || step.stage === 'complete';
      const isRobbed = currentRobbedSet.has(idx);

      if (isCurrent && (step.stage === 'evaluate' || step.stage === 'apply')) {
        card.classList.add('current');
      } else if (isPast) {
        if (isRobbed) {
          card.classList.add('robbed');
        } else {
          card.classList.add('skipped');
        }
      }

      // Inside layout for house card
      card.innerHTML = `
        <span class="house-index">House ${idx}</span>
        <div class="house-icon-wrapper">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${isRobbed && isPast
          ? `<path d="M19 7h-8L9 21h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"/><path d="M12 2v4M8 5V2M16 5V2"/>` // custom bag-like path or house
          : `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>` // standard house icon
        }
          </svg>
        </div>
        <span class="house-value">${val}</span>
      `;
      this.housesDisplay.appendChild(card);
    });

    // 3. Render Parity Variables
    this.evenValEl.textContent = step.even;
    this.evenPathEl.textContent = `Path: [${step.evenPath.join(', ')}]`;
    this.oddValEl.textContent = step.odd;
    this.oddPathEl.textContent = `Path: [${step.oddPath.join(', ')}]`;

    // Active glows for even / odd cards
    this.evenCard.className = 'hr-var-card';
    this.oddCard.className = 'hr-var-card';

    if (step.index >= 0 && step.index < this.array.length && (step.stage === 'evaluate' || step.stage === 'apply')) {
      if (step.isEven) {
        this.evenCard.classList.add('active-even');
      } else {
        this.oddCard.classList.add('active-odd');
      }
    }

    // 4. Render Decision / Comparison Bubble
    if (step.stage === 'evaluate' || step.stage === 'apply') {
      this.decisionBox.style.display = 'block';

      this.robFormulaEl.textContent = step.formulaRob;
      this.robValEl.textContent = step.robVal;
      this.skipFormulaEl.textContent = step.formulaSkip;
      this.skipValEl.textContent = step.skipVal;

      this.robOptionEl.className = 'hr-decision-option';
      this.skipOptionEl.className = 'hr-decision-option';

      if (step.stage === 'apply') {
        if (step.choice === 'rob') {
          this.robOptionEl.classList.add('chosen');
          this.decisionVsEl.textContent = '≥';
        } else {
          this.skipOptionEl.classList.add('chosen');
          this.decisionVsEl.textContent = '<';
        }
      } else {
        this.decisionVsEl.textContent = 'vs';
      }
    } else {
      this.decisionBox.style.display = 'none';
    }

    // 5. Update explanation text
    this.explanationBox.innerHTML = `<strong>Step ${this.stepIndex} Explanation:</strong><br>${step.desc}`;

    // 6. Handle result box at the end
    if (step.stage === 'complete') {
      this.resultBox.classList.add('show');
      this.resultSumEl.textContent = step.finalMax;
      this.resultPathEl.textContent = `[${step.finalPath.join(', ')}]`;
    } else {
      this.resultBox.classList.remove('show');
    }
  }

  goNext() {
    if (this.stepIndex < this.steps.length - 1) {
      this.stepIndex++;
      this.updateDisplay();
    } else {
      this.pause();
    }
  }

  goPrev() {
    if (this.stepIndex > 0) {
      this.stepIndex--;
      this.updateDisplay();
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    this.playIcon.textContent = '⏸';
    this.playText.textContent = 'Pause';
    if (this.stepIndex === this.steps.length - 1) {
      this.stepIndex = 0;
      this.updateDisplay();
    }
    this.startPlayInterval();
  }

  pause() {
    this.isPlaying = false;
    this.playIcon.textContent = '▶';
    this.playText.textContent = 'Play';
    this.stopPlayInterval();
  }

  startPlayInterval() {
    this.playInterval = setInterval(() => {
      if (this.stepIndex >= this.steps.length - 1) {
        this.pause();
      } else {
        this.stepIndex++;
        this.updateDisplay();
      }
    }, this.speed);
  }

  stopPlayInterval() {
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
  }

  reset() {
    this.stepIndex = 0;
    this.pause();
    this.updateDisplay();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new HouseRobberVisualizer();
});
