import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Button, Space } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import { CheckCircleFilled } from "@ant-design/icons";

import { MODE_CONFIG } from "./config/modeConfig";
import { SERVICE_CHARGE_CONFIG } from "./config/ServiceChargeConfig";
import { DOMESTIC_CARD_TXN_LIMIT_CONFIG } from "./config/DomesticCardTxnLimitConfig";
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
        s.trim().toLowerCase().replace(/\s+/g, "").replace("tarvel", "travel");

    const getCategoryFromName = (name = "") => {
        const lower = name.toLowerCase();
        if (lower.includes("edu")) return "edu";
        if (lower.includes("travel") || lower.includes("tarvel") || lower.includes("ocean"))
            return "travel";
        if (lower.includes("insur") || lower.includes("insure") || lower.includes("insure")) return "insurance";
        return "other";
    };

    const getMdr = (modeName) => {
        if (!userLevel) return null;

        const entry = Object.entries(SERVICE_CHARGE_CONFIG).find(
            ([key]) => normalize(key) === normalize(modeName)
        )?.[1];

        return entry?.[userLevel] ?? null;
    };

    const getTxnLimit = (modeName) => {
        if (!userLevel) return null;

        const entry = Object.entries(DOMESTIC_CARD_TXN_LIMIT_CONFIG).find(
            ([key]) => normalize(key) === normalize(modeName)
        )?.[1];

        return entry?.[userLevel] ?? null;
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
                Domestic Cards
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
                <Button
                    type={category === "insurance" ? "primary" : "default"}
                    onClick={() => setCategory("insurance")}
                >
                    Insurance
                </Button>
            </Space>

            <Row gutter={[16, 16]}>
                {(loading ? Array.from({ length: 8 }) : filteredModes).map(
                    (mode, i) => {
                        if (loading) {
                            return (
                                <Col xs={24} sm={12} md={8} lg={6} key={i}>
                                    <PaymentModeCardSkeleton />
                                </Col>
                            );
                        }

                        const config = Object.entries(MODE_CONFIG).find(
                            ([key]) => normalize(key) === normalize(mode.name)
                        )?.[1] || { icon: "https://via.placeholder.com/48" };

                        if (!config) return null;

                        const isSelected = selectedMode?.id === mode.id;
                        const mdr = getMdr(mode.name);
                        const txnLimit = getTxnLimit(mode.name);

                        return (
                            <Col
                                xs={24}
                                sm={12}
                                md={12}
                                lg={8}
                                xl={6}
                                key={mode.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                            <Card
                                    hoverable
                                    onClick={() => onSelect(mode)}
                                    onMouseEnter={() => setHoveredId(mode.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    style={{
                                        width: 280,
                                        borderRadius: 16,
                                        height: 160,
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
                                            ? "0 8px 24px rgba(82,196,26,0.25)"
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
                                    {/* MDR + TXN LIMIT */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 72,
                                            alignItems: "flex-end",
                                        }}
                                    >
                                        {mdr && (
                                            <div
                                                style={{
                                                    padding: "3px 8px",
                                                    borderRadius: 6,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    color: "#389e0d",
                                                    border: "1px solid #b7eb8f",
                                                    background: "#f6ffed",
                                                }}
                                            >
                                                {mdr}% MDR
                                            </div>
                                        )}

                                        {txnLimit && (
                                            <div
                                                style={{
                                                    padding: "3px 8px",
                                                    borderRadius: 6,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    color: "#0958d9",
                                                    border: "1px solid #adc6ff",
                                                    background: "#eff6ff",
                                                }}
                                            >
                                                Txn ₹{txnLimit.toLocaleString("en-IN")}
                                            </div>
                                        )}
                                    </div>

                                    {/* SELECTED ICON */}
                                    {isSelected && (
                                        <CheckCircleFilled
                                            style={{
                                                position: "absolute",
                                                top: 52,
                                                right: 10,
                                                fontSize: 20,
                                                color: "#52c41a",
                                            }}
                                        />
                                    )}

                                    {/* TOP */}
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <img src={config.icon} alt={mode.name} style={{ height: 18 }} />
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
                                            PG {mode.id}
                                        </div>
                                    </div>
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

