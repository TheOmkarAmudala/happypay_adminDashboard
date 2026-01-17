import React from "react";
import { Card } from "antd";
import { RightOutlined } from "@ant-design/icons";

const PaymentMethodCard = ({ icon, title, subtitle, onClick }) => {
    return (
        <Card
            hoverable
            onClick={onClick}
            style={{
                borderRadius: 16,
                cursor: "pointer",
                height: "100%",
            }}
            bodyStyle={{
                display: "flex",
                alignItems: "center",
                gap: 16,
            }}
        >
            {/* Icon */}
            <div
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#fff7e6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                }}
            >
                {icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#8c8c8c" }}>{subtitle}</div>
            </div>

            {/* Arrow */}
            <RightOutlined style={{ color: "#8c8c8c" }} />
        </Card>
    );
};

export default PaymentMethodCard;
