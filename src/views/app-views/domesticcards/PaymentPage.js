import React, { useState } from "react";
import { Typography } from "antd";
import SlpePaymentModesCards from "./index";
import ServiceChargeModal from "./ServiceChargeModal";

const { Title } = Typography;

const PaymentPage = () => {
    const [open, setOpen] = useState(false);
    const [baseAmount, setBaseAmount] = useState(10001);
    const [finalAmount, setFinalAmount] = useState(10001);
    const [selectedMode, setSelectedMode] = useState(null);

    return (
        <>

            <SlpePaymentModesCards
                onSelect={(mode) => {
                    setSelectedMode(mode);
                    setOpen(true);
                }}
            />
            <ServiceChargeModal
                open={open}
                selectedMode={selectedMode}
                baseAmount={baseAmount}
                setBaseAmount={(val) => {
                    setBaseAmount(val);
                    setFinalAmount(val); // keep in sync initially
                }}
                onClose={() => setOpen(false)}
                onApply={(amount) => {
                    setFinalAmount(amount);
                    setOpen(false);
                }}
            />
        </>
    );
};

export default PaymentPage;
