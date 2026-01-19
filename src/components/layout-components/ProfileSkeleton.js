import { Modal, Row, Col, Tag, Spin, Divider, Typography } from "antd";
import { Skeleton } from "antd";
const  ProfileSkeleton = () => (
    <>
        <Skeleton active title={{ width: 180 }} paragraph={false} />
        <Skeleton active paragraph={{ rows: 1, width: "40%" }} />

        <Divider />

        <Row gutter={[16, 16]}>
            <Col span={12}>
                <Skeleton active paragraph={{ rows: 1 }} />
            </Col>
            <Col span={12}>
                <Skeleton active paragraph={{ rows: 1 }} />
            </Col>
            <Col span={12}>
                <Skeleton active paragraph={{ rows: 1 }} />
            </Col>
            <Col span={12}>
                <Skeleton active paragraph={{ rows: 1 }} />
            </Col>
        </Row>

        <Divider />

        <Skeleton active title={{ width: 120 }} paragraph={{ rows: 2 }} />

        <Divider />

        <Skeleton active title={{ width: 160 }} paragraph={false} />
        <Skeleton.Button active style={{ width: 120, marginRight: 12 }} />
        <Skeleton.Button active style={{ width: 120 }} />
    </>
);

export default ProfileSkeleton;