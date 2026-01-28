import React from "react";
import { Modal, Descriptions, Tag, Typography, Divider } from "antd";

const { Title, Text } = Typography;

const PayInTransactionModal = ({ open, onClose, loading, transaction }) => {
    if (!transaction) return null;

    const payout = transaction.extraInfo?.payout_response || {};
    const bank = transaction.extraInfo?.bank_account || {};

    const impsCharges =
        (payout.transferservicecharge || 0) +
        (payout.transferservicetax || 0);

    return (
        <Modal open={open} onCancel={onClose} footer={null} width={750}>
            <Title level={4}>Transaction Details</Title>

            <Text type="secondary">
                {new Date(transaction.createdAt).toLocaleString()}
            </Text>

            <Divider />

            <Descriptions bordered column={1} size="small">

                <Descriptions.Item label="Payment Order ID">
                    {transaction.serviceReferenceId}
                </Descriptions.Item>

                <Descriptions.Item label="SLPE Name (Gateway)">
                    {transaction.provider?.toUpperCase()}
                </Descriptions.Item>

                <Descriptions.Item label="SLPE Transfer ID">
                    {/* {payout.cftransferid || "-"} */}
                </Descriptions.Item>

                <Descriptions.Item label="UTR Number">
                    {payout.transferutr || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Pay-In Amount">
                    ₹{transaction.amount}
                </Descriptions.Item>

                <Descriptions.Item label="Pay-Out Amount (Requested)">
                    ₹{transaction.request?.transfer_amount}
                </Descriptions.Item>

                <Descriptions.Item label="Pay-Out Amount (Credited)">
                    ₹{payout.transferamount}
                </Descriptions.Item>

                <Descriptions.Item label="IMPS Charges">
                    ₹{impsCharges.toFixed(2)}
                </Descriptions.Item>

                <Descriptions.Item label="Transaction Charges">
                    ₹{transaction.transactionCharges}
                </Descriptions.Item>

                <Descriptions.Item label="Beneficiary Name">
                    {bank.beneficiary_name}
                </Descriptions.Item>

                <Descriptions.Item label="Beneficiary Account">
                    XXXX{bank.bank_account_number?.slice(-4)}
                </Descriptions.Item>

                <Descriptions.Item label="Status">
                    <Tag color="green">{payout.statuscode}</Tag>
                </Descriptions.Item>

            </Descriptions>
        </Modal>
    );
};

export default PayInTransactionModal;