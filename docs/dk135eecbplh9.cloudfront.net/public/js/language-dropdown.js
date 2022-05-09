/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function toggleLanguageDropdown() {
  document.getElementById("input-group-btn").classList.toggle("show");

  var ariaToggled = document.getElementById("input-group-btn").classList.contains("show")
  document.getElementById("input-dropdown-btn").setAttribute("aria-expanded", ariaToggled)
}

// Close and untoggle dropdowns
function closeDropDown(event) {
  var dropdowns = document.getElementsByClassName("input-group-btn");
  var i;
  for (i = 0; i < dropdowns.length; i++) {
    var openDropdown = dropdowns[i];
    if (openDropdown.classList.contains('show')) {
      openDropdown.classList.remove('show');
      document.getElementById("input-dropdown-btn").setAttribute("aria-expanded", false)
    }
  }
}

// Close the dropdown menu if the user clicks outside of it
function dropdownClicked(event) {
  if (event.target.matches('.input-dropdown-btn')) { // Change cookie for the website language
    toggleLanguageDropdown();
  }
  else if (event.target.matches('.locale-option')) {
    $.cookie('language', event.target.getAttribute('data-locale'), { expires: 365, path: '/' }); // Set the cookie
    document.getElementById("rbx-selection-label").innerHTML = event.target.innerHTML; // Change text of dropdown button
    closeDropDown(event); // Close the dropdown
    location.reload(); // Refresh the page now
  }
  else if (!event.target.matches('.input-dropdown-btn')) {
    closeDropDown(event); // Close the dropdown when anything other than the button is clicked
  }
}

// Set language dropdown default text to current cookie
function setLanguageDropdown() {
  if (typeof $.cookie('language') != 'undefined'){
    document.getElementById("rbx-selection-label").innerHTML = $("[data-locale=" + $.cookie('language') + "]")[0].innerHTML;
  }
}

window.addEventListener("load", setLanguageDropdown);
window.addEventListener("click", dropdownClicked);
