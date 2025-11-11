# 🤖 INSTRUCTIONS FOR CLAUDE AI - React Frontend

## 📋 CORE ARCHITECTURE

**Stack:** React 19 + TypeScript 5.8 + Vite 7 + Tailwind CSS 3.4 + React Router v7

**Folder Structure:**
```
src/
├── pages/{feature}/page.tsx      # Pages (lazy loaded)
├── components/base/              # Reusable components
├── hooks/                        # Custom hooks (use{Name})
├── services/                     # API services
├── router/config.tsx             # Route definitions
├── i18n/                         # Translations
└── lib/                          # Utils (http-client, etc.)
```

---

## 🚨 QUY TẮC QUAN TRỌNG - BACKEND ↔ FRONTEND

### **KHÔNG BAO GIỜ MAPPING - SỬ DỤNG KEYS GIỐNG BACKEND**

**QUY TẮC VÀNG:**
1. ✅ **GIỮ NGUYÊN DESIGN** - KHÔNG thay đổi UI/UX hiện tại
2. ✅ **SỬ DỤNG KEYS GIỐNG BACKEND** - PascalCase Vietnamese
3. ✅ **KHÔNG MAPPING** - Frontend interface = Backend Resource fields
4. ✅ **NẾU CHƯA ĐÚNG → REFACTOR LẠI**

**Ví dụ:**

```tsx
// ❌ SAI - English keys + mapping
interface Room {
  id: string;
  name: string;
  status: 'available' | 'occupied';
}
const mapBackendToRoom = (data) => ({ id: data.MaPhong, name: data.TenPhong });

// ✅ ĐÚNG - Vietnamese keys trực tiếp, KHÔNG mapping
interface PhongTro {
  MaPhong: number;
  TenPhong: string;
  TrangThai: 'Trống' | 'Đã cho thuê' | 'Bảo trì';
}

const [phongTros, setPhongTros] = useState<PhongTro[]>([]);
const response = await phongTroService.getAll();
setPhongTros(response.data.data); // ✅ Không map!
```

**Khi refactor module cũ:**
1. Check Backend Resource → biết keys nào cần dùng
2. Đổi Frontend interface khớp 100% với Backend
3. Đổi variable names: `rooms` → `phongTros`, `room` → `phongTro`
4. Xóa TẤT CẢ mapping functions
5. **GIỮ NGUYÊN** toàn bộ Tailwind classes, layouts, modals

**Checklist khi code:**
- [ ] Interface có khớp với Backend Resource không?
- [ ] Có mapping function nào không? (phải xóa!)
- [ ] Variable names đã đổi sang tiếng Việt chưa?
- [ ] UI/design có thay đổi không? (KHÔNG được phép!)

---

## 🎯 KEY PATTERNS

### 1️⃣ PAGE PATTERN
- Tạo `src/pages/{feature}/page.tsx` với export default
- Lazy load trong `src/router/config.tsx`
- Feature components trong `src/pages/{feature}/components/`

### 2️⃣ TYPESCRIPT
- **BẮT BUỘC:** Type all props, state, functions
- **IMPORT** interface từ service file
- **❌ KHÔNG** dùng `any` type

### 3️⃣ STYLING
- **CHỈ DÙNG** Tailwind CSS classes
- **❌ KHÔNG** inline styles
- Responsive: mobile-first (`grid-cols-1 lg:grid-cols-2`)

### 4️⃣ INTERNATIONALIZATION
```tsx
const { t } = useTranslation();
<h1>{t('common.welcome')}</h1>  // ✅ ĐÚNG
<h1>Chào mừng</h1>              // ❌ SAI - hardcode
```

### 5️⃣ AUTO-IMPORTED (không cần import)
```tsx
// React: useState, useEffect, useCallback, useMemo, useRef, lazy, memo
// Router: useNavigate, useLocation, useParams, Link, NavLink
// i18n: useTranslation, Trans
```

---

## 🔥 DATA FETCHING PATTERN (BẮT BUỘC)

### **AbortController + Loading State**

```tsx
export default function MyPage() {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);  // ✅ Initial TRUE
  const [refreshKey, setRefreshKey] = useState(0);
  const toast = useToast();

  // Fetch với AbortController
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await service.getAll(controller.signal);
        if (!controller.signal.aborted) {
          setData(response.data.data || []);
          setLoading(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({ title: 'Lỗi tải dữ liệu', message: getErrorMessage(error) });
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort(); // ✅ Cleanup
  }, [refreshKey]);

  const refreshData = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const handleCreate = async (formData: CreateData) => {
    try {
      await service.create(formData);
      toast.success({ title: 'Thành công' });
      refreshData();
    } catch (error) {
      toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
    }
  };

  return (
    <div>
      {loading && <LoadingSpinner />}
      {!loading && data.length === 0 && <EmptyState />}
      {!loading && data.length > 0 && <DataGrid data={data} />}
    </div>
  );
}
```

**Service phải support AbortSignal:**
```tsx
class MyService {
  async getAll(signal?: AbortSignal) {
    return httpClient.get('/api/endpoint', { signal });
  }
}
```

---

## ⚠️ ERROR HANDLING

**getErrorMessage() - CHECK VALIDATION ERRORS TRƯỚC:**

```tsx
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;

    // 1. PRIORITY: Validation errors (chi tiết)
    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors;
      const firstErrorKey = Object.keys(errors)[0];
      return errors[firstErrorKey][0];
    }

    // 2. FALLBACK: General message
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    // 3. Network errors
    if (axiosError.message === 'Network Error') {
      return 'Không thể kết nối đến server';
    }

    return axiosError.message;
  }

  return 'Đã xảy ra lỗi không xác định';
}
```

---

## ✅ CHECKLIST TẠO FEATURE MỚI

### 1. **Backend-Frontend Consistency** ⭐ **QUAN TRỌNG NHẤT**
- ✅ Check Backend Resource → biết keys nào
- ✅ Interface khớp 100% với Backend (PascalCase Vietnamese)
- ✅ Variable names tiếng Việt: `dichVus` thay vì `services`
- ✅ KHÔNG tạo mapping functions
- ✅ GIỮ NGUYÊN design nếu đang refactor

### 2. **TypeScript**
- Import interface từ service file
- Type all state và functions
- ❌ NO `any` type

### 3. **Styling**
- Tailwind CSS classes only
- ❌ KHÔNG thay đổi design khi refactor

### 4. **i18n**
- `t('key')` cho text
- ❌ KHÔNG hardcode strings

### 5. **Data Fetching**
- ✅ `loading` initial = `true`
- ✅ AbortController trong useEffect
- ✅ Check `!controller.signal.aborted` trước update state
- ✅ Ignore `CanceledError` trong catch
- ✅ Service support `AbortSignal`
- ✅ Refresh function set `loading=true`

### 6. **Error Handling**
- ✅ `getErrorMessage(error)` cho chi tiết validation errors
- ✅ Toast error chỉ cho non-cancelled requests

### 7. **Loading States**
- Loading → Empty → Data states

---

## 🚨 COMMON MISTAKES

**Backend ↔ Frontend:**
- ❌ **Mapping data** giữa BE và FE (KHÔNG BAO GIỜ mapping!)
- ❌ Dùng English keys thay vì Vietnamese keys từ Backend
- ❌ Thay đổi UI/design khi refactor (phải GIỮ NGUYÊN)
- ❌ Tạo interface riêng thay vì dùng từ service

**TypeScript:**
- ❌ Dùng `any` type
- ❌ Import thủ công React hooks (đã auto-import)

**Styling & i18n:**
- ❌ Inline styles (dùng Tailwind)
- ❌ Hardcode strings (dùng i18n)

**Error Handling:**
- ❌ Check `message` trước `errors` (phải check errors TRƯỚC)
- ❌ Không xử lý `CanceledError` riêng

**API & Loading:**
- ❌ Không dùng AbortController
- ❌ Initial `loading=false` (gây flash empty state)
- ❌ Quên set `loading=true` trong refresh
- ❌ Set `loading=false` cho cancelled requests
- ❌ Service không support `AbortSignal`
- ❌ Không check `controller.signal.aborted`

**React Best Practices:**
- ❌ Không cleanup trong useEffect return
- ❌ Duplicate API calls (không handle StrictMode)

---

## 📁 QUICK REFERENCE

**Code phải:**
- ✅ **Backend-consistent** (keys khớp 100%, KHÔNG mapping)
- ✅ **Design-preserved** (giữ nguyên UI/UX khi refactor)
- ✅ Type-safe (TypeScript strict)
- ✅ Internationalized (i18n)
- ✅ Error-handled (validation errors prioritized)
- ✅ Request-managed (AbortController)
- ✅ Loading-friendly (initial `true`)
- ✅ StrictMode-compatible

**Dev commands:**
```bash
npm run dev      # Port 3000
npm run build    # Output: out/
```
