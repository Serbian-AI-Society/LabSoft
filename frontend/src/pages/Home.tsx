import React, { useState, useEffect, useRef } from 'react';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonToolbar, IonFooter, IonItem, IonIcon, IonCard, IonCardContent, IonButton } from '@ionic/react';
import { sendOutline } from 'ionicons/icons';
import './Home.css';

interface HomeProps {
  user: any;
  chatID: string | null;
}

const Home: React.FC<HomeProps> = ({ user, chatID }) => {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (chatID) {
        try {
          const response = await fetch(`https://225aetnmd3.execute-api.eu-central-1.amazonaws.com/Prod/getChatHistory?ChatID=${chatID}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();

          // Format the data for messages state
          const formattedMessages = data.messages.map((item: any) => [
            { text: item.Question.replace(/\\n/g, '\n'), sender: 'user' as const },
            { text: item.AIResponse.replace(/\\n/g, '\n'), sender: 'bot' as const }
          ]).flat();

          setMessages(formattedMessages);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [chatID]);

  const handleSend = async () => {
    if (input.trim() === '' || waitingForResponse || !chatID) return;

    const newMessage = { text: input, sender: 'user' as const };
    setMessages([...messages, newMessage]);
    setInput('');
    setWaitingForResponse(true);

    const botResponse = await getBotResponse(input);
    const botMessage = { text: botResponse, sender: 'bot' as const };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
    setWaitingForResponse(false);
  };

  const getBotResponse = async (question: string) => {
    try {
      if (!user.username || !chatID) {
        throw new Error('Missing user or chat ID');
      }

      const response = await fetch('https://225aetnmd3.execute-api.eu-central-1.amazonaws.com/Prod/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserID: user.username,
          ChatID: chatID,
          Question: question,
        }),
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

  const handleGenerateText = async () => {
    try {
      if (!user.username || !chatID) {
        throw new Error('Missing user or chat ID');
      }

      const response = await fetch('https://225aetnmd3.execute-api.eu-central-1.amazonaws.com/Prod/gentest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserID: user.username,
          ChatID: chatID,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const generatedMessage = formatQuizMessage(data.Response);
      setMessages((prevMessages) => [...prevMessages, generatedMessage]);
    } catch (error) {
      console.error('Error generating text:', error);
    }
  };

  const formatQuizMessage = (response: string) => {
    try {
      const parsedResponse = JSON.parse(response);
      const { pitanje, ponudjeni_odgovori } = parsedResponse;
      const formattedText = `${pitanje}\n\n` +
                            Object.entries(ponudjeni_odgovori)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join('\n');
      return { text: formattedText, sender: 'bot' as const };
    } catch (error) {
      console.error('Error parsing quiz response:', error);
      return { text: 'There was an error generating the quiz.', sender: 'bot' as const };
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonHeader className="ion-text-center" color="success">
            Study Buddy
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
              onChange={(e) => setInput(e.target.value)}
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
            <IonButton slot="end" onClick={handleGenerateText}>
              Generate Test
            </IonButton>
          </IonItem>
        </IonCard>
      </IonFooter>
    </IonPage>
  );
};

export default Home;
