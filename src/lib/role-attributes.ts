import { ActionDto, RoleDto, SimpleActionDto } from "@/types/api";

type SupportedAttributeName = "grantable_actions" | "manageable_roles" | "assignable_roles";

const SUPPORTED_ATTRIBUTE_NAMES = new Set<SupportedAttributeName>([
  "grantable_actions",
  "manageable_roles",
  "assignable_roles",
]);

export type RoleAttributeSelections = Record<string, Set<number>>;

export const getRoleAttributeKey = (actionId: number, attributeName: string) => `${actionId}:${attributeName}`;

const isSupportedAttributeName = (attributeName: string): attributeName is SupportedAttributeName => {
  return SUPPORTED_ATTRIBUTE_NAMES.has(attributeName as SupportedAttributeName);
};

export const parseCsvNumberSet = (raw?: string | null) => {
  if (!raw) return new Set<number>();
  // remove surrounding brackets if present and whitespace
  const cleaned = raw.trim().replace(/^\[|\]$/g, "");
  if (!cleaned) return new Set<number>();
  const values = cleaned
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => !Number.isNaN(v));
  return new Set<number>(values);
};

export const parseRoleAttributeSelections = (role?: RoleDto): RoleAttributeSelections => {
  const selections: RoleAttributeSelections = {};

  role?.actions?.forEach((action) => {
    action.attributes?.forEach((attribute) => {
      if (!isSupportedAttributeName(attribute.name)) {
        return;
      }
      const parsedValues = parseCsvNumberSet(attribute.value);
      if (parsedValues.size === 0) {
        return;
      }
      selections[getRoleAttributeKey(action.id, attribute.name)] = parsedValues;
    });
  });

  return selections;
};

export const buildSimpleActionPayload = ({
  selectedActionIds,
  availableActions,
  selections,
}: {
  selectedActionIds: Set<number>;
  availableActions: ActionDto[];
  selections: RoleAttributeSelections;
}): SimpleActionDto[] => {
  return Array.from(selectedActionIds).map((actionId) => {
    const actionMeta = availableActions.find((a) => a.id === actionId);
    const attributes: NonNullable<SimpleActionDto["attributes"]> = [];

    actionMeta?.attributes.forEach((attribute) => {
      if (!isSupportedAttributeName(attribute.name)) {
        return;
      }
      const values = selections[getRoleAttributeKey(actionId, attribute.name)];
      if (!values || values.size === 0) {
        return;
      }
      // Format attribute value based on attribute.valueType. If it's an array type,
      // send it as a bracketed array string like "[1,2,3]". Otherwise send a CSV string.
      const isArrayType = attribute.valueType && /array/i.test(attribute.valueType);
      const valueStr = isArrayType
        ? `[${Array.from(values).join(",")}]`
        : Array.from(values).join(",");

      attributes.push({
        id: attribute.id,
        value: valueStr,
      });
    });

    return {
      id: actionId,
      attributes: attributes.length > 0 ? attributes : undefined,
    };
  });
};

