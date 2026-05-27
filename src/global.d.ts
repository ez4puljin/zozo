// CSS / asset module declarations
declare module "*.css";
declare module "*.svg" {
  const content: string;
  export default content;
}
