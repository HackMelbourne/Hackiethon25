import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import {
    ChakraProvider,
    Box, Flex, VStack, Input, IconButton, Text, Tooltip, Menu, MenuButton, MenuList, MenuItem,
    Tabs, TabList, Tab, TabPanels, TabPanel, Spacer, CloseButton,
    Spinner, Image
} from '@chakra-ui/react';
import { AddIcon, ArrowUpIcon, SettingsIcon, CopyIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';

// --- Asset Imports ---
import blueIcon from './Assets/blueIcon.png';
import darkIcon from './Assets/darkIcon.png';
import midnightIcon from './Assets/midnightIcon.png';
import tabBlue from './Assets/tabBlue.png';
import tabBlueSelected from './Assets/tabBlueSelected.png';
import tabDark from './Assets/tabDark.png';
import tabDarkSelected from './Assets/tabDarkSelected.png';
import tabMidnight from './Assets/tabMidnight.png';
import tabMidnightSelected from './Assets/tabMidnightSelected.png';

// --- Internal Widget Component Logic ---
const KiwiWidgetInternal = () => {
    // --- Themes ---
    const themes = {
        light: { name: 'Light', bg: 'white', textColor: '#1A202C', borderColor: 'gray.300', inputBg: 'gray.50', inputColor: 'gray.800', buttonScheme: 'blue', headerBg: 'gray.100', iconColor: 'blue.600', closeIconColor: 'gray.500', chatBgUser: 'blue.500', chatColorUser: 'white', chatBgAi: 'gray.100', chatColorAi: 'gray.800', scrollTrack: 'gray.100', scrollThumb: 'gray.300', newChatBg: 'blue.500', newChatColor: 'white', widgetBorderWidth: '3px', menuBg: 'white', menuItemHoverBg: 'gray.100', minimizedIcon: blueIcon, tabIcon: tabBlue, tabIconSelected: tabBlueSelected, shadowColor: 'rgba(0, 0, 0, 0.2)', },
        dark: { name: 'Dark', bg: '#1A202C', textColor: 'gray.100', borderColor: 'gray.600', inputBg: 'gray.700', inputColor: 'white', buttonScheme: 'blue', headerBg: '#2D3748', iconColor: 'blue.300', closeIconColor: 'gray.500', chatBgUser: 'blue.600', chatColorUser: 'white', chatBgAi: 'gray.700', chatColorAi: 'gray.100', scrollTrack: 'gray.700', scrollThumb: 'gray.600', newChatBg: 'gray.700', newChatColor: 'blue.300', widgetBorderWidth: '3px', menuBg: '#2D3748', menuItemHoverBg: 'gray.600', minimizedIcon: darkIcon, tabIcon: tabDark, tabIconSelected: tabDarkSelected, shadowColor: 'rgba(0, 0, 0, 0.4)', },
        midnight: { name: 'Midnight', bg: '#1A1F3C', textColor: 'purple.100', borderColor: '#3A416F', inputBg: '#252C4A', inputColor: 'white', buttonScheme: 'purple', headerBg: '#252C4A', iconColor: 'purple.300', closeIconColor: 'gray.500', chatBgUser: 'purple.500', chatColorUser: 'white', chatBgAi: '#252C4A', chatColorAi: 'purple.100', scrollTrack: '#252C4A', scrollThumb: 'purple.700', newChatBg: '#252C4A', newChatColor: 'purple.300', widgetBorderWidth: '3px', menuBg: '#252C4A', menuItemHoverBg: '#3A416F', minimizedIcon: midnightIcon, tabIcon: tabMidnight, tabIconSelected: tabMidnightSelected, shadowColor: 'rgba(10, 10, 20, 0.4)', },
    };

    // --- API Key ---
    const GEMINI_API_KEY = "AIzaSyAxGAvrQACOtV2ZFl00oPEZp9TXwV3xE4I"; // please dont abuse my api key thanks.
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY" || !GEMINI_API_KEY) { console.warn("?? Gemini API Key is not configured in KiwiWidget.jsx. AI features will not work."); }

    // --- API Helper Function (Gemini) ---
    const fetchGeminiResponse = useCallback(async (messageHistory) => {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") { return "AI response disabled: API Key not configured."; }
        const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const contents = messageHistory.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));
        try {
            const response = await fetch(API_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: contents, "generationConfig": { "temperature": 0.7 } }) });
            if (!response.ok) { const errorData = await response.json().catch(() => ({ message: response.statusText })); console.error("API Error Response:", errorData); throw new Error(`API Error ${response.status}: ${errorData?.error?.message || errorData.message || 'Unknown error'}`); }
            const data = await response.json();
            const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!responseText) { console.warn("API response received, but no text found:", data); return "Received an empty or unexpected response from the AI."; }
            return responseText;
        } catch (error) { console.error("API Fetch Error:", error); return `Error communicating with AI: ${error.message}`; }
    }, []);

    // --- State ---
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTheme, setCurrentTheme] = useState('light');
    const [chatSessions, setChatSessions] = useState([{ id: Date.now(), name: "Chat 1", messages: [{ sender: 'ai', text: 'Hello! How can I help you today?' }] }]);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const MAX_TABS = 5;
    const [inputValue, setInputValue] = useState('');
    const [widgetPosition, setWidgetPosition] = useState(() => ({ x: window.innerWidth - 420, y: window.innerHeight - 650 }));
    const [widgetSize, setWidgetSize] = useState({ width: 400, height: 600 });
    const [loadingStates, setLoadingStates] = useState({});

    // --- Refs ---
    const chatContainerRefs = useRef({});

    // --- Derived State/Variables ---
    const colors = themes[currentTheme];

    // --- Effects ---
    useEffect(() => {
        const activeSession = chatSessions[activeTabIndex]; if (!activeSession) return; const activeChatRef = chatContainerRefs.current[activeSession.id]; const timer = setTimeout(() => { if (activeChatRef) { activeChatRef.scrollTop = activeChatRef.scrollHeight; } }, 100); return () => clearTimeout(timer);
    }, [activeTabIndex, chatSessions]);

    useEffect(() => { setInputValue(''); }, [activeTabIndex]);

    // --- Handlers ---
    const handleRightClickToggle = useCallback((event) => { event.preventDefault(); setIsExpanded(prev => !prev); }, []);
    const handleTabChange = (index) => { setActiveTabIndex(index); };
    const handleAddTab = useCallback(() => { if (chatSessions.length >= MAX_TABS) return; const newSessionId = Date.now(); const newSession = { id: newSessionId, name: `Chat ${chatSessions.length + 1}`, messages: [{ sender: 'ai', text: `New chat session started!` }] }; setChatSessions(prev => [...prev, newSession]); setActiveTabIndex(chatSessions.length); }, [chatSessions, MAX_TABS]);
    const handleCloseTab = useCallback((e, sessionIdToClose) => { e.stopPropagation(); if (chatSessions.length <= 1) return; const sessionIndexToClose = chatSessions.findIndex(s => s.id === sessionIdToClose); if (sessionIndexToClose === -1) return; let newActiveIndex = activeTabIndex; if (sessionIndexToClose === activeTabIndex) { newActiveIndex = Math.max(0, sessionIndexToClose - 1); } else if (sessionIndexToClose < activeTabIndex) { newActiveIndex = activeTabIndex - 1; } delete chatContainerRefs.current[sessionIdToClose]; setChatSessions(prev => prev.filter(s => s.id !== sessionIdToClose)); setActiveTabIndex(newActiveIndex); }, [chatSessions, activeTabIndex]);
    const handleSend = useCallback(async (sessionId) => { if (!inputValue.trim()) return; const currentInput = inputValue; setInputValue(''); const sessionIndex = chatSessions.findIndex(s => s.id === sessionId); if (sessionIndex === -1) return; const newUserMessage = { sender: 'user', text: currentInput }; setChatSessions(prevSessions => { const updatedSessions = [...prevSessions]; if (updatedSessions[sessionIndex]) { updatedSessions[sessionIndex] = { ...updatedSessions[sessionIndex], messages: [...updatedSessions[sessionIndex].messages, newUserMessage] }; } return updatedSessions; }); setLoadingStates(prev => ({ ...prev, [sessionId]: true })); const currentSessionMessages = chatSessions[sessionIndex]?.messages || []; const updatedMessagesForApi = [...currentSessionMessages, newUserMessage]; try { const aiResponseText = await fetchGeminiResponse(updatedMessagesForApi); const newAiMessage = { sender: 'ai', text: aiResponseText }; setChatSessions(prevSessions => { const updatedSessions = [...prevSessions]; const currentIndex = updatedSessions.findIndex(s => s.id === sessionId); if (currentIndex !== -1) { updatedSessions[currentIndex] = { ...updatedSessions[currentIndex], messages: [...updatedSessions[currentIndex].messages, newAiMessage] }; } return updatedSessions; }); } catch (error) { console.error("Error during message send/receive:", error); const errorMessage = { sender: 'ai', text: `An unexpected error occurred: ${error.message}` }; setChatSessions(prevSessions => { const updatedSessions = [...prevSessions]; const currentIndex = updatedSessions.findIndex(s => s.id === sessionId); if (currentIndex !== -1) { updatedSessions[currentIndex] = { ...updatedSessions[currentIndex], messages: [...updatedSessions[currentIndex].messages, errorMessage] }; } return updatedSessions; }); } finally { setLoadingStates(prev => ({ ...prev, [sessionId]: false })); } }, [inputValue, chatSessions, fetchGeminiResponse]);
    const handleInputChange = useCallback((event) => { setInputValue(event.target.value); }, []);
    const handleKeyPress = useCallback((event) => { const activeSession = chatSessions[activeTabIndex]; if (event.key === 'Enter' && !event.shiftKey && activeSession && !loadingStates[activeSession.id]) { event.preventDefault(); handleSend(activeSession.id); } }, [activeTabIndex, chatSessions, handleSend, loadingStates]);
    const handleCopy = useCallback((textToCopy) => { navigator.clipboard.writeText(textToCopy).catch(err => console.error("Failed to copy text: ", err)); }, []);

    // --- Constants for Sizes & Positioning ---
    const MINIMIZED_SIZE = { width: 95, height: 80 };
    const MINIMIZED_ICON_SIZE = '75px';
    const TAB_ICON_SIZE = '55px';
    const TAB_HEIGHT = '55px';
    const TAB_AREA_TOP_OFFSET = '-32px';
    const WIDGET_BODY_PADDING_TOP = '0px';
    const ADD_BUTTON_SIZE = 'xs';
    const ADD_BUTTON_MARGIN_BOTTOM = '12px';
    const TAB_MARGIN_RIGHT = '4px';
    const TAB_ANIMATION_DURATION = 2.8;

    // --- Render ---
    return (
        <Rnd
            default={{ 
                x: widgetPosition.x,
                y: widgetPosition.y,
                width: widgetSize.width,
                height: widgetSize.height
            }}
            disableDragging={true}
            enableResizing={false} 
            minWidth={isExpanded ? 320 : MINIMIZED_SIZE.width}
            minHeight={isExpanded ? 380 : MINIMIZED_SIZE.height}
            bounds="window" 
            onContextMenu={handleRightClickToggle} 
            style={{
                zIndex: 2147483647, 
                background: 'transparent',
                border: 'none',
                overflow: 'visible',
            }}
        >
            {/* Minimized View */}
            {!isExpanded && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} style={{ width: '100%', height: '100%' }}>
                    {/* Tooltip still useful */}
                    <Tooltip label={`KIWI (${themes[currentTheme].name}) - Right-click to expand`} placement="top">
                        <motion.div
                            style={{
                                width: '100%', height: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            whileHover={{ scale: 1.05 }}
                            animate={{ y: ["0px", "-4px", "0px"] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Image src={colors.minimizedIcon} alt={`${colors.name} theme icon`} boxSize={MINIMIZED_ICON_SIZE} objectFit="contain" draggable="false" style={{ filter: `drop-shadow(0 3px 5px ${colors.shadowColor})` }} />
                        </motion.div>
                    </Tooltip>
                </motion.div>
            )}

            {/* Expanded View */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div key="expanded-widget" initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.9, transition: { duration: 0.15 } }} transition={{ duration: 0.25, ease: "easeInOut" }} style={{ width: '100%', height: '100%' }}>
                        <Tabs index={activeTabIndex} onChange={handleTabChange} variant="unstyled" display="flex" flexDirection="column" height="100%" position="relative">
                            {/* TabList Area */}
                            <Flex position="absolute" top={TAB_AREA_TOP_OFFSET} left="15px" zIndex={10} alignItems="flex-end" pb="2px">
                                <TabList borderBottom="none" display="flex" alignItems="flex-end">
                                    {chatSessions.map((session, index) => (
                                        <Tab key={session.id} p={0} mr={TAB_MARGIN_RIGHT} border="none" bg="transparent" _selected={{}} _focus={{ boxShadow: 'none' }} position="relative" title={session.name} height={TAB_HEIGHT} sx={{ WebkitTapHighlightColor: 'transparent' }}>
                                            <motion.div animate={{ y: ["0px", "-2px", "0px"] }} transition={{ duration: TAB_ANIMATION_DURATION, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 }}>
                                                <Box position="relative" sx={{ '& img': { filter: `drop-shadow(0 2px 3px ${colors.shadowColor})`, transition: 'filter 0.2s ease-out', }, '&:hover img': { filter: `drop-shadow(0 3px 5px ${colors.shadowColor})`, } }}>
                                                    <Image src={activeTabIndex === index ? colors.tabIconSelected : colors.tabIcon} alt={`Tab ${index + 1} icon`} boxSize={TAB_ICON_SIZE} objectFit="contain" draggable="false" />
                                                    {chatSessions.length > 1 && (<CloseButton size="xs" borderRadius="full" bg="rgba(0,0,0,0.4)" color="white" _hover={{ bg: 'red.500', color: 'white' }} position="absolute" top="2px" right="2px" zIndex={12} onClick={(e) => handleCloseTab(e, session.id)} aria-label="Close tab" />)}
                                                </Box>
                                            </motion.div>
                                        </Tab>
                                    ))}
                                </TabList>
                                {/* Add Tab Button */}
                                <Tooltip label="New Chat" placement="bottom">
                                    <IconButton aria-label="Add new tab" icon={<AddIcon />} size={ADD_BUTTON_SIZE} variant="solid" colorScheme={colors.buttonScheme} bg={colors.newChatBg} color={colors.newChatColor} onClick={handleAddTab} isDisabled={chatSessions.length >= MAX_TABS} isRound ml={2} mb={ADD_BUTTON_MARGIN_BOTTOM} boxShadow="md" zIndex={11} />
                                </Tooltip>
                            </Flex>

                            {/* Main Widget Body Box */}
                            <Box width="100%" height="100%" bg={colors.bg} borderWidth={colors.widgetBorderWidth || '2px'} borderStyle="solid" borderColor={colors.borderColor} borderRadius="xl" boxShadow="0 10px 25px rgba(0,0,0,0.1), 0 5px 10px rgba(0,0,0,0.08)" overflow="hidden" display="flex" flexDirection="column" pt={WIDGET_BODY_PADDING_TOP} position="relative">
                                <Flex
                                    px={3} py={1} borderBottom={`1px solid ${colors.borderColor}`} alignItems="center" flexShrink={0} bg={colors.headerBg} position="relative" zIndex={5}
                                >
                                    <Spacer />
                                    {/* Settings Menu */}
                                    <Menu>
                                        <Tooltip label="Settings" placement="bottom">
                                            <MenuButton as={IconButton} aria-label='Options' icon={<SettingsIcon />} size="sm" variant='ghost' color={colors.iconColor} isRound />
                                        </Tooltip>
                                        <MenuList bg="white" borderColor="gray.200" zIndex={2147483647} color="black" boxShadow="md" minWidth="140px">
                                            <MenuItem onClick={() => setCurrentTheme('light')} _hover={{ bg: "gray.100" }} color="black"> {themes.light.name} Theme </MenuItem>
                                            <MenuItem onClick={() => setCurrentTheme('dark')} _hover={{ bg: "gray.100" }} color="black"> {themes.dark.name} Theme </MenuItem>
                                            <MenuItem onClick={() => setCurrentTheme('midnight')} _hover={{ bg: "gray.100" }} color="black"> {themes.midnight.name} Theme </MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Flex>

                                {/* Tab Panels */}
                                <TabPanels flexGrow={1} bg={colors.bg} overflow="hidden">
                                    {chatSessions.map((session) => (
                                        <TabPanel key={session.id} p={0} display="flex" flexDirection="column" flexGrow={1} height="100%">
                                            {/* Chat Messages Area */}
                                            <Box flex="1" overflowY="auto" p={4} ref={(el) => chatContainerRefs.current[session.id] = el} css={{ '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { background: colors.scrollTrack, borderRadius: '4px' }, '&::-webkit-scrollbar-thumb': { background: colors.scrollThumb, borderRadius: '4px' }, '&::-webkit-scrollbar-thumb:hover': { background: colors.iconColor }, scrollbarWidth: 'thin', scrollbarColor: `${colors.scrollThumb} ${colors.scrollTrack}`, }}>
                                                <VStack spacing={3} align="stretch">
                                                    <AnimatePresence initial={false}>
                                                        {session.messages.map((msg, index) => (
                                                            <motion.div key={`${session.id}-${index}`} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.25 }} style={{ width: '100%' }}>
                                                                <Flex justify={msg.sender === 'user' ? 'flex-end' : 'flex-start'} alignItems="center" w="100%">
                                                                    {msg.sender === 'user' && (<Tooltip label="Copy text" placement="top" openDelay={300}> <IconButton aria-label="Copy message" icon={<CopyIcon />} size="xs" variant="ghost" color={colors.iconColor} mr={2} onClick={() => handleCopy(msg.text)} alignSelf="center" /> </Tooltip>)}
                                                                    <Box bg={msg.sender === 'user' ? colors.chatBgUser : colors.chatBgAi} color={msg.sender === 'user' ? colors.chatColorUser : colors.chatColorAi} px={3} py={2} borderRadius="lg" maxWidth="85%" boxShadow="sm" wordBreak="break-word">
                                                                        <Text fontSize="sm" whiteSpace="pre-wrap">{msg.text}</Text>
                                                                    </Box>
                                                                    {msg.sender === 'ai' && (<Tooltip label="Copy text" placement="top" openDelay={300}> <IconButton aria-label="Copy message" icon={<CopyIcon />} size="xs" variant="ghost" color={colors.iconColor} ml={2} onClick={() => handleCopy(msg.text)} alignSelf="center" /> </Tooltip>)}
                                                                </Flex>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                    {loadingStates[session.id] && (<Flex justify="flex-start" mt={2} pl={1} alignItems="center"> <Spinner size="sm" color={colors.iconColor} mr={2} /> <Text fontSize="xs" color="gray.500">Kiwi is thinking...</Text> </Flex>)}
                                                </VStack>
                                            </Box>

                                            {/* Input Area */}
                                            <Flex p={3} borderTop={`1px solid ${colors.borderColor}`} align="center" flexShrink={0}>
                                                <Input placeholder="Type your message..." value={inputValue} onChange={handleInputChange} onKeyPress={handleKeyPress} bg={colors.inputBg} color={colors.inputColor} borderColor={colors.borderColor} _focus={{ borderColor: colors.iconColor, boxShadow: `0 0 0 1px ${colors.iconColor}` }} borderRadius="md" size="sm" flexGrow={1} mr={2} isDisabled={loadingStates[session.id]} />
                                                <IconButton aria-label="Send message" icon={<ArrowUpIcon />} colorScheme={colors.buttonScheme} onClick={() => handleSend(session.id)} borderRadius="md" size="sm" isDisabled={!inputValue.trim() || loadingStates[session.id]} />
                                            </Flex>
                                        </TabPanel>
                                    ))}
                                </TabPanels>
                            </Box>
                        </Tabs>
                    </motion.div>
                )}
            </AnimatePresence>
        </Rnd>
    );
}; 

// --- Wrapper Component with Provider ---
function KiwiWidget() {
    return (
        <ChakraProvider resetCSS={true}>
            <KiwiWidgetInternal />
        </ChakraProvider>
    );
}

// Export the wrapper component as the default
export default KiwiWidget;