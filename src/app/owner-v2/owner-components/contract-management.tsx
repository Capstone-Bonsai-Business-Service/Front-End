import { Tabs } from "antd";
import { useState } from "react";
import { RequestContractModule } from "./contract-forms/contract-requested";
import { ContractWorkingFormModule } from "./contract-forms/contract-working-form";
import { ContractDeniedFormModule } from "./contract-forms/contract-denied";


export const ContractManagementComponentV2: React.FC<any> = () => {
    const [tabKey, setTabKey] = useState<string>('request')
    return (
        <div style={{ height: 'calc(100vh - 100px)', width: 'calc(100% - 80px)', marginLeft: 20 }}>
            <Tabs
                className="__app-tabs-custom"
                style={{ marginBottom: 0 }}
                defaultActiveKey='request'
                type='card'
                onChange={(key) => {
                    setTabKey(key);
                }}
                items={[
                    {
                        label: 'Yêu cầu',
                        key: 'request',
                        children: tabKey === 'request' ? <RequestContractModule /> : <></>,
                    },
                    {
                        label: 'Hợp đồng',
                        key: 'contract',
                        children: tabKey === 'contract' ? <ContractWorkingFormModule /> : <></>,
                    },
                    {
                        label: 'Đã huỷ',
                        key: 'denied',
                        children: tabKey === 'denied' ? <ContractDeniedFormModule /> : <></>,
                    },
                    
                ]}
            />
        </div>
    )
}