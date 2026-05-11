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

const sendResetPasswordEmailService = async (email) => {
    try {
        // 1. Kiểm tra xem user có tồn tại không
        const user = await User.findOne({ email });
        if (!user) {
            return {
                EC: 1,
                EM: "Email không tồn tại"
            };
        }

        // 2. Tạo reset token (dùng JWT)
        const resetToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // 3. Lưu reset token vào database (thời hạn 15 phút)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
        await user.save();

        // 4. Trong thực tế sẽ gửi email, nhưng ở đây ta chỉ hiển thị token
        // console.log(`Reset token: ${resetToken}`);

        return {
            EC: 0,
            EM: "Email reset password đã được gửi",
            resetToken: resetToken // Dành cho test (thực tế sẽ xóa)
        };

    } catch (error) {
        console.log(">>> Error tại sendResetPasswordEmailService: ", error);
        return {
            EC: -1,
            EM: "Lỗi hệ thống"
        };
    }
}

const resetPasswordService = async (email, resetToken, newPassword) => {
    try {
        // 1. Kiểm tra user có tồn tại không
        const user = await User.findOne({ email });
        if (!user) {
            return {
                EC: 1,
                EM: "Email không tồn tại"
            };
        }

        // 2. Kiểm tra token hợp lệ không
        if (!user.resetPasswordToken || user.resetPasswordToken !== resetToken) {
            return {
                EC: 2,
                EM: "Token không hợp lệ"
            };
        }

        // 3. Kiểm tra token hết hạn chưa
        if (user.resetPasswordExpires < Date.now()) {
            return {
                EC: 3,
                EM: "Token đã hết hạn"
            };
        }

        // 4. Hash mật khẩu mới
        const newHashPassword = await bcrypt.hash(newPassword, saltRounds);

        // 5. Cập nhật mật khẩu
        user.password = newHashPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return {
            EC: 0,
            EM: "Mật khẩu đã được đổi thành công"
        };

    } catch (error) {
        console.log(">>> Error tại resetPasswordService: ", error);
        return {
            EC: -1,
            EM: "Lỗi hệ thống"
        };
    }
}

module.exports = {
    createUserService,
    loginService,
    getUserService,
    sendResetPasswordEmailService,
    resetPasswordService
};