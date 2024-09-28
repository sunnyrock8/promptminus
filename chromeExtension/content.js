(function () {
    let typingTimer; // Timer identifier
    const typingDelay = 4000; // Delay time in milliseconds

    function processPrompt(text) {
        console.log("Processing prompt:", text);
<<<<<<< Updated upstream
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
=======
        return text.toUpperCase(); // Convert text to uppercase
>>>>>>> Stashed changes
    }

    function createUppercaseButton(input) {
        // Check if the button already exists
        if (document.querySelector(`#uppercase-button-${input.dataset.uniqueId}`)) {
            console.log("Button already exists for this input.");
            return null;
        }
    
        // Create the button element
        let button = document.createElement('button');
        button.id = `uppercase-button-${input.dataset.uniqueId}`; // Assign unique ID to the button
    
        // Fetch the image from extension resources using chrome.runtime.getURL
        const imageUrl = chrome.runtime.getURL("icon128.png");
    
        // Use an image as the button content
        button.innerHTML = `<img src="${imageUrl}" alt="UPPERCASE" style="width: 25px; height: 25px;" />`;
    
        // Style the button
        button.style.position = 'absolute';
        button.style.zIndex = '1000';
        button.style.backgroundColor = 'transparent'; // Make the button background transparent
        button.style.border = 'none'; // Remove the border
        button.style.cursor = 'pointer';
        button.style.marginLeft = '8px'; // Margin for placement next to input
    
        // Position the button relative to the input
        const inputRect = input.getBoundingClientRect();
        button.style.top = `${inputRect.top }px`; // Position at the top of the input
        button.style.left = `${inputRect.right - 50}px`; // Position to the right of the input
    
        // Add the click event listener to transform the text into uppercase
        button.addEventListener('click', () => {
            let promptText = input.tagName === 'TEXTAREA' ? input.value : input.innerText;
            let processedText = processPrompt(promptText);
            if (input.tagName === 'TEXTAREA') {
                input.value = processedText; // Set processed text for textarea
            } else {
                input.innerText = processedText; // Set processed text for contenteditable
            }
        });
    
        // Append the button to the body so it's positioned correctly
        document.body.appendChild(button);
    
        return button;
    }
        function positionButtonRelativeToInput(button, input) {
        const inputRect = input.getBoundingClientRect();
        button.style.top = `${inputRect.top + window.scrollY}px`; // Adjust vertical positioning
        button.style.left = `${inputRect.right - 30}px`; // Move it 5px to the right of the input (adjust as needed)
    }
    
    function setupInputListener(input) {
        if (input && !input.dataset.listenerAdded) {
            console.log("Setting up input listener.");
            input.dataset.listenerAdded = 'true';
            input.dataset.uniqueId = Date.now(); // Assign a unique ID to the input element

            const button = createUppercaseButton(input);
            if (button) {
                document.body.appendChild(button); // Append button to body

                // Position the button next to the input field
                positionButtonRelativeToInput(button, input);

                // Reposition the button on window resize or scroll
                window.addEventListener('resize', () => positionButtonRelativeToInput(button, input));
                window.addEventListener('scroll', () => positionButtonRelativeToInput(button, input));
            }

            input.addEventListener('input', (event) => {
                console.log("Input event triggered.");
                let promptText = input.tagName === 'TEXTAREA' ? input.value : input.innerText;

                console.log("Current prompt text:", promptText);

<<<<<<< Updated upstream
                chrome.storage.local.get('isUppercaseEnabled', function (data) {
                    console.log("Uppercase enabled:", data.isUppercaseEnabled);
                    if (data.isUppercaseEnabled) {
                        let processedText = setTimeout(processPrompt(promptText), 10000);
                        if (processedText !== promptText) {
=======
                // Clear previous timer and start a new one
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    chrome.storage.local.get('isUppercaseEnabled', function (data) {
                        console.log("Uppercase enabled:", data.isUppercaseEnabled);
                        if (data.isUppercaseEnabled) {
                            let processedText = processPrompt(promptText);
>>>>>>> Stashed changes
                            console.log("Processed text (for display purposes only):", processedText);
                        }
                    });
                }, typingDelay);
            });
        }
    }

    function findAndSetupInput() {
        console.log("Looking for textarea or contenteditable...");
<<<<<<< Updated upstream
        
        // Select both textareas and coneditable elements
=======

>>>>>>> Stashed changes
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

