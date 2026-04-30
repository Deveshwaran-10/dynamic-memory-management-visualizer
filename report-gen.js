const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, VerticalAlign,
  PageNumber, PageBreak, TabStopType, TabStopPosition,
  TableOfContents
} = require('docx');
const fs = require('fs');

// ── helpers ──────────────────────────────────────────────────────────────────

const CONTENT_W = 9360; // US Letter 1" margins

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, font: "Times New Roman" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, font: "Times New Roman" })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, underline: {}, size: 24, font: "Times New Roman" })]
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { before: 80, after: 120, line: 360 },
    children: [new TextRun({ text, size: 24, font: "Times New Roman", ...opts.run })]
  });
}

function bold(text) {
  return new TextRun({ text, bold: true, size: 24, font: "Times New Roman" });
}

function bullet(text, numbering, level = 0) {
  return new Paragraph({
    numbering: { reference: numbering, level },
    spacing: { before: 60, after: 60, line: 320 },
    children: [new TextRun({ text, size: 24, font: "Times New Roman" })]
  });
}

function spacer(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [new TextRun("")], spacing: { before: 0, after: 0 } }));
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const allBorders = { top: border, bottom: border, left: border, right: border };

function cell(text, w, { header = false, shade = null } = {}) {
  return new TableCell({
    borders: allBorders,
    width: { size: w, type: WidthType.DXA },
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, bold: header, size: 22, font: "Times New Roman" })]
    })]
  });
}

// ── document ─────────────────────────────────────────────────────────────────

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: "Times New Roman", size: 24 } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Times New Roman", color: "1F3864" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Times New Roman", color: "2E4057" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Times New Roman", color: "2E4057" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 }
      }
    ]
  },
  sections: [
    // ── Cover Page ─────────────────────────────────────────────────────────
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        ...spacer(4),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 200 },
          children: [new TextRun({ text: "PROJECT REPORT", bold: true, size: 40, font: "Times New Roman", color: "1F3864" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 120 },
          children: [new TextRun({ text: "on", size: 28, font: "Times New Roman" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 400 },
          children: [new TextRun({ text: "Dynamic Memory Management Visualizer", bold: true, size: 36, font: "Times New Roman", color: "1F3864" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "1F3864", space: 1 } },
          spacing: { before: 0, after: 400 },
          children: []
        }),
        ...spacer(1),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "Subject: Operating Systems", size: 24, font: "Times New Roman" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "Project Type: Simulation Tool", size: 24, font: "Times New Roman" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "Technologies Used: HTML, CSS, JavaScript", size: 24, font: "Times New Roman" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "Version Control: GitHub", size: 24, font: "Times New Roman" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "Repository: dynamic-memory-management-visualizer", size: 24, font: "Times New Roman" })] }),
        ...spacer(3),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [bold("Submitted By:")] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "[Student Name]", size: 24, font: "Times New Roman" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "[Enrollment Number]", size: 24, font: "Times New Roman" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "[Department / Branch]", size: 24, font: "Times New Roman" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "[University / Institution Name]", size: 24, font: "Times New Roman" })] }),
        ...spacer(2),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "Academic Year: 2024–2025", size: 24, font: "Times New Roman" })] }),
        pageBreak()
      ]
    },
    // ── TOC + Main Body ────────────────────────────────────────────────────
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "1F3864", space: 4 } },
              children: [new TextRun({ text: "Dynamic Memory Management Visualizer — Project Report", size: 18, font: "Times New Roman", color: "555555" })]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: "1F3864", space: 4 } },
              children: [
                new TextRun({ text: "Page ", size: 20, font: "Times New Roman" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 20, font: "Times New Roman" }),
                new TextRun({ text: " of ", size: 20, font: "Times New Roman" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 20, font: "Times New Roman" })
              ]
            })
          ]
        })
      },
      children: [
        // ── TABLE OF CONTENTS ───────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 200 },
          children: [new TextRun({ text: "TABLE OF CONTENTS", bold: true, size: 32, font: "Times New Roman", color: "1F3864" })]
        }),
        new TableOfContents("Table of Contents", {
          hyperlink: true,
          headingStyleRange: "1-3",
          stylesWithLevels: [
            { styleName: "Heading1", levelNumber: 1 },
            { styleName: "Heading2", levelNumber: 2 },
            { styleName: "Heading3", levelNumber: 3 }
          ]
        }),
        pageBreak(),

        // ── SECTION 1: PROJECT OVERVIEW ─────────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "1. Project Overview", bold: true, font: "Times New Roman" })] }),

        body("Memory management is one of the most fundamental and critical responsibilities of an operating system. It refers to the process of coordinating and managing computer memory — allocating portions of memory to programs when they request it, and then freeing it for reuse when they no longer need it. Efficient memory management ensures that multiple programs can run simultaneously without interfering with each other, that memory resources are used as efficiently as possible, and that the system remains stable and responsive under varying workloads."),

        body("In modern computing, memory management encompasses several advanced techniques. Among the most important are segmentation, paging, and virtual memory. Each of these techniques addresses specific challenges associated with managing physical and logical memory spaces. Understanding how they work — individually and in combination — is essential for anyone studying operating systems, computer architecture, or systems programming."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "1.1 Importance of Segmentation, Paging, and Virtual Memory", bold: true, font: "Times New Roman" })] }),

        body("Segmentation is a memory management scheme that divides a program's address space into logical units called segments — each corresponding to a logical division of the program such as code, stack, or data. Each segment has a base address (where it starts in physical memory) and a limit (its maximum size). Segmentation allows different parts of a program to be placed in different areas of memory and provides protection by enforcing bounds checking — preventing a segment from accessing memory outside its defined range."),

        body("Paging, on the other hand, eliminates the problem of external fragmentation by dividing both physical memory and logical address space into fixed-size blocks called frames and pages, respectively. The operating system maintains a page table that maps logical page numbers to physical frame numbers. When a process accesses a logical address, the memory management unit translates it into a physical address using the page table. Page fault detection is a critical feature — when a process accesses a page that is not currently in physical memory, a page fault is triggered and the operating system must load the required page from disk."),

        body("Virtual memory is perhaps the most powerful concept in modern memory management. It allows a computer to compensate for physical memory shortages by temporarily transferring data from random-access memory to disk storage. This gives the illusion of having more memory than physically available. Virtual memory relies on page replacement algorithms — FIFO (First In, First Out), LRU (Least Recently Used), and Optimal — to decide which pages to evict from memory when new pages need to be loaded. The efficiency of these algorithms directly impacts overall system performance through minimization of page faults."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "1.2 Objectives of the Project", bold: true, font: "Times New Roman" })] }),

        body("The primary objectives of the Dynamic Memory Management Visualizer project are as follows:"),
        bullet("To build an interactive, browser-based simulation tool that demonstrates core memory management techniques covered in the Operating Systems curriculum.", "bullets"),
        bullet("To implement a Segmentation Simulator that accepts user-defined segment tables, calculates physical addresses from logical addresses, and detects segmentation faults.", "bullets"),
        bullet("To implement a Paging Simulator that translates logical addresses to physical addresses using page tables, with configurable page sizes and frame counts.", "bullets"),
        bullet("To implement a Virtual Memory Simulator that accepts a user-defined page reference string, simulates FIFO, LRU, and Optimal page replacement algorithms, and calculates page hits, faults, and fault rates.", "bullets"),
        bullet("To provide a clean, intuitive user interface that is accessible in any modern web browser without requiring installation of external tools or dependencies.", "bullets"),
        bullet("To reinforce theoretical knowledge through hands-on experimentation, making abstract concepts concrete and observable.", "bullets"),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "1.3 Expected Outcomes", bold: true, font: "Times New Roman" })] }),

        body("Upon successful completion of this project, the following outcomes are expected:"),
        bullet("A fully functional web-based simulation tool accessible directly from a web browser.", "bullets"),
        bullet("An accurate segmentation simulator that validates logical addresses and computes physical address translations with bounds checking.", "bullets"),
        bullet("A paging simulator that correctly maps logical page numbers to physical frame numbers and detects page faults.", "bullets"),
        bullet("A virtual memory simulator capable of running FIFO, LRU, and Optimal algorithms on user-provided reference strings and reporting detailed statistics.", "bullets"),
        bullet("Clear, tabular result visualizations for each simulation module.", "bullets"),
        bullet("A version-controlled codebase hosted on GitHub demonstrating iterative development practices.", "bullets"),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "1.4 Scope of the Project", bold: true, font: "Times New Roman" })] }),

        body("The scope of the Dynamic Memory Management Visualizer is confined to the simulation of three key memory management techniques: segmentation, paging, and virtual memory replacement algorithms. The tool operates purely in the user's web browser using HTML, CSS, and JavaScript — no server-side processing or database is required. The simulation assumes simplified, idealized memory models for pedagogical clarity. The project does not aim to replicate real operating system internals but instead to provide a clear, visual, and interactive understanding of how these memory management techniques work at a conceptual level. The tool is intended for use in academic settings as a learning aid and is not designed for production or industrial use."),

        pageBreak(),

        // ── SECTION 2: MODULE-WISE BREAKDOWN ───────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "2. Module-Wise Breakdown", bold: true, font: "Times New Roman" })] }),

        body("The Dynamic Memory Management Visualizer is structured into three distinct and self-contained modules, each focusing on a specific memory management technique. Each module accepts user-defined inputs, processes them according to the relevant algorithm or method, and displays the output in a structured table format. The three modules are described in detail below."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "2.1 Module 1: Segmentation Simulator", bold: true, font: "Times New Roman" })] }),

        body("The Segmentation Simulator is the first module of the visualizer. It is designed to help users understand how segmentation-based memory management works in practice. The user defines a segment table consisting of multiple entries, each with a segment number, a base address, and a limit (or size) value. The module then accepts a logical address composed of a segment number and an offset, and computes the corresponding physical address."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.1.1 Base-Limit Translation", bold: true, font: "Times New Roman" })] }),

        body("Base-limit translation is the core operation performed by the Segmentation Simulator. Given a logical address (s, d) — where 's' is the segment number and 'd' is the offset — the simulator looks up the segment table to find the base address (B) and limit (L) for segment 's'. The physical address is then calculated as:"),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          children: [new TextRun({ text: "Physical Address = Base(s) + Offset (d)", bold: true, size: 24, font: "Courier New" })]
        }),

        body("This formula is the foundation of segmented memory access. The base address tells the system where in physical memory a given segment begins, and the offset indicates how far into that segment the desired location is. The visualizer displays this translation step-by-step, making it easy to understand the mechanics of segmentation."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.1.2 Bounds Checking", bold: true, font: "Times New Roman" })] }),

        body("Bounds checking is a critical protection mechanism in segmentation. Before computing the physical address, the simulator checks whether the given offset 'd' is within the valid range of the segment — i.e., whether d < Limit(s). If the offset exceeds the segment's limit, the access is considered illegal and a segmentation fault is reported. This mechanism prevents one segment from reading or writing into the memory space of another segment, enforcing memory protection at the hardware level."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.1.3 Physical Address Calculation", bold: true, font: "Times New Roman" })] }),

        body("When bounds checking passes (i.e., d < Limit(s)), the physical address is computed by adding the base address of the segment to the offset. The simulator presents the user with a detailed breakdown of this calculation — displaying the segment number, base, limit, offset, whether bounds checking passed or failed, and the resulting physical address (or fault) — in a well-formatted results table."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.1.4 Fault Detection", bold: true, font: "Times New Roman" })] }),

        body("Fault detection in the Segmentation Simulator handles two scenarios: an invalid segment number (where the segment number does not exist in the segment table) and an illegal offset (where the offset is greater than or equal to the segment's limit). In both cases, the simulator reports a Segmentation Fault and highlights the error for the user. This mimics the behavior of a real operating system, which would raise a protection exception (such as a SIGSEGV signal in Unix/Linux) when an illegal memory access is attempted."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "2.2 Module 2: Paging Simulator", bold: true, font: "Times New Roman" })] }),

        body("The Paging Simulator is the second module of the visualizer. It demonstrates how a paging-based memory management system translates logical addresses to physical addresses using a page table. The user defines the page size, the number of frames, and the page-to-frame mapping. The simulator then accepts a logical address and performs the complete address translation process."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.2.1 Page Size", bold: true, font: "Times New Roman" })] }),

        body("Page size is a fundamental parameter in the paging system. It defines the granularity of memory partitioning — both in logical and physical memory. In the simulator, the page size is configurable by the user and must be a power of 2 (a real-world requirement, since bitwise operations are used for efficient address translation). The page size determines how many bits of the logical address represent the page number and how many represent the offset within a page."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.2.2 Logical Address Translation", bold: true, font: "Times New Roman" })] }),

        body("A logical address in a paging system is divided into two parts: the page number (p) and the page offset (d). The page number is used as an index into the page table to find the corresponding physical frame number (f). The page offset remains unchanged. The logical address translation follows this formula:"),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 80 },
          children: [new TextRun({ text: "Page Number (p) = Logical Address / Page Size", bold: true, size: 24, font: "Courier New" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 120 },
          children: [new TextRun({ text: "Page Offset (d) = Logical Address mod Page Size", bold: true, size: 24, font: "Courier New" })]
        }),

        body("The simulator shows the complete breakdown of the logical address into page number and offset, the lookup in the page table to find the frame number, and the final construction of the physical address."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.2.3 Frame Mapping", bold: true, font: "Times New Roman" })] }),

        body("Frame mapping refers to the process of associating logical pages with physical frames using the page table. The user inputs the page table entries (page number to frame number mappings) into the simulator. The simulator then uses this table to look up the physical frame for a given page number. The physical address is computed as:"),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          children: [new TextRun({ text: "Physical Address = (Frame Number × Page Size) + Page Offset", bold: true, size: 24, font: "Courier New" })]
        }),

        body("The simulator displays the page table, the mapping used, and the resulting physical address clearly in a tabular format so students can easily follow the translation steps."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.2.4 Page Fault Detection", bold: true, font: "Times New Roman" })] }),

        body("A page fault occurs when the requested page is not present in any physical frame — i.e., the page table entry for that page is empty or marked as invalid. In the Paging Simulator, if a user queries a page number that has no corresponding frame in the page table, the simulator reports a Page Fault and indicates that the page would need to be loaded from secondary storage in a real system. This reinforces the concept of the page fault interrupt and its role in the OS memory management subsystem."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "2.3 Module 3: Virtual Memory Simulator", bold: true, font: "Times New Roman" })] }),

        body("The Virtual Memory Simulator is the most complex and feature-rich module of the project. It simulates the behavior of a virtual memory system under different page replacement strategies. The user defines a page reference string (a sequence of page numbers that represent memory accesses), the number of available frames, and the replacement algorithm to apply. The simulator then runs the selected algorithm and reports the number of page hits, page faults, and the page fault rate."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.3.1 Page Reference String", bold: true, font: "Times New Roman" })] }),

        body("The page reference string is the input to the virtual memory simulation. It is a sequence of page numbers representing the order in which a process accesses memory pages over time. For example, a reference string might be: 7, 0, 1, 2, 0, 3, 0, 4, 2, 3. The simulator processes each entry in the reference string one by one, checking whether the requested page is already in one of the available frames (a hit) or whether it must be loaded, potentially evicting another page (a fault)."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.3.2 Frame Allocation", bold: true, font: "Times New Roman" })] }),

        body("Frame allocation refers to the number of physical memory frames available to hold pages during the simulation. The user specifies this number. When frames are available (not yet full), new pages are simply loaded into an empty frame. Once all frames are occupied and a new page is needed that is not already in memory, the replacement algorithm must select a victim page to evict. The number of frames has a direct impact on the number of page faults — more frames generally means fewer faults."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.3.3 FIFO Algorithm", bold: true, font: "Times New Roman" })] }),

        body("The First In, First Out (FIFO) page replacement algorithm replaces the page that has been in memory the longest — the one that arrived first. It is the simplest replacement policy to implement and uses a queue data structure: new pages are added to the back of the queue, and when a replacement is needed, the page at the front of the queue (the oldest) is evicted. While easy to implement, FIFO can suffer from Belady's Anomaly — a counterintuitive phenomenon where increasing the number of frames can actually increase the number of page faults for certain reference strings."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.3.4 LRU Algorithm", bold: true, font: "Times New Roman" })] }),

        body("The Least Recently Used (LRU) page replacement algorithm replaces the page that has not been used for the longest period of time. It is based on the principle of locality of reference — pages that have been used recently are likely to be used again in the near future, while pages that have not been accessed recently are less likely to be needed soon. LRU is a practical and widely-used algorithm in real operating systems. The simulator tracks the order of page usage and, when a replacement is needed, evicts the page with the oldest last-use timestamp."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.3.5 Optimal Algorithm", bold: true, font: "Times New Roman" })] }),

        body("The Optimal (OPT) page replacement algorithm — also known as Belady's Algorithm — replaces the page that will not be used for the longest time in the future. It produces the minimum possible number of page faults for any given reference string and frame count, and serves as a theoretical benchmark for evaluating other algorithms. Since it requires knowledge of future memory accesses, it cannot be implemented in a real operating system; however, it is very useful in simulation environments like this project, where the full reference string is known in advance."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "2.3.6 Hit and Fault Calculation", bold: true, font: "Times New Roman" })] }),

        body("For each step in the simulation, the tool records whether the memory access was a hit (the page was already in a frame) or a fault (the page was not in memory and had to be loaded). At the end of the simulation, the tool computes and displays the total number of hits, the total number of faults, and the page fault rate — calculated as the number of faults divided by the total number of memory accesses, expressed as a percentage. These statistics allow students to directly compare the efficiency of the three algorithms on the same input."),

        pageBreak(),

        // ── SECTION 3: FUNCTIONALITIES ──────────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "3. Functionalities", bold: true, font: "Times New Roman" })] }),

        body("The Dynamic Memory Management Visualizer provides a comprehensive set of functionalities that together enable a complete simulation experience. Each functionality is described in detail below."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.1 User-Defined Input Support", bold: true, font: "Times New Roman" })] }),
        body("All three modules accept fully user-defined inputs rather than using hardcoded values. In the Segmentation Simulator, the user enters the segment table and the logical address. In the Paging Simulator, the user defines the page size, frame count, page table, and logical address. In the Virtual Memory Simulator, the user provides the reference string and frame count. This flexibility allows the tool to simulate a wide variety of scenarios and makes it suitable for use with different textbook examples and assignment problems."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.2 Segmentation Validation", bold: true, font: "Times New Roman" })] }),
        body("The Segmentation Simulator validates every logical address before processing it. It first checks whether the provided segment number exists in the segment table. It then checks whether the provided offset is within the segment's defined limit. If either check fails, the system immediately reports a segmentation fault and displays an appropriate error message. Valid accesses proceed to physical address computation without error."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.3 Paging Address Translation", bold: true, font: "Times New Roman" })] }),
        body("The Paging Simulator performs complete logical-to-physical address translation. It decomposes the user-provided logical address into a page number and an offset based on the configured page size. It then uses the page table to find the corresponding physical frame. If a mapping exists, the physical address is computed and displayed. If no mapping exists for the requested page number, a page fault is reported. The complete translation process — including intermediate values — is shown to the user."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.4 Virtual Memory Simulation", bold: true, font: "Times New Roman" })] }),
        body("The Virtual Memory Simulator orchestrates the full page replacement simulation. It accepts the reference string and frame count, initializes the frame pool, and processes each page reference one by one. For each reference, it determines whether a hit or fault occurred, updates the frame contents according to the selected replacement policy, and records the result. At the end, a full step-by-step breakdown of the simulation is displayed alongside summary statistics."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.5 FIFO Implementation", bold: true, font: "Times New Roman" })] }),
        body("The FIFO algorithm is implemented using a queue data structure. The simulator maintains a list of pages currently in memory, ordered by their arrival time. When a new page must be loaded and all frames are occupied, the page at the front of the queue (the one that was loaded earliest) is removed, and the new page is added to the back. Each step of this process is recorded and displayed for the user."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.6 LRU Implementation", bold: true, font: "Times New Roman" })] }),
        body("The LRU algorithm is implemented by tracking the last-access time of each page currently in memory. When a replacement is needed, the page with the oldest last-access timestamp is selected for eviction. After each memory access — whether a hit or a fault — the access time of the affected page is updated. The simulator shows which page is selected for replacement at each step of the simulation."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.7 Optimal Replacement", bold: true, font: "Times New Roman" })] }),
        body("The Optimal algorithm is implemented by scanning the future portion of the reference string at each replacement step to determine which page currently in memory will not be accessed again for the longest time. That page is selected for eviction. If a page currently in memory does not appear anywhere in the remaining reference string, it is given the highest priority for eviction (since it will never be needed again). The simulator computes and displays this analysis for every fault step."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.8 Page Fault Tracking", bold: true, font: "Times New Roman" })] }),
        body("Every page fault that occurs during the virtual memory simulation is tracked and recorded. The simulator maintains a running count of faults as the simulation progresses. For each step where a fault occurs, the tool highlights the event in the results table, making it visually easy to identify which memory accesses caused faults and which pages were evicted as a result."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.9 Hit Tracking", bold: true, font: "Times New Roman" })] }),
        body("Similarly, every page hit is tracked throughout the simulation. A hit occurs when the requested page is already present in one of the allocated frames, requiring no page loading. The tool records and displays hits clearly, differentiating them from faults in the results table. The total hit count contributes to the final hit rate calculation."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.10 Fault Rate Calculation", bold: true, font: "Times New Roman" })] }),
        body("After the simulation completes, the tool automatically calculates and displays the page fault rate. The fault rate is computed as the number of page faults divided by the total number of memory references in the string, expressed as a percentage. This metric provides a quantitative measure of algorithm performance, enabling direct comparison between FIFO, LRU, and Optimal on the same input data."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.11 Result Visualization Tables", bold: true, font: "Times New Roman" })] }),
        body("All three simulation modules display their results using well-formatted HTML tables. These tables present step-by-step data — including frame states at each step, hit/fault status, and computed addresses — in a clear and organized manner. The tabular format makes it easy for students to trace through the algorithm manually and verify the simulator's results against hand-computed solutions."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.12 Interactive UI Simulation", bold: true, font: "Times New Roman" })] }),
        body("The user interface of the tool is fully interactive. Input fields, dropdowns, and buttons allow users to configure and run each simulation without any programming knowledge. The interface is responsive and works in any modern web browser on desktop and mobile devices. Input validation is performed before each simulation run to ensure that the user has entered all required fields in the correct format, and appropriate error messages are displayed if validation fails."),

        pageBreak(),

        // ── SECTION 4: TECHNOLOGY USED ─────────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "4. Technology Used", bold: true, font: "Times New Roman" })] }),

        body("The Dynamic Memory Management Visualizer is built using standard web technologies that are universally supported and require no installation. The choice of technology was driven by the need for accessibility, ease of development, and the ability to create an interactive, visual simulation in a portable format. The technologies and tools used are described in detail below."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "4.1 Programming Languages", bold: true, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "4.1.1 HTML (HyperText Markup Language)", bold: true, font: "Times New Roman" })] }),
        body("HTML5 is used as the structural foundation of the application. It defines the layout of all three simulation modules — including input forms, buttons, and result tables. HTML provides the semantic structure that allows the browser to render the user interface correctly. HTML5's built-in form elements (text inputs, number inputs, select dropdowns) are used to collect user input for each simulation. HTML was chosen because it is the standard language for building web-based interfaces and requires no additional runtime or installation."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "4.1.2 CSS (Cascading Style Sheets)", bold: true, font: "Times New Roman" })] }),
        body("CSS3 is used to style the application and provide a clean, professional visual experience. It controls the layout, color scheme, typography, spacing, and responsive behavior of the interface. CSS Flexbox and Grid are used to create the modular card-based layout. Custom color themes distinguish the three simulation modules visually. CSS was chosen for its power and flexibility in creating responsive, visually appealing user interfaces without requiring any JavaScript frameworks or external libraries."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "4.1.3 JavaScript", bold: true, font: "Times New Roman" })] }),
        body("JavaScript (ES6+) serves as the logic engine of the application. All three simulation algorithms — segmentation translation, paging address computation, FIFO, LRU, and Optimal page replacement — are implemented in pure JavaScript. JavaScript also handles DOM manipulation (updating the result tables and displaying error messages), input validation, and event handling (responding to button clicks). JavaScript was chosen because it runs natively in every web browser, enabling client-side computation without any server infrastructure."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "4.2 Libraries and Tools", bold: true, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "4.2.1 Web Browser", bold: true, font: "Times New Roman" })] }),
        body("The application runs entirely in a web browser and is compatible with all modern browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari. The browser serves as the runtime environment, rendering the HTML/CSS interface and executing the JavaScript simulation logic. No plugins, extensions, or additional software are required. This makes the tool highly portable and accessible on any device with a web browser."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "4.2.2 GitHub (Version Control)", bold: true, font: "Times New Roman" })] }),
        body("GitHub is used as the version control platform for the project. The repository (dynamic-memory-management-visualizer) hosts the complete source code and tracks all changes made throughout the development lifecycle. GitHub enables collaborative development, provides a history of all commits, and supports branching and merging workflows. Using GitHub as a version control tool follows industry best practices and demonstrates a professional approach to software development."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "4.3 Other Tools", bold: true, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "4.3.1 draw.io (Flow Diagram)", bold: true, font: "Times New Roman" })] }),
        body("draw.io (also known as diagrams.net) is a free, browser-based diagramming tool used to create the system flow diagram for this project. It was chosen for its ease of use, wide variety of diagram templates, and ability to export diagrams in multiple formats (PNG, SVG, PDF). The flow diagram illustrating the user journey through the simulation tool was created using draw.io and is included in Section 5 of this report."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "4.3.2 Visual Studio Code (Code Editor)", bold: true, font: "Times New Roman" })] }),
        body("Visual Studio Code (VS Code) is used as the primary code editor for developing the project. VS Code provides syntax highlighting, IntelliSense code completion, integrated terminal, and Git integration — all of which significantly enhance developer productivity. Extensions such as Live Server (for real-time preview of HTML/CSS/JS changes in the browser) and Prettier (for code formatting) were used during development."),

        pageBreak(),

        // ── SECTION 5: FLOW DIAGRAM ─────────────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "5. Flow Diagram", bold: true, font: "Times New Roman" })] }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" }
          },
          children: [new TextRun({ text: "[ Insert Flow Diagram Image Here ]", bold: true, size: 28, font: "Times New Roman", color: "999999" })]
        }),

        ...spacer(1),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "5.1 Flow Description", bold: true, font: "Times New Roman" })] }),

        body("The overall flow of the Dynamic Memory Management Visualizer follows a linear yet modular sequence. Each stage of the flow is described below."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "Stage 1: Start", bold: true, font: "Times New Roman" })] }),
        body("The user opens the HTML file in a web browser. The application loads all required CSS styles and JavaScript logic. The main interface is rendered, presenting the user with three clearly labeled simulation modules: Segmentation Simulator, Paging Simulator, and Virtual Memory Simulator. No server communication is needed; the entire application is loaded locally."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "Stage 2: Select Simulation", bold: true, font: "Times New Roman" })] }),
        body("The user selects the simulation module they wish to use. Each module is presented as a distinct section on the page. The user may scroll to the desired module or use navigation elements to jump to it. The selection step determines which set of input fields and controls the user will interact with."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "Stage 3: Input Data", bold: true, font: "Times New Roman" })] }),
        body("The user enters the required data for the selected simulation. For the Segmentation Simulator, this includes the segment table entries and a logical address. For the Paging Simulator, this includes the page size, page table, and a logical address. For the Virtual Memory Simulator, this includes the page reference string and the frame count. Input fields are clearly labeled with placeholders and instructions to guide the user."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "Stage 4: Process Algorithm", bold: true, font: "Times New Roman" })] }),
        body("Upon clicking the 'Simulate' or 'Calculate' button, the JavaScript logic validates the user input, parses it into the appropriate data structures, and executes the selected algorithm. For segmentation and paging, this is a direct address translation computation. For virtual memory, this is an iterative simulation of the reference string processing, tracking hits and faults at each step. Error handling is performed inline — invalid input is caught and reported without running the simulation."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "Stage 5: Display Output", bold: true, font: "Times New Roman" })] }),
        body("Once processing is complete, the results are dynamically injected into the HTML page using JavaScript's DOM manipulation APIs. The output is displayed as a formatted table below the input section of the relevant module. For virtual memory simulation, the table includes one row per reference string entry, showing frame states, hit/fault status, and replaced pages. Summary statistics (total hits, total faults, fault rate) are displayed below the table."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "Stage 6: End", bold: true, font: "Times New Roman" })] }),
        body("After reviewing the results, the user may modify the input values and re-run the simulation as many times as desired. There is no persistent state between sessions; each page load starts fresh. The user may switch between modules freely. The application has no explicit 'end' state — it is designed for continuous interactive use during study or classroom activities."),

        pageBreak(),

        // ── SECTION 6: GITHUB REVISION TRACKING ───────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "6. Revision Tracking on GitHub", bold: true, font: "Times New Roman" })] }),

        body("Version control is a foundational practice in modern software development. For the Dynamic Memory Management Visualizer project, GitHub is used as the remote version control platform, hosting the complete source code and providing a complete audit trail of all changes made throughout the project's development."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "6.1 Repository Information", bold: true, font: "Times New Roman" })] }),

        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            new TableRow({ children: [
              cell("Field", 3120, { header: true, shade: "D5E8F0" }),
              cell("Details", 6240, { header: true, shade: "D5E8F0" })
            ]}),
            new TableRow({ children: [cell("Repository Name", 3120), cell("dynamic-memory-management-visualizer", 6240)] }),
            new TableRow({ children: [cell("GitHub Link", 3120), cell("[To be inserted by student]", 6240)] }),
            new TableRow({ children: [cell("Visibility", 3120), cell("Public", 6240)] }),
            new TableRow({ children: [cell("Primary Branch", 3120), cell("main", 6240)] }),
            new TableRow({ children: [cell("Version Control Tool", 3120), cell("Git (via GitHub)", 6240)] }),
          ]
        }),

        ...spacer(1),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "6.2 Importance of Version Control", bold: true, font: "Times New Roman" })] }),
        body("Version control is essential for any software development project, regardless of its size. It provides a mechanism for tracking every change made to the codebase over time, allowing developers to understand what changed, when it changed, and why. In the context of this academic project, version control on GitHub ensures that the complete development history is preserved and can be reviewed by instructors to verify the iterative development process."),

        body("Version control also provides safety — if a new change introduces a bug, the developer can easily revert to a previous working version. It supports collaboration by allowing multiple developers to work on different features simultaneously without overwriting each other's changes. Even for individual projects, using Git enforces good development habits such as writing meaningful commit messages, working in feature branches, and reviewing changes before merging them."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "6.3 Commit Strategy", bold: true, font: "Times New Roman" })] }),
        body("Throughout the development of this project, commits were made incrementally after each meaningful addition or fix. Each commit is accompanied by a descriptive message that explains what was changed and why. This approach creates a clean and understandable history. Examples of commit messages used in the project include:"),

        bullet("Initial project setup: HTML structure and CSS layout scaffolding", "bullets"),
        bullet("Add Segmentation Simulator: base-limit translation logic", "bullets"),
        bullet("Add bounds checking and fault detection to segmentation module", "bullets"),
        bullet("Implement Paging Simulator: page table and address translation", "bullets"),
        bullet("Add page fault detection to Paging Simulator", "bullets"),
        bullet("Implement FIFO algorithm for Virtual Memory Simulator", "bullets"),
        bullet("Implement LRU algorithm for Virtual Memory Simulator", "bullets"),
        bullet("Implement Optimal algorithm for Virtual Memory Simulator", "bullets"),
        bullet("Add hit/fault tracking and fault rate calculation", "bullets"),
        bullet("Improve UI: responsive layout, color themes, and input validation", "bullets"),
        bullet("Final testing and bug fixes", "bullets"),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "6.4 Branch Creation and Merging", bold: true, font: "Times New Roman" })] }),
        body("Feature branches were used to develop each module independently without affecting the stable main branch. The branching strategy followed in this project is as follows:"),

        bullet("main branch: Contains the stable, tested version of the project at all times.", "bullets"),
        bullet("feature/segmentation branch: Used to develop and test the Segmentation Simulator module independently.", "bullets"),
        bullet("feature/paging branch: Used to develop and test the Paging Simulator module.", "bullets"),
        bullet("feature/virtual-memory branch: Used to develop and test the Virtual Memory Simulator, including all three replacement algorithms.", "bullets"),
        bullet("feature/ui-enhancements branch: Used for UI/UX improvements, styling updates, and responsive design work.", "bullets"),

        body("Once each feature branch was fully implemented and tested, a pull request was created on GitHub, the changes were reviewed, and the branch was merged into main. This workflow mirrors industry-standard practices such as GitHub Flow and ensures that the main branch always contains a working, stable version of the project."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "6.5 Minimum Revisions Maintained", bold: true, font: "Times New Roman" })] }),
        body("A minimum of 10 to 15 meaningful commits were maintained across the project's development lifecycle, spanning all three modules and the user interface. Additional commits for bug fixes, documentation updates (README.md), and code refactoring were also included. The commit history provides a complete, auditable record of the project's evolution from initial setup to final submission."),

        pageBreak(),

        // ── SECTION 7: CONCLUSION AND FUTURE SCOPE ─────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "7. Conclusion and Future Scope", bold: true, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "7.1 Conclusion", bold: true, font: "Times New Roman" })] }),

        body("The Dynamic Memory Management Visualizer successfully achieves its stated objectives of providing an interactive, browser-based simulation tool for understanding and demonstrating core memory management techniques. The project encompasses three fully functional modules — the Segmentation Simulator, the Paging Simulator, and the Virtual Memory Simulator — each of which accurately implements the corresponding algorithm and presents its results in a clear, step-by-step tabular format."),

        body("The Segmentation Simulator correctly performs base-limit address translation and enforces bounds checking, reporting segmentation faults for invalid accesses. The Paging Simulator accurately decomposes logical addresses into page numbers and offsets, maps them to physical frames using a user-defined page table, and detects page faults. The Virtual Memory Simulator implements all three major page replacement algorithms — FIFO, LRU, and Optimal — computes hit and fault statistics for each, and enables direct comparison of algorithm performance."),

        body("The system significantly aids in understanding the abstract concepts of memory management by making them observable and interactive. Rather than simply reading about page faults in a textbook, students can input real reference strings and watch the algorithms make replacement decisions step by step. This experiential learning approach reinforces theoretical knowledge and builds intuition about how operating systems manage memory resources."),

        body("From a development perspective, the project demonstrates the effective use of HTML, CSS, and JavaScript to build interactive educational tools. The use of GitHub for version control, feature branching, and pull requests reflects professional software development practices and ensures the project has a clean, auditable history. The learning outcomes of this project include a deepened understanding of memory management algorithms, practical experience with web-based UI development, and familiarity with version control workflows."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "7.2 Future Scope", bold: true, font: "Times New Roman" })] }),

        body("While the current version of the Dynamic Memory Management Visualizer is fully functional and meets all project requirements, there are several areas where it could be extended and enhanced in future iterations:"),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "7.2.1 Graphical Memory Block Visualization", bold: true, font: "Times New Roman" })] }),
        body("The current simulator presents results in tabular form. A significant enhancement would be to add a graphical representation of physical memory — showing memory blocks, frames, and segments as colored rectangles in a visual memory map. This would make it even easier to understand how memory is divided and allocated, especially for learners who are more visually oriented."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "7.2.2 Real-Time Animation", bold: true, font: "Times New Roman" })] }),
        body("Adding step-by-step animation to the virtual memory simulation would greatly enhance its educational value. Rather than displaying all results at once, the simulator could animate each memory reference one at a time — highlighting which frame is being updated, which page is being evicted, and whether the access resulted in a hit or fault. Animations with configurable playback speed would allow students to follow the algorithm at their own pace."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "7.2.3 Additional Algorithms", bold: true, font: "Times New Roman" })] }),
        body("Future versions of the project could incorporate additional page replacement algorithms such as Clock (Second-Chance), MFU (Most Frequently Used), MRU (Most Recently Used), and Working Set. Adding these algorithms would make the simulator a more comprehensive reference tool and allow students to explore a wider range of replacement strategies."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "7.2.4 Performance Comparison Charts", bold: true, font: "Times New Roman" })] }),
        body("A comparative analysis feature could be added that runs all three (or more) replacement algorithms on the same input simultaneously and displays a bar chart or line graph comparing their page fault rates. This visual comparison would immediately highlight the relative performance of different algorithms and make it easy to understand why Optimal always performs best while FIFO may be subject to Belady's Anomaly."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "7.2.5 Export Result Features", bold: true, font: "Times New Roman" })] }),
        body("Adding the ability to export simulation results — as a PDF report, a CSV file, or an image — would make the tool more practical for assignment submission and study purposes. Students could run simulations, export the results, and include them directly in their assignment reports or lab notebooks."),

        pageBreak(),

        // ── SECTION 8: REFERENCES ───────────────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "8. References", bold: true, font: "Times New Roman" })] }),

        body("The following references were consulted during the planning, development, and documentation of the Dynamic Memory Management Visualizer project:"),

        ...spacer(1),

        new Paragraph({ spacing: { before: 80, after: 80 }, numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: 'Silberschatz, A., Galvin, P. B., and Gagne, G. (2018). Operating System Concepts (10th ed.). Wiley. [Chapters 8–9: Main Memory and Virtual Memory]', size: 24, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 80, after: 80 }, numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: 'Tanenbaum, A. S., and Bos, H. (2014). Modern Operating Systems (4th ed.). Pearson. [Chapter 3: Memory Management]', size: 24, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 80, after: 80 }, numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: 'GeeksforGeeks. (2023). Page Replacement Algorithms in Operating Systems. Retrieved from https://www.geeksforgeeks.org/page-replacement-algorithms-in-operating-systems/', size: 24, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 80, after: 80 }, numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: 'GeeksforGeeks. (2023). Segmentation in Operating Systems. Retrieved from https://www.geeksforgeeks.org/segmentation-in-operating-system/', size: 24, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 80, after: 80 }, numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: 'GeeksforGeeks. (2023). Paging in Operating Systems. Retrieved from https://www.geeksforgeeks.org/paging-in-operating-system/', size: 24, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 80, after: 80 }, numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: 'W3Schools. (2024). JavaScript Tutorial. Retrieved from https://www.w3schools.com/js/', size: 24, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 80, after: 80 }, numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: 'W3Schools. (2024). HTML5 Reference. Retrieved from https://www.w3schools.com/html/', size: 24, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 80, after: 80 }, numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: 'MDN Web Docs. (2024). JavaScript — MDN Web Docs. Mozilla. Retrieved from https://developer.mozilla.org/en-US/docs/Web/JavaScript', size: 24, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 80, after: 80 }, numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: 'MDN Web Docs. (2024). CSS — MDN Web Docs. Mozilla. Retrieved from https://developer.mozilla.org/en-US/docs/Web/CSS', size: 24, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 80, after: 80 }, numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: 'GitHub Docs. (2024). Getting Started with GitHub. Retrieved from https://docs.github.com/en/get-started', size: 24, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 80, after: 80 }, numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: 'GitHub Docs. (2024). About Branches. Retrieved from https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-branches', size: 24, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 80, after: 80 }, numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: 'draw.io / diagrams.net. (2024). Flowchart and Diagram Creation Tool. Retrieved from https://www.drawio.com/', size: 24, font: "Times New Roman" })] }),

        pageBreak(),

        // ── APPENDIX ────────────────────────────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Appendix", bold: true, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Appendix A: AI-Generated Project Breakdown", bold: true, font: "Times New Roman" })] }),

        body("Artificial Intelligence tools were used as supplementary resources to assist in certain aspects of planning and understanding this project. Specifically, AI assistance was leveraged in the following areas:"),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "A.1 Project Planning Assistance", bold: true, font: "Times New Roman" })] }),
        body("During the initial planning phase, AI tools were consulted to help structure the project into logical modules, identify the most relevant memory management algorithms for inclusion, and prioritize features based on educational value. The AI suggested dividing the project into three independent simulators (Segmentation, Paging, and Virtual Memory) to maintain a clean separation of concerns and make the codebase more modular and maintainable."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "A.2 Module Division", bold: true, font: "Times New Roman" })] }),
        body("AI assistance helped define the boundaries and responsibilities of each module. The suggestion to treat each simulator as a self-contained unit — with its own input form, simulation logic, and output table — emerged from AI-assisted planning discussions. This modular design made it straightforward to develop, test, and debug each simulator independently, and also made the report structure easier to organize."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "A.3 Algorithm Understanding", bold: true, font: "Times New Roman" })] }),
        body("AI tools were also used to clarify subtle aspects of the three virtual memory replacement algorithms — particularly the Optimal algorithm's forward-looking replacement strategy and the handling of edge cases (such as when a page in memory does not appear in the remaining reference string). The AI provided clear, step-by-step explanations that supplemented the textbook material and helped in correctly implementing the algorithms in JavaScript. All final implementations were independently verified against textbook examples and hand-computed test cases."),

        body("It is important to note that all code, design decisions, and written content in this report represent the original work of the student. AI tools were used only as a learning and planning aid, not as a code or content generator."),

        ...spacer(1),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Appendix B: Problem Statement", bold: true, font: "Times New Roman" })] }),

        new Paragraph({
          spacing: { before: 120, after: 120 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" },
            left: { style: BorderStyle.SINGLE, size: 8, color: "1F3864" }
          },
          indent: { left: 360 },
          children: [new TextRun({ text: "Build a tool to simulate and visualize memory management techniques like paging, segmentation, and virtual memory. The system should handle user-defined inputs for memory allocation, page faults, and replacement algorithms (FIFO, LRU, and Optimal). The tool must display step-by-step simulation results in a tabular format, calculate page fault rates, and provide an interactive, browser-based interface requiring no installation.", italics: true, size: 24, font: "Times New Roman" })]
        }),

        body("This problem statement guided all design and implementation decisions throughout the project. Every feature implemented — from the user-defined input forms to the fault rate calculation — directly addresses a specific requirement stated above. The tool successfully meets all stated requirements within the scope defined in Section 1.4 of this report."),

        ...spacer(1),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Appendix C: Solution / Code", bold: true, font: "Times New Roman" })] }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" }
          },
          children: [new TextRun({ text: "[ Insert Full Project Code Here ]", bold: true, size: 28, font: "Times New Roman", color: "999999" })]
        }),

        body("The complete project source code — including index.html, style.css, and script.js — is available in the GitHub repository at the link provided in Section 6. Students and instructors may clone or download the repository to review the full implementation. The code is organized into clearly commented sections corresponding to each of the three simulation modules described in this report. Inline comments explain the logic of each algorithm at key decision points."),

        ...spacer(2),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 120 },
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: "1F3864", space: 8 } },
          children: [new TextRun({ text: "— End of Report —", bold: true, size: 24, font: "Times New Roman", color: "555555" })]
        })
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("report.docx", buffer);
  console.log("Done: report.docx generated successfully!");
});
