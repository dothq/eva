import { Ctx } from "../commands";

class Action {
    public constructor(public name: string, public $actionInit?: Partial<Action>) {
        if ($actionInit) {
            for (const [key, value] of Object.entries($actionInit)) {
                (this as any)[key] = value;
            }
        }
    }
}

interface Action {
    name: string;
    
    exec(ctx: Ctx): Promise<void>;
}

export { Action };