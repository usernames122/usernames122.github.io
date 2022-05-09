var BACKSPACE_KEY = 8;
var DELETE_KEY = 46;
var SHIFT_KEY = 16;
var ARROW_LEFT_KEY = 37;
var ARROW_UP_KEY = 38;
var ARROW_DOWN_KEY = 40;
var ESCAPE_KEY = 27;

(function ($) {
  // utilities
  var queryParser = function (a) {
      var i, p, b = {};
      if (a === "") {
        return {};
      }
      for (i = 0; i < a.length; i += 1) {
        p = a[i].split('=');
        if (p.length === 2) {
          b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
      }
      return b;
    };
  $.queryParams = function () {
    return queryParser(window.location.search.substr(1).split('&'));
  };
  $.hashParams = function () {
    return queryParser(window.location.hash.substr(1).split('&'));
  };

  
	// simple client-side LRU Cache, based on https://github.com/rsms/js-lru
	function LRUCache(limit) {
	  this.size = 0;
	  this.limit = limit;
	  this._keymap = {};
	}

  LRUCache.prototype.put = function (key, value) {
    var entry = {
      key: key,
      value: value
    };
    this._keymap[key] = entry;
    if (this.tail) {
      this.tail.newer = entry;
      entry.older = this.tail;
    } else {
      this.head = entry;
    }
    this.tail = entry;
    if (this.size === this.limit) {
      return this.shift();
    } else {
      this.size++;
    }
  };

  LRUCache.prototype.shift = function () {
    var entry = this.head;
    if (entry) {
      if (this.head.newer) {
        this.head = this.head.newer;
        this.head.older = undefined;
      } else {
        this.head = undefined;
      }
      entry.newer = entry.older = undefined;
      delete this._keymap[entry.key];
    }
    return entry;
  };

  LRUCache.prototype.get = function (key, returnEntry) {
    var entry = this._keymap[key];
    if (entry === undefined) return;
    if (entry === this.tail) {
      return entry.value;
    }
    if (entry.newer) {
      if (entry === this.head) this.head = entry.newer;
      entry.newer.older = entry.older;
    }
    if (entry.older) entry.older.newer = entry.newer;
    entry.newer = undefined;
    entry.older = this.tail;
    if (this.tail) this.tail.newer = entry;
    this.tail = entry;
    return returnEntry ? entry : entry.value;
  };

  LRUCache.prototype.remove = function (key) {
    var entry = this._keymap[key];
    if (!entry) return;
    delete this._keymap[entry.key];
    if (entry.newer && entry.older) {
      entry.older.newer = entry.newer;
      entry.newer.older = entry.older;
    } else if (entry.newer) {
      entry.newer.older = undefined;
      this.head = entry.newer;
    } else if (entry.older) {
      entry.older.newer = undefined;
      this.tail = entry.older;
    } else {
      this.head = this.tail = undefined;
    }

    this.size--;
    return entry.value;
  };

  LRUCache.prototype.clear = function () {
    this.head = this.tail = undefined;
    this.size = 0;
    this._keymap = {};
  };

  if (typeof Object.keys === 'function') {
    LRUCache.prototype.keys = function () {
      return Object.keys(this._keymap);
    };
  } else {
    LRUCache.prototype.keys = function () {
      var keys = [];
      for (var k in this._keymap) keys.push(k);
      return keys;
    };
  }

  window.Swiftype = window.Swiftype || {};
  Swiftype.root_url = Swiftype.root_url || 'https://api.swiftype.com';
  Swiftype.pingUrl = function(endpoint, callback) {
    var to = setTimeout(callback, 350);
    var img = new Image();
    img.onload = img.onerror = function() {
      clearTimeout(to);
      callback();
    };
    img.src = endpoint;
    return false;
  };
  Swiftype.pingSearchResultClick = function (engineKey, docId, queryOverride, callback) {
    // Use strict comparison for queryOverride in case someone tries to query true/false
    var params = {
      t: new Date().getTime(),
      engine_key: engineKey,
      doc_id: docId,
      q: queryOverride !== null ? queryOverride : Swiftype.currentQuery
    };
    var url = Swiftype.root_url + '/api/v1/public/analytics/pc.json?' + $.param(params);
    Swiftype.pingUrl(url, callback);
  };
  Swiftype.htmlEscape = Swiftype.htmlEscape || function htmlEscape(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  // implementation
  var ident = 0;

  $.fn.swiftypeLiveSearch = function (options) {
    var options = $.extend({}, $.fn.swiftypeLiveSearch.defaults, options);

    return this.each(function () {
      var $this = $(this);
      var config = $.meta ? $.extend({}, options, $this.data()) : options;

      $this.attr('autocomplete', 'off');
      $this.data('swiftype-config-livesearch', config);
      $this.data('search-page', 1);
      $this.data('autocomplete-history',  new Set());
      $this.submitted = false;
      $this.cache = new LRUCache(10);
      $this.pageCache = {};
      $this.emptyQueries = [];

      $this.isEmpty = function(query) {
        return $.inArray(normalize(query), this.emptyQueries) >= 0
      };

      $this.addEmpty = function(query) {
        $this.emptyQueries.unshift(normalize(query));
      };

      var styles = config.dropdownStylesFunction($this);
      var $swiftypeWidget = $('<div class="' + config.widgetContainerClass + '" />');
      var $listContainer = $('<div />').addClass(config.liveSearchListClass).appendTo($swiftypeWidget).css(styles);
      $swiftypeWidget.appendTo(config.liveSearchContainingElement);
      var $list = $('<' + config.liveSearchListType + ' />').appendTo($listContainer);

      $this.data('swiftype-list', $list);

      $this.abortCurrent = function() {
        if ($this.currentRequest) {
          $this.currentRequest.abort();
        }
      };

      $this.showNoResults = function () {
        $list.empty();
        if (typeof config.noResultsMessage !== 'undefined') {
          $list.append($('<li />', { 'class': config.noResultsClass }).text(config.noResultsMessage));
        }
      };

      $this.focused = function() {
        return $this.is(':focus');
      };

      $this.submitting = function() {
        $this.submitted = true;
      };

      $this.listResults = function() {
        return $(config.resultListSelector, $list).filter(':not(.' + config.noResultsClass + ')');
      };

      $this.activeResult = function() {
        return $this.listResults().filter('.' + config.activeItemClass).first();
      };

      $this.selectedCallback = function (data) {
        return function (e) {
          var $el = $(this);
          e.preventDefault();
          // Go through all the autocomplete parts that resulted in this click
          // Record a document id per part so we don't have missing clicks
          $this.data('autocomplete-history').forEach( function (part) {
            if (part != $this.val()) {
              Swiftype.pingSearchResultClick(config.engineKey, data['id'], part, function () {
                // Empty callback
                return;
              })
            }
          });
          // The final search result will always get recorded so we skip it in previous loop
          Swiftype.pingSearchResultClick(config.engineKey, data['id'], null, function() {
            config.onComplete($el);
          });
        };
      };

      $this.registerResult = function($element, data) {
        $element.data('swiftype-item', data);
        $('a', $element).click($this.selectedCallback(data));
      };

      $this.getContext = function() {
        return {
          config: config,
          list: $list,
          registerResult: $this.registerResult
        };
      };

      $this.on('liveSearch:triggerMoreResult', function() {
        searchMoreData($this);
      })

      var typingDelayPointer;
      var suppressKey = false;
      $this.lastValue = '';
      $this.keyup(function (event) {
        if (suppressKey) {
          suppressKey = false;
          return;
        }

        // ignore arrow keys, shift
        if (((event.which >= ARROW_LEFT_KEY) && (event.which <= ARROW_DOWN_KEY)) || (event.which == SHIFT_KEY)) return;

        if (config.typingDelay > 0) {
          clearTimeout(typingDelayPointer);
          typingDelayPointer = setTimeout(function () {
            processInput($this);
          }, config.typingDelay);
        } else {
          processInput($this);
        }

        // Clear history when user hits backspace or press delete and input is empty
        // after key up we will record deleting characters if there was a typo
        if (event.which === BACKSPACE_KEY || event.which === DELETE_KEY) {
          if ($this.val() === '') {
            $this.data('autocomplete-history', new Set());
          }
        }
      });

      // immediately update result list when user switches filter fab
      $(window).hashchange(function() {
        processInput($this, true);
      })

      $this.styleDropdown = function() {
        $listContainer.css(config.dropdownStylesFunction($this));
      };

      $(window).resize(function (event) {
        $this.styleDropdown();
      });

      $this.keydown(function (event) {
        $this.styleDropdown();
        // enter = 13; up = 38; down = 40; esc = 27
        var $active = $this.activeResult();
        switch (event.which) {
          case 13:
            if (($active.length !== 0) && ($list.is(':visible'))) {
              event.preventDefault();
              $this.selectedCallback($active.data('swiftype-item'))();
            } else if ($this.currentRequest) {
              $this.submitting();
            }
            suppressKey = true;
            break;
          case ARROW_UP_KEY:
            event.preventDefault();
            if ($active.length === 0) {
              $this.listResults().last().addClass(config.activeItemClass);
            } else {
              $this.prevResult();
            }
            break;
          case ARROW_DOWN_KEY:
            event.preventDefault();
            if ($active.length === 0) {
              $this.listResults().first().addClass(config.activeItemClass);
            } else if ($active != $this.listResults().last()) {
              $this.nextResult();
            }
            break;
          case ESCAPE_KEY:
            suppressKey = true;
            break;
          default:
            $this.submitted = false;
            break;
          }
        });

      // opera wants keypress rather than keydown to prevent the form submit
      $this.keypress(function (event) {
        if ((event.which == 13) && ($this.activeResult().length > 0)) {
          event.preventDefault();
        }
      });

      // stupid hack to get around loss of focus on mousedown
      var mouseDown = false;
      var blurWait = false;
      $(document).bind('mousedown.swiftype' + ++ident, function () {
        mouseDown = true;
      });
      $(document).bind('mouseup.swiftype' + ident, function () {
        mouseDown = false;
        if (blurWait) {
          blurWait = false;
        }
      });
      $this.blur(function () {
        if (mouseDown) {
          blurWait = true;
        }
      });
      $this.focus(function () {
        setTimeout(function() { $this.select() }, 10);
      });
    });
  };

  var normalize = function(str) {
    return $.trim(str).toLowerCase();
  };

  var callRemote = function ($this, term, cached, page) {
    // Find the locale code the user has
    var currentPath = window.location.href;
    let locale = currentPath.match(/\/([\w]{2})-([\w]{2})/)[0];
    if (locale == undefined || locale == null || locale.length < 4) {
      locale = "en-us";
    }
    else {
      locale = locale.replace(/\//g, ''); // Remove slashes if existing in the locale code
    }

    Swiftype.currentQuery = term;

    var params = {},
      config = $this.data('swiftype-config-livesearch');
    params['q'] = term;
    params['engine_key'] = config.engineKey;
    // params['search_fields'] = handleFunctionParam(config.searchFields);
    params['fetch_fields'] = handleFunctionParam(config.fetchFields);
    params['filters'] = handleFunctionParam(config.filters);
    params['filters']['api-reference'] = { locale: locale }
    params['filters']['articles'] = { locale: locale }
    params['filters']['recipes'] = { locale: locale }
    params['filters']['videos'] = { locale: locale }
    // params['document_types'] = handleFunctionParam(config.documentTypes);
    // params['functional_boosts'] = handleFunctionParam(config.functionalBoosts);
    // params['sort_field'] = handleFunctionParam(config.sortField);
    // params['sort_direction'] = handleFunctionParam(config.sortDirection);
    params['per_page'] = config.perPage;
    params['highlight_fields'] = handleFunctionParam(config.highlightFields);
    params['spelling'] = config.spelling;
    if (page) {
      params['page'] = page
    }

    var mergeObject = function (original, additional) {
      var newResults = {}
      Object.keys(original).forEach( function (key) {
        newResults[key] = original[key].concat(additional[key])
      })
      return newResults
    }

    var endpoint = Swiftype.root_url + '/api/v1/public/engines/search.json';
    $this.currentRequest = $.ajax({
      type: 'GET',
      dataType: 'jsonp',
      url: endpoint,
      data: params
    }).done(function(data) {
      var cachedRecords = {};
      var norm = normalize(term);
      if (cached) {
        cachedRecords = mergeObject(cached, data.records);
        $this.cache.put(norm, cachedRecords);
      } else if (data.record_count > 0) {
        cachedRecords = data.records;
        $this.cache.put(norm, data.records);
      } else {
        $this.addEmpty(norm);
        $this.showNoResults();
        return;
      }
      processData($this, cachedRecords, term);
    });
  };

  var getResults = function($this, term, append) {
    var norm = normalize(term);
    if ($this.isEmpty(norm)) {
      $this.showNoResults();
      return;
    }
    var cached = $this.cache.get(norm);
    // Get the current page offset
    if (!$this.pageCache[norm]) {
      $this.pageCache[norm] = 1
      $this.data('search-page', $this.pageCache[norm]);
    }
    var lastPage = $this.pageCache[norm];
    // We won't query anymore if the user has to scroll past 50 results and only if we're appending
    if (cached && append && lastPage !== 5) {
      callRemote($this, term, cached, lastPage);
      $this.pageCache[norm] += 1;
      $this.data('search-page', $this.pageCache[norm]);
    } else if (cached) {
      processData($this, cached);
    } else {
      callRemote($this, term);
    }
  };

  // private helpers
  var processInput = function ($this, forceProcess, append) {
      var term = $this.val();
      if (!forceProcess && term === $this.lastValue) {
        return;
      }
      $this.lastValue = term;
      if ($.trim(term) === '') {
        $this.data('swiftype-list').empty()
        return;
      }
      if (typeof $this.data('swiftype-config-livesearch').engineKey !== 'undefined') {
        var autocompleteHistory = $this.data('autocomplete-history');
        autocompleteHistory.add(term);
        $this.data('autocomplete-history', autocompleteHistory);
        if (append) {
          getResults($this, term, append);
        } else {
          getResults($this, term);
        }
      }
    };

  var searchMoreData = function ($this) {
    // create a new search and append
    processInput($this, true, true);
  }

  var processData = function ($this, data) {
      var $list = $this.data('swiftype-list'),
        config = $this.data('swiftype-config-livesearch');

      $list.empty();
      
      config.resultRenderFunction($this.getContext(), data);
    };

  var defaultFilters = {
    'api-reference': {
      'locale': 'en-us'
    },
    'articles': {
      'locale': 'en-us'
    },
    'recipes': {
      'locale': 'en-us'
    },
    'videos': {
      'locale': 'en-us'
    },
  };

  var defaultResultRenderFunction = function(ctx, results) {
    var $list = ctx.list,
      config = ctx.config;

    $.each(results, function(document_type, items) {
      $.each(items, function(idx, item) {
        ctx.registerResult($('<li>' + config.renderFunction(document_type, item) + '</li>').appendTo($list), item);
      });
    });
  };

  var defaultRenderFunction = function(document_type, item) {
    return '<p class="title">' + Swiftype.htmlEscape(item['title']) + '</p>';
  };

  var defaultOnComplete = function(elem) {
    window.location = elem.attr('href');
  };

  var defaultDropdownStylesFunction = function($this) {
    return {};
  };

  var handleFunctionParam = function(field) {
    if (field !== undefined) {
      var evald = field;
      if (typeof evald === 'function') {
        evald = evald.call();
      }
      return evald;
    }
    return undefined;
  };

  $.fn.swiftypeLiveSearch.defaults = {
    activeItemClass: 'active',
    attachTo: undefined,
    documentTypes: undefined,
    filters: defaultFilters,
    engineKey: undefined,
    searchFields: undefined,
    functionalBoosts: undefined,
    sortField: undefined,
    sortDirection: undefined,
    fetchFields: undefined,
    highlightFields: undefined,
    noResultsClass: 'noResults',
    noResultsMessage: undefined,
    onComplete: defaultOnComplete,
    resultRenderFunction: defaultResultRenderFunction,
    renderFunction: defaultRenderFunction,
    dropdownStylesFunction: defaultDropdownStylesFunction,
    perPage: undefined,
    liveSearchListType: 'ul',
    liveSearchListClass: 'liveSearch',
    resultListSelector: 'li',
    setWidth: true,
    typingDelay: 80,
    liveSearchContainingElement: 'body',
    widgetContainerClass: 'swiftype-widget',
    spelling: 'retry'
  };

})(jQuery);
