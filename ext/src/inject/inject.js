var errorModel = [];

chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.querySelector(".CodeMirror") && $('div.col-xs-3:contains("iscussions")').length) {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		// console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

		var containerElem = document.querySelector(".CodeMirror");
		var discussionsElemRemoved = false;

		var headings = $('h3:contains("iscussions")');
		var discussionsHeading = headings[0];
		var codeTipsDiv = $(discussionsHeading).parent();
		codeTipsDiv.empty();
		codeTipsDiv.attr('id','code-tips');
		codeTipsDiv.append('<h3>Python Tips</h3>');
		var cursorOffset;
		var oldCursorOffset;

		var observer = new MutationObserver (function(mutations) {
			cursorOffset = $('.CodeMirror-cursor').offset().top;
			/*
			What we want for errors:

			List of errors ordered by recency
				- pointer to <pre>
				- level
				- message
			*/

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
					errorModel.push({
						pre: preElement,
						message: message
					});
				}
			}

			var addTipForLine = function (error) {
				var message = error.message;
				// $(codeTipsDiv).append('<div class="alert alert-danger code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">If you want to define a function you need to end the line with a colon.</span></div>');
				// $(codeTipsDiv).append('<div class="alert alert-warning code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">You wrote <code>"5"</code> but may want <code>5</code>. Remove the quotes if you want to use the number 5.</span></div>');
				// $(codeTipsDiv).append('<div class="alert alert-info code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">If you want to iterate over the items in your list, you can just write <pre>for item in list:<br>  print item</pre></span></div>');

				codeTipsDiv.append('<div class="alert alert-' + message.level + ' code-tip alert-dismissible" style="font-size:13px"><div class="close-button"><span class="glyphicon glyphicon-remove"></span></div><span class="suggestion">' + message.message + '</span></div>');
			}
			var colorizePre = function(error) {
				var pre = error.pre;
				var level = error.message.level;
				var levelToColor = {
					'danger' : '#ffdfdf',
					'warning': '#fff5ca',
					'info'   : '#e1f6ff',
					'none'   : 'white'
				}
				var colorHex = levelToColor[level];
				$(pre).parent().css({backgroundColor: colorHex});
			}
			if (cursorOffset != oldCursorOffset){
				codeTipsDiv.empty();
				codeTipsDiv.append('<h3>Python Tips</h3>');
				errorModel = []
				$('.CodeMirror-lines pre').each(function(i, elem){
					// colorizePre({
					// 	pre: elem,
					// 	message: {
					// 		level: 'none'
					// 	}
					// })
					displaySuggestion($(elem));
				});
				var error;
				for (var i=0; i<errorModel.length; i++){
					error = errorModel[i];
					addTipForLine(error);
					colorizePre(error);
				}
			}
			// this was needed to prevent the pre from becoming uncolorized
			// when navigating the cursor around a line.
			// else {
			// 	for (var i=0; i<errorModel.length; i++){
			// 		error = errorModel[i];
			// 		colorizePre(error);
			// 	}
			// }
			oldCursorOffset = cursorOffset;
		})
		observer.observe(containerElem, {'childList': true, 'attributes': true, 'subtree': true});

	}
	}, 10);
});

function displaySuggestion(preElement) {
	var text = preElement.text();
	var lineText = text.trim();
	var cases = [
		{
			'name'    : 'no colon after function definition',
			'trigger' : lineText.indexOf('def') == 0 && lineText.indexOf(':') != lineText.length-1,
			'suggestion' : 'If you want to define a function you need to end the line with a colon!',
			'level'   : 'danger'
		},
		{
			'name'    : 'tried to use a capitalized Python built-in',
			'trigger' : attemptedToUseBuiltIn(lineText),
			'suggestion' : "You wrote " + attemptedToUseBuiltIn(lineText) + " but Python doesn't understand. Try rewriting it in lowercase.",
			'level'   : 'danger'
		},
		{
			'name'    : 'tried to use a string for a number',
			'trigger' : triedToUseStringForNumber(lineText),
			'suggestion' : 'You wrote ' + triedToUseStringForNumber(lineText) + ' in the previous line. The quotation marks are interpreted as a string by Python. If you want a number you need to get rid of the quotes!',
			'level'   : 'warning'
		},
		{
			'name'    : '',
			'trigger' : '',
			'suggestion' : '',
			'level'   : 'none'
		}
		];
	var kase, name, trigger, suggestion;
	for (var i=0; i<cases.length; i++){
		kase = cases[i];
		name = kase['name'];
		trigger = kase['trigger'];
		suggestion = kase['suggestion'];
		level = kase['level']
		if (trigger){
			console.log(name);
			errorModel.push({
				pre: preElement,
				message : {
					message : suggestion,
					level: level
				}
			});
		}
	}
};

function attemptedToUseBuiltIn(lineText){
	var words = lineText.split(/[ ]+/);
	var word;
	var wordIndex;
	for (var i=0; i<words.length; i++){
		word = words[i];
		if (word.length >= 3 && word.toLowerCase() != word) {
			wordIndex = pythonBuiltIns.indexOf(word.toLowerCase());
			if (wordIndex > -1){
				return word;
			}
		}
	}
	return false
}

function triedToUseStringForNumber(lineText){
	var words = lineText.split(/[ ]+/);
	var word, wordIndex, potentialNumber;
	for (var i=0; i<words.length; i++){
		word = words[i];
		if (word.length >= 3 && word[0] == word[word.length-1]) {
			if (word[0] == '"' || word[0] == "'"){
				potentialNumber = word.slice(1,word.length-1);
				if (!isNaN(potentialNumber)){
					return word;
				}
			}
		}
	}
	return false
}

var pythonBuiltIns = ['abs', 'all', 'any', 'apply',
  'basestring', 'bin', 'bool', 'buffer', 'bytearray', 'bytes', 'callable',
  'chr', 'classmethod', 'cmp', 'coerce', 'compile', 'complex', 'copyright',
  'credits', 'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'execfile',
  'exit', 'file', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals',
  'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int', 'intern', 'isinstance',
  'issubclass', 'iter', 'len', 'license', 'list', 'locals', 'long', 'map', 'max',
  'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print',
  'property', 'quit', 'range', 'raw_input', 'reduce', 'reload', 'repr', 'reversed',
  'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum',
  'super', 'tuple', 'type', 'unichr', 'unicode', 'vars', 'xrange', 'zip']

