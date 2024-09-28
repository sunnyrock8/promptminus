(function () {
    function processPrompt(text) {
        console.log("Processing prompt:", text);
        // Convert the text to uppercase (or any other processing logic)
        return text.toUpperCase();
    }

    function setupInputListener(input) {
        if (input && !input.dataset.listenerAdded) {
            console.log("Setting up input listener.");
            input.dataset.listenerAdded = 'true';

            input.addEventListener('input', (event) => {
                console.log("Input event triggered.");
                let promptText;

                if (input.tagName === 'TEXTAREA') {
                    promptText = input.value; // For textarea
                } else {
                    promptText = input.innerText; // For contenteditable elements
                }

                console.log("Current prompt text:", promptText);

                chrome.storage.local.get('isUppercaseEnabled', function (data) {
                    console.log("Uppercase enabled:", data.isUppercaseEnabled);
                    if (data.isUppercaseEnabled) {
                        let processedText = processPrompt(promptText);
                        
                        if (processedText !== promptText) {
                            console.log("Processed text (for display purposes only):", processedText);
                            // We only process and log, not change the value
                        }
                    }
                });
            });
        }
    }

    function findAndSetupInput() {
        console.log("Looking for textarea or contenteditable...");
        
        // Select both textareas and contenteditable elements
        const inputs = document.querySelectorAll('textarea, [contenteditable="true"]');
        
        if (inputs.length > 0) {
            inputs.forEach(input => setupInputListener(input));
        } else {
            console.log("No suitable input element found.");
        }
    }

    findAndSetupInput();

    const observer = new MutationObserver(() => {
        console.log("Mutation observed, checking for input fields...");
        findAndSetupInput();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function cleanup() {
        console.log("Cleaning up mutation observer.");
        observer.disconnect();
    }

    window.addEventListener('beforeunload', cleanup);
})();
