(function () {
    function processPrompt(text) {
        console.log("Processing prompt:", text);
        // Convert the text to uppercase (or any other processing logic)
        // backend invocation starts here 
        // Send the string to your Python backend
        fetch('http://127.0.0.1:5000/receive_event', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'  // Set the content type to text/plain
            },
            body: text  // Send the string as the body
        })
        .then(response => response.text())  // Expect a plain text response
        .then(data => console.log('Success:', data))
        .catch((error) => console.error('Error white posting to backend:', error));
        //return text.toUpperCase();
        // we also need to trace back to the backend and return the output prompt plus
        // Send the string to your Python backend

        fetch('http://127.0.0.1:5000/receive_event', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'  // Set the content type to text/plain
            },
            body: eventData  // Send the string as the body
        })
        .then(response => response.text())  // Expect plain text in the response
        .then(data => {
            console.log('Success:', data);  // Log the plain text response
            // Example: Use the plain text data in your Chrome extension
            alert(`Received from server: ${data}`);
        })
        .catch((error) => console.error('Error:', error));
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

                chrome.storage.local.get('isUppercaseEnabled', function(data) {
                    console.log("Uppercase enabled:", data.isUppercaseEnabled);
                    if (data.isUppercaseEnabled) {
                        let processedText = setTimeout(processPrompt(promptText), 10000);
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
        
        // Select both textareas and coneditable elements
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
