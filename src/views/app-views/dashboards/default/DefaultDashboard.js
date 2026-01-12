import React, { useState, useMemo } from "react";
import WalletTransactionsPage from "../wallet/WalletTransactionsPage";
import AnnualStatistic from "./components/AnnualStatistic";

const DefaultDashboard = () => {
    const [walletTotal, setWalletTotal] = useState(0);

    const AnnualStatisticData = useMemo(() => ([
        {
            title: "Wallet",
            value: `₹${walletTotal.toLocaleString("en-IN")}`,
            status: 12.5,
            subtitle: "Total Pay In",
            route: "/wallet"
        },
        {
            title: "Pay-In",
            value: "₹1,92,000",
            status: -3.2,
            subtitle: "Total Pay Out",
            route: "/payin"
        }
    ]), [walletTotal]);

    return (
        <>
            <WalletTransactionsPage
                onWalletTotalChange={setWalletTotal}
            />

            <AnnualStatistic data={AnnualStatisticData} />
        </>
    );
};

export default DefaultDashboard;
