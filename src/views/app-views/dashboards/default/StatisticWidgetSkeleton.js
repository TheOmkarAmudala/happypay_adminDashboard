import { Card, Skeleton } from "antd";

const StatisticWidgetSkeleton = () => {
    return (
        <Card
            style={{
                borderRadius: 18,
                height: "100%",
            }}
            bodyStyle={{
                padding: 18,
            }}
        >
            <Skeleton
                active
                avatar={{ size: 48, shape: "circle" }}
                title={{ width: "40%" }}
                paragraph={{ rows: 2, width: ["60%", "80%"] }}
            />
        </Card>
    );
};

export default StatisticWidgetSkeleton;
