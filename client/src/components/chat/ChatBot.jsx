import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/useAuthStore';
import { api } from '../../lib/axios';
import { MessageCircle, Send, X, Loader, Mic, MicOff, Volume2 } from 'lucide-react';

const TypingMessage = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const cleanText = text.replace(/\*/g, '');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < cleanText.length) {
        setDisplayedText(cleanText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [cleanText]);

  return (
    <div className="whitespace-pre-wrap">
      {displayedText}
      {displayedText.length < cleanText.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
};

const ChatBot = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const isOpenRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (!isOpen) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  }, [isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;

      const langCode = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
      recognitionRef.current.lang = langCode;
      console.log('🎤 Language set to:', langCode);

      recognitionRef.current.onstart = () => {
        console.log('🎤 Voice recognition started in', i18n.language);
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('🎤 Voice recognition error:', event.error);
        setIsListening(false);
        setError(`Voice error: ${event.error}. Please check browser permissions.`);
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        console.log('🎤 Result event received:', event.results.length, 'results');

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          console.log(`Result ${i}: isFinal=${event.results[i].isFinal}, text="${transcript}"`);

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Show interim results while speaking
        if (interimTranscript) {
          console.log('📝 Interim:', interimTranscript);
          setInput(interimTranscript);
        }

        // Lock in final results
        if (finalTranscript) {
          console.log('📝 Final transcribed:', finalTranscript);
          setInput((prev) => finalTranscript.trim());
        }
      };
    } else {
      console.warn('❌ Speech Recognition not supported in this browser');
    }
  }, [i18n.language]);

  const startListening = () => {
    if (recognitionRef.current) {
      setInput('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const closeChat = () => {
    stopSpeaking();
    stopListening();
    setIsOpen(false);
  };

  const speakText = (text) => {
    if (!isOpenRef.current || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', text: userMessage, timestamp: new Date() }
    ]);

    setLoading(true);

    try {
      const response = await api.post('/chat', { message: userMessage });

      const cleanMessage = response.data.message.replace(/\*/g, '');
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: cleanMessage,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMessage]);

      if (isOpenRef.current) {
        speakText(cleanMessage);
      }
    } catch (err) {
      setError(err.response?.data?.message || t('chatbot.errorSendingMessage'));
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'error',
          text: error || t('chatbot.errorOccurred'),
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => (isOpen ? closeChat() : setIsOpen(true))}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-accent-blue shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-shadow ${isOpen ? 'max-sm:hidden' : ''}`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse Animation when closed */}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.3], opacity: [1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-primary"
          />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 400, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 400, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-40 flex flex-col bg-gradient-secondary border border-slate-700 shadow-2xl overflow-hidden
              inset-0 rounded-none h-full w-full max-w-none
              sm:inset-auto sm:bottom-24 sm:right-6 sm:left-auto sm:w-[calc(100vw-3rem)] sm:max-w-2xl sm:h-[min(600px,calc(100dvh-7rem))] sm:rounded-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-accent-blue/10 px-4 py-3 border-b border-slate-700 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-semibold text-white text-sm">{t('chatbot.medicalAssistant')}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t('chatbot.role')} {user?.role || 'User'}</p>
              </div>
              <button
                type="button"
                onClick={closeChat}
                className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center"
                >
                  <MessageCircle className="w-8 h-8 text-slate-500 mb-3" />
                  <p className="text-xs text-slate-400">{t('chatbot.startConversation')}</p>
                  <p className="text-xs text-slate-500 mt-2">{t('chatbot.askAbout')}</p>
                </motion.div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.type === 'ai' && (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs mr-2 flex-shrink-0 mt-1">
                          AI
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div
                          className={`max-w-[85%] sm:max-w-xl px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm ${
                            msg.type === 'user'
                              ? 'bg-primary text-white rounded-br-none'
                              : msg.type === 'error'
                                ? 'bg-accent-rose/20 text-accent-rose rounded-bl-none'
                                : 'bg-slate-800 text-slate-100 rounded-bl-none'
                          }`}
                        >
                          {msg.type === 'ai' ? (
                            <TypingMessage text={msg.text} />
                          ) : (
                            msg.text
                          )}
                        </div>
                        {msg.type === 'ai' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => speakText(msg.text)}
                            className="mt-1 text-xs text-primary hover:text-accent-blue flex items-center gap-1"
                          >
                            <Volume2 className="w-3 h-3" />
                            {isSpeaking ? t('chatbot.speaking') : t('chatbot.speak')}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Loading Indicator */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs mr-2 flex-shrink-0 mt-1">
                        AI
                      </div>
                      <div className="bg-slate-800 px-3 py-2 rounded-lg rounded-bl-none flex items-center gap-1">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-slate-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                          className="w-2 h-2 bg-slate-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-slate-400 rounded-full"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Shimmer Loading Bar */}
                  {loading && (
                    <motion.div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-full bg-gradient-to-r from-transparent via-primary to-transparent w-1/4"
                      />
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-2 bg-accent-rose/10 border-t border-accent-rose/30 text-xs text-accent-rose"
              >
                {error}
              </motion.div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="border-t border-slate-700 p-3 bg-slate-900/50 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex gap-2">
                {/* Microphone Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                    isListening
                      ? 'bg-accent-rose text-white'
                      : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-primary hover:border-primary'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </motion.button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => !isListening && setInput(e.target.value)}
                  placeholder={isListening ? t('chatbot.listening') || 'Listening...' : t('chatbot.typeMessage')}
                  disabled={loading}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading || !input.trim() || isListening}
                  className="bg-primary hover:brightness-110 text-white rounded-lg p-2 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              </div>

              {/* Listening Indicator */}
              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs text-accent-rose flex items-center gap-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-2 h-2 bg-accent-rose rounded-full"
                  />
                  {t('chatbot.listening')}
                </motion.div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
