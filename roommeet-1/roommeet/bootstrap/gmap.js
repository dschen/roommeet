var map;
myLatlng=new google.maps.LatLng(39.828127,-98.579404);
var markers = [];


function initialize()
{
	var markers = [];
	var mapOptions={center:myLatlng,zoom:4,mapTypeControl:true,center:myLatlng,panControl:false,rotateControl:false,
					streetViewControl:false,mapTypeId:google.maps.MapTypeId.ROADMAP,scrollwheel:false};

	map=new google.maps.Map(document.getElementById("map_canvas"),mapOptions);

	$.post('/get_marks/',{csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value}, function(data){
		var response = data
		var count = response.length;
		var bounds = new google.maps.LatLngBounds();
		for(var i = 0; i < count; i++) 
		{

    		var item = response[i];
    		loc = new google.maps.LatLng(parseFloat(item.lat),parseFloat(item.lon));
    		addMarker(loc, item.html, item.netid);
    		bounds.extend(loc);

		}
    	map.fitBounds(bounds);
	});
	//var defaultBounds = new google.maps.LatLngBounds();
	//defaultBounds.extend(myLatlng);
      	
  	//map.fitBounds(defaultBounds);
  	//map.setZoom(14);
  	var r5 = document.getElementById('5-radius');
  	r5.radius = '5';
  	r5.addEventListener('click', setRadius, false); 	
  	var r10 = document.getElementById('10-radius');
  	r10.radius = '10';
  	r10.addEventListener('click', setRadius, false);
  	var r20 = document.getElementById('20-radius');
  	r20.radius = '20';
  	r20.addEventListener('click', setRadius, false);
  	var r50 = document.getElementById('50-radius');
  	r50.radius = '50';
  	r50.addEventListener('click', setRadius, false);
  	var rno = document.getElementById('no-radius');
  	rno.radius = '0';
  	rno.addEventListener('click', setRadius, false);

  	
	// Create the search box and link it to the UI element.
	var input1 = /** @type {HTMLInputElement} */(
		document.getElementById('float_bar'));
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	var input = /** @type {HTMLInputElement} */(
		document.getElementById('pac-input'));

	var searchBox = new google.maps.places.SearchBox(
		/** @type {HTMLInputElement} */(input));

  	// [START region_getplaces]
  	// Listen for the event fired when the user selects an item from the
  	// pick list. Retrieve the matching places for that item.
  	google.maps.event.addListener(searchBox, 'places_changed', function() 
  	{
  		var places = searchBox.getPlaces();

  		for (var i = 0, marker; marker = markers[i]; i++) {
  			marker.setMap(null);
  		}

	    // For each place, get the icon, place name, and location.
	    markers = [];
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

	      	markers.push(marker);

	      	bounds.extend(place.geometry.location);
	  	}

  		map.fitBounds(bounds);
  		map.setZoom(12);
	});

}



function addEventHandler(elem,eventType,handler) {
 if (elem.addEventListener)
     elem.addEventListener (eventType,handler,false);
 else if (elem.attachEvent)
     elem.attachEvent ('on'+eventType,handler); 
}

function setRadius(evt) 
{
	if (evt.target.radius == '0')
		dict = {csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
	else
		dict = {radius:evt.target.radius, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
	deleteMarkers();
	$.post('/get_marks/', dict, function(data)
	{
		var response = data
		var count = response.length;
		var bounds = new google.maps.LatLngBounds();
		for(var i = 0; i < count; i++) 
		{
			var item = response[i];
			loc = new google.maps.LatLng(parseFloat(item.lat),parseFloat(item.lon));
			addMarker(loc, item.html, item.netid);
			bounds.extend(loc);

		}
		map.fitBounds(bounds);
	});
}

function addMarker(location, html, netid) {
  var marker = new google.maps.Marker({
    position: location,
    map: map,
    title:netid
  });
  marker.html = html;
  markers.push(marker);
  
  
  google.maps.event.addListener(marker, 'click', function() {
  	infowindow.close();
  	infowindow.setContent(marker.html);
    infowindow.open(map,marker);
  	});
}

function meetPerson(nid) 
{
	dict = {'netid':nid, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
	$.post('/meet_person/', dict, function(data)
	{
		var response = data
		if (response.result == 'success')
		{
			for (var i = 0; i < markers.length; i++)
			{
				if (markers[i].title == nid)
				{
					markers[i].html = response.html;
					infowindow.setContent(markers[i].html);
					break;
				}
			}
		}



	});
}

function removePerson(nid) 
{
	dict = {'type':'meet', 'netid':nid, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
	$.post('/remove_person/', dict, function(data)
	{
		var response = data
		for (var i = 0; i < markers.length; i++)
		{
			if (markers[i].title == nid)
			{
				markers[i].html = response.html;
				infowindow.setContent(markers[i].html);
				break;
			}
		}

	});
}

var infowindow = new google.maps.InfoWindow({
      content: 'stuff',
      maxWidth: 200
  });

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
    var h = $(window).height();
    var offsetTop = 0; // Calculate the top offset

    $('#map_canvas').css('height', (h - offsetTop));
}).resize();
