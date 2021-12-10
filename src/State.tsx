import { message } from "antd";
import { makeObservable, observable, action } from "mobx";

export interface Message {
  createdAt: Date;
  value: string;
  user: string;
}

export enum ConnectionStatus {
  disconnected,
  connecting,
  connected,
  error,
}

export default class AppState {
  status = ConnectionStatus.disconnected;
  username = "";
  inputText = "";
  users = null as string[] | null;
  typingUsers = [] as string[];
  messages = [] as Message[];

  socket = null as WebSocket | null;

  typing = false;
  timeOutId = null as number | null;

  constructor() {
    makeObservable(this, {
      status: observable,
      username: observable,
      users: observable,
      typingUsers: observable,
      messages: observable,
      inputText: observable,

      // actions
      onUsername: action,
      connect: action,
      onMessage: action,
      disconnect: action,
      sendMessage: action,
      onInput: action,
    });
  }

  onUsername(text: string): void {
    this.username = text;
  }

  async connect(): Promise<void> {
    this.disconnect();
    this.status = ConnectionStatus.connecting;
    this.socket = new WebSocket("wss://meeduws.herokuapp.com");
    this.socket.onopen = () => {};
    this.socket.onerror = (event) => {
      console.log(event);
      if (event.type === "error") {
        this.status = ConnectionStatus.error;
      }
    };

    this.socket.onmessage = (event) => {
      this.onMessage(event.data);
    };
  }

  onMessage = (m: string) => {
    if (m === "username_not_available") {
      this.status = ConnectionStatus.disconnected;
      message.warn("username not available");
    } else if (m === "connected") {
      this.emit("join", this.username.trim());
    } else {
      const { event, data }: { event: string; data: any } = JSON.parse(m);
      switch (event) {
        case "joined":
          this.status = ConnectionStatus.connected;
          this.users = data.users;
          break;

        case "new_user":
          this.users = (data.users as string[]).filter(
            (e) => e !== this.username
          );
          message.info(`${data.user} has joined`);
          break;

        case "left":
          this.users = (data.users as string[]).filter(
            (e) => e !== this.username
          );
          message.warn(`${data.user} has left`);
          break;

        case "typing":
          this.typingUsers = [...this.typingUsers, data.user];
          break;

        case "stop_typing":
          this.typingUsers = this.typingUsers.filter((e) => e !== data.user);
          break;

        case "new_message":
          this.messages = [
            ...this.messages,
            {
              createdAt: new Date(),
              user: data.user,
              value: data.message,
            },
          ];
          this.scrollToEnd();
          break;
      }
    }
  };

  emit = (eventName: string, data: any) => {
    this.socket?.send(JSON.stringify({ event: eventName, data }));
  };

  sendMessage() {
    this.emit("new_message", this.inputText);
    this.messages.push({
      createdAt: new Date(),
      value: this.inputText,
      user: this.username,
    });
    this.inputText = "";

    if (this.typing) {
      this.stopTyping();
    }

    this.scrollToEnd();
  }

  onInput(text: string) {
    this.inputText = text;
    this.startTyping();
  }

  startTyping() {
    if (this.timeOutId != null) {
      clearTimeout(this.timeOutId);
    }
    this.timeOutId = window.setTimeout(() => {
      this.stopTyping();
    }, 3000);
    if (!this.typing) {
      this.emit("typing", "");
      this.typing = true;
    }
  }

  stopTyping() {
    if (this.timeOutId != null) {
      this.typing = false;
      clearTimeout(this.timeOutId);
      this.emit("stop_typing", "");
      this.timeOutId = null;
    }
  }

  disconnect = () => {
    if (this.socket != null) {
      this.socket.close();
    }
    this.status = ConnectionStatus.disconnected;
    this.users = null;
    this.typingUsers = [];
    this.messages = [];
    this.inputText = "";
  };

  scrollToEnd() {
    setTimeout(() => {
      const element = document.getElementById("end");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
  }
}
