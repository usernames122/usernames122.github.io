// CDN url for resources/thumbnails
var cdn;

$(document).ready(function(){
  if (window.location.pathname.includes("learn-roblox")){
    cdn = $('.learning-materials-content #learningTabContent').attr('cdn-url').replace(/\/public|\/static|\/([\w]{2})-([\w]{2})/i, '');
  }
  if($(".video-section-wrap .recommended-videos").length > 0 ){
    $(".video-section-wrap").addClass("only-video");
  } else {
    $(".video-section-wrap").removeClass("only-video");
  }

  $('.related-articles .related-article-img').each(function(index, elem) {
    var bgImagePath = $(elem).css('background-image')
    if( bgImagePath.indexOf('/assets/') <= -1 ){
      $(elem).addClass("default-img");
    }
  })

  if($("table").length > 0 ){
    $('table').each(function() {
      if(!$(this).hasClass('tbl-items')) {
        $(this).wrap( "<div class='table-responsive'></div>" );
      }
    });
  }

  $('.inherited-wrap .show-hide').on('click', function(e) {
      $(this).parents(".inherited-wrap").find('.inherited-tbls').slideToggle( 400, function() {
    });
    $(this).parents(".inherited-wrap").toggleClass("show-hide-tbl");
  });

  detectIEBrowser();
  // ***********************************************************
  // Learn Landing page mobile dropdown
  // ***********************************************************

  if( $('.dropdown-wrap .mob-dropdown').length > 0 ){
    showTabsDropdown();
  }

  // ***********************************************************
  // Equal Hight box for Home page
  // ***********************************************************

  $("a").each(function(index, elem) {
    var hrefval = $(elem).attr('href');
    if(hrefval && hrefval.length > 0) {
      if( ( hrefval.indexOf("http") >=0 || hrefval.indexOf("https") >=0 ) ) {
        if( hrefval.indexOf("roblox.com") < 0 && hrefval.indexOf("cloudthis.com") < 0 && hrefval.indexOf("robloxdev.com") < 0 && hrefval.indexOf("assets.contentstack.io/v3/assets/bltc2ad39afa86662c8/") < 0 ) {
          $(elem).addClass("external-link");
        }
      }
      else if (hrefval.indexOf("/") == 0) {
        let locale = location.pathname.split('/')[1];
        $(elem).attr('href', "/" + locale + hrefval);
      }

      if( hrefval.indexOf("javascript:void") >=0 ) {
        $(elem).addClass("no-link");
      }
    }
  })

  $('.toggle-sidebar.expanded-slide').on('click', function(e) {
    $('.bd-sidebar-wrap').addClass('collapsed-sidebar');

    var slideDiv = $(".slide-sidebar");
    slideDiv.animate({'margin-left': '-277px'}, 400);

    $(".bd-sidebar-wrap").animate({'margin-right': '80px'}, 400);

  });

  $('.toggle-sidebar.collapse-slide').on('click', function(e) {
    $('.bd-sidebar-wrap').removeClass('collapsed-sidebar');

    var slideDiv = $(".slide-sidebar");
    slideDiv.animate({'margin-left': '0'}, 400);

    $(".bd-sidebar-wrap").animate({'margin-right': '0'}, 400);

  });

  $('.toggle-toc').on('click', function(e) {
    if( $(".bd-toc").hasClass('expand-collapse') ) {
      $(".toc-nav").animate({'margin-right': '0'}, 400);
      $(".toggle-toc").toggleClass("invisible");
      $(".bd-toc-wrap").animate({'margin-left': '0'}, 400);
    } else {
      $(".toc-nav").animate({'margin-right': '-244px'}, 400);
      $(".toggle-toc").toggleClass("invisible");
      $(".bd-toc-wrap").animate({'margin-left': '80px'}, 400);
    }
    $(".bd-toc").toggleClass("expand-collapse")
  });


  $('.external-link').on('click', function(e) {
    e.preventDefault();
    var currentHref = $(this).attr("href");
    $('.external-page-modal').modal('show')
    $('.external-page-modal').find('.continue-link').attr("href",currentHref)
    $('.external-page-modal').find('.link').text(currentHref)
  });

  $('.external-page-modal .continue-link').on('click', function(e) {
    $('.external-page-modal').modal('hide');
  });

  // ***********************************************************
  // Slide Header Menu in Mobile View
  // ***********************************************************

    slideMenu();
    mobileLeftSidebar();
    searchSlideInMobile();

  // ***********************************************************
  // Pagination
  // ***********************************************************

   $("div.pagination-holder").jPages({
      containerID : "search-lists",
      perPage : 4,
      previous    : "",
      next        : ""
    });



  // ***********************************************************
  // TOC Functionality
  // ***********************************************************

    if($(".bd-toc").length > 0) {
      calcTocHeight();
      if($(".gdpr-panel").length > 0) {
        $(".bd-content").removeClass("with-toc").addClass("with-toc-gdpr")
      }
      else {
        $(".bd-content").addClass("with-toc").removeClass("with-toc-gdpr")
      }
    }
    else {
      $(".bd-content").removeClass("with-toc");
      $(".bd-content").removeClass("with-toc-gdpr");
    }

    // ***********************************************************
    // Toc Functionality
    // ***********************************************************

    const SCROLL_EXTRA_PADDING = 12
    const TARGET_ABOVE_SPACE = $(".header").innerHeight() + SCROLL_EXTRA_PADDING

    var navSelector = '#toc';
    var $myNav = $(navSelector);
    Toc.init({
      $nav: $('#toc'),
      $scope : $(".toc-scope")
    });
    $('body').scrollspy({
      target: navSelector,
      offset: TARGET_ABOVE_SPACE
    });


  // ***********************************************************
  // Load More Functionality - ajax call
  // ***********************************************************

    $('.load-more a').click(function(){

      var current = this
      // var len = $(this).attr('tutorial-fetch')
      $(current).addClass('d-none')
      $(current).prev().removeClass('d-none')

      var len = $(this).attr('tutorial-len')
      var type = $(this).attr('type')

      var sortby = $('select.custom-select-box').val() != null ? $('select.custom-select-box').val() : "featured-content";
      var pathname = location.pathname.split('/');
      var path1 = pathname[2];
      var path2 = pathname[3];

      let tutorialType = "";

      if(type == 'articles') {
        tutorialType = 'article_landing_page'
      } else if(type == 'videos') {
        tutorialType = 'video_landing_page'
      } else if(type == 'recipes') {
        tutorialType = 'recipe_landing_page'
      }

      if(type == 'all') {
        URL = "/learn-roblox/tutorialType" + "/path1/" + path1 + "/path2/" + path2 + '/len/' + len + "/sortby/" + sortby
      } else {
        URL = "/learn-roblox/"+ tutorialType + "/path1/" + path1 + "/path2/" + path2 + '/len/' + len + "/sortby/" + sortby + '/type/' + type
      }

      postData(URL,current)
    })

    // Observe load-more elements and ensure that the load more button is shown if more elements are left to be loaded
    $('.load-more a').each(function (index, element) {
      var observer = new MutationObserver
      (function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type == "attributes") {
            let currentLength = parseInt( element.getAttribute("tutorial-len") );
            let totalLength = parseInt( element.getAttribute("total") );
            let shouldBeHidden = (currentLength >= totalLength) || (totalLength <= 12);

            $(element).toggleClass("d-none", shouldBeHidden);
            $(element).parent().toggleClass("d-none", shouldBeHidden);
          }
        });
      });

      observer.observe(element, {
        attributes: true // Configure the element to listen to changes in its attributes
      });
    });

    // $('.custom-select-box').select2();
    select2WithoutSearch();

  // ***********************************************************
  // Select2 Chnage Functionality - ajax call
  // ***********************************************************

    // $('.custom-select-box').select2();

    $('select.custom-select-box').change(function(){
      $('.load-more').removeClass('d-none')
      var sortByVal = $(this).val() != null ? $(this).val() : "featured-content";
      var pathname = location.pathname.split('/')
      var path1 = pathname[2]
      var path2 = pathname[3]
      URL = "/learn-roblox/path1/" + path1 + "/path2/" + path2 + "/sortby/" + sortByVal
      selectChangedPostData(URL)
    })

  // ***********************************************************
  // Search Functionality on API Pages
  // ***********************************************************

    setTimeout(function(){
      $('.bd-toc-item a.bd-toc-link').each(function(){
        if(!$(this).next().hasClass('display-none')) {
          $(this).parents(".bd-toc-item").addClass("has-open")
        } else {
          $(this).parents(".bd-toc-item").removeClass("has-open")
        }
      });
     }, 10)

    $('.bd-toc-item a.bd-toc-link').click(function() {
      $(this).next().toggleClass('display-none');
      $(this).next().find('li').toggleClass('display-none');
      if ($(this).next().hasClass('display-none')) {
        $(this).parents(".bd-toc-item").removeClass("has-open")
      } else {
        $(this).parents(".bd-toc-item").addClass("has-open")
      }
    })

    $('.bd-toc-item').find('ul.sub-nav li').removeClass('active')
    $('.multi-nested-list li').removeClass('active')

    $('.bd-toc-item').find('ul.sub-nav li a').each(function(index, elem){
      if( $(elem).attr('href') == location.pathname ){
        $(elem).parent().addClass('active')
        $(elem).parents('ul.sub-nav').find('li').removeClass('display-none')
        $(elem).parents('ul.sub-nav').removeClass('display-none')
      }
    })

    $('.multi-nested-list').find('li a').each(function(index, elem){
      if( $(elem).attr('href') == location.pathname ){
        $(elem).parent().addClass('active')
      }
    })

    $('.api-search input').keyup( function() {
      var key = this
      apiSearch(key)
    });

    $('.learn-roblox-tutorial').each(function(index, elem){
      if( $(elem).find('a').attr('href') == location.pathname ){
        $(elem).find('a').addClass('active')
      }
    })

  // ***********************************************************
  // Resize Functionality
  // ***********************************************************

    var windowWidth = $(window).width();
    $(window).resize(function() {
      slideMenu();
      mobileLeftSidebar();
      searchSlideInMobile();
      select2Close();

      calcTocHeight();



      if ($(window).width() != windowWidth) {
        windowWidth = $(window).width();
        if( $('.dropdown-wrap .mob-dropdown').length > 0 ){
          showTabsDropdown();
        }
      }
    });

    $('.load-more a').each(function(index, elm){
      if( $(elm).attr('total') <= 12) {
        $(elm).addClass('d-none')
      }
    })

  // ***********************************************************
  // Code for Active Header Menu
  // ***********************************************************

    $('.navbar-inner ul.navbar-nav li a').removeClass('active')
    $('.navbar-inner ul.navbar-nav li a').each(function(index, elem){
      var hrefURL = $(elem).attr('href')
      var path = location.pathname

      if( path.indexOf(hrefURL) >= 0 ) {
        $(elem).addClass('active')
      }
    })

    $('.recommended-videos .media').each(function(index, elem){
      var youtubeid = $(elem).find('.media-body').attr("video-url").match(/[\w\-]{11,}/)[0];
      if( window.location.protocol.indexOf('https') >= 0 )
        var videoImage = 'https://img.youtube.com/vi/'+youtubeid+'/' + 'hqdefault' +'.jpg'
      else
        var videoImage = 'http://img.youtube.com/vi/'+youtubeid+'/' + 'hqdefault' +'.jpg'
      $(elem).find('img').attr('src',videoImage)
    })

    // if( $('.recommended-videos').length > 0 ) {
      $('.learning-materials-content .tab-content .videos a.video-tag').each(function(index, elem){
        var youtubeid = $(elem).attr("video-youtube-url").match(/[\w\-]{11,}/)[0];
        if( window.location.protocol.indexOf('https') >= 0 )
          var videoImage = 'https://img.youtube.com/vi/'+youtubeid+'/' + 'hqdefault' +'.jpg'
        else
          var videoImage = 'http://img.youtube.com/vi/'+youtubeid+'/' + 'hqdefault' +'.jpg'
        $(elem).find('.video-image').css('background-image', 'url(' + videoImage + ')');
      })
    // }

    $('.learning-materials-content .tab-content .all a.video-tag').each(function(index, elem){
      var youtubeid = $(elem).attr("video-youtube-url").match(/[\w\-]{11,}/)[0];
      if( window.location.protocol.indexOf('https') >= 0 )
        var videoImage = 'https://img.youtube.com/vi/'+youtubeid+'/' + 'hqdefault' +'.jpg'
      else
        var videoImage = 'http://img.youtube.com/vi/'+youtubeid+'/' + 'hqdefault' +'.jpg'
      $(elem).find('.video-image').css('background-image', 'url(' + videoImage + ')');
    })

  // ***********************************************************
  // Code for Append Hash tag in url - Learn Roblox
  // ***********************************************************

    $('.learning-materials-content ul.nav-tabs li').click(function(e){
      var target = $(this).find('a').attr("href");
      location.hash = target;
      e.preventDefault()
    })

    if( $('.learning-materials-content').length > 0 && window.location.hash.length > 0){
      var hash =  window.location.hash
      $('.learning-materials-content ul li a').removeClass('active')
      $('.learning-materials-content ul li').each(function(index, elem){
        if( $(elem).find('a').attr('href') == hash ){
          $(elem).find('a').addClass('active')
        }
      })

      $('.learning-materials-content .tab-content .tab-pane').removeClass('active')

      $('.learning-materials-content .tab-content .tab-pane').each(function(index, elem){
        if( $(elem).attr('id') == hash.split('#')[1] ){
          $(elem).addClass('active')
        }
      })

      setTimeout(function(){
        $('html, body').animate({
            scrollTop: 0
        }, 800);
      }, 10)
    }

  // ***********************************************************
  // Code for syntax Highlighter
  // ***********************************************************

  if( $('.code-block').length > 0 ) {
    $('.code-block').each(function(index, elem) {
      // If the element is indented: apply the margin and account for it in later math
      var elemMargin = $(elem).hasClass("list-indent") ? 40 : 0;

      // Find the first parent that has a size (hidden divs have width = 0)
      var parent = $(elem).parent();
      var parentWidth = parent.width();
      while (parentWidth <= 0) {
        parent = parent.parent();
        parentWidth = parent.width()
      }

      // Calculate with width and make it a percent string
      var width =  Math.round(((parentWidth-(elemMargin*2))/parentWidth)*100);
      var widthPercentStr = width.toString() + "%";

      // Set the width
      $(elem).css("width", widthPercentStr);
    });
  }

    if( $('pre').length > 0 ) {
      $(this).removeClass("prettyprint linenums lang-lua");

      $('pre').each(function(index, elem) {
        $(this).addClass("prettyprint")

        const classList = $(this).attr("class")
        // We don't want to add linenums if there is already a linenums:linenumber class
        if (!classList.includes("linenums")) {
          $(this).addClass("linenums")
        }

        if ($(this).find("code").length > 0) {
          const code = $(this).find("code").html();
          $(this).html(code);
        }

        $(elem).attr("id", "id_" + index); // Added by brandon to support indented code blocks
        // Indent code block if list-indent is in the <pre> element being wrapped
        if ($(elem).hasClass("list-indent")) {
          // Calculate the width
          const parent = $(elem).parent();
          const parentWidth = parent.width();
          const elemMargin = 40;
          const width = ((parentWidth-elemMargin)/parentWidth)*100 + "%";

          // Set style of parent like below
          $(elem).wrap('<div class="code-block light-theme list-indent" style="width=' + width + '"></div>');
        } else {
          let captionText = $(elem).parents(".code-block").find('.light-theme-icon').first().attr("caption") || " "; // Either find the caption, which should be localized (set by code sample partial) or use english default
	        // This is for local ```lua code-blocks that aren't full code samples
          if (!$(elem).parent().hasClass("code-block") && !$(elem).parent().hasClass("tab-pane")) {
            $(elem).wrap('<div class="code-block light-theme"></div>');
            $(elem).addClass('no-border');
            const expandableArea = '<div class="expandable-area">' +
                                   '<a href="javascript:void(0)" class="expanded-button copy" data-placement="bottom">' +
                                     '<div class="copy-button"></div>' +
                                   '</a>' +
                                   '<a href="javascript:void(0)" class="expanded-button view">' +
                                     '<div class="expand-button"></div>' +
                                   '</a>' +
                                   '<a href="javascript:void(0)" class="expanded-button theme-wrap">' +
                                     '<div class="theme-icons">' +
                                       '<i class="light-theme-icon icon"></i>' +
                                       '<i class="dark-theme-icon icon"></i>' +
                                     '</div>' +
                                   '</a>' +
                                 '</div>'
            $(elem).before(expandableArea);
          }
        }

        if (!$(this).hasClass("nocode")) { // Added by Max to support the "Expected Output" window.
          $(this).addClass("lang-lua")
          $(elem).parents(".code-block").find(".copy").attr("data-clipboard-target", "#id_" + index);
        }
      });

      prettyPrint();

      // This is used to move the toggle after prettyPrinting incase there is now a scrollbar
      $('.code-block').each(function(index, elem) {
        if ($(elem).find('.expandable-area').length) {
          if ($(elem).find('ol.linenums').height() <= $(elem).find('pre').height()) {
            const expandableArea = $(elem).find('.expandable-area');
            $(expandableArea).css("right", 4);
          }
        }
      });

      // ***********************************************************
      // Expanded view
      // ***********************************************************

      $('.code-block .view').on('click', function(){
        $(this).parents(".code-block").find('.prettyprint').toggleClass('expanded');
        if ($(this).find('.expand-button').length) {
          const expandButton = $(this).find('.expand-button');
          $(expandButton).toggleClass('retract');
        }
      })

      // ***********************************************************
      // Code for Theme Change
      //  Author(s): Connor Parrish
      // ***********************************************************

        $('.theme-wrap').on('click', function(){
          $('.code-block').toggleClass('dark-theme');

          // If they already have the theme cookie, then update it
          if (!!$.cookie('theme')){
            if ($('.code-block').hasClass('dark-theme')) {
              $.cookie('theme', 'dark-theme', {path: '/'});
            } else {
              $.cookie('theme', 'light-theme', { path:'/' });
            }
          }

          // Update UI with current Theme
          if ($('.code-block').hasClass('dark-theme')) {
            // Update any highlighted lines
            $('.code-block').find('.light-theme-highlight').addClass('dark-theme-highlight');
            $('.code-block').find('.light-theme-highlight').removeClass('light-theme-highlight');

            // Update button text
            const captionText = $('.code-block .dark-theme-icon[caption]').attr("caption");
            $('.theme-wrap').find('.theme-name').text(captionText);
          } else {
            // Update any highlighted lines
            $('.code-block').find('.dark-theme-highlight').addClass('light-theme-highlight');
            $('.code-block').find('.dark-theme-highlight').removeClass('dark-theme-highlight');

            // Update button text
            const captionText = $('.code-block .light-theme-icon[caption]').attr("caption");
            $('.theme-wrap').find('.theme-name').text(captionText);
          }
        });

      // ***********************************************************
      // Code for Copy
      // ***********************************************************

      $('.code-block .copy').each(function(index, elem){
        $('.copy-button').tooltip({
          trigger:'click',
        })
        
        function setTooltip(button, message) {
          button.tooltip('hide')
          .attr('data-original-title', message)
          .tooltip('show');
        }
        
        function hideTooltip(button) {
          setTimeout(function() {
            button.attr('data-original-title', '')
            .tooltip('hide');
          }, 1000);
        }

        const clipboard = new ClipboardJS(this);
        clipboard.on('success', function(event) {
          const button = $(event.trigger);
          setTooltip(button, 'Copied'); // need to localize
          hideTooltip(button);
          event.clearSelection();
        })
      })
    }

    // ***********************************************************
    // Search Page Tab Title
    // ***********************************************************

      if( location.pathname.indexOf('/search') >= 0 ){
        var tabTitle = ''
        var keyword = ''
        if( location.hash && location.hash.length > 0 ){
          if( location.hash.indexOf('&') >= 0 ){
            keyword = location.hash.split('&')[0].split('=')[1]
          } else {
            keyword = location.hash.split('=')[1]
          }
          keyword = decodeURI(keyword)
          tabTitle = 'Search Results: ' + keyword
        } else {
          tabTitle = 'Search Results'
        }
        $(document).prop('title',tabTitle);
      }


    // ***********************************************************
    // Video Landing Page - RECOMMENDED VIDEOS Functionality
    // ***********************************************************

      var currentPageTitle = document.title

      $(window).on('hashchange', function(e) {
        var hashVal = window.location.hash;
        var pageTitle;

        var page = location.pathname + location.search + location.hash;
        var pageURL = location.host + location.pathname + location.search + location.hash;
        // console.log(" ========== page page ====== ", page)
        // ga('set', 'page', page);
        // ga('send', 'pageview');

        // gtag('config', 'UA-486632-22');
        // gtag('event', 'page_view', { 'send_to': 'UA-486632-22' });
        if ($.cookie('gdpr')) {
          gtag('config', 'UA-486632-22', {
            'page_location': pageURL,
            'page_path': page
          });
        }
        // console.log("========== GA Send ============= ")

        $('.learning-materials-content .nav-tabs li a').removeClass('active')
        $('.learning-materials-content .nav-tabs li a').each(function(index, elem){
          var href = $(elem).attr('href');
          if( href == hashVal ) {
            $(elem).addClass('active')
          }
        })

        $('.learning-materials-content .tab-content .tab-pane').removeClass('active')

        $('.learning-materials-content .tab-content .tab-pane').each(function(index, elem){
          if( $(elem).attr('id') == hashVal.split('#')[1] ){
            $(elem).addClass('active')
          }
        })

        if(hashVal == '') {
          $($('.learning-materials-content .nav-tabs li a')[0]).addClass('active')
          $($('.learning-materials-content .tab-content .tab-pane')[0]).addClass('active')
        }

        if( hashVal && hashVal.length > 0 ){
          var pageTitle = currentPageTitle + ' | ' + hashVal.split('#')[1]
        } else {
          var pageTitle = currentPageTitle
        }
        if( location.pathname.indexOf('/search') < 0 ) {
          $(document).prop('title',pageTitle);
        } else {
          var tabTitle = ''
          var keyword = ''
          var urlHashVal = location.hash
          if( location.hash && location.hash.length > 0 ){
            if( location.hash.indexOf('&') >= 0 ){
              keyword = location.hash.split('&')[0].split('=')[1]
            } else {
              keyword = location.hash.split('=')[1]
            }
            keyword = decodeURI(keyword)
            tabTitle = 'Search Results: ' + keyword
          } else {
            tabTitle = 'Search Results'
          }
          $('.search-container #st-search-page-input').val(keyword)
          $(document).prop('title',tabTitle);
        }
      });

      $('.bd-toc-item-wrap .api-index a.bd-toc-link').removeClass('active')
      $('.bd-toc-item-wrap .api-index a.bd-toc-link').each(function(index, elem) {
        var hrefVal = location.pathname
        if( $(elem).attr('href').trim() == hrefVal ) {
          $(elem).addClass('active')
        }
      })

    // ***********************************************************
    // API Class Left Sidebar Tree View - Funtionality
    // ***********************************************************

    var middleContentHeight = $(".bd-content").innerHeight();
    if (middleContentHeight > 600 ) {
      $('ul.multi-nested-list').css("max-height", middleContentHeight);

      $('ul.multi-nested-list').each(function() {
          $this = $(this);
          $this.find("li").has("ul").addClass("hasSubmenu");
      });
    }

    // Find the last li in each level
    $('ul.multi-nested-list li:last-child').each(function() {
      $this = $(this);
      // Check if LI has children
      if ($this.children('ul').length === 0) {
        // Add border-left in every UL where the last LI has not children
        $this.closest('ul').css("border-left", "1px dashed #cdd4d8");
      } else {
        // Add border in child LI, except in the last one
        $this.closest('ul').children("li").not(":last").css("border-left", "1px dashed #cdd4d8");
        // Add the class "addBorderBefore" to create the pseudo-element :defore in the last li
        $this.closest('ul').children("li").last().children("a").addClass("addBorderBefore");
        // Add margin in the first level of the list
        $this.closest('ul').css("margin-top", "20px");
        // Add margin in other levels of the list
        $this.closest('ul').find("li").children("ul").css("margin-top", "20px");
      };
    });

  // ***********************************************************
  // API Class Page Deprecated Switch - Funtionality
  // ***********************************************************

    $("table.table").each(function(index, elem) {
      var deprecated = $(elem).find('span.deprecated').text()
      if(deprecated && deprecated.length > 0) {
        $(elem).addClass('d-none')
        var id = $(elem).find("code.name h3").attr('id');
        $('nav#toc ul li ul li').each(function(index, ele){
          var href = $(ele).find('a').attr('href').split("#")[1]
          if( id == href ) {
            $(ele).addClass('d-none')
          }
        })
      }
    })

    $('#switch_checkbox').change(function() {
      if( !$(this).is(':checked') ) {
        $("table.table").each(function(index, elem) {
          var deprecated = $(elem).find('span.deprecated').text()
          if(deprecated && deprecated.length > 0) {
            $(elem).addClass('d-none')
            var id = $(elem).find("code.name h3").attr('id');
            $('nav#toc ul li ul li').each(function(index, ele){
              var href = $(ele).find('a').attr('href').split("#")[1]
              if( id == href ) {
                $(ele).addClass('d-none')
              }
            })
          }
        })
      } else {
        $("table.table").each(function(index, elem) {
          var deprecated = $(elem).find('span.deprecated').text()
          if(deprecated && deprecated.length > 0) {
            $(elem).removeClass('d-none')
            var id = $(elem).find("code.name h3").attr('id');
            $('nav#toc ul li ul li').each(function(index, ele){
              var href = $(ele).find('a').attr('href').split("#")[1]
              if( id == href ) {
                $(ele).removeClass('d-none')
              }
            })
          }
        })
      }
    });

  //

  var delete_cookie = function(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  };

  $('ul.multi-nested-list a.tree-view').click(function(){
    $.cookie('classTree', true);
  })

  $('.bd-toc-item a.group').click(function(){
    delete_cookie('classTree')
  })

  if( $.cookie('classTree') ) {
    $('ul.nav-tabs li a').trigger('click')
  }


  if($(".bd-toc").length > 0) {
   var rightSideBarContent = $('.bd-toc-wrap .inner-toc-nav .navbar-nav').find('li').length
    if( rightSideBarContent <= 0 ) {
      $('.bd-toc-wrap').addClass("bd-toc-hide");
      $('.bd-content').css("margin-right", "80px");
    }
  }

  var docSiteAnchor = document.getElementById('new-site-deprecation-banner');
  docSiteAnchor.href = generateDocSitePath();
})

window.onload = function() {
  // ***********************************************************
  // Smooth Scrolling Functionality for anchor links
  // ***********************************************************
  const isSearchPage = window.location.pathname.match(/\/([\w]{2})-([\w]{2})\/search/) != null;
  if (!isSearchPage) {
    $('a[href^="#"]').filter(
      function() {
        const isCodeTab = $(this).closest(".nav-tabs").length != 0
        const isNavPill = $(this).closest(".nav-pills").length != 0
        const isButton = $(this).closest(".btn").length != 0;
        return  !(isCodeTab || isNavPill || isButton);
      }
    ).click(smoothUpdateScrollPosition);
    smoothUpdateScrollPosition();
  }

  function smoothUpdateScrollPosition(e) {
    function scrollTo(target) {
      const headerPadding = $(".header").innerHeight()
      const scrollDuration = 200;

       $('html, body').animate({
         scrollTop: $(target).offset().top - headerPadding
       }, scrollDuration);
    }

    if (e) {
      e.preventDefault();
      const target = $(this).attr("href");
      scrollTo(target);
    } else {
      let urlHash = window.location.hash.substring(1);
      if (urlHash.length != 0) {
        const target = $("#"+window.location.hash.substring(1));
        document.addEventListener('autolinkComplete', function() {
          scrollTo(target);
        });
      }
    }
  }
}

// ***********************************************************
// Document Ready END
// ***********************************************************

function postData(URL, current) {

  $.ajax({
    url: URL,
    type:'GET'
  })
  .done(function(data) {

    $(current).removeClass('d-none')
    $(current).prev().addClass('d-none')

    var type = data.type
    
    data.details.forEach(function(elem, index){

      if( elem && elem.title.length > 0 ) {
        var image = '';
        var shortDescription = '';
        var achore = '';
        var duration = '';
        var title = '';

        console.log(elem.title, elem);
        if( elem.type == 'videos' ) {
          // image = '<img class="img-fluid video-image" src=""/>'
          image = '<div class="image-icon video-image"></div>'
        } else {
          if( elem.thumbnail_image) {
            if( elem.thumbnail_image.uid && elem.thumbnail_image.uid.length > 0 ){
              var imgURL = cdn + elem.thumbnail_image._internal_url;
              // image = '<img class="img-fluid" src='+ elem.thumbnail_image._internal_url+'/>';
              image = '<div class="image-icon" style="background-image: url('+ imgURL +')"></div>'

            }
          }
          // Added by Max to support default thumbnails.
          if (image == '') {
            var imgURL = ''
            if (elem.type == 'articles') {
              imgURL = '/static/images/banner-1.png';
            } else if (elem.type == 'recipes') {
              imgURL = '/static/images/recipe-icon.png';
            }
            image = '<div class="image-icon" style="background-image: url(' + imgURL + ')"></div>'
          }
        }

        if( elem.type == 'videos' ) {
          if( elem.url && elem.url.length > 0 )
            achore = '<a class="video-tag" video-youtube-url='+  elem.video_url +' href='+ elem.url + '>'
        } else {
          if( elem.url && elem.url.length > 0 )
            achore = '<a href="'+ elem.url +'">'
        }

        if(elem.short_description && elem.short_description.length > 0) {
          shortDescription = '<div class="desc">' + elem.short_description + '</div>'
        }

        if(elem.duration && elem.duration.length > 0){
          duration = '<span class="time">' + elem.duration + '</span>'
        }

        if(elem.title && elem.title.length > 0){
          title = '<h5>'+ elem.title + '</h5>'
        }

        var details =  '<div class="col-sm-6 col-md-4 col-xl-3 mb-3">' +
                        achore +
                        '<div class="inner-wrap">' +
                          '<div class="heading-wrap">' +
                            '<span class="learning-type">' + elem.translatedType + '</span>' +
                            duration +
                          '</div>' +
                            image +
                            title +
                          shortDescription +
                        '</div>'+
                        '</a>' +
                      '</div>'
        $('.row.'+type).append(details)
      }
    })

    if( type == 'videos' ) {
      $('.learning-materials-content .tab-content .videos a.video-tag').each(function(index, elem){
        var youtubeid = $(elem).attr("video-youtube-url").match(/[\w\-]{11,}/)[0];
        if( window.location.protocol.indexOf('https') >= 0 )
          var videoImage = 'https://img.youtube.com/vi/'+youtubeid+'/' + 'hqdefault' +'.jpg'
        else
          var videoImage = 'http://img.youtube.com/vi/'+youtubeid+'/' + 'hqdefault' +'.jpg'

        // $(elem).find('img.video-image').attr('src',videoImage)
        $(elem).find('.video-image').css('background-image', 'url(' + videoImage + ')');
      })
    } else {
      $('.learning-materials-content .tab-content .all a.video-tag').each(function(index, elem){
        var youtubeid = $(elem).attr("video-youtube-url").match(/[\w\-]{11,}/)[0];
        if( window.location.protocol.indexOf('https') >= 0 )
          var videoImage = 'https://img.youtube.com/vi/'+youtubeid+'/' + 'hqdefault' +'.jpg'
        else
          var videoImage = 'http://img.youtube.com/vi/'+youtubeid+'/' + 'hqdefault' +'.jpg'
        // $(elem).find('img.video-image').attr('src',videoImage)
        $(elem).find('.video-image').css('background-image', 'url(' + videoImage + ')');
      })
    }

    $(current).attr('tutorial-len', data.length)
    // if( data.type == 'all') {
    //   $(current).attr('tutorial-fetch', data.length)
    // } else {
    //   $(current).attr('tutorial-fetch', data.length)
    // }
    $(current).attr('type', data.type)

    var currentLength = parseInt( $(current).attr('tutorial-len') );
    var totalLength = parseInt( $(current).attr('total') );
    let shouldBeHidden = (currentLength >= totalLength) || (totalLength <= 12);

    if (shouldBeHidden) {
      $(current).parent().addClass('d-none');
    }

  })
  .fail(function( xhr, status, error ) {
  })
}

function selectChangedPostData(URL) {
  $.ajax({
    url: URL,
    type:'GET'
  })
  .done(function(data) {
    // Data.results is an array of dictionaries in the format:
    // [
    //   {
    //     "articlesDetails": [...],
    //     "type": "articles",
    //     "length": 12
    //   },
    //   {
    //     "videosDetails": [...],
    //     "type": "videos",
    //     "length": 12
    //   },
    //   {
    //     "recipesDetails": [...],
    //     "type": "recipes",
    //     "length": 12
    //   },
    //   {
    //     "count": 303
    //   },
    //   {
    //     "count": 82
    //   },
    //   {
    //     "count": 68
    //   },
    //   {
    //     "allTutorial": [...],
    //     "type": "all",
    //     "length": 12,
    //     "count": 150
    //   }
    // ]

    $('.row.'+data.results[0].type).empty();
    $('.row.'+data.results[1].type).empty();
    $('.row.'+data.results[2].type).empty();
    $('.row.'+data.results[6].type).empty(); // This 6 skips the empty dictionaries in the results array as shown above

    let locale = location.pathname.split('/')[1];

    data.results[0].articlesDetails.forEach(function(elem, index){

      var image = ''
      var shortDescription = ''
      var duration = ''
      var title = ''
      var anchor = ''

      if(elem.thumbnail_image) {
        if( elem.thumbnail_image.uid && elem.thumbnail_image.uid.length > 0 ){
          var imgURL = cdn + elem.thumbnail_image._internal_url;
          // image = '<img class="img-fluid" src='+ elem.thumbnail_image._internal_url+'/>';
          image = '<div class="image-icon" style="background-image: url('+ imgURL +')"></div>'
        }
      }

      // Added by Max to support default thumbnails.
      if (image == '') {
        image = '<div class="image-icon" style="background-image: url(/static/images/banner-1.png)"></div>'
      }

      if(elem.short_description && elem.short_description.length > 0) {
        shortDescription = '<div class="desc">' + elem.short_description + '</div>'
      }

      if(elem.duration && elem.duration.length > 0){
        duration = '<span class="time">' + elem.duration + '</span>'
      }

      if(elem.title && elem.title.length > 0){
        title = '<h5>'+ elem.title + '</h5>'
      }

      if(elem.url && elem.url.length > 0){
        anchor = '<a href="/'+ locale + elem.url +'">'
      }


      var details =  '<div class="col-sm-6 col-md-4 col-xl-3 mb-3">' +
                anchor +
                '<div class="inner-wrap">' +
                  '<div class="heading-wrap">' +
                    '<span class="learning-type">' + elem.translatedType + '</span>' +
                    duration +
                  '</div>' +
                    image +
                    title +
                  shortDescription +
                '</div>'+
                '</a>' +
              '</div>'


      $('.row.'+data.results[0].type).append(details)
      $('.tab-content #'+data.results[0].type).find('.load-more a').attr('tutorial-len', data.results[0].length)
      $('.tab-content #'+data.results[0].type).find('.load-more a').attr('total', data.results[3].count)
      $('.tab-content #'+data.results[0].type).find('.load-more a').attr('type', data.results[0].type)
    })

    data.results[1].videosDetails.forEach(function(elem, index){

      var image = ''
      var shortDescription = ''
      var anchor = ''
      var duration = ''
      var title = ''

      if( elem.type == 'videos' ) {
        // image = '<img class="img-fluid video-image" src=""/>'
        image = '<div class="image-icon video-image"></div>'
        anchor = '<a class="video-tag" video-youtube-url='+ elem.video_url +' href="/'+ locale + elem.url + '">'
      }

      if(elem.short_description && elem.short_description.length > 0) {
        shortDescription = '<div class="desc">' + elem.short_description + '</div>'
      }

      if( elem.duration && elem.duration.length > 0){
        duration = '<span class="time">' + elem.duration + '</span>'
      }

      if( elem.title && elem.title.length > 0){
        title = '<h5>'+ elem.title + '</h5>'
      }

      var details =  '<div class="col-sm-6 col-md-4 col-xl-3 mb-3">' +
                  anchor +
                '<div class="inner-wrap">' +
                  '<div class="heading-wrap">' +
                    '<span class="learning-type">' + elem.translatedType + '</span>' +
                    duration +
                  '</div>' +
                    image +
                    title +
                  shortDescription +
                '</div>'+
                '</a>' +
              '</div>'

      $('.row.'+data.results[1].type).append(details)
      $('.tab-content #'+data.results[1].type).find('.load-more a').attr('tutorial-len', data.results[1].length)
      $('.tab-content #'+data.results[1].type).find('.load-more a').attr('total', data.results[4].count)
      $('.tab-content #'+data.results[1].type).find('.load-more a').attr('type', data.results[1].type)
    })

    $('.learning-materials-content .tab-content .videos a.video-tag').each(function(index, elem){
      var youtubeid = $(elem).attr("video-youtube-url").match(/[\w\-]{11,}/)[0];
      if( window.location.protocol.indexOf('https') >= 0 )
        var videoImage = 'https://img.youtube.com/vi/'+youtubeid+'/' + 'hqdefault' +'.jpg'
      else
        var videoImage = 'http://img.youtube.com/vi/'+youtubeid+'/' + 'hqdefault' +'.jpg'
      $(elem).find('.video-image').css('background-image', 'url(' + videoImage + ')');
    })

    data.results[2].recipesDetails.forEach(function(elem, index){

      var image = ''
      var shortDescription = ''
      var duration = ''
      var title = ''
      var anchor = ''

      if( elem.thumbnail_image) {
        if( elem.thumbnail_image.uid && elem.thumbnail_image.uid.length > 0 ){
          var imgURL = cdn + elem.thumbnail_image._internal_url;
          // image = '<img class="img-fluid" src='+ elem.thumbnail_image._internal_url+'/>';
          image = '<div class="image-icon" style="background-image: url('+ imgURL +')"></div>'
        }
      }

      // Added by Max to support default thumbnails.
      if (image == '') {
        image = '<div class="image-icon" style="background-image: url(/static/images/recipe-icon.png)"></div>'
      }

      if(elem.short_description && elem.short_description.length > 0) {
        shortDescription = '<div class="desc">' + elem.short_description + '</div>'
      }

      if(elem.duration && elem.duration.length > 0){
        duration = '<span class="time">' + elem.duration + '</span>'
      }

      if(elem.title && elem.title.length > 0){
        title = '<h5>'+ elem.title + '</h5>'
      }

      if(elem.url && elem.url.length > 0){
        anchor = '<a href="/'+ locale + elem.url +'">'
      }

      var details =  '<div class="col-sm-6 col-md-4 col-xl-3 mb-3">' +
                anchor +
                '<div class="inner-wrap">' +
                  '<div class="heading-wrap">' +
                    '<span class="learning-type">' + elem.translatedType + '</span>' +
                    duration +
                  '</div>' +
                    image +
                    title +
                  shortDescription +
                '</div>'+
                '</a>' +
              '</div>'

      $('.row.'+data.results[2].type).append(details)
      $('.tab-content #'+data.results[2].type).find('.load-more a').attr('tutorial-len', data.results[2].length)
      $('.tab-content #'+data.results[2].type).find('.load-more a').attr('total', data.results[5].count)
      $('.tab-content #'+data.results[2].type).find('.load-more a').attr('type', data.results[2].type)
    })

    data.results[6].allTutorial.forEach(function(elem, index){

      var image = ''
      var shortDescription = ''
      var anchor = ''
      var duration = ''
      var title = ''
      var type = ''

      if( elem && elem.type) {
        type = elem.translatedType
      }

      if( elem && elem.type) {
        if( elem.type == 'videos' ) {
          image = '<div class="image-icon video-image"></div>'
          anchor = '<a class="video-tag" video-youtube-url='+  elem.video_url +' href="/'+ locale + elem.url + '">'
        } else {
          if( elem.thumbnail_image) {
            if( elem.thumbnail_image.uid && elem.thumbnail_image.uid.length > 0 ){
              var imgURL = cdn + elem.thumbnail_image._internal_url;
              image = '<div class="image-icon" style="background-image: url('+ imgURL +')"></div>'
            }
          }
          anchor = '<a href="/'+ locale + elem.url +'">'
        }
      }

      if(elem && elem.short_description && elem.short_description.length > 0) {
        shortDescription = '<div class="desc">' + elem.short_description + '</div>'
      }

      if(elem && elem.duration && elem.duration.length > 0){
        duration = '<span class="time">' + elem.duration + '</span>'
      }

      if(elem && elem.title && elem.title.length > 0){
        title = '<h5>'+ elem.title + '</h5>'
      }

      var details =  '<div class="col-sm-6 col-md-4 col-xl-3 mb-3">' +
                anchor +
                '<div class="inner-wrap">' +
                  '<div class="heading-wrap">' +
                    '<span class="learning-type">' + type + '</span>' +
                    duration +
                  '</div>' +
                    image +
                    title +
                  shortDescription +
                '</div>'+
                '</a>' +
              '</div>'

      $('.row.'+data.results[6].type).append(details)
      $('.tab-content #'+data.results[6].type).find('.load-more a').attr('tutorial-len', data.results[6].length)
      $('.tab-content #'+data.results[6].type).find('.load-more a').attr('total', data.results[3].count + data.results[4].count + data.results[5].count)
      $('.tab-content #'+data.results[6].type).find('.load-more a').attr('type', data.results[6].type)
    })

    $('.learning-materials-content .tab-content .all a.video-tag').each(function(index, elem){
      var youtubeid = $(elem).attr("video-youtube-url").match(/[\w\-]{11,}/)[0];
      if( window.location.protocol.indexOf('https') >= 0 )
        var videoImage = 'https://img.youtube.com/vi/'+youtubeid+'/'+ 'hqdefault' +'.jpg'
      else
        var videoImage = 'http://img.youtube.com/vi/'+youtubeid+'/'+ 'hqdefault' +'.jpg'
      $(elem).find('.video-image').css('background-image', 'url(' + videoImage + ')');
    })

  })
  .fail(function( xhr, status, error ) {
  })
}

function slideMenu() {
  var width = window.innerWidth || $(window).width()
  if (width < 992){
    $('.header .toggler-icon').on('click', function(){
      $(this).parents(".header").find(".navbar-inner").css("width","250px");
      $(this).parents(".header").find(".slide-overlay").css("display","block");
      $(this).parents(".header").find(".relevant-sidebar .bd-sidebar").addClass("sidebar-visible");
    })
    $('.header .closebtn').on('click', function(){
      $(this).parents(".header").find(".navbar-inner").css("width","0");
      $(this).parents(".header").find(".slide-overlay").css("display","none");
    })
  }
  else {
    $(".slide-overlay").removeAttr("style");
    $(".navbar-inner").removeAttr("style");
  }
}

function mobileLeftSidebar() {
  $(".header .bd-sidebar").removeClass("d-none d-lg-block col-md-3 col-lg-3 col-xl-3");
  var width = window.innerWidth || $(window).width()
  if (width < 992){
    $('.header .nav-item').addClass("mob-nav-item");
    $('.header .mob-nav-item').each(function() {
      if($(this).find('.bd-sidebar').length !== 0) {
        $(this).addClass('has-sidebar');
      }
      var hrefVal = $(this).find('.nav-link').attr("href");
      if (hrefVal.indexOf("http") >= 0 || hrefVal.indexOf("/articles") >= 0 || hrefVal.indexOf("/resources") >= 0 || hrefVal.indexOf("/quick-start") >= 0 || hrefVal.indexOf("/support") >= 0) {
        $(this).removeClass('has-sidebar');
      }
    });
    
    $('.bd-sidebar .back-icon span').on('click', function(){
      $(this).parents('.bd-sidebar').removeClass("sidebar-visible");
    });

    $('.header .slide-overlay').on('click', function(){
      $(this).css("display","none");
      $(".header .wrap .navbar-inner").removeAttr("style");
      $('.bd-sidebar').removeClass("sidebar-visible");
    });
  }
  else {
    $('.header .nav-item').removeClass("mob-nav-item");
    $('.header .nav-item').removeClass("has-sidebar");
    $('.bd-sidebar').removeClass("sidebar-visible");
  }
}

function searchSlideInMobile() {
  var width = window.innerWidth || $(window).width()
  if (width < 768){
    // Open the search box on mobile when the search icon is clicked
    $('.header .m-search-icon').on('click', function(){
      $(this).parents(".header").find(".search-box").addClass('expanded');
      $('#st-search-input').focus()
    })

    // Close the search box with 'x' button on the box
    $('.header .search-close').on('click', function(){
      $(this).parents(".header").find(".search-box").removeClass('expanded');
    })

    // When anywhere else on the page is tapped, close the search box if open
    $('.container-fluid').click(function(){
       if( $(".header").find(".search-box").hasClass("expanded") ) {
         $(".header").find(".search-box").removeClass("expanded")
       }
    });
  }
  else {
    $(".header").find(".search-box").removeClass('expanded');
  }
}

function select2WithoutSearch() {
  $(".custom-select-box").select2({
      dropdownCssClass: 'custom-select-dropdown',
      minimumResultsForSearch: -1
  });
  var touchDevice = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
  if((touchDevice)){
    $(".custom-select-box .select2-search, .custom-select-box .select2-focusser").remove();
  }
}

function select2Close() {
  $(".select2-container.select2-dropdown-open").select2('close');
}

function setEqualHeight(columns) {
  var tallestcolumn = 0;
  setTimeout(function(){
    columns.each(function(index, elem) {
        currentHeight = $(elem).height();
        if(currentHeight > tallestcolumn) {
          tallestcolumn  = currentHeight;
        }
    });
    columns.height(tallestcolumn);
  },10)
}


function apiSearch(key){

  var classGroupLen = $('#grouped .bd-toc-item-wrap.class_categories .bd-toc-item').length
  var classTreeLen = $('#class-tree ul.multi-nested-list li').length
  var count = 0
  var cnt = 0

  if( key.value.length == 0 ) {
    $('.bd-toc-item').find('ul.sub-nav').addClass('display-none')
    $('.bd-toc-item').find('ul.sub-nav li').addClass('display-none')
    $(".bd-toc-item").removeClass("has-open")
    $('.class_categories .bd-toc-item').removeClass('display-none')
    $('.bd-toc-item').find('ul.sub-nav li a').each(function(index, elem){
      if( $(elem).attr('href') == location.pathname ){
        $(elem).parent().addClass('active')
        $(elem).parents(".bd-toc-item").addClass("has-open")
        $(elem).parents("ul.sub-nav").find('li').removeClass('display-none')
        $(elem).parents('ul.sub-nav').removeClass('display-none').addClass('display-block')
      }
    })

    $('ul.multi-nested-list li').removeClass('d-none')
    $('ul.multi-nested-list li').removeClass('match-li')
    $('.multi-nested-list').removeClass('search-filter')
  }

  if( key.value.length < 4)
    return;

  var currVal = key.value.toLowerCase()
  $('.bd-toc-item').find('ul.sub-nav').addClass('display-none')
  $('.bd-toc-item').removeClass('has-open')
  $('.class_categories .bd-toc-item').addClass('display-none')

  $('.bd-toc-item').find('ul.sub-nav li').each(function(index, elem) {
    $(elem).addClass('display-none')
    var category = $(elem).attr('data-sub-category')
    if( category.indexOf(currVal) >= 0 ) {
      count++
      $(elem).removeClass('display-none')
      $(elem).parent().removeClass('display-none')
      $(elem).parent().parent().removeClass('display-none')
      $(elem).parents('.bd-toc-item').addClass('has-open')
    }
  })

  $('ul.multi-nested-list li').addClass('d-none')
  $('ul.multi-nested-list li').removeClass('match-li')
  $('ul.multi-nested-list li a span').each(function(index, elem){
    var label = $(elem).text().toLowerCase()
    if( label.indexOf(currVal) >= 0 ) {
      cnt++
      $(elem).parents('li').removeClass('d-none')
      $(elem).parent().parent().addClass('match-li')
      $(elem).parents('.multi-nested-list').addClass('search-filter')
    }
  })

  if( count == 0 ) {
    $('.class-without-tree.no-result').removeClass('d-none')
  } else {
    $('.class-without-tree.no-result').addClass('d-none')
  }

  if( cnt == 0 ) {
    $('.class-with-tree.no-result').removeClass('d-none')
  } else {
    $('.class-with-tree.no-result').addClass('d-none')
  }
}

function showTabsDropdown() {
  if ($(window).width() < 768){
    $(document).on('click', function(e){
      $(".nav-tabs").removeClass("show-dropdown");
    });

    $('.dropdown-wrap .mob-dropdown').on('click', function(e){
      e.stopPropagation();
      $(this).parent().find(".nav-tabs").addClass("show-dropdown");
    });

    $(".nav-tabs .nav-link").on('click', function(){
      var selectedText = $(this).text();
      $('.dropdown-wrap .mob-dropdown .text').html(selectedText);
      $(".nav-tabs").removeClass("show-dropdown");
    });

  } else {
    $(".nav-tabs").removeClass("show-dropdown");
  }
}

function calcTocHeight() {
  if ($(window).width() > 767){
    var windowHeight = $( window ).height();

    var getTocTop = parseInt($('.bd-toc').css("top"));

    var calcTocMaxHeight = windowHeight - getTocTop;

    $('.bd-toc .toc-nav').css("max-height", calcTocMaxHeight);
    $('.bd-toc').css("height", calcTocMaxHeight);
  } else {
    $('.bd-toc').removeAttr("style");
    $('.bd-toc .toc-nav').removeAttr("style");
  }
}

function detectIEBrowser() {
  if (/MSIE (\d+\.\d+);/.test(navigator.userAgent) || navigator.userAgent.indexOf("Trident/") > -1 ){
    $("body").addClass("ie");
  }
}

function generateDocSitePath() {
  var relativePath = window.location.pathname;
  var newDocSiteBaseUrl = 'https://create.roblox.com/docs';
  var newDocSiteApiReferenceBaseUrl = 'https://create.roblox.com/docs/reference/engine';
  var index = relativePath.indexOf('api-reference');
  if (index === -1) {
    return newDocSiteBaseUrl;
  } else {
    const apiRefereceOnlyRegex = /^\/\w+-\w+\/api-reference$/ig;
    const typeOnlyRegex = /^\/\w+-\w+\/api-reference\/(\w+-?\w*)$/ig;
    const typeAndNameRegex = /^\/\w+-\w+\/api-reference\/(.+)\/(.+)$/ig;
    const apiRefereceOnlyMatchedResults = apiRefereceOnlyRegex.exec(relativePath);
    const typeOnlyMatchedResults = typeOnlyRegex.exec(relativePath);
    const typeAndNameMatchedResults = typeAndNameRegex.exec(relativePath);
    if (apiRefereceOnlyMatchedResults !== null) {
      return newDocSiteApiReferenceBaseUrl;
    } else if (typeOnlyMatchedResults !== null) {
      var type = typeOnlyMatchedResults[1];
      switch (type) {
        case 'index':
        case 'class':
          return `${newDocSiteApiReferenceBaseUrl}/classes`;
        case 'data-types':
          return `${newDocSiteApiReferenceBaseUrl}/datatypes`;
        case 'enum':
          return `${newDocSiteApiReferenceBaseUrl}/enums`;
        case 'lua-docs':
          return newDocSiteApiReferenceBaseUrl;
      }
    } else if (typeAndNameMatchedResults !== null) {
      var type = typeAndNameMatchedResults[1];
      var name = typeAndNameMatchedResults[2];
      var types = '';
      switch (type) {
        case 'class':
        case 'index':
          types = 'classes';
          break;
        case 'datatype':
          types = 'datatypes';
          break;
        case 'enum':
          types = 'enums';
          break;
      }
      if (type === 'lua-docs') {
        if (name === 'Lua-Globals') {
          types = 'globals';
          name = 'LuaGlobals'
        } else if (name === 'Roblox-Globals') {
          types = 'globals';
          name = 'RobloxGlobals';
        } else {
          types = 'libraries';
        }
      }
      if (types === '') {
        return newDocSiteApiReferenceBaseUrl;
      }
      if (name === undefined) {
        return `${newDocSiteApiReferenceBaseUrl}/${types}`;
      }
      return `${newDocSiteApiReferenceBaseUrl}/${types}/${name}`;
    }
    return newDocSiteApiReferenceBaseUrl;
  }
}
