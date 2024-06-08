import React, { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonSplitPane,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';

import { IonReactRouter } from '@ionic/react-router';
import Menu from './components/Menu';
import Home from './pages/Home';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
setupIonicReact();

const App: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const handleSelectChat = (chatID: string) => {
    setSelectedChat(chatID);
  };

  return (
    <Authenticator className="ion-margin ion-padding">
      {({ signOut, user }) => (
        <IonApp>
          <IonReactRouter>
            <IonSplitPane when={false} className="custom-split-pane" contentId="main">
              <Menu user={user} signOut={signOut} onSelectChat={handleSelectChat} />
              <IonRouterOutlet id="main">
                <Route exact path="/" render={(props) => <Home {...props} user={user} chatID={selectedChat} />} />
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
