import { Card, Avatar, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const StatisticWidget = ({ title, value, subtitle, icon }) => {
    return (
        <Card
            hoverable
            style={{
                borderRadius: 16,
                height: "100%",
            }}
            bodyStyle={{
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            {/* ===== TOP: ICON + VALUE ===== */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <Avatar
                    size={48}                 // ✅ mobile-friendly
                    src={icon}
                    style={{
                        backgroundColor: "#f5f5f5",
                        flexShrink: 0,
                    }}
                />

                <div style={{ flex: 1 }}>
                    <Title
                        level={4}               // ✅ smaller on mobile
                        style={{
                            margin: 0,
                            fontSize: "clamp(16px, 4vw, 22px)", // responsive text
                        }}
                    >
                        {value}
                    </Title>
                </div>

                <RightOutlined
                    style={{
                        color: "#999",
                        fontSize: 14,
                    }}
                />
            </div>

            {/* ===== BOTTOM: TITLE + SUBTITLE ===== */}
            <div>
                <Text
                    strong
                    style={{
                        fontSize: "clamp(13px, 3.5vw, 15px)",
                        display: "block",
                    }}
                >
                    {title}
                </Text>

                <Text
                    type="secondary"
                    style={{
                        fontSize: 12,
                    }}
                >
                    {subtitle}
                </Text>
            </div>
        </Card>
    );
};

export default StatisticWidget;
