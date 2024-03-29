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
import { CommonUtility } from '../../utils/utilities';
import Logo from '../../../assets/images/logo2.png';

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
        if (CommonUtility.isNullOrEmpty(username) || CommonUtility.isNullOrEmpty(password)) {
            toast.error('Vui lòng nhập đủ thông tin username & password');
            setProcessing(false);
            return;
        }
        let user: IUser = {
            username: username,
        } as IUser;
        setProcessing(true);
        coreService.login$(username, password).pipe(take(1)).pipe(
            switchMap(token => {
                if (token.error) {
                    return of({
                        error: token.error
                    });
                } else {
                    user['token'] = token;
                    return coreService.getUserInfoByToken$(token);
                }
            })
        ).subscribe({
            next: (res) => {
                if (res.error) {
                    setProcessing(false);
                    toast.error(res.error);
                    return;
                } else {
                    for (let prop in res) {
                        user[prop] = res[prop];
                    }
                    toast.success('Đăng nhập thành công');
                    props.onSaveUserLogin(user);
                    setProcessing(false);
                    return navigate(`/${props.navigatePage}`);
                }
            }
        })
    }

    return (
        <div className='__app-login' >
            <div className='__app-login-container' >
                <div className='__login-form-item'>
                    <div className='__login-image'>
                        <img src={loginImg} width='300' style={{ position: 'relative' }} alt='login' />
                    </div>
                    <div className='__login-form'>
                        <h2>Đăng nhập</h2>
                        <Form className='__form-controls'>
                            <Form.Item>
                                <Input
                                    prefix={<UserOutlined color='rgba(0,0,0,.25)' />}
                                    placeholder='Tài khoản'
                                    onChange={(args) => {
                                        changedUsername(args.target.value)
                                    }}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Input
                                    prefix={<LockOutlined color='rgba(0,0,0,.25)' />}
                                    type='password'
                                    placeholder='Mật khẩu'
                                    onChange={(args) => {
                                        changedPassword(args.target.value)
                                    }}
                                />
                            </Form.Item>
                            <Form.Item>
                                {
                                    isProccess ?
                                        <div className="__loading-icon">
                                            <LoadingOutlined style={{ fontSize: 24, color: '#0D6368' }}/>
                                        </div> :
                                        <Button
                                            type='primary'
                                            className='__button'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                submitLogin();
                                            }}
                                        >
                                            Đăng nhập
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