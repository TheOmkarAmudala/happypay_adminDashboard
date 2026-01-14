import React, { useState } from "react";
import { Typography } from "antd";
import SlpePaymentModesCards from "./index";
import ServiceChargeModal from "./ServiceChargeModal";

const { Title } = Typography;

const PaymentPage = () => {
    const [open, setOpen] = useState(false);
    const [baseAmount, setBaseAmount] = useState(10001);
    const [finalAmount, setFinalAmount] = useState(10001);

    return (
        <>
            <Title level={4}>
                Settlement Amount: ₹{finalAmount.toFixed(2)}
            </Title>

            <SlpePaymentModesCards onSelect={() => setOpen(true)} />

            <ServiceChargeModal
                open={open}
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
