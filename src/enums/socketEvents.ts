export enum SocketEvents { 
    // events for chat
    SendingMessage = 'message-to-socket',
    MessageToUser = 'message-to-user',

    // events for matching
    UserLoggedIn = 'user-loggedIn',
    SessionJoined = 'session-joined',
    SessionLeft = 'session-left',
    LiveUsersList = 'live-users-list',
    InitiateCall = 'initiate-call',
    ReceiveCall = 'receive-call',
    SessionQuestions = 'session-questions',
    CallAccepted = 'call-accepted',
}

export enum RedisChannels { 
    Messages = 'MESSAGES',
    Register = 'REGISTER',
}

export enum KafkaTopics { 
    MESSAGES = 'MESSAGES',
}