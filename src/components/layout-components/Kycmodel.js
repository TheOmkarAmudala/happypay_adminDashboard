import React, { useEffect, useState } from "react";
import { Modal, Row, Col, Tag, Spin, Divider } from "antd";
import axios from "axios";

const KycModal = ({ open, onClose }) => {
    const token = localStorage.getItem("AUTH_TOKEN");

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
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
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
    }, [open]);

    const aadhaar = kycData.find(k => k.type === "aadhaar");
    const pan = kycData.find(k => k.type === "pan");

    return (
        <Modal
            title="Profile"
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            {loading ? (
                <Spin />
            ) : (
                <>
                    {/* USER BASIC INFO */}
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <h3 style={{ marginBottom: 0 }}>
                                {aadhaar?.response?.name ||
                                    pan?.response?.registered_name ||
                                    "User"}
                            </h3>
                        </Col>

                        <Col span={12}>
                            <strong>Gender:</strong>{" "}
                            {aadhaar?.response?.gender === "M"
                                ? "Male"
                                : aadhaar?.response?.gender === "F"
                                    ? "Female"
                                    : "-"}
                        </Col>

                        <Col span={12}>
                            <strong>Year of Birth:</strong>{" "}
                            {aadhaar?.response?.year_of_birth || "-"}
                        </Col>

                        <Col span={24}>
                            <strong>Location:</strong>{" "}
                            {aadhaar?.response?.split_address?.dist},{" "}
                            {aadhaar?.response?.split_address?.state}
                        </Col>
                    </Row>

                    <Divider />

                    {/* VERIFICATION STATUS */}
                    <Row gutter={16}>
                        <Col>
                            {aadhaar?.verified ? (
                                <Tag color="green">Aadhaar Verified</Tag>
                            ) : (
                                <Tag color="red">Aadhaar Not Verified</Tag>
                            )}
                        </Col>

                        <Col>
                            {pan?.verified ? (
                                <Tag color="green">PAN Verified</Tag>
                            ) : (
                                <Tag color="red">PAN Not Verified</Tag>
                            )}
                        </Col>
                    </Row>
                </>
            )}
        </Modal>
    );
};

export default KycModal;
