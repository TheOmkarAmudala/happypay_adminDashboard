/** @jsxImportSource @emotion/react */
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { TEMPLATE } from "constants/ThemeConstant";
import {
	MenuFoldOutlined,
	MenuUnfoldOutlined
} from "@ant-design/icons";

import Logo from "../Logo";
import NavNotification from "../NavNotification";
import NavProfile from "../NavProfile";
import NavPanel from "../NavPanel";

import Header from "./Header";
import HeaderWrapper from "./HeaderWrapper";
import Nav from "./Nav";
import NavEdge from "./NavEdge";
import NavItem from "../NavItem";

import {
	toggleCollapsedNav,
	onMobileNavToggle
} from "store/slices/themeSlice";

import {
	NAV_TYPE_TOP,
	SIDE_NAV_COLLAPSED_WIDTH,
	SIDE_NAV_WIDTH
} from "constants/ThemeConstant";

import utils from "utils";

// Social Icons
import { FaWhatsapp, FaTelegramPlane, FaFacebookF } from "react-icons/fa";

export const HeaderNav = (props) => {
	const { isMobile } = props;
	const dispatch = useDispatch();

	const navCollapsed = useSelector((state) => state.theme.navCollapsed);
	const mobileNav = useSelector((state) => state.theme.mobileNav);
	const navType = useSelector((state) => state.theme.navType);
	const headerNavColor = useSelector((state) => state.theme.headerNavColor);
	const currentTheme = useSelector((state) => state.theme.currentTheme);
	const direction = useSelector((state) => state.theme.direction);

	const isNavTop = navType === NAV_TYPE_TOP;
	const isDarkTheme = currentTheme === "dark";

	const navMode = useMemo(() => {
		if (!headerNavColor) {
			return utils.getColorContrast(
				isDarkTheme ? "#000000" : "#ffffff"
			);
		}
		return utils.getColorContrast(headerNavColor);
	}, [isDarkTheme, headerNavColor]);

	const navBgColor = isDarkTheme
		? TEMPLATE.HEADER_BG_DEFAULT_COLOR_DARK
		: TEMPLATE.HEADER_BG_DEFAULT_COLOR_LIGHT;

	const onToggle = () => {
		if (!isMobile) {
			dispatch(toggleCollapsedNav(!navCollapsed));
		} else {
			dispatch(onMobileNavToggle(!mobileNav));
		}
	};

	const getNavWidth = () => {
		if (isNavTop || isMobile) return "0px";
		return navCollapsed
			? `${SIDE_NAV_COLLAPSED_WIDTH}px`
			: `${SIDE_NAV_WIDTH}px`;
	};

	return (
		<Header
			isDarkTheme={isDarkTheme}
			headerNavColor={headerNavColor || navBgColor}
		>
			<HeaderWrapper isNavTop={isNavTop}>
				<Logo logoType={navMode} />

				<Nav navWidth={getNavWidth()}>

					{/* LEFT SIDE */}
					<NavEdge left>
						{isNavTop && !isMobile ? null : (
							<NavItem onClick={onToggle} mode={navMode}>
								{navCollapsed || isMobile ? (
									<MenuUnfoldOutlined className="nav-icon" />
								) : (
									<MenuFoldOutlined className="nav-icon" />
								)}
							</NavItem>
						)}
					</NavEdge>

					{/* RIGHT SIDE – ALL ICONS */}
					<NavEdge right>

						{/* WhatsApp */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 14,
								marginRight: 12
							}}
						>
							{/* WhatsApp */}
							<NavItem
								mode={navMode}
								onClick={() => window.open("https://whatsapp.com/channel/0029VbBae4sIN9iec7Y49s2k))", "_blank")}
							>
								<FaWhatsapp
									className="nav-icon"
									style={{ color: "#25D366", fontSize: 18 }}
								/>
							</NavItem>

							{/* Telegram */}
							<NavItem
								mode={navMode}
								onClick={() => window.open("https://t.me/buddica", "_blank")}
							>
								<FaTelegramPlane
									className="nav-icon"
									style={{ color: "#229ED9", fontSize: 18 }}
								/>
							</NavItem>
						</div>

						{/* Notifications */}
						<NavNotification mode={navMode} />

						{/* Profile */}
						<NavProfile mode={navMode} />

					</NavEdge>
				</Nav>
			</HeaderWrapper>
		</Header>
	);
};

export default HeaderNav;