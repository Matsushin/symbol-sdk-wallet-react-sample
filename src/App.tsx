import React from 'react';
import { ToastProvider } from 'react-toast-notifications';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import TopPage from "./pages/TopPage";
import {Layout} from "./app/Layout";
import AccountPage from "./pages/AccountPage";

export const Path = {
  top: '/',
  address: `/address/:address`
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
          <Switch>
            <Route exact path={Path.address} component={AccountPage} />
            <Route path={Path.top} component={TopPage} />
          </Switch>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
