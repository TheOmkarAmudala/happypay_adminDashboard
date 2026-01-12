import React from "react";
import { Card, Row, Col, Tag } from "antd";
import "./commission.css";

const parseRate = (val) => {
  if (!val) return { domestic: "-", corporate: "-" };
  if (val.includes("/")) {
    const [d, c] = val.split("/").map(v => v.trim());
    return { domestic: d, corporate: c };
  }
  return { domestic: val, corporate: "-" };
};

const RateCell = ({ value }) => {
  const { domestic, corporate } = parseRate(value);
  return (
      <div className="rate-cell">
        <span className="domestic">{domestic}</span>
        {corporate !== "-" && <span className="corporate">/ {corporate}</span>}
      </div>
  );
};

const SlabCard = ({ title, commissions, maxLimit, rows }) => (
    <Card className="slab-card">
      <div className="slab-header">
        <h4>{title}</h4>
        <div className="badges">
          <Tag color="red">{commissions} Commissions</Tag>
          <Tag color="red">MAX Limit ₹{maxLimit}</Tag>
        </div>
      </div>

      <table className="slab-table">
        <thead>
        <tr>
          <th>Role</th>
          <th>Total (%)</th>
        </tr>
        </thead>
        <tbody>
        {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.role}</td>
              <td><RateCell value={r.rate} /></td>
            </tr>
        ))}
        </tbody>
      </table>
    </Card>
);

const CommissionSlabs = () => {
  const education = [
    {
      title: "Silver Prime Edu",
      commissions: 2,
      maxLimit: "2,00,000",
      rows: [
        { role: "HappyPay Admin", rate: "1.34% / 1.80%" },
        { role: "Enterprise Partner", rate: "1.36% / 1.83%" },
        { role: "Super Distributor", rate: "1.37% / 1.83%" },
        { role: "Master Distributor", rate: "1.39% / 1.85%" },
        { role: "Distributor", rate: "1.41% / 1.87%" },
        { role: "Retailer", rate: "1.44% / 1.90%" }
      ]
    },
    {
      title: "Silver Edu Lite",
      commissions: 2,
      maxLimit: "95,000",
      rows: [
        { role: "HappyPay Admin", rate: "1.23% / 1.80%" },
        { role: "Enterprise Partner", rate: "1.29% / 1.83%" },
        { role: "Super Distributor", rate: "1.30% / 1.83%" },
        { role: "Master Distributor", rate: "1.33% / 1.85%" },
        { role: "Distributor", rate: "1.35% / 1.87%" },
        { role: "Retailer", rate: "1.38% / 1.90%" }
      ]
    }
  ];

  const travel = [
    {
      title: "Gold Travel Prime",
      commissions: 2,
      maxLimit: "40,000",
      rows: [
        { role: "HappyPay Admin", rate: "1.33% / 1.80%" },
        { role: "Enterprise Partner", rate: "1.37% / 1.85%" },
        { role: "Super Distributor", rate: "1.38% / 1.86%" },
        { role: "Master Distributor", rate: "1.40% / 1.88%" },
        { role: "Distributor", rate: "1.42% / 1.90%" },
        { role: "Retailer", rate: "1.45% / 1.93%" }
      ]
    },
    {
      title: "Gold Travel Fast",
      commissions: 2,
      maxLimit: "1,00,000",
      rows: [
        { role: "HappyPay Admin", rate: "1.38% / 1.65%" },
        { role: "Enterprise Partner", rate: "1.42% / 1.72%" },
        { role: "Super Distributor", rate: "1.43% / 1.73%" },
        { role: "Master Distributor", rate: "1.45% / 1.75%" },
        { role: "Distributor", rate: "1.47% / 1.77%" },
        { role: "Retailer", rate: "1.50% / 1.80%" }
      ]
    }
  ];

  return (
      <Row gutter={16}>
        <Col span={12}>
          {education.map((e, i) => <SlabCard key={i} {...e} />)}
        </Col>

        <Col span={12}>
          {travel.map((t, i) => <SlabCard key={i} {...t} />)}
        </Col>
      </Row>
  );
};

export default CommissionSlabs;
