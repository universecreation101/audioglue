audioglue
=========

A Chrome Extension for having audio files trigger when preselected sites are visited.


What does it do?
---------

This extension allows you to create a web audio adventure. The user visits some mandatory web pages and extension plays audio files associated with websites. The audio guides user how to reach next webpages.

Your web audio adventure may have few optional websites, and conditional webpages they must visit them before reaching the next mandatory node. 

How does it works?
---------

Extension uses background page and popup page with progress and controls.

Background page processes webpages navigation, playing audio and storing progress.

Popup page shows available episodes to user, progress in the current episode. User also may pause audio or rewind or forward it using this page.

How to create you own web audio adventure?
---------

Adventure nodes are defined in the [episodes.js](https://github.com/universecreation101/audioglue/blob/master/chrome/episodes.js). All episode's nodes combined into array of objects.

Every node object contains following fields:

- `id` is unique node identifier. Mandatory field.
- `urls` : is array of urls associated with the node. Extension checks tab url right after all redirects for exact match (case non-sensitive). Mandatory field.
- `secondary` : set this field to true to mark nodes as optional. This field is optional. Missed field means that website is mandatory to visit.
- `audio`: audio file associated with the website. It should use filename from "audio" folder. This is optional field, website may not have any associated audio file.

Once all nodes added to episode1 array an extension may be added to Chrome and used to start a new adventure.

An extension may have more than 1 episode. [header.js](https://github.com/universecreation101/audioglue/blob/master/chrome/js/header.js) and [header.html](https://github.com/universecreation101/audioglue/blob/master/chrome/js/header.html) should be modified accordingly to add additional buttons to start new episode. `setEpisode` function can be used to start new episode.

Credits
--------
Concept and interaction design by Christy Dena, Universe Creation 101. 
Chrome Extension implementation by Andrey Ivanov. 
Original iPad App by Craig Peebles, Airship Games. 
UI Art by Elroy.
Generic audio file supplied in this repository 'Groove_Loop' by Trevor Dikes, Soundplay Interactive.
