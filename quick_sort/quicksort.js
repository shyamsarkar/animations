class QuicksortVisualizer {
  constructor() {
    this.array = [64, 34, 25, 12, 22, 11, 90, 88, 45, 50];
    this.pivotStrategy = 'first';
    this.sortSteps = [];
    this.currentStep = 0;
    this.isSorting = false;

    this.initializeElements();
    this.attachEventListeners();
    this.renderArray();
  }

  initializeElements() {
    this.arrayInput = document.getElementById('array-input');
    this.setArrayBtn = document.getElementById('btn-visualize');
    this.pivotFirstBtn = document.getElementById('pivot-first');
    this.pivotLastBtn = document.getElementById('pivot-last');
    this.pivotMiddleBtn = document.getElementById('pivot-middle');
    this.prevStepBtn = document.getElementById('btn-prev');
    this.nextStepBtn = document.getElementById('btn-next');
    this.arrayContainer = document.getElementById('array-container');
    this.statusMessage = document.getElementById('message-text');
    this.stepCounter = document.getElementById('step-counter');
    this.progressBar = document.getElementById('progress-bar');

    this.arrayInput.value = this.array.join(', ');
  }

  attachEventListeners() {
    this.setArrayBtn.addEventListener('click', () => this.handleStartSort());
    this.pivotFirstBtn.addEventListener('click', () => this.handlePivotSelection('first'));
    this.pivotLastBtn.addEventListener('click', () => this.handlePivotSelection('last'));
    this.pivotMiddleBtn.addEventListener('click', () => this.handlePivotSelection('middle'));
    this.prevStepBtn.addEventListener('click', () => this.handlePreviousStep());
    this.nextStepBtn.addEventListener('click', () => this.handleNextStep());
  }

  handlePivotSelection(strategy) {
    this.pivotStrategy = strategy;

    document.querySelectorAll('.mh-btn-group-item').forEach(btn => btn.classList.remove('active'));
    if (strategy === 'first') this.pivotFirstBtn.classList.add('active');
    else if (strategy === 'last') this.pivotLastBtn.classList.add('active');
    else if (strategy === 'middle') this.pivotMiddleBtn.classList.add('active');

    this.showStatus(`Pivot strategy set to: ${strategy}`);
  }

  handleStartSort() {
    const input = this.arrayInput.value.trim();
    const numbers = input.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));

    if (numbers.length === 0) {
      this.showStatus('Please enter valid numbers!');
      return;
    }

    this.array = numbers;
    this.sortSteps = [];
    this.currentStep = 0;
    this.isSorting = true;

    this.generateSortSteps([...this.array]);

    this.setArrayBtn.disabled = true;
    this.prevStepBtn.disabled = true;
    this.nextStepBtn.disabled = false;

    this.showStatus('Sorting started! Click "Next" to proceed.');
    this.updateStepCounter();
  }

  handleNextStep() {
    if (this.currentStep >= this.sortSteps.length) {
      this.showStatus('Sorting complete!');
      this.nextStepBtn.disabled = true;
      this.isSorting = false;
      return;
    }

    const step = this.sortSteps[this.currentStep];
    this.renderStep(step);
    this.currentStep++;

    this.prevStepBtn.disabled = this.currentStep <= 1;
    this.updateStepCounter();
    if (this.currentStep >= this.sortSteps.length) {
      this.nextStepBtn.disabled = true;
    }
  }

  handlePreviousStep() {
    if (this.currentStep <= 1) {
      return;
    }

    this.currentStep--;
    const step = this.sortSteps[this.currentStep - 1];
    this.renderStep(step);

    this.prevStepBtn.disabled = this.currentStep <= 1;
    this.nextStepBtn.disabled = false;
    this.updateStepCounter();
  }

  updateStepCounter() {
    const total = this.sortSteps.length;
    this.stepCounter.textContent = `Step ${this.currentStep} / ${total}`;
    
    if (total > 0) {
      const progress = (this.currentStep / total) * 100;
      this.progressBar.style.width = `${progress}%`;
    }
  }

  generateSortSteps(arr) {
    const steps = [];

    const quicksort = (array, low, high) => {
      if (low < high) {
        const pi = partition(array, low, high);
        quicksort(array, low, pi - 1);
        quicksort(array, pi + 1, high);
      }
    };

    const partition = (array, low, high) => {
      let pivotIndex;
      if (this.pivotStrategy === 'first') {
        pivotIndex = low;
      } else if (this.pivotStrategy === 'last') {
        pivotIndex = high;
      } else {
        pivotIndex = Math.floor((low + high) / 2);
      }

      if (pivotIndex !== high) {
        [array[pivotIndex], array[high]] = [array[high], array[pivotIndex]];
        steps.push({
          array: [...array],
          message: `Moving pivot from index ${pivotIndex} to end`,
          pivot: high,
          i: null,
          j: null
        });
      }

      const pivot = array[high];
      let i = low - 1;

      steps.push({
        array: [...array],
        message: `Partition starting. Pivot = ${pivot} at index ${high}`,
        pivot: high,
        i: i,
        j: null
      });

      for (let j = low; j < high; j++) {
        steps.push({
          array: [...array],
          message: `Comparing arr[${j}] = ${array[j]} with pivot = ${pivot}`,
          pivot: high,
          i: i,
          j: j,
          comparing: true
        });

        if (array[j] < pivot) {
          i++;
          steps.push({
            array: [...array],
            message: `arr[${j}] = ${array[j]} < ${pivot}, so swapping arr[${i}] and arr[${j}]`,
            pivot: high,
            i: i,
            j: j,
            swapping: true
          });

          [array[i], array[j]] = [array[j], array[i]];

          steps.push({
            array: [...array],
            message: `Swapped! arr[${i}] = ${array[i]}, arr[${j}] = ${array[j]}`,
            pivot: high,
            i: i,
            j: j
          });
        } else {
          steps.push({
            array: [...array],
            message: `arr[${j}] = ${array[j]} >= ${pivot}, no swap needed`,
            pivot: high,
            i: i,
            j: j
          });
        }
      }

      steps.push({
        array: [...array],
        message: `Placing pivot in correct position: swapping arr[${i + 1}] and arr[${high}]`,
        pivot: high,
        i: i + 1,
        j: high,
        swapping: true
      });

      [array[i + 1], array[high]] = [array[high], array[i + 1]];

      steps.push({
        array: [...array],
        message: `Pivot ${pivot} is now in correct position at index ${i + 1}`,
        pivot: i + 1,
        i: null,
        j: null
      });

      return i + 1;
    };

    quicksort(arr, 0, arr.length - 1);

    steps.push({
      array: arr,
      message: 'Sorting complete!',
      pivot: null,
      i: null,
      j: null
    });

    this.sortSteps = steps;
  }

  renderStep(step) {
    this.showStatus(step.message);
    this.renderArray(step.array, step.pivot, step.i, step.j, step.comparing, step.swapping);
  }

  renderArray(array = this.array, pivotIndex = null, iIndex = null, jIndex = null, comparing = false, swapping = false) {
    this.arrayContainer.innerHTML = '';

    const maxValue = Math.max(...array);
    const maxHeight = 300;

    array.forEach((value, index) => {
      const element = document.createElement('div');
      element.className = 'array-element';

      const bar = document.createElement('div');
      bar.className = 'bar';

      if (index === pivotIndex) {
        bar.classList.add('pivot');
      } else if (index === iIndex) {
        bar.classList.add('i-pointer');
      } else if (index === jIndex) {
        bar.classList.add('j-pointer');
      }

      if (comparing && (index === jIndex || index === pivotIndex)) {
        bar.classList.add('comparing');
      }

      if (swapping && (index === iIndex || index === jIndex)) {
        bar.classList.add('swapping');
      }

      const height = (value / maxValue) * maxHeight;
      bar.style.height = `${height}px`;

      const valueLabel = document.createElement('div');
      valueLabel.className = 'value';
      valueLabel.textContent = value;

      const pointerLabel = document.createElement('div');
      pointerLabel.className = 'pointer-label';

      if (index === pivotIndex) {
        pointerLabel.textContent = 'pivot';
        pointerLabel.classList.add('pivot-label');
      } else if (index === iIndex) {
        pointerLabel.textContent = 'i';
        pointerLabel.classList.add('i-label');
      } else if (index === jIndex) {
        pointerLabel.textContent = 'j';
        pointerLabel.classList.add('j-label');
      }

      element.appendChild(pointerLabel);
      element.appendChild(bar);
      element.appendChild(valueLabel);

      this.arrayContainer.appendChild(element);
    });
  }

  showStatus(message) {
    this.statusMessage.textContent = message;
  }
}

export default QuicksortVisualizer;
