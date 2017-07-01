(function($) {
	
	$(document).on( 'click', '.nav-tab-wrapper a', function() {
		var $section = $('section');
		$section.hide();
		$section.eq($(this).index()).show();
		return false;
	})
	
})( jQuery ); 
