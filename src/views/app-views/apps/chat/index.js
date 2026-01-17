import React, { useEffect, useState, useRef, useMemo } from "react";
import {
	Card,
	Button,
	Empty,
	Row,
	Col,
	Tag,
	Typography,
	Input,
	Select,
	Divider,
	Skeleton
} from "antd";
import axios from "axios";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const API_BASE = "https://test.happypay.live";

const ChildrenByLevel = () => {
	const token = localStorage.getItem("AUTH_TOKEN");

	const [level, setLevel] = useState(1);
	const [loading, setLoading] = useState(false);
	const [children, setChildren] = useState([]);

	// Filters
	const [searchText, setSearchText] = useState("");
	const [kycFilter, setKycFilter] = useState("all"); // all | done | pending
	const [sortOrder, setSortOrder] = useState("new"); // new | old

	const requestIdRef = useRef(0);

	/* ================= FETCH ================= */
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

	/* ================= FILTER + SORT ================= */
	const filteredChildren = useMemo(() => {
		return children
			.filter((user) => {
				const q = searchText.toLowerCase();

				const matchesSearch =
					user.username?.toLowerCase().includes(q) ||
					user.referralCode?.toLowerCase().includes(q);

				const matchesKyc =
					kycFilter === "all"
						? true
						: kycFilter === "done"
							? user.kycDone
							: !user.kycDone;

				return matchesSearch && matchesKyc;
			})
			.sort((a, b) => {
				if (sortOrder === "new") {
					return new Date(b.createdAt) - new Date(a.createdAt);
				}
				return new Date(a.createdAt) - new Date(b.createdAt);
			});
	}, [children, searchText, kycFilter, sortOrder]);

	/* ================= SKELETON UI ================= */
	const SkeletonGrid = () => (
		<Row gutter={[16, 16]}>
			{Array.from({ length: 8 }).map((_, i) => (
				<Col xs={24} sm={12} md={8} lg={6} key={i}>
					<Card style={{ borderRadius: 12 }}>
						<Skeleton
							active
							title={{ width: "60%" }}
							paragraph={{ rows: 2 }}
						/>
					</Card>
				</Col>
			))}
		</Row>
	);

	/* ================= UI ================= */
	return (
		<Card bordered={false} style={{ borderRadius: 12 }}>
			{/* ===== Header ===== */}
			<Title level={4}>Referral Tree – Level {level}</Title>

			<Row gutter={[12, 12]} align="middle">
				<Col xs={24} md={8}>
					<Search
						placeholder="Search username or referral code"
						allowClear
						onChange={(e) => setSearchText(e.target.value)}
					/>
				</Col>

				<Col xs={12} md={4}>
					<Select
						value={kycFilter}
						style={{ width: "100%" }}
						onChange={setKycFilter}
					>
						<Option value="all">All KYC</Option>
						<Option value="done">KYC Done</Option>
						<Option value="pending">KYC Pending</Option>
					</Select>
				</Col>

				<Col xs={12} md={4}>
					<Select
						value={sortOrder}
						style={{ width: "100%" }}
						onChange={setSortOrder}
					>
						<Option value="new">Newest</Option>
						<Option value="old">Oldest</Option>
					</Select>
				</Col>

				<Col xs={24} md={8} style={{ textAlign: "right" }}>
					<Tag color="blue" style={{ padding: "6px 12px", fontSize: 14 }}>
						👥 {filteredChildren.length} Customers
					</Tag>
				</Col>
			</Row>

			<Divider />

			{/* ===== Level Selector ===== */}
			<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
				{[1, 2, 3, 4, 5].map((l) => (
					<Button
						key={l}
						type={level === l ? "primary" : "default"}
						shape="round"
						onClick={() => setLevel(l)}
					>
						Level {l}
					</Button>
				))}
			</div>

			<Divider />

			{/* ===== Content ===== */}
			{loading ? (
				<SkeletonGrid />
			) : filteredChildren.length === 0 ? (
				<Empty description="No users found" />
			) : (
				<Row gutter={[16, 16]} style={{ maxHeight: 520, overflowY: "auto" }}>
					{filteredChildren.map((user) => (
						<Col xs={24} sm={12} md={8} lg={6} key={user.id}>
							<Card hoverable style={{ borderRadius: 12 }}>
								<Title level={5} style={{ marginBottom: 4 }}>
									{user.username}
								</Title>

								<Tag color="geekblue">{user.referralCode}</Tag>

								<div style={{ marginTop: 8 }}>
									<Tag color={user.kycDone ? "green" : "red"}>
										{user.kycDone ? "KYC Verified" : "KYC Pending"}
									</Tag>
								</div>

								<Text type="secondary" style={{ fontSize: 12 }}>
									Joined:{" "}
									{new Date(user.createdAt).toLocaleDateString()}
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
