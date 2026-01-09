# Diagram Model

## Legacy Types
File: `src/types/diagram.types.ts`

Core types:
- `DiagramData` (id, name, nodes, edges, timestamps)
- `DiagramNode` (id, type, position, data)
- `DiagramEdge` (source/target)
- `NodeExecutionResult` (execution output and metadata)

Node data fields:
- `parameters`: APDU params (CLA/INS/P1/P2/Data/Le)
- `cryptoConfig`: algorithm/key/iv
- `pipeConfig` and `pipeConfigB`: data sources for pipe/concat
- `variableConfig`: save/use configs
- `response`, `processedData`, `executed`, `error`

PipeConfig:
- `sourceNodeId`, `dataOffset`, `dataLength`
- optional `segments[]` for multi-slice concat
- optional `priority` (pipe vs variable)

## V2 Types
File: `src/types/diagram.v2.types.ts`

- `DiagramDataV2` with `schemaVersion: 2`
- `DiagramNodeV2` with `kind: APDU|CRYPTO|CONCAT`
- `DataSourceV2` supports `literal`, `variable`, `pipe`
- `VariableSaveConfigV2` for save operations

## Conversion
File: `src/core/services/DiagramV2Converter.ts`

- `convertDiagramV2ToLegacy()`
  - Maps V2 nodes to legacy `DiagramNode`
  - Sets default APDU parameter list
  - Converts data sources into params / pipe / variables
- `convertDiagramLegacyToV2()`
  - Maps legacy nodes to V2 schema
  - Converts `pipeConfig` and variable usage into `DataSourceV2`

Saving behavior:
- `DiagramService.saveDiagram()` saves as V2 JSON.
- `loadDiagramFromFile()` accepts V1 or V2 and converts to legacy.

