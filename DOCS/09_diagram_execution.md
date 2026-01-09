# Diagram Execution

## DiagramService
File: `src/core/services/DiagramService.ts`

Execution flow:
1) Ensure card is connected via `ISO7816Service.connectCard()`.
2) Compute execution order using topological sort.
3) For each node:
   - Auto-assign pipeConfig for crypto nodes if incoming edge exists.
   - Execute via `NodeExecutor`.
   - Build `NodeExecutionResult` with:
     - `outputData` (processedData/cryptoMeta/output or response.data)
     - crypto details (`cryptoInput`, `cryptoKey`, `cryptoIv`, `cryptoOutput`)
   - Call `onNodeResult([...results])` for live progress updates.
4) Honor `stopOnError` to break early.

## NodeExecutor
File: `src/core/services/NodeExecutor.ts`

APDU execution:
- Uses parameters `CLA/INS/P1/P2/Data/Le`.
- Data source priority: variable -> pipe -> literal.
- Builds APDU with LC/Le and stores `lastCommandHex` on node.

Crypto execution:
- `ENCRYPT_DATA` / `DECRYPT_DATA` use `CryptoUtils`.
- Data source priority: variable -> pipe -> literal.
- Stores `processedData` and `cryptoMeta` for UI.

Concat execution:
- `CONCAT_DATA` merges A + B.
- A: variable -> pipeConfig -> `AData`
- B: variable (keyVar) -> pipeConfigB -> `BData`

Pipes:
- `PipeConfig` supports offsets and multi-segment slices.
- `extractPipeDataFromConfig()` reads from `processedData` first, then `response.data`.

Variables:
- `saveVariables()` extracts slices from response/processedData by offset/length.

## Execution Result UI
- `ExecutionResultPanel` shows progress, success/error, response, variables, crypto details.
- `Final Output` is derived from the last successful result with `outputData`.

