
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Star, MessageCircle, Building, GraduationCap } from "lucide-react";

const AlumniDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or not an alumni
  React.useEffect(() => {
    if (!currentUser) {
      navigate("/signin");
    } else if (currentUser.role !== "alumni") {
      navigate(`/${currentUser.role}-dashboard`);
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== "alumni") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Welcome back, {currentUser.name.split(" ")[0]}!
            </h1>
            <p className="text-gray-600">
              Your alumni dashboard for university networking and mentorship
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Briefcase className="mr-2 text-unilink-alumni" />
                  Job Postings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-gray-600">
                  Active job postings for university students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 text-unilink-alumni" />
                  Mentees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-gray-600">
                  Students you're currently mentoring
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Star className="mr-2 text-unilink-alumni" />
                  Alumni Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-sm text-gray-600">
                  Positive feedback from your mentees
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Mentorship Requests</CardTitle>
                  <CardDescription>
                    Students seeking your guidance and expertise
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img 
                            src="https://i.pravatar.cc/150?u=stud5" 
                            alt="Student" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">David Park</h3>
                          <p className="text-xs text-gray-600">
                            Computer Science, Junior Year
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        "I'm interested in a career in tech consulting and would love your guidance on industry trends and preparation."
                      </p>
                      <div className="flex gap-2">
                        <button className="text-xs px-3 py-1.5 bg-unilink-alumni text-white rounded-md">
                          Accept Request
                        </button>
                        <button className="text-xs px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md">
                          Decline
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img 
                            src="https://i.pravatar.cc/150?u=stud6" 
                            alt="Student" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">Sophia Lee</h3>
                          <p className="text-xs text-gray-600">
                            Business Administration, Senior Year
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        "I'm applying to MBA programs and would value your insights given your career progression after graduation."
                      </p>
                      <div className="flex gap-2">
                        <button className="text-xs px-3 py-1.5 bg-unilink-alumni text-white rounded-md">
                          Accept Request
                        </button>
                        <button className="text-xs px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md">
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>University Updates</CardTitle>
                  <CardDescription>
                    Stay connected with your alma mater
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="font-medium mb-1">Alumni Weekend</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        Join us for the annual alumni reunion on June 24-26, 2025.
                      </p>
                      <div className="flex items-center text-xs text-unilink-alumni">
                        <Building className="h-3 w-3 mr-1" />
                        <span className="cursor-pointer hover:underline">
                          RSVP for Event
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-b pb-3">
                      <h3 className="font-medium mb-1">New Computer Science Building</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        The university is opening a state-of-the-art CS building this fall.
                      </p>
                      <div className="flex items-center text-xs text-unilink-alumni">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        <span className="cursor-pointer hover:underline">
                          Support the Initiative
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Alumni Lecture Series</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        Would you be interested in speaking to current students about your career?
                      </p>
                      <div className="flex items-center text-xs text-unilink-alumni">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        <span className="cursor-pointer hover:underline">
                          Express Interest
                        </span>
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

export default AlumniDashboard;
