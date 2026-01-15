# Scard-App 실행 및 빌드 가이드

## 개발 환경 실행

### 방법 1: 통합 명령어 (권장)
```bash
yarn dev
```
- React 개발 서버와 Electron을 동시에 실행
- React가 준비될 때까지 자동으로 대기
- 컬러로 구분된 로그 출력

### 방법 2: 개별 실행
```bash
# 터미널 1
yarn react-start

# 터미널 2 (React 서버가 준비된 후)
yarn electron-start
```

---

## 빌드 명령어

### 1. React 빌드만
```bash
yarn build:react
```
- React 앱만 빌드 (build/ 폴더)

### 2. EXE 파일 생성
```bash
yarn build:exe
```
- React 빌드 + Electron 패키징
- 실행 파일: `dist/CARD Tools.exe` (portable)
- 설치 없이 바로 실행 가능

### 3. 설치 파일 생성
```bash
yarn build:installer
```
- React 빌드 + NSIS 설치 프로그램 생성
- 설치 파일: `dist/CARD Tools Setup.exe`
- 사용자가 설치 경로 선택 가능
- 시작 메뉴 및 바탕화면 바로가기 생성

### 4. 모든 형식 빌드
```bash
yarn build:all
```
- Portable EXE + 설치 프로그램 모두 생성

---

## 빌드 결과물

빌드 후 `dist/` 폴더에 다음 파일들이 생성됩니다:

```
dist/
├── CARD Tools.exe              # Portable 실행 파일
├── CARD Tools Setup.exe        # 설치 프로그램
└── win-unpacked/               # 압축 해제된 파일들
```

---

## 주의사항

1. **아이콘 파일**: `public/icon.ico` 파일이 필요합니다
   - 없으면 기본 Electron 아이콘 사용

2. **빌드 전 확인사항**:
   - `yarn install` 완료
   - `public/Main.js` 존재 확인
   - TypeScript 컴파일 에러 없음

3. **Windows 전용**: 현재 설정은 Windows 빌드만 지원
   - macOS/Linux 빌드가 필요하면 `package.json`의 `build` 섹션 수정 필요

---

## 문제 해결

### React 서버가 시작되지 않는 경우
```bash
# 포트 3000이 사용 중인지 확인
netstat -ano | findstr :3000

# 프로세스 종료
taskkill /PID <PID> /F
```

### Electron이 시작되지 않는 경우
```bash
# node_modules 재설치
rm -rf node_modules
yarn install
```

### 빌드 실패 시
```bash
# 캐시 정리
yarn cache clean
rm -rf dist build
yarn build:all
```
