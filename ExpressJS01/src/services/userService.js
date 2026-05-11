require("dotenv").config();
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const createUserService = async (name, email, password) => {
    try {
        // 1. Kiểm tra xem user đã tồn tại chưa
        const user = await User.findOne({ email });
        if (user) {
            console.log(`>>> User đã tồn tại, vui lòng chọn email khác: ${email}`);
            return null;
        }

        // 2. Hash mật khẩu của người dùng
        const hashPassword = await bcrypt.hash(password, saltRounds);

        // 3. Lưu người dùng vào database
        let result = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: "USER" // Mặc định gán role là USER
        })
        return result;

    } catch (error) {
        console.log(">>> Error tại createUserService: ", error);
        return null;
    }
}

const loginService = async (email, password) => {
    try {
        // 1. Tìm người dùng theo email
        const user = await User.findOne({ email: email });

        if (user) {
            // 2. So sánh mật khẩu (mật khẩu nhập vào vs mật khẩu đã hash trong DB)
            const isMatchPassword = await bcrypt.compare(password, user.password);

            if (!isMatchPassword) {
                return {
                    EC: 2,
                    EM: "Email hoặc Mật khẩu không chính xác"
                };
            } else {
                // 3. Tạo Access Token (JWT)
                // Kiểm tra xem chìa khóa đã nạp chưa, nếu chưa thì báo lỗi rõ ràng
                if (!process.env.JWT_SECRET) {
                    console.log(">>> LỖI: Chưa nạp được JWT_SECRET từ file .env");
                    return { EC: -1, EM: "Lỗi cấu hình hệ thống (thiếu Secret Key)" };
                }
                const payload = {
                    email: user.email,
                    name: user.name
                };

                const access_token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_EXPIRE
                    }
                );

                return {
                    EC: 0,
                    access_token,
                    user: {
                        email: user.email,
                        name: user.name
                    }
                };
            }
        } else {
            return {
                EC: 1,
                EM: "Email hoặc Mật khẩu không chính xác"
            };
        }

    } catch (error) {
        console.log(">>> Lỗi chi tiết tại loginService: ", error.message); 
    return {
        EC: -1,
        EM: "Lỗi hệ thống: " + error.message
    };
    }
}


const getUserService = async () => {
    try {
        let result = await User.find({}).select("-password"); // Lấy tất cả user nhưng ẩn mật khẩu
        return result;
    } catch (error) {
        console.log(">>> Error tại getUserService: ", error);
        return null;
    }
}

module.exports = {
    createUserService,
    loginService,
    getUserService
};