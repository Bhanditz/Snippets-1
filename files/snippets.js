// Copyright (c) 2010 - 2012  John Reese
// Copyright (c) 2012 - 2017  MantisBT Team - mantisbt-dev@lists.sourceforge.net
// Licensed under the MIT license

jQuery(document).ready(function($) {
	"use strict";

	var SnippetsLangArray = null;

	/**
	 * Return MantisBT XMLHttpRequest URL for given endpoint
	 * @param {string} entrypoint
	 * @returns {string} XMLHttpRequest URL
	 */
	function xhrurl(entrypoint) {
		return "xmlhttprequest.php?entrypoint=plugin_snippets_" + entrypoint;
	}

	/**
	 * Returns requested language string.
	 * Handles retrieving language strings from the server with AJAX.
	 * @param {string} str - Language string
	 * @returns {string}
	 */
	function SnippetsLang(str) {
		if (SnippetsLangArray === null) {
			$.ajax({
				async: false,
				dataType: "json",
				url: xhrurl('text'),
				success: function(data) {SnippetsLangArray = data;}
			});
		}

		return SnippetsLangArray[str];
	}

	// Snippet list behaviors
	$("input.snippets_select_all").change(function(){
		$("input[name='snippet_list[]']").prop("checked", $(this).prop("checked"));
	});

	// Snippet pattern help
	$(".snippetspatternhelp").each(function() {
		$(this).simpletip({
			content: SnippetsLang("pattern_help"),
			baseClass: "snippetsTooltip",
			fixed: false,
			offset: [20, 20]
		});
	});

	/**
	 * Primary Snippets functionality.
	 * Use an AJAX request to retrieve the user's available snippets, and
	 * then insert select boxes into the DOM for each supported textarea.
	 */
	function SnippetsInit() {
		/**
		 * Initialize Snippets user interface.
		 * Adds a selection list before each textarea.
		 * @param {object} data - JSON object returned by XHR
		 * @param {object} data.selector - Comma-delimited list of textarea selectors
		 * @param {object} data.texts - Snippets list
		 */
		function SnippetsUI(data) {
			var textarrays = data;

			$(data.selector).each(function(index) {
				var textarea = $(this);
				var textarea_name = textarea.attr("name");

				try {
					var snippets = textarrays["texts"];
					if (snippets !== null) {
						// Create Snippets select
						var select = $("<select></select>");
						select.append("<option title='' value=''>" + SnippetsLang("default") + "</option>");

						$.each(snippets, function(key, snippet) {
							// Escape single quotes
							var value = snippet.value.replace(/'/g, "&#39;");

							select.append(
								"<option value='" + value + "' title='" + value + "'>" + snippet.name + "</option>"
							);
						});

						select.change(function() {
							var text = $(this).val();
							textarea.textrange('replace', text);
							$(this).val("");
						});

						var label = $("<label>" + SnippetsLang("label") + " </label>");
						label.append(select);

						$(this).before(label);
						$(this).before('<div class="space-4"></div>');

						$(this).parent("td").removeClass("center");
				}

				} catch(e) {
					alert(e);
				}
			});
		}

		//if we have any textareas then fetch snippets
		if ($("textarea").length > 0) {
			var bug_id = 0;

			$("form[name='bugnoteadd'] input[name='bug_id']").each(function() {
				bug_id = $(this).val();
			});
			$("form[action='bug_update.php'] input[name='bug_id']").each(function() {
				bug_id = $(this).val();
			});

			var url = xhrurl('data');
			if (bug_id > 0) {
				url += "&bug_id=" + bug_id;
			}

			$.getJSON(url, SnippetsUI);
		}
	}

	try {
		SnippetsInit();
	} catch(e) {
		alert(e);
	}

});
