import { SideNavigation, SideNavigationProps } from '@cloudscape-design/components';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: SideNavigationProps['items'] = [
    { type: 'link', text: 'Dashboard', href: '/' },
    { type: 'link', text: 'Accept/Pay Fees', href: '/fees' },
    { type: 'link', text: 'Course Catalog', href: '/courses' },
    { type: 'link', text: 'My Schedule', href: '/schedule' },
    { type: 'divider' },
    {
      type: 'link',
      text: 'Profile',
      href: '/profile',
    },
  ];

  return (
    <SideNavigation
      activeHref={location.pathname}
      header={{ text: 'BannerWeb', href: '/' }}
      items={navItems}
      onFollow={(event) => {
        if (!event.detail.external) {
          event.preventDefault();
          navigate(event.detail.href);
        }
      }}
    />
  );
};

export default Navigation;
