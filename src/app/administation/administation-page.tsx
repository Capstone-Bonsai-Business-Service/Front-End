import React from 'react'
import { IUser } from '../../IApp.interface';

interface IAdminPageProps {
    currentUser: IUser | undefined;
}

export const AdminPage: React.FC<IAdminPageProps> = (props) => {
    return (
        <>
            Hello Admin { props.currentUser?.fullName }
        </>
    )
}