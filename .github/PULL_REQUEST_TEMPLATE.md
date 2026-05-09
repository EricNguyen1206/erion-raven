## Description

<!-- Mô tả ngắn gọn thay đổi -->

## Related Issue

<!-- Link issue: Closes #123 -->

## Type of Change

<!-- Mark with [x] -->

- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Performance improvement
- [ ] Documentation update
- [ ] CI/CD change

## Checklist

### Code Quality

- [ ] Code tuân theo conventions hiện tại trong project
- [ ] Không có `console.log` hoặc debug code
- [ ] Không có hardcoded secrets, API keys hay credentials
- [ ] TypeScript types được định nghĩa đúng (không dùng `any` không cần thiết)

### Testing

- [ ] Đã viết unit tests cho code mới
- [ ] Đã viết tests cho bug fix (nếu là bug fix)
- [ ] Tất cả tests pass locally (`pnpm test`)
- [ ] Lint pass (`pnpm lint`)

### Database & Migration

- [ ] Không có database migration breaking change (hoặc đã handle backward compatibility)
- [ ] Schema changes đã được review

### Deployment

- [ ] Dockerfile cập nhật (nếu thêm/xóa files runtime cần thiết)
- [ ] Không có env variable mới chưa được khai báo (thêm vào `.env.example` nếu có)
- [ ] `.gcloudignore` cập nhật nếu thêm files/directories mới cần deploy

### Documentation

- [ ] API documentation cập nhật (Swagger/OpenAPI) nếu endpoint thay đổi
- [ ] README cập nhật nếu cần

### Breaking Changes

- [ ] Không có breaking change cho API consumers
- [ ] Nếu có breaking change: đã note ở phần Description phía trên

## How Has This Been Tested?

<!-- Mô tả cách test, kết quả -->

## Screenshots (if applicable)

<!-- Attach screenshots -->
