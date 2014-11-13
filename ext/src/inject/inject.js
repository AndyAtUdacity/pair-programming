chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.querySelector(".CodeMirror")) {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

		var containerElem = document.querySelector(".CodeMirror");

		var observer = new MutationObserver (function(mutations) {
			// do stuff
			$('.CodeMirror-lines pre').each(function(i, elem){
				console.log($(elem).text());
			});

			// console.log('Hi!', mutations);
		})
		observer.observe(containerElem, {'childList': true, 'attributes': true, 'subtree': true});

	}
	}, 10);
});
