/**
 * Fast RMS AI Sourcing Companion - Content Script
 * Handles text injection into active page editors (Rich Text Editors, textareas, Gmail, Hostinger, Outlook)
 */

console.log('[Fast RMS] Sourcing Companion Content Script Initialized');

// Message Listener from Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'injectText') {
    console.log('[Fast RMS] Received text injection request');
    const success = findAndInjectText(request.text);
    sendResponse({ success: success });
  }
  return true; // Keep message channel open for asynchronous responses
});

/**
 * Searches the active page for the most suitable input/editor and inserts text
 * @param {string} textToInsert 
 * @returns {boolean} True if successfully injected, false otherwise
 */
function findAndInjectText(textToInsert) {
  let activeEl = document.activeElement;
  console.log('[Fast RMS] Active element in page:', activeEl ? activeEl.tagName : 'None');

  // 1. Helper to determine if element is valid editable target
  function isEditable(el) {
    if (!el) return false;
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return true;
    if (el.contentEditable === 'true' || el.getAttribute('contenteditable') === 'true') return true;
    return false;
  }

  // 2. If the active element is not editable, try searching common editor classes and selectors
  if (!isEditable(activeEl)) {
    console.log('[Fast RMS] Active element is not editable. Scanning DOM for known editor widgets...');
    
    // Selectors for common editors: Gmail compose body, Hostinger Webmail (Roundcube / OX App Suite), Outlook, CKEditor, TinyMCE
    const selectors = [
      'div[contenteditable="true"]',
      'iframe.cke_wysiwyg_frame',          // CKEditor frame
      'iframe.tox-edit-area__iframe',      // TinyMCE frame
      'iframe[title="Rich Text Area"]',    // Standard webmail rich-text frame
      '.cke_editable',                     // CKEditor inline
      'textarea[name="body"]',             // Standard body input
      'textarea.compose-body',
      'div.gmail_default',                 // Gmail custom font div
      'div.editable[role="textbox"]',      // Gmail/Outlook compose box
      'div[role="textbox"]',
      'textarea'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        console.log('[Fast RMS] Found matching editor via selector:', sel);
        if (el.tagName === 'IFRAME') {
          try {
            const iframeDoc = el.contentDocument || el.contentWindow.document;
            activeEl = iframeDoc.activeElement || iframeDoc.body;
            console.log('[Fast RMS] Navigated inside iframe to:', activeEl.tagName);
          } catch(e) {
            console.warn('[Fast RMS] Could not read iframe contents (cross-origin restrictions):', e.message);
          }
        } else {
          activeEl = el;
        }
        break;
      }
    }
  }

  // If we still found nothing, look for any body in iframe or standard fallback
  if (!activeEl) {
    console.warn('[Fast RMS] No active or candidate editor found.');
    return false;
  }

  // 3. Inject text depending on editor type
  if (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT') {
    console.log('[Fast RMS] Injecting into standard text/textarea input');
    
    const start = activeEl.selectionStart || 0;
    const end = activeEl.selectionEnd || 0;
    const originalVal = activeEl.value;
    
    // Insert text at cursor position
    activeEl.value = originalVal.substring(0, start) + textToInsert + originalVal.substring(end);
    
    // Position cursor at end of inserted text
    activeEl.selectionStart = activeEl.selectionEnd = start + textToInsert.length;
    
    // Trigger input event so React/Angular/Vue wrappers register state changes
    activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    activeEl.dispatchEvent(new Event('change', { bubbles: true }));
    activeEl.focus();
    return true;
  } 
  
  // ContentEditable editors (Gmail, Hostinger premium Webmail, etc.)
  if (activeEl.contentEditable === 'true' || activeEl.getAttribute('contenteditable') === 'true' || activeEl.tagName === 'BODY') {
    console.log('[Fast RMS] Injecting into contenteditable editor');
    activeEl.focus();

    // Strategy A: Try document.execCommand('insertText') - preserves undo history and cursor formatting
    try {
      const success = document.execCommand('insertText', false, textToInsert);
      if (success) {
        console.log('[Fast RMS] Injection successful via execCommand');
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
    } catch (e) {
      console.warn('[Fast RMS] execCommand failed:', e.message);
    }

    // Strategy B: Selection API insertion
    try {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Split by newlines and add HTML breaks if it looks like standard HTML editing context
        const isHTMLEditor = activeEl.innerHTML.includes('<p>') || activeEl.innerHTML.includes('<br>') || activeEl.tagName === 'BODY';
        
        if (isHTMLEditor) {
          const fragment = document.createDocumentFragment();
          const lines = textToInsert.split('\n');
          
          lines.forEach((line, idx) => {
            fragment.appendChild(document.createTextNode(line));
            if (idx < lines.length - 1) {
              fragment.appendChild(document.createElement('br'));
            }
          });
          
          range.insertNode(fragment);
        } else {
          const textNode = document.createTextNode(textToInsert);
          range.insertNode(textNode);
        }

        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('[Fast RMS] Injection successful via Selection Range API');
        return true;
      }
    } catch (e) {
      console.error('[Fast RMS] Selection Range injection failed:', e);
    }

    // Strategy C: Direct Append Fallback
    console.log('[Fast RMS] Falling back to innerHTML/innerText appending');
    const formattedText = textToInsert.replace(/\n/g, '<br>');
    activeEl.innerHTML += '<br>' + formattedText;
    activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }

  console.warn('[Fast RMS] Selected element is not contenteditable nor a valid input.');
  return false;
}
