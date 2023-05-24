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
import { message } from 'antd';
import { NoticeType } from 'antd/es/message/interface';

function App() {
  const [currentUser, setCurrentUser]: [IUser | undefined, any] = useState();
  const [messageApi, contextMessageHolder] = message.useMessage();

  const openMessage = (type: NoticeType, message: string, duration: number = 300, key: string = `message_${new Date().getTime()}`) => {
    messageApi.open({
      content: message,
      type: type,
      duration: duration,
      key: key
    });
  };

  const rootRouter = createBrowserRouter([
    {
      path: '/administation',
      element: currentUser ? <AdminPage currentUser={currentUser} /> : <AdminInitLanding currentUser={currentUser} />,
    },
    {
      path: '/administation-login',
      element: <LoginAdmin onSaveUserLogin={setCurrentUser} onOpenMessage={openMessage} />,
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
      {contextMessageHolder}
    </React.StrictMode>
  );
}

export default App;
