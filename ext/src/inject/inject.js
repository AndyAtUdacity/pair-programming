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
		$('a:contains("Report an issue")').remove();
		$('#staff-issues').remove();
		$('a:contains("Edit")').remove();
		$('a:contains("Manage")').remove();
		var observer = new MutationObserver (function(mutations) {
			cursorOffset = $('.CodeMirror-cursor').offset().top;

			var addTipForLine = function (error) {
				var message = error.message;
				codeTipsDiv.append('<div class="alert alert-' + message.level + ' code-tip alert-dismissible" style="font-size:13px"><span class="suggestion">' + message.message + '</span></div>');
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
					displaySuggestion($(elem));
				});
				var error;
				for (var i=0; i<errorModel.length; i++){
					error = errorModel[i];
					addTipForLine(error);
					colorizePre(error);
				}
			}
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
			'name'    : 'used a lowercase true',
			'trigger' : lineText.indexOf('true') != -1,
			'suggestion' : 'You wrote "true". If you intended to use the Python boolean, make sure you change it to "True".',
			'level'   : 'warning'
		},
		{
			'name'    : 'used a lowercase false',
			'trigger' : lineText.indexOf('false') != -1,
			'suggestion' : 'You wrote "false". If you intended to use the Python boolean, make sure you change it to "False".',
			'level'   : 'warning'
		},
		{
			'name'    : 'could use a better for loop',
			'trigger' : lineText.indexOf('for') == 0 && lineText.indexOf('in') != -1 && lineText.indexOf('range') != -1 && lineText.indexOf('len') != -1,
			'suggestion' : 'Did you know you can iterate directly over the items in a list? Try: <pre>for item in myList:<br>    print item</pre>',
			'level'   : 'info'
		},
		{
			'name'    : 'no colon after loop',
			'trigger' : (lineText.indexOf('while') == 0 || lineText.indexOf('if') == 0) && lineText.indexOf(':') != lineText.length-1,
			'suggestion' : "Python won't understand your loop unless you end the line with a colon.",
			'level'   : 'danger'
		}
		// {
		// 	'name'    : 'bad function parameters',
		// 	'trigger' : functionHasBadParameters(lineText),
		// 	'suggestion' : "The parameters of your function can't include "+functionHasBadParameters(lineText)+'.',
		// 	'level'   : 'danger'
		// }
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

// function functionHasBadParameters(lineText){
// 	var myRe = new RegExp('/\(.*\)/');
// 	var params = lineText.match(myRe);
// 	if (!params){
// 		return false;
// 	}
// 	params = params[0];
// 	var badChars = ['@','#','$','%','^','&', ' * ', '==']
// 	if (lineText.indexOf('def') == 0 && lineText.indexOf(':') == lineText.length-1){
// 		var badCharsUsed = '';
// 		for (var i=0; i < badChars.length; i++){
// 			if (params.indexOf(badChars[i] != -1)) {
// 				badCharsUsed += badChars[i]+' ';
// 			}
// 		}
// 		return badCharsUsed;
// 	}
// 	else{
// 		return false;
// 	}
// }

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

