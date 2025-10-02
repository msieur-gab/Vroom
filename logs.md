Example: window.vroom.addNode(25) adds 25km to your journey!
  window.vroom.clear()
  window.vroom.addNode(0)
  window.vroom.addNode(100)  // Should create right → right transition 
  window.vroom.addNode(20)
app.js:136 🧹 Clearing all data...
TravelGrid.js:141 Grid cleared
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×272px
CanvasJourneyGrid.js:814 🧹 All canvas nodes cleared
MilestoneEngine.js:155 🧹 All milestones reset
app.js:95 📍 Adding node: +0km trip → 0km total (real)
TravelGrid.js:75 Added node node_1 at grid(col: 0, row: 0) - 0km
CanvasJourneyGrid.js:124 🐍 Serpentine: 0km → cell 0 → row 0 (L→R) → col 0
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×272px
CanvasJourneyGrid.js:153 🎨 Added start node at 0km → (0, 0)
app.js:95 📍 Adding node: +100km trip → 100km total (real)
TravelGrid.js:75 Added node node_2 at grid(col: 0, row: 1) - 81km
CanvasJourneyGrid.js:124 🐍 Serpentine: 81km → cell 5 → row 1 (R→L) → col 4
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×272px
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 0: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
CanvasJourneyGrid.js:153 🎨 Added regular node at 81km → (1, 4)
MilestoneEngine.js:96 🏆 Milestone unlocked: First Steps (5km)
MilestoneEngine.js:96 🏆 Milestone unlocked: Explorer (25km)
MilestoneEngine.js:96 🏆 Milestone unlocked: Century Mark (100km)
app.js:270 🎉 ACHIEVEMENT UNLOCKED: 👶 First Steps
app.js:271    Every journey begins with a single step
app.js:272    Distance: 5km
app.js:250 🎨 Adding milestone node: First Steps at 5km
TravelGrid.js:75 Added node node_3 at grid(col: 1, row: 0) - 4.99km
CanvasJourneyGrid.js:124 🐍 Serpentine: 4.99km → cell 1 → row 0 (L→R) → col 1
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×272px
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 0: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 1: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
CanvasJourneyGrid.js:153 🎨 Added milestone node at 4.99km → (0, 1)
app.js:270 🎉 ACHIEVEMENT UNLOCKED: 🧭 Explorer
app.js:271    You're getting the hang of this adventure thing!
app.js:272    Distance: 25km
app.js:250 🎨 Adding milestone node: Explorer at 25km
TravelGrid.js:75 Added node node_4 at grid(col: 2, row: 0) - 24.99km
CanvasJourneyGrid.js:124 🐍 Serpentine: 24.99km → cell 2 → row 0 (L→R) → col 2
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×272px
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 0: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 1: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 2: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
CanvasJourneyGrid.js:153 🎨 Added milestone node at 24.99km → (0, 2)
app.js:270 🎉 ACHIEVEMENT UNLOCKED: 💯 Century Mark
app.js:271    100 kilometers of memories captured
app.js:272    Distance: 100km
app.js:250 🎨 Adding milestone node: Century Mark at 100km
TravelGrid.js:75 Added node node_5 at grid(col: 0, row: 1) - 99.99km
CanvasJourneyGrid.js:124 🐍 Serpentine: 99.99km → cell 5 → row 1 (R→L) → col 4
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×272px
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 0: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 1: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 2: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=8, end=8
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 3: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
CanvasJourneyGrid.js:153 🎨 Added milestone node at 99.99km → (1, 4)
app.js:95 📍 Adding node: +20km trip → 119.99km total (real)
TravelGrid.js:75 Added node node_6 at grid(col: 1, row: 1) - 101km
CanvasJourneyGrid.js:124 🐍 Serpentine: 101km → cell 6 → row 1 (R→L) → col 3
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×272px
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 0: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 1: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 2: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=8, end=8
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 3: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 4: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
CanvasJourneyGrid.js:153 🎨 Added regular node at 101km → (1, 3)
{nodeId: 'node_6', gridCellId: {…}, cumulativeDistance: 101, realDistance: 119.99}

  window.vroom.addNode(0)
  window.vroom.addNode(100)  // Should create right → right transition 
  window.vroom.addNode(20)
app.js:95 📍 Adding node: +0km trip → 119.99km total (real)
TravelGrid.js:75 Added node node_7 at grid(col: 1, row: 1) - 101km
CanvasJourneyGrid.js:124 🐍 Serpentine: 101km → cell 6 → row 1 (R→L) → col 3
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×272px
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 0: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 1: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 2: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=8, end=8
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 3: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 4: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
CanvasJourneyGrid.js:153 🎨 Added regular node at 101km → (1, 3)
app.js:95 📍 Adding node: +100km trip → 219.99km total (real)
TravelGrid.js:75 Added node node_8 at grid(col: 1, row: 2) - 201km
CanvasJourneyGrid.js:124 🐍 Serpentine: 201km → cell 11 → row 2 (L→R) → col 1
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×356px
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 0: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 1: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 2: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=8, end=8
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 3: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 4: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for left→left: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 5: left → left (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
CanvasJourneyGrid.js:153 🎨 Added regular node at 201km → (2, 1)
app.js:95 📍 Adding node: +20km trip → 239.99km total (real)
TravelGrid.js:75 Added node node_9 at grid(col: 2, row: 2) - 221km
CanvasJourneyGrid.js:124 🐍 Serpentine: 221km → cell 12 → row 2 (L→R) → col 2
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×356px
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 0: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 1: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 2: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=8, end=8
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 3: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 4: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for left→left: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 5: left → left (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 6: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
CanvasJourneyGrid.js:153 🎨 Added regular node at 221km → (2, 2)
{nodeId: 'node_9', gridCellId: {…}, cumulativeDistance: 221, realDistance: 239.99}
  
  window.vroom.addNode(24)
  window.vroom.addNode(73)  // Should create right → right transition 
  window.vroom.addNode(32)
  window.vroom.addNode(12)
  window.vroom.addNode(56)  // Should create right → right transition 
  window.vroom.addNode(23)
app.js:95 📍 Adding node: +24km trip → 263.99km total (real)
TravelGrid.js:75 Added node node_10 at grid(col: 4, row: 2) - 261km
CanvasJourneyGrid.js:124 🐍 Serpentine: 261km → cell 14 → row 2 (L→R) → col 4
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×356px
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 0: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 1: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 2: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=8, end=8
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 3: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 4: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
 🔍 A* result for left→left: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 5: left → left (3) [{…}, {…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=14, end=14
 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 6: right → left (2) [{…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=14, end=14
 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 7: right → left (2) [{…}, {…}]
 🔍 Path orthogonal: true
 🎨 Added regular node at 261km → (2, 4)
 🏆 Milestone unlocked: Road Warrior (250km)
 🎉 ACHIEVEMENT UNLOCKED: 🏆 Road Warrior
    Serious traveler status achieved
    Distance: 250km
 🎨 Adding milestone node: Road Warrior at 250km
 Added node node_11 at grid(col: 3, row: 2) - 249.99km
 🐍 Serpentine: 249.99km → cell 13 → row 2 (L→R) → col 3
 🎨 Canvas resized: 424×356px
 🔗 Connections: start=14, end=14
 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 0: right → left (2) [{…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=14, end=14
 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 1: right → left (2) [{…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=20, end=20
 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 2: right → right (3) [{…}, {…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=8, end=8
 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 3: left → right (2) [{…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=14, end=14
 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 4: left → right (2) [{…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=20, end=20
 🔍 A* result for left→left: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 5: left → left (3) [{…}, {…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=14, end=14
 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 6: right → left (2) [{…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=14, end=14
 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 7: right → left (2) [{…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=14, end=14
 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 8: right → left (2) [{…}, {…}]
 🔍 Path orthogonal: true
 🎨 Added milestone node at 249.99km → (2, 3)
 📍 Adding node: +73km trip → 336.99km total (real)
 Added node node_12 at grid(col: 3, row: 3) - 341km
 🐍 Serpentine: 341km → cell 18 → row 3 (R→L) → col 1
 🎨 Canvas resized: 424×440px
 🔗 Connections: start=14, end=14
 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 0: right → left (2) [{…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 1: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 2: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=8, end=8
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 3: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 4: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for left→left: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 5: left → left (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 6: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 7: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 8: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 9: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
CanvasJourneyGrid.js:153 🎨 Added regular node at 341km → (3, 1)
app.js:95 📍 Adding node: +32km trip → 368.99km total (real)
TravelGrid.js:75 Added node node_13 at grid(col: 0, row: 4) - 381km
CanvasJourneyGrid.js:124 🐍 Serpentine: 381km → cell 20 → row 4 (L→R) → col 0
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×524px
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 0: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 1: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 2: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=8, end=8
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 3: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 4: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for left→left: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 5: left → left (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 6: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 7: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 8: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 9: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for left→left: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 10: left → left (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
CanvasJourneyGrid.js:153 🎨 Added regular node at 381km → (4, 0)
app.js:95 📍 Adding node: +12km trip → 380.99km total (real)
TravelGrid.js:75 Added node node_14 at grid(col: 1, row: 4) - 401km
CanvasJourneyGrid.js:124 🐍 Serpentine: 401km → cell 21 → row 4 (L→R) → col 1
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×524px
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 0: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 1: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 2: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=8, end=8
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 3: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 4: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for left→left: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 5: left → left (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 6: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 7: right → left (2) [{…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=14, end=14
 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 8: right → left (2) [{…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=20, end=20
 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 9: right → right (3) [{…}, {…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=20, end=20
 🔍 A* result for left→left: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 10: left → left (3) [{…}, {…}, {…}]
 🔍 Path orthogonal: true
 🔗 Connections: start=14, end=14
 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
 🛣️ Path 11: right → left (2) [{…}, {…}]
 🔍 Path orthogonal: true
CanvasJourneyGrid.js:153 🎨 Added regular node at 401km → (4, 1)
app.js:95 📍 Adding node: +56km trip → 436.99km total (real)
TravelGrid.js:75 Added node node_15 at grid(col: 4, row: 4) - 461km
CanvasJourneyGrid.js:124 🐍 Serpentine: 461km → cell 24 → row 4 (L→R) → col 4
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×524px
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 0: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 1: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 2: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=8, end=8
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 3: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 4: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for left→left: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 5: left → left (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 6: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 7: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 8: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 9: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for left→left: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 10: left → left (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 11: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 12: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
CanvasJourneyGrid.js:153 🎨 Added regular node at 461km → (4, 4)
app.js:95 📍 Adding node: +23km trip → 459.99km total (real)
TravelGrid.js:75 Added node node_16 at grid(col: 1, row: 5) - 501km
CanvasJourneyGrid.js:124 🐍 Serpentine: 501km → cell 26 → row 5 (R→L) → col 3
CanvasJourneyGrid.js:83 🎨 Canvas resized: 424×608px
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 0: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 1: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 2: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=8, end=8
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 3: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for left→right: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 4: left → right (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for left→left: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 5: left → left (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 6: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 7: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 8: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 9: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for left→left: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 10: left → left (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 11: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=14, end=14
OrthogonalPathfinder.js:65 🔍 A* result for right→left: {path: Array(2), pathLength: 2, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 12: right → left (2) [{…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
OrthogonalPathfinder.js:59 🔗 Connections: start=20, end=20
OrthogonalPathfinder.js:65 🔍 A* result for right→right: {path: Array(3), pathLength: 3, startPoint: {…}, endPoint: {…}, fromRect: {…}, …}
CanvasJourneyGrid.js:300 🛣️ Path 13: right → right (3) [{…}, {…}, {…}]
CanvasJourneyGrid.js:313 🔍 Path orthogonal: true
CanvasJourneyGrid.js:153 🎨 Added regular node at 501km → (5, 3)
{nodeId: 'node_16', gridCellId: {…}, cumulativeDistance: 501, realDistance: 459.99}