import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import SlpePaymentModesCards from "./index";
import SelectCustomerSection from "./SelectCustomerSection";
import ServiceChargeModal from "./ServiceChargeModal";
import { fetchCustomers } from "store/slices/customerSlice";

const PaymentPage = () => {
    const dispatch = useDispatch();

    const token = useSelector((state) => state.auth.token);
    const { data: customers, loading } = useSelector(
        (state) => state.customers
    );

    const [step, setStep] = useState(1);
    const [selectedMode, setSelectedMode] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);

    const [bankAccounts, setBankAccounts] = useState([]);
    const [bankLoading, setBankLoading] = useState(false);
    const [baseAmount, setBaseAmount] = useState(10000);

    /* ================= FETCH CUSTOMERS ================= */
    useEffect(() => {
        if (!customers.length) {
            dispatch(fetchCustomers());
        }
    }, [dispatch, customers.length]);

    const profile = useSelector((state) => state.profile.data);

    const buildPaymentPayload = ({
                                     settlementAmount,
                                     percentage,
                                     selectedCustomer,
                                     selectedBank,
                                     selectedMode,
                                     profile
                                 }) => {
        return {
            amount: Number(settlementAmount.toFixed(2)),

            // 👤 Logged-in merchant phone
            phone: profile.phoneNumber,

            // 🧾 Card category
            productinfo: selectedMode.name.toLowerCase().includes("edu")
                ? "education"
                : selectedMode.name.toLowerCase().includes("travel")
                    ? "travel"
                    : "Other",

            // 👤 Customer phone
            cn: selectedCustomer.phone,

            op: "",
            cir: "",

            // 🏦 Bank details
            ad1: selectedBank.bank_account_number,
            ad2: selectedBank.beneficiary_name,
            ad3: selectedBank.bank_ifsc,
            ad4: "",

            // ✅ CORRECT beneficiary id (from bank)
            beneficiary_id: selectedBank.beneficiary_id,

            test: false,

            // 👤 Profile
            userLevel: profile.userLevel,

            // 💸 Pricing
            custom_pricing: percentage,

            payment_mode: "slpe",

            // 🧾 PG ID
            slpe_gateway_id: String(selectedMode.id)
        };
    };


    const handlePaymentInit = async (payload, token) => {
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


            console.log("PAYMENT INIT RESPONSE:", res.data);


// ✅ success check
            if (
                res.data?.status === "success" &&
                typeof res.data?.data === "string"
            ) {
                const paymentUrl = res.data.data;


// 🔥 REDIRECT TO SLPE PAYMENT PAGE
                window.location.href = paymentUrl;
                return;
            }


// fallback error
            message.error("Failed to create payment link");


        } catch (err) {
            console.error("PAYMENT INIT ERROR:", err);
            message.error(
                err?.response?.data?.message ||
                "Payment initiation failed"
            );
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
            console.log("FETCH BANK ACCOUNTS RESPONSE:", json);
            setBankAccounts(Array.isArray(json?.data) ? json.data : []);
        } catch (err) {
            console.error(err);
            message.error("Failed to fetch bank accounts");
            setBankAccounts([]);
        } finally {
            setBankLoading(false);
        }
    };

    return (
        <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
            {step > 1 && (
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => setStep(step - 1)}
                >
                    Back
                </Button>
            )}

            {/* STEP 1 – PAYMENT MODE */}
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

            {/* STEP 2 – CUSTOMER + BANK */}
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
                        setStep(3);
                    }}
                    onChangeCustomer={() => {
                        setSelectedCustomer(null);
                        setSelectedBank(null);
                        setBankAccounts([]);
                    }}
                />
            )}

            {/* STEP 3 – PAYMENT SUMMARY */}
            <ServiceChargeModal
                open={step === 3}
                selectedCustomer={selectedCustomer}
                selectedMode={selectedMode}
                baseAmount={baseAmount}
                setBaseAmount={setBaseAmount}
                onClose={() => setStep(2)}
                onApply={(data) => {
                    const payload = buildPaymentPayload({
                        settlementAmount: data.settlementAmount,
                        percentage: data.percentage,
                        selectedCustomer,
                        selectedBank,
                        selectedMode,
                        profile
                    });


                    console.log("FINAL PAYMENT PAYLOAD:", payload);


                    handlePaymentInit(payload, token);
                }}
            />
        </div>
    );
};

export default PaymentPage;