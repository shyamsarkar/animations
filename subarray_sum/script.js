class SubarraySumVisualizer {
  constructor() {
    this.array = [1, 2, 3, -3, 1, 1, 1, 4, 2, -2];
    this.k = 3;
    this.steps = [];
    this.currentStep = 0;
    this.isPlaying = false;
    this.speed = 1100;
    this.playInterval = null;

    this.initializeEventListeners();
    this.generateSteps();
  }

  initializeEventListeners() {
    document.getElementById('arrayInput').addEventListener('change', (e) => this.handleArrayChange(e.target.value));
    document.getElementById('kInput').addEventListener('change', (e) => this.handleKChange(e.target.value));
    document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
    document.getElementById('prevBtn').addEventListener('click', () => { this.pause(); this.prevStep(); });
    document.getElementById('nextBtn').addEventListener('click', () => { this.pause(); this.nextStep(); });
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    document.getElementById('speedSelect').addEventListener('change', (e) => {
      this.speed = Number(e.target.value);
      if (this.isPlaying) {
        this.stopPlayInterval();
        this.startPlayInterval();
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
      if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number')) {
        this.array = parsed;
        this.generateSteps();
      }
    } catch {
      // Invalid input, keep previous array
    }
  }

  handleKChange(value) {
    const parsed = Number(value);
    if (!isNaN(parsed)) {
      this.k = parsed;
      this.generateSteps();
    }
  }

  generateSteps() {
    this.steps = [];
    if (this.array.length === 0) return;

    // We simulate the algorithm and record state at each step
    let prefixSum = 0;
    let count = 0;
    
    // Tracks frequency of prefix sums
    const prefixCount = new Map();
    prefixCount.set(0, 1);

    // Tracks indices where prefix sums occurred (-1 represents empty prefix sum)
    const prefixIndices = new Map();
    prefixIndices.set(0, [-1]);

    // Helper to clone map
    const cloneMap = (map) => new Map(map);

    // 1. Init Step
    this.steps.push({
      type: 'init',
      currentIndex: null,
      prefixSum: 0,
      targetSum: null,
      matchCount: 0,
      ledger: cloneMap(prefixCount),
      highlightSubarray: null,
      highlightLedgerKey: null,
      explanation: `Initialize: Set <code>prefix_sum = 0</code>, <code>count = 0</code>, and record the empty prefix sum <code>0</code> in the ledger with frequency <code>1</code>.`,
    });

    this.array.forEach((num, i) => {
      // 2a. Enter index
      this.steps.push({
        type: 'enter',
        currentIndex: i,
        prefixSum: prefixSum,
        targetSum: null,
        matchCount: count,
        ledger: cloneMap(prefixCount),
        highlightSubarray: null,
        highlightLedgerKey: null,
        explanation: `Visiting index <strong>${i}</strong> with value <strong>${num}</strong>.`,
      });

      // 2b. Sum update
      prefixSum += num;
      this.steps.push({
        type: 'sum',
        currentIndex: i,
        prefixSum: prefixSum,
        targetSum: null,
        matchCount: count,
        ledger: cloneMap(prefixCount),
        highlightSubarray: null,
        highlightLedgerKey: null,
        explanation: `Add current number to running sum: <code>prefix_sum += ${num}</code> &rarr; <strong>${prefixSum}</strong>.`,
      });

      // 2c. Check ledger
      const needed = prefixSum - this.k;
      const seen = prefixCount.get(needed) || 0;
      const indices = prefixIndices.get(needed) || [];
      
      this.steps.push({
        type: 'lookup',
        currentIndex: i,
        prefixSum: prefixSum,
        targetSum: needed,
        matchCount: count,
        ledger: cloneMap(prefixCount),
        highlightSubarray: null,
        highlightLedgerKey: seen > 0 ? needed : null,
        explanation: `Look up <code>prefix_sum - k</code> &rarr; <code>${prefixSum} - ${this.k}</code> = <strong>${needed}</strong> in the ledger. It has been seen <strong>${seen}</strong> time(s) before.`,
      });

      // 2d. Count update (if match found)
      if (seen > 0) {
        count += seen;
        // Determine the boundaries of matching subarrays
        // For each index in `indices`, the subarray is from index + 1 to i
        const startIdx = Math.min(...indices) + 1;
        this.steps.push({
          type: 'count',
          currentIndex: i,
          prefixSum: prefixSum,
          targetSum: needed,
          matchCount: count,
          ledger: cloneMap(prefixCount),
          highlightSubarray: { start: startIdx, end: i },
          highlightLedgerKey: needed,
          explanation: `Match found! Found <strong>${seen}</strong> subarray(s) ending at index <strong>${i}</strong> that sum to k = <strong>${this.k}</strong>. Increment count &rarr; <strong>${count}</strong>.`,
        });
      }

      // 2e. Update ledger
      const newCount = (prefixCount.get(prefixSum) || 0) + 1;
      prefixCount.set(prefixSum, newCount);
      
      if (!prefixIndices.has(prefixSum)) {
        prefixIndices.set(prefixSum, []);
      }
      prefixIndices.get(prefixSum).push(i);

      this.steps.push({
        type: 'ledger_update',
        currentIndex: i,
        prefixSum: prefixSum,
        targetSum: needed,
        matchCount: count,
        ledger: cloneMap(prefixCount),
        highlightSubarray: null,
        highlightLedgerKey: prefixSum,
        explanation: `Record the running prefix sum <strong>${prefixSum}</strong> in the ledger. Frequency becomes <strong>${newCount}</strong>.`,
      });

      // 2f. Done index
      this.steps.push({
        type: 'done',
        currentIndex: i,
        prefixSum: prefixSum,
        targetSum: null,
        matchCount: count,
        ledger: cloneMap(prefixCount),
        highlightSubarray: null,
        highlightLedgerKey: null,
        explanation: `Finished processing index <strong>${i}</strong>.`,
      });
    });

    // 3. Final Step
    this.steps.push({
      type: 'finish',
      currentIndex: null,
      prefixSum: prefixSum,
      targetSum: null,
      matchCount: count,
      ledger: cloneMap(prefixCount),
      highlightSubarray: null,
      highlightLedgerKey: null,
      explanation: `Algorithm complete. Found a total of <strong>${count}</strong> subarrays summing to k = <strong>${this.k}</strong>.`,
    });

    this.currentStep = 0;
    this.updateDisplay();
  }

  updateDisplay() {
    if (this.steps.length === 0) return;

    const step = this.steps[this.currentStep];

    // Render Array
    const arrayDisplay = document.getElementById('arrayDisplay');
    arrayDisplay.innerHTML = '';
    this.array.forEach((num, idx) => {
      const item = document.createElement('div');
      item.className = 'array-item';
      item.textContent = num;

      // Index label
      const idxLabel = document.createElement('span');
      idxLabel.className = 'array-index';
      idxLabel.textContent = idx;
      item.appendChild(idxLabel);

      // States
      if (idx === step.currentIndex) {
        item.classList.add('current');
      } else if (step.highlightSubarray && idx >= step.highlightSubarray.start && idx <= step.highlightSubarray.end) {
        item.classList.add('in-subarray');
      } else if (step.currentIndex !== null && idx < step.currentIndex) {
        item.classList.add('completed');
      }

      arrayDisplay.appendChild(item);
    });

    // Update Stats
    document.getElementById('currentIndex').textContent = step.currentIndex !== null ? step.currentIndex : '—';
    document.getElementById('prefixSum').textContent = step.prefixSum;
    document.getElementById('targetSum').textContent = step.targetSum !== null ? step.targetSum : '—';
    document.getElementById('matchCount').textContent = step.matchCount;

    // Apply plaque pop micro-animation if match count increased or target lookup found
    const matchCountCard = document.querySelector('.sub-stat-card--green');
    const targetSumCard = document.querySelector('.sub-stat-card--purple');
    
    matchCountCard.classList.remove('bump');
    targetSumCard.classList.remove('bump');
    
    if (step.type === 'count') {
      void matchCountCard.offsetWidth; // trigger reflow
      matchCountCard.classList.add('bump');
    }
    if (step.type === 'lookup' && step.highlightLedgerKey !== null) {
      void targetSumCard.offsetWidth;
      targetSumCard.classList.add('bump');
    }

    // Render Explanation
    const explanationBox = document.getElementById('explanation');
    explanationBox.innerHTML = `<strong>Step explanation:</strong><br>${step.explanation}`;

    // Render Ledger Table
    const ledgerBody = document.getElementById('ledgerBody');
    ledgerBody.innerHTML = '';
    
    // Sort keys so table is stable
    const sortedKeys = Array.from(step.ledger.keys()).sort((a, b) => a - b);
    sortedKeys.forEach((key) => {
      const tr = document.createElement('tr');
      if (step.highlightLedgerKey === key) {
        tr.className = 'highlighted';
      }
      
      // If it is a new entry or incremented in this ledger update step
      if (step.type === 'ledger_update' && step.highlightLedgerKey === key) {
        tr.classList.add('new-entry');
      }

      tr.innerHTML = `<td>${key}</td><td>${step.ledger.get(key)}</td>`;
      ledgerBody.appendChild(tr);
    });

    // Progress Bar
    const progress = ((this.currentStep + 1) / this.steps.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('stepCount').textContent = this.currentStep + 1;
    document.getElementById('totalSteps').textContent = this.steps.length;

    // Buttons Disable State
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    prevBtn.disabled = this.currentStep === 0;
    nextBtn.disabled = this.currentStep >= this.steps.length - 1;
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateDisplay();
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
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
    this.updatePlayButton();
    this.startPlayInterval();
  }

  pause() {
    this.isPlaying = false;
    this.updatePlayButton();
    this.stopPlayInterval();
  }

  startPlayInterval() {
    this.playInterval = setInterval(() => {
      if (this.currentStep >= this.steps.length - 1) {
        this.pause();
      } else {
        this.currentStep++;
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

  updatePlayButton() {
    const playIcon = document.getElementById('playIcon');
    const playText = document.getElementById('playText');

    if (this.isPlaying) {
      playIcon.textContent = '⏸';
      playText.textContent = 'Pause';
    } else {
      playIcon.textContent = '▶';
      playText.textContent = 'Play';
    }
  }

  reset() {
    this.currentStep = 0;
    this.isPlaying = false;
    this.stopPlayInterval();
    this.updatePlayButton();
    this.updateDisplay();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SubarraySumVisualizer();
});
