import React, { useEffect, useState } from "react";
import {
    Modal,
    Row,
    Col,
    Tag,
    Divider,
    Typography,
    Card,
    Avatar,
    Space
} from "antd";
import { useSelector } from "react-redux";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ProfileSkeleton from "./ProfileSkeleton";
import {
    UserOutlined,
    SafetyOutlined
} from "@ant-design/icons";

dayjs.extend(customParseFormat);

const { Text, Title } = Typography;

const ProfileModal = ({ open, onClose }) => {
    const token = useSelector((state) => state.auth.token);
    const profile = useSelector((state) => state.profile.data);

    const [loading, setLoading] = useState(false);
    const [kycData, setKycData] = useState([]);

    useEffect(() => {
        if (!open) return;

        const fetchKyc = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    "https://test.happypay.live/users/kyc",
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                setKycData(res.data?.data || []);
            } catch (err) {
                console.error("KYC FETCH ERROR:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchKyc();
    }, [open, token]);

    const aadhaar = kycData.find((k) => k.type === "aadhaar");
    const pan = kycData.find((k) => k.type === "pan");

    const joinedDate = profile?.createdAt
        ? dayjs(profile.createdAt).format("DD MMM YYYY")
        : "-";

    const aadhaarDob = aadhaar?.response?.dob;

    const profileDobValid =
        profile?.dob &&
        dayjs(profile.dob).isValid() &&
        profile.dob !== "0001-01-01T00:00:00Z";

    const dob = profileDobValid
        ? dayjs(profile.dob).format("DD MMM YYYY")
        : aadhaarDob && dayjs(aadhaarDob, "DD-MM-YYYY", true).isValid()
            ? dayjs(aadhaarDob, "DD-MM-YYYY").format("DD MMM YYYY")
            : "Not Provided";

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            title={null}
            width={500}
            bodyStyle={{ padding: 20 }}
        >
            {!profile || loading ? (
                <ProfileSkeleton />
            ) : (
                <>
                    {/* ================= BOX 1: HEADER ================= */}
                    <Card
                        bordered={false}
                        style={{
                            background: "#1890ff",
                            borderRadius: 12,
                            marginBottom: 12
                        }}
                        bodyStyle={{ padding: "12px 16px" }}
                    >
                        <Row align="middle">
                            <Col span={12}>
                                <Space size={10}>
                                    <Avatar
                                        size={42}
                                        icon={<UserOutlined />}
                                        style={{
                                            background: "#fff",
                                            color: "#1890ff"
                                        }}
                                    />
                                    <Title
                                        level={5}
                                        style={{
                                            color: "#fff",
                                            margin: 0,
                                            fontWeight: 600
                                        }}
                                    >
                                        {profile.username}
                                    </Title>
                                </Space>
                            </Col>

                            <Col span={12} style={{ textAlign: "right" }}>
                                <Text
                                    style={{
                                        color: "rgba(255,255,255,0.9)",
                                        fontSize: 14,
                                        fontWeight: 500
                                    }}
                                >
                                    {profile.phoneNumber}
                                </Text>
                            </Col>
                        </Row>
                    </Card>

                    {/* ================= BOX 2: MAIN INFO ================= */}
                    <Card
                        bordered={false}
                        style={{ borderRadius: 12, marginBottom: 12, marginRight:22 }}
                        bodyStyle={{ padding: "14px 16px" }}
                    >
                        <Row gutter={[24, 12]}>
                            {/* LEFT: REFERRAL */}
                            <Col span={12}>
                                <Title level={5} style={{ marginBottom: 10 }}>
                                    Referral
                                </Title>

                                <Space direction="vertical" size={8}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            Referral Code
                                        </Text>
                                        <br />
                                        <Tag
                                            color="processing"
                                            style={{ fontWeight: 500 }}
                                        >
                                            {profile.referralCode}
                                        </Tag>
                                    </div>

                                    <div>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            Referral Link
                                        </Text>
                                        <br />
                                        <Text copyable>
                                            {profile.referralLink}
                                        </Text>
                                    </div>
                                </Space>
                            </Col>

                            {/* RIGHT: LEVEL + META */}
                            <Col span={10}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 10,
                                        alignItems: "flex-end" // 🔥 important
                                    }}
                                >
                                    {/* USER LEVEL */}
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            User Level
                                        </Text>
                                        <br />
                                        <Tag
                                            style={{
                                                background: "#E6F4FF",
                                                color: "#1677FF",
                                                border: "1px solid #91C3FD",
                                                fontSize: 12,
                                                fontWeight: 600,
                                                padding: "4px 10px",
                                                borderRadius: 6
                                            }}
                                        >
                                            LEVEL {profile.userLevel}
                                        </Tag>
                                    </div>

                                    {/* DOB */}
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            Date of Birth
                                        </Text>
                                        <br />
                                        <Text style={{ fontWeight: 500 }}>
                                            {dob}
                                        </Text>
                                    </div>

                                    {/* JOINED */}
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            Joined On
                                        </Text>
                                        <br />
                                        <Text style={{ fontWeight: 500 }}>
                                            {joinedDate}
                                        </Text>
                                    </div>
                                </div>
                            </Col>

                        </Row>
                    </Card>

                    {/* ================= BOX 3: VERIFICATION ================= */}
                    <Card
                        bordered={false}
                        style={{ borderRadius: 12 }}
                        bodyStyle={{ padding: "12px 16px" }}
                    >
                        <Title level={5} style={{ marginBottom: 8 }}>
                            Verification Status
                        </Title>

                        <Space size={10}>
                            <Tag
                                icon={<SafetyOutlined />}
                                color={aadhaar?.verified ? "green" : "red"}
                                style={{
                                    padding: "4px 10px",
                                    borderRadius: 6,
                                    fontWeight: 500
                                }}
                            >
                                Aadhaar {aadhaar?.verified ? "Verified" : "Not Verified"}
                            </Tag>

                            <Tag
                                icon={<SafetyOutlined />}
                                color={pan?.verified ? "green" : "red"}
                                style={{
                                    padding: "4px 10px",
                                    borderRadius: 6,
                                    fontWeight: 500
                                }}
                            >
                                PAN {pan?.verified ? "Verified" : "Not Verified"}
                            </Tag>
                        </Space>
                    </Card>
                </>
            )}
        </Modal>
    );
};

export default ProfileModal;
