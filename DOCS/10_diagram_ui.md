# Diagram UI

## Diagram Page
File: `src/pages/ISO7816DiagramPage.tsx`

Layout:
- Left: NodePalette
- Center: ReactFlow canvas
- Right: NodeEditor
- Bottom: ExecutionResultPanel

Key behaviors:
- Drag/drop nodes from palette and auto-connect to tail node.
- Edges are deletable; nodes sync to DiagramService on change.
- Node types mapped to `APDUNode` for consistent UI.
- Execution results update node status + processedData in real time.

## Node Editor
File: `src/components/diagram/NodeEditor.tsx`

Tabs:
- APDU: CLA/INS/P1/P2/Data/Le + command preview
- Crypto: algorithm/key/iv + data source controls
- Pipe: source node, priority, multi-segment editor
- Variables: save/use configs
- Meta: execution status, last response, processed data

Validation:
- Hex normalization (uppercase, even length)
- Inline errors for invalid hex inputs

## Pipe Editor
File: `src/components/diagram/PipeConfigEditor.tsx`

Features:
- Select source node
- Priority (pipe vs variable)
- Multi-segment slicing (offset/length)

## Execution Results
File: `src/components/diagram/ExecutionResultPanel.tsx`

- Progress bar (live)
- Per-node accordion output
- Crypto details (input/key/iv/output)
- Variables snapshot

## Node Card UI
File: `src/components/diagram/APDUNode.tsx`

- Status badges (Success/Error/Pending)
- SW display when available
- Data preview (response/processedData)

