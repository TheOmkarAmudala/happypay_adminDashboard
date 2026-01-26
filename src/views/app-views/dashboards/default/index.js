import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Button, Avatar, Dropdown, Table, Menu, Tag } from 'antd';
import StatisticWidget from './StatisticWidget';
import ChartWidget from 'components/shared-components/ChartWidget';
import AvatarStatus from 'components/shared-components/AvatarStatus';
import GoalWidget from 'components/shared-components/GoalWidget';
import Card from 'components/shared-components/Card';
import Flex from 'components/shared-components/Flex';
import { AUTH_TOKEN } from "constants/AuthConstant";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { getAnnualStatisticData } from "./DefaultDashboardData";
import axios from "../../../../utils/axios";
import icon from "../../../../assets/img.png";
import StatisticWidgetSkeleton from "./StatisticWidgetSkeleton";
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
import { Skeleton, Grid } from "antd";
import { useSelector } from 'react-redux';




const TableSkeleton = ({ rows = 5 }) => {


  return (
      <div>
        {Array.from({ length: rows }).map((_, i) => (
            <div
                key={i}
                style={{
                  display: "flex",
                  gap: 16,
                  marginBottom: 12,
                }}
            >
              <Skeleton.Input active style={{ width: 40 }} />
              <Skeleton.Input active style={{ width: 180 }} />
              <Skeleton.Input active style={{ width: 200 }} />
              <Skeleton.Input active style={{ width: 160 }} />
              <Skeleton.Input active style={{ width: 120 }} />
              <Skeleton.Input active style={{ width: 120 }} />
            </div>
        ))}
      </div>
  );
};


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
    key: "sn",
    icon: icon,
    width: 40,
  },
  {
    title: "Customer Details",
    dataIndex: "customerDetails",
    key: "customerDetails",
    width: 200,
  },
  {
    title: "Service Txn Ref ID",
    dataIndex: "serviceTxnRefId",
    key: "serviceTxnRefId",
    width: 120,
  },
  {
    title: "Transaction Time",
    dataIndex: "transactionTime",
    key: "transactionTime",
    width: 120,
  },
  {
    title: "Gateway Name",
    dataIndex: "gatewayName",
    key: "gatewayName",
    width: 120,
  },
  {
    title: "Order / PayIn Amount",
    dataIndex: "orderAmount",
    key: "orderAmount",
    width: 120,
  },
  {
    title: "Payment Status",
    dataIndex: "paymentStatus",
    key: "paymentStatus",
    width: 120,
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
    title: "Transaction Status",
    dataIndex: "transactionStatus",
    width: 130,
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
  const {direction} = useSelector(state => state.theme)
  const [recentTransactionData, setRecentTransactionData] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const navigate = useNavigate();
  const token = useSelector(state => state.auth.token);
  const {data: profile, loading} = useSelector(state => state.profile);

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
                transactionStatus: item.status ?? "-"
              };
            });

        setRecentTransactionData(formattedData);
      } catch (error) {
        console.error("❌ Failed to fetch transactions", error);
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [token]);


  const [visibleCount, setVisibleCount] = useState(10);
  const sortedTransactions = useMemo(() => {
    return [...recentTransactionData].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [recentTransactionData]);

  const { useBreakpoint } = Grid;

  const screens = useBreakpoint();
  const isMobile = !screens.md;
  return (
      <>
        {/* ================= DASHBOARD CARDS ================= */}
        <div className="mb-3">
          <Row gutter={[16, 16]}>
            {(loading ? Array.from({length: 6}) : annualStatisticData).map((elm, i) => (
                <Col key={i} xs={12} sm={12} md={6} lg={6} className="flex">
                  <div
                      className={`flex-1 ${loading ? "cursor-default" : "cursor-pointer"} w-full h-[540px] flex`}
                      onClick={() => !loading && handleStatClick(elm.route)}
                  >
                    {loading ? (
                        <StatisticWidgetSkeleton/>
                    ) : (
                        <StatisticWidget
                            title={elm.title}
                            value={elm.value}
                            subtitle={elm.subtitle}
                            icon={elm.icon}
                            iconStyle={elm.iconStyle}
                        />
                    )}
                  </div>
                </Col>
            ))}
          </Row>
        </div>

      {/* ================= TABLE ================= */}
        <div className="px-1 sm:px-2">
          <Row gutter={16}>
            <Col xs={24}>
              <Card
                  title="Latest Transactions"
                  extra={<CardDropdown items={latestTransactionOption} />}
                  className="shadow-sm rounded-xl"
                  bodyStyle={{
                    padding: isMobile ? "12px" : "24px",
                  }}
              >
                {loadingTransactions ? (
                    <TableSkeleton rows={6} />
                ) : (
                    <Table
                        columns={tableColumns}
                        dataSource={sortedTransactions.slice(0, visibleCount)}
                        rowKey="key"
                        pagination={false}
                        size={isMobile ? "small" : "middle"}
                        sticky
                        scroll={{
                          x: "max-content", // 🔥 KEY LINE
                          y: isMobile ? 300 : 420,
                        }}
                    />
                )}


                {!loadingTransactions && (
                    <div
                        className={`flex mt-4 gap-3 ${
                            isMobile ? "flex-col" : "justify-center"
                        }`}
                    >
                      {visibleCount < recentTransactionData.length && (
                          <Button
                              block={isMobile}
                              onClick={() => setVisibleCount((prev) => prev + 10)}
                          >
                            Load More
                          </Button>
                      )}


                      {visibleCount > 10 && (
                          <Button
                              block={isMobile}
                              onClick={() => setVisibleCount(10)}
                          >
                            Load Less
                          </Button>
                      )}
                    </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </>

  );
}
export default DefaultDashboard;

