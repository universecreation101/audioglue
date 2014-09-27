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

// this file is used by popup page to handle havigation and respond to user interactions

// this variable holds stage user is visiting
var _stage = null;
// golab var to save currently playing button click sound
var _clickSound = null;

$(document).ready(function(){
	var bg = chrome.extension.getBackgroundPage();

	$("#episode-1, .show-episodes, .show-faq, .show-credits").click(playClick);
	$(".reset, .fwd, .rew, .pause, .play").click(playPause);

	$(".show-episodes").click(function() {
  		if ($("#episodes").is(":visible")) {
  			showNodes();
  		} else {
  			showEpisodes();
  		}
	});
	$("#episode-1").click(function() {
	    setEpisode(bg.episode1);
	});

    // play click
    $('.play').click(function (e) {
        e.preventDefault();

        toggleAudioControls(true);
        bg.playAudio();
    });

    // pause click
    $('.pause').click(function (e) {
        e.preventDefault();

        bg.pauseAudio();
    });

    // forward click
    $('.fwd').click(function (e) {
        e.preventDefault();

        bg.forwardAudio(5.0);
    });

    // rewind click
    $('.rew').click(function (e) {
        e.preventDefault();

        bg.forwardAudio(-5.0);
    });
    
    // reset click
    $('.reset').click(function (e) {
        e.preventDefault();
       	resetEpisode();
    });


  	$(window).on("beforeunload", function() {
  	    // stop adventure (stop currenty playing audio)
  		bg.stop();
    	bg.removeListener(__OnMainEvent);
    	bg.setHeaderPosition(window.screenLeft, window.screenTop);
    });
    bg.addListener(__OnMainEvent);

    toggleAudioControls(false);
    bg.start();
});

function showEpisodes() {
	if ($("#nodes").is(":visible")) {
		$("#nodes").fadeToggle("100", function() {
    		$("#episodes").fadeToggle("1000");
	  	});
	}
}

function showNodes() {
	if ($("#episodes").is(":visible")) {
		$("#episodes").fadeToggle("100", function() {
    		$("#nodes").fadeToggle("1000");
	  	});
	}
}

function getClassName(stage, activeStageId) {
	if (stage.secondary) {
		if (stage.id == activeStageId) return "secondary-node-active";
		return stage.visited ? "secondary-node" : "secondary-node-undiscovered";
	}
	if (stage.id == activeStageId) return "node-active";
	return stage.visited ? "node" : "node-undiscovered";
}

function resetEpisode() {
	var bg = chrome.extension.getBackgroundPage();
	var episodeName = "episode";
	if (bg.episode == bg.episode1) {
		episodeName = "episode 1";
	} else if (bg.episode == bg.episode2) {
		episodeName = "episode 2";
	} else if (bg.episode == bg.episode3) {
		episodeName = "episode 3";
	}
	var msg = "Reset Episode? This will delete your progress for " + episodeName;

	if (!confirm(msg)) {
		return;
	}
	setEpisode(bg.episode);
}

function setEpisode(episode) {
	_stage = null;
	var bg = chrome.extension.getBackgroundPage();
	for (var i = 0; i < episode.length; ++i) {
		episode[i].visited = false;
	}
	bg.setEpisode(episode)
	bg.openUrl(bg.episode[0].urls[0]);
}

function setStage(episode, stage) {
	_stage = stage;
	var nodes = $("#nodes p");
	nodes.empty();

	var activeStage = stage != null ? stage : episode[0];
	for (var i = 0; i < episode.length; ++i) {
		if (episode[i].noNode) {
			continue;
		}
		var id = episode[i].id;
		nodes.append("<div class='" + getClassName(episode[i], activeStage.id) + "' id='" + id + "' ></div>");
	}
	$(".node, .secondary-node").click(__OnNodeClick);
}

function playNodeClick() {
	playOnClick("_Click.m4a")
}

function playClick() {
	playOnClick("_Click.m4a")
}

function playEnter() {
	playOnClick("_Click.m4a")
}

function playPause() {
	playOnClick("_Click.m4a")
}

function playOnClick(url) {
	_clickSound = new Audio('audio/' + url);
	_clickSound.volume = 0.8;
	_clickSound.play();
}

function __OnNodeClick(e) {
	playNodeClick();
	setTimeout(function() {
		var bg = chrome.extension.getBackgroundPage();
		bg.setStageById(e.target.id);
		var stage = bg.findStageById(e.target.id);
		if (stage != null) {
			bg.openUrl(stage.urls[0]);
		}

	}, 10);
}

function __OnMainEvent(name, data) {
	if (name == "setStage" ) {
		if (_stage == null) {
			showNodes();
		}
		var episode = chrome.extension.getBackgroundPage().episode;
		setStage(episode, data);
	} else if (name == "audioStarted") {
		toggleAudioControls(data != null);
	} else if (name == "audioEnded" || name == "audioPaused") {
		toggleAudioControls(false);
	}
}

function toggleAudioControls(playing) {
    $('.play').toggle(!playing);
	$('.pause').toggle(playing);
}
