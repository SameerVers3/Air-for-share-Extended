import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, update, get, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASEURL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
};

export class FirebaseService {
  getRoomRef(roomId: string) {
    throw new Error('Method not implemented.');
  }
  private app;
  private db;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
  }

  private async getDeviceId(): Promise<string> {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  }

  public async doesRoomExist(roomId: string): Promise<boolean> {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    const roomSnapshot = await get(roomRef);
    return roomSnapshot.exists();
  }
  

  public async createRoom(roomId: string, ip: string): Promise<void> {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    await set(roomRef, {
      ip,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      members: {},
      content: ""
    });
  }

  public async joinPublicRoom(ip: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log("2. Joining public room with IP: ", ip);
      
      // Replace dots with underscores to create a valid path
      const sanitizedIp = ip.replace(/\./g, '_');
      console.log("2. Sanitized Room ID: ", sanitizedIp);
      
      const roomRef = ref(this.db, 'rooms/' + sanitizedIp);
      const roomSnapshot = await get(roomRef);
      console.log("2. Room snapshot: ", roomSnapshot);
      
      if (!roomSnapshot.exists()) {
        console.log("Room does not exist");
        await set(roomRef, {
          ip,  // Store the original IP
          createdAt: Date.now(),
          updatedAt: Date.now(),
          content: ""
        });
        return {
          success: true,
          message: "Room created"
        };
      } else {
        console.log("Room already exists");
        return {
          success: true,
          message: "Room already exists"
        };
      }
    } catch (error) {
      console.error("Error joining public room:", error);
      return {
        success: false,
        message: `Error joining room: ${error.message}`
      };
    }
  }

  public async listenForPublicMessages(roomId: string, callback: (messages: any) => void): Promise<void> {
    const sanitizedRoomId = roomId.replace(/\./g, '_');
    const messageRef = ref(this.db, `rooms/${sanitizedRoomId}/content`);
    onValue(messageRef, (snapshot: { val: () => any; }) => {
      const messages = snapshot.val();
      callback(messages);
    });
  }

  public async sendPublicMessage(roomId: string, messageContent: string): Promise<void> {
    const sanitizedRoomId = roomId.replace(/\./g, '_');
    const messageRef = ref(this.db, `rooms/${sanitizedRoomId}`);
    await update(messageRef, {
      content: messageContent,
      updatedAt: Date.now(),
    });
  }


  public async joinRoom(roomId: string, ip: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    const roomSnapshot = await get(roomRef);
  
    console.log("Joining room with ID: ", roomId);
  
    if (roomSnapshot.exists()) {
      const roomData = roomSnapshot.val();
  
      console.log("Room data: ", roomData);
  
      if (roomData.ip !== ip) {
        console.log("IP does not match");
        return {
          success: false,
          message: "IP does not match",
        };
      }
  
      console.log("IP matches");
  
      const deviceId = await this.getDeviceId();
      console.log("Device ID: ", deviceId);
  
      const membersRef = ref(this.db, `rooms/${roomId}/members`);
      const membersSnapshot = await get(membersRef);
  
      if (membersSnapshot.exists()) {
        const membersData = membersSnapshot.val();
        
        // Check if the deviceId already exists in the members data
        if (membersData[deviceId]) {
          console.log("Member already exists");
          return {
            success: true,
            message: "Member already exists",
          };
        }
      }
  
      // Add the member if they don't exist
      await update(membersRef, {
        [deviceId]: { ip },
      });
  
      console.log("Member added");
  
      return {
        success: true,
        message: "Member added",
      };
    }
  
    console.log("Room does not exist");
    return {
      success: false,
      message: "Room does not exist",
    };
  }

  public async getMemberInfo(roomId: string, deviceId: string): Promise<any> {
    const memberRef = ref(this.db, `rooms/${roomId}/members/${deviceId}`);
    const memberSnapshot = await get(memberRef);
    return memberSnapshot.exists() ? memberSnapshot.val() : null;
  }
  

  public async sendMessage(roomId: string, messageContent: string): Promise<void> {
    const deviceId = await this.getDeviceId();
    const memberInfo = await this.getMemberInfo(roomId, deviceId);

    if (!memberInfo) {
      throw new Error('You are not a member of this room.');
    }

    const messsageRef = ref(this.db, `rooms/${roomId}`);

    await update(messsageRef, {
      content: messageContent,
      updatedAt: Date.now(),
    });
  }

  public async listenForMessages(roomId: string, callback: (messages: any) => void): Promise<void> {
    const messageRef = ref(this.db, `rooms/${roomId}/content`);
    onValue(messageRef, (snapshot: { val: () => any; }) => {
      const messages = snapshot.val();
      callback(messages);
    });
  }
}
