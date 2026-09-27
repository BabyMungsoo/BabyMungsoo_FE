# 앱 정보 / 관리자 문의 관리

기준 브랜치: `feat/seulgi_69` (시작 커밋 e24be094).

## 현재 동작

- 앱 정보 `/app-info`, 관리자 홈 `/admin`, 관리자 목록 `/admin/inquiries`,
  관리자 상세 `/admin/inquiries/[inquiryId]`, 사용자 상세 `/inquiries/[inquiryId]`.
- 기존 탭 안에서 관리자/사용자 상세는 Stack으로 이동합니다. 새 탭 버튼은 만들지 않습니다.
- 로그인 응답 `role`을 세션 및 로그인 유지 저장소에 저장/복원/삭제합니다.
  누락되거나 알 수 없는 값은 USER입니다. JWT를 클라이언트에서 해독해 권한을 올리지 않습니다.
- 기본 문의 모드는 AsyncStorage 목업입니다. 같은 앱 설치 또는 같은 브라우저 origin에서만
  USER와 ADMIN이 데이터를 공유합니다. 다른 기기/브라우저/포트에는 동기화되지 않습니다.
- 사용자 목록/상세는 userId로 제한합니다. 관리자는 전체 문의를 읽고 한 번 답변합니다.
- 새 저장 키는 `customer-center-inquiries-v2`입니다. 구 키에는 작성자 정보가 없으므로
  자동으로 현재 사용자에게 귀속시키지 않습니다. 구 데이터는 삭제하지 않고 보존합니다.
- 저장 실패는 화면에 표시되며 성공처럼 처리하지 않습니다. 비어 있는 목록부터 시작합니다.
- UI 권한 확인 및 목업 역할 검사는 서버 보안의 대체가 아닙니다.

## 백엔드 계약

`LoginResponse`에 `role: "USER" | "ADMIN"` 추가. 서버 User 엔티티의 role로 채우세요.
요청에서 전달한 role을 신뢰하거나 이메일로 관리자를 판정하면 안 됩니다.
기존 로그인 유지 세션은 role이 없으면 USER이므로 백엔드 수정 후 다시 로그인하세요.

문의 응답 DTO (현재 화면이 기대하는 JSON):

```json
{
  "id": "123",
  "userId": 1,
  "authorName": "보호자",
  "title": "문의 제목",
  "content": "문의 내용",
  "createdAt": "2026-09-26T03:00:00Z",
  "status": "PENDING",
  "answer": null,
  "answeredAt": null
}
```

완료 상태는 ANSWERED. 날짜는 ISO 8601. 숫자 id 또는 ApiResponse 래퍼를 사용하면
`src/api/inquiries.ts`에서 위 타입으로 변환하세요. 목록 응답은 현재 Inquiry[]입니다.
페이지네이션 도입 시 동일 파일 및 조회 훅을 수정하세요.

| 메서드 | 경로                                | 요청 / 응답                        |
| ------ | ----------------------------------- | ---------------------------------- |
| POST   | /api/v1/inquiries                   | `{title, content}` / Inquiry (201) |
| GET    | /api/v1/inquiries                   | 본인 Inquiry[] (최신순)            |
| GET    | /api/v1/inquiries/{id}              | 본인 Inquiry                       |
| GET    | /api/v1/admin/inquiries             | 전체 Inquiry[] (최신순)            |
| GET    | /api/v1/admin/inquiries/{id}        | Inquiry                            |
| PATCH  | /api/v1/admin/inquiries/{id}/answer | `{answer}` / 수정된 Inquiry        |

- 서버는 인증된 사용자에서 userId/작성자를 결정하고 사용자 API에 소유권을 검증해야 합니다.
- 모든 관리자 API는 서버에서 ADMIN 검사. 인증 실패 401, 권한 없음 403, 미존재 404.
- 제목 1~~100자, 본문/답변 1~~5,000자 및 공백 검증. 답변 상태 변경은 트랜잭션으로 처리하고
  중복 답변은 409 등으로 거절하세요. answeredAt은 서버 시간으로 기록합니다.
- 구현 완료 후 `.env.local`에 `EXPO_PUBLIC_INQUIRY_MODE=server`를 설정하고 Expo 재시작.
  화면을 바꾸지 않고 API 어댑터를 전환합니다. 서버 실패를 목업 성공으로 숨기지 않습니다.

## 로컬 확인 순서

1. USER 로그인: 관리자 메뉴 없음. 앱 정보의 설명/기능/프로젝트/버전과 뒤로가기 확인.
2. 고객센터: FAQ, 가이드, 개인정보, 약관 유지 확인.
3. 1:1 문의 작성: 공백 입력 비활성화, 정상 등록 후 문의 내역에서 대기 상태 확인.
4. 로그아웃 후 다른 USER 로그인: 이전 사용자 문의가 보이지 않는지 확인.
5. ADMIN 로그인: 관리자 메뉴 → 문의 관리 → 전체/대기/완료 필터 → 상세 → 답변 등록.
6. 완료 상태 및 답변 날짜 확인, 같은 문의 재답변 입력창이 없는지 확인.
7. 원래 USER로 로그인: 문의 내역 → 상세에서 동일한 답변 확인.
8. USER/로그아웃 상태로 관리자 상세 URL 직접 접근: 관리자 내용이 표시되지 않는지 확인.
9. 로그인 유지 후 새로고침: role 복원. 로그아웃 후 role 제거. role 없는 응답은 USER.
10. 휴대폰에서 키보드, 긴 본문 스크롤, 하단 탭 및 뒤로가기 확인.

백엔드가 아직 role을 반환하지 않으면 관리자 화면을 테스트하려면 개발용 API 응답
fixture에 role: ADMIN을 제공하세요. 운영 코드에 관리자 강제 전환 스위치는 넣지 않았습니다.

자동 검사: `npm run typecheck`, `npm run lint`, `node --test tests/inquiries.test.cjs`.
