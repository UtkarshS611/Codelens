export default function Logo() {
    return (
        <div className="bg-primary w-12 h-12 rounded-[20px] relative">
            <div
                className="absolute h-6 w-6 bg-primary-foreground rounded-[10px] border-2 border-primary-foreground top-2 right-2"
            />
            <div
                className="absolute h-6 w-6 bg-primary/80 rounded-[10px] border-2 border-primary-foreground bottom-2 left-2 flex items-center justify-center backdrop-blur-[0.5px]"
            >
                <img src="/svgs/terminal.svg" alt="terminal" />
            </div>
        </div>
    )
}