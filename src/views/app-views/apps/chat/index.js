import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Spin, Empty, Row, Col, Tag, Typography } from "antd";
import axios from "axios";

const { Title, Text } = Typography;

const API_BASE = "https://test.happypay.live";

const ChildrenByLevel = () => {
	const token = localStorage.getItem("AUTH_TOKEN");

	const [level, setLevel] = useState(1);
	const [loading, setLoading] = useState(false);
	const [children, setChildren] = useState([]);
	const requestIdRef = useRef(0);
	const customerCount = children.length;



	const fetchChildren = async (selectedLevel) => {
		const currentRequestId = ++requestIdRef.current;
		setLoading(true);

		try {
			const res = await axios.get(
				`${API_BASE}/users/getChildren?level=${selectedLevel}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			// ❗ Ignore outdated responses
			if (currentRequestId !== requestIdRef.current) return;

			setChildren(res.data?.data || []);
		} catch (err) {
			if (currentRequestId !== requestIdRef.current) return;
			setChildren([]);
		} finally {
			if (currentRequestId === requestIdRef.current) {
				setLoading(false);
			}
		}
	};


	useEffect(() => {
		fetchChildren(level);
	}, [level]);

	return (
		<Card
			bordered={false}
			style={{ borderRadius: 12 }}
			bodyStyle={{ padding: 20 }}
		>
			{/* ===== Header ===== */}
			<div style={{ marginBottom: 16 }}>
				<Title level={4} style={{ marginBottom: 8 }}>
					Referral Tree – Level {level}
				</Title>

				<Row
					justify="space-between"
					align="middle"
					style={{ marginTop: 12 }}
				>
					{/* Left side: hint */}
					<Col>
    <span style={{ color: "#8c8c8c", fontSize: 13 }}>
      Showing results based on selected filters
    </span>
					</Col>

					{/* Right side: count */}
					<Col>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								background: "#f0f5ff",
								padding: "6px 14px",
								borderRadius: 20,
								fontWeight: 600,
								color: "#1d39c4",
								fontSize: 14
							}}
						>
							👥 {customerCount} Customers
						</div>
					</Col>
				</Row>


				{/* ===== Level Selector ===== */}
				<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
					{[1, 2, 3, 4, 5].map((l) => (
						<Button
							key={l}
							type={level === l ? "primary" : "default"}
							shape="round"
							size="middle"
							onClick={() => setLevel(l)}
						>
							Level {l}
						</Button>
					))}
				</div>
			</div>

			{/* ===== Content ===== */}
			{loading ? (
				<div style={{ textAlign: "center", padding: 40 }}>
					<Spin size="large" />
				</div>
			) : children.length === 0 ? (
				<Empty description="No users found for this level" />
			) : (
				<Row gutter={[16, 16]} style={{ maxHeight: 500, overflowY: "auto" }}>
					{children.map((user) => (
						<Col xs={24} sm={12} md={8} lg={6} key={user.id}>
							<Card
								hoverable
								style={{ borderRadius: 10 }}
								bodyStyle={{ padding: 14 }}
							>
								<Text strong>{user.username}</Text>
								<br />
								<Tag color="blue" style={{ marginTop: 6 }}>
									{user.referralCode}
								</Tag>
								<br />
								<Text type="secondary" style={{ fontSize: 12 }}>
									Joined: {new Date(user.createdAt).toLocaleDateString()}
								</Text>
							</Card>
						</Col>
					))}
				</Row>
			)}
		</Card>
	);
};

export default ChildrenByLevel;
