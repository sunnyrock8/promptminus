document.addEventListener('DOMContentLoaded', function () {
    const toggleCheckbox = document.getElementById('toggleUppercase');

    // Load the saved state from Chrome storage (using sync or local storage consistently)
    chrome.storage.sync.get(['uppercaseEnabled'], function (result) {
        toggleCheckbox.checked = result.uppercaseEnabled || false; // Set checkbox based on stored value
    });

    // Add event listener for the checkbox toggle
    toggleCheckbox.addEventListener('change', function () {
        const isEnabled = toggleCheckbox.checked;

        // Save the new state in storage
        chrome.storage.sync.set({ uppercaseEnabled: isEnabled }, function () {
            console.log('Uppercase transformation', isEnabled ? 'enabled' : 'disabled');
        });

        // Send a message to the content script to enable or disable uppercase transformation
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: setUppercaseTransformation,
                args: [isEnabled]
            });
        });
    });
});

// Function that will be executed in the content script context
function setUppercaseTransformation(enabled) {
    if (enabled) {
        console.log('Uppercase transformation activated in content script');
        // Here you would implement logic to start observing the textarea and transform the text
    } else {
        console.log('Uppercase transformation deactivated in content script');
        // Implement logic to stop observing or transforming the text
    }
}
