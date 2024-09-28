(function () {
    function processPrompt(text) {
        // Convert the text to uppercase
        return text.toUpperCase();
    }

    function setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(element.__proto__, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
        } else {
            valueSetter.call(element, value);
        }
    }

    function emulateKeystrokes(textarea, processedText) {
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        for (let i = 0; i < processedText.length; i++) {
            let char = processedText[i];

            const keydownEvent = new KeyboardEvent('keydown', {
                key: char,
                bubbles: true,
                cancelable: true
            });
            const keypressEvent = new KeyboardEvent('keypress', {
                key: char,
                bubbles: true,
                cancelable: true
            });
            const keyupEvent = new KeyboardEvent('keyup', {
                key: char,
                bubbles: true,
                cancelable: true
            });

            textarea.dispatchEvent(keydownEvent);
            textarea.dispatchEvent(keypressEvent);
            textarea.value += char;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(keyupEvent);
        }
    }

    function setupTextareaListener(textarea) {
        if (textarea && !textarea.dataset.listenerAdded) {
            textarea.dataset.listenerAdded = 'true';

            textarea.addEventListener('input', (event) => {
                let cursorPosition = textarea.selectionStart;
                let promptText = textarea.value;

                chrome.storage.local.get('isUppercaseEnabled', function (data) {
                    if (data.isUppercaseEnabled) {
                        let processedText = processPrompt(promptText);

                        if (processedText !== promptText) {
                            emulateKeystrokes(textarea, processedText);
                            textarea.setSelectionRange(cursorPosition, cursorPosition);
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

    findAndSetupTextarea();

    const observer = new MutationObserver(() => {
        findAndSetupTextarea();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function cleanup() {
        observer.disconnect();
    }

    window.addEventListener('beforeunload', cleanup);
})();

