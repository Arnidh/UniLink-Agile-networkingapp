
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import UserProfile from "@/pages/UserProfile";
import Connections from "@/pages/Connections";
import Post from "@/pages/Post";
import Settings from "@/pages/Settings";
import Messages from "@/pages/Messages";
import Search from "@/pages/Search";
import NotFound from "@/pages/NotFound";
import { Toaster } from 'sonner';
import Events from "@/pages/Events";

import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/post/:postId" element={<Post />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/events" element={<Events />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-center" />
      </AuthProvider>
    </Router>
  );
}

export default App;
