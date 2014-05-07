var map;
myLatlng=new google.maps.LatLng(39.828127,-98.579404);
var markers = [];


function initialize()
{
	var markers = [];
	var mapOptions={center:myLatlng,zoom:4,mapTypeControl:true,center:myLatlng,panControl:false,rotateControl:false,
					streetViewControl:false,mapTypeId:google.maps.MapTypeId.ROADMAP,scrollwheel:false};

	map=new google.maps.Map(document.getElementById("map_canvas"),mapOptions);



	//var defaultBounds = new google.maps.LatLngBounds();
	//defaultBounds.extend(myLatlng);
      	
  	//map.fitBounds(defaultBounds);
  	//map.setZoom(14);
  	

  	
	// Create the search box and link it to the UI element.

}



function addEventHandler(elem,eventType,handler) {
 if (elem.addEventListener)
     elem.addEventListener (eventType,handler,false);
 else if (elem.attachEvent)
     elem.attachEvent ('on'+eventType,handler); 
}



function removeList(nid)
{
  dict = {'type':'talk', 'netid':nid, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
  $.post('/remove_person/', dict, function(data)
  {
    document.getElementById("friendList").innerHTML=data.html;
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
    var h = 600;//$(window).height();
    var offsetTop = 60; // Calculate the top offset

    $('#map_canvas').css('height', (h - offsetTop));
}).resize();
