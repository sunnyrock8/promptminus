

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


document.getElementById('contextualizeButton').addEventListener('click', function() {
  context = "In this conversation, we discussed the influence of various art movements, particularly focusing on the Neo-Modern period and its relation to Pop Art. Neo-Modernism, emerging in the late 20th and early 21st centuries, revisits and evolves the values of Modernism, such as simplicity, formalism, and truth to materials. It also incorporates new elements like digital media, interactive art, and global perspectives, addressing contemporary issues like environmentalism, sustainability, and cultural hybridity. Pop Art, with its emphasis on mass culture, consumerism, and media imagery, had a significant impact on later movements, including Neo-Modernism. While Pop Art peaked in the 1950s and 1960s, its legacy can be seen in the way contemporary artists engage with themes of popular culture, commodification, and mass production. The use of irony, appropriation, and critiques of consumerism, central to Pop Art, continues to influence Neo-Modernist artists, albeit in more subtle or globally influenced ways. Additionally, mass production remains a key theme in Neo-Modern art, explored through the digital age's replication and the commodification of both physical and digital artworks. Artists reflect on how technology, globalization, and consumerism shape art and culture today."
  document.getElementById('outputText').value = context;
  });


// document.getElementById('contextualizeButton').addEventListener('click', function() {
//   console.log('Contextualize button clicked');
//   fetch('http://localhost:5000/contextualize', { // Make sure this URL is correct
//       method: 'POST',
//   })
//   .then(response => {
//       console.log('Request made to the server');
//       if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return response.json();
//   })
//   .then(data => {
//       console.log('Received data:', data);
//       if (data.success) {
//           document.getElementById('outputText').value = data.result;
//       } else {
//           throw new Error(data.error || 'Unknown error occurred');
//       }
//   })
//   .catch(error => {
//       console.error('Error:', error);
//       document.getElementById('outputText').value = 'An error occurred while contextualizing: ' + error.message;
//   });
// });



