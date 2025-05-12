import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import { QueryClientProvider } from "react-query";
import { RecoilRoot } from "recoil";
// import { GroupContainer } from "./container/group";
// import { UserContainer } from "./container/user";
// import { queryClient } from "./lib/query";
import { App } from "./App";
// import "./util/i18n";
import "./calendar.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RecoilRoot>
    {/* <QueryClientProvider client={queryClient}> */}
        {/* <UserContainer.ContextProvider> */}
          {/* <GroupContainer.ContextProvider> */}
            <App />
          {/* </GroupContainer.ContextProvider> */}
        {/* </UserContainer.ContextProvider> */}
      {/* </QueryClientProvider> */}
    </RecoilRoot>
  </StrictMode>
);
