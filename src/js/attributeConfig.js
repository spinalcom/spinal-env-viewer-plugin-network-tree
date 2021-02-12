
export const PLC_ATTR = 'PLC';
export const OBJECT_ATTR = 'OBJ';

export const DEFAULT_VALUES = [
   { id: 0, name: "Object controlled attribute value must contains PLC attribute value", isRegex: true, select: OBJECT_ATTR, value: PLC_ATTR, flags: ['i'] },
   { id: 1, name: "Object controlled attribute value must starts with the PLC attribute value", isRegex: true, select: OBJECT_ATTR, value: `^${PLC_ATTR}`, flags: ['i'] },
   { id: 2, name: "Object controlled attribute value must equal to the PLC attribute value", isRegex: true, select: OBJECT_ATTR, value: `^${PLC_ATTR}$`, flags: ['i'] },
   { id: 3, name: "Object controlled attribute value must ends with the PLC attribute value", isRegex: true, select: OBJECT_ATTR, value: `${PLC_ATTR}$`, flags: ['i'] },
]