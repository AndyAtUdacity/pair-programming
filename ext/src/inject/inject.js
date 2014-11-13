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
			// do stuff
			if (!discussionsElemRemoved){
				var headings = $('h3:contains("iscussions")');
				var discussionsHeading = headings[0];
				codeTipsDiv = $(discussionsHeading).parent()
				$(codeTipsDiv).empty();
				$(codeTipsDiv).attr('id','code-tips');
				$(codeTipsDiv).append('<h3>Python Tips</h3>');
				$(codeTipsDiv).append('<div class="alert alert-danger code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">If you want to define a function you need to end the line with a colon.</span></div>');
				$(codeTipsDiv).append('<div class="alert alert-warning code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">You wrote <code>"5"</code> but may want <code>5</code>. Remove the quotes if you want to use the number 5.</span></div>');
				$(codeTipsDiv).append('<div class="alert alert-info code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">If you want to iterate over the items in your list, you can just write <pre>for item in list:<br>  print item</pre></span></div>');
			}

			$('.CodeMirror-lines pre').each(function(i, elem){
				// console.log($(elem).text());
			});

			// console.log('Hi!', mutations);
		})
		observer.observe(containerElem, {'childList': true, 'attributes': true, 'subtree': true});

	}
	}, 10);
});