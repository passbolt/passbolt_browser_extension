$(function() {
	var openpgp = window.openpgp;
	
	var publicKey; 
	
	// when user click on save key
	$('#saveKey').click(function(){
		console.log('save key click');
		var key = $('#keyAscii').val();
		var user;
		
		if($('#keyAscii').val() === '') {
			alert('Sorry, the key cannot be empty');
		} else {
			publicKey = openpgp.key.readArmored(key);
			
			if (publicKey.keys.length != 0) {
				console.log(publicKey.keys[0].isPrivate());
				console.log(publicKey.keys[0].isPublic());
				console.log(publicKey.keys[0].getKeyIds());
				console.log(publicKey.keys[0].getUserIds());
				console.log(publicKey.keys[0].getExpirationTime());
			}
		}	
	});

	// when user click on browse
	$('#keyFilepicker').click(function(){
		self.port.emit("openFilePicker", {});
	});
	
	// when getting file content back from addon
	self.port.on('importFromFile', function(message) {
		if(message !== undefined) {
	  		$('#keyAscii').val(message);
	  	}
	});
});
