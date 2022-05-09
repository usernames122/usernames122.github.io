/*================================
// Standardizes all code samples on the
//   page dependant on user preference
// Author(s): Connor Parrish
/*================================*/

// Initialize script
function run() {
  // Only use the theme cookie if it exists
  if (!!$.cookie('theme')) {
    const codeTheme = $.cookie('theme')

    // Set all code sample classes to theme cookie
    $('.code-block').addClass(codeTheme);
  }

  // Updates textblocks if using dark-theme
  if ($('.code-block').hasClass('dark-theme')) {
    let captionText = $('.code-block .dark-theme-icon[caption]').attr("caption");
    $('.theme-name').text(captionText);

    // Update any highlighted lines
    $('.code-block').find('.light-theme-highlight').addClass('dark-theme-highlight');
    $('.code-block').find('.light-theme-highlight').removeClass('light-theme-highlight');
  } else {
    let captionText = $('.code-block .light-theme-icon[caption]').attr("caption");
    $('.theme-name').text(captionText);

    // Update any highlighted lines
    $('.code-block').find('.dark-theme-highlight').addClass('light-theme-highlight');
    $('.code-block').find('.dark-theme-highlight').removeClass('dark-theme-highlight');
  }
}

$(document).ready(run);
