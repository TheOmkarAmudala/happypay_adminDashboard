import React, { useState } from "react";
import { Card, Input, Button, Typography, message, Alert } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import { StopOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminBanUser = () => {
    const token = useSelector((state) => state.auth.token);
    const userLevel = useSelector(
        (state) => state.profile?.data?.userLevel
    );

    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    /* ---------- ACCESS CONTROL ---------- */
    if (userLevel !== 7) {
        return (
            <div className="flex justify-center items-center mt-20">
                <Alert
                    type="error"
                    showIcon
                    message="Access Denied"
                    description="You are not authorized to access this page."
                />
            </div>
        );
    }

    /* ---------- ACTION ---------- */
    const banUser = async () => {
        if (phoneNumber.length !== 10) {
            message.warning("Enter a valid 10-digit phone number");
            return;
        }

        try {
            setLoading(true);
            setSuccessMsg("");

            const res = await axios.get(
                `https://test.happypay.live/users/ban`,
                {
                    params: { phoneNumber },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data?.status === "success") {
                setSuccessMsg("User has been banned successfully.");
                setPhoneNumber("");
            } else {
                message.error(res.data?.message || "Failed to ban user");
            }
        } catch (err) {
            message.error(
                err.response?.data?.message || "Failed to ban user"
            );
        } finally {
            setLoading(false);
        }
    };

    /* ---------- UI ---------- */
    return (
        <div className="flex justify-center mt-10 px-4">
            <Card
                style={{ maxWidth: 480, width: "100%" }}
                bordered
                className="shadow-md"
            >
                <div className="flex items-center gap-3 mb-4">
                    <SafetyCertificateOutlined
                        style={{ fontSize: 26, color: "#cf1322" }}
                    />
                    <Title level={4} style={{ margin: 0 }}>
                        Admin · Ban User
                    </Title>
                </div>

                <Text type="secondary">
                    Enter the user’s registered mobile number to permanently
                    ban access.
                </Text>

                <Input
                    placeholder="Enter phone number"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) =>
                        setPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
                    style={{ marginTop: 16 }}
                />

                <Button
                    type="primary"
                    danger
                    block
                    icon={<StopOutlined />}
                    loading={loading}
                    disabled={phoneNumber.length !== 10}
                    style={{ marginTop: 16 }}
                    onClick={banUser}
                >
                    Ban User
                </Button>

                {successMsg && (
                    <Alert
                        type="success"
                        showIcon
                        message={successMsg}
                        style={{ marginTop: 16 }}
                    />
                )}

                <Text
                    type="secondary"
                    style={{
                        display: "block",
                        marginTop: 16,
                        fontSize: 12,
                    }}
                >
                    ⚠ This action is irreversible. Use with caution.
                </Text>
            </Card>
        </div>
    );
};

export default AdminBanUser;
