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
			// $('.CodeMirror-lines pre').each(function(i, elem){
			// 	console.log($(elem).text());
			// });

			var somethingOtherThanCursorChanged = false;

			mutations.forEach(function(elem) {
				if (elem.target.className.indexOf("cursor") == -1) {
					somethingOtherThanCursorChanged = true;
				}
			});

			if (somethingOtherThanCursorChanged) {
				console.log(mutations);
			}

			// currentLine = doc.getCursor().line;
			// prevLine = doc.getLine(currentLine - 1);
			//
			// console.log(prevLine);
			// do something with text of prev line
		})
		observer.observe(containerElem, {'childList': true, 'attributes': true, 'subtree': true});

	}
	}, 10);
});
