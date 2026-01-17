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
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                marginTop: 15
            }}
        >
            {/* Top section */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar
                    size={64}
                    src={icon}
                    style={{
                        backgroundColor: "#f5f5f5",
                    }}
                />

                <div>
                    <Title level={3} style={{ margin: "12px 0 0" }}>
                        {value}
                    </Title>
                </div>

                <RightOutlined style={{ marginLeft: "auto", color: "#999" }} />
            </div>

            {/* Value */}
            <div className="gap-4 ml-2 mt-2">
            <Text className="text-[30px]" style={{ fontSize: 18 }} strong>{title}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
                {subtitle}
            </Text></div>
        </Card>
    );
};

export default StatisticWidget;
