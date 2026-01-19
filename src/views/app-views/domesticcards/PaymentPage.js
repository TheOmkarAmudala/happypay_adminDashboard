import React, { useState, useEffect } from "react";
import { Button, Space } from "antd";
import SlpePaymentModesCards from "./index";
import ServiceChargeModal from "./ServiceChargeModal";
import SelectCustomerSection from "./SelectCustomerSection";
import { useSelector, useDispatch } from "react-redux";
import { fetchCustomers } from "store/slices/customerSlice";
import { ArrowLeftOutlined } from "@ant-design/icons";

const PaymentPage = () => {
    const dispatch = useDispatch();

    // ===== FLOW STATE =====
    const [step, setStep] = useState(1);

    const [selectedMode, setSelectedMode] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [baseAmount, setBaseAmount] = useState(10000);
    const [modalOpen, setModalOpen] = useState(false);

    const { data: customers, loading } = useSelector(
        (state) => state.customers
    );

    useEffect(() => {
        if (customers.length === 0) {
            dispatch(fetchCustomers());
        }
    }, [dispatch, customers.length]);

    // ===== BACK HANDLER =====
    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        } else if (step === 3) {
            setModalOpen(false);
            setStep(2);
        }
    };

    return (
        <div style={{ padding: 12 }}>

            {/* ===== BACK BUTTON (VISIBLE ON STEP > 1) ===== */}
            {step > 1 && (
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                    style={{ marginBottom: 12 }}
                >
                    Back
                </Button>
            )}

            {/* ================= STEP 1: PAYMENT MODE ================= */}
            {step === 1 && (
                <>
                    <SlpePaymentModesCards
                        disabled={false}
                        onSelect={setSelectedMode}
                    />

                    <Button
                        type="primary"
                        disabled={!selectedMode}
                        style={{ marginTop: 16 }}
                        onClick={() => setStep(2)}
                    >
                        Next
                    </Button>
                </>
            )}

            {/* ================= STEP 2: CUSTOMER ================= */}
            {step === 2 && (
                <>
                    <SelectCustomerSection
                        customers={customers}
                        loading={loading}
                        selectedCustomer={selectedCustomer}
                        onSelect={setSelectedCustomer}
                        onChangeCustomer={() => setSelectedCustomer(null)}
                    />

                    <Space style={{ marginTop: 16 }}>
                        <Button onClick={() => setStep(1)}>
                            Back
                        </Button>

                        <Button
                            type="primary"
                            disabled={!selectedCustomer}
                            onClick={() => {
                                setModalOpen(true);
                                setStep(3);
                            }}
                        >
                            Next
                        </Button>
                    </Space>
                </>
            )}

            {/* ================= STEP 3: PAYMENT MODAL ================= */}
            <ServiceChargeModal
                open={modalOpen}
                selectedCustomer={selectedCustomer}
                selectedMode={selectedMode}
                baseAmount={baseAmount}
                setBaseAmount={setBaseAmount}
                onClose={() => {
                    setModalOpen(false);
                    setStep(2);
                }}
                onApply={(data) => {
                    console.log("FINAL PAYMENT DATA:", data);
                    setModalOpen(false);
                }}
            />
        </div>
    );
};

export default PaymentPage;
