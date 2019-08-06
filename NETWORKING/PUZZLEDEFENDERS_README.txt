README

*** FOR WINDOWS Install Node.js ***

1.First Install Node.js.  Download from this website:
http://nodejs.org/#
The Download link should be the green button above the version number.

2.  Next set up Node.js in your path with these commands in the nodejs file directory 
through a command line.

For Windows Command line:

C:\node> set path=%PATH%;%CD%

C:\node> setx path "%PATH%"


Note: node folder name may also be nodejs
If not clear follow this link on how to install on windows:
http://www.hacksparrow.com/install-node-js-and-npm-on-windows.html


Note:  You do not need to do the "NPM on Windows" section



*** FOR MACS Install Node.js ***

Here are some links to follow to create paths to node.js on MACs.

http://howtonode.org/how-to-install-nodejs
http://shapeshed.com/setting-up-nodejs-and-npm-on-mac-osx/


*** HOW TO RUN THE SERVER ***
(The game cannot be run without it anymore)

0. If you do not have Chrome, go get Chrome.
https://www.google.com/intl/en/chrome/browser/#brand=CHMB&utm_campaign=en&utm_source=en-ha-na-us-sk&utm_medium=ha

1.  To run the server make sure you are in the same directory as the file server.js
Type in the command line "node server.js" to run it.

2.  Once the server is running, open up Chrome and type in "localhost:8080" in the web address
 to run a client on server.  To run another client type in the "localhost:8080" on another Chrome window to run two
 clients. You can also change this to your IP address if you want someone else to connect to your server.
