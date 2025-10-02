# U-Turn Direction Test Scenarios

Grid cells are numbered: |1|2|3|4|5| (left to right)
- L2R = Left-to-Right row (even rows: 0, 2, 4...)  
- R2L = Right-to-Left row (odd rows: 1, 3, 5...)

Expected direction: Should curve toward the **shorter horizontal distance** (downward-right or downward-left)

## Test Cases

### From L2R to R2L (Even to Odd row)

**L2R 1 → R2L 1**: From cell 1 to cell 1 (same position)
- Expected: Downward-right (traditional serpentine)
- Actual: [ ] Pass [ ] Fail - Direction: ____________

**L2R 1 → R2L 2**: From cell 1 to cell 2 (move right)  
- Expected: Downward-right (following rightward movement)
- Actual: [ ] Pass [ ] Fail - Direction: ____________

**L2R 2 → R2L 1**: From cell 2 to cell 1 (move left)
- Expected: Downward-left (following leftward movement)  
- Actual: [ ] Pass [ ] Fail - Direction: ____________

**L2R 3 → R2L 4**: From cell 3 to cell 4 (move right)
- Expected: Downward-right (following rightward movement)
- Actual: [ ] Pass [ ] Fail - Direction: ____________

**L2R 4 → R2L 2**: From cell 4 to cell 2 (move left)
- Expected: Downward-left (following leftward movement)
- Actual: [ ] Pass [ ] Fail - Direction: ____________

**L2R 5 → R2L 5**: From cell 5 to cell 5 (same position)
- Expected: Downward-left (traditional serpentine) 
- Actual: [ ] Pass [ ] Fail - Direction: ____________

### From R2L to L2R (Odd to Even row)

**R2L 1 → L2R 1**: From cell 1 to cell 1 (same position)
- Expected: Downward-left (traditional serpentine)
- Actual: [ ] Pass [ ] Fail - Direction: ____________

**R2L 1 → L2R 2**: From cell 1 to cell 2 (move right)
- Expected: Downward-right (following rightward movement)
- Actual: [ ] Pass [ ] Fail - Direction: ____________

**R2L 2 → L2R 1**: From cell 2 to cell 1 (move left)  
- Expected: Downward-left (following leftward movement)
- Actual: [ ] Pass [ ] Fail - Direction: ____________

**R2L 4 → L2R 3**: From cell 4 to cell 3 (move left)
- Expected: Downward-left (following leftward movement)
- Actual: [ ] Pass [ ] Fail - Direction: ____________

**R2L 5 → L2R 3**: From cell 5 to cell 3 (move left) 
- Expected: Downward-left (following leftward movement)
- Actual: [ ] Pass [ ] Fail - Direction: ____________

**R2L 5 → L2R 5**: From cell 5 to cell 5 (same position)
- Expected: Downward-right (traditional serpentine)
- Actual: [ ] Pass [ ] Fail - Direction: ____________

## Notes
- Direction format: "upward-left", "upward-right", "downward-left", "downward-right" 
- All curves should be **downward** - any upward curves are incorrect
- The horizontal direction (left/right) should follow the cell movement