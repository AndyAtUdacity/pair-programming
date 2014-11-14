chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.querySelector(".CodeMirror") && $('div.col-xs-3:contains("iscussions")').length) {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

		var containerElem = document.querySelector(".CodeMirror");
		var discussionsElemRemoved = false;

		var headings = $('h3:contains("iscussions")');
		var discussionsHeading = headings[0];
		var codeTipsDiv = $(discussionsHeading).parent();
		var observer = new MutationObserver (function(mutations) {
			// $('.CodeMirror-lines pre').each(function(i, elem){
			// 	console.log($(elem).text());
			// });

			// var somethingOtherThanCursorChanged = false;
			//
			// mutations.forEach(function(elem) {
			// 	if (elem.target.className.indexOf("cursor") === -1) {
			// 		somethingOtherThanCursorChanged = true;
			// 	}
			// });
			//
			// if (somethingOtherThanCursorChanged) {
			// 	console.log(mutations);
			// }

			var analyzeLine = function (preElement) {
				// do something
				var message;

				var text = preElement.text();
				var textTrim = text.trim();

				if (text.slice(0,3) === 'def' && textTrim.slice(-1) !== ':') {
					message = {
						"level": "danger",
						"message": "If you want to define a function you need to end the line with a colon."
					};
					console.log("set message");
				}

				if (message) {
					console.log("adding tip");
					addTipForLine(preElement, message);
				}
			}

			var addTipForLine = function (line, message) {
				// $(codeTipsDiv).append('<div class="alert alert-danger code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">If you want to define a function you need to end the line with a colon.</span></div>');
				// $(codeTipsDiv).append('<div class="alert alert-warning code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">You wrote <code>"5"</code> but may want <code>5</code>. Remove the quotes if you want to use the number 5.</span></div>');
				// $(codeTipsDiv).append('<div class="alert alert-info code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">If you want to iterate over the items in your list, you can just write <pre>for item in list:<br>  print item</pre></span></div>');
				codeTipsDiv.append('<div class="alert alert-' + message.level + ' code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">' + message.message + '</span></div>');
				console.log('was here');
			}

			// do stuff
			if (!discussionsElemRemoved){

				codeTipsDiv.empty();
				console.log('emptying');
				codeTipsDiv.attr('id','code-tips');
				codeTipsDiv.append('<h3>Python Tips</h3>');
				// $(codeTipsDiv).append('<div class="alert alert-danger code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">If you want to define a function you need to end the line with a colon.</span></div>');
				// $(codeTipsDiv).append('<div class="alert alert-warning code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">You wrote <code>"5"</code> but may want <code>5</code>. Remove the quotes if you want to use the number 5.</span></div>');
				// $(codeTipsDiv).append('<div class="alert alert-info code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">If you want to iterate over the items in your list, you can just write <pre>for item in list:<br>  print item</pre></span></div>');
			}

			$('.CodeMirror-lines pre').each(function(i, elem){
				// var text = $(elem).text();
				// var textTrim = text.trim();
				// if ($(elem).offset().top === $('.CodeMirror-cursor').offset().top) {
				// 	console.log( text );
				// }
				//
				// if (text.slice(0,3) === 'def' && textTrim.slice(-1) !== ':') {
				// 	console.log('NOO!!!');
				// }

				console.log("analyzing line");
				analyzeLine($(elem));
			});

		})
		observer.observe(containerElem, {'childList': true, 'attributes': true, 'subtree': true});

	}
	}, 10);
});
