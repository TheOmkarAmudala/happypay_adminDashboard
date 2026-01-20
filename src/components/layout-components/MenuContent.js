import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Grid } from 'antd';
import IntlMessage from '../util-components/IntlMessage';
import Icon from '../util-components/Icon';
import navigationConfig from 'configs/NavigationConfig';
import { useSelector, useDispatch } from 'react-redux';
import { SIDE_NAV_LIGHT, NAV_TYPE_SIDE } from "constants/ThemeConstant";
import utils from 'utils';
import { onMobileNavToggle } from 'store/slices/themeSlice';

const { useBreakpoint } = Grid;

/* ---------- Helpers ---------- */
const setLocale = (localeKey, isLocaleOn = true) =>
	isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

const setDefaultOpen = (key) => {
	let keyList = [];
	let keyString = "";
	if (key) {
		const arr = key.split("-");
		for (let i = 0; i < arr.length; i++) {
			keyString = i === 0 ? arr[i] : `${keyString}-${arr[i]}`;
			keyList.push(keyString);
		}
	}
	return keyList;
};

/* ---------- Menu Item ---------- */
const MenuItem = ({ title, icon, path }) => {
	const dispatch = useDispatch();
	const isMobile = !utils.getBreakPoint(useBreakpoint()).includes('lg');

	const closeMobileNav = () => {
		if (isMobile) dispatch(onMobileNavToggle(false));
	};

	return (
		<>
			{icon && <Icon type={icon} />}
			<span>{setLocale(title)}</span>
			{path && <Link to={path} onClick={closeMobileNav} />}
		</>
	);
};

/* ---------- 🔒 AUTHORITY FILTER ---------- */
const filterByAuthority = (items, userLevel) => {
	return items
		.filter(item => {
			if (!item.authority) return true;
			return item.authority.includes(userLevel);
		})
		.map(item => ({
			...item,
			submenu: item.submenu
				? filterByAuthority(item.submenu, userLevel)
				: []
		}));
};

/* ---------- Builders ---------- */
const getSideNavMenuItem = (navItem) =>
	navItem.map(nav => ({
		key: nav.key,
		label: (
			<MenuItem
				title={nav.title}
				{...(nav.isGroupTitle ? {} : { path: nav.path, icon: nav.icon })}
			/>
		),
		...(nav.isGroupTitle ? { type: 'group' } : {}),
		...(nav.submenu?.length ? { children: getSideNavMenuItem(nav.submenu) } : {})
	}));

const getTopNavMenuItem = (navItem) =>
	navItem.map(nav => ({
		key: nav.key,
		label: (
			<MenuItem
				title={nav.title}
				icon={nav.icon}
				{...(nav.isGroupTitle ? {} : { path: nav.path })}
			/>
		),
		...(nav.submenu?.length ? { children: getTopNavMenuItem(nav.submenu) } : {})
	}));

/* ---------- Side Nav ---------- */
const SideNavContent = (props) => {
	const { routeInfo, hideGroupTitle, sideNavTheme = SIDE_NAV_LIGHT } = props;
	const userLevel = useSelector(state => state.profile?.data?.userLevel);

	const filteredNav = useMemo(
		() => filterByAuthority(navigationConfig, userLevel),
		[userLevel]
	);

	const menuItems = useMemo(
		() => getSideNavMenuItem(filteredNav),
		[filteredNav]
	);

	return (
		<Menu
			mode="inline"
			theme={sideNavTheme === SIDE_NAV_LIGHT ? "light" : "dark"}
			style={{ height: "100%", borderInlineEnd: 0 }}
			defaultSelectedKeys={[routeInfo?.key]}
			defaultOpenKeys={setDefaultOpen(routeInfo?.key)}
			className={hideGroupTitle ? "hide-group-title" : ""}
			items={menuItems}
		/>
	);
};

/* ---------- Top Nav ---------- */
const TopNavContent = () => {
	const topNavColor = useSelector(state => state.theme.topNavColor);
	const userLevel = useSelector(state => state.profile?.data?.userLevel);

	const filteredNav = useMemo(
		() => filterByAuthority(navigationConfig, userLevel),
		[userLevel]
	);

	const menuItems = useMemo(
		() => getTopNavMenuItem(filteredNav),
		[filteredNav]
	);

	return (
		<Menu
			mode="horizontal"
			style={{ backgroundColor: topNavColor }}
			items={menuItems}
		/>
	);
};

/* ---------- Export ---------- */
const MenuContent = (props) =>
	props.type === NAV_TYPE_SIDE
		? <SideNavContent {...props} />
		: <TopNavContent {...props} />;

export default MenuContent;
