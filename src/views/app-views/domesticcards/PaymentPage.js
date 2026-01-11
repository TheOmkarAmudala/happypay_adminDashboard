import React, { useState } from "react";
import { Typography, InputNumber } from "antd";
import SlpePaymentModesCards from "./index";
import ServiceChargeModal from "./ServiceChargeModal";


const { Title } = Typography;
const PaymentPage = () => {
    const [open, setOpen] = useState(false);
    const [baseAmount, setBaseAmount] = useState(10001);
    const [finalAmount, setFinalAmount] = useState(10001);

    return (
        <>
            <Title level={4}>Settlement Amount: ₹{finalAmount.toFixed(2)}</Title>

            <Title level={5}>Base Amount</Title>
            <InputNumber
                min={1}
                value={baseAmount}
                style={{ width: 200, marginBottom: 16 }}
                onChange={(v) => {
                    setBaseAmount(v || 0);
                    setFinalAmount(v || 0);
                }}
                formatter={(v) => `₹ ${v}`}
                parser={(v) => v.replace(/₹\s?|(,*)/g, "")}
            />

            <SlpePaymentModesCards onSelect={() => setOpen(true)} />

            <ServiceChargeModal
                open={open}
                baseAmount={baseAmount}
                onClose={() => setOpen(false)}
                onApply={(amount) => setFinalAmount(amount)}
            />
        </>
    );
};


export default PaymentPage;
