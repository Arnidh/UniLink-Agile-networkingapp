
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Book, Users, Clock, Calendar, Search } from "lucide-react";

const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or not a student
  React.useEffect(() => {
    if (!currentUser) {
      navigate("/signin");
    } else if (currentUser.role !== "student") {
      navigate(`/${currentUser.role}-dashboard`);
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== "student") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Welcome, {currentUser.name.split(" ")[0]}!
            </h1>
            <p className="text-gray-600">
              Your student dashboard for academic networking and opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <GraduationCap className="mr-2 text-unilink-student" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full bg-gray-100 rounded-full mb-2">
                  <div
                    className="h-2 bg-unilink-student rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  65% complete. Add your coursework and skills to improve your profile.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 text-unilink-student" />
                  Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">18</p>
                <p className="text-sm text-gray-600">
                  Connections with students, professors, and alumni
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="mr-2 text-unilink-student" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">
                  Upcoming project and internship application deadlines
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Stay updated with your network's activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 pb-4 border-b">
                      <div className="h-10 w-10 rounded-full bg-unilink-professor flex items-center justify-center">
                        <Book className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Dr. Jane Smith posted a new research opportunity</p>
                        <p className="text-sm text-gray-600">
                          "Looking for students interested in AI and Machine Learning for a summer project."
                        </p>
                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 pb-4 border-b">
                      <div className="h-10 w-10 rounded-full bg-unilink-alumni flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Alex Johnson is looking for interns</p>
                        <p className="text-sm text-gray-600">
                          "Tech Company Inc. is offering summer internships for Computer Science students."
                        </p>
                        <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-unilink-student flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Career Fair Approaching</p>
                        <p className="text-sm text-gray-600">
                          "Don't miss the Spring Career Fair on May 15th. Over 50 companies will be present."
                        </p>
                        <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Connections</CardTitle>
                  <CardDescription>
                    People you might want to connect with
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img 
                            src="https://i.pravatar.cc/150?u=prof1" 
                            alt="Professor" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Dr. Robert Chen</p>
                          <p className="text-xs text-gray-600">
                            Computer Science Professor
                          </p>
                        </div>
                      </div>
                      <button className="text-xs font-medium text-unilink-primary hover:underline">
                        Connect
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img 
                            src="https://i.pravatar.cc/150?u=alum1" 
                            alt="Alumni" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Sarah Williams</p>
                          <p className="text-xs text-gray-600">
                            Alumni, Software Engineer at Tech Co.
                          </p>
                        </div>
                      </div>
                      <button className="text-xs font-medium text-unilink-primary hover:underline">
                        Connect
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img 
                            src="https://i.pravatar.cc/150?u=stud1" 
                            alt="Student" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Michael Torres</p>
                          <p className="text-xs text-gray-600">
                            Student, Same Department
                          </p>
                        </div>
                      </div>
                      <button className="text-xs font-medium text-unilink-primary hover:underline">
                        Connect
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
