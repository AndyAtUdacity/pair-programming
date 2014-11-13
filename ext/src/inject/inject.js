chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.querySelector(".CodeMirror") && $('div.col-xs-3:contains("iscussions")')) {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

		var containerElem = document.querySelector(".CodeMirror");
		var discussionsElemRemoved = false;
		var codeTipsDiv;
		var observer = new MutationObserver (function(mutations) {
			// $('.CodeMirror-lines pre').each(function(i, elem){
			// 	console.log($(elem).text());
			// });

			var somethingOtherThanCursorChanged = false;

			mutations.forEach(function(elem) {
				if (elem.target.className.indexOf("cursor") == -1) {
					somethingOtherThanCursorChanged = true;
				}

			// do stuff
			if (!discussionsElemRemoved){
				var headings = $('h3:contains("iscussions")');
				var discussionsHeading = headings[0];
				codeTipsDiv = $(discussionsHeading).parent()
				$(codeTipsDiv).empty();
				$(codeTipsDiv).attr('id','code-tips');
				$(codeTipsDiv).append('<h3>Python Tips</h3>');
			}

			$('.CodeMirror-lines pre').each(function(i, elem){
				// console.log($(elem).text());
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
