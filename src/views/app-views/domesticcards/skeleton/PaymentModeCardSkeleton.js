import { Card, Skeleton } from "antd";

const PaymentModeCardSkeleton = () => {
    return (
        <Card
            style={{
                borderRadius: 16,
                height: 140,
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            }}
            bodyStyle={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
            }}
        >
            {/* top */}
            <Skeleton
                active
                title={false}
                paragraph={false}
                avatar={{ size: 34, shape: "square" }}
            />

            {/* product name */}
            <Skeleton
                active
                title={{ width: "60%" }}
                paragraph={false}
            />

            {/* badge */}
            <Skeleton.Button
                active
                size="small"
                style={{ width: 70, borderRadius: 12 }}
            />
        </Card>
    );
};

export default PaymentModeCardSkeleton;
