# APDU Diagram 파일 형식 (.apdu)

## 📄 파일 확장자
`.apdu` - APDU Diagram 전용 파일 형식 (내부는 JSON)

## 📋 파일 구조

```json
{
  "id": "uuid-v4",
  "name": "다이어그램 이름",
  "description": "다이어그램 설명 (선택사항)",
  "version": "1.0.0",
  "createdAt": "2025-12-30T12:00:00.000Z",
  "updatedAt": "2025-12-30T13:00:00.000Z",
  "nodes": [
    {
      "id": "node-uuid",
      "type": "SELECT_AID | GET_CHALLENGE | INTERNAL_AUTH | EXTERNAL_AUTH | READ_RECORD | READ_BINARY | CUSTOM_APDU | ENCRYPT_DATA | DECRYPT_DATA",
      "position": {
        "x": 100,
        "y": 200
      },
      "data": {
        "label": "노드 레이블",
        "parameters": [
          {
            "name": "파라미터 이름",
            "value": "파라미터 값",
            "type": "hex | string | number",
            "description": "설명 (선택사항)"
          }
        ],
        "cryptoConfig": {
          "algorithm": "NONE | DES | TRIPLE_DES | AES | SEED",
          "key": "hex 문자열",
          "iv": "hex 문자열 (선택사항)"
        },
        "pipeConfig": {
          "sourceNodeId": "이전 노드 ID",
          "dataOffset": 0,
          "dataLength": -1
        },
        "executed": false,
        "response": {
          "data": "hex 문자열",
          "sw1": "90",
          "sw2": "00",
          "statusCode": "9000",
          "success": true
        },
        "error": "에러 메시지 (있을 경우)"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-uuid",
      "source": "소스 노드 ID",
      "target": "타겟 노드 ID",
      "type": "default | success | error"
    }
  ]
}
```

## 🔑 필드 설명

### DiagramData
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | ✅ | UUID v4 |
| name | string | ✅ | 다이어그램 이름 |
| description | string | ❌ | 설명 |
| version | string | ✅ | 파일 형식 버전 |
| createdAt | ISO 8601 | ✅ | 생성 시간 |
| updatedAt | ISO 8601 | ✅ | 수정 시간 |
| nodes | Node[] | ✅ | 노드 배열 |
| edges | Edge[] | ✅ | 연결선 배열 |

### Node Types
- `SELECT_AID`: AID 선택
- `GET_CHALLENGE`: 챌린지 요청
- `INTERNAL_AUTH`: 내부 인증
- `EXTERNAL_AUTH`: 외부 인증
- `READ_RECORD`: 레코드 읽기
- `READ_BINARY`: 바이너리 읽기
- `CUSTOM_APDU`: 커스텀 APDU
- `ENCRYPT_DATA`: 데이터 암호화 ⭐ 신규
- `DECRYPT_DATA`: 데이터 복호화 ⭐ 신규

### PipeConfig (암복호화 전용)
| 필드 | 타입 | 설명 |
|------|------|------|
| sourceNodeId | string | 이전 노드 ID (파이프 소스) |
| dataOffset | number | 데이터 시작 오프셋 (바이트) |
| dataLength | number | 읽을 데이터 길이 (-1 = 전체) |

### CryptoConfig
| 필드 | 타입 | 설명 |
|------|------|------|
| algorithm | enum | DES, TRIPLE_DES, AES, SEED |
| key | string | 암호화 키 (hex) |
| iv | string | 초기화 벡터 (hex, 선택사항) |

## 📝 예제 파일

### 예제 1: 간단한 SELECT + READ
```json
{
  "id": "12345678-1234-1234-1234-123456789abc",
  "name": "카드 기본 정보 읽기",
  "description": "AID 선택 후 레코드 읽기",
  "version": "1.0.0",
  "createdAt": "2025-12-30T12:00:00.000Z",
  "updatedAt": "2025-12-30T12:00:00.000Z",
  "nodes": [
    {
      "id": "node-1",
      "type": "SELECT_AID",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Select Card Manager",
        "parameters": [
          {
            "name": "AID",
            "value": "A0000000031010",
            "type": "hex"
          }
        ],
        "executed": false
      }
    },
    {
      "id": "node-2",
      "type": "READ_RECORD",
      "position": { "x": 300, "y": 100 },
      "data": {
        "label": "Read First Record",
        "parameters": [
          {
            "name": "Record",
            "value": "01",
            "type": "hex"
          },
          {
            "name": "SFI",
            "value": "00",
            "type": "hex"
          }
        ],
        "executed": false
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "type": "default"
    }
  ]
}
```

### 예제 2: 암호화 파이프라인
```json
{
  "id": "87654321-4321-4321-4321-cba987654321",
  "name": "데이터 암호화 전송",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "node-1",
      "type": "GET_CHALLENGE",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Get Challenge",
        "parameters": [
          { "name": "Length", "value": "08", "type": "hex" }
        ],
        "executed": false
      }
    },
    {
      "id": "node-2",
      "type": "ENCRYPT_DATA",
      "position": { "x": 300, "y": 100 },
      "data": {
        "label": "Encrypt Challenge",
        "parameters": [],
        "cryptoConfig": {
          "algorithm": "AES",
          "key": "0123456789ABCDEF0123456789ABCDEF",
          "iv": "0123456789ABCDEF0123456789ABCDEF"
        },
        "pipeConfig": {
          "sourceNodeId": "node-1",
          "dataOffset": 0,
          "dataLength": -1
        },
        "executed": false
      }
    },
    {
      "id": "node-3",
      "type": "EXTERNAL_AUTH",
      "position": { "x": 500, "y": 100 },
      "data": {
        "label": "Send Encrypted Data",
        "parameters": [
          { "name": "Data", "value": "", "type": "hex" }
        ],
        "pipeConfig": {
          "sourceNodeId": "node-2",
          "dataOffset": 0,
          "dataLength": -1
        },
        "executed": false
      }
    }
  ],
  "edges": [
    { "id": "edge-1", "source": "node-1", "target": "node-2" },
    { "id": "edge-2", "source": "node-2", "target": "node-3" }
  ]
}
```

## 🔄 버전 관리
- `1.0.0`: 초기 버전
  - 기본 APDU 노드 지원
  - ENCRYPT_DATA, DECRYPT_DATA 노드 추가
  - Pipe 기능 지원

## 💾 저장 위치
- Windows: `%USERPROFILE%\Documents\APDU Diagrams\`
- 파일명 규칙: `[다이어그램 이름].apdu`

## 🔒 보안 고려사항
- 암호화 키는 평문으로 저장됨
- 민감한 키는 별도 보안 저장소 사용 권장
- `.apdu` 파일 권한 관리 필요
