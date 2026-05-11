import React from 'react';
import { Button, Col, Divider, Form, Input, notification, Row, Steps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { sendResetPasswordEmailApi, resetPasswordApi } from '../util/api';
import { useState } from 'react';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [form] = Form.useForm();

    const handleSendEmail = async (values) => {
        const { email: inputEmail } = values;
        const res = await sendResetPasswordEmailApi(inputEmail);

        if (res && res.EC === 0) {
            notification.success({
                message: "SEND EMAIL",
                description: "Email reset password đã được gửi, kiểm tra email của bạn"
            });
            setEmail(inputEmail);
            setStep(1);
            form.resetFields();
        } else {
            notification.error({
                message: "SEND EMAIL",
                description: res?.EM ?? "Email không tồn tại"
            });
        }
    };

    const handleResetPassword = async (values) => {
        const { resetToken, newPassword } = values;
        const res = await resetPasswordApi(email, resetToken, newPassword);

        if (res && res.EC === 0) {
            notification.success({
                message: "RESET PASSWORD",
                description: "Mật khẩu đã được đổi thành công"
            });
            navigate("/login");
        } else {
            notification.error({
                message: "RESET PASSWORD",
                description: res?.EM ?? "Token không hợp lệ hoặc hết hạn"
            });
        }
    };

    return (
        <Row justify={"center"} style={{ marginTop: "30px" }}>
            <Col xs={24} md={16} lg={8}>
                <fieldset style={{
                    padding: "15px",
                    margin: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "5px"
                }}>
                    <legend>Quên Mật Khẩu</legend>

                    <Steps
                        current={step}
                        items={[
                            {
                                title: 'Nhập Email',
                                description: 'Nhập email đã đăng ký',
                            },
                            {
                                title: 'Đổi Mật Khẩu',
                                description: 'Nhập mã reset password',
                            },
                        ]}
                        style={{ marginBottom: "20px" }}
                    />

                    {step === 0 ? (
                        <Form
                            name="send_email"
                            onFinish={handleSendEmail}
                            autoComplete="off"
                            layout='vertical'
                        >
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input placeholder="Nhập email đã đăng ký" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                                    Gửi Email Reset Password
                                </Button>
                            </Form.Item>
                        </Form>
                    ) : (
                        <Form
                            form={form}
                            name="reset_password"
                            onFinish={handleResetPassword}
                            autoComplete="off"
                            layout='vertical'
                        >
                            <Form.Item
                                label="Mã Reset Password"
                                name="resetToken"
                                rules={[{ required: true, message: 'Vui lòng nhập mã reset password!' }]}
                            >
                                <Input placeholder="Nhập mã được gửi đến email" />
                            </Form.Item>

                            <Form.Item
                                label="Mật Khẩu Mới"
                                name="newPassword"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                            >
                                <Input.Password placeholder="Nhập mật khẩu mới" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                                    Đổi Mật Khẩu
                                </Button>
                            </Form.Item>
                        </Form>
                    )}

                    <Link to="/login" style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                        <ArrowLeftOutlined style={{ marginRight: "5px" }} />
                        Quay lại trang đăng nhập
                    </Link>
                </fieldset>
            </Col>
        </Row>
    )
}

export default ForgotPasswordPage;
