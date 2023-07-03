import React, { useState } from 'react';
import './App.scss';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { IUser } from './IApp.interface';
import { AdminInitLanding } from './app/administration/administration-init-landing';
import { LoginAdmin } from './app/administration/login-administration';
import { PageNotFound } from './app/not-found-page/not-found-page';
import { AdminPage } from './app/administration/administration-page';
import { Toaster } from 'react-hot-toast';
import { AccountDetailPage } from './app/administration/administration-account-detail';
import { OwnerPage } from './app/owner/owner-page';
import { OwnerInitLanding } from './app/owner/owner-init-landing';
import { LoginOwner } from './app/owner/login-owner';
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

  const rootRouter = createBrowserRouter([
    {
      path: '/administration',
      element: currentUser && currentUser.roleName === 'Admin' ? <AdminPage currentUser={currentUser} globalSettings={globalSettings} /> : <AdminInitLanding currentUser={currentUser} />,
    },
    {
      path: '/administration/account/:id',
      element: currentUser && currentUser.roleName === 'Admin' ? <AccountDetailPage currentUser={currentUser} /> : <AdminInitLanding currentUser={currentUser} />,
    },
    {
      path: '/administration-login',
      element: currentUser && currentUser.roleName === 'Admin' ? <AdminInitLanding currentUser={currentUser} /> : <LoginAdmin onSaveUserLogin={(user) => {
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      }} />,
    },
    {
      path: '/owner',
      element: currentUser && currentUser.roleName === 'Owner' ? <OwnerPage currentUser={currentUser} /> : <OwnerInitLanding currentUser={currentUser} />,
    },
    {
      path: '/owner-login',
      element: currentUser && currentUser.roleName === 'Owner' ? <OwnerInitLanding currentUser={currentUser} /> : <LoginOwner onSaveUserLogin={(user) => {
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      }} />,
    },
    {
      path: '/manager',
      element: <PageNotFound />,
    },
    {
      path: '/manager-login',
      element: <PageNotFound />,
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
