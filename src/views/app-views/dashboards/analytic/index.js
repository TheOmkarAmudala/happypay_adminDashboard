import React from "react";
import { Card, Row, Col, Tag } from "antd";
import { useSelector } from "react-redux";
import "./commission.css";

/* ---------- Helper ---------- */
const normalizeType = (type) =>
    type && type !== "-" ? type : "Domestic";

/* ---------- Slab Card ---------- */
const SlabCard = ({ title, commissions, maxLimit, rows }) => {
  return (
      <Card className="slab-card" bordered>
        <div className="slab-header">
          <h3 className="slab-title">{title}</h3>
          <div className="slab-badges">
            <Tag color="blue">{commissions} Commissions</Tag>
            <Tag color="geekblue">MAX ₹{maxLimit}</Tag>
          </div>
        </div>

        <div className="slab-table-wrap">
          <table className="slab-table">
            <thead>
            <tr>
              <th>MODE</th>
              <th>CARD</th>
              <th>NETWORK</th>
              <th>TYPE</th>
              <th>TOTAL (%)</th>
            </tr>
            </thead>
            <tbody>
            {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.mode}</td>
                  <td>{r.cardType}</td>
                  <td>{r.network}</td>
                  <td className="muted">{normalizeType(r.type)}</td>
                  <td>
                    <span className="rate-pill">{r.total}</span>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </Card>
  );
};

/* ---------- COMMISSION SOURCE (from Excel) ---------- */
const COMMISSION_DATA = [
  {
    title: "Slpe Silver Prime EDU",
    maxLimit: "200,000",
    values: [
      ["1.34%", "1.80%"], // Admin
      ["1.38%", "1.83%"], // Enterprise
      ["1.39%", "1.83%"], // Super Distributor
      ["1.40%", "1.85%"], // Master
      ["1.42%", "1.87%"], // Distributor
      ["1.45%", "1.90%"]  // Retailer
    ],
    types: ["Domestic", "Corporate"]
  },
  {
    title: "Slpe Silver Edu Lite",
    maxLimit: "95,000",
    values: [
      ["1.23%", "1.80%"],
      ["1.29%", "1.83%"],
      ["1.32%", "1.83%"],
      ["1.33%", "1.85%"],
      ["1.35%", "1.87%"],
      ["1.40%", "1.90%"]
    ],
    types: ["Domestic", "Corporate"]
  },
  {
    title: "Slpe Silver Edu",
    maxLimit: "50,000",
    values: [
      ["1.65%"],
      ["1.70%"],
      ["1.71%"],
      ["1.73%"],
      ["1.75%"],
      ["1.78%"]
    ],
    types: ["Domestic"]
  },
  {
    title: "Slpe Gold Travel",
    maxLimit: "100,000",
    values: [
      ["1.40%"],
      ["1.45%"],
      ["1.46%"],
      ["1.48%"],
      ["1.50%"],
      ["1.53%"]
    ],
    types: ["Domestic"]
  },
  {
    title: "Slpe Gold Travel Lite",
    maxLimit: "100,000",
    values: [
      ["1.55%"],
      ["1.59%"],
      ["1.60%"],
      ["1.62%"],
      ["1.64%"],
      ["1.67%"]
    ],
    types: ["Domestic"]
  },
  {
    title: "Slpe Gold Travel Prime",
    maxLimit: "40,000",
    values: [
      ["1.33%", "1.80%"],
      ["1.37%", "1.85%"],
      ["1.38%", "1.88%"],
      ["1.40%", "1.88%"],
      ["1.42%", "1.90%"],
      ["1.45%", "1.93%"]
    ],
    types: ["Consumer", "Business"]
  },
  {
    title: "SLPE Ocean Pay",
    maxLimit: "40,000",
    values: [
      ["1.33%", "1.80%"],
      ["1.37%", "1.85%"],
      ["1.38%", "1.88%"],
      ["1.40%", "1.88%"],
      ["1.42%", "1.90%"],
      ["1.45%", "1.93%"]
    ],
    types: ["Consumer", "Business"]
  }
];

/* ---------- Main Component ---------- */
const CommissionSlabs = () => {
  let userLevel = useSelector(
      (state) => state.profile?.data?.userLevel
  );

  // make sure userLevel is a number and fallback to 2 (safe default)
  const ul = Number(userLevel) || 2;
  const roleIndex = Math.max(0, Math.min(5, 7 - ul));

  return (
      <Row gutter={[16, 16]}>
        {COMMISSION_DATA.map((card, idx) => {
          // guard: ensure we have a values row for roleIndex
          const safeIndex = Math.max(0, Math.min(card.values.length - 1, roleIndex));
          const ratesRow = card.values[safeIndex] || card.values[0] || [];

          const rows = ratesRow.map((rate, i) => ({
            mode: "CC",
            cardType: "-",
            network: "-",
            type: card.types && card.types[i] ? card.types[i] : "-",
            total: rate
          }));

          return (
              <Col key={idx} xs={24} md={12}>
                <SlabCard
                    title={card.title}
                    commissions={rows.length}
                    maxLimit={card.maxLimit}
                    rows={rows}
                />
              </Col>
          );
        })}
      </Row>
  );
};

export default CommissionSlabs;
