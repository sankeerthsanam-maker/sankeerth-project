import { Icon } from "../../../../packages/widget/src/components/Icon";
import { Button } from "../../../../packages/widget/src/components/Button";

export function Toast({message,onOpenBag}:{message:string;onOpenBag:()=>void}) {
    return (
<div className="toast" role="status">
                    <Icon name="check" />
                    {message}
                    <Button onClick={onOpenBag}>View bag</Button>
                </div>
    );
}
