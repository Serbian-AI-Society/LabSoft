import React, { useState, useEffect, useRef } from 'react';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonToolbar, IonFooter, IonItem, IonIcon, IonCard, IonCardContent } from '@ionic/react';
import { sendOutline } from 'ionicons/icons';
import './Home.css';

interface HomeProps {
  user: any;
  selectedChat: { chatId: string; chatName: string } | null;
}

const Home: React.FC<HomeProps> = ({ user, selectedChat }) => {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChat) {
      // Fetch the chat history when a chat is selected
      const fetchChatHistory = async () => {
        try {
          const response = await fetch(`https://225aetnmd3.execute-api.eu-central-1.amazonaws.com/Prod/getChatHistory?ChatID=${selectedChat.chatId}`, {
            method: 'GET',
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          setMessages(data.messages);
        } catch (error) {
          console.error('Error fetching chat history:', error);
        }
      };

      fetchChatHistory();
    }
  }, [selectedChat]);

  const handleSend = async () => {
    if (input.trim() === '' || waitingForResponse || !selectedChat) return;

    const newMessage = { text: input, sender: 'user' as const };
    setMessages([...messages, newMessage]);
    setInput('');
    setWaitingForResponse(true);

    // Call the API to get the bot response
    const botResponse = await getBotResponse(input, selectedChat.chatId);
    const botMessage = { text: botResponse, sender: 'bot' as const };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
    console.log(messages);
    setWaitingForResponse(false);
  };

  const getBotResponse = async (question: string, chatId: string) => {
    try {
      const response = await fetch('https://225aetnmd3.execute-api.eu-central-1.amazonaws.com/Prod/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          UserID: user.username,
          ChatID: chatId,
          Question: question
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.Response;
    } catch (error) {
      console.error('Error fetching bot response:', error);
      return 'Sorry, there was an error processing your request.';
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonHeader className="ion-text-center" color='success'>
            {selectedChat ? selectedChat.chatName : 'Study Buddy'}
          </IonHeader>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard className="chat-card">
          <IonCardContent className="chat-content">
            <div className="messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>

      <IonFooter>
        <IonCard className="input-card">
          <IonItem lines="none" className="input-item">
            <textarea
              value={input}
              placeholder="Type a message"
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field"
              rows={1}
            />
            <IonIcon
              icon={sendOutline}
              slot="end"
              className={`send-icon ${waitingForResponse ? 'disabled' : ''}`}
              onClick={handleSend}
              style={{ pointerEvents: waitingForResponse ? 'none' : 'auto', cursor: waitingForResponse ? 'not-allowed' : 'pointer' }}
            />
          </IonItem>
        </IonCard>
      </IonFooter>
    </IonPage>
  );
};

export default Home;
