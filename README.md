# GraphPlayground

This repository contains a *web application* for "exploring" and visualizing graphs including some popular graph algorithms.

## About

GraphPlayground is a web application for exploring & visualizing graphs including some popular graph algorithms (see below for a list of supported/implemented algorithms).<br>
It allows you to play around with graphs and graph algorithms in an interactive manner.

The benefits of this tool are that you do NOT need to install anything on your local machine. Everything runs in the browser.<br>
You can create, import, export and visualize graphs. Furthermore, you can run algorithms on a graph and visualize the result.<br>

Supported algorithms:

- Eulerian path/cycle by using Hierholzer's algorithm (*Only one path is computed. However, there might exist more than one path*)
- Prim
- Dijkstra
- Bellman-Ford
- Floyd-Warshall
- Edmond-Karps
- Find a negative-weight cycle (*There might exist more than on cycle!*)
- Aribtrage as an application of finding a negative-weight cycle
- 2-Approximation of the TSP as an application of finding a minimal spanning tree and eulerian path/cycle
- Pre-/In-/Post-/Levelorder traversal

## Usage

The usage of the application should be more or less intuitive.

**Important things to understand:**

- Graphs are always imported/exported as an **edge list** (hence, they are **directed graphs**).
- You can switch between directed and undirected graph by pressing 'd'.
- You can not edit/change the graph in the *result view*. You can leave the result view by pressing 'r'.

### Create a random graph
Click on "Graph" -> "Random".

### Clear/Remove the current graph
Click on "Graph" -> "Clear".

### Import & Export graphs
You can import/export graphs to/from files or to/from text (the data is equivalent in all cases).<br>
Import by "Graph" -> "Import" -> "From text" or "From file"<br>
Export by "Graph" -> "Export" -> "To text" or "To File"<br>

### Add a node
Click on "Edit" (only if the edit menu is not already displayed) and click on "Add Node". Click somewhere in the space where you want the new node to appear and finally enter the value/label of the new node.

### Add an edge
Click on "Edit" (only if necessary) and click on "Add edge". Next, connect two nodes by selecting a node and holding the mouse button while moving to the other node (Note: The direction matters in a directed graph only!).

### Switch between directed and undirected graphs
Press 'd' to switch.

### Edit the label of a node
Select the node and press 'e' or use the 'Edit' menu. A dialog pops up where you can change the label of the node.

### Edit the label of an edge
Select the edge and press 'e'. A dialog pops up where you can edit the label of the node.

### Edit an edge
Select the edge and click on 'Edit Edge' in the 'Edit' menu. You can now change the endpoints of the edge by drag & drop.

### Remove a node or edge
Select the item which you want to delete. Click on "Edit" (if the edit menu is not already enabled) and finally on "Delete selected".

### Run an algorithm on the current graph
If necessary (depends on the algorithm), first select (a) node(s) and then select the algorithm by clicking on it's name in the menu "Algorithms". The algorithm is executed and the application switches into the **result view**.

**Note:** If you have to select multiple nodes (e.g. start and end node) make sure that you select them in the right order (the first node is the start node, the second node is the end node).

### The result view
The result view visualizes the result of the current/last executed algorithm. The visualization depends on the algorithm and may allow user interactions (e.g. the shortest path algorithms do so).<br>
Sometimes you can switch between different views by pressing 't'.

### Leave the result view and return to the default view
Press 'r' or click on "Graph" -> "Reset".

## Requirements

- Modern web browser (this application was testet with Firefox 59 and Chromium 65)

## Technical stuff

This project uses *HTML5*, *JavaScript*, *CSS3* and some third party components/libraries (see *Third party components* section for more details).

## How to build

**ATTENTION:** If you are using the **Firefox web browser** the application should work out of the box by simply opening `index.htm` in the browser.<br>
If you are using the **Chromium web browser** you have to run the application in a local web server (or simply use a hosted version in the internet).<br>
You only need to build it if you need/want a cleaned & compressed version for (easier) deployment.

You need a bash shell with the build tool make (e.g. [GNU Make](https://www.gnu.org/software/make/)), [nodejs](https://github.com/nodejs) and [npm](https://github.com/npm/npm)(usually it is already shipped with node).

You can build the application by running `make` from the root directory. This will install some local dependencies, build the app and create a folder *dist* containing all necessary files for deployment.<br>
You can delete all files and directories created by `make` by running `make clear`.

## Third party components

- [dialog-polyfill](https://github.com/GoogleChrome/dialog-polyfill)
- [graphlib](https://github.com/dagrejs/graphlib)
- [vis.js](https://github.com/almende/vis)

For building only:

- [grunt](https://github.com/gruntjs/grunt)
- [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator) (incl. [grunt-javascript-obfuscator](https://github.com/tomasz-oponowicz/grunt-javascript-obfuscator))
- [node-htmlprocessor](https://github.com/dciccale/node-htmlprocessor) (incl. [grunt-processhtml](https://github.com/dciccale/grunt-processhtml))
- [html-minifier](https://github.com/kangax/html-minifier) (incl. [grunt-contrib-htmlmin](https://github.com/gruntjs/grunt-contrib-htmlmin))
- [vulcanize](https://github.com/Polymer/polymer-bundler) (incl. [grunt-vulcanize](https://github.com/googlearchive/grunt-vulcanize))
- [grunt-contrib-concat](https://github.com/gruntjs/grunt-contrib-concat)
- [grunt-contrib-copy](https://github.com/gruntjs/grunt-contrib-copy)
- [grunt-contrib-clean](https://github.com/gruntjs/grunt-contrib-clean)

## Contribution

Collaboration/Contributions/Pull-requests are highly welcome. Feel free to contact me.

## License

Licensed under MIT license (see LICENSE for more details including licenses of third party components).