/* Basic UI: show/hide sections */
function showSection(id) {
  // hide main sections
  document.getElementById('home').style.display = 'none';
  document.getElementById('information').style.display = 'none';

  if (id === 'home') document.getElementById('home').style.display = 'block';
  if (id === 'information') document.getElementById('information').style.display = 'block';
}

/* About modal open/close */
function openAbout() {
  const modal = document.getElementById('aboutModal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
}
function closeAbout() {
  const modal = document.getElementById('aboutModal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
}
window.onclick = function (event) {
  const modal = document.getElementById('aboutModal');
  if (event.target === modal) closeAbout();
};

/* -------------------------
   Chart initializations
   ------------------------- */

/* 1) existing Bright Routes (lightChart) - sample bar chart */
const lightCtx = document.getElementById('lightChart').getContext('2d');
const lightChart = new Chart(lightCtx, {
  type: 'bar',
  data: {
    labels: ['Library Path', 'Main Gate', 'Aula Lawn', 'Engineering Block', 'Residence Area'],
    datasets: [{
      label: 'Light Intensity (Lux)',
      data: [90, 120, 75, 110, 60],
      borderRadius: 6,
      backgroundColor: 'rgba(11,79,108,0.85)'
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  }
});

/* 2) existing NDVI line chart (greenChart) */
const greenCtx = document.getElementById('greenChart').getContext('2d');
const greenChart = new Chart(greenCtx, {
  type: 'line',
  data: {
    labels: ['Summer', 'Autumn', 'Winter', 'Spring'],
    datasets: [{
      label: 'NDVI Score',
      data: [0.82, 0.68, 0.50, 0.76],
      fill: true,
      tension: 0.3,
      backgroundColor: 'rgba(34,139,34,0.12)',
      borderColor: 'rgba(34,139,34,0.9)',
      pointRadius: 4
    }]
  },
  options: { responsive: true, plugins: { legend: { display: false } } }
});

/* 3) Awareness pie chart (new) */
const awarenessCtx = document.getElementById('awarenessPie').getContext('2d');
const awarenessChart = new Chart(awarenessCtx, {
  type: 'pie',
  data: {
    labels: ['Clinic', 'Counselling', 'Green spaces', 'Unaware'],
    datasets: [{
      data: [40, 30, 20, 10], // sample percentages (Pie A)
      backgroundColor: [
        'rgba(11,79,108,0.9)',
        'rgba(0,123,167,0.85)',
        'rgba(34,139,34,0.85)',
        'rgba(160,160,160,0.6)'
      ]
    }]
  },
  options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
});

/* 4) Stress line chart (new) */
const stressCtx = document.getElementById('stressLine').getContext('2d');
const stressChart = new Chart(stressCtx, {
  type: 'line',
  data: {
    labels: ['Week 1','Week 3','Week 5','Week 7','Week 9','Exam'],
    datasets: [{
      label: 'Average self-reported stress (0-10)',
      data: [4.1, 4.8, 5.6, 6.0, 6.4, 7.3],
      borderColor: 'rgba(204,61,61,0.9)',
      backgroundColor: 'rgba(204,61,61,0.12)',
      fill: true,
      tension: 0.25,
      pointRadius: 3
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0, max: 10 } }
  }
});

/* 5) Incidents bar chart (new) */
const incidentsCtx = document.getElementById('incidentsBar').getContext('2d');
const incidentsChart = new Chart(incidentsCtx, {
  type: 'bar',
  data: {
    labels: ['Main Gate', 'Library Path', 'Aula Lawn', 'Residence Area'],
    datasets: [
      {
        label: 'Before Bright Routes',
        data: [12, 18, 9, 14],
        backgroundColor: 'rgba(200,50,50,0.9)'
      },
      {
        label: 'After Bright Routes',
        data: [4, 6, 2, 5],
        backgroundColor: 'rgba(11,79,108,0.9)'
      }
    ]
  },
  options: {
    responsive: true,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { position: 'bottom' } }
  }
});

/* -------------------------
   SVG progress animation (replaces doughnut)
   ------------------------- */

const safePercent = 78; // sample value; update with real data later
const ring = document.getElementById('ringActive');
const percentText = document.getElementById('svgPercent');
const progressLabel = document.getElementById('progressText');

function animateSvgProgress(targetPercent, duration = 1400) {
  const circumference = 283; // matches CSS stroke-dasharray for r=45
  const targetOffset = circumference * (1 - targetPercent / 100);

  // animate stroke-dashoffset using transition already on .ring-active
  // ensure starting offset is full (hidden)
  ring.style.strokeDashoffset = circumference;

  // small timeout so transition runs
  setTimeout(() => {
    ring.style.strokeDashoffset = targetOffset;
  }, 50);

  // animate the number in center counting up (simple JS)
  let start = null;
  const startPercent = 0;
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = easeOutCubic(progress);
    const current = Math.round(startPercent + (targetPercent - startPercent) * eased);
    percentText.textContent = `${current}%`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      percentText.textContent = `${targetPercent}%`;
    }
  }
  window.requestAnimationFrame(step);

  // update label
  progressLabel.innerText = `${targetPercent}% feel safe`;
}

// easing function
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// run animation after charts are drawn
window.addEventListener('load', () => {
  animateSvgProgress(safePercent, 1400);
});

/* -------------------------
   Summary table population
   ------------------------- */
const summaryRows = [
  { indicator: 'Clinic awareness', value: '40%', interpretation: 'Good but targeted outreach can reach the remaining 60%.' },
  { indicator: 'Counselling awareness', value: '30%', interpretation: 'Counselling visibility should be increased across residences.' },
  { indicator: 'Green spaces stable across seasons', value: 'NDVI avg 0.69', interpretation: 'Green spaces provide reliable recreational benefit.' },
  { indicator: 'Reported incidents (before -> after)', value: 'Avg 13 -> 4', interpretation: 'Bright routes associated with ~70% reduction in incidents.' },
  { indicator: 'Avg self-reported stress (exam period)', value: '7.3 / 10', interpretation: 'Recommend exam-time interventions & calming green-space promotion.' }
];

const tbody = document.querySelector('#summaryTable tbody');
tbody.innerHTML = '';
summaryRows.forEach(r => {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${r.indicator}</td><td>${r.value}</td><td>${r.interpretation}</td>`;
  tbody.appendChild(tr);
});

/* Keep Home visible by default */
showSection('home');

