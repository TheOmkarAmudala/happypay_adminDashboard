import React, { useEffect, useState } from "react";
import { Card, Table, Tag } from "antd";
import axios from "axios";

const PayoutPage = () => {
    const [loading, setLoading] = useState(false);
    const [payoutData, setPayoutData] = useState([]);

    const columns = [
        { title: "S/N", dataIndex: "sn", key: "sn", width: 70 },

        { title: "Service Txn Ref ID", dataIndex: "serviceTxnRefId", key: "serviceTxnRefId" },

        { title: "Payout Amount", dataIndex: "payoutAmount", key: "payoutAmount" },

        {
            title: "Payout Status",
            dataIndex: "payoutStatus",
            key: "payoutStatus",
            render: (status) => (
                <Tag color={status === "SUCCESS" ? "green" : "orange"}>
                    {status || "-"}
                </Tag>
            )
        },

        { title: "Beneficiary Name", dataIndex: "beneficiaryName", key: "beneficiaryName" },
        { title: "Beneficiary A/c", dataIndex: "beneficiaryAccount", key: "beneficiaryAccount" },
        { title: "IFSC", dataIndex: "beneficiaryIfsc", key: "beneficiaryIfsc" },
        { title: "Transfer Mode", dataIndex: "transferMode", key: "transferMode" },
        { title: "UTR", dataIndex: "utr", key: "utr" },

        { title: "Transaction Time", dataIndex: "transactionTime", key: "transactionTime" }
    ];

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem("AUTH_TOKEN");
                if (!token) return;

                const res = await axios.get(
                    "https://test.happypay.live/users/serviceTransactions",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const transactions = res.data?.data || [];

                // ✅ FILTER ONLY PAYOUTS (correct way)
                const payouts = transactions
                    .filter(tx =>
                        tx.domainName === "payout" ||
                        tx.paymentType === "payout"
                    )
                    .map((tx, index) => {
                        const bank = tx.extraInfo?.bank_account || {};
                        const payout = tx.extraInfo?.payout_response || {};

                        return {
                            key: tx.id,
                            sn: index + 1,

                            serviceTxnRefId: tx.serviceReferenceId || "-",

                            payoutAmount: tx.amount
                                ? `₹${Number(tx.amount).toFixed(2)}`
                                : "-",

                            payoutStatus:
                                payout.status ||
                                tx.paymentStatus?.toUpperCase() ||
                                "-",

                            beneficiaryName: bank.beneficiary_name || "-",
                            beneficiaryAccount: bank.bank_account_number || "-",
                            beneficiaryIfsc: bank.bank_ifsc || "-",

                            transferMode:
                                payout.transfermode ||
                                payout.transfer_mode ||
                                "-",

                            utr:
                                payout.transferutr ||
                                payout.transfer_utr ||
                                "-",

                            transactionTime: tx.updatedAt
                                ? new Date(tx.updatedAt).toLocaleString()
                                : "-"
                        };
                    });

                setPayoutData(payouts);
            } catch (err) {
                console.error("Failed to fetch payout transactions", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPayouts();
    }, []);

    return (
        <Card title="PayOut Transactions">
            <Table
                columns={columns}
                dataSource={payoutData}
                loading={loading}
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: "No PayOut transactions available" }}
                scroll={{ x: true }}
            />
        </Card>
    );
};

export default PayoutPage;
