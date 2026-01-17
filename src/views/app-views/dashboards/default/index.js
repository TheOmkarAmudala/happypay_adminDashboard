import React, { useState, useEffect } from "react";
import { Row, Col, Button, Avatar, Dropdown, Table, Menu, Tag } from 'antd';
import StatisticWidget from 'components/shared-components/StatisticWidget';
import ChartWidget from 'components/shared-components/ChartWidget';
import AvatarStatus from 'components/shared-components/AvatarStatus';
import GoalWidget from 'components/shared-components/GoalWidget';
import Card from 'components/shared-components/Card';
import Flex from 'components/shared-components/Flex';
import { AUTH_TOKEN } from "constants/AuthConstant";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { getAnnualStatisticData } from "./DefaultDashboardData";
import axios from "../../../../utils/axios"; // ✅ NOT from 'axios'


import {
  VisitorChartData,
  AnnualStatisticData,
  ActiveMembersData,
  NewMembersData,
  RecentTransactionData
} from './DefaultDashboardData';
import ApexChart from 'react-apexcharts';
import { apexLineChartDefaultOption, COLOR_2 } from 'constants/ChartConstant';
import { SPACER } from 'constants/ThemeConstant'
import {
  UserAddOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  PlusOutlined,
  EllipsisOutlined,
  StopOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import utils from 'utils';
import { useSelector } from 'react-redux';




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
   const [activeMembersData] = useState(ActiveMembersData);
  const [newMembersData] = useState(NewMembersData)
  const { direction } = useSelector(state => state.theme)
  const [recentTransactionData, setRecentTransactionData] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const navigate = useNavigate();
  const token = useSelector(state => state.auth.token);
  const profile = useSelector((state) => state.profile.data);
  const annualStatisticData = getAnnualStatisticData(profile);





  // Navigate to the app-prefixed route. If data provides '/pay-out', normalize
  // it to '/payout' (we have a protected route at '/app/payout').
  const handleStatClick = (route) => {
    if (!route) return;
    const normalized = route === '/pay-out' ? '/payout' : route;
    // ensure route starts with '/'

    const finalPath = `${APP_PREFIX_PATH}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
    navigate(finalPath);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!token) return;

      try {
        setLoadingTransactions(true);

        const response = await axios.get("/users/serviceTransactions");

        const transactions = response.data?.data || [];

        const formattedData = transactions
            .map((item, index) => {
              const bankAccount = item?.extraInfo?.bank_account ?? {};
              const payoutResponse = item?.extraInfo?.payout_response ?? {};

              return {
                key: item.id,
                sn: index + 1,
                customerDetails: item.accountId ?? "-",
                serviceTxnRefId: item.serviceReferenceId ?? "-",
                transactionTime: item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "-",
                gatewayName: "Razorpay",
                orderAmount: item.amount ? `₹${item.amount}` : "-",
                paymentStatus: item.paymentStatus ?? "-",
                payoutAmount: payoutResponse.transferamount
                    ? `₹${payoutResponse.transferamount}`
                    : "-",
                payoutStatus: payoutResponse.status ?? "-",
                beneficiaryAccount: bankAccount.bank_account_number ?? "-",
                beneficiaryIfsc: bankAccount.bank_ifsc ?? "-",
                transactionStatus: item.status ?? "-"
              };
            })
            .reverse();

        setRecentTransactionData(formattedData);
      } catch (error) {
        console.error("❌ Failed to fetch transactions", error);
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [token]); // ✅ token added


  const [visibleCount, setVisibleCount] = useState(10);

  return (
      <>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={24}>
            <Row gutter={[16, 16]}>
              {annualStatisticData.map((elm, i) => (
                  <Col
                      key={i}
                      xs={12}   // 📱 2 boxes per row
                      sm={12}
                      md={8}    // 💻 3 boxes per row
                      lg={8}
                      xl={8}
                      style={{ display: "flex" }} // important for content fit
                  >
                    <div
                        style={{
                          flex: 1,
                          cursor: "pointer",
                          transition: "transform 0.2s",

                        }}
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
          </Col>
          <Col xs={24} sm={24} md={24} lg={6}>


          </Col>
        </Row>
        <Row gutter={16}>


          <Col xs={24} sm={24} md={24} lg={24}>
            <Card title="Latest Transactions" extra={<CardDropdown items={latestTransactionOption} />}>
              <Table
                  columns={tableColumns}
                  dataSource={recentTransactionData.slice(0, visibleCount)}
                  rowKey="key"
                  pagination={false}
                  loading={loadingTransactions}
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