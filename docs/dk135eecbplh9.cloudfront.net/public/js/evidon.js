const TESTING_ENABLED = window.location.hostname.includes("localhost") || window.location.hostname.includes("robloxdev");

(function (id) {
    function append(scriptid, url, async) {
        const d = document, sn = 'script', f = d.getElementsByTagName(sn)[0];
        if (!f) f = d.head;
        const s = d.createElement(sn);
        s.async = async;
        s.id = scriptid;
        s.src = url;
        s.charset = 'utf-8';
        f.parentNode.insertBefore(s, f);
    }

    function is2parttld(value) {
        const tldindicators = ['co', 'com', 'info', 'web', 'info', 'gov', 'edu', 'biz', 'net', 'org'];
        const countryindicators = ['uk', 'us', 'fr', 'es', 'de', 'at', 'au', 'ae', 'be', 'br', 'ca', 'ch', 'cn', 'co', 'cz', 'dk', 'eg', 'eu', 'fi', 'gb', 'gr', 'hk', 'hr', 'hu', 'ie', 'in', 'jp', 'mx', 'nl', 'no', 'nz', 'pl', 'ro', 'ru', 'se'];
        return (tldindicators.indexOf(value) !== -1 || countryindicators.indexOf(value) !== -1);
    }

    function getRootDomain() {
        const parts = window.location.hostname.split('.');
        let rootDomain = "roblox";
        if (parts.length === 2) rootDomain = parts[0];
        else if (parts.length > 2) {
            // see if the next to last value is a common tld
            const part = parts[parts.length - 2];
            if (is2parttld(part)) {
                rootDomain = parts[parts.length - 3]; // go back one more
            }
            else {
                rootDomain = part;
            }
        }

        return TESTING_ENABLED ? "roblox" : rootDomain;
    }

    // Force a cookie to expire if it exists
    function setCookieToExpire(name) {
      if ($.cookie && $.cookie(name)) {
        console.log("Expiring " + name)
        document.cookie = name + '=; Path=/; Domain=' + window.location.hostname + '; Expires=Thu, 01 Jan 1900 00:00:01 GMT;';
      }
    }

    // Handle google analytics cookies
    handleGoogleAnalytics = function(opted_out) {
      const IDENTIFIER = "UA-486632-22";

      window['ga-disable-' + IDENTIFIER] = opted_out; // Enable or disable tracking

      // Hanlde opt-out logic
      if (opted_out === true) {
        // Expire existing ga cookies
        setCookieToExpire('_ga');
        setCookieToExpire('_gat');
        setCookieToExpire('_gid');
      }
      else {
        // Drop cookies using gtag
        const scriptElement = document.createElement('script');
        scriptElement.src = `https://www.googletagmanager.com/gtag/js?id=${IDENTIFIER}`;
        scriptElement.setAttribute('async', true)
        document.head.appendChild(scriptElement);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}

        gtag('js', new Date());
        gtag('config', IDENTIFIER, {
           'cookie_domain': 'developer.roblox.com'
        });
        gtag('event', 'page_view', { 'send_to': IDENTIFIER });
      }
    }

    // Handle theme cookie behavior
    handleThemeCookie = function() {
      // Only set cookie if user has accepted cookies and doesn't have a preference
      if (typeof $.cookie('theme') === 'undefined'){
        $.cookie('theme', 'light-theme', { expires: 365, path: '/' });
      }

      const codeTheme = $.cookie('theme')

      // Updates textblocks if using dark-theme
      if ($('.code-block').hasClass('dark-theme')) {
        const captionText = $('.code-block .dark-theme-icon[caption]').attr("caption");
        $('.theme-name').text(captionText);

        // Update any highlighted lines
        $('.code-block').find('.light-theme-highlight').addClass('dark-theme-highlight');
        $('.code-block').find('.light-theme-highlight').removeClass('light-theme-highlight');
      } else {
        const captionText = $('.code-block .light-theme-icon[caption]').attr("caption");
        $('.theme-name').text(captionText);

        // Update any highlighted lines
        $('.code-block').find('.dark-theme-highlight').addClass('light-theme-highlight');
        $('.code-block').find('.dark-theme-highlight').removeClass('dark-theme-highlight');
      }
    }

    window.evidon = {};
    window.evidon.id = id;
    window.evidon.test = false;  // set to true for non-production testing.
    //window.evidon.userid = '';

    const cdn = '//c.evidon.com/', rootDomain = getRootDomain(), noticecdn = cdn + 'sitenotice/';
    append('evidon-notice', noticecdn + 'evidon-sitenotice-tag.js', false);
    if (TESTING_ENABLED) {
      append('evidon-location', cdn + 'tag-fr/country.js', true);
    }
    else {
      append('evidon-location', cdn + 'geo/country.js', true);
    }
    append('evidon-themes', noticecdn + id + '/snthemes.js', true);
    if (rootDomain) append('evidon-settings', noticecdn + id + '/' + rootDomain + (window.evidon.test ? '/test' : '') + '/settings.js', true);

    window.evidon.priorConsentCallback = function (categories, vendors, cookies) {
        // add the tags which need to wait for prior consent
        // here.  This should be all your advertising tags and
        // probably most of your social and tracking tags.
        const handlers = {
            vendors: {
              'google-analytics': 'handleGoogleAnalytics',
            }
        };

        for (const vendor in vendors) {
            if (!vendors[vendor]) continue;
            const handler = window.evidon[handlers.vendors[vendor]];
            if (typeof handler === 'function') handler();
        }

        // Google analytics
        if (vendors !== undefined && (vendors['google-analytics'] || vendors.all === true || cookies.all === true)) {
      	   handleGoogleAnalytics(false);
        }
        else if (vendors !== undefined  && (vendors['google-analytics'] === undefined || vendors['google-analytics'] === null))  {
          handleGoogleAnalytics(true); // Opt-out of GA cookies
        }

        handleThemeCookie(); // Drop theme cookie as it is core to functionality
    }

    window.evidon.closeCallback = function () {
        // this is executed if the user closed a UI element without either Accepting (providing consent)
        // or Declining (declining to provide consent).
    }

    window.evidon.consentWithdrawnCallback = function () {
        // this is exeucted if the user withdraws consent and elects to
        // no longer allow technologies to run on the site.
        handleGoogleAnalytics(true);
        window.evidon.notice.dropSuppressionCookie(360);
    }

    window.evidon.consentDeclinedCallback = function () {
        // this is executed if the user explicitly declines giving consent by
        // using a Decline button
        handleGoogleAnalytics(true);
        window.evidon.notice.dropSuppressionCookie(360);
    }
})(3822);

if (TESTING_ENABLED) {
  setTimeout(function () {
    window.evidon.notice.setDomain('developer.roblox.com');
  }, 2000);
}
