import { useState } from "react"

interface IRequestContractProps {
    callbackFn?: (action: actionCallback, data?: string) => void;
}
interface IRequestContractDetailProps extends IRequestContractProps {
    requestId: string;
}
type actionCallback = 'backToList' | 'goToDetail'

export const RequestContractModule: React.FC<IRequestContractProps> = (props) => {
    const [formMode, setFormMode] = useState<'list' | 'detail'>('list');
    const [requestId, setRequestId] = useState<string | undefined>();

    function componentCallback(action: actionCallback, data?: string) {
        if (action === 'backToList') {
            setFormMode('list');
            setRequestId(undefined);
        }
        if (action === 'goToDetail') {
            setFormMode('list');
            setRequestId(data);
        }
    }

    return <>
        {
            formMode === 'list' ? <RequestContractListComponent
                callbackFn={(action, data) => {
                    componentCallback(action, data);
                }}
            /> : <></>
        }
        {
            formMode === 'detail' ? <RequestContractDetailComponent
                requestId={requestId as string}
                callbackFn={(action) => {
                    componentCallback(action);
                }}
            /> : <></>
        }
    </>
}

const RequestContractListComponent: React.FC<IRequestContractProps> = (props) => {
    return <div>

    </div>
}

const RequestContractDetailComponent: React.FC<IRequestContractDetailProps> = (props) => {
    return <div>

    </div>
}