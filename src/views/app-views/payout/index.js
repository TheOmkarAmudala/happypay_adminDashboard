import React, { useEffect, useState } from "react";
import { Card, Table, Tag } from "antd";
import axios from "axios";

const PayoutPage = () => {
    const [loading, setLoading] = useState(false);
    const [payoutData, setPayoutData] = useState([]);

    const columns = [
        {
            title: "S/N",
            dataIndex: "sn",
            key: "sn",
            width: 70
        },
        {
            title: "Service Txn Ref ID",
            dataIndex: "serviceTxnRefId",
            key: "serviceTxnRefId"
        },
        {
            title: "PayOut Amount",
            dataIndex: "payoutAmount",
            key: "payoutAmount"
        },
        {
            title: "PayOut Status",
            dataIndex: "payoutStatus",
            key: "payoutStatus",
            render: (status) => (
                <Tag color={status === "SUCCESS" ? "green" : "orange"}>
                    {status || "-"}
                </Tag>
            )
        },
        {
            title: "Beneficiary Name",
            dataIndex: "beneficiaryName",
            key: "beneficiaryName"
        },
        {
            title: "Beneficiary A/c",
            dataIndex: "beneficiaryAccount",
            key: "beneficiaryAccount"
        },
        {
            title: "IFSC",
            dataIndex: "beneficiaryIfsc",
            key: "beneficiaryIfsc"
        },
        {
            title: "Transfer Mode",
            dataIndex: "transferMode",
            key: "transferMode"
        },
        {
            title: "UTR",
            dataIndex: "utr",
            key: "utr"
        },
        {
            title: "Transaction Time",
            dataIndex: "transactionTime",
            key: "transactionTime"
        }
    ];

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem("AUTH_TOKEN");
                if (!token) {
                    console.warn("No auth token found");
                    return;
                }

                const response = await axios.get(
                    "https://test.happypay.live/users/serviceTransactions",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const transactions = response.data?.data || [];
                console.log("ALL TX COUNT:", transactions.length);
                console.log(
                    "PAYOUT TX COUNT:",
                    transactions.filter(t => t?.extraInfo?.payout_response?.status).length
                );

                // ✅ ONLY PAYOUT TRANSACTIONS
                const payouts = transactions
                    .filter(tx =>
                        tx.callBack === true &&
                        tx.paymentStatus === "success" &&
                        tx.message?.toLowerCase().includes("payout")
                    )
                    .map((tx, index) => ({
                        key: tx.id,
                        sn: index + 1,
                        serviceTxnRefId: tx.serviceReferenceId || "-",
                        payoutAmount: tx.amount ? `₹${tx.amount}` : "-",
                        payoutStatus: "SUCCESS",
                        beneficiaryName: "-",
                        beneficiaryAccount: "-",
                        beneficiaryIfsc: "-",
                        transferMode: "-",
                        utr: "-",
                        transactionTime: tx.updatedAt
                            ? new Date(tx.updatedAt).toLocaleString()
                            : "-"
                    }));


                transactions.forEach(tx => {
                    if (tx.callBack === true) {
                        console.log("CALLBACK TX:", tx);
                    }
                });



                setPayoutData(payouts);
            } catch (error) {
                console.error("Failed to fetch payouts", error);
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
                pagination={false}
                locale={{
                    emptyText: "No PayOut transactions available"
                }}
                scroll={{ x: true }}
            />
        </Card>
    );
};

export default PayoutPage;
