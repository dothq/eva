class Command {
    public description: string = "No description"

    public constructor(public name: string, public options: Partial<Command>) {
        
    }
}

export default Command;