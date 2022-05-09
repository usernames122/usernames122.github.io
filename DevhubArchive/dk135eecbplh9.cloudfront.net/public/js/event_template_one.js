// event_template_one.js: Handles fetching thumbnail and formatting carousels for event_template_one pages

// Author(s): Brandon LaRouche, Corey Robinson


/*==================================================
= VARIABLES =
==================================================*/

let clickDebounce = true;

/*==================================================
= WINDOW EVENT HANDLING =
==================================================*/

window.onclick = function(event) {
  document.querySelectorAll('.carouselName').forEach(function(carouselName) {
    let identifier = carouselName.getAttribute('carouselName');

    if (event.target.id == (identifier + '-right-button') && clickDebounce) { // Change cookie for the website language
      clickDebounce = false;
      scrollCarousel(identifier, "right", 250, function () {
        clickDebounce = true
      });
    }
    else if (event.target.id == (identifier + '-left-button') && clickDebounce) {
      clickDebounce = false;
      scrollCarousel(identifier, "left", 250, function () {
        clickDebounce = true
      });
     }
  });
}

// Scroll the given carousel in the specified direction by one page increment
function scrollCarousel(identifier, direction, duration, callback) {
  let currentRight = parseFloat(document.getElementById(identifier + '-carousel').style.right.replace("px", ""));
  let increment = $('#' + identifier + '-carousel-container').width();
  let carouselWidth = $('#' + identifier + '-carousel').width();

  if (direction == "right") {
    let newRight = currentRight + increment;
    let remainingRight = carouselWidth - newRight;
    if (newRight <= carouselWidth) {
      // Video sizing needs to check if there is a valid next page to scroll to
      if (identifier.includes('videos') && remainingRight < (increment - 1)) {
        callback();
        return;
      }

      $('#' + identifier + '-carousel').animate({
        right: `+=${increment}`,
      }, duration, callback);
    }
    else {
      callback();
    }
  }
  else {
    if (currentRight - increment >= 0) {
      $('#' + identifier + '-carousel').animate({
        right: `-=${increment}`,
      }, duration, callback);
    }
    else {
      callback();
    }
  }
}

/*==================================================
= LOAD FUNCTION(S) =
==================================================*/

// Format all of a page's carousels
function formatCarousels() {
  let gamesPerPage = 4;
  let assetsPerPage = 3;
  let avatarsPerPage = 3;
  let videosPerPage = 1;

  if ($( window ).width() >= 600 && $( window ).width() <= 992) {
    gamesPerPage = 3;
    assetsPerPage = 2;
    avatarsPerPage = 2;
  }
  else if ($( window ).width() < 600) {
    gamesPerPage = 1;
    assetsPerPage = 1;
    avatarsPerPage = 1;
  }

  // Format the Carousels
  document.querySelectorAll('.carouselName').forEach(function(carouselName) {
    let identifier = carouselName.getAttribute('carouselName');

    if (identifier.includes("games"))
      formatCarouselNamed(identifier, gamesPerPage, 0)
    else if (identifier.includes("assets"))
      formatCarouselNamed(identifier, assetsPerPage, 0)
    else if (identifier.includes("avatars"))
      formatCarouselNamed(identifier, avatarsPerPage, 12)
    else if (identifier.includes("videos"))
      formatCarouselNamed(identifier, videosPerPage, 12)
  });

}

// Format carousel with given name to fit specified number of items on one page
function formatCarouselNamed(identifier, itemsPerPage, margin) {
  let carouselLength = document.getElementsByClassName('carousel-' + identifier).length;

  // Set the carousel width
  let carouselContentWidth = $('#' + identifier + '-carousel-content').width();
  let carouselWidth = (carouselContentWidth * carouselLength) / itemsPerPage;
  document.getElementById(identifier + '-carousel').setAttribute("style", "width: " + carouselWidth + "px; right: 0");

  document.querySelectorAll('.carousel-' + identifier).forEach(function(item) {
    // Set the width of the carousel item
    let itemWidth = (($('#' + identifier + '-carousel-container').width() - ((itemsPerPage * 2) * margin)) / itemsPerPage)
    item.setAttribute("style", "width: " + itemWidth + "px");
  });
}

// Fetches the JSON thumbnail information about carousel-game elements on the page by its assetId
function fetchGames() {
  document.querySelectorAll('.carousel-game').forEach(function(game) {
    // Roblox URL to query for asset url and thumbnail based on assetId
    let jsonUrl = "https://www.roblox.com/item-thumbnails?params=[{assetId:" + game.getAttribute('assetId') + "}]&jsoncallback=?"

    // Add thumbnail element based on JSON recieved
    $.getJSON(jsonUrl, function(json) {
      if (json.length > 0) {
        let htmlContent = "<a href='" + json[0].url + "'>\
                            <div style='background-image: url(\"" + json[0].thumbnailUrl + "\")' class='game-icon'>\
                            </div>\
                          </a>"
        game.innerHTML = htmlContent;

        game.removeAttribute("assetId"); // This attribute is no longer needed
      }
    });
  });
}

// Fetches the JSON thumbnail information about carousel-asset elements on the page by its assetId & about text
function fetchAssets() {
  document.querySelectorAll('.carousel-asset').forEach(function(asset) {
    // Roblox URL to query for asset url and thumbnail based on assetId
    let jsonUrl = "https://www.roblox.com/item-thumbnails?params=[{assetId:" + asset.getAttribute('assetId') + "}]&jsoncallback=?"

    // Add thumbnail element based on JSON recieved
    $.getJSON(jsonUrl, function(json) {
      if (json.length > 0) {
        let htmlContent = "<a href='" + json[0].url + "'>\
                            <div class='item-image'>\
                              <div class='item' style='background-image: url(\"" + json[0].thumbnailUrl + "\")'>\
                              </div>\
                            </div>\
                          </a>\
                          <div class='item-about'>\
                            <b>" + json[0].name + " + </b>\
                            " + asset.innerHTML + "\
                         </div>"
        asset.innerHTML = htmlContent;

        asset.removeAttribute("assetId"); // This attribute is no longer needed
      }
    });
  });
}

// Fetches the JSON thumbnail information about mission elements on the page by its prize and game assetIds
function fetchMissions() {
  document.querySelectorAll('.mission-game').forEach(function(game) {
    // Roblox URL to query for asset url and thumbnail based on assetId
    let jsonUrl = "https://www.roblox.com/item-thumbnails?params=[{assetId:" + game.getAttribute('assetId') + "}]&jsoncallback=?"

    // Add thumbnail element based on JSON recieved
    $.getJSON(jsonUrl, function(json) {
      if (json.length > 0) {
        let htmlContent = "<a href='" + json[0].url + "'>\
                            <div style='background-image: url(\"" + json[0].thumbnailUrl + "\")' class='mission-image game'>\
                            </div>\
                          </a>"
        game.innerHTML = htmlContent;

        game.removeAttribute("assetId"); // This attribute is no longer needed
      }
    });
  });

  document.querySelectorAll('.mission-prize').forEach(function(asset) {
    // Roblox URL to query for asset url and thumbnail based on assetId
    let jsonUrl = "https://www.roblox.com/item-thumbnails?params=[{assetId:" + asset.getAttribute('assetId') + "}]&jsoncallback=?"

    // Add thumbnail element based on JSON recieved
    $.getJSON(jsonUrl, function(json) {
      if (json.length > 0) {
        let htmlContent = "<a href='" + json[0].url + "'>\
                            <div style='background-image: url(\"" + json[0].thumbnailUrl + "\")' class='mission-image prize'>\
                            </div>\
                          </a>"
        asset.innerHTML = htmlContent;

        asset.removeAttribute("assetId"); // This attribute is no longer needed
      }
    });
  });
}

// Force styling on the document to override site-wide CSS
function styleDocument() {
  let event = document.getElementsByClassName('event_template_one');

  // The page is for an event
  if (event.length > 0)
    document.body.style.backgroundColor = "white";
}

/*==================================================
= ADDEVENTLISTENER(S) =
==================================================*/

window.addEventListener("DOMContentLoaded", fetchAssets);
window.addEventListener("DOMContentLoaded", fetchGames);
window.addEventListener("DOMContentLoaded", fetchMissions);

window.addEventListener("DOMContentLoaded", formatCarousels);

window.addEventListener("DOMContentLoaded", styleDocument);
