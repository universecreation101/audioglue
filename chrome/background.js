/** @license
 *
 * This file is part of AudioGlue Chrome extension
 *
 * @copyright 2014, AUTHENTIC IN ALL CAPS.
 * All rights reserved.
 * http://www.authenticinallcaps.com
 *
 * @author Andrey Ivanov <andrey.v.ivanov@gmail.com>
 *
 */

// This file processes background page actions

// Current audio
var _audioUrl = null;
var _song = null;

// Current episode
var episode = episode1;
var _stageId = "";
var _stage = null;
var _stageTabId = -1;
var _windowId = -1;
var _listeners = [];

function getHeaderPosition(left, top) {
	var position = localStorage.headerPosition;
	if (position !== undefined) {
		return JSON.parse(position);
	}
	return undefined;
}

function setHeaderPosition(left, top) {
	localStorage.headerPosition = JSON.stringify({left: left, top: top});
}

function setHeaderPosition_(left, top) {
	localStorage.headerPosition_ = JSON.stringify({left: left, top: top});
}

function startAudio(url) {
	if (url != null) {
		stopAudio();
		_audioUrl = url
		debug("starting audio " + url);
		_song = new Audio('audio/' + url);
		_song.volume = 0.8;

		_song.addEventListener('ended', function() {
			notifyListeners("audioEnded", _audioUrl);
		});
		_song.play();
		notifyListeners("audioStarted", _audioUrl);
	}
}

function stopAudio() {
	debug("stopAudio");
	if (_song != null) {
    	_song.pause();
		_song = null;
		notifyListeners("audioEnded", _audioUrl);
	}
}

function playAudio() {
	if (_song != null) {
    	_song.play();
		notifyListeners("audioStarted", _audioUrl);
	}
}

function pauseAudio() {
	debug("pauseAudio");
	if (_song != null) {
    	_song.pause();
		notifyListeners("audioPaused", _audioUrl);
	}
}

function forwardAudio(offset) {
	if (_song != null) {
        _song.currentTime += offset;
	}
}

function resetAudio() {
	if (_song != null) {
        _song.currentTime = 0;
        playAudio();
	}
}

function debug(msg) {
	if (false) {
		console.log(msg);
	}
}

function start() {
	var id = localStorage.stage;
	if (id !== undefined) {
		for (var i = 0; i < episodes.length; ++i) {
			var episode = episodes[i];
			for (var j = 0; j < episode.length; ++j) {
				var stage = episode[j];
				if (stage.id == id) {
					setEpisode(episode);
					if (localStorage.visited != undefined) {
						visited = JSON.parse(localStorage.visited);
						for (var i = 0; i < episode.length; ++i) {
							episode[i].visited = visited[i];
						}
					}

					setCurrentStage(stage);
					openUrl(stage.urls[0])
					if (localStorage.audio !== undefined) {
						setTimeout(function() { if (_song != null) _song.currentTime = localStorage.audio;}, 100);
					}
					return;
				}
			}
		}
	}
	setEpisode(episode1);
}

function stop() {
	localStorage.stage = _stageId;
	var audioOffset = 0.0;
	if (_song != null && !_song.ended) {
		audioOffset = _song.currentTime;
	}
	localStorage.audio = audioOffset;

	var visited = [];
	for (var i = 0; i < episode.length; ++i) {
		visited[i] = episode[i].visited;
	}
	localStorage.visited = JSON.stringify(visited);

	stopAudio();
}

function addListener(listener) {
	_listeners.push(listener);
}

function removeListener(listener) {
	var index = _listeners.indexOf(listener);
	if (index >= 0) {
		_listeners.splice(index, 1);
	}
}

function findExpectedStage() {
	for (var i = 0; i < episode.length; ++i) {
		if (episode[i].id == _stageId) {
			if (i + 1 < episode.length) {
				return episode[i + 1];
			}
			return episode[i];
		}
	}
	return episode[0];
}

function findStageById(id) {
	for (var i = 0; i < episode.length; ++i) {
		var stage = episode[i];
		if (stage.id == id) {
			return stage;
		}
	}
	return null;
}

function notifyListeners(eventName, data) {
	var listeners = _listeners;
	for (var i = 0; i < listeners.length; ++i) {
		listeners[i](eventName, data);
	}
}

function setEpisode(e) {
	stopAudio();
	episode = e;
	_stageId = "";
	_stage = null;
	_stageTabId = -1;
}

function setCurrentStage(stage, url, tabId) {
	_stageId = stage.id;
	_stageTabId = tabId;
	_stage = stage;

	for (var i = 0; i < episode.length; ++i) {
		var s = episode[i];
		if (s.secondary) {
		} else {
			s.visited = true;
		}
		if (s.id == _stageId) {
			s.visited = true;
			break;
		}
	}

	notifyListeners("setStage", stage);
	startAudio(stage.audio);
}

function setStageById(id) {
	var stage = findStageById(id);
	if (stage != id) {
		if (stage.audio) {
			var msg = "Load Page? This will load the webpage and the audio of the new scene.";
			if (!confirm(msg)) {
				return;
			}
		}

		setCurrentStage(stage);
		return;
	}
}

function openUrl(url) {
	chrome.tabs.query({ url: chrome.extension.getURL("landingpage.html") }, function(tabs) {
		if (tabs.length <= 0) {
			var createDetails = { url: url };
			if (_windowId != -1) {
				chrome.windows.get(_windowId, function(w) {
					if (w !== undefined) {
						createDetails.windowId = _windowId;
					} else {
						var err = chrome.runtime.lastError;
					}
					chrome.tabs.create(createDetails);
				});
			}
		} else {
			chrome.tabs.update(tabs[0].id, { url: url, active: true });
		}
	});
}

chrome.browserAction.onClicked.addListener(function() {
    var w = 1024;
    var h = 85;

    landingWidth = Math.round(screen.width * 0.75);
    landingHeigth = Math.round(screen.height * 0.75) - h - 20;
    w = landingWidth;

    var left = Math.round((screen.width/2)-(w/2));
	var top = Math.round((screen.height/2)-(h/2));
	top = h;
    
	chrome.windows.get(_windowId, function(w) {
		if (w !== undefined) {
		} else {
		    chrome.windows.create({'url': 'landingpage.html', 'type': 'normal', "width": landingWidth, "height": landingHeigth, 'left': left, 'top': top + h + 15}, function(w) {
    			_windowId = w.id;
		    });
		    // Make Chrome happy
		    var err = chrome.runtime.lastError;
		}
	});

	chrome.tabs.query({ url: chrome.extension.getURL("header.html") }, function(tabs) {
		if (tabs.length == 0) {
			chrome.windows.create({'url': 'header.html', 'type': 'panel', 'width': w, 'height': h, 'left': left, 'top': top, 'focused': true});
		}
	});
});

function processUrl(tab) {
	if (_stageTabId == tab.id) {
		_stageTabId = -1;
	}
	var url = tab.url.toLowerCase();
	for (var i = 0; i < episode.length; ++i) {
		var stage = episode[i];
		if (stage.visited) continue;

		if (stage.urlMatch) {
		    if (stage.urlMatch(url)) {
				setCurrentStage(stage, tab.url, tab.id);
		    }
			return;
		}
		for (var j = 0; j < stage.urls.length; ++j) {
			if (url == stage.urls[j].toLowerCase()) {
				setCurrentStage(stage, tab.url, tab.id);
				return;
			}
		}
		// nothing more to check here
		if (!stage.secondary && !stage.nonode) { 
			return;
		}
	}
}

chrome.tabs.onReplaced.addListener(function(tabId, oldTabId) {
	chrome.tabs.get(tabId, function(tab){
		if (tab !== undefined) {
			processUrl(tab);
		}
	});
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status == "loading") {
		processUrl(tab);
	}
});



chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {
	if (_stageTabId == tabId) {
		//pauseAudio();
	}
});
