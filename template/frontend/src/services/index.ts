import { Configuration, StartupApi } from "./backend/generated";

// Empty basePath keeps all calls on the site's origin, both locally and deployed.
// The proxy reads the HttpOnly cookie; no tokens live in the frontend.
const config = new Configuration({ basePath: "", credentials: "include" });
export default { backend: new StartupApi(config) };
