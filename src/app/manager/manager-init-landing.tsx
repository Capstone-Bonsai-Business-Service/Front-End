import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CommonUtility } from '../utils/utilities';
import { IUser } from '../../IApp.interface';

interface managerLandingProps {
    currentUser: IUser | undefined;
}

export const ManagerInitLanding: React.FC<managerLandingProps> = (props: managerLandingProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (CommonUtility.isNullOrUndefined(props.currentUser)) {
            return navigate('/manager-login');
        } else {
            if (props.currentUser?.roleName === 'Admin') {
                return navigate('/administration');
            }
            if (props.currentUser?.roleName === 'Owner') {
                return navigate('/owner');
            }
            if (props.currentUser?.roleName === 'Manager') {
                return navigate('/manager');
            }
        }
    });

    return (
        <>
        </>
    )
}