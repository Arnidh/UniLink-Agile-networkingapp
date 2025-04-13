
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Search, Bell, Bookmark, MapPin, Clock, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem, Select } from '@/components/ui/select';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  category: string;
  organizer?: string;
  imageUrl?: string;
}

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const universityEvents: Event[] = [
    {
      id: '1',
      title: 'Fall Career Fair',
      date: '2023-10-15T14:00:00',
      location: 'University Main Hall',
      description: 'Connect with over 50 employers from various industries.',
      category: 'career',
      organizer: 'Career Services Center'
    },
    {
      id: '2',
      title: 'Guest Lecture: AI in Healthcare',
      date: '2023-10-18T15:30:00',
      location: 'Science Building, Room 302',
      description: 'Dr. Sarah Chen discusses the latest advancements in AI applications for healthcare.',
      category: 'academic',
      organizer: 'Computer Science Department'
    },
    {
      id: '3',
      title: 'Student Government Elections',
      date: '2023-10-20T09:00:00',
      location: 'Online',
      description: 'Cast your vote for the student government representatives.',
      category: 'campus',
      organizer: 'Student Affairs Office'
    },
    {
      id: '4',
      title: 'Alumni Networking Night',
      date: '2023-10-25T18:00:00',
      location: 'University Center, Grand Hall',
      description: 'Connect with alumni from various industries and build your professional network.',
      category: 'networking',
      organizer: 'Alumni Association'
    },
    {
      id: '5',
      title: 'Engineering Showcase',
      date: '2023-11-05T10:00:00',
      location: 'Engineering Building, Exhibition Hall',
      description: 'Students present their innovative engineering projects to the community.',
      category: 'academic',
      organizer: 'Engineering Department'
    },
    {
      id: '6',
      title: 'Campus Sustainability Fair',
      date: '2023-11-10T12:00:00',
      location: 'University Quad',
      description: 'Learn about sustainable initiatives and how you can contribute to a greener campus.',
      category: 'campus',
      organizer: 'Sustainability Office'
    },
    {
      id: '7',
      title: 'Business Plan Competition',
      date: '2023-11-15T09:00:00',
      location: 'Business School Auditorium',
      description: 'Student entrepreneurs pitch their business ideas to a panel of judges for a chance to win funding.',
      category: 'career',
      organizer: 'Business School'
    },
    {
      id: '8',
      title: 'University Sports Day',
      date: '2023-11-20T08:00:00',
      location: 'University Sports Complex',
      description: 'A day of friendly competition between departments in various sports.',
      category: 'social',
      organizer: 'Athletics Department'
    }
  ];

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventCategoryBadge = (category: string) => {
    switch(category) {
      case 'career':
        return <Badge className="bg-blue-500">Career</Badge>;
      case 'academic':
        return <Badge className="bg-green-500">Academic</Badge>;
      case 'campus':
        return <Badge className="bg-purple-500">Campus</Badge>;
      case 'networking':
        return <Badge className="bg-orange-500">Networking</Badge>;
      case 'social':
        return <Badge className="bg-pink-500">Social</Badge>;
      default:
        return <Badge>Event</Badge>;
    }
  };

  const filteredEvents = universityEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.organizer && event.organizer.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />
      
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">University Events</h1>
        
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search events by title, description, location, or organizer"
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select 
                    value={categoryFilter} 
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="campus">Campus</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="saved">Saved Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                    {event.imageUrl && (
                      <div className="h-40 overflow-hidden">
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        {getEventCategoryBadge(event.category)}
                      </div>
                      {event.organizer && (
                        <CardDescription>Organized by: {event.organizer}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        {formatEventDate(event.date)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        {event.location}
                      </div>
                      
                      <p className="text-sm">{event.description}</p>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Add to Calendar
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Bookmark className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-500">No events found matching your criteria.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="saved">
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">You haven't saved any events yet.</p>
              <Button variant="outline">
                Explore Events
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="past">
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">No past events to display.</p>
              <Button variant="outline">
                View Upcoming Events
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Events;
