export interface Message {
    groupID: number;
    sender: string;
    channel: string;
    text: string;
    messageType?: string;
    imageUrl?: string;
    profileImg?: string;
}
