var lib = {
	toRadians: function (n) {
		return n * Math.PI / 180;
	},

	distance: function (a, b) {
		var dlat = lib.toRadians(a[0] - b[0]),
			dlng = lib.toRadians(b[1] - b[1]),
			a = Math.sin(dlat/2) * Math.sin(dlat/2) +
				Math.cos(lib.toRadians(a[0])) * Math.cos(lib.toRadians(b[0])) * 
				Math.sin(dlng/2) * Math.sin(dlng/2),
			c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		return 6372 * c * 1000;
	}
};

$(function () {
	var $body = $('#dynamic-content'),
		$loader = null;
		$mapContainer = $('#mapcontainer'),
		mapController = null,
		isMobileMode = !$mapContainer.is(':visible');

	function getMap() {
		if (mapController !== null) {
			return mapController;
		}

		var mapCanvas = $('<div></div>');
		mapCanvas.attr('id', 'mapcanvas');
		mapCanvas.css({
			width: '100%',
			height: '100%'
		});
		$mapContainer.html(mapCanvas);

		mapController = new google.maps.Map(document.getElementById("mapcanvas"), {
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});

		return mapController;
	}

	function foundPosition(position) {
		var pos = [ position.coords.latitude,
			position.coords.longitude ];

		$loader.html('<p>Found position, getting APs nearby...</p>');

		$.getJSON('get-nearby.py?lat=' + pos[0] + '&lng=' + pos[1], function (response) {
			if (response.error) {
				error(response.error);
				return;
			}

			var $list = $('<ul id="list"></ul>'),
				map = getMap(),
				i,
				centerCoords = null;

			if (isMobileMode === false) {
				centerCoords = new google.maps.LatLngBounds();
			}

			// add distance to the array so we can sort it by distance
			for (i=0; i<response.results.length; i++) {
				response.results[i].dist = parseInt(lib.distance(pos, response.results[i].loc));
			}

			response.results.sort(function (a, b) {
				return (a.dist > b.dist) - (a.dist < b.dist);
			});

			$body.html($list);

			$.each(response.results, function (i, item) {
				$list.append('<li><a href="#" class="point"><strong class="essid">' + item.essid + '</strong><br/><strong>Key:</strong> '+item.wpakey+' &mdash; ' + item.dist + ' meters<br/>'+item._id+'</a></li>');

				if (isMobileMode === false) {
					var pos = new google.maps.LatLng(item.loc[0], item.loc[1]);
					centerCoords.extend(pos);
					new google.maps.Marker({
						map: map,
						position: pos
					});
				}
			});

			if (isMobileMode === false) {
				map.fitBounds(centerCoords);
			}
		});
	}

	function error(msg) {
		$body.html('<div id="init-error"><p>Error: ' + msg + '</p></div>');
	}

	if (navigator.geolocation) {
		$loader = $body.html('<div id="loading"><p>Trying to find your location...</p></div>');
		navigator.geolocation.getCurrentPosition(foundPosition, error);
	} else {
		$body.html('<div id="init-error"><p>Your device/browser does not support geo location.</p></div>');
	}
});
