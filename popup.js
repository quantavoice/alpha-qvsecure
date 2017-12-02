// QVsecure.js copied here

var cryptoObj = window.crypto || window.msCrypto; // for IE 11
var qvuser = {};
qvuser["testclient1"] = "";
qvuser["testclient2"] = "";
qvuser["testserver1"] = "";
qvuser["testserver2"] = "";

function getUserCredentials(username) {
	if (username in qvuser) {
		console.log(username+" :credentials: "+qvuser[username]);
		return qvuser[username];
	} else {
		console.log("Get from keyserver: "+username);
	}
}

function qvEncrypt(plaintext) {
	var password = "changeme";
	const encryptText = async (plainText, password) => {
	  const ptUtf8 = new TextEncoder().encode(plainText);

	  const pwUtf8 = new TextEncoder().encode(password);
	  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);

	  const iv = crypto.getRandomValues(new Uint8Array(12));
	  const alg = { name: 'AES-GCM', iv: iv };
	  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);

	  return await crypto.subtle.encrypt(alg, key, ptUtf8);
	}
	return encryptText;
}

// end of qvsecure.js

// QV stuff
	function saveChanges() {
		// Save it using the Chrome extension storage API.
		var qvid1 = 'abc', qvpk1 = 'def', qvpk2 = '123';
		chrome.storage.sync.set({'qvid1': qvid1, 'qvpk1': qvpk1, 'qvpk2': qvpk2}, function() {
			// Notify that we saved.
			console.log('ID saved');
			// Update the popup
			document.getElementById('qvid1').innerHTML = qvid1;
			document.getElementById('qvpk1').innerHTML = qvpk1;
			document.getElementById('qvpk2').innerHTML = qvpk2;
		});
	}
	function restoreChanges() {
		chrome.storage.sync.get(null, (items) => {
			if (items) {
				Object.keys(items).forEach(function(key) {
				    console.log(key, items[key]);
				    if (key.startsWith("qv")) { document.getElementById(key).innerHTML = items[key]; }
				});
			}
		});
	}
	function clearStorage() {
		chrome.storage.sync.clear();
	}
// end QV stuff

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, (tabs) => {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * Change the background color of the current page.
 *
 * @param {string} color The new background color.
 */
function changeBackgroundColor(color) {
  var script = 'document.body.style.backgroundColor="' + color + '";';
  // See https://developer.chrome.com/extensions/tabs#method-executeScript.
  // chrome.tabs.executeScript allows us to programmatically inject JavaScript
  // into a page. Since we omit the optional first argument "tabId", the script
  // is inserted into the active tab of the current window, which serves as the
  // default.
  chrome.tabs.executeScript({
    code: script
  });
}

/**
 * Gets the saved background color for url.
 *
 * @param {string} url URL whose background color is to be retrieved.
 * @param {function(string)} callback called with the saved background color for
 *     the given url on success, or a falsy value if no color is retrieved.
 */
function getSavedBackgroundColor(url, callback) {
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
  // for chrome.runtime.lastError to ensure correctness even when the API call
  // fails.
  chrome.storage.sync.get(url, (items) => {
    callback(chrome.runtime.lastError ? null : items[url]);
  });
}

/**
 * Sets the given background color for url.
 *
 * @param {string} url URL for which background color is to be saved.
 * @param {string} color The background color to be saved.
 */
function saveBackgroundColor(url, color) {
  var items = {};
  items[url] = color;
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We omit the
  // optional callback since we don't need to perform any action once the
  // background color is saved.
  chrome.storage.sync.set(items);
}

function qvEncryptClick() {
	var plaintext = document.getElementById("qvencrypt").value;
	console.log("To encrypt: "+plaintext);
	var encryptPromise = qvEncrypt(plaintext);
	console.log("Encrypted: "+encryptPromise);
	console.log("Typeof: "+(typeof encryptPromise));
	alert("'Encrypt' not fully implemented yet.");
}

function qvDecryptClick() {
	getUserCredentials("foobar");
	getUserCredentials("testclient1");
	alert("'Decrypt' not implemented yet.");
}

function TBA() {
	getUserCredentials("foobar");
	getUserCredentials("testclient1");
	alert("Not implemented yet.");
}

// This extension loads the saved background color for the current tab if one
// exists. The user can select a new background color from the dropdown for the
// current page, and it will be saved as part of the extension's isolated
// storage. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.
document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
	var qvLink = document.getElementById('qvLink');
    qvLink.addEventListener('click', () => { saveChanges(); });
	var qvTest1 = document.getElementById('qvTest1');
    qvTest1.addEventListener('click', () => { restoreChanges(); });
	var qvTest2 = document.getElementById('qvTest2');
    qvTest2.addEventListener('click', () => { clearStorage(); });
	restoreChanges();
	var qvEncryptA = document.getElementById('qvEncryptA');
    qvEncryptA.addEventListener('click', () => { qvEncryptClick(); });
	var qvDecryptA = document.getElementById('qvDecryptA');
    qvDecryptA.addEventListener('click', () => { qvDecryptClick(); });
  });
});

// TO END OF FILE: Greenbox popup.js code
// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
	document.getElementById('pagetitle').textContent = tab.title;
	document.getElementById('shareTitle').value = tab.title;
	document.getElementById('pageurl').textContent = tab.url;
    var url = JSON.stringify(tab);

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getImageUrl(searchTerm, callback, errorCallback) {
  // Google image search - 100 searches per day.
  // https://developers.google.com/image-search/
  var searchUrl = 'https://www.woodsidelabs.com/idoldemo/ext.php?zyzzx=true&button=true' +
    '&tabJSON=' + encodeURIComponent(searchTerm);
  console.log(searchUrl);
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  // The Google image search API responds with JSON, so let Chrome parse it.
  //x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from Google Image Search.
    var response = x.response;
    if (!response) {
	  console.log(response);
      errorCallback('No response from server!');
      return;
      }
    callback(response);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function renderStatus(statusText) {
  document.getElementById('status').textContent += statusText+"\n";
}

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("bookmarkDemoButton").addEventListener("click", bookmarkDemo, false);
	document.getElementById("analysisDemoButton").addEventListener("click", analysisDemo, false);
	//renderStatus("starting extension");
	/*chrome.runtime.sendNativeMessage('com.hp.autonomy.idolondemanddemo',
	  { text: "Hello" },
	  function(response) {
	    renderStatus("Received+" + response);
    });*/
	/*var port = chrome.runtime.connectNative('com.hp.autonomy.idolondemanddemo');
	port.onMessage.addListener(function(msg) {
	  renderStatus("Received-" + msg);
	});
	port.onDisconnect.addListener(function() {
	  renderStatus("Disconnected");
    });
	port.postMessage({ text: "Hello, my_application" });
	renderStatus("done with NMH stuff");*/
	getCurrentTabUrl(function(url) {
    // Put the image URL in Google search.
    //renderStatus('Analyzing ' + url);
    getImageUrl(url, function(imageUrl) {

      renderStatus('Result: ' + imageUrl);
      /*var imageResult = document.getElementById('image-result');
      // Explicitly set the width/height to minimize the number of reflows. For
      // a single image, this does not matter, but if you're going to embed
      // multiple external images in your page, then the absence of width/height
      // attributes causes the popup to resize multiple times.
      imageResult.width = width;
      imageResult.height = height;
      imageResult.src = imageUrl;
      imageResult.hidden = false;*/

    }, function(errorMessage) {
      renderStatus('Cannot display image. ' + errorMessage);
    });
  });
});

function bookmarkDemo()
{
	  var x = new XMLHttpRequest();
	  x.open('POST', 'https://www.woodsidelabs.com/qvdemo/ext_addnote.php');
	  // The Google image search API responds with JSON, so let Chrome parse it.
	  //x.responseType = 'json';
	  x.onload = function() {
	    // Parse and process the response from Google Image Search.
	    var response = x.response;
	    if (!response) {
	      console.log('No response from server!');
	      return;
	    }
	    document.getElementById('pageurl').textContent +=response;
	  };
	  x.onerror = function() {
	    console.log('Network error.');
	  };
x.setRequestHeader("Content-type","application/x-www-form-urlencoded");
x.send("addform=true&addtitle="+encodeURIComponent(document.getElementById('pagetitle').textContent)
	+"&addinfo="+encodeURIComponent(document.getElementById('pageurl').textContent)
	+"&addtags="+encodeURIComponent(document.getElementById('selectedTags').textContent)
	+"&adddate="+encodeURIComponent(new Date()));
}

function addTagDemo(newTag)
{
	//alert(newTag.target.id.substring(14));
	$("#selectedTags").append(newTag.target.id.substring(14)+" ");
}

function analysisDemo()
{
	  var x = new XMLHttpRequest();
	  x.open('POST', 'https://www.woodsidelabs.com/idoldemo/analyzeConcepts.php');
	  // The Google image search API responds with JSON, so let Chrome parse it.
	  //x.responseType = 'json';
	  x.onload = function() {
	    // Parse and process the response from Google Image Search.
	    var response = x.response;
	    if (!response) {
	      console.log('No response from server!');
	      document.getElementById('concepts').textContent += 'concepts: no response';
	      return;
	    }
	    document.getElementById('concepts').innerHTML += "<b>Concepts:</b>" + response;
	  };
	  x.onerror = function() {
	    console.log('Network error.');
	  };
	x.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	x.send("url="+encodeURIComponent(document.getElementById('pageurl').textContent));

	  var y = new XMLHttpRequest();
	  y.open('POST', 'https://www.woodsidelabs.com/idoldemo/analyzeEntities.php');
	  y.onload = function() {
	    var response = y.response;
	    if (!response) {
	      console.log('No response from server!');
	      document.getElementById('entities').textContent += 'entities: no response';
	      return;
	    }
	    document.getElementById('entities').innerHTML += "<b>Entities:</b>" + response;
	    $('#entities > span').click(addTagDemo);
	    //function() { addTagDemo(this.id.substring(14)); }
	  };
	  y.onerror = function() {
	    console.log('Network error.');
	  };
	y.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	y.send("url="+encodeURIComponent(document.getElementById('pageurl').textContent));

	  var z = new XMLHttpRequest();
	  z.open('POST', 'https://www.woodsidelabs.com/idoldemo/analyzeRelated.php');
	  z.onload = function() {
	    var response = z.response;
	    if (!response) {
	      console.log('No response from server!');
	      document.getElementById('related').textContent += 'related: no response';
	      return;
	    }
	    document.getElementById('related').innerHTML += "<b>Related:</b>" + response;
	  };
	  z.onerror = function() {
	    console.log('Network error.');
	  };
	z.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	z.send("url="+encodeURIComponent(document.getElementById('pageurl').textContent));
}

// geolocation stuff
function getLocation()
  {
  if (navigator.geolocation)
    {
    navigator.geolocation.getCurrentPosition(showPosition,showError);
    }
  else{locationDiv.innerHTML = "Geolocation is not supported by this browser.";}
  }
function onPositionData(geoData)
{
var geoJson = JSON.parse(geoData);
console.log(geoData);
locationDiv.innerHTML = locationDiv.innerHTML+"<span id=\"citystate\">"+geoJson.City+", "+geoJson.State+"</span> <span id=\"zipcode\">"+geoJson.Zip+"</span>";
console.log(locationDiv.innerHTML);
if ($("#locselector-input")) {
$("#locselector-input").attr("placeholder", $("#citystate").html() + " " + $("#zipcode").html());
$("#locselector-hidden").val($("#citystate").html() + " " + $("#zipcode").html());
}
}
function onNominatimData(nomData,e1,e2)
{
	console.log("nominatim call success: "+e2.responseText);
	document.getElementById('nominatim').textContent = nomData[0].display_name;
}
function onNominatimDataFail(nomData,e1,e2)
{
	console.log("nominatim call failure");
	document.getElementById('nominatim').textContent = nomData+e1+e2;
}
function showPosition(position)
  {
  myPosition = position;
  var maplink = "https://www.openstreetmap.org/#map=17/" + position.coords.latitude + "/" + position.coords.longitude;
  $("#locationHref").attr("href", maplink);
    $( "#locationHref" ).button( {
		icons: { primary: "ui-icon-pin-s", secondary: "ui-icon-extlink" },
		label: "Map (" + position.coords.latitude + "," + position.coords.longitude + ")"
	} );
  $("#locationHrefSpan").show();
  locationDiv.innerHTML = "<span style=\"display:none;\">Lat: <span id=\"latitude\">" + position.coords.latitude + "</span>, Long: <span id=\"longitude\">" + position.coords.longitude + "</span></span>";
$.ajax({
url: "https://www.woodsidelabs.com/qvdemo/zip/index.php",
data: {
lat: document.getElementById("latitude").innerHTML,
lon: document.getElementById("longitude").innerHTML
}
}).then(onPositionData);
$.ajax({
url: "http://nominatim.openstreetmap.org/search",
data: {
q: document.getElementById("latitude").innerHTML+","+document.getElementById("longitude").innerHTML,
format: "json",
addressdetails: "1"
}
}).then(onNominatimData,onNominatimDataFail);
}
function showError(error)
  {
  switch(error.code)
    {
    case error.PERMISSION_DENIED:
      locationDiv.innerHTML = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      locationDiv.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      locationDiv.innerHTML = "The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      locationDiv.innerHTML = "An unknown error occurred."
      break;
    }
  }

$(document).ready(function(){
	// configure buttons
$(function() {
    $( "#bookmarkDemoButton" ).button();
    $( "#bookmarkTagDemoButton" ).button();
    $( "#analysisDemoButton" ).button();
    $( "#sharePrivacyButton" ).button();
    $( "#sharePostButton" ).button();
    $( "#tcheck" ).button();
    $( "#tformat" ).buttonset();
  });
  // configure tabs
  $( function() {
      $( "#qvtoptabs" ).tabs();
  } );
  // configure tag autocomplete
  $(function() {
    var availableTags = [
      "ActionScript",
      "AppleScript",
      "Asp",
      "BASIC",
      "C",
      "C++",
      "Clojure",
      "COBOL",
      "ColdFusion",
      "Erlang",
      "Fortran",
      "Groovy",
      "Haskell",
      "Java",
      "JavaScript",
      "Lisp",
      "Perl",
      "PHP",
      "Python",
      "Ruby",
      "Scala",
      "Scheme"
    ];
    $( "#demotags" ).autocomplete({
      source: availableTags,
      select: function( event, ui ) {
	            $("#selectedTags").append(ui.item.label+" ");
	            return false;
        }
    });
  });
currentdate = new Date();
datetime = "Updated: " + (currentdate.getMonth()+1) + "/"
                + currentdate.getDate()  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
getLocation();
});
