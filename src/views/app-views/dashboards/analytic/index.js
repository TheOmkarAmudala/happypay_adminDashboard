import React from "react";
import { Card, Row, Col, Tag } from "antd";
import "./commission.css";

/* ---------- Helper ---------- */
const normalizeType = (type) =>
    type && type !== "-" ? type : "Domestic";

/* ---------- Slab Card ---------- */
const SlabCard = ({ title, commissions, maxLimit, rows }) => {
  return (
      <Card className="slab-card" bordered>
        {/* Header */}
        <div className="slab-header">
          <h3 className="slab-title">{title}</h3>

          <div className="slab-badges">
            <Tag color="blue">{commissions} Commissions</Tag>
            <Tag color="geekblue">MAX ₹{maxLimit}</Tag>
          </div>
        </div>

        {/* Table */}
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
                  <td className="muted">
                    {normalizeType(r.type)}
                  </td>
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

/* ---------- Main Component ---------- */
const CommissionSlabs = () => {
  const cards = [
    {
      title: "Slpe Silver Prime EDU",
      commissions: 2,
      maxLimit: "200,000.000",
      rows: [
        { mode: "CC", cardType: "-", network: "-", type: "Domestic", total: "1.34%" },
        { mode: "CC", cardType: "-", network: "-", type: "Corporate", total: "1.80%" }
      ]
    },
    {
      title: "Slpe Silver Edu Lite",
      commissions: 2,
      maxLimit: "95,000.000",
      rows: [
        { mode: "CC", cardType: "-", network: "-", type: "-", total: "1.23%" },
        { mode: "CC", cardType: "-", network: "-", type: "Corporate", total: "1.80%" }
      ]
    },
    {
      title: "Slpe Silver Edu",
      commissions: 1,
      maxLimit: "50,000.000",
      rows: [
        { mode: "CC", cardType: "-", network: "-", type: "-", total: "1.65%" }
      ]
    },
    {
      title: "Slpe Gold Travel",
      commissions: 1,
      maxLimit: "100,000.000",
      rows: [
        { mode: "CC", cardType: "-", network: "-", type: "-", total: "1.40%" }
      ]
    },
    {
      title: "Slpe Gold Travel Lite",
      commissions: 1,
      maxLimit: "100,000.000",
      rows: [
        { mode: "CC", cardType: "-", network: "-", type: "-", total: "1.55%" }
      ]
    },
    {
      title: "Slpe Gold Travel Prime",
      commissions: 2,
      maxLimit: "40,000.000",
      rows: [
        { mode: "CC", cardType: "-", network: "-", type: "Consumer", total: "1.33%" },
        { mode: "CC", cardType: "-", network: "-", type: "Business", total: "1.80%" }
      ]
    }
  ];

  return (
      <Row gutter={[16, 16]}>
        {cards.map((card, index) => (
            <Col
                key={index}
                xs={24}
                sm={24}
                md={12}
                lg={12}
                xl={12}
            >
              <SlabCard {...card} />
            </Col>
        ))}
      </Row>
  );
};

export default CommissionSlabs;
