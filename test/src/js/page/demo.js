
require( function() {
	// G.init();

	var testStr = require.text('./test1.tpl');

	require(['tui/class'], function(Class) {
		Class.init();
	});
	require(['tui/cookie'], function(Cookie) {
	});
	require(['g'], function(G) {
	});
});
