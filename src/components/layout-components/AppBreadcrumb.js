import React, { Component } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { useSelector } from "react-redux";
import navigationConfig from "configs/NavigationConfig";
import IntlMessage from 'components/util-components/IntlMessage';

/* ---------- Hook Wrapper ---------- */
const BreadcrumbRoute = () => {
	const location = useLocation();
	const userLevel = useSelector(
		(state) => state.profile?.data?.userLevel
	);

	/* ---------- Build breadcrumb map dynamically ---------- */
	let breadcrumbData = {
		'/app': <IntlMessage id="home" />
	};

	const assignBreadcrumb = (obj) => {
		// 🔒 AUTHORITY CHECK
		if (obj.authority && !obj.authority.includes(userLevel)) {
			return;
		}
		breadcrumbData[obj.path] = (
			<IntlMessage id={obj.title} />
		);
	};

	const walkMenu = (items = []) => {
		items.forEach(item => {
			assignBreadcrumb(item);
			if (item.submenu) {
				walkMenu(item.submenu);
			}
		});
	};

	walkMenu(navigationConfig);

	/* ---------- Resolve breadcrumb ---------- */
	const pathSnippets = location.pathname.split('/').filter(i => i);

	const breadcrumbItems = pathSnippets.map((_, index) => {
		const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
		return {
			title: breadcrumbData[url]
				? <Link to={url}>{breadcrumbData[url]}</Link>
				: null
		};
	}).filter(item => item.title !== null);

	return <Breadcrumb items={breadcrumbItems} />;
};

/* ---------- Class Wrapper ---------- */
export class AppBreadcrumb extends Component {
	render() {
		return <BreadcrumbRoute />;
	}
}

export default AppBreadcrumb;
