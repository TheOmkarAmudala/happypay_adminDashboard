import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography } from "antd";
import axios from "axios";


const { Text } = Typography;

const SlpePaymentModesCards = ({ onSelect }) => {
    const [modes, setModes] = useState([]);

    useEffect(() => {
        axios
            .get("https://test.happypay.live/getSLPEPaymentModes")
            .then((res) => setModes(res.data.data || []))
            .catch(console.error);
    }, []);

    return (
        <Row gutter={[16, 16]}>
            {modes.map((mode) => (
                <Col xs={12} sm={8} md={6} key={mode.id}>
                    <Card
                        hoverable
                        onClick={onSelect}
                        style={{
                            borderRadius: 14,
                            textAlign: "center",
                            height: 80,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer"
                        }}
                    >
                        <Text strong>{mode.name}</Text>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default SlpePaymentModesCards;
