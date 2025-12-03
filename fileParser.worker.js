/**
 * Web Worker for parsing files (PDF, DOCX, TXT) off the main thread
 * to prevent the UI from freezing on complex or corrupted files.
 */

// Using .js versions which are UMD/global-friendly for importScripts
importScripts('https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.min.js');
importScripts('https://unpkg.com/mammoth@1.6.0/mammoth.browser.min.js');

// The 'pdfjsLib' and 'mammoth' globals are available after the scripts are imported.
// Set up the PDF.js worker source for its own internal operations
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js';
}

self.onmessage = async (event) => {
  const { fileBuffer, fileType, fileName } = event.data;

  try {
    let text = '';
    if (fileType === 'application/pdf') {
      if (typeof pdfjsLib === 'undefined') throw new Error("PDF parsing library not loaded.");
      const loadingTask = pdfjsLib.getDocument(fileBuffer);
      const pdf = await loadingTask.promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      text = fullText.trim();
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
      if (typeof mammoth === 'undefined') throw new Error("DOCX parsing library not loaded.");
      const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
      text = result.value;
    } else if (fileType === 'text/plain' || fileType === 'text/markdown') {
      const decoder = new TextDecoder();
      text = decoder.decode(fileBuffer);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    if (!text || text.trim().length === 0) {
        throw new Error("Extracted text is empty. The file might be image-based or corrupted.");
    }
    
    // Send the successful result back to the main thread
    self.postMessage({ status: 'success', text: text });

  } catch (error) {
    // Send any errors back to the main thread
    self.postMessage({ status: 'error', message: error.message || 'An unknown error occurred in the file parser.' });
  }
};
