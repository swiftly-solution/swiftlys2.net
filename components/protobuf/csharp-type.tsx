import { ProtobufTypeLink } from "@/components/protobuf/protobuf-type-link";
import type { CSharpFieldType } from "@/lib/protobuf/csharp";

export function CSharpTypeDisplay({
    type,
    gameId,
}: {
    type: CSharpFieldType;
    gameId: string;
}) {
    if (type.kind === "plain") {
        return type.link ? (
            <ProtobufTypeLink
                name={type.text}
                link={type.link}
                gameId={gameId}
            />
        ) : (
            <span>{type.text}</span>
        );
    }

    return (
        <span>
            {type.wrapper}&lt;
            {type.link ? (
                <ProtobufTypeLink
                    name={type.inner}
                    link={type.link}
                    gameId={gameId}
                />
            ) : (
                <span>{type.inner}</span>
            )}
            &gt;
        </span>
    );
}
