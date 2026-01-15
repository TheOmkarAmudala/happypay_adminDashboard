import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Button, Space } from "antd";
import axios from "axios";
import { MODE_CONFIG } from "./modeConfig"; // or same file


const { Text } = Typography;

const SlpePaymentModesCards = ({ onSelect }) => {
    const [modes, setModes] = useState([]);
    const [category, setCategory] = useState("edu"); // edu | travel

    useEffect(() => {
        axios
            .get("https://test.happypay.live/getSLPEPaymentModes")
            .then((res) => {
                const livePayinModes = (res.data.data || []).filter(
                    (m) => m.live_payin === true
                );
                setModes(livePayinModes);
            })
            .catch(console.error);
    }, []);

    const filteredModes = modes.filter((mode) => {
        const config = MODE_CONFIG[mode.name];
        return config && config.category === category;
    });

    return (
        <>
            {/* 🔘 CATEGORY TOGGLE */}
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
                {filteredModes.map((mode) => {
                    const config = MODE_CONFIG[mode.name];
                    if (!config) return null;

                    return (
                        <Col xs={24} sm={12} md={8} lg={6} key={mode.id}>
                            <Card
                                hoverable
                                onClick={() => onSelect(mode)}
                                style={{
                                    borderRadius: 16,
                                    height: 140,
                                    cursor: "pointer",
                                    boxShadow: "0 6px 18px rgba(0,0,0,0.06)"
                                }}
                                bodyStyle={{
                                    padding: 16,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    height: "100%"
                                }}
                            >
                                {/* 🔝 TOP: LOGO + PG */}
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <img
                                        src={config.icon}
                                        alt={config.pg}
                                        style={{
                                            height: 34,
                                            width: 34,
                                            objectFit: "contain"
                                        }}
                                    />

                                    <div style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>
                                        {config.pg}
                                    </div>
                                </div>

                                {/* 🏷️ PRODUCT NAME */}
                                <div style={{ marginTop: 12 }}>
                                    <Text strong style={{ fontSize: 14 }}>
                                        {mode.name.replace("Slpe ", "")}
                                    </Text>
                                </div>

                                {/* 🔹 CATEGORY BADGE */}
                                <div
                                    style={{
                                        alignSelf: "flex-start",
                                        marginTop: 10,
                                        padding: "2px 10px",
                                        borderRadius: 12,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        background: category === "edu" ? "#e6f4ff" : "#f6ffed",
                                        color: category === "edu" ? "#1677ff" : "#389e0d"
                                    }}
                                >
                                    {category.toUpperCase()}
                                </div>
                            </Card>
                        </Col>

                    );
                })}
            </Row>
        </>
    );
};

export default SlpePaymentModesCards;
