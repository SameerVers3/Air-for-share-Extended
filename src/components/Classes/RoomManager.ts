import { FirebaseService } from '~/lib/firebase';

export class RoomManager {
  private firebaseService: FirebaseService;
  public roomId: string | null = null;

  constructor() {
    this.firebaseService = new FirebaseService();
  }

  private async generateRoomId(): Promise<string> {
    let roomId = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const roomIdLength = 5;

    while (true) {
      roomId = '';
      for (let i = 0; i < roomIdLength; i++) {
        roomId += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const roomExists = await this.firebaseService.doesRoomExist(roomId);

      if (!roomExists) {
        break;
      }
    }

    return roomId;
  }

  public async roomValid(roomId: string): Promise<boolean> {
    const roomExists = await this.firebaseService.doesRoomExist(roomId);
    return roomExists;
  }

  public async createRoom(ip: string): Promise<string> {
    this.roomId = await this.generateRoomId();
    await this.firebaseService.createRoom(this.roomId, ip);
    return this.roomId;
  }

  public async joinRoom(roomId: string, ip: string): Promise<{
    success: boolean;
    message: string;
  }> {
    this.roomId = roomId;
    console.log("Joining room with ID: ", roomId);
    console.log("IP: ", ip);
    return await this.firebaseService.joinRoom(roomId, ip);
  }

  public async joinPublicRoom(ip: string): Promise<{
    success: boolean;
    message: string;
  }> {
    console.log("Joining public room with IP: ", ip);
    this.roomId = ip;
    
    const res = await this.firebaseService.joinPublicRoom(ip);
    console.log(res);
    return res;
  }

  
  // Removed duplicate listenForPublicMessages method

  public async sendMessage(messageContent: string): Promise<void> {
    if (!this.roomId) {
      throw new Error('No room joined or created.');
    }
    await this.firebaseService.sendMessage(this.roomId, messageContent);
  }

  public listenForMessages(callback: (messages: any) => void): void {
    if (!this.roomId) {
      throw new Error('No room joined or created.');
    }
    this.firebaseService.listenForMessages(this.roomId, callback);
  }

  public async sendPublicMessage(messageContent: string): Promise<void> {
    if (!this.roomId) {
      throw new Error('No room joined or created.');
    }
    await this.firebaseService.sendPublicMessage(this.roomId, messageContent);
  }

  public listenForPublicMessages(callback: (messages: any) => void): void {
    if (!this.roomId) {
      throw new Error('No room joined or created.');
    }
    this.firebaseService.listenForPublicMessages(this.roomId, callback);
  }
}
