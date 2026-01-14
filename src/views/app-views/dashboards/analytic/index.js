import React from "react";
import { Card, Row, Col, Tag } from "antd";
import "./commission.css";
const SlabCard = ({ title, commissions, maxLimit, rows }) => {
  return (
      <div className="slab-wrap">
        <Card className="slab-card">
          <div className="slab-header">
            <h3 className="slab-title">{title}</h3>
            <div className="slab-badges">
              <Tag>{commissions} Commissions</Tag>
              <Tag>MAX Limit ₹{maxLimit}</Tag>
            </div>
          </div>

          <table className="slab-table">
            <thead>
            <tr>
              <th>MODE</th>
              <th>CARD TYPE</th>
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
                  <td>{r.type}</td>
                  <td><span className="rate-pill">{r.total}</span></td>
                </tr>
            ))}
            </tbody>
          </table>
        </Card>
      </div>
  );
};

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
        { mode: "CC", cardType: "-", network: "-", type: "Domestic", total: "1.23%" },
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
    },
    {
      title: "Slpe Gold Travel Pure",
      commissions: 2,
      maxLimit: "50,000.000",
      rows: [
        { mode: "CC", cardType: "-", network: "-", type: "Consumer", total: "1.33%" },
        { mode: "CC", cardType: "-", network: "-", type: "Business", total: "1.80%" }
      ]
    },
    {
      title: "Slpe Gold Travel Fast",
      commissions: 2,
      maxLimit: "100,000.000",
      rows: [
        { mode: "CC", cardType: "-", network: "-", type: "Domestic", total: "1.38%" },
        { mode: "CC", cardType: "-", network: "-", type: "Corporate", total: "1.65%" }
      ]
    }
  ];



  return (
      <Row gutter={[16, 16]}>
        {cards.map((card, index) => (
            <Col span={12} key={index}>
              <SlabCard {...card} />
            </Col>
        ))}
      </Row>
  );
};

export default CommissionSlabs;
