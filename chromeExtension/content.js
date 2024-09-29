(function () {
        let typingTimer; // Timer identifier
        const typingDelay = 4000; // Delay time in milliseconds
    
        // Asynchronous function to process the prompt text
        async function processPrompt(text) {
            console.log("Processing prompt:", text);
        
            try {
                const response = await fetch('http://127.0.0.1:5000/receive_event', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: text
                });
                
                const data = await response.text();
                console.log('Success:', data);
                return data;  // Return the actual processed data
        
            } catch (error) {
                console.error('Error:', error);
                return undefined;  // Handle the error appropriately, returning undefined in case of failure
            }
        }
        
        // Function to create the uppercase button
        function createUppercaseButton(input) {
            const uniqueId = input.dataset.uniqueId;
            const existingButton = document.querySelector(`#uppercase-button-${uniqueId}`);
            
            // Check if the button already exists
            if (existingButton) {
                console.log("Button already exists for this input.");
                return null;
            }
        
            // Create the button element
            let button = document.createElement('button');
            button.id = `uppercase-button-${uniqueId}`; // Assign unique ID to the button
        
            // Fetch the image from extension resources using chrome.runtime.getURL
            const imageUrl = chrome.runtime.getURL("roundlogo.png");
        
            // Use an image as the button content
            button.innerHTML = `<img src="${imageUrl}" alt="UPPERCASE" style="width: 25px; height: 25px;" />`;
        
            // Style the button
            button.style.position = 'absolute';
            button.style.zIndex = '1000';
            button.style.backgroundColor = 'transparent'; // Make the button background transparent
            button.style.border = 'none'; // Remove the border
            button.style.cursor = 'pointer';
            button.style.marginLeft = '6px'; // Margin for placement next to input
        
            // Position the button relative to the input
            const inputRect = input.getBoundingClientRect();
            button.style.top = `${inputRect.top}px`; // Position at the top of the input
            button.style.left = `${inputRect.right - 50}px`; // Position to the right of the input
        
            // Add the click event listener to transform the text into uppercase
            button.addEventListener('click', async () => {
                let promptText = input.tagName === 'TEXTAREA' ? input.value : input.innerText;
                let processedText = await processPrompt(promptText); // Wait for processing the text
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
    
        // Function to position the button relative to the input
        function positionButtonRelativeToInput(button, input) {
            const inputRect = input.getBoundingClientRect();
            button.style.top = `${inputRect.top + window.scrollY}px`; // Adjust vertical positioning
            button.style.left = `${inputRect.right - 35}px`; // Move it 30px to the right of the input
        }
        
        // Function to setup listener on input fields
        function setupInputListener(input) {
            if (input && !input.dataset.listenerAdded) {
                console.log("Setting up input listener.");
                input.dataset.listenerAdded = 'true';
                input.dataset.uniqueId = Date.now(); // Assign a unique ID to the input element
        
                const button = createUppercaseButton(input);
                if (button) {
                    positionButtonRelativeToInput(button, input);
        
                    // Reposition the button on window resize or scroll
                    window.addEventListener('resize', () => positionButtonRelativeToInput(button, input));
                    window.addEventListener('scroll', () => positionButtonRelativeToInput(button, input));
                }
        
                // Add input event listener with debounce functionality
                input.addEventListener('input', (event) => {
                    console.log("Input event triggered.");
                    let promptText = input.tagName === 'TEXTAREA' ? input.value : input.innerText;
        
                    console.log("Current prompt text:", promptText);
        
                    // Clear previous timer and start a new one for debouncing
                    clearTimeout(typingTimer);
                    typingTimer = setTimeout(async () => {
                        chrome.storage.local.get('isUppercaseEnabled', async function (data) {
                            console.log("Uppercase enabled:", data.isUppercaseEnabled);
                            if (data.isUppercaseEnabled) {
                                try {
                                    let processedText = await processPrompt(promptText); // Wait for the prompt to be processed
                                    console.log("Processed text:", processedText);
                                    
                                    // Update the input with the processed text
                                    if (input.tagName === 'TEXTAREA') {
                                        input.value = processedText; // Set processed text for textarea
                                    } else {
                                        input.innerText = processedText; // Set processed text for contenteditable
                                    }
                                } catch (error) {
                                    console.error("Error processing prompt:", error);
                                }
                            }
                        });
                    }, typingDelay);
                });
            }
        }
    
        // Function to find inputs and set up listeners
        function findAndSetupInput() {
            console.log("Looking for textarea or contenteditable...");
    
            const inputs = document.querySelectorAll('textarea, [contenteditable="true"]');
    
            if (inputs.length > 0) {
                inputs.forEach(input => setupInputListener(input));
            } else {
                console.log("No suitable input element found.");
            }
        }
    
        // Call findAndSetupInput initially to find any existing input elements
        findAndSetupInput();
    
        // Set up a MutationObserver to detect dynamically added inputs
        const observer = new MutationObserver(() => {
            console.log("Mutation observed, checking for input fields...");
            findAndSetupInput();
        });
    
        observer.observe(document.body, { childList: true, subtree: true });
    
        // Cleanup function to disconnect the MutationObserver on page unload
        function cleanup() {
            console.log("Cleaning up mutation observer.");
            observer.disconnect();
        }
    
        window.addEventListener('beforeunload', cleanup);
    })();