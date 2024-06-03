document.addEventListener("DOMContentLoaded", function() {
  var checkAllDetails = document.getElementById("checkAllDetails");
  var checkboxes = document.querySelectorAll('input[type="checkbox"]');
  
  // Function to toggle other checkboxes based on Check all details checkbox
  function toggleCheckboxes() {
      checkboxes.forEach(function(checkbox) {
          if (checkbox !== checkAllDetails) {
              checkbox.checked = checkAllDetails.checked;
          }
      });
  }
  
  // Event listener for Check all details checkbox
  checkAllDetails.addEventListener("change", toggleCheckboxes);
});

// Get the compare button and the popup
const compareButton = document.getElementById('compare-button');
const popup = document.getElementById('popup');

// Get the close button inside the popup
const closeButton = popup.querySelector('.close');

// Get the textarea inside the popup
const textarea = popup.querySelector('textarea');

// Function to show the popup
function showPopup() {
  popup.style.display = 'block';
}

// Function to hide the popup
function hidePopup() {
  popup.style.display = 'none';
}

// Add event listener to the compare button
compareButton.addEventListener('click', showPopup);

// Add event listener to the close button
closeButton.addEventListener('click', hidePopup);

// Get the go button inside the popup
const goButton = popup.querySelector('#goButton');

// Function to handle the click event on the Go button
function handleGoButtonClick() {
  hidePopup();
}

// Add event listener to the Go button
goButton.addEventListener('click', handleGoButtonClick);



/////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function() {
  const nightModeButton = document.getElementById('nightModeButton');
  const body = document.body;

  nightModeButton.addEventListener('click', function() {
    // Toggle night mode class on body
    body.classList.toggle('night-mode');
    // Change button text and symbol based on night mode state
    if (body.classList.contains('night-mode')) {
      nightModeButton.innerHTML = '<i class="fas fa-sun"></i> ';
    } else {
      nightModeButton.innerHTML = '<i class="fa-solid fa-moon"></i> ';
    }
  });
});
////////////////////////////////////////////////////////////////////