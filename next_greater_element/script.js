class NextGreaterElementVisualizer {
  constructor() {
    this.nums1 = [4, 1, 2];
    this.nums2 = [1, 3, 4, 2];
    this.steps = [];
    this.stepIndex = 0;
    this.isPlaying = false;
    this.speed = 1100;
    this.playInterval = null;

    this.initializeElements();
    this.initializeEventListeners();
    this.applyInputs();
  }

  initializeElements() {
    this.nums2RowEl = document.getElementById('nums2Row');
    this.nums1RowEl = document.getElementById('nums1Row');
    this.answerRowEl = document.getElementById('answerRow');
    this.stackAreaEl = document.getElementById('stackArea');
    this.mapAreaEl = document.getElementById('mapArea');
    this.descTextEl = document.getElementById('descText');
    this.stepCountEl = document.getElementById('stepCount');
    this.totalStepsEl = document.getElementById('totalSteps');
    this.progressFillEl = document.getElementById('progressFill');
    this.errorTextEl = document.getElementById('errorText');

    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.playBtn = document.getElementById('playBtn');
    this.applyBtn = document.getElementById('applyBtn');
    this.nums1Input = document.getElementById('nums1Input');
    this.nums2Input = document.getElementById('nums2Input');

    this.playIcon = document.getElementById('playIcon');
    this.playText = document.getElementById('playText');
    this.speedSelect = document.getElementById('speedSelect');
  }

  initializeEventListeners() {
    this.applyBtn.addEventListener('click', () => this.applyInputs());
    this.prevBtn.addEventListener('click', () => { this.pause(); this.goPrev(); });
    this.nextBtn.addEventListener('click', () => { this.pause(); this.goNext(); });
    this.playBtn.addEventListener('click', () => this.togglePlay());

    this.speedSelect.addEventListener('change', (e) => {
      this.speed = Number(e.target.value);
      if (this.isPlaying) {
        this.stopPlayInterval();
        this.startPlayInterval();
      }
    });

    document.addEventListener('keydown', (e) => {
      // Only step via arrow keys if the user is not actively typing in an input
      if (document.activeElement === this.nums1Input || document.activeElement === this.nums2Input) {
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

    [this.nums1Input, this.nums2Input].forEach(inp => {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.applyInputs();
        }
      });
    });
  }

  parseArray(str) {
    try {
      let trimmed = str.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        trimmed = trimmed.substring(1, trimmed.length - 1);
      }
      const parts = trimmed.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const nums = parts.map(Number);
      if (nums.length === 0 || nums.some(n => Number.isNaN(n))) return null;
      return nums;
    } catch {
      return null;
    }
  }

  generateSteps() {
    const list = [];
    const stack = [];
    const nextGreater = {};

    list.push({
      type: 'init',
      stack: [...stack],
      mapping: { ...nextGreater },
      desc: 'Starting scan of nums2. Monotonic stack starts empty.'
    });

    for (let i = 0; i < this.nums2.length; i++) {
      const num = this.nums2[i];
      list.push({
        type: 'visit',
        index: i,
        num,
        stack: [...stack],
        mapping: { ...nextGreater },
        desc: `Visiting nums2[${i}] = ${num}.`
      });

      while (stack.length && stack[stack.length - 1] < num) {
        const popped = stack.pop();
        nextGreater[popped] = num;
        list.push({
          type: 'pop',
          index: i,
          num,
          popped,
          stack: [...stack],
          mapping: { ...nextGreater },
          desc: `${num} > ${popped} &rarr; pop ${popped}. Recorded: ${popped} &rarr; ${num}.`
        });
      }

      stack.push(num);
      list.push({
        type: 'push',
        index: i,
        num,
        stack: [...stack],
        mapping: { ...nextGreater },
        desc: `Push ${num} onto the stack.`
      });
    }

    list.push({
      type: 'done-build',
      stack: [...stack],
      mapping: { ...nextGreater },
      desc: stack.length
        ? `Scan of nums2 complete. Elements [${stack.join(', ')}] remain in the stack and have no greater element.`
        : 'Scan of nums2 complete. Stack ended empty.'
    });

    const result = [];
    for (let i = 0; i < this.nums1.length; i++) {
      const num = this.nums1[i];
      const val = Object.prototype.hasOwnProperty.call(nextGreater, num) ? nextGreater[num] : -1;
      result.push(val);
      list.push({
        type: 'answer',
        index: i,
        num,
        val,
        result: [...result],
        stack: [...stack],
        mapping: { ...nextGreater },
        desc: `nums1[${i}] = ${num} &rarr; look up in map &rarr; found ${val}.`
      });
    }

    list.push({
      type: 'complete',
      result: [...result],
      stack: [...stack],
      mapping: { ...nextGreater },
      desc: `Done. Final answer list is [${result.join(', ')}].`
    });

    this.steps = list;
  }

  tagFor(type) {
    switch (type) {
      case 'visit': return '<span class="tag visit" style="display: inline-block; font-size: 10px; font-weight:600; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; margin-right: 10px; background: rgba(255,180,84,0.15); color: var(--amber); border: 1px solid rgba(255,180,84,0.4); vertical-align: middle;">VISIT</span>';
      case 'pop': return '<span class="tag pop" style="display: inline-block; font-size: 10px; font-weight:600; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; margin-right: 10px; background: rgba(255,111,111,0.15); color: var(--coral); border: 1px solid rgba(255,111,111,0.4); vertical-align: middle;">POP</span>';
      case 'push': return '<span class="tag push" style="display: inline-block; font-size: 10px; font-weight:600; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; margin-right: 10px; background: rgba(91,227,163,0.15); color: var(--mint); border: 1px solid rgba(91,227,163,0.4); vertical-align: middle;">PUSH</span>';
      case 'answer': return '<span class="tag answer" style="display: inline-block; font-size: 10px; font-weight:600; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; margin-right: 10px; background: rgba(125,211,252,0.15); color: var(--sky); border: 1px solid rgba(125,211,252,0.4); vertical-align: middle;">LOOKUP</span>';
      case 'complete': return '<span class="tag answer" style="display: inline-block; font-size: 10px; font-weight:600; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; margin-right: 10px; background: rgba(125,211,252,0.15); color: var(--sky); border: 1px solid rgba(125,211,252,0.4); vertical-align: middle;">DONE</span>';
      default: return '<span class="tag info" style="display: inline-block; font-size: 10px; font-weight:600; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; margin-right: 10px; background: rgba(124,136,152,0.15); color: var(--text-secondary); border: 1px solid rgba(124,136,152,0.4); vertical-align: middle;">INFO</span>';
    }
  }

  updateDisplay() {
    if (this.steps.length === 0) return;

    const step = this.steps[this.stepIndex];
    const prevStep = this.stepIndex > 0 ? this.steps[this.stepIndex - 1] : null;

    // Set description and step counter details
    this.descTextEl.innerHTML = this.tagFor(step.type) + ' ' + step.desc;
    this.stepCountEl.textContent = this.stepIndex;
    this.totalStepsEl.textContent = this.steps.length - 1;

    const progress = (this.stepIndex / (this.steps.length - 1)) * 100;
    this.progressFillEl.style.width = `${progress}%`;

    // Handle button disabling
    this.prevBtn.disabled = this.stepIndex === 0;
    this.nextBtn.disabled = this.stepIndex === this.steps.length - 1;

    // Render nums2 row
    this.nums2RowEl.innerHTML = '';
    this.nums2.forEach((num, i) => {
      const box = document.createElement('div');
      box.className = 'box';
      if (typeof step.index === 'number' && (step.type === 'visit' || step.type === 'pop' || step.type === 'push')) {
        if (i === step.index) box.classList.add('current');
        else if (i < step.index) box.classList.add('done');
        else box.classList.add('pending');
      } else if (step.type === 'done-build' || step.type === 'answer' || step.type === 'complete') {
        box.classList.add('done');
      } else {
        box.classList.add('pending');
      }
      box.innerHTML = `<span class="idx">${i}</span>${num}`;
      this.nums2RowEl.appendChild(box);
    });

    // Render stack
    this.stackAreaEl.innerHTML = '';
    const stackToShow = step.type === 'pop' ? [...step.stack, step.popped] : step.stack;
    if (stackToShow.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'nge-stack-floor';
      empty.textContent = '— empty —';
      this.stackAreaEl.appendChild(empty);
    } else {
      stackToShow.forEach((val, i) => {
        const block = document.createElement('div');
        block.className = 'nge-stack-block';
        block.textContent = val;
        const isTop = i === stackToShow.length - 1;
        if (step.type === 'pop' && isTop && val === step.popped) {
          block.classList.add('leaving');
        } else if (step.type === 'push' && isTop && prevStep && prevStep.stack.length < step.stack.length) {
          block.classList.add('entering');
        }
        this.stackAreaEl.appendChild(block);
      });
    }

    // Render key-value map mappings
    this.mapAreaEl.innerHTML = '';
    const mapKeys = Object.keys(step.mapping);
    if (mapKeys.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'nge-map-empty';
      empty.textContent = 'nothing recorded yet';
      this.mapAreaEl.appendChild(empty);
    } else {
      mapKeys.forEach(k => {
        const row = document.createElement('div');
        row.className = 'nge-map-row';
        if (step.type === 'pop' && Number(k) === step.popped) {
          row.classList.add('fresh');
        }
        row.innerHTML = `${k} <span class="arrow">&rarr;</span> ${step.mapping[k]}`;
        this.mapAreaEl.appendChild(row);
      });
    }

    // Render nums1 row
    this.nums1RowEl.innerHTML = '';
    this.nums1.forEach((num, i) => {
      const box = document.createElement('div');
      box.className = 'box';
      if (step.type === 'answer' && i === step.index) {
        box.classList.add('current');
      }
      box.innerHTML = `<span class="idx">${i}</span>${num}`;
      this.nums1RowEl.appendChild(box);
    });

    // Render answer row
    this.answerRowEl.innerHTML = '';
    const resultSoFar = (step.type === 'answer' || step.type === 'complete') ? step.result : [];
    this.nums1.forEach((num, i) => {
      const box = document.createElement('div');
      box.className = 'box';
      if (i < resultSoFar.length) {
        box.classList.add('answer-filled');
        if (step.type === 'answer' && i === step.index) {
          box.classList.add('just-answered');
        }
        box.textContent = resultSoFar[i];
      } else {
        box.classList.add('answer-empty');
        box.textContent = '?';
      }
      box.innerHTML = `<span class="idx">${i}</span>` + box.innerHTML;
      this.answerRowEl.appendChild(box);
    });
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

  applyInputs() {
    const p1 = this.parseArray(this.nums1Input.value);
    const p2 = this.parseArray(this.nums2Input.value);
    if (!p1 || !p2) {
      this.errorTextEl.textContent = 'Please enter valid comma-separated integers for both arrays.';
      return;
    }

    const p2Set = new Set(p2);
    if (p2Set.size !== p2.length) {
      this.errorTextEl.textContent = 'Warning: nums2 contains duplicate values. Next Greater Element requires unique values in nums2.';
    } else {
      const missing = p1.filter(n => !p2Set.has(n));
      if (missing.length > 0) {
        this.errorTextEl.textContent = `Note: nums1 has value(s) not present in nums2 (${missing.join(', ')}) — they'll resolve to -1.`;
      } else {
        this.errorTextEl.textContent = '';
      }
    }

    this.nums1 = p1;
    this.nums2 = p2;
    this.pause();
    this.generateSteps();
    this.stepIndex = 0;
    this.updateDisplay();
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
}

document.addEventListener('DOMContentLoaded', () => {
  new NextGreaterElementVisualizer();
});
