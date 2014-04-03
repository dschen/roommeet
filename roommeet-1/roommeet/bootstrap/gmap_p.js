var map;
myLatlng=new google.maps.LatLng(39.828127,-98.579404);
var marker = null;

function initialize()
{
	
	var mapOptions={center:myLatlng,zoom:4,mapTypeControl:true,center:myLatlng,panControl:false,rotateControl:false,
					streetViewControl:false,mapTypeId:google.maps.MapTypeId.ROADMAP};

	map=new google.maps.Map(document.getElementById("map_canvas"),mapOptions);

	google.maps.event.addListener(map, 'click', function(event) {
    addMarker(event.latLng);
    });
	//var defaultBounds = new google.maps.LatLngBounds();
	//defaultBounds.extend(myLatlng);
      	
  	//map.fitBounds(defaultBounds);
  	//map.setZoom(14);

	// Create the search box and link it to the UI element.
	var input = /** @type {HTMLInputElement} */(
		document.getElementById('pac-input'));
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	var searchBox = new google.maps.places.SearchBox(
		/** @type {HTMLInputElement} */(input));

  	// [START region_getplaces]
  	// Listen for the event fired when the user selects an item from the
  	// pick list. Retrieve the matching places for that item.
  	google.maps.event.addListener(searchBox, 'places_changed', function() 
  	{
  		var places = searchBox.getPlaces();


	    // For each place, get the icon, place name, and location.
	    
	    var bounds = new google.maps.LatLngBounds();
	    for (var i = 0, place; place = places[i]; i++) 
	    {
	    	var image = {
	    		url: place.icon,
	    		size: new google.maps.Size(71, 71),
	    		origin: new google.maps.Point(0, 0),
	    		anchor: new google.maps.Point(17, 34),
	    		scaledSize: new google.maps.Size(25, 25)
	    	};

	      	// Create a marker for each place.
	      	var marker = new google.maps.Marker(
	      	{
	      		map: map,
	      		icon: image,
	      		title: place.name,
	      		position: place.geometry.location
	      	});

	      	

	      	bounds.extend(place.geometry.location);
	  	}

  		map.fitBounds(bounds);
  		map.setZoom(14);
	});

}

// Add a marker to the map and push to the array.
function addMarker(location) {
  if (marker == null)
  {
  	marker = new google.maps.Marker({
		position: location,
	  	map: map
		});
  }
  marker.setPosition(location);

  //post send of position must go here
  document.getElementById('lat-s').value = location.lat().toFixed(5);
  document.getElementById('lon-s').value = location.lng().toFixed(5);

}

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setAllMap(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}


google.maps.event.addDomListener(window,'load',initialize);
$('#mapmodals').on('shown.bs.modal',function(){google.maps.event.trigger(map,"resize");map.setCenter(myLatlng);});


$(window).resize(function () {
    var h = 600;//$(window).height();
    var offsetTop = 60; // Calculate the top offset

    $('#map_canvas').css('height', (h - offsetTop));
}).resize();
