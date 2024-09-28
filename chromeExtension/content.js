(function () {
    function processPrompt(text) {
        console.log("Processing prompt:", text);
        // Convert the text to uppercase
        return text.toUpperCase();
    }

    function setNativeValue(element, value) {
        console.log("Setting native value:", value);

        // Update the DOM element value directly
        const valueSetter = Object.getOwnPropertyDescriptor(element.__proto__, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
        } else {
            valueSetter.call(element, value);
        }

        // Dispatch the 'input' event so Vue.js picks up the change
        const event = new Event('input', { bubbles: true });
        element.dispatchEvent(event);

        // Optionally dispatch 'change' event for compatibility with other event listeners
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function emulateKeystrokes(textarea, processedText) {
        console.log("Emulating keystrokes for:", processedText);
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        for (let i = 0; i < processedText.length; i++) {
            let char = processedText[i];
            console.log("Dispatching events for character:", char);

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
            console.log("Setting up textarea listener.");
            textarea.dataset.listenerAdded = 'true';

            textarea.addEventListener('input', (event) => {
                console.log("Textarea input event triggered.");
                let cursorPosition = textarea.selectionStart;
                let promptText = textarea.value;
                console.log("Current prompt text:", promptText);

                chrome.storage.local.get('isUppercaseEnabled', function (data) {
                    console.log("Uppercase enabled:", data.isUppercaseEnabled);
                    if (data.isUppercaseEnabled) {
                        let processedText = processPrompt(promptText);

                        if (processedText !== promptText) {
                            console.log("Processed text differs from input, updating...");
                            setNativeValue(textarea, processedText);
                            textarea.setSelectionRange(cursorPosition, cursorPosition);
                        }
                    }
                });
            });
        }
    }

    function findAndSetupTextarea() {
        console.log("Looking for textarea...");
        const textarea = document.querySelector('textarea');
        if (textarea) {
            console.log("Textarea found.");
            setupTextareaListener(textarea);
        } else {
            console.log("No textarea found.");
        }
    }

    findAndSetupTextarea();

    const observer = new MutationObserver(() => {
        console.log("Mutation observed, checking for textarea...");
        findAndSetupTextarea();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function cleanup() {
        console.log("Cleaning up mutation observer.");
        observer.disconnect();
    }

    window.addEventListener('beforeunload', cleanup);
})();
