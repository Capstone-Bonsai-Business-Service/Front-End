import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CommonUtility } from '../utils/utilities';
import { IUser } from '../../IApp.interface';

interface ownerLandingProps {
    currentUser: IUser | undefined;
}

export const OwnerInitLanding: React.FC<ownerLandingProps> = (props: ownerLandingProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (CommonUtility.isNullOrUndefined(props.currentUser)) {
            return navigate('/owner-login');
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