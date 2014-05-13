var map;
myLatlng=new google.maps.LatLng(39.828127,-98.579404);
var markers = [];
var profile = false;
var house = false;
var markerp = null;
var markerh = null;

//  filters
var radius = '1000000000';
var gender = 'either';
var myloc = null;
var year = '0'
var olap = '-10000'
var hp = 'People and Housing'

//  get everything ready
$(document).ready(function() {
    $('.datepicker').datepicker();
    $("#profilebox").animate({left:"10px"});
    $("#map_canvas").animate({left:"0px"});

    //  first time users must complete their profile before continuing
    if ($("#first_time").length)
    {
	showProfile();
	$("#close_profile").hide();
    }
});

//  handles submitting the profile form
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
				   // saving closes the profile panel
				   hideProfile();
				   $("#close_profile").show();
				   myloc = markerp.getPosition();
				   deleteMarkers();
				   getMarks({'hp':hp, 'olap':olap, 'year':year, 'gender':gender, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value});

					document.getElementById("rfilter").innerHTML="Filter by Radius <b class='caret'></b></a>";
				   //  no longer a first time user
				   if ($("#first_time").length)
				       $("#first_time").remove();
			       }

			       $("#profilebox").html(data.html);
			       $("#talklist").html(data.tfhtml);
			       $("#myhouselist").html(data.myhtfhtml);
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

//  get the map markers and display them
function getMarks(dict)
{
    //  filter by sending a request
    $.post('/get_marks/',dict, function(data)
	   {
	       //  process the data that's returned from the request
	       var response = data
	       var count = response.length;
	       var bounds = new google.maps.LatLngBounds();

	       //  add person and house markers to map
	       for(var i = 0; i < count-1; i++)
	       {
		   var item = response[i];
		   loc = new google.maps.LatLng(parseFloat(item.lat),parseFloat(item.lon));
		   if (item['type'] == 'person')
		   {

		       addPersonMarker(loc, item.html, item.netid, item.user);
		   }
		   else
		   {

		       addHouseMarker(loc, item.html, item.id);
		   }

		   //  adjust the bounds of the map accordingly
		   bounds.extend(loc);

	       }
	       var item = response[i];

	       //  add self to map too
	       myloc = new google.maps.LatLng(parseFloat(item.lat),parseFloat(item.lon));
	       if (markerp == null)
	       {
		   markerp = new google.maps.Marker({
		       position: myloc,
		       icon: '../static/star-3.png',
		       map: null
		   });
	       }
	       else
		   markerp.setPosition(myloc);

	       document.getElementById('id_lat_s').value = myloc.lat().toFixed(5);
	       document.getElementById('id_lon_s').value = myloc.lng().toFixed(5);

		   if (radius == '0' || radius == '1000000000')
				map.fitBounds(bounds);
		   else {
			loc = new google.maps.LatLng(myloc.lat()+(parseFloat(radius)/(2*69.11)), myloc.lng());
			bounds.extend(loc);
			loc = new google.maps.LatLng(myloc.lat()-(parseFloat(radius)/(2*69.11)), myloc.lng());
			bounds.extend(loc);
			map.fitBounds(bounds);
		   }
	   });

}

//  handles submitting the add house form
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
				   $("#manageHouseList").html(data.mhtfhtml);
				   $("#myHouseList").html(data.myhtfhtml);
				   $("tr[class='c']").find("p").hide();
				   deleteMarkers();
				   dict = {'hp':hp, 'olap':olap, 'year':year, 'gender':gender, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
				   getMarks(dict);
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

//  handles submitting the edit house form
$(document).on("submit","#heform",function(event)
	       {
		   var frm = $('#heform');
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

				   hideEditHouse();
				   $("#manageHouseList").html(data.mhtfhtml);
				   $("#myHouseList").html(data.myhtfhtml);
				   $("tr[class='c']").find("p").hide();
				   deleteMarkers();
				   dict = {'hp':hp, 'olap':olap, 'year':year, 'gender':gender, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
				   getMarks(dict);
			       }

			       $("#edit-house-box").html(data.html);
			       $('.datepicker').datepicker();
			       return false;

			   },
			   error: function(data)
			   {
			       $("#edithousebox").html(data);
			   }
		       });
		   return false;
	       });

//  clicking "profile" will either slide the panel in or out
$(document).on("click","#profile_toggle",function(e)
	       {
		   //  open profile
		   if ($("#map_canvas").css('left') == '0px' )
		   {
		       hideTalk();
		       hideHouse();
		       showProfile();
		   }

		   //  close profile, if it's not a first time user
		   else
		   {
		       if (!($("#first_time").length) )
			   hideProfile();

		       //  get the appropriate markers and display them
		       hp = 'People and Housing';
		       dict = {'hp':hp, 'olap':olap, 'year':year, 'gender':gender, 'radius':radius, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
		       deleteMarkers();
		       getMarks(dict);
		       document.getElementById("hpfilter").innerHTML="Show: " + hp + " <b class='caret'></b></a>";
		   }

		   return false;
	       });

//  expand entries in the talk table when clicked
$(document).on("click","#talk-table",function(event)
	       {
		   event.stopPropagation();
		   var $target = $(event.target);

		   if ( $target.closest("tr").attr("atr") == 'atr')
		   {
		   }
		   else {
		       $target.closest("tr").next().find("p").slideToggle();
		   }
	       });

//  open the manage house panel when clicked
$(document).on("click","#manage-house-table",function(event)
	       {
		   event.stopPropagation();
		   var $target = $(event.target);

		   if ( $target.closest("tr").attr("atr") == 'atr' )
		   {
		   }
		   else {
		       $target.closest("tr").next().find("p").slideToggle();
		   }
	       });

//  open the housing panel when clicked
$(document).on("click","#my-house-table",function(event)
	       {
		   event.stopPropagation();
		   var $target = $(event.target);

		   if ( $target.closest("tr").attr("atr") == 'atr' )
		   {
		   }
		   else {
		       $target.closest("tr").next().find("p").slideToggle();
		   }
	       });

$("tr[class='c']").find("p").hide();

//  close the profile
$(document).on("click","#close_profile",function(e)
	       {
		   markerp.setPosition(myloc);
		   hideProfile();
		   return false;
	       });

//  close the "add house" form
$(document).on("click","#close_addHouse",function(e)
	       {

		   hideAddHouse();
		   document.getElementById("hform").reset();
		   return false;
	       });

//  close the "edit house" form
$(document).on("click","#close_editHouse",function(e)
	       {

		   hideEditHouse();
		   document.getElementById("heform").reset();
		   return false;
	       });

//  toggles the talk panel when clicked
$(document).on("click","#talk_toggle",function(e)
	       {
		   if ($("#talk-box").css('right') == '-500px')
		   {
		       //  can only open the talk panel if it's not a first time user
		       if (!($("#first_time").length) )
		       {
			   hideProfile();
			   hideHouse();
			   showTalk();

			   //  only show people
			   hp = 'People Only';
			   dict = {'hp':hp, 'olap':olap, 'year':year, 'gender':gender, 'radius':radius, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
			   deleteMarkers();
			   getMarks(dict);
			   document.getElementById("hpfilter").innerHTML="Show: " + hp + " <b class='caret'></b></a>";
		       }

		   }

		   //  close the talk panel
		   else
		   {
		       hideTalk();
		       hp = 'People and Housing';
		       dict = {'hp':hp, 'olap':olap, 'year':year, 'gender':gender, 'radius':radius, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
		       deleteMarkers();
		       getMarks(dict);
		       document.getElementById("hpfilter").innerHTML="Show: " + hp + " <b class='caret'></b></a>";
		   }
		   return false;
	       });

//  toggles the housing panel when clicked
$(document).on("click","#house_toggle",function(e)
	       {
		   if ($("#house-box").css('right') == '-500px')
		   {
		       //  can only open the housing panel if it's not a first time user
		       if (!($("#first_time").length))
		       {
			   hideProfile();
			   hideTalk();
			   showHouse();

			   //  only show houses
			   hp = 'Housing Only';
			   dict = {'hp':hp, 'olap':olap, 'year':year, 'gender':gender, 'radius':radius, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
			   deleteMarkers();
			   getMarks(dict);
			   document.getElementById("hpfilter").innerHTML="Show: " + hp + " <b class='caret'></b></a>";
		       }
		   }

		   //  close the housing panel
		   else
		   {
		       hideHouse();
		       hp = 'People and Housing';
		       dict = {'hp':hp, 'olap':olap, 'year':year, 'gender':gender, 'radius':radius, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
		       deleteMarkers();
		       getMarks(dict);
		       document.getElementById("hpfilter").innerHTML="Show: " + hp + " <b class='caret'></b></a>";
		   }
		   return false;
	       });

//  toggles the "manage housing" panel when clicked
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

//  toggles the "add house" form/panel when clicked
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

//  slides the talk panel off the screen
function hideTalk()
{

    $("#talk-box").animate({right:"-500px"});

    document.getElementById("talk_nav").className = "";
    document.getElementById("profile_nav").className = "";
    document.getElementById("meet_nav").className = "active";
    document.getElementById("house_nav").className = "";
}

//  slides the talk panel onto the screen
function showTalk()
{

    $("#talk-box").animate({right:"10px"});
    document.getElementById("meet_nav").className = "";
    document.getElementById("profile_nav").className = "";
    document.getElementById("talk_nav").className = "active";
    document.getElementById("house_nav").className = "";
}

//  slides the house panel off the screen
function hideHouse()
{
    //  be sure to hide the other house panels, too
    hideAddHouse();
    hideManageHouse();
    hideEditHouse();

    if (markerh != null)
	markerh.setMap(null);
    $("#house-box").animate({right:"-500px"});

    document.getElementById("talk_nav").className = "";
    document.getElementById("profile_nav").className = "";
    document.getElementById("house_nav").className = "";
    document.getElementById("meet_nav").className = "active";
}

//  slides the house panel onto the screen
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

//  hide the "add house" panel/form
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
    document.getElementById("house_nav").className = "active";
    document.getElementById("meet_nav").className = "";
}

//  slide the "add house" panel/form onto the screen
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

//  slide the "edit house" panel/form in
function showEditHouse(hid)
{
    house = true;
    clearMarkers();
    $.ajax(
	{
	    type: "post",
	    url: "/edit_house/",
	    data: {type:"new", 'hid':hid, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value},
	    success: function (data)
	    {
		$("#edit-house-box").html(data.html);
		$('.datepicker').datepicker();
		location = new google.maps.LatLng(document.getElementById('id_lat_h').value, document.getElementById('id_lon_h').value);
		markerh = new google.maps.Marker({
		position: location,
		icon: '../static/house_marker.png',
		map: map
		});
		return false;
	    },
	    error: function(data)
	    {
		$("#edit-house-box").html(data);
	    }
	});
    $("#edit-house-box").animate({right:"10px"});
    document.getElementById("meet_nav").className = "";
    document.getElementById("profile_nav").className = "";
    document.getElementById("talk_nav").className = "";
    document.getElementById("house_nav").className = "active";
}

//  slides the "edit house" panel/form out
function hideEditHouse()
{
    house = false;
	if (markerh != null)
		markerh.setMap(null);
    showMarkers();
    $("#edit-house-box").animate({right:"-500px"});

    document.getElementById("talk_nav").className = "";
    document.getElementById("profile_nav").className = "";
    document.getElementById("house_nav").className = "active";
    document.getElementById("meet_nav").className = "";
}

//  hides the "manage house" panel
function hideManageHouse()
{

    $("#manage-house-box").animate({right:"-500px"});
    document.getElementById("talk_nav").className = "";
    document.getElementById("profile_nav").className = "";
    document.getElementById("house_nav").className = "active";
    document.getElementById("meet_nav").className = "";
}

//  shows the "manage house" panel
function showManageHouse()
{

    $("#manage-house-box").animate({right:"10px"});
    document.getElementById("meet_nav").className = "";
    document.getElementById("profile_nav").className = "";
    document.getElementById("talk_nav").className = "";
    document.getElementById("house_nav").className = "active";

}

//  slides the profile panel in
function showProfile()
{
    hideTalk();

    //  show only the user's marker
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

//  slides the profile panel out
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

//  nothing's open--only the map is showing
$(document).on("click","#meet_toggle",function(e)
	       {
		   if (!($("#first_time").length) )
		   {
		       hp = 'People and Housing';
		       dict = {'hp':hp, 'olap':olap, 'year':year, 'gender':gender, 'radius':radius, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
		       deleteMarkers();
		       getMarks(dict);
		       document.getElementById("hpfilter").innerHTML="Show: " + hp + " <b class='caret'></b></a>";
		       hideTalk();
		       hideProfile();
		       hideHouse();
		   }

		   return false;
	       });

//  initialize the map
function initialize()
{
    var markers = [];

    //  set map options
    var mapOptions={center:myLatlng,zoom:4,mapTypeControl:true,center:myLatlng,panControl:false,rotateControl:false,
		    streetViewControl:false,mapTypeId:google.maps.MapTypeId.ROADMAP,scrollwheel:true,
		    backgroundColor:'#B3D3FF'};

    //  create the new map and populate it with markers
    map=new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
    if (!($("#first_time").length))
    {

	getMarks({'hp':hp, 'olap':olap, 'year':year, 'gender':gender, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value});
    }

    google.maps.event.addListener(map, 'click', function(event) {
	addMarkerPH(event.latLng);
    });

    //  used for the filter for the radius
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

    //  used for the filter for gender
    var m = document.getElementById('gen_male');
    m.gender = 'Male';
    m.addEventListener('click', genderFilter, false);
    var f = document.getElementById('gen_female');
    f.gender = 'Female';
    f.addEventListener('click', genderFilter, false);
    var e = document.getElementById('gen_either');
    e.gender = 'either';
    e.addEventListener('click', genderFilter, false);

    //  used for the filter for class year
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

    //  used for the filter for overlap
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

    //  used for the filter for people vs. houses
    var hpPeople = document.getElementById('hp_people');
    hpPeople.hp = 'People Only';
    hpPeople.addEventListener('click', hpFilter, false);
    var hpHouse = document.getElementById('hp_housing');
    hpHouse.hp = 'Housing Only';
    hpHouse.addEventListener('click', hpFilter, false);
    var hpBoth = document.getElementById('hp_both');
    hpBoth.hp = 'People and Housing';
    hpBoth.addEventListener('click', hpFilter, false);


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
		icon: '../static/star-3.png',
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

//  remove a person from user's talk list
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

//  remove a house that the user manages
function removeHouseList(hid)
{
    dict = {'type':'manage', 'house_id':hid, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
    $.post('/remove_managed_house/', dict, function(data)
	   {
	       $("#manageHouseList").html(data.table);
	       for (var i = 0; i < markers.length; i++)
	       {
		   if (markers[i].hid == hid)
		   {
		       markers[i].setMap(null);
		       markers[i] = markers[markers.length-1];
		       markers = markers.slice(0,markers.length-2);
		       break;
		   }
	       }

	       $("tr[class='c']").find("p").hide();
	   });

}

//  filters by distance from the user
function setRadius(evt)
{
    if (!evt.target)
	cradius = evt;
    else
	cradius = evt.target.radius;
    radius = cradius;

    //  no radius filter
    if (radius == '0')
	dict = {'hp':hp, 'olap':olap, 'year':year, 'gender':gender, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
    //  filter using the radius
    else
	dict = {'hp':hp, 'olap':olap, 'year':year, 'radius':radius, 'gender':gender,csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};

    //  get the new markers
    deleteMarkers();
    getMarks(dict);

    //  #nofilter
    if (radius == '0' || radius == '1000000000')
	document.getElementById("rfilter").innerHTML="Filter by Radius <b class='caret'></b></a>";
    //  display what radius the user is filtering by
    else
	document.getElementById("rfilter").innerHTML="Radius: " + radius + " miles <b class='caret'></b></a>";
}

//  filters by gender
function genderFilter(evt)
{
    gender = evt.target.gender;
    dict = {'hp':hp, 'olap':olap, 'year':year, 'gender':gender, 'radius':radius, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};

    //  get the new markers
    deleteMarkers();
    getMarks(dict);

    //  no gender filter
    if (gender == 'either')
	document.getElementById("gfilter").innerHTML="Filter by Gender <b class='caret'></b></a>";
    //  display what gneder the using is filtering by
    else
	document.getElementById("gfilter").innerHTML="Gender: " + gender + " <b class='caret'></b></a>";
}

//  filters by class year
function yearFilter(evt)
{
    year = evt.target.year;
    dict = {'hp':hp, 'olap':olap, 'year':year, 'gender':gender, 'radius':radius, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};

    //  get new markers
    deleteMarkers();
    getMarks(dict);

    //  no year filter
    if (year == '0')
	document.getElementById("yfilter").innerHTML="Filter by Class Year <b class='caret'></b></a>";
    //  show which filter is being used
    else
	document.getElementById("yfilter").innerHTML="Year: " + year + " <b class='caret'></b></a>";
}

//  filter by date overlap with the user
function olapFilter(evt)
{
    olap = evt.target.olap;
    dict = {'hp':hp, 'olap':olap, 'year':year, 'gender':gender, 'radius':radius, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};

    //  get new markers
    deleteMarkers();
    getMarks(dict);

    //  no overlap filter
    if (olap == "-10000")
	document.getElementById("dfilter").innerHTML="Filter by Date Overlap <b class='caret'></b></a>";
    //  any overlap
    else if (olap == "0")
	document.getElementById("dfilter").innerHTML="Date Overlap: Any <b class='caret'></b></a>";
    //  1 week overlap
    else if (olap == "7")
	document.getElementById("dfilter").innerHTML="Date Overlap: 1 Week <b class='caret'></b></a>";
    //  1 month overlap
    else if (olap == "30")
	document.getElementById("dfilter").innerHTML="Date Overlap: 1 Month <b class='caret'></b></a>";
}

//  filter by whether the object is a person or a house
function hpFilter(evt)
{
    hp = evt.target.hp;
    dict = {'hp':hp, 'olap':olap, 'year':year, 'gender':gender, 'radius':radius, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};

    //  get new markers
    deleteMarkers();
    getMarks(dict);

    //  update the filter label
    document.getElementById("hpfilter").innerHTML="Show: " + hp + " <b class='caret'></b></a>";
}

//  converts degrees to radians
var rad = function(x) {
    return x * Math.PI / 180;
};

//  get distance between two points
var getDistance = function(p1, p2) {
    var R = 6378137; // Earth's mean radius in meter
    var dLat = rad(p2.lat() - p1.lat());
    var dLong = rad(p2.lng() - p1.lng());
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
	Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
};

//  adds a person marker to the map
function addPersonMarker(location, html, netid, user)
{
    //  the user is shown using a star
    if (user == netid)
    {
	var marker = new google.maps.Marker({
	    position: location,
	    icon: '../static/star-3.png',
	    map: map,
	    title:netid
	});

    }
    //  other users are shown by a generic person marker
    else
    {
	var marker = new google.maps.Marker({
	    position: location,
	    icon: '../static/person_marker.png',
	    map: map,
	    title:netid
	});
    }
    marker.html = html;
    markers.push(marker);

    //  when clicked, show a box above the marker with info about the person
    google.maps.event.addListener(marker, 'click', function() {
	infowindow.close();
	infowindow.setContent(marker.html);
	infowindow.open(map,marker);
    });
}

//  adds a house marker to the map
function addHouseMarker(location, html, hid) {
    //  create the marker
    var marker = new google.maps.Marker({
	position: location,
	icon: '../static/house_marker.png',
	map: map,
	'hid': hid,
	title: 'house'

    });
    marker.html = html;
    markers.push(marker);

    //  when clicked, show a box above the marker with info about the house
    google.maps.event.addListener(marker, 'click', function() {
	infowindow.close();
	infowindow.setContent(marker.html);
	infowindow.open(map,marker);
    });
}

//  add a person to the user's friends list
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
		       //  set the content of the popup box of the added person
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

//  add a house to the user's interest list
function meetHouse(hid)
{
    dict = {'house_id':hid, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
    $.post('/meet_house/', dict, function(data)
	   {
	       var response = data
	       if (response.result == 'success')
	       {
		   for (var i = 0; i < markers.length; i++)
		   {
		       if (markers[i].hid == hid)
		       {
			   //  set the content of the popup box of the added house
			   markers[i].html = response.html;
			   infowindow.setContent(markers[i].html);
			   break;
		       }
		   }
		   $("#myHouseList").html(response.table);
		   $("tr[class='c']").find("p").hide();
	       }
	   });
}

//  remove a person from the user's friends list
function removePerson(nid)
{
    dict = {'type':'meet', 'netid':nid, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
    $.post('/remove_person/', dict, function(data)
	   {
	       var response = data
	       for (var i = 0; i < markers.length; i++)
	       {
		   //  set the content of the popup box of the removed person
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

//  remove a houe from the user's interest list
function removeHouse(hid)
{
    dict = {'type':'meet', 'house_id':hid, csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value};
    $.post('/remove_house/', dict, function(data)
	   {
	       var response = data
	       for (var i = 0; i < markers.length; i++)
	       {
		   //  set the content of the popup box of the house
		   if (markers[i].hid == hid)
		   {
		       markers[i].html = response.html;
		       infowindow.setContent(markers[i].html);
		       break;
		   }
	       }
	       $("#myHouseList").html(response.table);
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

//  makes the map work better with window resizing
$(window).resize(function () {
    var h = $(window).height();
    var offsetTop = 0; // Calculate the top offset

    $('#map_canvas').css('height', (h - offsetTop));
}).resize();
