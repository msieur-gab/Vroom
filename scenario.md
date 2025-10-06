Scenario 1:
  - Row 0 nodes at columns: [0, 1, 3]
  - Row 1 nodes at columns: [2]
  - Row 0 direction: L→R (even)
  - Row 1 direction: R→L (odd)
  - Path needs to connect: node at (row 0, col 3) → node at (row 1, col 2)
  - Expected waypoints between these nodes: [(row 0, col 3), (row 1, col 3)]

  Scenario 2:
  - Row 0 nodes at columns: [0, 1, 2]
  - Row 1 nodes at columns: [2,0]
  - Row 2 nodes at columns: [0,3]
  - Row 0 direction: L→R (even)
  - Row 1 direction: R→L (odd)
  - Row 2 direction: L→R (even)
  - Path needs to connect: node at (row 0, col 2) → node at (row 1, col 2) and (row 1, col 0) → node at (row 2, col 0)
  - Expected waypoints between these nodes: [(row 0, col 2), (row 1, col 2),(row 1,col 0),(row 2,col 0)]

   Scenario 3:
  - Row 0 nodes at columns: [0, 1, 3]
  - Row 1 nodes at columns: [1, 2]
  - Row 2 nodes at columns: [1,3]
  - Row 0 direction: L→R (even)
  - Row 1 direction: R→L (odd)
  - Row 2 direction: L→R (even)
  - Path needs to connect: node at (row 0, col 3) → node at (row 1, col 2) and (row 1, col 1) → node at (row 2, col 1)
  - Expected waypoints between these nodes: [(row 0, col 3), (row 1, col 3),(row 1,col 1),(row 2,col 1)]