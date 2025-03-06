type SchemaValue = string | Record<string, string>;
type NestedSchemaValue = SchemaValue | Record<string, SchemaValue>;
export type SchemaOrgDefinition = Record<string, NestedSchemaValue | NestedSchemaValue[]>;

export function SchemaOrgScript({ schema }: { schema?: SchemaOrgDefinition }) {
  if (schema == null) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
