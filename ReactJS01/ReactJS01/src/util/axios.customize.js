import axios from "axios";

// Thiết lập cấu hình mặc định khi tạo instance
const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
});

// Thêm một bộ chặn request (interceptor)
instance.interceptors.request.use(function (config) {
    // Làm gì đó trước khi request được gửi đi
    config.headers.Authorization = `Bearer ${localStorage.getItem("access_token")}`;
    return config;
}, function (error) {
    // Làm gì đó với lỗi request
    return Promise.reject(error);
});

// Thêm một bộ chặn response (interceptor)
instance.interceptors.response.use(function (response) {
    // Bất kỳ mã trạng thái nào nằm trong dải 2xx đều khiến hàm này kích hoạt
    if (response && response.data) return response.data;
    return response;
}, function (error) {
    // Bất kỳ mã trạng thái nào nằm ngoài dải 2xx đều khiến hàm này kích hoạt
    if (error?.response?.data) return error?.response?.data;
    return Promise.reject(error);
});

export default instance;