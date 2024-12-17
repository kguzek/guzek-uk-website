// Module declarations for all PNG files
// This is needed because without it TypeScript doesn't recognise the filetype

declare module "*.png" {
  const value: string;
  export default value;
}
