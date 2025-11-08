# 🤖 INSTRUCTIONS FOR CLAUDE AI - React Frontend

## 📋 CORE ARCHITECTURE

**Stack:** React 19 + TypeScript 5.8 + Vite 7 + Tailwind CSS 3.4 + React Router v7

**Folder Structure:**
```
src/
├── pages/{feature}/page.tsx      # Pages (lazy loaded)
├── components/base/              # Reusable components
├── hooks/                        # Custom hooks (use{Name})
├── router/config.tsx             # Route definitions
├── i18n/                         # Translations
└── lib/                          # Utils (http-client, etc.)
```

---

## 🎯 KEY PATTERNS

### 1️⃣ PAGE PATTERN (BẮT BUỘC)

**Tạo page mới:**
1. Tạo: `src/pages/{feature}/page.tsx`
2. Export default component
3. Lazy load trong `src/router/config.tsx`

```tsx
// src/pages/rooms/page.tsx
export default function Rooms() {
  return <div>Rooms</div>;
}

// src/router/config.tsx
const Rooms = lazy(() => import('../pages/rooms/page'));
const routes: RouteObject[] = [
  { path: '/rooms', element: <Rooms /> }
];
```

**Feature-specific components:**
```
src/pages/dashboard/
├── page.tsx           # Main page
└── components/        # Dashboard-only components
    ├── Header.tsx
    └── StatsCards.tsx
```

---

### 2️⃣ TYPESCRIPT (BẮT BUỘC)

**Interface cho props:**
```tsx
interface ComponentProps {
  title: string;
  onUpdate: (id: string) => void;
  age?: number;  // Optional
}

export default function MyComponent({ title, onUpdate, age }: ComponentProps) {
  const [user, setUser] = useState<User | null>(null);
  // ...
}
```

**❌ KHÔNG dùng `any`**

---

### 3️⃣ STYLING (Tailwind CSS)

```tsx
// ✅ ĐÚNG - Tailwind classes
<div className="flex h-screen bg-gray-50">
  <h1 className="text-2xl font-bold text-gray-900 mb-2">Title</h1>
</div>

// ❌ SAI - Inline styles
<div style={{ display: 'flex' }}>
```

**Responsive:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

---

### 4️⃣ INTERNATIONALIZATION (i18n)

```tsx
// ✅ ĐÚNG
const { t } = useTranslation();
<h1>{t('common.welcome')}</h1>
<p>{t('messages.greeting', { name: 'John' })}</p>

// ❌ SAI - Hardcode text
<h1>Chào mừng</h1>
```

**Translation files:** `src/i18n/local/{lang}/{namespace}.json`

---

### 5️⃣ AUTO-IMPORTED APIS

**Không cần import (configured in vite.config.ts):**
```tsx
// React Hooks
useState, useEffect, useCallback, useMemo, useRef, lazy, memo

// React Router
useNavigate, useLocation, useParams, Link, NavLink

// i18next
useTranslation, Trans
```

---

### 6️⃣ CUSTOM HOOKS

**Location:** `src/hooks/use{Feature}.ts`

```tsx
// src/hooks/useToast.ts
export function useToast() {
  const showToast = useCallback((type: 'success' | 'error', options) => {
    // Implementation
  }, []);

  return {
    success: (options) => showToast('success', options),
    error: (options) => showToast('error', options),
  };
}

// Usage
const toast = useToast();
toast.success({ title: 'Thành công!' });
```

---

## 🔥 DATA FETCHING PATTERN (BẮT BUỘC)

### **AbortController + Loading State**

**React StrictMode** mount component 2 lần → Cần AbortController để tránh duplicate API calls

**Pattern đầy đủ:**

```tsx
export default function MyPage() {
  // State
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);  // ✅ Initial TRUE
  const [refreshKey, setRefreshKey] = useState(0);

  const toast = useToast();

  // Fetch with AbortController
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await service.getAll(controller.signal);

        // Check nếu chưa bị abort
        if (!controller.signal.aborted) {
          setData(response.data.data || []);
          setLoading(false);
        }
      } catch (error: any) {
        // Ignore cancelled requests
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({
            title: 'Lỗi tải dữ liệu',
            message: getErrorMessage(error) // ✅ Chi tiết validation error
          });
          setLoading(false);
        }
        // Cancelled requests KHÔNG set loading=false
      }
    };

    fetchData();

    // Cleanup: abort khi unmount
    return () => controller.abort();
  }, [refreshKey]);

  // Refresh handler
  const refreshData = () => {
    setLoading(true);  // ✅ Reset loading
    setRefreshKey(prev => prev + 1);
  };

  // Create/Update handler
  const handleCreate = async (formData: CreateData) => {
    try {
      await service.create(formData);
      toast.success({ title: 'Thành công' });
      refreshData();
    } catch (error) {
      toast.error({
        title: 'Lỗi',
        message: getErrorMessage(error)  // ✅ Chi tiết error
      });
    }
  };

  // Render
  return (
    <div>
      {loading && <LoadingSpinner />}
      {!loading && data.length === 0 && <EmptyState />}
      {!loading && data.length > 0 && <DataGrid data={data} />}
    </div>
  );
}
```

**Service methods phải support AbortSignal:**
```tsx
class MyService {
  async getAll(signal?: AbortSignal) {
    return httpClient.get('/api/endpoint', { signal });
  }
}
```

---

## ⚠️ ERROR HANDLING

**getErrorMessage() trong `lib/http-client.ts`:**

```tsx
// ✅ ĐÚNG - Check validation errors TRƯỚC
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;

    // 1. PRIORITY: Validation errors (chi tiết)
    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors;
      const firstErrorKey = Object.keys(errors)[0];
      return errors[firstErrorKey][0]; // "Tên loại phòng đã tồn tại"
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

**Usage:**
```tsx
toast.error({
  title: 'Lỗi',
  message: getErrorMessage(error) // ✅ Hiển thị chi tiết validation error
});
```

---

## ✅ CHECKLIST TẠO FEATURE MỚI

1. **Page Setup**
   - Tạo `src/pages/{feature}/page.tsx` (export default)
   - Lazy load trong `src/router/config.tsx`

2. **TypeScript**
   - Define interfaces cho props
   - Type all state và functions
   - ❌ NO `any` type

3. **Styling**
   - Tailwind CSS classes
   - Responsive: mobile-first

4. **i18n**
   - `t('key')` cho text
   - Add keys to `src/i18n/local/{lang}/`

5. **Data Fetching** (nếu có API)
   - ✅ `loading` initial = `true`
   - ✅ AbortController trong useEffect
   - ✅ Check `!controller.signal.aborted` trước update state
   - ✅ Ignore `CanceledError` trong catch
   - ✅ Service support `AbortSignal`
   - ✅ Refresh function set `loading=true`

6. **Error Handling**
   - ✅ `getErrorMessage(error)` cho chi tiết validation errors
   - ✅ Toast error chỉ cho non-cancelled requests

7. **Loading States**
   - Loading → Empty → Data states

---

## 🚨 COMMON MISTAKES

**Architecture:**
- ❌ Không lazy load pages
- ❌ Quên export default trong page.tsx
- ❌ Reusable components trong `pages/` (phải trong `components/base/`)

**TypeScript:**
- ❌ Dùng `any` type
- ❌ Component không có interface
- ❌ Import thủ công React hooks (đã auto-import)

**Styling & i18n:**
- ❌ Inline styles (dùng Tailwind)
- ❌ Hardcode strings (dùng i18n)

**Error Handling:**
- ❌ Check `message` trước `errors` trong `getErrorMessage()` (phải check errors TRƯỚC)
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

**Dev commands:**
```bash
npm run dev      # Port 3000
npm run build    # Output: out/
```

**Common patterns:**
```tsx
// Navigation
const navigate = useNavigate();
navigate('/dashboard');

// State Management (Context)
const AppContext = createContext<AppContextType>(undefined);

// Memoization
const value = useMemo(() => compute(data), [data]);
const handler = useCallback(() => doSomething(), [dep]);
const MemoComp = memo(MyComponent);
```

**Code phải:**
- ✅ Type-safe (TypeScript strict)
- ✅ Internationalized (i18n)
- ✅ Optimized (lazy loading)
- ✅ Error-handled (validation errors prioritized)
- ✅ Request-managed (AbortController)
- ✅ Loading-friendly (initial `true`)
- ✅ StrictMode-compatible
