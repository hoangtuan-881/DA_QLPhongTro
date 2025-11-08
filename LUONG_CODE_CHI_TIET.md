# 🔍 LUỒNG CODE CHI TIẾT - STEP BY STEP

> Document này giải thích **TỪNG DÒNG CODE** chạy như thế nào khi load dữ liệu và thực hiện CRUD

---

## 📖 MỤC LỤC

1. [Luồng Load Dữ liệu (GET)](#1-luồng-load-dữ-liệu-get)
2. [Luồng Thêm Mới (CREATE)](#2-luồng-thêm-mới-create)
3. [Luồng Chỉnh Sửa (UPDATE)](#3-luồng-chỉnh-sửa-update)
4. [Luồng Xóa (DELETE)](#4-luồng-xóa-delete)
5. [Luồng Filter & Search](#5-luồng-filter--search)

---

## 1. LUỒNG LOAD DỮ LIỆU (GET)

### 📍 File: `src/pages/tenants/page.tsx`

### **STEP 1: Component Mount (Khởi tạo)**

```tsx
export default function TenantsPage() {
  // ✅ BƯỚC 1.1: Khởi tạo states
  const [tenants, setTenants] = useState<KhachThue[]>([]);
  const [loading, setLoading] = useState(true);  // ⚠️ Initial TRUE
  const [refreshKey, setRefreshKey] = useState(0);

  const toast = useToast();

  // Component vừa mount xong → React render lần 1
  // UI hiển thị: Loading spinner (vì loading = true)
```

**Giải thích:**
- `tenants`: Mảng rỗng `[]` - chưa có data
- `loading`: `true` - để hiển thị spinner ngay từ đầu
- `refreshKey`: `0` - dùng để trigger re-fetch

---

### **STEP 2: useEffect Trigger (Sau khi render lần 1)**

```tsx
  useEffect(() => {
    // ✅ BƯỚC 2.1: Tạo AbortController
    const controller = new AbortController();

    // ✅ BƯỚC 2.2: Define async function
    const fetchData = async () => {
      try {
        // ✅ BƯỚC 2.3: Gọi API
        const response = await khachThueService.getAll(controller.signal);

        // ✅ BƯỚC 2.4: Check xem request có bị cancel không
        if (!controller.signal.aborted) {
          // ✅ BƯỚC 2.5: Cập nhật state với data từ API
          setTenants(response.data.data || []);
          setLoading(false);  // Tắt loading
        }
      } catch (error: any) {
        // ✅ BƯỚC 2.6: Xử lý lỗi
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({
            title: 'Lỗi tải dữ liệu',
            message: getErrorMessage(error),
          });
          setLoading(false);
        }
        // Nếu là CanceledError → không làm gì (ignore)
      }
    };

    // ✅ BƯỚC 2.7: Gọi hàm fetchData
    fetchData();

    // ✅ BƯỚC 2.8: Cleanup function (khi component unmount)
    return () => {
      controller.abort();  // Cancel request nếu component unmount
    };
  }, [refreshKey]);  // ⚠️ Chạy lại khi refreshKey thay đổi
```

**Timeline thực tế:**

```
T0: Component mount
    ↓
T1: useState khởi tạo (loading = true, tenants = [])
    ↓
T2: React render UI lần 1 → Hiển thị Loading Spinner
    ↓
T3: useEffect chạy
    ↓ (2ms)
T4: AbortController tạo
    ↓ (1ms)
T5: fetchData() được gọi
    ↓
T6: khachThueService.getAll(signal) gọi
    ↓
    === CHUYỂN SANG SERVICE LAYER ===
```

---

### **STEP 3: Service Layer**

📍 **File:** `src/services/khach-thue.service.ts`

```tsx
class KhachThueService {
  async getAll(signal?: AbortSignal) {
    // ✅ BƯỚC 3.1: Gọi httpClient (Axios wrapper)
    return httpClient.get<KhachThue[]>(API_ENDPOINTS.KHACH_THUE, { signal });
    //                                 ↓
    //                    '/admin/khach-thue'
  }
}

export default new KhachThueService();
```

**Timeline:**
```
T7: Service nhận signal từ component
    ↓
T8: Gọi httpClient.get() với endpoint '/admin/khach-thue'
    ↓
    === CHUYỂN SANG HTTP CLIENT ===
```

---

### **STEP 4: HTTP Client (Axios)**

📍 **File:** `src/lib/http-client.ts`

```tsx
import axios from 'axios';

const httpClient = axios.create({
  baseURL: 'http://localhost:8000/api',  // Base URL
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request Interceptor (trước khi gửi request)
httpClient.interceptors.request.use(
  (config) => {
    // ✅ BƯỚC 4.1: Thêm token vào header (nếu có)
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor (sau khi nhận response)
httpClient.interceptors.response.use(
  (response) => {
    // ✅ BƯỚC 4.2: Response thành công → return data
    return response;
  },
  (error) => {
    // ✅ BƯỚC 4.3: Xử lý lỗi
    if (error.response?.status === 401) {
      // Unauthorized → redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Timeline:**
```
T9:  httpClient.get() được gọi
     ↓
T10: Request Interceptor chạy → Thêm Authorization header
     ↓
T11: Axios gửi HTTP request đến Backend
     ↓
     Full URL: http://localhost:8000/api/admin/khach-thue
     Method: GET
     Headers: {
       Authorization: "Bearer token_here",
       Content-Type: "application/json"
     }
     ↓
     === CHUYỂN SANG BACKEND (Laravel) ===
```

---

### **STEP 5: Backend Processing (Laravel)**

📍 **File Backend:** `QuanLyPhongTroBE/routes/api.php`

```php
Route::prefix('admin')->group(function () {
    Route::apiResource('khach-thue', KhachThueController::class);
});
```

**Routing:**
```
GET /api/admin/khach-thue
    ↓
KhachThueController@index
```

---

📍 **File:** `app/Http/Controllers/KhachThueController.php`

```php
public function index()
{
    // ✅ BƯỚC 5.1: Gọi Service
    $khachThue = $this->service->getAllKhachThue();

    // ✅ BƯỚC 5.2: Transform data với Resource
    return $this->successResponse(
        KhachThueResource::collection($khachThue),
        __('messages.success.retrieved')
    );
}
```

---

📍 **File:** `app/Services/KhachThueService.php`

```php
public function getAllKhachThue()
{
    // ✅ BƯỚC 5.3: Gọi Repository
    return $this->khachThueRepo->getAll();
}
```

---

📍 **File:** `app/Repositories/Eloquents/KhachThueRepo.php`

```php
public function getAll(): Collection
{
    // ✅ BƯỚC 5.4: Query database với eager loading
    return KhachThue::with(['taiKhoan', 'phongTro.dayTro'])->get();
}
```

**SQL Query thực tế:**
```sql
-- Query 1: Lấy tất cả KhachThue
SELECT * FROM KhachThue;

-- Query 2: Eager load TaiKhoan
SELECT * FROM TaiKhoan WHERE MaTaiKhoan IN (1, 2, 3, 4, 5);

-- Query 3: Eager load PhongTro
SELECT * FROM PhongTro WHERE MaPhong IN (...);

-- Query 4: Eager load DayTro
SELECT * FROM DayTro WHERE MaDay IN (...);
```

**Kết quả từ Database:**
```json
[
  {
    "MaKhachThue": 1,
    "HoTen": "Nguyễn Văn A",
    "SDT1": "0901234567",
    "Email": "nguyenvana@email.com",
    "VaiTro": "KHACH_CHINH",
    "BienSoXe": "29A1-12345",
    "GhiChu": "Khách hàng thân thiết",
    "taiKhoan": { ... },
    "phongTro": {
      "TenPhong": "A101",
      "dayTro": {
        "DiaChi": "123 Đường ABC"
      }
    }
  },
  // ... 4 records khác
]
```

---

📍 **File:** `app/Http/Resources/KhachThueResource.php`

```php
public function toArray(Request $request): array
{
    // ✅ BƯỚC 5.5: Transform data
    return [
        'MaKhachThue' => $this->MaKhachThue,
        'HoTen' => $this->HoTen,
        'SDT1' => $this->SDT1,
        // ... các fields khác
        'BienSoXe' => $this->BienSoXe,
        'GhiChu' => $this->GhiChu,

        // Computed attributes (từ Model)
        'TenPhong' => $this->TenPhong,  // Accessor
        'DiaChiDay' => $this->DiaChiDay, // Accessor

        // ❌ KHÔNG return created_at, updated_at
    ];
}
```

**Response JSON từ Backend:**
```json
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "data": [
    {
      "MaKhachThue": 1,
      "HoTen": "Nguyễn Văn A",
      "SDT1": "0901234567",
      "Email": "nguyenvana@email.com",
      "VaiTro": "KHACH_CHINH",
      "BienSoXe": "29A1-12345",
      "GhiChu": "Khách hàng thân thiết",
      "TenPhong": "A101",
      "DiaChiDay": "123 Đường ABC"
    },
    // ... 4 records khác
  ]
}
```

**Timeline:**
```
T12: Laravel nhận request
     ↓
T13: Routing → KhachThueController@index
     ↓ (1ms)
T14: Controller → Service
     ↓ (0.5ms)
T15: Service → Repository
     ↓ (0.5ms)
T16: Repository → Database (MySQL)
     ↓ (10-50ms - tùy query complexity)
T17: Database return 5 records
     ↓ (1ms)
T18: Eloquent Models tạo
     ↓ (2ms)
T19: Resource transform data
     ↓ (1ms)
T20: Controller return JSON response
     ↓
     === RESPONSE TRỞ VỀ FRONTEND ===
```

---

### **STEP 6: Frontend Nhận Response**

📍 **Quay lại:** `src/pages/tenants/page.tsx`

```tsx
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        // ✅ BƯỚC 6.1: Axios nhận response từ Backend
        const response = await khachThueService.getAll(controller.signal);

        // response = {
        //   data: {
        //     success: true,
        //     message: "...",
        //     data: [ {...}, {...}, ... ]  ← 5 khách thuê
        //   },
        //   status: 200,
        //   statusText: "OK"
        // }

        // ✅ BƯỚC 6.2: Kiểm tra xem request có bị cancel không
        if (!controller.signal.aborted) {

          // ✅ BƯỚC 6.3: Lấy array data từ response.data.data
          setTenants(response.data.data || []);
          //            └─────┬─────┘
          //                  └─ Array của 5 KhachThue objects

          // ✅ BƯỚC 6.4: Tắt loading
          setLoading(false);

          // 🎯 LÚC NÀY:
          // - tenants = [5 objects]
          // - loading = false
          // - React sẽ RE-RENDER component
        }

      } catch (error: any) {
        // ... error handling
      }
    };

    fetchData();
    return () => controller.abort();
  }, [refreshKey]);
```

**Timeline:**
```
T21: Axios nhận HTTP response
     ↓
T22: Response Interceptor chạy (nếu có)
     ↓
T23: Promise resolve → response object
     ↓
T24: Check controller.signal.aborted → false (OK)
     ↓
T25: setTenants([...5 objects...])
     ↓
T26: setLoading(false)
     ↓
T27: React phát hiện state thay đổi
     ↓
T28: React RE-RENDER component
     ↓
     === RENDER UI VỚI DATA ===
```

---

### **STEP 7: Render UI với Data**

```tsx
  // ✅ BƯỚC 7.1: Render conditional
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {loading ? (
        // ❌ loading = false → Không render block này
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredTenants.length === 0 ? (
        // ❌ filteredTenants = 5 → Không render block này
        <div className="text-center py-12">
          <p className="text-gray-600">Chưa có khách thuê nào</p>
        </div>
      ) : (
        // ✅ RENDER BLOCK NÀY
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th>Họ tên</th>
                <th>Điện thoại</th>
                <th>Email</th>
                {/* ... */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* ✅ BƯỚC 7.2: Map qua từng tenant */}
              {filteredTenants.map((tenant) => (
                <tr key={tenant.MaKhachThue}>
                  <td>{tenant.HoTen}</td>
                  <td>{tenant.SDT1}</td>
                  <td>{tenant.Email || '-'}</td>
                  <td>{tenant.TenPhong || '-'}</td>
                  <td>
                    <span className={getVaiTroColor(tenant.VaiTro)}>
                      {getVaiTroText(tenant.VaiTro)}
                    </span>
                  </td>
                  <td>{tenant.BienSoXe || '-'}</td>
                  <td>
                    <button onClick={() => {...}}>Xem</button>
                    <button onClick={() => {...}}>Sửa</button>
                    <button onClick={() => {...}}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
```

**Timeline:**
```
T29: React render table
     ↓
T30: Map qua 5 tenants → tạo 5 <tr>
     ↓
T31: Hiển thị data lên UI
     ↓
T32: ✅ HOÀN THÀNH - User thấy danh sách 5 khách thuê
```

**Tổng thời gian:** ~50-100ms (tùy network + database)

---

## 2. LUỒNG THÊM MỚI (CREATE)

### **STEP 1: User Click "Thêm khách thuê"**

```tsx
<button onClick={() => setShowAddModal(true)}>
  + Thêm khách thuê
</button>
```

**Timeline:**
```
T1: User click button
    ↓
T2: setShowAddModal(true)
    ↓
T3: React re-render
    ↓
T4: Modal hiển thị
```

---

### **STEP 2: User Điền Form và Submit**

```tsx
{showAddModal && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
      <h3>Thêm khách thuê mới</h3>

      {/* ✅ BƯỚC 2.1: Form với các input fields */}
      <form onSubmit={handleAddTenant}>
        <input name="TenDangNhap" required />
        <input name="password" type="password" required />
        <input name="HoTen" required />
        <input name="SDT1" required />
        <input name="Email" type="email" />
        <input name="BienSoXe" placeholder="29A1-12345" />
        <select name="VaiTro" defaultValue="KHACH_CHINH">
          <option value="KHACH_CHINH">Khách chính</option>
          <option value="THANH_VIEN">Thành viên</option>
          {/* ... */}
        </select>
        <textarea name="GhiChu" rows={3} />

        <button type="submit">Thêm</button>
      </form>
    </div>
  </div>
)}
```

**User actions:**
```
T5: User điền form
    - TenDangNhap: "nguyenvanf"
    - password: "password123"
    - HoTen: "Nguyễn Văn F"
    - SDT1: "0934567890"
    - Email: "nguyenvanf@email.com"
    - VaiTro: "KHACH_CHINH"
    - BienSoXe: "29B1-99999"
    - GhiChu: "Khách mới"
    ↓
T6: User click "Thêm"
    ↓
T7: Form submit event → handleAddTenant() được gọi
```

---

### **STEP 3: Handler Xử Lý Submit**

```tsx
const handleAddTenant = async (e: React.FormEvent<HTMLFormElement>) => {
  // ✅ BƯỚC 3.1: Prevent default form submission
  e.preventDefault();

  // ✅ BƯỚC 3.2: Lấy data từ form
  const formData = new FormData(e.currentTarget);

  // formData = {
  //   TenDangNhap: "nguyenvanf",
  //   password: "password123",
  //   HoTen: "Nguyễn Văn F",
  //   SDT1: "0934567890",
  //   Email: "nguyenvanf@email.com",
  //   ... (tất cả các fields)
  // }

  // ✅ BƯỚC 3.3: Build object data theo Backend interface
  const data: KhachThueCreateInput = {
    TenDangNhap: formData.get('TenDangNhap') as string,
    password: formData.get('password') as string,
    HoTen: formData.get('HoTen') as string,
    SDT1: formData.get('SDT1') as string,
    SDT2: (formData.get('SDT2') as string) || null,
    Email: (formData.get('Email') as string) || null,
    CCCD: (formData.get('CCCD') as string) || null,
    // ... các fields khác
    VaiTro: (formData.get('VaiTro') as string) || 'KHACH_CHINH',
    BienSoXe: (formData.get('BienSoXe') as string) || null,
    GhiChu: (formData.get('GhiChu') as string) || null,
    SoXe: 0,
    MaPhong: null,
    MaLoaiXe: null,
    MaTaiKhoan: null,
    HinhAnh: null,
  };

  // ✅ BƯỚC 3.4: Gọi API
  try {
    await khachThueService.create(data);

    // ✅ BƯỚC 3.5: Thành công → Hiển thị toast
    toast.success({
      title: 'Thành công',
      message: 'Đã thêm khách thuê mới',
    });

    // ✅ BƯỚC 3.6: Đóng modal
    setShowAddModal(false);

    // ✅ BƯỚC 3.7: Refresh data để load lại danh sách
    refreshData();

  } catch (error) {
    // ✅ BƯỚC 3.8: Lỗi → Hiển thị toast error
    toast.error({
      title: 'Lỗi thêm khách thuê',
      message: getErrorMessage(error),
    });
  }
};
```

**Timeline:**
```
T8:  handleAddTenant() chạy
     ↓
T9:  e.preventDefault()
     ↓
T10: Lấy data từ FormData
     ↓
T11: Build object theo interface
     ↓
T12: khachThueService.create(data) được gọi
     ↓
     === CHUYỂN SANG SERVICE ===
```

---

### **STEP 4: Service Layer**

📍 **File:** `src/services/khach-thue.service.ts`

```tsx
class KhachThueService {
  async create(data: KhachThueCreateInput) {
    // ✅ BƯỚC 4.1: POST request
    return httpClient.post<KhachThue>(API_ENDPOINTS.KHACH_THUE, data);
    //                                ↓
    //                   '/admin/khach-thue'
  }
}
```

**Timeline:**
```
T13: Service nhận data object
     ↓
T14: httpClient.post() được gọi
     ↓
     Full URL: http://localhost:8000/api/admin/khach-thue
     Method: POST
     Body: {
       TenDangNhap: "nguyenvanf",
       password: "password123",
       HoTen: "Nguyễn Văn F",
       ...
     }
     ↓
     === CHUYỂN SANG BACKEND ===
```

---

### **STEP 5: Backend Processing**

📍 **Routing:** `POST /api/admin/khach-thue` → `KhachThueController@store`

📍 **File:** `app/Http/Controllers/KhachThueController.php`

```php
public function store(Request $request)
{
    // ✅ BƯỚC 5.1: Validate dữ liệu
    $this->validator->validateRequest($request, 'create');

    // ✅ BƯỚC 5.2: Gọi Service để tạo
    $khachThue = $this->service->createKhachThue($request->all());

    // ✅ BƯỚC 5.3: Return response
    return $this->createdResponse(
        new KhachThueResource($khachThue),
        __('messages.success.created')
    );
}
```

---

📍 **File:** `app/Validators/KhachThue/KhachThueValidator.php`

```php
public function ruleCreate(): array
{
    return [
        'TenDangNhap' => ['required', 'string', 'max:50', 'unique:TaiKhoan'],
        'password' => ['required', 'string', 'min:6'],
        'HoTen' => ['required', 'string', 'max:100'],
        'SDT1' => ['required', 'string', 'max:15'],
        'Email' => ['nullable', 'string', 'email', 'max:100'],
        'BienSoXe' => ['nullable', 'string', 'max:20'],
        'GhiChu' => ['nullable', 'string'],
        'VaiTro' => ['nullable', 'string', 'max:50'],
        'MaPhong' => ['nullable', 'integer', 'exists:PhongTro,MaPhong'],
        // ... các rules khác
    ];
}
```

**Validation:**
```
T15: Validator check từng field
     ↓
     ✅ TenDangNhap: required, unique → PASS
     ✅ password: min:6 → PASS
     ✅ HoTen: required → PASS
     ✅ SDT1: required → PASS
     ✅ Email: email format → PASS
     ... tất cả PASS
     ↓
T16: Validation thành công → continue
```

**Nếu validation FAIL:**
```php
// Laravel tự động return error response:
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": {
    "TenDangNhap": ["Tên đăng nhập đã tồn tại"],
    "password": ["Mật khẩu phải có ít nhất 6 ký tự"]
  }
}
```

---

📍 **File:** `app/Services/KhachThueService.php`

```php
public function createKhachThue(array $data)
{
    $khachThue = null;

    // ✅ BƯỚC 5.4: Sử dụng transaction
    DB::transaction(function () use ($data, &$khachThue) {

        // ✅ BƯỚC 5.4.1: Tạo TaiKhoan trước
        $taiKhoan = $this->taiKhoanRepo->create([
            'TenDangNhap' => $data['TenDangNhap'],
            'MatKhau' => Hash::make($data['password']),  // Hash password
            'MaQuyen' => PhanQuyenEnum::KHACH_THUE->value,
            'TrangThaiTaiKhoan' => $data['TrangThaiTaiKhoan'] ?? 'Hoạt động',
        ]);

        // ✅ BƯỚC 5.4.2: Tạo KhachThue
        $khachThue = $this->khachThueRepo->create([
            'HoTen' => $data['HoTen'],
            'SDT1' => $data['SDT1'],
            'SDT2' => $data['SDT2'] ?? null,
            'Email' => $data['Email'] ?? null,
            'MaTaiKhoan' => $taiKhoan->MaTaiKhoan,  // Link với TaiKhoan
            'VaiTro' => $data['VaiTro'] ?? 'KHACH_CHINH',
            'BienSoXe' => $data['BienSoXe'] ?? null,
            'GhiChu' => $data['GhiChu'] ?? null,
            'SoXe' => 0,
            'MaPhong' => null,
            // ... các fields khác
        ]);

        // ✅ BƯỚC 5.4.3: Eager load relationships
        $khachThue->load(['taiKhoan', 'phongTro.dayTro']);
    });

    return $khachThue;
}
```

**SQL Queries thực tế:**
```sql
-- Transaction BEGIN

-- Query 1: INSERT TaiKhoan
INSERT INTO TaiKhoan (
  TenDangNhap, MatKhau, MaQuyen, TrangThaiTaiKhoan
) VALUES (
  'nguyenvanf',
  '$2y$10$hashed_password_here',
  3,
  'Hoạt động'
);
-- → MaTaiKhoan = 6 (auto increment)

-- Query 2: INSERT KhachThue
INSERT INTO KhachThue (
  HoTen, SDT1, Email, MaTaiKhoan, VaiTro, BienSoXe, GhiChu, SoXe
) VALUES (
  'Nguyễn Văn F',
  '0934567890',
  'nguyenvanf@email.com',
  6,
  'KHACH_CHINH',
  '29B1-99999',
  'Khách mới',
  0
);
-- → MaKhachThue = 6 (auto increment)

-- Query 3: Eager load TaiKhoan
SELECT * FROM TaiKhoan WHERE MaTaiKhoan = 6;

-- Transaction COMMIT
```

**Timeline:**
```
T17: Validation PASS
     ↓
T18: DB transaction bắt đầu
     ↓
T19: TaiKhoanRepo->create() → INSERT TaiKhoan
     ↓ (5ms)
T20: TaiKhoan created với MaTaiKhoan = 6
     ↓
T21: KhachThueRepo->create() → INSERT KhachThue
     ↓ (5ms)
T22: KhachThue created với MaKhachThue = 6
     ↓
T23: Eager load relationships
     ↓ (2ms)
T24: DB transaction COMMIT
     ↓
T25: Resource transform data
     ↓
T26: Return JSON response
```

**Response từ Backend:**
```json
{
  "success": true,
  "message": "Tạo thành công",
  "data": {
    "MaKhachThue": 6,
    "HoTen": "Nguyễn Văn F",
    "SDT1": "0934567890",
    "Email": "nguyenvanf@email.com",
    "VaiTro": "KHACH_CHINH",
    "BienSoXe": "29B1-99999",
    "GhiChu": "Khách mới",
    "TenPhong": null,
    "DiaChiDay": null
  }
}
```

---

### **STEP 6: Frontend Nhận Response**

📍 **Quay lại:** `handleAddTenant()`

```tsx
const handleAddTenant = async (e: React.FormEvent<HTMLFormElement>) => {
  // ... build data

  try {
    // ✅ BƯỚC 6.1: Axios nhận response 201 Created
    await khachThueService.create(data);

    // ✅ BƯỚC 6.2: Show success toast
    toast.success({
      title: 'Thành công',
      message: 'Đã thêm khách thuê mới',
    });

    // ✅ BƯỚC 6.3: Đóng modal
    setShowAddModal(false);

    // ✅ BƯỚC 6.4: Refresh data
    refreshData();

  } catch (error) {
    // ...
  }
};
```

---

### **STEP 7: Refresh Data**

```tsx
const refreshData = () => {
  // ✅ BƯỚC 7.1: Bật lại loading
  setLoading(true);

  // ✅ BƯỚC 7.2: Tăng refreshKey
  setRefreshKey((prev) => prev + 1);
  //              0 → 1
};
```

**Effect:**
```
T27: refreshKey thay đổi từ 0 → 1
     ↓
T28: useEffect dependency thay đổi
     ↓
T29: useEffect chạy lại (như STEP 2 ở phần Load dữ liệu)
     ↓
T30: Fetch lại data từ API
     ↓
T31: Nhận 6 khách thuê (5 cũ + 1 mới)
     ↓
T32: setTenants([...6 objects...])
     ↓
T33: React re-render
     ↓
T34: ✅ UI hiển thị 6 khách thuê (có "Nguyễn Văn F" mới)
```

---

## 3. LUỒNG CHỈNH SỬA (UPDATE)

### **STEP 1: User Click "Sửa"**

```tsx
<button onClick={() => {
  setEditingTenant(tenant);  // Lưu tenant đang edit
  setShowEditModal(true);     // Mở modal
}}>
  Sửa
</button>
```

**Timeline:**
```
T1: User click "Sửa" trên row "Nguyễn Văn A"
    ↓
T2: setEditingTenant({...data Nguyễn Văn A...})
    ↓
T3: setShowEditModal(true)
    ↓
T4: React re-render
    ↓
T5: Edit Modal hiển thị với data sẵn
```

---

### **STEP 2: Modal Hiển Thị với Pre-filled Data**

```tsx
{showEditModal && editingTenant && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <form onSubmit={handleUpdateTenant}>
      {/* ✅ defaultValue = data hiện tại */}
      <input
        name="HoTen"
        defaultValue={editingTenant.HoTen}
        // defaultValue = "Nguyễn Văn A"
      />
      <input
        name="SDT1"
        defaultValue={editingTenant.SDT1}
        // defaultValue = "0901234567"
      />
      <input
        name="Email"
        defaultValue={editingTenant.Email || ''}
        // defaultValue = "nguyenvana@email.com"
      />
      <select
        name="VaiTro"
        defaultValue={editingTenant.VaiTro}
        // defaultValue = "KHACH_CHINH"
      >
        <option value="KHACH_CHINH">Khách chính</option>
        {/* ... */}
      </select>
      <input
        name="BienSoXe"
        defaultValue={editingTenant.BienSoXe || ''}
        // defaultValue = "29A1-12345"
      />
      <textarea
        name="GhiChu"
        defaultValue={editingTenant.GhiChu || ''}
        // defaultValue = "Khách hàng thân thiết"
      />

      <button type="submit">Cập nhật</button>
    </form>
  </div>
)}
```

**User actions:**
```
T6: User thấy form với data sẵn
    ↓
T7: User chỉnh sửa:
    - Đổi email: "nguyenvana@gmail.com"
    - Đổi VaiTro: "THANH_VIEN"
    - Đổi GhiChu: "Thành viên gia đình"
    (Các field khác giữ nguyên)
    ↓
T8: User click "Cập nhật"
    ↓
T9: Form submit → handleUpdateTenant() được gọi
```

---

### **STEP 3: Handler Xử Lý Update**

```tsx
const handleUpdateTenant = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // ✅ BƯỚC 3.1: Check editingTenant có tồn tại không
  if (!editingTenant) return;

  // ✅ BƯỚC 3.2: Lấy data từ form
  const formData = new FormData(e.currentTarget);

  // ✅ BƯỚC 3.3: Chỉ gửi fields đã thay đổi (không null/empty)
  const data: any = {};
  const fields = [
    'HoTen', 'SDT1', 'SDT2', 'Email', 'CCCD', 'NgayCapCCCD',
    'NoiCapCCCD', 'DiaChiThuongTru', 'NgaySinh', 'NoiSinh',
    'VaiTro', 'BienSoXe', 'GhiChu',
  ];

  fields.forEach((field) => {
    const value = formData.get(field);
    if (value !== null && value !== '') {
      data[field] = value;
    }
  });

  // data = {
  //   HoTen: "Nguyễn Văn A",  (không đổi)
  //   SDT1: "0901234567",      (không đổi)
  //   Email: "nguyenvana@gmail.com",  ← ĐÃ ĐỔI
  //   VaiTro: "THANH_VIEN",           ← ĐÃ ĐỔI
  //   BienSoXe: "29A1-12345",  (không đổi)
  //   GhiChu: "Thành viên gia đình", ← ĐÃ ĐỔI
  // }

  try {
    // ✅ BƯỚC 3.4: Gọi API update với ID
    await khachThueService.update(editingTenant.MaKhachThue, data);
    //                             ↓
    //                      MaKhachThue = 1

    toast.success({
      title: 'Thành công',
      message: 'Đã cập nhật khách thuê',
    });

    setShowEditModal(false);
    setEditingTenant(null);
    refreshData();

  } catch (error) {
    toast.error({
      title: 'Lỗi cập nhật',
      message: getErrorMessage(error),
    });
  }
};
```

---

### **STEP 4: Service Layer**

```tsx
class KhachThueService {
  async update(id: number, data: KhachThueUpdateInput) {
    // ✅ PUT request
    return httpClient.put<KhachThue>(
      `${API_ENDPOINTS.KHACH_THUE}/${id}`,
      data
    );
    //   ↓
    //  '/admin/khach-thue/1'
  }
}
```

**Request:**
```
PUT http://localhost:8000/api/admin/khach-thue/1

Body: {
  "HoTen": "Nguyễn Văn A",
  "SDT1": "0901234567",
  "Email": "nguyenvana@gmail.com",
  "VaiTro": "THANH_VIEN",
  "BienSoXe": "29A1-12345",
  "GhiChu": "Thành viên gia đình"
}
```

---

### **STEP 5: Backend Processing**

📍 **Routing:** `PUT /api/admin/khach-thue/1` → `KhachThueController@update`

```php
public function update(Request $request, $id)
{
    // ✅ Validate với ruleUpdate (dùng 'sometimes')
    $this->validator->validateRequest($request, 'update');

    // ✅ Gọi Service
    $khachThue = $this->service->updateKhachThue($id, $request->all());

    return $this->successResponse(
        new KhachThueResource($khachThue),
        __('messages.success.updated')
    );
}
```

---

📍 **Validator:**

```php
public function ruleUpdate(): array
{
    return [
        'HoTen' => ['sometimes', 'required', 'string', 'max:100'],
        //         ↑
        //         'sometimes' = chỉ validate nếu field có gửi lên

        'SDT1' => ['sometimes', 'required', 'string', 'max:15'],
        'Email' => ['nullable', 'string', 'email', 'max:100'],
        'VaiTro' => ['nullable', 'string', 'max:50'],
        'BienSoXe' => ['nullable', 'string', 'max:20'],
        'GhiChu' => ['nullable', 'string'],
        // ...
    ];
}
```

---

📍 **Service:**

```php
public function updateKhachThue($id, array $data)
{
    // ✅ Tìm KhachThue theo ID
    $khachThue = $this->khachThueRepo->findById($id);

    if (!$khachThue) {
        throw new \Exception(__('messages.error.not_found'), 404);
    }

    DB::transaction(function () use ($khachThue, $data) {
        // ✅ Cập nhật KhachThue
        $khachThue->update([
            'HoTen' => $data['HoTen'] ?? $khachThue->HoTen,
            'SDT1' => $data['SDT1'] ?? $khachThue->SDT1,
            'Email' => $data['Email'] ?? $khachThue->Email,
            'VaiTro' => $data['VaiTro'] ?? $khachThue->VaiTro,
            'BienSoXe' => $data['BienSoXe'] ?? $khachThue->BienSoXe,
            'GhiChu' => $data['GhiChu'] ?? $khachThue->GhiChu,
            // ... các fields khác
        ]);

        // ✅ Nếu có update password (optional)
        if (isset($data['password']) && $khachThue->taiKhoan) {
            $khachThue->taiKhoan->update([
                'MatKhau' => Hash::make($data['password']),
            ]);
        }
    });

    return $khachThue->fresh(['taiKhoan', 'phongTro.dayTro']);
}
```

**SQL Query:**
```sql
-- Query 1: Find KhachThue
SELECT * FROM KhachThue WHERE MaKhachThue = 1;

-- Transaction BEGIN

-- Query 2: UPDATE KhachThue
UPDATE KhachThue
SET
  HoTen = 'Nguyễn Văn A',
  SDT1 = '0901234567',
  Email = 'nguyenvana@gmail.com',      ← CHANGED
  VaiTro = 'THANH_VIEN',               ← CHANGED
  BienSoXe = '29A1-12345',
  GhiChu = 'Thành viên gia đình'       ← CHANGED
WHERE MaKhachThue = 1;

-- Transaction COMMIT

-- Query 3: Refresh + Eager load
SELECT * FROM KhachThue WHERE MaKhachThue = 1;
SELECT * FROM TaiKhoan WHERE MaTaiKhoan = ...;
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật thành công",
  "data": {
    "MaKhachThue": 1,
    "HoTen": "Nguyễn Văn A",
    "Email": "nguyenvana@gmail.com",
    "VaiTro": "THANH_VIEN",
    "GhiChu": "Thành viên gia đình",
    // ... updated data
  }
}
```

---

### **STEP 6: Frontend Refresh**

```tsx
// Sau khi update thành công:
toast.success({ title: 'Thành công' });
setShowEditModal(false);
setEditingTenant(null);
refreshData();  // ← Fetch lại data từ API
```

---

## 4. LUỒNG XÓA (DELETE)

### **STEP 1: User Click "Xóa"**

```tsx
<button onClick={() => confirmDelete(tenant)}>
  Xóa
</button>

// Handler
const confirmDelete = (tenant: KhachThue) => {
  // ✅ BƯỚC 1.1: Hiển thị confirm dialog
  setConfirmDialog({
    isOpen: true,
    type: 'danger',
    title: 'Xác nhận xóa',
    message: `Bạn có chắc muốn xóa khách thuê "${tenant.HoTen}"?`,
    onConfirm: () => handleDeleteTenant(tenant.MaKhachThue),
    loading: false,
  });
};
```

**Timeline:**
```
T1: User click "Xóa" trên "Lê Văn C"
    ↓
T2: confirmDelete() chạy
    ↓
T3: setConfirmDialog({ isOpen: true, ... })
    ↓
T4: Dialog hiển thị: "Bạn có chắc muốn xóa Lê Văn C?"
```

---

### **STEP 2: User Confirm**

```tsx
<ConfirmDialog
  isOpen={confirmDialog.isOpen}
  type={confirmDialog.type}  // 'danger'
  title={confirmDialog.title}
  message={confirmDialog.message}
  onConfirm={confirmDialog.onConfirm}  // ← handleDeleteTenant(3)
  onCancel={() => setConfirmDialog({ ...prev, isOpen: false })}
  loading={confirmDialog.loading}
/>
```

**User actions:**
```
T5: User click "Xác nhận"
    ↓
T6: onConfirm() được gọi
    ↓
T7: handleDeleteTenant(3) chạy
```

---

### **STEP 3: Handler Xử Lý Delete**

```tsx
const handleDeleteTenant = async (id: number) => {
  // ✅ BƯỚC 3.1: Bật loading cho dialog
  setConfirmDialog((prev) => ({ ...prev, loading: true }));

  try {
    // ✅ BƯỚC 3.2: Gọi API delete
    await khachThueService.delete(id);
    //                             ↓
    //                     MaKhachThue = 3

    // ✅ BƯỚC 3.3: Success
    toast.success({
      title: 'Thành công',
      message: 'Đã xóa khách thuê',
    });

    // ✅ BƯỚC 3.4: Đóng dialog
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

    // ✅ BƯỚC 3.5: Refresh data
    refreshData();

  } catch (error) {
    toast.error({
      title: 'Lỗi xóa khách thuê',
      message: getErrorMessage(error),
    });
  } finally {
    // ✅ BƯỚC 3.6: Tắt loading
    setConfirmDialog((prev) => ({ ...prev, loading: false }));
  }
};
```

---

### **STEP 4: Service Layer**

```tsx
class KhachThueService {
  async delete(id: number) {
    // ✅ DELETE request
    return httpClient.delete(`${API_ENDPOINTS.KHACH_THUE}/${id}`);
    //                        ↓
    //               '/admin/khach-thue/3'
  }
}
```

**Request:**
```
DELETE http://localhost:8000/api/admin/khach-thue/3
```

---

### **STEP 5: Backend Processing**

📍 **Routing:** `DELETE /api/admin/khach-thue/3` → `KhachThueController@destroy`

```php
public function destroy($id)
{
    // ✅ Gọi Service
    $this->service->deleteKhachThue($id);

    return $this->messageResponse(
        __('messages.success.deleted')
    );
}
```

---

📍 **Service:**

```php
public function deleteKhachThue($id)
{
    // ✅ Tìm KhachThue
    $khachThue = $this->khachThueRepo->findById($id);

    if (!$khachThue) {
        throw new \Exception(__('messages.error.not_found'), 404);
    }

    DB::transaction(function () use ($khachThue) {
        // ✅ Xóa TaiKhoan trước (nếu có)
        if ($khachThue->taiKhoan) {
            $khachThue->taiKhoan->delete();
        }

        // ✅ Xóa KhachThue
        $khachThue->delete();
    });

    return true;
}
```

**SQL Queries:**
```sql
-- Query 1: Find KhachThue
SELECT * FROM KhachThue WHERE MaKhachThue = 3;

-- Transaction BEGIN

-- Query 2: Delete TaiKhoan
DELETE FROM TaiKhoan WHERE MaTaiKhoan = 3;

-- Query 3: Delete KhachThue
DELETE FROM KhachThue WHERE MaKhachThue = 3;

-- Transaction COMMIT
```

**Response:**
```json
{
  "success": true,
  "message": "Xóa thành công"
}
```

---

### **STEP 6: Frontend Refresh**

```tsx
// Sau khi delete thành công:
toast.success({ message: 'Đã xóa khách thuê' });
setConfirmDialog({ ...prev, isOpen: false });
refreshData();
```

**Effect:**
```
T8:  refreshData() chạy
     ↓
T9:  useEffect trigger lại
     ↓
T10: Fetch lại data
     ↓
T11: Nhận 5 khách thuê (6 - 1 đã xóa)
     ↓
T12: React re-render
     ↓
T13: ✅ "Lê Văn C" không còn trong danh sách
```

---

## 5. LUỒNG FILTER & SEARCH

### **Filter theo VaiTro (Client-side)**

```tsx
// ✅ BƯỚC 1: User chọn filter
<select
  value={filterStatus}
  onChange={(e) => setFilterStatus(e.target.value)}
>
  <option value="all">Tất cả</option>
  <option value="KHACH_CHINH">Khách chính</option>
  <option value="THANH_VIEN">Thành viên</option>
  <option value="TIEM_NANG">Tiềm năng</option>
  <option value="DA_DON_DI">Đã dọn đi</option>
</select>
```

**Timeline:**
```
T1: User chọn "Khách chính"
    ↓
T2: setFilterStatus("KHACH_CHINH")
    ↓
T3: React re-render
    ↓
T4: filteredTenants được tính lại
```

---

### **Tính toán filteredTenants**

```tsx
// ✅ BƯỚC 2: Filter data
const filteredTenants = tenants.filter((tenant) => {
  // Check filter status
  const matchesStatus =
    filterStatus === 'all' || tenant.VaiTro === filterStatus;

  // Check search term
  const matchesSearch =
    tenant.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.SDT1.includes(searchTerm) ||
    (tenant.Email && tenant.Email.toLowerCase().includes(searchTerm.toLowerCase()));

  // Cả 2 điều kiện đều phải TRUE
  return matchesStatus && matchesSearch;
});
```

**Ví dụ:**
```javascript
// tenants = [6 objects]
// filterStatus = "KHACH_CHINH"
// searchTerm = ""

// Loop qua từng tenant:

// Tenant 1: Nguyễn Văn A (VaiTro = "KHACH_CHINH")
matchesStatus = "KHACH_CHINH" === "KHACH_CHINH" → TRUE
matchesSearch = TRUE (no search term)
→ KEEP

// Tenant 2: Trần Thị B (VaiTro = "KHACH_CHINH")
matchesStatus = TRUE
matchesSearch = TRUE
→ KEEP

// Tenant 3: Lê Văn C (VaiTro = "DA_DON_DI")
matchesStatus = "DA_DON_DI" === "KHACH_CHINH" → FALSE
→ REMOVE

// Tenant 4: Phạm Thị D (VaiTro = "DA_DON_DI")
matchesStatus = FALSE
→ REMOVE

// Tenant 5: Hoàng Văn E (VaiTro = "KHACH_CHINH")
matchesStatus = TRUE
matchesSearch = TRUE
→ KEEP

// Tenant 6: Nguyễn Văn F (VaiTro = "KHACH_CHINH")
matchesStatus = TRUE
matchesSearch = TRUE
→ KEEP

// filteredTenants = [Tenant 1, 2, 5, 6] → 4 tenants
```

---

### **Search**

```tsx
<input
  type="text"
  placeholder="Tìm kiếm theo tên, số điện thoại..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

**Timeline:**
```
T5: User gõ "Nguyễn"
    ↓
T6: onChange → setSearchTerm("Nguyễn")
    ↓
T7: React re-render
    ↓
T8: filteredTenants được tính lại
```

**Filter logic:**
```javascript
// searchTerm = "Nguyễn"
// filterStatus = "all"

// Tenant 1: "Nguyễn Văn A"
matchesSearch = "nguyễn văn a".includes("nguyễn") → TRUE
→ KEEP

// Tenant 2: "Trần Thị B"
matchesSearch = "trần thị b".includes("nguyễn") → FALSE
→ REMOVE

// Tenant 6: "Nguyễn Văn F"
matchesSearch = "nguyễn văn f".includes("nguyễn") → TRUE
→ KEEP

// filteredTenants = [Tenant 1, 6]
```

---

## 📝 TÓM TẮT FLOW HOÀN CHỈNH

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTION                          │
└─────────┬───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              REACT COMPONENT (UI)                       │
│  - Event handlers (onClick, onSubmit, onChange)         │
│  - State management (useState)                          │
│  - Side effects (useEffect)                             │
└─────────┬───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              SERVICE LAYER (TypeScript)                 │
│  - khachThueService.getAll()                            │
│  - khachThueService.create(data)                        │
│  - khachThueService.update(id, data)                    │
│  - khachThueService.delete(id)                          │
└─────────┬───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              HTTP CLIENT (Axios)                        │
│  - Request Interceptors (add auth token)                │
│  - Response Interceptors (handle errors)                │
│  - HTTP Methods: GET, POST, PUT, DELETE                 │
└─────────┬───────────────────────────────────────────────┘
          │
          │ HTTP Request
          ▼
┌─────────────────────────────────────────────────────────┐
│              LARAVEL BACKEND                            │
│                                                         │
│  Route → Controller → Service → Repository → Model     │
│                                           ↓             │
│                                      Database (MySQL)   │
│                                           ↓             │
│  Model ← Repository ← Service ← Resource ← Controller  │
└─────────┬───────────────────────────────────────────────┘
          │
          │ HTTP Response (JSON)
          ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND RECEIVES DATA                     │
│  - Update state (setState)                              │
│  - React re-renders                                     │
│  - UI updates with new data                             │
└─────────────────────────────────────────────────────────┘
```

---

**Last Updated:** 2025-11-08
**Author:** Development Team
**Purpose:** Chi tiết luồng code để debug và hiểu rõ hệ thống
