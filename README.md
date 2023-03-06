# servicenow_rack_hardware

currently all of the functions in this push data back to the client side individually. this needs to be changed so that it returns a single data structure while still on the server side, so that different apps can then use that data for further queries, keeping everything in one server side process.

a lot of these functions need to be stripped out, leaving only the essentials common to all apps.

this has be set up to run in snd_xplore.do