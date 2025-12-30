'use client';

import { House } from 'lucide-react';
import { Link } from "react-router-dom";
import { ThemeToggle } from "../atoms/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

interface MainHeaderClientProps {
  user: any;
}

const MainHeaderClient = ({ user }: MainHeaderClientProps) => {
  return (
    <div className="flex justify-between items-center py-2 px-4">
      <Link to="/">
        <Button type="button" variant="outline" >
          <House />
          <div className="ml-2">Votify</div>
        </Button>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user == null ? (
          <Link to="/login">
            <div className="bg-primary-black text-white flex justify-center items-center gap-3 px-6 py-3 rounded-3xl hover:bg-secondary-gray hover:shadow-2xl">
              <p className="font-medium text-[18px]">Login</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">John Doe</h3>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainHeaderClient; 