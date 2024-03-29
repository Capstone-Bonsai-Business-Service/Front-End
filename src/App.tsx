import React, { useState } from 'react';
import './App.scss';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { IUser } from './IApp.interface';
import { AdminInitLanding } from './app/administration/administration-init-landing';
import { PageNotFound } from './app/not-found-page/not-found-page';
import { AdminPage } from './app/administration/administration-page';
import { Toaster } from 'react-hot-toast';
import { AccountDetailPage } from './app/administration/administration-account-detail';
import { OwnerPage } from './app/owner/owner-page';
import { OwnerInitLanding } from './app/owner/owner-init-landing';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
} from 'chart.js';
import { GlobalSettings } from './app/global-settings';
import { LoginPage } from './app/common/components/login.component';
import { ManagerInitLanding } from './app/manager/manager-init-landing';
import { ManagerPage } from './app/manager/manager-page';
import './styles/global.style.scss';
import { OwnerPage as ManagerPageV2 } from './app/owner-v2/owner-page';
import { OwnerInitLanding as ManagerLandingV2 } from './app/owner-v2/owner-init-landing';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController,
  BarController,
  ArcElement
);

function App() {
  const userInStorage = localStorage.getItem('user');

  const [currentUser, setCurrentUser]: [IUser | undefined, any] = useState(userInStorage ? JSON.parse(userInStorage) : null);

  const globalSettings = new GlobalSettings();
  
  const onLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  }


  const rootRouter = createBrowserRouter([
    {
      path: '/administration',
      element: currentUser && currentUser.roleName === 'Admin' ? <AdminPage onLogoutCallback={onLogout} currentUser={currentUser} globalSettings={globalSettings} /> : <AdminInitLanding currentUser={currentUser} />,
    },
    {
      path: '/administration/account/:id',
      element: currentUser && currentUser.roleName === 'Admin' ? <AccountDetailPage currentUser={currentUser} /> : <AdminInitLanding currentUser={currentUser} />,
    },
    {
      path: '/administration-login',
      element: currentUser && currentUser.roleName === 'Admin' ? <AdminInitLanding currentUser={currentUser} /> : <LoginPage onSaveUserLogin={(user) => {
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      }}
        navigatePage='administration'
      />,
    },
    {
      path: '/owner',
      element: currentUser && currentUser.roleName === 'Manager' ? <ManagerPageV2 onLogoutCallback={onLogout} currentUser={currentUser}  /> : <ManagerLandingV2 currentUser={currentUser} />,
    },
    {
      path: '/owner-login',
      element: currentUser && currentUser.roleName === 'Manager' ? <ManagerLandingV2 currentUser={currentUser} /> : <LoginPage onSaveUserLogin={(user) => {
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      }}
        navigatePage='owner'
      />,
    },
    {
      path: '/v1/owner',
      element: currentUser && currentUser.roleName === 'Owner' ? <OwnerPage onLogoutCallback={onLogout} currentUser={currentUser}  /> : <OwnerInitLanding currentUser={currentUser} />,
    },
    {
      path: '/v1/owner-login',
      element: currentUser && currentUser.roleName === 'Owner' ? <OwnerInitLanding currentUser={currentUser} /> : <LoginPage onSaveUserLogin={(user) => {
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      }}
        navigatePage='owner'
      />,
    },
    {
      path: '/manager',
      element: currentUser && currentUser.roleName === 'Manager' ? <ManagerPage onLogoutCallback={onLogout} currentUser={currentUser}  /> : <ManagerInitLanding currentUser={currentUser} />,
    },
    {
      path: '/manager-login',
      element: currentUser && currentUser.roleName === 'Manager' ? <ManagerInitLanding currentUser={currentUser} /> : <LoginPage onSaveUserLogin={(user) => {
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      }}
        navigatePage='manager'
      />,
    },
    {
      path: '/',
      element: <PageNotFound />,
    },
    {
      path: '*',
      element: <PageNotFound />,
    },
  ]);
  return (
    <React.StrictMode>
      <RouterProvider router={rootRouter} />
      <Toaster
        position="bottom-right"
        reverseOrder={true}
        toastOptions={{
          duration: 3000
        }}
      />
    </React.StrictMode>
  );
}

export default App;
