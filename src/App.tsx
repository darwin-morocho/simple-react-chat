import React from "react";
import "./App.css";
import { observer } from "mobx-react";
import AppState, { ConnectionStatus } from "./State";

import { Layout, Menu, Spin, List, Input } from "antd";
import { ThunderboltFilled } from "@ant-design/icons";
import { Content, Footer, Header } from "antd/lib/layout/layout";
import SubMenu from "antd/lib/menu/SubMenu";
import moment from "moment";

const App = observer(({ state }: { state: AppState }) => {
  const { status, users, username, messages, inputText } = state;
  return (
    <div className="App">
      <header>
        {status === ConnectionStatus.disconnected && users === null && (
          <div className="App-header">
            <p>What's your nickname?</p>
            <input
              autoFocus
              onChange={(e) => {
                state.onUsername(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (username.trim().length > 1) {
                    state.connect();
                  }
                }
              }}
            />
          </div>
        )}

        {status === ConnectionStatus.connecting && users === null && (
          <div className="App-header">
            <Spin size="large" />
          </div>
        )}

        {status === ConnectionStatus.error && (
          <div className="App-header">
            <p>Error</p>
          </div>
        )}
      </header>

      {users != null && (
        <Layout style={{ width: "100%", height: "100vh" }}>
          <Layout className="site-layout">
            <Content
              style={{
                margin: "24px 16px 0",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Header>
                <div className="logo">
                  <div>
                    <ThunderboltFilled style={{ color: "#64dd17" }} />
                    <span> {username}</span>
                  </div>
                </div>
                <Menu theme="dark" mode="horizontal">
                  <SubMenu key="sub4" title={`Active users (${users.length})`}>
                    {users.map((e) => (
                      <Menu.Item key={e}>{e}</Menu.Item>
                    ))}
                  </SubMenu>

                  <Menu.Item key="github">
                    <a target="_blank" href="https://github.com/darwin-morocho/simple-react-chat">
                      GitHub
                    </a>
                  </Menu.Item>
                  <Menu.Item
                    key="disconnect"
                    onClick={() => {
                      state.disconnect();
                    }}
                  >
                    Disconnect
                  </Menu.Item>
                </Menu>
              </Header>

              <List
                style={{ flex: 1, backgroundColor: "#fff", overflowY: "auto" }}
                dataSource={messages}
                renderItem={(e, index) => {
                  const isMe = e.user === username;
                  return (
                    <>
                      <div className={isMe ? "is-me" : "is-not-me"}>
                        <div className="content">
                          <div className="user">{isMe ? "You" : e.user}</div>
                          <div className="text">{e.value}</div>
                          <div className="date">
                            {moment(e.createdAt).fromNow()}
                          </div>
                        </div>
                      </div>
                      {index === messages.length - 1 && <div id="end"></div>}
                    </>
                  );
                }}
              />
              <br />
              <Input
                size="large"
                value={inputText}
                placeholder="Type here..."
                onChange={(e) => state.onInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputText.trim().length > 0) {
                    state.sendMessage();
                  }
                }}
              ></Input>
              <br />
            </Content>
          </Layout>
          <Footer>
            Created by{" "}
            <a target="_blank" href="https://meedu.app">
              MEEDU.APP
            </a>
          </Footer>
        </Layout>
      )}
    </div>
  );
});

export default App;
