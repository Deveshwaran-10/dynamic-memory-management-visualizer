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
}

function runPaging() {
  const pageSize = Number(byId("pageSize").value);
  const logicalSpace = Number(byId("logicalSpace").value);
  const frameCount = Number(byId("frameCount").value);
  const requests = parseCSVNumbers(byId("pagingRequests").value);
  const out = byId("pagingOutput");

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

  if (!Number.isFinite(frameCount) || frameCount <= 0 || references.length === 0) {
    out.innerHTML = '<p class="warn">Enter valid frame count and reference string.</p>';
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
}

function init() {
  setupTabs();
  byId("runSegmentation").addEventListener("click", runSegmentation);
  byId("runPaging").addEventListener("click", runPaging);
  byId("runVM").addEventListener("click", runVirtualMemory);
}

init();
