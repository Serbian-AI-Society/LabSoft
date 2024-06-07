import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import { archiveOutline, archiveSharp, bookmarkOutline, heartOutline, heartSharp, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
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
          <IonListHeader>Menu</IonListHeader>
          <IonNote>{user.username}</IonNote>
        </IonList>

        <IonButton  expand="block" onClick={signOut}>Sign Out</IonButton>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
