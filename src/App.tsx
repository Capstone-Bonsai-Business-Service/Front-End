import React, { useState } from 'react';
import './App.scss';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { IUser } from './IApp.interface';
import { AdminInitLanding } from './app/administation/administation-init-landing';
import { LoginAdmin } from './app/administation/login-administation';
import { PageNotFound } from './app/not-found-page/not-found-page';
import { AdminPage } from './app/administation/administation-page';
import { Toaster } from 'react-hot-toast';

function App() {
  const [currentUser, setCurrentUser]: [IUser | undefined, any] = useState();

  const rootRouter = createBrowserRouter([
    {
      path: '/administation',
      element: currentUser ? <AdminPage currentUser={currentUser} /> : <AdminInitLanding currentUser={currentUser} />,
    },
    {
      path: '/administation-login',
      element: <LoginAdmin onSaveUserLogin={setCurrentUser} />,
    },
    {
      path: '/portal',
      element: <PageNotFound />,
    },
    {
      path: '/owner-login',
      element: <PageNotFound />,
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
