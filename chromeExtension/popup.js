document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("toggleUppercase");
  // Get the toggle state from storage and set the checkbox accordingly
  chrome.storage.local.get("isUppercaseEnabled", function (data) {
    toggle.checked = !!data.isUppercaseEnabled;
  });

  // Add a listener to the checkbox to update the state in storage

  toggle.addEventListener("change", function () {
    chrome.storage.local.set({ isUppercaseEnabled: toggle.checked });
  });
});

document
  .getElementById("contextualizeButton")
  .addEventListener("click", function () {
    console.log("Contextualize button clicked");
    fetch("http://localhost:5000/contextualize", {
      // Make sure this URL is correct
      method: "POST",
    })
      .then((response) => {
        console.log("Request made to the server");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Received data:", data);
        if (data.success) {
          document.getElementById("outputText").value = data.result;
        } else {
          throw new Error(data.error || "Unknown error occurred");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("outputText").value =
          "An error occurred while contextualizing: " + error.message;
      });
  });
