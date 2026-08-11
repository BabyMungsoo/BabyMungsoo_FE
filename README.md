# BabyMungsoo_FE

반려동물 응급도 판단 서비스 **아기멍수**의 모바일 앱입니다. (Expo / React Native)

백엔드: [BabyMungsoo_BE](https://github.com/BabyMungsoo/BabyMungsoo_BE)

---

## 기술 스택

| 영역        | 선택                                    |
| ----------- | --------------------------------------- |
| 프레임워크  | Expo SDK 57 + React Native 0.86         |
| 언어        | TypeScript                              |
| 라우팅      | Expo Router (파일 기반, `src/app/`)     |
| 스타일링    | NativeWind (Tailwind CSS 문법)          |
| 서버 상태   | TanStack Query v5                       |
| 클라 상태   | Zustand                                 |
| HTTP        | Axios                                   |
| 포맷/린트   | Prettier + ESLint (eslint-config-expo)  |

---

## 시작하기

```bash
npm install
cp .env.example .env.local   # 배포 서버 주소가 생기면 채웁니다. 로컬 개발은 비워둬도 됩니다.
npm start
```

터미널에 뜨는 QR 을 Expo Go 앱으로 찍거나, `i`(iOS 시뮬레이터) / `a`(Android 에뮬레이터)를 누릅니다.

첫 화면은 `GET /pets` 를 호출해 백엔드 연결 상태를 보여주는 임시 화면입니다.
백엔드를 먼저 띄워 두세요 (`BabyMungsoo_BE` 에서 `./gradlew bootRun`, 기본 포트 8080).

### 백엔드 주소는 어떻게 잡히나요

RN 앱에서 `localhost` 는 **앱이 실행 중인 기기 자신**을 가리킵니다. 실기기나 안드로이드
에뮬레이터에서는 개발 PC 의 8080 에 절대 닿지 않습니다.

그래서 [`src/api/client.ts`](src/api/client.ts) 는 Expo 개발 서버의 호스트(= 개발 PC 의 IP)를
그대로 재사용해 `http://<개발PC IP>:8080/api/v1` 를 만듭니다. 시뮬레이터·에뮬레이터·실기기
모두 별도 설정 없이 동작합니다.

배포 서버가 생기면 `.env.local` 에 다음을 넣으면 그 값이 우선합니다.

```
EXPO_PUBLIC_API_BASE_URL=https://api.example.com/api/v1
```

> 실기기로 붙을 땐 폰과 개발 PC 가 **같은 Wi-Fi** 여야 하고, 맥 방화벽이 8080 을 막고 있지
> 않아야 합니다.

---

## 폴더 구조

```
src/
├── app/              # Expo Router 라우트 (여기 파일 = 화면 하나)
│   ├── _layout.tsx   # 전역 Provider (QueryClient, SafeArea)
│   └── index.tsx     # 첫 화면
├── api/              # 도메인별 API 호출 함수 (axios)
│   ├── client.ts     # axios 인스턴스 / baseURL / 에러 변환 / 토큰 주입
│   ├── pets.ts  triage.ts  media.ts  hospitals.ts  records.ts  reports.ts  users.ts
│   └── index.ts
├── types/            # 스웨거 기준 API 타입 (docs/openapi.json 과 짝)
├── hooks/queries/    # TanStack Query 훅 (use-pets.ts 형태를 따라가세요)
├── stores/           # Zustand 스토어 (클라이언트 전용 상태만)
├── components/       # 공용 컴포넌트
├── features/         # 도메인별 화면 조각 (문진, 병원, 리포트 …)
├── constants/        # 라벨·색상 등 상수
├── lib/              # queryClient, queryKeys 등 인프라 코드
└── global.css        # Tailwind 지시자
docs/openapi.json     # 백엔드 스웨거 스냅샷 (참고용)
```

**어디에 무엇을 쓰나**

- 서버에서 받아오는 데이터 → TanStack Query (`hooks/queries/`)
- 화면 간 공유되는 클라이언트 상태(선택한 반려동물 등) → Zustand (`stores/`)
- 한 화면 안에서만 쓰는 상태 → 그냥 `useState`

---

## API 레이어 사용법

```tsx
import { usePets, useCreatePet } from '@/hooks/queries/use-pets';

const { data: pets, isPending, error } = usePets();
const { mutate: createPet } = useCreatePet();
```

새 도메인 훅을 추가할 땐 [`src/hooks/queries/use-pets.ts`](src/hooks/queries/use-pets.ts) 를
그대로 복사해 쓰면 됩니다. 쿼리 키는 반드시
[`src/lib/query-keys.ts`](src/lib/query-keys.ts) 에 등록하세요 — 무효화할 때 접두사로 한 번에
털 수 있습니다.

### 알아둘 백엔드 특이사항

- `/media/**` 만 `{ success, data, message }` 래퍼를 씁니다. 나머지는 DTO 를 그대로 반환합니다.
  래퍼 해제는 `src/api/media.ts` 에서 이미 처리했습니다.
- 로그인이 아직 안 붙어 있어 `GET /records` 는 `userId` 를 쿼리로 받습니다.
  토큰이 생기면 `setAuthToken()` 만 호출하면 됩니다.
- 미디어 업로드는 **이미지만** 됩니다 (동영상은 400).
- `AnalysisRecord.dogId` 는 `Pet.petId` 와 같은 값입니다 (백엔드 컬럼명이 아직 dogId).

### 스웨거 스냅샷 갱신

백엔드를 띄운 상태에서:

```bash
npm run api:sync
```

`docs/openapi.json` 이 갱신됩니다. 스펙이 바뀌었으면 `src/types/` 도 같이 수정해 주세요.

---

## 브랜치 전략

```
main       배포용. develop 에서만 머지합니다.
develop    개발 기본 브랜치. PR 은 전부 여기로.
feat/이름_이슈번호    예) feat/yuyeon_10
```

기능 브랜치는 **항상 develop 에서** 따고, 작업이 끝나면 develop 으로 PR 을 올립니다.
리뷰 승인 1개 이상 받은 뒤 머지합니다.

```bash
git switch develop
git pull origin develop
git switch -c feat/yuyeon_10
# ... 작업 ...
git push -u origin feat/yuyeon_10
```

### 브랜치 접두사

| 접두사      | 용도                     |
| ----------- | ------------------------ |
| `feat/`     | 기능 개발                |
| `fix/`      | 버그 수정                |
| `refactor/` | 동작 변화 없는 구조 개선 |
| `chore/`    | 설정·빌드·문서           |

### 커밋 메시지

```
feat: 반려동물 등록 폼 구현
fix: 문진 다음 질문이 안 넘어가는 문제 수정
chore: eslint 설정 추가
```

`feat` / `fix` / `refactor` / `style` / `chore` / `docs` 를 씁니다.

---

## 스크립트

| 명령                   | 설명                        |
| ---------------------- | --------------------------- |
| `npm start`            | Expo 개발 서버              |
| `npm run ios`          | iOS 시뮬레이터로 실행       |
| `npm run android`      | Android 에뮬레이터로 실행   |
| `npm run lint`         | ESLint                      |
| `npm run format`       | Prettier 포맷 적용          |
| `npm run typecheck`    | TypeScript 타입 검사        |
| `npm run api:sync`     | 스웨거 스냅샷 갱신          |

PR 올리기 전에 `npm run lint && npm run typecheck` 는 통과시켜 주세요.
