document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('toggleUppercase');
  
    // Get the toggle state from storage and set the checkbox accordingly
    chrome.storage.local.get('isUppercaseEnabled', function(data) {
      toggle.checked = !!data.isUppercaseEnabled;
    });
  
    // Add a listener to the checkbox to update the state in storage
    toggle.addEventListener('change', function() {
      chrome.storage.local.set({ isUppercaseEnabled: toggle.checked });
    });
  });
