import { ComponentType } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { UserContainer } from 'src/container/user';
import { useAuth } from 'src/util/hooks';

interface AuthRouteProps {
  path: string;
  component: ComponentType;
  guestOnly?: boolean;
}

export function AuthRoute({ path, component: Component, guestOnly }: AuthRouteProps) {
  const { authenticated, twoFactorAuthenticated } = useAuth();
  const { isMeLoading } = UserContainer.useContext();

  return (
    <Route
      path={path}
      render={({ location }) => {
        if (guestOnly && authenticated) {
          return <Redirect to={{ pathname: '/', state: { from: location } }} />;
        }
        if (!guestOnly && !authenticated) {
          return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
        }

        // FIXME: 2차인증 사용하지않아도 페이지 나오는 현상 수정 후 주석해제가 필요합니다.
        // if (
        //   !guestOnly &&
        //   authenticated &&
        //   !twoFactorAuthenticated &&
        //   !isMeLoading &&
        //   location.pathname !== '/two-factor'
        // ) {
        //   return <Redirect to={{ pathname: '/two-factor', state: { from: location } }} />;
        // }

        // if (authenticated && twoFactorAuthenticated && location.pathname == '/two-factor') {
        //   return <Redirect to={{ pathname: '/', state: { from: location } }} />;
        // }
        // @ts-ignore
        return <Component />;
      }}
    />
  );
}
