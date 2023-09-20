import { WorkingTimeCalendar } from "../../../common/components/working-time.component";

interface IContractFormProps {
    callbackFn?: (action: string) => void;
}


export const ContractWorkingFormModule: React.FC<{}> = () => {
    return <div>
        <WorkingTimeCalendar contractDetailId='' apiServices={null}/>
    </div>
}