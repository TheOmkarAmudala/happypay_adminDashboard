import React from "react";
import { Card, Typography, Button } from "antd";
import {
    ClockCircleOutlined,
    FileDoneOutlined,
    SafetyOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const BillPaymentsComingSoon = () => {
    return (
        <div
            style={{
                padding: 16,
                minHeight: "calc(100vh - 64px)", // below header
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f8fafc"
            }}
        >
            <Card
                style={{
                    width: "100%",
                    maxWidth: 520,
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
                }}
            >
                {/* ICON */}
                <div
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        background: "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#2563eb",
                        marginBottom: 16
                    }}
                >
                    <ClockCircleOutlined style={{ fontSize: 22 }} />
                </div>

                {/* TITLE */}
                <Title level={4} style={{ marginBottom: 6 }}>
                    Amex and Dinner Cards
                </Title>

                {/* SUBTITLE */}
                <Text type="secondary">
                    This feature is currently under preparation.
                </Text>

                {/* FEATURES */}
                <div
                    style={{
                        marginTop: 20,
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: 12
                    }}
                >
                    <Feature
                        icon={<FileDoneOutlined />}
                        text="Electricity, Water & Gas Bills"
                    />
                    <Feature
                        icon={<SafetyOutlined />}
                        text="Secure & Verified Billers"
                    />
                    <Feature
                        icon={<ClockCircleOutlined />}
                        text="Fast Payment Confirmation"
                    />
                </div>

                {/* CTA */}
                <Button
                    block
                    disabled
                    style={{
                        marginTop: 24,
                        height: 44,
                        borderRadius: 10,
                        fontWeight: 600
                    }}
                >
                    Coming Soon
                </Button>

                {/* FOOTER */}
                <div
                    style={{
                        marginTop: 16,
                        fontSize: 12,
                        color: "#94a3b8"
                    }}
                >
                    You will be notified once this feature is available.
                </div>
            </Card>
        </div>
    );
};

/* Small reusable row */
const Feature = ({ icon, text }) => (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
            color: "#475569"
        }}
    >
        <span style={{ color: "#2563eb" }}>{icon}</span>
        <span>{text}</span>
    </div>
);

export default BillPaymentsComingSoon;