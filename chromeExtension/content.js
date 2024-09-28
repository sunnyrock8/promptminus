(function () {
    function processPrompt(text) {
        return text.toUpperCase();
    }

    function emulateKeystrokes(textarea, processedText) {
        textarea.value = ''; // Clear current text
        textarea.dispatchEvent(new Event('input', { bubbles: true })); // Notify about input changes

        // Loop through each character and manually update value
        for (let i = 0; i < processedText.length; i++) {
            const char = processedText[i];
            const eventProps = { key: char, bubbles: true, cancelable: true };

            textarea.dispatchEvent(new KeyboardEvent('keydown', eventProps));
            textarea.dispatchEvent(new KeyboardEvent('keypress', eventProps));
            textarea.value += char;
            textarea.dispatchEvent(new Event('input', { bubbles: true })); // Trigger input event again
            textarea.dispatchEvent(new KeyboardEvent('keyup', eventProps));
        }
    }

    function setupTextareaListener(textarea) {
        if (textarea && !textarea.dataset.listenerAdded) {
            textarea.dataset.listenerAdded = 'true'; // Mark textarea as having a listener
            textarea.addEventListener('input', () => {
                let cursorPosition = textarea.selectionStart;
                let promptText = textarea.value;

                chrome.storage.local.get('isUppercaseEnabled', function (data) {
                    if (data.isUppercaseEnabled) {
                        let processedText = processPrompt(promptText);
                        if (processedText !== promptText) {
                            emulateKeystrokes(textarea, processedText);
                            textarea.setSelectionRange(cursorPosition, cursorPosition); // Restore cursor position
                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                });
            });
        }
    }

    function findAndSetupTextarea() {
        const textarea = document.querySelector('textarea');
        if (textarea) {
            setupTextareaListener(textarea);
        }
    }

    // Watch for any DOM mutations to detect new textareas
    const observer = new MutationObserver(() => {
        findAndSetupTextarea();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Clean up the observer on page unload
    window.addEventListener('beforeunload', () => {
        observer.disconnect();
    });

    // Initial setup to find any existing textarea
    findAndSetupTextarea();
})();
