import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CommonUtility } from '../utils/utilities';
import { IUser } from '../../IApp.interface';

interface adminLandingProps {
    currentUser: IUser | undefined;
}

export const AdminInitLanding: React.FC<adminLandingProps> = (props: adminLandingProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (CommonUtility.isNullOrUndefined(props.currentUser)) {
            return navigate('/administation-login');
        } else {
            if (props.currentUser?.role === 'admin') {
                return navigate('/administation');
            }
            if (props.currentUser?.role === 'owner') {
                return navigate('/owner-login');
            }
            if (props.currentUser?.role === 'manager') {
                return navigate('/manager-login');
            }
        }
    });

    return (
        <>
        </>
    )
}