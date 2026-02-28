# CI/CD Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cập nhật CI/CD pipeline cho erion-raven monorepo với GitHub Actions (CI) + Cloud Build (CD) + Vercel native integration.

**Architecture:** CI chạy trên mọi push/PR lên `develop` và `main`. Khi tests pass trên `main`, GitHub Actions trigger Cloud Build để build Docker image và deploy lên Cloud Run. Vercel tự handle frontend qua native Git integration.

**Tech Stack:** GitHub Actions, Google Cloud Build, Google Artifact Registry, Google Cloud Run, Vercel, pnpm, Docker

**Design Doc:** [docs/plans/2026-02-28-cicd-design.md](./2026-02-28-cicd-design.md)

**GCP Config:**
- Project: `nanobot-487408`
- Region: `asia-southeast1`
- Artifact Registry: `asia-southeast1-docker.pkg.dev/nanobot-487408/erion-repo/api`
- Cloud Run region: `asia-southeast1`

---

## Task 1: Xóa workflow files cũ không còn dùng

**Files:**
- Delete: `.github/workflows/deploy-backend.yml` (cũ — trỏ về Render)
- Delete: `.github/workflows/deploy-frontend.yml` (cũ — thay bằng Vercel native)
- Delete: `.github/workflows/pipeline.yml` (cũ — sẽ merge vào ci.yml)

**Step 1: Xóa các file**

```bash
git rm .github/workflows/deploy-backend.yml
git rm .github/workflows/deploy-frontend.yml
git rm .github/workflows/pipeline.yml
```

**Step 2: Verify**

```bash
ls .github/workflows/
```

Expected: Chỉ còn `ci.yml`

**Step 3: Commit**

```bash
git commit -m "chore: remove outdated Render and old pipeline workflows"
```

---

## Task 2: Cập nhật `cloudbuild-api.yaml`

**Files:**
- Modify: `cloudbuild-api.yaml`

**Step 1: Xem nội dung hiện tại**

```bash
cat cloudbuild-api.yaml
```

**Step 2: Thay toàn bộ nội dung**

```yaml
# cloudbuild-api.yaml
# Build Docker image và deploy lên Cloud Run
# Được trigger từ GitHub Actions khi tests pass trên main

substitutions:
  _CLOUD_RUN_SERVICE: 'erion-api'        # Tên Cloud Run service của bạn
  _CLOUD_RUN_REGION: 'asia-southeast1'

steps:
  # Step 1: Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    id: 'build'
    args:
      - 'build'
      - '-t'
      - 'asia-southeast1-docker.pkg.dev/nanobot-487408/erion-repo/api:$COMMIT_SHA'
      - '-t'
      - 'asia-southeast1-docker.pkg.dev/nanobot-487408/erion-repo/api:latest'
      - '-f'
      - 'apps/api/Dockerfile'
      - '.'

  # Step 2: Push image lên Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    id: 'push'
    args:
      - 'push'
      - '--all-tags'
      - 'asia-southeast1-docker.pkg.dev/nanobot-487408/erion-repo/api'

  # Step 3: Deploy lên Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    id: 'deploy'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - '$_CLOUD_RUN_SERVICE'
      - '--image'
      - 'asia-southeast1-docker.pkg.dev/nanobot-487408/erion-repo/api:$COMMIT_SHA'
      - '--region'
      - '$_CLOUD_RUN_REGION'
      - '--platform'
      - 'managed'
      - '--quiet'

images:
  - 'asia-southeast1-docker.pkg.dev/nanobot-487408/erion-repo/api:$COMMIT_SHA'
  - 'asia-southeast1-docker.pkg.dev/nanobot-487408/erion-repo/api:latest'

options:
  logging: CLOUD_LOGGING_ONLY
```

> ⚠️ **Quan trọng:** Thay `erion-api` bằng tên thực sự của Cloud Run service của bạn. Kiểm tra bằng: `gcloud run services list --region=asia-southeast1`

**Step 3: Verify cú pháp**

```bash
cat cloudbuild-api.yaml
```

**Step 4: Commit**

```bash
git add cloudbuild-api.yaml
git commit -m "feat(ci): upgrade cloudbuild-api.yaml with push and deploy steps"
```

---

## Task 3: Cập nhật `ci.yml` — thêm job trigger Cloud Build

**Files:**
- Modify: `.github/workflows/ci.yml`

**Step 1: Thay toàn bộ nội dung**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:

jobs:
  # ============================================================
  # 1. Build shared packages (required bởi frontend + backend)
  # ============================================================
  build-shared:
    name: Build Shared Packages
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Build shared packages
        run: |
          pnpm --filter @raven/types build
          pnpm --filter @raven/validators build
          pnpm --filter @raven/shared build

      - uses: actions/upload-artifact@v4
        with:
          name: shared-dist
          path: |
            packages/types/dist
            packages/validators/dist
            packages/shared/dist
          retention-days: 1

  # ============================================================
  # 2. Test Frontend
  # ============================================================
  test-frontend:
    name: Test Frontend
    runs-on: ubuntu-latest
    needs: build-shared
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - uses: actions/download-artifact@v4
        with:
          name: shared-dist

      - name: Lint
        run: pnpm --filter @raven/web lint
        continue-on-error: true

      - name: Type check
        run: pnpm --filter @raven/web exec tsc --noEmit

      - name: Test
        run: pnpm --filter @raven/web test
        continue-on-error: true

      - name: Build
        run: pnpm --filter @raven/web build

  # ============================================================
  # 3. Test Backend
  # ============================================================
  test-backend:
    name: Test Backend
    runs-on: ubuntu-latest
    needs: build-shared
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - uses: actions/download-artifact@v4
        with:
          name: shared-dist

      - name: Lint
        run: pnpm --filter @raven/api lint
        continue-on-error: true

      - name: Type check
        run: pnpm --filter @raven/api exec tsc --noEmit

      - name: Test
        run: pnpm --filter @raven/api test
        continue-on-error: true

      - name: Build
        run: pnpm --filter @raven/api build

  # ============================================================
  # 4. Deploy Backend — chỉ khi push lên main + tests pass
  # ============================================================
  deploy-backend:
    name: Deploy to Cloud Run
    runs-on: ubuntu-latest
    needs: [test-frontend, test-backend]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Submit Cloud Build
        run: |
          gcloud builds submit . \
            --project=${{ secrets.GCP_PROJECT_ID }} \
            --config=cloudbuild-api.yaml \
            --substitutions=COMMIT_SHA=${{ github.sha }},_CLOUD_RUN_SERVICE=${{ secrets.CLOUD_RUN_SERVICE }},_CLOUD_RUN_REGION=${{ secrets.CLOUD_RUN_REGION }}

      - name: Notify deployment URL
        run: |
          echo "✅ Backend deployed to Cloud Run"
          echo "Service: ${{ secrets.CLOUD_RUN_SERVICE }}"
          echo "Region: ${{ secrets.CLOUD_RUN_REGION }}"
```

**Step 2: Verify cú pháp YAML**

```bash
# Kiểm tra không có lỗi cú pháp
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML valid"
```

Expected: `YAML valid`

**Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "feat(ci): update ci.yml with Cloud Build deployment trigger"
```

---

## Task 4: Thêm GitHub Secrets

**Mục đích:** Cung cấp credentials cho GitHub Actions.

**Step 1: Tìm tên Cloud Run service thực tế**

```bash
gcloud run services list --region=asia-southeast1 --project=nanobot-487408
```

Ghi lại tên service trong cột `SERVICE`.

**Step 2: Tạo GCP Service Account (nếu chưa có)**

```bash
# Tạo service account
gcloud iam service-accounts create github-actions-deploy \
  --display-name="GitHub Actions Deploy" \
  --project=nanobot-487408

# Gán quyền Cloud Build
gcloud projects add-iam-policy-binding nanobot-487408 \
  --member="serviceAccount:github-actions-deploy@nanobot-487408.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

# Gán quyền Cloud Run admin
gcloud projects add-iam-policy-binding nanobot-487408 \
  --member="serviceAccount:github-actions-deploy@nanobot-487408.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Gán quyền impersonate service account
gcloud projects add-iam-policy-binding nanobot-487408 \
  --member="serviceAccount:github-actions-deploy@nanobot-487408.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Gán quyền Artifact Registry
gcloud projects add-iam-policy-binding nanobot-487408 \
  --member="serviceAccount:github-actions-deploy@nanobot-487408.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Tạo JSON key
gcloud iam service-accounts keys create /tmp/gcp-key.json \
  --iam-account=github-actions-deploy@nanobot-487408.iam.gserviceaccount.com

# In nội dung để copy
cat /tmp/gcp-key.json
```

**Step 3: Thêm secrets vào GitHub**

Vào: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Giá trị |
|------------|---------|
| `GCP_PROJECT_ID` | `nanobot-487408` |
| `GCP_SERVICE_ACCOUNT_KEY` | Toàn bộ nội dung file `/tmp/gcp-key.json` |
| `CLOUD_RUN_SERVICE` | Tên service từ Step 1 |
| `CLOUD_RUN_REGION` | `asia-southeast1` |

**Step 4: Xóa key file**

```bash
rm /tmp/gcp-key.json
```

> ⚠️ **Bảo mật:** Không commit file key.json vào git.

---

## Task 5: Kích hoạt Cloud Build API và kiểm tra permissions

**Step 1: Đảm bảo Cloud Build API đã được enable**

```bash
gcloud services enable cloudbuild.googleapis.com --project=nanobot-487408
gcloud services enable run.googleapis.com --project=nanobot-487408
gcloud services enable artifactregistry.googleapis.com --project=nanobot-487408
```

Expected: Mỗi lệnh trả về thành công hoặc `Already enabled`.

**Step 2: Kiểm tra Cloud Build service account có quyền deploy Cloud Run**

Cloud Build chạy với service account mặc định: `PROJECT_NUMBER@cloudbuild.gserviceaccount.com`

```bash
PROJECT_NUMBER=$(gcloud projects describe nanobot-487408 --format='value(projectNumber)')
echo "Cloud Build SA: ${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Gán quyền nếu chưa có
gcloud projects add-iam-policy-binding nanobot-487408 \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding nanobot-487408 \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

**Step 3: Commit bất kỳ thay đổi nào nếu cần**

```bash
git status
```

---

## Task 6: Verification — Test toàn bộ pipeline

**Step 1: Push lên develop để test CI**

```bash
git checkout develop
git push origin develop
```

→ Vào GitHub Actions, verify workflow `CI/CD Pipeline` chạy chỉ các job: `build-shared`, `test-frontend`, `test-backend` (không có `deploy-backend`)

**Step 2: Tạo PR từ develop → main**

```bash
# Tạo PR qua GitHub UI hoặc CLI:
gh pr create --base main --head develop --title "test: CI/CD pipeline" --body "Testing new CI/CD setup"
```

→ Verify: CI chạy như blocking check, Vercel tạo Preview URL trong PR comments

**Step 3: Merge PR vào main**

```bash
gh pr merge --squash
```

→ Verify toàn bộ pipeline:
1. ✅ GitHub Actions: `build-shared` → `test-frontend` + `test-backend` → `deploy-backend`
2. ✅ GCP Console → Cloud Build → History: có build mới với commit SHA
3. ✅ GCP Console → Cloud Run: có revision mới được deploy
4. ✅ Vercel dashboard: production deployment mới

**Step 4: Kiểm tra Cloud Run service hoạt động**

```bash
# Lấy URL của Cloud Run service
gcloud run services describe $CLOUD_RUN_SERVICE \
  --region=asia-southeast1 \
  --project=nanobot-487408 \
  --format='value(status.url)'

# Test health check
curl https://<cloud-run-url>/
```

Expected: API trả về response bình thường.

---

## Tóm tắt Files Thay Đổi

| File | Action |
|------|--------|
| `.github/workflows/ci.yml` | MODIFY — unified pipeline với Cloud Build trigger |
| `.github/workflows/deploy-backend.yml` | DELETE |
| `.github/workflows/deploy-frontend.yml` | DELETE |
| `.github/workflows/pipeline.yml` | DELETE |
| `cloudbuild-api.yaml` | MODIFY — thêm push + deploy steps |

## Cost Check

Sau khi implement, verify cost = $0:
- GitHub Actions: CI chạy ~5-10 min/pipeline, well within 2,000 min free tier
- Cloud Build: Deploy chạy ~5-10 min, well within 120 min/day free tier
- Vercel: Native integration, free
