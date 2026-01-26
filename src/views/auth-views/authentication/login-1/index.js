import React from "react";
import LoginForm from "../../components/LoginForm";
import { Row, Col, Typography, Grid } from "antd";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";

import logo from "assets/logo.png";
import applogo from "../../../../assets/app-logo.png";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const LoginOne = (props) => {
	const screens = useBreakpoint();
	const isDesktop = screens.lg;

	const sharedBackground =
		"linear-gradient(135deg, #1E63E9 0%, #6432ff 50%, #00d4ff 100%)";

	return (
		<div
			style={{
				minHeight: "100vh",
				width: "100%",
				background: "#fff",
			}}
		>
			<Row style={{ minHeight: "100vh", margin: 0 }}>

				{/* ================= DESKTOP HERO ONLY ================= */}
				{isDesktop && (
					<Col
						lg={10}
						style={{
							background: sharedBackground,
							display: "flex",
							alignItems: "center",
							padding: "0 10%",
							position: "relative",
							overflow: "hidden",
						}}
					>
						{/* Ambient glow */}
						<motion.div
							animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
							transition={{ duration: 20, repeat: Infinity }}
							style={{
								position: "absolute",
								top: "-10%",
								left: "-10%",
								width: "400px",
								height: "400px",
								background: "rgba(255,255,255,0.1)",
								borderRadius: "50%",
								filter: "blur(80px)",
							}}
						/>

						<motion.div
							initial={{ opacity: 0, x: -30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							style={{ zIndex: 2 }}
						>
							{/* App icon */}
							<div
								style={{
									width: "110px",
									height: "110px",
									background: "rgba(255,255,255,0.15)",
									backdropFilter: "blur(12px)",
									borderRadius: "30% 70% 70% 30%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									marginBottom: "48px",
									border: "1px solid rgba(255,255,255,0.4)",
									boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
								}}
							>
								<img src={applogo} alt="app-logo" style={{ width: "65px" }} />
							</div>

							<Title
								level={1}
								style={{
									color: "#fff",
									fontSize: "3.2rem",
									fontWeight: 800,
									lineHeight: 1.1,
									margin: 0,
								}}
							>
								<TypeAnimation
									sequence={[
										"Welcome to HappyPay.", 2000,
										"Agent Dashboard.", 2000,
										"Happy Earnings.", 2000,
									]}
									speed={50}
									repeat={Infinity}
								/>
							</Title>

							<Title
								level={4}
								style={{
									color: "rgba(255,255,255,0.85)",
									marginTop: "20px",
								}}
							>
								Empowering your financial journey with every transaction.
							</Title>
						</motion.div>
					</Col>
				)}

				{/* ================= FORM (MOBILE FIRST) ================= */}
				<Col
					xs={24}
					lg={14}
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						padding: "20px",
						background: "#fff",
					}}
				>
					<div
						style={{
							width: "100%",
							maxWidth: "400px",
							textAlign: isDesktop ? "left" : "center",
						}}
					>
						{/* Logo */}
						<motion.img
							src={logo}
							alt="logo"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							style={{
								width: isDesktop ? "180px" : "120px",
								marginBottom: "16px",
							}}
						/>

						{/* Login header */}
						<Title level={2} style={{ fontWeight: 800, marginBottom: "4px" }}>
							Login
						</Title>

						<Text type="secondary">
							New here?
							<a
								href="/auth/register-1"
								style={{
									marginLeft: "6px",
									fontWeight: 700,
									color: "#1E63E9",
								}}
							>
								Create an account
							</a>
						</Text>

						{/* Login Form */}
						<div style={{ marginTop: "28px" }}>
							<LoginForm {...props} />
						</div>
					</div>
				</Col>
			</Row>
		</div>
	);
};

export default LoginOne;