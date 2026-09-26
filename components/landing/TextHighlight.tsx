interface TextHighlightProps {
    text: string;
}
export default function TextHighlight({ text }: TextHighlightProps) {
    return (
        <span className="relative">
            {text}
            <span className="absolute bottom-2 lg:bottom-3 left-0 w-full h-2.5 bg-primary rounded-[3px] -z-1"></span>
        </span>
    )
}