import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Button, Space } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import { CheckCircleFilled } from "@ant-design/icons";

import { MODE_CONFIG } from "./config/modeConfig";
import { SERVICE_CHARGE_CONFIG_CONSUMER } from "./config/ServiceChargeConfig";
import { PAYMENT_MODE_TXN_CONFIG } from "./config/paymentModeTxnConfig";
import PaymentModeCardSkeleton from "./skeleton/PaymentModeCardSkeleton";

const { Text, Title } = Typography;

const SlpePaymentModesCards = ({ onSelect, selectedMode }) => {
    const [modes, setModes] = useState([]);
    const [category, setCategory] = useState("edu");
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState(null);

    const userLevel = useSelector(
        (state) => state.profile?.data?.userLevel
    );

    /* ---------- helpers ---------- */
    const normalize = (s = "") =>
        s
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace("tarvel", "travel"); // backend typo fix

    const getCategoryFromName = (name = "") => {
        const lower = name.toLowerCase();
        if (lower.includes("edu")) return "edu";
        if (lower.includes("travel")) return "travel";
        if (lower.includes("tarvel")) return "travel";
        if (lower.includes("ocean")) return "travel";
        return "other";
    };

    const getServiceCharge = (modeName) => {
        if (!userLevel) return null;

        const entry = Object.entries(SERVICE_CHARGE_CONFIG_CONSUMER).find(
            ([key]) => normalize(key) === normalize(modeName)
        )?.[1];

        return entry?.[userLevel] ?? null;
    };

    const getModeMeta = (modeName) => {
        return Object.entries(PAYMENT_MODE_TXN_CONFIG).find(
            ([key]) => normalize(key) === normalize(modeName)
        )?.[1] ?? null;
    };

    /* ---------- data ---------- */
    useEffect(() => {
        setLoading(true);
        axios
            .get("https://test.happypay.live/getSLPEPaymentModes")
            .then((res) => {
                const livePayinModes = (res.data.data || []).filter(
                    (m) => m.live_payin === true
                );
                setModes(livePayinModes);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredModes = modes.filter(
        (mode) => getCategoryFromName(mode.name) === category
    );

    return (
        <>
            <Title level={3} style={{ marginBottom: 16 }}>
                Business Cards
            </Title>

            {/* CATEGORY TOGGLE */}
            <Space style={{ marginBottom: 16 }}>
                <Button
                    type={category === "edu" ? "primary" : "default"}
                    onClick={() => setCategory("edu")}
                >
                    Education
                </Button>
                <Button
                    type={category === "travel" ? "primary" : "default"}
                    onClick={() => setCategory("travel")}
                >
                    Travel
                </Button>
            </Space>

            <Row gutter={[16, 16]}>
                {(loading ? Array.from({ length: 8 }) : filteredModes).map(
                    (mode, i) => {
                        if (loading) {
                            return (
                                <Col
                                    xs={24}
                                    sm={12}
                                    md={12}
                                    lg={8}
                                    xl={6}
                                    key={i}
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                <PaymentModeCardSkeleton />
                                </Col>
                            );
                        }

                        const config = Object.entries(MODE_CONFIG).find(
                            ([key]) => normalize(key) === normalize(mode.name)
                        )?.[1];

                        if (!config) return null;

                        const isSelected = selectedMode?.id === mode.id;
                        const serviceCharge = getServiceCharge(mode.name);

                        const meta = getModeMeta(mode.name);
                        const txnLimit = meta?.txnLimit?.max ?? null;
                        const gatewayId = meta?.id ?? null;

                        return (
                            <Col
                                xs={24}
                                sm={12}
                                md={8}
                                lg={6}
                                key={mode.id}
                                style={{ overflow: "visible" }}
                            >
                                <Card
                                    hoverable
                                    onClick={() => onSelect(mode)}
                                    onMouseEnter={() => setHoveredId(mode.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    style={{
                                        width: 280,
                                        borderRadius: 16,
                                        height: 150,
                                        cursor: "pointer",
                                        position: "relative",

                                        border: isSelected
                                            ? "2px solid #52c41a"
                                            : hoveredId === mode.id
                                                ? "1px solid #91caff"
                                                : "1px solid #f0f0f0",

                                        background: isSelected
                                            ? "#f6ffed"
                                            : hoveredId === mode.id
                                                ? "#fafcff"
                                                : "#fff",

                                        boxShadow: isSelected
                                            ? "0 8px 24px rgba(82,196,26,0.15)"
                                            : hoveredId === mode.id
                                                ? "0 6px 18px rgba(0,0,0,0.10)"
                                                : "0 4px 12px rgba(0,0,0,0.06)",

                                        transition: "all 0.18s ease",
                                    }}
                                    bodyStyle={{
                                        padding: 16,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        height: "100%",
                                    }}
                                >
                                    {/* MDR BADGE */}
                                    {serviceCharge && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 8,
                                                right: 8,
                                                padding: "4px 8px",
                                                borderRadius: 6,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                color: "#389e0d",
                                                border: "1px solid #b7eb8f",
                                                background: "#f6ffed",
                                            }}
                                        >
                                            {serviceCharge}% MDR
                                        </div>
                                    )}

                                    {/* SELECTED ICON */}
                                    {isSelected && (
                                        <CheckCircleFilled
                                            style={{
                                                position: "absolute",
                                                top: 32,
                                                right: 10,
                                                fontSize: 20,
                                                color: "#52c41a",
                                            }}
                                        />
                                    )}

                                    {/* TOP */}
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <img
                                            src={config.icon}
                                            alt={mode.name}
                                            style={{ height: 28 }}
                                        />
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: "#555",
                                            }}
                                        >
                                        </div>
                                    </div>

                                    {/* NAME */}
                                    <Text strong style={{ fontSize: 14 }}>
                                        {mode.name.replace("Slpe ", "")}
                                    </Text>

                                    {/* CATEGORY + ID */}
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <div
                                            style={{
                                                padding: "2px 10px",
                                                borderRadius: 12,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                background:
                                                    category === "edu" ? "#e6f4ff" : "#f6ffed",
                                                color:
                                                    category === "edu" ? "#1677ff" : "#389e0d",
                                            }}
                                        >
                                            {category.toUpperCase()}
                                        </div>

                                        {gatewayId && (
                                            <div
                                                style={{
                                                    padding: "2px 8px",
                                                    borderRadius: 10,
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    background: "#eef2ff",
                                                    color: "#4F46E5",
                                                    border: "1px solid #c7d2fe",
                                                }}
                                            >
                                                PG {gatewayId}
                                            </div>
                                        )}
                                    </div>

                                    {/* TXN LIMIT */}
                                    {txnLimit && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                bottom: 24,
                                                right: 10,
                                                padding: "4px 8px",
                                                borderRadius: 6,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                color: "#1e40af",
                                                border: "1px solid #bfdbfe",
                                                background: "#eff6ff",
                                            }}
                                        >
                                            Txn ₹{txnLimit.toLocaleString("en-IN")}
                                        </div>
                                    )}
                                </Card>
                            </Col>
                        );
                    }
                )}
            </Row>
        </>
    );
};

export default SlpePaymentModesCards;
