import { FormOutlined, PlusOutlined, ReloadOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, Table, Tag } from 'antd';
import Search from 'antd/es/input/Search';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IPlant } from '../../common/object-interfaces/plant.interface';
import { NumericFormat } from 'react-number-format';
import { OwnerServices } from '../owner.service';
import { BsPlusCircle } from 'react-icons/bs';
import { take } from 'rxjs';
import '../owner.scss';

interface IServiceManagementProps {

}

export const ServiceManagementComponent: React.FC<IServiceManagementProps> = (props) => {

    const navigate = useNavigate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const ownerServices = new OwnerServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [services, setServices] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);

    useEffect(() => {
        if (!isFirstInit) {
            ownerServices.getService$().pipe(take(1)).subscribe({
                next: data => {
                    setServices(data);
                    setFirstInit(true);
                }
            })
        }
    }, [isFirstInit, services, ownerServices]);

    function renderServicesBlock() {
        const elements: JSX.Element[] = services.reduce((acc, cur) => {
            acc.push(
                <div className='__app-service-block'>
                    <div className='__content-block'>
                        <div className='__left-content'>
                            <Avatar shape='square' src={null} size={100} />
                        </div>
                        <div className='__right-content'>
                            <span className='__title'>Tiêu đề dịch vụ</span>
                            <span className='__id'>ID: 001</span>
                            <Tag color={statusColorMapping('Status')}>Trạng Thái</Tag>
                            <span className='__id'>Giá: ...........</span>
                        </div>
                    </div>
                    <div className='__action-block'>
                        <Button>Xem chi tiết</Button>
                    </div>
                </div>
            )
            return acc;
        }, []);
        return elements;
    }

    function statusColorMapping(status: string) {
        switch (status) {
            default: return 'green';
        }
    }

    return (
        <div className='__app-services-container'>
            <div className='__app-service-block'>
                <div className='__content-block'>
                    <div className='__left-content'>
                        <Avatar shape='square' src={null} size={100} />
                    </div>
                    <div className='__right-content'>
                        <span className='__title'>Chăm sóc cây tại nhà</span>
                        <span className='__id'>ID: 001</span>
                        <Tag className='__status' color={statusColorMapping('Status')}>Trạng Thái</Tag>
                        <span className='__price'>Giá: ...........</span>
                    </div>
                </div>
                <div className='__action-block'>
                    <Button>Xem chi tiết</Button>
                </div>
            </div>
            <div className='__app-service-block'>
                <div className='__content-block'>
                    <div className='__left-content'>
                        <Avatar shape='square' src={null} size={100}/>
                    </div>
                    <div className='__right-content'>
                        <span className='__title'>Chăm sóc cây tại vườn</span>
                        <span className='__id'>ID: 001</span>
                        <Tag className='__status' color={statusColorMapping('Status')}>Trạng Thái</Tag>
                        <span className='__price'>Giá: ...........</span>
                    </div>
                </div>
                <div className='__action-block'>
                    <Button>Xem chi tiết</Button>
                </div>
            </div>
            <div className='__app-service-block'>
                <div className='__content-block'>
                    <div className='__left-content'>
                        <Avatar shape='square' src={null} size={100}/>
                    </div>
                    <div className='__right-content'>
                        <span className='__title'>Tiêu đề dịch vụ</span>
                        <span className='__id'>ID: 001</span>
                        <Tag className='__status' color={statusColorMapping('Status')}>Trạng Thái</Tag>
                        <span className='__price'>Giá: ...........</span>
                    </div>
                </div>
                <div className='__action-block'>
                    <Button>Xem chi tiết</Button>
                </div>
            </div>
            <div className='__app-create-service-block'>
                <BsPlusCircle color='#8A8A8A' size={80} />
                <span className='__app-create-service-title'>Thêm Dịch Vụ</span>
            </div>
        </div>
    )
}

const CreateServiceDialog: React.FC<{}> = (props) => {
    return <></>
}