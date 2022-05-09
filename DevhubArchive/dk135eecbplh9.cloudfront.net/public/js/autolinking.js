/*==================================================
// = Please do not change this file, it is controlled by the DevRel-Node-Service
/*==================================================

// mediawiki_link_mapper.js: Updates `reference` objects with namespaced url link by looking for `<code></code>` blocks and referecning page_mappings.js
// Author(s): Brandon LaRouche

/*==================================================
= FILE: mediawiki_link_mapper.js =
- Functions:
- Initialize Script:
----- run()
---------- Cycle through <code> tags in DOM and update innerHtml
- Main Functions:
----- checkForAnchor()
---------- Find if anchor param was set -> build to append to fullLink
---------- Returns string
----- checkForDisplayName()
---------- Find if displayName param was set -> use instead of reference.title
---------- Returns string
----- buildReferenceUrl()
---------- Build the Url being referenced by the code block
---------- Returns string
----- buildLinkElement()
---------- Creates 'a' element in the form: <a href="{fullLink}">{displayName}</a>
---------- Returns 'a' element
----- linkify()
---------- Update  DOM with linked elements
----- checkForLookAlike()
---------- Handle the case if something looks like a reference but isn't recognized
- Helper Functions:
----- escapeRegExp()
---------- Helper function for replaceAll
---------- Returns string
----- replaceAll()
---------- Replaces all occurences of 'find' in 'str' with 'replace'
---------- Returns string
==================================================*/

/*==================================================
= MEDIAWIKI_LINK_MAPPER: HELPER FUNCTIONS =
==================================================*/

// Helper function for replaceAll
// Returns string
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

// Replaces all occurences of 'find' in 'str' with 'replace'
// Returns string
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

/*==================================================
= CONTENTSTACK: HELPER FUNCTIONS =
==================================================*/

// Find if anchor param was set -> build to append to fullLink
// Returns string
function checkForAnchor(lookup) {
  let anchor = ""
  if (lookup.includes("#")) // Check for anchor indicator '#' (hash character)
    anchor = "#" + lookup.split("|")[0].split("#")[1]; // "Reference#Anchor|DisplayName" -> "Anchor"

  anchor = replaceAll(anchor, " ", "-"); // Format expected for anchor is: "targeted-page-header" with dashes instead of spaces

  return anchor;
}

// Find if displayName param was set -> use instead of reference.title
// Returns string
function checkForDisplayName(defaultName, lookup) {
  let displayName = defaultName;

  if ((displayName.charAt(0) == '!') || (displayName.charAt(0) == '^') || (displayName.charAt(0) == '/')) {
    displayName = displayName.substring(1);
    ignoreReference = true;
  }

  if (lookup.includes("|")) // Check for anchor indicator '|' (pipe character)
    displayName = lookup.split("|")[1]; // "Reference#Anchor|DisplayName" -> "displayName"

  return displayName;
}

// Build the Url being referenced by the code block
// Returns string
function buildReferenceUrl(reference, anchor) {
  // Turn : and . and - into / for Url
  let linkReference = replaceAll(reference.url, ":", "/");
  linkReference = replaceAll(linkReference, ".", "/");

  let fullLink = "" + linkReference;

  //Clean up the Url if needed
  fullLink = replaceAll(fullLink, "//", "/"); // Replace double slashes
  fullLink = replaceAll(fullLink, "Class/Class/", "Class/"); // Account for potential double "Class/" prefix
  fullLink = replaceAll(fullLink, "Class/Enum/", "Enum/"); // Enum is not a Class
  fullLink = replaceAll(fullLink, "//", "/"); // Replace double slashes in case created by cleanup

  // Use document.location.origin to work across (development, staging, production)
  const origin = document.location.origin;

  const locale = document.location.pathname.split('/')[1];

  // Piece together full Url
  fullLink = origin + "/" + locale + fullLink + anchor;

  fullLink = replaceAll(fullLink, ".com//", ".com/"); // Last minute potential cleanup

  return fullLink;
}

// Creates 'a' element in the form: <a href="{fullLink}">{displayName}</a>
// Returns 'a' element
function buildLinkElement(fullLink, displayName) {
  let linkElement = document.createElement('a'); // Create a new 'a' element

  // Configure linkElement
  linkElement.href = fullLink;
  linkElement.textContent = displayName;

  return linkElement;
}

// Update  DOM with linked elements
function linkify(code, reference, category) {
  const lookup = code.innerHTML;

  // Extract params if given
  const anchor = checkForAnchor(lookup);
  const displayName = checkForDisplayName(reference.title, lookup); // Default to reference.title

  // Build the Url to reference
  const fullLink = buildReferenceUrl(reference, anchor);

  // Linkify into an <a> element
  const linkElement = buildLinkElement(fullLink, displayName)


  // References that aren't to 'Util' pages
  const exceptionTypes = ["articles", "videos", "recipes", "code samples", "resources"];

  // If the reference is to an exceptionType then it shouldnt look like a <code> block
  if (exceptionTypes.includes(category)) {
    let newElement = document.createElement('span'); // Create a new 'span' element

    newElement.innerHTML = linkElement.outerHTML; // Insert linkElement into the newElement

    // Replace <code> block with the newElement
    let parentNode = code.parentNode;
    parentNode.insertBefore(newElement, code);
    parentNode.removeChild(code);

    code = newElement; // newElement replaced code

    code.classList.add("plain-link"); // This element is a "plain_link"
  }
  else {
    code.classList.add("code-link"); // This element is a "plain_link"

    if (window.document.documentMode) {
      code.innerHTML = linkElement; // DocumentFragments aren't available in IE
    } else {
      code.textContent = "";

      // Use a documentFragment to reduce reflow & improve performance
      let documentFragment = document.createDocumentFragment();
      documentFragment.appendChild(linkElement);
      code.appendChild(documentFragment); // Insert linkElement into the <code> block
    }
  }
}

// Handle the case if something looks like a reference but isn't recognized
function checkForLookAlike(code) {
  const lookup = code.innerHTML;

  // Expected indicators that <code> block contains an unrecognized reference
  let expectedReferences = ["Articles", "Videos", "Recipes", "Code Samples", "DataType", "Enum", "Resources"];

  //Add lowercase versions of expectedReference to be safe
  expectedReferences.forEach(function(reference) { expectedReferences.push(reference.toLowerCase()); });

  const potentialReference = lookup.split("/")[0].toLowerCase(); // Potentially split lookup and extract an expectedReference

  let looksLikeReference = false; // Keep track if it looks like a reference

  // If it does "look" like a reference then we want to continue
  if ((expectedReferences.includes(potentialReference)))
    looksLikeReference = true;

  // If it doesnt "look" like a reference then don't continue
  if (!(looksLikeReference))
    return;

  let defaultName = lookup;

  if (defaultName.includes("/")) // Check '/
    defaultName = defaultName.split("/")[1];

  const displayName = checkForDisplayName(defaultName, lookup); // Default to reference.title

  // It looks like a reference, so let's make it look better with an errorElement <text>
  let errorElement = document.createElement('text'); // Create a new 'text' element
  errorElement.style = "text-decoration: underline dotted red;";
  errorElement.title = "Reference to: " + lookup;
  errorElement.classList.add("unknown-link");
  errorElement.innerHTML = displayName;

  code.innerHTML = errorElement.outerHTML;
}

/*==================================================
= INITIALIZE SCRIPT =
==================================================*/

// Alert pages that autolinking has completed incase they want to
//  modify the <code> elements further
const completedEvent = document.createEvent('Event');
completedEvent.initEvent('autolinkComplete', true, false)

// Cycle through <code> tags in DOM and update innerHtml
function run() {
  // Current representation of page_mappings loaded into a dictionary
  fetch('https://dk135eecbplh9.cloudfront.net/static/page_mappings.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    // Find all the <code> tags on the page
    const codeElements = [...document.getElementsByTagName("code")]; // Converted to an array see: https://stackoverflow.com/a/19324847

    // Find elements in the DOM with the 'code' tag
    codeElements.forEach(function(code) {
      let lookup = code.innerHTML;

      let ignoreReference = false;
      // Sanitize if first character is a '/' and set ignoreReference to true
      if ((lookup.charAt(0) == '!') || (lookup.charAt(0) == '^')) {
        lookup = lookup.substring(1);
        ignoreReference = true;
      }

      lookup = lookup.split("|")[0]; // Clean from Display Name if given
      lookup = lookup.split("#")[0]; // Clean from Display Name if given

      // Sanitize if first character is a '/'
      if (lookup.charAt(0) == '/')
        lookup = lookup.substring(1);

      // The data is indexed by categories, so let's extract what would be the category in a valid reference
      // This identifies which namespace to reference in page_mappings dictionary
      const expectedCategories = ["articles", "videos", "recipes", "code samples", "datatype", "enum", "resources"];
      let category = lookup.split("/")[0];
      const title = lookup.split("/")[1];
      category = category.toLowerCase();


      if (!(expectedCategories.includes(category)))
        category = "other";

      let reference = data[category][lookup]; // Potential match in page_mappings
      if (reference == null) {
        lookup = category + "/" + lookup.split("/")[1];
        reference = data[category][lookup];
      }

      if (!(ignoreReference)) {
        // Try lowercase
        if (reference == null)
          reference = data[category][lookup.toLowerCase()];

        // Try lowercase pagename
        if (reference == null)
          reference = data[category][category + "/" + title];


        if (reference != null)
          linkify(code, reference, category); // Replace reference with link if reference is known
        else
          checkForLookAlike(code); // Check if the reference SHOULD be known
      }
    });
  })
  .then(function() {
    document.dispatchEvent(completedEvent);
  });
}

// Run the script when it is loaded into a page
window.addEventListener("load", run);
// Run the script when a search page has updated
window.addEventListener('triggerAutolink', run);
