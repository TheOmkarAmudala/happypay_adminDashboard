import React from "react";
import {
    Modal,
    Skeleton,
    Tag,
    Card,
    Row,
    Col,
    Divider,
    Descriptions,
    Typography
} from "antd";

const { Text, Title } = Typography;

const WalletTransactionModal = ({
                                    open,
                                    onClose,
                                    loading,
                                    transaction,
                                    isMobile
                                }) => {
    return (
        <Modal
            open={open}
            footer={null}
            width={isMobile ? "100%" : 720}
            style={isMobile ? { top: 20 } : {}}
            bodyStyle={{
                padding: isMobile ? 14 : 24,
                maxHeight: isMobile ? "85vh" : "none",
                overflowY: "auto"
            }}
            onCancel={onClose}
        >
            {loading ? (
                <Skeleton active />
            ) : (
                transaction && (
                    <div style={{ maxWidth: 560, margin: "0 auto" }}>
                        {/* STATUS */}
                        <div style={{ textAlign: "center", marginBottom: 12 }}>
                            <Tag
                                color="green"
                                style={{ padding: "6px 14px", fontSize: 13, borderRadius: 20 }}
                            >
                                ✓ Transfer Successful
                            </Tag>
                        </div>

                        {/* AMOUNT */}
                        <div style={{ textAlign: "center", marginBottom: 12 }}>
                            <div style={{ fontSize: isMobile ? 28 : 34, fontWeight: 600 }}>
                                ₹{transaction.amount?.toFixed(2)}
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {new Date(transaction.createdAt).toLocaleString()}
                            </Text>
                        </div>

                        {/* BENEFICIARY */}
                        <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }}>
                            <Row gutter={[0, 6]}>
                                <Col span={24}>
                                    <Text strong>
                                        {transaction?.extraInfo?.bank_account?.beneficiary_name ||
                                            "Beneficiary"}
                                    </Text>
                                </Col>

                                <Col span={24}>
                                    <Text type="secondary">
                                        Bank Account Number: XXXX{" "}
                                        {transaction?.extraInfo?.bank_account?.bank_account_number?.slice(
                                            -4
                                        )}
                                    </Text>
                                </Col>

                                <Col span={24}>
                                    <Text type="secondary">
                                        IFSC:{" "}
                                        {transaction?.extraInfo?.bank_account?.bank_ifsc || "-"}
                                    </Text>
                                </Col>

                                <Col span={24}>
                                    <Tag color="blue" style={{ marginTop: 4 }}>
                                        Bank Transfer
                                    </Tag>
                                </Col>
                            </Row>
                        </Card>

                        {/* AMOUNT BREAKDOWN */}
                        <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                            <Row justify="space-between">
                                <Text>Amount</Text>
                                <Text>₹{transaction.amount?.toFixed(2)}</Text>
                            </Row>

                            <Row justify="space-between" style={{ marginTop: 6 }}>
                                <Text>Charges</Text>
                                <Text type="danger">
                                    -₹{transaction.chargeAmount?.toFixed(2) || "0.00"}
                                </Text>
                            </Row>

                            <Divider style={{ margin: "10px 0" }} />

                            <Row justify="space-between">
                                <Text strong>Total Sent</Text>
                                <Text strong style={{ color: "#3f8600" }}>
                                    ₹{transaction.amount?.toFixed(2)}
                                </Text>
                            </Row>
                        </Card>

                        {/* DETAILS */}
                        <Title level={5} style={{ marginBottom: 8 }}>
                            Transaction Details
                        </Title>

                        <Descriptions bordered size="small" column={1}>
                            <Descriptions.Item label="Reference ID">
                                {transaction.serviceReferenceId}
                            </Descriptions.Item>

                            <Descriptions.Item label="UTR">
                                {transaction?.extraInfo?.payout_response?.transferutr ||
                                    transaction?.response?.transfer_utr ||
                                    "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Transfer Mode">
                                {transaction?.extraInfo?.payout_response?.transfermode?.toUpperCase()}
                            </Descriptions.Item>

                            <Descriptions.Item label="Status">
                                <Tag color="green">
                                    {transaction?.extraInfo?.payout_response?.statuscode}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )
            )}
        </Modal>
    );
};

export default WalletTransactionModal;