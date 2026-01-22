import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setUser, clearUser } from "./store/authSlice";
import { Routes, Route } from 'react-router-dom'
import './App.css'

import MainNavbar from './routes/MainNavbar'
import HomePage from './routes/HomePage'
import Login from './routes/AccountManage/Login'
import Register from './routes/AccountManage/Register'

import ForumList from './routes/Forums/ForumList'
import ForumPosts from './routes/Forums/ForumPosts'
import PostDetail from './routes/Forums/PostDetail'
import WritePostPage from './routes/Forums/WritePostPage'
import EditPostPage from './routes/Forums/EditPostPage'

import ReqAuth from './routes/ReqAuth'
import MyPage from './routes/AccountManage/MyPage'

import ChatPage from './routes/Chattings/ChatPage'
import ChatRoomPanel from './routes/Chattings/ChatRoomPanel'


function App() {
  const dispatch = useDispatch();
  const loaded = useSelector((state) => state.auth.loaded);

  useEffect(() => {
    axios.get("/api/auth/me")
      .then((res) => dispatch(setUser(res.data.user)))
      .catch(() => dispatch(clearUser()));
  }, [dispatch]);

  if (!loaded) {
    return <div className="p-3">로딩중...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<MainNavbar/>}>
        <Route path="*" element={<div>404 error!</div>} />
        <Route path="/" element={<HomePage />} />
        <Route path="/forum" element={<ForumList />}>
          <Route path=":forumid" element={<ForumPosts />} />
          <Route path=":forumid/:postid" element={<PostDetail />} />
        </Route>
        <Route path="/forum/:forumid/write" element={<WritePostPage />} />
        <Route path="/forum/:forumid/:postid/edit" element={<EditPostPage />} />
        <Route path="/mypage" element={ <ReqAuth> <MyPage /> </ReqAuth> } />
        <Route path="/message" element={<ReqAuth><ChatPage/></ReqAuth>}>
          <Route index element={<div className="p-3">왼쪽에서 대화를 선택하세요.</div>} />
          <Route path=":threadid" element={<ChatRoomPanel />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App