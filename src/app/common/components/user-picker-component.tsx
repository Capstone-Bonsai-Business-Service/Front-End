import { Select } from "antd";
import React, { useState } from "react";

interface IUserPickerProps {
    listUser: { value: number, label: string}[];
    defaultValue?: string;
    onChanged: (value: number) => void;
    placeholder?: string;
}

export const UserPicker: React.FC<IUserPickerProps> = (props) => {
    return (
        <div className="__app-user-picker">
            <Select
                style={{ width: '100%' }}
                defaultValue={props.defaultValue}
                showSearch
                placeholder={props.placeholder ?? ''}
                optionFilterProp="label"
                onChange={(value) => {
                    props.onChanged(Number(value));
                }}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={props.listUser}
            />
        </div>
    )
}