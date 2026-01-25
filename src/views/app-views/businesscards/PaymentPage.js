import React, { useEffect, useState } from "react";
import { Button, Space, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

import SlpePaymentModesCards from "./index";
import SelectCustomerSection from "./SelectCustomerSection";
import ServiceChargeModal from "./ServiceChargeModal";
import { fetchCustomers } from "store/slices/customerSlice";

const PaymentPage = () => {
    const dispatch = useDispatch();

    /* ================= REDUX ================= */
    const token = useSelector((state) => state.auth.token);
    const profile = useSelector((state) => state.profile.data);
    const { data: customers, loading } = useSelector(
        (state) => state.customers
    );

    /* ================= FLOW STATE ================= */
    const [step, setStep] = useState(1);

    const [selectedMode, setSelectedMode] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);

    const [bankAccounts, setBankAccounts] = useState([]);
    const [bankLoading, setBankLoading] = useState(false);

    const [baseAmount, setBaseAmount] = useState(10000);
    const [modalOpen, setModalOpen] = useState(false);

    /* ================= FETCH CUSTOMERS ================= */
    useEffect(() => {
        if (!customers.length) {
            dispatch(fetchCustomers());
        }
    }, [dispatch, customers.length]);

    /* ================= BACK HANDLER ================= */
    const handleBack = () => {
        if (step === 2) {
            setSelectedCustomer(null);
            setSelectedBank(null);
            setStep(1);
        }

        if (step === 3) {
            setModalOpen(false);
            setStep(2);
        }
    };

    /* ================= FETCH BANKS ================= */
    const fetchCustomerBanks = async (customerId) => {
        if (!customerId || !token) return;

        try {
            setBankLoading(true);
            const res = await fetch(
                `https://test.happypay.live/customer/getAllBankAccounts?customer_id=${customerId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            );

            const json = await res.json();
            setBankAccounts(Array.isArray(json?.data) ? json.data : []);
        } catch (err) {
            console.error(err);
            message.error("Failed to fetch bank accounts");
            setBankAccounts([]);
        } finally {
            setBankLoading(false);
        }
    };

    /* ================= BUILD PAYLOAD ================= */
    const buildPaymentPayload = ({
                                     settlementAmount,
                                     percentage
                                 }) => ({
        amount: Number(settlementAmount.toFixed(2)),

        phone: profile.phoneNumber,

        productinfo: selectedMode.name.toLowerCase().includes("edu")
            ? "education"
            : selectedMode.name.toLowerCase().includes("travel")
                ? "travel"
                : "Other",
        cn: selectedCustomer.phone,
        op: "",
        cir: "",
        ad1: selectedBank.bank_account_number,
        ad2: selectedBank.beneficiary_name,
        ad3: selectedBank.bank_ifsc,
        ad4: "",
        beneficiary_id: "686f7be987304564aafc528c",

        test: false,

        userLevel: profile.userLevel,

        custom_pricing: percentage,

        payment_mode: "slpe",

        slpe_gateway_id: String(selectedMode.id)
    });

    /* ================= PAYMENT INIT ================= */
    const handlePaymentInit = async (payload) => {
        try {
            const res = await axios.post(
                "https://test.happypay.live/service/paymentInit",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (
                res.data?.status === "success" &&
                typeof res.data?.data === "string"
            ) {
                window.location.href = res.data.data;
                return;
            }

            message.error("Failed to create payment link");
        } catch (err) {
            console.error("PAYMENT INIT ERROR:", err);
            message.error(
                err?.response?.data?.message || "Payment initiation failed"
            );
        }
    };

    return (
        <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
            {/* BACK BUTTON */}
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

            {/* ================= STEP 1: MODE ================= */}
            {step === 1 && (
                <>
                    <SlpePaymentModesCards
                        selectedMode={selectedMode}
                        onSelect={setSelectedMode}
                    />

                    <div style={{ textAlign: "right", marginTop: 16 }}>
                        <Button
                            type="primary"
                            disabled={!selectedMode}
                            onClick={() => setStep(2)}
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}

            {/* ================= STEP 2: CUSTOMER + BANK ================= */}
            {step === 2 && (
                <SelectCustomerSection
                    customers={customers}
                    loading={loading}
                    bankAccounts={bankAccounts}
                    bankLoading={bankLoading}
                    fetchCustomerBanks={fetchCustomerBanks}
                    onSelect={(customer, bank) => {
                        setSelectedCustomer(customer);
                        setSelectedBank(bank);
                        setModalOpen(true);
                        setStep(3);
                    }}
                    onChangeCustomer={() => {
                        setSelectedCustomer(null);
                        setSelectedBank(null);
                        setBankAccounts([]);
                    }}
                />
            )}

            {/* ================= STEP 3: SUMMARY ================= */}
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
                    const payload = buildPaymentPayload(data);
                    handlePaymentInit(payload);
                }}
            />
        </div>
    );
};

export default PaymentPage;