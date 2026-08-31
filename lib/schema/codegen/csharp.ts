import type { SchemaClass } from "@/lib/schema/types";

const UNMANAGED_TYPE_MAPS: Record<string, string> = {
    int8: "byte",
    int16: "short",
    int32: "int",
    int64: "long",
    uint8: "byte",
    uint16: "ushort",
    uint32: "uint",
    uint64: "ulong",
    float32: "float",
    float64: "double",
    double: "double",
    bool: "bool",
    char: "char",
    VectorWS: "Vector",
    VectorAligned: "Vector",
    Vector: "Vector",
    QAngle: "QAngle",
    CUtlVector: "CUtlVector",
    CUtlLeanVector: "CUtlLeanVector",
    Quaternion: "Quaternion",
    Vector2D: "Vector2D",
    Vector4D: "Vector4D",
    CStrongHandle: "CStrongHandle",
    CUtlSymbolLarge: "CUtlSymbolLarge",
    CUtlString: "CUtlString",
    CGameSoundEventName: "CGameSoundEventName",
    Color: "Color",
    CHandle: "CHandle",
    CBufferString: "CBufferString",
    CGlobalSymbolCaseSensitive: "CGlobalSymbol",
    CGlobalSymbol: "CGlobalSymbol",
    CTransformWS: "CTransform",
    CTransform: "CTransform",
    CNetworkedQuantizedFloat: "CNetworkedQuantizedFloat",
    CUtlBinaryBlock: "CUtlBinaryBlock",
    fltx4: "fltx4",
    FourVectors: "FourVectors",
    CEntityIndex: "uint",
    CSplitScreenSlot: "uint",
    CPlayerSlot: "uint",
    WorldGroupId_t: "uint",
    matrix3x4_t: "matrix3x4_t",
    matrix3x4a_t: "matrix3x4_t",
    RadianEuler: "RadianEuler",
    CNetworkUtlVectorBase: "CUtlVector",
    CEntityHandle: "CHandle<CEntityInstance>",
    CTakeDamageInfo: "CTakeDamageInfo",
    CTakeDamageResult: "CTakeDamageResult",
    ChangeAccessorFieldPathIndex_t: "ChangeAccessorFieldPathIndex_t",
    CNetworkVarChainer: "CNetworkVarChainer",
    HSCRIPT: "HSCRIPTHandler",
    QuaternionStorage: "QuaternionStorage",
    Range_t: "Range_t",
    RnSphere_t: "RnSphere_t",
    CEntityIOOutput: "CEntityIOOutput",
    "CVariantBase<CVariantDefaultAllocator>":
        "CVariant<CVariantDefaultAllocator>",
    "CAnimGraph2ParamOptionalRef<float32>": "CAnimGraph2ParamOptionalRefFloat",
    "CAnimGraph2ParamOptionalRef<bool>": "CAnimGraph2ParamOptionalRefBool",
    "CAnimGraph2ParamOptionalRef<CGlobalSymbol>":
        "CAnimGraph2ParamOptionalRefCGlobalSymbol",
    "CTypedBitVec<64>": "CBitVec64",
};

const BLACKLISTED_TYPES: string[] = [
    "CUtlStringTokenWithStorage",
    "FourVectors2D",
    "FeSimdTri_t",
    "CStrongHandleVoid",
    "CUtlVectorFixedGrowable",
    "CUtlLeanVectorFixedGrowable",
    "CWeakHandle",
    "DegreeEuler",
    "CUtlSymbol",
    "CUtlOrderedMap",
    "CUtlStringMap",
    "CUtlMap",
    "CSmartPtr",
    "CUtlHashtable",
    "CPulseValueFullType",
    "PulseSymbol_t",
    "CColorGradient",
    "CPiecewiseCurve",
    "Range_t",
    "CAnimGraphParamRef",
    "bitfield",
    "KeyValues3",
    "KeyValues",
    "CResourceName",
    "CParticleNamedValueRef",
    "CKV3MemberNameSet",
    "CAnimGraphTagRef",
    "CResourceNameTyped",
    "CResourceArray",
    "CAnimGraphParamOptionalRef",
    "CAnimVariant",
    "RotationVector",
    "CAnimScriptParam",
    "CKV3MemberNameWithStorage",
    "CModelAnimNameWithDeltas",
    "CAnimValue",
    "CEntityOutputTemplate",
    "SphereBase_t",
    "CAttachmentNameSymbolWithStorage",
    "std::pair",
    "CCompressor",
    "CUtlVectorSIMDPaddedVector",
    "ParticleParamID_t",
    "CAnimGraph2ParamAutoResetOptionalRef",
    "ENTITYFUNCPTR",
    "BASEPTR",
    "USEPTR",
    "CSoundEventName",
    "CEntityNameString",
    "CRelativeArray",
    "void",
    "CRotation",
    "CMotionTransform",
    "CAnimNetVar",
    "CEntityKeyValues",
];

const RESERVED_NAMES = new Set([
    "SchemaClass",
    "SchemaField",
    "SchemaFixedArray",
    "SchemaFixedString",
]);

export function toInterfaceName(className: string): string {
    if (RESERVED_NAMES.has(className)) return `I${className}`;
    return className.replaceAll(":", "_");
}

const FIELD_TYPE_PREFIXES = [
    "psz",
    "fl",
    "a",
    "n",
    "i",
    "isz",
    "vec",
    "us",
    "u",
    "ub",
    "un",
    "sz",
    "b",
    "f",
    "clr",
    "h",
    "ang",
    "af",
    "ch",
    "q",
    "p",
    "v",
    "arr",
    "bv",
    "e",
    "s",
];

function removePrefix(text: string, prefix: string): string {
    return text.startsWith(prefix) ? text.slice(prefix.length) : text;
}

function toFieldName(fieldName: string): string {
    fieldName = removePrefix(fieldName, "m_");
    for (const prefix of FIELD_TYPE_PREFIXES) {
        if (fieldName.toLowerCase().startsWith(prefix.toLowerCase())) {
            const tempRemoved = removePrefix(fieldName, prefix);
            if (tempRemoved.length > 0 && /[A-Z]/.test(tempRemoved[0])) {
                return tempRemoved;
            }
        }
    }
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

type ConvResult = { name: string; isValueType: boolean };

function convertHandleType(type: string): ConvResult {
    let variableName: string;
    let originalLength: number;
    if (type.startsWith("CWeakHandle")) {
        variableName = "CWeakHandle";
        originalLength = "CWeakHandle".length;
    } else if (type.startsWith("CStrongHandleCopyable")) {
        variableName = "CStrongHandle";
        originalLength = "CStrongHandleCopyable".length;
    } else if (type.startsWith("CStrongHandle")) {
        variableName = "CStrongHandle";
        originalLength = "CStrongHandle".length;
    } else {
        variableName = "CHandle";
        originalLength = "CHandle".length;
    }

    let genericT1 = type.slice(originalLength + 1);
    genericT1 = genericT1.slice(0, genericT1.length - 1);
    genericT1 = toInterfaceName(genericT1);

    return { name: `${variableName}<${genericT1}>`, isValueType: true };
}

function convertUtlVectorType(
    type: string,
    allClassNames: Set<string>,
    allEnumNames: Set<string>,
): ConvResult {
    let variableName: string;
    let originalLength: number;
    if (type.startsWith("CUtlVectorFixedGrowable")) {
        variableName = "CUtlVectorFixedGrowable";
        originalLength = "CUtlVectorFixedGrowable".length;
    } else if (type.startsWith("CUtlLeanVector")) {
        variableName = "CUtlLeanVector";
        originalLength = "CUtlLeanVector".length;
    } else if (type.startsWith("CUtlVectorEmbeddedNetworkVar")) {
        variableName = "CUtlVector";
        originalLength = "CUtlVectorEmbeddedNetworkVar".length;
    } else if (type.startsWith("CNetworkUtlVectorBase")) {
        variableName = "CUtlVector";
        originalLength = "CNetworkUtlVectorBase".length;
    } else {
        variableName = "CUtlVector";
        originalLength = "CUtlVector".length;
    }

    if (originalLength + 1 > type.length) {
        return { name: "SchemaUntypedField", isValueType: true };
    }

    let genericT1 = type.slice(originalLength + 1);
    genericT1 = genericT1.slice(0, genericT1.length - 1);
    if (genericT1.includes(",")) {
        genericT1 = genericT1.split(",")[0].trim();
    }

    const isPtr = genericT1.endsWith("*");
    if (isPtr) genericT1 = genericT1.slice(0, -1).trim();

    const inner = convertFieldType(
        genericT1,
        "ref",
        allClassNames,
        allEnumNames,
    );
    const genericT1Type = inner.name;

    if (variableName === "CUtlLeanVector") {
        if (isPtr && genericT1Type === "char")
            return { name: `${variableName}<CString, int>`, isValueType: true };
        if (isPtr)
            return {
                name: `${variableName}<PointerTo<${genericT1Type}>, int>`,
                isValueType: true,
            };
        return {
            name: `${variableName}<${genericT1Type}, int>`,
            isValueType: true,
        };
    }

    if (isPtr && genericT1Type === "char")
        return { name: `${variableName}<CString>`, isValueType: true };
    if (isPtr)
        return {
            name: `${variableName}<PointerTo<${genericT1Type}>>`,
            isValueType: true,
        };

    for (const blacklisted of BLACKLISTED_TYPES) {
        if (genericT1Type.includes(blacklisted)) {
            return {
                name: `${variableName}<SchemaUntypedField>`,
                isValueType: true,
            };
        }
    }

    return { name: `${variableName}<${genericT1Type}>`, isValueType: true };
}

function convertFieldType(
    rawType: string,
    kind: string,
    allClassNames: Set<string>,
    allEnumNames: Set<string>,
): ConvResult {
    let type = rawType.replaceAll(" ", "").trim();
    type = type.replaceAll(":", "_");
    const prefix = "I";

    for (const blacklisted of BLACKLISTED_TYPES) {
        if (type.startsWith(blacklisted) && type !== "CUtlSymbolLarge") {
            return { name: "SchemaUntypedField", isValueType: false };
        }
    }

    if (kind === "ptr" && type === "char")
        return { name: "CString", isValueType: true };

    for (const [key, value] of Object.entries(UNMANAGED_TYPE_MAPS)) {
        if (!type.startsWith(key)) continue;

        if (
            type.startsWith("CWeakHandle") ||
            type.startsWith("CStrongHandle") ||
            type.startsWith("CHandle")
        ) {
            const handle = convertHandleType(type);
            if (kind === "fixed_array")
                return {
                    name: `${prefix}SchemaFixedArray<${handle.name}>`,
                    isValueType: false,
                };
            return handle;
        }

        if (
            type.startsWith("CUtlVector") ||
            type.startsWith("CNetworkUtlVector") ||
            type.startsWith("CUtlLeanVector")
        ) {
            const vector = convertUtlVectorType(
                type,
                allClassNames,
                allEnumNames,
            );
            if (kind === "fixed_array")
                return {
                    name: `${prefix}SchemaFixedArray<${vector.name}>`,
                    isValueType: false,
                };
            return vector;
        }

        if (kind === "fixed_array") {
            if (type === "char")
                return {
                    name: `${prefix}SchemaFixedString`,
                    isValueType: false,
                };
            if (!type.includes("["))
                return {
                    name: `${prefix}SchemaFixedArray<${type.replaceAll(key, value)}>`,
                    isValueType: false,
                };
            return { name: "SchemaUntypedField", isValueType: false };
        }

        return { name: type.replaceAll(key, value), isValueType: true };
    }

    if (allEnumNames.has(type)) {
        if (kind === "fixed_array")
            return {
                name: `${prefix}SchemaFixedArray<${type}>`,
                isValueType: false,
            };
        return { name: type, isValueType: true };
    }

    if (allClassNames.has(type)) {
        if (kind === "fixed_array")
            return {
                name: `${prefix}SchemaClassFixedArray<${type}>`,
                isValueType: false,
            };
        return { name: toInterfaceName(type), isValueType: false };
    }

    return { name: "SchemaUntypedField", isValueType: false };
}

export type FieldDisplay = { name: string; type: string };

export function getClassFieldDisplays(
    cls: SchemaClass,
    allClassNames: Set<string>,
    allEnumNames: Set<string>,
): FieldDisplay[] {
    const existingNames = new Set<string>();
    let duplicateCounter = 0;

    return (cls.fields ?? []).map((field) => {
        const processedType = field.templated ?? field.type;

        let name = toFieldName(field.name);
        if (existingNames.has(name)) {
            duplicateCounter++;
            name = `${name}${duplicateCounter}`;
        } else {
            existingNames.add(name);
        }

        const isFixedCharString =
            field.kind === "fixed_array" && processedType === "char";
        const isCharPtrString =
            field.kind === "ptr" && processedType === "char";
        const isStringHandle = processedType === "CUtlSymbolLarge";
        const isUtlStringHandle = processedType === "CUtlString";

        const converted = convertFieldType(
            processedType,
            field.kind,
            allClassNames,
            allEnumNames,
        );

        let type = converted.name;
        if (
            isFixedCharString ||
            isCharPtrString ||
            isStringHandle ||
            isUtlStringHandle
        ) {
            type = "string";
            if (
                field.kind === "fixed_array" &&
                (isStringHandle || isUtlStringHandle)
            ) {
                type = isStringHandle
                    ? "ISchemaStringFixedArray"
                    : "ISchemaUtlStringFixedArray";
            }
        } else if (type === "SchemaUntypedField") {
            type = `SchemaUntypedField /* ${processedType} */`;
        }

        return { name, type };
    });
}
