
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library, Users, Calendar, BookOpen, Bookmark, FileText } from "lucide-react";

const ProfessorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or not a professor
  React.useEffect(() => {
    if (!currentUser) {
      navigate("/signin");
    } else if (currentUser.role !== "professor") {
      navigate(`/${currentUser.role}-dashboard`);
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== "professor") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Welcome, Dr. {currentUser.name.split(" ")[1]}!
            </h1>
            <p className="text-gray-600">
              Your professor dashboard for academic networking and research
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Library className="mr-2 text-unilink-professor" />
                  Research Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-gray-600">
                  Active research projects with student involvement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 text-unilink-professor" />
                  Mentees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-600">
                  Students under your academic guidance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 text-unilink-professor" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">
                  Academic conferences and department events
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Research Opportunities</CardTitle>
                  <CardDescription>
                    Manage your research projects and find student collaborators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">AI Research Assistant Needed</h3>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Open
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Looking for a student with strong Python skills and background in machine learning.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <BookOpen className="h-3 w-3 mr-1" />
                          <span>4 applicants</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Deadline: May 30, 2025</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">Database Systems Research Project</h3>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Closing Soon
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Research opportunity in distributed database systems for undergraduate students.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <BookOpen className="h-3 w-3 mr-1" />
                          <span>7 applicants</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Deadline: April 15, 2025</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">Research Paper Co-Author</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          New
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Seeking a graduate student to collaborate on a research paper for an upcoming conference.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <BookOpen className="h-3 w-3 mr-1" />
                          <span>2 applicants</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Deadline: June 10, 2025</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Student Engagement</CardTitle>
                  <CardDescription>
                    Recent student activities and requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://i.pravatar.cc/150?u=stud2" 
                          alt="Student" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Emily Chen</p>
                        <p className="text-xs text-gray-600 mb-1">
                          Requested a recommendation letter
                        </p>
                        <div className="flex gap-2">
                          <button className="text-xs px-2 py-1 bg-unilink-professor text-white rounded-md">
                            Approve
                          </button>
                          <button className="text-xs px-2 py-1 bg-gray-200 text-gray-800 rounded-md">
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://i.pravatar.cc/150?u=stud3" 
                          alt="Student" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Jason Kim</p>
                        <p className="text-xs text-gray-600">
                          Submitted project proposal for review
                        </p>
                        <p className="text-xs flex items-center mt-1 text-unilink-professor">
                          <FileText className="h-3 w-3 mr-1" />
                          <span className="hover:underline cursor-pointer">View Document</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://i.pravatar.cc/150?u=stud4" 
                          alt="Student" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Maria Rodriguez</p>
                        <p className="text-xs text-gray-600">
                          Has questions about the research methodology
                        </p>
                        <p className="text-xs flex items-center mt-1 text-unilink-professor">
                          <Bookmark className="h-3 w-3 mr-1" />
                          <span className="hover:underline cursor-pointer">Schedule Meeting</span>
                        </p>
                      </div>
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

export default ProfessorDashboard;
