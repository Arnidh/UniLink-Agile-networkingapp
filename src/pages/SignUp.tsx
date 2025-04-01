
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import SignUpForm from "@/components/auth/SignUpForm";
import Header from "@/components/layout/Header";

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-slate-100">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-unilink-primary">Join UniLink</h1>
            <p className="text-gray-600 mt-2">Connect with your university network</p>
          </div>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
              <CardDescription>
                Choose your role and start networking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignUpForm />
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/signin" className="text-unilink-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
          
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
