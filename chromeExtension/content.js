(function () {
        let typingTimer; // Timer identifier
        const typingDelay = 4000; // Delay time in milliseconds
        let isPopupOpen = false; // State to track if the popup is open
        let popupElement = null; // Reference to the popup element
    
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
    



// Function to create the popup
function createPopup(text) {
    // Check if popup already exists
    if (popupElement) return;

    // Create the popup element
    popupElement = document.createElement('div');
    popupElement.style.position = 'fixed';
    popupElement.style.top = '50%';
    popupElement.style.left = '50%';
    popupElement.style.transform = 'translate(-50%, -50%)';
    popupElement.style.padding = '20px';
    popupElement.style.backgroundColor = '#141414'; // Dark background color
    popupElement.style.border = '2px solid #7eb2ce'; // Light blue border color
    popupElement.style.zIndex = '1001';
    popupElement.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)'; // Deeper shadow for a floating effect
    popupElement.style.borderRadius = '10px'; // Rounded corners
    popupElement.style.fontFamily = 'Arial, sans-serif'; // A cleaner font
    popupElement.style.fontSize = '16px'; // Increase font size for better readability
    popupElement.style.color = '#ffffff'; // White text color for contrast
    popupElement.style.transition = 'opacity 0.3s ease-in-out'; // Smooth transition effect
    popupElement.style.opacity = '0'; // Start as transparent, to allow for fade-in effect
    popupElement.style.minWidth = '300px'; // Minimum width for the popup
    popupElement.style.minHeight = '150px'; // Minimum height for the popup
    popupElement.style.maxWidth = '600px'; // Maximum width for the popup
    popupElement.style.maxHeight = '400px'; // Maximum height for the popup
    popupElement.style.overflowY = 'auto'; // Add vertical scroll if content exceeds max height
    popupElement.innerHTML = `<p>${text}</p>`;

    // Create the close button as a cross (X) at the top-right corner
    let closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;'; // Unicode for "×" symbol
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.background = 'transparent'; // Make the background transparent
    closeButton.style.border = 'none'; // Remove the border
    closeButton.style.fontSize = '20px'; // Make the X larger
    closeButton.style.padding = '0'; // Add padding around the cross
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#ffffff'; // White color for the X button

    // Append the close button to the popup
    popupElement.appendChild(closeButton);

    // Append the popup to the body
    document.body.appendChild(popupElement);

    // Use setTimeout to trigger the fade-in effect
    setTimeout(() => {
        popupElement.style.opacity = '1'; // Fully visible after fade-in
    }, 10);

    // Add event listener to close the popup when the close button is clicked
    closeButton.addEventListener('click', closePopup);
}

// Function to close the popup and update the text in the input
function closePopup() {
    if (popupElement) {
        popupElement.style.opacity = '0'; // Trigger fade-out effect
        setTimeout(() => {
            popupElement.remove(); // Remove the popup after the transition
            popupElement = null; // Reset the reference
            isPopupOpen = false; // Set popup state to false
        }, 300); // Match transition duration to the fade-out time
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
            button.style.marginLeft = '8px'; // Margin for placement next to input
    
            // Position the button relative to the input
            const inputRect = input.getBoundingClientRect();
            button.style.top = `${inputRect.top}px`; // Position at the top of the input
            button.style.left = `${inputRect.right - 50}px`; // Position to the right of the input
    
            // Add the click event listener to handle popup display and text transformation
            button.addEventListener('click', async () => {
                let promptText = input.tagName === 'TEXTAREA' ? input.value : input.innerText;
                if (!isPopupOpen) {
                    let processedText = await processPrompt(promptText); // Wait for processing the text
                    createPopup(processedText); // Create popup with processed text
                    isPopupOpen = true; // Set popup state to open
                } else {
                    if (input.tagName === 'TEXTAREA') {
                        input.value = popupElement.querySelector('p').innerText; // Update textarea with popup text
                    } else {
                        input.innerText = popupElement.querySelector('p').innerText; // Update contenteditable with popup text
                    }
                    closePopup(); // Close the popup after updating text
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
    
