import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonNote,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import './Menu.css';

interface MenuProps {
  signOut: () => void;
  user: any;
}

const Menu: React.FC<MenuProps> = ({ signOut, user }) => {
  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader className="ion-padding">Menu</IonListHeader>
        </IonList>

        <div className="sign-out-button">
          <IonButton expand="block" onClick={signOut}>
            Sign Out
          </IonButton>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
