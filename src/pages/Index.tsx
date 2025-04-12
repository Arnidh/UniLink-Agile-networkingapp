import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import { GraduationCap, Library, Briefcase, Search, Users, Calendar } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 pt-24">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Connect, Collaborate, and Grow with{" "}
                  <span className="text-[#5D5FEF]">
                    UniLink
                  </span>
                </h1>
                <p className="text-lg text-gray-600">
                  The professional networking platform built exclusively for university communities. Connect with students, professors, and alumni to expand your academic and professional network.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup">
                    <Button className="unilink-gradient" size="lg">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/signin">
                    <Button variant="outline" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -z-10 w-3/4 h-3/4 bg-unilink-accent rounded-full filter blur-3xl opacity-30"></div>
                <img
                  src="/lovable-uploads/c8b61bdd-a537-4d22-a772-d93ab3de15e0.png"
                  alt="UniLink Logo"
                  className="rounded-lg shadow-2xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Role Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Find Your Place in Our Community</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="h-12 w-12 bg-unilink-student rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Students</h3>
                <p className="text-gray-600 mb-4">
                  Connect with mentors, discover internships, and showcase your academic projects to stand out.
                </p>
                <Link to="/signup" className="text-unilink-student font-medium hover:underline">
                  Join as Student →
                </Link>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="h-12 w-12 bg-unilink-professor rounded-full flex items-center justify-center mb-4">
                  <Library className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Professors</h3>
                <p className="text-gray-600 mb-4">
                  Share research opportunities, mentor students, and collaborate with other faculty members.
                </p>
                <Link to="/signup" className="text-unilink-professor font-medium hover:underline">
                  Join as Professor →
                </Link>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="h-12 w-12 bg-unilink-alumni rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Alumni</h3>
                <p className="text-gray-600 mb-4">
                  Maintain university connections, offer mentorship, and recruit talent from your alma mater.
                </p>
                <Link to="/signup" className="text-unilink-alumni font-medium hover:underline">
                  Join as Alumni →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Powerful Features for Academic Networking</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-unilink-accent h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-unilink-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Advanced Search</h3>
                <p className="text-gray-600">
                  Find connections based on department, expertise, graduation year, or career path.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-unilink-accent h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-unilink-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mentorship</h3>
                <p className="text-gray-600">
                  Connect with mentors or become one and share your knowledge with others.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-unilink-accent h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-unilink-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Events</h3>
                <p className="text-gray-600">
                  Discover and participate in virtual meetups, workshops, and networking sessions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-10 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <img 
                src="/lovable-uploads/c8b61bdd-a537-4d22-a772-d93ab3de15e0.png" 
                alt="UniLink Logo" 
                className="h-8 w-8" 
              />
              <span className="text-2xl font-bold text-[#5D5FEF]">
                UniLink
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} UniLink. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
