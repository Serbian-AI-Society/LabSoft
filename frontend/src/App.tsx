import React, { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Menu from './components/Menu';
import Home from './pages/Home';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { Amplify } from 'aws-amplify';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import aws_exports from './aws-exports'; // Koristite import umesto require

Amplify.configure(aws_exports);

setupIonicReact();

const App: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<{ chatId: string; chatName: string } | null>(null);

  const handleSelectChat = (chatId: string, chatName: string) => {
    setSelectedChat({ chatId, chatName });
  };

  return (
    <Authenticator className="ion-margin ion-padding">
      {({ signOut, user }) => (
        <IonApp>
          <IonReactRouter>
            <IonSplitPane when={false} className="custom-split-pane" contentId="main">
              <Menu user={user} signOut={signOut} onSelectChat={handleSelectChat} />
              <IonRouterOutlet id="main">
                <Route
                  exact
                  path="/"
                  render={(props) => <Home {...props} user={user} selectedChat={selectedChat} />}
                />
                <Route render={() => <Redirect to="/" />} />
              </IonRouterOutlet>
            </IonSplitPane>
          </IonReactRouter>
        </IonApp>
      )}
    </Authenticator>
  );
};

export default App;
