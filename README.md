# Welcome to the HTML Experimenter

Version 0.9.6(c) 2021 N Hattan issued under Creative Commons (BY-NC-SA)

## HTML Experimenter with Javascript Classes

This version uses an object oriented approach by creating an experimenter object that
holds the code for the page to be constructed, and renders it into a main area for
display to the user


## Ideas for this version ##

Introduce a list of valid tags e.g. ```["h1","h2","em",...]``` also single tags ```["br","img","hr","link"...]```

Check users tags against the list, don't close illegal tags, just pop and silently remove from the HTML output stream

## Alternative solution to develop ##
Devise a detection method for an opening tag, then immediately insert the corresponding closing tag and then insert the
cursor in the textarea at the point **inside** the pair of tags, also need to detect single tags and prevent a closing tag 
being inserted by mistake