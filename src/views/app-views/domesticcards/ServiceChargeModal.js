import React, { useState } from "react";
import { Typography } from "antd";
import SlpePaymentModesCards from "./index";

import ServiceChargeModal from "./ServiceChargeModal";

const { Title } = Typography;

const PaymentPage = () => {
    const [open, setOpen] = useState(false);

    // this is just the displayed settlement amount
    const [finalAmount, setFinalAmount] = useState(10001);

    return (
        <>
            <Title level={4}>
                Settlement Amount: ₹{finalAmount.toFixed(2)}
            </Title>

            <SlpePaymentModesCards onSelect={() => setOpen(true)} />

            <ServiceChargeModal
                open={open}
                initialBaseAmount={finalAmount}
                onClose={() => setOpen(false)}
                onApply={(amount) => setFinalAmount(amount)}
            />
        </>
    );
};

export default PaymentPage;
