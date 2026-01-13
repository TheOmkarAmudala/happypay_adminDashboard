import React, { useState, useEffect } from "react";

import { Row, Col, Button, Dropdown, Table, Tag } from 'antd';
import StatisticWidget from 'components/shared-components/StatisticWidget';
import ChartWidget from 'components/shared-components/ChartWidget';
import GoalWidget from 'components/shared-components/GoalWidget';
import Card from 'components/shared-components/Card';
import Flex from 'components/shared-components/Flex';
import { AUTH_TOKEN } from "constants/AuthConstant";
import { useNavigate } from "react-router-dom";


import {
  VisitorChartData, 
  AnnualStatisticData, 
  ActiveMembersData
} from './DefaultDashboardData';
import ApexChart from 'react-apexcharts';
import { apexLineChartDefaultOption, COLOR_2 } from 'constants/ChartConstant';
import { SPACER } from 'constants/ThemeConstant'
import { 
  FileExcelOutlined,
  PrinterOutlined,
  EllipsisOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import axios from 'axios';





const MembersChart = props => (
  <ApexChart {...props}/>
)

const memberChartOption = {
  ...apexLineChartDefaultOption,
  ...{
    chart: {
      sparkline: {
        enabled: true,
      }
    },
    colors: [COLOR_2],
  }
}

const latestTransactionOption = [
  {
    key: 'Refresh',
    label: (
      <Flex alignItems="center" gap={SPACER[2]}>
        <ReloadOutlined />
        <span className="ml-2">Refresh</span>
      </Flex>
    ),
  },
  {
    key: 'Print',
    label: (
      <Flex alignItems="center" gap={SPACER[2]}>
        <PrinterOutlined />
        <span className="ml-2">Print</span>
      </Flex>
    ),
  },
  {
    key: 'Export',
    label: (
      <Flex alignItems="center" gap={SPACER[2]}>
        <FileExcelOutlined />
        <span className="ml-2">Export</span>
      </Flex>
    ),
  },
]


const CardDropdown = ({items}) => {

  return (
    <Dropdown menu={{items}} trigger={['click']} placement="bottomRight">
      <a href="/#" className="text-gray font-size-lg" onClick={e => e.preventDefault()}>
        <EllipsisOutlined />
      </a>
    </Dropdown>
  )
}
const tableColumns = [
  {
    title: "S/N",
    dataIndex: "sn",
    key: "sn"
  },
  {
    title: "Customer Details",
    dataIndex: "customerDetails",
    key: "customerDetails"
  },
  {
    title: "Service Txn Ref ID",
    dataIndex: "serviceTxnRefId",
    key: "serviceTxnRefId"
  },
  {
    title: "Transaction Time",
    dataIndex: "transactionTime",
    key: "transactionTime"
  },
  {
    title: "Gateway Name",
    dataIndex: "gatewayName",
    key: "gatewayName"
  },
  {
    title: "Order / PayIn Amount",
    dataIndex: "orderAmount",
    key: "orderAmount"
  },
  {
    title: "Payment Status",
    dataIndex: "paymentStatus",
    key: "paymentStatus",
    render: (status) => {
      const safeStatus = typeof status === "string" ? status : "UNKNOWN";

      return (
          <Tag
              color={
                safeStatus.toLowerCase() === "success"
                    ? "green"
                    : safeStatus.toLowerCase() === "pending"
                        ? "orange"
                        : "red"
              }
          >
            {safeStatus.toUpperCase()}
          </Tag>
      );
    }
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
    title: "Beneficiary A/c Number",
    dataIndex: "beneficiaryAccount",
    key: "beneficiaryAccount"
  },
  {
    title: "Beneficiary IFSC",
    dataIndex: "beneficiaryIfsc",
    key: "beneficiaryIfsc"
  },
  {
    title: "Transaction Status",
    dataIndex: "transactionStatus",
    key: "transactionStatus",
    render: (status) => (
        <Tag color={status === "success" ? "green" : "orange"}>
          {status?.toUpperCase() || "-"}
        </Tag>
    )
  }
];



export const DefaultDashboard = () => {
  const [visitorChartData] = useState(VisitorChartData);
  const [annualStatisticData] = useState(AnnualStatisticData);
  const [activeMembersData] = useState(ActiveMembersData);
  const { direction } = useSelector(state => state.theme)
  const [recentTransactionData, setRecentTransactionData] = useState([]);
  // track loading state inside effects
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const navigate = useNavigate();

  // Navigate to a route when a statistic card is clicked.
  // Normalizes legacy '/pay-out' to '/payout' (your requested path).
  const handleStatClick = (route) => {
    const normalized = route === '/pay-out' ? '/payout' : route;
    navigate(normalized);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoadingTransactions(true);

        // ✅ READ TOKEN AT RUNTIME
        const token = localStorage.getItem("AUTH_TOKEN");
        console.log("🔐 Token read inside useEffect:", token);

        if (!token) {
          console.warn("❌ No token found, user not logged in");
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

        // 🔍 LOG RAW RESPONSE
        console.log("🟦 Raw API response:", response.data);

        const transactions = response.data?.data || [];
        console.log("🟩 Transactions array:", transactions);

        // ✅ FORMAT + REVERSE (LATEST FIRST)
        const formattedData = transactions
            .map((item, index) => {
              const bankAccount = item?.extraInfo?.bank_account ?? {};
              const payoutResponse = item?.extraInfo?.payout_response ?? {};

              return {
                key: item.id,

                // 1. S/N
                sn: index + 1,

                // 2. Customer Details
                customerDetails: item.accountId ?? "-",

                // 3. Service Txn Ref ID
                serviceTxnRefId: item.serviceReferenceId ?? "-",

                // 4. Transaction Time
                transactionTime: item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "-",

                // 5. Gateway Name
                gatewayName: "Razorpay",

                // 6. Order / PayIn Amount
                orderAmount: item.amount ? `₹${item.amount}` : "-",

                // 7. Payment Status
                paymentStatus: item.paymentStatus ?? "-",

                // 8. PayOut Amount
                payoutAmount: payoutResponse.transferamount
                    ? `₹${payoutResponse.transferamount}`
                    : "-",

                // 9. PayOut Status
                payoutStatus: payoutResponse.status ?? "-",

                // 10. Beneficiary A/c Number
                beneficiaryAccount: bankAccount.bank_account_number ?? "-",

                // 11. Beneficiary IFSC
                beneficiaryIfsc: bankAccount.bank_ifsc ?? "-",

                // 12. Transaction Status
                transactionStatus: item.status ?? "-"
              };
            })
            .reverse(); // latest first

// 🔥 latest on top

        // 🔍 LOG FORMATTED DATA
        console.log("🟨 Formatted table data:", formattedData);


        setRecentTransactionData(formattedData);


      } catch (error) {
        console.error(
            "❌ Failed to fetch transactions:",
            error.response?.data || error
        );
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, []);


  const [visibleCount, setVisibleCount] = useState(10);

  return (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={24} md={24} lg={18}>
          <Row gutter={16}>
            {annualStatisticData.map((elm, i) => (
                <Col xs={24} sm={24} md={24} lg={24} xl={8} key={i}>

                  <div

                      style={{ cursor: "pointer", transition: "transform 0.2s" }}
                      onClick={() => handleStatClick(elm.route)}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >


                    <StatisticWidget
                        title={elm.title}
                        value={elm.value}
                        status={elm.status}
                        subtitle={elm.subtitle}
                    />
                  </div>
                </Col>
            ))}
          </Row>

          <Row gutter={16}>
            <Col span={24}>
                <ChartWidget 
                  title="Unique Visitors" 
                  series={visitorChartData.series} 
                  xAxis={visitorChartData.categories} 
                  height={'400px'}
                  direction={direction}
                />
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={24} lg={6}>
          <GoalWidget
            title="Monthly Target"
            value={87}
            subtitle="You need abit more effort to hit monthly target"
            extra={<Button type="primary">Learn More</Button>}
          />
          <StatisticWidget
            title={
              <MembersChart 
                options={memberChartOption}
                series={activeMembersData}
                height={145}
              />
            }
            value='17,329'
            status={3.7}
            subtitle="Active members"
          />
        </Col>
      </Row>
      <Row gutter={16}>


        <Col xs={24} sm={24} md={24} lg={17}>
          <Card title="Latest Transactions" extra={<CardDropdown items={latestTransactionOption} />}>
            <Table
                columns={tableColumns}
                dataSource={recentTransactionData}
                rowKey="key"
                pagination={false}
            />

            <div style={{ textAlign: "center", marginTop: 16 }}>
              {visibleCount < recentTransactionData.length && (
                  <Button
                      onClick={() => setVisibleCount(prev => prev + 10)}
                      style={{ marginRight: 8 }}
                  >
                    Load More
                  </Button>
              )}

              {visibleCount > 10 && (
                  <Button onClick={() => setVisibleCount(10)}>
                    Load Less
                  </Button>
              )}
            </div>
          </Card>

        </Col>
      </Row>
    </>
  )
}



export default DefaultDashboard;
