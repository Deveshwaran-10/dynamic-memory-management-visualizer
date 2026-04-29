# Dynamic Memory Management Visualizer

A webpage-based Operating Systems project that simulates:

- Segmentation (base-limit translation, bounds checking)
- Paging (logical to physical mapping with page table assumptions)
- Virtual memory page replacement (FIFO, LRU, Optimal)

## Run

1. Open `index.html` directly in a browser, or
2. Serve the folder using any local static server.

No backend or build step is required.

## Features

- Segmentation Simulation
- Paging Simulation
- Virtual Memory Simulation
- FIFO, LRU, Optimal Algorithms

## Suggested Demo Cases

- Virtual memory reference string:
  `7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2`
- Frames: `3`
- Compare faults under FIFO, LRU, and Optimal to analyze performance.
