import React, { useState } from "react";
import { Row, Col, Input, Button, message } from "antd";
import { useSelector } from "react-redux";
import axios from "axios";

const backgroundURL = "/img/others/img-17.jpg";
const backgroundStyle = {
    backgroundImage: `url(${backgroundURL})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
};

const LoginOtp = () => {
    const theme = useSelector(state => state.theme.currentTheme);

    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    /* ================= SEND OTP ================= */
    const sendOtp = async () => {
        if (phone.length !== 10) {
            message.error("Enter valid 10-digit phone number");
            return;
        }

        try {
            setLoading(true);

            const res = await axios.get(
                `https://test.happypay.live/users/getotp?phoneNumber=${phone}`
            );

            if (res.data?.status === "success") {
                setOtpSent(true);
                message.success("OTP sent successfully");
            } else {
                message.error(res.data?.message || "Failed to send OTP");
            }
        } catch (err) {
            message.error("Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    /* ================= VERIFY OTP ================= */
    const verifyOtp = async () => {
        if (otp.length !== 6) {
            message.error("Enter valid 6-digit OTP");
            return;
        }

        try {
            setLoading(true);

            const res = await axios.post(
                "https://test.happypay.live/users/verifyotp",
                {
                    phoneNumber: phone,
                    otp
                }
            );

            if (res.data?.status === "success") {
                message.success("Login successful");

                // ✅ store token
                localStorage.setItem("AUTH_TOKEN", res.data.token);

                // 👉 redirect
                window.location.href = "/app/dashboard";
            } else {
                message.error(res.data?.message || "Invalid OTP");
            }
        } catch (err) {
            message.error("OTP verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`h-100 ${theme === "light" ? "bg-white" : ""}`}>
            <Row justify="center" className="align-items-stretch h-100">

                {/* LEFT SIDE */}
                <Col xs={20} sm={20} md={24} lg={16}>
                    <div className="container d-flex flex-column justify-content-center h-100">
                        <Row justify="center">
                            <Col xs={24} sm={24} md={20} lg={12} xl={8}>

                                <h1>Sign In</h1>
                                <p>Login using your mobile number</p>

                                {/* PHONE INPUT */}
                                {!otpSent && (
                                    <>
                                        <Input
                                            placeholder="Enter mobile number"
                                            maxLength={10}
                                            size="large"
                                            value={phone}
                                            onChange={e =>
                                                setPhone(e.target.value.replace(/\D/g, ""))
                                            }
                                        />

                                        <Button
                                            type="primary"
                                            block
                                            size="large"
                                            className="mt-3"
                                            loading={loading}
                                            onClick={sendOtp}
                                        >
                                            Send OTP
                                        </Button>
                                    </>
                                )}

                                {/* OTP INPUT */}
                                {otpSent && (
                                    <>
                                        <Input
                                            placeholder="Enter OTP"
                                            maxLength={6}
                                            size="large"
                                            className="mt-3"
                                            value={otp}
                                            onChange={e =>
                                                setOtp(e.target.value.replace(/\D/g, ""))
                                            }
                                        />

                                        <Button
                                            type="primary"
                                            block
                                            size="large"
                                            className="mt-3"
                                            loading={loading}
                                            onClick={verifyOtp}
                                        >
                                            Verify & Login
                                        </Button>

                                        <Button
                                            type="link"
                                            block
                                            onClick={() => {
                                                setOtpSent(false);
                                                setOtp("");
                                            }}
                                        >
                                            Change number
                                        </Button>
                                    </>
                                )}

                            </Col>
                        </Row>
                    </div>
                </Col>

                {/* RIGHT IMAGE PANEL */}
                <Col xs={0} sm={0} md={0} lg={8}>
                    <div
                        className="d-flex flex-column justify-content-between h-100 px-4"
                        style={backgroundStyle}
                    >
                        <div className="text-right">
                            <img src="/img/logo-white.png" alt="logo" />
                        </div>

                        <Row justify="center">
                            <Col lg={20}>
                                <img
                                    className="img-fluid mb-5"
                                    src="/img/others/img-18.png"
                                    alt=""
                                />
                                <h1 className="text-white">Welcome to Emilus</h1>
                                <p className="text-white">
                                    Secure login with OTP verification for faster access.
                                </p>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end pb-4">
                            <div>
                                <a className="text-white" href="/#" onClick={e => e.preventDefault()}>
                                    Terms & Conditions
                                </a>
                                <span className="mx-2 text-white"> | </span>
                                <a className="text-white" href="/#" onClick={e => e.preventDefault()}>
                                    Privacy Policy
                                </a>
                            </div>
                        </div>
                    </div>
                </Col>

            </Row>
        </div>
    );
};

export default LoginOtp;
