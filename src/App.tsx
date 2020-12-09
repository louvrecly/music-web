import React from "react";
import store from "./store";
import Navbar from "./Component/Navbar/Navbar";
import AuthForm from "./Component/AuthForm/AuthForm";
import Main from "./Component/Main/Main";
import PlayerProfile from "./Component/PlayerProfile/PlayerProfile";
import BandAds from "./Component/BandAds/BandAds";
import BandRoom from "./Component/BandRoom/BandRoom";
import NoMatch from "./Component/System/NoMatch";
import DrumsKit from "./Component/BandRoom/Instrument/DrumsKit/DrumsKit";
import { history } from "./store";
import { PrivateRoute } from "./PrivateRoute";
import { Switch, Route } from "react-router-dom";
import { ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Navbar />
        <Switch>
          <Route path="/login" component={AuthForm} />
          <PrivateRoute path="/" exact={true} component={Main} />
          <PrivateRoute path="/profile" component={PlayerProfile} />
          <PrivateRoute path="/chat" component={DrumsKit} />
          <PrivateRoute path="/band" component={BandAds} />
          <PrivateRoute path="/bandRoom/:id" component={BandRoom} />
          <Route component={NoMatch} />
        </Switch>
      </ConnectedRouter>
    </Provider>
  );
}

export default App;
