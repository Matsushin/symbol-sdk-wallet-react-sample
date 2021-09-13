import React from 'react';
import { ToastProvider } from 'react-toast-notifications';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import TopPage from "./pages/TopPage";
import {Layout} from "./app/Layout";
import AccountPage from "./pages/AccountPage";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
          <Switch>
            <Route exact path="/account/:address" component={AccountPage} />
            <Route path="/" component={TopPage} />
          </Switch>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
