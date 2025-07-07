## 🔧 브랜치 운영 전략 (main / dev 분리)

이 저장소는 공유 컴포넌트 모듈을 관리하기 위해, 아래와 같이 **브랜치 분리 전략**을 사용합니다.

---

### 📁 브랜치 역할

1. **`main` 브랜치**

   - 다른 프로젝트에서 `git subtree`로 공유할 파일만 포함
   - 예: `src/`, `index.ts`, `tsconfig.json` 등
   - 테스트 코드, 문서, 스토리북, 설정 파일 등은 포함하지 않음

2. **`dev` 브랜치**
   - 전체 개발 및 테스트 작업을 수행하는 브랜치
   - 테스트 코드(`test/`), 스토리북(`.storybook/`), 문서 등 포함
   - `main`에는 포함되지 않는 개발 리소스를 자유롭게 활용 가능

---

### 🔁 반영 프로세스

4. 개발이 완료되면 `dev`에서 `main`으로 공유 대상 디렉토리(`src/`)만 반영합니다.

   - 일반적인 `merge`, `cherry-pick`, `rebase`는 **전체 변경 이력을 포함하므로 사용하지 않습니다**
   - 대신 다음 명령어처럼 **공유 디렉토리만 가져오는 방식**을 사용합니다:

   ```bash
   git checkout main
   git checkout dev -- src index.ts tsconfig.json
   git commit -am "release: 공유 디렉토리 반영"
   git push origin main
   ```

#### 주의. 수동으로 이 커맨드를 사용하면 에러를 우려하여 쓰지 않습니다. 대신, 아래의 자동화 커맨드를 사용해주세요.

---

### ⚠️ 주의사항 및 리스크

3. 이 방식은 main과 dev 간에 **공통 조상(commit base)이 존재하지 않게 되므로, Git 히스토리 상에서 브랜치 간 연관관계를 추적할 수 없습니다.**

   - 즉, Git은 `main`과 `dev`가 어떤 시점에서 파생되었는지 알 수 없어, 병합 도구 사용 시 충돌 추적이 불가능합니다.

4. 이러한 리스크를 방지하기 위해 아래와 같은 방식으로 운영합니다:

   - main 브랜치는 절대 수동으로 수정하지 않으며, 항상 자동화 스크립트를 통해 반영합니다.
   - main과 dev 간 관계는 README나 release-log.md 등에 명시하여 수동 관리합니다.

---

### 📄 예시 반영 기록

| 버전   | 기준 커밋 (dev) | 반영 일자  | 설명                          |
| ------ | --------------- | ---------- | ----------------------------- |
| v0.4.1 | 54d2eab         | 2025-07-01 | Button 컴포넌트 개선, DB 연결 |
| v0.4.0 | 7e123aa         | 2025-06-24 | 초기 구조 구축 및 첫 배포     |

### 자동화 커맨드

이 커맨드는 main 브랜치에 dev의 src/ 만을 반영하고 별도의 커밋을 생성합니다.

그리고 커밋 사항의 요약, 해시 및 날짜를 `release-log.md`에 기록합니다.

---

## 모듈 설명

이 저장소는 **다른 프로젝트에서 공유 컴포넌트로 활용**할 수 있도록 설계되었습니다.

# 프로젝트 A에서 shared 모듈 수정 및 기여 워크플로우

---

## 개요

- 프로젝트 A는 shared 저장소 일부를 subtree로 가져와 사용합니다.
- shared 저장소는 독립적인 git 저장소입니다.
- 프로젝트 A 내에서 shared 코드를 수정하고 shared 저장소의 main 브랜치에 직접 푸시할 수 있습니다.(main을 사용하면, main으로 밖에 푸시가 안되며, dev는 분리되어 있어 불가능합니다)
- fork 없이 직접 PR 또는 push가 가능합니다.

---

### 1. shared 저장소를 A 프로젝트 remote로 추가 (한 번만)

subtree를 가져올 원격 저장소를 `shared-origin`으로 등록합니다.

```bash
git remote add shared-origin https://github.com/charchar111/subtree-test1.git
```

### 2. shared 저장소의 main 브랜치를 A 프로젝트에 subtree로 가져오기

프로젝트 A 내 shared/에 서브 트리 저장소 main을 가져옵니다.

```bash
git subtree add --prefix=shared shared-origin main --squash
```

만약 이미 shared/ 폴더가 추가되어 있을 경우 아래처럼 최신화 가능합니다

```bash
git subtree pull --prefix=shared shared-origin main --squash
```

### 3. A 프로젝트 내에서 shared 코드 수정 및 커밋

만약 a에서 shared의 코드를 수정하고 다른 사람에게 공유하고자 한다면
아래처럼 shared를 추가하고 커밋을 만들어주세요

```bash
git add shared/
git commit -m "fix: 프로젝트 A에서 shared 컴포넌트 수정"
```

### 4. 수정 사항을 shared 저장소의 main 브랜치로 푸시

기본 방식

```bash
git subtree push --prefix=shared <원격 서브 레포> <브랜치명>
# 원 레포의 트리에서 src/subtree 내 변경사항만 서브 트리 레포의 브랜치에 반영함
```

#### 고급 방식 split 사용하기

```bash
# 서브트리 디렉토리의 변경사항만 정제하여 split-subtree 브랜치로 추가
git subtree split --prefix=shared -b split-subtree

# git push  <원격 서브트리레포> <스플릿 브랜치>:<원격 서브트리 레포의 브랜치>
git push  subtree1 split-subtree:main

# 사용 후 해당 브랜치는 삭제
```

---

### 시작하기

모듈의 의존성은 다음과 같습니다.
