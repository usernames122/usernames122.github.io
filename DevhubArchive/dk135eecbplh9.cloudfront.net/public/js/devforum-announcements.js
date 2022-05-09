// Try the /get-rss endpoint if blocked by CORS
// url: String - url that was queried
// reason: String - reason to log on failure
function fallback(url, reason) {
  if (url == "/get-rss") {
    $('.recent-announcements .loader').addClass('d-none');
    console.log("loadAnnouncements error: " + reason)
  } else {
    console.log("loadAnnouncements error: " + reason + " trying again with /get-rss")
    loadAnnouncements("/get-rss");
  }
}

// Populate Recent Announcements with results from devforum
// url: String - url to query for RSS feed
function loadAnnouncements(url) {
  try {
    $.ajax({
      type: "GET",
      url: url,
      success: function(data) {
        $('.recent-announcements .loader').addClass('d-none');
        var rssCount = $('.recent-announcements').attr('rss-count')
        if (data.topic_list !== undefined && data.topic_list != null) {
          const topics = data.topic_list.topics;
          if (topics && topics.length > 0) {
            for (let i = 0; i < rssCount; i++) {
              const topicId = topics[i].id;
              const topicLink = `https://devforum.roblox.com/t/${topicId}`;
              
              const topicTitle = topics[i].title;

              const rssList = '<li>' +
                '<a target="_blank" href=' + topicLink + '>' + topicTitle + '</a></li>'
              $('.recent-announcements').append(rssList)
            }
          }
        }
      },
      error: function (xhr, status) {
        fallback(url, status);
      },
      failure: function(error) {
        fallback(url, error);
      }
    });
  } catch (e) {
    fallback(url, e);
  }
}



// Run when the document is ready
document.addEventListener("DOMContentLoaded", function() {
  loadAnnouncements("https://devforum.roblox.com/c/36.json");
});
