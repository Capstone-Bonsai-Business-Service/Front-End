import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import loginImg from '../../../assets/images/login.png';
import '../../../styles/global.style.scss';
import { LoadingOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { of, switchMap, take } from 'rxjs';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CoreServices } from '../../../service.core';
import { IUser } from '../../../IApp.interface';

interface ILoginProps {
    onSaveUserLogin: (obj: IUser) => any;
    navigatePage: 'administration' | 'owner' | 'manager';
}

export const LoginPage: React.FC<ILoginProps> = (props) => {
    const [username, changedUsername] = useState('');
    const [password, changedPassword] = useState('');
    const [isProccess, setProcessing] = useState(false);
    const coreService = new CoreServices();

    const navigate = useNavigate();

    function submitLogin() {
        let user: IUser = {
            username: username,
        } as IUser;
        setProcessing(true);
        coreService.login$(username, password).pipe(take(1)).pipe(
            switchMap(token => {
                if (token) {
                    user['token'] = token;
                    return coreService.getUserInfoByToken$(token);
                } else {
                    return of(null);
                }
            })
        ).subscribe({
            next: (res) => {
                if (res) {
                    for (let prop in res) {
                        user[prop] = res[prop];
                    }
                    toast.success('Login successful');
                    props.onSaveUserLogin(user);
                    setProcessing(false);
                    return navigate(`/${props.navigatePage}`);
                } else {
                    setProcessing(false);
                    toast.error('Incorrect username or password');
                    return;
                }
            }
        })
    }

    return (
        <div className='__app-login'>
            <div className='__app-login-container'>
                <div className='__login-form-item'>
                    <div className='__login-image'>
                        <img src={loginImg} width='300' style={{ position: 'relative' }} alt='login' />
                    </div>
                    <div className='__login-form'>
                        <h2>Login</h2>
                        <Form className='__form-controls'>
                            <Form.Item>
                                <Input
                                    prefix={<UserOutlined color='rgba(0,0,0,.25)' />}
                                    placeholder='Username'
                                    onChange={(args) => {
                                        changedUsername(args.target.value)
                                    }}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Input
                                    prefix={<LockOutlined color='rgba(0,0,0,.25)' />}
                                    type='password'
                                    placeholder='Password'
                                    onChange={(args) => {
                                        changedPassword(args.target.value)
                                    }}
                                />
                            </Form.Item>
                            <Form.Item>
                                {
                                    isProccess ?
                                        <div className="__loading-icon">
                                            <LoadingOutlined style={{ fontSize: 24, color: '#74060E' }}/>
                                        </div> :
                                        <Button
                                            type='primary'
                                            className='__button'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                submitLogin();
                                            }}
                                        >
                                            Log in
                                        </Button>
                                }

                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}