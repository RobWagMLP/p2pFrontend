export class Storage {
    
    private static instance: Storage;
    
    private username: string;
    private room_id:  number;

    private constructor() {

    }

    static getInstance() : Storage {
        if(this.instance == null) {
            this.instance = new Storage();
        }
        return this.instance;
    }

    setRoomID(room_id: number)  {
        this.room_id = room_id;
    }

    getRoomID(): number {
        return this.room_id;
    }

    setUsername(name: string) {
        this.username = name;
    }

    getUserName(): string {
        return this.username;
    }
}