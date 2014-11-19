$(function() {
	$( ".toggle" ).click(function() {
		var id = $(this).attr('id');
		$('.target-' + id ).toggle( "slow", function() {
			// Animation complete.
		});
	});
});
