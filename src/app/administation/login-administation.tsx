import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import loginImg from '../../assets/images/login.png';
import './administation.scss';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { adminServices } from './administation.service';
import { take } from 'rxjs';
import { IUser } from '../../IApp.interface';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ILoginAdminProps {
    onSaveUserLogin: (obj: IUser) => any;
}

export const LoginAdmin: React.FC<ILoginAdminProps> = (props) => {
    const [username, changedUsername] = useState('');
    const [password, changedPassword] = useState('');
    const adminService = new adminServices();

    const navigate = useNavigate();

    function submitLogin() {
        adminService.login$(username, password).pipe(take(1)).subscribe({
            next: (res) => {
                if (res) {
                    const isAdmin = checkDummyLogin(res);
                    if (isAdmin) {
                        toast.success('Login successful');
                        props.onSaveUserLogin(res.admin);
                        return navigate('/administation');
                    }
                    toast.error('Incorrect username or password');
                    return;
                } else {
                    toast.error('Incorrect username or password');
                    return;
                }
            }
        })
    }

    //remove later
    function checkDummyLogin(users: any) {
        if (users?.admin.username === username && users?.admin.password === password) {
            return true;
        }
        return false;
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
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}