var map;
myLatlng=new google.maps.LatLng(39.828127,-98.579404);
var markers = [];
var profile = false;
var house = false;
var markerp = null;
var markerh = null;
var radius = '1000000000';
var gender = 'either';
var myloc = null;
var year = '0'
var olap = '-10000'

$(document).ready(function() {
	$('.datepicker').datepicker();
	$("#profilebox").animate({left:"10px"});
	$("#map_canvas").animate({left:"0px"});

	if ($("#first_time").length) 
	{ 
		showProfile();
		$("#close_profile").hide();
	}
});


$(document).on("submit","#pform",function(event)
{
	var frm = $('#pform');
	event.preventDefault();
	$.ajax(
	{
		type: frm.attr('method'),
		url: frm.attr('action'),
		data: frm.serialize(),
		success: function (data) 
		{
			if (data.success == "true")
			{
				hideProfile();
				$("#close_profile").show();
				myloc = markerp.getPosition();
				deleteMarkers();
				getMarks({'olap':olap, 'year':year, 'gender':gender, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value});
				if ($("#first_time").length)
					$("#first_time").remove();
			}
			$("#profilebox").html(data.html);
			$('.datepicker').datepicker();
			return false;

		},
		error: function(data) 
		{
			$("#profilebox").html(data);
		}
	});
	return false;
});


function getMarks(dict)
{
	$.post('/get_marks/',dict, function(data)
	{
		var response = data
		var count = response.length;
		var bounds = new google.maps.LatLngBounds();
		for(var i = 0; i < count-1; i++) 
		{
			var item = response[i];
			loc = new google.maps.LatLng(parseFloat(item.lat),parseFloat(item.lon));
			if (item['type'] == 'person')
			{
				
				addPersonMarker(loc, item.html, item.netid);
			}
			else
			{
				
				addHouseMarker(loc, item.html);
			}
			bounds.extend(loc);

		}
		var item = response[i];
		myloc = new google.maps.LatLng(parseFloat(item.lat),parseFloat(item.lon));
		document.getElementById('id_lat_s').value = myloc.lat().toFixed(5);
		document.getElementById('id_lon_s').value = myloc.lng().toFixed(5);
		map.fitBounds(bounds);
	});

}

$(document).on("submit","#hform",function(event)
{
	var frm = $('#hform');
	event.preventDefault();
	$.ajax(
	{
		type: frm.attr('method'),
		url: frm.attr('action'),
		data: frm.serialize(),
		success: function (data) 
		{

			if (data.success == "true")
			{

				hideAddHouse();
			}

			$("#add-house-box").html(data.html);
			$('.datepicker').datepicker();
			return false;

		},
		error: function(data) 
		{
			$("#addhousebox").html(data);
		}
	});
	return false;
});



$(document).on("click","#profile_toggle",function(e)
{
	if ($("#map_canvas").css('left') == '0px' )
	{
		hideTalk();
		hideHouse();
		showProfile();
	}
	else 
	{
		if (!($("#first_time").length) )
		hideProfile();
	}


	return false;
}); 

$(document).on("click","#talk-table",function(event)
{
    event.stopPropagation();
    var $target = $(event.target);

    if ( $target.closest("td").attr("colspan") > 1 ) 
    {
    } 
    else {
        $target.closest("tr").next().find("p").slideToggle();
    }                    
});

$(document).on("click","#manage-house-table",function(event)
{
    event.stopPropagation();
    var $target = $(event.target);

    if ( $target.closest("td").attr("colspan") > 1 ) 
    {
    } 
    else {
        $target.closest("tr").next().find("p").slideToggle();
    }                    
});


$("tr[class='c']").find("p").hide();


$(document).on("click","#close_profile",function(e)
{
	markerp.setPosition(myloc);
	hideProfile();
	return false;
}); 

$(document).on("click","#close_addHouse",function(e)
{

	hideAddHouse();
	document.getElementById("hform").reset()
	return false;
}); 


$(document).on("click","#talk_toggle",function(e)
{
	if ($("#talk-box").css('right') == '-500px')
	{
		if (!($("#first_time").length) )
		{
			hideProfile();
			hideHouse();
			showTalk();
		}

	}
	else
	{
		hideTalk();
	}
	return false;
}); 

$(document).on("click","#house_toggle",function(e)
{
	if ($("#house-box").css('right') == '-500px')
	{
		hideProfile();
		hideTalk();
		showHouse();
	}
	else
	{
		hideHouse();
	}
	return false;
}); 

$(document).on("click","#manage_house_toggle",function(e)
{
	if ($("#manage-house-box").css('right') == '-500px')
	{
		hideProfile();
		hideTalk();
		showManageHouse();
	}
	else
	{
		hideManageHouse();
	}
	return false;
}); 


$(document).on("click","#add_house_toggle",function(e)
{
	if ($("#add-house-box").css('right') == '-500px')
	{
		hideProfile();
		hideTalk();
		showAddHouse();
	}
	else
	{
		hideAddHouse();
	}
	return false;
}); 


function hideTalk()
{
	$("#talk-box").animate({right:"-500px"});
	
	document.getElementById("talk_nav").className = "";
	document.getElementById("profile_nav").className = "";
	document.getElementById("meet_nav").className = "active";
	document.getElementById("house_nav").className = "";
}

function showTalk()
{
	$("#talk-box").animate({right:"10px"});
	document.getElementById("meet_nav").className = "";
	document.getElementById("profile_nav").className = "";
	document.getElementById("talk_nav").className = "active";
	document.getElementById("house_nav").className = "";	
}

function hideHouse()
{
	showMarkers();
	hideAddHouse();
	hideManageHouse();
	
	if (markerh != null)
		markerh.setMap(null);
	$("#house-box").animate({right:"-500px"});
	
	document.getElementById("talk_nav").className = "";
	document.getElementById("profile_nav").className = "";
	document.getElementById("house_nav").className = "";
	document.getElementById("meet_nav").className = "active";
}

function showHouse()
{
	hideTalk();
	hideProfile();

	$("#house-box").animate({right:"10px"});
	document.getElementById("meet_nav").className = "";
	document.getElementById("profile_nav").className = "";
	document.getElementById("talk_nav").className = "";
	document.getElementById("house_nav").className = "active";
		
}

function hideAddHouse()
{
	house = false;
	showMarkers();
	if (markerh != null)
		markerh.setMap(null);
	markerh = null;
	$("#add-house-box").animate({right:"-500px"});
	
	document.getElementById("talk_nav").className = "";
	document.getElementById("profile_nav").className = "";
	document.getElementById("house_nav").className = "";
	document.getElementById("meet_nav").className = "active";
}

function showAddHouse()
{
	house = true;
	clearMarkers();
	$.ajax(
	{
		type: "post",
		url: "/add_house/",
		data: {type:"new", csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value},
		success: function (data) 
		{
			$("#add-house-box").html(data.html);
			$('.datepicker').datepicker();
			return false;

		},
		error: function(data) 
		{
			$("#add-house-box").html(data);
		}
	});
	$("#add-house-box").animate({right:"10px"});
	document.getElementById("meet_nav").className = "";
	document.getElementById("profile_nav").className = "";
	document.getElementById("talk_nav").className = "";
	document.getElementById("house_nav").className = "active";
}

function hideManageHouse()
{
	
	$("#manage-house-box").animate({right:"-500px"});
	document.getElementById("talk_nav").className = "";
	document.getElementById("profile_nav").className = "";
	document.getElementById("house_nav").className = "active";
	document.getElementById("meet_nav").className = "";
}

function showManageHouse()
{

	$("#manage-house-box").animate({right:"10px"});
	document.getElementById("meet_nav").className = "";
	document.getElementById("profile_nav").className = "";
	document.getElementById("talk_nav").className = "";
	document.getElementById("house_nav").className = "active";
		
}

function showProfile()
{
	hideTalk();
	clearMarkers();
	profile = true;
	if (markerp != null)
		markerp.setMap(map);
	$("#map_canvas").animate({left:"300px"});
	$("#profilebox").animate({left:"10px"});
	document.getElementById("meet_nav").className = "";
	document.getElementById("talk_nav").className = "";
	document.getElementById("profile_nav").className = "active";
	document.getElementById("house_nav").className = "";
}
function hideProfile()
{
	showMarkers();
	profile = false;
	if (markerp != null)
		markerp.setMap(null);
	$("#map_canvas").animate({left:"0px"});
	document.getElementById("profile_nav").className = "";
	document.getElementById("talk_nav").className = "";
	document.getElementById("meet_nav").className = "active";
}

$(document).on("click","#meet_toggle",function(e)
{
	if (!($("#first_time").length) )
	{
		hideTalk();
		hideProfile();
		hideHouse();
	}
	

	return false;
}); 



function initialize()
{
	var markers = [];
	var mapOptions={center:myLatlng,zoom:4,mapTypeControl:true,center:myLatlng,panControl:false,rotateControl:false,
		streetViewControl:false,mapTypeId:google.maps.MapTypeId.ROADMAP,scrollwheel:true, 
		backgroundColor:'#B3D3FF'};

	map=new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
	if (!($("#first_time").length))
	{

		getMarks({'olap':olap, 'year':year, 'gender':gender, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value});
	}

	google.maps.event.addListener(map, 'click', function(event) {
		addMarkerPH(event.latLng);
	});


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

	var m = document.getElementById('gen_male');
	m.gender = 'Male';
	m.addEventListener('click', genderFilter, false);
	var f = document.getElementById('gen_female');
	f.gender = 'Female';
	f.addEventListener('click', genderFilter, false);
	var e = document.getElementById('gen_either');
	e.gender = 'either';
	e.addEventListener('click', genderFilter, false);

	var cy0 = document.getElementById('cyear_none');
	cy0.year = '0';
	cy0.addEventListener('click', yearFilter, false);
	var cy14 = document.getElementById('cyear_14');
	cy14.year = '2014';
	cy14.addEventListener('click', yearFilter, false);
	var cy15 = document.getElementById('cyear_15');
	cy15.year = '2015';
	cy15.addEventListener('click', yearFilter, false);
	var cy16 = document.getElementById('cyear_16');
	cy16.year = '2016';
	cy16.addEventListener('click', yearFilter, false);
	var cy17 = document.getElementById('cyear_17');
	cy17.year = '2017';
	cy17.addEventListener('click', yearFilter, false);
	

	var do0 = document.getElementById('olap_off');
	do0.olap = '-10000';
	do0.addEventListener('click', olapFilter, false);
	var doON = document.getElementById('olap_on');
	doON.olap = '0';
	doON.addEventListener('click', olapFilter, false);
	var do7 = document.getElementById('olap_wk');
	do7.olap = '7';
	do7.addEventListener('click', olapFilter, false);
	var do30 = document.getElementById('olap_month');
	do30.olap = '30';
	do30.addEventListener('click', olapFilter, false);
    
    var r = document.getElementById('desired_roommate');
	r.desired = 'Roommate';
	r.addEventListener('click', desiredFilter, false);
	var fr = document.getElementById('desired_friends');
	fr.desired = 'Friends';
	fr.addEventListener('click', desiredFilter, false);
	var ei = document.getElementById('desired_either');
	ei.desired = 'Either';
	ei.addEventListener('click', desiredFilter, false);
	

	// Create the search box and link it to the UI element.

	var input = (document.getElementById('pac-input'));
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);


	var searchBox = new google.maps.places.SearchBox(
		/** @type {HTMLInputElement} */(input));

	// [START region_getplaces]
	// Listen for the event fired when the user selects an item from the
	// pick list. Retrieve the matching places for that item.
	google.maps.event.addListener(searchBox, 'places_changed', function() 
	{
		var places = searchBox.getPlaces();

		for (var i = 0, marker; marker = markers[i]; i++) 
		{
			marker.setMap(null);
		}

		// For each place, get the icon, place name, and location.
		markers = [];
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0, place; place = places[i]; i++) 
		{
			var image = 
			{
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

function addMarkerPH(location) 
{
	if (profile == true)
	{
		if (markerp == null)
		{
			markerp = new google.maps.Marker({
				position: location,
				map: map
			});
		}
		markerp.setPosition(location);

		document.getElementById('id_lat_s').value = location.lat().toFixed(5);
		document.getElementById('id_lon_s').value = location.lng().toFixed(5);
	}
	else if (house == true)
	{
		if (markerh == null)
		{


			markerh = new google.maps.Marker({
				position: location,
				icon: '../static/house_marker.png',
				map: map
			});
		}
		markerh.setPosition(location);

		document.getElementById('id_lat_h').value = location.lat().toFixed(5);
		document.getElementById('id_lon_h').value = location.lng().toFixed(5);
	}
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
    $("#friendList").html(data.table);
    for (var i = 0; i < markers.length; i++)
	{
		if (markers[i].title == nid)
		{
			markers[i].html = data.html;
			infowindow.setContent(markers[i].html);
			break;
		}
	}



    $("tr[class='c']").find("p").hide();
  });

}
function setRadius(evt) 
{
	if (!evt.target)
		cradius = evt;
	else
		cradius = evt.target.radius;
	radius = cradius;
	if (radius == '0')
		dict = {'olap':olap, 'year':year, 'gender':gender, 'desired':desired, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
	else
		dict = {'olap':olap, 'year':year, 'radius':radius, 'gender':gender, 'desired':desired, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
	deleteMarkers();
	getMarks(dict);
	if (radius == '0' || radius == '1000000000')
		document.getElementById("rfilter").innerHTML="Filter by Radius <b class='caret'></b></a>";
	else
		document.getElementById("rfilter").innerHTML="Radius: " + radius + " miles <b class='caret'></b></a>";
}

function genderFilter(evt)
{
	gender = evt.target.gender;
	dict = {'olap':olap, 'year':year, 'gender':gender, 'radius':radius, 'desired':desired, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
	deleteMarkers();
	getMarks(dict);
	if (gender == 'either')
		document.getElementById("gfilter").innerHTML="Filter by Gender <b class='caret'></b></a>";
	else
		document.getElementById("gfilter").innerHTML="Gender: " + gender + " <b class='caret'></b></a>";
}


function yearFilter(evt)
{
	year = evt.target.year;
	dict = {'olap':olap, 'year':year, 'gender':gender, 'radius':radius, 'desired':desired, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
	deleteMarkers();
	getMarks(dict);

	if (year == '0')
		document.getElementById("yfilter").innerHTML="Filter by Class Year <b class='caret'></b></a>";
	else
		document.getElementById("yfilter").innerHTML="Year: " + year + " <b class='caret'></b></a>";
}


function olapFilter(evt)
{
	olap = evt.target.olap;
	dict = {'olap':olap, 'year':year, 'gender':gender, 'radius':radius, 'desired':desired, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
	deleteMarkers();
	getMarks(dict);
	if (olap == "-10000")
		document.getElementById("dfilter").innerHTML="Filter by Date Overlap <b class='caret'></b></a>";
	else if (olap == "0")
		document.getElementById("dfilter").innerHTML="Date Overlap: Any <b class='caret'></b></a>";
	else if (olap == "7")
		document.getElementById("dfilter").innerHTML="Date Overlap: 1 Week <b class='caret'></b></a>";
	else if (olap == "30")
		document.getElementById("dfilter").innerHTML="Date Overlap: 1 Month <b class='caret'></b></a>";
}

function desiredFilter(evt)
{
	desired = evt.target.desired;
	dict = {'olap':olap, 'year':year, 'gender':gender, 'radius':radius, 'desired':desired, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
	deleteMarkers();
	$.post('/get_marks/', dict, function(data)
           {
           var response = data
           var count = response.length;
           var bounds = new google.maps.LatLngBounds();
           for(var i = 0; i < count-1; i++)
           {
           var item = response[i];
           loc = new google.maps.LatLng(parseFloat(item.lat),parseFloat(item.lon));
           addMarker(loc, item.html, item.netid);
           bounds.extend(loc);
           
           }
           map.fitBounds(bounds);
           if (count == 1)
           map.setZoom(12);
           });
	if (desired == 'Either')
		document.getElementById("desfilter").innerHTML="Looking For? <b class='caret'></b></a>";
	else
		document.getElementById("desfilter").innerHTML="Looking For: " + desired + " <b class='caret'></b></a>";
}

var rad = function(x) {
  return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat() - p1.lat());
  var dLong = rad(p2.lng() - p1.lng());
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};



function addPersonMarker(location, html, netid) {
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

function addHouseMarker(location, html) {
	var marker = new google.maps.Marker({
		position: location,
		icon: '../static/house_marker.png',
		map: map,
		title:'house'
		
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
			$("#friendList").html(response.table);
			$("tr[class='c']").find("p").hide();
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
		$("#friendList").html(response.table);
		$("tr[class='c']").find("p").hide();

	});
}

var infowindow = new google.maps.InfoWindow({
	content: 'stuff',
     maxWidth: 200,

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
