var searchConfig = {
    segment : undefined
  };

var this_js_script = $('script[src*="/static/js/st.custom.search.js"]'); // or better regexp to get the file name..
var st_engineID = this_js_script.attr('engineID');

// Borrowed from https://stackoverflow.com/questions/27078285/simple-throttle-in-js
// TODO move this and other related helper functions to a utilities script
function throttle (callback, limit) {
  var waiting = false;                      // Initially, we're not waiting
  return function () {                      // We return a throttled function
    if (!waiting) {                       // If we're not waiting
      callback.apply(this, arguments);  // Execute users function
      waiting = true;                   // Prevent future invocations
      setTimeout(function () {          // After a period of time
        waiting = false;              // And allow future invocations
      }, limit);
    }
  }
}


var readHighlightedFields = function() {
  var fields = {
    'api-reference': {
      'body': {
        'fallback': false
      }
    },
    'articles': {
      'body': {
        'fallback': false
      }
    },
    'recipes': {
      'body': {
        'fallback': false
      }
    },
    'videos': {
      'body': {
        'fallback': false
      }
    }
  };
  return fields;
}

var triggerEvent = document.createEvent('Event');
triggerEvent.initEvent('triggerAutolink', true, false)

// Once autolink completes, scrap the formatting, but keep the displayed text
document.addEventListener('autolinkComplete', function() {
  const modalVisible = $('#live-search-modal').is(":visible")
  if(modalVisible) {
    // Find all the <code> tags on the page
    var codeElements = [...document.getElementById('live-search-modal').getElementsByTagName('code')]

    // Find elements in the DOM with the 'code' tag
    codeElements.forEach(function(code) {
      var s = document.createElement('span');
      s.innerHTML = code.innerText;

      // Replace autolinked formatting with plaintext
      code.parentNode.replaceChild(s, code);
    })
  }
})

/**
reloads the results.
**/
var reloadResults = function() {
    $(window).hashchange();
};

$(function() {
    /**
    On tab change sets searchConfig categories property and reloads the result for selected tab.
    **/
    $('.search-results.custom-tabs .nav-tabs .nav-link').click(function(e) {
      var currentTab = $(e.currentTarget).prop('name');
      if(!window.searchConfig.segment !== currentTab) {
          window.searchConfig.segment = currentTab;
      }
      reloadResults();
    });

    $('#live-search-modal .nav-tabs .nav-link').click(function(e) {
      var currentTab = $(e.target).data('name');
      if(!window.searchConfig.segment !== currentTab) {
          window.searchConfig.segment = currentTab;
      }
      $('input[name=q]').focus();
      reloadResults();
    });

    /**
    Custom render function for live search.
    **/
   var customResultRenderFunctionLiveSearch = function(ctx, data) {
    var currentSegment = window.searchConfig.segment;
    var isAllSegment = (typeof currentSegment === 'undefined' || currentSegment === 'all_results');
    var filterSegments =  isAllSegment ? ['api_reference', 'articles'] : [currentSegment];
    var searchResults = [];
    $.each(data, function(docType, results) {
        $.each(results, function(idx, result) {
            if (result.hide_from_search !== 'true' && result.category !== 'Hidden') {
                if(filterSegments.includes(result.segment)) {
                  searchResults.push(result);
                }
            }
        });
    });
    
    function renderItem(item) {
      var segment =  item['segment'] + ": " + item['category'];
      var title = item['display_title'];
      var body = item['summary'] || item['highlight']['body'] || "";

      // Check for markdown usage in results
      body = body.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
        function (_, m1, m2, m3, m4) {
          var c = m3;
          c = c.replace(/^([ \t]*)/g, ""); // leading whitespace
          c = c.replace(/[ \t]*$/g, ""); // trailing whitespace
          c = c.replace(/:\/\//g, "~P"); // to prevent auto-linking. Not necessary in code *blocks*, but in code spans. Will be converted back after the auto-linker runs.
          return m1 + "<code>" + c + "</code>";
        }
      );

      if (item['segment'] === "api_reference") {
        segment = "api reference: " + item['api_type']
        if (item["api_type"] === "function") {
          title = item['display_title'] + "()";
        }
      } else if (typeof item['segment'] === 'undefined') {
        if (item['display_title'].startsWith('Release Notes')) {
          segment = "release notes";
        } else {
          segment = "resources";
        }
      }

      // Reformat result url to work w/ different environments
      var resultUrl = new URL(item['url']);
      var resultNewUrl = new URL(window.location.origin)
      resultNewUrl.pathname = resultUrl.pathname;
      var typeElem = $("<p></p>").addClass("type").text(segment);
      var titleElem = $("<h5></h5>").text(title);
      var bodyElem = $("<p></p>").html(body);
      var resultItem = $("<a></a>").attr("href", resultNewUrl).append(typeElem).append(titleElem).append(bodyElem);
      var listItem = $("<li></li>").append(resultItem);

      return listItem;
    }

    // TODO: make this configurable
    var numberOfHighlightResult = 3;
    var numberOfCombinedResults = 10;
    // TODO: add translation element here
    var noResultsElement = $("<h5>No Results</h5>").addClass("text-center");

    if (isAllSegment) {
      var apiReferenceHighlightResults = [];
      var articlesHighlightResults = [];
      var combinedResults = [];

      $.each(searchResults, function(idx, item) {
        if (apiReferenceHighlightResults.length < numberOfHighlightResult && item['segment'] === 'api_reference') {
          apiReferenceHighlightResults.push(item);
        }
        else if (articlesHighlightResults.length < numberOfHighlightResult && item['segment'] === 'articles') {
          articlesHighlightResults.push(item);
        }
        else if (combinedResults.length < numberOfCombinedResults) {
          combinedResults.push(item);
        }
      });

      var searchResultList = $('<ul></ul>').addClass("search-lists");
      var searchHighlightResultList = $('<ul></ul>').addClass(["search-lists", "highlighted-search"]);

      // Check the score from apiReferenceHighlightResults, articlesHighlightResults
      // Always prefer api_reference by default unless articles is not empty and has higher score
      var preferApiReference = true;
      if (articlesHighlightResults.length > 0 && apiReferenceHighlightResults.length > 0) {
        preferApiReference = articlesHighlightResults[0]['_score'] <= apiReferenceHighlightResults[0]['_score']
      }
      var primaryResult = preferApiReference ? apiReferenceHighlightResults: articlesHighlightResults;
      var secondaryResult = preferApiReference ? articlesHighlightResults: apiReferenceHighlightResults;

      $.each(primaryResult, function(idx, item) {
        ctx.registerResult(renderItem(item).appendTo(searchHighlightResultList), item);
      })
      $.each(secondaryResult, function(idx, item) {
        ctx.registerResult(renderItem(item).appendTo(searchHighlightResultList), item);
      })

      $.each(combinedResults, function(idx, item) {
        ctx.registerResult(renderItem(item).appendTo(searchResultList), item);
      })

      // TODO: no result indication
      if (apiReferenceHighlightResults.length + articlesHighlightResults.length > 0) {
        searchHighlightResultList.appendTo(ctx.list);
      }

      // TODO: no result indication
      if (combinedResults.length > 0) {
        searchResultList.appendTo(ctx.list);
      }
    }
    else {  
      var searchResultList = $('<ul></ul>').addClass("search-lists");

      $.each(searchResults, function(idx, item) {
        ctx.registerResult(renderItem(item).appendTo(searchResultList), item);
      });

      // TODO: no result indication
      if (searchResults.length > 0) {
        var page = $('#st-live-search-input').data('search-page');
        if (page < 5) {
          // TODO: add translation element here
          $("<h5>Scroll for more results</h5>").addClass("text-center").appendTo(searchResultList);
        } else {
          noResultsElement.appendTo(searchResultList);
        }
        searchResultList.appendTo(ctx.list);
      }

    }
    document.dispatchEvent(triggerEvent);
};

    /**
    Swiftype Initialization for search page search box and rendering
    **/
    const fieldsToFetch = ['display_title', 'hide_from_search', 'category','url','segment', 'summary', 'api_type'];
    const customFetchFields = {
      'api-reference': fieldsToFetch,
      'articles': fieldsToFetch,
      'recipes': fieldsToFetch,
      'videos': fieldsToFetch

    }
    /**
     * Swiftype Initialization for live search modal and input
    **/
    $('#st-search-input').focus(function() {
      $('#live-search-modal').modal('show');
      setTimeout(function() {
        $('input[name=q]').focus();
      }, 500)
    });

    /**
     On search box show modal
     **/
    $("#search-form").submit(function(event) {
      event.preventDefault();
      $('#live-search-modal').modal('show');
    });

    $('#st-search-input').blur(function() {
      $(this).val('');
    });

    /**
     When a user types into the input, we want to scroll to top in modal
     **/
    $('#st-live-search-input').on("input", throttle(function () {
      $('#live-search-modal').find('.modal-body').scrollTop(0);
    }, 500))

    $('#live-search-modal').find('.modal-body').scroll(function () {
      var modalScrollTop = $(this).scrollTop();
      var modalInnerHeight = $(this).innerHeight();
      var modalScrollHeight = $(this).prop('scrollHeight');
      var currentSegment = window.searchConfig.segment;
      var page = $('#st-live-search-input').data('search-page');
      var isAllSegment = (typeof currentSegment === 'undefined' || currentSegment === 'all_results');
      // Trigger event to query for more results
      if ((modalScrollTop + modalInnerHeight >= (modalScrollHeight - 200)) && !isAllSegment && page < 5) {
        throttle($('#st-live-search-input').trigger('liveSearch:triggerMoreResult'), 500);
      }
    })

    $('#st-live-search-input').swiftypeLiveSearch({
      engineKey: 'ybGG5yhKbpKUQQW4Dwrw', // FIXME: Switch to read from contentstack once we are happy with this implementation
      resultRenderFunction: customResultRenderFunctionLiveSearch,
      resultListSelector: '.result',
      liveSearchContainingElement: '.live-search-result',
      perPage: 10,
      highlightFields: readHighlightedFields,
      fetchFields: customFetchFields
  });

});
