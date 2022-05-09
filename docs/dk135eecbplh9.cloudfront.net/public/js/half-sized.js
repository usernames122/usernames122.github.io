function setWidth(element, newWidth) {
  let widthAttribute = "width: " +newWidth+ "px !important"

  if (typeof element.setAttribute === 'function') {
    element.setAttribute( 'style', widthAttribute);
  }
}

function run() {
  // Get all images that want to have a lightbox
  var imgs = [...document.getElementsByClassName('half-sized')];

  // If the page requires half-sized images, get everything set up
  if (imgs.length > 0){
    imgs.forEach(function(img) {
      var newWidth = parseInt(img.naturalWidth) / 2;

      if (newWidth > 0)
        setWidth(img, newWidth);
      else {
        // If width is 0 then wait for the image to load
        img.onload = function() {
          setWidth(img, parseInt(img.naturalWidth) / 2);
        }
      }
    });
  }
}

window.addEventListener("load", run);
