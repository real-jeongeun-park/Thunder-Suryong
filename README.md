# ⚡️ 벼락수룡

수룡이가 벼락치기를 도와주는 시험 계획 관리 앱입니다!

React Native + Expo + Spring Boot를 기반으로 제작된 앱 프로젝트입니다.

---

## 🛠 언어 및 기술 스택

- **React Native**
- **TypeScript**
- **JavaScript**
- **Spring Boot**
- **Expo**

---

## 📁 프로젝트 구조

```
# Thunder-Suryong/src/main/
..
├── frontend/                         # 프론트엔드
│   ├── app/                            # 페이지 컴포넌트들 (index, login, signup 등)
│   ├── assets/                         # 이미지, 폰트 등 정적 자산
│   ├── components/                     # 재사용 가능한 UI 컴포넌트
│   ├── constants/                      # 상수값 저장
│   ├── hooks/                          # 커스텀 훅
│   ├── scripts/                        # 기타 유틸
│   ├── node_modules/                  
│   └── package.json      
│
└── java/com/byeraksuryong/           # 백엔드
    ├── api/                            # API, 인증 토큰
    ├── controller/                     # URL 매핑
    ├── domain/                         # 도메인 객체
    ├── dto/                            # 데이터 전송 객체
    ├── repository/                     # DB 접근 구현
    └── service/                        # 비즈니스 로직 구현

```

---

## 🚀 실행 방법

**0. 레포지토리를 clone 또는 pull**

### 🖼️ 프론트엔드 실행 방법
   1. 패키지 설치
      ```bash
      npm install
      # 또는 yarn
      ```

   2. Expo 실행

      ```bash
      # 반드시 frontend/ 에서 실행
      cd npx expo start
      ```

   3. QR 코드를 통해 **Expo Go** 앱으로 실행하거나, 웹 시뮬레이터에서 바로 확인 가능!

### 🌐️️️ 백엔드 실행 방법
   1. [Java JDK 17 버전 설치](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
      

   2. [H2 DB 설치](https://www.h2database.com/html/download.html) 및 [테이블 생성](https://github.com/real-jeongeun-park/Thunder-Suryong/tree/master/sql)


   3. 디렉터리 내 다음 경로의 파일을 빌드 및 실행 
      ```
      ./src/main/java/com/byearaksuryong/ByeraksuryongApplicaiton
      ```
---

## 🧪 기능 요약

25/07/04 기준

- 시험 일정 등록/생성
- 캘린더 기반 UI
- 캐릭터와 함께하는 벼락치기 타이머
- 로그인 / 회원가입 기능
- 체크박스 기반 이용약관 확인

---

## ✅ 작업자

- **🖼️ 프론트엔드**
    - [@hee5k](https://github.com/hee5k)
    - [@rhkrdori](https://github.com/rhkrdori)

- **🌐️ 백엔드**
    - [@real-jeongeun-park](https://github.com/real-jeongeun-park)

---

## ⚠️ 주의사항

- Expo SDK 버전은 `package.json`에 명시되어 있습니다.

---

## 📌 To Do

- [ ] Firebase 연동
- [ ] 사용자 맞춤 푸시 알림
- [ ] 계획 관리 기능 추가
