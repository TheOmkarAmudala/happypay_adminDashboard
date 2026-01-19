import React, {useEffect, useState } from 'react';
import { Dropdown, Avatar } from 'antd';
import { useDispatch } from 'react-redux';
import {
	EditOutlined,
	SettingOutlined,
	QuestionCircleOutlined,
	LogoutOutlined,
	IdcardOutlined
} from '@ant-design/icons';

import NavItem from './NavItem';
import Flex from 'components/shared-components/Flex';
import { signOut } from 'store/slices/authSlice';
import styled from '@emotion/styled';
import {
	FONT_WEIGHT,
	MEDIA_QUERIES,
	SPACER,
	FONT_SIZES
} from 'constants/ThemeConstant';

import KycModal from './Kycmodel';

const Icon = styled.div(() => ({
	fontSize: FONT_SIZES.LG
}));

const Profile = styled.div(() => ({
	display: 'flex',
	alignItems: 'center'
}));

const UserInfo = styled('div')`
	padding-left: ${SPACER[2]};

	@media ${MEDIA_QUERIES.MOBILE} {
		display: none;
	}
`;

const Name = styled.div(() => ({
	fontWeight: FONT_WEIGHT.SEMIBOLD
}));

const Title = styled.span(() => ({
	opacity: 0.8
}));



const MenuItem = ({ path, label, icon }) => (
	<Flex as="a" href={path} alignItems="center" gap={SPACER[2]}>
		<Icon>{icon}</Icon>
		<span>{label}</span>
	</Flex>
);

const MenuItemSignOut = ({ label }) => {
	const dispatch = useDispatch();

	return (


		<div onClick={() => dispatch(signOut())}>
			<Flex alignItems="center" gap={SPACER[2]}>
				<Icon>
					<LogoutOutlined />
				</Icon>
				<span>{label}</span>
			</Flex>
		</div>
	);
};

export const NavProfile = ({ mode }) => {
	const [kycOpen, setKycOpen] = useState(false);

	const items = [
		{
			key: 'Profile',
			label: (
				<div onClick={() => setKycOpen(true)}>
					<Flex alignItems="center" gap={SPACER[2]}>
						<Icon>
							<IdcardOutlined />
						</Icon>
						<span>Profile</span>
					</Flex>
				</div>
			)
		},
		{
			key: 'EditProfile',
			label: (
				<MenuItem
					path="/"
					label="Edit Profile"
					icon={<EditOutlined />}
				/>
			)
		},
		{
			key: 'AccountSetting',
			label: (
				<MenuItem
					path="/"
					label="Account Setting"
					icon={<SettingOutlined />}
				/>
			)
		},
		{
			key: 'HelpCenter',
			label: (
				<MenuItem
					path="/"
					label="Help Center"
					icon={<QuestionCircleOutlined />}
				/>
			)
		},
		{
			key: 'SignOut',
			label: <MenuItemSignOut label="Sign Out" />
		}
	];
	const [userName, setUserName] = useState("User");
	const [isVerifiedUser, setIsVerifiedUser] = useState(false);
	useEffect(() => {
		const fetchKycInfo = async () => {
			try {
				const token = localStorage.getItem("AUTH_TOKEN");

				const res = await fetch(
					"https://test.happypay.live/users/kyc",
					{
						headers: {
							Authorization: `Bearer ${token}`
						}
					}
				);

				const json = await res.json();
				const data = json?.data || [];

				const aadhaar = data.find(k => k.type === "aadhaar");
				const pan = data.find(k => k.type === "pan");

				// ---- NAME (priority: Aadhaar → PAN)
				const name =
					aadhaar?.response?.name ||
					pan?.response?.registered_name ||
					"User";

				setUserName(name);

				// ---- VERIFIED STATUS
				const isVerified =
					aadhaar?.verified === true &&
					pan?.verified === true;

				setIsVerifiedUser(isVerified);

			} catch (err) {
				console.error("Failed to fetch KYC info", err);
				setIsVerifiedUser(false);
			}
		};

		fetchKycInfo();
	}, []);



	return (
		<>
			<Dropdown placement="bottomRight" menu={{ items }} trigger={['click']}>
				<NavItem mode={mode}>
					<Profile>
						<Avatar src="/img/avatars/thumb-1.jpg" />
						<UserInfo className="profile-text">
							<Name>{userName}</Name>

							<Title>
								{isVerifiedUser ? "Verified User" : "Unverified User"}
							</Title>
						</UserInfo>
					</Profile>
				</NavItem>
			</Dropdown>

			<KycModal open={kycOpen} onClose={() => setKycOpen(false)} />
		</>
	);
};

export default NavProfile;