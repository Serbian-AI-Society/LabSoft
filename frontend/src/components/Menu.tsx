import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonNote,
  IonModal,
  IonInput,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonText,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import './Menu.css';

interface MenuProps {
  signOut: () => void;
  user: any;
}

const Menu: React.FC<MenuProps> = ({ signOut, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [chatName, setChatName] = useState('');
  const [chatTopic, setChatTopic] = useState('');

  const handleCreateChat = async () => {
    // Call your API to create a new chat here
    try {
      const response = await fetch('https://225aetnmd3.execute-api.eu-central-1.amazonaws.com/Prod/createChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          UserID: user.username,
          ChatName: chatName,
          ChatTopic: chatTopic
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Chat created with ID:', data.ChatID);

      // Close the modal and reset the form
      setShowModal(false);
      setChatName('');
      setChatTopic('');
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader className="ion-padding">Menu</IonListHeader>
          <IonItem button onClick={() => setShowModal(true)}>
            <IonLabel>Create New Chat</IonLabel>
          </IonItem>
        </IonList>

        <div className="sign-out-button">
          <IonButton expand="block" onClick={signOut}>
            Sign Out
          </IonButton>
        </div>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Create New Chat</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="ion-padding">
              <IonItem>
                <IonLabel position="stacked">Chat Name</IonLabel>
                <IonInput
                  value={chatName}
                  placeholder="Enter chat name"
                  onIonChange={(e) => setChatName(e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Chat Topic</IonLabel>
                <IonInput
                  value={chatTopic}
                  placeholder="Enter chat topic"
                  onIonChange={(e) => setChatTopic(e.detail.value!)}
                />
              </IonItem>
              <IonButton expand="block" className="ion-margin-top" onClick={handleCreateChat}>
                Create Chat
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
