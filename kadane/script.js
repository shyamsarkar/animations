class KadaneVisualizer {
  constructor() {
    this.array = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
    this.steps = [];
    this.currentStep = 0;
    this.isPlaying = false;
    this.speed = 1000;
    this.playInterval = null;
    this.initializeEventListeners();
    this.generateSteps();
  }

  initializeEventListeners() {
    document.getElementById('arrayInput').addEventListener('change', (e) => this.handleArrayChange(e.target.value));
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
        this.updateDisplay();
      }
    } catch {
      // Invalid input, keep previous array
    }
  }

  generateSteps() {
    this.steps = [];
    if (this.array.length === 0) return;

    let maxSum = this.array[0];
    let currentSum = this.array[0];
    let maxStart = 0;
    let maxEnd = 0;
    let currentStart = 0;

    this.steps.push({
      index: 0,
      currentSum,
      maxSum,
      currentStart: 0,
      maxStart: 0,
      maxEnd: 0,
    });

    for (let i = 1; i < this.array.length; i++) {
      if (currentSum < 0) {
        currentSum = this.array[i];
        currentStart = i;
      } else {
        currentSum += this.array[i];
      }

      if (currentSum > maxSum) {
        maxSum = currentSum;
        maxStart = currentStart;
        maxEnd = i;
      }

      this.steps.push({
        index: i,
        currentSum,
        maxSum,
        currentStart,
        maxStart,
        maxEnd,
      });
    }

    this.currentStep = 0;
    this.updateDisplay();
  }

  updateDisplay() {
    if (this.steps.length === 0) return;

    const step = this.steps[this.currentStep];

    const arrayDisplay = document.getElementById('arrayDisplay');
    arrayDisplay.innerHTML = '';
    this.array.forEach((num, idx) => {
      const isCurrentIndex = idx === step.index;
      const isInCurrentSubarray = idx >= step.currentStart && idx <= step.index;
      const isInMaxSubarray = idx >= step.maxStart && idx <= step.maxEnd;

      const item = document.createElement('div');
      item.className = 'array-item';
      item.textContent = num;

      if (isCurrentIndex) {
        item.classList.add('current');
      } else if (isInMaxSubarray && this.currentStep === this.steps.length - 1) {
        item.classList.add('in-max');
      } else if (isInCurrentSubarray) {
        item.classList.add('in-current');
      }

      arrayDisplay.appendChild(item);
    });

    document.getElementById('currentIndex').textContent = step.index;
    document.getElementById('currentSum').textContent = step.currentSum;
    document.getElementById('maxSum').textContent = step.maxSum;

    const explanationBox = document.getElementById('explanation');
    let explanation = '';
    if (this.currentStep === 0) {
      explanation = `Initialize: Set current_sum and max_sum to the first element (${this.array[0]})`;
    } else {
      const prevStep = this.steps[this.currentStep - 1];
      if (step.currentSum < this.array[step.index]) {
        explanation = `Previous sum was negative (${prevStep.currentSum}), so we start a new subarray at index ${step.index} with value ${this.array[step.index]}`;
      } else {
        explanation = `Add ${this.array[step.index]} to current sum. New current_sum = ${step.currentSum}`;
      }
      if (step.maxSum > prevStep.maxSum) {
        explanation += ` → <span style="font-weight: 600; color: #15803d;">New maximum found!</span>`;
      }
    }
    explanationBox.innerHTML = `<strong>Current Step Explanation:</strong><br>${explanation}`;

    const progress = ((this.currentStep + 1) / this.steps.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('stepCount').textContent = this.currentStep + 1;
    document.getElementById('totalSteps').textContent = this.steps.length;

    const resultBox = document.getElementById('resultBox');
    if (this.currentStep === this.steps.length - 1) {
      resultBox.classList.add('show');
      document.getElementById('resultSum').textContent = step.maxSum;
      document.getElementById('resultStart').textContent = step.maxStart;
      document.getElementById('resultEnd').textContent = step.maxEnd;
      document.getElementById('resultArray').textContent = `[${this.array
        .slice(step.maxStart, step.maxEnd + 1)
        .join(', ')}]`;
    } else {
      resultBox.classList.remove('show');
    }

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
  new KadaneVisualizer();
});

