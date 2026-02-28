# CI/CD Pipeline Design — erion-raven

> **Date:** 2026-02-28  
> **Author:** Brainstorming session  
> **Status:** Approved

---

## 1. Overview

Triển khai CI/CD pipeline cho dự án monorepo `erion-raven` với hai platform:
- **Backend:** Google Cloud Run (project `nanobot-487408`, region `asia-southeast1`)
- **Frontend:** Vercel (native Git integration)

**Mục tiêu:**
- Tự động chạy CI (lint, typecheck, test) trên mọi nhánh
- Tự động deploy production khi tất cả tests pass trên nhánh `main`
- Không tăng cost (tận dụng free tier của tất cả platforms)

---

## 2. Branch Strategy

```
feature/* → develop → main
               │           │
             (CI only)  (CI + CD)
```

| Branch | CI (GitHub Actions) | CD Backend (Cloud Build) | CD Frontend (Vercel) |
|--------|-------------------|------------------------|---------------------|
| `feature/*` | ❌ | ❌ | ❌ |
| `develop` | ✅ lint + test | ❌ | ❌ |
| PR → `main` | ✅ blocking check | ❌ | ✅ Preview URL |
| push `main` | ✅ → nếu pass → trigger | ✅ build + deploy | ✅ production |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│                                                          │
│   develop branch              main branch                │
│        │                           │                     │
│        ▼                           ▼                     │
│   [ci.yml]                    [ci.yml]                   │
│   • lint (frontend + backend) • lint + typecheck + test  │
│   • typecheck                 • nếu pass → trigger CD    │
│   • test                                                 │
└──────────────────────────────┬──────────────────────────┘
                               │ (chỉ khi main + tests pass)
              ┌────────────────┴─────────────────┐
              │                                  │
              ▼                                  ▼
 ┌────────────────────────┐        ┌─────────────────────────┐
 │   Google Cloud Build   │        │   Vercel (auto native)  │
 │                        │        │                         │
 │ 1. docker build        │        │ • detect push to main   │
 │ 2. push → AR           │        │ • build Vite app        │
 │ 3. gcloud run deploy   │        │ • deploy production     │
 │                        │        │ • preview URL on PRs    │
 └────────────────────────┘        └─────────────────────────┘
```

---

## 4. Components

### 4.1 GitHub Actions — CI (`ci.yml`)

**File:** `.github/workflows/ci.yml`  
**Trigger:** Push/PR lên `develop` và `main`

**Pipeline:**
```
build-shared (build @raven/types, validators, shared)
     │
     ├──→ test-frontend (lint, typecheck, test, build @raven/web)
     │
     └──→ test-backend  (lint, typecheck, test, build @raven/api)
                             │
                      (nếu cả 2 pass + branch = main)
                             │
                             ▼
                    trigger-cloud-build
                    (gcloud builds submit)
```

**GitHub Secrets cần thiết:**
| Secret | Mô tả |
|--------|-------|
| `GCP_PROJECT_ID` | `nanobot-487408` |
| `GCP_SERVICE_ACCOUNT_KEY` | JSON key của service account |
| `CLOUD_RUN_SERVICE` | Tên Cloud Run service |
| `CLOUD_RUN_REGION` | `asia-southeast1` |

### 4.2 Google Cloud Build — CD (`cloudbuild-api.yaml`)

**File:** `cloudbuild-api.yaml` (nâng cấp từ file hiện tại)  
**Trigger:** Được gọi từ GitHub Actions (không tự trigger)

**GCP Resources (chính xác):**
| Resource | Giá trị |
|----------|---------|
| Project ID | `nanobot-487408` |
| Region | `asia-southeast1` |
| Artifact Registry | `asia-southeast1-docker.pkg.dev` |
| Repository | `erion-repo` |
| Image | `asia-southeast1-docker.pkg.dev/nanobot-487408/erion-repo/api:$COMMIT_SHA` |
| Image (latest) | `asia-southeast1-docker.pkg.dev/nanobot-487408/erion-repo/api:latest` |

**Steps:**
1. `docker build` — build image từ `apps/api/Dockerfile`
2. `docker push` — push image (tag: `$COMMIT_SHA` + `latest`)
3. `gcloud run deploy` — deploy lên Cloud Run với image mới

**Tag strategy:** Dùng `$COMMIT_SHA` để traceability, `latest` để rollback dễ dàng.

### 4.3 Vercel — Frontend (Native Integration)

**Không cần GitHub Actions workflow.** Vercel tự handle qua Git integration.

**Config hiện tại trong `vercel.json` đã đúng:**
```json
{
  "framework": "vite",
  "buildCommand": "pnpm turbo build --filter=@raven/web",
  "outputDirectory": "apps/web/dist",
  "installCommand": "corepack enable && pnpm install"
}
```

**Tính năng tự động:**
- ✅ Production deploy khi push `main`
- ✅ Preview URL tự động cho mỗi PR
- ✅ Rollback instant từ Vercel dashboard

---

## 5. Cost Analysis

| Platform | Free Tier | Ước tính sử dụng/tháng | Chi phí thêm |
|----------|-----------|----------------------|-------------|
| **GitHub Actions** | 2,000 min/tháng | ~200 min (CI thôi) | **$0** |
| **Cloud Build** | 120 build-min/ngày (~3,600/tháng) | ~30 min (chỉ merge main) | **$0** |
| **Artifact Registry** | 0.5 GB free | ~200 MB | **$0** |
| **Cloud Run** | Đã có, không thay đổi | Không đổi | **$0** |
| **Vercel** | Free (Hobby) | Native integration | **$0** |

> **Tổng cost tăng thêm: $0/tháng**

---

## 6. Setup Guide

### Step 1: Tạo GCP Service Account

```bash
# Tạo service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions CI/CD" \
  --project=nanobot-487408

# Gán roles
gcloud projects add-iam-policy-binding nanobot-487408 \
  --member="serviceAccount:github-actions@nanobot-487408.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding nanobot-487408 \
  --member="serviceAccount:github-actions@nanobot-487408.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding nanobot-487408 \
  --member="serviceAccount:github-actions@nanobot-487408.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Tạo JSON key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@nanobot-487408.iam.gserviceaccount.com
```

### Step 2: Thêm GitHub Secrets

Vào **GitHub repo → Settings → Secrets and variables → Actions**, thêm:

| Secret Name | Giá trị |
|------------|---------|
| `GCP_PROJECT_ID` | `nanobot-487408` |
| `GCP_SERVICE_ACCOUNT_KEY` | Nội dung file `key.json` |
| `CLOUD_RUN_SERVICE` | Tên Cloud Run service của bạn |
| `CLOUD_RUN_REGION` | `asia-southeast1` |

> ⚠️ **Xóa file `key.json`** sau khi copy nội dung!

### Step 3: Setup Vercel Git Integration

1. Vào [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Import project** → chọn GitHub repo `erion-raven`
3. Vercel tự detect config từ `vercel.json`
4. Đảm bảo **Root Directory** để trống (Vercel dùng config trong vercel.json)

### Step 4: Deploy workflow files

Sau khi implement (xem implementation plan), push lên `main` để kích hoạt.

---

## 7. Files Cần Thay Đổi

| File | Action |
|------|--------|
| `.github/workflows/ci.yml` | **MODIFY** — thêm job trigger-cloud-build |
| `.github/workflows/deploy-backend.yml` | **DELETE** — thay bằng Cloud Build |
| `.github/workflows/deploy-frontend.yml` | **DELETE** — Vercel native thay thế |
| `.github/workflows/pipeline.yml` | **DELETE** — hợp nhất vào ci.yml |
| `cloudbuild-api.yaml` | **MODIFY** — thêm deploy step |

---

## 8. Verification Plan

- [ ] Push lên `develop` → CI chạy, không trigger deploy
- [ ] Tạo PR vào `main` → CI chạy như blocking check, Vercel tạo preview URL
- [ ] Merge vào `main` → CI pass → Cloud Build trigger → Cloud Run deploy
- [ ] Kiểm tra Cloud Build history trên GCP Console
- [ ] Kiểm tra Cloud Run service có revision mới
- [ ] Kiểm tra Vercel deployment log
