// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// Because sometimes you need to style the cursor's line.
//
// Adds an option 'styleActiveLine' which, when enabled, gives the
// active line's wrapping <div> the CSS class "CodeMirror-activeline",
// and gives its background <div> the class "CodeMirror-activeline-background".

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  var WRAP_CLASS = "CodeMirror-activeline";
  var BACK_CLASS = "CodeMirror-activeline-background";

  CodeMirror.defineOption("styleActiveLine", false, function(cm, val, old) {
    var prev = old && old != CodeMirror.Init;
    if (val && !prev) {
      cm.state.activeLines = [];
      updateActiveLines(cm, cm.listSelections());
      cm.on("beforeSelectionChange", selectionChange);
    } else if (!val && prev) {
      cm.off("beforeSelectionChange", selectionChange);
      clearActiveLines(cm);
      delete cm.state.activeLines;
    }
  });

  function clearActiveLines(cm) {
    for (var i = 0; i < cm.state.activeLines.length; i++) {
	  var lineText = cm.state.activeLines[i]['text'].trim();
	  displaySuggestion(lineText);
      cm.removeLineClass(cm.state.activeLines[i], "wrap", WRAP_CLASS);
      cm.removeLineClass(cm.state.activeLines[i], "background", BACK_CLASS);
    }
  }

  function sameArray(a, b) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; i++)
      if (a[i] != b[i]) return false;
    return true;
  }

  function updateActiveLines(cm, ranges) {
    var active = [];
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      if (!range.empty()) continue;
      var line = cm.getLineHandleVisualStart(range.head.line);
      if (active[active.length - 1] != line) active.push(line);
    }
    if (sameArray(cm.state.activeLines, active)) return;
    cm.operation(function() {
      clearActiveLines(cm);
      for (var i = 0; i < active.length; i++) {
        var lineText = active[i]['text'].trim();
        cm.addLineClass(active[i], "wrap", WRAP_CLASS);
        cm.addLineClass(active[i], "background", BACK_CLASS);
      }
      cm.state.activeLines = active;
    });
  }

  function selectionChange(cm, sel) {
    updateActiveLines(cm, sel.ranges);
  }
});

function displaySuggestion(lineText) {
	var cases = [
		{
			'name'    : 'no colon after function definition',
			'trigger' : lineText.indexOf('def') == 0 && lineText.indexOf(':') != lineText.length-1,
			'suggestion' : 'If you want to define a function you need to end the line with a colon!'
		},
		{
			'name'    : 'tried to use a capitalized Python built-in',
			'trigger' : attemptedToUseBuiltIn(lineText),
			'suggestion' : "You wrote " + attemptedToUseBuiltIn(lineText) + " but Python doesn't understand. Try rewriting it in lowercase."
		},
		{
			'name'    : 'tried to use a string for a number',
			'trigger' : triedToUseStringForNumber(lineText),
			'suggestion' : 'You wrote ' + triedToUseStringForNumber(lineText) + ' in the previous line. The quotation marks are interpreted as a string by Python. If you want a number you need to get rid of the quotes!'
		},
		{
			'name'    : '',
			'trigger' : '',
			'suggestion' : ''
		}
		];
	var kase, name, trigger, suggestion;
	for (var i=0; i<cases.length; i++){
		kase = cases[i];
		name = kase['name'];
		trigger = kase['trigger'];
		suggestion = kase['suggestion'];
		if (trigger){
			console.log(name);
			alert(suggestion);
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

