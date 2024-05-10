import WebSocket, { WebSocketServer } from 'ws';

interface SignalingMessage {
    type: string;
    [key: string]: any; 
}

const wss = new WebSocketServer({ port: 8080 });

// Store connections for sender and receiver
let senderConnection: WebSocket | null = null;
let receiverConnection: WebSocket | null = null;

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message: string) {
        const data: SignalingMessage = JSON.parse(message);
        switch(data.type) {
            case 'sender':
                senderConnection = ws;
                console.log('Sender connected');
                break;
            case 'receiver':
                receiverConnection = ws;
                console.log('Receiver connected');
                break;
            case 'icecandidates':
                if (ws === senderConnection) {
                    if (receiverConnection) {
                        receiverConnection.send(JSON.stringify(data));
                    } else {
                        console.error('Receiver not connected');
                    }
                } else if (ws === receiverConnection) {
                    if (senderConnection) {
                        senderConnection.send(JSON.stringify(data));
                    } else {
                        console.error('Sender not connected');
                    }
                } else {
                    console.error('Unknown connection');
                }
                break;
            default:
                console.error('Unknown message type');
                break;
        }
    });

    ws.on('close', function() {
        if (ws === senderConnection) {
            console.log('Sender disconnected');
            senderConnection = null;
        } else if (ws === receiverConnection) {
            console.log('Receiver disconnected');
            receiverConnection = null;
        }
    });
});
