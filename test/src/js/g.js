
define('g', [
	'tui/cookie'
], function(Cookie, require, exports) {
    require("components/autocomplete/autocompleteApp");
    require("views/commons/nav/rolesNav/rolesNavApp");
	exports.init = function() {
		console.log('global init');
	};

});

require(['g'], function() {});
