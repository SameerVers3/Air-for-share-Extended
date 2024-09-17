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


  public async joinRoom(roomId: string, ip: string): Promise<boolean> {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    const roomSnapshot = await get(roomRef);

    if (roomSnapshot.exists()) {
      const roomData = roomSnapshot.val();

      if (roomData.ip !== ip) {
        return false;
      }

      const deviceId = await this.getDeviceId();

      const membersRef = ref(this.db, `rooms/${roomId}/members`);
      await update(membersRef, {
        [deviceId]: { ip },
      });

      return true;
    }

    return false;
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
