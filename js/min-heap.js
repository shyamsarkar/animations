const DEFAULT_ARRAY = [9, 4, 7, 2, 6, 1];
const NODE_RADIUS = 22;
const LEVEL_HEIGHT = 80;
const SVG_PADDING_TOP = 40;

let steps = [];
let currentStep = 0;

function heapifyDown(arr, n, i, stepList) {
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  const childrenExist = left < n;
  if (!childrenExist) return;

  const compareNodes = [i];
  if (left < n) compareNodes.push(left);
  if (right < n) compareNodes.push(right);

  stepList.push({
    array: [...arr],
    highlighted: compareNodes,
    swapping: [],
    type: 'compare',
    message: buildCompareMessage(arr, i, left < n ? left : -1, right < n ? right : -1, n),
  });

  let smallest = i;
  if (left < n && arr[left] < arr[smallest]) smallest = left;
  if (right < n && arr[right] < arr[smallest]) smallest = right;

  if (smallest !== i) {
    stepList.push({
      array: [...arr],
      highlighted: compareNodes,
      swapping: [i, smallest],
      type: 'swap',
      message: `Swap needed: ${arr[i]} > ${arr[smallest]}. Swapping index ${i} with index ${smallest}.`,
    });

    [arr[i], arr[smallest]] = [arr[smallest], arr[i]];

    stepList.push({
      array: [...arr],
      highlighted: [i, smallest],
      swapping: [],
      type: 'swapped',
      message: `Swapped! Index ${i} is now ${arr[i]}, index ${smallest} is now ${arr[smallest]}. Continuing down…`,
    });

    heapifyDown(arr, n, smallest, stepList);
  } else {
    stepList.push({
      array: [...arr],
      highlighted: [i],
      swapping: [],
      type: 'no-swap',
      message: `No swap needed. ${arr[i]} is already the minimum at index ${i}.`,
    });
  }
}

function buildCompareMessage(arr, parent, left, right, n) {
  const parts = [];
  if (left !== -1 && left < n) parts.push(`left child [${left}]=${arr[left]}`);
  if (right !== -1 && right < n) parts.push(`right child [${right}]=${arr[right]}`);
  return `Comparing node [${parent}]=${arr[parent]} with ${parts.join(' and ')}.`;
}

function generateSteps(inputArray) {
  const arr = [...inputArray];
  const n = arr.length;
  const stepList = [];

  stepList.push({
    array: [...arr],
    highlighted: [],
    swapping: [],
    type: 'initial',
    message: `Starting min-heap construction on [${arr.join(', ')}]. Processing from last non-leaf (index ${Math.floor(n / 2) - 1}) up to root.`,
  });

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    stepList.push({
      array: [...arr],
      highlighted: [i],
      swapping: [],
      type: 'start-heapify',
      message: `Heapify at index ${i} (value: ${arr[i]}).`,
    });
    heapifyDown(arr, n, i, stepList);
  }

  stepList.push({
    array: [...arr],
    highlighted: [],
    swapping: [],
    type: 'complete',
    message: `Min-heap complete! Final array: [${arr.join(', ')}]. Every parent is smaller than its children.`,
  });

  return stepList;
}

function getNodePosition(index, n, svgWidth) {
  const maxDepth = Math.floor(Math.log2(n));
  const level = Math.floor(Math.log2(index + 1));
  const levelStart = Math.pow(2, level) - 1;
  const posInLevel = index - levelStart;
  const bottomSlots = Math.pow(2, maxDepth);
  const slotWidth = svgWidth / (bottomSlots + 1);
  const slotsPerNode = Math.pow(2, maxDepth - level);
  const x = (posInLevel * slotsPerNode + slotsPerNode / 2) * slotWidth + slotWidth / 2;
  const y = level * LEVEL_HEIGHT + SVG_PADDING_TOP;
  return { x, y };
}

function getNodeClass(index, highlighted, swapping, type) {
  if (swapping.includes(index)) return 'node-circle--swap';
  if (highlighted.includes(index)) return 'node-circle--highlight';
  if (type === 'complete') return 'node-circle--complete';
  return '';
}

function getEdgeClass(parentIdx, childIdx, highlighted, swapping) {
  if (swapping.includes(parentIdx) && swapping.includes(childIdx)) return 'tree-edge--swap';
  if (highlighted.includes(parentIdx) && highlighted.includes(childIdx)) return 'tree-edge--highlight';
  return '';
}

function renderTree(array, highlighted, swapping, type) {
  const n = array.length;
  if (n === 0) return '';

  const maxDepth = Math.floor(Math.log2(n));
  const svgWidth = 520;
  const svgHeight = (maxDepth + 1) * LEVEL_HEIGHT + SVG_PADDING_TOP + 30;

  let edges = '';
  let nodes = '';

  for (let i = 0; i < n; i++) {
    const pos = getNodePosition(i, n, svgWidth);
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      const lPos = getNodePosition(left, n, svgWidth);
      const edgeClass = getEdgeClass(i, left, highlighted, swapping);
      edges += `<line class="tree-edge ${edgeClass}" x1="${pos.x.toFixed(1)}" y1="${pos.y}" x2="${lPos.x.toFixed(1)}" y2="${lPos.y}" />`;
    }
    if (right < n) {
      const rPos = getNodePosition(right, n, svgWidth);
      const edgeClass = getEdgeClass(i, right, highlighted, swapping);
      edges += `<line class="tree-edge ${edgeClass}" x1="${pos.x.toFixed(1)}" y1="${pos.y}" x2="${rPos.x.toFixed(1)}" y2="${rPos.y}" />`;
    }
  }

  for (let i = 0; i < n; i++) {
    const pos = getNodePosition(i, n, svgWidth);
    const nodeClass = getNodeClass(i, highlighted, swapping, type);
    nodes += `
      <g>
        <circle class="node-circle ${nodeClass}" cx="${pos.x.toFixed(1)}" cy="${pos.y}" r="${NODE_RADIUS}" />
        <text class="node-text" x="${pos.x.toFixed(1)}" y="${pos.y}">${array[i]}</text>
        <text class="node-index" x="${pos.x.toFixed(1)}" y="${pos.y + NODE_RADIUS + 12}">${i}</text>
      </g>`;
  }

  return `<svg class="mh-tree-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
    ${edges}
    ${nodes}
  </svg>`;
}

function renderArray(array, highlighted, swapping, type) {
  const cells = array.map((val, i) => {
    let cls = '';
    if (swapping.includes(i)) cls = 'arr-cell-value--swap';
    else if (highlighted.includes(i)) cls = 'arr-cell-value--highlight';
    else if (type === 'complete') cls = 'arr-cell-value--complete';

    return `
      <div class="arr-cell">
        <div class="arr-cell-value ${cls}">${val}</div>
        <span class="arr-cell-index">${i}</span>
      </div>`;
  }).join('');

  return `
    <div class="arr-row">
      <span class="arr-label">Values</span>
      <div class="arr-cells">${cells}</div>
    </div>`;
}

function getMessageDotClass(type) {
  if (type === 'compare' || type === 'start-heapify') return 'message-dot--compare';
  if (type === 'swap' || type === 'swapped') return 'message-dot--swap';
  if (type === 'complete') return 'message-dot--complete';
  return 'message-dot--info';
}

function render() {
  const step = steps[currentStep];
  if (!step) return;

  document.getElementById('tree-container').innerHTML = renderTree(
    step.array, step.highlighted, step.swapping, step.type
  );

  document.getElementById('array-container').innerHTML = renderArray(
    step.array, step.highlighted, step.swapping, step.type
  );

  document.getElementById('message-text').textContent = step.message;
  document.getElementById('message-dot').className = `message-dot ${getMessageDotClass(step.type)}`;

  const total = steps.length - 1;
  document.getElementById('step-counter').textContent = `Step ${currentStep} / ${total}`;
  document.getElementById('progress-bar').style.width = total > 0 ? `${(currentStep / total) * 100}%` : '0%';

  document.getElementById('btn-prev').disabled = currentStep === 0;
  document.getElementById('btn-next').disabled = currentStep === total;
}

function parseInput(raw) {
  return raw
    .split(/[\s,]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(Number)
    .filter(n => !isNaN(n));
}

function initialize(arr) {
  steps = generateSteps(arr);
  currentStep = 0;
  render();
}

document.getElementById('btn-visualize').addEventListener('click', () => {
  const raw = document.getElementById('array-input').value;
  const arr = parseInput(raw);
  if (arr.length < 2) {
    document.getElementById('message-text').textContent = 'Please enter at least 2 numbers separated by commas.';
    return;
  }
  if (arr.length > 15) {
    document.getElementById('message-text').textContent = 'Please enter 15 or fewer numbers for a clear visualization.';
    return;
  }
  initialize(arr);
});

document.getElementById('btn-next').addEventListener('click', () => {
  if (currentStep < steps.length - 1) {
    currentStep++;
    render();
  }
});

document.getElementById('btn-prev').addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--;
    render();
  }
});

document.getElementById('array-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('btn-visualize').click();
  }
});

initialize(DEFAULT_ARRAY);
