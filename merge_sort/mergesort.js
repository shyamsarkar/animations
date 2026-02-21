class MergesortVisualizer {
  constructor() {
    this.array = [64, 34, 25, 12, 22, 11, 90, 88, 45, 50];
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
    this.prevStepBtn.addEventListener('click', () => this.handlePreviousStep());
    this.nextStepBtn.addEventListener('click', () => this.handleNextStep());
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

    const merge = (array, left, mid, right) => {
      const leftArr = array.slice(left, mid + 1);
      const rightArr = array.slice(mid + 1, right + 1);

      steps.push({
        array: [...array],
        message: `Merging subarrays: [${leftArr.join(', ')}] and [${rightArr.join(', ')}]`,
        mergeRange: { left, mid, right },
        action: 'start-merge'
      });

      let i = 0, j = 0, k = left;

      while (i < leftArr.length && j < rightArr.length) {
        steps.push({
          array: [...array],
          message: `Comparing ${leftArr[i]} (from left) and ${rightArr[j]} (from right)`,
          mergeRange: { left, mid, right },
          comparing: { i: left + i, j: mid + 1 + j, k }
        });

        if (leftArr[i] <= rightArr[j]) {
          array[k] = leftArr[i];
          steps.push({
            array: [...array],
            message: `${leftArr[i]} <= ${rightArr[j]}, placing ${leftArr[i]} at index ${k}`,
            mergeRange: { left, mid, right },
            comparing: { i: left + i, j: mid + 1 + j, k }
          });
          i++;
        } else {
          array[k] = rightArr[j];
          steps.push({
            array: [...array],
            message: `${leftArr[i]} > ${rightArr[j]}, placing ${rightArr[j]} at index ${k}`,
            mergeRange: { left, mid, right },
            comparing: { i: left + i, j: mid + 1 + j, k }
          });
          j++;
        }
        k++;
      }

      while (i < leftArr.length) {
        array[k] = leftArr[i];
        steps.push({
          array: [...array],
          message: `Copying remaining element ${leftArr[i]} from left subarray to index ${k}`,
          mergeRange: { left, mid, right }
        });
        i++;
        k++;
      }

      while (j < rightArr.length) {
        array[k] = rightArr[j];
        steps.push({
          array: [...array],
          message: `Copying remaining element ${rightArr[j]} from right subarray to index ${k}`,
          mergeRange: { left, mid, right }
        });
        j++;
        k++;
      }

      steps.push({
        array: [...array],
        message: `Merge complete for range [${left}, ${right}]`,
        mergeRange: { left, mid, right },
        action: 'end-merge'
      });
    };

    const mergeSort = (array, left, right) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);

        steps.push({
          array: [...array],
          message: `Dividing array from index ${left} to ${right}`,
          divideRange: { left, mid, right }
        });

        mergeSort(array, left, mid);
        mergeSort(array, mid + 1, right);
        merge(array, left, mid, right);
      }
    };

    mergeSort(arr, 0, arr.length - 1);

    steps.push({
      array: arr,
      message: 'Sorting complete!',
      action: 'complete'
    });

    this.sortSteps = steps;
  }

  renderStep(step) {
    this.showStatus(step.message);
    this.renderArray(step);
  }

  renderArray(step = null) {
    this.arrayContainer.innerHTML = '';

    const array = step ? step.array : this.array;
    const maxValue = Math.max(...array);
    const maxHeight = 300;

    array.forEach((value, index) => {
      const element = document.createElement('div');
      element.className = 'array-element';

      const bar = document.createElement('div');
      bar.className = 'bar';

      // Apply styling based on step information
      if (step) {
        if (step.mergeRange) {
          const { left, mid, right } = step.mergeRange;
          if (index >= left && index <= right) {
            bar.classList.add('merge-active');
          }
        }

        if (step.divideRange) {
          const { left, right } = step.divideRange;
          if (index >= left && index <= right) {
            bar.classList.add('divide-active');
          }
        }

        if (step.comparing) {
          const { i, j } = step.comparing;
          if (index === i || index === j) {
            bar.classList.add('comparing');
          }
        }

        if (step.action === 'complete') {
          bar.classList.add('sorted');
        }
      }

      const height = (value / maxValue) * maxHeight;
      bar.style.height = `${height}px`;

      const valueLabel = document.createElement('div');
      valueLabel.className = 'value';
      valueLabel.textContent = value;

      element.appendChild(bar);
      element.appendChild(valueLabel);

      this.arrayContainer.appendChild(element);
    });
  }

  showStatus(message) {
    this.statusMessage.textContent = message;
  }
}

export default MergesortVisualizer;
