import { Card, Typography, Tag, Button, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";


const { Text } = Typography;

const SelectCustomerSection = ({
                                   customers,
                                   loading,
                                   selectedCustomer,
                                   onSelect,
                                   onChangeCustomer
                               }) => {
    const navigate = useNavigate();

    // If customer already selected → show highlighted card only
    if (selectedCustomer) {

        return (
            <Card
                size="small"
                style={{
                    background: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: 10,
                    marginBottom: 20
                }}
                bodyStyle={{
                    padding: "10px 14px"
                }}
            >
                <div
                    style={{
                        display: "flex",

                        gap: 12,

                    }}
                >
                    {/* LEFT: NAME + PHONE */}
                    <div style={{ lineHeight: 1.2 }}>
                        <Text strong>{selectedCustomer.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {selectedCustomer.phone}
                        </Text>
                    </div>

                    {/* KYC TAG */}
                    <Tag color="green" style={{ marginLeft: 8 }}>
                        KYC
                    </Tag>

                    {/* RIGHT: CHANGE */}
                    <Button
                        type="link"
                        size="small"
                        danger
                        style={{ marginLeft: "auto", padding: 0 }}
                        onClick={onChangeCustomer}
                    >
                        Change
                    </Button>
                </div>
            </Card>
        );
    }


    // Else → show list
    return (
        <div
            style={{
                marginBottom: 24,
                display: "flex",
                padding: "0 12px"

            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 720   // 👈 KEY VALUE (desktop sweet spot)
                }}
            >

            <Text strong style={{ display: "block", marginBottom: 12 }}>
                Select Customer
            </Text>

            {loading ? (
                <div>Loading customers…</div>
            ) : (
                <Row gutter={[16, 16]}>
                    {customers.map((customer) => {
                        const kycVerified = customer?.kyc?.some(k => k.verified);

                        return (
                            <Col
                                key={customer.id}
                                xs={24}   // 📱 Mobile: 1 per row
                                sm={24}
                                md={12}   // 💻 Desktop: 2 per row
                                lg={12}
                            >

                                <Card
                                    hoverable
                                    onClick={() => {
                                        if (kycVerified) {
                                            onSelect(customer);
                                        } else {
                                            navigate("/app/apps/customers");
                                        }
                                    }}
                                    style={{
                                        width: "100%",
                                        height: 72,
                                        borderRadius: 10,
                                        cursor: kycVerified ? "pointer" : "pointer",
                                        opacity: kycVerified ? 1 : 0.5
                                    }}
                                    bodyStyle={{ padding: "12px 16px" }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between"
                                        }}
                                    >
                                        {/* LEFT: Name + Phone */}
                                        <div style={{ lineHeight: 1.2 }}>
                                            <Text strong style={{ display: "block" }}>
                                                {customer.name}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {customer.phone}
                                            </Text>
                                        </div>

                                        {/* RIGHT: KYC */}
                                        <Tag color={kycVerified ? "green" : "red"}>
                                            {kycVerified ? "KYC" : "No KYC"}
                                        </Tag>
                                    </div>
                                </Card>

                            </Col>
                        );
                    })}
                </Row>

            )}
        </div>
        </div>
    );
};

export default SelectCustomerSection;
