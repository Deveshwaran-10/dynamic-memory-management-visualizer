function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseCSVNumbers(input) {
  return input
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => Number(part))
    .filter((num) => Number.isFinite(num) && num >= 0);
}

function setFeedback(id, message, tone) {
  const node = byId(id);
  if (!node) {
    return;
  }
  node.textContent = message;
  node.classList.remove("ok", "warn");
  if (tone === "ok") {
    node.classList.add("ok");
  } else if (tone === "warn") {
    node.classList.add("warn");
  }
}

const vmState = {
  timeline: [],
  step: -1,
  intervalId: null,
  algorithm: "",
  faults: 0,
  hits: 0,
  references: [],
  frames: 0,
};

const chartState = {
  segmentation: null,
  paging: null,
  vmPie: null,
  vmLine: null,
};

function destroyChart(chart) {
  if (chart) {
    chart.destroy();
  }
}

function createSegmentationChart(validCount, faultCount) {
  if (typeof Chart === "undefined") {
    return;
  }
  destroyChart(chartState.segmentation);
  const ctx = byId("segChart");
  chartState.segmentation = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Valid Translations", "Segmentation Faults"],
      datasets: [
        {
          data: [validCount, faultCount],
          backgroundColor: ["#2fdf9f", "#ff6f91"],
          borderColor: "#0b122b",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#d8e3ff" } },
      },
    },
  });
}

function createPagingChart(mappedCount, faultCount) {
  if (typeof Chart === "undefined") {
    return;
  }
  destroyChart(chartState.paging);
  const ctx = byId("pagingChart");
  chartState.paging = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Mapped", "Faults"],
      datasets: [
        {
          label: "Request Outcomes",
          data: [mappedCount, faultCount],
          backgroundColor: ["#67d6ff", "#ff7f96"],
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, ticks: { color: "#cfe0ff" }, grid: { color: "#243862" } },
        x: { ticks: { color: "#cfe0ff" }, grid: { color: "#243862" } },
      },
      plugins: {
        legend: { labels: { color: "#d8e3ff" } },
      },
    },
  });
}

function createVmCharts(hits, faults, timeline) {
  if (typeof Chart === "undefined") {
    return;
  }
  destroyChart(chartState.vmPie);
  destroyChart(chartState.vmLine);

  const pieCtx = byId("vmPieChart");
  const lineCtx = byId("vmLineChart");
  chartState.vmPie = new Chart(pieCtx, {
    type: "doughnut",
    data: {
      labels: ["Hits", "Faults"],
      datasets: [
        {
          data: [hits, faults],
          backgroundColor: ["#2fdf9f", "#ff6f91"],
          borderColor: "#0b122b",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#d8e3ff" } },
      },
    },
  });

  const cumulativeFaults = [];
  const cumulativeHits = [];
  let faultRun = 0;
  let hitRun = 0;
  timeline.forEach((event) => {
    if (event.event === "Fault") {
      faultRun += 1;
    } else {
      hitRun += 1;
    }
    cumulativeFaults.push(faultRun);
    cumulativeHits.push(hitRun);
  });

  chartState.vmLine = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: timeline.map((item) => `S${item.step}`),
      datasets: [
        {
          label: "Cumulative Faults",
          data: cumulativeFaults,
          borderColor: "#ff7e97",
          backgroundColor: "rgba(255,126,151,0.2)",
          tension: 0.28,
          fill: true,
        },
        {
          label: "Cumulative Hits",
          data: cumulativeHits,
          borderColor: "#34dca5",
          backgroundColor: "rgba(52,220,165,0.2)",
          tension: 0.28,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, ticks: { color: "#cfe0ff" }, grid: { color: "#243862" } },
        x: { ticks: { color: "#cfe0ff" }, grid: { color: "#243862" } },
      },
      plugins: {
        legend: { labels: { color: "#d8e3ff" } },
      },
    },
  });
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const sections = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      sections.forEach((section) => section.classList.remove("active"));
      tab.classList.add("active");
      byId(tab.dataset.tab).classList.add("active");
    });
  });
}

function runSegmentation() {
  const rows = byId("segmentTable").value.trim().split("\n");
  const requestsRaw = byId("segmentRequests").value;
  const out = byId("segmentationOutput");
  const viz = byId("segmentViz");

  const table = new Map();
  for (const row of rows) {
    const [idRaw, baseRaw, limitRaw] = row.split(",").map((cell) => cell.trim());
    const id = Number(idRaw);
    const base = Number(baseRaw);
    const limit = Number(limitRaw);
    if (
      Number.isFinite(id) &&
      Number.isFinite(base) &&
      Number.isFinite(limit) &&
      limit >= 0
    ) {
      table.set(id, { base, limit });
    }
  }

  const requests = requestsRaw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [segRaw, offRaw] = pair.split(":").map((v) => v.trim());
      return { segment: Number(segRaw), offset: Number(offRaw) };
    })
    .filter((req) => Number.isFinite(req.segment) && Number.isFinite(req.offset));

  if (table.size === 0 || requests.length === 0) {
    out.innerHTML =
      '<p class="warn">Provide a valid segment table and at least one request.</p>';
    viz.innerHTML = "";
    setFeedback("segFeedback", "Invalid input. Add valid segment rows and requests.", "warn");
    return;
  }

  const resultRows = requests.map((req) => {
    const segData = table.get(req.segment);
    if (!segData) {
      return {
        req: `${req.segment}:${req.offset}`,
        status: "Fault",
        detail: "Invalid segment",
      };
    }
    if (req.offset >= segData.limit || req.offset < 0) {
      return {
        req: `${req.segment}:${req.offset}`,
        status: "Fault",
        detail: `Offset out of bounds (limit=${segData.limit})`,
      };
    }
    return {
      req: `${req.segment}:${req.offset}`,
      status: "Valid",
      detail: `Physical = ${segData.base + req.offset}`,
    };
  });

  out.innerHTML = `
    <p><strong>Segment entries:</strong> ${table.size} | <strong>Requests:</strong> ${requests.length}</p>
    <table>
      <thead>
        <tr><th>Logical Address</th><th>Status</th><th>Result</th></tr>
      </thead>
      <tbody>
        ${resultRows
          .map(
            (row) => `
          <tr>
            <td>${escapeHtml(row.req)}</td>
            <td class="${row.status === "Valid" ? "ok" : "warn"}">${row.status}</td>
            <td>${escapeHtml(row.detail)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;

  viz.innerHTML = resultRows
    .map(
      (row) => `
      <article class="memory-chip ${row.status === "Valid" ? "okay" : "fault"}">
        <span>Req ${escapeHtml(row.req)} → ${escapeHtml(row.detail)}</span>
        <span class="chip-badge">${row.status}</span>
      </article>
    `
    )
    .join("");

  const faults = resultRows.filter((row) => row.status === "Fault").length;
  const valid = requests.length - faults;
  setFeedback(
    "segFeedback",
    `Processed ${requests.length} requests. Valid: ${requests.length - faults}, Faults: ${faults}.`,
    faults > 0 ? "warn" : "ok"
  );
  createSegmentationChart(valid, faults);
}

function runPaging() {
  const pageSize = Number(byId("pageSize").value);
  const logicalSpace = Number(byId("logicalSpace").value);
  const frameCount = Number(byId("frameCount").value);
  const requests = parseCSVNumbers(byId("pagingRequests").value);
  const out = byId("pagingOutput");
  const viz = byId("pagingViz");

  if (
    !Number.isFinite(pageSize) ||
    !Number.isFinite(logicalSpace) ||
    !Number.isFinite(frameCount) ||
    pageSize <= 0 ||
    logicalSpace <= 0 ||
    frameCount <= 0 ||
    requests.length === 0
  ) {
    out.innerHTML =
      '<p class="warn">Please enter valid paging inputs and request addresses.</p>';
    viz.innerHTML = "";
    setFeedback("pagingFeedback", "Invalid paging values. Check size/frame/addresses.", "warn");
    return;
  }

  const pageCount = Math.ceil(logicalSpace / pageSize);
  const mappedPages = Math.min(pageCount, frameCount);
  const pageTable = new Map();
  for (let p = 0; p < mappedPages; p += 1) {
    pageTable.set(p, p);
  }

  const rows = requests.map((addr) => {
    if (addr >= logicalSpace) {
      return {
        logical: addr,
        page: "-",
        offset: "-",
        frame: "-",
        physical: "Address out of range",
        status: "Fault",
      };
    }
    const page = Math.floor(addr / pageSize);
    const offset = addr % pageSize;
    if (!pageTable.has(page)) {
      return {
        logical: addr,
        page,
        offset,
        frame: "-",
        physical: "Page not in physical memory",
        status: "Fault",
      };
    }
    const frame = pageTable.get(page);
    const physical = frame * pageSize + offset;
    return { logical: addr, page, offset, frame, physical, status: "Mapped" };
  });

  const faults = rows.filter((r) => r.status === "Fault").length;
  out.innerHTML = `
    <p>
      <strong>Pages:</strong> ${pageCount},
      <strong>Frames:</strong> ${frameCount},
      <strong>Mapped pages at start:</strong> ${mappedPages},
      <strong>Faults:</strong> ${faults}
    </p>
    <table>
      <thead>
        <tr>
          <th>Logical Address</th><th>Page</th><th>Offset</th>
          <th>Frame</th><th>Physical Address</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
          <tr>
            <td>${escapeHtml(row.logical)}</td>
            <td>${escapeHtml(row.page)}</td>
            <td>${escapeHtml(row.offset)}</td>
            <td>${escapeHtml(row.frame)}</td>
            <td>${escapeHtml(row.physical)}</td>
            <td class="${row.status === "Mapped" ? "ok" : "warn"}">${row.status}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;

  viz.innerHTML = rows
    .map(
      (row) => `
      <article class="memory-chip ${row.status === "Mapped" ? "okay" : "fault"}">
        <span>L:${escapeHtml(row.logical)} → P:${escapeHtml(row.page)} F:${escapeHtml(row.frame)}</span>
        <span class="chip-badge">${row.status}</span>
      </article>
    `
    )
    .join("");

  setFeedback(
    "pagingFeedback",
    `Mapped ${rows.length - faults} addresses and detected ${faults} faults.`,
    faults > 0 ? "warn" : "ok"
  );
  createPagingChart(rows.length - faults, faults);
}

function replaceFIFO(frames, fifoQueue, page) {
  if (frames.length < fifoQueue.capacity) {
    frames.push(page);
    fifoQueue.items.push(page);
    return;
  }
  const victim = fifoQueue.items.shift();
  const idx = frames.indexOf(victim);
  frames[idx] = page;
  fifoQueue.items.push(page);
}

function replaceLRU(frames, lruMap, page, step, maxFrames) {
  if (frames.length < maxFrames) {
    frames.push(page);
    lruMap.set(page, step);
    return;
  }
  let victim = frames[0];
  let oldest = lruMap.get(victim);
  for (const p of frames) {
    const lastUsed = lruMap.get(p);
    if (lastUsed < oldest) {
      oldest = lastUsed;
      victim = p;
    }
  }
  const idx = frames.indexOf(victim);
  frames[idx] = page;
  lruMap.delete(victim);
  lruMap.set(page, step);
}

function predictOptimalVictim(frames, refs, currentIndex) {
  let farthest = -1;
  let victim = frames[0];
  for (const page of frames) {
    const nextIndex = refs.indexOf(page, currentIndex + 1);
    if (nextIndex === -1) {
      return page;
    }
    if (nextIndex > farthest) {
      farthest = nextIndex;
      victim = page;
    }
  }
  return victim;
}

function runVirtualMemory() {
  const frameCount = Number(byId("vmFrames").value);
  const algorithm = byId("algorithm").value;
  const references = parseCSVNumbers(byId("referenceString").value);
  const out = byId("vmOutput");
  const stepInfo = byId("vmStepInfo");
  const frameViz = byId("vmFrameViz");

  if (!Number.isFinite(frameCount) || frameCount <= 0 || references.length === 0) {
    out.innerHTML = '<p class="warn">Enter valid frame count and reference string.</p>';
    stepInfo.textContent = "Run the simulation to enable step playback.";
    frameViz.innerHTML = "";
    setFeedback("vmFeedback", "Invalid virtual memory input. Check frames/reference string.", "warn");
    return;
  }

  const frames = [];
  const fifoQueue = { items: [], capacity: frameCount };
  const lruMap = new Map();
  const timeline = [];
  let faults = 0;
  let hits = 0;

  references.forEach((page, idx) => {
    const hit = frames.includes(page);
    if (hit) {
      hits += 1;
      if (algorithm === "LRU") {
        lruMap.set(page, idx);
      }
      timeline.push({
        step: idx + 1,
        page,
        frames: [...frames],
        event: "Hit",
      });
      return;
    }

    faults += 1;
    if (algorithm === "FIFO") {
      replaceFIFO(frames, fifoQueue, page);
    } else if (algorithm === "LRU") {
      replaceLRU(frames, lruMap, page, idx, frameCount);
    } else {
      if (frames.length < frameCount) {
        frames.push(page);
      } else {
        const victim = predictOptimalVictim(frames, references, idx);
        const victimIdx = frames.indexOf(victim);
        frames[victimIdx] = page;
      }
    }
    if (algorithm === "LRU") {
      lruMap.set(page, idx);
    }
    timeline.push({
      step: idx + 1,
      page,
      frames: [...frames],
      event: "Fault",
    });
  });

  const faultRate = ((faults / references.length) * 100).toFixed(2);
  out.innerHTML = `
    <p>
      <strong>Algorithm:</strong> ${algorithm} |
      <strong>Frames:</strong> ${frameCount} |
      <strong>References:</strong> ${references.length}
    </p>
    <p>
      <span class="warn">Page Faults: ${faults}</span> |
      <span class="ok">Hits: ${hits}</span> |
      Fault Rate: ${faultRate}%
    </p>
    <table>
      <thead>
        <tr><th>Step</th><th>Page</th><th>Frame State</th><th>Event</th></tr>
      </thead>
      <tbody>
        ${timeline
          .map(
            (row) => `
          <tr>
            <td>${row.step}</td>
            <td>${row.page}</td>
            <td>[${row.frames.join(", ")}]</td>
            <td class="${row.event === "Hit" ? "ok" : "warn"}">${row.event}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;

  vmState.timeline = timeline;
  vmState.step = -1;
  vmState.algorithm = algorithm;
  vmState.faults = faults;
  vmState.hits = hits;
  vmState.references = references;
  vmState.frames = frameCount;
  stopVmAutoplay();
  renderVmStep();
  stepInfo.textContent = "Use Previous/Next/Auto Play to animate each memory access.";
  setFeedback(
    "vmFeedback",
    `Simulation complete using ${algorithm}. Hits: ${hits}, Faults: ${faults}, Fault Rate: ${faultRate}%.`,
    faults > hits ? "warn" : "ok"
  );
  createVmCharts(hits, faults, timeline);
}

function renderVmStep() {
  const frameViz = byId("vmFrameViz");
  const stepInfo = byId("vmStepInfo");
  if (vmState.timeline.length === 0) {
    frameViz.innerHTML = "";
    return;
  }

  const step = vmState.step;
  if (step < 0) {
    frameViz.innerHTML = Array.from({ length: vmState.frames })
      .map(
        (_, idx) => `
        <article class="frame-cell">
          <span class="frame-index">Frame ${idx}</span>
          <span class="frame-page">-</span>
        </article>
      `
      )
      .join("");
    stepInfo.textContent = "Playback ready. Press Next to start.";
    return;
  }

  const current = vmState.timeline[step];
  const paddedFrames = Array.from({ length: vmState.frames }).map(
    (_, idx) => current.frames[idx] ?? "-"
  );
  frameViz.innerHTML = paddedFrames
    .map(
      (page, idx) => `
      <article class="frame-cell">
        <span class="frame-index">Frame ${idx}</span>
        <span class="frame-page">${escapeHtml(page)}</span>
      </article>
    `
    )
    .join("");

  stepInfo.textContent = `Step ${current.step}/${vmState.timeline.length}: page ${current.page} -> ${current.event}`;
}

function nextVmStep() {
  if (vmState.timeline.length === 0) {
    return;
  }
  if (vmState.step < vmState.timeline.length - 1) {
    vmState.step += 1;
    renderVmStep();
  } else {
    stopVmAutoplay();
  }
}

function prevVmStep() {
  if (vmState.timeline.length === 0) {
    return;
  }
  vmState.step = Math.max(-1, vmState.step - 1);
  renderVmStep();
}

function toggleVmAutoplay() {
  const playBtn = byId("vmPlay");
  if (vmState.timeline.length === 0) {
    return;
  }
  if (vmState.intervalId) {
    stopVmAutoplay();
    return;
  }
  playBtn.textContent = "Pause";
  vmState.intervalId = window.setInterval(() => {
    const atEnd = vmState.step >= vmState.timeline.length - 1;
    if (atEnd) {
      stopVmAutoplay();
      return;
    }
    nextVmStep();
  }, 700);
}

function stopVmAutoplay() {
  const playBtn = byId("vmPlay");
  if (vmState.intervalId) {
    window.clearInterval(vmState.intervalId);
    vmState.intervalId = null;
  }
  playBtn.textContent = "Auto Play";
}

function resetVmStep() {
  if (vmState.timeline.length === 0) {
    return;
  }
  stopVmAutoplay();
  vmState.step = -1;
  renderVmStep();
}

function loadSegExample() {
  byId("segmentTable").value = "0,1000,400\n1,3000,1200\n2,5000,600";
  byId("segmentRequests").value = "0:120, 1:1100, 2:700, 1:100";
  setFeedback("segFeedback", "Example loaded. Click Run Segmentation.", "ok");
}

function clearSegInputs() {
  byId("segmentTable").value = "";
  byId("segmentRequests").value = "";
  byId("segmentViz").innerHTML = "";
  byId("segmentationOutput").innerHTML = "";
  destroyChart(chartState.segmentation);
  setFeedback("segFeedback", "Segmentation inputs cleared.", "warn");
}

function loadPagingExample() {
  byId("pageSize").value = 256;
  byId("logicalSpace").value = 4096;
  byId("frameCount").value = 8;
  byId("pagingRequests").value = "120, 300, 700, 1025, 3000";
  setFeedback("pagingFeedback", "Example loaded. Click Run Paging.", "ok");
}

function clearPagingInputs() {
  byId("pageSize").value = "";
  byId("logicalSpace").value = "";
  byId("frameCount").value = "";
  byId("pagingRequests").value = "";
  byId("pagingViz").innerHTML = "";
  byId("pagingOutput").innerHTML = "";
  destroyChart(chartState.paging);
  setFeedback("pagingFeedback", "Paging inputs cleared.", "warn");
}

function loadVmExample() {
  byId("vmFrames").value = 3;
  byId("algorithm").value = "FIFO";
  byId("referenceString").value = "7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2";
  setFeedback("vmFeedback", "Example loaded. Click Run Virtual Memory.", "ok");
}

function clearVmInputs() {
  byId("vmFrames").value = "";
  byId("referenceString").value = "";
  byId("vmFrameViz").innerHTML = "";
  byId("vmOutput").innerHTML = "";
  byId("vmStepInfo").textContent = "Run the simulation to enable step playback.";
  vmState.timeline = [];
  vmState.step = -1;
  stopVmAutoplay();
  destroyChart(chartState.vmPie);
  destroyChart(chartState.vmLine);
  setFeedback("vmFeedback", "Virtual memory inputs cleared.", "warn");
}

function init() {
  setupTabs();
  byId("runSegmentation").addEventListener("click", runSegmentation);
  byId("runPaging").addEventListener("click", runPaging);
  byId("runVM").addEventListener("click", runVirtualMemory);
  byId("vmNext").addEventListener("click", nextVmStep);
  byId("vmPrev").addEventListener("click", prevVmStep);
  byId("vmPlay").addEventListener("click", toggleVmAutoplay);
  byId("vmReset").addEventListener("click", resetVmStep);
  byId("segExample").addEventListener("click", loadSegExample);
  byId("segClear").addEventListener("click", clearSegInputs);
  byId("pagingExample").addEventListener("click", loadPagingExample);
  byId("pagingClear").addEventListener("click", clearPagingInputs);
  byId("vmExample").addEventListener("click", loadVmExample);
  byId("vmClear").addEventListener("click", clearVmInputs);
}

init();
