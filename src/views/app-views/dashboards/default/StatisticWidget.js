import { Card, Avatar, Typography, Grid } from "antd";
import { RightOutlined } from "@ant-design/icons";
const { useBreakpoint } = Grid;

const { Text, Title } = Typography;

const StatisticWidget = ({ title, value, subtitle, icon, iconStyle }) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    return (
        <Card
            style={{
                borderRadius: 18,
                height: "100%",
                position: "relative",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: 6,
                    background:
                        "linear-gradient(to top, rgba(22,119,255,0.25), transparent)",
                }}
            />
            {/* ===== TOP ===== */}
            <div
                style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "center",
                    gap: 12,
                }}
            >
                <div
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: iconStyle?.softBg || "#f5f7fa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                    }}
                >
                    <img
                        src={icon}
                        alt=""
                        style={{
                            width: 26,
                            height: 26,
                            opacity: 0.9,
                        }}
                    />
                </div>

                <Title
                    level={4}
                    style={{
                        margin: 0,
                        fontSize: 22,
                        fontWeight: 600,
                        lineHeight: 1.1,
                    }}
                >
                    {value}
                </Title>

                {!isMobile && (
                    <RightOutlined
                        style={{
                            marginLeft: "auto",
                            color: "#bfbfbf",
                            fontSize: 14,
                        }}
                    />
                )}
            </div>

            {/* ===== BOTTOM ===== */}
            <div>
                <Text
                    strong
                    style={{
                        fontSize: 16,
                        display: "block",
                        marginBottom: 4,
                    }}
                >
                    {title}
                </Text>

                <Text type="secondary" style={{ fontSize: 13 }}>
                    {subtitle}
                </Text>
            </div>


        </Card>


    );
};

export default StatisticWidget;
